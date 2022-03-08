import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormGroup, FormBuilder, Form, FormControl } from '@angular/forms';
import { UtilityService } from 'src/app/services/utility.service';
import { ApiService } from 'src/app/services/api.service';
import { Router, ActivatedRoute } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap';
import { I18nPipe } from 'src/app/shared/i18n/i18n.pipe';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-invoice-2',
  templateUrl: './invoice-2.component.html',
  styleUrls: ['./invoice-2.component.scss']
})
export class Invoice2Component implements OnInit {
  invoiceId;
  orderId;
  orderObj;
  originalQuotationRateSheet: any = [];
  carrierInvoice: any = [];
  totalOriginalQuotaionAmount = 0;
  totalCarrierInvoiceAmount = 0;
  invoiceStatus: string = 'New';
  carrierInvoiceList: any = [];

  constructor(private utilityService: UtilityService, private fb: FormBuilder, private apiService: ApiService,
    private router: Router, private route: ActivatedRoute) {

    this.initOriginalQuotation();
    this.initCarrierInvoice();

    let sub = this.route.params.subscribe(params => {
      if (params.invoiceId != undefined) {
        this.utilityService.breadcrumb = 'Edit Invoice';
        this.invoiceId = params.invoiceId;
        this.getInvoice();
      } else if (params.orderId != undefined) {
        this.utilityService.breadcrumb = 'Create Invoice';
        this.orderId = params.orderId;
        this.carrierInvoiceList = [
          {
            carrierInvoice: this.carrierInvoice,
            status: "New"
          }
        ]
        this.getOrder();
      }
    });
  }

  ngOnInit() {
  }

  initOriginalQuotation() {
    this.originalQuotationRateSheet = [
      {
        item: "Freight",
        amount: "",
        currency: "USD"
      }
    ];
  }

  initCarrierInvoice() {
    this.carrierInvoice = [
      {
        item: "Freight",
        amount: "",
        currency: "USD"
      }
    ];
  }

  addCarrierInvoice() {
    this.carrierInvoice.push({ item: "", amount: "", currency: "" });
  }

  claculateTotalOriginalQuotaionAmount() {
    this.totalOriginalQuotaionAmount = 0;
    if (this.originalQuotationRateSheet.length > 0) {
      this.originalQuotationRateSheet.forEach(val => {
        this.totalOriginalQuotaionAmount += +val.amount;
      });
      return +this.totalOriginalQuotaionAmount;
    }
  }

  claculateTotalCarrierInvoiceAmount() {
    this.totalCarrierInvoiceAmount = 0;
    if (this.carrierInvoice.length > 0) {
      this.carrierInvoice.forEach(val => {
        this.totalCarrierInvoiceAmount += +val.amount;
      });
      return +this.totalCarrierInvoiceAmount;
    }
  }

  getOrder() {
    this.apiService.get("/orders/" + this.orderId).subscribe((responseOrder: any) => {
      this.orderObj = responseOrder;
      this.originalQuotationRateSheet[0].amount = responseOrder.appliedRate - responseOrder.markupValue;
      this.carrierInvoice[0].amount = responseOrder.appliedRate - responseOrder.markupValue;
    });
  }

  getInvoice() {
    this.apiService.get("/invoices/" + this.invoiceId).subscribe((responseInvoice: any) => {
      this.originalQuotationRateSheet = responseInvoice.originalQuotationRateSheet;
      this.carrierInvoiceList = responseInvoice.carrierInvoice;
      this.carrierInvoice = JSON.parse(JSON.stringify(responseInvoice.carrierInvoice[responseInvoice.carrierInvoice.length - 1].carrierInvoice));
      this.invoiceStatus = responseInvoice.status;
    });
  }

  createInvoice() {
    this.carrierInvoiceList[0].status = "Pending";
    this.carrierInvoiceList[0].carrierInvoice = this.carrierInvoice;
    this.apiService.post("/invoices", {
      invoiceDate: new Date().toISOString(),
      originalQuotationRateSheet: this.originalQuotationRateSheet,
      carrierInvoice: this.carrierInvoiceList,
      status: 'Pending',
      order: this.orderId,
      rate: this.orderObj.rate.id,
      vendor: this.orderObj.vendor.id,
      customer: this.orderObj.customer.id,
    }).subscribe((response: any) => {
      this.utilityService.fireSnackBar('Invoice created successfully.');
      this.router.navigate(['/order-2']);
    });
  }

  editInvoice() {
    this.carrierInvoiceList[this.carrierInvoiceList.length - 1].status = "Pending";
    this.carrierInvoiceList[this.carrierInvoiceList.length - 1].carrierInvoice = this.carrierInvoice;
    this.apiService.put("/invoices/" + this.invoiceId, {
      invoiceDate: new Date().toISOString(),
      originalQuotationRateSheet: this.originalQuotationRateSheet,
      carrierInvoice: this.carrierInvoiceList,
      status: 'Pending'
    }).subscribe((response: any) => {
      this.utilityService.fireSnackBar('Invoice updated successfully.');
      this.router.navigate(['/order-2']);
    });
  }

  reviseInvoice() {
    this.carrierInvoiceList.push({
      carrierInvoice: this.carrierInvoice,
      status: "Pending"
    });
    this.apiService.put("/invoices/" + this.invoiceId, {
      invoiceDate: new Date().toISOString(),
      originalQuotationRateSheet: this.originalQuotationRateSheet,
      carrierInvoice: this.carrierInvoiceList,
      status: 'Pending'
    }).subscribe((response: any) => {
      this.utilityService.fireSnackBar('Invoice revised successfully.');
      this.router.navigate(['/order-2']);
    });
  }

  cancelInvoice() {
    this.carrierInvoiceList[this.carrierInvoiceList.length - 1].status = "Cancel";
    this.carrierInvoiceList[this.carrierInvoiceList.length - 1].carrierInvoice = this.carrierInvoice;
    this.apiService.put("/invoices/" + this.invoiceId, {
      carrierInvoice: this.carrierInvoiceList,
      status: 'Cancel'
    }).subscribe((response: any) => {
      this.utilityService.fireSnackBar('Invoice canceled successfully.');
    });
  }

}
