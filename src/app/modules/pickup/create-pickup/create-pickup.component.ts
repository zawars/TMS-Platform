import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Form, FormControl } from '@angular/forms';
import { UtilityService } from 'src/app/services/utility.service';
import { ApiService } from 'src/app/services/api.service';
import { Router, ActivatedRoute } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap';
import swal from 'sweetalert2';
import { I18nPipe } from 'src/app/shared/i18n/i18n.pipe';
import { debounceTime, distinctUntilChanged, switchMap, finalize, share, tap } from "rxjs/operators";
import { AuthService } from 'src/app/services/auth.service';
import { BehaviorSubject } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { Socket } from 'ngx-socket-io';
import { SocketService } from 'src/app/services/socket.service';
import { DxSelectBoxComponent } from 'devextreme-angular';
declare var $: any;

@Component({
  selector: 'app-create-pickup',
  templateUrl: './create-pickup.component.html',
  styleUrls: ['./create-pickup.component.scss']
})
export class CreatePickupComponent implements OnInit {
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
  pickupCityPostalCodes: any = [];
  dropoffCityPostalCodes: any = [];
  isPlaced: boolean = false;
  quoteId;
  countryList: any = [];
  showProductBox: boolean = false;
  productsFormGroup: FormGroup;
  hazClassList: any = [];
  packingGroupList: any = [];
  locationSubject = new BehaviorSubject<any>({});
  pickupCityPostalCodeValue;
  pickupCitiesList: any = [];
  pickupStatesList: any = [];
  pickupCountryList: any = [];
  dropoffCityPostalCodeValue;
  dropoffCitiesList: any = [];
  dropoffStatesList: any = [];
  dropoffCountryList: any = [];
  payersList: any = [];
  payerCityPostalCodeValue;
  payerCitiesList: any = [];
  payerStatesList: any = [];
  tempResponseObj;
  saveFlag: boolean = false;

  constructor(private utilityService: UtilityService, private fb: FormBuilder, private apiService: ApiService,
    private router: Router, private route: ActivatedRoute, private localize: I18nPipe,
    private authService: AuthService, private spinnerService: NgxSpinnerService, private socket: SocketService) {
    this.BASE_PATH = this.apiService.IMAGE_PATH;

    this.initLocationSubject();
    this.initOrderFormGroup();
    this.initProductFormGroup();
    this.utilityService.initializeDropdowns(this.route);
    this.fetchProducts();

    let sub = this.route.params.subscribe(params => {
      if (params.quoteId != undefined) {
        this.getCustomerInfo();
        this.utilityService.breadcrumb = 'Schedule Pickup';
        this.quoteId = params.quoteId;
        this.isSelect = true;
        this.getQuote();
      } else if (params.orderId != undefined) {
        this.getCustomerInfo();
        this.orderId = params.orderId;
        this.utilityService.breadcrumb = 'Schedule Pickup';
        this.isEdit = true;
        this.isSelect = true;
        this.getOrder();
      } else {
        this.utilityService.breadcrumb = 'Schedule Pickup';
        this.resetOrder();
      }
    });

    this.initSocketEvents();
  }

  ngOnInit() {
    this.countryList = this.utilityService.dropdowns['countryValues'].values;
    this.dropoffCountryList = this.utilityService.dropdowns['countryValues'].values;
    this.statesList = this.utilityService.dropdowns['stateValues'].values;
    this.handlingUnitList = this.utilityService.dropdowns['handlingUnitValues'].values;
    this.lengthUnitList = this.utilityService.dropdowns['lengthUnitValues'].values;
    this.weightUnitList = this.utilityService.dropdowns['weightUnitValues'].values;
    this.cubeUnitList = this.utilityService.dropdowns['cubeUnitValues'].values;
    this.classList = this.utilityService.dropdowns['classValues'].values;
    this.hazClassList = this.utilityService.dropdowns['hazClassValues'].values;
    this.packingGroupList = this.utilityService.dropdowns['packingGroupValues'].values;
  }

