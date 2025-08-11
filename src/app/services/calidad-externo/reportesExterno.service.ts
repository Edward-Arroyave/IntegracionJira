import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class ReportesExternoService {

  baseUrl = environment.apiUrl;

  constructor( private http: HttpClient ){}

  getAnalitos( idPrograma: number ){

    let url = `${this.baseUrl}qce/ReportecualitativoQce/listanalytes/${idPrograma}`;
    return this.http.get( url );

  }

  getRondas( idPrograma: number ){

    let url = `${this.baseUrl}qce/Filtergrubbs/listnroround/${idPrograma}`;
    return this.http.get( url );

  }

  getDatos(json: any){
    let url = `${this.baseUrl}qce/ReportecualitativoQce/reportecualitativo`;
    return this.http.post(url, json);
  }

  getAnalitosList(){
    let url = `${this.baseUrl}qce/AnalytesQces`;
    return this.http.get(url);
  }
  getEquipo(){
    let url = `${this.baseUrl}qce/AnalyzerQce`;
    return this.http.get(url);
  }


  // getReporteClienteCualitativo(entity: any): Observable<any> {
  //   let url = `${this.baseUrl}qce/ReportecualitativoQce/reportecualitativocliente`;
  //   const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
  //   const entityJson = JSON.stringify(entity);
  //   return this.http.post<any>(`${url}`, entityJson, { headers: reqHeaders });
  // }
  getReporteClienteCualitativo(json: any){
    
    let url = `${this.baseUrl}qce/ReportecualitativoQce/reportecualitativocliente`;
    return this.http.post( url, json );

  }




}
