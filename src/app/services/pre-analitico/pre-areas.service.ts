import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class PreAreasService extends ApiService {

  constructor(private http: HttpClient) {
    super(http);
    this.apiURL += 'pre/Areapre';
  }
}
