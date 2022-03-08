import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrderDetailsRoutingModule } from './create-order-routing.module';
import { OrderDetailsComponent } from './create-order.component';
import { DxSelectBoxModule, DxTextBoxModule, DxDataGridModule, DxDateBoxModule, DxCheckBoxModule, DxAutocompleteModule, DxLoadPanelModule } from 'devextreme-angular';
import { I18nModule } from 'src/app/shared/i18n/i18n.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [OrderDetailsComponent],
  imports: [
    CommonModule,
    OrderDetailsRoutingModule,
    DxSelectBoxModule,
    DxTextBoxModule,
    DxDataGridModule,
    I18nModule,
    DxDataGridModule,
    DxDateBoxModule,
    DxCheckBoxModule,
    DxAutocompleteModule,
    DxLoadPanelModule,
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class OrderDetailsModule { }
