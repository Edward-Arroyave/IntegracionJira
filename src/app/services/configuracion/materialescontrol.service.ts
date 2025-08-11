import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';


@Injectable({
  providedIn: 'root'
})
export class ControlMaterialService extends ApiService {

  constructor(private http: HttpClient) {
    super(http);
    this.apiURL += 'controlmaterial';
  }

  public async getAllAsyncControlMaterial(): Promise<any> {
    return await this.httpClient.get<any>(`${this.apiURL}/listControlMaterial`).toPromise();
  }

  public async getAllAsyncControlMaterialEdit(id:number): Promise<any> {
    return await this.httpClient.get<any>(`${this.apiURL}/DetailsControlMaterial/` + id).toPromise();
  }

  public async getAllAsyncControlMaterialxsedesec(id:any, idSede:any): Promise<any> {
    return await this.httpClient.get<any>(`${this.apiURL}/controlmaterialxsedesectionpred/${id}/${idSede}`).toPromise();
  }

 

  
}
