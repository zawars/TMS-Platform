import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CreateContractComponent } from './create-contract.component';
import { DropdownResolverService } from 'src/app/resolvers/dropdown-resolver.service';

const routes: Routes = [
  {
    path: '',
    component: CreateContractComponent,
    resolve: {
      dropdowns: DropdownResolverService
    },
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CreateContractRoutingModule { }
