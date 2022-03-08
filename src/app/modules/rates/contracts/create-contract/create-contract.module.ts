import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CreateContractRoutingModule } from './create-contract-routing.module';
import { CreateContractComponent } from './create-contract.component';
import { ReactiveFormsModule } from '@angular/forms';
import { I18nModule } from 'src/app/shared/i18n/i18n.module';
import { DxDataGridModule, DxDateBoxModule, DxSelectBoxModule, DxTextBoxModule } from 'devextreme-angular';

@NgModule({
  declarations: [CreateContractComponent],
  imports: [
    CommonModule,
    CreateContractRoutingModule,
    ReactiveFormsModule,
    I18nModule,
    DxDataGridModule,
    DxDateBoxModule,
    DxSelectBoxModule,
    DxTextBoxModule
  ]
})
export class CreateContractModule { }
