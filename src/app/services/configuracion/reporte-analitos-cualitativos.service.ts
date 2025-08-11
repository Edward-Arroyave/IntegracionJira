import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.prod';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReporteAnalitosCualitativosService {

  urlBase: string = environment.apiUrl;
  httpClient: HttpClient;
  constructor( private http: HttpClient ) {
    
   }

  getDataAnalitosCualitativos(data: any) {
    const url = `${ this.urlBase }ReporteCualitativo/pctconcordancia`;
    return this.http.post( url, data ).toPromise();
  }

  getDataAnalitosCualitativosxmes(data: any) {
    const url = `${ this.urlBase }ReporteCualitativo/reportedesempenio`;
    return this.http.post( url, data ).toPromise();
  }
  
  
}
