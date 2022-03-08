import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { UtilityService } from 'src/app/services/utility.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { Router, ActivatedRoute } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap';
import { BehaviorSubject, Subject } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { debounceTime, distinctUntilChanged, tap, finalize, switchMap, share } from 'rxjs/operators';
import { DxSelectBoxComponent } from 'devextreme-angular';
import { SocketService } from 'src/app/services/socket.service';

@Component({
  selector: 'app-trading-partners',
  templateUrl: './create-trading-partners.component.html',
  styleUrls: ['./create-trading-partners.component.scss']
})
export class CreateTradingPartnersComponent implements OnInit {
  formGroup: FormGroup;
  customerFormGroup: FormGroup;
  vendorFormGroup: FormGroup;
  thirdPartyFormGroup: FormGroup;
  locationsFormGroup: FormGroup;
  productsFormGroup: FormGroup;
  userFormGroup: FormGroup;
  isBlocked = false;
  vendorTypeList;
  stateList = new Array<any>();
  customerStateList = new Array<any>();
  vendorStateList = new Array<any>();
  thirdPartyStateList = new Array<any>();
  public organisationsList: Array<any> = new Array();
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
  isEditUser: boolean = false;
  isLockedUserForm: boolean = false;
  modalRef;
  config = {
    animated: true,
    keyboard: true,
    backdrop: true,
    ignoreBackdropClick: true
  };
  customerLocationsList: Array<any> = new Array();
  vendorLocationsList: Array<any> = new Array();
  thirdPartyLocationsList: Array<any> = new Array();
  productsList: Array<any> = new Array();
  thirdPartyBillToList: Array<any> = new Array();
  tradingPartnersList: Array<any> = new Array();
  rolesList: Array<any> = new Array();
  usersList: Array<any> = new Array();
  locationTypeList;
  editLocationId = '';
  editProductId = '';
  editUserId = '';
  locationIndex;
  productIndex;
  userIndex;
  // logoSrc: any = "assets/img/logo-placeholder.png";
  logoSrc: any = "assets/img/blank-img.jpg";
  postalCodeAndCity: any = {};
  customerBillingPostalCodeAndCity: any = {};
  vendorBillingPostalCodeAndCity: any = {};
  thirdPartyBillingPostalCodeAndCity: any = {};
  addLocationPostalCodeAndCity: any = {};
  citiesList = [];
  customerBillingCitiesList = [];
  vendorBillingCitiesList = [];
  thirdPartyBillingCitiesList = [];
  addLocationCitiesList = [];
  locationSubject = new BehaviorSubject<any>({});
  tradingPartnerSubject = new Subject<any>();
  organisationSubject: Subject<any> = new Subject();
  selectedTrandingPartner: any = {};
  @ViewChild(DxSelectBoxComponent, { static: false }) organisationElem: DxSelectBoxComponent;
  @ViewChild(DxSelectBoxComponent, { static: false }) postalCode: DxSelectBoxComponent;
  @ViewChild(DxSelectBoxComponent, { static: false }) customerBillingPostalCode: DxSelectBoxComponent;
  @ViewChild(DxSelectBoxComponent, { static: false }) vendorBillingPostalCode: DxSelectBoxComponent;
  @ViewChild(DxSelectBoxComponent, { static: false }) thirdPartyBillingPostalCode: DxSelectBoxComponent;
  @ViewChild(DxSelectBoxComponent, { static: false }) addLocationCustomerPostalCode: DxSelectBoxComponent;
  @ViewChild(DxSelectBoxComponent, { static: false }) addLocationVendorPostalCode: DxSelectBoxComponent;
  @ViewChild(DxSelectBoxComponent, { static: false }) addLocationThirdPartyPostalCode: DxSelectBoxComponent;


  constructor(public utilityService: UtilityService, private fb: FormBuilder, private apiService: ApiService,
    private router: Router, private route: ActivatedRoute, private modalService: BsModalService, private spinnerService: NgxSpinnerService,
    private socket: SocketService) {
    this.utilityService.breadcrumb = 'Create Trading Partner';
    this.initLocationSubject();
    this.initTradingPartnerSubject();
    this.initOrganisationSubject();
    this.initSocketEvents();
  }

