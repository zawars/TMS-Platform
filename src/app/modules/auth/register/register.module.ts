import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RegisterRoutingModule } from './register-routing.module';
import { RegisterComponent } from './register.component';
import { NgxMaskModule } from 'ngx-mask';
import { DxTagBoxModule, DxSwitchModule, DxGalleryModule } from 'devextreme-angular';
import { I18nModule } from 'src/app/shared/i18n/i18n.module';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [RegisterComponent],
  imports: [
    CommonModule,
    RegisterRoutingModule,
    DxGalleryModule,
    FormsModule,
    I18nModule,
    DxSwitchModule,
    DxTagBoxModule,
    NgxMaskModule.forRoot(),
  ]
})
export class RegisterModule { }
