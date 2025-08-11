import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class PreAcceptlabsamplespreService extends ApiService {

  constructor(private http: HttpClient) {
    super(http);
    this.apiURL += 'pre/Acceptlabsamplespre';
  }




getByMonthYearTurnArea( mes: number, anio: number, idarea: number, idturns: number ){

  let url = `${this.apiURL}/infoindicatorsq2/${mes}/${anio}/${idarea}/${idturns}`;
  return this.http.get(url);

}



}