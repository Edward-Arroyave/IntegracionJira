import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ThemePalette, MatOptionModule } from '@angular/material/core';
import { ProgressSpinnerMode, MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { PreAcceptlabsamplespreService } from '@app/services/pre-analitico/pre-acceptlabsamplespre.service';
import { PreTurnosService } from '@app/services/pre-analitico/pre-turnos.service';
import { PreAreasService } from '@app/services/pre-analitico/pre-areas.service';
import { DatePipe, NgFor, NgIf, NgClass } from '@angular/common';
import { PreIndicadoresService } from '@app/services/pre-analitico/pre-indicadores.service';
import moment from 'moment';
import { ImageCdnPipe } from '../../../../../core/pipes/image-cdn.pipe';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

interface IndSamples { //TODO: enviar datos
  clottedsample: number,
  collectioncontainerrupture: number,
  contaminatedsample: number,
  hemolyzedsample: number,
  ictericlipemia: number,
  idacceptlabsamples: number,
  idarea: number,
  idturns: number,
  lipemia: number,
  misidentifiedsample: number,
  mislabeledsample: number,
  months: number,
  numbersamplesexcesstrstime: number,
  rejectlostsample: number,
  rejectnotreceivedsample: number,
  requestnotmatchsample: number,
  sampleanticoagulant: number,
  sampleinsufficient: number,
  samplenotstoredatcorrecttemptrs: number,
  samplesdamaged: number,
  samplesnotstoredcorrectly: number,
  sampletimeold: number,
  totalsamples: number, 5
  totalsamplesrejected: number,
  unlabeledsample: number,
  wrongcolecontainer: number,
  years: number,
}

@Component({
    selector: 'app-aceptabilidad-muestras-lab',
    templateUrl: './aceptabilidad-muestras-lab.component.html',
    styleUrls: ['./aceptabilidad-muestras-lab.component.css'],
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, MatFormFieldModule, MatSelectModule, MatOptionModule, NgFor, NgIf, MatCardModule, MatProgressSpinnerModule, MatInputModule, NgClass, TranslateModule, ImageCdnPipe]
})
export class AceptabilidadMuestrasLabComponent implements OnInit {

  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();
  indSample: IndSamples = null;

  formulario: FormGroup;
  valItem1: number;
  valItem2: number;
  valItem3: number;
  valItem4: number;
  valItem5: number;
  valItem6: number;
  valItem7: number;
  valItem8: number;
  valItem9: number;
  valItem10: number;
  valItem11: number;
  valItem12: number;
  valItem13: number;
  valItem14: number;
  valItem15: number;
  valItem16: number;
  valItem17: number;
  valItem18: number;
  valItem19: number;
  valItem20: number;
  // valItem21: number;
  // valItem22: number;

  totalMuestras: number = 0;
  totalRechazadas: number = 0;
  totalSamplePB: number = 0;
  totalSamplePB_Tmp: number = 0;

  //progress bar
  color: ThemePalette = 'primary';
  mode: ProgressSpinnerMode = 'determinate';
  value = 0;

  alert: boolean = false;
  alertReject: boolean = false;

  isDisabled: boolean = true;
  filterHide: boolean = true;
  disabledUp: boolean = true;


  txtInput1: boolean = false;
  txtInput2: boolean = false;
  txtInput3: boolean = false;
  txtInput4: boolean = false;
  txtInput5: boolean = false;
  txtInput6: boolean = false;
  txtInput7: boolean = false;
  txtInput8: boolean = false;
  txtInput9: boolean = false;
  txtInput10: boolean = false;
  txtInput11: boolean = false;
  txtInput12: boolean = false;
  txtInput13: boolean = false;
  txtInput14: boolean = false;
  txtInput15: boolean = false;
  txtInput16: boolean = false;
  txtInput17: boolean = false;
  txtInput18: boolean = false;
  txtInput19: boolean = false;
  txtInput20: boolean = false;
  // txtInput21: boolean = false;
  // txtInput22: boolean = false;
  // txtInput22: boolean = false;

