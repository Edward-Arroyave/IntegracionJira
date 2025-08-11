import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { InfopruebaInterface } from '@app/interfaces/infoprueba.interface';
import { environment } from '@environment/environment';

@Injectable({
  providedIn: 'root'
})
export class ResultsInfoPruebaService {

  urlBase: string = environment.apiUrl;

  constructor(private http: HttpClient) { }

  params(Idheadquarters: number, idControlMaterial: number, idLot: number, idanalyte: number) {

    let url = `${ this.urlBase }Results/infoprueba/${Idheadquarters}/${idControlMaterial}/${idLot}/${idanalyte}`;

    return this.http.get<InfopruebaInterface[]>( url );

  }

}