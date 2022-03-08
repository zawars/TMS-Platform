import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './header.component';
import { TimeagoModule } from 'ngx-timeago';

@NgModule({
  imports: [RouterModule, CommonModule, TimeagoModule.forChild(),],
  declarations: [HeaderComponent],
  exports: [HeaderComponent],
})

export class HeaderModule { }
