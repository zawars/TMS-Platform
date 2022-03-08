import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layouts/admin/admin-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from 'src/app/guards/roles.guard';

export const AppRoutes: Routes = [
  // {
  //   path: '',
  //   redirectTo: 'dashboard',
  //   pathMatch: 'full',
  // },
  {
    path: '',
    canActivate: [AuthGuard],
    loadChildren: () => import('./layouts/admin/admin-layout.module').then(mod => mod.AdminLayoutModule)
  },
  {
    path: 'auth/login',
    component: AuthLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./modules/auth/login/login.module').then(mod => mod.LoginModule)
      },
    ],
  },
  {
    path: 'auth/forget',
    component: AuthLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./modules/auth/forget/forget.module').then(mod => mod.ForgetModule)
      },
    ],
  },
];
