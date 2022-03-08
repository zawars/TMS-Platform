import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { UtilityService } from 'src/app/services/utility.service';
declare var $: any;

@Component({
  selector: 'app-area',
  templateUrl: './area.component.html',
  styleUrls: ['./area.component.scss']
})
export class AreaComponent implements OnInit {
  areaList: Array<any> = new Array();

  constructor(private apiService: ApiService, private utilityService: UtilityService) {
    this.utilityService.breadcrumb = 'Area';

    this.apiService.get('/area').subscribe((response: any) => {
      this.areaList = response;
      setTimeout(() => { 
        $('#zero_config').DataTable();
      }, 500);
    });
  }

  ngOnInit() {
  }

}
