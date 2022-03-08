import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MasterDataComponent } from './master-data.component';

const routes: Routes = [
  {
    path: '',
    component: MasterDataComponent,
    children: [
      {
        path: 'tradingPartners',
        loadChildren: () => import('./trading-partners/trading-partners.module').then(mod => mod.TradingPartnersModule)
      },
      {
        path: 'organisation',
        loadChildren: () => import('./organization/organization.module').then(mod => mod.OrganizationModule)
      },
      // {
      //   path: 'area',
      //   loadChildren: () => import('./area/area.module').then(mod => mod.AreaModule)
      // },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MasterDataRoutingModule { }
