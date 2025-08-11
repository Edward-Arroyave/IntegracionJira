import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';


@Injectable({
  providedIn: 'root'
})
export class Unidadeservice extends ApiService {

  constructor(private http: HttpClient) {
    super(http);
    this.apiURL += 'units';
  }
  public async getAllAsyncUnits(): Promise<any> {
    return await this.httpClient.get<any>(`${this.apiURL}/listUnits`).toPromise();
  }
}
