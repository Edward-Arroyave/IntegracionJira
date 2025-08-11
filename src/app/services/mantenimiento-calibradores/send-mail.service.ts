import { Injectable } from "@angular/core";
import { ApiService } from '../api.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';


@Injectable({
    providedIn: 'root'
  })
  export class SendEmailmtoService extends ApiService {
  
    constructor(private http: HttpClient) {
      super(http);
      this.apiURL += 'mto/Sendemailmto';
    }
  
  
  }