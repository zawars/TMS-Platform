import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OrganizationComponent } from './organization.component';

const routes: Routes = [
  {
    path: '',
    component: OrganizationComponent
  },
  {
    path: 'create',
    loadChildren: () => import('./create-organisation/create-organisation.module').then(mod => mod.CreateOrganisationModule)
  },
  {
    path: ':id',
    loadChildren: () => import('./create-organisation/create-organisation.module').then(mod => mod.CreateOrganisationModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrganizationRoutingModule { }
