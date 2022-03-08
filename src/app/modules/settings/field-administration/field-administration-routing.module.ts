import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FieldAdministrationComponent } from './field-administration.component';
import { DropdownResolverService } from 'src/app/resolvers/dropdown-resolver.service';

const routes: Routes = [
  {
    path: '',
    component: FieldAdministrationComponent,
    resolve: {
      dropdowns: DropdownResolverService
    },
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FieldAdministrationRoutingModule { }