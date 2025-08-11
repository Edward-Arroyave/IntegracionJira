import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { environment } from '@environment/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AreasService  extends ApiService {
  constructor(private http: HttpClient) {
    super(http);
  }
  public getObtener(id: any) {
    return  this.http.get(`${environment.apiUrl}pos/Areaspos/${id}`).toPromise();
  }

  public async getObtenerTodos(): Promise<any> {
    console.log("URL",environment.apiUrl);

    return await this.httpClient.get(`${environment.apiUrl}pos/Areaspos`).toPromise();
  }

  public create(entity: any): Observable<any> {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const entityJson = JSON.stringify(entity);
    return this.httpClient.post<any>(`${environment.apiUrl}pos/Areaspos`, entityJson, { headers: reqHeaders });
  }

  public update(entity: any, id: any): Observable<any> {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const entityJson = JSON.stringify(entity);
    return this.httpClient.put<any>(`${environment.apiUrl}pos/Areaspos/${id}`, entityJson, { headers: reqHeaders });
  }


  public delete(url: string, id: any): Observable<any> {
    return this.httpClient.delete<any>(`${environment.apiUrl}pos/Areaspos/${id}`);
  }
}