  initSocketEvents() {
    this.socket.on('fetchTradingPartner', response => {
      this.locationsList = response.thirdPartyLocations;
      let accessorials = response.thirdPartyServices;
      this.payersList = response.thirdPartyBillTo;
      accessorials.forEach(element => {
        this.serviceList.push({ id: element.id, name: element.name, value: false });
      });

      // ###################################################################################

      this.orderFormGroup.patchValue({
        ...this.tempResponseObj,
        billTo: this.tempResponseObj.billTo != undefined ? this.tempResponseObj.billTo.id : undefined,
        pickupState: this.tempResponseObj.pickupState != undefined ? this.tempResponseObj.pickupState.id : undefined,
        dropoffState: this.tempResponseObj.dropoffState != undefined ? this.tempResponseObj.dropoffState.id : undefined,
        pickupLocation: this.tempResponseObj.pickupLocation != undefined ? this.tempResponseObj.pickupLocation.id : undefined,
        dropoffLocation: this.tempResponseObj.dropoffLocation != undefined ? this.tempResponseObj.dropoffLocation.id : undefined,
        pickupCountry: this.tempResponseObj.pickupCountry != undefined ? this.tempResponseObj.pickupCountry.id : undefined,
        dropoffCountry: this.tempResponseObj.dropoffCountry != undefined ? this.tempResponseObj.dropoffCountry.id : undefined,
        payerCountry: this.tempResponseObj.payerCountry != undefined ? this.tempResponseObj.payerCountry.id : undefined,
      });

      this.dropoffCountryList = [this.tempResponseObj.dropoffCountry];
      this.pickupCountryList = [this.tempResponseObj.pickupCountry];

      this.pickupCityPostalCodeValue = {
        city: this.tempResponseObj.pickupCity,
        postalCode: this.tempResponseObj.pickupPostalCode,
        name: `${this.tempResponseObj.pickupPostalCode.name}, ${this.tempResponseObj.pickupCity.name}`
      };
      this.pickupCitiesList.push(this.pickupCityPostalCodeValue);

      this.dropoffCityPostalCodeValue = {
        city: this.tempResponseObj.dropoffCity,
        postalCode: this.tempResponseObj.dropoffPostalCode,
        name: `${this.tempResponseObj.dropoffPostalCode.name}, ${this.tempResponseObj.dropoffCity.name}`
      };
      this.dropoffCitiesList.push(this.dropoffCityPostalCodeValue);

      this.payerCityPostalCodeValue = {
        city: this.tempResponseObj.payerCity,
        postalCode: this.tempResponseObj.payerPostalCode,
        name: `${this.tempResponseObj.payerPostalCode != '' ? this.tempResponseObj.payerPostalCode.name : ''}, ${this.tempResponseObj.payerCity != '' ? this.tempResponseObj.payerCity.name : ''}`
      };
      this.payerCitiesList.push(this.payerCityPostalCodeValue);


      this.freightList = this.tempResponseObj.freights;
      this.serviceList.map((service, index) => {
        if (this.tempResponseObj.services.find(val => val.id == service.id)) {
          this.serviceList[index] = this.tempResponseObj.services.find(val => val.id == service.id);
        }
      });

      if (this.tempResponseObj.rate) {
        this.rateList.push(this.tempResponseObj.rate);
      }
      if (this.rateList.length > 0) {
        this.rateList[0].vendor = response;
        this.rateList[0].weight = this.getTotalFreightWeight();
        this.rateList[0].pieces = this.getTotalFreightPieces();
        this.rateList[0].appliedRate = this.tempResponseObj.appliedRate;
        this.rateList[0].markupValue = this.tempResponseObj.markupValue;
      }

      this.tempResponseObj = undefined;
      this.loadingVisible = false;
    });
  }

