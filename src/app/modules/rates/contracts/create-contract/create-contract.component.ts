import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { UtilityService } from 'src/app/services/utility.service';
import { ApiService } from 'src/app/services/api.service';
import { Router, ActivatedRoute } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap';
import * as XLSX from 'xlsx';
import { trigger, transition, animate, state } from '@angular/animations';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap, switchMap } from 'rxjs/operators';
import { NgxSpinnerService } from 'ngx-spinner';
import { SocketService } from 'src/app/services/socket.service';
import { DxSelectBoxComponent } from 'devextreme-angular';
var self;
declare var $: any;

@Component({
  selector: 'app-create-contract',
  templateUrl: './create-contract.component.html',
  styleUrls: ['./create-contract.component.scss'],
  animations: [
    trigger('fileAnimation', [
      transition(':enter', animate(300)),
      transition(':leave', animate(300)),
    ])
  ]
})
export class CreateContractComponent implements OnInit {
  contractFormGroup: FormGroup;
  ratesFormGroup: FormGroup;
  isBlocked = false;
  modalRef;
  accessorialModalRef;
  config = {
    animated: true,
    keyboard: true,
    backdrop: true,
    ignoreBackdropClick: true
  };
  rates: Array<any>;
  vendorsList: Array<any>;
  clientsList: Array<any>;
  currencyList: Array<any>;
  contractTypeList: Array<any>;
  contractStatusList: Array<any>;
  contractRatesList: Array<any> = new Array();
  rateTypeList: any = [];
  rateCalcUOMList: any = [];
  rateCalcTypeList: any = [];
  rateBreaksList: any = [];
  rateBreakUOMList: any = [];
  effectiveFromMinDate = Date.now();
  expiryMinDate = Date.now();
  renewalMinDate = Date.now();
  isEdit: boolean = false;
  rateSheetID = 0;
  editRateSheetId: any;
  contractId;
  isContractEdit: boolean = false;
  isClientSpecific: boolean = false;
  isFileAdded: boolean = false;
  accessorialList: any = [];
  accessorialFormGroup: FormGroup;
  isAccessorialEdit: boolean = false;
  servicesList: any = [];
  chargeTypeList: any = [];
  chargeUOMList: any = [];
  accessorialIdx;
  vendorSubject = new Subject<any>();
  customerSubject = new Subject<any>();
  @ViewChild(DxSelectBoxComponent, { static: false }) vendor: DxSelectBoxComponent;
  @ViewChild(DxSelectBoxComponent, { static: false }) client: DxSelectBoxComponent;

  constructor(private utilityService: UtilityService, private fb: FormBuilder, private apiService: ApiService,
    private router: Router, private modalService: BsModalService, private route: ActivatedRoute, private spinner: NgxSpinnerService,
    private socket: SocketService) {
    this.utilityService.breadcrumb = 'Create Contract';
    self = this;
    this.utilityService.initializeDropdowns(this.route);
    this.initSubjects();
    this.initSocketEvents();
  }

  ngOnInit() {
    this.initRateSheet();

    this.contractFormGroup = this.fb.group({
      name: [''],
      description: [''],
      reference: [''],
      effectiveFrom: [''],
      expiryDate: [''],
      renewalDate: [''],
      vendor: [''],
      client: [''],
      contractType: [''],
      currency: [''],
      weightBreaks: [],
      contractStatus: [''],
    });

    this.ratesFormGroup = this.fb.group({
      name: [''],
      description: [''],
      rateType: [''],
      rateCalcUOM: [''],
      rateCalcType: [''],
      rateBreaks: [''],
      rateBreakUOM: [''],
      currency: ['']
    });

    this.accessorialFormGroup = this.fb.group({
      service: [''],
      description: [''],
      chargeType: [''],
      chargeUOM: [''],
      effectiveDate: [''],
      fixedCharge: [''],
      fixedChargeCurrency: [''],
      minCharge: [''],
      minChargeCurrency: [''],
      maxCharge: [''],
      maxChargeCurrency: [''],
      perUnitCharge: [''],
      perUnitChargeCurrency: [''],
    });

    this.currencyList = this.utilityService.dropdowns['currencyValues'].values;
    this.contractTypeList = this.utilityService.dropdowns['contractTypeValues'].values;
    this.contractStatusList = this.utilityService.dropdowns['contractStatusValues'].values;
    this.rateTypeList = this.utilityService.dropdowns['rateTypeValues'].values;
    this.rateCalcUOMList = this.utilityService.dropdowns['rateCalcUomValues'].values;
    this.rateCalcTypeList = this.utilityService.dropdowns['rateCalcTypeValues'].values;
    this.rateBreaksList = this.utilityService.dropdowns['rateBreaksValues'].values;
    this.rateBreakUOMList = this.utilityService.dropdowns['rateBreakUomValues'].values;
    this.servicesList = this.utilityService.dropdowns['vendorServicesValues'].values;
    this.chargeTypeList = this.utilityService.dropdowns['chargeTypeValues'].values;

    let sub = this.route.params.subscribe(params => {
      if (params.id != undefined) {
        this.utilityService.breadcrumb = 'Edit Contract';
        this.contractId = params.id;
        this.isContractEdit = true;
        this.contractFormGroup.get('weightBreaks').disable();
        this.getContract();
      }
    });
  }

