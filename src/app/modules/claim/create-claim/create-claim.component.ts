import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UtilityService } from 'src/app/services/utility.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap, switchMap, finalize } from 'rxjs/operators';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiService } from 'src/app/services/api.service';
import { ActivatedRoute, Router } from '@angular/router';
import swal from 'sweetalert2';
import { I18nPipe } from 'src/app/shared/i18n/i18n.pipe';
import { AuthService } from 'src/app/services/auth.service';
import { DxScrollViewComponent } from 'devextreme-angular';
declare var $: any;


@Component({
  selector: 'app-create-claim',
  templateUrl: './create-claim.component.html',
  styleUrls: ['./create-claim.component.scss']
})
export class CreateClaimComponent implements OnInit {
  public claimFormGroup: FormGroup;
  public claimTypes: Array<any> = new Array();
  public citiesList: Array<any> = new Array();
  public stateList: Array<any> = new Array();
  locationSubject: Subject<any> = new Subject();
  statusList: any = [];
  decisionList: any = [];
  isEdit: boolean = false;
  claimId;
  cityPostalCodeValue;
  prevStatus;
  BASE_PATH = this.apiService.BASE_PATH.replace('api/v1', '');
  attachment1: any = "";
  attachment2: any = "";
  attachment3: any = "";
  attachment4: any = "";
  attachment5: any = "";
  attachment1Uploaded = false;
  attachment2Uploaded = false;
  attachment3Uploaded = false;
  attachment4Uploaded = false;
  attachment5Uploaded = false;
  isAttachement1Added = false;
  isAttachement2Added = false;
  isAttachement3Added = false;
  isAttachement4Added = false;
  isAttachement5Added = false;
  saveFlag: boolean = false;
  attachments: any = [];
  commentsArr: any = [];
  commentMsg = '';
  @ViewChild(DxScrollViewComponent, { static: false }) scrollView: DxScrollViewComponent;
  now = new Date().toISOString();
  createdAt = new Date().toISOString();
  updatedAt = new Date().toISOString();

  constructor(private fb: FormBuilder, private utils: UtilityService, private spinner: NgxSpinnerService,
    private apiService: ApiService, private route: ActivatedRoute, private utilityService: UtilityService,
    private router: Router, private localize: I18nPipe, private authService: AuthService) {
    this.initClaimFormGroup();
    this.initSubjectListeners();
    this.utils.initializeDropdowns(this.route);

    let sub = this.route.params.subscribe(params => {
      if (params.claimId != undefined) {
        this.utilityService.breadcrumb = 'Edit Claim';
        this.claimId = params.claimId;
        this.isEdit = true;
        this.getClaim();
      } else {
        this.utils.breadcrumb = 'Create Claim';
        this.resetClaim();
      }
    });
  }

  ngOnInit() {
    this.resetClaimTypes();
    this.statusList = ['New', 'In Progress', 'Closed'];
    this.decisionList = ['Accept', 'Reject'];
    // this.stateList = this.utilityService.dropdowns['stateValues'].values;
  }

  initClaimFormGroup() {
    this.claimFormGroup = this.fb.group({
      bolNumber: [''],
      proNumber: [''],
      claimFor: [''],
      claimantName: [''],
      address1: [''],
      address2: [''],
      city: [''],
      postalCode: [''],
      state: [''],
      contactNumber: [''],
      fax: [''],
      contactEmail: [''],
      description: [''],
      decision: [''],
      status: ['']
    });
  }

