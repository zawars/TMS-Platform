import { Component, OnInit, TemplateRef } from '@angular/core';
import { UtilityService } from 'src/app/services/utility.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap';
import { debounceTime, distinctUntilChanged, tap, switchMap, share, finalize } from 'rxjs/operators';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subject, BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-create-customer',
  templateUrl: './create-customer.component.html',
  styleUrls: ['./create-customer.component.scss']
})
export class CreateCustomerComponent implements OnInit {
  formGroup: FormGroup;
  locationsFormGroup: FormGroup;
  productsFormGroup: FormGroup;
  isBlocked = false;
  customerTypeList;
  stateList;
  billingStateList;
  addLocationStateList;
  countryList;
  freightTermsList;
  statusList;
  currencyList;
  servicesList;
  handlingUnitList;
  classList;
  logo;
  partnerId;
  isEdit: boolean = false;
  isEditLocation: boolean = false;
  isEditProduct: boolean = false;
  modalRef;
  config = {
    animated: true,
    keyboard: true,
    backdrop: true,
    ignoreBackdropClick: true
  };
  locationsList: Array<any> = new Array();
  productsList: Array<any> = new Array();
  locationTypeList;
  editLocationId = '';
  locationIndex;
  editProductId;
  productIndex;
  logoSrc: any = "assets/img/logo-placeholder.png";
  postalCodeAndCity: any = {};
  billingPostalCodeAndCity: any = {};
  addLocationPostalCodeAndCity: any = {};
  billingCitiesList = [];
  addLocationCitiesList = [];
  locationSubject = new BehaviorSubject<any>({});

  constructor(public utilityService: UtilityService, private fb: FormBuilder, private apiService: ApiService,
    private router: Router, private route: ActivatedRoute, private modalService: BsModalService, private spinnerService: NgxSpinnerService) {
    this.utilityService.breadcrumb = 'Create Trading Partner';
    this.initLocationSubject();
  }

  ngOnInit() {
    this.formGroup = this.fb.group({
      uid: [{ value: '', disabled: true }],
      partnerType: [''],
      number: [''],
      name: [''],
      logo: [''],
      street: [''],
      postalCode: [''],
      city: [''],
      state: [''],
      country: [''],
      contactName: [''],
      contactEmail: [''],
      contactNumber: [''],
      freightTerms: [''],
      status: [''],
      sameAsAbove: [''],
      billingName: [''],
      billingStreet: [''],
      billingCity: [''],
      billingZipCode: [''],
      billingState: [''],
      billingCountry: [''],
      billingContactName: [''],
      billingContactEmail: [''],
      paymentTerms: [''],
      creditLimit: [''],
      currency: [''],
      services: [''],
      confirmationEmail: [''],
    });

    this.locationsFormGroup = this.fb.group({
      name: [''],
      type: [''],
      street: [''],
      city: [''],
      postalCode: [''],
      state: [''],
      country: [''],
    });

    this.productsFormGroup = this.fb.group({
      name: [''],
      nmfc: [''],
      handlingUnit: [''],
      classType: [''],
      huCount: [''],
    });

    this.utilityService.initializeDropdowns(this.route);

    this.customerTypeList = this.utilityService.dropdowns['vendorTypeValues'].values;
    this.stateList = this.utilityService.dropdowns['stateValues'].values;
    this.billingStateList = this.utilityService.dropdowns['stateValues'].values;
    this.addLocationStateList = this.utilityService.dropdowns['stateValues'].values;
    this.countryList = this.utilityService.dropdowns['countryValues'].values;
    this.freightTermsList = this.utilityService.dropdowns['freightTermsValues'].values;
    this.statusList = this.utilityService.dropdowns['vendorStatusValues'].values;
    this.currencyList = this.utilityService.dropdowns['currencyValues'].values;
    this.servicesList = this.utilityService.dropdowns['vendorServicesValues'].values;
    this.locationTypeList = this.utilityService.dropdowns['locationTypeValues'].values;
    this.handlingUnitList = this.utilityService.dropdowns['handlingUnitValues'].values;
    this.classList = this.utilityService.dropdowns['classValues'].values;

    let sub = this.route.params.subscribe(params => {
      if (params.partnerId != undefined) {
        this.utilityService.breadcrumb = 'Edit Trading Partner';
        this.partnerId = params.partnerId;
        this.isEdit = true;
        this.fetchTradingPartner();
      }
    });
  }

