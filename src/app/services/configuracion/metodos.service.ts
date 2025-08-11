import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';


@Injectable({
  providedIn: 'root'
})
export class MetodosService extends ApiService {

  constructor(private http: HttpClient) {
    super(http);
    this.apiURL += 'methods';
  }

  public async getAllAsyncMethods(): Promise<any> {
    return await this.httpClient.get<any>(`${this.apiURL}/listMethods`).toPromise();
  }
}
