import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';


@Injectable({
  providedIn: 'root'
})

export class ReporteCualitativoService extends ApiService {

  urlPrincipal:string;

  constructor(private http: HttpClient) {
    super(http);
    this.urlPrincipal = this.apiURL
    this.apiURL += 'ReporteCualitativo/';
    
  }

  loteXsection(data:any){
    return this.http.post(this.urlPrincipal+'Lots/listlotsxsection',data)
  }
  sedesXseccion(data:any){
    return this.http.post(this.urlPrincipal+'Sections/listsectionxsede',data)
  }
  analitosXsede(data:any){
    return this.http.post(this.urlPrincipal+'Analytes/listanalytesxsection',data)
  }
  equipoXsede(data:any){
    return this.http.post(this.urlPrincipal+'Analyzers/listanalyzerxsection',data)
  }
  sedesXseccionCualitativo(data:any){
    return this.http.post(this.urlPrincipal+'Sections/listsectioncualixsede',data)
  }
  analitosXsedeCualitativo(data:any){
    return this.http.post(this.urlPrincipal+'Analytes/listanalytescualixsection',data)
  }
  equipoXsedeCualitativo(data:any){
    return this.http.post(this.urlPrincipal+'Analyzers/listanalyzercualixsection',data)
  }
  
  graficaBarrasConcordanciaGeneral(data:any){
    return this.http.post(this.apiURL+'pctconcordanciageneral',data)
  }

  graficaBarrasConcordancia(data:any){
    return this.http.post(this.apiURL+'pctconcordancia',data)
  }
  
  graficaDesemp(data:any){
    return this.http.post(this.apiURL+'reportedesempenio',data)
  }
  graficaDesempGeneral(data:any){
    return this.http.post(this.apiURL+'reportedesempeniogeneral',data)
  }
  
  graficaSigma(data:any){
    return this.http.post(this.apiURL+'metricasigma',data)
  }

  tabla(data:any){
    return this.http.post(this.apiURL+'tabladatos',data)
  }
  tablaGeneral(data:any){
    return this.http.post(this.apiURL+'tabladatosgeneral',data)
  }
}
