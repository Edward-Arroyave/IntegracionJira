import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environment/environment';


@Injectable({

  providedIn: 'root'

})

export class GrubbsService {

  url: string = environment.apiUrl;

  constructor( private http: HttpClient ){ }

  getRondas( idProgram: number ){

    let urlReq: string = `${ this.url }qce/Filtergrubbs/listnroround/${ idProgram }`;
    return this.http.get( urlReq );

  }

  getAnalytes( idProgram: number ){

    let urlReq: string = `${ this.url }qce/Filtergrubbs/listanalytes/${ idProgram }`;
    return this.http.get( urlReq );

  }

  getAnalyzers( idAnalito: number ){

    let urlReq: string = `${ this.url }qce/Filtergrubbs/listanalyzer/${ idAnalito }`;
    return this.http.get( urlReq );

  }

  getMetodos( idAnalito: number ){

    let urlReq: string = `${ this.url }qce/Filtergrubbs/listamethods/${ idAnalito }`;
    return this.http.get( urlReq );

  }

  getUnidades( idAnalito: number ){

    let urlReq: string = `${ this.url }qce/Filtergrubbs/listaunits/${ idAnalito }`;
    return this.http.get( urlReq );

  }

  infoResultsQce( json: any ){

    let urlReq: string = `${ this.url }qce/Filtergrubbs/inforesultsqce`;
    return this.http.post( urlReq, json);

  }

  adminFiltroGrubbs( json: any ){

    let urlReq: string = `${ this.url }qce/Filtergrubbs/adminFiltrogrubbs`;
    return this.http.post( urlReq, json );

  }

  validaDatosAverrantes( json: any ){

    let urlReq: string = `${ this.url }qce/Filtergrubbs/ValidaDatosAberrantes`;
    return this.http.post( urlReq, json );

  }

}
