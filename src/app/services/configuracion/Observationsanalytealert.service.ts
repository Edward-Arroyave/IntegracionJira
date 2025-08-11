import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.prod';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class ObservationsanalytealertService extends ApiService {

  constructor(private http: HttpClient) {
    super(http);
    this.apiURL += 'Observationsanalytesalert';
  }
 
  getDataObservationsAnalitosAlerta(data: any) {

    const url = `${ this.apiURL }/listobservationsanalytealert`;

    return this.http.post( url, data ).toPromise();

  }

  getDataObservationsAnalitosAlertaxid(idsede: number, idanalyte:number, idsection:number, nivel:number, sig:number, cvr:number, sr:number,iet:number) {

    const url = `${ this.apiURL }/deteilsobservations/${idsede}/${idanalyte}/${ idsection }/${nivel}/${sig}/${cvr}/${sr}/${iet}`;

    return this.http.get( url).toPromise();

  }


}
