import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap, switchMap, share, finalize } from 'rxjs/operators';
import { ApiService } from 'src/app/services/api.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { UtilityService } from 'src/app/services/utility.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-create-area',
  templateUrl: './create-area.component.html',
  styleUrls: ['./create-area.component.scss']
})
export class CreateAreaComponent implements OnInit {
  formGroup: FormGroup;
  statesList: Array<any> = new Array();
  citiesList: Array<any> = new Array();
  selectedStatesList: Array<any> = new Array();
  selectedCitiesList: Array<any> = new Array();
  postalCodesList: Array<any> = new Array();
  selectedPostalCodesList: Array<any> = new Array();
  statesSubject: Subject<any> = new Subject();
  citySubject: Subject<any> = new Subject();
  postalCodeSubject: Subject<any> = new Subject();
  isPostalCodeDisabled: boolean = true;
  showList: boolean = true;
  modes = ['State/City', 'Postal Code'];
  isEdit: boolean = false;

  constructor(private fb: FormBuilder, private apiService: ApiService, private spinnerService: NgxSpinnerService, private utilityService: UtilityService,
    private router: Router, private route: ActivatedRoute) {
    this.utilityService.breadcrumb = 'Create Area';
    this.initStateSubject();
    this.initCitySubject();
    this.initPostalCodeSubject();

  }

  ngOnInit() {
    this.formGroup = this.fb.group({
      name: [''],
      description: [''],
      postalCodes: [[]],
    });

    if (this.route.snapshot.params.areaId) {
      this.utilityService.breadcrumb = 'Edit Area';
      let areaId = this.route.snapshot.params.areaId;
      this.isEdit = true;

      this.apiService.get(`/area/${areaId}`).subscribe(response => {
        this.formGroup.patchValue(response);
        this.selectedPostalCodesList = this.formGroup.get('postalCodes').value;
      });
    }
  }

  statesOnValueChanges(e) {
    this.selectedStatesList = e.value;
  }

  statesOnInputEvent(e) {
    this.statesSubject.next({
      value: e.event.target.value,
    });
  }

  initStateSubject() {
    this.statesSubject.pipe(debounceTime(1000), distinctUntilChanged(), tap(() => {
      this.spinnerService.show();
    }), switchMap(data => this.apiService.get("/states/search/" + data.value).pipe(finalize(() => {
      this.spinnerService.hide();
    }))), share()).subscribe((response: any) => {
      this.statesList = response;
    });
  }

  citySelectionChanged(e) {
    this.selectedCitiesList = e.value;

    // if (this.selectedCitiesList.length > 0) {
    //   this.isPostalCodeDisabled = false;
    // } else {
    //   this.isPostalCodeDisabled = true;
    // }
  }

  cityOnInputEvent(e) {
    this.citySubject.next({
      value: e.event.target.value,
    });
  }

  initCitySubject() {
    this.citySubject.pipe(debounceTime(1000), distinctUntilChanged(), tap(() => {
      this.spinnerService.show();
    }), switchMap(data => {
      return this.apiService.post(`/dropdownMapper/state/city`, {
        city: data.value,
        states: this.selectedStatesList
      }).pipe(finalize(() => {
        this.spinnerService.hide();
      }))
    }), share()).subscribe((response: any) => {
      this.citiesList = response;
    });
  }

  postalCodeSelectionChanged(e) {
    this.selectedPostalCodesList.push(e.selectedItem);
  }

  postalCodeOnInputEvent(e) {
    this.postalCodeSubject.next({
      value: e.event.target.value,
    });
  }

  initPostalCodeSubject() {
    this.postalCodeSubject.pipe(debounceTime(1000), distinctUntilChanged(), tap(() => {
      this.spinnerService.show();
    }), switchMap(data => {
      return this.apiService.post(`/dropdownMapper/city/postalCode`, {
        postalCode: data.value,
        // cities: this.selectedCitiesList,
      }).pipe(finalize(() => {
        this.spinnerService.hide();
      }))
    }), share()).subscribe((response: any) => {
      this.postalCodesList = response;
    });
  }

  getPostalCodes() {
    this.spinnerService.show();
    this.showList = false;

    if (this.isPostalCodeDisabled) {
      // let dataSet = new Set(this.selectedPostalCodesList);
      let obj: any = {};

      if (this.selectedStatesList.length > 0) {
        obj = {
          states: this.selectedStatesList,
        };
      }

      if (this.selectedCitiesList.length > 0) {
        obj.cities = this.selectedCitiesList;
      }

      // if (this.postalCodesList.length > 0) {
      //   obj.postalCode = this.formGroup.get('postalCode').value;
      // }

      this.apiService.post('/dropdownMapperChild/postalCodes', obj).subscribe((response: any) => {
        // dataSet.add(...response);
        this.selectedPostalCodesList = response;
        this.showList = true;
        this.spinnerService.hide();
      });
    }
    // dataSet.add(this.formGroup.get('postalCode').value);
    // this.selectedPostalCodesList = response;
    // this.selectedPostalCodesList.push(this.formGroup.get('postalCode').value);
    // this.formGroup.patchValue({ postalCode: '' })
    // this.showList = true;
    // this.spinnerService.hide();
  }

  onModeValueChanged(e) {
    if (e.value == 'State/City') {
      this.isPostalCodeDisabled = true;
    } else {
      this.isPostalCodeDisabled = false;
    }
  }

  create() {
    let obj = this.formGroup.value;
    obj.postalCodes = this.selectedPostalCodesList;
    this.spinnerService.show();

    if (obj.name == '') {
      this.spinnerService.hide();
      this.utilityService.fireSnackBar('Please enter area name first.');
      return;
    }
    if (obj.description == '') {
      this.spinnerService.hide();
      this.utilityService.fireSnackBar('Please enter description first.');
      return;
    }
    if (obj.postalCodes.length == 0) {
      this.spinnerService.hide();
      this.utilityService.fireSnackBar('Please add some postal codes first.');
      return;
    }

    this.apiService.post('/area', obj).subscribe(response => {
      this.spinnerService.hide();
      this.utilityService.fireSnackBar('Area created successfully.');
      this.router.navigate(['/masterData/area']);
    });
  }

  update() {
    let obj = this.formGroup.value;
    obj.postalCodes = this.selectedPostalCodesList;
    this.spinnerService.show();

    this.apiService.patch(`/area/${this.route.snapshot.params.areaId}`, obj).subscribe(response => {
      this.spinnerService.hide();
      this.utilityService.fireSnackBar('Area created successfully.');
      this.router.navigate(['/masterData/area']);
    });
  }
}
