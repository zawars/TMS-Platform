import { Component, OnInit } from '@angular/core';
import { languages } from '../languages.model'
import { I18nService } from "../i18n.service";
import { UtilityService } from '../../../services/utility.service';
// import config from 'devextreme/core/config';
// import { locale, loadMessages } from 'devextreme/localization';
// import deMessages from 'devextreme/localization/messages/de.json';
// import enMessages from 'devextreme/localization/messages/en.json';

@Component({
  selector: 'sa-language-selector',
  templateUrl: './language-selector.component.html',
})
export class LanguageSelectorComponent implements OnInit {

  public languages: Array<any>;
  public currentLanguage: any;

  constructor(private i18n: I18nService, private utilityService: UtilityService) {
  }

  ngOnInit() {
    this.languages = languages;
    this.currentLanguage = this.i18n.currentLanguage;
  }

  setLanguage(language) {
    this.currentLanguage = language;
    this.i18n.setLanguage(language);
    this.utilityService.langChanged = true;
  }

}
