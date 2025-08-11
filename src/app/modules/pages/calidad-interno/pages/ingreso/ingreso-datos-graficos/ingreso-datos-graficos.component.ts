import { Component, OnInit, ViewChild ,TemplateRef, ElementRef} from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SedesService } from '../../../../../../services/configuracion/sedes.service';
import { SeccionesService } from '../../../../../../services/configuracion/secciones.service';
import dayjs from 'dayjs';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ConfiguracionMediaDSService } from '@app/services/configuracion/configuracion-media-ds.service';
import { TestsService } from '@app/services/configuracion/test.service';

import { DatosGraficosService} from '../../../../../graficos/services/datos-graficos.service' ;
import * as echarts from 'echarts';
import { SidebarService } from '../../../../../../services/general/sidebar.service';
import { ImageCdnPipe } from '../../../../../core/pipes/image-cdn.pipe';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgIf, NgFor, NgClass } from '@angular/common';

@Component({
    selector: 'app-ingreso-datos-graficos',
    templateUrl: './ingreso-datos-graficos.component.html',
    styleUrls: ['./ingreso-datos-graficos.component.css'],
    standalone: true,
    imports: [NgIf, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatSelectModule, MatOptionModule, NgFor, NgClass, MatInputModule, MatDatepickerModule, TranslateModule, ImageCdnPipe]
})
export class IngresoDatosGraficosComponent implements OnInit {

  @ViewChild('SD12345', {static: false}) FS: ElementRef;
  sedes = [];
  materiales = [];
  secciones = [];
  habilitarSede:boolean = false;
  habilitarGraficas:boolean = false;
  mostrarGraficas:boolean = false;
  ValoresGraficas:any = []
  sedeId:number = 0;
  lotes = [];
  LoteSeleccionado:any= 0
  tests = []
  DatosSeleccionadosData = []
  DatosSeleccionadosDatosGrafica = []

  TestSeleccionados:any = []
  lotesSeleccionados:any = []

  mostrarTabla:boolean = true;
  lotesMultiples = []
  testMultiples = []

  option!:echarts.EChartsOption;
  desv = [];
  valores = []
  labels = [];
  DEI1 = [];
  DEI2 = [];
  DEI3 = [];
  DEI4 = [];
  MEDIA = [];
  DIANA = [];
  LS = [];
  LI = [];
  DES1 = [];
  DES2 = [];
  DES3 = [];
  DES4 = [];
  pts: any;
  verInfoprueba = false;
  puntosAR = [];
  min: any;
  max: any;
  levelTest: number;
  dataTestMulti:any = []
  displayedColumns: string[] = [];
  summers = [];
  columnas = [];
  ver = false;
  opcion: number;
ValoresDiana:any = [];
ars:any = []

  tituloLote = ''
  today = dayjs().format('YYYY-MM-DD');
  vantanaModal: BsModalRef;
  constructor(
    private fb: FormBuilder,
    private sedesService: SedesService,
     private seccionesService: SeccionesService,
     private toastr: ToastrService,
     private translate: TranslateService,
     private modalService: BsModalService,
     private testService: TestsService,
     private configuracionMediaDSService: ConfiguracionMediaDSService,
     private DatosGraficosServices :DatosGraficosService,
     private sidebarservice: SidebarService
     ) {
      
      }

  formFiltro: FormGroup = this.fb.group({

    sede: ['', [Validators.required]],
    seccion: ['', [Validators.required]],
    material: ['', [Validators.required]],
    ingresodatos: ['', [Validators.required]]
  });



  fecha;
  fechaInicio;

  formFecha: FormGroup = this.fb.group({

    fechaInicio: [ '', [Validators.required]],
    fechaFin: ['', [Validators.required]],

  });
  //validators FormularioTest
  get sedeForm() {
    return this.formFiltro.get('sede');
  }
  get seccionForm() {
    return this.formFiltro.get('seccion');
  }
  get materialForm() {
    return this.formFiltro.get('material');
  }


  get ingresodatosForm() {
    return this.formFiltro.get('ingresodatos');
  }


  ngOnInit(): void {
    this.sedeId = JSON.parse(sessionStorage.getItem('sede'));

   this.dataForm()
   if (this.sedeId > 0)

    {
     this.formFiltro.controls['sede'].setValue(this.sedeId);
    this.habilitarSede =  true
    }

  }

  async dataForm() {

    await this.sedesService.getAllAsync().then(data => {
      this.sedes = data.filter(sede => sede.Active);
    });

    await this.seccionesService.getAllAsync().then(data => {
      this.secciones = data.filter(seccion => seccion.active);
    });

  }
   ConsultaLoteTest()
  {
    if (!this.formFiltro.invalid) {
      this.LoteSeleccionado = 0
      this.DatosSeleccionadosDatosGrafica = []
      this.DatosGraficosServices.obtenerLotes(this.formFiltro.controls['material'].value , this.formFiltro.controls['ingresodatos'].value).subscribe((res:any) =>{
        if (res.length > 0){
          this.lotes = res.filter(lote => lote.Active == true);
          this.mostrarTabla = false

        }else{
        this.lotes = []

        this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.NO_DATOS'));
        this.mostrarTabla = true

        }

      },(error:any)=>{
        this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.NO_DATOS'));
        this.lotes = []
        this.mostrarTabla = true

      })


    }

  }


