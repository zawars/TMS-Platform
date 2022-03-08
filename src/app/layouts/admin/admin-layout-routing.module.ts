import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminLayoutComponent } from './admin-layout.component';
import { RolesGuard } from 'src/app/guards/roles.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: AdminLayoutComponent,
    loadChildren: () => import('../../dashboard/dashboard.module').then(mod => mod.DashboardModule)
  },
  {
    path: 'quote',
    data: {
      allowedRoles: ['Admin']
    },
    canActivate: [RolesGuard],
    component: AdminLayoutComponent,
    loadChildren: () => import('../../modules/quote/quote.module').then(mod => mod.QuoteModule)
  },
  {
    path: 'order',
    component: AdminLayoutComponent,
    loadChildren: () => import('../../modules/order/order.module').then(mod => mod.OrderModule)
  },
  {
    path: 'masterData',
    component: AdminLayoutComponent,
    data: {
      allowedRoles: ['Admin']
    },
    canActivate: [RolesGuard],
    loadChildren: () => import('../../modules/master-data/master-data.module').then(mod => mod.MasterDataModule)
  },
  {
    path: 'rates',
    component: AdminLayoutComponent,
    data: {
      allowedRoles: ['Admin']
    },
    canActivate: [RolesGuard],
    loadChildren: () => import('../../modules/rates/rate-management.module').then(mod => mod.RateManagementModule)
  },
  {
    path: 'orders',
    component: AdminLayoutComponent,
    data: {
      allowedRoles: ['Admin']
    },
    canActivate: [RolesGuard],
    loadChildren: () => import('../../modules/order/order.module').then(mod => mod.OrderModule)
  },
  {
    path: 'claim',
    component: AdminLayoutComponent,
    data: {
      allowedRoles: ['Admin']
    },
    canActivate: [RolesGuard],
    loadChildren: () => import('../../modules/claim/claim.module').then(mod => mod.ClaimModule)
  },
  {
    path: 'pickup',
    component: AdminLayoutComponent,
    data: {
      allowedRoles: ['Admin']
    },
    canActivate: [RolesGuard],
    loadChildren: () => import('../../modules/pickup/pickup.module').then(mod => mod.PickupModule)
  },
  {
    path: 'settings',
    component: AdminLayoutComponent,
    data: {
      allowedRoles: ['Admin']
    },
    canActivate: [RolesGuard],
    loadChildren: () => import('../../modules/settings/settings.module').then(mod => mod.SettingsModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminLayoutRoutingModule { }
