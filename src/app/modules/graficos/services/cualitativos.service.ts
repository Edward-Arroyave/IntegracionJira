import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environment/environment';
import dayjs from 'dayjs';
import { IngresoDatosCualitativoService } from '@app/services/configuracion/ingreso-datos-cualitativo.service';
import { Resultqualitative } from '@app/Models/Resultqualitative';
import { ReportesFechasService } from './reportes-fechas.service';

@Injectable({
  providedIn: 'root'
})

export class CualitativosService {

  private urlBase = environment.apiUrl;
  private ptsLvl1 = [];
  private ptsLvl2 = [];
  private ptsLvl3 = [];
  private validacionReglas = [];
  private datos = [];
  private fecha = dayjs().format('YYYY-MM-DD');

  constructor(private http: HttpClient,
    private IDCL: IngresoDatosCualitativoService,
    private reportesFechasService: ReportesFechasService) { }

  getData(fecha: string, level: number, idheadquaerters: number, idanalyzer: number, idcontrolmaterial: number, idlot: number, idanalyte: number) {

    let urlEjes = `${this.urlBase}Reportes/graphsqci/${fecha}/365/${level}/${idheadquaerters}/${idanalyzer}/${idcontrolmaterial}/${idlot}/${idanalyte}`;

    return this.http.get(urlEjes).toPromise();

  }

  async getEjes(level: number, idheadquaerters: number, idanalyzer: number, idcontrolmaterial: number, idlot: number, idanalyte: number, data: any) {

    this.datos = data;

    await this.getData(this.fecha, 1, idheadquaerters, idanalyzer, idcontrolmaterial, idlot, idanalyte).then((data0: any) => {

      this.ptsLvl1 = data0;


    }).catch(error => {

      this.ptsLvl1 = [];

    })

    if (level >= 2) {

      await this.getData(this.fecha, 2, idheadquaerters, idanalyzer, idcontrolmaterial, idlot, idanalyte).then((data2: any) => {

        this.ptsLvl2 = data2;

      }).catch(error => {

        this.ptsLvl2 = [];

      });

    }

    if (level == 3) {

      await this.getData(this.fecha, 3, idheadquaerters, idanalyzer, idcontrolmaterial, idlot, idanalyte).then((data3: any) => {

        this.ptsLvl3 = data3;

      }).catch(error => {

        this.ptsLvl3 = [];

      });

    }

  }


  get ejesNvlUno() {

    return this.ptsLvl1;

  }

  get ejesNvlDos() {

    return this.ptsLvl2;

  }

  get ejesNvlTres() {

    return this.ptsLvl3;

  }

  get ars() {

    return this.datos;

  }





  validarAR(sede: number, analyzer: number, material: number, lote: number, analito: number, level: number, data: any) {

    // setTimeout(() => {


    // }, 1000);

    this.IDCL.getAR(this.fecha, 1, sede, analyzer, material, lote, analito).then((response: any) => {

      this.validacionReglas = response;

    });

    if (level >= 2) {

      //setTimeout(() => {

      this.IDCL.getAR(this.fecha, 2, sede, analyzer, material, lote, analito).then((response: any) => {
        this.validacionReglas = response;
      });

      //}, 1000);

    }

    if (level == 3) {


      this.IDCL.getAR(this.fecha, 3, sede, analyzer, material, lote, analito).then((response: any) => {

        this.validacionReglas = response;
      });
    }

    return new Promise((resolve) => {

      return resolve(1);

    })

  }








  // ------------------------
  async getEjesByDates(fechaInicial: string, fechaFinal: string, level: number, idheadquaerters: number, idanalyzer: number, idcontrolmaterial: number, idlot: number, idanalyte: number, data: any) {

    this.datos = data;

    await this.reportesFechasService.getDataByDatesCuali(fechaInicial, fechaFinal, 1, idheadquaerters, idanalyzer, idcontrolmaterial, idlot, idanalyte).then((data: any) => {

      this.ptsLvl1 = data;

    }).catch(error => {

      this.ptsLvl1 = [];

    })

    if (level >= 2) {

      await this.reportesFechasService.getDataByDatesCuali(fechaInicial, fechaFinal, 2, idheadquaerters, idanalyzer, idcontrolmaterial, idlot, idanalyte).then((data: any) => {

        this.ptsLvl2 = data;

      }).catch(error => {

        this.ptsLvl2 = [];

      });

    }

    if (level == 3) {

      await this.reportesFechasService.getDataByDatesCuali(fechaInicial, fechaFinal, 3, idheadquaerters, idanalyzer, idcontrolmaterial, idlot, idanalyte).then((data: any) => {

        this.ptsLvl3 = data;

      }).catch(error => {

        this.ptsLvl3 = [];

      });

    }

  }
  // ------------------------

  async validarARByDates(fechaInicial: string, fechaFinal: string, sede: number, analyzer: number, material: number, lote: number, analito: number, level: number, data: any) {

    if(level === 1){
        await this.reportesFechasService.getARByDatesCuali(fechaInicial, fechaFinal, 1, sede, analyzer, material, lote, analito).then((response: any) => {
            this.validacionReglas = response;
        });
  
    }

    if (level == 2) {

      await this.reportesFechasService.getARByDatesCuali(fechaInicial, fechaFinal, 2, sede, analyzer, material, lote, analito).then((response: any) => {
          this.validacionReglas = response;
        });

    }

    if (level == 3) {

      await this.reportesFechasService.getARByDatesCuali(fechaInicial, fechaFinal, 3, sede, analyzer, material, lote, analito).then((response: any) => {
          this.validacionReglas = response;
        });

    }

    return new Promise((resolve) => {

      return resolve(1);

    })

  }


}
