import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { DxDataGridComponent } from 'devextreme-angular';
import { UtilityService } from 'src/app/services/utility.service';
import { ActivatedRoute } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap';
import { I18nPipe } from 'src/app/shared/i18n/i18n.pipe';
import { ApiService } from 'src/app/services/api.service';
import swal from 'sweetalert2';
declare var $: any;


@Component({
  selector: 'app-field-administration',
  templateUrl: './field-administration.component.html',
  styleUrls: ['./field-administration.component.scss']
})
export class FieldAdministrationComponent implements OnInit {
  @ViewChild(DxDataGridComponent, { static: true }) optionGrid: DxDataGridComponent;
  dataList: Array<any>;
  modalRef;
  postalCodeModalRef
  config = {
    animated: true,
    keyboard: true,
    backdrop: true,
    ignoreBackdropClick: true
  };
  formObj: any = {};
  public inputField = '';
  public frInputField = '';
  public deInputField = '';
  isEdit = false;
  editId = '';
  dropdowns = [];
  langs = [];
  postalCodesList: any = [];
  dropDownMapperId;
  postalCodeObj: any = {};
  cityName;
  isPostalCodeEdit: boolean = false;
  postalCode = '';
  chargeUOMList: any = [];
  chargeUOMObj: any = {};
  chargeType;
  isChargeUOMEdit: boolean = false;
  chargeUOM = '';
  chargeUOMModalRef;

  constructor(private utilityService: UtilityService, private route: ActivatedRoute, private modalService: BsModalService,
    private localize: I18nPipe, private apiService: ApiService) {
    this.utilityService.breadcrumb = 'Field Administration';
    this.utilityService.initializeDropdowns(this.route);
    this.dropdowns = ['Vendor Type', 'Country', 'Product', 'Handling Unit', 'Weight Unit', 'Length Unit',
      'Cube Unit', 'Class', 'Show Accessorials', 'Cities', 'Freight Terms', 'Vendor Status', 'Contract Status',
      'User Type', 'Currency', 'Contract Type', 'Rate Type', 'Rate Calc UOM', 'Rate Calc Type',
      'Rate Breaks', 'Rate Break UOM', 'Vendor Services', 'Location Type', 'Shipment Status', 'Charge Type', 'Claim Types'];
    this.langs = ['fr', 'de'];

    this.dataList = new Array();

    this.dropdowns.map(val => {
      this.dataList.push({
        field: val,
        data: this.utilityService.dropdowns[`${this.utilityService.toCamelCase(val)}Values`]
      });
    });
  }

  ngOnInit() {
  }

  openModal(template: TemplateRef<any>, type) {
    if (type == 'PostalCode') {
      this.postalCodeModalRef = this.modalService.show(template, this.config);
    } else if (type == 'ChargeUOM') {
      this.chargeUOMModalRef = this.modalService.show(template, this.config);
    } else {
      this.modalRef = this.modalService.show(template, this.config);
    }
  }


  openEditDialog(template, obj) {
    if (obj.data != undefined) {
      if (obj.data.values != undefined) {
        if (obj.data.values.length > 0) {
          for (let i = 0; i < obj.data.values.length; i++) {
            if (obj.data.values[i] == undefined) {
              obj.data.values.splice(i, 1);
              i--;
            }
          }
        }
      }
    }

    this.formObj = obj;
    this.openModal(template, '');
  }

  editItem(item, obj) {
    this.apiService.get('/dropdownMapper/' + item.id).subscribe((response: any) => {
      this.isEdit = true;
      this.inputField = item.name;
      this.editId = item.id;

      this.langs.map(val => {
        this[`${val}InputField`] = response[val];
      });
    });
  }

  resetInputFields() {
    this.isEdit = false;
    this.inputField = null;
    this.langs.map(val => {
      this[`${val}InputField`] = null;
    });
  }

  save(obj) {
    if (this.inputField == '' || this.inputField == undefined || this.deInputField == ''
      || this.deInputField == undefined || this.frInputField == '' || this.frInputField == undefined) {
      this.fireSnackBar('Please fill all language fields.');
    } else {
      if (this.isEdit == false) {
        // Iterate Language values
        let temp = {};
        this.langs.map(val => {
          temp[val] = this[`${val}InputField`]
        });

        this.apiService.post('/dropdownMapper', {
          dropdown: {
            name: this.inputField,
            position: obj.data.values.length > 0 ? obj.data.values[obj.data.values.length - 1].position != undefined ? obj.data.values[obj.data.values.length - 1].position + 1 : 0 : 0,
            dropdown: obj.data.id
          },
          ...temp
        }).subscribe((response: any) => {
          // Reset Input values
          this.inputField = null;
          this.langs.map(val => {
            this[`${val}InputField`] = null;
          });

          this.utilityService.dropdowns[`${this.utilityService.toCamelCase(obj.data.field)}Values`].values.push(response);
          let index = this.dataList.findIndex(val => val.field == obj.data.field);
          this.dataList[index].data = this.utilityService.dropdowns[`${this.utilityService.toCamelCase(obj.data.field)}Values`];
          this.formObj.data = this.utilityService.dropdowns[`${this.utilityService.toCamelCase(obj.data.field)}Values`];

          this.resetInputFields();
          this.fireSnackBar('Created successfully.');
        });
      } else {
        this.edit(obj);
      }
    }
  }

