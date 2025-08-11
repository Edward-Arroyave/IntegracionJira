import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

import { PreIndicadoresService } from '@app/services/pre-analitico/pre-indicadores.service';
import { PreReportesService } from '@app/services/pre-analitico/pre-reportes.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';


import * as echarts from 'echarts';
import { ImageCdnPipe } from '../../../../core/pipes/image-cdn.pipe';
import { NgFor, NgIf, NgClass, DecimalPipe } from '@angular/common';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';


@Component({
    selector: 'app-reportes-pre',
    templateUrl: './reportes-pre.component.html',
    styleUrls: ['./reportes-pre.component.css'],
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, MatFormFieldModule, MatSelectModule, MatOptionModule, NgFor, NgIf, NgClass, DecimalPipe, TranslateModule, ImageCdnPipe]
})
export class ReportesPreComponent implements OnInit {

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
 descripcion:any = ''
  typeInd: string = '';

  screen:number = 0;

  //-----------
  chartBar: any;
  chartLine: any;
  //-----------

  indicadores = [
    {idindicators: 1, nameindicators:'Errores de Identificación del paciente (Q1)'},
    {idindicators: 2, nameindicators:'Muestras rechazadas(Q2)'},
    {idindicators: 3, nameindicators:'Satisfacción en la toma de muestras (Q3)'},
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
              private preIndicadoresService: PreIndicadoresService,
              private preReportesService: PreReportesService,
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
  await this.preIndicadoresService.getAllAsync().then(data => {
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
  if(this.indexInd == 1){
    this.typeInd = 'Ordenes'
  }
  if(this.indexInd == 2){
    this.typeInd = 'Muestras'
  }
  if(this.indexInd == 3){
    this.typeInd = 'Recogida Muestras'
  }

  this.reporte_arr = [];

  this.preReportesService.getReporByIndicator(
                                      this.formulario.get('reporte').value,
                                      this.formulario.get('mes').value,
                                      this.formulario.get('anio').value,
                                      )
                                    .subscribe((resp: any[]) => {


                                                      if(!resp){
                                                        return this.toastr.error('No hay datos');
                                                      }

                                                      if(this.indexInd == 1){
                                                        this.getDataIndicator(resp, 1);
                                                       }

                                                       if(this.indexInd == 2){
                                                        this.getDataIndicator(resp, 2);
                                                       }

                                                       if(this.indexInd == 3){
                                                        this.getDataIndicator(resp, 3);
                                                       }
                                                       console.log('Filtro: ', this.reporte_arr);




                                                }, err =>{

                                                  this.toastr.error('No hay datos');
                                                  this.pageHide = false;
                                                  this.reporte_arr = [];


                                                });



                                                this.preReportesService.getDescripcion(
                                                  this.formulario.get('reporte').value,
                                                  this.formulario.get('mes').value,
                                                  this.formulario.get('anio').value,
                                                  ).subscribe((res:any)=>{
                                                        this.descripcion = res[0]['Descripcion']
                                                        if(this.descripcion == '' || this.descripcion == undefined){
                                                          this.toastr.error('No hay descripcion');

                                                        }
                                                    console.log( this.descripcion);

                                                  },(err:any)=>{
                                                  })

}

getDataIndicator(resp:any[], ind: number){

  let _dataSeries = [];
  let _dataX = [];
  let _arr = [];
console.log("res",resp);

if(ind === 1){

  _arr = [
    resp[0].IllegibleOrder[0],
    resp[0].ErrorOrder[0],
    resp[0].RequestmissInfo[0],
    resp[0].Requestirrelevantevidence[0],
    resp[0].Transcriptionerrorsample[0],
    resp[0].TotalOrder[0]
   ];

  }

  if(ind === 2){

    _arr = [
        resp[0].rejectlostsample[0],
        resp[0].rejectnotreceivedsample[0],
        resp[0].unlabeledsample[0],
        resp[0].mislabeledsample[0],
        resp[0].misidentifiedsample[0],
        resp[0].sampleinsufficient[0],
        resp[0].sampleanticoagulant[0],
        resp[0].requestnotmatchsample[0],
        resp[0].wrongcolecontainer[0],
        resp[0].sampletimeold[0],
        resp[0].hemolyzedsample[0],
        resp[0].lipemia[0],
        resp[0].ictericlipemia[0],
        resp[0].clottedsample[0],
        resp[0].contaminatedsample[0],
        resp[0].samplesdamaged[0],
        resp[0].samplenotstoreddatcorrecttemptrs[0],
        resp[0].collectioncontainerrupture[0],
        resp[0].samplesnotstoredcorrectly[0],
        resp[0].numbersamplesexcesstrstime[0],
        resp[0].totalsamplesrejected[0],
        resp[0].totalsamples[0],
    ];
  }

  if(ind === 3){

    _arr = [
      resp[0].satisfcollecsample[0],
     ];

    }

   //Se comentarea la validación para permitir ver los datos del reporte
   //const _nodata = _arr.find(item =>item.MesPrevio == '0' || item.Mesactual == '0' );

   /*
   if(_nodata){
    this.pageHide = false;
    this.reporte_arr = [];
    this.toastr.error('No se encuentra información para generar Reporte');

  }else{
*/
    _arr.forEach(item =>{
      item.PctMesactual =  parseFloat(item.PctMesactual.replace(',', '.')).toFixed(2)  ;
      item.Pctcambio =  parseFloat(item.Pctcambio.replace(',', '.')).toFixed(2)  ;

      item.Pctcambio = parseFloat(item.Pctcambio).toFixed(2)  ;
      item.Sigma = Number(item.Sigma);//Math.round(Number(item.Sigma));
      item.PctMesactual =  parseFloat(item.PctMesactual ).toFixed(2)  ;
      _dataSeries.push( parseFloat(item.PctMesactual ).toFixed(2) );
      _dataX.push(item.Item); // nombre del Item
      this.reporte_arr.push(item);
    });

    this.pageHide = true;
    this.barHide = ind == 3 ? true : false;
    this.graphEChartBar(_dataSeries, _dataX);

 // }

}

//-------------------------------------------------
//   Data modale Tabla & Grafica
//-------------------------------------------------

getDataForItemIndicator(i){


this.preReportesService.getReporGraph(this.indexInd, i,  this.formulario.get('anio').value)
                       .subscribe((resp: any) =>{
                         console.log('Item Selected: ', resp);

                         if(!resp){
                           this.closeVentana();
                           this.toastr.error('No hay datos');
                          return
                        }


                        if(this.indexInd == 1){
                         this.getDataIndicatorByItemQ1(i, resp)
                        }

                        if(this.indexInd == 2){
                         this.getDataIndicatorByItemQ2(i, resp)
                        }

                        if(this.indexInd == 3){
                         this.getDataIndicatorByItemQ3(i, resp)
                        }




                      }, err =>{

                        this.closeVentana();
                        this.toastr.error('No hay datos');



                      });



}

//----------------------------------------


getDataIndicatorByItemQ1(i:number, resp:any[]){


  let itemName = '';

  switch (i) {
    case 1:
      itemName = 'IllegibleOrder';
      break;
    case 2:
      itemName = 'Ordererror';
      break;
    case 3:
      itemName = 'Requestmissinfo';
      break;
    case 4:
      itemName = 'Requestirreevid';
      break;
    case 5:
      itemName = 'Transcriptionerrorsample';
      break;

      default:
       this.toastr.info('Los datos no son validos');
  }

  this.getDataForEchartLine(resp[0], itemName);

}

getDataIndicatorByItemQ2(i:number, resp:any[]){

  //console.log(resp);


  let itemName = '';

  switch (i) {
    case 1:
       itemName = 'rejectlostsample';
      break;
    case 2:
       itemName = 'rejectnotreceivedsample';
      break;
    case 3:
       itemName = 'unlabeledsample';
      break;
    case 4:
       itemName = 'mislabeledsample';
      break;
    case 5:
       itemName = 'misidentifiedsample';
      break;
    case 6:
       itemName = 'sampleinsufficient';
      break;
    case 7:
       itemName = 'sampleanticoagulant';
      break;
    case 8:
       itemName = 'requestnotmatchsample';
      break;
    case 9:
       itemName = 'wrongcolecontainer';
      break;
    case 10:
       itemName = 'sampletimeold';
      break;
    case 11:
       itemName = 'hemolyzedsample';
      break;
    case 12:
       itemName = 'lipemia';
      break;
    case 13:
       itemName = 'ictericlipemia';
      break;
    case 14:
       itemName = 'clottedsample';
      break;
    case 15:
       itemName = 'contaminatedsample';
      break;
    case 16:
       itemName = 'samplesdamaged';
      break;
    case 17:
       itemName = 'samplenotstoreddatcorrecttemptrs';
      break;
    case 18:
       itemName = 'collectioncontainerrupture';
      break;
    case 19:
       itemName = 'samplesnotstoredcorrectly';
      break;
    case 20:
       itemName = 'numbersamplesexcesstrstime';
      break;

      default:
       this.toastr.info('Los datos no son validos');
  }


  this.getDataForEchartLine(resp[0], itemName);


}

getDataIndicatorByItemQ3(i:number, resp:any[]){

  this.getDataForEchartLine(resp[0], 'satisfcollecsample');

}


//----------------

getDataForEchartLine(_arr, itemName: string){

  console.log(this.indexInd);

 let _dataSeries1 = [];
 let _dataSeries2 = [];
 let _dataX = [];
 this.totalMes_arr = [];
 this.totalSampleMes_arr = [];

 let _Metaindicador = '';
 let _total = '';

 switch (this.indexInd) {
  case 1:
    _Metaindicador = 'Metaindicadorq1';
    _total = 'Ordertotal';
    break;
  case 2:
    _Metaindicador = 'Metaindicadorq2';
    _total = 'Totalsamples';
    break;
  case 3:
    _Metaindicador = 'Metaindicadorq3';

    break;
    default:
     this.toastr.info('Los datos no son validos');
}






 //_arr.sort((a,b)=>a.Año - b.Año ); // TODO: solucionar novedad de mes con el año
  console.log(_total);

  _arr.forEach(item =>{

           if(item.Mes != '0'){

             if(this.indexInd !== 3){

               item[_total] = Number(item[_total]);
                this.totalMes_arr.push(`${item[_total]}`);
               item[itemName] = Number(item[itemName]);
               let p = ( Number(item[itemName])*100)/Number(item[_total]);
              _dataSeries1.push(Math.round(p));
              _dataSeries2.push(Number(item[_Metaindicador]));
              _dataX.push(this.meses.find(m => m.idmes == item.Mes).mes);
              //this.labelsMes_arr.push(`${this.meses.find(m => m.idmes == item.Mes).mes}-${item['Año']}`);
              if(this.indexInd === 2){
                this.totalSampleMes_arr.push(Number(item.Totalsamplesrejected));
              }

            }else{
              _dataX.push(this.meses.find(m => m.idmes == item.Mes).mes);
             _dataSeries1.push(Number(item[itemName]));
             _dataSeries2.push(Number(item[_Metaindicador]));
            }
           }


  });

this.porcentMes_arr = _dataSeries1;
this.labelsMes_arr = _dataX;
this.graphEChartLine(_dataSeries1, _dataSeries2, _dataX);

}
//----------------------------------------
getReporteGeneral(){


  this.gnl_reporte_arr = [];
  this.preReportesService.getReporGeneral(
                                              this.formulario.get('mes').value,
                                              this.formulario.get('anio').value,
                                              )
                                            .subscribe((resp: any[]) => {


                                                              if(!resp){
                                                                this.closeVentana();
                                                                this.toastr.error('No hay datos');
                                                               return
                                                             }


                                                             const _arr = [
                                                                resp[0].indicatorsq1[0],
                                                                resp[0].indicatorsq2[0],
                                                                resp[0].indicatorsq3[0],

                                                               ];

                                                             console.log("arre",_arr);

                                                               _arr.forEach(item =>{

                                                                item.Pctcambio = item.Pctcambio == '∞'?'...': parseFloat( item.Pctcambio ).toFixed(2) ;
                                                                item.Sigma = Number(item.Sigma);//Math.round(Number(item.Sigma));
                                                                item.PctMesactual = item.PctMesactual == '∞'?'...': parseFloat(item.PctMesactual).toFixed(2)  ;
                                                                this.gnl_reporte_arr.push(item);

                                                                item.PctMesactual =  parseFloat(item.PctMesactual.replace(',', '.') ).toFixed(2) ;
                                                                item.Pctcambio = parseFloat( item.Pctcambio.replace(',', '.') ).toFixed(2) ;


                                                              });

                                                             console.log("arre",this.gnl_reporte_arr);




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

  console.log('Item: ', item);

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

graphEChartBar(_series, _labels){

  _series.pop();
  _labels.pop();
console.log("Series",_series);

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
    text: `% Rechazo de ${this.typeInd} (motivos de rechazo)`,
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


