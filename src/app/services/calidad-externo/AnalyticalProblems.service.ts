import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})

export class AnalyticalProblemsService extends ApiService {
  constructor(private http: HttpClient) {
    super(http);
    this.apiURL += 'qce/AnalyricalProblems';
  }
  
  getAnalyticalProblems(idAnalytes: number): Observable<any> {
    let url = `${this.apiURL}/ConsultAnalyticalProblems/${idAnalytes}`;
    return this.http.get(url);
  }
  
  GetAnalyricalProblemsRound(idRound: number, idHeadQuarters:number): Observable<any> {
    let url = `${this.apiURL}/CheckAnalyticalProblemsRound/${idRound}/${idHeadQuarters}`;
    return this.http.get(url);
  }
}