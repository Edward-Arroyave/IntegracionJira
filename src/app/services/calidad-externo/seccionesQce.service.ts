import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';


@Injectable({
  providedIn: 'root'
})
export class SeccionesQceService extends ApiService {

  constructor(private http: HttpClient) {
    super(http);
    this.apiURL += 'qce/SectionQce';
    
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
// export class SeccionesQceService extends ApiService {

//   constructor(private http: HttpClient) {
//     super(http);
//     this.apiURL += 'qce/SectionQce';
//   }

//   // Método para crear
//   create(data: any): Observable<HttpResponse<any>> {
//     return this.http.post<HttpResponse<any>>(this.apiURL, data, { observe: 'response' }).pipe(
//       map((response: HttpResponse<any>) => {
//         if (response.status === 200 || response.status === 201 || response.status === 204) {
//           return response;
//         } else {
//           throw new Error(`Código de estado inesperado: ${response.status}`);
//         }
//       }),
//       catchError((error) => {
//         return throwError(() => error);
//       })
//     );
//   }

//   // Método para actualizar
//   update(data: any, id: number): Observable<HttpResponse<any>> {
//     return this.http.put<HttpResponse<any>>(`${this.apiURL}/${id}`, data, { observe: 'response' }).pipe(
//       map((response: HttpResponse<any>) => {
//         if (response.status === 200 || response.status === 201 || response.status === 204) {
//           return response;
//         } else {
//           throw new Error(`Código de estado inesperado: ${response.status}`);
//         }
//       }),
//       catchError((error) => {
//         return throwError(() => error);
//       })
//     );
//   }
// }
