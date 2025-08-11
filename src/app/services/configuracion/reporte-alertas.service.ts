import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.prod';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReporteAlertasService {

  urlBase: string = environment.apiUrl;
  httpClient: HttpClient;
  constructor( private http: HttpClient ) {
    
   }

  getDataAnalitosAlerta(data: any) {

    const url = `${ this.urlBase }Sigmometria/analitosalerta`;

    return this.http.post( url, data ).toPromise();

  }
  
  getDataAnalitosAlertaQCE(data: any) {

    const url = `${ this.urlBase }Sigmometria/analitosalertaexterno`;

    return this.http.post( url, data ).toPromise();

  }
}
