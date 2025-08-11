import { Injectable } from "@angular/core";
import { ApiService } from '../api.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from "@environment/environment";
import { Observable } from "rxjs";




@Injectable({
    providedIn: 'root'
  })
  export class MantenimientoPreventivoService extends ApiService {
  
    constructor(private http: HttpClient) {
      super(http);
      this.apiURL += 'mto/Preventivemto';
    }
  
    getInfoPreventivo( serial: string){  
      let url = `${this.apiURL}/infopreventivos/${serial}`;
      return this.http.get(url);
    } 

    public getArchivosMtoPreventivo(idpreventive: number): Observable<any>  {
      return  this.http.get(`${environment.apiUrl}/mto/Filesuportprevmto/infofiles/${idpreventive}`);
    }

    public createArchivoMtoPreventivo(entity: any): Observable<any> {
      const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
      const entityJson = JSON.stringify(entity);
      return this.httpClient.post<any>(`${environment.apiUrl}mto/Filesuportprevmto`, entityJson, { headers: reqHeaders });
    }

    public editarArchivoMtoPreventivo(entity: any, id:any): Observable<any> {
      const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
      const entityJson = JSON.stringify(entity);
      return this.httpClient.put<any>(`${environment.apiUrl}mto/Filesuportprevmto/${id}`, entityJson, { headers: reqHeaders });
    }

    public getArchivoMtoPrev(id:any): Observable<any>  {
      return  this.http.get(`${environment.apiUrl}mto/Filesuportprevmto/${id}`);
    }

  
  }