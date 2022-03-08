import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Invoice2RoutingModule } from './invoice-2-routing.module';
import { Invoice2Component } from './invoice-2.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { I18nModule } from 'src/app/shared/i18n/i18n.module';
import { DxDataGridModule, DxDateBoxModule, DxCheckBoxModule, DxAutocompleteModule, DxLoadPanelModule, DxSelectBoxModule, DxTextBoxModule } from 'devextreme-angular';

@NgModule({
  declarations: [Invoice2Component],
  imports: [
    CommonModule,
    Invoice2RoutingModule,
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
export class Invoice2Module { }
