import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})

export class ProgramaPorClienteService{

  urlBase: string = environment.apiUrl;

  constructor( private http: HttpClient ){}

  getProgramasPorCliente( nit: number, idsede:number ){

    let url = `${this.urlBase}qce/ProgramQce/programxclient/${nit}/${idsede}`;

    return this.http.get( url );

  }

}