  resetClaim() {
    this.isEdit = false;
    this.now = new Date().toISOString();
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
    this.initClaimFormGroup();
    this.resetClaimTypes();
    this.cityPostalCodeValue = ''
    this.attachment1Uploaded = false;
    this.attachment2Uploaded = false;
    this.attachment3Uploaded = false;
    this.attachment4Uploaded = false;
    this.attachment5Uploaded = false;
    this.isAttachement1Added = false;
    this.isAttachement2Added = false;
    this.isAttachement3Added = false;
    this.isAttachement4Added = false;
    this.isAttachement5Added = false;
    this.attachments = [];
    this.commentsArr = [];
    this.commentMsg = '';
    this.claimId = undefined;
    let obj1: any = document.getElementById("attach1-span");
    obj1 != null ? obj1.value = "" : null;
    let obj2: any = document.getElementById("attach2-span");
    obj2 != null ? obj2.value = "" : null;
    let obj3: any = document.getElementById("attach3-span");
    obj3 != null ? obj3.value = "" : null;
    let obj4: any = document.getElementById("attach4-span");
    obj4 != null ? obj4.value = "" : null;
    let obj5: any = document.getElementById("attach5-span");
    obj5 != null ? obj5.value = "" : null;
  }

  resetClaimTypes() {
    this.claimTypes = [];
    let claims = this.utils.dropdowns['claimTypesValues'].values;

    claims.forEach(claim => {
      this.claimTypes.push({ id: claim.id, name: claim.name, value: false });
    });
  }

  getClaim() {
    this.apiService.get("/claims/" + this.claimId).subscribe((responseClaim: any) => {
      this.createdAt = responseClaim.createdAt;
      this.updatedAt = responseClaim.updatedAt;
      this.claimFormGroup.patchValue(responseClaim);
      this.cityPostalCodeValue = {
        city: responseClaim.city,
        postalCode: responseClaim.postalCode,
        name: `${responseClaim.postalCode.name}, ${responseClaim.city.name}`
      };
      this.citiesList.push(this.cityPostalCodeValue);

      this.claimTypes.map((claim, index) => {
        if (responseClaim.claimTypes.find(val => val.id == claim.id)) {
          this.claimTypes[index] = responseClaim.claimTypes.find(val => val.id == claim.id);
        }
      });
      this.prevStatus = responseClaim.status;
      this.attachments = responseClaim.attachments;
      this.commentsArr = responseClaim.comments != undefined ? responseClaim.comments : [];
      this.getAttcahments();
    });
  }

  getAttcahments() {
    let attach1: any = document.getElementById("attach1-span");
    let attach2: any = document.getElementById("attach2-span");
    let attach3: any = document.getElementById("attach3-span");
    let attach4: any = document.getElementById("attach4-span");
    let attach5: any = document.getElementById("attach5-span");
    if (this.attachments.length > 0) {
      if (this.attachments[0] != undefined) {
        if (this.attachments[0].originalName != undefined) {
          this.attachment1Uploaded = true;
          attach1.innerText = this.attachments[0].originalName;
        }
      }
      if (this.attachments[1] != undefined) {
        if (this.attachments[1].originalName != undefined) {
          this.attachment2Uploaded = true;
          attach2.innerText = this.attachments[1].originalName;
        }
      }
      if (this.attachments[2] != undefined) {
        if (this.attachments[2].originalName != undefined) {
          this.attachment3Uploaded = true;
          attach3.innerText = this.attachments[2].originalName;
        }
      }
      if (this.attachments[3] != undefined) {
        if (this.attachments[3].originalName != undefined) {
          this.attachment4Uploaded = true;
          attach4.innerText = this.attachments[3].originalName;
        }
      }
      if (this.attachments[4] != undefined) {
        if (this.attachments[4].originalName != undefined) {
          this.attachment5Uploaded = true;
          attach4.innerText = this.attachments[4].originalName;
        }
      }
    }
  }

  cityValueChanged(e) {
    if (e.selectedItem.city) {
      if (e.selectedItem.city.values) {
        delete (e.selectedItem.city.values)
      }
    }

    this.claimFormGroup.patchValue({
      postalCode: e.selectedItem.postalCode,
      city: e.selectedItem.city,
      state: e.selectedItem.city.state.id != undefined ? e.selectedItem.city.state.id : e.selectedItem.city.state
    });

    if (e.selectedItem.city.state != undefined && e.selectedItem.city.state != null) {
      if (e.selectedItem.city.state.id == undefined) {
        this.apiService.get("/states/" + e.selectedItem.city.state).subscribe((responseState: any) => {
          e.selectedItem.city.state = responseState;
          this.stateList.push(e.selectedItem.city.state);
        });
      } else {
        this.stateList.push(e.selectedItem.city.state);
      }
    }
  }

