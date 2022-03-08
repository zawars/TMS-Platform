import { Component, OnInit, TemplateRef } from '@angular/core';
import { UtilityService } from 'src/app/services/utility.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import swal from 'sweetalert2';
import { I18nPipe } from 'src/app/shared/i18n/i18n.pipe';
import { FormGroup, FormBuilder } from '@angular/forms';
import { BsModalService } from 'ngx-bootstrap';
import { BehaviorSubject } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap, switchMap, share, finalize } from 'rxjs/operators';
import { NgxSpinnerService } from 'ngx-spinner';
import { SocketService } from 'src/app/services/socket.service';

@Component({
  selector: 'app-order-details',
  templateUrl: './create-order.component.html',
  styleUrls: ['./create-order.component.scss']
})
export class OrderDetailsComponent implements OnInit {
  invoiceId;
  originalQuotationRateSheet: any = [];
  carrierInvoice: any = [];
  specificCarrierInvoice: any = [];
  originalQuotationMargin: any = [];
  customerBilling: any = [];
  totalOriginalQuotaionAmount = 0;
  totalOriginalQuotaionMarginAmount = 0;
  totalCarrierInvoiceAmount = 0;
  totalSpecificCarrierInvoiceAmount = 0;
  totalCustomerBillingAmount = 0;
  invoiceStatus: string = 'New';
  carrierInvoiceStatus: string = '';
  modalRef;
  productModalRef;
  config = {
    animated: true,
    keyboard: true,
    backdrop: true,
    ignoreBackdropClick: true
  };
  now = new Date().toISOString();
  orderId;
  orderFormGroup: FormGroup;
  minDate = Date.now();
  refNumTypeList: any = ['House'];
  citiesList: any = [];
  statesList: any = [];
  productList: any = [];
  handlingUnitList: any = [];
  lengthUnitList: any = [];
  weightUnitList: any = [];
  cubeUnitList: any = [];
  classList: any = [];
  serviceList: any = [];
  locationsList: any = [];
  isSelect: boolean = false;
  isEdit: boolean = false;
  BASE_PATH = '';
  freightList: any = [];
  rateList: any = [];
  loadingVisible = false;
  postalCodesList: any = [];
  pickupCitiesList: any = [];
  pickupCityPostalCodes: any = [];
  dropoffCityPostalCodes: any = [];
  isPlaced: boolean = false;
  quoteId;
  countryList: any = [];
  customerId;
  orderObj;
  customersList: any = [];
  showProductBox: boolean = false;
  productsFormGroup: FormGroup;
  postalCodeAndCity: any = {};
  pickupCityPostalCodeValue: any;
  dropoffCityPostalCodeValue: any;
  dropOffPostalCodeAndCity: any = {};
  pickupStatesList;
  dropoffStatesList;
  locationSubject = new BehaviorSubject<any>({});
  dropOffCitiesList = [];
  tradingPartnerSubject = new BehaviorSubject<any>({});
  selectedServices: any = [];
  saveFlag: boolean = false;

  constructor(public utilityService: UtilityService, private router: Router, private apiService: ApiService,
    private route: ActivatedRoute, private localize: I18nPipe, private fb: FormBuilder, private modalService: BsModalService,
    private spinnerService: NgxSpinnerService, private socket: SocketService, ) {
    this.BASE_PATH = this.apiService.IMAGE_PATH;

    this.getCustomers();
    this.initOriginalQuotationMargin();
    this.initCustomerBilling();
    this.initOrderFormGroup();
    this.initProductFormGroup();
    this.utilityService.initializeDropdowns(this.route);
    this.initLocationSubject();
    this.initSocketEvents();
    this.initTradingPartnerSubject();

    this.route.params.subscribe(params => {
      if (params.id != undefined) {
        this.getCustomerInfo();
        this.orderId = params.id;
        this.utilityService.breadcrumb = 'Edit Order';
        this.isEdit = true;
        this.isSelect = true;
        this.getOrder();
      } else {
        this.utilityService.breadcrumb = 'Create Order';
        this.resetOrder();
      }
    });
  }

  resetOrder() {
    this.serviceList = [];
    this.initOrderFormGroup();
    this.initProductFormGroup();
    this.freightList = [];
    this.rateList = [];
    this.isEdit = false;
    this.isSelect = false;
    this.isPlaced = false;
    this.addFreight();
  }

  ngOnInit() {
    this.countryList = this.utilityService.dropdowns['countryValues'].values;
    this.statesList = this.utilityService.dropdowns['stateValues'].values;
    this.handlingUnitList = this.utilityService.dropdowns['handlingUnitValues'].values;
    this.lengthUnitList = this.utilityService.dropdowns['lengthUnitValues'].values;
    this.weightUnitList = this.utilityService.dropdowns['weightUnitValues'].values;
    this.cubeUnitList = this.utilityService.dropdowns['cubeUnitValues'].values;
    this.classList = this.utilityService.dropdowns['classValues'].values;
  }

