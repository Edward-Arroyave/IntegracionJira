import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class PorcentajeConfianzaService extends ApiService {

    private apiBase:string;
    constructor(private http: HttpClient) {
    super(http); 
    this.apiBase =  this.apiURL;
    this.apiURL += 'ConfidencePercent';
    } 

  getinfoConfidencepercent(entity: any): Promise<any> {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.httpClient.post<any>(`${this.apiURL}/infoConfidencepercent`,entity,{ headers: reqHeaders }).toPromise();
  }

}
