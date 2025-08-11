import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { environment } from '@environment/environment';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class EquiposService extends ApiService {

  constructor(private http: HttpClient) {
    super(http);
    this.apiURL += 'mto/Devicesmto';
  }

  public getObtener(id: any): Observable<any>  {
    return  this.http.get(`${environment.apiUrl}mto/devicesmto/${id}`);
  }

  public getObtenerPdf(id: any, idPdf:any): Observable<any>  {
    return  this.http.get(`${environment.apiUrl}mto/devicesmto/infopdf/${id}/${idPdf}`);
  }


  public async getObtenerTodos(): Promise<any> {
    console.log("URL",environment.apiUrl);
    return await this.httpClient.get(`${environment.apiUrl}mto/devicesmto`).toPromise();
  }

  public create(entity: any): Observable<any> {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const entityJson = JSON.stringify(entity);
    return this.httpClient.post<any>(`${environment.apiUrl}mto/devicesmto`, entityJson, { headers: reqHeaders });
  }

  public update(entity: any, id: any): Observable<any> {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const entityJson = JSON.stringify(entity);
    return this.httpClient.put<any>(`${environment.apiUrl}mto/devicesmto/${id}`, entityJson, { headers: reqHeaders });
  }


  public deletedevice(id: any): Observable<any> {
    return this.httpClient.delete<any>(`${environment.apiUrl}${this.apiURL}/${id}`);
  }
}
