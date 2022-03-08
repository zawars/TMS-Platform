import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsComponent } from '../settings/settings.component';
import { DxSelectBoxModule, DxTextBoxModule } from 'devextreme-angular';

@NgModule({
  declarations: [SettingsComponent],
  imports: [
    CommonModule,
    SettingsRoutingModule,
    DxSelectBoxModule,
    DxTextBoxModule
  ]
})
export class SettingsModule { }
