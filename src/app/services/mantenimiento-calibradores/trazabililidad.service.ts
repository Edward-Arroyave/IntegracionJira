import { Injectable } from "@angular/core";
import { ApiService } from '../api.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
  })
  export class TrazabilidadServices extends ApiService {

    constructor(private http: HttpClient) {
      super(http);
      this.apiMongo += '/infotrazabilidad';
      this.apiURL +='Menus';
    }

    // public getTrazabilidadLogs(fechaini: string ,fechafinal :string, modulo:string,submod:string,item:string,accion:string): Observable<any>  {
    //     return  this.http.post(`${this.apiMongo}/${fechaini}/${fechafinal}/${modulo}/${submod}/${item}/${accion}`);
    // }

    public getTrazabilidadLogs(entity: any): Observable<any> {
      const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
      return this.httpClient.post<any>(`${this.apiMongo}`, entity, { headers: reqHeaders });
    }

    public async getModules(): Promise<any> {
        return await this.httpClient.get<any>(this.apiURL + '/modules').toPromise();
    }

    public getMenuxId(menuid:number): Observable<any> {
        const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
        return this.httpClient.get<any>(`${this.apiURL}/infomenu/` + menuid, { headers: reqHeaders });
      }

    public async getSubmodules(menuid:number): Promise<any> {
        return await this.httpClient.get<any>(this.apiURL + '/submodules/' + menuid).toPromise();
    }
  }