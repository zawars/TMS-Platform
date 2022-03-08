import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { QuoteRoutingModule } from './quote-routing.module';
import { QuoteComponent } from '../quote/quote.component';
import { DxSelectBoxModule, DxTextBoxModule } from 'devextreme-angular';

@NgModule({
  declarations: [QuoteComponent],
  imports: [
    CommonModule,
    QuoteRoutingModule,
    DxSelectBoxModule,
    DxTextBoxModule
  ]
})
export class QuoteModule { }
