import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { UtilityService } from 'src/app/services/utility.service';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-verify',
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.scss']
})
export class VerifyComponent implements OnInit {
  token = '';
  email = '';
  resend: any = '';
  resendDisable = false;
  verifyDisable = false;

  constructor(private apiService: ApiService, private authService: AuthService, private utilityService: UtilityService,
    private router: Router) {
    this.email = this.authService.getUserObj().email;
  }

  ngOnInit() {
    this.resend = 0;
    this.resendDisable = false;
    let interval = setInterval(() => {
      this.resend++;

      if (this.resend == 10) {
        clearInterval(interval);
        this.resend = 'Resend Token';
        this.resendDisable = true;
      }
    }, 1000);
  }

  verify() {
    this.verifyDisable = true;
    this.apiService.post('/auth/verify', {
      email: this.email,
      token: this.token
    }).subscribe((response: any) => {
      if (response.user != undefined) {
        this.authService.setToken(response.token);
        this.authService.setUserObj(response.user);
        this.utilityService.fireSnackBar(response.message);
        this.router.navigate(['/dashboard']);
      } else {
        this.utilityService.fireSnackBar(response.message);
        this.verifyDisable = false;
      }
    });
  }

  resendToken() {
    this.resendDisable = false;
    this.apiService.post('/auth/verify/resend', {
      email: this.email
    }).subscribe((response: any) => {
      this.utilityService.fireSnackBar(response.message);
      this.resend = 0;
      let interval = setInterval(() => {
        this.resend++;

        if (this.resend == 10) {
          clearInterval(interval);
          this.resend = 'Resend Token';
          this.resendDisable = true;
        }
      }, 1000);
    });
  }
}
