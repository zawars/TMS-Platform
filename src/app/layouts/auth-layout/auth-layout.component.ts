import { Component, OnInit } from '@angular/core';
import { UtilityService } from 'src/app/services/utility.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  templateUrl: './auth-layout.component.html',
  styleUrls: ['./auth-layout.component.scss']
})
export class AuthLayoutComponent implements OnInit {
  appName;
  isLoginPage = false;

  constructor(private utilityService: UtilityService, private router: Router) {
    this.appName = this.utilityService.appName;

    if (this.router.url.includes('login')) {
      this.isLoginPage = true;
    }
  }

  ngOnInit() {
  }

}
