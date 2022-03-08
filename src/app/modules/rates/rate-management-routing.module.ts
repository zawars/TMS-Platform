import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RateManagementComponent } from './rate-management.component';

const routes: Routes = [
  {
    path: '',
    component: RateManagementComponent,
    children: [
      {
        path: 'contracts',
        loadChildren: () => import('./contracts/contracts.module').then(mod => mod.ContractsModule)
      },
      {
        path: 'contracts/create',
        loadChildren: () => import('./contracts/create-contract/create-contract.module').then(mod => mod.CreateContractModule)
      },
      {
        path: 'contracts/:id',
        loadChildren: () => import('./contracts/create-contract/create-contract.module').then(mod => mod.CreateContractModule)
      },
      {
        path: 'markup',
        loadChildren: () => import('./markup/markup.module').then(mod => mod.MarkupModule)
      },
      {
        path: 'markup/create',
        loadChildren: () => import('./markup/create-markup/create-markup.module').then(mod => mod.CreateMarkupModule)
      },
      {
        path: 'markup/:id',
        loadChildren: () => import('./markup/create-markup/create-markup.module').then(mod => mod.CreateMarkupModule)
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RateManagementRoutingModule { }
