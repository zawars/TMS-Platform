import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { UtilityService } from 'src/app/services/utility.service';
import { SocketService } from 'src/app/services/socket.service';

@Component({
  selector: 'app-trading-partners',
  templateUrl: './trading-partners.component.html',
  styleUrls: ['./trading-partners.component.scss']
})
export class TradingPartnersComponent implements OnInit {
  tradingpartners: Array<any>;
  totalCount = 0;

  constructor(private apiService: ApiService, private utilityService: UtilityService, private socket: SocketService) {
    this.utilityService.breadcrumb = 'Trading Partner';

    this.apiService.get('/tradingPartners').subscribe((response: any) => {
      this.tradingpartners = response;
    });

    this.initSocketEvents();
    this.socket.emit('tradingPartnerCount', {});
  }

  ngOnInit() {
  }

  initSocketEvents() {
    this.socket.on('tradingPartnerCount', count => {
      this.totalCount = count;
    });

    this.socket.on('tradingPartnerIndex', result => {
      this.tradingpartners = result;
    });
  }

  onPageChange(e) {
    this.socket.emit('tradingPartnerIndex', { pageNumber: e.pageIndex, pageSize: e.pageSize });
  }

}
