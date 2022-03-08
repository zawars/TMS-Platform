import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CreateAreaRoutingModule } from './create-area-routing.module';
import { I18nModule } from 'src/app/shared/i18n/i18n.module';
import { ReactiveFormsModule } from '@angular/forms';
import { DxSelectBoxModule, DxTextBoxModule, DxTagBoxModule, DxListModule, DxRadioGroupModule } from 'devextreme-angular';
import { CreateAreaComponent } from './create-area.component';

@NgModule({
  declarations: [CreateAreaComponent],
  imports: [
    CommonModule,
    CreateAreaRoutingModule,
    I18nModule,
    ReactiveFormsModule,
    DxSelectBoxModule,
    DxTextBoxModule,
    DxTagBoxModule,
    DxListModule,
    DxRadioGroupModule,
  ]
})
export class CreateAreaModule { }
