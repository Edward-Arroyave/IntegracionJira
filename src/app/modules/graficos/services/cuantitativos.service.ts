import { Injectable } from '@angular/core';
import { ETService } from './error-total.service';
import { ValoresDianaService } from '../../../services/configuracion/valores-diana.service';
import { ConfiguracionMediaDSService } from '@app/services/configuracion/configuracion-media-ds.service';
import { MLJService } from './multi-levey-jennings.service';
import dayjs from 'dayjs';
import { environment } from '@environment/environment';
import { HttpClient } from '@angular/common/http';

import { IngresoDatosUpdateService } from '@app/services/configuracion/ingreso-datos-update.service';
import { Results } from '@app/Models/Results';
import { IngresoDatosService } from '@app/services/configuracion/ingreso-datos.service';
import { TranslateService } from '@ngx-translate/core';
import { Observable} from 'rxjs';
import { ReportesFechasService } from './reportes-fechas.service';
import { ToastrService } from 'ngx-toastr';


@Injectable({
  providedIn: 'root'
})

export class CuantitativosService {

  fecha = dayjs().format('YYYY-MM-DD');
  urlBase: string = environment.apiUrl;

  idResult: any;

  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();
  validacionReglas = [];

  pts: any = [];

  graficocuantitativolvl1:string[] =[];

  ptsprueba: any = [];

  desvMulti = [];

  desv = [];

  DEI4_Nvl1: number;
  DEI4_Nvl2: number;
  DEI4_Nvl3: number;

  DEI3_Nvl1: number;
  DEI3_Nvl2: number;
  DEI3_Nvl3: number;

  DEI2_Nvl1: number;
  DEI2_Nvl2: number;
  DEI2_Nvl3: number;

  DEI1_Nvl1: number;
  DEI1_Nvl2: number;
  DEI1_Nvl3: number;

  media_Nvl1: number;
  media_Nvl2: number;
  media_Nvl3: number;

  li_Nvl1: number;
  li_Nvl2: number;
  li_Nvl3: number;

  ls_Nvl1: number;
  ls_Nvl2: number;
  ls_Nvl3: number;

  diana_Nvl1: number;
  diana_Nvl2: number;
  diana_Nvl3: number;

  DES4_Nvl1: number;
  DES4_Nvl2: number;
  DES4_Nvl3: number;

  DES3_Nvl1: number;
  DES3_Nvl2: number;
  DES3_Nvl3: number;

  DES2_Nvl1: number;
  DES2_Nvl2: number;
  DES2_Nvl3: number;

  DES1_Nvl1: number;
  DES1_Nvl2: number;
  DES1_Nvl3: number;

  hayDesviacionLvl1 = null;
  hayDesviacionLvl2 = null;
  hayDesviacionLvl3 = null;

  flagN1: number = 0;
  flagN2: number = 0;
  flagN3: number = 0;

  idtest:number;


  constructor(

    private errorTotalService: ETService,
    private configuracionMediaDSService: ConfiguracionMediaDSService,
    private valoresDianaService: ValoresDianaService,
    private multiLeveyJenningsService: MLJService,
    private http: HttpClient,
    private ingresoDatosUpdateService: IngresoDatosUpdateService,
    private ingresoDatosService: IngresoDatosService,
    private translate: TranslateService,
    private reportesFechasService: ReportesFechasService,
    private toastr: ToastrService,

  ) { }

  public truncarTresDecimales(valor) {
    return Math.trunc(valor * 100) / 100;
  }

  async params(numLab: number, idAnalyzer: number, numMat: number, numLot: number, idAna: number, levelTest: number, idTest: number, data: any, recargar: boolean) {

    this.pts = data;
    this.idtest = idTest;

    this.media_Nvl1 = 0;
    this.diana_Nvl1 = 0;
    this.li_Nvl1 = 0;
    this.ls_Nvl1 = 0;
    this.diana_Nvl1 = 0;

    this.media_Nvl2 = 0;
    this.diana_Nvl2 = 0;
    this.li_Nvl2 = 0;
    this.ls_Nvl2 = 0;
    this.diana_Nvl2 = 0;

    this.media_Nvl3 = 0;
    this.diana_Nvl3 = 0;
    this.li_Nvl3 = 0;
    this.ls_Nvl3 = 0;
    this.diana_Nvl3 = 0;
    
    if (recargar) {

      let hayDianaLvl1 = null;
      let hayDianaLvl2 = null;
      let hayDianaLvl3 = null;

      await this.valoresDianaService.getBuscadorConfiDianaValue(idTest).then(data => {

        hayDianaLvl1 = data.find(datos => datos.Level == 1 && datos.Active == true) || null;
        hayDianaLvl2 = data.find(datos => datos.Level == 2 && datos.Active == true ) || null;
        hayDianaLvl3 = data.find(datos => datos.Level == 3 && datos.Active == true ) || null;

       
      }).catch(error => {

        hayDianaLvl1 = null;
        hayDianaLvl2 = null;
        hayDianaLvl3 = null;

      });
      // hay diana y ds
      if ((this.hayDesviacionLvl1 != null && this.hayDesviacionLvl1.Average != 0) && (hayDianaLvl1 != null && hayDianaLvl1.Dianavalue != 0)) {
       
        this.hayDshayDianaLvl1(this.hayDesviacionLvl1.Ds, hayDianaLvl1.Dianavalue, this.hayDesviacionLvl1.Average, hayDianaLvl1.Upperlimit, hayDianaLvl1.Lowlimit);

      }

      // hay ds sin diana
      if ((this.hayDesviacionLvl1 != null && this.hayDesviacionLvl1.Average != 0) && (hayDianaLvl1 == null || hayDianaLvl1.Dianavalue == 0)) {
       
        this.hayDssinDianaLvl1(numLab, idAnalyzer, numMat, numLot, idAna, this.hayDesviacionLvl1.Ds, this.hayDesviacionLvl1.Average);

      }

      // hay diana sin ds
      if ((this.hayDesviacionLvl1 == null || this.hayDesviacionLvl1.Average == 0) && (hayDianaLvl1 != null && hayDianaLvl1.Dianavalue != 0)) {
       
        this.sinDshayDianaLvl1(numLab, idAnalyzer, numMat, numLot, idAna, hayDianaLvl1.Dianavalue, hayDianaLvl1.Upperlimit, hayDianaLvl1.Lowlimit);

      }

      // sin diana sin ds
      if ((this.hayDesviacionLvl1 == null || this.hayDesviacionLvl1.Average == 0) && (hayDianaLvl1 == null || hayDianaLvl1.Dianavalue == 0)) {
       
        this.sinDssinDianaLvl1(numLab, idAnalyzer, numMat, numLot, idAna);

      }

      if (levelTest >= 2) {

        this.multiLeveyJennings(numLab, idAnalyzer, numMat, numLot, idAna);

        // hay diana y ds
        if ((this.hayDesviacionLvl2 != null && this.hayDesviacionLvl2.Average != 0) && (hayDianaLvl2 != null && hayDianaLvl2.Dianavalue != 0)) {

          this.hayDshayDianaLvl2(this.hayDesviacionLvl2.Ds, hayDianaLvl2.Dianavalue, this.hayDesviacionLvl2.Average, hayDianaLvl2.Upperlimit, hayDianaLvl2.Lowlimit);

        }

        // hay ds sin diana
        if ((this.hayDesviacionLvl2 != null && this.hayDesviacionLvl2.Average != 0) && (hayDianaLvl2 == null || hayDianaLvl2.Dianavalue == 0)) {

          this.hayDssinDianaLvl2(numLab, idAnalyzer, numMat, numLot, idAna, this.hayDesviacionLvl2.Ds, this.hayDesviacionLvl2.Average);

        }

        // hay diana sin ds
        if ((this.hayDesviacionLvl2 == null || this.hayDesviacionLvl2.Average == 0) && (hayDianaLvl2 != null && hayDianaLvl2.Dianavalue != 0)) {

          this.sinDshayDianaLvl2(numLab, idAnalyzer, numMat, numLot, idAna, hayDianaLvl2.Dianavalue, hayDianaLvl2.Upperlimit, hayDianaLvl2.Lowlimit);

        }

        // sin diana sin ds
        if ((this.hayDesviacionLvl2 == null || this.hayDesviacionLvl2.Average == 0) && (hayDianaLvl2 == null || hayDianaLvl2.Dianavalue == 0)) {

          this.sinDssinDianaLvl2(numLab, idAnalyzer, numMat, numLot, idAna);

        }
      }

      if (levelTest == 3) {

        // hay diana y ds
        if ((this.hayDesviacionLvl3 != null && this.hayDesviacionLvl3.Average != 0) && (hayDianaLvl3 != null && hayDianaLvl3.Dianavalue != 0)) {

          this.hayDshayDianaLvl3(this.hayDesviacionLvl3.Ds, hayDianaLvl3.Dianavalue, this.hayDesviacionLvl3.Average, hayDianaLvl3.Upperlimit, hayDianaLvl3.Lowlimit);

        }

        // hay ds sin diana
        if ((this.hayDesviacionLvl3 != null && this.hayDesviacionLvl3.Average != 0) && (hayDianaLvl3 == null || hayDianaLvl3.Dianavalue == 0)) {

          this.hayDssinDianaLvl3(numLab, idAnalyzer, numMat, numLot, idAna, this.hayDesviacionLvl3.Ds, this.hayDesviacionLvl3.Average);

        }

        // hay diana sin ds
        if ((this.hayDesviacionLvl3 == null || this.hayDesviacionLvl3.Average == 0) && (hayDianaLvl3 != null && hayDianaLvl3.Dianavalue != 0)) {

          this.sinDshayDianaLvl3(numLab, idAnalyzer, numMat, numLot, idAna, hayDianaLvl3.Dianavalue, hayDianaLvl3.Upperlimit, hayDianaLvl3.Lowlimit);

        }

        // sin diana sin ds
        if ((this.hayDesviacionLvl3 == null || this.hayDesviacionLvl3.Average == 0) && (hayDianaLvl3 == null || hayDianaLvl3.Dianavalue == 0)) {

          this.sinDssinDianaLvl3(numLab, idAnalyzer, numMat, numLot, idAna);

        }

      }

    }

  }

// --------------------level 1---------------------------------------------

