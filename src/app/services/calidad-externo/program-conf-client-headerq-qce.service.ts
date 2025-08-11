import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { Observable } from 'rxjs';
import { environment } from '@environment/environment';

@Injectable({
  providedIn: 'root'
})
export class ProgramConfClientHeaderqQceService extends ApiService {

  constructor(private http: HttpClient) {
    super(http);
    this.apiURL += 'qce/ProgramConfClientHeaderqQce';
  }

  getProgramAssignment( idCliente: number, idSede: number, idPrograma:number ){
    return this.http.get<any>(`${this.apiURL}/${idCliente}/${idSede}/${idPrograma}`);
  }

  public async getProgramAssignAll(cliente:number,sede:number): Promise<any> {
    return await this.httpClient.get<any>(this.apiURL + '/programinrounddetails/'+ cliente + '/' + sede ).toPromise();
  }

  public async Getprogramassignxidprogram(idprogram:number,idclient:number,idsede:number): Promise<any> {
    return await this.httpClient.get<any>(this.apiURL + '/programassignxidprogram/'+ idprogram +'/' + idclient +'/' + idsede  ).toPromise();
  }

  public async getProgramAssignXid(idprogram:number) {
    return await this.httpClient.get(this.apiURL + '/programinroundid/' + idprogram).toPromise();
  }

  updateProgramAssignment(entity: any): Promise<any> {
    return this.httpClient.put<any>(`${this.apiURL}`, entity, {observe: 'response'}).toPromise();
  }

  // createProgramAssignment(entity: any): Promise<any> {
  //   return this.httpClient.post<any>(`${this.apiURL}`, entity, {observe: 'response'}).toPromise();
  // }
  createProgramAssignment(entity: any): Observable<any> {
  return this.httpClient.post<any>(`${this.apiURL}`, entity, { observe: 'response' });
}


  getProgramReportCuali(): Promise<any> {
    return this.http.get<any>(`${this.apiURL}/ReportCuali`).toPromise();
  }

  performanceReportCuali(entity: any): Promise<any> {
    return this.httpClient.post<any>(`${this.apiURL}/PerformanceReportCuali`, entity).toPromise();
  }

  // FILTRO CLIENTE
  performanceReportCualiCl(entity: any): Promise<any> {
    return this.httpClient.post<any>(`${this.apiURL}/PerformanceReportCualiCl`, entity).toPromise();
  }

  // FILTRO REPORTE SEMICUALI EXTERNO
  performanceReportSemiCualiCl(entity: any): Promise<any> {
    return this.httpClient.post<any>(`${this.apiURL}/PerformanceReportSemiCuali`, entity).toPromise();
  }

   // FILTRO REPORTE SEMICUALI EXTERNO  CLIENTES
   performanceReportSemiCualiClientes(entity: any): Promise<any> {
    return this.httpClient.post<any>(`${this.apiURL}/PerformanceReportSemiCualiClient`, entity).toPromise();
  }

  // FILTRO REPORTE SEMICUALI EXTERNO CONCORDANCIA
  ConcordancePlots(entity: any): Promise<any> {
    return this.httpClient.post<any>(`${this.apiURL}/ConcordancePlots`, entity).toPromise();
  }
  // FILTRO REPORTE SEMICUALI EXTERNO FIN DE CICLO
  endOfCycle(entity: any): Promise<any> {
    return this.httpClient.post<any>(`${this.apiURL}/EndOfCycle`, entity).toPromise();
  }

  // FILTRO REPORTE SEMICUALI EXTERNO CONCORDANCIA -clientes
  ConcordancePlotsclients(entity: any): Promise<any> {
    return this.httpClient.post<any>(`${this.apiURL}/ConcordancePlotsclients`, entity).toPromise();
  }
  // FILTRO REPORTE SEMICUALI EXTERNO FIN DE CICLO - clientes
  EndOfCycleclients(entity: any): Promise<any> {
    return this.httpClient.post<any>(`${this.apiURL}/EndOfCycleclients`, entity).toPromise();
  }

  // CLIENTE PROGRAMAS
  public async getProgramReportCualiCl(NIT:any,idSede:number) {
    return await this.httpClient.get(`${this.apiURL}/ReportCualiCl/${NIT}/${idSede}`).toPromise();
  }

  // LISTA PROGRAMAS SEMICUALI
  async programReportSemiCualiCl(NIT:any,idSede:number): Promise<any> {
    return await this.httpClient.get(`${this.apiURL}/ReportSemiCualiCl/${NIT}/${idSede}`).toPromise();
  }
  
  async PostReporteCuantitativo(entity: any): Promise<any> {
    return this.httpClient.post<any>(`${this.apiURL}/ReporteSemiCuantitativo`, entity).toPromise();
  }

  UpdateProgramConfClientHeader(entity: any, idProgramConfClientHeadq:number ): Observable<any> {
    return this.httpClient.put<any>(`${this.apiURL}/UpdateProgramConfClientHeader/${idProgramConfClientHeadq}`, entity, {observe: 'response'});
  }
}