  async materialControl(id:any)
  {
     (await this.sedesService.gebByIdSeccionMateriasSedeControl(id, this.sedeId)).subscribe((data:any) => {
      if (data.length > 0)
      {
         this.materiales = data.filter(material => material.Active  == true);

      }
     },(err:any)=>{
      this.materiales = [];
     });
    this.LoteSeleccionado = 0
  }


  SeleccionarTest(id:any){
    this.LoteSeleccionado = id
   // this.TestSeleccionados = ''
    this.DatosSeleccionadosDatosGrafica = []
    this.DatosGraficosServices.obtenerTest(this.formFiltro.controls['sede'].value , this.formFiltro.controls['seccion'].value, this.formFiltro.controls['material'].value,id).subscribe((res:any) =>{
     if (res.length > 0)
     {
      this.tests = res
     }else{
      this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.NO_DATOS'));
      this.tests = []
     }
    },(error:any)=>{
      this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.NO_DATOS'));
      this.tests = []
    })
  }

  AgregarTest(id,contenido){
    let filtro:any = []
    let elemen:any =  document.getElementById(contenido) ;

    let json = {
      lote  : this.LoteSeleccionado ,
      ...id
    }

    if (this.lotesMultiples.length < 3){

      if (this.lotesMultiples.length > 0){
        filtro = this.lotesMultiples.filter(e => e.IdTest === json.IdTest);

        if (filtro.length > 0){
          this.lotesMultiples  = this.lotesMultiples.filter(e => e.IdTest != json.IdTest);
          elemen.checked = false;
        }else{
          this.lotesMultiples.push(json)
        }
      }else{
       this.lotesMultiples.push(json)
      }

    }else{
      this.toastr.info(this.translate.instant('MODULES.REPORTESDATOSCUANTITATIVOS.VALORMAXIMO'));

      if (this.lotesMultiples.length > 0){
        filtro = this.lotesMultiples.filter(e => e.IdTest == json.IdTest);
        if (filtro.length > 0){
          this.lotesMultiples  = this.lotesMultiples.filter(e => e.IdTest != id.IdTest);
          elemen.checked = false;
        }

      }
      elemen.checked = false;
    }


    this.TestSeleccionados = this.lotesMultiples
  }

  generarGraficas(templateGestionTest: TemplateRef<any>, datos: any){

   var datosLotes = [];
   let nombre = ''
   let lote = ''
   this.DatosSeleccionadosData = []
    for (let index = 0; index < this.TestSeleccionados.length; index++) {
      datosLotes = this.lotes.filter(lote => lote.IdLot == this.TestSeleccionados[index].lote);
      if ( datosLotes.length > 0){

       nombre =  this.TestSeleccionados[index].Desanalytes + '|' +  this.TestSeleccionados[index].NameAnalyzer + '|' + this.TestSeleccionados[index].Desunits   + '|' +  this.TestSeleccionados[index].Desreagents  + '|' + this.TestSeleccionados[index].Desmethods
       lote  = datosLotes[0]['Numlot']
       this.DatosSeleccionadosData.push({
         "nombre" : nombre,
         "lote" : lote
       })
      }

    }

   this.vantanaModal = this.modalService.show(templateGestionTest,{backdrop: 'static', keyboard: false });
   this.translate.get('MODULES.REPORTESDATOSCUANTITATIVOS.DATOSSELECCIONADOS').subscribe(respuesta => this.tituloLote  = respuesta);
   this.vantanaModal.setClass('modal-lg');
  }

  closeVentana(): void {
    this.vantanaModal.hide();

  }

  async obtenerValores(){
     //---------------------
  if (this.TestSeleccionados.length > 1 || this.TestSeleccionados !== ''){
    this.habilitarGraficas = true

    var datosLotes = [];
    let nombre = ''
    let lote = ''
    this.DatosSeleccionadosData = []
     for (let index = 0; index < this.TestSeleccionados.length; index++) {
       datosLotes = this.lotes.filter(lote => lote.IdLot == this.TestSeleccionados[index].lote);
       if ( datosLotes.length > 0){

        nombre =  this.TestSeleccionados[index].Desanalytes + '|' +  this.TestSeleccionados[index].NameAnalyzer + '|' + this.TestSeleccionados[index].Desunits   + '|' +  this.TestSeleccionados[index].Desreagents  + '|' + this.TestSeleccionados[index].Desmethods
        lote  = datosLotes[0]['Numlot']
        this.DatosSeleccionadosData.push({
          "nombre" : nombre,
          "lote" : lote
        })
       }

     }

    }
  }



   //validators FormularioTest

  get fechaInicioselecciobada() {
    return this.formFecha.get('fechaInicio');
  }
  get fechaFin() {
    return this.formFecha.get('fechaFin');
  }