  async hayDshayDianaLvl1(ds: number, diana: number, media: number, ls: number, li: number) {

    this.media_Nvl1 = media;
    this.diana_Nvl1 = diana;
    this.li_Nvl1    = li;
    this.ls_Nvl1    = ls;

    this.DEI1_Nvl1 = this.truncarTresDecimales(media - ds);
    this.DEI2_Nvl1 = this.truncarTresDecimales(media - (ds * 2));
    this.DEI3_Nvl1 = this.truncarTresDecimales(media - (ds * 3));
    this.DEI4_Nvl1 = this.truncarTresDecimales(media - (ds * 4));

    this.DES1_Nvl1 = this.truncarTresDecimales(media + ds);
    this.DES2_Nvl1 = this.truncarTresDecimales(media + (ds * 2));
    this.DES3_Nvl1 = this.truncarTresDecimales(media + (ds * 3));
    this.DES4_Nvl1 = this.truncarTresDecimales(media + (ds * 4));

  }


  async hayDssinDianaLvl1(numLab: number, idAnalyzer: number, numMat: number, numLot: number, idAna: number, ds: number, media: number) {

    this.media_Nvl1 = media;

    this.DEI1_Nvl1 = this.truncarTresDecimales(media - ds);
    this.DEI2_Nvl1 = this.truncarTresDecimales(media - (ds * 2));
    this.DEI3_Nvl1 = this.truncarTresDecimales(media - (ds * 3));
    this.DEI4_Nvl1 = this.truncarTresDecimales(media - (ds * 4));

    this.DES1_Nvl1 = this.truncarTresDecimales(media + ds);
    this.DES2_Nvl1 = this.truncarTresDecimales(media + (ds * 2));
    this.DES3_Nvl1 = this.truncarTresDecimales(media + (ds * 3));
    this.DES4_Nvl1 = this.truncarTresDecimales(media + (ds * 4));


    await this.errorTotalService.getDesv(this.fecha, 1, numLab, idAnalyzer, numMat, numLot, idAna,this.idtest).then((data: any) => {    

      this.diana_Nvl1 = 0;
      this.li_Nvl1 = 0;
      this.ls_Nvl1 = 0;

    });

    

  }

  async sinDshayDianaLvl1(numLab: number, idAnalyzer: number, numMat: number, numLot: number, idAna: number, diana: number, ls: number, li: number) {
    this.li_Nvl1 = li;
    this.ls_Nvl1 = ls;
    this.diana_Nvl1 = diana;

    await this.errorTotalService.getDesv(this.fecha, 1, numLab, idAnalyzer, numMat, numLot, idAna,this.idtest).then((data: any) => {

      this.media_Nvl1 = data.media;
      this.DEI1_Nvl1 = data.desvEstandarinf1;
      this.DEI2_Nvl1 = data.desvEstandarinf2;
      this.DEI3_Nvl1 = data.desvEstandarinf3;
      this.DEI4_Nvl1 = data.desvEstandarinf4;

      this.DES1_Nvl1 = data.desvEstandarsup1;
      this.DES2_Nvl1 = data.desvEstandarsup2;
      this.DES3_Nvl1 = data.desvEstandarsup3;
      this.DES4_Nvl1 = data.desvEstandarsup4;

    });

  }

  async sinDssinDianaLvl1(numLab: number, idAnalyzer: number, numMat: number, numLot: number, idAna: number) {

    await this.errorTotalService.getDesv(this.fecha, 1, numLab, idAnalyzer, numMat, numLot, idAna,this.idtest).then((data: any) => {

      this.diana_Nvl1 = 0;
      this.li_Nvl1 = 0;
      this.ls_Nvl1 = 0;

      this.media_Nvl1 = data.media;
      this.DEI1_Nvl1 = data.desvEstandarinf1;
      this.DEI2_Nvl1 = data.desvEstandarinf2;
      this.DEI3_Nvl1 = data.desvEstandarinf3;
      this.DEI4_Nvl1 = data.desvEstandarinf4;

      this.DES1_Nvl1 = data.desvEstandarsup1;
      this.DES2_Nvl1 = data.desvEstandarsup2;
      this.DES3_Nvl1 = data.desvEstandarsup3;
      this.DES4_Nvl1 = data.desvEstandarsup4;

    });

  }

// --------------------level 2-----------------------------


  async hayDshayDianaLvl2(ds: number, diana: number, media: number, ls: number, li: number) {

    this.media_Nvl2 = media;
    this.diana_Nvl2 = diana;
    this.li_Nvl2 = li;
    this.ls_Nvl2 = ls;

    this.DEI1_Nvl2 = this.truncarTresDecimales(media - ds);
    this.DEI2_Nvl2 = this.truncarTresDecimales(media - (ds * 2));
    this.DEI3_Nvl2 = this.truncarTresDecimales(media - (ds * 3));
    this.DEI4_Nvl2 = this.truncarTresDecimales(media - (ds * 4));

    this.DES1_Nvl2 = this.truncarTresDecimales(media + ds);
    this.DES2_Nvl2 = this.truncarTresDecimales(media + (ds * 2));
    this.DES3_Nvl2 = this.truncarTresDecimales(media + (ds * 3));
    this.DES4_Nvl2 = this.truncarTresDecimales(media + (ds * 4));

  }

  async hayDssinDianaLvl2(numLab: number, idAnalyzer: number, numMat: number, numLot: number, idAna: number, ds: number, media: number) {

    this.media_Nvl2 = media;

    this.DEI1_Nvl2 = this.truncarTresDecimales(media - ds);
    this.DEI2_Nvl2 = this.truncarTresDecimales(media - (ds * 2));
    this.DEI3_Nvl2 = this.truncarTresDecimales(media - (ds * 3));
    this.DEI4_Nvl2 = this.truncarTresDecimales(media - (ds * 4));

    this.DES1_Nvl2 = this.truncarTresDecimales(media + ds);
    this.DES2_Nvl2 = this.truncarTresDecimales(media + (ds * 2));
    this.DES3_Nvl2 = this.truncarTresDecimales(media + (ds * 3));
    this.DES4_Nvl2 = this.truncarTresDecimales(media + (ds * 4));

    await this.errorTotalService.getDesv(this.fecha, 2, numLab, idAnalyzer, numMat, numLot, idAna,this.idtest).then((data: any) => {

      this.diana_Nvl2 = 0;
      this.li_Nvl2 = 0;
      this.ls_Nvl2 = 0;

    });
  }

  async sinDshayDianaLvl2(numLab: number, idAnalyzer: number, numMat: number, numLot: number, idAna: number, diana: number, ls: number, li: number) {

    this.li_Nvl2 = li;
    this.ls_Nvl2 = ls;
    this.diana_Nvl2 = diana;

    await this.errorTotalService.getDesv(this.fecha, 2, numLab, idAnalyzer, numMat, numLot, idAna,this.idtest).then((data: any) => {

      this.media_Nvl2 = data.media;
      this.DEI1_Nvl2 = data.desvEstandarinf1;
      this.DEI2_Nvl2 = data.desvEstandarinf2;
      this.DEI3_Nvl2 = data.desvEstandarinf3;
      this.DEI4_Nvl2 = data.desvEstandarinf4;

      this.DES1_Nvl2 = data.desvEstandarsup1;
      this.DES2_Nvl2 = data.desvEstandarsup2;
      this.DES3_Nvl2 = data.desvEstandarsup3;
      this.DES4_Nvl2 = data.desvEstandarsup4;

    });

  }

  async sinDssinDianaLvl2(numLab: number, idAnalyzer: number, numMat: number, numLot: number, idAna: number) {

    await this.errorTotalService.getDesv(this.fecha, 2, numLab, idAnalyzer, numMat, numLot, idAna,this.idtest).then((data: any) => {

      this.diana_Nvl2 = 0;
      this.li_Nvl2 = 0;
      this.ls_Nvl2 = 0;

      this.media_Nvl2 = data.media;
      this.DEI1_Nvl2 = data.desvEstandarinf1;
      this.DEI2_Nvl2 = data.desvEstandarinf2;
      this.DEI3_Nvl2 = data.desvEstandarinf3;
      this.DEI4_Nvl2 = data.desvEstandarinf4;

      this.DES1_Nvl2 = data.desvEstandarsup1;
      this.DES2_Nvl2 = data.desvEstandarsup2;
      this.DES3_Nvl2 = data.desvEstandarsup3;
      this.DES4_Nvl2 = data.desvEstandarsup4;

    });
  }


// -----------------------level 3-----------------------------

