import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BreadCrumbsComponent } from './breadcrumbs.component';

@NgModule({
    imports: [RouterModule, CommonModule],
    declarations: [BreadCrumbsComponent],
    exports: [BreadCrumbsComponent],
})

export class BreadCrumbsModule { }