  async consultaGraficaFecha(){
    if (!this.formFecha.invalid) {
      this.DatosSeleccionadosDatosGrafica = []

      var datosData = [];
      var datosseccion = [];
      var datosMaterial = [];
      let nombre = ''
      let seccion = ''
      let meterialControles = ''


    for (let index = 0; index < this.TestSeleccionados.length; index++) {
     datosData = this.tests.filter(test => test.IdTest == this.TestSeleccionados[index].IdTest);
     datosseccion = this.secciones.filter(seccion => seccion.idsection == this.formFiltro.controls['seccion'].value);
     datosMaterial = this.materiales.filter(material => material.IdControlMaterial == this.formFiltro.controls['material'].value);
     nombre =  this.TestSeleccionados[index].Desanalytes + '|' +  this.TestSeleccionados[index].NameAnalyzer + '|' + this.TestSeleccionados[index].Desunits   + '|' +  this.TestSeleccionados[index].Desreagents  + '|' + this.TestSeleccionados[index].Desmethods
     seccion  = datosseccion[0]['namesection']
     meterialControles  = datosMaterial[0]['Descontmat']
     this.DatosSeleccionadosDatosGrafica.push({
       "nombre" : nombre,
       "seccion" : seccion,
       "meterialControl" : meterialControles,
     })
    }
    //valores test
    let arr:any[] =    this.TestSeleccionados;

          if (this.formFiltro.controls['ingresodatos'].value == 'C'){

        if(arr[0]){
          setTimeout(() => {
          this.GenerararregloConTestCualitativos(arr[0], 0)
        },200)
       }
       if(arr[1]){
        setTimeout(() => {
          this.GenerararregloConTestCualitativos(arr[1], 1)
        },300)
     }
      if(arr[2]){
        setTimeout(() => {
          this.GenerararregloConTestCualitativos(arr[2], 2)
        },700)


      }

      }else if(this.formFiltro.controls['ingresodatos'].value == 'N'){
       //Obtener Valores puntos

       if(arr[0]){
          this.GenerararregloConTestCuantativo(arr[0], 0)
       }
       if(arr[1]){
        setTimeout(() => {
          this.GenerararregloConTestCuantativo(arr[1], 1)
        },330)

     }
      if(arr[2]){
        setTimeout(() => {
          this.GenerararregloConTestCuantativo(arr[2], 2)
        },410)


      }
  }

  }else{
    this.toastr.info(this.translate.instant('MODULES.REPORTESDATOSCUANTITATIVOS.VALORSIN'));
  }
   }
   GenerararregloConTestCualitativos(idTest:any, indice){

    var datosData = [];
    var fecha_inicio = dayjs(this.formFecha.get('fechaInicio').value).format('YYYY-MM-DD');
    var fecha_fin = dayjs(this.formFecha.get('fechaFin').value).format('YYYY-MM-DD');
     let leveltest = 1
     let idheadquaerters =  this.formFiltro.controls['sede'].value
     let idcontrolmaterial = this.formFiltro.controls['material'].value
     let idlot = idTest.lote

     if (idTest.IdTest > 0)
     {

      this.DatosGraficosServices.calcularARxfechas(fecha_inicio, fecha_fin,leveltest,idheadquaerters,idTest.IdAnalyzer,idcontrolmaterial,idlot,idTest.Idanalytes).subscribe((res)=>{
        this.DatosGraficosServices.valoresGraficaCualitativos(fecha_inicio, fecha_fin,leveltest,idheadquaerters,idTest.IdAnalyzer,idcontrolmaterial,idlot,idTest.Idanalytes).subscribe((data)=>{
      
         this.mostrarGraficas = true
         this.loadData('graficas'+indice,data,res, indice)

        },(err)=>{
         this.toastr.info(this.translate.instant(err.error.text));
        })

      },(err)=>{
        this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.NO_DATOS'));
      })
     }
   }



   GenerararregloConTestCuantativo(idTest:any, indice){
 

    var datosData = [];
    var fecha_inicio = dayjs(this.formFecha.get('fechaInicio').value).format('YYYY-MM-DD');
    var fecha_fin = dayjs(this.formFecha.get('fechaFin').value).format('YYYY-MM-DD');
     let leveltest = 1
     let idheadquaerters =  this.formFiltro.controls['sede'].value
     let idcontrolmaterial = this.formFiltro.controls['material'].value
     let idlot =idTest.lote
     datosData = this.tests.filter(test => test.IdTest == idTest);

  if (idTest.IdTest > 0)
  {

    this.DatosGraficosServices.valoresGraficaCuantitativos(fecha_inicio, fecha_fin,leveltest,idheadquaerters,idTest.IdAnalyzer,idcontrolmaterial,idlot,idTest.Idanalytes).subscribe(async (resdata)=>{

      this.DatosGraficosServices.ValoresTestFecha(fecha_inicio, fecha_fin,idTest.IdTest).subscribe( (res:any)=>{
        this.mostrarGraficas = true
        var valores = []
        var labels = []

       for (let i = 0; i < res.length; i++) {
        labels.push(dayjs(res[i].date).format('DD-MM-YYYY'));
        valores.push(Number(res[i].valuelevel1));
        }
        this.dataTestMulti = res
       this.DatosGraficosServices.validUpdateDataTable(idheadquaerters,idTest.IdAnalyzer, idcontrolmaterial, idlot, idTest.Idanalytes,leveltest, idTest.IdTest,res).then((resDatosfecha01:any)=>{
              this.DatosGraficosServices.paramsFechas(idheadquaerters,idTest.IdAnalyzer, idcontrolmaterial, idlot, idTest.Idanalytes,leveltest,idTest.IdTest,fecha_inicio, fecha_fin,idheadquaerters).then((resDatosfecha2:any)=>{
           //Obtener valores dataGeneral
           this.ValoresGraficas = resdata
           this.buildGraph(resdata, 'graficas'+indice, indice, res , labels ,valores );
          });
       });



        },(err:any)=>{
          this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.NO_DATOS'));
        });


      },(err:any)=>{
        //this.habilitarGraficas = false
        this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.NO_DATOS'));
      })

  }
   }