  async hayDshayDianaLvl3(ds: number, diana: number, media: number, ls: number, li: number) {

    this.media_Nvl3 = media;
    this.diana_Nvl3 = diana;
    this.li_Nvl3 = li;
    this.ls_Nvl3 = ls;

    this.DEI1_Nvl3 = this.truncarTresDecimales(media - ds);
    this.DEI2_Nvl3 = this.truncarTresDecimales(media - (ds * 2));
    this.DEI3_Nvl3 = this.truncarTresDecimales(media - (ds * 3));
    this.DEI4_Nvl3 = this.truncarTresDecimales(media - (ds * 4));

    this.DES1_Nvl3 = this.truncarTresDecimales(media + ds);
    this.DES2_Nvl3 = this.truncarTresDecimales(media + (ds * 2));
    this.DES3_Nvl3 = this.truncarTresDecimales(media + (ds * 3));
    this.DES4_Nvl3 = this.truncarTresDecimales(media + (ds * 4));

  }

  async hayDssinDianaLvl3(numLab: number, idAnalyzer: number, numMat: number, numLot: number, idAna: number, ds: number, media: number) {

    this.media_Nvl3 = media;

    this.DEI1_Nvl3 = this.truncarTresDecimales(media - ds);
    this.DEI2_Nvl3 = this.truncarTresDecimales(media - (ds * 2));
    this.DEI3_Nvl3 = this.truncarTresDecimales(media - (ds * 3));
    this.DEI4_Nvl3 = this.truncarTresDecimales(media - (ds * 4));

    this.DES1_Nvl3 = this.truncarTresDecimales(media + ds);
    this.DES2_Nvl3 = this.truncarTresDecimales(media + (ds * 2));
    this.DES3_Nvl3 = this.truncarTresDecimales(media + (ds * 3));
    this.DES4_Nvl3 = this.truncarTresDecimales(media + (ds * 4));

    await this.errorTotalService.getDesv(this.fecha, 3, numLab, idAnalyzer, numMat, numLot, idAna,this.idtest).then((data: any) => {

      this.diana_Nvl3 = 0;
      this.li_Nvl3 = 0;
      this.ls_Nvl3 = 0;

    });

  }

  async sinDshayDianaLvl3(numLab: number, idAnalyzer: number, numMat: number, numLot: number, idAna: number, diana: number, ls: number, li: number) {

    this.li_Nvl3 = li;
    this.ls_Nvl3 = ls;
    this.diana_Nvl3 = diana;

    await this.errorTotalService.getDesv(this.fecha, 3, numLab, idAnalyzer, numMat, numLot, idAna,this.idtest).then((data: any) => {

      this.media_Nvl3 = data.media;
      this.DEI1_Nvl3 = data.desvEstandarinf1;
      this.DEI2_Nvl3 = data.desvEstandarinf2;
      this.DEI3_Nvl3 = data.desvEstandarinf3;
      this.DEI4_Nvl3 = data.desvEstandarinf4;

      this.DES1_Nvl3 = data.desvEstandarsup1;
      this.DES2_Nvl3 = data.desvEstandarsup2;
      this.DES3_Nvl3 = data.desvEstandarsup3;
      this.DES4_Nvl3 = data.desvEstandarsup4;

    });

  }

  async sinDssinDianaLvl3(numLab: number, idAnalyzer: number, numMat: number, numLot: number, idAna: number) {

    await this.errorTotalService.getDesv(this.fecha, 3, numLab, idAnalyzer, numMat, numLot, idAna,this.idtest).then((data: any) => {

      this.diana_Nvl3 = 0;
      this.li_Nvl3 = 0;
      this.ls_Nvl3 = 0;

      this.media_Nvl3 = data.media;
      this.DEI1_Nvl3 = data.desvEstandarinf1;
      this.DEI2_Nvl3 = data.desvEstandarinf2;
      this.DEI3_Nvl3 = data.desvEstandarinf3;
      this.DEI4_Nvl3 = data.desvEstandarinf4;

      this.DES1_Nvl3 = data.desvEstandarsup1;
      this.DES2_Nvl3 = data.desvEstandarsup2;
      this.DES3_Nvl3 = data.desvEstandarsup3;
      this.DES4_Nvl3 = data.desvEstandarsup4;

    });

  }


  async multiLeveyJennings(numLab: number, idAnalyzer: number, numMat: number, numLot: number, idAna: number) {

    await this.multiLeveyJenningsService.getDesv(this.fecha, 1, 2, 0, numLab, idAnalyzer, numMat, numLot, idAna).then((response: any) => {

      this.desvMulti.push(response);

    }).catch(error => {

      this.desvMulti = [];

    });

  }



  // Servicio que retorna las medias y ds para el infoprueba
  getDSInfoprueba(idTest: number) {

    let url = `${this.urlBase}Results/inforesultsxtestaverage/${idTest}`;

    return this.http.get(url).toPromise();

  }

