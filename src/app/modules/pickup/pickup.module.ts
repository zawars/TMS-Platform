import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DxSelectBoxModule, DxTextBoxModule, DxLoadPanelModule, DxDataGridModule, DxScrollViewModule } from 'devextreme-angular';
import { I18nModule } from 'src/app/shared/i18n/i18n.module';
import { PickupRoutingModule } from './pickup-routing.module';
import { PickupComponent } from './pickup.component';
import { MatPaginatorModule } from '@angular/material/paginator';

@NgModule({
  declarations: [PickupComponent],
  imports: [
    CommonModule,
    PickupRoutingModule,
    DxSelectBoxModule,
    DxTextBoxModule,
    DxLoadPanelModule,
    DxDataGridModule,
    I18nModule,
    DxScrollViewModule,
    MatPaginatorModule
  ]
})
export class PickupModule { }