  cityOnInputEvent(e) {
    this.locationSubject.next(e.event.path["0"].value);
  }

  initSubjectListeners() {
    this.locationSubject.pipe(debounceTime(1000), distinctUntilChanged(), tap(() => {
      this.spinner.show();
      this.citiesList = [];
    }), switchMap(value => this.apiService.get("/dropdownMapper/search/city/" + value).pipe(finalize(() => {
      this.spinner.hide();
    })))).subscribe((response: any) => {
      response.forEach(city => {
        if (!city.hasOwnProperty('dropdownMapper')) {
          if (city.values) {
            city.values.forEach(postalCode => {
              // this.citiesList.push({ cityId: city.id, name: `${postalCode.name}, ${city.name}`, postalCodeId: postalCode.id, city: city.name, postalCode: postalCode.name });
              this.citiesList.push({ city: city, name: `${postalCode.name}, ${city.name}`, postalCode: postalCode });
            });
          } else {
            this.citiesList.push({ city: city, name: `${city.name}`, postalCode: {} });
            // this.citiesList.push({ cityId: city.id, name: `${city.name}`, postalCodeId: '', city: city.name, postalCode: '' });
          }
        } else {
          this.citiesList.push({ city: city.dropdownMapper, name: `${city.name}, ${city.dropdownMapper.name}`, postalCode: city });
          // this.citiesList.push({ cityId: city.dropdownMapper.id, name: `${city.name} , ${city.dropdownMapper.name}`, postalCodeId: city.id, city: city.dropdownMapper.name, postalCode: city.name });
        }
      });
    }, error => {
      this.initSubjectListeners();
    });
  }

  saveClaim(state) {
    this.saveFlag = true;

    if (!this.checkValidation()) {
      this.saveFlag = false;
      return;
    }
    this.saveHelper(state);
  }

  saveHelper(state) {
    if (state == "New") {
      this.apiService.post('/claims', {
        ...this.claimFormGroup.value,
        claimTypes: this.claimTypes,
        status: 'New',
        customer: this.authService.userObj.partner ? this.authService.userObj.partner : undefined,
        comments: this.commentsArr
      }).subscribe(async (responseClaim: any) => {
        this.claimId = responseClaim.id;
        await this.uoploadAttachments();
        setTimeout(() => {
          this.apiService.post('/user/sendmail', {
            email: 'samad.ilyas@gmail.com',
            subject: `New Claim # ${responseClaim.uid}`,
            message: `BOL: ${responseClaim.bolNumber} <br> PRO: ${responseClaim.proNumber} <br> Claimant Information <br> 
            ${responseClaim.claimantName} <br> ${responseClaim.address1} <br> ${responseClaim.city.name} <br> 
            ${responseClaim.postalCode.name} <br> ${responseClaim.contactNumber} <br> ${responseClaim.contactEmail}`
          }).subscribe(msg => {
            this.saveFlag = false;
            this.utilityService.fireSnackBar('Claim created successfully.');
            this.router.navigate(['../../claims']);
          });
        }, 500);
      });
    } else if (state == "Edit") {
      this.apiService.patch('/claims/' + this.claimId, {
        ...this.claimFormGroup.value,
        claimTypes: this.claimTypes,
        comments: this.commentsArr
        // customer: this.authService.userObj.partner ? this.authService.userObj.partner : undefined
      }).subscribe(async (responseClaim: any) => {
        await this.uoploadAttachments();
        setTimeout(() => {
          this.apiService.post('/user/sendmail', {
            email: 'samad.ilyas@gmail.com',
            subject: `New Claim # ${responseClaim.uid}`,
            message: `BOL: ${responseClaim.bolNumber} <br> PRO: ${responseClaim.proNumber} <br> Claimant Information <br> 
              ${responseClaim.claimantName} <br> ${responseClaim.address1} <br> ${responseClaim.city.name} <br> 
              ${responseClaim.postalCode.name} <br> ${responseClaim.contactNumber} <br> ${responseClaim.contactEmail}`
          }).subscribe(msg => {
            this.utilityService.fireSnackBar('Claim updated successfully.');
            this.saveFlag = false;
          });
        }, 3000);
      });
    }
  }

