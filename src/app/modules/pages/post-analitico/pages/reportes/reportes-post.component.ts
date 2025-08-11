import { Component, OnInit, TemplateRef } from '@angular/core';


import * as echarts from 'echarts';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { PostIndicacoresService } from '@app/services/post-analitico/post-indicacores.service';
import { PostReportesService } from '@app/services/post-analitico/post-reportes.service';
import { ImageCdnPipe } from '../../../../core/pipes/image-cdn.pipe';
import { NgFor, NgIf } from '@angular/common';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';


@Component({
    selector: 'app-reportes-post',
    templateUrl: './reportes-post.component.html',
    styleUrls: ['./reportes-post.component.css'],
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, MatFormFieldModule, MatSelectModule, MatOptionModule, NgFor, NgIf, TranslateModule, ImageCdnPipe]
})
export class ReportesPostComponent implements OnInit {

  formulario: FormGroup;
  ventanaModal: BsModalRef;
  reporte_arr = [];
  totalMes_arr = [];
  labelsMes_arr = [];
  porcentMes_arr = [];
  totalSampleMes_arr = []; // solo Q2

  //------
  gnl_reporte_arr = [];
  //------

  indexInd: number;
  itemInd:any;
  barHide: boolean = false;

  pageHide: boolean = false;

  typeInd: string = '';

  screen:number = 0;

  //-----------
  chartBar: any;
  chartLine: any;
  //-----------

  indicadores = [
    {idindicators: 1, nameindicators:'Informe de valores críticos al médico tratante QT1'},
    {idindicators: 2, nameindicators:'Tiempo para comunicar los valores críticos QT2'},
    {idindicators: 3, nameindicators:'Tiempo de respuesta de la troponina QT3'},
    {idindicators: 4, nameindicators:'Tiempo de respuesta liberación de resultados QT4'},
    {idindicators: 5, nameindicators:'Puntuación media general de satisfacción con los servicios de laboratorio clínico QT5'},
    {idindicators: 6, nameindicators:'Número de informes con comentarios interpretativos QT6'},
    {idindicators: 7, nameindicators:'Recomendación de laboratorio QT7'},
    {idindicators: 8, nameindicators:'Precisión resultados QT8'},
  ];

  year: number = new Date().getFullYear();

  anios = [];

  meses = [
    {mes:'Enero', idmes: 1},
    {mes:'Febrero', idmes: 2},
    {mes:'Marzo', idmes: 3},
    {mes:'Abril', idmes: 4},
    {mes:'Mayo', idmes: 5},
    {mes:'Junio', idmes: 6},
    {mes:'Julio', idmes: 7},
    {mes:'Agosto', idmes: 8},
    {mes:'Septiembre', idmes: 9},
    {mes:'Octubre', idmes: 10},
    {mes:'Noviembre', idmes: 11},
    {mes:'Diciembre', idmes: 12},
  ];

  constructor( private fb: FormBuilder,
              private translate: TranslateService,
              private toastr: ToastrService,
              private modalService: BsModalService,
              private postIndicacoresService: PostIndicacoresService,
              private postReportesService: PostReportesService,
              ) { }

  ngOnInit(): void {
    this.anios = [
      this.year,
      this.year - 1,
      this.year - 2,
      this.year - 3,
    ];

    this.crearFormulario();
    this.filtrosMonitor();
    //this.mainData();

  }

  ngDoCheck(): void {

    if(screen.width !== this.screen){
      this.screen = screen.width
      //console.log(screen.width);

      let option = {
        title: {
          textStyle: {
            fontSize: 18
          },
        }
      }

      if(this.chartBar){

        const _parent =  document.getElementById('main').parentElement;
        const _boxChart = _parent.parentElement; // contenedor de la grafica
        //console.log('boxChart: ',_boxChart.clientWidth);
        let _wChart = 1000;


        if (_boxChart.clientWidth <= 1200) {
          document.getElementById('main').style.width = `${_boxChart.clientWidth}px`;
          _wChart = _boxChart.clientWidth * 0.7;
          option = {
            title: {
              textStyle: {
                fontSize: 14
              },
            }
          }

        }

        this.chartBar.setOption(option);
        this.chartBar.resize({width: _wChart, height:400});

        if (this.chartLine && document.getElementById('main-line')) {
        const _parent =  document.getElementById('main-line').parentElement;
        const _boxChart = _parent.parentElement; // contenedor de la grafica
        //console.log('boxChart: ',_boxChart.clientWidth);
        let _wChart = 1000;

        if (_boxChart.clientWidth <= 1200) {
          document.getElementById('main-line').style.width = `${_boxChart.clientWidth}px`;
          _wChart = _boxChart.clientWidth * 0.8;
          option = {
            title: {
              textStyle: {
                fontSize: 14
              },
            }
          }

        }
        this.chartBar.setOption(option);
          this.chartLine.resize({width: _wChart, height:400});
        }
      }
    }


  }


