import { HttpHeaders } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class ObjetivosCalidadQceService extends ApiService {

  constructor(private http: HttpClient) {
    super(http);
    this.apiURL += 'qce/ConfobjquaprogramanalyteQce';

  }
  listaProgramas() {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<any>(`${this.apiURL}/programconf`, { headers: reqHeaders }).toPromise();
  }
  filtrarDatos(programa) {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<any>(`${this.apiURL}/confobjquadetails/${programa}`, { headers: reqHeaders }).toPromise();
  }
  listaAnalytes(programa) {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<any>(`${this.apiURL}/listanalytes/${programa}`, { headers: reqHeaders }).toPromise();
  }
  programaAnalito(Idanalytes,idProgram) {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<any>(`${this.apiURL}/Programxanalito/${Idanalytes}/${idProgram}`, { headers: reqHeaders }).toPromise();
  }

}
