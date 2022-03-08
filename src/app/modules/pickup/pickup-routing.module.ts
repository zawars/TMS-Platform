import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DropdownResolverService } from 'src/app/resolvers/dropdown-resolver.service';
import { RolesGuard } from 'src/app/guards/roles.guard';
import { PickupComponent } from './pickup.component';

const routes: Routes = [
  {
    path: '',
    component: PickupComponent,
    resolve: {
      dropdowns: DropdownResolverService
    }
  },
  {
    path: 'create',
    loadChildren: () => import('./create-pickup/create-pickup.module').then(mod => mod.CreatePickupModule)
  },
  {
    path: 'edit',
    loadChildren: () => import('./create-pickup/create-pickup.module').then(mod => mod.CreatePickupModule)
  },
  // {
  //   path: ':id',
  //   loadChildren: () => import('./create-pickup/create-pickup.module').then(mod => mod.CreatePickupModule)
  // },
  {
    path: 'invoice',
    canActivate: [RolesGuard],
    data: { allowedRoles: ['Third Party', 'Admin'] },
    loadChildren: () => import('./invoice-2/invoice-2.module').then(mod => mod.Invoice2Module)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PickupRoutingModule { }
