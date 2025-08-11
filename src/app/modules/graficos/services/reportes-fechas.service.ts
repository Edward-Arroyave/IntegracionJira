import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.prod';


@Injectable({
  providedIn: 'root'
})

export class ReportesFechasService{

  urlBase  : string = environment.apiUrl;

  constructor( private http: HttpClient ) { }

  //- ------Ingreso datos  Cuantitativo-----------

  getReportsByDatesCuanti( fechaInicial: string, fechaFinal: string, leveltest: number, idheadquaerters: number, idanalyzer: number, idcontrolmaterial: number, idlot: number, idanalyte: number ){
    
    let url = `${ this.urlBase }Reportes/graficoet/'${ fechaInicial }'/'${ fechaFinal }'/${ leveltest }/${ idheadquaerters }/${ idanalyzer }/${ idcontrolmaterial }/${ idlot }/${ idanalyte }`;

    return this.http.get( url ).toPromise();

  }

//- ------Ingreso datos  Cualitativo-----------

  getARByDatesCuali( fechaInicial: string, fechaFinal: string, level: number, idSede: number, idAnalyzer: number, idMaterial: number, idLote: number, idAnalito: number ){
    
    let url = `${this.urlBase}Reportes/calcularARxfechas/${ fechaInicial }/${ fechaFinal }/${ level }/${ idSede }/${ idAnalyzer }/${ idMaterial }/${ idLote }/${ idAnalito }`;
    return this.http.get(url).toPromise();

  }


  getDataByDatesCuali( fechaInicial: string, fechaFinal: string, level: number, idheadquaerters: number, idanalyzer: number, idcontrolmaterial: number, idlot: number, idanalyte: number) {

    let urlEjes = `${this.urlBase}Reportes/graphsqcixfechas/${ fechaInicial }/${ fechaFinal }/${level}/${idheadquaerters}/${idanalyzer}/${idcontrolmaterial}/${idlot}/${idanalyte}`;

    return this.http.get(urlEjes).toPromise();

  }


}
