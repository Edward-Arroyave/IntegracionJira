import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { Observable } from 'rxjs';
import { environment } from '@environment/environment';


@Injectable({
  providedIn: 'root'
})

export class ProgramaConfQceService extends ApiService {

  constructor(private http: HttpClient) {
    super(http);
    this.apiURL += 'qce/ProgramconfQce';
  }

    //consulta configuracion de programa
    getinfoConfigprogramid(entity: any): Promise<any> {
      const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
      return this.httpClient.post<any>(`${this.apiURL}/programconfigid`,entity,{ headers: reqHeaders }).toPromise();
    }

    // Actualiza una configuración existente
  update(data: any, id: number): Observable<any> {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.httpClient.put<any>(`${this.apiURL}/${id}`, data, { headers: reqHeaders, observe: 'response' });
  }

  logOperacionAsync(log: any): void {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    this.httpClient.post<any>(`${environment.apiUrl}logs`, log, { headers: reqHeaders }).subscribe({
      next: () => {},
      error: err => console.error('Error al registrar log:', err)
    });
  }



  

  

}
