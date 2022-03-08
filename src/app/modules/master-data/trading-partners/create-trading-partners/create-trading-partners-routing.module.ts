import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CreateTradingPartnersComponent } from './create-trading-partners.component';
import { DropdownResolverService } from 'src/app/resolvers/dropdown-resolver.service';

const routes: Routes = [
  {
    path: '',
    component: CreateTradingPartnersComponent,
    resolve: {
      dropdowns: DropdownResolverService
    },
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CreateTradingPartnersRoutingModule { }