  async uoploadAttachments() {
    if (this.isAttachement1Added == true) {
      if (this.attachment1Uploaded == true) {
        this.apiService.delete("/attachments/" + this.attachments[0].id).subscribe((response: any) => { });
      }

      let attachment = new FormData();
      attachment.append('attachment', this.attachment1);
      this.apiService.post('/attachments', attachment).subscribe((attachmentResponse: any) => {
        this.apiService.patch('/attachments/' + attachmentResponse.id, {
          claim: this.claimId
        }).subscribe((attachmentResponse: any) => { });
      });
    }

    if (this.isAttachement2Added == true) {
      if (this.attachment2Uploaded == true) {
        this.apiService.delete("/attachments/" + this.attachments[1].id).subscribe((response: any) => { });
      }

      let attachment_2 = new FormData();
      attachment_2.append('attachment', this.attachment2);
      this.apiService.post('/attachments', attachment_2).subscribe((attachmentResponse: any) => {
        this.apiService.patch('/attachments/' + attachmentResponse.id, {
          claim: this.claimId
        }).subscribe((attachmentResponse: any) => { });
      });
    }

    if (this.isAttachement3Added == true) {
      if (this.attachment3Uploaded == true) {
        this.apiService.delete("/attachments/" + this.attachments[2].id).subscribe((response: any) => { });
      }

      let attachment_3 = new FormData();
      attachment_3.append('attachment', this.attachment3);
      this.apiService.post('/attachments', attachment_3).subscribe((attachmentResponse: any) => {
        this.apiService.patch('/attachments/' + attachmentResponse.id, {
          claim: this.claimId
        }).subscribe((attachmentResponse: any) => { });
      });
    }

    if (this.isAttachement4Added == true) {
      if (this.attachment4Uploaded == true) {
        this.apiService.delete("/attachments/" + this.attachments[3].id).subscribe((response: any) => { });
      }

      let attachment_4 = new FormData();
      attachment_4.append('attachment', this.attachment4);
      this.apiService.post('/attachments', attachment_4).subscribe((attachmentResponse: any) => {
        this.apiService.patch('/attachments/' + attachmentResponse.id, {
          claim: this.claimId
        }).subscribe((attachmentResponse: any) => { });
      });
    }

    if (this.isAttachement5Added == true) {
      if (this.attachment5Uploaded == true) {
        this.apiService.delete("/attachments/" + this.attachments[4].id).subscribe((response: any) => { });
      }

      let attachment_5 = new FormData();
      attachment_5.append('attachment', this.attachment5);
      this.apiService.post('/attachments', attachment_5).subscribe((attachmentResponse: any) => {
        this.apiService.patch('/attachments/' + attachmentResponse.id, {
          claim: this.claimId
        }).subscribe((attachmentResponse: any) => { });
      });
    }
  }