  fetchTradingPartner() {
    this.apiService.get('/tradingPartners/' + this.partnerId).subscribe((response: any) => {
      this.logo = response.logo;
      delete (response.logo);
      this.locationsList = response.locations;
      this.productsList = response.products;

      this.productsList.map(product => {
        product.handlingUnit = this.handlingUnitList.find(val => val.id == product.handlingUnit);
        product.classType = this.classList.find(val => val.id == product.classType);
      });

      this.logoSrc = this.apiService.BASE_PATH.replace('api/v1', '') + this.logo.fileName;

      this.formGroup.patchValue({
        ...response,
        partnerType: response.partnerType.id,
        state: response.state != undefined ? response.state.id : '',
        country: response.country != undefined ? response.country.id : '',
        freightTerms: response.freightTerms != undefined ? response.freightTerms.id : '',
        status: response.status != undefined ? response.status.id : '',
        billingState: response.billingState != undefined ? response.billingState.id : '',
        billingCountry: response.billingCountry != undefined ? response.billingCountry.id : '',
        currency: response.currency != undefined ? response.currency.id : '',
      });

      this.apiService.get('/dropdownMapper/' + response.city.id).subscribe((responseCity: any) => {
        response.city = responseCity.data;
        this.apiService.get('/dropdownMapper/' + response.billingCity.id).subscribe((responseBillingCity: any) => {
          response.billingCity = responseBillingCity.data;
          this.postalCodeAndCity = {
            city: response.city,
            postalCode: response.postalCode,
            name: `${response.postalCode.name}, ${response.city.name}`
          };
          this.billingPostalCodeAndCity = {
            city: response.billingCity,
            postalCode: response.billingZipCode,
            name: `${response.billingZipCode.name}, ${response.billingCity.name}`
          };

          this.billingCitiesList.push(this.billingPostalCodeAndCity);
          this.utilityService.citiesList = [];
          this.utilityService.citiesList.push(this.postalCodeAndCity);
        });
      });
    });
  }

  create() {
    if (this.checkFormValidations('create')) {
      this.isBlocked = true;
      let attachment = new FormData();
      attachment.append('attachment', this.logo);

      this.apiService.post('/attachments', attachment).subscribe((attachmentResponse: any) => {
        let obj = this.formGroup.value;
        obj.logo = attachmentResponse.id;
        obj.type = "Customer";
        obj.locations = this.locationsList;
        obj.products = this.productsList;

        this.apiService.post('/tradingPartners', obj).subscribe(response => {
          this.utilityService.fireSnackBar('Trading Partner created successfully.');

          this.isBlocked = false;
          this.router.navigate(['/masterData/tradingPartners']);
        }, err => {
          this.isBlocked = false;
        });
      }, err => {
        this.isBlocked = false;
      });
    }
  }

  update() {
    if (this.checkFormValidations('update')) {
      this.isBlocked = true;
      let obj = JSON.parse(JSON.stringify(this.formGroup.value));

      if (this.formGroup.get('logo').value != '') {
        let attachment = new FormData();
        attachment.append('attachment', this.logo);

        this.apiService.post('/attachments', attachment).subscribe((attachmentResponse: any) => {
          obj.logo = attachmentResponse.id;
          obj.locations = this.locationsList;
          obj.products = this.productsList;

          this.apiService.patch('/tradingPartners/' + this.partnerId, obj).subscribe(response => {
            this.utilityService.fireSnackBar('Trading Partner updated successfully.');

            this.isBlocked = false;
          }, err => {
            this.isBlocked = false;
          });
        }, err => {
          this.isBlocked = false;
        });
      } else {
        obj.locations = this.locationsList;
        obj.products = this.productsList;
        delete (obj.logo);
        let services = [];
        obj.services.map(service => {
          if (service.id != undefined) {
            services.push(service.id);
          } else {
            services.push(service);
          }
        });
        obj.services = services;

        this.apiService.patch('/tradingPartners/' + this.partnerId, obj).subscribe(response => {
          this.utilityService.fireSnackBar('Trading Partner updated successfully.');

          this.isBlocked = false;
        }, err => {
          this.isBlocked = false;
        });
      }
    }
  }

