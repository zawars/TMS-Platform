import { Component, OnInit } from '@angular/core';
import { UtilityService } from 'src/app/services/utility.service';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { SocketService } from 'src/app/services/socket.service';
declare var $: any;

@Component({
  selector: 'app-claim',
  templateUrl: './claim.component.html',
  styleUrls: ['./claim.component.scss']
})
export class ClaimComponent implements OnInit {
  claimsList: any = [];
  totalCount = 0;

  constructor(private utilityService: UtilityService, private apiService: ApiService, private socket: SocketService) {
    this.utilityService.breadcrumb = 'Claims';
    this.getClaims();

    this.initSocketEvents();
    this.socket.emit('claimsCount', {});
  }

  ngOnInit() {
  }

  getClaims() {
    this.apiService.get('/claims?limit=10').subscribe((response: any) => {   // /placed
      this.claimsList = response;
    });
  }

  initSocketEvents() {
    this.socket.on('claimsCount', count => {
      this.totalCount = count;
    });

    this.socket.on('claimsIndex', result => {
      this.claimsList = result;
    });
  }

  onPageChange(e) {
    this.socket.emit('claimsIndex', { pageNumber: e.pageIndex, pageSize: e.pageSize });
  }
}
