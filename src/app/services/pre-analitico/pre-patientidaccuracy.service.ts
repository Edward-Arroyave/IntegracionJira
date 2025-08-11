import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { environment } from '@environment/environment';

@Injectable({
  providedIn: 'root'
})
export class PrePatientidaccuracyService extends ApiService {

  constructor(private http: HttpClient) {
    super(http);
    this.apiURL += 'pre/Patientidaccuracypre';
  }




getByMonthYear( mes: number, anio: number ){

  let url = `${this.apiURL}/infoindicatorsq1/${mes}/${anio}`;
  return this.http.get(url);

}
getByMonthYearSatisfaccion( mes: number, anio: number ){

  let url = `${ environment.apiUrl}pre/Satisfsamplesoutpatientspre/infoindicatorsq3/${mes}/${anio}`;
  return this.http.get(url);

}



}