  checkFormValidations(event): boolean {
    if (this.formGroup.get('partnerType').value == "") {
      this.utilityService.fireSnackBar('Please select a customer type.');
      return;
    }
    if (this.formGroup.get('number').value == "") {
      this.utilityService.fireSnackBar('Please enter your phone number.');
      return;
    }
    if (this.formGroup.get('name').value == "") {
      this.utilityService.fireSnackBar('Please enter a name.');
      return;
    }
    if (event == 'create') {
      if (this.formGroup.get('logo').value == "") {
        this.utilityService.fireSnackBar('Please select a logo.');
        return;
      }
    }
    if (this.formGroup.get('street').value == "") {
      this.utilityService.fireSnackBar('Please enter street address.');
      return;
    }
    if (this.formGroup.get('postalCode').value == "") {
      this.utilityService.fireSnackBar('Please enter postal code.');
      return;
    }
    if (this.formGroup.get('city').value == "") {
      this.utilityService.fireSnackBar('Please enter your city.');
      return;
    }
    if (this.formGroup.get('state').value == "") {
      this.utilityService.fireSnackBar('Please enter your state.');
      return;
    }
    if (this.formGroup.get('country').value == "") {
      this.utilityService.fireSnackBar('Please enter your country.');
      return;
    }
    if (this.formGroup.get('contactName').value == "") {
      this.utilityService.fireSnackBar('Please enter your contact name.');
      return;
    }
    if (this.formGroup.get('contactEmail').value == "") {
      this.utilityService.fireSnackBar('Please enter your contact email.');
      return;
    }
    if (this.formGroup.get('contactNumber').value == "") {
      this.utilityService.fireSnackBar('Please enter your contact number.');
      return;
    }
    if (this.formGroup.get('freightTerms').value == "") {
      this.utilityService.fireSnackBar('Please enter your freight terms.');
      return;
    }
    if (this.formGroup.get('status').value == "") {
      this.utilityService.fireSnackBar('Please enter your status.');
      return;
    }
    if (this.formGroup.get('billingName').value == "") {
      this.utilityService.fireSnackBar('Please enter your billing name.');
      return;
    }
    if (this.formGroup.get('billingStreet').value == "") {
      this.utilityService.fireSnackBar('Please enter your billing street.');
      return;
    }
    if (this.formGroup.get('billingCity').value == "") {
      this.utilityService.fireSnackBar('Please enter your billing city.');
      return;
    }
    if (this.formGroup.get('billingZipCode').value == "") {
      this.utilityService.fireSnackBar('Please enter your billing zip code.');
      return;
    }
    if (this.formGroup.get('billingState').value == "") {
      this.utilityService.fireSnackBar('Please enter your billing state.');
      return;
    }
    if (this.formGroup.get('billingCountry').value == "") {
      this.utilityService.fireSnackBar('Please enter your billing country.');
      return;
    }
    if (this.formGroup.get('billingContactName').value == "") {
      this.utilityService.fireSnackBar('Please enter your billing contact name.');
      return;
    }
    if (this.formGroup.get('billingContactEmail').value == "") {
      this.utilityService.fireSnackBar('Please enter your billing contact email.');
      return;
    }
    if (this.formGroup.get('paymentTerms').value == "") {
      this.utilityService.fireSnackBar('Please enter your payment terms.');
      return;
    }
    if (this.formGroup.get('creditLimit').value == "" || this.formGroup.get('creditLimit').value == null) {
      this.utilityService.fireSnackBar('Please enter your credit limit.');
      return;
    }
    if (this.formGroup.get('currency').value == "") {
      this.utilityService.fireSnackBar('Please enter your currency.');
      return;
    }
    if (this.formGroup.get('confirmationEmail').value == "") {
      this.utilityService.fireSnackBar('Please enter your confirmation email.');
      return;
    }
    return true;
  }

