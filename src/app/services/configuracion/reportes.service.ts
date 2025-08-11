import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environment/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportesService  {
  public apiURL = environment.apiUrl;
  constructor(private httpClient: HttpClient) {
  
  }

  public getCoefVariacion(complemento: any, datos: any)  {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.httpClient.get<any>(`${this.apiURL}${complemento}/'${datos.fecha}'/${datos.dianacalculate}/${datos.test}/${datos.idheadquaerters}/${datos.idAnalyzer}/${datos.idcontrolmaterial}/${datos.idlot}/${datos.idanalyte}`, { headers: reqHeaders });
  }
  public getVaribles(datos: any)  { 
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return  this.httpClient.get<any>(`${this.apiURL}${datos.complemento}/'${datos.fechaInicial}'/'${datos.fechaFinal}'/${datos.level}/${datos.idheadquaerters}/${datos.idanalyzer}/${datos.idcontrolmaterial}/${datos.idlot}/${datos.idanalyte}/${datos.idtest}`, { headers: reqHeaders });
  }
  public getDianaFlotante(datos: any)  { 
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return  this.httpClient.get<any>(`${this.apiURL}${datos.complemento}/'${datos.date}'/${datos.dianaCalulate}/${datos.level}/${datos.idheadquaerters}/${datos.idanalyzer}/${datos.idcontrolmaterial}/${datos.idlot}/${datos.idanalyte}/${datos.idtest}`, { headers: reqHeaders }).toPromise();
  }
  
  //limites
  public getLimitsFloat(datos: any)  { 
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return  this.httpClient.get<any>(`${this.apiURL}${datos.complemento}/'${datos.date}'/${datos.dianaCalulate}/${datos.level}/${datos.idheadquaerters}/${datos.idanalyzer}/${datos.idcontrolmaterial}/${datos.idlot}/${datos.idanalyte}/${datos.idtest}`, { headers: reqHeaders }).toPromise();
  }

  //limitesxdianapropia
  public getLimitsFloatxdianapropia(datos: any)  { 
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return  this.httpClient.get<any>(`${this.apiURL}${datos.complemento}/'${datos.date}'/${datos.dianaCalulate}/${datos.level}/${datos.idheadquaerters}/${datos.idanalyzer}/${datos.idcontrolmaterial}/${datos.idlot}/${datos.idanalyte}/${datos.dianavaluepropia}`, { headers: reqHeaders }).toPromise();
  }

  //limitesxdianapropia
  public getLimitsFloatxdianapropiadata(datos: any)  { 
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return  this.httpClient.get<any>(`${this.apiURL}${datos.complemento}/'${datos.date}'/${datos.dianaCalulate}/${datos.level}/${datos.idTest}/${datos.dianavaluepropia}`, { headers: reqHeaders });
  }

}
