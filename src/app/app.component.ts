import { Component } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, RouteConfigLoadStart, RouteConfigLoadEnd } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Socket } from 'ngx-socket-io';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'deli-agile-board-V2';

  constructor(private router: Router, private spinnerService: NgxSpinnerService) {
    this.router.events.subscribe(e => {
      if (e instanceof NavigationStart) {
        this.spinnerService.show();
      }
      if (e instanceof NavigationEnd) {
        this.spinnerService.hide();
      }
    });
  }
}
