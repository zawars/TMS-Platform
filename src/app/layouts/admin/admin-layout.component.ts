import { Component } from '@angular/core';
import { UtilityService } from 'src/app/services/utility.service';
import { trigger, transition, query, style, animate, group } from '@angular/animations';
import { SocketService } from 'src/app/services/socket.service';

@Component({
  selector: 'app-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css'],
  animations: [
    trigger('routerAnimation', [
      transition('* <=> *', [
        query(':enter, :leave', [
          style({
            position: 'absolute',
            right: 0,
            width: '80%'
          })
        ], { optional: true }),
        query(':enter', [
          style({ right: '-80%' })
        ]),
        group([
          query(':leave', [
            animate('600ms ease', style({ right: '80%' }))
          ], { optional: true }),
          query(':enter', [
            animate('600ms ease', style({ right: '0%' }))
          ])
        ]),
        // Normalize the page style... Might not be necessary

        // Required only if you have child animations on the page
        // query(':leave', animateChild()),
        // query(':enter', animateChild()),
      ]),
    ])
  ]
})

export class AdminLayoutComponent {
  isToggle: boolean = false;

  constructor(private utilityService: UtilityService, private socket: SocketService) {
    this.isToggle = localStorage.getItem('sidebar') == 'on' ? true : false;

    this.socket.on('connect', () => {
      console.log('Connected to server with ID: ' + this.socket.ioSocket.id);
      console.log(this.socket.ioSocket)
    });

    this.socket.on('message', data => {
      console.log(data)
    });

    if (localStorage.getItem('token') != undefined) {
      this.socket.connect();
    }
  }

  ngOnInit() {
  }

  updateToggle(e) {
    this.isToggle = e.isToggle;
    this.utilityService.sideBarSubject.next({ isToggle: this.isToggle });
  }
}
