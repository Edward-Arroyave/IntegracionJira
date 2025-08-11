import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AssignValuesExpectedCualiQceService extends ApiService {

  constructor(private http: HttpClient) {
    super(http);
    this.apiURL += 'qce/AssignValuesExpectedCuali';
  }


  getAssignValuesExpected( idLote: number, idPrograma:number ){
    return this.http.get<any>(`${this.apiURL}/${idLote}/${idPrograma}`);
  }

  updateAssignValuesExpected(idResultsDictionary:number,entity: any): Promise<any> {
    return this.httpClient.post<any>(`${this.apiURL}/${idResultsDictionary}`, entity).toPromise();
  }

  createAssignValuesExpected(entity: any): Promise<any> {
    return this.httpClient.post<any>(`${this.apiURL}`, entity).toPromise();
  }

  deleteAssignValuesExpected(idAssignValuesExpectedCuali: any) : Observable<any> {
    return this.httpClient.delete<any>(`${this.apiURL}/${idAssignValuesExpectedCuali}`);
  }

}