   // monitorea los filtros
   filtrosMonitor(){
    this.formulario.valueChanges.subscribe(datos => {

      this.indexInd = datos.reporte;
      this.pageHide = false;

    });
  }
//----------------------
async mainData(){
  await this.postIndicacoresService.getAllAsync().then(data => {
    console.log(data);
    this.indicadores = data.filter(indicadores => indicadores.active);
  });


}

//---------------------
   //----------formulario------------

   get reporteNoValido() {
     return this.formulario.get('reporte');
   }
   get mesNoValido() {
    return this.formulario.get('mes');
  }
  get anioNoValido() {
    return this.formulario.get('anio');
  }

  crearFormulario() {

    this.formulario = this.fb.group({
      reporte: ['', [Validators.required]],
      mes: ['', [Validators.required]],
      anio: ['', [Validators.required]],
    });


  }


//---------------------

getFiltro(){

  //console.log(this.formulario.value);
  this.reporte_arr = [];

  this.postReportesService.getReporByIndicator(
                                      this.formulario.get('reporte').value,
                                      this.formulario.get('mes').value,
                                      this.formulario.get('anio').value,
                                      )
                                    .subscribe((resp: any[]) => {

                                                      console.log('Filtro: ', resp);

                                                      if(!resp){
                                                        return this.toastr.error('No hay datos');
                                                      }
                                                      this.getDataIndicator(resp,  this.formulario.get('reporte').value);


                                                }, err =>{

                                                  this.toastr.error('No hay datos');
                                                  this.pageHide = false;
                                                  this.reporte_arr = [];


                                                });




}

getDataIndicator(resp:any[], ind: number){

  let _dataSeries = [];
  let _dataEjeX = [];
  let _arr = [];

  switch (ind) {
    case 1:
    this.typeInd = 'Valores Críticos Informados';
    _arr = [
      resp[0].infocritvaluereport[0],
      resp[0].totalresultreceived[0]
     ];
      break;
    case 2:
    this.typeInd = 'Tiempo para Comunicar Valores Críticos';
    _arr = [
      resp[0].timecritialvalues[0]
     ];
      break;
    case 3:
    this.typeInd = 'Tiempo respuesta de la Troponina';
    _arr = [
      resp[0].responsetimetroponin[0]
    ];
    break;
    case 4:
    this.typeInd = 'Tiempo respuesta liberacíon resultados';
    _arr = [
      resp[0].resptimereleaseresults[0]
    ];
    break;
    case 5:
    this.typeInd = 'Satisfacción con los servicios de Laboratorio';
    _arr = [
      resp[0].overallsatisfcoreclinilab[0]
    ];
    break;
    case 6:
    this.typeInd = 'Número de Informes con comentarios Interpretativos';
    _arr = [
      resp[0].numberresults[0],
      resp[0].resultsreceived[0]
    ];
    break;
    case 7:
    this.typeInd = 'Recomendacion de laboratorio';
    _arr = [
      resp[0].satisflaboratoryservices[0]
    ];
    break;
    case 8:
    this.typeInd = 'Precisión de Resultados';
    _arr = [
      resp[0].incompleteresults[0],
      resp[0].numbincorrectresultstoproblems[0],
      resp[0].testresultscorrection[0],
      resp[0].unreadableresults[0],
      resp[0].wrongpatientsresults[0],
      resp[0].wrongtestresults[0],
      resp[0].totalordersreceived[0],
     ];
      break;

      default:
       this.toastr.info('Los datos no son validos');
  }

    const _nodata = _arr.find(item =>item.MesPrevio == '0' && item.Mesactual == '0' );
   // console.log('_nodata', _nodata);



   if(_nodata){
    this.pageHide = false;
    this.reporte_arr = [];
    this.toastr.error('No se encuentra información para generar Reporte');

  }else{

    _arr.forEach(item =>{
      console.log(item.Pctcambio);

      //item.Pctcambio = Math.round(Number(item.Pctcambio));
      //item.Sigma = Number(item.Sigma);//Math.round(Number(item.Sigma));
      //item.PctMesactual = Math.round(item.PctMesactual);

      item.PctMesactual = item.PctMesactual.replace(',', '.');
      item.Pctcambio = item.Pctcambio.replace(',', '.');

      item.Pctcambio = item.Pctcambio == '∞'?'...': Math.round(Number(item.Pctcambio));
      item.Sigma = Number(item.Sigma);//Math.round(Number(item.Sigma));
      item.PctMesactual = item.PctMesactual == '∞'?'...': Math.round(Number(item.PctMesactual));
      _dataSeries.push(item.PctMesactual);
      _dataEjeX.push(item.Item); // nombre del Item
      this.reporte_arr.push(item);
    });

    this.pageHide = true;
    //this.barHide = ind == 3 ? true : false;
    this.barHide = _dataSeries.length >= 2 ? false : true;
    this.graphEChartBar(_dataSeries, _dataEjeX);

  }



}







//-------------------------------------------------
//   Data modale Tabla & Grafica
//-------------------------------------------------

getDataForItemIndicator(i){

this.postReportesService.getReporGraph(this.indexInd, i,  this.formulario.get('anio').value)
                       .subscribe((resp: any) =>{
                         console.log('Item Selected: ', resp);

                         if(!resp){
                           this.closeVentana();
                           this.toastr.error('No hay datos');
                          return
                        }


                  switch (this.indexInd) {
                    case 1:
                      this.getDataForEchartLine(resp[0], 'infocritvaluereport');
                      break;
                    case 2:
                      this.getDataForEchartLine(resp[0], 'timecritialvalues');
                      break;
                    case 3:
                      this.getDataForEchartLine(resp[0], 'responsetimetroponin');
                      break;
                    case 4:
                      this.getDataForEchartLine(resp[0], 'timereleaseresults');
                      break;
                    case 5:
                      this.getDataForEchartLine(resp[0], 'satisflaboratoryservices');
                      break;
                    case 6:
                      this.getDataForEchartLine(resp[0], 'numbresultsinterpretivecomments');
                      break;
                    case 7:
                      this.getDataForEchartLine(resp[0], 'satisflaboratoryservices');
                      break;
                    case 8:
                      this.getDataForItemQ8(resp, i);
                      break;

                  }


                      }, err =>{

                        this.closeVentana();
                        this.toastr.error('No hay datos');

                       });



}

//----------------------------------------

getDataForItemQ8(resp, item){

  switch (item) {
    case 1:
      this.getDataForEchartLine(resp[0], 'testresultscorrection');
      break;
    case 2:
      this.getDataForEchartLine(resp[0], 'wrongpatientresult');
      break;
    case 3:
      this.getDataForEchartLine(resp[0], 'incompleteresults');
      break;
    case 4:
      this.getDataForEchartLine(resp[0], 'unreadableresults');
      break;
    case 5:
      this.getDataForEchartLine(resp[0], 'wrongtestresults');
      break;
    case 6:
      this.getDataForEchartLine(resp[0], 'numbincorrectresultstoproblems');
      break;

    }


}


//----------------

getDataForEchartLine(_arr, itemName: string){



 let _dataSeries1 = [];
 let _dataSeries2 = [];
 let _dataEjeX = [];
 this.totalMes_arr = [];

 let _Metaindicador = '';
 let _total = '';

 switch (this.indexInd) {
  case 1:
    _Metaindicador = 'Metaindicadorq1';   //--total
    _total = 'totalresultsreceived';
    break;
  case 2:
    _Metaindicador = 'Metaindicadorq2';
    break;
  case 3:
    _Metaindicador = 'Metaindicadorq3';
    break;
  case 4:
    _Metaindicador = 'Metaindicadorq4';
    break;
  case 5:
    _Metaindicador = 'Metaindicadorq5';
    break;
  case 6:
    _Metaindicador = 'Metaindicadorq6'; //--total
    _total = 'resultsreceivedxmonths';
    break;
  case 7:
    _Metaindicador = 'Metaindicadorq7';
    break;
  case 8:
    _Metaindicador = 'Metaindicadorq8';  //--total
    _total = 'Totalordersreceived';
    break;

}


 //_arr.sort((a,b)=>a.Año - b.Año ); // TODO: solucionar novedad de mes con el año


  _arr.forEach(item =>{

           if(item.Mes != '0'){

             if(this.indexInd == 1 || this.indexInd == 6 || this.indexInd == 8){

               item[_total] = Number(item[_total]);
                this.totalMes_arr.push(`${item[_total]}`);
               item[itemName] = Number(item[itemName]);
               let p = ( Number(item[itemName])*100)/Number(item[_total]);
              _dataSeries1.push(Math.round(p));
              _dataSeries2.push(Number(item[_Metaindicador]));
              _dataEjeX.push(this.meses.find(m => m.idmes == item.Mes).mes);
              //this.labelsMes_arr.push(`${this.meses.find(m => m.idmes == item.Mes).mes}-${item['Año']}`);


            }else{
              _dataEjeX.push(this.meses.find(m => m.idmes == item.Mes).mes);
             _dataSeries1.push(Number(item[itemName]));
             _dataSeries2.push(Number(item[_Metaindicador]));
            }
           }


  });

this.porcentMes_arr = _dataSeries1;
this.labelsMes_arr = _dataEjeX;
this.graphEChartLine(_dataSeries1, _dataSeries2, _dataEjeX);

}
//----------------------------------------
getReporteGeneral(){


  this.gnl_reporte_arr = [];

  this.postReportesService.getReporGeneral(
                                              this.formulario.get('mes').value,
                                              this.formulario.get('anio').value,
                                              )
                                            .subscribe((resp: any[]) => {

                                                              console.log('General: ', resp);

                                                              if(!resp){
                                                                this.closeVentana();
                                                                this.toastr.error('No hay datos');
                                                               return
                                                             }


                                                             const _arr = [
                                                                resp[0].indicatorsq1[0],
                                                                resp[0].indicatorsq2[0],
                                                                resp[0].indicatorsq3[0],
                                                                resp[0].indicatorsq4[0],
                                                                resp[0].indicatorsq5[0],
                                                                resp[0].indicatorsq6[0],
                                                                resp[0].indicatorsq7[0],
                                                                resp[0].indicatorsq8[0],

                                                               ];

                                                               _arr.forEach(item =>{
                                                                item.PctMesactual = item.PctMesactual.replace(',', '.');
                                                                item.Pctcambio = item.Pctcambio.replace(',', '.');
                                                                item.Pctcambio = item.Pctcambio == '∞'?'...': Math.round(Number(item.Pctcambio));
                                                                item.Sigma = Number(item.Sigma);//Math.round(Number(item.Sigma));
                                                                item.PctMesactual = item.PctMesactual == '∞'?'...': Math.round(item.PctMesactual);
                                                                this.gnl_reporte_arr.push(item);
                                                              });

                                                             console.log(this.gnl_reporte_arr);




                                                        }, err =>{

                                                          this.closeVentana();
                                                          this.toastr.error('No hay datos');



                                                        });

}

//----------------------------------------



