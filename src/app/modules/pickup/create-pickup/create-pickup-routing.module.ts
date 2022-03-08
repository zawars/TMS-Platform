import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DropdownResolverService } from 'src/app/resolvers/dropdown-resolver.service';
import { CreatePickupComponent } from './create-pickup.component';

const routes: Routes = [
  {
    path: '',
    component: CreatePickupComponent,
    resolve: {
      dropdowns: DropdownResolverService
    },
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CreatePickupRoutingModule { }
