import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environment/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class InfoDetailsResultQceService{

  private urlBase  : string = environment.apiUrl;
  private url      : string = '';

  constructor( private http: HttpClient ) { }

  getData( idclient: number,idsede:number,idporgram:number,nroround: number ): Observable<any> {
    
    this.url = `${ this.urlBase }qce/resultqce/infodetalisresultqce/${ idclient }/${idsede}/${idporgram}/${ nroround }`;

    return this.http.get(this.url);
    
  }

}
