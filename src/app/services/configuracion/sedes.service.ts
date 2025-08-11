import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';


@Injectable({
  providedIn: 'root'
})
export class SedesService extends ApiService {

  constructor(private http: HttpClient) {
    super(http);
    this.apiURL += 'headquarters';
  }

  getinfosedeuser(userid,idheadquarter){  
    let url = `${this.apiURL}/getheadquarters/${userid}/${idheadquarter}`;
    return this.http.get(url).toPromise();
  }

  public async getAllAsyncHeadquarters(iduser:number): Promise<any> {
    return await this.httpClient.get<any>(`${this.apiURL}/listHeadquarter/`+ iduser).toPromise();
  }

  public async sedesXResultadosAsync(entity): Promise<any> {
    return await this.httpClient.post<any>(`${this.apiURL}/SedesXResultados`, entity).toPromise();
  }
}