  checkValidation(): boolean {
    if (this.claimFormGroup.get('bolNumber').value == "" || this.claimFormGroup.get('bolNumber').value == null) {
      this.utilityService.fireSnackBar('Please add a bol number.');
      return false;
    }
    if (this.claimFormGroup.get('claimFor').value == "" || this.claimFormGroup.get('claimFor').value == null) {
      this.utilityService.fireSnackBar('Please add a claim amount.');
      return false;
    }
    if (this.claimFormGroup.get('claimantName').value == "" || this.claimFormGroup.get('claimantName').value == null) {
      this.utilityService.fireSnackBar('Please add a company name.');
      return false;
    }
    if (this.claimFormGroup.get('address1').value == "" || this.claimFormGroup.get('address1').value == null) {
      this.utilityService.fireSnackBar('Please add a address.');
      return false;
    }
    if (this.claimFormGroup.get('city').value == "" || this.claimFormGroup.get('city').value == null) {
      this.utilityService.fireSnackBar('Please add a city and postal code.');
      return false;
    }
    if (this.claimFormGroup.get('state').value == "" || this.claimFormGroup.get('state').value == null) {
      this.utilityService.fireSnackBar('Please add a state.');
      return false;
    }
    if (this.claimFormGroup.get('contactNumber').value == "" || this.claimFormGroup.get('contactNumber').value == null) {
      this.utilityService.fireSnackBar('Please add a contact phone.');
      return false;
    }
    if (this.claimFormGroup.get('contactEmail').value == "" || this.claimFormGroup.get('contactEmail').value == null) {
      this.utilityService.fireSnackBar('Please add a email.');
      return false;
    }
    if (this.claimFormGroup.get('description').value == "" || this.claimFormGroup.get('description').value == null) {
      this.utilityService.fireSnackBar('Please add a description.');
      return false;
    }
    return true;
  }

  public showAttachmentViewDeleteButton(type: string): boolean {
    if (this.attachments.length > 0) {
      if (type == '1') {
        return (this.claimId != undefined && this.attachments[0] != "" && this.attachments[0] != undefined);
      } else if (type == '2') {
        return (this.claimId != undefined && this.attachments[1] != "" && this.attachments[1] != undefined);
      } else if (type == '3') {
        return (this.claimId != undefined && this.attachments[2] != "" && this.attachments[2] != undefined);
      } else if (type == '4') {
        return (this.claimId != undefined && this.attachments[3] != "" && this.attachments[3] != undefined);
      } else if (type == '5') {
        return (this.claimId != undefined && this.attachments[4] != "" && this.attachments[4] != undefined);
      }
    } else {
      return false;
    }
    return false;
  }

  deleteAttachment(type: string) {
    let msg = 'Are you sure you want to delete?';

    swal.fire({
      title: `${this.localize.transform('Confirmation')}`,
      text: `${this.localize.transform(msg)}`,
      type: 'warning',
      showCancelButton: true,
      confirmButtonClass: 'btn btn-success',
      cancelButtonClass: 'btn btn-danger',
      confirmButtonText: `${this.localize.transform('Yes')}`,
      cancelButtonText: `${this.localize.transform('No')}`,
      buttonsStyling: true
    }).then((result) => {
      if (result.value) {
        if (type == '1') {
          this.apiService.delete("/attachments/" + this.attachments[0].id).subscribe((response: any) => {
            this.attachment1 = "";
            this.attachments[0] = "";
            this.attachment1 = false;
            this.attachment1Uploaded = false;
            let obj: any = document.getElementById("attach1-span");
            obj.value = "";
            this.utilityService.fireSnackBar("Attachment deleted.");
          });
        } else if (type == '2') {
          this.apiService.delete("/attachments/" + this.attachments[1].id).subscribe((response: any) => {
            this.attachment2 = "";
            this.attachments[1] = "";
            this.attachment2 = false;
            this.attachment2Uploaded = false;
            let obj: any = document.getElementById("attach2-span");
            obj.value = "";
            this.utilityService.fireSnackBar("Attachment deleted.");
          });
        } else if (type == '3') {
          this.apiService.delete("/attachments/" + this.attachments[2].id).subscribe((response: any) => {
            this.attachment3 = "";
            this.attachments[2] = "";
            this.attachment3 = false;
            this.attachment3Uploaded = false;
            let obj: any = document.getElementById("attach3-span");
            obj.value = "";
            this.utilityService.fireSnackBar("Attachment deleted.");
          });
        } else if (type == '4') {
          this.apiService.delete("/attachments/" + this.attachments[3].id).subscribe((response: any) => {
            this.attachment4 = "";
            this.attachments[3] = "";
            this.attachment4 = false;
            this.attachment4Uploaded = false;
            let obj: any = document.getElementById("attach4-span");
            obj.value = "";
            this.utilityService.fireSnackBar("Attachment deleted.");
          });
        } else if (type == '5') {
          this.apiService.delete("/attachments/" + this.attachments[4].id).subscribe((response: any) => {
            this.attachment5 = "";
            this.attachments[4] = "";
            this.attachment5 = false;
            this.attachment5Uploaded = false;
            let obj: any = document.getElementById("attach5-span");
            obj.value = "";
            this.utilityService.fireSnackBar("Attachment deleted.");
          });
        }
      }
    });
  }

