import { Component, OnInit } from '@angular/core';
import { UtilityService } from 'src/app/services/utility.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { trigger, style, transition, animate, query, stagger, animateChild, state } from '@angular/animations';
import { SocketService } from 'src/app/services/socket.service';
declare var $: any;

@Component({
  selector: 'app-pickup',
  templateUrl: './pickup.component.html',
  styleUrls: ['./pickup.component.scss'],
  animations: [
    trigger('notes', [
      state('void', style({
        opacity: 0
      })),
      transition('void <=> *', animate(700)),
    ]),
  ]
})
export class PickupComponent implements OnInit {
  tabsList;
  isSaved: boolean = true;
  isPalced: boolean = false;
  ordersList: any = [];
  loadingVisible: boolean = false;
  isVendor: boolean = false;
  isShipmentDisabled: boolean = false;
  isNoteDisabled: boolean = false;
  tabValue;
  public shipmentStatusOptions: Array<any> = new Array();
  totalCount = 0;

  constructor(private utilityService: UtilityService, private router: Router, private apiService: ApiService,
    private route: ActivatedRoute, private authService: AuthService, private socket: SocketService) {
    this.utilityService.breadcrumb = 'Pickup Requests';

    this.getOrders();
    this.initSocketEvents();
    this.socket.emit('pickupCount', {});
  }

  ngOnInit() {
    this.utilityService.initializeDropdowns(this.route);
  }

  getOrders() {
    this.ordersList = [];
    this.loadingVisible = true;
    this.apiService.get(`/orders/pickup/Pickup`).subscribe((response: any) => {
      this.ordersList = response;
      this.loadingVisible = false;
    });
  }

  gridRowClick(data) {
    this.router.navigate(['/pickup/create', { orderId: data.key.id }]);
  }

  initSocketEvents() {
    this.socket.on('pickupCount', count => {
      this.totalCount = count;
    });

    this.socket.on('pickupIndex', result => {
      this.ordersList = result;
    });
  }

  onPageChange(e) {
    this.socket.emit('pickupIndex', { pageNumber: e.pageIndex, pageSize: e.pageSize });
  }
}
