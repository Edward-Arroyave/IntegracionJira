import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AnalitosService extends ApiService {

  baseUrl:string='';

  constructor(private http: HttpClient) {
    super(http);
    this.baseUrl =  this.apiURL ;
    this.apiURL += 'analytes';
  }

  public  getanalitoslog(id: any): Observable<any> {
    return  this.httpClient.get<any>(`${this.apiURL}/${id}`);
  }

  public async getAllAsyncAnalytes(): Promise<any> {
    return await this.httpClient.get<any>(`${this.apiURL}/listAnalytes`).toPromise();
  }

  public getAllAsyncAnalytesxanalyzer(entity: any): Observable<any> {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.httpClient.post<any>(`${this.apiURL}/listanalytesxanalyzer`, entity, { headers: reqHeaders });
  }

  getAnalitosPorPrograma(idprogram:number): Observable<any> {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.httpClient.get<any>(`${this.baseUrl}qce/AssignValuesExpected/infoanalytes/${idprogram}`, { headers: reqHeaders });
  }
  getAnalitosPorProgramaCualitativo(idprogram:number): Observable<any> {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.httpClient.get<any>(`${this.baseUrl}qce/AssignValuesExpectedCuali/infoanalytescuali/${idprogram}`, { headers: reqHeaders });
  }

  public getAllAnalytesxSedeTest(entity: any): Observable<any> {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.httpClient.post<any>(`${this.apiURL}/AnalytesXTest`, entity, { headers: reqHeaders });
  }
}
