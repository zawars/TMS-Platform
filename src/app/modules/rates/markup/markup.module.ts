import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MarkupRoutingModule } from './markup-routing.module';
import { MarkupComponent } from './markup.component';
import { CreateMarkupComponent } from './create-markup/create-markup.component';
import { DxDataGridModule } from 'devextreme-angular';
import { I18nModule } from 'src/app/shared/i18n/i18n.module';
import { MatPaginatorModule } from '@angular/material/paginator';

@NgModule({
  declarations: [MarkupComponent],
  imports: [
    CommonModule,
    MarkupRoutingModule,
    DxDataGridModule,
    I18nModule,
    MatPaginatorModule
  ]
})
export class MarkupModule { }
