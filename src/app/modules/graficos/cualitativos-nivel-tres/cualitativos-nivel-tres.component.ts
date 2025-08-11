import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import * as echarts from 'echarts';
import { CualitativosService } from '../services/cualitativos.service';
import dayjs from 'dayjs';

@Component({
    selector: 'app-cualitativos-nivel-tres',
    templateUrl: './cualitativos-nivel-tres.component.html',
    styleUrls: ['./cualitativos-nivel-tres.component.css'],
    standalone: true
})

export class CualitativosNivelTresComponent implements OnInit {

  @Output('grafica3C') grafica3C:EventEmitter<string>= new EventEmitter();

  pts = [];
  results = [];
  ars = [];

  constructor(private cualitativosService: CualitativosService) {

    this.pts = this.cualitativosService.ejesNvlTres.sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime());;
    this.ars = this.cualitativosService.ars;

  }

  ngOnInit() {

    this.loadData();

  }

  loadData() {

    let puntos = [];
    let labels = [];
    let puntosAR = [];
    let arsRef = this.ars.filter(x => x.Resultlevel3 != null);
    let ptsDos = this.pts;
    this.pts.sort((a,b)=>Number(a.idresultqualitative) - Number(b.idresultqualitative))
    .map((dato,i)=>{
      puntos.push(Number(this.pts[i].ordergraph));
      labels.push(dayjs(this.pts[i].Fecha).format('DD-MM-YYYY'));

      let color: string = '';
      let referencia = this.ars.find(dato => dato.Idresultqualitative == parseInt(this.pts[i].idresultqualitative));
      referencia.Arlevel3 == 'R' ? color = 'red' : color = '#D0A0D0';

      const objeto = {
        value: Number(this.pts[i].ordergraph),
        itemStyle: {
          color: color
        }
      }

      puntosAR.push(objeto);
    });
   

    // ----------------------------------
    const _parent =  document.getElementById('nivel-3').parentElement;
    const _boxChart = _parent.parentElement; // contenedor de la grafica
    let _wChart = 1000;

    if (_boxChart.clientWidth <= 1366) {
      document.getElementById('nivel-1').style.width = `${_boxChart.clientWidth}px`;
      _wChart = _boxChart.clientWidth * 0.93;
    }else{
      _wChart = _boxChart.clientWidth * 0.99;
    }


    Object.defineProperty(document.getElementById('main3'), 'clientWidth', { get: function () { return _wChart  } });
    Object.defineProperty(document.getElementById('main3'), 'clientHeight', { get: function () { return 350 } });
    document.getElementById('main3').style.marginTop = '40px';
    let myChart = echarts.init(document.getElementById('main3'));

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
          end: 10,
          top:45, 
          right:'center',
          width:350,
          handleSize: '100%', 
          borderColor: '#A9B3FD',
          backgroundColor: '#e3e6ff',
          handleStyle: {
            color: 'white',
            borderColor: 'white'
          },
          height: 10,
        }
      ],
      title: {
        text: 'Nivel 3',
        left: 'center',
        top:1,
        textStyle: {
          color: '#6B4B8B',  // Cambia el color del texto del título (rojo en este caso)
          fontSize: 20,      // Tamaño de la fuente del título
          fontWeight: 'bold' // Grosor de la fuente (puede ser 'normal', 'bold', etc.)
        },
      },
      tooltip: {
        trigger: 'axis',
        formatter: (data)=>{

          let colorItem = '';
          let comentarios = '';
          let acciones = '';
          let estado = '';
          let referencia = this.pts[data[0].dataIndex];
          let fecha = dayjs(referencia.Fecha).format('DD-MM-YYYY');

          referencia.Comments != '' && referencia.Comments != null ? comentarios = referencia.Comments : comentarios = 'N/R';
          referencia.Descorrectiveactions != '' && referencia.Descorrectiveactions != null ? acciones = referencia.Descorrectiveactions : acciones = 'N/R';

          if (referencia.Arlevel3 == 'R') {

            colorItem = 'red';
            estado = 'Rechazado';

          } else {

            colorItem = '#007D00',
              estado = 'Aceptado'
          }

          return '<b>Resultado:</b> ' + referencia.resultlevel3 + '<br>' + '<b>Fecha:</b> ' + fecha + '<br>' + '<b>Estado:</b> ' + `<b style="color: ${colorItem}">${estado}</b>` + '<br>' + '<b>Acción correctiva:</b> ' + acciones + '<br>' + '<b>Comentarios:</b> ' + comentarios;

        }

      },
      grid: {
        left: '8%',
        right: '8%',
        top:'30%',
        bottom: '5%',
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
            color: '#7C007C',
            width: 2.5
          },
          itemStyle: {
            borderWidth: 2,
            borderColor: '#7C007C',
            color: '#D0A0D0'
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

    setTimeout(() => {
      this.grafica3C.emit(myChart.getDataURL());
    }, 1000);
  }

}
