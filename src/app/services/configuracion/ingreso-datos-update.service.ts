import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConstants } from '@app/Constants/constants';
import { ValidaReglaXDSInterface } from '@app/interfaces/validarRegla-xds.interface';
import { environment } from '@environment/environment';

@Injectable({
  providedIn: 'root'
})

export class IngresoDatosUpdateService {
  
  urlBase: string = environment.apiUrl;

  constructor(private http: HttpClient) {

  }
  
  params(fecha: string, number: number, idheadquaerters: number, idanalyzer: number, idcontrolmaterial: number, idlot: number, idanalyte: number,idTest:number ){

    let url = `${this.urlBase}Reportes/Validareglaszscorefn/${fecha}/${AppConstants.dianacalculate}/${ number }/${idheadquaerters}/${idanalyzer}/${idcontrolmaterial}/${idlot}/${idanalyte}/${idTest}`;    
    return this.http.get<ValidaReglaXDSInterface[]>( url ).toPromise();

  }

  paramsSiHayConfiguracion(fecha: string, number: number, idheadquaerters: number, idanalyzer: number, idcontrolmaterial: number, idlot: number, idanalyte: number ,idTest:number){

    let url = `${this.urlBase}Reportes/Validareglaszscore/${fecha}/${AppConstants.dianacalculate}/${ number }/${idheadquaerters}/${idanalyzer}/${idcontrolmaterial}/${idlot}/${idanalyte}/${idTest}`;    
    return this.http.get<ValidaReglaXDSInterface[]>( url ).toPromise();

  }

}