  openAttachment(type: string) {
    if (type == '1') {
      window.open(`${this.BASE_PATH}/${this.attachments[0].fileName}`, "_blank");
    } else if (type == '2') {
      window.open(`${this.BASE_PATH}/${this.attachments[1].fileName}`, "_blank");
    } else if (type == '3') {
      window.open(`${this.BASE_PATH}/${this.attachments[2].fileName}`, "_blank");
    } else if (type == '4') {
      window.open(`${this.BASE_PATH}/${this.attachments[3].fileName}`, "_blank");
    } else if (type == '5') {
      window.open(`${this.BASE_PATH}/${this.attachments[4].fileName}`, "_blank");
    }
  }

  async onFileSelected1(event) {
    let obj: any = document.getElementById("attach1-span");
    let obj2: any = document.getElementById("pmt-uploader1");
    obj.value = obj2.value;

    this.attachment1 = event.target.files[0];

    this.isAttachement1Added = true;
  }

  async onFileSelected2(event) {
    let obj: any = document.getElementById("attach2-span");
    let obj2: any = document.getElementById("pmt-uploader2");
    obj.value = obj2.value;

    this.attachment2 = event.target.files[0];

    this.isAttachement2Added = true;
  }

  async onFileSelected3(event) {
    let obj: any = document.getElementById("attach3-span");
    let obj2: any = document.getElementById("pmt-uploader3");
    obj.value = obj2.value;

    this.attachment3 = event.target.files[0];

    this.isAttachement3Added = true;
  }

  async onFileSelected4(event) {
    let obj: any = document.getElementById("attach4-span");
    let obj2: any = document.getElementById("pmt-uploader4");
    obj.value = obj2.value;

    this.attachment4 = event.target.files[0];

    this.isAttachement4Added = true;
  }

  async onFileSelected5(event) {
    let obj: any = document.getElementById("attach5-span");
    let obj2: any = document.getElementById("pmt-uploader5");
    obj.value = obj2.value;

    this.attachment5 = event.target.files[0];

    this.isAttachement5Added = true;
  }

  saveComments() {
    if (this.commentsArr == undefined) {
      this.commentsArr = [];
    }
    if (this.commentMsg != '') {
      this.commentsArr.push({
        message: this.commentMsg,
        time: Date.now(),
        user: this.authService.userObj.email
      });
      this.commentMsg = '';
      setTimeout(() => {
        this.scrollView.instance.scrollBy($('.dx-scrollview-content').height());
      }, 100);

      if (this.claimId != undefined) {
        this.saveFlag = true;
        this.apiService.put('/claims/' + this.claimId, {
          comments: this.commentsArr
        }).subscribe((response: any) => {
          this.saveFlag = false;
          this.utilityService.fireSnackBar('Comment added successfully.');
        });
      }
    } else {
      this.utilityService.fireSnackBar('Please add a comment.');
    }
  }

  scrollToBottom(e) {
    setTimeout(() => {
      e.component.scrollBy($('.dx-scrollview-content').height());
    }, 100);
  }

}