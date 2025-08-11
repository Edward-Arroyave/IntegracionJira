import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AssignValuesExpectedQceService extends ApiService {

  private apiBase: string;
  constructor(private http: HttpClient) {
    super(http);
    this.apiBase = this.apiURL;
    this.apiURL += 'qce/AssignValuesExpected';
  }


  getAssignValuesExpected(idLote: number, idPrograma: number) {
    return this.http.get<any>(`${this.apiURL}/${idLote}/${idPrograma}`);
  }

  updateAssignValuesExpected(idAssignValuesExpected: any, data: any): Promise<any> {
    return this.httpClient.post<any>(`${this.apiURL}/${idAssignValuesExpected}`, data).toPromise();
  }

  createAssignValuesExpected(entity: any): Promise<any> {
    return this.httpClient.post<any>(`${this.apiURL}`, entity).toPromise();
  }

  // Valores esperandos 2

  getAssignValuesExpected2(idLot: number, idProgram: number) {
    return this.http.get<any>(this.apiBase + `qce/ExpectedValueQuantitativeReport/ExpectedValueSettingsTwo/${idProgram}/${idLot}`);
  }

  updateAssignValuesExpected2(idAssignValuesExpected: any, data: any): Promise<any> {
    return this.httpClient.put<any>(this.apiBase + `qce/ExpectedValueQuantitativeReport/UpdateExpectedValueParameterization/${idAssignValuesExpected}`, data).toPromise();
  }

  createAssignValuesExpected2(entity: any) {
    return this.httpClient.post<any>(this.apiBase + `qce/ExpectedValueQuantitativeReport/SaveExpectedValueParameterization`, entity).toPromise();
  }
  DeleteAssignValuesExpected2(id): Observable<any> {
    return this.httpClient.delete<any>(this.apiBase + `qce/ExpectedValueQuantitativeReport/DeleteExpectedValueParameterization/${id}`)
  }

  //Eliminación de valores esperados
  deleteAssignValuesExpected(id: any): Observable<any> {
    return this.httpClient.delete<any>(this.apiBase + `qce/AssignValuesExpected/${id}`);
  }

}
