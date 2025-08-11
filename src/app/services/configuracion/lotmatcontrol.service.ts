import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';


@Injectable({
  providedIn: 'root'
})
export class LotMatControlService extends ApiService {

  constructor(private http: HttpClient) {
    super(http);
    this.apiURL += 'lotcontrolmaterials';
  }

  detalleLotControlMaterial() {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<any>(this.apiURL + '/controlmaterialLot', { headers: reqHeaders }).toPromise();
  }

  filtroLotePorMC( id: number ){

    let url: string = `${ this.apiURL }/controlmaterial/${ id }`;

    return this.http.get( url );

  }

}
