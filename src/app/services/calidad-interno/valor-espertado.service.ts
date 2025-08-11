import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environment/environment';


@Injectable({
  providedIn: 'root'
})

export class ValorEsperadoService{
    
    private apiURL = environment.apiUrl

    constructor(private http: HttpClient) {}

    valorEsperadoCualitativo(idprogram:number){
        return this.http.get(this.apiURL+`qce/ConfanalyteresultQce/confanalyteresultfilter/${idprogram}`)
    }
}
