import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { SocketService } from 'src/app/services/socket.service';

@Component({
  selector: 'app-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.scss']
})
export class OrganizationComponent implements OnInit {
  organisationsList = new Array<any>();
  rootValueId = 0;
  totalCount = 0;

  constructor(private apiService: ApiService, private socket: SocketService) {
    this.apiService.get(`/organisation`).subscribe((response: any) => {
      this.organisationsList = response;
      // this.rootValueId = response[0].id;
    });

    this.initSocketEvents();
    this.socket.emit('organisationCount', {});
  }

  ngOnInit() {
  }

  initSocketEvents() {
    this.socket.on('organisationCount', count => {
      this.totalCount = count;
    });

    this.socket.on('organisationIndex', result => {
      this.organisationsList = result;
    });
  }

  onPageChange(e) {
    this.socket.emit('organisationIndex', { pageNumber: e.pageIndex, pageSize: e.pageSize });
  }
}
