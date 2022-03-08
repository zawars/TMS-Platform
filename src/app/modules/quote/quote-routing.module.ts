import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { QuoteComponent } from './quote.component';

const routes: Routes = [
  {
    path: '',
    component: QuoteComponent,
    // children: [
    //   {
    //     path: 'contracts',
    //     loadChildren: () => import('./contracts/contracts.module').then(mod => mod.ContractsModule)
    //   },
    //   {
    //     path: 'create',
    //     loadChildren: () => import('./contracts/create-contract/create-contract.module').then(mod => mod.CreateContractModule)
    //   }
    // ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class QuoteRoutingModule { }