    //build Graph
    buildGraph(datosGraficas:any,nombreComponent:string, indice:number, dataTestMulti:any , labels:any , valores:any) {
      if(this.habilitarGraficas){
        setTimeout(() => {
          var pts  =   dataTestMulti

         var ValoresDiana = []
            var max = 0
            var min = 0
            let val =  this.DatosGraficosServices.desviacionesNvl1
             ValoresDiana = val
              console.log("Diana",ValoresDiana)
            var DEI4 = []
            var DEI3= []
            var DEI2= []
            var DEI1= []
            var DES1= []
            var DES2= []
            var DES3= []
            var DES4= []
            var MEDIA= []
            var DIANA= []
            var LI= []
            var LS= []
            var puntosAR = []
          for (let i = 0; i < labels.length; i++) {

            if (ValoresDiana[0] != undefined){

              DEI4.push(ValoresDiana[0]);
              DEI3.push(ValoresDiana[1]);
              DEI2.push(ValoresDiana[2]);
              DEI1.push(ValoresDiana[3]);
              DES1.push(ValoresDiana[4]);
              DES2.push(ValoresDiana[5]);
              DES3.push(ValoresDiana[6]);
              DES4.push(ValoresDiana[7]);
              MEDIA.push(ValoresDiana[8]);
                // validar minimos y maximos
            }else{
              DEI4.push(datosGraficas.desvEstandarinf4);
              DEI3.push(datosGraficas.desvEstandarinf3);
              DEI2.push(datosGraficas.desvEstandarinf2);
              DEI1.push(datosGraficas.desvEstandarinf1);
              DES1.push(datosGraficas.desvEstandarsup1);
              DES2.push(datosGraficas.desvEstandarsup2);
              DES3.push(datosGraficas.desvEstandarsup3);
              DES4.push(datosGraficas.desvEstandarsup4);
              MEDIA.push(datosGraficas.media);
            }
            if (ValoresDiana[11] !=null && ValoresDiana[11] != 0){
              DIANA.push(ValoresDiana[11]);

            }else{
              DIANA.push(0)
            }

            if (ValoresDiana[9] !=null && ValoresDiana[11] != 0){
              LI.push(ValoresDiana[9]);


            }else{
              LI.push(0);
            }

            if (ValoresDiana[10] !=null && ValoresDiana[11] != 0){
              LS.push(ValoresDiana[10]);

            }else{
              LS.push(0);
            }

            var color: string = '';
           pts[i].valuelevel1 == 'R' ? color = 'red' : pts[i].valuelevel1 == 'I' ? color = '#FAB005' : color = '#4141FC';
            const objeto = {
              value: Number(pts[i].valuelevel1),
              itemStyle: {
                color: color
              }
            }
            puntosAR.push(objeto);

          }

          if (ValoresDiana[0] != undefined ||  ValoresDiana[9] != undefined){

            var validMin:any = [Math.min.apply(null, valores), ValoresDiana[0], ValoresDiana[9]];
            if(ValoresDiana[9] == 0){
              validMin = [Math.min.apply(null, valores), ValoresDiana[0], ValoresDiana[7]];
            }
            min = Math.min.apply(null, validMin);
          }else{

            var validMin:any = [Math.min.apply(null, valores), datosGraficas.desvEstandarinf4, datosGraficas.media];
            if(datosGraficas.media == 0){
              validMin = [Math.min.apply(null, valores), datosGraficas.desvEstandarinf4,datosGraficas.desvEstandarsup4];
            }
           min = Math.min.apply(null, validMin) ;
          }
          console.log('MIN lvl 1: ',min);


          if (ValoresDiana[7] != undefined || ValoresDiana[10] != undefined){
            var validMax:any = [Math.max.apply(null, valores), ValoresDiana[7], ValoresDiana[10]];
            max = Math.max.apply(null, validMax);
          }else{
            var validMax:any = [Math.max.apply(null, valores), datosGraficas.desvEstandarsup4, datosGraficas.media];
            max = Math.max.apply(null, (validMax)) ;
          }
          console.log('max  lvl 1: ',max);
          var _wChart = 1000;
          var _px = 72;
          var _endLabelOffset = [0, 0];
          var  _align = 'right';
          const _parent =  document.getElementById('error'+indice).parentElement;
          const _boxChart = _parent.parentElement; // contenedor de la grafica
          if (_boxChart.clientWidth <= 1366) {
            document.getElementById('error'+ indice).style.width = `${_boxChart.clientWidth}px`;
            //document.getElementById('error-1').style.overflowX = 'scroll';
            _wChart = _boxChart.clientWidth * 0.99;

          }
          if (_boxChart.clientWidth <= 300) {
            _px = _px * 0.27;
            _endLabelOffset = [-10, 0];
          }
          if (_boxChart.clientWidth > 300 && _boxChart.clientWidth <= 576) {
            _px = _px * 0.6;
            _endLabelOffset = [-10, 0];
          }
          if (_boxChart.clientWidth > 576 && _boxChart.clientWidth <= 776 ) {
            _px = _px * 0.79;
            _endLabelOffset = [-4, 0];
            _align = 'left';
          }
          if (_boxChart.clientWidth > 776 && _boxChart.clientWidth <= 1000) {
            _px = _px * 1.05;
            _endLabelOffset = [0, 0];
            _align = 'left';
          }
          if(_wChart > 1000){
            _px = _px * 1.3;
            _wChart = 1000;
          }
           this.GraficaCompleta(nombreComponent,_px,_wChart , _align, _endLabelOffset, labels, DES4, DES3, DES2 , DES1 , MEDIA , DIANA, LS, LI,DEI1,DEI2 , DEI3, DEI4 , valores , puntosAR, min,
            max,pts)

        },180)

      }
    }
    //Grafica cuantitativa
    GraficaCompleta(nombreComponent,_px , _wChart , _align , _endLabelOffset , labels , DES4 , DES3,DES2 ,DES1 , MEDIA, DIANA, LS, LI,DEI1,DEI2 , DEI3, DEI4 , valores , puntosAR, min, max ,pts){
      var myChart;
      var datos = pts;
      Object.defineProperty(document.getElementById(nombreComponent), 'clientWidth', { get: function () { return  1000 } });
      Object.defineProperty(document.getElementById(nombreComponent), 'clientHeight', { get: function () { return  500 } });
      myChart = echarts.init(document.getElementById(nombreComponent));
          // validar minimos y maximos
          var functLabel: Function = ( label: any, px: number ) => {

            const regex = /[EISei]/i;

            if (label.data % 1 == 0) {

              if(label.seriesName == 'Diana'){
                return  'D: ' + label.data;
              }
              if(px < 72 && label.seriesName != 'LS' && label.seriesName != 'LI'){
                return  label.seriesName.replace(regex, '') +': ' + label.data;
              }
              return label.seriesName + ': ' + label.data;
            } else {
              var decimales = label.data.toString();
              var cortar = decimales.substr(decimales.indexOf('.') + 1);
              if (cortar.length > 1) {
                if(label.seriesName == 'Diana'){
                  return  'D: ' + label.data.toFixed(2);
                }
                if(px < 72 && label.seriesName != 'LS' && label.seriesName != 'LI'){
                  return  label.seriesName.replace(regex, '') +': ' + label.data;
                }
                return label.seriesName + ': ' + label.data.toFixed(2);
              } else {
                if(label.seriesName == 'Diana'){
                  return  'D: ' + label.data.toFixed(1);
                }
                if(px < 72 && label.seriesName != 'LS' && label.seriesName != 'LI'){
                  return  label.seriesName.replace(regex, '') +': ' + label.data;
                }
                return label.seriesName + ': ' + label.data.toFixed(1);
              }
            }
          }
          myChart.setOption({
            dataZoom: [
              {
                show: false,
                throttle: 5,
                moveOnMouseWheel: true,
                type: 'inside',
                start: 0,
                end: 100,
                top: 80
              },
              {
                start: 0,
                end: 10
              },
            ],
            title: {
              //text: _titulo
            },
            tooltip: {
              trigger: 'axis',
              formatter: function (data) {
                var filtro = data.filter(dato => dato.componentSubType == 'scatter');
                var objeto = datos[filtro[0].dataIndex];
                var fecha = dayjs(objeto.date).format('DD-MM-YYYY');
                let colorItem = '';
                let comentarios = '';
                let acciones = '';
                let estado = '';

                comentarios = objeto.comments;
                acciones = objeto.Descorrectiveactions;

                if (objeto.Arlevel1 == 'R') {

                  colorItem = 'red';
                  estado = 'Rechazado';

                } else if (objeto.Arlevel1 == 'I') {

                  colorItem = '#FAB005';
                  estado = 'Alerta';

                } else {

                  colorItem = '#007D00',
                    estado = 'Aceptado'
                }
                return '<b>Resultado:</b> ' + filtro[0].value + '<br>' + '<b>Fecha:</b> ' + fecha + '<br>' + '<b>Estado:</b> ' + `<b style="color: ${colorItem}">${estado}</b>` + '<br>' +  '<b>Comentarios:</b> ' + comentarios;
              }
            },
            silent: true,
            legend: {
              align :'left',
              data: ['LS', 'LI', 'Diana']
            },
            grid: {
              left: '8%',
              right: '8%',
              bottom: '16%',
              containLabel: true,
              show: true,
              borderWidth: 3
            },
            xAxis: [
              {
                type: 'category',
                boundaryGap: false,
                data: labels,
                axisLabel: {
                  fontWeight: 'bold'
                }
              }
            ],
            yAxis: [
              {
                type: 'value',
                min: min,
                max: max,
                show: false,
              }
            ],
            series: [ //-------Series----------
              {
                name: 'DES4',
                type: 'line',
                data:  DES4,
                showSymbol: true,
                symbolSize: 0,
                areaStyle: { // difuminado del background
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 0.4, [{
                          offset: 0,
                          color: 'rgba(177,177,177,0.3)'
                      },
                      {
                          offset: 1,
                          color: 'rgba(177,177,177,0)'
                      }
                  ], false),
                  shadowColor: 'rgba(177,177,177, 0.9)',
                  shadowBlur: 20
                },
                lineStyle: {
                  color: 'red',
                  width: 2,
                },
                itemStyle: {
                  borderWidth: 2,
                  borderColor: 'red',
                  color: 'red'
                },
                label: {
                  show: false,
                  formatter: function (label) {
                    return functLabel(label, _px);
                  }
                },
                endLabel: {
                  distance: ( _wChart- _px) * -1, // Posicion Label,
                  show: true,
                  color: 'red',
                  fontWeight: 'bold',
                }
              },
              {
                name: 'DES3',
                type: 'line',
                data: DES3,
                showSymbol: true,
                symbolSize: 0,
                lineStyle: {
                  color: 'orange',
                  width: 2,
                },
                itemStyle: {
                  borderWidth: 2,
                  borderColor: 'orange',
                  color: 'orange'
                },
                label: {
                  show: false,
                  formatter: function (label) {

                    return functLabel(label, _px);

                  }
                },
                endLabel: {
                  distance: ( _wChart- _px) * -1, // Posicion Label,
                  show: true,
                  color: 'orange',
                  fontWeight: 'bold',
                }
              },
              {
                name: 'DES2',
                type: 'line',
                data: DES2,
                showSymbol: true,
                symbolSize: 0,
                lineStyle: {
                  color: '#F3E827',
                  width: 2,
                },
                itemStyle: {
                  borderWidth: 2,
                  borderColor: '#F3E827',
                  color: '#F3E827'
                },
                label: {
                  show: false,
                  formatter: function (label) {
                    return functLabel(label, _px);
                  }
                },
                endLabel: {
                  distance: ( _wChart- _px) * -1, // Posicion Label,
                  show: true,
                  color: '#F3E827',
                  fontWeight: 'bold',
                }
              },
              {
                name: 'DES1',
                type: 'line',
                // areaStyle: {
                //   opacity: 1,
                //   color: '#FFFFFF'

                // },
                data: DES1,
                showSymbol: true,
                symbolSize: 0,
                lineStyle: {
                  color: 'green',
                  width: 2,
                },
                itemStyle: {
                  borderWidth: 2,
                  borderColor: 'green',
                  color: 'green'
                },
                label: {
                  show: false,
                  formatter: function (label) {
                    return functLabel(label, _px);
                  }
                },
                endLabel: {
                  distance: ( _wChart- _px) * -1, // Posicion Label,
                  show: true,
                  color: 'green',
                  fontWeight: 'bold',
                }
              },
              {
                name: 'Media',
                type: 'line',
                data: MEDIA,
                showSymbol: false,
                symbolSize: 0,
                lineStyle: {
                  color: 'black',
                  width: 2
                },
                itemStyle: {
                  borderWidth: 2,
                  borderColor: 'black',
                  color: 'black'
                },
                label: {
                  show: false,
                  formatter: function (label) {
                    return functLabel(label, _px);
                  }
                },
                endLabel: {
                  distance: ( _wChart- _px) * -1, // Posicion Label,
                  show: true,
                  color: 'black',
                  fontWeight: 'bold',
                }
              },
              {
                name: 'Diana',
                type: 'line',
                data: DIANA,
                showSymbol: false,
                lineStyle: {
                  color: '#FF8181',
                  width: 2
                },
                itemStyle: {
                  borderWidth: 2,
                  borderColor: '#FF8181',
                  color: '#FF8181'
                },
                endLabel: {
                  show: true,
                  align: _align,
                  borderType: 'solid',
                  borderWidth: 0.5,
                  borderColor: 'rgba(255,255,255,1)',
                  backgroundColor: 'rgba(255,255,255, 0.8)',
                  // shadowColor: 'rgba(0,0,0, 0.3)',
                  // shadowOffsetX: 0,
                  // shadowOffsetY: 2,
                  // shadowBlur:8,
                  // padding: 2,
                  offset:_endLabelOffset,
                  color: '#FF8181',
                  fontWeight: 'bold',
                  fontSize: 10,
                  formatter: function (label) {
                    return functLabel(label, _px);
                  }
                }
              },
              {
                name: 'LS',
                type: 'line',
                data: LS,
                showSymbol: false,
                lineStyle: {
                  color: '#4141FC',
                  width: 2
                },
                itemStyle: {
                  borderWidth: 2,
                  borderColor: '#4141FC',
                  color: '#4141FC'
                },
                endLabel: {
                  show: true,
                  align: _align,
                  borderType: 'solid',
                  borderWidth: 0.5,
                  borderColor: 'rgba(255,255,255,1)',
                  backgroundColor: 'rgba(255,255,255, 0.8)',
                  // shadowColor: 'rgba(0,0,0, 0.3)',
                  // shadowOffsetX: 0,
                  // shadowOffsetY: 2,
                  // shadowBlur:8,
                  // padding: 2,
                  offset:_endLabelOffset,
                  color: '#4141FC',
                  fontWeight: 'bold',
                  fontSize: 10,
                  formatter: function (label) {

                    return functLabel(label, _px);

                  }
                }
              },
              {
                name: 'LI',
                type: 'line',
                data: LI,
                showSymbol: false,
                lineStyle: {
                  color: '#4141FC',
                  width: 2
                },
                itemStyle: {
                  borderWidth: 2,
                  borderColor: '#4141FC',
                  color: '#4141FC'
                },
                endLabel: {
                  show: true,
                  align: _align,
                  borderType: 'solid',
                  borderWidth: 0.5,
                  borderColor: 'rgba(255,255,255,1)',
                  backgroundColor: 'rgba(255,255,255, 0.8)',
                  // shadowColor: 'rgba(0,0,0, 0.3)',
                  // shadowOffsetX: 0,
                  // shadowOffsetY: 2,
                  // shadowBlur:8,
                  // padding: 2,
                  offset:_endLabelOffset,
                  color: '#4141FC',
                  fontWeight: 'bold',
                  fontSize: 10,
                  formatter: function (label) {

                    return functLabel(label, _px);

                  }
                }
              },
              {
                name: 'DEI1',
                type: 'line',
                data: DEI1,
                showSymbol: false,
                lineStyle: {
                  color: 'green',
                  width: 2,
                },
                itemStyle: {
                  borderWidth: 2,
                  borderColor: 'green',
                  color: 'green'
                },
                label: {
                  show: false,
                  formatter: function (label) {

                    return functLabel(label, _px);

                  }
                },
                endLabel: {
                  distance: ( _wChart- _px) * -1, // Posicion Label,
                  show: true,
                  color: 'green',
                  fontWeight: 'bold',
                }
              },
              {
                name: 'DEI2',
                type: 'line',
                data: DEI2,
                showSymbol: false,
                lineStyle: {
                  color: '#F3E827',
                  width: 2,
                },
                itemStyle: {
                  borderWidth: 2,
                  borderColor: '#F3E827',
                  color: '#F3E827'
                },
                label: {
                  show: false,
                  formatter: function (label) {

                    return functLabel(label, _px);

                  }
                },
                endLabel: {
                  distance: ( _wChart- _px) * -1, // Posicion Label,
                  show: true,
                  color: '#F3E827',
                  fontWeight: 'bold',
                }
              },
              {
                name: 'DEI3',
                type: 'line',
                data: DEI3,
                showSymbol: false,
                lineStyle: {
                  color: 'orange',
                  width: 2,
                },
                itemStyle: {
                  borderWidth: 2,
                  borderColor: 'orange',
                  color: 'orange'
                },
                label: {
                  show: false,
                  formatter: function (label) {

                    return functLabel(label, _px);

                  }
                },
                endLabel: {
                  distance: ( _wChart- _px) * -1, // Posicion Label,
                  show: true,
                  color: 'orange',
                  fontWeight: 'bold',
                }
              },
              {
                name: 'DEI4',
                type: 'line',
                data: DEI4,
                showSymbol: false,
                areaStyle: { // difuminado del background

                  color: new echarts.graphic.LinearGradient(0, 0.6, 0, 0, [{
                          offset: 0,
                          color: 'rgba(177,177,177,0.3)'
                      },
                      {
                          offset: 1,
                          color: 'rgba(177,177,177,0)'
                      }
                  ], false),
                  shadowColor: 'rgba(177,177,177, 0.9)',
                  shadowBlur: 20

                },
                lineStyle: {
                  color: 'red',
                  width: 2,

                },
                itemStyle: {
                  borderWidth: 2,
                  borderColor: 'red',
                  color: 'red'
                },
                label: {
                  show: false,
                  formatter: function (label) {

                    return functLabel(label, _px);

                  }
                },
                endLabel: {
                  distance: ( _wChart- _px) * -1, // Posicion Label,
                  show: true,
                  color: 'red',
                  fontWeight: 'bold',
                }
              },
              {
                name: 'Resultado',
                type: 'line',
                data: valores,
                showSymbol: true,
                symbol: 'square',
                symbolSize: 7,
                lineStyle: {
                  color: '#4141FC',
                  width: 2.5
                },
                itemStyle: {
                  borderWidth: 2,
                  borderColor: '#4141FC',
                  color: '#A0A0FF'
                },
                label: {
                  show: false,
                  position: 'top',
                  fontWeight: 'bold',
                  color: '#6F4B8B'
                }
              },
              {
                type: 'scatter',
                name: 'hola',
                symbol: 'rect',
                symbolSize: 10,
                zlevel: 1,
                data: puntosAR
              }

            ]

          });
    }
  //Grafica cualitativa

    loadData(indice,ptsDatos,referenciaDatos,i) {

      setTimeout(() => {
  console.log("Datos",ptsDatos)

        var puntos = [];
        var puntosAR = [];
        var arsRef = referenciaDatos;
        var labels = [];
        var ptsDos = ptsDatos;
        console.log("PuntosAR",referenciaDatos)

      for (let i = 0; i < ptsDatos.length; i++) {

        puntos.push(Number(ptsDatos[i].ordergraph));
        labels.push(dayjs(ptsDatos[i].Fecha).format('DD-MM-YYYY'));

        var color: string = '';
        var referencia = referenciaDatos.find(dato => dato.Idresultqualitative == parseInt(ptsDatos[i].idresultqualitative));
        referencia.AR == 'R' ? color = 'red' : color = '#A5D2A5';

        const objeto = {
          value: Number(ptsDatos[i].ordergraph),
          itemStyle: {
            color: color
          }

        }
        puntosAR.push(objeto);

      }

      const _parent =  document.getElementById('error'+i).parentElement;

       const _boxChart = _parent.parentElement; // contenedor de la grafica
      if (_boxChart.clientWidth <= 1366) {
        document.getElementById('error'+ i).style.width = `${_boxChart.clientWidth}px`;
        //document.getElementById('error-1').style.overflowX = 'scroll';
      }
        console.log("PuntosAR",document.getElementById(indice))
        Object.defineProperty(document.getElementById(indice), 'clientWidth', { get: function () { return 1000 } });
        Object.defineProperty(document.getElementById(indice), 'clientHeight', { get: function () { return 400 } });
        document.getElementById(indice).style.marginTop = '40px';
        var myChart = echarts.init(document.getElementById(indice));

        myChart.setOption({

          dataZoom: [
            {
              show: false,
              throttle: 5,
              moveOnMouseWheel: true,
              type: 'inside',
              start: 0,
              end: 100,
              top: 80
            },
            {
              start: 0,
              end: 10
            }
          ],
          title: {
            text: '',
            left: 'center'
          },
          tooltip: {
            trigger: 'axis',
            formatter: function (data) {

              let colorItem = '';
              let comentarios = '';
              let acciones = '';
              let estado = '';
              var referencia = arsRef[data[1].dataIndex];
             var ptsDos_valor = ptsDos.filter(dato => dato.idresultqualitative == referencia.Idresultqualitative )

              var fecha = dayjs(referencia.Fecha).format('DD-MM-YYYY');

              referencia.Comments != '' && referencia.Comments != null ? comentarios = referencia.Comments : comentarios = 'N/R';
              referencia.Descorrectiveactions != '' && referencia.Descorrectiveactions != null ? acciones = referencia.Descorrectiveactions : acciones = 'N/R';

              if (referencia.Arlevel1 == 'R') {

                colorItem = 'red';
                estado = 'Rechazado';

              } else {

                colorItem = '#007D00',
                  estado = 'Aceptado'
              }
              return '<b>Resultado:</b> ' + ptsDos_valor[0].Result + '<br>' + '<b>Fecha:</b> ' + fecha + '<br>' + '<b>Estado:</b> ' + `<b style="color: ${colorItem}">${estado}</b>` + '<br>' + '<b>Acción correctiva:</b> ' + acciones + '<br>' + '<b>Comentarios:</b> ' + comentarios;

            }

          },
          grid: {
            bottom: '16%',
            containLabel: true,
          },
          silent: true,
          xAxis: {
            type: 'category',
            data: labels,
            axisLabel: {
              fontWeight: 'bold'
            }
          },
          yAxis: {
            type: 'value',
            show: true,
            axisLabel: {
              fontWeight: 'bold',
              formatter: function (params) {

                for (let i = 0; i < ptsDos.length; i++) {

                  if (params == ptsDos[i].ordergraph) {

                    return ptsDos[i].Result.toLowerCase();

                  }

                }

              }
            }
          },
          series: [
            {
              data: puntos,
              type: 'line',
              showSymbol: true,
              symbol: 'square',
              symbolSize: 10,
              lineStyle: {
                color: 'green',
                width: 2.5
              },
              itemStyle: {
                borderWidth: 2,
                borderColor: '#007D00',
                color: '#A5D2A5'
              }
            },
            {
              type: 'scatter',
              name: 'hola',
              symbol: 'rect',
              symbolSize: 10,
              zlevel: 1,
              data: puntosAR
            }
          ]

        });
      },400)

    }


    }






