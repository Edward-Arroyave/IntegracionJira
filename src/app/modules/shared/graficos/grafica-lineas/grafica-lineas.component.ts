import { Component, Input, OnChanges, SimpleChanges, EventEmitter, Output, OnInit } from '@angular/core';
import * as echarts from 'echarts';
import { NgIf } from '@angular/common';
@Component({
    selector: 'app-grafica-lineas',
    templateUrl: './grafica-lineas.component.html',
    styleUrls: ['./grafica-lineas.component.css'],
    standalone: true,
    imports: [NgIf]
})
export class GraficaLineasComponent implements OnChanges,OnInit {

  @Output() base64Lineas1:EventEmitter<string>= new EventEmitter();
  @Output() base64Lineas2:EventEmitter<string>= new EventEmitter();
  @Input() titulo:string='';
  @Input() idG:string='';
  @Input() multiple:boolean=true;

  @Input() data:any[]=[];
  @Input() data2:any[]=[];
  myChart:any;
  myChart2:any;

  constructor() { }
  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges){    
    if(this.titulo === 'Z-Score'){
      setTimeout(() => {
        this.crearGrafica2();
      }, 1000);
      return
    }
    setTimeout(() => {
      this.crearGrafica1();
    }, 1000);
  }

  async crearGrafica1(){
    let xAxix=[];
    let numMayor = 0 ;
    if(this.multiple){
      this.data.map((x,index)=>{
        if(index === 0 ) numMayor = x.data.length;
        if(numMayor < x.data.length ) numMayor = x.data.length;
      })
    }else{
      this.data = this.data.map((x:any,index:number) =>{
        if(index === 0 ) numMayor = x.lineas.desvio.data.length;
        if(numMayor <x.lineas.desvio.data.length ) numMayor = x.lineas.desvio.data.length;
        return x.lineas.desvio
      })
    }
    for (let index = 0; index < numMayor; index++) {
      xAxix.push(index+1)
    }
    
    this.myChart = echarts.init(document.getElementById(this.idG));
    const option={
      title: {
        text: this.titulo,
        left: 'center',
      },
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        show:false
      },
      toolbox: {
        show: true,
        feature: {
          dataView: { readOnly: true ,title:'Información de la grafica'},
        }
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: xAxix
      },
      yAxis: {
        type: 'value',
        // axisLabel: {
        //   formatter: '{value} °C'
        // }
      },
      series: this.data
    };
    this.myChart.setOption(option);
    await new Promise((res,e)=>{  
      this.myChart.on('rendered',() =>{
        res(this.base64Lineas1.emit(this.myChart.getDataURL()));
      });
    })
  }


  async crearGrafica2(){
    let xAxix=[];
    let numMayor = 0 ;
    if(this.multiple){
      this.data2.map((x,index)=>{
        if(index === 0 ) numMayor = x.data.length;
        if(numMayor < x.data.length ) numMayor = x.data.length;
      })
    }else{
      this.data2 = this.data2.map((x:any,index:number) =>{
        if(index === 0 ) numMayor = x.lineas.zScore.data.length;
        if(numMayor <x.lineas.zScore.data.length ) numMayor = x.lineas.zScore.data.length;
        return x.lineas.zScore
      })
    }
    for (let index = 0; index < numMayor; index++) {
      xAxix.push(index+1)
    }
    this.myChart2 = echarts.init(document.getElementById(this.idG));
    
    const option2={
      title: {
        text: this.titulo,
        left: 'center',
      },
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        show:false
      },
      toolbox: {
        show: true,
        feature: {
          dataView: { readOnly: true ,title:'Información de la grafica'},
        }
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: xAxix
      },
      yAxis: {
        type: 'value',
        // axisLabel: {
        //   formatter: '{value} °C'
        // }
      },
      series: this.data2
    };
    this.myChart2.setOption(option2);
    new Promise((res,e)=>{
      this.myChart2.on('rendered',() =>{
        res(this.base64Lineas2.emit(this.myChart2.getDataURL()));
      });   
    })
  }
}