  getContract() {
    this.apiService.get('/contracts/' + this.contractId).subscribe((responseContract: any) => {
      this.effectiveFromMinDate = responseContract.effectiveFrom;
      this.expiryMinDate = responseContract.expiryDate;
      this.renewalMinDate = responseContract.renewalDate;
      this.contractFormGroup.patchValue(responseContract);
      this.contractFormGroup.controls['currency'].setValue(responseContract.currency ? responseContract.currency.id : '');
      this.contractFormGroup.controls['vendor'].setValue(responseContract.vendor != null ? responseContract.vendor.id : '');
      this.contractFormGroup.controls['client'].setValue(responseContract.client != null ? responseContract.client.id : '');
      this.contractFormGroup.controls['contractType'].setValue(responseContract.contractType ? responseContract.contractType.id : '');
      this.contractFormGroup.controls['contractStatus'].setValue(responseContract.contractStatus ? responseContract.contractStatus.id : '');
      this.contractRatesList = responseContract.rateSheets;
      this.accessorialList = responseContract.accessorials;

      if (this.contractRatesList.length > 0) {
        let rateSheetsIds = [];

        this.contractRatesList.forEach(contractRates => {
          rateSheetsIds.push(contractRates.id);
        });

        this.apiService.post('/rateSheets/batch/get/', { rateSheetsIds }).subscribe((responseRateSheets: any) => {
          this.contractRatesList = responseRateSheets;
        });
      }

      if (this.accessorialList.length > 0) {
        let accessorialsIds = [];

        this.accessorialList.forEach(accessorials => {
          accessorialsIds.push(accessorials.id);
        });

        this.apiService.post('/accessorials/batch/get/', { accessorialsIds }).subscribe((responseAccessorials: any) => {
          this.accessorialList = responseAccessorials;
        })
      }
    });
  }

  initRateSheet() {
    this.rates = [];
    for (let i = 0; i < 6; i++) {
      this.rates.push({
        name: '',
        originCity: '',
        originState: '',
        originPostalCode: '',
        originArea: '',
        originCountry: '',
        destinationCity: '',
        destinationState: '',
        destinationPostalCode: '',
        destinationArea: '',
        destinationCountry: '',
        minCharge: '',
        maxCharge: '',
        rateBreaks: ''
      });
    }
  }

  openAddRateSheetPopup(template: TemplateRef<any>) {
    this.resetRateSheet();
    this.openModal(template);
  }

