import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';


@Injectable({
  providedIn: 'root'
})
export class DatosAberrantesService extends ApiService {

  constructor(private http: HttpClient) {
    super(http);
    this.apiURL += 'qce/AberrantfiltercriteriaQce';
  }
}
