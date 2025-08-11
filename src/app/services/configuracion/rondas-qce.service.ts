import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class RondasQceService extends ApiService {

  constructor(private http: HttpClient) {
    super(http);
    this.apiURL += 'qce/roundQce';
  }

  // buscarRondasQce(idCliente: number, idsede:number,idPrograma: number) {
  //   const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
  //   return this.http.get<any>(`${this.apiURL}/roundqcedetailsfilter/${idCliente}/${idsede}/${idPrograma}`, { headers: reqHeaders }).toPromise();
  // }

  buscarRondasQce(entity: any): Promise<any> {
    return this.httpClient.post<any>(`${this.apiURL}/roundqcedetailsfilter`, entity).toPromise();
  }

  detalleRondasQce(datos) {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<any>(`${this.apiURL}/roundqcedetails/${datos.Idround}`, { headers: reqHeaders }).toPromise();
  }

  // get muestras table by numround

  getSamples( idClient: number, idsede:number,idPrograma: number, numRound: number ){

    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<any>(`${this.apiURL}/roundqcedetailsSamples/${idClient}/${idsede}/${idPrograma}/${numRound}`, { headers: reqHeaders }).toPromise();

  }

  getProgramAnalytes( idPrograma: number ){

    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<any>(`${this.apiURL}/roundqceprogramanalytes/${idPrograma}`, { headers: reqHeaders }).toPromise();

  }

  getRoundsAnalytesResult( idRound: number ){

    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<any>(`${this.apiURL}/roundqceanalytesresult/${idRound}`, { headers: reqHeaders }).toPromise();

  }

  createRoundConf(entity: any): Observable<any> {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const entityJson = JSON.stringify(entity);
    return this.http.post<any>(`${this.apiURL}/roundconfqce`, entityJson, { headers: reqHeaders });
  }

  getRoundReportCuali(idProgram:any): Promise<any> {
    return this.http.get<any>(`${this.apiURL}/ReportCuali/${idProgram}`).toPromise();
  }

  // CLIENTE GET RONDAS
  getRoundReportCualiCl(idProgram:any, idCliente:number): Promise<any> {
    return this.http.get<any>(`${this.apiURL}/ReportCualiCl/${idProgram}/${idCliente}`).toPromise();
  }

  public UpdateNumberSample(entity: any[]): Observable<any> {
    const options = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      body: entity
    };
    return this.httpClient.post<any>(`${this.apiURL}/UpdateNumberSample`, entity);
  }
  
  getResultsRound( idRound:number){
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<any>(`${this.apiURL}/ConsultResultsRound/${idRound}`, { headers: reqHeaders });
  }

}
