import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Invoice2Component } from './invoice-2.component';
import { DropdownResolverService } from 'src/app/resolvers/dropdown-resolver.service';

const routes: Routes = [
  {
    path: '',
    component: Invoice2Component,
    resolve: {
      dropdowns: DropdownResolverService
    },
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class Invoice2RoutingModule { }
