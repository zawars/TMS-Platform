import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UtilityService } from 'src/app/services/utility.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap, switchMap, share, finalize } from 'rxjs/operators';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiService } from 'src/app/services/api.service';
import { DxSelectBoxComponent } from 'devextreme-angular';
import { SocketService } from 'src/app/services/socket.service';

@Component({
  selector: 'app-create-organisation',
  templateUrl: './create-organisation.component.html',
  styleUrls: ['./create-organisation.component.scss']
})
export class CreateOrganisationComponent implements OnInit {
  formGroup: FormGroup;
  public currencyList: Array<any> = new Array();
  public countryList: Array<any> = new Array();
  public citiesList: Array<any> = new Array();
  public organisationsList: Array<any> = new Array();
  locationSubject: Subject<any> = new Subject();
  organisationSubject: Subject<any> = new Subject();
  @ViewChild(DxSelectBoxComponent, { static: false }) organisationElem: DxSelectBoxComponent;
  @ViewChild(DxSelectBoxComponent, { static: false }) cityElem: DxSelectBoxComponent;
  isEdit: boolean = false;
  isLocked: boolean = false;
  editId;

  constructor(private fb: FormBuilder, private utils: UtilityService, private route: ActivatedRoute, private spinner: NgxSpinnerService,
    private apiService: ApiService, private router: Router, private socket: SocketService) {
    this.utils.initializeDropdowns(this.route);

    this.initSubjects();
    this.initSocketEvents();
  }

  ngOnInit() {
    this.formGroup = this.fb.group({
      name: [''],
      parent: [undefined],
      description: [''],
      currency: [undefined],
      city: [undefined],
      country: [undefined],
    });

    this.currencyList = this.utils.dropdowns['currencyValues'].values;
    this.countryList = this.utils.dropdowns['countryValues'].values;

    if (this.route.snapshot.params.id != undefined) {
      this.editId = this.route.snapshot.params.id;
      this.isEdit = true;

      this.apiService.get(`/organisation/${this.editId}`).subscribe((response: any) => {
        this.formGroup.patchValue({
          ...response,
          parent: response.parent != undefined ? response.parent.id : undefined,
          currency: response.currency.id,
          city: response.city.id,
          country: response.country.id,
        });

        this.organisationsList.push(response.parent);
        this.citiesList.push(response.city);
      });
    }
  }

  create() {
    this.isLocked = true;

    this.apiService.post(`/organisation`, this.formGroup.value).subscribe(response => {
      this.utils.fireSnackBar('Organisation created successfully.');
      this.isLocked = false;
      this.router.navigate([`/masterData/organisation`]);
    }, err => console.log(err));
  }

  update() {
    this.isLocked = true;

    this.apiService.patch(`/organisation/${this.editId}`, this.formGroup.value).subscribe(response => {
      this.isLocked = false;
      this.utils.fireSnackBar('Organisation updated successfully.');
    }, err => console.log(err));
  }

  organisationOnInputEvent(e) {
    if (e.event.target.value == '') {
      this.organisationElem.instance.reset();
    } else {
      this.organisationSubject.next(e.event.target.value);
    }
  }

  organisationValueChanged(e) {
    this.formGroup.patchValue({ parent: e.selectedItem.id });
  }

  cityOnInputEvent(e) {
    if (e.event.target.value == '') {
      this.cityElem.instance.reset();
    } else {
      this.locationSubject.next(e.event.target.value);
    }
  }

  cityValueChanged(e) {
    this.formGroup.patchValue({ city: e.selectedItem.id });
  }

  initSubjects() {
    this.organisationSubject.pipe(debounceTime(300), distinctUntilChanged(), tap(() => {
      this.spinner.show();
    }), switchMap(data => {
      // return this.apiService.get("/organisation/search/name/" + data).pipe(finalize(() => {
      //   this.spinner.hide();
      // }))
      if (data != '' && data != undefined) {
        this.socket.emit('organisationSearch', { query: data, list: 'organisations' });
      }

      return [];
    })).subscribe((response: any) => {
      this.organisationsList = response;
    }, err => console.log(err));

    this.locationSubject.pipe(debounceTime(300), distinctUntilChanged(), tap(() => {
      this.spinner.show();
    }), switchMap(data => {
      // return this.apiService.get("/dropdownMapper/search/city/" + data).pipe(finalize(() => {
      //   this.spinner.hide();
      // }))

      if (data != '' && data != undefined) {
        this.socket.emit('citiesAndPostalCodes', { query: data, list: 'cities' });
      }

      return [];
    })).subscribe((response: any) => {
      // this.citiesList = response;
    }, err => console.log(err));
  }

  initSocketEvents() {
    this.socket.on('citiesAndPostalCodes', response => {
      this.citiesList = response;
      this.spinner.hide();
    });

    this.socket.on('organisationSearch', response => {
      this.organisationsList = response;
      this.spinner.hide();
    });
  }
}
