import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { Chart } from 'chart.js';
import ApexCharts from 'apexcharts';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexLegend,
  ApexYAxis,
  ApexGrid,
  ApexXAxis,
  ApexStroke,
  ApexTitleSubtitle,
  ApexTheme
} from "ng-apexcharts";

import { ProgramasQceService } from '@app/services/configuracion/programas-qce.service';
import { ReportesExternoService } from '@app/services/calidad-externo/reportesExterno.service';
import { LaboratoriosService } from '@app/services/configuracion/laboratorios.service';
import { ImageCdnPipe } from '../../../../../core/pipes/image-cdn.pipe';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgFor, NgIf, NgClass, NgSwitch, NgSwitchCase, NgTemplateOutlet, NgSwitchDefault, LowerCasePipe } from '@angular/common';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

// Interface - referencia para la echarts
export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  dataLabels: ApexDataLabels;
  grid: ApexGrid;
  stroke: ApexStroke;
  title: ApexTitleSubtitle;
  legend: ApexLegend;
  theme: ApexTheme;
  labels: any;
};


@Component({
    selector: 'app-reporte-cliente-cualitativo',
    templateUrl: './reporte-cliente-cualitativo.component.html',
    styleUrls: ['./reporte-cliente-cualitativo.component.css'],
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, MatFormFieldModule, MatSelectModule, MatOptionModule, NgFor, MatTooltipModule, NgIf, NgClass, NgSwitch, NgSwitchCase, NgTemplateOutlet, NgSwitchDefault, LowerCasePipe, TranslateModule, ImageCdnPipe]
})
export class ReporteClienteCualitativoComponent implements OnInit {


  @ViewChild('modalInstrucciones') modalInst: ElementRef;
  @ViewChild('chartsLJ') chartsLJ: ElementRef;
  @ViewChild('scroll') scroll: ElementRef;
  chartOptions: Partial<ChartOptions>;
  canvas: any;
  ctx: any;
  myGraficas_arr = [];
  myGrafica: any;
  maximo = 0;

  dataChart = [];
  colorsChart: string[] = [];

  forma: FormGroup;
  formaRnd: FormGroup;
  programas = [];
  resultados = [];
  muestras = [];
  clientes = [];
  itemSeleccionado = -1;
  mostrarReportes = false;

  rondas =[];
  analitos =[];
  analitoSeleccionado: string;

  aveConcordancia = 0;
  resDesempGlobal = '';

  laboratorio = '';

  dataTableAptitud = [];
  dataPuntuacion = [];

  modal1Info:boolean;
  modal2Info:boolean;
  modal3Info:boolean;
  pageModal: number = 0;


  constructor(
    private fb: FormBuilder,
    private fbRnd: FormBuilder,
    private laboratoriosService: LaboratoriosService,
    private programQceService: ProgramasQceService,
    private reportesExternoService: ReportesExternoService,
    private toastr: ToastrService,
    private translate: TranslateService,
    public modalService: NgbModal
) {  }

  ngOnInit(): void {

    this.crearFomulario();
    this.consultarProgramas();
    this.getLaboratorioName();


    // this.chartOptions = {
    //   series: [],
    //   chart: {},
    //   dataLabels: {},
    //   stroke: {},
    //   title: {},
    //   grid: {},
    //   xaxis: {}
    // };

  }

  ngAfterViewInit(): void{
    this.open(this.modalInst);
  }



  // --- metodos ---


  crearFomulario() {
    this.forma = this.fb.group({
      programa: ['', [Validators.required]],
    });

    // Fomulario - NO USADO
    this.formaRnd = this.fbRnd.group({
      ronda: ['', [Validators.required]],
    });

    // this.filtrar(); // **NO USADOS

  }

  //-------------
  filtrar() {
    this.forma.get('programa').valueChanges.subscribe(programa => {
      this.rondas = [];
      this.formaRnd.get('ronda').setValue('');

      if (programa != '') {
        this.reportesExternoService.getRondas(programa).subscribe((datos: any) => {
          console.log('Rondas: ', datos);

          this.rondas = datos;
        }, _ => {
          this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.NOHAYRONDAS'));
        });
      }

    });

  }
  //-------------