  async validUpdateDataTable(numLab: number, idAnalyzer: number, numMat: number, numLot: number, idAna: number, levelTest: number, idTest: number, response: any, bandera: boolean) {

    this.flagN1 = 0;
    this.flagN2 = 0;
    this.flagN3 = 0;

    let validationDatosNulosLvl1 = response.filter(x=>x.Valuelevel1 !== null) || null;
    let validationDatosNulosLvl2 = response.filter(x=>x.Valuelevel2 !== null) || null;
    let validationDatosNulosLvl3 = response.filter(x=>x.Valuelevel3 !== null) || null;

     await this.configuracionMediaDSService.getBuscadorConfiMediaDS(idTest).then(data => {
      this.hayDesviacionLvl1 = data.find(datos => datos.Level == 1) || null;
      this.hayDesviacionLvl2 = data.find(datos => datos.Level == 2) || null;
      this.hayDesviacionLvl3 = data.find(datos => datos.Level == 3) || null;
      
      if (this.hayDesviacionLvl1 !== null && validationDatosNulosLvl1.length > 0)
      {
        if (this.hayDesviacionLvl1.Ds !== 0 && this.hayDesviacionLvl1.Average === 0
          || this.hayDesviacionLvl1.Ds === 0 && this.hayDesviacionLvl1.Average !== 0
          || this.hayDesviacionLvl1.Ds === 0 && this.hayDesviacionLvl1.Average === 0
        ){
          bandera = false;
          this.toastr.info("La configuración de media y ds esta incompleta, por favor completarla del nivel 1");
          return;
        }

        if (this.hayDesviacionLvl1.Average !== 0)
        {
            this.flagN1++;
        }

        if (this.hayDesviacionLvl1.Ds !== 0)
        {
            this.flagN1++;
        }

        if (this.hayDesviacionLvl1.Cv !== 0)
        {
            this.flagN1++;
        }else{
          if (this.hayDesviacionLvl1.Ds !== 0 && this.hayDesviacionLvl1.Average !== 0){
            this.hayDesviacionLvl1.Cv = this.hayDesviacionLvl1.Ds / this.hayDesviacionLvl1.Average;
            this.hayDesviacionLvl1.Cv = this.hayDesviacionLvl1.Cv.toFixed(3);
            this.flagN1++;
          }
        }
      }

      if (this.hayDesviacionLvl2 !== null && validationDatosNulosLvl2.length > 0)
      {
        if (this.hayDesviacionLvl2.Ds !== 0 && this.hayDesviacionLvl2.Average === 0
          || this.hayDesviacionLvl2.Ds === 0 && this.hayDesviacionLvl2.Average !== 0
          || this.hayDesviacionLvl2.Ds === 0 && this.hayDesviacionLvl2.Average === 0
        ){
          bandera = false;
          this.toastr.error("La configuración de media y ds esta incompleta, por favor completarla del nivel 2");
          return;
        }

        if (this.hayDesviacionLvl2.Average !== 0)
        {
            this.flagN2++;
        }

        if (this.hayDesviacionLvl2.Ds !== 0)
        {
            this.flagN2++;
        }

        if (this.hayDesviacionLvl2.Cv !== 0)
        {
            this.flagN2++;
        }else{
          if (this.hayDesviacionLvl2.Ds !== 0 && this.hayDesviacionLvl2.Average !== 0){
            this.hayDesviacionLvl2.Cv = this.hayDesviacionLvl2.Ds / this.hayDesviacionLvl2.Average;
            this.hayDesviacionLvl2.Cv = this.hayDesviacionLvl2.Cv.toFixed(3);
            this.flagN2++;
          }
        }
      }

      if (this.hayDesviacionLvl3 !== null && validationDatosNulosLvl3.length > 0)
      {
        if (this.hayDesviacionLvl3.Ds !== 0 && this.hayDesviacionLvl3.Average === 0
          || this.hayDesviacionLvl3.Ds === 0 && this.hayDesviacionLvl3.Average !== 0
          || this.hayDesviacionLvl3.Ds === 0 && this.hayDesviacionLvl3.Average === 0
        ){
          bandera = false;
          this.toastr.error("La configuración de media y ds esta incompleta, por favor completarla del nivel 3");
          return;
        }
      
        if (this.hayDesviacionLvl3.Average !== 0)
        {
            this.flagN3++;
        }

        if (this.hayDesviacionLvl3.Ds !== 0)
        {
            this.flagN3++;
        }

        if (this.hayDesviacionLvl3.Cv !== 0)
        {
            this.flagN3++;
        }else{
          if (this.hayDesviacionLvl3.Ds !== 0 && this.hayDesviacionLvl3.Average !== 0){
            this.hayDesviacionLvl3.Cv = this.hayDesviacionLvl3.Ds / this.hayDesviacionLvl3.Average;
            this.hayDesviacionLvl3.Cv = this.hayDesviacionLvl3.Cv.toFixed(3);
            this.flagN3++;
          }
        }
      }

    }).catch(error => {

      this.hayDesviacionLvl1 = null;
      this.hayDesviacionLvl2 = null;
      this.hayDesviacionLvl3 = null;
      this.flagN1 = null;
      this.flagN2 = null;
      this.flagN3 = null;

    });
      if (bandera) {
        return new Promise(async (resolve, reject) => {
        // Level 1
        if (levelTest == 1) {

          if(validationDatosNulosLvl1.length > 0)
          {
            if (this.hayDesviacionLvl1 != null) {

              this.Fnvalidreglasnvl(this.fecha, 1, numLab, idAnalyzer, numMat, numLot, idAna,idTest)
                  .then(data=>{
                    this.toastr.success('La gráfica del nivel 1 ha sido cargada ☑️');             
                    return resolve(1);
            }).catch(error=>{
              this.toastr.error('Error: ' + error);              
              return reject();
            })
  
            } else {
  
              var respuestalvl1 = await this.updateDataIngresoDatosLvl1SinConfiguracion(response, numLab, idAnalyzer, numMat, numLot, idAna,idTest);
  
              if(respuestalvl1 == "error"){
  
                return resolve(1);
  
              }else{
                return resolve(1);
              }
  
            }
          }

        }

      // Level 2
        if (levelTest == 2) {
        
          if(validationDatosNulosLvl1.length > 0){
            if (this.hayDesviacionLvl1 !== null) {
              if (this.flagN1 == 3 || this.flagN1 == 0)
              {
                this.Fnvalidreglasnvl(this.fecha, 1, numLab, idAnalyzer, numMat, numLot, idAna,idTest)
                .then(data =>{   
                  this.toastr.success('La gráfica del nivel 1 ha sido cargada ☑️');
                  return resolve(1); 
                });
              }
            } else {
  
              var respuestalvl1 = await this.updateDataIngresoDatosLvl1SinConfiguracion(response, numLab, idAnalyzer, numMat, numLot, idAna,idTest);
            }
          }

          if(validationDatosNulosLvl2.length > 0){
            if (this.hayDesviacionLvl2 != null){

              if (this.flagN2 == 3 || this.flagN2 == 0)
              {
                this.Fnvalidreglasnvl(this.fecha, 2, numLab, idAnalyzer, numMat, numLot, idAna,idTest)
                .then(data => {     
                  this.toastr.success('La gráfica del nivel 2 ha sido cargada ☑️');             
                  return resolve(1); 
                });
              }
            } else {
              var respuestalvl2 = await this.updateDataIngresoDatosLvl2SinConfiguracion(response, numLab, idAnalyzer, numMat, numLot, idAna,idTest);
            
              if(respuestalvl2 == "error"){
  
                return resolve(1);
  
              }else{
                return resolve(1);
              }
            }   
          }
      }

        // level 3
        if (levelTest == 3) {
          if(validationDatosNulosLvl1.length > 0){
          if (this.hayDesviacionLvl1 !== null) {
            if (this.flagN1 == 3 || this.flagN1 == 0)
            {
              this.Fnvalidreglasnvl(this.fecha, 1, numLab, idAnalyzer, numMat, numLot, idAna,idTest)
              .then(data =>{   
                this.toastr.success('La gráfica del nivel 1 ha sido cargada ☑️');        
                return resolve(1);
              });
            }
          } else {

            var respuestalvl1 = await this.updateDataIngresoDatosLvl1SinConfiguracion(response, numLab, idAnalyzer, numMat, numLot, idAna,idTest);
          }
        }

        if(validationDatosNulosLvl2.length > 0){

          if (this.hayDesviacionLvl2 != null){
            if (this.flagN2 == 3 || this.flagN2 == 0)
            {
              this.Fnvalidreglasnvl(this.fecha, 2, numLab, idAnalyzer, numMat, numLot, idAna,idTest)
              .then(data => {      
                this.toastr.success('La gráfica del nivel 2 ha sido cargada ☑️');             
                return resolve(1);           
              });
            }
          } else {

            var respuestalvl2 = await this.updateDataIngresoDatosLvl2SinConfiguracion(response, numLab, idAnalyzer, numMat, numLot, idAna,idTest);
          }
        }


        if(validationDatosNulosLvl3.length > 0){
          if (this.hayDesviacionLvl3 != null){
            
            if (this.flagN3 == 3 || this.flagN3 == 0)
            {
              this.Fnvalidreglasnvl(this.fecha, 3, numLab, idAnalyzer, numMat, numLot, idAna,idTest)
              .then(data =>{
                this.toastr.success('La gráfica del nivel 3 ha sido cargada ☑️');        
                return resolve(1);
                });
            }
            
          } else {

            var respuestalvl3 = await this.updateDataIngresoDatosLvl3SinConfiguracion(response, numLab, idAnalyzer, numMat, numLot, idAna,idTest);
          
            if(respuestalvl3 == "error"){

              return resolve(1);

            } else {
                return resolve(1);
            }

          }
        }
        }
      });
      }

  }

  Fnvalidreglasnvl(fecha, lvl, numLab, idAnalyzer, numMat, numLot, idAna,idTest){
    
    return new Promise((resolve,reject)=>{
      this.ingresoDatosUpdateService.paramsSiHayConfiguracion(fecha, lvl, numLab, idAnalyzer, numMat, numLot, idAna,idTest)
    .then((response2: any) => {
        resolve(response2);
      }).catch(error => {
        reject(error);
      });
    })
  }

  




  updateDataIngresoDatosLvlsConConfiguracion(level: number, numLab: number, idAnalyzer: number, numMat: number, numLot: number, idAna: number,idTest: number) {


    const obs$ = new Observable(observer => {

      this.ingresoDatosUpdateService.paramsSiHayConfiguracion(this.fecha, level, numLab, idAnalyzer, numMat, numLot, idAna,idTest)
        .then((response: any) => {
        
          observer.next(true);
          observer.complete

        });
    });
    return obs$;
  }

  async updateDataIngresoDatosLvl1ConConfiguracion(respuestainfoPrueba, numLab: number, idAnalyzer: number, numMat: number, numLot: number, idAna: number,idTest: number) {


     this.ingresoDatosUpdateService.paramsSiHayConfiguracion(this.fecha, 1, numLab, idAnalyzer, numMat, numLot, idAna,idTest).then((response: any) => {

    }).catch(error => {

      var tipoRespuesta = error;
    });

  }


  async updateDataIngresoDatosLvl2ConConfiguracion(respuestainfoPrueba, numLab: number, idAnalyzer: number, numMat: number, numLot: number, idAna: number,idTest: number) {

     this.ingresoDatosUpdateService.paramsSiHayConfiguracion(this.fecha, 2, numLab, idAnalyzer, numMat, numLot, idAna,idTest).then((response: any) => {

    }).catch(error => {

      var tipoRespuesta = error;
    });

  }

  async updateDataIngresoDatosLvl3ConConfiguracion(respuestainfoPrueba, numLab: number, idAnalyzer: number, numMat: number, numLot: number, idAna: number, idTest:number) {

     this.ingresoDatosUpdateService.paramsSiHayConfiguracion(this.fecha, 3, numLab, idAnalyzer, numMat, numLot, idAna,idTest).then((response: any) => {

    }).catch(error => {

      var tipoRespuesta = error;
    });

  }

