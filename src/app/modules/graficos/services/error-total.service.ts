import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConstants } from '@app/Constants/constants';
import { environment } from '@environment/environment';

@Injectable({
  providedIn: 'root'
})

export class ETService{

  urlBase  : string = environment.apiUrl;

  constructor( private http: HttpClient ) { }

  getDesv( fecha: string, level: number, idheadquaerters: number, idanalyzer: number, idcontrolmaterial: number, idlot: number, idanalyte: number, idtest:number ){
    
    let url = `${ this.urlBase }Reportes/graficoetxmediaflotante/'${ fecha }'/${ AppConstants.dianacalculate }/${ level }/${ idheadquaerters }/${ idanalyzer }/${ idcontrolmaterial }/${ idlot }/${ idanalyte }/${idtest}`;

    return this.http.get( url ).toPromise();
    
  }

}
