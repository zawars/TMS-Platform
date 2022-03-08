import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';

@Injectable()
export class SocketService extends Socket {

  constructor() {
    super({
      url: 'http://109.203.126.97:1344', options: {
        query: {
          token: localStorage.getItem('token'),
          userId: JSON.parse(localStorage.getItem('userObj')).id
        }
      }
    });
    // super({
    //   url: 'http://localhost:1337',
    //   options: {
    //     query: {
    //       token: localStorage.getItem('token'),
    //       userId: JSON.parse(localStorage.getItem('userObj')).id
    //     }
    //   }
    // });
  }
}
