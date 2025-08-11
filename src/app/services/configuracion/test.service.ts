import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { __await } from 'tslib';
import { ApiService } from '../api.service';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class TestsService extends ApiService {

  constructor(private http: HttpClient) {
    super(http);
    this.apiURL += 'tests';
  }

  detalleTest() {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<any>(this.apiURL + '/detalleTest', { headers: reqHeaders }).toPromise();
  }

  public  gettest(id: any): Observable<any> {
    return  this.httpClient.get<any>(`${this.apiURL}/${id}`);
  }

  //Metodo que trae los identificadores de los test dependiendo de las fechas desde - hasta
  public async TestXResultadosAsync(fechaDesde: Date, fechaHasta: Date): Promise<any> {

    return await this.httpClient.get<any>(`${this.apiURL}/TestResultados/${fechaDesde}/${fechaHasta}`).toPromise();
  }
}
