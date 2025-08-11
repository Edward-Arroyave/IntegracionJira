import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { environment } from '@environment/environment';

@Injectable({
  providedIn: 'root'
})
export class ValoresDianaService extends ApiService{

  constructor(private http: HttpClient) {
    super(http);
    this.apiURL += 'DianaValues';
  }
  getDianaValueByObj( idobjetivo: number){  
    let url = `${this.apiURL}/dianavaluexobj/${idobjetivo}`;
    return this.http.get(url);
  }
  getLimitesByDianaPropia(fecha,dianacalculate,leveltest,idTest,dianavaluepropia){  
    let url = `${environment.apiUrl}/Reportes/limitesxdianapropia/${fecha}/${dianacalculate}/${leveltest}/${idTest}/${dianavaluepropia}`;
    return this.http.get(url);
  }
  
}
