import { Component, OnInit, ElementRef, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { UtilityService } from 'src/app/services/utility.service';
import { ApiService } from 'src/app/services/api.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  test: Date = new Date();
  private toggleButton: any;
  private sidebarVisible: boolean;
  loginForm: FormGroup;

  constructor(private authService: AuthService, public router: Router, private fb: FormBuilder,
    private apiService: ApiService, private utilityService: UtilityService) {
    this.sidebarVisible = false;

    if (this.authService.isAuthenticated()) {
      this.router.navigate(['dashboard']);
    }
  }

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: [''],
    })
  }

  login() {
    if (this.loginForm.valid) {
      this.apiService.post('/auth/login', this.loginForm.value).subscribe((response: any) => {
        if (response.user != undefined && response.token != undefined) {
          this.authService.setToken(response.token);
          this.authService.setUserObj(response.user);
          this.utilityService.fireSnackBar(response.message);
          this.router.navigate(['dashboard']);
        } else {
          this.utilityService.fireSnackBar(response.message);
        }
      });
    }
  }


}
