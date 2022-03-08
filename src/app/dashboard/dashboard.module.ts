import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import {
  DxChartModule, DxPieChartModule, DxDataGridModule, DxAutocompleteModule,
  DxPopoverModule, DxSelectBoxModule, DxDateBoxModule, DxButtonModule
} from 'devextreme-angular';
import { I18nModule } from 'src/app/shared/i18n/i18n.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    DashboardRoutingModule,
    DxChartModule,
    DxPieChartModule,
    DxDataGridModule,
    I18nModule,
    DxAutocompleteModule,
    ReactiveFormsModule,
    FormsModule,
    DxPopoverModule,
    DxSelectBoxModule,
    DxDateBoxModule,
    DxPieChartModule,
    DxChartModule,
    DxButtonModule
  ],
  declarations: [DashboardComponent],
})
export class DashboardModule { }
