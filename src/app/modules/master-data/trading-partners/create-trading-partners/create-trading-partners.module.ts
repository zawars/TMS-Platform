import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateTradingPartnersComponent } from './create-trading-partners.component';
import { CreateTradingPartnersRoutingModule } from './create-trading-partners-routing.module';

import { I18nModule } from 'src/app/shared/i18n/i18n.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DxTagBoxModule, DxSelectBoxModule, DxTextBoxModule, DxCheckBoxModule, DxDataGridModule, DxAutocompleteModule } from 'devextreme-angular';

@NgModule({
  declarations: [CreateTradingPartnersComponent],
  imports: [
    CommonModule,
    CreateTradingPartnersRoutingModule,
    I18nModule,
    ReactiveFormsModule,
    FormsModule,
    DxTagBoxModule,
    DxSelectBoxModule,
    DxTextBoxModule,
    DxCheckBoxModule,
    DxDataGridModule,
    DxAutocompleteModule
  ]
})
export class CreateTradingPartnersModule { }