  openEditDialog(template: TemplateRef<any>, contractRatesObj) {
    this.editRateSheetId = contractRatesObj.id;
    this.isEdit = true;
    this.ratesFormGroup.patchValue(contractRatesObj);
    this.ratesFormGroup.controls['rateType'].setValue(contractRatesObj.rateType != null ? contractRatesObj.rateType.id : '');
    this.ratesFormGroup.controls['rateCalcUOM'].setValue(contractRatesObj.rateCalcUOM != null ? contractRatesObj.rateCalcUOM.id : '');
    this.ratesFormGroup.controls['rateCalcType'].setValue(contractRatesObj.rateCalcType != null ? contractRatesObj.rateCalcType.id : '');
    this.ratesFormGroup.controls['rateBreaks'].setValue(contractRatesObj.rateBreaks != null ? contractRatesObj.rateBreaks.id : '');
    this.ratesFormGroup.controls['rateBreakUOM'].setValue(contractRatesObj.rateBreakUOM != null ? contractRatesObj.rateBreakUOM.id : '');
    this.ratesFormGroup.controls['currency'].setValue(contractRatesObj.currency != null ? contractRatesObj.currency.id : '');
    this.rates = contractRatesObj.rates;

    if (this.rates.length > 0) {
      // Deserialise rate breaks in order to show them seperately in the table for better user experience.
      let weightBreaks = this.contractFormGroup.get('weightBreaks').value.split(',');

      this.rates.map(rate => {
        if (rate.rateBreaks) {
          if (rate.rateBreaks.split != undefined) {
            let rates = rate.rateBreaks.split(',');
            weightBreaks.forEach((val, idx) => {
              rate[`Rate-Break-${val.trim()}`] = rates[idx];
            });
          } else {
            weightBreaks.forEach((val, idx) => {
              rate[`Rate-Break-${val.trim()}`] = rate.rateBreaks[idx];
            });
          }
        }
      });
    } else {
      this.initRateSheet();
    }

    this.openModal(template);
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, this.config);
    $('.modal-dialog').css("max-width", "1100px");
  }

  create() {
    if (this.checkContractValidation()) {
      // this.contractRatesList.forEach(contractRate => {
      //   if (typeof (contractRate.id) != 'string') {
      //     delete (contractRate.id);
      //   }
      //   if (contractRate.rateType.id != undefined) {
      //     contractRate.rateType = contractRate.rateType.id;
      //   }
      //   if (contractRate.rateCalcUOM.id != undefined) {
      //     contractRate.rateCalcUOM = contractRate.rateCalcUOM.id;
      //   }
      //   if (contractRate.rateCalcType.id != undefined) {
      //     contractRate.rateCalcType = contractRate.rateCalcType.id;
      //   }
      //   if (contractRate.rateBreaks.id != undefined) {
      //     contractRate.rateBreaks = contractRate.rateBreaks.id;
      //   }
      //   if (contractRate.rateBreakUOM.id != undefined) {
      //     contractRate.rateBreakUOM = contractRate.rateBreakUOM.id;
      //   }
      //   if (contractRate.currency.id != undefined) {
      //     contractRate.currency = contractRate.currency.id;
      //   }
      // });

      // this.accessorialList.forEach(accessorial => {
      //   accessorial.service = accessorial.service.id;
      //   accessorial.chargeType = accessorial.chargeType.id;
      //   accessorial.chargeUOM = accessorial.chargeUOM != undefined ? accessorial.chargeUOM.id : undefined;
      //   accessorial.fixedChargeCurrency = accessorial.fixedChargeCurrency.id;
      //   accessorial.minChargeCurrency = accessorial.minChargeCurrency.id;
      //   accessorial.maxChargeCurrency = accessorial.maxChargeCurrency.id;
      //   accessorial.perUnitChargeCurrency = accessorial.perUnitChargeCurrency.id;
      // });

      this.isBlocked = true;
      this.apiService.post('/contracts', {
        ...this.contractFormGroup.value,
        client: this.isClientSpecific ? this.contractFormGroup.get('client').value : undefined,
        isClientSpecific: this.isClientSpecific,
        // rateSheets: this.contractRatesList,
        // accessorials: this.accessorialList
      }).subscribe(response => {
        this.utilityService.fireSnackBar('Contract created successfully.');

        this.isBlocked = false;
        this.router.navigate(['/rates/contracts']);
      }, err => {
        this.isBlocked = false;
      });
    }
  }

  checkContractValidation(): boolean {
    if (this.contractFormGroup.get('name').value == "") {
      this.utilityService.fireSnackBar('Please enter a name.');
      return false;
    }
    if (this.contractFormGroup.get('description').value == "") {
      this.utilityService.fireSnackBar('Please enter some description.');
      return false;
    }
    if (this.contractFormGroup.get('vendor').value == "" || this.contractFormGroup.get('vendor').value == null) {
      this.utilityService.fireSnackBar('Please select a vendor.');
      return false;
    }
    if (this.contractFormGroup.get('reference').value == "") {
      this.utilityService.fireSnackBar('Please enter a reference.');
      return false;
    }
    if (this.contractFormGroup.get('contractType').value == "" || this.contractFormGroup.get('contractType').value == null) {
      this.utilityService.fireSnackBar('Please select a contract type.');
      return false;
    }
    if (this.contractFormGroup.get('client').value == "" || this.contractFormGroup.get('client').value == null) {
      this.isClientSpecific = false;
    } else {
      this.isClientSpecific = true;
    }
    if (this.contractFormGroup.get('effectiveFrom').value == "") {
      this.utilityService.fireSnackBar('Please select effective from date.');
      return false;
    }
    if (this.contractFormGroup.get('expiryDate').value == "") {
      this.utilityService.fireSnackBar('Please select expiry date.');
      return false;
    }
    if (this.contractFormGroup.get('renewalDate').value == "") {
      this.utilityService.fireSnackBar('Please select renewal date.');
      return false;
    }
    if (this.contractFormGroup.get('currency').value == "" || this.contractFormGroup.get('currency').value == null) {
      this.utilityService.fireSnackBar('Please select a currency.');
      return false;
    }
    if (this.contractFormGroup.get('contractStatus').value == "") {
      this.utilityService.fireSnackBar('Please select a status.');
      return false;
    }
    // if (this.contractRatesList.length == 0) {
    //   this.utilityService.fireSnackBar( 'Please add a rate sheet.');
    //   return false;
    // }
    // if (this.accessorialList.length == 0) {
    //   this.utilityService.fireSnackBar( 'Please add a service.');
    //   return false;
    // }
    return true;
  }

  checkRateSheetValidation(): boolean {
    if (this.ratesFormGroup.get('name').value == "") {
      this.utilityService.fireSnackBar('Please enter a name.');
      return false;
    }
    if (this.ratesFormGroup.get('description').value == "") {
      this.utilityService.fireSnackBar('Please enter some description.');
      return false;
    }
    if (this.ratesFormGroup.get('rateType').value == "" || this.ratesFormGroup.get('rateType').value == null) {
      this.utilityService.fireSnackBar('Please select a rate type.');
      return false;
    }
    if (this.ratesFormGroup.get('rateCalcUOM').value == "" || this.ratesFormGroup.get('rateCalcUOM').value == null) {
      this.utilityService.fireSnackBar('Please enter a rate calc uom.');
      return false;
    }
    if (this.ratesFormGroup.get('rateCalcType').value == "" || this.ratesFormGroup.get('rateCalcType').value == null) {
      this.utilityService.fireSnackBar('Please select a rate calc type.');
      return false;
    }
    if (this.ratesFormGroup.get('rateBreaks').value == "" || this.ratesFormGroup.get('rateBreaks').value == null) {
      this.utilityService.fireSnackBar('Please select a rate breaks.');
      return false;
    }
    if (this.ratesFormGroup.get('rateBreakUOM').value == "" || this.ratesFormGroup.get('rateBreakUOM').value == null) {
      this.utilityService.fireSnackBar('Please select a rate break uom.');
      return false;
    }
    if (this.ratesFormGroup.get('currency').value == "" || this.ratesFormGroup.get('currency').value == null) {
      this.utilityService.fireSnackBar('Please select a currency.');
      return false;
    }

    return true;
  }

  addRateSheet() {
    if (this.checkRateSheetValidation()) {
      this.setRateSheetDropdownValues();

      this.rates.forEach(rate => {
        rate.minCharge = +rate.minCharge;
        rate.maxCharge = +rate.maxCharge;

        // Destruct Rate Breaks
        let weightBreaks = this.contractFormGroup.get('weightBreaks').value.split(',');
        let rateBreaks = [];
        weightBreaks.forEach(val => {
          rateBreaks.push(rate[`Rate-Break-${val.trim()}`]);
          delete (rate[`Rate-Break-${val.trim()}`]);
        });
        rate.rateBreaks = rateBreaks;
      });

      this.contractRatesList.push({
        id: ++this.rateSheetID,
        ...this.ratesFormGroup.value,
        rates: this.rates
      });
      this.modalRef.hide();
      this.resetRateSheet();
    }
  }

  updateRateSheet() {
    if (this.checkRateSheetValidation()) {
      if (typeof (this.editRateSheetId) == 'string') {
        let index = this.contractRatesList.findIndex(val => val.id == this.editRateSheetId);
        this.contractRatesList[index] = this.ratesFormGroup.value;
        delete (this.contractRatesList[index].rates);

        this.apiService.patch('/rateSheets/' + this.editRateSheetId, {
          ...this.contractRatesList[index]
        }).subscribe((responseRateSheets: any) => {
          this.setRateSheetDropdownValues();
          // let id = this.contractRatesList[index].id;
          let uid = this.contractRatesList[index].uid;
          this.contractRatesList[index] = this.ratesFormGroup.value;
          this.contractRatesList[index].id = this.editRateSheetId; //id;
          this.contractRatesList[index].rates = this.rates;
          let rates = JSON.parse(JSON.stringify(this.rates));

          rates.forEach((rate, idx) => {
            if (rate.id) {
              // Serialise rate breaks according to the ralative weight breaks in order to
              // save them in the database.
              let weightBreaks = this.contractFormGroup.get('weightBreaks').value.split(',');
              let rateBreaks = [];
              weightBreaks.map(val => {
                rateBreaks.push(rate[`Rate-Break-${val.trim()}`]);
                delete (rate[`Rate-Break-${val.trim()}`]);
              });
              rate.rateBreaks = rateBreaks.join();

              this.apiService.patch('/rates/' + rate.id, rate).subscribe((responseRate: any) => {
                if (idx == rates.length - 1) {
                  this.contractRatesList[index].rates = rates;
                  this.utilityService.fireSnackBar('Rate Sheet updated successfully.');
                  this.modalRef.hide();
                  this.resetRateSheet();
                }
              });
            } else {
              // Serialise rate breaks according to the ralative weight breaks in order to
              // save them in the database.
              let weightBreaks = this.contractFormGroup.get('weightBreaks').value.split(',');
              let rateBreaks = [];
              weightBreaks.map(val => {
                rateBreaks.push(rate[`Rate-Break-${val.trim()}`]);
                delete (rate[`Rate-Break-${val.trim()}`]);
              });
              rate.rateBreaks = rateBreaks.join();
              rate.rateSheet = this.editRateSheetId;

              this.apiService.post('/rates', rate).subscribe((response: any) => {
                if (idx == rates.length - 1) {
                  this.contractRatesList[index].rates = rates;
                  this.utilityService.fireSnackBar('Rate Sheet updated successfully.');
                  this.modalRef.hide();
                  this.resetRateSheet();
                }
              });
            }
          });
        });
      } else {
        this.setRateSheetDropdownValues();
        let index = this.contractRatesList.findIndex(val => val.id == this.editRateSheetId);
        let id = this.contractRatesList[index].id;
        this.contractRatesList[index] = this.ratesFormGroup.value;
        this.contractRatesList[index].id = id;

        this.rates.forEach((rate, index) => {
          let weightBreaks = this.contractFormGroup.get('weightBreaks').value.split(',');
          let rateBreaks = [];
          weightBreaks.map(val => {
            rateBreaks.push(rate[`Rate-Break-${val.trim()}`]);
            delete (rate[`Rate-Break-${val.trim()}`]);
          });
          rate.rateBreaks = rateBreaks.join();
        });

        this.contractRatesList[index].rates = this.rates;

        this.modalRef.hide();
        this.resetRateSheet();
      }
    }
  }

  update() {
    if (this.checkContractValidation()) {
      this.isBlocked = true;
      this.apiService.patch('/contracts/' + this.contractId, {
        ...this.contractFormGroup.value,
        client: this.isClientSpecific ? this.contractFormGroup.get('client').value : undefined,
        isClientSpecific: this.isClientSpecific
      }).subscribe(responseContract => {
        let contractRates = [];
        this.contractRatesList.forEach(contractRate => {
          if (typeof (contractRate.id) != 'string') {
            delete (contractRate.id);
            contractRate.contract = this.contractId;
            contractRate.rateType = contractRate.rateType.id;
            contractRate.rateCalcUOM = contractRate.rateCalcUOM.id;
            contractRate.rateCalcType = contractRate.rateCalcType.id;
            contractRate.rateBreaks = contractRate.rateBreaks.id;
            contractRate.rateBreakUOM = contractRate.rateBreakUOM.id;
            contractRate.currency = contractRate.currency.id;
            contractRates.push(contractRate);
          }
        });

        let accessorials = [];
        this.accessorialList.forEach(accessorial => {
          if (accessorial.id == undefined) {
            accessorial.contract = this.contractId;
            accessorial.service = accessorial.service.id;
            accessorial.chargeType = accessorial.chargeType.id;
            accessorial.chargeUOM = accessorial.chargeUOM != undefined ? accessorial.chargeUOM.id : undefined;;
            accessorial.fixedChargeCurrency = accessorial.fixedChargeCurrency.id;
            accessorial.minChargeCurrency = accessorial.minChargeCurrency.id;
            accessorial.maxChargeCurrency = accessorial.maxChargeCurrency.id;
            accessorial.perUnitChargeCurrency = accessorial.perUnitChargeCurrency.id;
            accessorials.push(accessorial);
          }
        });

        if (contractRates.length > 0 || accessorials.length > 0) {
          this.apiService.post('/rateSheets/batch/create', {
            contractRates,
            accessorials
          }).subscribe((responseRateSheets: any) => {
            this.utilityService.fireSnackBar('Contract updated successfully.');
            this.isBlocked = false;
            this.router.navigate(['/rates/contracts']);
          });
        } else {
          this.utilityService.fireSnackBar('Contract updated successfully.');
          this.isBlocked = false;
          this.router.navigate(['/rates/contracts']);
        }
      });
    }
  }

  setRateSheetDropdownValues() {
    this.ratesFormGroup.controls['rateType'].setValue(this.rateTypeList.find(val => val.id == this.ratesFormGroup.get('rateType').value));
    this.ratesFormGroup.controls['rateCalcUOM'].setValue(this.rateCalcUOMList.find(val => val.id == this.ratesFormGroup.get('rateCalcUOM').value));
    this.ratesFormGroup.controls['rateCalcType'].setValue(this.rateCalcTypeList.find(val => val.id == this.ratesFormGroup.get('rateCalcType').value));
    this.ratesFormGroup.controls['rateBreaks'].setValue(this.rateBreaksList.find(val => val.id == this.ratesFormGroup.get('rateBreaks').value));
    this.ratesFormGroup.controls['rateBreakUOM'].setValue(this.rateBreakUOMList.find(val => val.id == this.ratesFormGroup.get('rateBreakUOM').value));
    this.ratesFormGroup.controls['currency'].setValue(this.currencyList.find(val => val.id == this.ratesFormGroup.get('currency').value));
  }

  resetRateSheet() {
    this.isEdit = false;
    this.isFileAdded = false;
    this.ratesFormGroup.reset();
    // this.ratesFormGroup.controls['rateType'].setValue('');
    // this.ratesFormGroup.controls['rateCalcUOM'].setValue('');
    // this.ratesFormGroup.controls['rateCalcType'].setValue('');
    // this.ratesFormGroup.controls['rateBreaks'].setValue('');
    // this.ratesFormGroup.controls['rateBreakUOM'].setValue('');
    // this.ratesFormGroup.controls['currency'].setValue('');
    // this.ratesFormGroup.controls['description'].setValue('');
    this.initRateSheet();
  }

  uploadRates(e) {
    let reader = new FileReader();

    reader.onload = function (e: any) {
      var data = e.target.result;
      var workbook = XLSX.read(data, {
        type: 'binary'
      });

      let sheetJson = [];
      self.rateSheet = [];
      workbook.SheetNames.forEach(function (sheetName) {
        sheetJson = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        sheetJson.map(row => {
          self.rateSheet.push(row);
        });
        self.isFileAdded = true;
      });
    };

    reader.readAsBinaryString(e.target.files[0]);
  }

  downloadSheet() {
    let list = [
      {
        name: '',
        originArea: '',
        destinationArea: '',
        originCountry: '',
        destinationCountry: '',
        minCharge: '',
        maxCharge: '',
        rateBreaks: '',
        originCity: '',
        originState: '',
        originPostalCode: '',
        destinationCity: '',
        destinationState: '',
        destinationPostalCode: '',
      }
    ];

    let weightBreaks = this.contractFormGroup.get('weightBreaks').value.split(',');
    weightBreaks.map(weight => list[0][`Rate-Break-${weight.trim()}`] = '');

    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    const sheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(list, { cellDates: true });
    XLSX.utils.book_append_sheet(workbook, sheet, this.ratesFormGroup.get('name').value);
    XLSX.writeFile(workbook, `${this.ratesFormGroup.get('name').value}-${new Date().getTime()}.xlsx`);
  }

  showDownloadButton() {
    let name = this.ratesFormGroup.get('name').value;
    let weightBreaks = this.ratesFormGroup.get('name').value;
    if (name != '' && name != undefined && weightBreaks != '' && weightBreaks != undefined) {
      return true;
    } else {
      return false;
    }
  }

  openAccessorialPopup(template) {
    this.resetAccessorial();
    this.openAccessorialModal(template);
  }

  resetAccessorial() {
    this.isAccessorialEdit = false;
    this.accessorialFormGroup.reset();
    // this.accessorialFormGroup.controls['service'].setValue('');
    // this.accessorialFormGroup.controls['description'].setValue('');
    // this.accessorialFormGroup.controls['chargeType'].setValue('');
    // this.accessorialFormGroup.controls['chargeUOM'].setValue('');
    // this.accessorialFormGroup.controls['fixedChargeCurrency'].setValue('');
    // this.accessorialFormGroup.controls['minChargeCurrency'].setValue('');
    // this.accessorialFormGroup.controls['maxChargeCurrency'].setValue('');
    // this.accessorialFormGroup.controls['perUnitChargeCurrency'].setValue('');
    this.chargeUOMList = [];
  }

  openAccessorialModal(template: TemplateRef<any>) {
    this.accessorialModalRef = this.modalService.show(template, this.config);
  }

  checkAccessorialValidation(): boolean {
    if (this.accessorialFormGroup.get('service').value == "" || this.accessorialFormGroup.get('service').value == null) {
      this.utilityService.fireSnackBar('Please select a service.');
      return false;
    }
    if (this.accessorialFormGroup.get('description').value == "") {
      this.utilityService.fireSnackBar('Please enter some description.');
      return false;
    }
    if (this.accessorialFormGroup.get('effectiveDate').value == "" || this.accessorialFormGroup.get('effectiveDate').value == null) {
      this.utilityService.fireSnackBar('Please enter a effective date.');
      return false;
    }
    if (this.accessorialFormGroup.get('chargeType').value == "" || this.accessorialFormGroup.get('chargeType').value == null) {
      this.utilityService.fireSnackBar('Please enter a charge type.');
      return false;
    }
    if (this.chargeUOMList.length > 0) {
      if (this.accessorialFormGroup.get('chargeUOM').value == "" || this.accessorialFormGroup.get('chargeUOM').value == null) {
        this.utilityService.fireSnackBar('Please select a charge UOM.');
        return false;
      }
    }
    if (this.accessorialFormGroup.get('fixedCharge').value == "" || this.accessorialFormGroup.get('fixedCharge').value == null) {
      this.utilityService.fireSnackBar('Please enter a fixed Charge.');
      return false;
    }
    if (this.accessorialFormGroup.get('fixedChargeCurrency').value == "" || this.accessorialFormGroup.get('fixedChargeCurrency').value == null) {
      this.utilityService.fireSnackBar('Please select a fixed charge currency.');
      return false;
    }
    if (this.accessorialFormGroup.get('minCharge').value == "" || this.accessorialFormGroup.get('minCharge').value == null) {
      this.utilityService.fireSnackBar('Please enter a min charge.');
      return false;
    }
    if (this.accessorialFormGroup.get('minChargeCurrency').value == "" || this.accessorialFormGroup.get('minChargeCurrency').value == null) {
      this.utilityService.fireSnackBar('Please select a min charge currency.');
      return false;
    }
    if (this.accessorialFormGroup.get('maxCharge').value == "" || this.accessorialFormGroup.get('maxCharge').value == null) {
      this.utilityService.fireSnackBar('Please enter a max charge.');
      return false;
    }
    if (this.accessorialFormGroup.get('maxChargeCurrency').value == "" || this.accessorialFormGroup.get('maxChargeCurrency').value == null) {
      this.utilityService.fireSnackBar('Please select a max charge currency.');
      return false;
    }
    if (this.accessorialFormGroup.get('perUnitCharge').value == "" || this.accessorialFormGroup.get('perUnitCharge').value == null) {
      this.utilityService.fireSnackBar('Please enter a perUnit charge.');
      return false;
    }
    if (this.accessorialFormGroup.get('perUnitChargeCurrency').value == "" || this.accessorialFormGroup.get('perUnitChargeCurrency').value == null) {
      this.utilityService.fireSnackBar('Please select a perUnit charge currency.');
      return false;
    }

    return true;
  }

  addAccessorial() {
    if (this.checkAccessorialValidation()) {
      this.setAccessorialDropdownValues();
      this.accessorialList.push({
        ...this.accessorialFormGroup.value
      });
      this.accessorialModalRef.hide();
      this.resetAccessorial();
    }
  }

  setAccessorialDropdownValues() {
    this.accessorialFormGroup.controls['service'].setValue(this.servicesList.find(val => val.id == this.accessorialFormGroup.get('service').value));
    this.accessorialFormGroup.controls['chargeType'].setValue(this.chargeTypeList.find(val => val.id == this.accessorialFormGroup.get('chargeType').value));
    this.accessorialFormGroup.controls['chargeUOM'].setValue(this.chargeUOMList.find(val => val.id == this.accessorialFormGroup.get('chargeUOM').value));
    this.accessorialFormGroup.controls['fixedChargeCurrency'].setValue(this.currencyList.find(val => val.id == this.accessorialFormGroup.get('fixedChargeCurrency').value));
    this.accessorialFormGroup.controls['minChargeCurrency'].setValue(this.currencyList.find(val => val.id == this.accessorialFormGroup.get('minChargeCurrency').value));
    this.accessorialFormGroup.controls['maxChargeCurrency'].setValue(this.currencyList.find(val => val.id == this.accessorialFormGroup.get('maxChargeCurrency').value));
    this.accessorialFormGroup.controls['perUnitChargeCurrency'].setValue(this.currencyList.find(val => val.id == this.accessorialFormGroup.get('perUnitChargeCurrency').value));
  }

  chargeTypeChange(e) {
    this.chargeUOMList = [];
    let chargeTypeObj = this.chargeTypeList.find(val => val.id == e.target.value);
    this.apiService.get('/dropdownMapper/' + chargeTypeObj.id).subscribe((response: any) => {
      this.chargeUOMList = response.data.values;
      if (this.chargeUOMList.length <= 0) {
        this.accessorialFormGroup.controls['chargeUOM'].setValue('');
      }
    });
  }

  openEditAccessorialDialog(template, data, accessorialobj) {
    this.accessorialIdx = data.rowIndex;
    this.isAccessorialEdit = true;

    this.apiService.get('/dropdownMapper/' + accessorialobj.chargeType.id).subscribe((response: any) => {
      this.chargeUOMList = response.data.values;
      this.accessorialFormGroup.patchValue(accessorialobj);
      this.accessorialFormGroup.controls['service'].setValue(accessorialobj.service != null ? accessorialobj.service.id : '');
      this.accessorialFormGroup.controls['chargeType'].setValue(accessorialobj.chargeType != null ? accessorialobj.chargeType.id : '');
      this.accessorialFormGroup.controls['chargeUOM'].setValue(accessorialobj.chargeUOM != null ? accessorialobj.chargeUOM.id : '');
      this.accessorialFormGroup.controls['fixedChargeCurrency'].setValue(accessorialobj.fixedChargeCurrency != null ? accessorialobj.fixedChargeCurrency.id : '');
      this.accessorialFormGroup.controls['minChargeCurrency'].setValue(accessorialobj.minChargeCurrency != null ? accessorialobj.minChargeCurrency.id : '');
      this.accessorialFormGroup.controls['maxChargeCurrency'].setValue(accessorialobj.maxChargeCurrency != null ? accessorialobj.maxChargeCurrency.id : '');
      this.accessorialFormGroup.controls['perUnitChargeCurrency'].setValue(accessorialobj.perUnitChargeCurrency != null ? accessorialobj.perUnitChargeCurrency.id : '');
    });

    this.openAccessorialModal(template);
  }

  updateAccessorial() {
    if (this.checkAccessorialValidation()) {
      if (this.accessorialList[this.accessorialIdx].id != undefined) {
        // this.accessorialList[this.accessorialIdx].service = this.accessorialList[this.accessorialIdx].service.id;
        // this.accessorialList[this.accessorialIdx].chargeType = this.accessorialList[this.accessorialIdx].chargeType.id;
        // this.accessorialList[this.accessorialIdx].chargeUOM = this.accessorialList[this.accessorialIdx].chargeUOM.id;
        // this.accessorialList[this.accessorialIdx].fixedChargeCurrency = this.accessorialList[this.accessorialIdx].fixedChargeCurrency.id;
        // this.accessorialList[this.accessorialIdx].minChargeCurrency = this.accessorialList[this.accessorialIdx].minChargeCurrency.id;
        // this.accessorialList[this.accessorialIdx].maxChargeCurrency = this.accessorialList[this.accessorialIdx].maxChargeCurrency.id;
        // this.accessorialList[this.accessorialIdx].perUnitChargeCurrency = this.accessorialList[this.accessorialIdx].perUnitChargeCurrency.id;

        this.apiService.patch('/accessorials/' + this.accessorialList[this.accessorialIdx].id, {
          ...this.accessorialFormGroup.value,
          chargeUOM: this.accessorialFormGroup.get('chargeUOM').value == '' ? null : this.accessorialFormGroup.get('chargeUOM').value
        }).subscribe((responseAccessorial: any) => {
          this.accessorialList[this.accessorialIdx] = responseAccessorial;
          this.accessorialModalRef.hide();
          this.resetAccessorial();
          this.utilityService.fireSnackBar('Service updated successfully.');
        });
      } else {
        this.setAccessorialDropdownValues();
        this.accessorialList[this.accessorialIdx] = this.accessorialFormGroup.value;
        this.accessorialModalRef.hide();
        this.resetAccessorial();
      }
    }
  }

  isDisabledAddRateSheet(): boolean {
    let weightBreaks = this.contractFormGroup.get('weightBreaks').value;

    if (weightBreaks != '' && weightBreaks != undefined && this.isContractEdit == false) {
      return false;
    } else {
      return true;
    }
  }

  vendorOnInputEvent(e) {
    if (e.event.target.value == '') {
      this.vendor.instance.reset();
    }

    this.vendorSubject.next(e.event.target.value);
  }

  vendorValueChanged(e) {
    if (e.selectedItem != undefined) {
      this.contractFormGroup.patchValue({ vendor: e.selectedItem.id });
    }
  }

  customerOnInputEvent(e) {
    if (e.event.target.value == '') {
      this.client.instance.reset();
    }

    this.customerSubject.next(e.event.target.value);
  }

  customerValueChanged(e) {
    if (e.selectedItem != undefined) {
      this.contractFormGroup.patchValue({ vendor: e.selectedItem.id });
    }
  }

  initSubjects() {
    this.vendorSubject.pipe(debounceTime(500), distinctUntilChanged(), tap(() => {
      this.spinner.show();
    }), switchMap(value => {
      if (value != '' && value != undefined) {
        this.socket.emit('getTradingPartnerAsVendor', { query: value });
      } else {
        this.spinner.hide();
      }

      return [];
    })).subscribe((response: any) => { }, error => {
      this.initSubjects();
    });

    this.customerSubject.pipe(debounceTime(500), distinctUntilChanged(), tap(() => {
      this.spinner.show();
    }), switchMap(value => {
      if (value != '' && value != undefined) {
        this.socket.emit('getTradingPartnerAsCustomer', { query: value });
      } else {
        this.spinner.hide();
      }

      return [];
    })).subscribe((response: any) => { }, error => {
      this.initSubjects();
    });
  }

  initSocketEvents() {
    this.socket.on('getTradingPartnerAsVendor', response => {
      this.vendorsList = response;
      this.spinner.hide();
    });

    this.socket.on('getTradingPartnerAsCustomer', response => {
      this.clientsList = response;
      this.spinner.hide();
    });
  }

}
