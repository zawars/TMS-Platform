import { Injectable, ApplicationRef } from '@angular/core';
import { Observable, Subject, Subscription } from "rxjs";
import { languages } from './languages.model';
import { UtilityService } from '../../services/utility.service';
import deMessages from 'devextreme/localization/messages/de.json';
import enMessages from 'devextreme/localization/messages/en.json';
import { ApiService } from "src/app/services/api.service";

@Injectable()
export class I18nService {

  public state;
  public data: {};
  public currentLanguage: any;

  constructor(private ref: ApplicationRef, private utilityService: UtilityService, private apiService: ApiService) {
    this.state = new Subject();

    let lang = localStorage.getItem('language');
    if (lang != undefined) {
      this.initLanguage(lang);
      this.fetch(lang);
    } else {
      localStorage.setItem('language', 'de');
      this.currentLanguage = 'de';
      this.initLanguage('de');
      this.fetch(this.currentLanguage);
    }
  }

  private fetch(locale: any) {
    if (typeof (locale) == 'object') {
      locale = locale.key;
    }

    this.apiService.get(`/user/lang/${locale}`)
      .subscribe((data: any) => {
        this.data = JSON.parse(data);
        this.state.next(data);
        localStorage.setItem('language', locale);
        this.ref.tick();

        // Set language in utility service
        this.utilityService.currentLanguage = locale;

        // Update DevExtreme Locale
        if (this.utilityService.langChanged == true) {
          this.utilityService.langChanged = false;
          // parent.document.location.reload();
        }
      })
  }

  private initLanguage(loc: string) {
    let language = languages.find((it) => {
      return it.key == loc
    });
    if (language) {
      this.currentLanguage = language;
      if (loc == 'de') {
      } else {
      }
    } else {
      throw new Error(`Incorrect locale used for I18nService: ${loc}`);
    }
  }

  setLanguage(language) {
    this.currentLanguage = language;
    this.fetch(language.key)
  }


  subscribe(sub: any, err: any) {
    return this.state.subscribe(sub, err)
  }

  public getTranslation(phrase: string): string {
    return this.data && this.data[phrase] ? this.data[phrase] : phrase
  }

}
