import { Injectable } from '@angular/core';
import { ETService } from './error-total.service';
import { ValoresDianaService } from '../../../services/configuracion/valores-diana.service';
import { ConfiguracionMediaDSService } from '@app/services/configuracion/configuracion-media-ds.service';
import { MLJService } from './multi-levey-jennings.service';
import dayjs from 'dayjs';
import { environment } from '@environment/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { IngresoDatosUpdateService } from '@app/services/configuracion/ingreso-datos-update.service';
import { Results } from '@app/Models/Results';
import { IngresoDatosService } from '@app/services/configuracion/ingreso-datos.service';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { toInteger } from '@ng-bootstrap/ng-bootstrap/util/util';
import { ReportesFechasService } from './reportes-fechas.service';

@Injectable({
  providedIn: 'root'
})
export class DatosGraficosService {

  fecha = dayjs().format('YYYY-MM-DD');
  urlBase: string = environment.apiUrl;

  idResult: any;

  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();
  validacionReglas = [];

  pts: any = [];

  desvMulti = [];

  desv = [];
 //Datos graficas
 datosTestFecha = [];
 //Valores Label
 labels = [];

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

  ) { }

   //Obtener Test de grafica
 public  obtenerTest(Idheadquarters:any ,Idsection:any ,idControlMaterial:any , idLot:any){
  const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
  return  this.http.get<any>(`${environment.apiUrl}Tests/infotests/${Idheadquarters}/${Idsection}/${idControlMaterial}/${idLot}`, { headers: reqHeaders });
 }

 //Obtener lotes de graficas
