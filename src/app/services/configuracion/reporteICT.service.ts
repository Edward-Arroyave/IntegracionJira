import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environment/environment';

@Injectable({
  providedIn: 'root'
})

export class ReporteICTService{

  urlBase  : string = environment.apiUrl;

  constructor( private http: HttpClient ) { }

  // SERVICIOS PARA VISTA CONSOLIDADO
  getDataForGraphics(data: any){
    
    let url = `${ this.urlBase }Sigmometria/graficosconsolidado`;

    return this.http.post( url, data ).toPromise();

  }

  getDataForGraphicsDos(data: any){
    
    let url = `${ this.urlBase }Sigmometria/filtroid`;

    return this.http.post( url, data ).toPromise();

  }

  // SERVICIOS PARA VISTA SIX SIGMA
  getDataICTInterno(data: any){

    let url = `${ this.urlBase }Sigmometria/indicadoresct`;

    return this.http.post( url, data ).toPromise();

  }

  getDataICTExterno(data: any){

    let url = `${ this.urlBase }Sigmometria/sixsigmaexterno`;

    return this.http.post( url, data ).toPromise();

  }

}
