import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { I18nModule } from 'src/app/shared/i18n/i18n.module';
import { DxDataGridModule, DxDateBoxModule, DxCheckBoxModule, DxAutocompleteModule, DxLoadPanelModule, DxSelectBoxModule, DxTextBoxModule } from 'devextreme-angular';
import { CreatePickupRoutingModule } from './create-pickup-routing.module';
import { CreatePickupComponent } from './create-pickup.component';

@NgModule({
  declarations: [CreatePickupComponent],
  imports: [
    CommonModule,
    CreatePickupRoutingModule,
    ReactiveFormsModule,
    I18nModule,
    DxDataGridModule,
    DxDateBoxModule,
    DxCheckBoxModule,
    DxAutocompleteModule,
    DxLoadPanelModule,
    FormsModule,
    ReactiveFormsModule,
    DxSelectBoxModule,
    DxTextBoxModule
  ]
})
export class CreatePickupModule { }
