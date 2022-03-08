import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CreateCustomerComponent } from './create-customer.component';
import { DropdownResolverService } from 'src/app/resolvers/dropdown-resolver.service';

const routes: Routes = [
  {
    path: '',
    component: CreateCustomerComponent,
    resolve: {
      dropdowns: DropdownResolverService
    },
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CreateCustomerRoutingModule { }
