import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MasterDataRoutingModule } from './master-data-routing.module';
import { MasterDataComponent } from './master-data.component';
import { DxTextBoxModule, DxSelectBoxModule } from 'devextreme-angular';

@NgModule({
  declarations: [MasterDataComponent],
  imports: [
    CommonModule,
    MasterDataRoutingModule,
    DxSelectBoxModule,
    DxTextBoxModule
  ]
})
export class MasterDataModule { }
