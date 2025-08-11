import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { PdfService } from '../pdfs/pdf.service';

@Injectable({
  providedIn: 'root'
})

export class ReporteCuantitativoService {
  baseUrl = environment.apiUrl;

  constructor(private http: HttpClient,private pdfService:PdfService) {}

  getDatos(json: any){
    
    let url = `${this.baseUrl}qce/ReportecuantitativoQce/reportecuantitativo`;
    return this.http.post( url, json );
  }

  getDatos2(json: any){
    
    let url = `${this.baseUrl}qce/ReportecuantitativoQce/reportecuantitativo`;
    return this.http.post(url, json);
  }

  getDatosReporte2(json: any,nit?:any){
    !nit? json.Nit = this.pdfService.returnNit :json.Nit = nit ;
    let url = `${this.baseUrl}qce/ReportecuantitativoQce/Reporteconsolidadoqce`;
    return this.http.post( url, json );
  
  }

  finDeRonda(json: any,nit?:any){
    let url = `${this.baseUrl}qce/ReportecuantitativoQce/reportefinronda`;
    return this.http.post( url, json );
  }

  getDatosLabXcliente(nit: any){
    let url = `${this.baseUrl}qce/ClientQce/detailclient/${nit}`;
    return this.http.get( url );
  }

  getResumenMuestra(data:any){
    let url = `${this.baseUrl}qce/ReportecuantitativoQce/reportecuantitativo/resumenmuestra`;
    return this.http.post(url,data );
  }
}
