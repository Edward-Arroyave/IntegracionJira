import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';


@Injectable({
  providedIn: 'root'
})

export class LotesQceService extends ApiService {

  constructor(private http: HttpClient) {
    super(http);
    this.apiURL += 'qce/LotQce';

  }

  getLotReportCuali(idProgram:any, idRound:any): Promise<any> {
    return this.http.get<any>(`${this.apiURL}/ReportCuali/${idProgram}/${idRound}`).toPromise();
  }

  getLotReportCualiCl(idProgram:any,nRounds:any, idCliente:number): Promise<any> {
    return this.http.get<any>(`${this.apiURL}/ReportCualiCl/${idProgram}/${nRounds}/${idCliente}`).toPromise();
  }
}
