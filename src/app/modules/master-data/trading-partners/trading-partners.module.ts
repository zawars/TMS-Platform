import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TradingPartnersRoutingModule } from './trading-partners-routing.module';
import { DxDataGridModule } from 'devextreme-angular';
import { I18nModule } from 'src/app/shared/i18n/i18n.module';
import { TradingPartnersComponent } from './trading-partners.component';
import { MatPaginatorModule } from '@angular/material/paginator';

@NgModule({
  declarations: [TradingPartnersComponent],
  imports: [
    CommonModule,
    TradingPartnersRoutingModule,
    DxDataGridModule,
    I18nModule,
    MatPaginatorModule
  ]
})
export class TradingPartnersModule { }
