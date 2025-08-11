import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class LotesService extends ApiService {

  constructor(private http: HttpClient) {
    super(http);
    this.apiURL += 'lots';
  }

  public async getAllAsyncNoDuplicadonew(): Promise<any> {
    return await this.httpClient.get<any>(`${this.apiURL}/lotclonew`).toPromise();
  }

  public async getAllAsynclotxidcontmat(id:number): Promise<any> {
    return await this.httpClient.get<any>(`${this.apiURL}/lotesxctrlmat/`+ id).toPromise();
  }

  public async getAllAsynclotsxsedecontm(id:number,idSede:any): Promise<any> {
    return await this.httpClient.get<any>(`${this.apiURL}/lotesxctrlmatsedepre/${id}/${idSede}`).toPromise();
  }

  public getAllAsyncLotsxanalyte(entity: any): Observable<any> {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.httpClient.post<any>(`${this.apiURL}/listlotsxanalyte`, entity, { headers: reqHeaders });
  }

  public getAllAsyncLotesxNumlot(entity: any): Observable<any> {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.httpClient.post<any>(`${this.apiURL}/infolotsx`, entity, { headers: reqHeaders });
  }

  public getAllLotesxTest(entity: any): Observable<any> {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.httpClient.post<any>(`${this.apiURL}/LotesXTest`, entity, { headers: reqHeaders });
  }
}