  initOrderFormGroup() {
    this.orderFormGroup = this.fb.group({
      orderNumber: [''],
      status: ['New'],
      pickUpDate: [new Date().toISOString()],
      deliveryDate: [new Date().toISOString()],
      instructions: [''],
      bolNumber: ['BOL' + Math.floor(Math.random() * (999999 - 100000)) + 100000],
      refNumType: [''],
      refNumValue: [''],
      pickupLocation: [''],
      shipperName: [''],
      pickupContact: [''],
      pickupAddress: [''],
      pickupPhone: [''],
      pickupAddress2: [''],
      pickupFax: [''],
      pickupCity: [''],
      pickupCountry: [''],
      pickupState: [''],
      pickupEmail: [''],
      pickupPostalCode: [''],
      pickupHours: [''],
      pickupMinutes: [''],
      dropoffLocation: [''],
      consigneeName: [''],
      dropoffContact: [''],
      dropoffAddress: [''],
      dropoffPhone: [''],
      dropoffAddress2: [''],
      dropoffFax: [''],
      dropoffCity: [''],
      dropoffState: [''],
      dropoffCountry: [''],
      dropoffEmail: [''],
      dropoffPostalCode: [''],
      dropoffHours: [''],
      dropoffMinutes: [''],
    });

    this.orderFormGroup.controls.orderNumber.disable();
    this.orderFormGroup.controls.status.disable();
    this.orderFormGroup.controls.bolNumber.disable();
  }

  initProductFormGroup() {
    this.productsFormGroup = this.fb.group({
      name: [''],
      nmfc: [''],
      handlingUnit: [''],
      classType: [''],
      huCount: [''],
    });
  }

  getCustomers() {
    this.apiService.get('/tradingPartners/type/Customer').subscribe((response: any) => {
      this.customersList = response;
    });
  }

  getOrder() {
    this.loadingVisible = true;
    this.apiService.get("/orders/" + this.orderId).subscribe((responseOrder: any) => {
      this.socket.emit('fetchTradingPartnerWithCustomerLocations', { id: responseOrder.customer.id })
      this.orderObj = responseOrder;
      this.setOrderInvoices();
      this.isPlaced = responseOrder.isPlaced;
      this.customerId = responseOrder.customer != undefined ? responseOrder.customer.id : undefined;

      this.orderFormGroup.patchValue({
        ...responseOrder,
        pickupState: responseOrder.pickupState != null ? responseOrder.pickupState.id : '',
        dropoffState: responseOrder.dropoffState != null ? responseOrder.dropoffState.id : '',
        pickupLocation: responseOrder.pickupLocation != null ? responseOrder.pickupLocation.id : '',
        dropoffLocation: responseOrder.dropoffLocation != null ? responseOrder.dropoffLocation.id : '',
        pickupCountry: responseOrder.pickupCountry != null ? responseOrder.pickupCountry.id : '',
        dropoffCountry: responseOrder.dropoffCountry != null ? responseOrder.dropoffCountry.id : '',
      });
      this.pickupCitiesList = [responseOrder.pickupCity];
      this.dropOffCitiesList = [responseOrder.dropoffCity];
      this.pickupStatesList = [responseOrder.pickupState];
      this.dropoffStatesList = [responseOrder.dropoffState];
      this.countryList = [responseOrder.pickupCountry];
      this.countryList = [responseOrder.dropoffCountry];
      // To ensure uniqueness
      this.countryList = Array.from(new Set(this.countryList));

      this.pickupCityPostalCodeValue = {
        city: responseOrder.pickupCity,
        postalCode: responseOrder.pickupPostalCode,
        name: `${responseOrder.pickupPostalCode.name}, ${responseOrder.pickupCity.name}`
      };
      this.pickupCitiesList.push(this.pickupCityPostalCodeValue);

      this.dropoffCityPostalCodeValue = {
        city: responseOrder.dropoffCity,
        postalCode: responseOrder.dropoffPostalCode,
        name: `${responseOrder.dropoffPostalCode.name}, ${responseOrder.dropoffCity.name}`
      };
      this.dropOffCitiesList.push(this.dropoffCityPostalCodeValue);

      this.freightList = responseOrder.freights;
      this.selectedServices = responseOrder.services;
      // this.serviceList.map((service, index) => {
      //   if (responseOrder.services.find(val => val.id == service.id)) {
      //     this.serviceList[index] = responseOrder.services.find(val => val.id == service.id);
      //   }
      // });

      if (responseOrder.rate != undefined) {
        this.rateList.push(responseOrder.rate);
        this.rateList[0].weight = this.getTotalFreightWeight();
        this.rateList[0].pieces = this.getTotalFreightPieces();
        this.rateList[0].appliedRate = responseOrder.appliedRate;
        this.rateList[0].markupValue = responseOrder.markupValue;
      }

      if (responseOrder.vendor != undefined) {
        this.apiService.get("/tradingPartners/" + responseOrder.vendor.id).subscribe((responseVendor: any) => {
          this.rateList[0].vendor = responseVendor;
          this.loadingVisible = false;
        });
      } else {
        // Added temporarily because no rate sheets at the moment
        this.loadingVisible = false;
      }
    });
  }

