import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ContractsRoutingModule } from './contracts-routing.module';
import { ContractsComponent } from '../contracts/contracts.component';
import { DxDataGridModule } from 'devextreme-angular';
import { I18nModule } from 'src/app/shared/i18n/i18n.module';
import { MatPaginatorModule } from '@angular/material/paginator';

@NgModule({
  declarations: [ContractsComponent],
  imports: [
    CommonModule,
    ContractsRoutingModule,
    DxDataGridModule,
    I18nModule,
    MatPaginatorModule
  ]
})
export class ContractsModule { }
