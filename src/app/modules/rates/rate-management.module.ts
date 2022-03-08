import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RateManagementRoutingModule } from './rate-management-routing.module';
import { RateManagementComponent } from '../rates/rate-management.component';
import { DxSelectBoxModule, DxTextBoxModule } from 'devextreme-angular';

@NgModule({
  declarations: [RateManagementComponent],
  imports: [
    CommonModule,
    RateManagementRoutingModule,
    DxSelectBoxModule,
    DxTextBoxModule
  ]
})
export class RateManagementModule { }