  productChange(e, data) {
    if (this.productList.length > 0) {
      let product = this.productList.find(val => val.id == data.key.product);
      data.key.nmfc = product.nmfc;
      data.key.handlingUnit = this.handlingUnitList.find(val => val.id == product.handlingUnit) != undefined ? this.handlingUnitList.find(val => val.id == product.handlingUnit).id : '';
      data.key.classType = this.classList.find(val => val.id == product.classType) != undefined ? this.classList.find(val => val.id == product.classType).id : '';
      data.key.huCount = product.huCount;
    }
  }

  pickupLocationChange(e) {
    if (e.value) {
      let locId = e.value.id != undefined ? e.value.id : e.value
      if (this.locationsList.length > 0) {
        let location = this.locationsList.find(val => val.id == locId);
        this.orderFormGroup.controls['pickupCity'].setValue(location.city.name);
        this.orderFormGroup.controls['pickupPostalCode'].setValue(location.postalCode.name);
        this.orderFormGroup.controls['pickupState'].setValue(location.state.id);
        this.orderFormGroup.controls['pickupAddress'].setValue(location.street);
        this.orderFormGroup.controls['pickupCountry'].setValue(location.country.name);
      }
    }
  }

  dropoffLocationChange(e) {
    if (e.value) {
      let locId = e.value.id != undefined ? e.value.id : e.value
      if (this.locationsList.length > 0) {
        let location = this.locationsList.find(val => val.id == locId);
        this.orderFormGroup.controls['dropoffCity'].setValue(location.city.name);
        this.orderFormGroup.controls['dropoffPostalCode'].setValue(location.postalCode.name);
        this.orderFormGroup.controls['dropoffState'].setValue(location.state.id);
        this.orderFormGroup.controls['dropoffAddress'].setValue(location.street);
        this.orderFormGroup.controls['dropoffCountry'].setValue(location.country.name);
      }
    }
  }

  addFreight() {
    this.freightList.push({
      frId: 'FR' + Math.floor(Math.random() * (999999 - 100000)) + 100000,
      product: '',
      description: '',
      huCount: '',
      pieces: '',
      nmfc: '',
      handlingUnit: '',
      weight: '',
      weightUnit: '',
      lengthUnit: '',
      length: '',
      width: '',
      height: '',
      cube: '',
      cubeUnit: '',
      density: '',
      classType: '',
      hazmatUN: ''
    });
  }

