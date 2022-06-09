import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";

@Injectable()
export class ApiService {
  // public BASE_PATH = "http://localhost:1337/api/v1";
  public BASE_PATH = "http://109.203.126.97:1344/api/v1";
  public IMAGE_PATH = "http://109.203.126.97:1344/";
  public FrontEndPATH = "http://tms.megowork.solutions/#/";
  public httpOptions;
  accessToken: string;

  constructor(private http: HttpClient,) {
    if (this.accessToken == undefined) {
      this.accessToken = localStorage.getItem('token');
    }

    this.httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + this.accessToken
      })
    };
  }

  get(path) {
    this.checkHeaders();
    return this.http.get(this.BASE_PATH + path, this.httpOptions);
  }

  post(path, body) {
    return this.http.post(this.BASE_PATH + path, body, this.httpOptions);
  }

  put(path, body) {
    return this.http.put(this.BASE_PATH + path, body, this.httpOptions);
  }

  patch(path, body) {
    return this.http.patch(this.BASE_PATH + path, body, this.httpOptions);
  }

  delete(path) {
    return this.http.delete(this.BASE_PATH + path, this.httpOptions);
  }

  checkHeaders() {
    if (this.accessToken == undefined) {
      let token = localStorage.getItem('token');
      if (token != undefined) {
        this.accessToken = token;
        this.httpOptions = {};
        this.httpOptions = {
          headers: new HttpHeaders({
            'Authorization': 'Bearer ' + this.accessToken
          })
        };
      }
    }
  }

}
