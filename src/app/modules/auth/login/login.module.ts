import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoginRoutingModule } from './login-routing.module';
import { LoginComponent } from './login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { I18nModule } from 'src/app/shared/i18n/i18n.module';
import { DxGalleryModule } from 'devextreme-angular';
import { HeaderModule } from 'src/app/shared/header/header.module';

@NgModule({
  declarations: [LoginComponent],
  imports: [
    CommonModule,
    LoginRoutingModule,
    I18nModule,
    DxGalleryModule,
    ReactiveFormsModule,
    HeaderModule
  ]
})
export class LoginModule { }