  //------------------------
  // MODAL
  //------------------------
closeVentana(): void {
  this.ventanaModal.hide();
  //this.itemInd = null;
}

openModal(templateModal: TemplateRef<any>, size: string) {

if(size == 'modal-xl'){
  this.getReporteGeneral();
}

  this.ventanaModal = this.modalService.show(templateModal,{backdrop: 'static', keyboard: false });
  let modal_size = size;
  this.ventanaModal.setClass(modal_size);

}

openItemModal(templateModal: TemplateRef<any>, item, i) {

  //console.log('Item: ', item);

  if(item.Item.includes('Total')){
   return this.toastr.error('Item no valido');
  }

  this.itemInd = item;
  this.totalMes_arr = [];
  this.labelsMes_arr = [];
  this.porcentMes_arr = [];

  this.ventanaModal = this.modalService.show(templateModal,{backdrop: 'static', keyboard: false });
  let modal_size = 'modal-xl';
  this.ventanaModal.setClass(modal_size);

  this.getDataForItemIndicator(i);


}



//--Line------Graficas----------
graphEChartLine(_series1, _series2, _labels){

   console.log(_series1);
   console.log(_series2);
   console.log(_labels);


  setTimeout(() => {



  const _parent =  document.getElementById('main-line').parentElement;
  const _boxChart = _parent.parentElement; // contenedor de la grafica
  //console.log('boxChart: ',_boxChart.clientWidth);

  var _wChart = 1000;

  if (_boxChart.clientWidth <= 1200) {
    document.getElementById('main-line').style.width = `${_boxChart.clientWidth}px`;
    _wChart = _boxChart.clientWidth * 0.8;

  }


    this.chartLine = echarts.init(document.getElementById('chart-line'), null, {
      width: _wChart,
      height: 400
    });

  this.chartLine.setOption({
    title: {
      text: `% ${this.itemInd.Item}`,
      left: "center",
      top: "top",
      textAlign: "auto"
    },
    tooltip: {},
    grid: {

    },
    xAxis: [{
      type: 'category',
      boundaryGap: false,
      data: _labels,
      axisLabel: {
        fontWeight: 'bold'
      }
    }],
    yAxis:[ {
      type: 'value',
      min: 0,
      max: 100, //this.indexInd == 3? Math.max.apply(null, _series1) + 50:100
      interval: 20,
    }],
    series: [
      {
        name: '%',
        type: 'line',
        data: _series1
      },
      {
        name: '-',
        type: 'line',
        data: _series2,
        showSymbol: true,
        symbolSize: 0,
        lineStyle: {
          color: 'red',
          width: 2,
        },
        itemStyle: {
          borderWidth: 2,
          borderColor: 'red',
          color: 'red'
        },

      }

    ]
  });

  }, 300);



}


//------Bar------

graphEChartBar(_series: any[], _labels: string[]){

  if (this.barHide) {
    return;
  }

  _series.pop();
  _labels.pop();

  let _newLabels = [];

  if (this.indexInd == 2) {
    _labels.forEach((element, index) => {
      _newLabels.push(`${String(index + 1)}`);
    });
  }


  setTimeout(() => {



  const _parent =  document.getElementById('main').parentElement;
  const _boxChart = _parent.parentElement; // contenedor de la grafica
  //console.log('boxChart: ',_boxChart.clientWidth);

  var _wChart = 1000;

  if (_boxChart.clientWidth <= 1200) {
    document.getElementById('main').style.width = `${_boxChart.clientWidth}px`;
    _wChart = _boxChart.clientWidth * 0.9;

  }

  //console.log(_wChart);

   this.chartBar = echarts.init(document.getElementById('chart-bar'), null, {
    width: _wChart,
    height: 400
  });
  // Draw the chart
  this.chartBar.setOption({
  title: {
    text: `% ${this.typeInd}`,
    left: "center",
    top: "top",
    textAlign: "auto"
  },
  tooltip: {
    trigger: 'axis',
    formatter: function (data) {
     // console.log("data",data);
      var filtro = data.filter(dato => dato.componentSubType == 'bar');
      //console.log(filtro);
      var objeto = _labels[filtro[0].dataIndex];
      //console.log(objeto);

      let colorItem = '';
      colorItem = '#3A49A5';

      return '<b>Valor:</b> ' + filtro[0].value + '%' + '<br>' + `<b style="color: ${colorItem}">${objeto}</b>`; //label = filtro[0].axisValueLabel
    }
  },
  xAxis: [{
    type: 'category',
    axisLabel: {
      overflow: "break",
      show: true,
      width: 99,
      interval: 0
    },
    data: _newLabels.length > 0 ?_newLabels:_labels,

  }],
  yAxis:[ {
    type: 'value',
    min: 0,
    max: 100,
    interval: 10,
    axisLabel: {
      show: false
    }

  }],
  series: [
    {
      name: '%',
      type: 'bar',
      label: {
        show: true,
        position: 'top'
      },
      data: _series
    }
  ]
});

}, 300);


}



}
