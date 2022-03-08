import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OrderDetailsComponent } from './create-order.component';
import { DropdownResolverService } from 'src/app/resolvers/dropdown-resolver.service';

const routes: Routes = [
  {
    path: '',
    component: OrderDetailsComponent,
    resolve: {
      dropdowns: DropdownResolverService
    },
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrderDetailsRoutingModule { }
