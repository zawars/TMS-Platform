import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { UtilityService } from 'src/app/services/utility.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-forget',
  templateUrl: './forget.component.html',
  styleUrls: ['./forget.component.scss']
})
export class ForgetComponent implements OnInit {
  tokenSent = false;
  verifyDisable = false;
  isTokenVerified = false;
  oldPassword = '';
  forgetForm: FormGroup;

  constructor(private apiService: ApiService, private utilityService: UtilityService, private router: Router,
    private authService: AuthService, private fb: FormBuilder) {
    // let user = this.authService.getUserObj();
    // if (user) {
    //   this.router.navigate(['dashboard']);
    // }
  }

  ngOnInit() {
    this.forgetForm = this.fb.group({
      email: [''],
      token: [''],
      password: [''],
      cpassword: [''],
    });
  }

  forgetPassword() {
    this.apiService.post('/auth/forget', {
      email: this.forgetForm.get('email').value
    }).subscribe((response: any) => {
      if (response.user) {
        this.tokenSent = true;
        this.utilityService.fireSnackBar(response.message);
      } else {
        this.utilityService.fireSnackBar(response.message);
      }
    });
  }

  verify() {
    this.verifyDisable = true;
    this.apiService.post('/auth/forget/verify', {
      email: this.forgetForm.get('email').value,
      token: this.forgetForm.get('token').value
    }).subscribe((response: any) => {
      if (response.user != undefined) {
        this.isTokenVerified = true;
        this.verifyDisable = false;
      } else {
        this.utilityService.fireSnackBar(response.message);
        this.verifyDisable = false;
      }
    });
  }

  updatePassword() {
    if (this.forgetForm.get('password').value === this.forgetForm.get('cpassword').value) {
      this.apiService.post('/auth/forget/renew', {
        email: this.forgetForm.get('email').value,
        password: this.forgetForm.get('password').value,
        isPasswordChanged: false
      }).subscribe((tokenResponse: any) => {
        this.authService.setToken(tokenResponse.token);
        this.authService.setUserObj(tokenResponse.user);
        this.utilityService.fireSnackBar('Password updated successfully.');
        this.router.navigate(['/dashboard']);
      });
    } else {
      this.utilityService.fireSnackBar('Passwords do not match.');
    }
  }
}