  ngOnInit() {
    this.formGroup = this.fb.group({
      uid: [{ value: '', disabled: true }],
      name: [''],
      logo: [''],
      street: [''],
      postalCode: [''],
      city: [''],
      state: [''],
      country: [''],
      organisation: [undefined],
      contactName: [''],
      contactEmail: [''],
      contactNumber: [''],
      status: [''],
      isCustomer: [false],
      isVendor: [false],
      isThirdParty: [false],
    });

    this.customerFormGroup = this.fb.group({
      customerSameAsAbove: [''],
      customerBillingName: [''],
      customerBillingStreet: [''],
      customerBillingCity: [undefined],
      customerBillingPostalCode: [undefined],
      customerBillingState: [undefined],
      customerBillingCountry: [undefined],
      customerBillingContactName: [''],
      customerBillingContactEmail: [''],
      customerPaymentTerms: [''],
      customerFreightTerms: [undefined],
      creditLimit: [0],
      customerCurrency: [undefined],
      customerServices: [[]],
      customerConfirmationEmail: [''],
    });

    this.vendorFormGroup = this.fb.group({
      vendorSameAsAbove: [''],
      vendorBillingName: [''],
      vendorBillingStreet: [''],
      vendorBillingCity: [undefined],
      vendorBillingPostalCode: [undefined],
      vendorBillingState: [undefined],
      vendorBillingCountry: [undefined],
      vendorBillingContactName: [''],
      vendorBillingContactEmail: [''],
      vendorPaymentTerms: [''],
      vendorFreightTerms: [undefined],
      vendorCurrency: [undefined],
      vendorServices: [[]],
      vendorConfirmationEmail: [''],
    });

    this.thirdPartyFormGroup = this.fb.group({
      thirdPartySameAsAbove: [''],
      thirdPartyBillingName: [''],
      thirdPartyBillingStreet: [''],
      thirdPartyBillingCity: [undefined],
      thirdPartyBillingPostalCode: [undefined],
      thirdPartyBillingState: [undefined],
      thirdPartyBillingCountry: [undefined],
      thirdPartyBillingContactName: [''],
      thirdPartyBillingContactEmail: [''],
      thirdPartyPaymentTerms: [''],
      thirdPartyServices: [[]],
      thirdPartyNotificationEmail: [''],
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

    this.userFormGroup = this.fb.group({
      firstName: [''],
      lastName: [''],
      email: [''],
      phone: [''],
      password: [''],
      cpassword: [''],
      roles: [[]],
    });

    this.utilityService.initializeDropdowns(this.route);

    this.vendorTypeList = this.utilityService.dropdowns['vendorTypeValues'].values;
    this.countryList = this.utilityService.dropdowns['countryValues'].values;
    this.freightTermsList = this.utilityService.dropdowns['freightTermsValues'].values;
    this.statusList = this.utilityService.dropdowns['vendorStatusValues'].values;
    this.currencyList = this.utilityService.dropdowns['currencyValues'].values;
    this.servicesList = this.utilityService.dropdowns['vendorServicesValues'].values;
    this.locationTypeList = this.utilityService.dropdowns['locationTypeValues'].values;
    this.handlingUnitList = this.utilityService.dropdowns['handlingUnitValues'].values;
    this.classList = this.utilityService.dropdowns['classValues'].values;
    this.rolesList = ['Customer', 'Vendor', 'Third Party'];

    let sub = this.route.params.subscribe(params => {
      if (params.id != undefined) {
        this.utilityService.breadcrumb = 'Edit Trading Partner';
        this.partnerId = params.id;
        this.isEdit = true;
        this.fetchTradingPartner();
      }
    });
  }

  fetchTradingPartner() {
    this.apiService.get('/tradingPartners/' + this.partnerId).subscribe((response: any) => {
      this.logo = response.logo;
      delete (response.logo);
      this.customerLocationsList = response.customerLocations;
      this.vendorLocationsList = response.vendorLocations;
      this.thirdPartyLocationsList = response.thirdPartyLocations;
      this.usersList = response.users;
      this.productsList = response.products;
      this.thirdPartyBillToList = response.thirdPartyBillTo;

      if (this.logo != undefined) {
        this.logoSrc = this.apiService.BASE_PATH.replace('api/v1', '') + this.logo.fileName;
      }

      this.formGroup.patchValue({
        ...response,
        country: response.country.id,
        organisation: response.organisation != undefined ? response.organisation.id : undefined,
        status: response.status.id,
      });

      this.organisationsList.push(response.organisation);

      this.postalCodeAndCity = {
        city: response.city,
        postalCode: response.postalCode,
        name: `${response.postalCode.name}, ${response.city.name}`
      };
      this.utilityService.citiesList = [];
      this.utilityService.citiesList.push(this.postalCodeAndCity);

      if (response.isCustomer == true) {
        this.customerFormGroup.patchValue({
          ...response,
          customerBillingCountry: response.customerBillingCountry.id,
          customerFreightTerms: response.customerFreightTerms != undefined ? response.customerFreightTerms.id : undefined,
          customerCurrency: response.customerCurrency.id,
        });

        this.customerBillingPostalCodeAndCity = {
          city: response.customerBillingCity,
          postalCode: response.customerBillingPostalCode,
          name: `${response.customerBillingPostalCode.name}, ${response.customerBillingCity.name}`
        };
        this.customerBillingCitiesList = [];
        this.customerBillingCitiesList.push(this.customerBillingPostalCodeAndCity);
      }

      if (response.isVendor == true) {
        this.vendorFormGroup.patchValue({
          ...response,
          vendorBillingCountry: response.vendorBillingCountry.id,
          vendorFreightTerms: response.vendorFreightTerms.id,
          vendorCurrency: response.vendorCurrency.id,
        });

        this.vendorBillingPostalCodeAndCity = {
          city: response.vendorBillingCity,
          postalCode: response.vendorBillingPostalCode,
          name: `${response.vendorBillingPostalCode.name}, ${response.vendorBillingCity.name}`
        };
        this.vendorBillingCitiesList = [];
        this.vendorBillingCitiesList.push(this.vendorBillingPostalCodeAndCity);
      }

      if (response.isThirdParty == true) {
        this.thirdPartyFormGroup.patchValue({
          ...response,
          thirdPartyBillingCountry: response.thirdPartyBillingCountry.id,
        });

        this.thirdPartyBillingPostalCodeAndCity = {
          city: response.thirdPartyBillingCity,
          postalCode: response.thirdPartyBillingPostalCode,
          name: `${response.thirdPartyBillingPostalCode.name}, ${response.thirdPartyBillingCity.name}`
        };
        this.thirdPartyBillingCitiesList = [];
        this.thirdPartyBillingCitiesList.push(this.thirdPartyBillingPostalCodeAndCity);
      }

      // this.apiService.get('/dropdownMapper/' + response.city.id).subscribe((responseCity: any) => {
      //   response.city = responseCity.data;
      //   this.apiService.get('/dropdownMapper/' + response.billingCity.id).subscribe((responseBillingCity: any) => {
      // response.billingCity = responseBillingCity.data;

      // this.billingPostalCodeAndCity = {
      //   city: response.billingCity,
      //   postalCode: response.billingZipCode,
      //   name: `${response.billingZipCode.name}, ${response.billingCity.name}`
      // };

      // this.billingCitiesList.push(this.billingPostalCodeAndCity);

      //   });
      // });

      this.usersList = response.users;
    });
  }

  create() {
    // if (this.checkFormValidations('create')) {
    this.isBlocked = true;
    let obj = {
      ...this.formGroup.value,
      ...this.customerFormGroup.value,
      ...this.vendorFormGroup.value,
      ...this.thirdPartyFormGroup.value,
    };
    obj.customerLocations = this.customerLocationsList;
    obj.vendorLocations = this.vendorLocationsList;
    obj.thirdPartyLocations = this.thirdPartyLocationsList;
    obj.products = this.productsList;
    obj.thirdPartyBillTo = this.thirdPartyBillToList;
    obj.users = this.usersList;

    if (obj.isCustomer == true) {

    }

    if (this.logo != '' && this.logo != undefined) {
      let attachment = new FormData();
      attachment.append('attachment', this.logo);
      this.apiService.post('/attachments', attachment).subscribe((attachmentResponse: any) => {
        obj.logo = attachmentResponse.id;

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
    } else {
      delete (obj.logo);

      this.apiService.post('/tradingPartners', obj).subscribe(response => {
        this.utilityService.fireSnackBar('Trading Partner created successfully.');

        this.isBlocked = false;
        this.router.navigate(['/masterData/tradingPartners']);
      }, err => {
        this.isBlocked = false;
      });
    }
    // }
  }

  update() {
    // if (this.checkFormValidations('update')) {
    this.isBlocked = true;
    let obj = { ...this.formGroup.value, ...this.customerFormGroup.value, ...this.vendorFormGroup.value, ...this.thirdPartyFormGroup.value };
    obj.customerLocations = this.customerLocationsList;
    obj.vendorLocations = this.vendorLocationsList;
    obj.thirdPartyLocations = this.thirdPartyLocationsList;
    obj.products = this.productsList;
    obj.users = this.usersList;
    obj.thirdPartyBillTo = this.thirdPartyBillToList;

    if (this.formGroup.get('logo').value != '') {
      let attachment = new FormData();
      attachment.append('attachment', this.logo);

      this.apiService.post('/attachments', attachment).subscribe((attachmentResponse: any) => {
        obj.logo = attachmentResponse.id;

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
      delete (obj.logo);

      this.apiService.patch('/tradingPartners/' + this.partnerId, obj).subscribe(response => {
        this.utilityService.fireSnackBar('Trading Partner updated successfully.');

        this.isBlocked = false;
      }, err => {
        console.log(err)
        this.isBlocked = false;
      });
    }
    // }
  }

  checkFormValidations(event): boolean {
    if (this.formGroup.get('number').value == "") {
      this.utilityService.fireSnackBar('Please enter your phone number.');
      return;
    }
    if (this.formGroup.get('name').value == "") {
      this.utilityService.fireSnackBar('Please enter a name.');
      return;
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
    if (this.formGroup.get('currency').value == "") {
      this.utilityService.fireSnackBar('Please enter your currency.');
      return;
    }
    // if (this.locationsList.length == 0) {
    //   this.utilityService.fireSnackBar( 'Please add locations first.');
    //   return;
    // }
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

  sameAsAboveToggle(event, type) {
    if (type == 'customer') {
      if (event.value == true) {
        this.customerFormGroup.patchValue({
          customerBillingName: this.formGroup.get('name').value,
          customerBillingStreet: this.formGroup.get('street').value,
          customerBillingCity: this.formGroup.get('city').value,
          customerBillingPostalCode: this.formGroup.get('postalCode').value,
          customerBillingState: this.formGroup.get('state').value,
          customerBillingCountry: this.formGroup.get('country').value,
          customerBillingContactName: this.formGroup.get('contactName').value,
          customerBillingContactEmail: this.formGroup.get('contactEmail').value,
        });
        if (this.postalCodeAndCity.name != undefined) {
          this.customerBillingCitiesList.push(this.postalCodeAndCity);
          this.customerBillingPostalCodeAndCity = this.postalCodeAndCity;
        }
      } else {
        this.customerFormGroup.patchValue({
          customerBillingName: '',
          customerBillingStreet: '',
          customerBillingCity: '',
          customerBillingPostalCode: '',
          customerBillingState: '',
          customerBillingCountry: '',
          customerBillingContactName: '',
          customerBillingContactEmail: '',
        });
        this.customerBillingPostalCodeAndCity = {};
      }
    } else if (type == 'vendor') {
      if (event.value == true) {
        this.vendorFormGroup.patchValue({
          vendorBillingName: this.formGroup.get('name').value,
          vendorBillingStreet: this.formGroup.get('street').value,
          vendorBillingCity: this.formGroup.get('city').value,
          vendorBillingPostalCode: this.formGroup.get('postalCode').value,
          vendorBillingState: this.formGroup.get('state').value,
          vendorBillingCountry: this.formGroup.get('country').value,
          vendorBillingContactName: this.formGroup.get('contactName').value,
          vendorBillingContactEmail: this.formGroup.get('contactEmail').value,
        });
        if (this.postalCodeAndCity.name != undefined) {
          this.vendorBillingCitiesList.push(this.postalCodeAndCity);
          this.vendorBillingPostalCodeAndCity = this.postalCodeAndCity;
        }
      } else {
        this.vendorFormGroup.patchValue({
          vendorBillingName: '',
          vendorBillingStreet: '',
          vendorBillingCity: '',
          vendorBillingPostalCode: '',
          vendorBillingState: '',
          vendorBillingCountry: '',
          vendorBillingContactName: '',
          vendorBillingContactEmail: '',
        });
        this.vendorBillingPostalCodeAndCity = {};
      }
    } else if (type == 'thirdParty') {
      if (event.value == true) {
        this.thirdPartyFormGroup.patchValue({
          thirdPartyBillingName: this.formGroup.get('name').value,
          thirdPartyBillingStreet: this.formGroup.get('street').value,
          thirdPartyBillingCity: this.formGroup.get('city').value,
          thirdPartyBillingPostalCode: this.formGroup.get('postalCode').value,
          thirdPartyBillingState: this.formGroup.get('state').value,
          thirdPartyBillingCountry: this.formGroup.get('country').value,
          thirdPartyBillingContactName: this.formGroup.get('contactName').value,
          thirdPartyBillingContactEmail: this.formGroup.get('contactEmail').value,
        });
        if (this.postalCodeAndCity.name != undefined) {
          this.thirdPartyBillingCitiesList.push(this.postalCodeAndCity);
          this.thirdPartyBillingPostalCodeAndCity = this.postalCodeAndCity;
        }
      } else {
        this.thirdPartyFormGroup.patchValue({
          thirdPartyBillingName: '',
          thirdPartyBillingStreet: '',
          thirdPartyBillingCity: '',
          thirdPartyBillingPostalCode: '',
          thirdPartyBillingState: '',
          thirdPartyBillingCountry: '',
          thirdPartyBillingContactName: '',
          thirdPartyBillingContactEmail: '',
        });
        this.thirdPartyBillingPostalCodeAndCity = {};
      }
    }
  }

  openAddLocationPopupCustomer(template: TemplateRef<any>) {
    this.resetLocationForm();
    this.openModal(template);
  }

  openAddLocationPopupVendor(template: TemplateRef<any>) {
    this.resetLocationForm();
    this.openModal(template);
  }

  openAddBillTo(template: TemplateRef<any>) {
    this.openModal(template);
  }

  openAddUserPopup(template: TemplateRef<any>) {
    this.userFormGroup.reset()
    this.openModal(template);
  }

  resetLocationForm() {
    this.isEditLocation = false;
    this.editLocationId = '';
    this.locationsFormGroup.reset();
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, this.config);
  }

  addLocation(type) {
    if (this.checkLocationFormValidation()) {
      let obj = this.locationsFormGroup.value;
      obj.type = this.locationTypeList.find(val => val.id == obj.type);
      obj.state = this.stateList.find(val => val.id == obj.state);
      obj.country = this.countryList.find(val => val.id == obj.country);

      if (type == 'customer') {
        this.customerLocationsList.push(obj);
      } else if (type == 'vendor') {
        this.vendorLocationsList.push(obj);
      } else {
        this.thirdPartyLocationsList.push(obj);
      }
      this.modalRef.hide();
      this.resetLocationForm();
    }
  }

  updateLocation(type) {
    if (this.checkLocationFormValidation()) {
      if (this.editLocationId != '') {
        let obj = this.locationsFormGroup.value;
        obj.city = obj.city.id;
        obj.postalCode = obj.postalCode.id;

        this.apiService.patch('/locations/' + this.editLocationId, obj).subscribe((response: any) => {
          if (type == 'customer') {
            this.customerLocationsList.forEach((val, idx) => {
              if (val.id == response.id) {
                this.customerLocationsList[idx] = response;
              }
            });
          } else if (type == 'vendor') {
            this.vendorLocationsList.forEach((val, idx) => {
              if (val.id == response.id) {
                this.vendorLocationsList[idx] = response;
              }
            });
          } else {
            this.thirdPartyLocationsList.forEach((val, idx) => {
              if (val.id == response.id) {
                this.thirdPartyLocationsList[idx] = response;
              }
            });
          }

          this.modalRef.hide();
          this.resetLocationForm();
        });
      } else {
        // Case: location is not persisted yet.
        let obj = this.locationsFormGroup.value;
        obj.type = this.locationTypeList.find(val => val.id == obj.type);
        obj.state = this.stateList.find(val => val.id == obj.state);
        obj.country = this.countryList.find(val => val.id == obj.country);

        if (type == 'customer') {
          this.customerLocationsList[this.locationIndex] = obj;
        } else if (type == 'vendor') {
          this.vendorLocationsList[this.locationIndex] = obj;
        } else {
          this.thirdPartyLocationsList[this.locationIndex] = obj;
        }
        this.modalRef.hide();
        this.resetLocationForm();
      }
    }
  }

  openLocationsEditDialog(template: TemplateRef<any>, locationObj, type: string, idx) {
    this.locationIndex = idx;
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

  openProductsEditDialog(template: TemplateRef<any>, productObj, idx) {
    this.productIndex = idx;
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

  cityOnInputEvent(e) {
    if (e.event.path[0].value == '') {
      this.postalCodeAndCity = { name: '' };
      this.postalCode.instance.reset();
    }

    this.locationSubject.next({
      value: e.event.target.value,
      type: 'cities'
    });
  }

  cityValueChanged(e) {
    if (e.selectedItem) {
      if (e.selectedItem.city) {
        if (e.selectedItem.city.values) {
          delete (e.selectedItem.city.values)
        }
      }

      this.formGroup.patchValue({
        postalCode: e.selectedItem.postalCode,
        city: e.selectedItem.city,
        state: e.selectedItem.city.state.id != undefined ? e.selectedItem.city.state.id : e.selectedItem.city.state
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
  }

  billingCityValueChanged(e, type) {
    if (e.selectedItem) {
      if (e.selectedItem.city) {
        if (e.selectedItem.city.values) {
          delete (e.selectedItem.city.values)
        }
      }

      if (type == 'customer') {
        this.customerFormGroup.patchValue({
          customerBillingPostalCode: e.selectedItem.postalCode,
          customerBillingCity: e.selectedItem.city,
          customerBillingState: e.selectedItem.city.state.id != undefined ? e.selectedItem.city.state.id : e.selectedItem.city.state
        });

        if (e.selectedItem.city.state != undefined && e.selectedItem.city.state != null) {
          if (e.selectedItem.city.state.id == undefined) {
            this.apiService.get("/states/" + e.selectedItem.city.state).subscribe((responseState: any) => {
              e.selectedItem.city.state = responseState;
              this.customerStateList.push(e.selectedItem.city.state);
            });
          } else {
            this.customerStateList.push(e.selectedItem.city.state);
          }
        }
      } else if (type == 'vendor') {
        this.vendorFormGroup.patchValue({
          vendorBillingPostalCode: e.selectedItem.postalCode,
          vendorBillingCity: e.selectedItem.city,
          vendorBillingState: e.selectedItem.city.state.id != undefined ? e.selectedItem.city.state.id : e.selectedItem.city.state
        });

        if (e.selectedItem.city.state != undefined && e.selectedItem.city.state != null) {
          if (e.selectedItem.city.state.id == undefined) {
            this.apiService.get("/states/" + e.selectedItem.city.state).subscribe((responseState: any) => {
              e.selectedItem.city.state = responseState;
              this.vendorStateList.push(e.selectedItem.city.state);
            });
          } else {
            this.vendorStateList.push(e.selectedItem.city.state);
          }
        }
      } else {
        this.thirdPartyFormGroup.patchValue({
          thirdPartyBillingPostalCode: e.selectedItem.postalCode,
          thirdPartyBillingCity: e.selectedItem.city,
          thirdPartyBillingState: e.selectedItem.city.state.id != undefined ? e.selectedItem.city.state.id : e.selectedItem.city.state
        });

        if (e.selectedItem.city.state != undefined && e.selectedItem.city.state != null) {
          if (e.selectedItem.city.state.id == undefined) {
            this.apiService.get("/states/" + e.selectedItem.city.state).subscribe((responseState: any) => {
              e.selectedItem.city.state = responseState;
              this.thirdPartyStateList.push(e.selectedItem.city.state);
            });
          } else {
            this.thirdPartyStateList.push(e.selectedItem.city.state);
          }
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

      // this.stateList.push(e.selectedItem.city.state);

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
  }

  billingCityOnInputEvent(e, type) {
    this.locationSubject.next({
      value: e.event.target.value,
      type
    });
  }

  initLocationSubject() {
    this.locationSubject.pipe(debounceTime(500), distinctUntilChanged(), tap(() => {
      this.spinnerService.show();
    }), switchMap(data => {
      if (data.value != '' && data.value != undefined) {
        this.socket.emit('citiesAndPostalCodes', { query: data.value, list: data.type });
      } else {
        if (data.type == 'cities') {
          this.postalCodeAndCity = { name: '' };
          this.postalCode.instance.reset();
        } else if (data.type == 'customerBillingCities') {
          this.customerBillingPostalCode.instance.reset();
        } else if (data.type == 'vendorBillingCities') {
          this.vendorBillingPostalCode.instance.reset();
        } else {
          this.addLocationCustomerPostalCode.instance.reset();
          this.addLocationVendorPostalCode.instance.reset();
          this.addLocationThirdPartyPostalCode.instance.reset();
        }
        this.spinnerService.hide();
      }

      return [];
    })).subscribe((response: any) => { }, error => {
      this.initLocationSubject();
    });
  }

  openAddProductPopup(template: TemplateRef<any>) {
    this.resetProductForm();
    this.openModal(template);
  }

  resetProductForm() {
    this.isEditProduct = false;
    this.editProductId = '';
    this.productsFormGroup.reset();
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
    if (this.productsFormGroup.get('classType').value == '' || this.productsFormGroup.get('classType').value == null) {
      this.utilityService.fireSnackBar('Please select a class.');
      return false;
    }
    return true;
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

  tradingPartnerValueChanged(e) {
    this.selectedTrandingPartner = e.selectedItem;
  }

  tradingPartnerOnInputEvent(e) {
    this.tradingPartnerSubject.next(e.event.target.value);
  }

  initTradingPartnerSubject() {
    this.tradingPartnerSubject.pipe(debounceTime(500), distinctUntilChanged(), tap(() => {
      this.spinnerService.show();
    }), switchMap(data => this.apiService.get(`/tradingPartners/search/${data}`).pipe(finalize(() => {
      this.spinnerService.hide();
    })))).subscribe((response: any) => {
      this.tradingPartnersList = response;
    }, error => {
      this.initTradingPartnerSubject();
    });
  }

  addBillTo() {
    this.thirdPartyBillToList.push(JSON.parse(JSON.stringify(this.selectedTrandingPartner)));
    this.selectedTrandingPartner = {};
    this.modalRef.hide();
  }

  openUsersEditDialog(template: TemplateRef<any>, userObj, data) {
    this.userIndex = this.usersList.findIndex(val => val.email == userObj.email);
    this.editUserId = userObj.id != undefined ? userObj.id : '';
    this.isEditUser = true;

    this.userFormGroup.patchValue({
      ...userObj,
    });

    this.openModal(template);
  }

  checkUserFormValidation(): boolean {
    this.isLockedUserForm = true;
    let emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (this.userFormGroup.get('firstName').value == undefined || this.userFormGroup.get('firstName').value == '') {
      this.utilityService.fireSnackBar('Please enter a first name.');
      this.isLockedUserForm = false;
      return false;
    }
    if (this.userFormGroup.get('lastName').value == undefined || this.userFormGroup.get('lastName').value == '') {
      this.utilityService.fireSnackBar('Please enter a last name.');
      this.isLockedUserForm = false;
      return false;
    }
    if (this.userFormGroup.get('email').value == undefined || this.userFormGroup.get('email').value == '') {
      this.utilityService.fireSnackBar('Please enter an email.');
      this.isLockedUserForm = false;
      return false;
    }
    if (emailRegex.test(this.userFormGroup.get('email').value) == false) {
      this.utilityService.fireSnackBar('Please enter a valid email.');
      this.isLockedUserForm = false;
      return false;
    }
    if (this.userFormGroup.get('password').value == undefined || this.userFormGroup.get('password').value == '') {
      if (!this.isEditUser) {
        this.utilityService.fireSnackBar('Please enter a password.');
        this.isLockedUserForm = false;
        return false;
      }
    }
    if (this.userFormGroup.get('cpassword').value == undefined || this.userFormGroup.get('cpassword').value == '') {
      if (!this.isEditUser) {
        this.utilityService.fireSnackBar('Please fill confirm password field.');
        this.isLockedUserForm = false;
        return false;
      }
    }
    if (this.userFormGroup.get('password').value != this.userFormGroup.get('cpassword').value) {
      this.utilityService.fireSnackBar('Passwords do not match.');
      this.isLockedUserForm = false;
      return false;
    }

    return true;
  }

  addUser() {
    if (this.checkUserFormValidation()) {
      let obj = this.userFormGroup.value;
      delete (obj.cpassword);
      obj.isVerified = true;

      this.usersList.push(obj);
      this.userFormGroup.reset();
      this.modalRef.hide();
    }
  }

  updateUser() {
    if (this.checkUserFormValidation()) {
      let obj: any = this.userFormGroup.value;
      delete (obj.cpassword);

      if (this.editUserId != undefined && this.editUserId != '') {
        this.apiService.patch(`/user/${this.editUserId}`, obj).subscribe((response: any) => {
          this.usersList[this.userIndex] = response;

          this.resetUserForm();
          this.modalRef.hide();
        }, err => {
          this.isLockedUserForm = false;
        });
      } else {
        let idx = this.usersList.findIndex(val => val.email == obj.email);
        this.usersList[idx] = obj;
        this.resetUserForm();
        this.modalRef.hide();
      }
    }
  }

  resetUserForm() {
    this.isEditUser = false;
    this.isLockedUserForm = false;
    this.userFormGroup.reset();
  }

  removeBillTo(data) {
    let idx = this.thirdPartyBillToList.findIndex(val => val.id == data.id);

    if (this.partnerId != undefined) { // In case of trading partner already exists
      this.thirdPartyBillToList.splice(idx, 0);

      // TODO
    }
  }

  organisationValueChanged(e) {
    this.formGroup.patchValue({ organisation: e.selectedItem.id });
  }

  organisationOnInputEvent(e) {
    if (e.event.target.value == '') {
      this.organisationElem.instance.reset();
    } else {
      this.organisationSubject.next(e.event.target.value);
    }
  }

  initOrganisationSubject() {
    this.organisationSubject.pipe(debounceTime(300), distinctUntilChanged(), tap(() => {
      this.spinnerService.show();
    }), switchMap(data => this.apiService.get("/organisation/search/name/" + data).pipe(finalize(() => {
      this.spinnerService.hide();
    })))).subscribe((response: any) => {
      this.organisationsList = response;
    }, err => console.log(err));
  }

  openBillToDeleteDialog(item, idx) {
    this.thirdPartyBillToList.splice(idx, 1);
  }

  get form() {
    return this.formGroup.controls;
  }

  get userForm() {
    return this.userFormGroup.controls;
  }

  // checkEmailValidation() {
  //   this.emailValidatorSubject.next(this.userFormGroup.get("email").value);
  // }

  // initEmailValidatorSubject() {
  //   this.emailValidatorSubject.pipe(debounceTime(1000), distinctUntilChanged(), tap(() => {
  //     this.spinner.show();
  //   }), switchMap(data => {
  //     let regex = new RegExp("[a-zA-Z0-9.-_]{1,}@[a-zA-Z.-]{2,}[.]{1}[a-zA-Z]{2,}");

  //     if (regex.test(data)) {
  //       return this.apiService.post(`/user/available`, {
  //         email: data
  //       }).pipe(finalize(() => {
  //         this.spinner.hide();
  //       }));
  //     } else {
  //       this.isEmailValid = "invalid";
  //       this.spinner.hide();
  //       return [];
  //     }
  //   })).subscribe((response: any) => {
  //     if (response.message == "Available") {
  //       this.isEmailValid = "valid";
  //     } else {
  //       this.isEmailValid = response.message;
  //       this.utilityService.fireSnackBar("Email not available. Already exists.");
  //     }
  //   });
  // }

  initSocketEvents() {
    this.socket.on('citiesAndPostalCodes', response => {
      if (this.locationSubject.getValue().hasOwnProperty('type')) {
        let type = this.locationSubject.getValue().type;
        if (type == 'customerBillingCities') {
          this.customerBillingCitiesList = [];
        } else if (type == 'vendorBillingCities') {
          this.vendorBillingCitiesList = [];
        } else if (type == 'cities') {
          this.citiesList = [];
        } else {
          this.addLocationCitiesList = [];
        }

        response.forEach(city => {
          if (!city.hasOwnProperty('dropdownMapper')) {
            if (city.values) {
              city.values.forEach(postalCode => {
                this[`${type}List`].push({ city: city, name: `${postalCode.name}, ${city.name}`, postalCode: postalCode });
              });
            } else {
              this[`${type}List`].push({ city: city, name: `${city.name}`, postalCode: {} });
            }
          } else {
            this[`${type}List`].push({ city: city.dropdownMapper, name: `${city.name}, ${city.dropdownMapper.name}`, postalCode: city });
          }
        });

        this.spinnerService.hide();
      }
    });
  }
}
