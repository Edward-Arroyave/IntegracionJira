import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnalizadoresService extends ApiService {

  constructor(private http: HttpClient) {
    super(http);
    //this.apiURL += 'qce/analyzerQce';
    this.apiURL += 'analyzers';
  }

  public async getAllAsyncAnalyzers(): Promise<any> {
    return await this.httpClient.get<any>(`${this.apiURL}/listAnalyzer`).toPromise();
  }

  public getAllAsyncAnalyzersxseccion(entity: any): Observable<any> {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.httpClient.post<any>(`${this.apiURL}/listanalyzerxsection`, entity, { headers: reqHeaders });
  }

  public getAllAnalyzerXTestXSeccion(entity: any): Observable<any> {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.httpClient.post<any>(`${this.apiURL}/AnalyzerXTest`, entity, { headers: reqHeaders });
  }
}
