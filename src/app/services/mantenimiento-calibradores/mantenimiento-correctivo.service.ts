import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { environment } from '@environment/environment';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class MantenimientoCorrectivoService extends ApiService {

  constructor(private http: HttpClient) {
    super(http);
  }

  public createFileMantenimiento(entity: any): Observable<any> {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const entityJson = JSON.stringify(entity);
    return this.httpClient.post<any>(`${environment.apiUrl}mto/Filesuportcorrmto`, entityJson, { headers: reqHeaders });
  }
  public getObtenerEquipoSeriales(): Observable<any>  {
    return  this.http.get(`${environment.apiUrl}mto/Devicesmto`);
  }

  public async getObtenerTodos(): Promise<any> {
    console.log("URL",environment.apiUrl);
    return await this.httpClient.get(`${environment.apiUrl}mto/Devicesmto`).toPromise();
  }
  public getObtenerFile(id: any): Observable<any>  {
    return  this.http.get(`${environment.apiUrl}mto/Filesuportcorrmto/infofiles/${id}`);
  }

  public getObtenerHistorialMantenimeinto(serial:any): Observable<any>  {
    return  this.http.get(`${environment.apiUrl}mto/Correctivemto/infocorrectivos/${serial}`);
  }

  public create(entity: any): Observable<any> {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const entityJson = JSON.stringify(entity);
    return this.httpClient.post<any>(`${environment.apiUrl}mto/Correctivemto`, entityJson, { headers: reqHeaders });
  }

  public editar(entity: any, id:any): Observable<any> {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const entityJson = JSON.stringify(entity);
    return this.httpClient.put<any>(`${environment.apiUrl}mto/Correctivemto/${id}`, entityJson, { headers: reqHeaders });
  }

  public ConsultarArchivp(id:any): Observable<any>  {
    return  this.http.get(`${environment.apiUrl}mto/Filesuportcorrmto/${id}`);
  }

  public editarArchivo(entity: any, id:any): Observable<any> {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const entityJson = JSON.stringify(entity);
    return this.httpClient.put<any>(`${environment.apiUrl}mto/Filesuportcorrmto/${id}`, entityJson, { headers: reqHeaders });
  }


}
