import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';


@Injectable({
  providedIn: 'root'
})
export class ReactivosService extends ApiService {

  constructor(private http: HttpClient) {
    super(http);
    this.apiURL += 'reagents';
  }

  public async getAllAsyncReactivos(): Promise<any> {
    return await this.httpClient.get<any>(`${this.apiURL}/listReagents`).toPromise();
  }
}