  async updateDataIngresoDatosLvl1SinConfiguracion(respuestainfoPrueba, numLab: number, idAnalyzer: number, numMat: number, numLot: number, idAna: number, idTest: number) {

    var resultvalidlvl1 = await this.ingresoDatosUpdateService.params(this.fecha, 1, numLab, idAnalyzer, numMat, numLot, idAna,idTest).then((response: any) => {

      this.validacionReglas = response;

      for (var j = 0; j < response.length; j++) {

        for (var i = 0; i < respuestainfoPrueba.length; i++) {

          let resulup = respuestainfoPrueba[i];

          if (parseInt(response[j].Idresult) == resulup.Idresult) {
            resulup.Arlevel1 = response[j].ARlevel;
            resulup.Ruleslevel1 = response[j].Regla;
            resulup.Zlevel1 = response[j].valzscore;
            respuestainfoPrueba[i] = resulup;
            this.idResult = respuestainfoPrueba[i].Idresult;

            const resultsupdate: Results = {

              idresult: resulup.Idresult,
              IdTest: resulup.IdTest,
              Userid: resulup.Userid,
              Idcorrectiveactions: resulup.Idcorrectiveactions,
              Supervisor: resulup.Supervisor,
              Date: resulup.Date,
              Hour: resulup.Hour,
              Valuelevel1: resulup.Valuelevel1,
              Arlevel1: resulup.Arlevel1,
              Ruleslevel1: resulup.Ruleslevel1,
              Zlevel1: resulup.Zlevel1,
              Valuelevel2: resulup.Valuelevel2,
              Arlevel2: resulup.Arlevel2,
              Ruleslevel2: resulup.Ruleslevel2,
              Zlevel2: resulup.Zlevel2,
              Valuelevel3: resulup.Valuelevel3,
              Arlevel3: resulup.Arlevel3,
              Ruleslevel3: resulup.Ruleslevel3,
              Zlevel3: resulup.Zlevel3,
              Evengroup: resulup.Evengroup,
              Comments: resulup.Comments,
              Active: resulup.Active

            }

            this.ingresoDatosService.update(resultsupdate, this.idResult).subscribe(respuesta => {

              const Loguser = {
                Fecha: dayjs().format('YYYY-MM-DD'),
                Hora: this.dateNowISO,
                Metodo: this.translate.instant('actualización'),
                Datos: JSON.stringify(resultsupdate),
                Respuesta: JSON.stringify(respuesta),
                TipoRespuesta: status
              };

              this.ingresoDatosService.createLogAsync(Loguser).then(respuesta => {
              });

            }, (error) => {
              const Loguser = {
                fecha: dayjs().format('YYYY-MM-DD'),
                hora: this.dateNowISO,
                metodo: 'actualización',
                datos: JSON.stringify(resultsupdate),
                respuesta: error.message,
                tipoRespuesta: error.status
              };
              this.ingresoDatosService.createLogAsync(Loguser).then(respuesta => {
              });
            });

          }
        }
      }


    }).catch(error => {

      var tipoRespuesta = error;
      return "error";
    });

    return resultvalidlvl1;

  }


  async updateDataIngresoDatosLvl2SinConfiguracion(respuestainfoPrueba, numLab: number, idAnalyzer: number, numMat: number, numLot: number, idAna: number,idTest:number) {

    var resultvalidlvl2 = await this.ingresoDatosUpdateService.params(this.fecha, 2, numLab, idAnalyzer, numMat, numLot, idAna,idTest).then((response: any) => {

      this.validacionReglas = response;

      for (var j = 0; j < response.length; j++) {

        for (var i = 0; i < respuestainfoPrueba.length; i++) {

          let resulup = respuestainfoPrueba[i];

          if (parseInt(response[j].Idresult) == resulup.Idresult) {
            resulup.Arlevel2 = response[j].ARlevel;
            resulup.Ruleslevel2 = response[j].Regla;
            resulup.Zlevel2 = response[j].valzscore;
            respuestainfoPrueba[i] = resulup;
            this.idResult = respuestainfoPrueba[i].Idresult;

            const resultsupdate: Results = {

              idresult: resulup.Idresult,
              IdTest: resulup.IdTest,
              Userid: resulup.Userid,
              Idcorrectiveactions: resulup.Idcorrectiveactions,
              Supervisor: resulup.Supervisor,
              Date: resulup.Date,
              Hour: resulup.Hour,
              Valuelevel1: resulup.Valuelevel1,
              Arlevel1: resulup.Arlevel1,
              Ruleslevel1: resulup.Ruleslevel1,
              Zlevel1: resulup.Zlevel1,
              Valuelevel2: resulup.Valuelevel2,
              Arlevel2: resulup.Arlevel2,
              Ruleslevel2: resulup.Ruleslevel2,
              Zlevel2: resulup.Zlevel2,
              Valuelevel3: resulup.Valuelevel3,
              Arlevel3: resulup.Arlevel3,
              Ruleslevel3: resulup.Ruleslevel3,
              Zlevel3: resulup.Zlevel3,
              Evengroup: resulup.Evengroup,
              Comments: resulup.Comments,
              Active: resulup.Active

            }

            this.ingresoDatosService.update(resultsupdate, this.idResult).subscribe(respuesta => {

              const Loguser = {
                Fecha: dayjs().format('YYYY-MM-DD'),
                Hora: this.dateNowISO,
                Metodo: 'actualización',
                Datos: JSON.stringify(resultsupdate),
                Respuesta: JSON.stringify(respuesta),
                TipoRespuesta: status
              };

              this.ingresoDatosService.createLogAsync(Loguser).then(respuesta => {
              });

            }, (error) => {

              const Loguser = {
                fecha: dayjs().format('YYYY-MM-DD'),
                hora: this.dateNowISO,
                metodo: 'actualización',
                datos: JSON.stringify(resultsupdate),
                respuesta: error.message,
                tipoRespuesta: error.status
              };
              this.ingresoDatosService.createLogAsync(Loguser).then(respuesta => {
              });
            });

          }
        }
      }

    }).catch(error => {

      var tipoRespuesta = error;
      return "error";
    });
    return resultvalidlvl2;

  }

  async updateDataIngresoDatosLvl3SinConfiguracion(respuestainfoPrueba, numLab: number, idAnalyzer: number, numMat: number, numLot: number, idAna: number,idTest:number) {

    var resultvalidlvl3 = await this.ingresoDatosUpdateService.params(this.fecha, 3, numLab, idAnalyzer, numMat, numLot, idAna,idTest).then((response: any) => {

      this.validacionReglas = response;

      for (var j = 0; j < response.length; j++) {

        for (var i = 0; i < respuestainfoPrueba.length; i++) {


          let resulup = respuestainfoPrueba[i];


          if (parseInt(response[j].Idresult) == resulup.Idresult) {
            resulup.Arlevel3 = response[j].ARlevel;
            resulup.Ruleslevel3 = response[j].Regla;
            resulup.Zlevel3 = response[j].valzscore;
            respuestainfoPrueba[i] = resulup;
            this.idResult = respuestainfoPrueba[i].Idresult;

            const resultsupdate: Results = {

              idresult: resulup.Idresult,
              IdTest: resulup.IdTest,
              Userid: resulup.Userid,
              Idcorrectiveactions: resulup.Idcorrectiveactions,
              Supervisor: resulup.Supervisor,
              Date: resulup.Date,
              Hour: resulup.Hour,
              Valuelevel1: resulup.Valuelevel1,
              Arlevel1: resulup.Arlevel1,
              Ruleslevel1: resulup.Ruleslevel1,
              Zlevel1: resulup.Zlevel1,
              Valuelevel2: resulup.Valuelevel2,
              Arlevel2: resulup.Arlevel2,
              Ruleslevel2: resulup.Ruleslevel2,
              Zlevel2: resulup.Zlevel2,
              Valuelevel3: resulup.Valuelevel3,
              Arlevel3: resulup.Arlevel3,
              Ruleslevel3: resulup.Ruleslevel3,
              Zlevel3: resulup.Zlevel3,
              Evengroup: resulup.Evengroup,
              Comments: resulup.Comments,
              Active: resulup.Active

            }

            this.ingresoDatosService.update(resultsupdate, this.idResult).subscribe(respuesta => {

              const Loguser = {
                Fecha: dayjs().format('YYYY-MM-DD'),
                Hora: this.dateNowISO,
                Metodo: 'actualización',
                Datos: JSON.stringify(resultsupdate),
                Respuesta: JSON.stringify(respuesta),
                TipoRespuesta: status
              };

              this.ingresoDatosService.createLogAsync(Loguser).then(respuesta => {
              });

            }, (error) => {

              const Loguser = {
                fecha: dayjs().format('YYYY-MM-DD'),
                hora: this.dateNowISO,
                metodo: 'actualización',
                datos: JSON.stringify(resultsupdate),
                respuesta: error.message,
                tipoRespuesta: error.status
              };
              this.ingresoDatosService.createLogAsync(Loguser).then(respuesta => {
              });
            });

          }
        }
      }
    }).catch(error => {

      var tipoRespuesta = error;
      return "error";
    });

    return resultvalidlvl3;

  }

