import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class PostReportesService extends ApiService {

  constructor(private http: HttpClient) {
    super(http);
    this.apiURL += 'pos/Reportespos';
  }

  
getReporByIndicator(ind: number, mes: number, anio: number){
  let url = `${this.apiURL}/infoindicatorspos/${ind}/${mes}/${anio}`;
  return this.http.get(url);
}
getReporGraph(ind: number, item: number, anio: number){
  //let url = `${this.apiURL}/graphsq1/${item}/${mes}/${anio}`;
  let url = `${this.apiURL}/graphsposq${ind}/${item}/${anio}`;
  return this.http.get(url);
}
getReporGeneral( mes: number, anio: number){  
  let url = `${this.apiURL}/infoindicatorsposgnral/${mes}/${anio}`;
  return this.http.get(url);
}

}