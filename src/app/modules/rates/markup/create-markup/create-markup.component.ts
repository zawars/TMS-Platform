import { Component, OnInit } from '@angular/core';
import { UtilityService } from 'src/app/services/utility.service';
import { ApiService } from 'src/app/services/api.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';
import { switchMap, debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { SocketService } from 'src/app/services/socket.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-create-markup',
  templateUrl: './create-markup.component.html',
  styleUrls: ['./create-markup.component.scss']
})
export class CreateMarkupComponent implements OnInit {
  formGroup: FormGroup;
  minDate = Date.now();
  isEdit: boolean = false;
  isBlocked: boolean = false;
  currencyList: Array<any> = new Array();
  vendorsList: Array<any> = new Array();
  clientsList: Array<any> = new Array();
  contractsList: Array<any> = new Array();
  rateSheetsList: Array<any> = new Array();
  markupId;
  tradingPartnersSubject = new BehaviorSubject<any>({});
  contractsSubject = new Subject<any>();

  constructor(public utilityService: UtilityService, private apiService: ApiService, private fb: FormBuilder,
    private route: ActivatedRoute, private router: Router, private socket: SocketService, private spinner: NgxSpinnerService) {
    this.utilityService.breadcrumb = 'Create Markup';

    this.utilityService.initializeDropdowns(this.route);
    this.initTradingPartnerSubject();
    this.initSocketEvents();
    this.currencyList = this.utilityService.dropdowns['currencyValues'].values;
  }

  ngOnInit() {
    this.formGroup = this.fb.group({
      uid: [{ value: '', disabled: true }],
      name: [''],
      customer: [''],
      vendor: [''],
      contract: [''],
      rateSheet: [''],
      effectiveDate: [''],
      defaultPercentage: [''],
      appliesToAccesorials: [false],
      minAmount: [''],
      minAmountCurrency: [''],
      maxAmount: [''],
      maxAmountCurrency: [''],
    });

    let sub = this.route.params.subscribe(params => {
      if (params.id != undefined) {
        this.utilityService.breadcrumb = 'Edit Markup';
        this.markupId = params.id;
        this.isEdit = true;
        this.fetchMarkup();
      }
    });
  }

  fetchMarkup() {
    this.apiService.get('/markup/' + this.markupId).subscribe((response: any) => {
      this.formGroup.patchValue({
        ...response,
        contract: response.contract.id,
        rateSheet: response.rateSheet != undefined ? response.rateSheet.id : undefined,
        minAmountCurrency: response.minAmountCurrency.id,
        maxAmountCurrency: response.maxAmountCurrency.id
      });

      this.contractsList = [response.contract];
      this.rateSheetsList = [response.rateSheet];
      this.clientsList = [response.customer];
      this.vendorsList = [response.vendor];
    });
  }

  create() {
    this.isBlocked = true;
    if (this.checkValidations()) {
      this.apiService.post('/markup', this.formGroup.value).subscribe(response => {
        this.utilityService.fireSnackBar('Markup created successfully.');
        this.isBlocked = false;
        this.router.navigate(['/rates/markup']);
      }, err => {
        this.isBlocked = false;
      });
    } else {
      this.isBlocked = false;
    }
  }

  update() {
    this.isBlocked = true;
    if (this.checkValidations()) {
      this.apiService.patch('/markup/' + this.markupId, this.formGroup.value).subscribe(response => {
        this.utilityService.fireSnackBar('Markup updated successfully.');
        this.isBlocked = false;
      }, err => {
        this.isBlocked = false;
      });
    } else {
      this.isBlocked = false;
    }
  }