  edit(obj) {
    // Iterate Language values
    let temp = {};
    this.langs.map(val => {
      temp[val] = this[`${val}InputField`]
    });

    this.apiService.put('/dropdownMapper/' + this.editId, {
      dropdown: {
        name: this.inputField
      },
      ...temp
    }).subscribe((response: any) => {
      let objArr = this.utilityService.dropdowns[`${this.utilityService.toCamelCase(obj.data.field)}Values`].values.find(val => val.id == this.editId);
      let index = this.utilityService.dropdowns[`${this.utilityService.toCamelCase(obj.data.field)}Values`].values.indexOf(objArr);
      this.utilityService.dropdowns[`${this.utilityService.toCamelCase(obj.data.field)}Values`].values[index] = response.data[0];
      this.formObj.data = this.utilityService.dropdowns[`${this.utilityService.toCamelCase(obj.data.field)}Values`];
      let idx = this.dataList.findIndex(val => val.field == obj.data.field);
      this.dataList[idx].data = this.utilityService.dropdowns[`${this.utilityService.toCamelCase(obj.data.field)}Values`];

      // Reset Input values
      this.isEdit = false;
      this.editId = '';
      this.inputField = '';
      this.langs.map(val => {
        this[`${val}InputField`] = '';
      });
      this.fireSnackBar('Updated successfully.');
    });
  }

  deleteItem(id, obj) {
    let msg = 'Are you sure you want to delete?';

    swal.fire({
      title: `${this.localize.transform('Confirmation')}`,
      text: `${this.localize.transform(msg)}`,
      type: 'warning',
      showCancelButton: true,
      confirmButtonClass: 'btn btn-success',
      cancelButtonClass: 'btn btn-danger',
      confirmButtonText: `${this.localize.transform('Yes')}`,
      cancelButtonText: `${this.localize.transform('No')}`,
      buttonsStyling: true
    }).then((result) => {
      if (result.value) {
        this.apiService.delete('/dropdownMapper/' + id).subscribe(response => {
          let objArr = this.utilityService.dropdowns[`${this.utilityService.toCamelCase(obj.data.field)}Values`].values.find(val => val.id == id);
          let index = this.utilityService.dropdowns[`${this.utilityService.toCamelCase(obj.data.field)}Values`].values.indexOf(objArr);
          this.utilityService.dropdowns[`${this.utilityService.toCamelCase(obj.data.field)}Values`].values.splice(index, 1);
          this.formObj.data = this.utilityService.dropdowns[`${this.utilityService.toCamelCase(obj.data.field)}Values`];
          let idx = this.dataList.findIndex(val => val.field == obj.data.field);
          this.dataList[idx].data = this.utilityService.dropdowns[`${this.utilityService.toCamelCase(obj.data.field)}Values`];

          this.resetInputFields();
          this.fireSnackBar('Deleted successfully.');
        });
      }
    });
  }

  moveRowDown(id) {
    const index = this.formObj.data.values.findIndex(val => val.id == id);

    if (index < this.formObj.data.values.length - 1) {
      this.formObj.data.values[index].position++;
      this.formObj.data.values[index + 1].position--;
      const temp = this.formObj.data.values[index];
      this.formObj.data.values[index] = this.formObj.data.values[index + 1];
      this.formObj.data.values[index + 1] = temp;
    }
  }

  moveRowUp(id) {
    const index = this.formObj.data.values.findIndex(val => val.id == id);

    if (index > 0) {
      this.formObj.data.values[index].position--;
      this.formObj.data.values[index - 1].position++;
      const temp = this.formObj.data.values[index];
      this.formObj.data.values[index] = this.formObj.data.values[index - 1];
      this.formObj.data.values[index - 1] = temp;
    }
  }

  savePosition() {
    this.apiService.post('/dropdownMapper/position', this.formObj.data.values).subscribe(response => {
      this.fireSnackBar('Position updated successfully.');
    });
  }

  getPostalCodes(template, item) {
    this.resetPostalCode();
    this.dropDownMapperId = item.id;
    this.apiService.get('/dropdownMapper/' + this.dropDownMapperId).subscribe((response: any) => {
      this.cityName = response.data.name;
      this.postalCodesList = response.data.values;
      this.openModal(template, 'PostalCode');
    });
  }