  removeFreight(data) {
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
        let idx = this.freightList.findIndex(val => val.frId == data.key.frId);
        this.freightList.splice(idx, 1);
      }
    });
  }

  checkRateValidation(type): boolean {
    if (this.customerId == "" || this.customerId == null || this.customerId == undefined) {
      this.utilityService.fireSnackBar('Please select a customer.');
      return false;
    }
    if (this.orderFormGroup.get('pickUpDate').value == "" || this.orderFormGroup.get('pickUpDate').value == null) {
      this.utilityService.fireSnackBar('Please select a pickup date.');
      return false;
    }
    if (type == 'save') {
      if (this.orderFormGroup.get('deliveryDate').value == "" || this.orderFormGroup.get('deliveryDate').value == null) {
        this.utilityService.fireSnackBar('Please select a delivery date.');
        return false;
      }
      if (this.orderFormGroup.get('refNumValue').value == "" || this.orderFormGroup.get('refNumValue').value == null) {
        this.utilityService.fireSnackBar('Please add refNum value.');
        return false;
      }
    }
    if (this.orderFormGroup.get('pickupCity').value == "" || this.orderFormGroup.get('pickupCity').value == null) {
      this.utilityService.fireSnackBar('Please select a pickup city.');
      return false;
    }
    if (this.orderFormGroup.get('dropoffCity').value == "" || this.orderFormGroup.get('dropoffCity').value == null) {
      this.utilityService.fireSnackBar('Please select a dropoff city .');
      return false;
    }
    if (this.freightList.length == 0) {
      this.utilityService.fireSnackBar('Please add a freight.');
      return false;
    }
    if (this.freightList.filter(val => val.product == '').length > 0) {
      this.utilityService.fireSnackBar('Please select product in each freight list.');
      return false;
    }
    if (this.getTotalFreightWeight() <= 0) {
      this.utilityService.fireSnackBar('Please add a weight in freight list.');
      return false;
    }

    return true;
  }

  onCustomerSelectionChanged(e) {
    this.getCustomerInfo();
  }

  getCustomerInfo() {
    if (this.customerId != undefined && this.customerId != null) {
      this.apiService.get("/tradingPartners/" + this.customerId)
        .subscribe((responseCustomer: any) => {
          this.productList = responseCustomer.products;
          this.locationsList = responseCustomer.locations;
          let accessorials = responseCustomer.services;
          this.serviceList = [];
          accessorials.forEach(element => {
            this.serviceList.push({ id: element.id, name: element.name, value: false });
          });

          if (this.orderObj) {
            this.orderFormGroup.controls['pickupLocation'].setValue('');
            this.orderFormGroup.controls['dropoffLocation'].setValue('');
            this.orderFormGroup.controls['pickupLocation'].setValue(this.orderObj.pickupLocation != null ? this.orderObj.pickupLocation.id : '');
            this.orderFormGroup.controls['dropoffLocation'].setValue(this.orderObj.dropoffLocation != null ? this.orderObj.dropoffLocation.id : '');

            this.serviceList.map((service, index) => {
              if (this.orderObj.services.find(val => val.id == service.id)) {
                this.serviceList[index] = this.orderObj.services.find(val => val.id == service.id);
              }
            });
          }
        });
    }
  }

  clientOnInputEvent(e, type) {
    if (e.event.target.value != '') {
      this.tradingPartnerSubject.next({
        type,
        value: e.event.target.value
      });
    }
  }

  getTotalFreightWeight() {
    let totalWeight = 0;
    this.freightList.forEach(freight => {
      totalWeight += +freight.weight;
    });
    return totalWeight;
  }

  getTotalFreightPieces() {
    let totalPieces = 0;
    this.freightList.forEach(freight => {
      totalPieces += +freight.pieces;
    });
    return totalPieces;
  }

  getRates() {
    if (this.checkRateValidation('get')) {
      this.loadingVisible = true;
      this.isSelect = false;
      let searchObj = {
        originCity: this.orderFormGroup.get('pickupCity').value,
        originPostalCode: this.orderFormGroup.get('pickupPostalCode').value,
        originCountry: this.orderFormGroup.get('pickupCountry').value,
        destinationCity: this.orderFormGroup.get('dropoffCity').value,
        destinationPostalCode: this.orderFormGroup.get('dropoffPostalCode').value,
        destinationCountry: this.orderFormGroup.get('dropoffCountry').value,
        weight: this.getTotalFreightWeight(),
        clientId: this.customerId
      }

      this.rateList = [];

      this.apiService.post("/rates/search/", { searchObj }).subscribe((response: any) => {
        if (response.rates != undefined) {
          response.rates.forEach(element => {
            element.vendor = response.rateSheetVendor.find(val => val.rateSheet == element.rateSheet.id).vendor;
            element.weight = this.getTotalFreightWeight();
            element.pieces = this.getTotalFreightPieces();
          });
          this.rateList = response.rates;
          this.loadingVisible = false;
          if (this.rateList.length == 0) {
            this.utilityService.fireSnackBar('Rates not found.');
          } else {
            this.utilityService.fireSnackBar('Rates are found.');
          }
        } else {
          this.utilityService.fireSnackBar('Rates not found.');
          this.loadingVisible = false;
        }
      });
    }
  }

  selectRate(id) {
    let selectRate = this.rateList.find(val => val.id == id);
    this.rateList = [];
    this.rateList.push(selectRate);
    this.isSelect = true;
  }

  setFreightsValues() {
    this.freightList.forEach(freight => {
      freight.pieces = +freight.pieces;
      freight.weight = +freight.weight;
      freight.length = +freight.length;
      freight.width = +freight.width;
      freight.height = +freight.height;
      freight.cube = +freight.cube;
      freight.lengthUnit = freight.lengthUnit != '' ? freight.lengthUnit : undefined;
      freight.weightUnit = freight.weightUnit != '' ? freight.weightUnit : undefined;
      freight.cubeUnit = freight.cubeUnit != '' ? freight.cubeUnit : undefined;
    });
  }

  saveOrder() {
    if (this.checkRateValidation('save')) {
      this.saveFlag = true;
      this.orderFormGroup.controls.orderNumber.enable();
      this.orderFormGroup.controls.status.enable();
      this.orderFormGroup.controls.bolNumber.enable();
      this.setFreightsValues();
      let orderObj = {
        ...this.orderFormGroup.value,
        pickupState: this.orderFormGroup.get('pickupState').value != '' ? this.orderFormGroup.get('pickupState').value : undefined,
        dropoffState: this.orderFormGroup.get('dropoffState').value != '' ? this.orderFormGroup.get('dropoffState').value : undefined,
        pickupLocation: this.orderFormGroup.get('pickupLocation').value != '' ? this.orderFormGroup.get('pickupLocation').value : undefined,
        dropoffLocation: this.orderFormGroup.get('dropoffLocation').value != '' ? this.orderFormGroup.get('dropoffLocation').value : undefined,
        rate: this.rateList[0].id,
        appliedRate: this.rateList[0].appliedRate,
        markupValue: this.rateList[0].markupValue,
        vendor: this.rateList[0].vendor.id,
        services: this.serviceList,
        freights: this.freightList,
        isPlaced: false,
        customer: this.customerId ? this.customerId : undefined,
        accumulatedPieces: this.getTotalFreightPieces(),
        accumulatedWeight: this.getTotalFreightWeight()
      }
      this.apiService.post("/orders/batch", { orderObj: orderObj }).subscribe((response: any) => {
        this.saveFlag = false;
        this.utilityService.fireSnackBar('Order saved successfully.');
        this.router.navigate(['/order']);
      });
    }
  }

  editOrder() {
    if (this.checkRateValidation('save')) {
      this.setFreightsValues();
      let orderObj = {
        ...this.orderFormGroup.value,
        pickupState: this.orderFormGroup.get('pickupState').value != '' ? this.orderFormGroup.get('pickupState').value : undefined,
        dropoffState: this.orderFormGroup.get('dropoffState').value != '' ? this.orderFormGroup.get('dropoffState').value : undefined,
        pickupLocation: this.orderFormGroup.get('pickupLocation').value != '' ? this.orderFormGroup.get('pickupLocation').value : undefined,
        dropoffLocation: this.orderFormGroup.get('dropoffLocation').value != '' ? this.orderFormGroup.get('dropoffLocation').value : undefined,
        rate: this.rateList[0].id,
        appliedRate: this.rateList[0].appliedRate,
        markupValue: this.rateList[0].markupValue,
        vendor: this.rateList[0].vendor.id,
        services: this.serviceList,
        freights: this.freightList,
        isPlaced: false,
        customer: this.customerId ? this.customerId : undefined,
        accumulatedPieces: this.getTotalFreightPieces(),
        accumulatedWeight: this.getTotalFreightWeight()
      }
      this.apiService.patch("/orders/batch/" + this.orderId, { orderObj: orderObj }).subscribe((response: any) => {
        this.utilityService.fireSnackBar('Order updated successfully.');
        this.router.navigate(['/order']);
      });
    }
  }

  placeOrder() {
    if (this.checkRateValidation('save')) {
      this.setFreightsValues();
      if (!this.isEdit) {
        this.orderFormGroup.controls.orderNumber.enable();
        this.orderFormGroup.controls.status.enable();
        this.orderFormGroup.controls.bolNumber.enable();

        let orderObj = {
          ...this.orderFormGroup.value,
          status: 'Placed',
          pickupState: this.orderFormGroup.get('pickupState').value != '' ? this.orderFormGroup.get('pickupState').value : undefined,
          dropoffState: this.orderFormGroup.get('dropoffState').value != '' ? this.orderFormGroup.get('dropoffState').value : undefined,
          pickupLocation: this.orderFormGroup.get('pickupLocation').value != '' ? this.orderFormGroup.get('pickupLocation').value : undefined,
          dropoffLocation: this.orderFormGroup.get('dropoffLocation').value != '' ? this.orderFormGroup.get('dropoffLocation').value : undefined,
          rate: this.rateList[0].id,
          appliedRate: this.rateList[0].appliedRate,
          markupValue: this.rateList[0].markupValue,
          vendor: this.rateList[0].vendor.id,
          services: this.serviceList,
          freights: this.freightList,
          isPlaced: true,
          customer: this.customerId ? this.customerId : undefined,
          accumulatedPieces: this.getTotalFreightPieces(),
          accumulatedWeight: this.getTotalFreightWeight()
        };

        this.apiService.post("/orders/batch", { orderObj: orderObj }).subscribe((responseOrder: any) => {
          this.apiService.post('/user/sendmail', {
            email: this.rateList[0].vendor.contactEmail,
            subject: "Order Placed",
            message: `Order has been assigned to you. <br>
            <a href="${this.apiService.FrontEndPATH}/view/bol/${responseOrder.id}" target="_blank">${'BOL Number : ' + responseOrder.bolNumber}</a>`
          }).subscribe(msg => {
            this.utilityService.fireSnackBar('Order placed successfully.');
            this.router.navigate(['/order', { isPlaced: true }]);
          });
        });
      } else {
        let orderObj = {
          ...this.orderFormGroup.value,
          status: 'Placed',
          pickupState: this.orderFormGroup.get('pickupState').value != '' ? this.orderFormGroup.get('pickupState').value : undefined,
          dropoffState: this.orderFormGroup.get('dropoffState').value != '' ? this.orderFormGroup.get('dropoffState').value : undefined,
          pickupLocation: this.orderFormGroup.get('pickupLocation').value != '' ? this.orderFormGroup.get('pickupLocation').value : undefined,
          dropoffLocation: this.orderFormGroup.get('dropoffLocation').value != '' ? this.orderFormGroup.get('dropoffLocation').value : undefined,
          rate: this.rateList[0].id,
          appliedRate: this.rateList[0].appliedRate,
          markupValue: this.rateList[0].markupValue,
          vendor: this.rateList[0].vendor.id,
          services: this.serviceList,
          freights: this.freightList,
          isPlaced: true,
          customer: this.customerId ? this.customerId : undefined,
          accumulatedPieces: this.getTotalFreightPieces(),
          accumulatedWeight: this.getTotalFreightWeight()
        };

        this.apiService.patch("/orders/batch/" + this.orderId, { orderObj: orderObj }).subscribe((responseOrder: any) => {
          this.apiService.post('/user/sendmail', {
            email: this.rateList[0].vendor.contactEmail,
            subject: "Order Placed",
            message: `Order has been assigned to you. <br>
            <a href="${this.apiService.FrontEndPATH}view/bol/${this.orderId}" target="_blank">${'BOL Number : ' + responseOrder[0].bolNumber}</a>`
          }).subscribe(msg => {
            this.utilityService.fireSnackBar('Order placed successfully.');
            this.router.navigate(['/order', { isPlaced: true }]);
          });
        });
      }
    }
  }

  // Products Code
  openAddProductPopup(template: TemplateRef<any>) {
    this.resetProductForm();
    this.openProductModal(template);
  }

  openProductModal(template: TemplateRef<any>) {
    this.productModalRef = this.modalService.show(template, this.config);
  }

  resetProductForm() {
    this.productsFormGroup.reset();
  }

  addProduct() {
    if (this.checkProductFormValidation()) {
      this.apiService.post('/products', {
        ...this.productsFormGroup.value,
        tradingPartner: this.customerId
      }).subscribe((responseProduct: any) => {
        responseProduct.handlingUnit = responseProduct.handlingUnit.id;
        responseProduct.classType = responseProduct.classType.id;
        this.productList.push(responseProduct);
        this.utilityService.fireSnackBar('Product add successfully.');
        this.productModalRef.hide();
        this.resetProductForm();
      });
    }
  }

  checkProductFormValidation() {
    if (this.customerId == "" || this.customerId == null || this.customerId == undefined) {
      this.utilityService.fireSnackBar('Please select a customer.');
      return false;
    }
    if (this.productsFormGroup.get('name').value == '' || this.productsFormGroup.get('name').value == null) {
      this.utilityService.fireSnackBar('Please enter a name.');
      return false;
    }
    if (this.productsFormGroup.get('nmfc').value == '' || this.productsFormGroup.get('nmfc').value == null) {
      this.utilityService.fireSnackBar('Please select a NMFC.');
      return false;
    }
    if (this.productsFormGroup.get('handlingUnit').value == '' || this.productsFormGroup.get('handlingUnit').value == null) {
      this.utilityService.fireSnackBar('Please select a handling unit.');
      return false;
    }
    if (this.productsFormGroup.get('classType').value == '' || this.productsFormGroup.get('classType').value == null) {
      this.utilityService.fireSnackBar('Please select a class.');
      return false;
    }
    if (this.productsFormGroup.get('huCount').value == '' || this.productsFormGroup.get('huCount').value == null) {
      this.utilityService.fireSnackBar('Please enter HU count.');
      return false;
    }
    return true;
  }


  setOrderInvoices() {
    if (this.orderObj.invoices.length > 0) {
      this.invoiceId = this.orderObj.invoices[0].id;
      this.invoiceStatus = this.orderObj.invoices[0].status;
      this.originalQuotationRateSheet = this.orderObj.invoices[0].originalQuotationRateSheet;
      if (this.orderObj.invoices[0].specificCarrierInvoice) {
        this.specificCarrierInvoice = this.orderObj.invoices[0].specificCarrierInvoice;
      }
      if (this.orderObj.invoices[0].originalQuotationMargin) {
        this.originalQuotationMargin = this.orderObj.invoices[0].originalQuotationMargin;
      } else {
        this.originalQuotationMargin[0].amount = +this.orderObj.appliedRate + +this.orderObj.markupValue;
      }
      if (this.orderObj.invoices[0].customerBilling) {
        this.customerBilling = this.orderObj.invoices[0].customerBilling;
      } else {
        if (this.orderObj.invoices[0].specificCarrierInvoice) {
          this.customerBilling = JSON.parse(JSON.stringify(this.orderObj.invoices[0].specificCarrierInvoice));
          this.customerBilling[0].amount = +this.customerBilling[0].amount + +this.orderObj.markupValue;
        } else {
          this.customerBilling = [];
        }
      }

      if (this.orderObj.invoices[0].carrierInvoice != undefined && this.orderObj.invoices[0].carrierInvoice != null) {
        let idx = this.orderObj.invoices[0].carrierInvoice.findIndex(val => val.status == 'Cancel');
        this.orderObj.invoices[0].carrierInvoice.splice(1, idx);
        this.orderObj.invoices[0].carrierInvoice.forEach(invoice => {
          invoice.invoiceNo = this.orderObj.invoices[0].invoiceNo;
          invoice.invoiceDate = this.orderObj.invoices[0].invoiceDate;
        });
      }
    }
  }

  initOriginalQuotationMargin() {
    this.originalQuotationMargin = [
      {
        item: "Freight",
        amount: "",
        currency: "USD"
      }
    ];
  }

  initCustomerBilling() {
    this.customerBilling = [
      {
        item: "Freight",
        amount: "",
        currency: "USD"
      }
    ];
  }

  claculateTotalOriginalQuotaionAmount() {
    this.totalOriginalQuotaionAmount = 0;
    if (this.originalQuotationRateSheet.length > 0) {
      this.originalQuotationRateSheet.forEach(val => {
        this.totalOriginalQuotaionAmount += +val.amount;
      });
      return +this.totalOriginalQuotaionAmount;
    }
  }

  claculateTotalOriginalQuotaionMarginAmount() {
    this.totalOriginalQuotaionMarginAmount = 0;
    if (this.originalQuotationMargin.length > 0) {
      this.originalQuotationMargin.forEach(val => {
        this.totalOriginalQuotaionMarginAmount += +val.amount;
      });
      return +this.totalOriginalQuotaionMarginAmount;
    }
  }

  claculateTotalSpecificCarrierInvoiceAmount() {
    this.totalSpecificCarrierInvoiceAmount = 0;
    if (this.specificCarrierInvoice.length > 0) {
      this.specificCarrierInvoice.forEach(val => {
        this.totalSpecificCarrierInvoiceAmount += +val.amount;
      });
      return +this.totalSpecificCarrierInvoiceAmount;
    }
  }

  claculateTotalCarrierInvoiceAmount() {
    this.totalCarrierInvoiceAmount = 0;
    if (this.carrierInvoice.length > 0) {
      this.carrierInvoice.forEach(val => {
        this.totalCarrierInvoiceAmount += +val.amount;
      });
      return +this.totalCarrierInvoiceAmount;
    }
  }

  claculateTotalCustomerBillingAmount() {
    this.totalCustomerBillingAmount = 0;
    if (this.customerBilling.length > 0) {
      this.customerBilling.forEach(val => {
        this.totalCustomerBillingAmount += +val.amount;
      });
      return +this.totalCustomerBillingAmount;
    }
  }

  addCustomerBilling() {
    this.customerBilling.push({ item: "", amount: "", currency: "" });
  }

  openCarrierInvoice(template: TemplateRef<any>, obj) {
    this.carrierInvoice = obj.carrierInvoice;
    this.carrierInvoiceStatus = obj.status;
    this.openModal(template);
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, this.config);
  }

  setInvoiceStatus(state) {
    let status = state;
    let msg = `Are you sure you want to ${status}?`;

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
        if (status == "Accept") {
          this.specificCarrierInvoice = JSON.parse(JSON.stringify(this.carrierInvoice));
          this.customerBilling = JSON.parse(JSON.stringify(this.specificCarrierInvoice));
          this.customerBilling[0].amount = +this.customerBilling[0].amount + +this.orderObj.markupValue;
          this.invoiceStatus = status;
          this.orderObj.invoices[0].carrierInvoice[this.orderObj.invoices[0].carrierInvoice.length - 1].status = status;
          this.apiService.put("/invoices/" + this.invoiceId, {
            specificCarrierInvoice: this.specificCarrierInvoice,
            customerBilling: this.customerBilling,
            carrierInvoice: this.orderObj.invoices[0].carrierInvoice,
            status: status
          }).subscribe((response: any) => {
            this.utilityService.fireSnackBar(`Carrier Invoice ${status} successfully.`);
            this.modalRef.hide();
          });
        } else {
          this.invoiceStatus = status;
          this.orderObj.invoices[0].carrierInvoice[this.orderObj.invoices[0].carrierInvoice.length - 1].status = status;
          this.apiService.put("/invoices/" + this.invoiceId, {
            carrierInvoice: this.orderObj.invoices[0].carrierInvoice,
            status: status
          }).subscribe((response: any) => {
            this.utilityService.fireSnackBar(`Carrier Invoice ${status} successfully.`);
            this.modalRef.hide();
          });
        }
      }
    });
  }

  createInvoice() {
    this.apiService.put("/invoices/" + this.invoiceId, {
      originalQuotationMargin: this.originalQuotationMargin,
      customerBilling: this.customerBilling
    }).subscribe((response: any) => {
      this.utilityService.fireSnackBar('Invoice updated successfully.');
      this.router.navigate(['/order']);
    });
  }

  cityValueChanged(e) {
    if (e.selectedItem.city) {
      if (e.selectedItem.city.values) {
        delete (e.selectedItem.city.values)
      }
    }

    this.orderFormGroup.patchValue({
      pickupPostalCode: e.selectedItem.postalCode,
      pickupCity: e.selectedItem.city,
      pickupState: e.selectedItem.city.state.id
    });

    this.postalCodeAndCity = {
      city: e.selectedItem.city,
      postalCode: e.selectedItem.postalCode,
      name: `${e.selectedItem.postalCode.name}, ${e.selectedItem.city.name}`
    };
    this.statesList.push(e.selectedItem.city.state);
  }

  cityOnInputEvent(e) {
    this.utilityService.locationSubject.next(e.event.target.value);
  }

  dropOffCityValueChanged(e) {
    if (e.selectedItem) {
      if (e.selectedItem.city) {
        if (e.selectedItem.city.values) {
          delete (e.selectedItem.city.values)
        }
      }

      this.orderFormGroup.patchValue({
        dropoffPostalCode: e.selectedItem.postalCode,
        dropoffCity: e.selectedItem.city,
        dropoffState: e.selectedItem.city.state.id
      });

      this.dropOffPostalCodeAndCity = {
        city: e.selectedItem.city,
        postalCode: e.selectedItem.postalCode,
        name: `${e.selectedItem.postalCode.name}, ${e.selectedItem.city.name}`
      };

      this.dropoffStatesList.push(e.selectedItem.city.state);
    }
  }

  initLocationSubject() {
    this.locationSubject.pipe(debounceTime(1000), distinctUntilChanged(), tap(() => {
      this.spinnerService.show();
    }), switchMap(data => this.apiService.get("/dropdownMapper/search/city/" + data.value).pipe(finalize(() => {
      this.spinnerService.hide();
    }))), share()).subscribe((response: any) => {
      if (this.locationSubject.getValue().hasOwnProperty('type')) {
        let type = this.locationSubject.getValue().type;
        if (type == 'dropOff') {
          this.dropOffCitiesList = [];
        }

        response.forEach(city => {
          if (!city.hasOwnProperty('dropdownMapper')) {
            if (city.values) {
              city.values.forEach(postalCode => {
                this[`${type}CitiesList`].push({ city: city, name: `${postalCode.name}, ${city.name}`, postalCode: postalCode });
              });
            } else {
              this[`${type}CitiesList`].push({ city: city, name: `${city.name}`, postalCode: {} });
            }
          } else {
            this[`${type}CitiesList`].push({ city: city.dropdownMapper, name: `${city.name}, ${city.dropdownMapper.name}`, postalCode: city });
          }
        });
      }
    }, error => {
      this.initLocationSubject();
    });
  }

  initSocketEvents() {
    this.socket.on('searchTradingPartnerByType', response => {
      if (this.tradingPartnerSubject.getValue().hasOwnProperty('type')) {
        if (this.tradingPartnerSubject.getValue().type == 'Customer') {
          this.customersList = [];
          this.customersList = response;
        }
      }

      this.spinnerService.hide();
    });

    this.socket.on('fetchTradingPartnerWithCustomerLocations', response => {
      this.locationsList = response.customerLocations;
      this.productList = response.products;
      this.serviceList = response.customerServices;

      this.serviceList.map((service, index) => {
        if (this.selectedServices.find(val => val.id == service.id)) {
          this.serviceList[index] = this.selectedServices.find(val => val.id == service.id);
        }
      });
    });
  }

  initTradingPartnerSubject() {
    this.tradingPartnerSubject.pipe(debounceTime(500), distinctUntilChanged(), tap(() => {
      this.spinnerService.show();
    }), switchMap((data: any) => {
      this.socket.emit('searchTradingPartnerByType', { type: data.type, query: data.value });

      return [];
    })).subscribe((response: any) => { });
  }

  pickupCityOnInputEvent(e, type) {
    this.locationSubject.next({
      value: e.event.target.value,
      type
    });
  }

  pickupCityValueChanged(e) {
    if (e.selectedItem) {
      if (e.selectedItem.city) {
        if (e.selectedItem.city.values) {
          delete (e.selectedItem.city.values)
        }
      }

      this.orderFormGroup.patchValue({
        pickupPostalCode: e.selectedItem.postalCode,
        pickupCity: e.selectedItem.city,
        pickupState: e.selectedItem.city.state.id != undefined ? e.selectedItem.city.state.id : e.selectedItem.city.state
      });

      if (e.selectedItem.city.state != undefined && e.selectedItem.city.state != null) {
        if (e.selectedItem.city.state.id == undefined) {
          this.apiService.get("/states/" + e.selectedItem.city.state).subscribe((responseState: any) => {
            e.selectedItem.city.state = responseState;
            if (this.pickupStatesList.find(val => val.id == e.selectedItem.city.state.id) == undefined) {
              this.pickupStatesList.push(e.selectedItem.city.state);
            }
          });
        } else {
          if (this.pickupStatesList.find(val => val.id == e.selectedItem.city.state.id) == undefined) {
            this.pickupStatesList.push(e.selectedItem.city.state);
          }
        }
      }
    }
  }

  dropoffCityOnInputEvent(e, type) {
    this.locationSubject.next({
      value: e.event.target.value,
      type
    });
  }

  dropoffCityValueChanged(e) {
    if (e.selectedItem) {
      if (e.selectedItem.city) {
        if (e.selectedItem.city.values) {
          delete (e.selectedItem.city.values)
        }
      }

      this.orderFormGroup.patchValue({
        dropoffPostalCode: e.selectedItem.postalCode,
        dropoffCity: e.selectedItem.city,
        dropoffState: e.selectedItem.city.state.id != undefined ? e.selectedItem.city.state.id : e.selectedItem.city.state
      });

      if (e.selectedItem.city.state != undefined && e.selectedItem.city.state != null) {
        if (e.selectedItem.city.state.id == undefined) {
          this.apiService.get("/states/" + e.selectedItem.city.state).subscribe((responseState: any) => {
            e.selectedItem.city.state = responseState;
            if (this.dropoffStatesList.find(val => val.id == e.selectedItem.city.state.id) == undefined) {
              this.dropoffStatesList.push(e.selectedItem.city.state);
            }
          });
        } else {
          if (this.dropoffStatesList.find(val => val.id == e.selectedItem.city.state.id) == undefined) {
            this.dropoffStatesList.push(e.selectedItem.city.state);
          }
        }
      }
    }
  }


}
