import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class PreReportesService extends ApiService {

  constructor(private http: HttpClient) {
    super(http);
    this.apiURL += 'pre/Reportespre';
  }


getReporByIndicator(ind: number, mes: number, anio: number){
  let url = `${this.apiURL}/infoindicators/${ind}/${mes}/${anio}`;
  return this.http.get(url);
}

getDescripcion(ind: number, mes: number, anio: number){
  let url = `${this.apiURL}/infodescriptionxindicator/${ind}/${mes}/${anio}`;
  return this.http.get(url);
}
getReporGraph(ind: number, item: number, anio: number){
  //let url = `${this.apiURL}/graphsq1/${item}/${mes}/${anio}`;
  let url = `${this.apiURL}/graphsq${ind}/${item}/${anio}`;
  return this.http.get(url);
}
getReporGeneral( mes: number, anio: number){
  let url = `${this.apiURL}/infoindicatorspre/${mes}/${anio}`;
  return this.http.get(url);
}

}
