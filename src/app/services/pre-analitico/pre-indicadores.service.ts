import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class PreIndicadoresService extends ApiService {

  constructor(private http: HttpClient) {
    super(http);
    this.apiURL += 'pre/Indicatorspre';
  }
  getDatosIndicador( nameindicators: String ){

    let url = `${this.apiURL}/infoconfigindicators/${nameindicators}`;
    return this.http.get(url);
  
  }
}