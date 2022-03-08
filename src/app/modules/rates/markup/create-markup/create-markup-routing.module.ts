import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CreateMarkupComponent } from './create-markup.component';
import { DropdownResolverService } from 'src/app/resolvers/dropdown-resolver.service';

const routes: Routes = [
  {
    path: '',
    component: CreateMarkupComponent,
    resolve: {
      dropdowns: DropdownResolverService
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CreateMarkupRoutingModule { }