public  obtenerLotes(idControl: any , resulttype:any) {
  const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
  return  this.http.get<any>(`${environment.apiUrl}Lots/lotsgraphs/${idControl}/${resulttype}`, { headers: reqHeaders });
 }


 //obtener valores graficas cualitativos
 public  valoresGraficaCualitativos(fechainicial,fechafinal,leveltest,idheadquaerters,idanalyzer,idcontrolmaterial,idlot,idanalyte){
  const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
  return   this.http.get<any>(`${environment.apiUrl}Reportes/graphsqcixfechas/${fechainicial}/${fechafinal}/${leveltest}/${idheadquaerters}/${idanalyzer}/${idcontrolmaterial}/${idlot}/${idanalyte}`, { headers: reqHeaders });
 }

 //obtener valores graficas Cuantitativos
 public  valoresGraficaCuantitativos(fechainicial:any,fechafinal:any,leveltest:any,idheadquaerters:any,idanalyzer:any,idcontrolmaterial:any,idlot:any,idanalyte:any){
  const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
  return   this.http.get<any>(`${environment.apiUrl}Reportes/graficolg/'${fechainicial}'/'${fechafinal}'/${leveltest}/${idheadquaerters}/${idanalyzer}/${idcontrolmaterial}/${idlot}/${idanalyte}`, { headers: reqHeaders });
 }

 //obtener valores test
 public ValoresTestFecha(fechainicial:any,fechafinal:any,idTest:any): Observable<any>
 {
  const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
  return   this.http.get<any>(`${environment.apiUrl}/Results/inforesultstestsxfechas/'${fechainicial}'/'${fechafinal}'/${idTest}`, { headers: reqHeaders });
 }

 public async ObtenerValoresGraficasTest(fechainicial:any,fechafinal:any,leveltest:any,idheadquaerters:any,idanalyzer:any,idcontrolmaterial:any,idlot:any,idanalyte:any,idtest:any){
 await this.ValoresTestFecha(fechafinal,fechainicial,idtest).subscribe((res:any)=>{
   res.forEach(element => {
   this.labels.push(dayjs(element.date).format('DD-MM-YYYY'));
   console.log(this.labels)
   });
 })

  this.valoresGraficaCuantitativos(fechainicial, fechafinal,leveltest,idheadquaerters,idanalyzer,idcontrolmaterial,idlot,idanalyte).subscribe((res:any)=>{

  })



 console.log("Labels",this.labels)
  //datosTestFecha
 }



   //obtener valores graficas cualitativos
 public  calcularARxfechas(fechainicial,fechafinal,leveltest,idheadquaerters,idanalyzer,idcontrolmaterial,idlot,idanalyte){
  const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
  return   this.http.get<any>(`${environment.apiUrl}Reportes/calcularARxfechas/${fechainicial}/${fechafinal}/${leveltest}/${idheadquaerters}/${idanalyzer}/${idcontrolmaterial}/${idlot}/${idanalyte}`, { headers: reqHeaders });
 }

  async  paramsFechas(numLab: number, idAnalyzer: number, numMat: number, numLot: number, idAna: number, levelTest: number, idTest:any,fechaInicio,fecha_fin,id_sede) {

    this.idtest = idTest;

    this.DEI4_Nvl1 = null
    this.DEI3_Nvl1 = null
    this.DEI2_Nvl1 = null
    this.DEI1_Nvl1 = null
    this.DES1_Nvl1 = null
    this.DES2_Nvl1 = null
    this.DES3_Nvl1 = null
    this.DES4_Nvl1 = null
    this.media_Nvl1 = null
    this.li_Nvl1 = null
    this.ls_Nvl1 = null
    this.diana_Nvl1 = null

    var hayDianaLvl1 = null;

     await this.valoresDianaService.getBuscadorConfiDianaValue(idTest).then(datos => {
      hayDianaLvl1 = datos.find(datos => datos.Level == 1) || null;
    }).catch(error => {
      hayDianaLvl1 = null;

    });


    // hay diana y ds
    if ((this.hayDesviacionLvl1 != null && this.hayDesviacionLvl1.Average != 0) && (hayDianaLvl1 != null && hayDianaLvl1.Dianavalue != 0)) {
      console.log("diana  y  ds",idTest)

      this.hayDshayDianaLvl1(this.hayDesviacionLvl1.Ds, hayDianaLvl1.Dianavalue, this.hayDesviacionLvl1.Average, hayDianaLvl1.Upperlimit, hayDianaLvl1.Lowlimit);

    }

    // hay ds sin diana
    if ((this.hayDesviacionLvl1 != null && this.hayDesviacionLvl1.Average != 0) && (hayDianaLvl1 == null || hayDianaLvl1.Dianavalue == 0)) {
      console.log("hay ds sin diana",idTest)

      this.hayDssinDianaLvl1(fechaInicio,fecha_fin,levelTest,id_sede,numLab, idAnalyzer, numMat, numLot, idAna, this.hayDesviacionLvl1.Ds, this.hayDesviacionLvl1.Average);

    }

    // hay diana sin ds
    if ((this.hayDesviacionLvl1 == null || this.hayDesviacionLvl1.Average == 0) && (hayDianaLvl1 != null && hayDianaLvl1.Dianavalue != 0)) {
      console.log("hay diana sin ds",idTest)

      this.sinDshayDianaLvl1(fechaInicio,fecha_fin,levelTest,id_sede,numLab, idAnalyzer, numMat, numLot, idAna, hayDianaLvl1.Dianavalue, hayDianaLvl1.Upperlimit, hayDianaLvl1.Lowlimit);

    }

    // sin diana sin ds
    if ((this.hayDesviacionLvl1 == null || this.hayDesviacionLvl1.Average == 0) && (hayDianaLvl1 == null || hayDianaLvl1.Dianavalue == 0)) {
      console.log("sin diana sin ds",idTest)

      this.sinDssinDianaLvl1(fechaInicio,fecha_fin,levelTest,id_sede,numLab, idAnalyzer, numMat, numLot, idAna);
    }

}