  //prueba con config
  async updateDataIngresoDatosLvl1ConConfiguracionprueba(respuestainfoPrueba, numLab: number, idAnalyzer: number, numMat: number, numLot: number, idAna: number, idTest: number) {

    var resultvalidlvl1 = await this.ingresoDatosUpdateService.paramsSiHayConfiguracion(this.fecha, 1, numLab, idAnalyzer, numMat, numLot, idAna,idTest).then((response: any) => {

      this.validacionReglas = response;

      for (var j = 0; j < response.length; j++) {

        for (var i = 0; i < respuestainfoPrueba.length; i++) {

          let resulup = respuestainfoPrueba[i];

          if (parseInt(response[j].Idresult) == resulup.Idresult) {
            resulup.Arlevel1 = response[j].ARlevel;
            resulup.Ruleslevel1 = response[j].Regla;
            resulup.Zlevel1 = response[j].valzscore;
            respuestainfoPrueba[i] = resulup;
            this.idResult = respuestainfoPrueba[i].Idresult;

            const resultsupdate: Results = {

              idresult: resulup.Idresult,
              IdTest: resulup.IdTest,
              Userid: resulup.Userid,
              Idcorrectiveactions: resulup.Idcorrectiveactions,
              Supervisor: resulup.Supervisor,
              Date: resulup.Date,
              Hour: resulup.Hour,
              Valuelevel1: resulup.Valuelevel1,
              Arlevel1: resulup.Arlevel1,
              Ruleslevel1: resulup.Ruleslevel1,
              Zlevel1: resulup.Zlevel1,
              Valuelevel2: resulup.Valuelevel2,
              Arlevel2: resulup.Arlevel2,
              Ruleslevel2: resulup.Ruleslevel2,
              Zlevel2: resulup.Zlevel2,
              Valuelevel3: resulup.Valuelevel3,
              Arlevel3: resulup.Arlevel3,
              Ruleslevel3: resulup.Ruleslevel3,
              Zlevel3: resulup.Zlevel3,
              Evengroup: resulup.Evengroup,
              Comments: resulup.Comments,
              Active: resulup.Active

            }

            this.ingresoDatosService.update(resultsupdate, this.idResult).subscribe(respuesta => {

              const Loguser = {
                Fecha: dayjs().format('YYYY-MM-DD'),
                Hora: this.dateNowISO,
                Metodo: 'actualización',
                Datos: JSON.stringify(resultsupdate),
                Respuesta: JSON.stringify(respuesta),
                TipoRespuesta: status
              };

              this.ingresoDatosService.createLogAsync(Loguser).then(respuesta => {
              });

            }, (error) => {
              const Loguser = {
                fecha: dayjs().format('YYYY-MM-DD'),
                hora: this.dateNowISO,
                metodo: 'actualización',
                datos: JSON.stringify(resultsupdate),
                respuesta: error.message,
                tipoRespuesta: error.status
              };
              this.ingresoDatosService.createLogAsync(Loguser).then(respuesta => {
              });
            });

          }
        }
      }
    })
    return resultvalidlvl1;
    

  }

