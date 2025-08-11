import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DiccionarioResultadosService extends ApiService {

  constructor(private http: HttpClient) {
    super(http);
    this.apiURL += 'resultsdictionaries';
  }
  public  getresultadoslog(id: any): Observable<any> {
    return  this.httpClient.get<any>(`${this.apiURL}/${id}`);
  }
}