  async onFileSelected(event) {
    this.logo = event.target.files[0];

    let reader = new FileReader();
    reader.readAsDataURL(this.logo);
    reader.onload = (_event) => {
      this.logoSrc = reader.result;
    }
  }

  sameAsAboveToggle(event) {
    if (event.value == true) {
      this.formGroup.patchValue({
        billingName: this.formGroup.get('name').value,
        billingStreet: this.formGroup.get('street').value,
        billingCity: this.formGroup.get('city').value,
        billingZipCode: this.formGroup.get('postalCode').value,
        billingState: this.formGroup.get('state').value,
        billingCountry: this.formGroup.get('country').value,
        billingContactName: this.formGroup.get('contactName').value,
        billingContactEmail: this.formGroup.get('contactEmail').value,
      });
      if (this.postalCodeAndCity.name != undefined) {
        this.billingCitiesList.push(this.postalCodeAndCity);
        this.billingPostalCodeAndCity = this.postalCodeAndCity;
      }
    } else {
      this.formGroup.patchValue({
        billingName: '',
        billingStreet: '',
        billingCity: '',
        billingZipCode: '',
        billingState: '',
        billingCountry: '',
        billingContactName: '',
        billingContactEmail: '',
      });
      this.billingPostalCodeAndCity = {};
    }
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, this.config);
  }

  // Location Code
  openAddLocationPopup(template: TemplateRef<any>) {
    this.resetLocationForm();
    this.openModal(template);
  }

  resetLocationForm() {
    this.isEditLocation = false;
    this.editLocationId = '';
    this.locationsFormGroup.reset();
  }

  openLocationsEditDialog(template: TemplateRef<any>, locationObj, data) {
    this.locationIndex = data.rowIndex;
    this.editLocationId = locationObj.id != undefined ? locationObj.id : '';
    this.isEditLocation = true;

    if (locationObj.type == undefined) {
      locationObj.type = { id: '' };
    }
    if (locationObj.state == undefined) {
      locationObj.state = { id: '' };
    }
    if (locationObj.country == undefined) {
      locationObj.country = { id: '' };
    }

    this.locationsFormGroup.patchValue({
      ...locationObj,
      type: locationObj.type.id,
      state: locationObj.state.id,
      country: locationObj.country.id
    });

    if (locationObj.city.state.id == undefined) {
      this.apiService.get('/dropdownMapper/' + locationObj.city.id).subscribe((responseLocationCity: any) => {
        locationObj.city = responseLocationCity.data;

        this.addLocationPostalCodeAndCity = {
          city: locationObj.city,
          postalCode: locationObj.postalCode,
          name: `${locationObj.postalCode.name}, ${locationObj.city.name}`
        };
        this.addLocationCitiesList = [];
        this.addLocationCitiesList.push(this.addLocationPostalCodeAndCity);

        this.openModal(template);
      });
    } else {
      this.addLocationPostalCodeAndCity = {
        city: locationObj.city,
        postalCode: locationObj.postalCode,
        name: `${locationObj.postalCode.name}, ${locationObj.city.name}`
      };
      this.addLocationCitiesList = [];
      this.addLocationCitiesList.push(this.addLocationPostalCodeAndCity);

      this.openModal(template);
    }
  }

  addLocation() {
    if (this.checkLocationFormValidation()) {
      let obj = this.locationsFormGroup.value;
      obj.type = this.locationTypeList.find(val => val.id == obj.type);
      obj.state = this.addLocationStateList.find(val => val.id == obj.state);
      obj.country = this.countryList.find(val => val.id == obj.country);
      this.locationsList.push(obj);
      this.modalRef.hide();
      this.resetLocationForm();
    }
  }

  updateLocation() {
    if (this.checkLocationFormValidation()) {
      if (this.editLocationId != '') {
        let obj = this.locationsFormGroup.value;
        obj.city = obj.city.id;
        obj.postalCode = obj.postalCode.id;

        this.apiService.patch('/locations/' + this.editLocationId, obj).subscribe((response: any) => {
          this.locationsList.forEach((val, idx) => {
            if (val.id == response.id) {
              this.locationsList[idx] = response;
            }
          });

          this.modalRef.hide();
          this.resetLocationForm();
        });
      } else {
        // Case: location is not persisted yet.
        let obj = this.locationsFormGroup.value;
        obj.type = this.locationTypeList.find(val => val.id == obj.type);
        obj.state = this.addLocationStateList.find(val => val.id == obj.state);
        obj.country = this.countryList.find(val => val.id == obj.country);
        this.locationsList[this.locationIndex] = obj;
        this.modalRef.hide();
        this.resetLocationForm();
      }
    }
  }

  checkLocationFormValidation() {
    if (this.locationsFormGroup.get('name').value == '' || this.locationsFormGroup.get('name').value == null) {
      this.utilityService.fireSnackBar('Please enter a name.');
      return false;
    }
    if (this.locationsFormGroup.get('type').value == '' || this.locationsFormGroup.get('type').value == null) {
      this.utilityService.fireSnackBar('Please select a location type.');
      return false;
    }
    if (this.locationsFormGroup.get('street').value == '' || this.locationsFormGroup.get('street').value == null) {
      this.utilityService.fireSnackBar('Please enter street name.');
      return false;
    }
    if (this.locationsFormGroup.get('city').value == '' || this.locationsFormGroup.get('city').value == null) {
      this.utilityService.fireSnackBar('Please enter your city.');
      return false;
    }
    if (this.locationsFormGroup.get('postalCode').value == '' || this.locationsFormGroup.get('postalCode').value == null) {
      this.utilityService.fireSnackBar('Please enter your postal code.');
      return false;
    }
    if (this.locationsFormGroup.get('state').value == '' || this.locationsFormGroup.get('state').value == null) {
      this.utilityService.fireSnackBar('Please select a state.');
      return false;
    }
    if (this.locationsFormGroup.get('country').value == '' || this.locationsFormGroup.get('country').value == null) {
      this.utilityService.fireSnackBar('Please select a country.');
      return false;
    }
    return true;
  }

  // Products Code
  openAddProductPopup(template: TemplateRef<any>) {
    this.resetProductForm();
    this.openModal(template);
  }

  resetProductForm() {
    this.isEditProduct = false;
    this.editProductId = '';
    this.productsFormGroup.reset();
  }

  openProductsEditDialog(template: TemplateRef<any>, productObj, data) {
    this.productIndex = data.rowIndex;
    this.editProductId = productObj.id != undefined ? productObj.id : '';
    this.isEditProduct = true;

    if (productObj.handlingUnit == undefined) {
      productObj.handlingUnit = { id: '' };
    }
    if (productObj.classType == undefined) {
      productObj.classType = { id: '' };
    }

    this.productsFormGroup.patchValue({
      ...productObj,
      handlingUnit: productObj.handlingUnit.id,
      classType: productObj.classType.id
    });
    this.openModal(template);
  }

  addProduct() {
    if (this.checkProductFormValidation()) {
      let obj = this.productsFormGroup.value;
      obj.handlingUnit = this.handlingUnitList.find(val => val.id == obj.handlingUnit);
      obj.classType = this.classList.find(val => val.id == obj.classType);
      this.productsList.push(obj);
      this.modalRef.hide();
      this.resetProductForm();
    }
  }

  updateProduct() {
    if (this.checkProductFormValidation()) {
      if (this.editProductId != '') {
        this.apiService.patch('/products/' + this.editProductId, this.productsFormGroup.value).subscribe((response: any) => {
          this.productsList.forEach((val, idx) => {
            if (val.id == response.id) {
              this.productsList[idx] = response;
            }
          });

          this.modalRef.hide();
          this.resetProductForm();
        });
      } else {
        // Case: location is not persisted yet.
        let obj = this.productsFormGroup.value;
        obj.handlingUnit = this.handlingUnitList.find(val => val.id == obj.handlingUnit);
        obj.classType = this.classList.find(val => val.id == obj.classType);
        this.productsList[this.productIndex] = obj;
        this.modalRef.hide();
        this.resetProductForm();
      }
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

  cityOnInputEvent(e) {
    this.utilityService.locationSubject.next(e.event.target.value);
  }

  cityValueChanged(e) {
    if (e.selectedItem.city) {
      if (e.selectedItem.city.values) {
        delete (e.selectedItem.city.values)
      }
    }

    this.formGroup.patchValue({
      postalCode: e.selectedItem.postalCode,
      city: e.selectedItem.city,
      state: e.selectedItem.city.state.id
    });

    this.postalCodeAndCity = {
      city: e.selectedItem.city,
      postalCode: e.selectedItem.postalCode,
      name: `${e.selectedItem.postalCode.name}, ${e.selectedItem.city.name}`
    };

    if (e.selectedItem.city.state != undefined && e.selectedItem.city.state != null) {
      if (e.selectedItem.city.state.id == undefined) {
        this.apiService.get("/states/" + e.selectedItem.city.state).subscribe((responseState: any) => {
          e.selectedItem.city.state = responseState;
          this.stateList.push(e.selectedItem.city.state);
        });
      } else {
        this.stateList.push(e.selectedItem.city.state);
      }
    }
  }

  billingCityValueChanged(e) {
    if (e.selectedItem) {
      if (e.selectedItem.city) {
        if (e.selectedItem.city.values) {
          delete (e.selectedItem.city.values)
        }
      }

      this.formGroup.patchValue({
        billingZipCode: e.selectedItem.postalCode,
        billingCity: e.selectedItem.city,
        billingState: e.selectedItem.city.state.id != undefined ? e.selectedItem.city.state.id : e.selectedItem.city.state
      });

      // this.billingStateList.push(e.selectedItem.city.state);

      if (e.selectedItem.city.state != undefined && e.selectedItem.city.state != null) {
        if (e.selectedItem.city.state.id == undefined) {
          this.apiService.get("/states/" + e.selectedItem.city.state).subscribe((responseState: any) => {
            e.selectedItem.city.state = responseState;
            this.billingStateList.push(e.selectedItem.city.state);
          });
        } else {
          this.billingStateList.push(e.selectedItem.city.state);
        }
      }
    }
  }

  addLocationCityValueChanged(e) {
    if (e.selectedItem) {
      if (e.selectedItem.city) {
        if (e.selectedItem.city.values) {
          delete (e.selectedItem.city.values)
        }
      }

      this.locationsFormGroup.patchValue({
        postalCode: e.selectedItem.postalCode,
        city: e.selectedItem.city,
        state: e.selectedItem.city.state.id != undefined ? e.selectedItem.city.state.id : e.selectedItem.city.state
      });

      // this.addLocationStateList.push(e.selectedItem.city.state);

      if (e.selectedItem.city.state != undefined && e.selectedItem.city.state != null) {
        if (e.selectedItem.city.state.id == undefined) {
          this.apiService.get("/states/" + e.selectedItem.city.state).subscribe((responseState: any) => {
            e.selectedItem.city.state = responseState;
            this.addLocationStateList.push(e.selectedItem.city.state);
          });
        } else {
          this.addLocationStateList.push(e.selectedItem.city.state);
        }
      }
    }
  }

  billingCityOnInputEvent(e, type) {
    this.locationSubject.next({
      value: e.event.target.value,
      type
    });
  }

  initLocationSubject() {
    this.locationSubject.pipe(debounceTime(1000), distinctUntilChanged(), tap(() => {
      this.spinnerService.show();
    }), switchMap(data => this.apiService.get("/dropdownMapper/search/city/" + data.value).pipe(finalize(() => {
      this.spinnerService.hide();
    }))), share()).subscribe((response: any) => {
      if (this.locationSubject.getValue().hasOwnProperty('type')) {
        let type = this.locationSubject.getValue().type;
        if (type == 'billing') {
          this.billingCitiesList = [];
        } else {
          this.addLocationCitiesList = [];
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
