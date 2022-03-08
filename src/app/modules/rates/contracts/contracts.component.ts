import { Component, OnInit } from '@angular/core';
import { UtilityService } from 'src/app/services/utility.service';
import { ApiService } from 'src/app/services/api.service';
import { SocketService } from 'src/app/services/socket.service';

@Component({
  selector: 'app-contracts',
  templateUrl: './contracts.component.html',
  styleUrls: ['./contracts.component.scss']
})
export class ContractsComponent implements OnInit {
  contractsList: Array<any> = new Array();
  totalCount = 0;

  constructor(private apiService: ApiService, private utilityService: UtilityService, private socket: SocketService) {
    this.utilityService.breadcrumb = 'Contracts';

    this.apiService.get('/contracts?limit=10').subscribe((response: any) => {
      this.contractsList = response;
    });

    this.initSocketEvents();
    this.socket.emit('contractsCount', {});
  }

  ngOnInit() {
  }

  initSocketEvents() {
    this.socket.on('contractsCount', count => {
      this.totalCount = count;
    });

    this.socket.on('contractsIndex', result => {
      this.contractsList = result;
    });
  }

  onPageChange(e) {
    this.socket.emit('contractsIndex', { pageNumber: e.pageIndex, pageSize: e.pageSize });
  }
}