  year: number = new Date().getFullYear();

  anios = [];

  meses = [
    { mes: 'Enero', idmes: 1 },
    { mes: 'Febrero', idmes: 2 },
    { mes: 'Marzo', idmes: 3 },
    { mes: 'Abril', idmes: 4 },
    { mes: 'Mayo', idmes: 5 },
    { mes: 'Junio', idmes: 6 },
    { mes: 'Julio', idmes: 7 },
    { mes: 'Agosto', idmes: 8 },
    { mes: 'Septiembre', idmes: 9 },
    { mes: 'Octubre', idmes: 10 },
    { mes: 'Noviembre', idmes: 11 },
    { mes: 'Diciembre', idmes: 12 },
  ];

  areas = [];
  turnos = [];
  @Input() tituloInd: string;
  arrayTurnos = [];
  arrayAreas = [];
  constructor(private fb: FormBuilder,
    private translate: TranslateService,
    private toastr: ToastrService,
    private preAreasService: PreAreasService,
    private preTurnosService: PreTurnosService,
    private preAcceptlabsamplespreService: PreAcceptlabsamplespreService,
    private preIndicadoresService: PreIndicadoresService,
    private datePipe: DatePipe) { }

  ngOnInit(): void {

    this.mainData();

    this.anios = [
      this.year,
      this.year - 1,
      this.year - 2,
      this.year - 3,
    ];


    this.crearFormulario();
    console.log(this.tituloInd);
  }

  //----------------------
  async mainData() {
    await this.preAreasService.getAllAsync().then(data => {
      this.areas = data.filter(areas => areas.active);
    });
    await this.preTurnosService.getAllAsync().then(data => {
      this.turnos = data.filter(areas => areas.active);
    });
    this.infoIndicador();
  }

  //---------------------

  getFiltro() {

    this.totalSamplePB = 0;
    this.totalSamplePB_Tmp = 0;
    this.value = 0;
    this.indSample = null;
    this.disabledUp = false;
    const year = this.formulario.get('anio').value;
    const month = this.formulario.get('mes').value;

    this.preAcceptlabsamplespreService.getByMonthYearTurnArea(
      month,
      year,
      this.formulario.get('idarea').value,
      this.formulario.get('idturns').value,
    )
      .subscribe((resp: IndSamples[]) => {

        console.log('Indicador: ', resp);
        this.indSample = resp[0];

        this.isDisabled = false;

        this.totalSamplePB = resp[0].totalsamples;
        this.totalMuestras = resp[0].totalsamples; // Total
        this.totalRechazadas = resp[0].totalsamplesrejected; // Total

        // this.valItem1 = resp[0].totalsamples;
        // this.valItem2 = resp[0].totalsamplesrejected;
        this.valItem1 = resp[0].rejectlostsample;
        this.valItem2 = resp[0].rejectnotreceivedsample;
        this.valItem3 = resp[0].unlabeledsample;
        this.valItem4 = resp[0].mislabeledsample;
        this.valItem5 = resp[0].misidentifiedsample;
        this.valItem6 = resp[0].sampleinsufficient;
        this.valItem7 = resp[0].sampleanticoagulant;
        this.valItem8 = resp[0].requestnotmatchsample;
        this.valItem9 = resp[0].wrongcolecontainer;
        this.valItem10 = resp[0].sampletimeold;
        this.valItem11 = resp[0].hemolyzedsample;
        this.valItem12 = resp[0].lipemia;
        this.valItem13 = resp[0].ictericlipemia;
        this.valItem14 = resp[0].clottedsample;
        this.valItem15 = resp[0].contaminatedsample;
        this.valItem16 = resp[0].samplesdamaged;
        this.valItem17 = resp[0].samplenotstoredatcorrecttemptrs;
        this.valItem18 = resp[0].collectioncontainerrupture;
        this.valItem19 = resp[0].samplesnotstoredcorrectly;
        this.valItem20 = resp[0].numbersamplesexcesstrstime;



      }, err => {

        this.toastr.error('No hay datos');

        this.indSample = null;
        this.totalMuestras = 0;
        this.totalRechazadas = 0;
        this.totalSamplePB = 0;


        this.valItem1 = null;
        this.valItem2 = null;
        this.valItem3 = null;
        this.valItem4 = null;
        this.valItem5 = null;
        this.valItem6 = null;
        this.valItem7 = null;
        this.valItem8 = null;
        this.valItem9 = null;
        this.valItem10 = null;
        this.valItem11 = null;
        this.valItem12 = null;
        this.valItem13 = null;
        this.valItem14 = null;
        this.valItem15 = null;
        this.valItem16 = null;
        this.valItem17 = null;
        this.valItem18 = null;
        this.valItem19 = null;
        this.valItem20 = null;

      });
  }

