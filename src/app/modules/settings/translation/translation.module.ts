import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslationRoutingModule } from './translation-routing.module';
import { TranslationComponent } from '../translation/translation.component';
import { DxDataGridModule } from 'devextreme-angular';
import { I18nModule } from 'src/app/shared/i18n/i18n.module';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [TranslationComponent],
  imports: [
    CommonModule,
    TranslationRoutingModule,
    DxDataGridModule,
    I18nModule,
    FormsModule,
  ]
})
export class TranslationModule { }
