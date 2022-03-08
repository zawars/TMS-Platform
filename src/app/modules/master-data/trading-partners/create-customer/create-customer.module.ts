import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CreateCustomerRoutingModule } from './create-customer-routing.module';
import { I18nModule } from 'src/app/shared/i18n/i18n.module';
import { ReactiveFormsModule } from '@angular/forms';
import { DxTagBoxModule, DxSelectBoxModule, DxTextBoxModule, DxCheckBoxModule, DxDataGridModule, DxAutocompleteModule } from 'devextreme-angular';
import { CreateCustomerComponent } from './create-customer.component';

@NgModule({
  declarations: [CreateCustomerComponent],
  imports: [
    CommonModule,
    CreateCustomerRoutingModule,
    I18nModule,
    ReactiveFormsModule,
    DxTagBoxModule,
    DxSelectBoxModule,
    DxTextBoxModule,
    DxCheckBoxModule,
    DxDataGridModule,
    DxAutocompleteModule
  ]
})
export class CreateCustomerModule { }
