import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CuantitativosService } from '../services/cuantitativos.service';
import * as echarts from 'echarts';
import dayjs from 'dayjs';

@Component({
    selector: 'app-youden',
    templateUrl: './youden.component.html',
    styles: [],
    standalone: true
})

export class YoudenComponent implements OnInit {

  @Output('imgGraficaYouden') imgGraficaYouden:EventEmitter<string> = new EventEmitter();

  minimoNvl1: any;
  minimoNvl2: any;

  desvNvl1 = [];
  desvNvl2 = [];
  pointsYP = [];

  constructor(private cuantitativosService: CuantitativosService) {

    this.pointsYP = this.cuantitativosService.puntosprueba;
    this.desvNvl1 = this.cuantitativosService.desviacionesNvl1;
    this.desvNvl2 = this.cuantitativosService.desviacionesNvl2;

  }

  ngOnInit() {

    this.buildGraph();

  }

  buildGraph() {

    var datos = this.pointsYP;

    var cuadroMedio = [

      [this.desvNvl1[2], this.desvNvl2[2]],
      [this.desvNvl1[2], this.desvNvl2[5]],
      [this.desvNvl1[5], this.desvNvl2[5]],
      [this.desvNvl1[5], this.desvNvl2[2]],
      [this.desvNvl1[2], this.desvNvl2[2]],

    ];

    var cuadroPequeño = [

      [this.desvNvl1[3], this.desvNvl2[3]],
      [this.desvNvl1[3], this.desvNvl2[4]],
      [this.desvNvl1[4], this.desvNvl2[4]],
      [this.desvNvl1[4], this.desvNvl2[3]],
      [this.desvNvl1[3], this.desvNvl2[3]],

    ];

    var vertical = [

      [this.desvNvl1[8], this.desvNvl2[1]],
      [this.desvNvl1[8], this.desvNvl2[6]],

    ];

    var horizontal = [

      [this.desvNvl1[1], this.desvNvl2[8]],
      [this.desvNvl1[6], this.desvNvl2[8]],

    ];

    var funcLabel: Function = (data, position, texto) => {

      if (data.value[position] % 1 == 0) {

        return texto + data.value[position];

      } else {

        var decimales = data.value[position].toString();

        var cortar = decimales.substr(decimales.indexOf('.') + 1);

        if (cortar.length > 1) {

          return texto + data.value[position].toFixed(2);

        } else {

          return texto + data.value[position].toFixed(1);

        }

      }

    }

    var puntos = [];
    var ptsNvl1 = [];
    var ptsNvl2 = [];

    for (let i = 0; i < this.pointsYP.length; i++) {

      if(this.pointsYP[i].Valuelevel1){
        ptsNvl1.push(this.pointsYP[i].Valuelevel1);
      }
      if(this.pointsYP[i].valuelevel1){
        ptsNvl1.push(this.pointsYP[i].valuelevel1);
      }

      if(this.pointsYP[i].Valuelevel2){
        ptsNvl2.push(this.pointsYP[i].Valuelevel2);
      }
      
      if(this.pointsYP[i].valuelevel2){
        ptsNvl2.push(this.pointsYP[i].valuelevel2);
      }
      

     if (this.pointsYP[i].Idresult) {
      var objeto = {
        name: this.pointsYP[i].Idresult,
        value: [this.pointsYP[i].Valuelevel1, this.pointsYP[i].Valuelevel2],
      }

      puntos.push(objeto);       
     }
     if (this.pointsYP[i].idresult) {
      var objeto = {
        name: this.pointsYP[i].idresult,
        value: [this.pointsYP[i].valuelevel1, this.pointsYP[i].valuelevel2],
      }

      puntos.push(objeto);       
     }

    }

    this.minimoNvl1 = [Math.min.apply(null, ptsNvl1), this.desvNvl1[1]];
    this.minimoNvl2 = [Math.min.apply(null, ptsNvl2), this.desvNvl2[1]];

    // Object.defineProperty(document.getElementById('youden'), 'clientWidth', { get: function () { return 1000 } });
    // Object.defineProperty(document.getElementById('youden'), 'clientHeight', { get: function () { return 600 } });
    document.getElementById('youden').style.marginTop = '20px';
    var myChart = echarts.init(document.getElementById('youden'));

    myChart.setOption({

      xAxis: {
        type: 'value',
        show: false,
        min: this.minimoNvl1,
      },
      yAxis: {
        type: 'value',
        show: false,
        min: this.minimoNvl2,
      },
      grid: {
        width: "80%",
        left: "15%"
      },
      tooltip: {
        trigger: 'item',
        formatter: function (data) {

          if (data.componentSubType == 'scatter') {

            var referencia = datos.find(dato => dato.Idresult == data.data.name);
            var fecha = dayjs(referencia.Date).format('DD-MM-YYYY');
            var hora = referencia.Hour;

            return '<b>Fecha:</b> ' + fecha + '<br>' + '<b>Hora:</b> ' + hora + '<br>' + '<b>Resultado - Nvl 1:</b> ' + referencia.Valuelevel1 + '<br>' + '<b>Resultado - Nvl 2:</b> ' + referencia.Valuelevel2 + '<br>' + '<b>Z-Score - Nvl 1:</b> ' + referencia.Zlevel1 + '<br>' + '<b>Z-Score - Nvl 2:</b> ' + referencia.Zlevel2;

          }

        }
      },
      legend: {
        data: ['3DS', '2DS', '1DS', 'Media Nvl 1', 'Media Nvl 2', 'Resultados']
      },
      series: [

        {
          name: '3DS',
          type: 'line',
          showSymbol: true,
          symbolSize: 0,
          lineStyle: {
            color: 'red'
          },
          data: [
            {
              label: {
                color: 'red',
                fontWeight: 'bold',
                show: true,
                position: 'left',
                distance: 20,
                formatter: function (data) {

                  return funcLabel(data, 1, '-3DS: ');

                }
              },
              value: [this.desvNvl1[1], this.desvNvl2[1]]
            },
            {
              label: {
                color: '#F3E827',
                fontWeight: 'bold',
                show: true,
                position: 'left',
                distance: 20,
                formatter: function (data) {

                  return funcLabel(data, 1, '-2DS: ');

                }
              },
              value: [this.desvNvl1[1], this.desvNvl2[2]]
            },
            {
              label: {
                color: 'green',
                fontWeight: 'bold',
                show: true,
                position: 'left',
                distance: 20,
                formatter: function (data) {

                  return funcLabel(data, 1, '-1DS: ');

                }
              },
              value: [this.desvNvl1[1], this.desvNvl2[3]]
            },
            {
              label: {
                color: 'black',
                fontWeight: 'bold',
                show: true,
                position: 'left',
                distance: 20,
                formatter: function (data) {

                  return funcLabel(data, 1, 'MD: ');

                }
              },
              value: [this.desvNvl1[1], this.desvNvl2[8]]
            },
            {
              label: {
                color: 'green',
                fontWeight: 'bold',
                show: true,
                position: 'left',
                distance: 20,
                formatter: function (data) {

                  return funcLabel(data, 1, '+1DS: ');

                }
              },
              value: [this.desvNvl1[1], this.desvNvl2[4]]
            },
            {
              label: {
                color: '#F3E827',
                fontWeight: 'bold',
                show: true,
                position: 'left',
                distance: 20,
                formatter: function (data) {

                  return funcLabel(data, 1, '+2DS: ');

                }
              },
              value: [this.desvNvl1[1], this.desvNvl2[5]]
            },
            {
              label: {
                color: 'red',
                fontWeight: 'bold',
                show: true,
                position: 'left',
                distance: 20,
                formatter: function (data) {

                  return funcLabel(data, 1, '+3DS: ');

                }
              },
              value: [this.desvNvl1[1], this.desvNvl2[6]]
            },
            {
              value: [this.desvNvl1[6], this.desvNvl2[6]]
            },
            {
              value: [this.desvNvl1[6], this.desvNvl2[1]]
            },
            {
              label: {
                color: 'red',
                fontWeight: 'bold',
                show: true,
                position: 'bottom',
                distance: 20,
                formatter: function (data) {

                  return funcLabel(data, 0, '+3DS: ');

                }
              },
              value: [this.desvNvl1[6], this.desvNvl2[1]]
            },
            {
              label: {
                color: '#F3E827',
                fontWeight: 'bold',
                show: true,
                position: 'bottom',
                distance: 20,
                formatter: function (data) {

                  return funcLabel(data, 0, '+2DS: ');

                }
              },
              value: [this.desvNvl1[5], this.desvNvl2[1]]
            },
            {
              label: {
                color: 'green',
                fontWeight: 'bold',
                show: true,
                position: 'bottom',
                distance: 20,
                formatter: function (data) {

                  return funcLabel(data, 0, '+1DS: ');

                }
              },
              value: [this.desvNvl1[4], this.desvNvl2[1]]
            },
            {
              label: {
                color: 'black',
                fontWeight: 'bold',
                show: true,
                position: 'bottom',
                distance: 20,
                formatter: function (data) {

                  return funcLabel(data, 0, 'MD: ');

                }
              },
              value: [this.desvNvl1[8], this.desvNvl2[1]]
            },
            {
              label: {
                color: 'green',
                fontWeight: 'bold',
                show: true,
                position: 'bottom',
                distance: 20,
                formatter: function (data) {

                  return funcLabel(data, 0, '-1DS: ');

                }
              },
              value: [this.desvNvl1[3], this.desvNvl2[1]]
            },
            {
              label: {
                color: '#F3E827',
                fontWeight: 'bold',
                show: true,
                position: 'bottom',
                distance: 20,
                formatter: function (data) {

                  return funcLabel(data, 0, '-2DS: ');

                }
              },
              value: [this.desvNvl1[2], this.desvNvl2[1]]
            },
            {
              label: {
                color: 'red',
                fontWeight: 'bold',
                show: true,
                position: 'bottom',
                distance: 20,
                formatter: function (data) {

                  return funcLabel(data, 0, '-3DS: ');

                }
              },
              value: [this.desvNvl1[1], this.desvNvl2[1]]
            }
          ]
        },
        {
          name: '2DS',
          type: 'line',
          showSymbol: false,
          lineStyle: {
            color: '#F3E827',
          },
          itemStyle: {
            color: '#F3E827'
          },
          data: cuadroMedio
        },

        {
          name: '1DS',
          type: 'line',
          showSymbol: false,
          lineStyle: {
            color: 'green'
          },
          itemStyle: {
            color: 'green'
          },
          data: cuadroPequeño
        },
        {
          name: 'Media Nvl 1',
          type: 'line',
          showSymbol: false,
          lineStyle: {
            color: 'black'
          },
          itemStyle: {
            color: 'black'
          },
          data: vertical
        },
        {
          name: 'Media Nvl 2',
          type: 'line',
          showSymbol: false,
          lineStyle: {
            color: 'black',
          },
          itemStyle: {
            color: 'black'
          },
          data: horizontal
        },
        {
          name: 'Resultados',
          type: 'scatter',
          zlevel: 1,
          symbol: 'circle',
          symbolSize: 3.5,
          itemStyle: {
            color: 'white',
            offset: 1,
            borderWidth: 2,
            borderColor: 'blue'
          },
          data: puntos,
        }
      ]


    });


    setTimeout(() => {
      this.imgGraficaYouden.emit(myChart.getDataURL());
    }, 1000);
  }

}