async sinDssinDianaLvl1(fechainicial,fechafinal,leveltest,idheadquaerters,numLab: number, idAnalyzer: number, numMat: number, numLot: number, idAna: number) {

  await this.getDesv(fechainicial,fechafinal,leveltest,idheadquaerters,idAnalyzer,numMat,numLot,idAna).then((data: any) => {
 console.log(data)
    this.diana_Nvl1 = data.dianavalue;
    this.li_Nvl1 = data.limitInferior;
    this.ls_Nvl1 = data.limitSuperior;

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

async hayDshayDianaLvl1(ds: number, diana: number, media: number, ls: number, li: number) {



  this.media_Nvl1 = media;
  this.diana_Nvl1 = diana;
  this.li_Nvl1 = li;
  this.ls_Nvl1 = ls;

  this.DEI1_Nvl1 = Math.round((media - ds)*100)/100;
  this.DEI2_Nvl1 = Math.round((media - (ds * 2))*100)/100;
  this.DEI3_Nvl1 = Math.round((media - (ds * 3))*100)/100;
  this.DEI4_Nvl1 = Math.round((media - (ds * 4))*100)/100;

  this.DES1_Nvl1 = Math.round((media + ds)*100)/100;
  this.DES2_Nvl1 = Math.round((media + (ds * 2))*100)/100;
  this.DES3_Nvl1 = Math.round((media + (ds * 3))*100)/100;
  this.DES4_Nvl1 = Math.round((media + (ds * 4))*100)/100;

}



async hayDssinDianaLvl1(fechainicial,fechafinal,leveltest,idheadquaerters,numLab: number, idAnalyzer: number, numMat: number, numLot: number, idAna: number, ds: number, media: number) {

  this.media_Nvl1 = media;

  this.DEI1_Nvl1 = Math.round((media - ds)*100)/100;
  this.DEI2_Nvl1 = Math.round((media - (ds * 2))*100)/100;
  this.DEI3_Nvl1 = Math.round((media - (ds * 3))*100)/100;
  this.DEI4_Nvl1 = Math.round((media - (ds * 4))*100)/100;

  this.DES1_Nvl1 = Math.round((media + ds)*100)/100;
  this.DES2_Nvl1 = Math.round((media + (ds * 2))*100)/100 ;
  this.DES3_Nvl1 = Math.round((media + (ds * 3))*100)/100;
  this.DES4_Nvl1 = Math.round((media + (ds * 4))*100)/100;


  await this.getDesv(fechainicial,fechafinal,leveltest,idheadquaerters,idAnalyzer,numMat,numLot,idAna).then((data: any) => {

    this.diana_Nvl1 = data.dianavalue;
    this.li_Nvl1 = data.limitInferior;
    this.ls_Nvl1 = data.limitSuperior;

  });

}

async sinDshayDianaLvl1(fechainicial,fechafinal,leveltest,idheadquaerters,numLab: number, idAnalyzer: number, numMat: number, numLot: number, idAna: number, diana: number, ls: number, li: number) {


  this.li_Nvl1 = li;
  this.ls_Nvl1 = ls;
  this.diana_Nvl1 = diana;

  await this.getDesv(fechainicial,fechafinal,leveltest,idheadquaerters,idAnalyzer,numMat,numLot,idAna).then((data: any) => {

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



getDesv(fechainicial:any,fechafinal:any,leveltest:any,idheadquaerters:any,idanalyzer:any,idcontrolmaterial:any,idlot:any,idanalyte:any){

  let url = `${ this.urlBase }Reportes/graficoet/'${ fechainicial }'/'${ fechafinal }'/${ leveltest }/${ idheadquaerters }/${ idanalyzer }/${ idcontrolmaterial }/${ idlot }/${ idanalyte }`;

  return this.http.get( url ).toPromise();
}



get desviacionesNvl1() {

  let arr = [this.DEI4_Nvl1, this.DEI3_Nvl1, this.DEI2_Nvl1, this.DEI1_Nvl1, this.DES1_Nvl1, this.DES2_Nvl1, this.DES3_Nvl1, this.DES4_Nvl1, this.media_Nvl1, this.li_Nvl1, this.ls_Nvl1, this.diana_Nvl1]

  return arr;

}

get puntos() {

  return this.pts;
}

async validUpdateDataTable(numLab: number, idAnalyzer: number, numMat: number, numLot: number, idAna: number, levelTest: number, idTest: number, response: any) {
  console.log('levelTest ',levelTest);



   await this.configuracionMediaDSService.getBuscadorConfiMediaDS(idTest).then(data => {

    this.hayDesviacionLvl1 = data.find(datos => datos.Level == 1) || null;


  }).catch(error => {

    this.hayDesviacionLvl1 = null;


  });

    console.log("Desvi",this.hayDesviacionLvl1)

  return new Promise(async (resolve, reject) => {
    // Level 1
    if (levelTest == 1) {
        if (this.hayDesviacionLvl1 != null && this.hayDesviacionLvl1.Average != 0) {
                this.ingresoDatosUpdateService.paramsSiHayConfiguracion(this.fecha, 1, numLab, idAnalyzer, numMat, numLot, idAna,this.idtest)
                                      .then((response1: any) => {
                                        console.log(response1);
                                        return resolve(1);


                                      }).catch(error => {
                                        console.log(error);
                                        return resolve(1);
                                      });
      } else {
        var respuestalvl1 = await this.updateDataIngresoDatosLvl1SinConfiguracion(response, numLab, idAnalyzer, numMat, numLot, idAna,idTest);

        if(respuestalvl1 == "error"){

          return resolve(1);

        }else{
          return resolve(1);
        }

      }

  }


  })

}


async updateDataIngresoDatosLvl1SinConfiguracion(respuestainfoPrueba, numLab: number, idAnalyzer: number, numMat: number, numLot: number, idAna: number,idTest:number) {

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
              Metodo:'actualización',
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



}
