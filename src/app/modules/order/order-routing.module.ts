import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OrderComponent } from './order.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: OrderComponent,
      },
      {
        path: 'create',
        loadChildren: () => import('./create-order/create-order.module').then(mod => mod.OrderDetailsModule)
      },
      {
        path: ':id',
        loadChildren: () => import('./create-order/create-order.module').then(mod => mod.OrderDetailsModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrderRoutingModule { }
