import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CreateClaimRoutingModule } from './create-claim-routing.module';
import { CreateClaimComponent } from './create-claim.component';
import { DxSelectBoxModule, DxTextBoxModule, DxDataGridModule, DxDateBoxModule, DxCheckBoxModule, DxAutocompleteModule, DxLoadPanelModule, DxScrollViewModule } from 'devextreme-angular';
import { I18nModule } from 'src/app/shared/i18n/i18n.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [CreateClaimComponent],
  imports: [
    CommonModule,
    CreateClaimRoutingModule,
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
    DxScrollViewModule
  ]
})
export class CreateClaimModule { }
