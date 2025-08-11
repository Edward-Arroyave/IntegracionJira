import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';


@Injectable({
  providedIn: 'root'
})

export class SampleQceService extends ApiService {

  constructor(private http: HttpClient) {
    super(http);
    this.apiURL += 'qce/SampleQce';
    
  }

 
  getSamplesByClienteReport(cliente: number,idsede:number, programa: number, numeroRonda: number): Promise<any> {
    return this.http.get<any>(`${this.apiURL}/Listsamplesxround/${ cliente }/${idsede}/${ programa }/${ numeroRonda }`).toPromise();
  }
}