  async updateDataIngresoDatosLvl2ConConfiguracionprueba(respuestainfoPrueba, numLab: number, idAnalyzer: number, numMat: number, numLot: number, idAna: number, idTest: number) {

    var resultvalidlvl1 = await this.ingresoDatosUpdateService.paramsSiHayConfiguracion(this.fecha, 1, numLab, idAnalyzer, numMat, numLot, idAna,idTest).then((response: any) => {

      this.validacionReglas = response;

      for (var j = 0; j < response.length; j++) {

        for (var i = 0; i < respuestainfoPrueba.length; i++) {

          let resulup = respuestainfoPrueba[i];

          if (parseInt(response[j].Idresult) == resulup.Idresult) {
            resulup.Arlevel1 = response[j].ARlevel;
            resulup.Ruleslevel1 = response[j].Regla;
            resulup.Zlevel1 = response[j].valzscore;
            respuestainfoPrueba[i] = resulup;
            this.idResult = respuestainfoPrueba[i].Idresult;

            const resultsupdate: Results = {

              idresult: resulup.Idresult,
              IdTest: resulup.IdTest,
              Userid: resulup.Userid,
              Idcorrectiveactions: resulup.Idcorrectiveactions,
              Supervisor: resulup.Supervisor,
              Date: resulup.Date,
              Hour: resulup.Hour,
              Valuelevel1: resulup.Valuelevel1,
              Arlevel1: resulup.Arlevel1,
              Ruleslevel1: resulup.Ruleslevel1,
              Zlevel1: resulup.Zlevel1,
              Valuelevel2: resulup.Valuelevel2,
              Arlevel2: resulup.Arlevel2,
              Ruleslevel2: resulup.Ruleslevel2,
              Zlevel2: resulup.Zlevel2,
              Valuelevel3: resulup.Valuelevel3,
              Arlevel3: resulup.Arlevel3,
              Ruleslevel3: resulup.Ruleslevel3,
              Zlevel3: resulup.Zlevel3,
              Evengroup: resulup.Evengroup,
              Comments: resulup.Comments,
              Active: resulup.Active

            }

            this.ingresoDatosService.update(resultsupdate, this.idResult).subscribe(respuesta => {

              const Loguser = {
                Fecha: dayjs().format('YYYY-MM-DD'),
                Hora: this.dateNowISO,
                Metodo: 'actualización',
                Datos: JSON.stringify(resultsupdate),
                Respuesta: JSON.stringify(respuesta),
                TipoRespuesta: status
              };

              this.ingresoDatosService.createLogAsync(Loguser).then(respuesta => {
              });

            }, (error) => {
              const Loguser = {
                fecha: dayjs().format('YYYY-MM-DD'),
                hora: this.dateNowISO,
                metodo: 'actualización',
                datos: JSON.stringify(resultsupdate),
                respuesta: error.message,
                tipoRespuesta: error.status
              };
              this.ingresoDatosService.createLogAsync(Loguser).then(respuesta => {
              });
            });

          }
        }
      }

      var resultvalidlvl2 =  this.ingresoDatosUpdateService.paramsSiHayConfiguracion(this.fecha, 2, numLab, idAnalyzer, numMat, numLot, idAna,idTest).then((response: any) => {
        
        this.validacionReglas = response;
  
        for (var j = 0; j < response.length; j++) {
  
          for (var i = 0; i < respuestainfoPrueba.length; i++) {
  
            let resulup = respuestainfoPrueba[i];
  
            if (parseInt(response[j].Idresult) == resulup.Idresult) {
              resulup.Arlevel2 = response[j].ARlevel;
              resulup.Ruleslevel2 = response[j].Regla;
              resulup.Zlevel2 = response[j].valzscore;
              respuestainfoPrueba[i] = resulup;
              this.idResult = respuestainfoPrueba[i].Idresult;
  
              const resultsupdate: Results = {
  
                idresult: resulup.Idresult,
                IdTest: resulup.IdTest,
                Userid: resulup.Userid,
                Idcorrectiveactions: resulup.Idcorrectiveactions,
                Supervisor: resulup.Supervisor,
                Date: resulup.Date,
                Hour: resulup.Hour,
                Valuelevel1: resulup.Valuelevel1,
                Arlevel1: resulup.Arlevel1,
                Ruleslevel1: resulup.Ruleslevel1,
                Zlevel1: resulup.Zlevel1,
                Valuelevel2: resulup.Valuelevel2,
                Arlevel2: resulup.Arlevel2,
                Ruleslevel2: resulup.Ruleslevel2,
                Zlevel2: resulup.Zlevel2,
                Valuelevel3: resulup.Valuelevel3,
                Arlevel3: resulup.Arlevel3,
                Ruleslevel3: resulup.Ruleslevel3,
                Zlevel3: resulup.Zlevel3,
                Evengroup: resulup.Evengroup,
                Comments: resulup.Comments,
                Active: resulup.Active
  
              }
  
              this.ingresoDatosService.update(resultsupdate, this.idResult).subscribe(respuesta => {
  
                const Loguser = {
                  Fecha: dayjs().format('YYYY-MM-DD'),
                  Hora: this.dateNowISO,
                  Metodo: 'actualización',
                  Datos: JSON.stringify(resultsupdate),
                  Respuesta: JSON.stringify(respuesta),
                  TipoRespuesta: status
                };
  
                this.ingresoDatosService.createLogAsync(Loguser).then(respuesta => {
                });
  
              }, (error) => {
  
                const Loguser = {
                  fecha: dayjs().format('YYYY-MM-DD'),
                  hora: this.dateNowISO,
                  metodo: 'actualización',
                  datos: JSON.stringify(resultsupdate),
                  respuesta: error.message,
                  tipoRespuesta: error.status
                };
                this.ingresoDatosService.createLogAsync(Loguser).then(respuesta => {
                });
              });
  
            }
          }
        }
  
      })
      return resultvalidlvl2;

    })
    return resultvalidlvl1;
    

  }

// -----------------Reports by dates-------------------------------------------------
async getDevsByDates(desde: string, hasta: string, levelTest: number, numLab: number, idAnalyzer: number, numMat: number, numLot: number, idAna: number) {

  return new Promise(async (resolve, reject) => {

 await this.reportesFechasService.getReportsByDatesCuanti(desde, hasta, levelTest , numLab, idAnalyzer, numMat, numLot, idAna).then((data: any) => {    

    if (levelTest == 1) {
    
      this.media_Nvl1 = 4;
      this.DEI1_Nvl1 = data.desvEstandarinf1;
      this.DEI2_Nvl1 = data.desvEstandarinf2;
      this.DEI3_Nvl1 = data.desvEstandarinf3;
      this.DEI4_Nvl1 = data.desvEstandarinf4;

      this.DES1_Nvl1 = data.desvEstandarsup1;
      this.DES2_Nvl1 = data.desvEstandarsup2;
      this.DES3_Nvl1 = data.desvEstandarsup3;
      this.DES4_Nvl1 = data.desvEstandarsup4;


    }
    if (levelTest == 2) {
    
      this.media_Nvl2 = data.media;
      this.DEI1_Nvl2 = data.desvEstandarinf1;
      this.DEI2_Nvl2 = data.desvEstandarinf2;
      this.DEI3_Nvl2 = data.desvEstandarinf3;
      this.DEI4_Nvl2 = data.desvEstandarinf4;

      this.DES1_Nvl2 = data.desvEstandarsup1;
      this.DES2_Nvl2 = data.desvEstandarsup2;
      this.DES3_Nvl2 = data.desvEstandarsup3;
      this.DES4_Nvl2 = data.desvEstandarsup4;


    }

    if (levelTest == 3) {
     
      this.media_Nvl3 = data.media;
      this.DEI1_Nvl3 = data.desvEstandarinf1;
      this.DEI2_Nvl3 = data.desvEstandarinf2;
      this.DEI3_Nvl3 = data.desvEstandarinf3;
      this.DEI4_Nvl3 = data.desvEstandarinf4;

      this.DES1_Nvl3 = data.desvEstandarsup1;
      this.DES2_Nvl3 = data.desvEstandarsup2;
      this.DES3_Nvl3 = data.desvEstandarsup3;
      this.DES4_Nvl3 = data.desvEstandarsup4;


    }


    resolve(1);


  }).catch(error => {

     this.li_Nvl1, this.ls_Nvl1, this.diana_Nvl1 = undefined;

    if (levelTest == 1) {

      this.media_Nvl1 = undefined;
      this.DEI1_Nvl1 = undefined;
      this.DEI2_Nvl1 = undefined;
      this.DEI3_Nvl1 = undefined;
      this.DEI4_Nvl1 = undefined;

      this.DES1_Nvl1 = undefined;
      this.DES2_Nvl1 = undefined;
      this.DES3_Nvl1 = undefined;
      this.DES4_Nvl1 = undefined;


    }
    if (levelTest == 2) {

      this.media_Nvl2 = undefined;
      this.DEI1_Nvl2 = undefined;
      this.DEI2_Nvl2 = undefined;
      this.DEI3_Nvl2 = undefined;
      this.DEI4_Nvl2 = undefined;

      this.DES1_Nvl2 = undefined;
      this.DES2_Nvl2 = undefined;
      this.DES3_Nvl2 = undefined;
      this.DES4_Nvl2 = undefined;


    }
    if (levelTest == 3) {

    this.media_Nvl3 = undefined;
    this.DEI1_Nvl3 = undefined;
    this.DEI2_Nvl3 = undefined;
    this.DEI3_Nvl3 = undefined;
    this.DEI4_Nvl3 = undefined;

    this.DES1_Nvl3 = undefined;
    this.DES2_Nvl3 = undefined;
    this.DES3_Nvl3 = undefined;
    this.DES4_Nvl3 = undefined;


    }
    reject(error.error.message);
  });
});

}

// ------------------------------------
//  level 1 by dates
// ------------------------------------

async hayDssinDianaLvl1ByDates(desde: string, hasta: string, numLab: number, idAnalyzer: number, numMat: number, numLot: number, idAna: number, ds: number, media: number) {

  return new Promise(async (resolve, reject) => {

    this.media_Nvl1 = media;

    this.DEI1_Nvl1 = this.truncarTresDecimales(media - ds);
    this.DEI2_Nvl1 = this.truncarTresDecimales(media - (ds * 2));
    this.DEI3_Nvl1 = this.truncarTresDecimales(media - (ds * 3));
    this.DEI4_Nvl1 = this.truncarTresDecimales(media - (ds * 4));

    this.DES1_Nvl1 = this.truncarTresDecimales(media + ds);
    this.DES2_Nvl1 = this.truncarTresDecimales(media + (ds * 2));
    this.DES3_Nvl1 = this.truncarTresDecimales(media + (ds * 3));
    this.DES4_Nvl1 = this.truncarTresDecimales(media + (ds * 4));
    // this.DEI1_Nvl1 = Math.round((media - ds)*100)/100;
    // this.DEI2_Nvl1 = Math.round((media - (ds * 2))*100)/100;
    // this.DEI3_Nvl1 = Math.round((media - (ds * 3))*100)/100;
    // this.DEI4_Nvl1 = Math.round((media - (ds * 4))*100)/100;

    // this.DES1_Nvl1 = Math.round((media + ds)*100)/100;
    // this.DES2_Nvl1 = Math.round((media + (ds * 2))*100)/100 ;
    // this.DES3_Nvl1 = Math.round((media + (ds * 3))*100)/100;
    // this.DES4_Nvl1 = Math.round((media + (ds * 4))*100)/100;
    
    
    await this.reportesFechasService.getReportsByDatesCuanti(desde, hasta, 1, numLab, idAnalyzer, numMat, numLot, idAna).then((data: any) => {      
      
      this.diana_Nvl1 = data.dianavalue??0;
      this.li_Nvl1 = data.limitInferior??0;
      this.ls_Nvl1 = data.limitSuperior??0;

      resolve(1);
      
    }).catch(error => {

      this.li_Nvl1, this.ls_Nvl1, this.diana_Nvl1 = undefined;
      this.media_Nvl1 = undefined;
      this.DEI1_Nvl1 = undefined;
      this.DEI2_Nvl1 = undefined;
      this.DEI3_Nvl1 = undefined;
      this.DEI4_Nvl1 = undefined;

      this.DES1_Nvl1 = undefined;
      this.DES2_Nvl1 = undefined;
      this.DES3_Nvl1 = undefined;
      this.DES4_Nvl1 = undefined;
      reject(error.error.message);
    });
    
  });
}

async sinDshayDianaLvl1ByDates(desde: string, hasta: string, numLab: number, idAnalyzer: number, numMat: number, numLot: number, idAna: number, diana: number, ls: number, li: number) {

  return new Promise(async (resolve, reject) => {

  this.li_Nvl1 = li;
  this.ls_Nvl1 = ls;
  this.diana_Nvl1 = diana;

  await this.reportesFechasService.getReportsByDatesCuanti(desde, hasta, 1, numLab, idAnalyzer, numMat, numLot, idAna).then((data: any) => {

    this.media_Nvl1 = data.media;
    this.DEI1_Nvl1 = data.desvEstandarinf1;
    this.DEI2_Nvl1 = data.desvEstandarinf2;
    this.DEI3_Nvl1 = data.desvEstandarinf3;
    this.DEI4_Nvl1 = data.desvEstandarinf4;

    this.DES1_Nvl1 = data.desvEstandarsup1;
    this.DES2_Nvl1 = data.desvEstandarsup2;
    this.DES3_Nvl1 = data.desvEstandarsup3;
    this.DES4_Nvl1 = data.desvEstandarsup4;

    resolve(1);
      
  }).catch(error => {

    this.li_Nvl1, this.ls_Nvl1, this.diana_Nvl1 = undefined;
    this.media_Nvl1 = undefined;
    this.DEI1_Nvl1 = undefined;
    this.DEI2_Nvl1 = undefined;
    this.DEI3_Nvl1 = undefined;
    this.DEI4_Nvl1 = undefined;

    this.DES1_Nvl1 = undefined;
    this.DES2_Nvl1 = undefined;
    this.DES3_Nvl1 = undefined;
    this.DES4_Nvl1 = undefined;
    reject(error.error.message);
  });

  });
}

// ------------------------------------
//  level 2 by dates
// ------------------------------------
async hayDssinDianaLvl2ByDates(desde: string, hasta: string, numLab: number, idAnalyzer: number, numMat: number, numLot: number, idAna: number, ds: number, media: number) {

  return new Promise(async (resolve, reject) => {

  this.media_Nvl2 = media;

  this.DEI1_Nvl2 = this.truncarTresDecimales(media - ds);
  this.DEI2_Nvl2 = this.truncarTresDecimales(media - (ds * 2));
  this.DEI3_Nvl2 = this.truncarTresDecimales(media - (ds * 3));
  this.DEI4_Nvl2 = this.truncarTresDecimales(media - (ds * 4));

  this.DES1_Nvl2 = this.truncarTresDecimales(media + ds);
  this.DES2_Nvl2 = this.truncarTresDecimales(media + (ds * 2));
  this.DES3_Nvl2 = this.truncarTresDecimales(media + (ds * 3));
  this.DES4_Nvl2 = this.truncarTresDecimales(media + (ds * 4));
  // this.DEI1_Nvl2 = Math.round((media - ds)*100)/100;
  // this.DEI2_Nvl2 = Math.round((media - (ds * 2))*100)/100;
  // this.DEI3_Nvl2 = Math.round((media - (ds * 3))*100)/100;
  // this.DEI4_Nvl2 = Math.round((media - (ds * 4))*100)/100;

  // this.DES1_Nvl2 = Math.round((media + ds)*100)/100;
  // this.DES2_Nvl2 = Math.round((media + (ds * 2))*100)/100;
  // this.DES3_Nvl2 = Math.round((media + (ds * 3))*100)/100;
  // this.DES4_Nvl2 = Math.round((media + (ds * 4))*100)/100;

  await this.reportesFechasService.getReportsByDatesCuanti(desde, hasta, 2, numLab, idAnalyzer, numMat, numLot, idAna).then((data: any) => {

    this.diana_Nvl2 = data.dianavalue??0;
    this.li_Nvl2 = data.limitInferior??0;
    this.ls_Nvl2 = data.limitSuperior??0;

    resolve(1);
      
  }).catch(error => {

    this.li_Nvl2, this.ls_Nvl2, this.diana_Nvl2 = undefined;
    this.media_Nvl2 = undefined;
    this.DEI1_Nvl2 = undefined;
    this.DEI2_Nvl2 = undefined;
    this.DEI3_Nvl2 = undefined;
    this.DEI4_Nvl2 = undefined;

    this.DES1_Nvl2 = undefined;
    this.DES2_Nvl2 = undefined;
    this.DES3_Nvl2 = undefined;
    this.DES4_Nvl2 = undefined;
    reject(error.error.message);
  });

});

}

async sinDshayDianaLvl2ByDates(desde: string, hasta: string, numLab: number, idAnalyzer: number, numMat: number, numLot: number, idAna: number, diana: number, ls: number, li: number) {

  return new Promise(async (resolve, reject) => {

    this.li_Nvl2 = li;
    this.ls_Nvl2 = ls;
    this.diana_Nvl2 = diana;

  await this.reportesFechasService.getReportsByDatesCuanti(desde, hasta, 2, numLab, idAnalyzer, numMat, numLot, idAna).then((data: any) => {

    this.media_Nvl2 = data.media;
    this.DEI1_Nvl2 = data.desvEstandarinf1;
    this.DEI2_Nvl2 = data.desvEstandarinf2;
    this.DEI3_Nvl2 = data.desvEstandarinf3;
    this.DEI4_Nvl2 = data.desvEstandarinf4;

    this.DES1_Nvl2 = data.desvEstandarsup1;
    this.DES2_Nvl2 = data.desvEstandarsup2;
    this.DES3_Nvl2 = data.desvEstandarsup3;
    this.DES4_Nvl2 = data.desvEstandarsup4;

 
    resolve(1);
      
  }).catch(error => {

    this.li_Nvl2, this.ls_Nvl2, this.diana_Nvl2 = undefined;
    this.media_Nvl2 = undefined;
    this.DEI1_Nvl2 = undefined;
    this.DEI2_Nvl2 = undefined;
    this.DEI3_Nvl2 = undefined;
    this.DEI4_Nvl2 = undefined;

    this.DES1_Nvl2 = undefined;
    this.DES2_Nvl2 = undefined;
    this.DES3_Nvl2 = undefined;
    this.DES4_Nvl2 = undefined;
    reject(error.error.message);
  });


  });

}

// ------------------------------------
//  level 3 by dates
// ------------------------------------
  async hayDssinDianaLvl3ByDates(desde: string, hasta: string, numLab: number, idAnalyzer: number, numMat: number, numLot: number, idAna: number, ds: number, media: number) {
    return new Promise(async (resolve, reject) => {

    this.media_Nvl3 = media;

    this.DEI1_Nvl3 = this.truncarTresDecimales(media - ds);
    this.DEI2_Nvl3 = this.truncarTresDecimales(media - (ds * 2));
    this.DEI3_Nvl3 = this.truncarTresDecimales(media - (ds * 3));
    this.DEI4_Nvl3 = this.truncarTresDecimales(media - (ds * 4));

    this.DES1_Nvl3 = this.truncarTresDecimales(media + ds);
    this.DES2_Nvl3 = this.truncarTresDecimales(media + (ds * 2));
    this.DES3_Nvl3 = this.truncarTresDecimales(media + (ds * 3));
    this.DES4_Nvl3 = this.truncarTresDecimales(media + (ds * 4));
    // this.DEI1_Nvl3 = Math.round((media - ds)*100)/100;
    // this.DEI2_Nvl3 = Math.round((media - (ds * 2))*100)/100;
    // this.DEI3_Nvl3 = Math.round((media - (ds * 3))*100)/100;
    // this.DEI4_Nvl3 = Math.round((media - (ds * 4))*100)/100;

    // this.DES1_Nvl3 = Math.round((media + ds)*100)/100;
    // this.DES2_Nvl3 = Math.round((media + (ds * 2))*100)/100;
    // this.DES3_Nvl3 = Math.round((media + (ds * 3))*100)/100;
    // this.DES4_Nvl3 = Math.round((media + (ds * 4))*100)/100;

    await this.reportesFechasService.getReportsByDatesCuanti(desde, hasta, 3, numLab, idAnalyzer, numMat, numLot, idAna).then((data: any) => {

      this.diana_Nvl3 = data.dianavalue??0;
      this.li_Nvl3 = data.limitInferior??0;
      this.ls_Nvl3 = data.limitSuperior??0;

   
      resolve(1);
      
    }).catch(error => {
  
      this.li_Nvl3, this.ls_Nvl3, this.diana_Nvl3 = undefined;
      this.media_Nvl3 = undefined;
      this.DEI1_Nvl3 = undefined;
      this.DEI2_Nvl3 = undefined;
      this.DEI3_Nvl3 = undefined;
      this.DEI4_Nvl3 = undefined;
  
      this.DES1_Nvl3 = undefined;
      this.DES2_Nvl3 = undefined;
      this.DES3_Nvl3 = undefined;
      this.DES4_Nvl3 = undefined;
      reject(error.error.message);
    });
  });

  }

