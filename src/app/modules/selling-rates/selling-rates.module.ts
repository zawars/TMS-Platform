import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SellingRatesRoutingModule } from './selling-rates-routing.module';
import { SellingRatesComponent } from './selling-rates.component';

@NgModule({
  declarations: [SellingRatesComponent],
  imports: [
    CommonModule,
    SellingRatesRoutingModule
  ]
})
export class SellingRatesModule { }
