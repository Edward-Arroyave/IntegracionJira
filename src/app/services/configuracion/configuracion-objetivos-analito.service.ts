import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfiguracionObjetivosAnalitoService extends ApiService {

  constructor(private http: HttpClient) {
    super(http);
    this.apiURL += 'Confobjquaanalyte';
  }

  public  getmetascalidadxtest(datos: any) {
    return  this.httpClient.get<any>(`${this.apiURL}/configobjcalidad/${datos}`).toPromise();
  }

}
