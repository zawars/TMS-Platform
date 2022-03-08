import { Component, OnInit } from '@angular/core';
import { UtilityService } from 'src/app/services/utility.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-quote',
  templateUrl: './quote.component.html',
  styleUrls: ['./quote.component.scss']
})
export class QuoteComponent implements OnInit {

  constructor(private utilityService: UtilityService, private router: Router) {
    this.utilityService.breadcrumb = 'Quote';
  }

  ngOnInit() {
  }
}
