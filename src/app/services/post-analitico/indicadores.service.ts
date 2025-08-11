import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { environment } from '@environment/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
@Injectable({
  providedIn: 'root'
})
export class IndicadoresService extends ApiService  {

  constructor(private http: HttpClient)  {
    super(http);
  }
  public getAllArea() {
    return  this.http.get(`${environment.apiUrl}pos/areaspos`).toPromise();
  }

  public getAllTurnos() {
    return  this.http.get(`${environment.apiUrl}pos/Turnspos`).toPromise();
  }

  //Indicador 1
  public getFiltroIndicadoresUno(mes: any,anio: any,idarea: any,idturns: any){
    return  this.http.get(`${environment.apiUrl}pos/Criticalvaluestreatphys/infoindicatorsposq1/${mes}/${anio}/${idarea}/${idturns}`).toPromise();
  }

  public createIndicadoresUno(entity: any): Observable<any> {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const entityJson = JSON.stringify(entity);
    return this.httpClient.post<any>(`${environment.apiUrl}pos/Criticalvaluestreatphys`, entityJson, { headers: reqHeaders });
  }

  public updateIndicadoresUno(entity: any, id:any): Observable<any> {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const entityJson = JSON.stringify(entity);
    return this.httpClient.put<any>(`${environment.apiUrl}pos/Criticalvaluestreatphys/${id}`, entityJson, { headers: reqHeaders });
  }
  //Indicador 2
  public getFiltroIndicadoresDos(mes: any,anio: any,idarea: any,idturns: any){
    return  this.http.get(`${environment.apiUrl}pos/Timecomcriticalvalues/infoindicatorsposq2/${mes}/${anio}/${idarea}/${idturns}`).toPromise();
  }

  public createIndicadoresDos(entity: any): Observable<any> {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const entityJson = JSON.stringify(entity);
    return this.httpClient.post<any>(`${environment.apiUrl}pos/Timecomcriticalvalues`, entityJson, { headers: reqHeaders });
  }

  public updateIndicadoresDos(entity: any, id:any): Observable<any> {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const entityJson = JSON.stringify(entity);
    return this.httpClient.put<any>(`${environment.apiUrl}pos/Timecomcriticalvalues/${id}`, entityJson, { headers: reqHeaders });
  }
  //indicador 3

  public getFiltroIndicadoresTres(mes: any,anio: any,idarea: any,idturns: any){
    return  this.http.get(`${environment.apiUrl}pos/Troponinresponsetime/infoindicatorsposq3/${mes}/${anio}/${idarea}/${idturns}`).toPromise();
  }

  public createIndicadoresTres(entity: any): Observable<any> {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const entityJson = JSON.stringify(entity);
    return this.httpClient.post<any>(`${environment.apiUrl}pos/Troponinresponsetime`, entityJson, { headers: reqHeaders });
  }

  public updateIndicadoresTres(entity: any, id:any): Observable<any> {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const entityJson = JSON.stringify(entity);
    return this.httpClient.put<any>(`${environment.apiUrl}pos/Troponinresponsetime/${id}`, entityJson, { headers: reqHeaders });
  }

  //indicador 4

  public getFiltroIndicadoresCuatro(mes: any,anio: any,idarea: any,idturns: any){
    return  this.http.get(`${environment.apiUrl}pos/Resptimereleaseresults/infoindicatorsposq4/${mes}/${anio}/${idarea}/${idturns}`).toPromise();
  }

  public createIndicadoresCuatro(entity: any): Observable<any> {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const entityJson = JSON.stringify(entity);
    return this.httpClient.post<any>(`${environment.apiUrl}pos/Resptimereleaseresults`, entityJson, { headers: reqHeaders });
  }

  public updateIndicadoresCuatro(entity: any, id:any): Observable<any> {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const entityJson = JSON.stringify(entity);
    return this.httpClient.put<any>(`${environment.apiUrl}pos/Resptimereleaseresults/${id}`, entityJson, { headers: reqHeaders });
  }

  //indicador 5

  public getFiltroIndicadoresCinco(mes: any,anio: any){
    return  this.http.get(`${environment.apiUrl}pos/Overallsatisfscoreclinlab/infoindicatorsposq5/${mes}/${anio}`).toPromise();
  }

  public createIndicadoresCinco(entity: any): Observable<any> {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const entityJson = JSON.stringify(entity);
    return this.httpClient.post<any>(`${environment.apiUrl}pos/Overallsatisfscoreclinlab`, entityJson, { headers: reqHeaders });
  }

  public updateIndicadoresCinco(entity: any, id:any): Observable<any> {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const entityJson = JSON.stringify(entity);
    return this.httpClient.put<any>(`${environment.apiUrl}pos/Overallsatisfscoreclinlab/${id}`, entityJson, { headers: reqHeaders });
  }

  //indicador 6


  public getFiltroIndicadoresSeis(mes: any,anio: any){
    return  this.http.get(`${environment.apiUrl}pos/Numresultsinterpretivecomments/infoindicatorsposq6/${mes}/${anio}`).toPromise();
  }

  public createIndicadoresSeis(entity: any): Observable<any> {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const entityJson = JSON.stringify(entity);
    return this.httpClient.post<any>(`${environment.apiUrl}pos/Numresultsinterpretivecomments`, entityJson, { headers: reqHeaders });
  }

  public updateIndicadoresSeis(entity: any, id:any): Observable<any> {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const entityJson = JSON.stringify(entity);
    return this.httpClient.put<any>(`${environment.apiUrl}pos/Numresultsinterpretivecomments/${id}`, entityJson, { headers: reqHeaders });
  }


    //indicador 7
    public getFiltroIndicadoresSiete(mes: any,anio: any){
      return  this.http.get(`${environment.apiUrl}pos/Laboratoryrecommend/infoindicatorsposq7/${mes}/${anio}`).toPromise();
    }

    public createIndicadoresSiete(entity: any): Observable<any> {
      const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
      const entityJson = JSON.stringify(entity);
      return this.httpClient.post<any>(`${environment.apiUrl}pos/Laboratoryrecommend`, entityJson, { headers: reqHeaders });
    }

    public updateIndicadoresSiete(entity: any, id:any): Observable<any> {
      const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
      const entityJson = JSON.stringify(entity);
      return this.httpClient.put<any>(`${environment.apiUrl}pos/Laboratoryrecommend/${id}`, entityJson, { headers: reqHeaders });
    }

    //indicador 8
    public getFiltroIndicadoresOcho(mes: any,anio: any,idarea: any,idturns: any){
      return  this.http.get(`${environment.apiUrl}pos/Accuracyresults/infoindicatorsposq8/${mes}/${anio}/${idarea}/${idturns}`).toPromise();
    }

    public createIndicadoresOcho(entity: any): Observable<any> {
      const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
      const entityJson = JSON.stringify(entity);
      return this.httpClient.post<any>(`${environment.apiUrl}/pos/Accuracyresults`, entityJson, { headers: reqHeaders });
    }

    public updateIndicadoresOcho(entity: any, id:any): Observable<any> {
      const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
      const entityJson = JSON.stringify(entity);
      return this.httpClient.put<any>(`${environment.apiUrl}/pos/Accuracyresults/${id}`, entityJson, { headers: reqHeaders });
    }

}
