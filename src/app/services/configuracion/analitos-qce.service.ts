import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class AnalitosQceService extends ApiService {

  constructor(private http: HttpClient) {
    super(http);
    this.apiURL += 'qce/analytesQces';
  }

  public async getAllAsyncAnalytes(): Promise<any> {
    return await this.httpClient.get<any>(`${this.apiURL}/analytesqcedetails`).toPromise();
  }
}

// import { HttpClient, HttpResponse } from '@angular/common/http';
// import { Injectable } from '@angular/core';
// import { ApiService } from '../api.service';
// import { Observable, throwError } from 'rxjs';
// import { catchError, map } from 'rxjs/operators';

// @Injectable({
//   providedIn: 'root'
// })
// export class AnalitosQceService extends ApiService {

//   constructor(private http: HttpClient) {
//     super(http);
//     this.apiURL += 'qce/analytesQces';
//   }

//   // Obtener todos los analitos de forma asíncrona
//   public async getAllAsyncAnalytes(): Promise<any> {
//     return await this.httpClient.get<any>(`${this.apiURL}/analytesqcedetails`).toPromise();
//   }


//   // Crear un analito
// create(data: any): Observable<{ status: number; body: any }> {
//   return this.http.post<HttpResponse<any>>(this.apiURL, data, { observe: 'response' }).pipe(
//     map((response: HttpResponse<any>) => {
//       return {
//         status: response.status,
//         body: response.body ?? {}
//       };
//     }),
//     catchError((error) => {
//       return throwError(() => error);
//     })
//   );
// }
// // Actualizar un analito
// update(data: any, id: number): Observable<{ status: number; body: any }> {
//   return this.http.put<HttpResponse<any>>(`${this.apiURL}/${id}`, data, { observe: 'response' }).pipe(
//     map((response: HttpResponse<any>) => {
//       return {
//         status: response.status,
//         body: response.body ?? {}
//       };
//     }),
//     catchError((error) => {
//       return throwError(() => error);
//     })
//   );
// }

// // Eliminar un analito
// deleteAnalito(id: number): Observable<{ status: number; body: any }> {
//   return this.http.delete<HttpResponse<any>>(`${this.apiURL}/${id}`, { observe: 'response' }).pipe(
//     map((response: HttpResponse<any>) => ({
//       status: response.status,
//       body: response.body ?? {}
//     })),
//     catchError((error) => throwError(() => error))
//   );
// }




//}

