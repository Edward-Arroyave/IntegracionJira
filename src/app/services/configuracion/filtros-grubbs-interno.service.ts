import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FiltrosGrubbsInternoService extends ApiService {

  constructor(private http: HttpClient) {
    super(http);
    this.apiURL += 'FilterGrubbsInterno';
    httpClient: HttpClient;
  }

  public  GetInfoFilterGrubbs(idheadquarter:number,idsection:number, idcontrolmaterial:number, idlot:number) {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.httpClient.get<any>(`${this.apiURL}/infofiltergrubbs/${idheadquarter}/${idsection}/${idcontrolmaterial}/${idlot}`, { headers: reqHeaders });
  }

  // filtro conf por test
  public GetInfoFiltergrubbsxtest(idtest: any) {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.httpClient.get<any>(`${this.apiURL}/infofiltrosgrubbsxtest/${idtest}`, { headers: reqHeaders });
  }

  public adminFiltroGrubbs(idtest: any) {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.httpClient.get<any>(`${this.apiURL}/adminFiltrogrubbsint/${idtest}`, { headers: reqHeaders });
  }

  public GetInfoFilterGrubbsAverageFinalInt(idtest: any) {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.httpClient.get<any>(`${this.apiURL}/ValidaDatosAberrantesInt/${idtest}`, { headers: reqHeaders });
  }

  public GetInfoFilterGrubbsresults(idtest: any,leveltest: number) {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.httpClient.get<any>(`${this.apiURL}/inforesults/${idtest}/${leveltest}`, { headers: reqHeaders });
  }

  public PutConfigMediaDsxTest(entity: any): Observable<any> {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.httpClient.put<any>(`${this.apiURL}/UpdateConfigMediads`, entity, { headers: reqHeaders });
  }
  

}
