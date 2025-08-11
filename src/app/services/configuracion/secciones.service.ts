import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})

export class SeccionesService extends ApiService {

  constructor(private http: HttpClient) {
    super(http);
    this.apiURL += 'sections';
  }

  public async getAllAsyncSecciones(): Promise<any> {
    return await this.httpClient.get<any>(`${this.apiURL}/listsections`).toPromise();
  }

  public getAllAsyncSeccionesxsede(entity: any): Observable<any> {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.httpClient.post<any>(`${this.apiURL}/listsectionxsede`, entity, { headers: reqHeaders });
  }

  public getAllSeccionesxSedeTest(entity: any): Observable<any> {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.httpClient.post<any>(`${this.apiURL}/SeccionesXTest`, entity, { headers: reqHeaders });
  }
}
