import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConstants } from '@app/Constants/constants';
import { environment } from '@environment/environment';
import dayjs from 'dayjs';

@Injectable({
  providedIn: 'root'
})

export class DEAService{

  urlBase  : string = environment.apiUrl;
  urlPoints: string = '';
  actual = dayjs().format('YYYY-MM-DD');

  constructor( private http: HttpClient ) { }

  async cvFija(desde: any, hasta: any, levelTest: number, idheadquaerters: number, idanalyzer: number, idcontrolmaterial: number, idlot: number, idanalyte: number, idtest:number ){

    let url: string = `${ this.urlBase }Reportes/cvfija/'${ desde }'/'${ hasta }'/${ levelTest }/${ idheadquaerters }/${ idanalyzer }/${ idcontrolmaterial }/${ idlot }/${ idanalyte }/${idtest}`;

    return this.http.get( url ).toPromise();
    
  }

  async dsFija(desde: any, hasta: any, levelTest: number, idheadquaerters: number, idanalyzer: number, idcontrolmaterial: number, idlot: number, idanalyte: number,idtest:number ){

    let url: string = `${ this.urlBase }Reportes/dsfija/'${ desde }'/'${ hasta }'/${ levelTest }/${ idheadquaerters }/${ idanalyzer }/${ idcontrolmaterial }/${ idlot }/${ idanalyte }/${idtest}`;

    return this.http.get( url ).toPromise();
    
  }

  async mediaFija(desde: any, hasta: any, levelTest: number, idheadquaerters: number, idanalyzer: number, idcontrolmaterial: number, idlot: number, idanalyte: number,idtest:number ){

    let url: string = `${ this.urlBase }Reportes/mediafija/'${ desde }'/'${ hasta }'/${ levelTest }/${ idheadquaerters }/${ idanalyzer }/${ idcontrolmaterial }/${ idlot }/${ idanalyte }/${idtest}`;

    return this.http.get( url ).toPromise();
    
  }

  async mediaTotalAcumulada(testid:number, levelTest: number  ){

    let url: string = `${ this.urlBase }Reportes/calculaMediaAcumulada/${ testid }/${levelTest}`;

    return this.http.get( url ).toPromise();
    
  }

  async dsTotalAcumulada(testid:number, levelTest: number  ){

    let url: string = `${ this.urlBase }Reportes/calculaDSAcumulada/${ testid }/${levelTest}`;

    return this.http.get( url ).toPromise();
    
  }

  async mediaAcumulada(levelTest: number, idheadquaerters: number, idanalyzer: number, idcontrolmaterial: number, idlot: number, idanalyte: number, testid:number ){

    let url: string = `${ this.urlBase }Reportes/calculaMedia/'${this.actual}'/${AppConstants.dianacalculate}/${ levelTest }/${ idheadquaerters }/${ idanalyzer }/${ idcontrolmaterial }/${ idlot }/${ idanalyte }/${testid}`;

    return this.http.get( url ).toPromise();
    
  }

  async dsAcumulado(levelTest: number, idheadquaerters: number, idanalyzer: number, idcontrolmaterial: number, idlot: number, idanalyte: number, testid:number){
    
    let url: string = `${ this.urlBase }Reportes/calculads/'${this.actual}'/${AppConstants.dianacalculate}/${ levelTest }/${ idheadquaerters }/${ idanalyzer }/${ idcontrolmaterial }/${ idlot }/${ idanalyte }/${testid}`;
 
      return this.http.get( url ).toPromise();
     
   }
 
   async cvAcumulado(levelTest: number, idheadquaerters: number, idanalyzer: number, idcontrolmaterial: number, idlot: number, idanalyte: number, testid :number){
    
    let url: string = `${ this.urlBase }Reportes/calculacv/'${this.actual}'/${AppConstants.dianacalculate}/${ levelTest }/${ idheadquaerters }/${ idanalyzer }/${ idcontrolmaterial }/${ idlot }/${ idanalyte }/${testid}`;
 
      return this.http.get( url ).toPromise();
     
   }


   async mediaMes(levelTest: number, idheadquaerters: number, idanalyzer: number, idcontrolmaterial: number, idlot: number, idanalyte: number, testid: number ){

    let url: string = `${ this.urlBase }Reportes/calculaMediaMes/${ levelTest }/${ idheadquaerters }/${ idanalyzer }/${ idcontrolmaterial }/${ idlot }/${ idanalyte }/${testid}`;

    return this.http.get( url ).toPromise();
    
  }

  async dsMes(levelTest: number, idheadquaerters: number, idanalyzer: number, idcontrolmaterial: number, idlot: number, idanalyte: number, testid:number ){
    
    let url: string = `${ this.urlBase }Reportes/calculaDSMes/${ levelTest }/${ idheadquaerters }/${ idanalyzer }/${ idcontrolmaterial }/${ idlot }/${ idanalyte }/${testid}`;
 
      return this.http.get( url ).toPromise();
     
   }
 
   async cvMes(levelTest: number, idheadquaerters: number, idanalyzer: number, idcontrolmaterial: number, idlot: number, idanalyte: number, testid:number ){
    
    let url: string = `${ this.urlBase }Reportes/calculacvMes/${ levelTest }/${ idheadquaerters }/${ idanalyzer }/${ idcontrolmaterial }/${ idlot }/${ idanalyte }/${testid}`;
 
      return this.http.get( url ).toPromise();
     
   }
 


}
