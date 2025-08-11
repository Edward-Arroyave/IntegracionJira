import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EstadisticaSemiCuantitativaQce extends ApiService {

  constructor(private http: HttpClient) {
    super(http);
    this.apiURL+='qce/SemiQuantitativeGeneralStatistics/';
  }

  GetEstadisticaSemiCuantitativa(idPrograma:number ,idLote:number ){
    return this.http.get<any>(`${this.apiURL}ConsultStatisticalSemiQuantitative/${idPrograma}/${idLote}`);
  }
  
  GetConsultMatchStatisticalGeneral(idClient:number, idHeadQuarters:number, idPrograma:number ,idLote:number ){
    return this.http.get<any>(`${this.apiURL}ConsultMatchStatisticalGeneral/${idClient}/${idHeadQuarters}/${idPrograma}/${idLote}`);
  }

  GetinfoAnalytesSemiQuantitative(idPrograma:number){
    return this.http.get<any>(`${this.apiURL}infoAnalytesSemiQuantitative/${idPrograma}`);
  }
  
  updateConfiguracionesEstadisticas(id: any,data:any): Promise<any> {
    return this.httpClient.put<any>(`${this.apiURL}UpdateStatistical/${id}`,data).toPromise();
  }
  
  getConsultValueAssign(idPrograma:number ) {
    return this.httpClient.get<any>(`${this.apiURL}ConsultValueAssign/${idPrograma}`);
  }
  
  deleteConfiguracionesEstadisticas(id : number): Observable<any> {
    return this.httpClient.delete<any>(`${this.apiURL}DeleteStatistical/${id}`);
  }
}