  async sinDshayDianaLvl3ByDates(desde: string, hasta: string, numLab: number, idAnalyzer: number, numMat: number, numLot: number, idAna: number, diana: number, ls: number, li: number) {
    return new Promise(async (resolve, reject) => {
    this.li_Nvl3 = li;
    this.ls_Nvl3 = ls;
    this.diana_Nvl3 = diana;

    await this.reportesFechasService.getReportsByDatesCuanti(desde, hasta, 3, numLab, idAnalyzer, numMat, numLot, idAna).then((data: any) => {

      this.media_Nvl3 = data.media;
      this.DEI1_Nvl3 = data.desvEstandarinf1;
      this.DEI2_Nvl3 = data.desvEstandarinf2;
      this.DEI3_Nvl3 = data.desvEstandarinf3;
      this.DEI4_Nvl3 = data.desvEstandarinf4;

      this.DES1_Nvl3 = data.desvEstandarsup1;
      this.DES2_Nvl3 = data.desvEstandarsup2;
      this.DES3_Nvl3 = data.desvEstandarsup3;
      this.DES4_Nvl3 = data.desvEstandarsup4;

  
      resolve(1);
      
    }).catch(error => {
  
      this.li_Nvl3, this.ls_Nvl3, this.diana_Nvl3 = undefined;
      this.media_Nvl3 = undefined;
      this.DEI1_Nvl3 = undefined;
      this.DEI2_Nvl3 = undefined;
      this.DEI3_Nvl3 = undefined;
      this.DEI4_Nvl3 = undefined;
  
      this.DES1_Nvl3 = undefined;
      this.DES2_Nvl3 = undefined;
      this.DES3_Nvl3 = undefined;
      this.DES4_Nvl3 = undefined;
      reject(error.error.message);
    });
    });

  }


//-------------------------------------------------
//-------------------------------------------------
//-------------------------------------------------
async paramsByDates(desde: string,
                    hasta: string,
                    numLab: number,
                    idAnalyzer: number,
                    numMat: number,
                    numLot: number,
                    idAna: number,
                    levelTest: number,
                    idTest: number,
                    data: any,
                    ) {

  return new Promise(async (resolve, reject) => {
          this.pts = [...data];
          resolve(1);
  });

}



get desviacionesNvl1() { 
  
  let arr = [this.DEI4_Nvl1, this.DEI3_Nvl1, this.DEI2_Nvl1, this.DEI1_Nvl1, this.DES1_Nvl1, this.DES2_Nvl1, this.DES3_Nvl1, this.DES4_Nvl1, this.media_Nvl1, this.li_Nvl1, this.ls_Nvl1, this.diana_Nvl1]

  return arr;

}

get desviacionesNvl2() {

  let arr = [this.DEI4_Nvl2, this.DEI3_Nvl2, this.DEI2_Nvl2, this.DEI1_Nvl2, this.DES1_Nvl2, this.DES2_Nvl2, this.DES3_Nvl2, this.DES4_Nvl2, this.media_Nvl2, this.li_Nvl2, this.ls_Nvl2, this.diana_Nvl2]

  return arr;

}

get desviacionesNvl3() {
 
  let arr = [this.DEI4_Nvl3, this.DEI3_Nvl3, this.DEI2_Nvl3, this.DEI1_Nvl3, this.DES1_Nvl3, this.DES2_Nvl3, this.DES3_Nvl3, this.DES4_Nvl3, this.media_Nvl3, this.li_Nvl3, this.ls_Nvl3, this.diana_Nvl3]

  return arr;

}

get desviacionesMulti() {

  return this.desvMulti;

}

getpuntos(dataacti) {
  this.pts = dataacti;
  return this.pts;

}
get puntosprueba(){
  return this.pts;
}

}