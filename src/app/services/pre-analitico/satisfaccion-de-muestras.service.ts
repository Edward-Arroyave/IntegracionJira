import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { environment } from '@environment/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SatisfaccionDeMuestrasService extends ApiService {

  constructor(private http: HttpClient) {
    super(http);
    this.apiURL += 'pre/Patientidaccuracypre';
  }

  public create(entity: any): Observable<any> {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const entityJson = JSON.stringify(entity);
    return this.http.post<any>(`${environment.apiUrl}pre/Satisfsamplesoutpatientspre`, entityJson, { headers: reqHeaders });
  }
  public update(entity: any,idsamplesoutpatients:any): Observable<any> {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const entityJson = JSON.stringify(entity);
    return this.http.put<any>(`${environment.apiUrl}pre/Satisfsamplesoutpatientspre/${idsamplesoutpatients}`, entityJson, { headers: reqHeaders });
  }

  public deleteSatisfaccion(id: any) {
    return  this.http.get(`${environment.apiUrl}pre/Satisfsamplesoutpatientspre/${id}`).toPromise();
  }

  public getObtenerall() {
    return  this.http.get(`${environment.apiUrl}pre/Satisfsamplesoutpatientspre`).toPromise();
  }
  public getObtener(id: any) {
    return  this.http.get(`${environment.apiUrl}pre/Satisfsamplesoutpatientspre/${id}`).toPromise();
  }
}
