import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SellingRatesComponent } from './selling-rates.component';

const routes: Routes = [
  {
    path: '',
    component: SellingRatesComponent,
    children: [
      {
        path: 'markup',
        loadChildren: () => import('../rates/markup/markup.module').then(mod => mod.MarkupModule)
      },
      {
        path: 'markup/create',
        loadChildren: () => import('../rates/markup/create-markup/create-markup.module').then(mod => mod.CreateMarkupModule)
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SellingRatesRoutingModule { }
