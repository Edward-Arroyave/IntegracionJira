import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environment/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class ResponsexSampleService{

  private urlBase  : string = environment.apiUrl;
  private url      : string = '';

  constructor( private http: HttpClient ) { }

  getData( idclient:number,idsede:number, idPrograma: number, nroround:number ,idMuestra: number ): Observable<any>{
    
    this.url = `${ this.urlBase }qce/resultqce/responsexsample/${ idclient }/${idsede}/${ idPrograma }/${ nroround }/${ idMuestra }`;

    return this.http.get( this.url );
    
  }

}