  consultarProgramas() {

    this.programQceService.getAllAsync().then(resp => {
            //console.log(resp);
            this.programas = resp.filter(datos => datos.active);
    }).catch(err => this.programas = []);
  }

  getLaboratorioName(){

    this.laboratoriosService.getAllAsync().then(resp => {
      //console.log(resp);
      this.laboratorio = resp.name;
    }).catch(err => this.laboratorio = '');
  }


  // ------------------------------------------------
  selectNone(control: string) {
    this.formaRnd.get(control).setValue('');
  }
  selectAll(control: string) {
    this.formaRnd.get(control).setValue(['-1']);
  }

  selectOne(control: string) {
    if (this.formaRnd.get(control).value[0] == '-1' || this.formaRnd.get(control).value[0] == '') {
      this.formaRnd.get(control).value.shift();
      this.formaRnd.get(control).setValue(this.formaRnd.get(control).value);
    }
  }
  // ------------------------------------------------

// Generar reporte
searchReport(){

  this.resultados = [];

  if(this.forma.valid){


    let json = {
      Idprogram: this.forma.value.programa
    }


    // si todo ok

    let clientesArr = [];
    let muestrasArr = [];
    let analitosArr = [];
    let puntArr = [];


    this.reportesExternoService.getReporteClienteCualitativo(json)
                              .subscribe((resp: any) => {

                                console.log(resp);
                                this.resultados = resp.sort((a,b)=>a.idsample-b.idsample);


                                if(this.resultados.length > 0){


                                  this.mostrarReportes = true;

                                  this.resultados.forEach(item => {
                                    muestrasArr.push(item.nrosample);
                                    clientesArr.push(item.nameclient);
                                    analitosArr.push(item.desanalyte);
                                    puntArr.push({
                                      nameclient:item.nameclient,
                                      nrosample:item.nrosample,
                                      anlyte: item.desanalyte
                                    });
                                  });

                                  this.muestras = [...new Set(muestrasArr)]; // unique
                                  this.clientes = [...new Set(clientesArr)]; // unique
                                  this.analitos = [...new Set(analitosArr)]; // unique

                                  // this.dataPuntuacion = puntArr.reduce(
                                  //   (accumulator, current) => {
                                  //     if(!accumulator.some(x => x.nameclient === current.nameclient && x.nrosample === current.nrosample && x.anlyte === current.anlyte)) {
                                  //       accumulator.push(current)
                                  //     }
                                  //     return accumulator;
                                  //   }, []
                                  // )

                                  this.calculosEnsayoAptitud(this.resultados);

                                }


                              }, _ => {
                                this.mostrarReportes = false;
                                this.resultados = [];
                                this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.NOHAYANALITOS'));
                              });

  }
}


 // Calculos con los resultado
 calculosEnsayoAptitud(data: any){

  let num = 0;

  //console.log('Data: ', data);

  data.forEach(item => {

    var x = parseInt(item.concordanciaglobal, 10)
    num = num + x;
    this.aveConcordancia = Math.round(num / data.length);

  });

    this.resDesempGlobal =this.aveConcordancia >= 80? 'Satisfactorio': 'Insatisfactorio';

}


// -------Filtro data por Analito--------------------
buscarAnalitos(_analito: string, btnSecc: any) {

  while (this.myGraficas_arr.length > 0) {
    this.myGraficas_arr[0].destroy();
    this.myGraficas_arr.shift();
  }

  this.aplicarActiveBtn(btnSecc);

  this.analitoSeleccionado = _analito;

  //  --------PENDIENTE VERIFICAR DATA---------------------------
  this.dataTableAptitud = this.resultados.filter(x => x.desanalyte == _analito); // LLena la tabla - APTITUD
  //  let _arr = [];
  //  _arr = this.resultados.filter(x => x.desanalyte == _analito); // LLena la tabla - APTITUD
  //  this.dataTableAptitud = [...new Map(_arr.map(item => [item['nrosample'], item])).values()];


// -----------------------------------------
  this.getDataColorsCharts();

  if(this.itemSeleccionado == -1){
    this.itemSeleccionado = 1;
  }


  this.setItem(this.itemSeleccionado);


  console.log('Data Table: ', this.dataTableAptitud);


 }

//-----------------------------------------

