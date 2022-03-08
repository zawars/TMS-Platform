import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { DxDataGridComponent } from 'devextreme-angular';
import { UtilityService } from 'src/app/services/utility.service';
import { ActivatedRoute } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap';
import { ApiService } from 'src/app/services/api.service';
import { I18nPipe } from 'src/app/shared/i18n/i18n.pipe';
import swal from 'sweetalert2';
declare var $: any;

@Component({
  selector: 'app-translation',
  templateUrl: './translation.component.html',
  styleUrls: ['./translation.component.scss']
})
export class TranslationComponent implements OnInit {
  @ViewChild(DxDataGridComponent, { static: true }) optionGrid: DxDataGridComponent;
  dataList: Array<any>;
  modalRef;
  config = {
    animated: true,
    keyboard: true,
    backdrop: true,
    ignoreBackdropClick: true
  };
  formObj: any = {};
  public inputFiledOld = '';
  public inputField = '';
  public inputFieldFr = '';
  public inputFieldDe = '';
  isEdit = false;
  editId = '';
  @ViewChild(DxDataGridComponent, { static: true }) dataGrid: DxDataGridComponent;
  translationList: any = [];

  constructor(private utilityService: UtilityService, private modalService: BsModalService, private apiService: ApiService,
    private localize: I18nPipe, private route: ActivatedRoute) {
    this.utilityService.breadcrumb = 'Translation';
    this.getTranslation();
  }

  ngOnInit() {
  }

  getTranslation() {
    this.apiService.get('/translation').subscribe((translations: any) => {
      this.translationList = translations;
      setTimeout(() => {
        $('#zero_config').DataTable();
      }, 500);
    });
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, this.config);
  }


  openEditDialog(template, obj, type) {
    if (type == "New") {
      this.resetInputFields();
    } else if (type == "Edit") {
      this.isEdit = true;
      this.formObj = obj;
      this.inputFiledOld = obj.en;;
      this.inputField = this.formObj.en;
      this.inputFieldDe = this.formObj.de;
      this.inputFieldFr = this.formObj.fr;
    }
    this.openModal(template);
  }

  saveTranslation() {
    if (this.inputField == '' || this.inputField == undefined || this.inputFieldDe == ''
      || this.inputFieldDe == undefined || this.inputFieldFr == '' || this.inputFieldFr == undefined) {
      this.fireSnackBar('Please fill all language fields.');
    } else {
      this.apiService.post('/translation', {
        en: this.inputField,
        de: this.inputFieldDe,
        fr: this.inputFieldFr
      }).subscribe((response: any) => {
        this.translationList.push({ "en": this.inputField, "de": this.inputFieldDe, "fr": this.inputFieldFr });
        this.refreshGrid();
        this.closeModel();
        this.fireSnackBar('Translation save successfully.');
      });
    }
  }

  updateTranslation() {
    if (this.inputField == '' || this.inputField == undefined || this.inputFieldDe == ''
      || this.inputFieldDe == undefined || this.inputFieldFr == '' || this.inputFieldFr == undefined) {
      this.fireSnackBar('Please fill all language fields.');
    } else {
      this.apiService.patch('/translation', {
        enOld: this.inputFiledOld,
        en: this.inputField,
        de: this.inputFieldDe,
        fr: this.inputFieldFr
      }).subscribe((response: any) => {
        let transObj = this.translationList.find(val => val.en == this.inputFiledOld);
        if (transObj != undefined && transObj != null) {
          transObj.en = this.inputField;
          transObj.de = this.inputFieldDe;
          transObj.fr = this.inputFieldFr;
        }
        this.refreshGrid();
        this.closeModel();
        this.fireSnackBar('Translation updated successfully.');
      });
    }
  }

  deleteTranslation(obj) {
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
        this.formObj = obj;
        this.apiService.post('/translation/delete', {
          en: this.formObj.en
        }).subscribe((response: any) => {
          let transObj = this.translationList.find(val => val.en == this.formObj.en);
          let idx = this.translationList.indexOf(transObj);
          this.translationList.splice(idx, 1)
          this.refreshGrid();
          this.resetInputFields();
          this.fireSnackBar('Translation deleted successfully.');
        });
      }
    });
  }

  resetInputFields() {
    this.isEdit = false;
    this.inputField = '';
    this.inputFieldDe = '';
    this.inputFieldFr = '';
    this.inputFiledOld = '';
    this.formObj = {};
  }

  fireSnackBar(message) {
    this.utilityService.fireSnackBar(
      this.localize.transform(message),
    );
  }

  closeModel() {
    this.resetInputFields();
    this.modalRef.hide();
  }

  refreshGrid() {
    this.dataGrid.instance.option('dataSource', this.translationList);
  }

}
