import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SettingsComponent } from './settings.component';

const routes: Routes = [
  {
    path: '',
    component: SettingsComponent,
    children: [
      {
        path: '',
        redirectTo: 'field-administration'
      },
      {
        path: 'field-administration',
        loadChildren: () => import('./field-administration/field-administration.module').then(mod => mod.FieldAdministrationModule),
      },
      {
        path: 'user-management',
        loadChildren: () => import('./user-management/user-management.module').then(mod => mod.UserManagementModule),
      },
      {
        path: 'translation',
        loadChildren: () => import('./translation/translation.module').then(mod => mod.TranslationModule)
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule { }
