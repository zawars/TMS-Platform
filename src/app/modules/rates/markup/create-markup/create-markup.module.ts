import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CreateMarkupRoutingModule } from './create-markup-routing.module';
import { CreateMarkupComponent } from './create-markup.component';
import { DxSelectBoxModule, DxTextBoxModule, DxDateBoxModule, DxCheckBoxModule, DxAutocompleteModule, DxLookupModule } from 'devextreme-angular';
import { I18nModule } from 'src/app/shared/i18n/i18n.module';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [CreateMarkupComponent],
  imports: [
    CommonModule,
    CreateMarkupRoutingModule,
    DxSelectBoxModule,
    DxTextBoxModule,
    I18nModule,
    ReactiveFormsModule,
    DxDateBoxModule,
    DxCheckBoxModule,
    DxAutocompleteModule,
  ]
})
export class CreateMarkupModule { }
