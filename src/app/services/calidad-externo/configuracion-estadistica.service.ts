import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfiguracionEstadisticaService extends ApiService {

  constructor(private http: HttpClient) {
    super(http);
    this.apiURL+='qce/GeneralStatistticalValues/';
  }

  getConfiguracionesEstadisticas( idLote: number, idPrograma:number ){
    return this.http.get<any>(`${this.apiURL}ExpectedValueSettings/${idLote}/${idPrograma}`);
  }

  updateConfiguracionesEstadisticas(idAssignValuesExpected: any,data:any): Promise<any> {
    return this.httpClient.put<any>(`${this.apiURL}UpdateGeneralStatisticalValues/${idAssignValuesExpected}`,data).toPromise();
  }

  createConfiguracionesEstadisticas(entity: any): Promise<any> {
    return this.httpClient.post<any>(`${this.apiURL}SaveGeneralStatisticalValues`, entity).toPromise();
  }

  DeleteConfiguracionesEstadisticas(id : any): Observable<any> {
    return this.httpClient.delete<any>(`${this.apiURL}${id}`);
  }

}
