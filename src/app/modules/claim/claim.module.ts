import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClaimRoutingModule } from './claim-routing.module';
import { ClaimComponent } from './claim.component';
import { DxSelectBoxModule, DxTextBoxModule, DxDataGridModule } from 'devextreme-angular';
import { I18nModule } from 'src/app/shared/i18n/i18n.module';
import { MatPaginatorModule } from '@angular/material/paginator';

@NgModule({
  declarations: [ClaimComponent],
  imports: [
    CommonModule,
    ClaimRoutingModule,
    DxSelectBoxModule,
    DxTextBoxModule,
    DxDataGridModule,
    I18nModule,
    MatPaginatorModule
  ]
})
export class ClaimModule { }
