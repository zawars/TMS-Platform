import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

@Injectable()
export class AuthService {
  isLoggedIn: boolean = false;
  userObj: any;

  constructor(public router: Router) {
    this.isAuthenticated();
  }

  isAuthenticated(): boolean {
    const userObj = JSON.parse(localStorage.getItem('userObj'));
    if (userObj != undefined && userObj != null) {
      this.isLoggedIn = true;
      this.userObj = userObj;
    }
    return this.isLoggedIn;
  }

  isAdmin(): boolean {
    const userObj = JSON.parse(localStorage.getItem('userObj'));
    if (userObj != undefined) {
      if (userObj.role == 'admin')
        return true;
    }
    return false;
  }

  checkAllowedUserByRole(allowedRoles: Array<any>): boolean {
    const userObj = JSON.parse(localStorage.getItem('userObj'));
    let result = false;
    allowedRoles.forEach(role => {
      if (!result) {
        result = userObj.roles.includes(role);
      }
    });
    return result;
  }

  // checkAllowedUserByRole(allowedRoles: Array<any>): boolean {
  //   const userObj = JSON.parse(localStorage.getItem('userObj'));
  //   let result = false;

  //   let intersection = allowedRoles.filter(value => -1 !== userObj.role.indexOf(value));
  //   if (intersection.length > 0) {
  //     result = true;
  //   } else {
  //     result = false;
  //   }

  //   // allowedRoles.forEach(role => {
  //   //   if (!result) {
  //   //     result = role == userObj.role ? true : false;
  //   //   }
  //   // });

  //   return result;
  // }

  logout() {
    this.userObj = undefined;
    this.isLoggedIn = false;
    localStorage.clear();
    this.router.navigate(['/auth/login']);
  }

  setUserObj(obj) {
    localStorage.setItem('userObj', JSON.stringify(obj));
  }

  getUserObj(): any {
    return JSON.parse(localStorage.getItem('userObj'));
  }

  login(userObj) {
    this.setUserObj(userObj);
    this.isLoggedIn = true;
    this.router.navigate(['dashboard']);
  }

  setToken(token) {
    localStorage.setItem('token', token);
  }
}
