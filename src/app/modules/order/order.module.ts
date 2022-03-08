import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrderRoutingModule } from './order-routing.module';
import { OrderComponent } from './order.component';
import { DxSelectBoxModule, DxTextBoxModule, DxDataGridModule } from 'devextreme-angular';
import { I18nModule } from 'src/app/shared/i18n/i18n.module';
import { MatPaginatorModule } from '@angular/material/paginator';

@NgModule({
  declarations: [OrderComponent],
  imports: [
    CommonModule,
    OrderRoutingModule,
    DxSelectBoxModule,
    DxTextBoxModule,
    DxDataGridModule,
    I18nModule,
    MatPaginatorModule,
  ]
})
export class OrderModule { }
