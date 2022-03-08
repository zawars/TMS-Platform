import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { BsModalService } from 'ngx-bootstrap';
import { AuthService } from 'src/app/services/auth.service';
import { UtilityService } from 'src/app/services/utility.service';
import { Subject } from 'rxjs';
import { DxSelectBoxComponent } from 'devextreme-angular';
import { debounceTime, distinctUntilChanged, tap, finalize, switchMap } from 'rxjs/operators';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SocketService } from 'src/app/services/socket.service';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  usersList: Array<any> = new Array();
  backupUsersList: Array<any> = new Array();
  rolesList: Array<string>;
  public organisationsList: Array<any> = new Array();
  organisationSubject: Subject<any> = new Subject();
  emailValidatorSubject: Subject<any> = new Subject();
  @ViewChild(DxSelectBoxComponent, { static: true }) organisationElem: DxSelectBoxComponent;
  user;
  role;
  isEdit = false;
  userForm: FormGroup;
  modalRef;
  config = {
    animated: true,
    keyboard: true,
    backdrop: true,
    ignoreBackdropClick: true
  };
  isAdmin: boolean = false;
  public query: string = '';
  permissionList: any = [];
  permission;
  editId = '';
  isLocked: boolean = false;
  isPasswordNotMatched: boolean = false;
  isSubmitted: boolean = false;
  isEmailValid: any = "check";
  submitEvent: any = "Save";

  constructor(private apiService: ApiService, private modalService: BsModalService, private authService: AuthService,
    private utilityService: UtilityService, private spinner: NgxSpinnerService, private fb: FormBuilder,
    private socket: SocketService) {
    this.utilityService.breadcrumb = 'Roles & Permission';

    this.getUsers();
    this.initSubjects();
    this.initSocketEvents();
  }

  ngOnInit() {
    this.rolesList = ['Admin', 'Claim Manager'];
    if (this.authService.userObj.role == 'admin') {
      this.rolesList.push('admin');
      this.isAdmin = true;
    }

    this.userForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      cpassword: ['', [Validators.required, Validators.minLength(8)]],
      phone: [''],
      organisation: [undefined, [Validators.required]],
      roles: [[], [Validators.required, Validators.minLength(1)]],
    });
  }

  getUsers() {
    this.apiService.get('/user').subscribe((response: any) => {
      this.usersList = response;
      // this.organisationsList.push(response.organisation);
      this.backupUsersList = JSON.parse(JSON.stringify(this.usersList));
    });
  }

  permissionChanged(updatedPermission) {
    this.permission = updatedPermission;
  }

  openModal(template: TemplateRef<any>) {
    this.isSubmitted = false;
    this.modalRef = this.modalService.show(template, this.config);
  }

  openEditDialog(template, obj) {
    this.submitEvent = 'Edit';
    this.isEmailValid = 'check';

    if (obj != 'New') {
      this.isEdit = true;
      this.editId = obj.id
      this.userForm.patchValue(obj);
      this.organisationsList = [this.userForm.get('organisation').value];
    } else {
      this.resetForm();
    }
    this.openModal(template);
  }

  resetForm() {
    this.isEdit = false;
    this.submitEvent = 'Save';
    this.isSubmitted = false;
    this.isLocked = false;
    this.userForm.reset();
    this.editId = '';
    this.organisationsList = [];
    this.spinner.hide();
  }

  checkValidation(): boolean {
    this.isLocked = true;
    let emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (this.userForm.get('email').value == undefined || this.userForm.get('email').value == '') {
      this.utilityService.fireSnackBar('Please fill your email.');
      this.isLocked = false;
      return false;
    }
    if (emailRegex.test(this.userForm.get('email').value) == false) {
      this.utilityService.fireSnackBar('Please enter a valid email.');
      this.isLocked = false;
      return false;
    }
    if (!this.isEdit && (this.userForm.get('password').value == undefined || this.userForm.get('password').value == '')) {
      this.utilityService.fireSnackBar('Please fill your password.');
      this.isLocked = false;
      return false;
    }
    if (!this.isEdit && (this.userForm.get('cpassword').value == undefined || this.userForm.get('cpassword').value == '')) {
      this.utilityService.fireSnackBar('Please fill confirm password field.');
      this.isLocked = false;
      return false;
    }
    if (!this.isEdit && (this.userForm.get('password').value != this.userForm.get('cpassword').value)) {
      this.utilityService.fireSnackBar('Your passwords do not match.');
      this.isLocked = false;
      return false;
    }

    return true;
  }

  save() {
    this.spinner.show();
    this.isSubmitted = true;

    if (this.submitEvent == 'Save') {
      // if (this.checkValidation()) {
      if (this.userForm.valid) {
        if (this.isEmailValid == 'valid') {
          let obj: any = {
            ...this.userForm.value,
            isVerified: true
          };

          if (obj.cpassword == obj.password) {
            this.isPasswordNotMatched = false;
            delete (obj.cpassword)

            this.apiService.post('/user', obj).subscribe((response: any) => {
              let userObj = this.authService.getUserObj();
              if (userObj.id == response.id) {
                this.authService.userObj = response;
                this.authService.setUserObj(response);
              }

              this.isLocked = false;
              this.usersList.push(response);
              this.isSubmitted = false;
              this.resetForm();
              this.modalRef.hide();
              this.utilityService.fireSnackBar('User created successfully.');
            }, err => {
              this.isLocked = false;
            });
          } else {
            this.spinner.hide();
            this.isPasswordNotMatched = true;
            this.isLocked = false;
          }
        } else {
          this.utilityService.fireSnackBar('Email not available.');
          this.spinner.hide();
        }
      } else {
        this.spinner.hide();
      }
    } else {
      this.edit();
    }
  }

  edit() {
    // if (this.userForm.valid) {
    let obj: any = this.userForm.getRawValue();
    delete (obj.email)

    if (obj.password == '') {
      delete (obj.password)
      delete (obj.cpassword)
    } else if (obj.cpassword != obj.password) {
      this.isPasswordNotMatched = true;
      delete (obj.cpassword)
    } else {
      this.isPasswordNotMatched = false;
      delete (obj.cpassword)
    }

    this.apiService.patch('/user/' + this.editId, obj).subscribe((response: any) => {
      let userObj = this.authService.getUserObj();
      if (userObj.id == response.id) {
        this.authService.userObj = response;
        this.authService.setUserObj(response);
      }

      this.resetForm();
      this.isLocked = false;
      this.modalRef.hide();
      this.utilityService.fireSnackBar('User updated successfully.');
    }, err => {
      this.isLocked = false;
      this.spinner.hide();
    });
    // }
  }

  onQueryChange(e) {
    if (this.query != "") {
      this.apiService.get('/user/search/' + this.query.toLowerCase()).subscribe((response: any) => {
        this.usersList = response;
      });
    } else {
      this.usersList = JSON.parse(JSON.stringify(this.backupUsersList));
    }
  }

  organisationOnInputEvent(e) {
    if (e.event.target.value == '') {
      this.organisationElem.instance.reset();
    } else {
      this.organisationSubject.next(e.event.target.value);
    }
  }

  organisationValueChanged(e) {
    if (e.selectedItem) {
      this.userForm.patchValue({
        organisation: e.selectedItem.id
      });
    }
  }

  initSubjects() {
    this.organisationSubject.pipe(debounceTime(300), distinctUntilChanged(), tap(() => {
      this.spinner.show();
    }), switchMap(data => this.apiService.get("/organisation/search/name/" + data).pipe(finalize(() => {
      this.spinner.hide();
    })))).subscribe((response: any) => {
      this.organisationsList = response;
    }, err => console.log(err));

    this.emailValidatorSubject.pipe(debounceTime(500), distinctUntilChanged(), tap(() => {
      this.spinner.show();
    }), switchMap(value => {
      let regex = new RegExp("[a-zA-Z0-9.-_]{1,}@[a-zA-Z.-]{2,}[.]{1}[a-zA-Z]{2,}");

      if (regex.test(value)) {
        this.socket.emit('isUserAvailable', { query: value });
        return [];
      } else {
        this.isEmailValid = "invalid";
        this.spinner.hide();
        return [];
      }
    })).subscribe((response: any) => { });
  }

  checkEmailValidation() {
    this.emailValidatorSubject.next(this.userForm.get("email").value);
  }

  initSocketEvents() {
    this.socket.on('isUserAvailable', response => {
      if (response.message == "Available") {
        this.isEmailValid = "valid";
      } else {
        this.isEmailValid = response.message;
      }

      this.spinner.hide();
    });
  }

  get form() {
    return this.userForm.controls;
  }

}
