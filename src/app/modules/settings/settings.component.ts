import { Component, OnInit } from '@angular/core';
import { UtilityService } from 'src/app/services/utility.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  routesList;

  constructor(private utilityService: UtilityService, private router: Router, private activatedRoute: ActivatedRoute) {
    this.utilityService.breadcrumb = 'Settings';

    // this.routesList = [
    //   {
    //     link: 'field-administration',
    //     name: 'Field Administration'
    //   },
    //   {
    //     link: 'user-management',
    //     name: 'User Management'
    //   },
    //   {
    //     link: 'translation',
    //     name: 'Translation'
    //   },
    // ]
  }

  ngOnInit() {
    this.utilityService.initializeDropdowns(this.activatedRoute);
  }

  selectionChanged(e) {
    this.router.navigate([`settings/${e.selectedItem.link}`]);
  }
}