  checkValidations() {
    if (this.formGroup.get('name').value == "") {
      this.utilityService.fireSnackBar('Please enter a name.');
      return false;
    }
    if (this.formGroup.get('customer').value == "") {
      this.utilityService.fireSnackBar('Please select a client.');
      return false;
    }
    if (this.formGroup.get('vendor').value == "") {
      this.utilityService.fireSnackBar('Please enter a vendor.');
      return false;
    }
    if (this.formGroup.get('contract').value == "") {
      this.utilityService.fireSnackBar('Please enter a contract.');
      return false;
    }
    // if (this.formGroup.get('rateSheet').value == "") {
    //   this.utilityService.fireSnackBar('Please enter a rateSheet.');
    //   return false;
    // }
    if (this.formGroup.get('effectiveDate').value == "") {
      this.utilityService.fireSnackBar('Please enter a effectiveDate.');
      return false;
    }
    if (this.formGroup.get('defaultPercentage').value == "") {
      this.utilityService.fireSnackBar('Please enter a defaultPercentage.');
      return false;
    }
    if (this.formGroup.get('appliesToAccesorials').value == "") {
      this.utilityService.fireSnackBar('Please enter a appliesToAccesorials.');
      return false;
    }
    if (this.formGroup.get('minAmount').value == "") {
      this.utilityService.fireSnackBar('Please enter a minAmount.');
      return false;
    }
    if (this.formGroup.get('minAmountCurrency').value == "") {
      this.utilityService.fireSnackBar('Please enter a minAmountCurrency.');
      return false;
    }
    if (this.formGroup.get('maxAmount').value == "") {
      this.utilityService.fireSnackBar('Please enter a maxAmount.');
      return false;
    }
    if (this.formGroup.get('maxAmountCurrency').value == "") {
      this.utilityService.fireSnackBar('Please enter a maxAmountCurrency.');
      return false;
    }
    return true;
  }

  clientOnInputEvent(e, type) {
    if (e.event.target.value != '') {
      this.tradingPartnersSubject.next({
        type,
        value: e.event.target.value
      });
    }
  }

  clientOnValueChanges(e) {
    if (e.selectedItem) {
      if (e.selectedItem.id) {
        this.formGroup.patchValue({ customer: e.selectedItem });
      }
    }
  }

  vendorSelectionChanged(e) {
    if (e.selectedItem) {
      if (e.selectedItem.id) {
        this.formGroup.patchValue({ vendor: e.selectedItem });
        if (e.selectedItem.contracts != undefined) {
          this.contractsList = e.selectedItem.contracts;
        }
      }
    }
  }

  contractSelectionChanged(e) {
    if (e.selectedItem) {
      this.apiService.get('/rateSheets/contract/' + e.selectedItem.id).subscribe((response: any) => {
        this.rateSheetsList = response;
      });
    }
  }

  initSocketEvents() {
    this.socket.on('searchTradingPartnerByType', response => {
      if (this.tradingPartnersSubject.getValue().hasOwnProperty('type')) {
        if (this.tradingPartnersSubject.getValue().type == 'Customer') {
          this.clientsList = [];
          this.clientsList = response;
        } else {
          this.vendorsList = [];
          this.vendorsList = response;
        }
      }

      this.spinner.hide();
    });

    this.socket.on('searchContracts', response => {
      this.contractsList = response;
      this.spinner.hide();
    });
  }

  initTradingPartnerSubject() {
    this.tradingPartnersSubject.pipe(debounceTime(500), distinctUntilChanged(), tap(() => {
      this.spinner.show();
    }), switchMap((data: any) => {
      if (data.query != undefined) {
        this.socket.emit('searchTradingPartnerByType', { type: data.type, query: data.value });
      } else {
        this.spinner.hide();
      }

      return [];
    })).subscribe((response: any) => { });

    this.contractsSubject.pipe(debounceTime(500), distinctUntilChanged(), tap(() => {
      this.spinner.show();
    }), switchMap((query: any) => {
      if (query != '') {
        this.socket.emit('searchContracts', { query });
      } else {
        this.spinner.hide();
      }

      return [];
    })).subscribe((response: any) => { });
  }

  contractsOnInputEvent(e) {
    if (e.event.target.value != '') {
      this.contractsSubject.next(e.event.target.value);
    }
  }
}
