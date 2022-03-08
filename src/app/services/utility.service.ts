import { Injectable, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap, share, finalize, switchMap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class UtilityService implements OnInit {
  currentLanguage;
  langChanged;
  breadcrumb: string;
  dropdownsLoaded: boolean = false;
  dropdowns: any = {};
  sideBarSubject = new Subject<any>();
  locationSubject = new Subject<any>();
  appName: string = 'TMS';
  citiesList = new Array();
  clientsList = new Array();
  vendorsList = new Array();
  notificationsList = new Array<any>();

  constructor(private route: ActivatedRoute, private apiService: ApiService,
    private spinnerService: NgxSpinnerService, private snackBar: MatSnackBar) {
    // Init language
    this.currentLanguage = localStorage.getItem('language');

    this.initializeDropdowns(this.route);
    this.initLocationSubject();
  }

  ngOnInit() { }

  sideBarToggle(): Observable<any> {
    return this.sideBarSubject.asObservable();
  }


  initializeDropdowns(activatedRoute: any) {
    if (activatedRoute.snapshot.data.dropdowns != undefined) {
      activatedRoute.snapshot.data.dropdowns.forEach(element => {
        this.dropdowns[`${this.toCamelCase(element.field)}Values`] = element;
      });
      this.dropdownsLoaded = true;
    }
  }

  toCamelCase(str): string {
    return str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
  }

  fireSnackBar(msg: string) {
    this.snackBar.open(msg, 'Ok', { duration: 5000 });
  }

  initLocationSubject() {
    this.locationSubject.pipe(debounceTime(200), distinctUntilChanged(), tap(() => {
      this.spinnerService.show();
      this.citiesList = [];
    }), switchMap(value => {
      return this.apiService.get("/dropdownMapper/search/city/" + value).pipe(finalize(() => {
        this.spinnerService.hide();
      }));
      // if (value != '' && value != undefined) {
      //   this.socket.emit('citiesAndPostalCodes', { query: value, list: 'citiesList' });
      // } else {
      //   this.spinnerService.hide();
      // }

      // return [];
    })).subscribe((response: any) => {
      response.forEach(city => {
        if (!city.hasOwnProperty('dropdownMapper')) {
          if (city.values) {
            city.values.forEach(postalCode => {
              this.citiesList.push({ city: city, name: `${postalCode.name}, ${city.name}`, postalCode: postalCode });
            });
          } else {
            this.citiesList.push({ city: city, name: `${city.name}`, postalCode: {} });
          }
        } else {
          this.citiesList.push({ city: city.dropdownMapper, name: `${city.name}, ${city.dropdownMapper.name}`, postalCode: city });
        }
      });
    });
  }

}
