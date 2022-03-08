import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { UtilityService } from 'src/app/services/utility.service';
// import { I18nService } from '../shared/i18n/i18n.service';
// import { AuthService } from 'app/services/auth.service';

declare const $: any;

@Component({
  selector: 'app-breadcrumbs-cmp',
  templateUrl: 'breadcrumbs.component.html',
})

export class BreadCrumbsComponent implements OnInit {

  constructor(private utilityService: UtilityService) {

  }

  ngOnInit() {
  }

  getTitle() {
    return this.utilityService.breadcrumb;
  }
}
