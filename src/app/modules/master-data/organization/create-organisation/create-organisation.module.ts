import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CreateOrganisationRoutingModule } from './create-organisation-routing.module';
import { CreateOrganisationComponent } from './create-organisation.component';
import { ReactiveFormsModule } from '@angular/forms';
import { I18nModule } from 'src/app/shared/i18n/i18n.module';
import { DxSelectBoxModule } from 'devextreme-angular';

@NgModule({
  declarations: [CreateOrganisationComponent],
  imports: [
    CommonModule,
    CreateOrganisationRoutingModule,
    ReactiveFormsModule,
    I18nModule,
    DxSelectBoxModule
  ]
})
export class CreateOrganisationModule { }
