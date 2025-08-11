import { Component, OnInit,Output,EventEmitter } from '@angular/core';
import { CuantitativosService } from '../../services/cuantitativos.service';
import dayjs from 'dayjs';

import * as echarts from 'echarts';

@Component({
    selector: 'app-multi',
    templateUrl: './multi.component.html',
    styleUrls: ['./multi.component.css'],
    standalone: true
})
export class MultiComponent implements OnInit {

  @Output('imgGraficamulti') imgGraficamulti:EventEmitter<string> = new EventEmitter();

  pts: any;
  desv: any;

  minimo: number;
  maximo: number;

 
  constructor(private cuantitativosService: CuantitativosService) {

    this.pts = this.cuantitativosService.puntosprueba;
    this.desv = this.cuantitativosService.desviacionesMulti;

  }

  ngOnInit() {
    this.buildGraph();
  }

  getDataObjeto(objeto) {
  
    let colorItem = '';
    let comentarios = '';
    let acciones = '';
    let estado = '';
    var fecha = objeto.Date? dayjs(objeto.Date).format('DD-MM-YYYY'):dayjs(objeto.date).format('DD-MM-YYYY');
    comentarios = objeto.Comments? objeto.Comments: objeto.comments;
    acciones = objeto.Descorrectiveactions? objeto.Descorrectiveactions: objeto.descorrectiveactions;
    if(objeto.Comments == undefined || objeto.Descorrectiveactions == undefined){
      comentarios = 'NR'
    }
    if(objeto.Descorrectiveactions == undefined || objeto.descorrectiveactions == undefined){
      acciones = 'NR'
    }

    if (objeto.Arlevel1 == 'R' || objeto.arlevel1  == 'R') {

      colorItem = 'red';
      estado = 'Rechazado';

    } else if (objeto.Arlevel1 == 'I' || objeto.arlevel1 == 'I') {

      colorItem = '#FAB005';
      estado = 'Alerta';

    } else {

      colorItem = '#007D00',
        estado = 'Aceptado'
    }

    return {
    fecha: fecha,
    colorItem: colorItem,
    comentarios: comentarios,
    acciones: acciones,
    estado: estado,
    }
  }


  
  buildGraph(){
    var datos = this.pts;

    var getTootipConfig: Function = (objeto)=> this.getDataObjeto(objeto);

    var functLabel: Function = ( label: any ) => {

      if (label.data % 1 == 0) {

        return label.seriesName + ': ' + label.data;
  
      } else {
  
        var decimales = label.data.toString();
  
        var cortar = decimales.substr(decimales.indexOf('.') + 1);
  
        if (cortar.length > 1) {
  
          return label.seriesName + ': ' + label.data.toFixed(2);
  
        } else {
  
          return label.seriesName + ': ' + label.data.toFixed(1);
  
        }
      }
    }


     //--------------------------------------------

    const _parent =  document.getElementById('multi-1').parentElement;
    const _boxChart = _parent.parentElement; // contenedor de la grafica
   // console.log('boxChart: ',_boxChart.clientWidth);

    var _wChart = 1000;
    var _px = 87;    
    var _fontSize = 12;    

    if (_boxChart.clientWidth <= 1366) {
      // document.getElementById('multi-1').style.overflowX = 'scroll'; 
    } 
    document.getElementById('multi-1').style.width = `${_boxChart.clientWidth}px`;
     _wChart = _boxChart.clientWidth * 0.99;

    if (_boxChart.clientWidth <= 300) {    
      _px = _px * 0.27;      
    }
    if (_boxChart.clientWidth > 300 && _boxChart.clientWidth <= 576) {     
      _px = _px * 0.6;     
    }
    if (_boxChart.clientWidth > 576 && _boxChart.clientWidth <= 700 ) {     
      _px = _px * 0.79;     
    }
    if (_boxChart.clientWidth > 700 && _boxChart.clientWidth <= 1000) {     
      _px = _px * 1.05;     
    }  
    if(_wChart > 1000){
      _px = _px * 1.3;
      _fontSize = 11;
    }

   
    Object.defineProperty(document.getElementById('multi'), 'clientWidth', { get: function () { return _wChart } });
    Object.defineProperty(document.getElementById('multi'), 'clientHeight', { get: function () { return 350 } });
    document.getElementById('multi').style.marginTop = '16px';
    var myChart = echarts.init(document.getElementById('multi'));      
    
    var ds4 = [];
    var ds3 = [];
    var ds2 = [];
    var ds1 = [];

    var media = [];

    var di4 = [];
    var di3 = [];
    var di2 = [];
    var di1 = [];

    var puntosLvl1 = [];
    var puntosLvl2 = [];
    var puntosLvl3 = [];

    var labels = [];

    var allPoints = [];

    for (let i = 0; i < this.pts.length; i++) {

      labels.push((i + 1).toString());

      ds4.push(this.desv[0].dSsuperior4);
      ds3.push(this.desv[0].dSsuperior03);
      ds2.push(this.desv[0].dSsuperior2);
      ds1.push(this.desv[0].dSsuperior01);

      di4.push(this.desv[0].dsInferior4);
      di3.push(this.desv[0].dsInferior3);
      di2.push(this.desv[0].dsInferior2);
      di1.push(this.desv[0].dsInferior1);

      media.push(this.desv[0].media);

      if(this.pts[i].Valuelevel1 !== null || this.pts[i].Valuelevel1 !== undefined)
      {

        puntosLvl1.push(Number(this.pts[i].Valuelevel1));
        allPoints.push(Number(this.pts[i].Valuelevel1));
      }
       
      if(this.pts[i].Valuelevel2 !== null || this.pts[i].Valuelevel2 !== undefined )
      {
        puntosLvl2.push(Number(this.pts[i].Valuelevel2));
      allPoints.push(Number(this.pts[i].Valuelevel2));
      }
       
      if(this.pts[i].Valuelevel3 !== null || this.pts[i].Valuelevel3 !== undefined)
      {
        puntosLvl3.push(Number(this.pts[i].Valuelevel3));
        allPoints.push(Number(this.pts[i].Valuelevel3));
      } 
    }
    var maximos = [Math.max.apply(null, allPoints), this.desv[0].dSsuperior4];
    var minimos = [Math.min.apply(null, allPoints), this.desv[0].dsInferior4];

    this.minimo = Math.min.apply(null, minimos);
    this.maximo = Math.max.apply(null, maximos);


    var indicadorDesviaciones = 0;

    if ((Math.sign(this.desv[0].dsInferior1) == 1 && Math.sign(this.desv[0].dsInferior4) == 1) || (Math.sign(this.desv[0].dsInferior3) == 1 && Math.sign(this.desv[0].dsInferior4) == -1)) {

      indicadorDesviaciones = 1;

    }

    if ((Math.sign(this.desv[0].dsInferior1) == -1 && Math.sign(this.desv[0].dsInferior4) == -1)) {

      indicadorDesviaciones = 2;

    }

    if ((Math.sign(this.desv[0].dsInferior1) == 1 && Math.sign(this.desv[0].dsInferior2) == -1)) {

      indicadorDesviaciones = 3;

    }

    if ((Math.sign(this.desv[0].dsInferior2) == 1 && Math.sign(this.desv[0].dsInferior3) == -1)) {

      indicadorDesviaciones = 4;

    }
       

    myChart.setOption({

      silent: true,
      legend: {
        data: ['Resultado1', 'Resultado2', 'Resultado3'],
        formatter: function (name) {         
          let _legend = '';
          if (name == 'Resultado1') {
            _legend = 'Nivel 1'
          }
          if (name == 'Resultado2') {
            _legend = 'Nivel 2'
          }
          if (name == 'Resultado3') {
            _legend = 'Nivel 3'
          }
          return _legend;
      }
      },
     tooltip: {
        trigger: 'axis',
        //backgroundColor: 'rgb(69, 69, 249)',
        formatter: function (data) {
          //console.log("data",data);
          var filtro1 = data.filter(dato => dato.seriesName == 'Resultado1');
          var filtro2 = data.filter(dato => dato.seriesName == 'Resultado2');
          var filtro3 = data.filter(dato => dato.seriesName == 'Resultado3');
        
          var objeto1 = filtro1.length == 1? getTootipConfig(datos[filtro1[0].dataIndex]): null;
          var objeto2 = filtro2.length == 1? getTootipConfig(datos[filtro2[0].dataIndex]): null;
          var objeto3 = filtro3.length == 1? getTootipConfig(datos[filtro3[0].dataIndex]): null; 
         

          const result1 = objeto1?`<div class="bg-resultado-uno"><b>Nivel 1: </b>${filtro1[0].value}<br><b>Fecha: </b>${objeto1.fecha}<br><b>Estado:</b> <b style="color: ${objeto1.colorItem}">${objeto1.estado}</b></div>`: ''; 
          const result2 = objeto2?`<div class="bg-resultado-dos"><b>Nivel 2: </b>${filtro2[0].value}<br><b>Fecha: </b>${objeto2.fecha}<br><b>Estado:</b> <b style="color: ${objeto2.colorItem}">${objeto2.estado}</b></div>`: ''; 
          const result3 = objeto3?`<div class="bg-resultado-tres"><b>Nivel 3: </b>${filtro3[0].value}<br><b>Fecha: </b>${objeto3.fecha}<br><b>Estado:</b> <b style="color: ${objeto3.colorItem}">${objeto3.estado}</b></div>`: ''; 

          return result1 + result2 + result3;
         // return '<b>Resultado:</b> ' + filtro[0].value + '<br>' + '<b>Fecha:</b> ' + fecha + '<br>' + '<b>Estado:</b> ' + `<b style="color: ${colorItem}">${estado}</b>` + '<br>' + '<b>Acción correctiva:</b> ' + acciones + '<br>' + '<b>Comentarios:</b> ' + comentarios;
        }
      
      },
      grid: {
        left: '3%',
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
          show: false,
          min: this.minimo,
          max: this.maximo
        }
      ],
      series: [ //----Series---------
        {
          name: 'DES4',
          type: 'line',
          data: ds4,
          zlevel: 1,
          showSymbol: false,
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
            width: 1.2,
            type: 'dashed',
            color: 'red',           
          },
          itemStyle: {
            borderWidth: 2,
            borderColor: 'red',
            color: 'red'
          },
          label: {
            show: false,
            formatter: function (label) {


              return functLabel(label);

            }
          },
          endLabel: {
            //align: _align,
            distance:( _wChart- _px) * -1, // Posicion Label, 
            show: false,
            color: 'red',
            fontWeight: 'bold',
            fontSize: _fontSize
          }
         
        },
        {
          name: 'DES3',
          type: 'line',
          data: ds3,
          zlevel: 2,
          showSymbol: false,
        //  areaStyle: {
        //    color: '#EEEEEE',
        //    opacity: 0.2
        //  },               
          lineStyle: {
            width: 1.2,
            type: 'dashed',
            color: 'orange',
          },
          itemStyle: {
            borderWidth: 2,
            borderColor: 'orange',
            color: 'orange'
          },
          label: {
            show: false,
            formatter: function (label) {

              return functLabel(label);

            }
          },
          endLabel: {
            distance: ( _wChart- _px) * -1, // Posicion Label,
            show: false,
            color: 'orange',
            fontWeight: 'bold',
             fontSize: _fontSize
          }
          
        },
        {
          name: 'DES2',
          type: 'line',
          data: ds2,
          zlevel: 3,
          showSymbol: false,
        //  areaStyle: {
        //    color: '#E9E9E9',
        //    opacity: 0.1
        //  },         
          lineStyle: {
            width: 1.2,
            type: 'dashed',
            color: '#F3E827',
            
          },
          itemStyle: {
            borderWidth: 2,
            borderColor: '#F3E827',
            color: '#F3E827'
          },
          label: {
            show: false,
            formatter: function (label) {

              return functLabel(label);

            }
          },
          endLabel: {
            distance: ( _wChart- _px) * -1, // Posicion Label,
            show: false,
            color: '#F3E827',
            fontWeight: 'bold',
             fontSize: _fontSize
          }
         
        },
        {
          name: 'DES1',
          type: 'line',
          data: ds1,
          zlevel: 4,
          showSymbol: false,         
         areaStyle: {
           color: '#FFFFFF',
           opacity: 1
         },        
          lineStyle: {
            width: 1.2,
            type: 'dashed',
            color: 'green',
           
          },
          itemStyle: {
            borderWidth: 2,
            borderColor: 'green',
            color: 'green'
          },
          label: {
            show: false,
            formatter: function (label) {

              return functLabel(label);

            }
          },
          endLabel: {
            distance: ( _wChart- _px) * -1, // Posicion Label,
            show: false,
            color: 'green',
            fontWeight: 'bold',
             fontSize: _fontSize
          }
        },
        {
          name: 'Media',
          type: 'line',
          data: media,
          zlevel: 5,
          showSymbol: false,
         areaStyle: {
           color: '#FFFFFF',
           opacity: 1
         },
          // lineStyle: {
          //   width: 1.2,
          //   type: 'dashed',
          //   color: 'white'
          // },
          lineStyle: {
            width: 1.2,
            type: 'dashed',
            color: 'black',           
          },
          itemStyle: {
            borderWidth: 2,
            borderColor: 'black',
            color: 'black'
          },
          label: {
            show: false,
            formatter: function (label) {

              return functLabel(label);

            }
          },
          endLabel: {
            distance: ( _wChart- _px) * -1, // Posicion Label,
            show: false,
            color: 'black',
            fontWeight: 'bold',
             fontSize: _fontSize
          }
         
        },
        {
          name: 'DEI1',
          zlevel: indicadorDesviaciones == 1 ? 6 : indicadorDesviaciones == 2 ? 9 : indicadorDesviaciones == 3 || indicadorDesviaciones == 4 ? 6 : 6,
          type: 'line',
          data: di1,
          showSymbol: false,          
        //  areaStyle: {
        //    color: '#E9E9E9',
        //    opacity: 0.1
        //  },         
          lineStyle: {
            width: 1.2,
            type: 'dashed',
            color: 'green',           
          },
          itemStyle: {
            borderWidth: 2,
            borderColor: 'green',
            color: 'green'
          },
          label: {
            show: false,
            formatter: function (label) {

              return functLabel(label);

            }
          },
          endLabel: {
            distance: ( _wChart- _px) * -1, // Posicion Label,
            show: false,
            color: 'green',
            fontWeight: 'bold',
             fontSize: _fontSize
          }
        },
        {
          name: 'DEI2',
          type: 'line',
          data: di2,
          showSymbol: false,
          zlevel: indicadorDesviaciones == 1 ? 7 : indicadorDesviaciones == 2 ? 8 : indicadorDesviaciones == 3 ? 9 : indicadorDesviaciones == 4 ? 7 : 7,
          
          // areaStyle: {
          //   color: '#E9E9E9',
          //   opacity: 0.2
          // },
          lineStyle: {
            width: 1.2,
            type: 'dashed',
            color: '#F3E827',           
          },
          itemStyle: {
            borderWidth: 2,
            borderColor: '#F3E827',
            color: '#F3E827'
          },
          label: {
            show: false,
            formatter: function (label) {

              return functLabel(label);

            }
          },
          endLabel: {
            distance: ( _wChart- _px) * -1, // Posicion Label,
            show: false,
            color: '#F3E827',
            fontWeight: 'bold',
             fontSize: _fontSize
          }
        },
        {
          name: 'DEI3',
          type: 'line',
          data: di3,
          zlevel: indicadorDesviaciones == 1 ? 8 : indicadorDesviaciones == 2 ? 7 : indicadorDesviaciones == 3 ? 8 : indicadorDesviaciones == 4 ? 9 : 9,
          showSymbol: false,         
          // areaStyle: {
          //   color: '#E9E9E9',
          //   opacity: 0.5
          // },         
          lineStyle: {
            width: 1.2,
            type: 'dashed',
            color: 'orange',            
          },
          itemStyle: {
            borderWidth: 2,
            borderColor: 'orange',
            color: 'orange'
          },
          label: {
            show: false,
            formatter: function (label) {

              return functLabel(label);

            }
          },
          endLabel: {
            distance: ( _wChart- _px) * -1, // Posicion Label,
            show: false,
            color: 'orange',
            fontWeight: 'bold',
             fontSize: _fontSize
          }
          
        },
        {
          name: 'DEI4',
          type: 'line',
          data: di4,
          zlevel: indicadorDesviaciones == 1 ? 9 : indicadorDesviaciones == 2 ? 6 : indicadorDesviaciones == 3 ? 7 : indicadorDesviaciones == 4 ? 8 : 8,
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
            width: 1.2,
            type: 'dashed',
            color: 'red',           
          },
          itemStyle: {
            borderWidth: 2,
            borderColor: 'red',
            color: 'red'
          },
          label: {
            show: false,
            formatter: function (label) {

              return functLabel(label);

            }
          },
          endLabel: {
            distance: ( _wChart- _px) * -1, // Posicion Label,
            show: false,
            color: 'red',
            fontWeight: 'bold',
             fontSize: _fontSize
          }
         
        },
        {
          name: 'Resultado1',
          type: 'line',
          showSymbol: true,
          zlevel: 10,
          symbolSize: 7,
          symbol: 'rect',
          lineStyle: {
            width: 3,
            color: '#4141FC'
          },
          itemStyle: {
            borderWidth: 1.5,
            borderColor: '#4141FC',
            color: '#A0A0FF'
          },
          label: {
            show: false,
            position: 'top',
            fontWeight: 'bold',
            color: '#6F4B8B'
          },
          data: puntosLvl1
        },
        {
          name: 'Resultado2',
          zlevel: 11,
          type: 'line',
          showSymbol: true,
          symbolSize: 7,
          symbol: 'circle',
          lineStyle: {
            width: 3,
            color: '#007D00'
          },
          itemStyle: {
            borderWidth: 1.5,
            borderColor: '#007D00',
            color: '#A5D2A5'
          },
          label: {
            show: false,
            position: 'top',
            fontWeight: 'bold',
            color: '#6F4B8B'
          },
          data: puntosLvl2
        },
        {
          name: 'Resultado3',
          type: 'line',
          zlevel: 12,
          showSymbol: true,
          symbolSize: 7,
          symbol: 'triangle',
          lineStyle: {
            width: 3,
            color: '#7C007C'
          },
          itemStyle: {
            borderWidth: 1.5,
            borderColor: '#7C007C',
            color: '#D0A0D0'
          },
          label: {
            show: false,
            position: 'top',
            fontWeight: 'bold',
            color: '#6F4B8B'
          },
          data: puntosLvl3
        }
      
      ]


    });

    setTimeout(() => {
      this.imgGraficamulti.emit(myChart.getDataURL());
    }, 1000);


  }
  

