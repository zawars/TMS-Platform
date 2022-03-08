import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VerifyRoutingModule } from './verify-routing.module';
import { VerifyComponent } from './verify.component';
import { FormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';
import { I18nModule } from 'src/app/shared/i18n/i18n.module';

@NgModule({
  declarations: [VerifyComponent],
  imports: [
    CommonModule,
    VerifyRoutingModule,
    I18nModule,
    NgxMaskModule.forRoot(),
    FormsModule
  ]
})
export class VerifyModule { }
