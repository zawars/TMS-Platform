import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FieldAdministrationRoutingModule } from './field-administration-routing.module';
import { FieldAdministrationComponent } from './field-administration.component';
import { DxDataGridModule } from 'devextreme-angular';
import { I18nModule } from 'src/app/shared/i18n/i18n.module';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [FieldAdministrationComponent],
  imports: [
    CommonModule,
    FieldAdministrationRoutingModule,
    DxDataGridModule,
    I18nModule,
    FormsModule
  ]
})
export class FieldAdministrationModule { }
