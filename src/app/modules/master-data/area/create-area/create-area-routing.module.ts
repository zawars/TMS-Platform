import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CreateAreaComponent } from './create-area.component';

const routes: Routes = [
  {
    path: '', component: CreateAreaComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CreateAreaRoutingModule { }
