import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TradingPartnersComponent } from './trading-partners.component';

const routes: Routes = [
  {
    path: '',
    component: TradingPartnersComponent,
  },
  {
    path: 'create',
    loadChildren: () => import('./create-trading-partners/create-trading-partners.module').then(mod => mod.CreateTradingPartnersModule)
  },
  {
    path: ':id',
    loadChildren: () => import('./create-trading-partners/create-trading-partners.module').then(mod => mod.CreateTradingPartnersModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TradingPartnersRoutingModule { }
