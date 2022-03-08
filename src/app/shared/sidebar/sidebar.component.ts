import { Component, OnInit } from '@angular/core';
import { UtilityService } from 'src/app/services/utility.service';
import { AuthService } from 'src/app/services/auth.service';
import { ApiService } from 'src/app/services/api.service';
import { Router } from '@angular/router';
declare var $: any;

@Component({
  selector: 'app-sidebar-cmp',
  templateUrl: 'sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})

export class SidebarComponent implements OnInit {
  user: any;

  constructor(public utilityService: UtilityService, public authService: AuthService, private apiService: ApiService,
    private router: Router) {
    // this.langs = new Array();
    // this.langs = [
    //   {
    //     lang: 'English',
    //     code: 'EN',
    //     key: 'us',
    //     isActive: false
    //   },
    //   {
    //     lang: 'Deutsch',
    //     code: 'DE',
    //     key: 'de',
    //     isActive: false
    //   },
    //   {
    //     lang: 'French',
    //     code: 'FR',
    //     key: 'fr',
    //     isActive: false
    //   },
    //   // {
    //   //   lang: 'Italian',
    //   //   code: 'IT',
    //   //   key: 'it',
    //   //   isActive: false
    //   // },
    //   // {
    //   //   lang: 'Spanish',
    //   //   code: 'SP',
    //   //   key: 'sp',
    //   //   isActive: false
    //   // },
    // ];
    // let langKey = localStorage.getItem('language');
    // this.langs.forEach((obj) => {
    //   if (obj.key == langKey) {
    //     obj.isActive = true;
    //   }
    // });
  }

  ngOnInit() {
    //let roleFlagAdmin = this.authService.userObj.role == 'admin' || this.authService.userObj.role == 'pmo' ? true : false;

    // this.user = {
    //   username: this.authService.userObj.name, //this.authService.userObj.email,
    //   picture: "assets/img/male.png",
    //   activity: 12
    // }

    this.collapseMenu();
  }

  collapseMenu() {
    $('.at-navigation ul li.menu-item-has-children span, .at-navigation ul li.menu-item-has-children a').on('click', function () {
      $(this).parent('li').toggleClass('at-open');
    });
  }

  checkDashboardRoute() {
    if (this.utilityService.breadcrumb == 'Dashboard') {
      return true;
    }
  }

  checkMasterDataRoute(): boolean {
    if (this.utilityService.breadcrumb == 'Trading Partner') {
      return true;
    }
  }

  checkSettingsRoute(): boolean {
    if (this.utilityService.breadcrumb == 'Field Administration'
      || this.utilityService.breadcrumb == 'Roles & Permission'
      || this.utilityService.breadcrumb == 'Translation') {
      return true;
    }
  }

  checkRatesRoute() {
    if (this.utilityService.breadcrumb == 'Contracts' || this.utilityService.breadcrumb == 'Markup') {
      return true;
    }
  }

  checkOrderRoute() {
    if (this.utilityService.breadcrumb == 'Orders') {
      return true;
    }
  }

  checkClaimRoute() {
    if (this.utilityService.breadcrumb == 'Claims') {
      return true;
    }
  }

  checkPickupRoute() {
    if (this.utilityService.breadcrumb == 'Pickup') {
      return true;
    }
  }

  checkMarkupRoute() {
    if (this.utilityService.breadcrumb == 'Markup') {
      return true;
    }
  }

  // checkQuoteRoute() {
  //   if (this.utilityService.breadcrumb == 'Quote') {
  //     return true;
  //   }
  // }

  setLanguage(obj) {
    // this.langs.map(val => {
    //   if (val.key == obj.key) {
    //     val.isActive = true;
    //   } else {
    //     val.isActive = false;
    //   }
    // });
    // this.i18nService.setLanguage(obj);
  }

}
