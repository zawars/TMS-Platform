import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ForgetRoutingModule } from './forget-routing.module';
import { ForgetComponent } from './forget.component';
import { I18nModule } from 'src/app/shared/i18n/i18n.module';
import { DxGalleryModule } from 'devextreme-angular';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';

@NgModule({
  declarations: [ForgetComponent],
  imports: [
    CommonModule,
    ForgetRoutingModule,
    I18nModule,
    DxGalleryModule,
    ReactiveFormsModule,
    NgxMaskModule.forRoot(),
  ]
})
export class ForgetModule { }