  //----------formulario------------

  get mesNoValido() {
    return this.formulario.get('mes');
  }

  get anioNoValido() {
    return this.formulario.get('anio');
  }



  crearFormulario() {

    this.formulario = this.fb.group({
      mes: ['--', [Validators.required]],
      anio: ['--', [Validators.required]],
      idturns: ['--', [Validators.required]],
      idarea: ['--', [Validators.required]],

    });


  }


  // --------crear editar--------
  crearEditar() {
    let sign1 = Math.sign(this.valItem1);
    if (sign1 === 0) { sign1 = 1 }
    let sign2 = Math.sign(this.valItem2);
    if (sign2 === 0) { sign2 = 1 }
    let sign3 = Math.sign(this.valItem3);
    if (sign3 === 0) { sign3 = 1 }
    let sign4 = Math.sign(this.valItem4);
    if (sign4 === 0) { sign4 = 1 }
    let sign5 = Math.sign(this.valItem5);
    if (sign5 === 0) { sign5 = 1 }
    let sign6 = Math.sign(this.valItem6);
    if (sign6 === 0) { sign6 = 1 }
    let sign7 = Math.sign(this.valItem7);
    if (sign7 === 0) { sign7 = 1 }
    let sign8 = Math.sign(this.valItem8);
    if (sign8 === 0) { sign8 = 1 }
    let sign9 = Math.sign(this.valItem9);
    if (sign9 === 0) { sign9 = 1 }
    let sign10 = Math.sign(this.valItem10);
    if (sign10 === 0) { sign10 = 1 }
    let sign11 = Math.sign(this.valItem11);
    if (sign11 === 0) { sign11 = 1 }
    let sign12 = Math.sign(this.valItem12);
    if (sign12 === 0) { sign12 = 1 }
    let sign13 = Math.sign(this.valItem13);
    if (sign13 === 0) { sign13 = 1 }
    let sign14 = Math.sign(this.valItem14);
    if (sign14 === 0) { sign14 = 1 }
    let sign15 = Math.sign(this.valItem15);
    if (sign15 === 0) { sign15 = 1 }
    let sign16 = Math.sign(this.valItem16);
    if (sign16 === 0) { sign16 = 1 }
    let sign17 = Math.sign(this.valItem17);
    if (sign17 === 0) { sign17 = 1 }
    let sign18 = Math.sign(this.valItem18);
    if (sign18 === 0) { sign18 = 1 }
    let sign19 = Math.sign(this.valItem19);
    if (sign19 === 0) { sign19 = 1 }
    let sign20 = Math.sign(this.valItem20);
    if (sign20 === 0) { sign20 = 1 }

    if (sign1 === 1
      && sign2 === 1
      && sign3 === 1
      && sign4 === 1
      && sign5 === 1
      && sign6 === 1
      && sign7 === 1
      && sign8 === 1
      && sign9 === 1
      && sign10 === 1
      && sign11 === 1
      && sign12 === 1
      && sign13 === 1
      && sign14 === 1
      && sign15 === 1
      && sign16 === 1
      && sign17 === 1
      && sign18 === 1
      && sign19 === 1
      && sign20 === 1) {
      if (this.indSample) {
        this.indSample.totalsamples = this.totalMuestras;
        this.indSample.months = this.formulario.get('mes').value;
        this.indSample.years = this.formulario.get('anio').value;
        this.indSample.idturns = this.formulario.get('idturns').value;
        this.indSample.idarea = this.formulario.get('idarea').value;
        // this.indSample.userid = sessionStorage.getItem('userid');

        this.indSample.totalsamples = this.totalMuestras;
        this.indSample.totalsamplesrejected = this.totalRechazadas;
        this.indSample.rejectlostsample = this.valItem1;
        this.indSample.rejectnotreceivedsample = this.valItem2;
        this.indSample.unlabeledsample = this.valItem3;
        this.indSample.mislabeledsample = this.valItem4;
        this.indSample.misidentifiedsample = this.valItem5;
        this.indSample.sampleinsufficient = this.valItem6;
        this.indSample.sampleanticoagulant = this.valItem7;
        this.indSample.requestnotmatchsample = this.valItem8;
        this.indSample.wrongcolecontainer = this.valItem9;
        this.indSample.sampletimeold = this.valItem10;
        this.indSample.hemolyzedsample = this.valItem11;
        this.indSample.lipemia = this.valItem12;
        this.indSample.ictericlipemia = this.valItem13;
        this.indSample.clottedsample = this.valItem14;
        this.indSample.contaminatedsample = this.valItem15;
        this.indSample.samplesdamaged = this.valItem16;
        this.indSample.samplenotstoredatcorrecttemptrs = this.valItem17;
        this.indSample.collectioncontainerrupture = this.valItem18;
        this.indSample.samplesnotstoredcorrectly = this.valItem19;
        this.indSample.numbersamplesexcesstrstime = this.valItem20;



        this.preAcceptlabsamplespreService.update(this.indSample, this.indSample.idacceptlabsamples).subscribe(respuesta => {

          this.reset();
          this.toastr.success('Registro actualizado');

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            Hora: this.dateNowISO,
            Metodo: 'creación',
            Datos: JSON.stringify(this.indSample),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: status
          }

          this.preAcceptlabsamplespreService.createLogAsync(Loguser).then(respuesta => { });

        }, (error) => {

          this.toastr.error('Server Error');

          const Loguser = {
            fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.dateNowISO,
            metodo: 'creación',
            datos: JSON.stringify(this.indSample),
            respuesta: error.message,
            tipoRespuesta: error.status
          }
          this.preAcceptlabsamplespreService.createLogAsync(Loguser).then(respuesta => { });

        });

      } else {
        if (!this.formulario.valid || this.formulario.get('mes').value == '--' || this.formulario.get('anio').value == '--') {

          this.toastr.error('Seleccione Mes/Año');
          return;

        }


        let indJson = {

          months: this.formulario.get('mes').value,
          years: this.formulario.get('anio').value,
          idturns: this.formulario.get('idturns').value,
          idarea: this.formulario.get('idarea').value,
          userid: sessionStorage.getItem('userid'),
          totalsamples: this.totalMuestras,
          totalsamplesrejected: this.totalRechazadas,
          rejectlostsample: this.valItem1,
          rejectnotreceivedsample: this.valItem2,
          unlabeledsample: this.valItem3,
          mislabeledsample: this.valItem4,
          misidentifiedsample: this.valItem5,
          sampleinsufficient: this.valItem6,
          sampleanticoagulant: this.valItem7,
          requestnotmatchsample: this.valItem8,
          wrongcolecontainer: this.valItem9,
          sampletimeold: this.valItem10,
          hemolyzedsample: this.valItem11,
          lipemia: this.valItem12,
          ictericlipemia: this.valItem13,
          clottedsample: this.valItem14,
          contaminatedsample: this.valItem15,
          samplesdamaged: this.valItem16,
          samplenotstoredatcorrecttemptrs: this.valItem17,
          collectioncontainerrupture: this.valItem18,
          samplesnotstoredcorrectly: this.valItem19,
          numbersamplesexcesstrstime: this.valItem20,

        }

        // console.log(indJson);


        this.preAcceptlabsamplespreService.create(indJson).subscribe(resp => {

          this.toastr.success('Registro creado');
          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            Hora: this.dateNowISO,
            Metodo: 'creación',
            Datos: JSON.stringify(this.indSample),
            Respuesta: JSON.stringify(resp),
            TipoRespuesta: status
          }

          this.preAcceptlabsamplespreService.createLogAsync(Loguser).then(respuesta => { });

          this.indSample = null;

          this.reset();

        }, err => {

          const Loguser = {
            fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.dateNowISO,
            metodo: 'creación',
            datos: JSON.stringify(this.indSample),
            respuesta: err.message,
            tipoRespuesta: err.status
          }
          this.preAcceptlabsamplespreService.createLogAsync(Loguser).then(respuesta => { });
          this.indSample = null;
          this.toastr.error('Server Error');

        });
      }
    } else {
      this.toastr.error("Algunos valores de los items contienen valores negativos, por favor revisar la información digitada");
    }
  }



  setTotalProgressBar(element) {
    const valorIngresado = Math.sign(element.value);

    //No se cuenta en el total de las ordenes los numeros negativos
    if (valorIngresado === 1 || valorIngresado === 0) {
      //this.totalSamplePB_Tmp = this.totalSamplePB_Tmp + element.value;
      this.totalSamplePB_Tmp = this.valItem1 + this.valItem2 + this.valItem3 + this.valItem4 + this.valItem5 + this.valItem6 + this.valItem7 + this.valItem8 + this.valItem9 + this.valItem10 +
        this.valItem11 + this.valItem12 + this.valItem13 + this.valItem14 + this.valItem15 + this.valItem16 + this.valItem17 + this.valItem18 + this.valItem19 + this.valItem20;

      if (this.totalSamplePB_Tmp > this.totalMuestras) {

        console.log('Total', this.totalSamplePB_Tmp);


        this.alert = true;

        this.switchInputs(element.name);
        // element.control.setValue(0);
        //element.control.setErrors({'max': true});
        return;
      }


      /*if (element.value > this.totalRechazadas) {

        this.alertReject = true;

        element.control.setValue(this.totalRechazadas);
        element.control.setErrors({'max': true});
        return;

      }*/


      this.totalSamplePB = this.totalSamplePB_Tmp;
      this.value = (this.totalSamplePB * 100) / this.totalMuestras;
      this.switchInputs('');
      this.alertReject = false;
      this.alert = false;
    }
  }


  setTotalMuestras() {

    this.alertReject = false;

    if (this.totalMuestras < this.totalRechazadas) {
      this.alertReject = true;
      return;
    }




    if (this.totalMuestras > 0 && !this.indSample) {

      this.isDisabled = false;

      //this.totalRechazadas = 0;

      this.valItem1 = 0;
      this.valItem2 = 0;
      this.valItem3 = 0;
      this.valItem4 = 0;
      this.valItem5 = 0;
      this.valItem6 = 0;
      this.valItem7 = 0;
      this.valItem8 = 0;
      this.valItem9 = 0;
      this.valItem10 = 0;
      this.valItem11 = 0;
      this.valItem12 = 0;
      this.valItem13 = 0;
      this.valItem14 = 0;
      this.valItem15 = 0;
      this.valItem16 = 0;
      this.valItem17 = 0;
      this.valItem18 = 0;
      this.valItem19 = 0;
      this.valItem20 = 0;

    }

  }


  reset() {

    this.value = 0;

    this.formulario.get('mes').setValue('--');
    this.formulario.get('anio').setValue('--');
    this.formulario.get('idturns').setValue('--');
    this.formulario.get('idarea').setValue('--');
    this.valItem1 = null;
    this.valItem2 = null;
    this.valItem3 = null;
    this.valItem4 = null;
    this.valItem5 = null;
    this.valItem6 = null;
    this.valItem7 = null;
    this.valItem8 = null;
    this.valItem9 = null;
    this.valItem10 = null;
    this.valItem11 = null;
    this.valItem12 = null;
    this.valItem13 = null;
    this.valItem14 = null;
    this.valItem15 = null;
    this.valItem16 = null;
    this.valItem17 = null;
    this.valItem18 = null;
    this.valItem19 = null;
    this.valItem20 = null;

    this.totalMuestras = null;
    this.totalRechazadas = null;
    this.totalSamplePB_Tmp = 0;
    this.totalSamplePB = 0;
    this.isDisabled = true;
    this.alert = false;
    this.alertReject = false;

    this.switchInputs('');

  }



  switchInputs(input) {

    //console.log(input);


    switch (input) {
      case 'input1':
        this.txtInput1 = true;
        break;
      case 'input2':
        this.txtInput2 = true;
        break;
      case 'input3':
        this.txtInput3 = true;
        break;
      case 'input4':
        this.txtInput4 = true;
        break;
      case 'input5':
        this.txtInput5 = true;
        break;
      case 'input6':
        this.txtInput6 = true;
        break;
      case 'input7':
        this.txtInput7 = true;
        break;
      case 'input8':
        this.txtInput8 = true;
        break;
      case 'input9':
        this.txtInput9 = true;
        break;
      case 'input10':
        this.txtInput10 = true;
        break;
      case 'input11':
        this.txtInput11 = true;
        break;
      case 'input12':
        this.txtInput12 = true;
        break;
      case 'input13':
        this.txtInput13 = true;
        break;
      case 'input14':
        this.txtInput14 = true;
        break;
      case 'input15':
        this.txtInput15 = true;
        break;
      case 'input16':
        this.txtInput16 = true;
        break;
      case 'input17':
        this.txtInput17 = true;
        break;
      case 'input18':
        this.txtInput18 = true;
        break;
      case 'input19':
        this.txtInput19 = true;
        break;
      case 'input20':
        this.txtInput20 = true;
        break;

      default:
        this.txtInput1 = false;
        this.txtInput2 = false;
        this.txtInput3 = false;
        this.txtInput4 = false;
        this.txtInput5 = false;
        this.txtInput6 = false;
        this.txtInput7 = false;
        this.txtInput8 = false;
        this.txtInput9 = false;
        this.txtInput10 = false;
        this.txtInput11 = false;
        this.txtInput12 = false;
        this.txtInput13 = false;
        this.txtInput14 = false;
        this.txtInput15 = false;
        this.txtInput16 = false;
        this.txtInput17 = false;
        this.txtInput18 = false;
        this.txtInput19 = false;
        this.txtInput20 = false;

        break;
    }

  }

  enableFilters() {


    if (this.formulario.get('mes').value == '--' || this.formulario.get('anio').value == '--') {

      this.toastr.error('Seleccione Mes/Año');
      return;

    }
    const year = this.formulario.get('anio').value;
    const month = this.formulario.get('mes').value;
    const currentYear = moment().year();
    const currentMonth = moment().month() + 1;
    if(year === currentYear){
      if(Number(month) > Number(currentMonth)){
        this.toastr.error('No puede superar el mes actual','Error');
        this.formulario.get('mes').setValue(null);
        return;
      }
    }

    this.filterHide = false;
  }

  infoIndicador() {
    this.preIndicadoresService.getDatosIndicador(this.tituloInd).subscribe((respuesta: any) => {
      const arrayIds = respuesta.map((m: any) => m.Idarea);
      const arrayTurnos = respuesta.map((m: any) => m.Desturns);

      this.arrayTurnos = [];
      this.arrayAreas = [];

      this.areas.forEach((m: any) => {
        if (arrayIds.includes(m.idarea)) {
          this.arrayAreas.push(m);
        }
      });

      this.turnos.forEach((m: any) => {
        if (arrayTurnos.includes(m.desturns)) {
          this.arrayTurnos.push(m);
        }
      });
    });
  }

}
