import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environment/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class InfoResultQceService{

  private urlBase  : string = environment.apiUrl;

  constructor( private http: HttpClient ) { }

  getData( cliente: number,idsede:number, programa: number ): Observable<any>{
    
    let url = `${ this.urlBase }qce/resultqce/inforesultqce/${ cliente }/${idsede}/${ programa }`;

    return this.http.get( url );
    
  }

  getSamplesByClienteAndRound( cliente: number,idsede:number, programa: number, numeroRonda: number ): Observable<any>{

    let url = `${ this.urlBase }qce/sampleqce/Listsamplesxround/${ cliente }/${idsede}/${ programa }/${ numeroRonda }`;

    return this.http.get( url );

  }

    //Consulta los reportes historicos que fueron descargados
    async GetDownloadReportes(idClient:number, idSede:number,idProgram:number, nroRound:number, idSample:number, tipoReporte:number ): Promise<any> {
      const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
      return await this.http.get<any>(`${this.urlBase}qce/resultqce/GetDownloadReportes/${idClient}/${idSede}/${idProgram}/${nroRound}/${idSample}/${tipoReporte}`,{ headers: reqHeaders }).toPromise();
    }

}
