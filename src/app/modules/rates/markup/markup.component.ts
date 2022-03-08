import { Component, OnInit } from '@angular/core';
import { UtilityService } from 'src/app/services/utility.service';
import { ApiService } from 'src/app/services/api.service';
import { SocketService } from 'src/app/services/socket.service';
declare var $: any;

@Component({
  selector: 'app-markup',
  templateUrl: './markup.component.html',
  styleUrls: ['./markup.component.scss']
})
export class MarkupComponent implements OnInit {
  markupCollection: Array<any> = new Array();
  totalCount = 0;

  constructor(private utilityService: UtilityService, private apiService: ApiService, private socket: SocketService) {
    this.utilityService.breadcrumb = 'Markup';

    this.apiService.get('/markup').subscribe((response: any) => {
      this.markupCollection = response;
    });

    this.initSocketEvents();
    this.socket.emit('markupCount', {});
  }

  ngOnInit() {
  }

  initSocketEvents() {
    this.socket.on('markupCount', count => {
      this.totalCount = count;
    });

    this.socket.on('markupIndex', result => {
      this.markupCollection = result;
    });
  }

  onPageChange(e) {
    this.socket.emit('markupIndex', { pageNumber: e.pageIndex, pageSize: e.pageSize });
  }
}