  getChargeUOM(template, item) {
    this.resetChargeUOM();
    this.dropDownMapperId = item.id;
    this.apiService.get('/dropdownMapper/' + this.dropDownMapperId).subscribe((response: any) => {
      this.chargeType = response.data.name;
      this.chargeUOMList = response.data.values;
      this.openModal(template, 'ChargeUOM');
    });
  }

  editPostalCode(item) {
    this.isPostalCodeEdit = true;
    this.postalCodeObj = item;
    this.postalCode = item.name;
  }

  editChargeUOM(item) {
    this.isChargeUOMEdit = true;
    this.chargeUOMObj = item;
    this.chargeUOM = item.name;
  }

  savePostalCode() {
    if (this.postalCode == '' || this.postalCode == undefined || this.postalCode == null) {
      this.fireSnackBar('Please add postal code.');
    } else {
      if (this.isPostalCodeEdit == false) {
        this.apiService.post('/dropdownMapperChild', {
          name: this.postalCode,
          dropdownMapper: this.dropDownMapperId
        }).subscribe(response => {
          this.postalCodesList.push(response);
          this.resetPostalCode();
          this.fireSnackBar('Postal code created successfully.');
        });
      } else {
        this.apiService.patch('/dropdownMapperChild/' + this.postalCodeObj.id, {
          name: this.postalCode,
        }).subscribe((response: any) => {
          let idx = this.postalCodesList.findIndex(val => val.id == response.id);
          this.postalCodesList[idx] = response;
          this.resetPostalCode();
          this.fireSnackBar('Postal code updated successfully.');
        });
      }
    }
  }

  saveChargeUOM() {
    if (this.chargeUOM == '' || this.chargeUOM == undefined || this.chargeUOM == null) {
      this.fireSnackBar('Please add charge UOM.');
    } else {
      if (this.isChargeUOMEdit == false) {
        this.apiService.post('/dropdownMapperChild', {
          name: this.chargeUOM,
          dropdownMapper: this.dropDownMapperId
        }).subscribe(response => {
          this.chargeUOMList.push(response);
          this.resetChargeUOM();
          this.fireSnackBar('Charge UOM created successfully.');
        });
      } else {
        this.apiService.patch('/dropdownMapperChild/' + this.chargeUOMObj.id, {
          name: this.chargeUOM,
        }).subscribe((response: any) => {
          let idx = this.chargeUOMList.findIndex(val => val.id == response.id);
          this.chargeUOMList[idx] = response;
          this.resetChargeUOM();
          this.fireSnackBar('Charge UOM updated successfully.');
        });
      }
    }
  }

  deletePostalCode(id) {
    let msg = 'Are you sure you want to delete?';

    swal.fire({
      title: `${this.localize.transform('Confirmation')}`,
      text: `${this.localize.transform(msg)}`,
      type: 'warning',
      showCancelButton: true,
      confirmButtonClass: 'btn btn-success',
      cancelButtonClass: 'btn btn-danger',
      confirmButtonText: `${this.localize.transform('Yes')}`,
      cancelButtonText: `${this.localize.transform('No')}`,
      buttonsStyling: true
    }).then((result) => {
      if (result.value) {
        this.apiService.delete('/dropdownMapperChild/' + id).subscribe((response: any) => {
          let idx = this.postalCodesList.findIndex(val => val.id == response.id);
          this.postalCodesList.splice(idx, 1);
          this.resetPostalCode();
          this.fireSnackBar('Deleted successfully.');
        });
      }
    });
  }

  deleteChargeUOM(id) {
    let msg = 'Are you sure you want to delete?';

    swal.fire({
      title: `${this.localize.transform('Confirmation')}`,
      text: `${this.localize.transform(msg)}`,
      type: 'warning',
      showCancelButton: true,
      confirmButtonClass: 'btn btn-success',
      cancelButtonClass: 'btn btn-danger',
      confirmButtonText: `${this.localize.transform('Yes')}`,
      cancelButtonText: `${this.localize.transform('No')}`,
      buttonsStyling: true
    }).then((result) => {
      if (result.value) {
        this.apiService.delete('/dropdownMapperChild/' + id).subscribe((response: any) => {
          let idx = this.chargeUOMList.findIndex(val => val.id == response.id);
          this.chargeUOMList.splice(idx, 1);
          this.resetPostalCode();
          this.fireSnackBar('Deleted successfully.');
        });
      }
    });
  }

  resetPostalCode() {
    this.isPostalCodeEdit = false;
    this.postalCode = '';
  }

  resetChargeUOM() {
    this.isChargeUOMEdit = false;
    this.chargeUOM = '';
  }

  fireSnackBar(message) {
    this.utilityService.fireSnackBar(
      this.localize.transform(message),
    );
  }

  closePostalCodeModel(template) {
    this.resetPostalCode();
    this.postalCodeModalRef.hide();
  }

  closeChargeUOMModel(template) {
    this.resetChargeUOM();
    this.chargeUOMModalRef.hide();
  }

  closeModel() {
    this.resetInputFields();
    this.modalRef.hide();
  }

}