 // metodo para cambiar de activar el Boton
 aplicarActiveBtn(link: any){

  const selectores: any = document.getElementsByClassName('styleAnalito'); // selecciona la clase del elemento HTML

  for (const ref of selectores){
    ref.classList.remove('active');
  }

  link.classList.add('active');


}

getDataColorsCharts() {

  this.dataChart = []; // data for Charts
  this.colorsChart = []; // colors for Charts

  this.muestras.forEach((element, index) =>{

    const _dataC = this.dataTableAptitud.filter(x => x.nrosample == element)
                                   .map(y =>{
                                     return [
                                       parseInt(y.vp, 10),
                                       parseInt(y.vn, 10),
                                       parseInt(y.ind, 10),
                                       parseInt(y.fp, 10),
                                       parseInt(y.fn, 10),
                                      ]
                                    });

    const _dataP = this.dataTableAptitud.filter(x => x.nrosample == element)
                                   .map(y =>{
                                     return [
                                       parseInt(y.devvp, 10),
                                       parseInt(y.devvn, 10),
                                       parseInt(y.devi, 10),
                                       parseInt(y.devfp, 10),
                                       parseInt(y.devfn, 10),
                                      ]
                                    });

    this.dataChart.push({
                          nrosample: element,
                          dataC: _dataC[0],
                          dataP: _dataP[0]
                        });

    const color = this.makeRandomColor();
    this.colorsChart.push(color);

   });

   console.log('DATA-chart - ', this.dataChart);




}


getDataPuntuacion() {

  this.dataChart = []; // data for Charts
  this.colorsChart = []; // colors for Charts

  this.muestras.forEach((element, index) =>{

    const _dataC = this.dataTableAptitud.filter(x => x.nrosample == element)
                                   .map(y =>{
                                     return [
                                       parseInt(y.vp, 10),
                                       parseInt(y.vn, 10),
                                       parseInt(y.ind, 10),
                                       parseInt(y.fp, 10),
                                       parseInt(y.fn, 10),
                                      ]
                                    });

    const _dataP = this.dataTableAptitud.filter(x => x.nrosample == element)
                                   .map(y =>{
                                     return [
                                       parseInt(y.devvp, 10),
                                       parseInt(y.devvn, 10),
                                       parseInt(y.devi, 10),
                                       parseInt(y.devfp, 10),
                                       parseInt(y.devfn, 10),
                                      ]
                                    });

    this.dataChart.push({
                          nrosample: element,
                          dataC: _dataC[0],
                          dataP: _dataP[0]
                        });

    const color = this.makeRandomColor();
    this.colorsChart.push(color);

   });

   console.log('DATA-chart - ', this.dataChart);




}




//-----------------------------------------
// -------------------------------------
setItem(item: number): void {

  this.chartOptions = null;


  if(this.dataTableAptitud.length == 0){
    this.toastr.info('Seleccione un Analito');
    return;
  }

  this.itemSeleccionado = item; // menu btns lateral


  if(item == 2){

    this.muestras.forEach((element, index) =>{
     setTimeout(() => {
        this.graficoBars(element, index, this.dataChart[index].dataC, this.colorsChart[index]);

      }, 300);

    });

  }


  if(item == 3){

    this.muestras.forEach((element, index) =>{
      setTimeout(() => {

         //this.graficoPies(element, index, this.dataChart[index].dataC, this.colorsChart[index]);
         this.graficoApexPies(element, index, this.dataChart[index].dataC, this.colorsChart[index]);

       }, 700);

     });

  }


  if(item == 4){

     console.log(this.dataChart);


    // this.muestras.forEach((element, index) =>{
      setTimeout(() => {


         this.graficoLeveyJennings();

       }, 300);

    //

  }

}


//--------------GRAFICAS--------------------------------------
// --------Chart.js---------
graficoBars(chartTitle: string, index: number, data: number[], color: string){

  console.log('DATA BAR CHART.js-> ', data);


  this.maximo = this.clientes.length;

  //const color = this.makeRandomColor();

  //this.canvas = this.mychart.nativeElement;
  this.canvas = document.getElementById('myChartBars-'+ index);

  this.ctx= this.canvas.getContext('2d');

  //if(this.myGrafica){  this.myGrafica.destroy(); }

  this.myGrafica = new Chart(this.ctx, {
                                          type: 'bar',
                                          data: {
                                              datasets: [

                                                {
                                                  //label: 'Participantes',
                                                  data: data, // TODO: *** data
                                                  backgroundColor: color,//"#007bff",
                                                  borderColor: color, //"#007bff",
                                                  barThickness: 8,  // number (pixels) or 'flex'
                                                  maxBarThickness: 10 // number (pixels)

                                              },

                                             ],
                                              labels: ['VP','VN', 'I', 'FP', 'FN'] // TODO: *** eje x

                                          },
                                          options: {
                                            //responsive: false,
                                            plugins:{
                                              title: { // titulo general
                                                display: true,
                                                text: chartTitle
                                            },
                                              legend: {
                                                display: false,

                                                      },
                                                   },
                                              scales: {
                                                legend: {
                                                  display: false
                                               },
                                                x: {
                                                 stacked: true,
                                                 beginAtZero: true,
                                                 offset: true,
                                                 grid: {
                                                 display: false,
                                                 // color: '#000000'
                                                 },
                                                //  title: {       //---  title Eje x ---
                                                //   display: true,
                                                //   text: `Concentraciones` ,
                                                // },
                                                 ticks: {
                                                  color: (context) => {
                                                    let numero =context.tick.label;
                                                    let n =Number(numero);
                                                    // if (n === this.mediaListaTodosResultados) {
                                                    //   return '#007bff';
                                                    // }
                                                    return '#2A2A2A';
                                                  }
                                               }
                                                },
                                                /*x2: {
                                                  labels: this.valoresTodosResultadosEjex,
                                                  offset: true,
                                                  ticks: {
                                                    color: (context) => {
                                                      let numero =context.tick.label;
                                                      let n =Number(numero);
                                                      if (n === this.mediaListaTodosResultados) {
                                                        return '#E8BC5B';
                                                      } else {
                                                        return '#000000';
                                                      }
                                                    }
                                                 }
                                                },*/
                                                y: {
                                                 stacked: true,
                                                  max: this.maximo,
                                                   grid: {
                                                    // drawBorder: true,
                                                   },
                                                  //  title: {   //---  title Eje y ---
                                                  //   display: true,
                                                  //   text: `Participantes (${this.maximo})` ,
                                                  // }
                                                }
                                              }
                                          }
                                      }
                                      );



this.myGraficas_arr.push(this.myGrafica);



}


graficoPies(chartTitle: string, index: number, data: number[], color: string){

  console.log('DATA PIE CHART.js -> ', data);


  this.maximo = this.clientes.length;

  // const color = this.makeRandomColor();

  //this.canvas = this.mychart.nativeElement;
  this.canvas = document.getElementById('myChartPies-'+ index);

  this.ctx= this.canvas.getContext('2d');

  //if(this.myGrafica){  this.myGrafica.destroy(); }

  this.myGrafica = new Chart(this.ctx, {

    type: 'pie',
    data: {
        datasets: [

          {
            //label: 'Participantes',
            data: data, // TODO: *** data
            backgroundColor: ["#3e95cd", "#8e5ea2","#3cba9f","#e8c3b9"],//"#007bff",
            borderColor: "#FFFDFD",

        },

       ],
        labels: ['VP','VN', 'I', 'FP', 'FN'] // TODO: *** eje x

    },
    options: {
      //responsive: false,
      plugins:{
        title: { // titulo general
          display: true,
          text: chartTitle
      },
     legend: {
          display: true,
          position: 'bottom'

                },
             },



    }
});



this.myGraficas_arr.push(this.myGrafica);



}

// ------ApexChart------------
graficoApexPies(chartTitle: string, index: number, data: any, color: string){

  console.log('DATA APEXCHART PIE -> ', data);

  this.canvas = document.getElementById('myChartPies-'+ index);

  this.chartOptions =  {
                          chart: {
                            width: 350,
                            type: "pie"
                          },
                          title: {
                            text: chartTitle,
                            align: 'center',
                          },
                          series: data,
                          //colors:['#F44336', '#E91E63', '#9C27B0', '#9C27B0'],
                          theme: {
                            monochrome: {
                              enabled: true,
                              color: color, // background
                              shadeTo: 'light',
                              shadeIntensity: 0.93
                            }
                          },
                          labels: ['VP','VN', 'I', 'FP', 'FN'],
                          dataLabels: {
                            enabled: true,
                            //position: "bottom",
                            offsetX: 30,
                            dropShadow: {
                              enabled: true,
                              left: 2,
                              top: 2,
                              opacity: 0.5
                          }

                          },
                          legend: {
                            position: 'bottom',
                            markers: {
                              radius: 0
                            }
                          }
                      }


  this.myGrafica = new ApexCharts(this.canvas,  this.chartOptions);


 // const _chart = new ApexCharts(document.getElementById('myChartPies-'+ index), this.chartOptions);
 this.myGrafica.render().catch( _ => console.log(_) );

this.myGraficas_arr.push(this.myGrafica);



}

//--------Levy Jennings----------
graficoLeveyJennings(){


  this.chartOptions = {
                        series: [
                          {
                            name: "Desktops",
                            data: [-10, 6, 0, 2, 0]
                          }
                        ],
                        chart: {
                          height: 350,
                          type: "line",
                          zoom: {
                            enabled: false
                          }
                        },
                        dataLabels: {
                          enabled: false
                        },
                        stroke: {
                          curve: "straight"
                        },
                        title: {
                          text: "Title",
                          align: "center"
                        },
                        grid: {
                          row: {
                            colors: ["#f3f3f3", "#EE9325", "#EE9325","#f3f3f3","#f3f3f3"], // takes an array which will be repeated on columns
                            opacity: 0.5
                          }
                        },
                        xaxis: {
                          categories: [
                            "1",
                            "2",
                            "3",
                            "4",
                            "5"
                          ]
                        },

                      };


    this.myGrafica = new ApexCharts(this.chartsLJ.nativeElement,  this.chartOptions);
    this.myGrafica.render().catch( _ => console.log(_) );

    this.myGraficas_arr.push(this.myGrafica);



}



// ----------------- Color Aleatorio -----------------------------
makeRandomColor(){
  let c = '';
  while (c.length < 6) {
    c += (Math.random()).toString(16).substr(-6).substr(-1);
  }
  return '#' + c;
}

//------------------------
 scrollCards(flow: number): void {
  this.scroll.nativeElement.scrollLeft += (136.1 * flow);
}


//--------------------------
//  Modal con Instrucciones
//--------------------------
open(modal) {
  this.modalService.open(modal,  { size: 'xl'}); // centered: true
  this.pageModal = 0;
  this.getModalInfo(this.pageModal);
}


getModalInfo(num:number){



  console.log(this.pageModal);

  let n = this.pageModal + num;

  if(n < 0  || n > 2){
    return;
  }


  this.pageModal = this.pageModal + num;

  if(this.pageModal == 0){
    this.modal1Info = false;
    this.modal2Info = true;
    this.modal3Info = true;
  }
  if(this.pageModal == 1){
    this.modal1Info = true;
    this.modal2Info = false;
    this.modal3Info = true;
  }
  if(this.pageModal == 2){
    this.modal1Info = true;
    this.modal2Info = true;
    this.modal3Info = false;
  }




}

}// End class
