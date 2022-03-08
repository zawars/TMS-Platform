import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MarkupComponent } from './markup.component';

const routes: Routes = [
  {
    path: '',
    component: MarkupComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MarkupRoutingModule { }
