import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConstants } from '@app/Constants/constants';
import { environment } from '@environment/environment';

@Injectable({
  providedIn: 'root'
})

export class MLJService{

  urlBase  : string = environment.apiUrl;

  constructor( private http: HttpClient ) { }

  getDesv( fecha: string, level1: number, level2: number, level3: number, idheadquaerters: number, idanalyzer: number, idcontrolmaterial: number, idlot: number, idanalyte: number ){
    
    let url = `${ this.urlBase }Reportes/graficomljxmediaflotante/'${ fecha }'/${ AppConstants.dianacalculate }/${ level1 }/${ level2 }/${ level3 }/${ idheadquaerters }/${ idanalyzer }/${ idcontrolmaterial }/${ idlot }/${ idanalyte }`;

    return this.http.get( url ).toPromise();

  }

}
