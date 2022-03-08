import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ClaimComponent } from './claim.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: ClaimComponent,
      },
      {
        path: 'edit',
        loadChildren: () => import('./create-claim/create-claim.module').then(mod => mod.CreateClaimModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClaimRoutingModule { }
