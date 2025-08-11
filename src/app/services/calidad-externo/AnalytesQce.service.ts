import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';


@Injectable({
  providedIn: 'root'
})

export class AnalytesQceService extends ApiService {

  constructor(private http: HttpClient) {
    super(http);
    this.apiURL += 'qce/AnalytesQces';

  }
  getAnalytesReportCuali(idProgram:any, idRound:any, idLot:any): Promise<any> {
    return this.http.get<any>(`${this.apiURL}/ReportCuali/${idProgram}/${idRound}/${idLot}`).toPromise();
  }

  // CLIENTE GET ANALITOS
  getAnalytesReportCualiCl(idProgram:any, idRound:any, idLot:any, idClient:any): Promise<any> {
    return this.http.get<any>(`${this.apiURL}/ReportCualiCl/${idProgram}/${idRound}/${idLot}/${idClient}`).toPromise();
  }

  // CLIENTE GET ANALITOS
  getAnalytesReportCualiClxsamples(idProgram:any, idRound:any, idsample:any, idClient:any): Promise<any> {
    return this.http.get<any>(`${this.apiURL}/AnalytesReportCualiCl/${idProgram}/${idRound}/${idsample}/${idClient}`).toPromise();
  }
}
