import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CreateClaimComponent } from './create-claim.component';
import { DropdownResolverService } from 'src/app/resolvers/dropdown-resolver.service';

const routes: Routes = [
  {
    path: '',
    component: CreateClaimComponent,
    resolve: {
      dropdowns: DropdownResolverService
    },
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CreateClaimRoutingModule { }