  resetOrder() {
    this.serviceList = [];
    this.getCustomerInfo();
    this.initOrderFormGroup();
    this.initProductFormGroup();
    this.freightList = [];
    this.rateList = [];
    this.isEdit = false;
    this.isSelect = false;
    this.isPlaced = false;
    this.addFreight();
  }

  getCustomerInfo() {
    // this.apiService.get("/orders/" + this.route.snapshot.params.orderId).subscribe((response: any) => {
    // // this.productList = response.products;
    // this.locationsList = response.thirdPartyLocations;
    // let accessorials = response.thirdPartyServices;
    // this.payersList = response.thirdPartyBillTo;
    // accessorials.forEach(element => {
    //   this.serviceList.push({ id: element.id, name: element.name, value: false });
    // });


    // });

  }

  fetchProducts() {
    this.apiService.get(`/products`).subscribe(response => {
      this.productList = response;
    });
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
      pickupState: [''],
      pickupCountry: [''],
      pickupEmail: [''],
      pickupPostalCode: [''],
      pickupHours: [''],
      pickupMinutes: [''],
      pickUpReadyTime: [''],
      pickUpCloseTime: [''],
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
      dropoffReadyTime: [''],
      dropoffCloseTime: [''],
      billTo: [undefined],
      payerCompanyName: [''],
      payerAddress: [''],
      payerCity: [''],
      payerPostalCode: [''],
      payerState: [undefined],
      payerCountry: [undefined],
      payerContactName: [''],
      payerContactNumber: ['']
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

  getQuote() {
    this.apiService.get("/quotes/" + this.quoteId).subscribe((responseQuote: any) => {
      this.apiService.get("/tradingPartners/" + responseQuote.tradingPartner.id).subscribe((responseVendor: any) => {
        this.orderFormGroup.controls['pickUpDate'].setValue(responseQuote.pickUpDate);
        this.orderFormGroup.controls['pickupCity'].setValue(responseQuote.pickUpFromCity.city);
        this.orderFormGroup.controls['pickupPostalCode'].setValue(responseQuote.pickUpFromCity.postalCode);
        this.orderFormGroup.controls['dropoffCity'].setValue(responseQuote.deliverToCity.city);
        this.orderFormGroup.controls['dropoffPostalCode'].setValue(responseQuote.deliverToCity.postalCode);
        this.orderFormGroup.controls['pickupCountry'].setValue(responseQuote.pickUpFromCountry.name);
        this.orderFormGroup.controls['dropoffCountry'].setValue(responseQuote.deliverToCountry.name);

        this.freightList = responseQuote.freights;
        this.freightList.forEach((freight) => {
          delete (freight.quote);
        });
        this.serviceList = responseQuote.services;
        this.rateList.push(responseQuote.rate);
        this.rateList[0].vendor = responseVendor;
        this.rateList[0].weight = this.getTotalFreightWeight();
        this.rateList[0].pieces = this.getTotalFreightPieces();
        this.rateList[0].appliedRate = responseQuote.appliedRate;
        this.rateList[0].markupValue = responseQuote.markupValue;
      });
    });
  }

  getOrder() {
    this.loadingVisible = true;
    this.apiService.get("/orders/" + this.orderId).subscribe((responseOrder: any) => {
      this.isPlaced = responseOrder.isPlaced;
      this.tempResponseObj = responseOrder;

      this.socket.emit('fetchTradingPartner', { id: responseOrder.tradingPartner });

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
      let location = this.locationsList.find(val => val.id == locId);
      if (location != undefined) {
        this.orderFormGroup.controls['pickupCity'].setValue(location.city);
        this.orderFormGroup.controls['pickupPostalCode'].setValue(location.postalCode);
        this.orderFormGroup.controls['pickupState'].setValue(location.state.id);
        this.orderFormGroup.controls['pickupAddress'].setValue(location.street);
        this.orderFormGroup.controls['pickupCountry'].setValue(location.country.id);

        this.pickupCityPostalCodeValue = {
          city: location.city,
          postalCode: location.postalCode,
          name: `${location.postalCode.name}, ${location.city.name}`
        };
        this.pickupCitiesList.push(this.pickupCityPostalCodeValue);
      }
    }
  }

  dropoffLocationChange(e) {
    if (e.value) {
      let locId = e.value.id != undefined ? e.value.id : e.value
      let location = this.locationsList.find(val => val.id == locId);
      if (location != undefined) {
        this.orderFormGroup.controls['dropoffCity'].setValue(location.city);
        this.orderFormGroup.controls['dropoffPostalCode'].setValue(location.postalCode);
        this.orderFormGroup.controls['dropoffState'].setValue(location.state.id);
        this.orderFormGroup.controls['dropoffAddress'].setValue(location.street);
        this.orderFormGroup.controls['dropoffCountry'].setValue(location.country.id);

        this.dropoffCityPostalCodeValue = {
          city: location.city,
          postalCode: location.postalCode,
          name: `${location.postalCode.name}, ${location.city.name}`
        };
        this.dropoffCitiesList.push(this.dropoffCityPostalCodeValue);
      }
    }
  }

  payerValueChange(e) {
    if (e.selectedItem != undefined) {
      this.apiService.get(`/tradingPartners/${e.selectedItem.id}`).subscribe(response => {
        let obj: any = response;

        this.orderFormGroup.patchValue({
          billTo: obj.id,
          payerCompanyName: obj.name,
          payerAddress: obj.street,
          payerState: obj.state.id,
          payerPostalCode: obj.postalCode.id,
          payerCountry: obj.country.id,
          payerContactName: obj.contactName,
          payerContactNumber: obj.contactNumber
        });

        this.payerCityPostalCodeValue = {
          city: obj.city,
          postalCode: obj.postalCode,
          name: `${obj.postalCode != '' ? obj.postalCode.name : ''}, ${obj.city != '' ? obj.city.name : ''}`
        };

        this.payerCitiesList = [this.payerCityPostalCodeValue];
        this.payerStatesList = [obj.state];
        this.countryList = [obj.country];
      });
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
      hazmatUN: '',
      hazClass: '',
      packingGroup: '',
      contactPhone: ''
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
    if (this.orderFormGroup.get('pickupCountry').value == "" || this.orderFormGroup.get('pickupCountry').value == null) {
      this.utilityService.fireSnackBar('Please select a pickup country.');
      return false;
    }
    if (this.orderFormGroup.get('dropoffCity').value == "" || this.orderFormGroup.get('dropoffCity').value == null) {
      this.utilityService.fireSnackBar('Please select a dropoff city .');
      return false;
    }
    if (this.orderFormGroup.get('dropoffCountry').value == "" || this.orderFormGroup.get('dropoffCountry').value == null) {
      this.utilityService.fireSnackBar('Please select a dropoff country .');
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
        originCity: this.orderFormGroup.get('pickupCity').value.name,
        originPostalCode: this.orderFormGroup.get('pickupPostalCode').value.name,
        originCountry: this.countryList.find(val => val.id == this.orderFormGroup.get('pickupCountry').value).name,
        destinationCity: this.orderFormGroup.get('dropoffCity').value.name,
        destinationPostalCode: this.orderFormGroup.get('dropoffPostalCode').value.name,
        destinationCountry: this.countryList.find(val => val.id == this.orderFormGroup.get('dropoffCountry').value).name,
        weight: this.getTotalFreightWeight(),
        clientId: this.authService.userObj.tradingPartner
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
      freight.hazClass = freight.hazClass != '' ? freight.hazClass : undefined;
      freight.packingGroup = freight.packingGroup != '' ? freight.packingGroup : undefined;
    });
  }

  saveOrder() {
    if (this.checkRateValidation('save')) {
      this.saveFlag = true;
      this.orderFormGroup.controls.orderNumber.enable();
      this.orderFormGroup.controls.status.enable();
      this.orderFormGroup.controls.bolNumber.enable();
      this.setFreightsValues();
      let obj = this.orderFormGroup.getRawValue();

      let orderObj = {
        ...obj,
        pickupState: obj.pickupState != '' ? obj.pickupState : undefined,
        dropoffState: obj.dropoffState != '' ? obj.dropoffState : undefined,
        pickupCountry: obj.pickupCountry != '' ? obj.pickupCountry : undefined,
        dropoffCountry: obj.dropoffCountry != '' ? obj.dropoffCountry : undefined,
        payerState: obj.payerState != '' ? obj.payerState : undefined,
        payerCountry: obj.payerCountry != '' ? obj.payerCountry : undefined,
        pickupLocation: obj.pickupLocation != '' ? obj.pickupLocation : undefined,
        dropoffLocation: obj.dropoffLocation != '' ? obj.dropoffLocation : undefined,
        // rate: this.rateList.length > 0 ? this.rateList[0].id : undefined,
        // appliedRate: this.rateList.length > 0 ? this.rateList[0].appliedRate : undefined,
        // markupValue: this.rateList.length > 0 ? this.rateList[0].markupValue : undefined,
        // tradingPartner: this.rateList.length > 0 ? this.rateList[0].vendor.id : undefined,
        services: this.serviceList,
        freights: this.freightList,
        isPlaced: false,
        tradingPartner: this.authService.userObj.tradingPartner ? this.authService.userObj.tradingPartner : undefined,
        accumulatedPieces: this.getTotalFreightPieces(),
        accumulatedWeight: this.getTotalFreightWeight(),
        orderType: 'Pickup'
      }
      this.apiService.post("/orders/batch", { orderObj: orderObj }).subscribe((response: any) => {
        this.utilityService.fireSnackBar('Order saved successfully.');
        this.saveFlag = false;
        // this.router.navigate(['/order-2']);
      });
    }
  }

  editOrder() {
    if (this.checkRateValidation('save')) {
      this.spinnerService.show();
      this.setFreightsValues();

      let orderObj = {
        ...this.orderFormGroup.getRawValue(),
        pickupState: this.orderFormGroup.get('pickupState').value != '' ? this.orderFormGroup.get('pickupState').value : undefined,
        dropoffState: this.orderFormGroup.get('dropoffState').value != '' ? this.orderFormGroup.get('dropoffState').value : undefined,
        pickupCountry: this.orderFormGroup.get('pickupCountry').value != '' ? this.orderFormGroup.get('pickupCountry').value : undefined,
        dropoffCountry: this.orderFormGroup.get('dropoffCountry').value != '' ? this.orderFormGroup.get('dropoffCountry').value : undefined,
        payerState: this.orderFormGroup.get('payerState').value != '' ? this.orderFormGroup.get('payerState').value : undefined,
        payerCountry: this.orderFormGroup.get('payerCountry').value != '' ? this.orderFormGroup.get('payerCountry').value : undefined,
        pickupLocation: this.orderFormGroup.get('pickupLocation').value != '' ? this.orderFormGroup.get('pickupLocation').value : undefined,
        dropoffLocation: this.orderFormGroup.get('dropoffLocation').value != '' ? this.orderFormGroup.get('dropoffLocation').value : undefined,
        // rate: this.rateList.length > 0 ? this.rateList[0].id : undefined,
        // appliedRate: this.rateList.length > 0 ? this.rateList[0].appliedRate : undefined,
        // markupValue: this.rateList.length > 0 ? this.rateList[0].markupValue : undefined,
        // tradingPartner: this.rateList.length > 0 ? this.rateList[0].vendor.id : undefined,
        services: this.serviceList,
        freights: this.freightList,
        isPlaced: false,
        tradingPartner: this.authService.userObj.tradingPartner ? this.authService.userObj.tradingPartner : undefined,
        accumulatedPieces: this.getTotalFreightPieces(),
        accumulatedWeight: this.getTotalFreightWeight(),
      }
      this.apiService.patch("/orders/batch/" + this.orderId, { orderObj: orderObj }).subscribe((response: any) => {
        this.spinnerService.hide();
        this.utilityService.fireSnackBar('Order updated successfully.');
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
          ...this.orderFormGroup.getRawValue(),
          status: 'Placed',
          pickupState: this.orderFormGroup.get('pickupState').value != '' ? this.orderFormGroup.get('pickupState').value : undefined,
          dropoffState: this.orderFormGroup.get('dropoffState').value != '' ? this.orderFormGroup.get('dropoffState').value : undefined,
          pickupCountry: this.orderFormGroup.get('pickupCountry').value != '' ? this.orderFormGroup.get('pickupCountry').value : undefined,
          dropoffCountry: this.orderFormGroup.get('dropoffCountry').value != '' ? this.orderFormGroup.get('dropoffCountry').value : undefined,
          payerState: this.orderFormGroup.get('payerState').value != '' ? this.orderFormGroup.get('payerState').value : undefined,
          payerCountry: this.orderFormGroup.get('payerCountry').value != '' ? this.orderFormGroup.get('payerCountry').value : undefined,
          pickupLocation: this.orderFormGroup.get('pickupLocation').value != '' ? this.orderFormGroup.get('pickupLocation').value : undefined,
          dropoffLocation: this.orderFormGroup.get('dropoffLocation').value != '' ? this.orderFormGroup.get('dropoffLocation').value : undefined,
          // rate: this.rateList[0].id,
          // appliedRate: this.rateList[0].appliedRate,
          // markupValue: this.rateList[0].markupValue,
          // vendor: this.rateList[0].vendor.id,
          services: this.serviceList,
          freights: this.freightList,
          isPlaced: true,
          tradingPartner: this.authService.userObj.tradingPartner ? this.authService.userObj.tradingPartner : undefined,
          accumulatedPieces: this.getTotalFreightPieces(),
          accumulatedWeight: this.getTotalFreightWeight(),
          orderType: 'Pickup'
        };

        this.apiService.post("/orders/batch", { orderObj: orderObj }).subscribe((responseOrder: any) => {
          this.apiService.post('/user/sendmail', {
            email: this.rateList[0].vendor.contactEmail,
            subject: "Order Placed",
            message: `Order has been assigned to you. <br>
            <a href="${this.apiService.FrontEndPATH}/view/bol/${responseOrder.id}" target="_blank">${'BOL Number : ' + responseOrder.bolNumber}</a>`
          }).subscribe(msg => {
            this.utilityService.fireSnackBar('Order placed successfully.');
            this.router.navigate(['/order-2', { isPlaced: true }]);
          });
        });
      } else {
        let orderObj = {
          ...this.orderFormGroup.value,
          status: 'Placed',
          pickupState: this.orderFormGroup.get('pickupState').value != '' ? this.orderFormGroup.get('pickupState').value : undefined,
          dropoffState: this.orderFormGroup.get('dropoffState').value != '' ? this.orderFormGroup.get('dropoffState').value : undefined,
          pickupCountry: this.orderFormGroup.get('pickupCountry').value != '' ? this.orderFormGroup.get('pickupCountry').value : undefined,
          dropoffCountry: this.orderFormGroup.get('dropoffCountry').value != '' ? this.orderFormGroup.get('dropoffCountry').value : undefined,
          payerState: this.orderFormGroup.get('payerState').value != '' ? this.orderFormGroup.get('payerState').value : undefined,
          payerCountry: this.orderFormGroup.get('payerCountry').value != '' ? this.orderFormGroup.get('payerCountry').value : undefined,
          pickupLocation: this.orderFormGroup.get('pickupLocation').value != '' ? this.orderFormGroup.get('pickupLocation').value : undefined,
          dropoffLocation: this.orderFormGroup.get('dropoffLocation').value != '' ? this.orderFormGroup.get('dropoffLocation').value : undefined,
          // rate: this.rateList.length > 0 ? this.rateList[0].id : undefined,
          // appliedRate: this.rateList.length > 0 ? this.rateList[0].appliedRate : undefined,
          // markupValue: this.rateList.length > 0 ? this.rateList[0].markupValue : undefined,
          // tradingPartner: this.rateList[0].vendor.id,
          services: this.serviceList,
          freights: this.freightList,
          isPlaced: true,
          tradingPartner: this.authService.userObj.tradingPartner ? this.authService.userObj.tradingPartner : undefined,
          accumulatedPieces: this.getTotalFreightPieces(),
          accumulatedWeight: this.getTotalFreightWeight(),
          orderType: 'Pickup'
        };

        this.apiService.patch("/orders/batch/" + this.orderId, { orderObj: orderObj }).subscribe((responseOrder: any) => {
          this.apiService.post('/user/sendmail', {
            email: this.rateList[0].vendor.contactEmail,
            subject: "Order Placed",
            message: `Order has been assigned to you. <br>
            <a href="${this.apiService.FrontEndPATH}view/bol/${this.orderId}" target="_blank">${'BOL Number : ' + responseOrder[0].bolNumber}</a>`
          }).subscribe(msg => {
            this.utilityService.fireSnackBar('Order placed successfully.');
            this.router.navigate(['/order-2', { isPlaced: true }]);
          });
        });
      }
    }
  }

  // Products Code
  openProductBox() {
    this.resetProductForm();
    this.showProductBox = true;
  }

  hideProductBox() {
    this.resetProductForm();
    this.showProductBox = false;
  }

  resetProductForm() {
    this.productsFormGroup.reset();
  }

  addProduct() {
    if (this.checkProductFormValidation()) {
      this.apiService.post('/products', {
        ...this.productsFormGroup.value,
        tradingPartner: this.authService.userObj.tradingPartner
      }).subscribe((responseProduct: any) => {
        responseProduct.handlingUnit = responseProduct.handlingUnit.id;
        responseProduct.classType = responseProduct.classType.id;
        this.productList.push(responseProduct);
        this.utilityService.fireSnackBar('Product add successfully.');
        this.hideProductBox();
      });
    }
  }

  checkProductFormValidation() {
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

  payerCityOnInputEvent(e, type) {
    this.locationSubject.next({
      value: e.event.target.value,
      type
    });
  }

  payerCityValueChanged(e) {
    if (e.selectedItem) {
      if (e.selectedItem.city) {
        if (e.selectedItem.city.values) {
          delete (e.selectedItem.city.values)
        }
      }

      if (e.selectedItem.city != '' && e.selectedItem.city != null && e.selectedItem.city != undefined) {
        this.orderFormGroup.patchValue({
          payerPostalCode: e.selectedItem.postalCode,
          payerCity: e.selectedItem.city,
          payerState: e.selectedItem.city.state.id != undefined ? e.selectedItem.city.state.id : e.selectedItem.city.state
        });

        if (e.selectedItem.city.state != undefined && e.selectedItem.city.state != null) {
          if (e.selectedItem.city.state.id == undefined) {
            this.apiService.get("/states/" + e.selectedItem.city.state).subscribe((responseState: any) => {
              e.selectedItem.city.state = responseState;
              if (this.payerStatesList.find(val => val.id == e.selectedItem.city.state.id) == undefined) {
                this.payerStatesList.push(e.selectedItem.city.state);
              }
            });
          } else {
            if (this.payerStatesList.find(val => val.id == e.selectedItem.city.state.id) == undefined) {
              this.payerStatesList.push(e.selectedItem.city.state);
            }
          }
        }
      }
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
        if (type == 'pickup') {
          this.pickupCitiesList = [];
        } else if (type == 'dropoff') {
          this.dropoffCitiesList = [];
        } else if (type == 'payer') {
          this.payerCitiesList = [];
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
}
