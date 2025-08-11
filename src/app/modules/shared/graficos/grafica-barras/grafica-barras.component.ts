import { Component, ElementRef, Input,OnChanges, OnInit, ViewChild, AfterViewInit, Output, EventEmitter, SimpleChanges } from '@angular/core';
import * as echarts from 'echarts';

@Component({
    selector: 'app-grafica-barras',
    templateUrl: './grafica-barras.component.html',
    styleUrls: ['./grafica-barras.component.css'],
    standalone: true
})
export class GraficaBarrasComponent implements OnInit,AfterViewInit,OnChanges {

  @ViewChild('myChartEvaluacion2') myChartLineas: ElementRef;
  @Output() base64Barras:EventEmitter<string>= new EventEmitter();
  @Input() tipoGrafica:number=1;
  @Input() titulo:string='';
  @Input() idB:string='';
  @Input() analito:any='';
  @Input() data:any[]=[];
  @Input() multiple:boolean=true;
  // Tipo de grafica 2
  @Input() xAxis:string[]=[];
  @Input() legend:any;
  @Input() widthGraficaPx :string ='800px';
  @Input() heightGraficaPx:string='220px';
  // ReporteCuantitativo
  @Input() constantes:number=1;


  myChart:any;
     // Nueva propiedad para la tabla de desempeño por año
  tablaDesempenoPorAnio: any[] = [];


  constructor() { }
  ngAfterViewInit(): void {
    // this.crearGrafica();
  }
  
  ngOnChanges(changes: SimpleChanges){
    setTimeout( async() => {
      switch (this.tipoGrafica) {
        case 1:
          await this.crearGrafica();
          break;
        case 2:
          await this.crearGraficaTipo2();
          break;
        case 3:
          await this.crearGrafica3();
          break;
        case 4:
          await this.crearGraficaReporteCuantitativo();
          break;

        default:
          break;
      }
    }, 1000);
  }

  ngOnInit(): void {
  }

  async crearGrafica(){
    let xAxix=['ID>1','ID<1','Total'];
    let dataBarra  = [...this.data];
    if(!this.multiple){
      let iterar = [...this.data.map((x)=> x.lineas.barra)];
      let newData=[];
      iterar.map((y:any,index:number) =>{
        if(index === 0) {
          newData = y;
        }else{
          y.map((x,i) =>{
            newData[i].value=((parseInt(newData[i].value))+(parseInt(x.value)))
          })
        }
      })
      dataBarra= [...newData];
    }
    this.myChart = echarts.init(document.getElementById(this.idB));
    const option = {
      title:{
        text:'Fin de ciclo',
        left: 'center'
      },
      xAxis: {
        type: 'category',
        data: xAxix
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          data: dataBarra,
          type: 'bar',
          showBackground: true,
        }
      ]
    };
    this.myChart.setOption(option);
    await new Promise((res,e)=>{
      this.myChart.on('rendered',() =>{
        res(this.base64Barras.emit(this.myChart.getDataURL()))
      });

    })
  }
  
  // async crearGraficaTipo2(){
  //   this.myChart = echarts.init(document.getElementById(this.idB));
  //   const option = {
  //     title:{
  //       text: `${this.titulo} ${this.analito}`,
  //       left: 'center',
  //       textStyle: {
  //         fontSize: 16
  //       }
  //     },
  //     legend: {
  //       data: this.legend,
  //       top:'8%'
  //     },
  //     grid: {
  //       top: 'center',
  //       height: 150,
  //     },
  //     xAxis: {
  //       type: 'category',
  //       data: this.xAxis
  //     },
  //     yAxis: {
  //       type: 'value'
  //     },
  //     series: this.data
  //   };
  //   this.myChart.setOption(option);
  //   await new Promise((res,e)=>{
  //     this.myChart.on('rendered',() =>{
  //       res(this.base64Barras.emit(this.myChart.getDataURL()))
  //     });

  //   })
  // }


/**
 * metodo para crear la gráfica tipo 2
 */
async crearGraficaTipo2() {
  this.myChart = echarts.init(document.getElementById(this.idB));

  const seriesSinLabels = this.data.map(serie => ({
    ...serie,
    label: {
      show: false
    },
    type: 'bar'  // Asegúrate que el tipo esté definido para que se muestre bien
  }));

  const option = {
    title: {
      text: `${this.titulo} ${this.analito}`,
      left: 'center',
      textStyle: {
        fontSize: 16
      }
    },
    tooltip: {
      trigger: 'item',
      triggerOn: 'mousemove',
      formatter: function (params) {
        return `${params.seriesName} <br/> ${params.name} : ${params.value}`;
      }
    },
    legend: {
      data: this.legend,
      top: '8%'
    },
    grid: {
      top: 'center',
      height: 150,
    },
    xAxis: {
      type: 'category',
      data: this.xAxis
    },
    yAxis: {
      type: 'value'
    },
    series: seriesSinLabels
  };

  this.myChart.setOption(option);

  await new Promise((res, e) => {
    this.myChart.on('rendered', () => {
      res(this.base64Barras.emit(this.myChart.getDataURL()));
    });
  });
}



  async crearGrafica3(){
    this.myChart = echarts.init(document.getElementById(this.idB));
    const option = {
      title:{
        text:this.titulo,
        left: 'center'
      },
      xAxis: {
        type: 'category',
        data: this.xAxis
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          data: this.data,
          type: 'bar',
          showBackground: true,
        }
      ]
    };
    this.myChart.setOption(option);
    await new Promise((res,e)=>{
      this.myChart.on('rendered',() =>{
        res(this.base64Barras.emit(this.myChart.getDataURL()))
      });

    })
  }

  async crearGraficaReporteCuantitativo(){
    this.myChart = echarts.init(document.getElementById(this.idB));
    let data= [...this.data];
    let dataAxis= [...this.xAxis];

    data.shift();
    dataAxis.shift();
    const option ={
      title: {
        text:  `${this.titulo} ${this.analito}`,
        left: 'center',
      },
      tooltip: {},
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        splitLine: { show: false },
        data: dataAxis,
        axisLabel:{
          formatter:''
        }
      },
      yAxis: {
        type: 'value',
        max:3,
        min:-3
      },
      series: [
        {
          type: 'bar',
          stack: 'Total',
          label: {
            show: true,
            position: 'top',
          },
          data:data,
          markLine: {
            data: [
              { name: '',yAxis: this.constantes },
              { name: '',yAxis: -this.constantes }
            ], //{ name: '',yAxis: -500 }
            lineStyle: {
              type: "solid",
              color: "rgba(213, 4, 4, 1)"
            },
            label:{show:false},
            tooltip: {show:false},
          }
        }
      ]
    }
    this.myChart.setOption(option);
    await new Promise((res,e)=>{
      this.myChart.on('rendered',() =>{
        res(this.base64Barras.emit(this.myChart.getDataURL()))
      });

    })
  }

  getTablaDesempenoPorAnio() {
  const tabla = [];
  const concordante = this.data.find(s => s.name === 'Concordante');
  const noConcordante = this.data.find(s => s.name === 'No Concordante');

  if (!concordante || !noConcordante) return [];

  this.xAxis.forEach((anio, index) => {
    tabla.push({
      fecha: anio,
      concordante: concordante.data[index],
      noConcordante: noConcordante.data[index]
    });
  });

  console.log('Tabla desempeño por año:', tabla);
  return tabla;
}


}