// --------------------------------------------------------------
// --------------------------------------------------------------
// --------------------------------------------------------------

  buildGraphOriginal() {

      //--------------------------------------------

      const _parent =  document.getElementById('multi-1').parentElement;
      const _boxChart = _parent.parentElement; // contenedor de la grafica
     // console.log('boxChart: ',_boxChart.clientWidth);
  
      var _wChart = 1000;
      var _px = 87;    
      var _fontSize = 12;    
  
      if (_boxChart.clientWidth <= 1366) {
        document.getElementById('multi-1').style.width = `${_boxChart.clientWidth}px`;
       // document.getElementById('multi-1').style.overflowX = 'scroll';
  
        _wChart = _boxChart.clientWidth * 0.99;
  
      } 
  
      if (_boxChart.clientWidth <= 300) {    
        _px = _px * 0.27;      
      }
      if (_boxChart.clientWidth > 300 && _boxChart.clientWidth <= 576) {     
        _px = _px * 0.6;     
      }
      if (_boxChart.clientWidth > 576 && _boxChart.clientWidth <= 700 ) {     
        _px = _px * 0.79;     
      }
      if (_boxChart.clientWidth > 700 && _boxChart.clientWidth <= 1000) {     
        _px = _px * 1.05;     
      }  
      if(_wChart > 1000){
        _px = _px * 1.3;
        _wChart = 1000;
        _fontSize = 11;
      }
  
    Object.defineProperty(document.getElementById('multi'), 'clientWidth', { get: function () { return _wChart } });
    Object.defineProperty(document.getElementById('multi'), 'clientHeight', { get: function () { return 500 } });
    document.getElementById('multi').style.marginTop = '16px';
    var myChart = echarts.init(document.getElementById('multi'));

    var ds4 = [];
    var ds3 = [];
    var ds2 = [];
    var ds1 = [];

    var media = [];

    var di4 = [];
    var di3 = [];
    var di2 = [];
    var di1 = [];

    var puntosLvl1 = [];
    var puntosLvl2 = [];
    var puntosLvl3 = [];

    var labels = [];

    var allPoints = [];

    for (let i = 0; i < this.pts.length; i++) {

      labels.push((i + 1).toString());

      ds4.push(this.desv[0].dSsuperior4);
      ds3.push(this.desv[0].dSsuperior03);
      ds2.push(this.desv[0].dSsuperior2);
      ds1.push(this.desv[0].dSsuperior01);

      di4.push(this.desv[0].dsInferior4);
      di3.push(this.desv[0].dsInferior3);
      di2.push(this.desv[0].dsInferior2);
      di1.push(this.desv[0].dsInferior1);

      media.push(this.desv[0].media);

      if(this.pts[i].Valuelevel1 !== null || this.pts[i].Valuelevel1 !== undefined)
      {

        puntosLvl1.push(Number(this.pts[i].Valuelevel1));
        allPoints.push(Number(this.pts[i].Valuelevel1));
      }
       
      if(this.pts[i].Valuelevel2 !== null || this.pts[i].Valuelevel2 !== undefined )
      {
        puntosLvl2.push(Number(this.pts[i].Valuelevel2));
      allPoints.push(Number(this.pts[i].Valuelevel2));
      }
       
      if(this.pts[i].Valuelevel3 !== null || this.pts[i].Valuelevel3 !== undefined)
      {
        puntosLvl3.push(Number(this.pts[i].Valuelevel3));
        allPoints.push(Number(this.pts[i].Valuelevel3));
      } 
    }

    var maximos = [Math.max.apply(null, allPoints), this.desv[0].dSsuperior4];
    var minimos = [Math.min.apply(null, allPoints), this.desv[0].dsInferior4];

    this.minimo = Math.min.apply(null, minimos);
    this.maximo = Math.max.apply(null, maximos);


    var indicadorDesviaciones = 0;

    if ((Math.sign(this.desv[0].dsInferior1) == 1 && Math.sign(this.desv[0].dsInferior4) == 1) || (Math.sign(this.desv[0].dsInferior3) == 1 && Math.sign(this.desv[0].dsInferior4) == -1)) {

      indicadorDesviaciones = 1;

    }

    if ((Math.sign(this.desv[0].dsInferior1) == -1 && Math.sign(this.desv[0].dsInferior4) == -1)) {

      indicadorDesviaciones = 2;

    }

    if ((Math.sign(this.desv[0].dsInferior1) == 1 && Math.sign(this.desv[0].dsInferior2) == -1)) {

      indicadorDesviaciones = 3;

    }

    if ((Math.sign(this.desv[0].dsInferior2) == 1 && Math.sign(this.desv[0].dsInferior3) == -1)) {

      indicadorDesviaciones = 4;

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
        }
      ],
      silent: true,
      legend: {
        data: ['Resultado1', 'Resultado2', 'Resultado3']
      },
      tooltip: {
        axisPointer: {
          type: 'none'
        }
      },
      grid: {
        left: '3%',
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
          show: false,
          min: this.minimo,
          max: this.maximo
        }
      ],
      series: [
        {
          name: 'DES4',
          type: 'line',
          zlevel: 1,
          showSymbol: false,
          areaStyle: {
            color: '#FF948E',
            opacity: 1
          },
          lineStyle: {
            width: 0
          },
          data: ds4
        },
        {
          name: 'DES3',
          type: 'line',
          zlevel: 2,
          showSymbol: false,
          areaStyle: {
            color: '#FF9952',
            opacity: 1
          },
          lineStyle: {
            width: 1.2,
            type: 'dashed',
            color: 'white'
          },
          data: ds3
        },
        {
          name: 'DES2',
          zlevel: 3,
          type: 'line',
          showSymbol: false,
          areaStyle: {
            color: '#FFC952',
            opacity: 1
          },
          lineStyle: {
            width: 1.2,
            type: 'dashed',
            color: 'white'
          },
          data: ds2
        },
        {
          name: 'DES1',
          zlevel: 4,
          type: 'line',
          showSymbol: false,
          areaStyle: {
            color: '#FFDD7E',
            opacity: 1
          },
          lineStyle: {
            width: 1.2,
            type: 'dashed',
            color: 'white'
          },
          data: ds1
        },
        {
          name: 'Media',
          type: 'line',
          zlevel: 5,
          showSymbol: false,
          areaStyle: {
            color: '#A3DE97',
            opacity: 1
          },
          lineStyle: {
            width: 1.2,
            type: 'dashed',
            color: 'white'
          },
          data: media
        },
        {
          name: 'DEI1',
          zlevel: indicadorDesviaciones == 1 ? 6 : indicadorDesviaciones == 2 ? 9 : indicadorDesviaciones == 3 || indicadorDesviaciones == 4 ? 6 : 6,
          type: 'line',
          showSymbol: false,
          areaStyle: {
            color: '#FFDD7E',
            opacity: 1
          },
          lineStyle: {
            width: 1.2,
            type: 'dashed',
            color: 'white'
          },
          data: di1
        },
        {
          name: 'DEI2',
          type: 'line',
          showSymbol: false,
          zlevel: indicadorDesviaciones == 1 ? 7 : indicadorDesviaciones == 2 ? 8 : indicadorDesviaciones == 3 ? 9 : indicadorDesviaciones == 4 ? 7 : 7,
          areaStyle: {
            color: '#FFC952',
            opacity: 1
          },
          lineStyle: {
            width: 1.2,
            type: 'dashed',
            color: 'white'
          },
          data: di2
        },
        {
          name: 'DEI3',
          type: 'line',
          zlevel: indicadorDesviaciones == 1 ? 8 : indicadorDesviaciones == 2 ? 7 : indicadorDesviaciones == 3 ? 8 : indicadorDesviaciones == 4 ? 9 : 9,
          showSymbol: false,
          areaStyle: {
            color: '#FF9952',
            opacity: 1
          },
          lineStyle: {
            width: 1.2,
            type: 'dashed',
            color: 'white'
          },
          data: di3
        },
        {
          name: 'DEI4',
          type: 'line',
          zlevel: indicadorDesviaciones == 1 ? 9 : indicadorDesviaciones == 2 ? 6 : indicadorDesviaciones == 3 ? 7 : indicadorDesviaciones == 4 ? 8 : 8,
          showSymbol: false,
          areaStyle: {
            color: '#FF948E',
            opacity: 1
          },
          lineStyle: {
            width: 0
          },
          data: di4
        },
        {
          name: 'Resultado1',
          type: 'line',
          showSymbol: true,
          zlevel: 10,
          symbolSize: 0,
          lineStyle: {
            width: 3,
            color: '#4141FC'
          },
          itemStyle: {
            borderWidth: 1.5,
            borderColor: '#4141FC',
            color: '#A0A0FF'
          },
          label: {
            show: true,
            position: 'top',
            fontWeight: 'bold',
            color: '#6F4B8B'
          },
          data: puntosLvl1
        },
        {
          name: 'Resultado2',
          zlevel: 11,
          type: 'line',
          showSymbol: true,
          symbolSize: 0,
          lineStyle: {
            width: 3,
            color: '#007D00'
          },
          itemStyle: {
            borderWidth: 1.5,
            borderColor: '#007D00',
            color: '#A5D2A5'
          },
          label: {
            show: true,
            position: 'top',
            fontWeight: 'bold',
            color: '#6F4B8B'
          },
          data: puntosLvl2
        },
        {
          name: 'Resultado3',
          type: 'line',
          zlevel: 12,
          showSymbol: true,
          symbolSize: 0,
          lineStyle: {
            width: 3,
            color: '#7C007C'
          },
          itemStyle: {
            borderWidth: 1.5,
            borderColor: '#7C007C',
            color: '#D0A0D0'
          },
          label: {
            show: true,
            position: 'top',
            fontWeight: 'bold',
            color: '#6F4B8B'
          },
          data: puntosLvl3
        }
      ]


    });

    setTimeout(() => {
      this.imgGraficamulti.emit(myChart.getDataURL());
    }, 1000);


  }
} // end class
