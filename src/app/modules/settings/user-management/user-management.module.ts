import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserManagementRoutingModule } from './user-management-routing.module';
import { UserManagementComponent } from './user-management.component';
import { DxDataGridModule, DxSelectBoxModule, DxTextBoxModule, DxCheckBoxModule, DxTagBoxModule, DxAutocompleteModule } from 'devextreme-angular';
import { I18nModule } from 'src/app/shared/i18n/i18n.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

@NgModule({
  declarations: [UserManagementComponent],
  imports: [
    CommonModule,
    UserManagementRoutingModule,
    DxDataGridModule,
    I18nModule,
    ReactiveFormsModule,
    FormsModule,
    DxSelectBoxModule,
    DxTextBoxModule,
    DxCheckBoxModule,
    DxTagBoxModule,
    DxAutocompleteModule
  ]
})
export class UserManagementModule { }
