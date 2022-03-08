import { Component, OnInit, EventEmitter, Output, AfterViewInit } from '@angular/core';
import { UtilityService } from 'src/app/services/utility.service';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import { SocketService } from 'src/app/services/socket.service';
declare var $: any;

@Component({
  selector: 'app-header-cmp',
  templateUrl: 'header.component.html',
})

export class HeaderComponent implements AfterViewInit {
  isToggle: boolean = false;
  @Output() updateToggle = new EventEmitter<any>();
  userObj;

  constructor(public utilityService: UtilityService, private apiService: ApiService, private authService: AuthService,
    private router: Router, private spinner: NgxSpinnerService, private socket: SocketService) {
    let sidebarFlag = localStorage.getItem('sidebar');
    if (sidebarFlag == 'on') {
      this.updateToggle.emit({ isToggle: true });
    }

    this.userObj = this.authService.getUserObj();
    this.initSocketEvents();

    this.socket.emit('fetchNotifications', { userId: this.authService.userObj.id });
  }

  ngAfterViewInit() {
    $('.at-btnclosemenu').on('click', function () {
      $('#at-wrapper').toggleClass('at-hidesidebar');
    });

    if ($('#at-header').length > 0) {
      $(window).on('scroll', function () {
        if ($(this).scrollTop() > 0) {
          $('.at-header').addClass('at-fixedme');
        } else {
          $('.at-header').removeClass('at-fixedme');
        }
      });
    }
  }

  toggleSideBar() {
    this.isToggle = !this.isToggle;
    if (this.isToggle == true) {
      localStorage.setItem('sidebar', 'on');
    } else {
      localStorage.setItem('sidebar', 'off');
    }
    this.updateToggle.emit({ isToggle: this.isToggle });
  }

  getTitle() {
    return this.utilityService.breadcrumb;
  }

  logout() {
    this.spinner.show();
    this.apiService.get('/auth/logout').subscribe(response => {
      this.apiService.accessToken = undefined;
      this.spinner.hide();
      this.socket.disconnect();
      this.authService.logout();
    });
  }

  initSocketEvents() {
    this.socket.on('notification', data => {
      if (this.utilityService.notificationsList.length > 2) {
        this.utilityService.notificationsList.pop();
      }

      this.utilityService.notificationsList.unshift(data);
      console.log(this.utilityService.notificationsList)
    });

    this.socket.on('fetchNotifications', data => {
      this.utilityService.notificationsList = data;
    });
  }

  openNotification(item) {
    if (item.module == 'claims') {
      this.router.navigate([`claim/edit`, { claimId: item.moduleItemId }])
    } else if (item.module == 'pickup') {
      this.router.navigate([`pickup/edit`, { orderId: item.moduleItemId }])
    }
  }
}
