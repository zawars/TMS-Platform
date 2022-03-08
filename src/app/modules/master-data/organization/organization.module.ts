import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrganizationRoutingModule } from './organization-routing.module';
import { OrganizationComponent } from '../organization/organization.component';
import { I18nModule } from 'src/app/shared/i18n/i18n.module';
import { DxTreeListModule } from 'devextreme-angular';
import { MatPaginatorModule } from '@angular/material/paginator';

@NgModule({
  declarations: [OrganizationComponent],
  imports: [
    CommonModule,
    OrganizationRoutingModule,
    I18nModule,
    DxTreeListModule,
    MatPaginatorModule
  ]
})
export class OrganizationModule { }
