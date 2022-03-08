import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { ApiService } from 'src/app/services/api.service';
import { Router } from '@angular/router';
import { UtilityService } from 'src/app/services/utility.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  formObj: any = {};
  toggle: boolean = false;
  termsCheck: boolean = false;
  isLocked: boolean = false;

  constructor(private apiService: ApiService, private utilityService: UtilityService, private router: Router,
    private authService: AuthService) {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['dashboard']);
    }
  }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  signup() {
    this.isLocked = true;
    let emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (this.formObj.firstName == undefined || this.formObj.firstName == '') {
      this.utilityService.fireSnackBar('Please fill your first name.');
      this.isLocked = false;
      return;
    }
    if (this.formObj.lastName == undefined || this.formObj.lastName == '') {
      this.utilityService.fireSnackBar('Please fill your last name.');
      this.isLocked = false;
      return;
    }
    if (this.formObj.username == undefined || this.formObj.username == '') {
      this.utilityService.fireSnackBar('Please fill your username.');
      this.isLocked = false;
      return;
    }
    if (this.formObj.email == undefined || this.formObj.email == '') {
      this.utilityService.fireSnackBar('Please fill your email.');
      this.isLocked = false;
      return;
    }
    if (emailRegex.test(this.formObj.email) == false) {
      this.utilityService.fireSnackBar('Please enter a valid email.');
      this.isLocked = false;
      return;
    }
    if (this.formObj.password == undefined || this.formObj.password == '') {
      this.utilityService.fireSnackBar('Please fill your password.');
      this.isLocked = false;
      return;
    }
    if (this.formObj.cpassword == undefined || this.formObj.cpassword == '') {
      this.utilityService.fireSnackBar('Please fill confirm password field.');
      this.isLocked = false;
      return;
    }
    if (this.formObj.phone == undefined || this.formObj.phone == '') {
      this.utilityService.fireSnackBar('Please fill your phone number.');
      this.isLocked = false;
      return;
    }
    if (this.formObj.address == undefined || this.formObj.address == '') {
      this.utilityService.fireSnackBar('Please fill your address.');
      this.isLocked = false;
      return;
    }
    if (this.formObj.city == undefined || this.formObj.city == '') {
      this.utilityService.fireSnackBar('Please fill your city.');
      this.isLocked = false;
      return;
    }
    if (this.formObj.country == undefined || this.formObj.country == '') {
      this.utilityService.fireSnackBar('Please fill your country.');
      this.isLocked = false;
      return;
    }
    if (this.termsCheck == false) {
      this.utilityService.fireSnackBar('Please agree to terms and conditions.');
      this.isLocked = false;
      return;
    }

    if (this.formObj.password != this.formObj.cpassword) {
      this.utilityService.fireSnackBar('Your passwords do not match.');
      this.isLocked = false;
      return;
    }

    delete (this.formObj.cpassword);
    this.formObj.role = 'Employee';

    this.apiService.post('/user', this.formObj).subscribe((response: any) => {
      if (response.user == undefined) {
        this.utilityService.fireSnackBar(response.message);
        this.isLocked = false;
      } else {
        this.authService.setUserObj(response.user);
        this.utilityService.fireSnackBar(response.message);
        this.isLocked = false;
        this.router.navigate(['/auth/register/verify']);
      }
    });
  }

}
