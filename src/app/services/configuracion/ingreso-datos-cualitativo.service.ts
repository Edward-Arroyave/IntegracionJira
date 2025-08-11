import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConstants } from '@app/Constants/constants';
import { ApiService } from '../api.service';
import { environment } from '../../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class IngresoDatosCualitativoService extends ApiService {

  urlBase = environment.apiUrl;

  constructor(private http: HttpClient) {
    super(http);
    this.apiURL += 'Resultqualitative';
  }
  
  public async getAR( fecha: string, level: number, idSede: number, idAnalyzer: number, idMaterial: number, idLote: number, idAnalito: number ){

    let url = `${this.urlBase}Reportes/calcularAR/${ fecha }/${ AppConstants.dianacalculate }/${ level }/${ idSede }/${ idAnalyzer }/${ idMaterial }/${ idLote }/${ idAnalito }`;
    return await this.http.get(url).toPromise();

  }

  

}
