import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';


@Injectable({
  providedIn: 'root'
})
export class DatosAberrantesIntService extends ApiService {

  constructor(private http: HttpClient) {
    super(http);
    this.apiURL += 'AberrantDatafilter';
  }

  // datos aberrantes
  public GetInfoAberrantData() {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.httpClient.get<any>(`${this.apiURL}/infoAberrantdata`, { headers: reqHeaders });
  }

}
