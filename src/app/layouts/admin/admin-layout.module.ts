import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminLayoutComponent } from './admin-layout.component';
import { AdminLayoutRoutingModule } from './admin-layout-routing.module';
import { HeaderModule } from 'src/app/shared/header/header.module';
import { SidebarModule } from 'src/app/shared/sidebar/sidebar.module';
import { SocketIoConfig, SocketIoModule } from 'ngx-socket-io';
import { SocketService } from 'src/app/services/socket.service';
import { TimeagoModule } from 'ngx-timeago';

@NgModule({
  imports: [
    CommonModule,
    AdminLayoutRoutingModule,
    HeaderModule,
    SidebarModule,
    SocketIoModule,
    TimeagoModule.forRoot(),
  ],
  declarations: [AdminLayoutComponent],
  providers: [SocketService]
})
export class AdminLayoutModule { }
