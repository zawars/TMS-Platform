import { Component, OnInit, TemplateRef, ViewChild, ElementRef } from '@angular/core';
import { UtilityService } from '../services/utility.service';
import { ApiService } from 'src/app/services/api.service';
import * as moment from 'moment';
import { AuthService } from 'src/app/services/auth.service';
import { DxChartComponent } from 'devextreme-angular';
import { Subscription } from 'rxjs';
import { SocketService } from '../services/socket.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  populationByRegions = [];
  dataSource = [];
  drillDownData = [];
  dataSourceDrillDown = [];
  isFirstLevel: boolean = true;
  orderCountObj: any = {};

  constructor(private utilityService: UtilityService, private apiService: ApiService,
    private socket: SocketService) {
    this.utilityService.breadcrumb = "Dashboard";
    this.initSocketEvents();

    this.socket.emit('dashboardOrderCount', {});

    this.populationByRegions = [{
      region: "Asia",
      val: 4119626293
    }, {
      region: "Africa",
      val: 1012956064
    }, {
      region: "Northern America",
      val: 344124520
    }, {
      region: "Latin America and the Caribbean",
      val: 590946440
    }, {
      region: "Europe",
      val: 727082222
    }, {
      region: "Oceania",
      val: 35104756
    }];

    this.dataSource = [{
      state: "Germany",
      young: 6.7,
      middle: 28.6,
      older: 5.1
    }, {
      state: "Japan",
      young: 9.6,
      middle: 43.4,
      older: 9
    }, {
      state: "Russia",
      young: 13.5,
      middle: 49,
      older: 5.8
    }, {
      state: "USA",
      young: 30,
      middle: 90.3,
      older: 14.5
    }];

    this.drillDownData = [
      { arg: "Asia", val: 3007613498, parentID: "" },
      { arg: "North America", val: 493603615, parentID: "" },
      { arg: "Europe", val: 438575293, parentID: "" },
      { arg: "Africa", val: 381331438, parentID: "" },
      { arg: "South America", val: 331126555, parentID: "" },
      { arg: "Nigeria", val: 181562056, parentID: "Africa" },
      { arg: "Egypt", val: 88487396, parentID: "Africa" },
      { arg: "Congo", val: 77433744, parentID: "Africa" },
      { arg: "Morocco", val: 33848242, parentID: "Africa" },
      { arg: "China", val: 1380083000, parentID: "Asia" },
      { arg: "India", val: 1306687000, parentID: "Asia" },
      { arg: "Pakistan", val: 193885498, parentID: "Asia" },
      { arg: "Japan", val: 126958000, parentID: "Asia" },
      { arg: "Russia", val: 146804372, parentID: "Europe" },
      { arg: "Germany", val: 82175684, parentID: "Europe" },
      { arg: "Turkey", val: 79463663, parentID: "Europe" },
      { arg: "France", val: 66736000, parentID: "Europe" },
      { arg: "United Kingdom", val: 63395574, parentID: "Europe" },
      { arg: "United States", val: 325310275, parentID: "North America" },
      { arg: "Mexico", val: 121005815, parentID: "North America" },
      { arg: "Canada", val: 36048521, parentID: "North America" },
      { arg: "Cuba", val: 11239004, parentID: "North America" },
      { arg: "Brazil", val: 205737996, parentID: "South America" },
      { arg: "Colombia", val: 48400388, parentID: "South America" },
      { arg: "Venezuela", val: 30761000, parentID: "South America" },
      { arg: "Peru", val: 28220764, parentID: "South America" },
      { arg: "Chile", val: 18006407, parentID: "South America" }
    ];
    this.dataSourceDrillDown = this.filterData('');
  }

  ngOnInit() {
  }

  onButtonClick() {
    if (!this.isFirstLevel) {
      this.isFirstLevel = true;
      this.dataSourceDrillDown = this.filterData("");
    }
  }

  onPointClick(e) {
    if (this.isFirstLevel) {
      this.isFirstLevel = false;
      this.dataSourceDrillDown = this.filterData(e.target.originalArgument);
    }
  }

  filterData(name) {
    return this.drillDownData.filter(function (item) {
      return item.parentID === name;
    });
  }

  initSocketEvents() {
    this.socket.on('dashboardOrderCount', response => {
      this.orderCountObj = response;
    });
  }

}