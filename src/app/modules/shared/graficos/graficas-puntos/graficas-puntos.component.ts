import { AfterViewInit, Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { LoaderService } from '@app/services/loader/loader.service';
import { Chart, Tooltip } from 'chart.js';
import * as echarts from 'echarts';

@Component({
  selector: 'app-graficas-puntos',
  standalone: true,
  imports: [],
  templateUrl: './graficas-puntos.component.html',
  styleUrl: './graficas-puntos.component.css'
})
export class GraficasPuntosComponent implements OnInit,AfterViewInit {
  
  @Output() base64Puntos:EventEmitter<string>= new EventEmitter();
  @Input() data:any[]=[];
  @Input() titulo:string='Prueba';
  @Input() subTitulo:any='Text';
  @Input() labelEjeX:string='text';
  @Input() alto:string='350px';
  @Input() id:string='text';
  @Input() analito:number=0;
  @Input() equipo:number=0;
  @Input() muestra:number=0;
  @Input() ejex: number=0;

  loader = inject(LoaderService);
  
  myChart:any;

  ngOnChanges(changes: SimpleChanges){   
    setTimeout(() => {      
      this.crearGrafica1(1);
    }, 1000); 
  }
  
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.crearGrafica1();
    }, 1000); 
  }

  ngOnInit(): void {
    // this.crearGrafica1();
  }
   
  async crearGrafica1(num:number=0){

    const _parent = document.getElementById('puntosChart' + this.id).parentElement;
    const _boxChart = _parent.parentElement;
    const _wChart = _boxChart.clientWidth * 0.99;

    if (num === 0) Object.defineProperty(document.getElementById('puntosChart' + this.id), 'clientWidth', { get: function () { return _wChart } });
    
    this.subTitulo?.value ?this.subTitulo = this.subTitulo.value : this.subTitulo=this.subTitulo;

    this.data = this.data.filter(x=>x.idAnalytes === this.analito && x.idAnalyzer == this.equipo);

    let type = "";
    let arregloEjey = [];
    if (this.labelEjeX === 'Concentración'){
      this.data.forEach(element => {
        if (element.Zscore <= 3 && element.Zscore >= -3) {
          arregloEjey.push([element.Resultado,element.Zscore])
        }  
        
      });
      type = "scatter";
    }else{
      this.data.forEach(element => {
        if (element.Zscore <= 3 && element.Zscore >= -3) {
          arregloEjey.push([element.ValueEjex,element.Zscore])
        }
      }); 
      type = "line";
    }

    this.myChart = echarts.init(document.getElementById('puntosChart'+this.id));

    if(this.labelEjeX === 'Concentración'){
      const option={
        title: {
          text: this.titulo,
          subtext:this.subTitulo,
          left: 'center',
          subtextStyle:{
            color:'blue'
          }
        },
        tooltip: {
          trigger: 'axis',
        },
        legend: {
          show:false
        },
        xAxis: {
          type: 'value',
          boundaryGap: false,
          name:this.labelEjeX,
          max:function (value) {
            return value.max;
          },
          nameLocation:'center',
          nameTextStyle: {
            padding: [8, 8, 8, 8],
            color:'blue'
          }
        },
        yAxis: {
          type: 'value',
          max:3,
          min:-3
        },
        series: {
          type: type,
          data: arregloEjey,
          symbol:"circle",
          symbolSize:10,
          lineStyle: {
            color: 'black',
            type:'solid'
          },
          itemStyle: {
            color: function (params) {
              let yValue = params.value[1]; 
              
              if (yValue > -2 && yValue < 2) {
                return 'green'; 
              } else if ((yValue >= 2 && yValue <= 3) || (yValue <= -2 && yValue >= -3)) {
                return 'yellow'; 
              } else if (yValue > 3 || yValue < -3) {
                return 'red'; 
              }
            }
          },
          markLine: {
            symbol:['none','none'],
            data: [
              {
                name: "Máximo",
                yAxis: 3,
                lineStyle:{
                  color:'red',
                  type:'solid'
                }
              },
              {
                name: "Minimo",
                yAxis: -3,
                lineStyle:{
                  color:'red',
                  type:'solid'
                },
              },
              {
                name: "Máximo",
                yAxis: 2,
                lineStyle:{
                  color:'black',
                  type:'solid'
                }
              },
              {
                name: "Minimo",
                yAxis: -2,
                lineStyle:{
                  color:'black',
                  type:'solid'
                },
              },
              {
                name: "Máximo",
                yAxis: 1,
                lineStyle:{
                  color:'black',
                  type:'solid'
                }
              },
              {
                name: "Minimo",
                yAxis: -1,
                lineStyle:{
                  color:'black',
                  type:'solid'
                },
              },
              {
                name: "Minimo",
                yAxis: 0,
                lineStyle:{
                  color:'black',
                  type:'solid'
                },
              }
            ],
            silent: true
          }
        }
      };
      this.myChart.setOption(option);
    } else {
      const option={
        title: {
          text: this.titulo,
          subtext:this.subTitulo,
          left: 'center',
          subtextStyle:{
            color:'blue'
          }
        },
        tooltip: {
          trigger: 'axis',
        },
        legend: {
          show:false
        },
        xAxis: {
          type: 'value',
          boundaryGap: false,
          name:this.labelEjeX,
          min: 0,
          max: this.data[0].ejex,
          nameLocation:'center',
          nameTextStyle: {
            padding: [8, 8, 8, 8],
            color:'blue'
          }
        },
        yAxis: {
          type: 'value',
          max:3,
          min:-3
        },
        series: {
          type: type,
          data: arregloEjey,
          symbol:"circle",
          symbolSize:10,
          lineStyle: {
            color: 'black',
            type:'solid'
          },
          itemStyle: {
            color: function (params) {
              let yValue = params.value[1]; 
              
              if (yValue > -2 && yValue < 2) {
                return 'green'; 
              } else if ((yValue >= 2 && yValue <= 3) || (yValue <= -2 && yValue >= -3)) {
                return 'yellow'; 
              } else if (yValue > 3 || yValue < -3) {
                return 'red'; 
              }
            }
          },
          markLine: {
            symbol:['none','none'],
            data: [
              {
                name: "Máximo",
                yAxis: 3,
                lineStyle:{
                  color:'red',
                  type:'solid'
                }
              },
              {
                name: "Minimo",
                yAxis: -3,
                lineStyle:{
                  color:'red',
                  type:'solid'
                },
              },
              {
                name: "Máximo",
                yAxis: 2,
                lineStyle:{
                  color:'black',
                  type:'solid'
                }
              },
              {
                name: "Minimo",
                yAxis: -2,
                lineStyle:{
                  color:'black',
                  type:'solid'
                },
              },
              {
                name: "Máximo",
                yAxis: 1,
                lineStyle:{
                  color:'black',
                  type:'solid'
                }
              },
              {
                name: "Minimo",
                yAxis: -1,
                lineStyle:{
                  color:'black',
                  type:'solid'
                },
              },
              {
                name: "Minimo",
                yAxis: 0,
                lineStyle:{
                  color:'black',
                  type:'solid'
                },
              }
            ],
            silent: true
          }
        }
      };
      this.myChart.setOption(option);

    }

    await new Promise((res,e)=>{  
      this.myChart.on('rendered',() =>{
        res(this.base64Puntos.emit(this.myChart.getDataURL()));
      });
    })
  }


}