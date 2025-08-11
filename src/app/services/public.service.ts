import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApiService } from './api.service';
import { FormGroup } from '@angular/forms';

@Injectable({
    providedIn: 'root'
})

export class PublicService extends ApiService {


  constructor(
      private http: HttpClient
  ) {
      super(http);
      this.apiURL += 'public';
  }

  obtenerSedes(): Promise<any> {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<any>(this.apiURL + '/sedes', { headers: reqHeaders }).toPromise();
  }


  obtenerSedesAsigProg(cliente: any): Promise<any> {
      const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json', 'Client': cliente });
      return this.http.get<any>(this.apiURL + '/sedes', { headers: reqHeaders }).toPromise();
  }

  obtenerRoles(): Promise<any> {

      const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
      return this.http.get<any>(this.apiURL + '/roles', { headers: reqHeaders }).toPromise();
  }

  obtenerTiposDoc(): Promise<any> {

      const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
      return this.http.get<any>(this.apiURL + '/tiposdoc', { headers: reqHeaders }).toPromise();
  }

  passwordsIguales( passw1: string, passw2: string){
      return ( form: FormGroup) => {
      const passw1Control = form.controls[passw1];
      const passw2Control = form.controls[passw2];

      if(passw1Control.value === passw2Control.value){
        passw2Control.setErrors(null);
      } else {
        passw2Control.setErrors({ noEsigual: true});
      }
    }
  }
}
