import { Component, OnInit } from '@angular/core';
import { UtilityService } from 'src/app/services/utility.service';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { SocketService } from 'src/app/services/socket.service';
declare var $: any;

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss']
})
export class OrderComponent implements OnInit {
  ordersList: any = [];
  backupOrdersList: any = [];
  totalCount = 0;

  constructor(private utilityService: UtilityService, private socket: SocketService, private apiService: ApiService, ) {
    this.utilityService.breadcrumb = 'Orders';

    this.getOrders();
    this.initSocketEvents();
    this.socket.emit('placedOrdersCount', {});
  }

  ngOnInit() {
  }

  getOrders() {
    this.apiService.get('/orders/placed').subscribe((response: any) => {   // /placed
      this.ordersList = response;
      this.backupOrdersList = Object.assign(response);
    });
  }

  initSocketEvents() {
    this.socket.on('placedOrdersCount', count => {
      this.totalCount = count;
    });

    this.socket.on('placedOrdersIndex', result => {
      this.ordersList = result;
    });
  }

  onPageChange(e) {
    this.socket.emit('placedOrdersIndex', { pageNumber: e.pageIndex, pageSize: e.pageSize });
  }

}
