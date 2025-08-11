import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ProgramasQceService } from '@app/services/configuracion/programas-qce.service';
import { ReportesExternoService } from '@app/services/calidad-externo/reportesExterno.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { LaboratoriosService } from '@app/services/configuracion/laboratorios.service';

import dayjs from 'dayjs';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { Canvas, Cell, Columns, Img, ITable, Line, PdfMakeWrapper, Stack, Table, TextReference, Txt } from 'pdfmake-wrapper';
import { ImageCdnPipe } from '../../../../../core/pipes/image-cdn.pipe';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgFor, NgIf } from '@angular/common';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { LoaderService } from '@app/services/loader/loader.service';


//---Interface ----------
interface DataTable{

  c: string;
  concordanciaglobal: string;
  desanalyte: string;
  desempenoglobal: string;
  fn: string;
  fp: string;
  i: string;
  idanalyte: string;
  idclient: string;
  idsample: string;
  nameclient: string;
  namesample: string;
  nrosample: string;
  resultado: string;
  valuetype: string;
  vn: string;
  vp: string;

}

interface DataTableLeft{

  idclient: string; 
  nameclient: string; 

}
interface DataTableMiddle{

  resultado: string; 
  vp: string;
  vn: string;
  fn: string;
  fp: string;
  i: string;
  c: string;
  //valuetype: string;

}
interface DataTableRight{

  concordanciaglobal: string; 
  desempenoglobal: string; 

}



@Component({
    selector: 'app-reporte-resultado-participantes',
    templateUrl: './reporte-resultado-participantes.component.html',
    styleUrls: ['./reporte-resultado-participantes.component.css'],
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, MatFormFieldModule, MatSelectModule, MatOptionModule, NgFor, MatTooltipModule, NgIf, CollapseModule, TranslateModule, ImageCdnPipe]
})

export class ReporteResultadoParticipantesComponent implements OnInit {

  programas = [];
  analitos = [];
  rondas = [];

  dataApi = [];
  analitosFiltrados = [];
  muestras = [];

  dataTable = [];
  calculados = [];

  contador = 0;

  dataIdCliente = [];

  isCollapsed = -1;
  infoPrograma: string = '';
  infoAnalito: string = '';
  infoRonda: number;
  selected = '';
  show = false;
  logo: string = '';
  logoSourceToPDF: string;

  hoy = dayjs().format('YYYY-MM-DD');
  hoyPdf = dayjs().format('DD-MM-YYYY');

  form: FormGroup = this.fb.group({

    programa: ['', [Validators.required]],
    analito: ['', [Validators.required]],
    ronda: ['', [Validators.required]]

  });


  
  images = [];
  analyteName = '';

  clienteName: string;
  clienteNit: string;
  clienteAddres: string;


  constructor(

    private fb: FormBuilder,
    private programQceService: ProgramasQceService,
    private reportesExternoService: ReportesExternoService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private laboratoriosService: LaboratoriosService,
    private loader: LoaderService

  ) { }

  ngOnInit() {

    this.programQceService.getAllAsync().then(respuesta => {

      this.programas = respuesta.filter(datos => datos.active);

    });

    this.laboratoriosService.getLogoImage().subscribe(data => {

      this.logo = data;
      this.logoSourceToPDF = `data:image/jpg;base64,${data}`;

    });

    this.filtrar();
    this.validarCliente();
    

  }

  validarCliente() {

    this.laboratoriosService.getAllAsync().then(lab => {
      //console.log(lab);
      this.clienteName = lab[0].name;     
      this.clienteNit = lab[0].nit;     
      this.clienteAddres = lab[0].addres;     

    });

  }

  selectAll(control: string) {

    this.form.get(control).setValue(['-1']);

  }

  selectNone(control: string) {

    this.form.get(control).setValue('');

  }

  selectOne(control: string) {

    if (this.form.get(control).value[0] == '-1' || this.form.get(control).value[0] == '') {

      this.form.get(control).value.shift();
      this.form.get(control).setValue(this.form.get(control).value);

    }

  }

  paginacion(idSample: any){

    if(idSample != ''){

      var objeto = this.muestras.find(obj => obj.idsample == idSample);
      this.contador = this.muestras.indexOf(objeto);
      this.contador += 1;

    }

  }

  filtrar() {

    this.form.get('programa').valueChanges.subscribe(programa => {

      this.analitos = [];
      this.rondas = [];
      this.form.get('analito').setValue('');
      this.form.get('ronda').setValue('');

      if (programa != '') {

        this.reportesExternoService.getAnalitos(programa).subscribe((datos: any) => {
          this.analitos = datos;
        }, _ => {
          this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.NOHAYANALITOS'));
        });

        this.reportesExternoService.getRondas(programa).subscribe((datos: any) => {
          this.rondas = datos;
        }, _ => {
          this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.NOHAYRONDAS'));
        });

      }

    });

  }

  async search() { // genera el reporte

    if (this.form.valid) {

      this.show = false;
      this.isCollapsed = -1;
      this.selected = '';
      this.analitosFiltrados = [];
      this.loader.show();

      var txtAnalitos: string = '';

      var programa = this.programas.find(dato => dato.idProgram == this.form.value.programa);
      this.infoPrograma = programa.desprogram;
      this.infoRonda = this.form.value.ronda;

      for (let i = 0; i < this.form.value.analito.length; i++) {

        if (this.form.value.analito[0] == '-1') {

          this.infoAnalito = 'Todos';
          break;

        } else {

          var analito = this.analitos.find(dato => dato.Idanalytes == this.form.value.analito[i]);
          txtAnalitos += analito.Desanalytes + ', ';
          this.infoAnalito = txtAnalitos;

        }

      }

      var json = {

        Idprogram: this.form.value.programa,
        IdAnalytes: this.form.value.analito.join(),
        Nroround: this.form.value.ronda

      }

     await this.reportesExternoService.getDatos(json).subscribe((data: any) => {

        console.log('dataAPI: ', data);
        

        this.dataApi = data;
        this.buildData();

        setTimeout(() => {

          this.show = true;
          this.loader.hide();

        }, 3000);

      }, error => {

        this.loader.hide();
        this.toastr.error('No se encontraron datos');

      });

    }

  }

  buildData() {

    let analitos = [];

    for (let i = 0; i < this.dataApi.length; i++) {

      !analitos.includes(this.dataApi[i].idanalyte) ? analitos.push(this.dataApi[i].idanalyte) : '';

    }

    for (let i = 0; i < analitos.length; i++) {

      this.analitosFiltrados.push(this.dataApi.find(analito => analito.idanalyte == analitos[i]));

    }

  }

  calcular(arr: Array<any>): Array<any> {

    var consenso: string = '';
    var arreglo = [];
    var vp: number = 0, vn: number = 0, fn: number = 0, fp: number = 0, I: number = 0, reactivo: number = 0, noReactivo: number = 0, indeterminado: number = 0;

    for (let i = 0; i < arr.length; i++) {

      vp += Number(arr[i].vp);
      vn += Number(arr[i].vn);
      fn += Number(arr[i].fn);
      fp += Number(arr[i].fp);
      I += Number(arr[i].i);

      arr[i].resultado == 'positivo' ? reactivo += 1 : arr[i].resultado == 'negativo' ? noReactivo += 1 : indeterminado += 1;

    }

    if (reactivo > noReactivo && reactivo > indeterminado) {
      consenso = 'positivo'

    } else if (noReactivo > reactivo && noReactivo > indeterminado) {
      consenso = 'negativo'

    } else if (indeterminado > reactivo && indeterminado > noReactivo) {
      consenso = 'ind'

    } else {

      consenso = '-'

    }

    arreglo.push(vp, vn, fn, fp, I, reactivo, noReactivo, indeterminado, consenso);
    return arreglo;

  }

  collapse(i: any, objeto: any) {  
    
   
    const descAnalyte = objeto.desanalyte.toString();       
    this.analyteName = descAnalyte.charAt(0).toUpperCase() + descAnalyte.slice(1).toLowerCase();           

    this.isCollapsed = i;
    this.selected = '';
    this.dataTable = [];
    this.calculados = [];

    var analitos: Array<any> = this.dataApi.filter(analito => analito.idanalyte == objeto.idanalyte);

    var muestrasFiltradas = [];
    var muestrasDos = [];

    for (let i = 0; i < analitos.length; i++) {

      !muestrasFiltradas.includes(analitos[i].idsample) ? muestrasFiltradas.push(analitos[i].idsample) : '';

    }

    for (let i = 0; i < muestrasFiltradas.length; i++) {

      muestrasDos.push(analitos.find(analito => analito.idsample == muestrasFiltradas[i]));

    }

    this.muestras = muestrasDos.sort((firstItem, secondItem) => parseInt(firstItem.nrosample) - parseInt(secondItem.nrosample));

    for (let i = 0; i < this.muestras.length; i++) {

      var arr = analitos.filter(dato => dato.idsample == this.muestras[i].idsample);
      this.dataTable.push(arr);
      this.calculados.push(this.calcular(arr));

    }

    this.dataIdCliente = this.dataTable[0];  

  }




  getClippedRegion(image, x, y, width, height) {

    var canvas = document.createElement("canvas"),
      ctx = canvas.getContext("2d");

    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(image, x, y, width, height, 0, 0, width, height);

    return {

      image: canvas.toDataURL(),
      width: 1000

    };

  }


getCollapsesData(i: any, objeto: any) {

return new Promise((resolve, reject) =>{

  //this.isCollapsed = i; 
  this.dataTable = [];
  this.calculados = [];
  this.dataIdCliente = [];

  var analitos: Array<any> = this.dataApi.filter(analito => analito.idanalyte == objeto.idanalyte);

  var muestrasFiltradas = [];
  var muestrasDos = [];

  for (let i = 0; i < analitos.length; i++) {

    !muestrasFiltradas.includes(analitos[i].idsample) ? muestrasFiltradas.push(analitos[i].idsample) : '';

  }

  for (let i = 0; i < muestrasFiltradas.length; i++) {

    muestrasDos.push(analitos.find(analito => analito.idsample == muestrasFiltradas[i]));

  }

  this.muestras = muestrasDos.sort((firstItem, secondItem) => parseInt(firstItem.nrosample) - parseInt(secondItem.nrosample));

  for (let i = 0; i < this.muestras.length; i++) {

    var arr = analitos.filter(dato => dato.idsample == this.muestras[i].idsample);
    this.dataTable.push(arr); // datos de la tabla
    this.calculados.push(this.calcular(arr));

  }

  this.dataIdCliente = this.dataTable[0];


  // setTimeout(() => {
        console.log("Promesa: ", i)
      
        if(this.dataTable.length == this.muestras.length && this.dataIdCliente.length > 0){
          
          // console.log('Data Table', this.dataTable);
          // console.log('Data Calculos', this.calculados);
          // console.log('Data idClient', this.dataIdCliente);
          
          
          resolve('ok');
        }else{
          reject('Error');
        }
    // }, 500);
});

}

//------------------------------------------------

createTableLeft(data: DataTableLeft[]): ITable{
  return new Table([
     // ------ Tabla Superior ------------
    [
      {text: 'ID Laboratorio', style: 'tableHeader', alignment: 'center', bold: true, color: '#FFFFFF', fillColor:'#3850eb'},
      {text: 'Nombre Laboratorio', style: 'tableHeader', alignment: 'center', bold: true, color: '#FFFFFF', fillColor:'#3850eb'},         
    ],
   
    ...new Set(this.extractDataleft(data)),

    // ------ Tabla Inferior ------------
    [ {text: '', colSpan: 2, border: [false, false, false, false], fillColor: '#FFFFFF'},{}],
    [ {text: 'VALOR ASIGNADO', style: 'tableHeader', colSpan: 2, alignment: 'right', bold: true, color: '#FFFFFF', fillColor:'#6b4b8b'},{}],
    [ {text: 'CONSENSO', alignment: 'right', colSpan: 2},{}],
    [ {text: 'Reactivo', alignment: 'right', colSpan: 2},{}],
    [ {text: 'No Reactivo', alignment: 'right', colSpan: 2},{}],
    [ {text: 'Indeterminado', alignment: 'right', colSpan: 2},{}],
    [ {text: 'No total de Participantes', alignment: 'right', colSpan: 2},{}],
    [ {text: 'Minimo concenso(80%)', alignment: 'right', colSpan: 2},{}],
  ])
  .width('auto')
  .widths('auto') 
  .layout({
    fillColor:(rowIndex: number, node: any, columnIndex: number) =>{
      return rowIndex % 2 === 0? '#F9F9F9': '#FFFFFF'
    },
    hLineColor:(rowIndex: number, node: any, columnIndex: number)=>{
      return rowIndex  <= 0? '#3850eb': '#FFFFFF';
    },
    vLineColor:(rowIndex: number, node: any, columnIndex: number)=>{
      return columnIndex == 0 ? '#3850eb': '#FFFFFF';
    },
    hLineWidth: (i?:number, node?:any, columnIndex?:any) => 0.5,
  })
  .fontSize(12)
  .end;
}

createTableMiddle(data: any[]): ITable{


// console.log('DataTableMiddle', data);
// console.log('Calculados > ', this.calculados);


  return new Table([ 
    // ------ Tabla Superior ------------
    [
      {text: `${data[0].namesample}`, style: 'tableHeader', alignment: 'center', bold: true, color: '#FFFFFF', fillColor:'#3850eb'},
      {text: 'VP', style: 'tableHeader', alignment: 'center', bold: true, color: '#FFFFFF', fillColor:'#3850eb'},         
      {text: 'VN', style: 'tableHeader', alignment: 'center', bold: true, color: '#FFFFFF', fillColor:'#3850eb'},         
      {text: 'FN', style: 'tableHeader', alignment: 'center', bold: true, color: '#FFFFFF', fillColor:'#3850eb'},         
      {text: 'FP', style: 'tableHeader', alignment: 'center', bold: true, color: '#FFFFFF', fillColor:'#3850eb'},         
      {text: 'I', style: 'tableHeader', alignment: 'center', bold: true, color: '#FFFFFF', fillColor:'#3850eb'},         
      {text: '%C', style: 'tableHeader', alignment: 'center', bold: true, color: '#FFFFFF', fillColor:'#3850eb'},
          
    ],
   
    ...this.extractDataMiddle(data),

    // ------ Tabla Inferior ------------
    [ {text: '', colSpan: 7, border: [false, false, false, false], fillColor: '#FFFFFF'},{},{},{},{},{},{}],
    [ {text: `${data[0].valuetype == 'VN' ? 'Negativo' : data[0].valuetype == 'VP' ? 'Positivo' : 'Indefinido' }`, style: 'tableHeader', colSpan: 7, alignment: 'center', bold: true, color: '#FFFFFF', fillColor:'#6b4b8b'},{},{},{},{},{},{}],
    [
    {text: `${this.calculados[0][8]}`, border: [false, false, false, false]},
    {text: `${this.calculados[0][0]}`, border: [false, false, false, false]},
    {text: `${this.calculados[0][1]}`, border: [false, false, false, false]},
    {text: `${this.calculados[0][2]}`, border: [false, false, false, false]},
    {text: `${this.calculados[0][3]}`, border: [false, false, false, false]},
    {text: `${this.calculados[0][4]}`, border: [false, false, false, false]},
    {text:"",	border: [false, false, false, false]}
  ],
  [
    {text: `${this.calculados[0][5]}`, border: [false, false, false, false]},
    {text:"", border: [false, false, false, false]},
    {text:"", border: [false, false, false, false]},
    {text:"", border: [false, false, false, false]},
    {text:"", border: [false, false, false, false]},
    {text:"", border: [false, false, false, false]},
    {text:"", border: [false, false, false, false]}
],
  [
    {text: `${this.calculados[0][6]}`, border: [false, false, false, false]},
    {text:"", border: [false, false, false, false]},
    {text:"", border: [false, false, false, false]},
    {text:"", border: [false, false, false, false]},
    {text:"", border: [false, false, false, false]},
    {text:"", border: [false, false, false, false]},
    {text:"", border: [false, false, false, false]}
],
  [
    {text: `${this.calculados[0][7]}`, border: [false, false, false, false]},
    {text:"", border: [false, false, false, false]},
    {text:"", border: [false, false, false, false]},
    {text:"", border: [false, false, false, false]},
    {text:"", border: [false, false, false, false]},
    {text:"", border: [false, false, false, false]},
    {text:"", border: [false, false, false, false]}
],
  [
   {text: `${data.length}`, border: [false, false, false, false]},
   {text:"", border: [false, false, false, false]},
   {text:"", border: [false, false, false, false]},
   {text:"", border: [false, false, false, false]},
   {text:"", border: [false, false, false, false]},
   {text:"", border: [false, false, false, false]},
   {text:"", border: [false, false, false, false]}
],
  [
   {text: `${ (80 * data.length) / 100}`, border: [false, false, false, false]},
   {text:"", border: [false, false, false, false]},
   {text:"", border: [false, false, false, false]},
   {text:"", border: [false, false, false, false]},
   {text:"", border: [false, false, false, false]},
   {text:"", border: [false, false, false, false]},
   {text:"", border: [false, false, false, false]}
],
  ])
  .width('auto')
  .widths('auto') 
  .layout({
    fillColor:(rowIndex: number, node: any, columnIndex: number) =>{
      return rowIndex % 2 === 0? '#F9F9F9': '#FFFFFF'
    },
    hLineColor:(rowIndex: number, node: any, columnIndex: number)=>{
      return rowIndex  <= 0? '#3850eb': '#FFFFFF';
    },
    vLineColor:(rowIndex: number, node: any, columnIndex: number)=>{
      return columnIndex == 0 ? '#3850eb': '#FFFFFF';
    },
    hLineWidth: (i?:number, node?:any, columnIndex?:any) => 0.5,
  })
  .fontSize(12)
  .end;
}

createTableRight(data: DataTableRight[]): ITable{
  return new Table([
    [
      {text: '%Concordancia Global', style: 'tableHeader', alignment: 'center', bold: true, color: '#FFFFFF', fillColor:'#3850eb'},
      {text: 'Desempeño GLobal', style: 'tableHeader', alignment: 'center', bold: true, color: '#FFFFFF', fillColor:'#3850eb'},         
    ],
   
    ...this.extractDataRight(data)
  ])
  .width('auto')
  .widths('auto') 
  .layout({
    fillColor:(rowIndex: number, node: any, columnIndex: number) =>{
      return rowIndex % 2 === 0? '#F9F9F9': '#FFFFFF'
    },
    hLineColor:(rowIndex: number, node: any, columnIndex: number)=>{
      return rowIndex  <= 0? '#3850eb': '#FFFFFF';
    },
    vLineColor:(rowIndex: number, node: any, columnIndex: number)=>{
      return columnIndex == 0 ? '#3850eb': '#FFFFFF';
    },
    hLineWidth: (i?:number, node?:any, columnIndex?:any) => 0.5,
  })
  .fontSize(12)
  .end;
}

// ---------------------------------------------
// ------------Descarga el PDF------------
// ---------------------------------------------
  async downloadPDF() {

    //console.log('Analitos Filtrados: ', this.analitosFiltrados);   
   
  


    const analytesSelected = this.form.value.analito.join() == '-1'? 'Todos': this.form.value.analito.join();

      // Archivo PDF - construccion      
      PdfMakeWrapper.setFonts(pdfFonts);
                      
      const pdf = new PdfMakeWrapper();

      pdf.pageSize('A3');
      pdf.pageOrientation('landscape');
      pdf.pageMargins([ 30, 50, 30, 50 ]);    
      

       // itera las paginas
      for (let i = 0; i < this.analitosFiltrados.length; i++) {     
       

        await this.getCollapsesData(i, this.analitosFiltrados[i]).then(res =>{


          
          if(res == 'ok'){

                                      // REPORT
                                //pdf.header('This is a header');     
                                //pdf.add( await new Img(this.logoSourceToPDF).width(140).build() ); 
                             
                              pdf.add(new Columns([ // Encabezado
                                {
                                  width: '*',
                                  text: ''
                                  
                              },
                              {
                                width: 'auto',
                                alignment: 'left',  
                                stack: [
                                    {
                                        width: 140,
                                        image:  this.logoSourceToPDF
                                    }
                                  ]
                              },
                              {
                                  width: 'auto',   
                                  color: '#848484',                
                                  text: `${this.clienteName}\n${this.clienteNit}\n${this.clienteAddres}`,
                              },
                              {
                                width: '*',
                                text: ''
                                
                            },
                          ]).columnGap(0).end);
                          pdf.add(pdf.ln(1));
                          pdf.add(
                            new Canvas([
                                new Line([10,0], [1100, 0])
                                .color('#3850eb')
                                .end
                            ])            
                            .end
                        );
                        pdf.add(pdf.ln(2));
                        pdf.add(
                          new Table(
                             [
                                [
                                  { 
                                     text: `Resultado Participantes - Datos Control\nPrograma: ${this.form.value.programa} - Analitos:${analytesSelected} - Ronda: ${this.form.value.ronda}\nReporte Generado: ${this.hoyPdf}`,                      
                                     color: '#848484', 
                                     fillColor:'#F9F9F9',
                                     border: [false, false, false, false],
                                     alignment: 'center',
                                     fontSize: 10,
                                    }
                                ],
                              ]              
                          ).widths('*').end
                        );
                        pdf.add(pdf.ln(2));
        

                          // tablas middles
                            
                              var arrT_body = [];
             


                          // iteracion para tablas Middle-Superior * Analito
                          this.dataTable.forEach((item, index)=>{
                           
                              //console.log(item);                       
                              var t = this.createTableMiddle(item);
                                            
                              arrT_body.push(t);                     
        
                          });
                          
                          // modiifcando la tabla
                          var _tablesMiddle = new Table([arrT_body])
                                                          .width('auto')
                                                          .widths('auto') 
                                                          .layout({
                                                            hLineColor:()=>'#FFFFFF',
                                                            vLineColor:()=>'#FFFFFF',
                                                            paddingTop:()=>0,
                                                            paddingLeft:()=>0,
                                                            paddingRight:()=>0,
                                                            paddingBottom:()=>0,
                                                            }                                                  
                                                          )
                                                          .fontSize(12)
                                                          .end;
                        
                                  
                          const descAnalyte = this.analitosFiltrados[i].desanalyte;       
                          const analitoName = descAnalyte.charAt(0).toUpperCase() + descAnalyte.slice(1).toLowerCase();  
                         
                          // Nombre Analito - linea purple
                          pdf.add(	{
                                        stack: [
                                                  {
                            
                                                   text: `${analitoName}`,                      
                                                   color: '#373737',                   
                                                   fontSize: 12,                                 
                            
                                                  }
                                          ],
                                          margin: [12, 5, 0, 3] //[r, t, l, b]
                                        });
                          
                          pdf.add(
                            new Canvas([
                                new Line([10,0], [1100, 0])
                                .color('#6b4b8b') //purple-1
                                .end
                            ])            
                            .end
                        );
                          pdf.add(pdf.ln(1));
        
                          pdf.add(new Columns( // --- Tabla Superior ---
                            [
                              //new Txt("").width('*').end,// ayuda a centrar
                              this.createTableLeft(this.dataIdCliente),                      
                              _tablesMiddle,                              
                              this.createTableRight(this.dataIdCliente),
                              //new Txt("").width('*').end,
                            ]
                           ).columnGap(0).end);                 
                           
                           pdf.add(pdf.ln(2)); 
                           

                          if(i < (this.analitosFiltrados.length - 1)){
                            pdf.add(
                              new TextReference(`page${i}`).end // returns the text: This is the text to be referenced
                             );
                            pdf.add(
                                  new Txt("").pageBreak('before').id(`page${i}`).end
                              ); 
  
                          }
                              
                         



                }





              }).catch(err => {
                console.log(err);
                
              });     
            
        
     
       
    } // end For


     

        //pdf.create().download();
        pdf.create().open(); 







  }

//----------------
extractDataleft(data: DataTableLeft[]){

  return data.map((row, index)=>
              [
                row.idclient,
                row.nameclient
              
              ]

        );

}
extractDataMiddle(data: DataTableMiddle[]){

  return data.map((row, index)=>
              [            

                  row.resultado,  
                  row.vp, 
                  row.vn, 
                  row.fn, 
                  row.fp, 
                  row.i, 
                  row.c,  
                  //row.valuetype            
              
              ]

        );

}
extractDataRight(data: DataTableRight[]){

  return data.map((row, index)=>
              [            
                      
                  row.concordanciaglobal,
                  row.desempenoglobal,                             
              
              ]

        );

}
//----------------------

  downloadPDFByImages() {
  
    this.images = [];
  
    const options = {
      background: 'white',
      scale: 3
    };

    const PDF = document.getElementById('boxPDF');
    const DATA = document.getElementById('htmlData');
    DATA.hidden = false;

    while (PDF.firstChild) {
      PDF.removeChild(PDF.firstChild);
     }
  
    const logo = document.getElementById('boxLogo').cloneNode(true);
    const info = document.getElementById('boxInfo').cloneNode(true);

    const imgUno = document.createElement('div');
    imgUno.append(logo, info);
    PDF.append(imgUno);
    
   
    for (let i = 0; i < this.analitosFiltrados.length; i++) {  

      this.collapse(i, this.analitosFiltrados[i]); // set collapse 
     
      setTimeout(() => {       
       

        this.getCollapsesData(i, this.analitosFiltrados[i]).then(res =>{
                
          if(res == 'ok'){             
                    
            const descAnalyte = this.analitosFiltrados[i].desanalyte;       
            this.analyteName = descAnalyte.charAt(0).toUpperCase() + descAnalyte.slice(1).toLowerCase();              
              
                html2canvas(DATA, options).then((canvas) => {    
            
                  //this.images = [];        
                    var img = document.createElement('img');
                   

                    img.src = canvas.toDataURL();
                     img.width = 1490;
                     img.height = i == 0? 730: 1000;




                    PDF.append(img);
                   

                    this.images.push(img);

                  if(this.images.length == this.analitosFiltrados.length) {
                          html2canvas(PDF, options).then((_canvas) => { 
      
      
                            let splitAt = 775;
      
                            let images = [];
                            let y = 0;
                            while (_canvas.height > y) {
                              images.push(this.getClippedRegion(_canvas, 0, y, _canvas.width, splitAt));
                              y += splitAt;
                            }
      
                            var docDefinition = {
                              content: images,
                              pageSize: "A3",
                              pageMargins: [45, 13, 45, 13],
                              pageOrientation: 'landscape'
                            };
                      
                            //pdfMake.createPdf(docDefinition).open();
                           
                              // while (PDF.firstChild) {
                              //   PDF.removeChild(PDF.firstChild);
                              // }

                              DATA.hidden = true;
                            

                          });
                  }                     

                                          
            
                });                
        
  
          }
        }).catch(err => {
          console.log(err);
          
        });

            
        
      }, 5000);    
       
    } 

  }



  downloadPDFByPages() {

    if (this.analitosFiltrados.length > 0) {

      
      var PDF = document.getElementById('boxPDF');
      const DATA = document.getElementById('htmlData');
      DATA.hidden = false;
     
      var logo = document.getElementById('boxLogo').cloneNode(true);
     
      
       logo.childNodes[0].parentElement.children[0].classList.remove("logo");
       logo.childNodes[0].parentElement.children[0].setAttribute("width","100");
       logo.childNodes[0].parentElement.children[0].setAttribute("height","70");
      
     
      var hr = document.createElement('hr');
      hr.style.backgroundColor = "blue";
      hr.style.width = "75%";     
      var info = document.getElementById('boxInfo').cloneNode(true);

      // se modifican los estilos 
      info.childNodes[0].lastChild.parentElement.style.fontWeight = "100";
      info.childNodes[0].lastChild.parentElement.classList.add("m-0");
      info.childNodes[1].lastChild.parentElement.style.fontWeight = "100";
      info.childNodes[1].lastChild.parentElement.classList.add("m-0");
      info.childNodes[2].lastChild.parentElement.style.justifyContent = "center";
      var txtCol = info.childNodes[2].childNodes;

      txtCol.forEach(e => {
        e.lastChild.parentElement.classList.remove("col");
        e.lastChild.parentElement.classList.add("ml-2");
        e.lastChild.lastChild.parentElement.style.fontWeight = "100";
      });
               
    
       var _images = [];
    

      var imgUno = document.createElement('div');
      var br = document.createElement('br');
      imgUno.append(logo, hr, info, br);

   


const doc = new jsPDF('l', 'pt', 'a3');
const options = {
                background: 'white',
                scale: 3
              };



for (let i = 0; i < this.analitosFiltrados.length; i++) {  

  this.collapse(i, this.analitosFiltrados[i]); // set collapse 
 
  setTimeout(() => {       
   

    this.getCollapsesData(i, this.analitosFiltrados[i]).then(res =>{
            
      if(res == 'ok'){             
                
            const descAnalyte = this.analitosFiltrados[i].desanalyte.toString();       
            this.analyteName = descAnalyte.charAt(0).toUpperCase() + descAnalyte.slice(1).toLowerCase();           
          
            html2canvas(DATA, options).then((canvas) => {    
        
                     
                var _img = document.createElement('img');
               

                _img.src = canvas.toDataURL();
                _img.width = 1390;
                _img.height = 650;
                // _img.height = i == 0? 730: 830;            
               
                imgUno.append(_img);
                _images.push(imgUno.cloneNode(true)); 
                imgUno.removeChild(imgUno.lastChild);             


              if(_images.length == this.analitosFiltrados.length) {             
               

                for (let j = 0; j < _images.length; j++) {

                  PDF.append(_images[j]);
        
                  html2canvas(_images[j], options).then((canvas) => {
        
                    const img = canvas.toDataURL('image/JPEG');
        
                    // Add image Canvas to PDF
                    const bufferX = 15;
                    const bufferY = 15;
                    const imgProps = (doc as any).getImageProperties(img);
                    const pdfWidth = doc.internal.pageSize.getWidth() - 2 * bufferX;
                    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
                    doc.addImage(img, 'JPEG', bufferX, bufferY, pdfWidth, pdfHeight, undefined, 'FAST');
        
                   if(j + 1 == _images.length)  {
                      window.open(doc.output('bloburl'), '_blank');
                      while (PDF.firstChild) {
                        PDF.removeChild(PDF.firstChild);
                      }
                      DATA.hidden = true;
                    } else{
                      doc.addPage();
                    }
        
                  });
        
                }

                     
              }                     

                                      
        
            });                
    

      }
    }).catch(err => {
      console.log(err);
      
    });

        
    
  }, 5000);    
   
} 


    } else {

      this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.SELECTMUESTRA'));

    }

  }



  downloadPDFByTable() {

    if (this.selected != '') {

      var logo = document.getElementById('boxLogo').cloneNode(true);
      var info = document.getElementById('boxInfo').cloneNode(true);
      var box = document.getElementById(this.isCollapsed.toString()).children[1];
      var tablaIzq: any;
      var tablaDer: any;
      var tablasMed = [];
      var images = [];

      // tabla IZQ
      tablaIzq = box.children[1].children[0].children[0].cloneNode(true);

      // tabla DER
      tablaDer = box.children[1].children[0].children[2].cloneNode(true);

      for (let i = 0; i < box.children.length; i++) {

        i != 0 ? tablasMed.push(box.children[i].children[0].children[1].cloneNode(true)) : '';

      }

      var PDF = document.getElementById('boxPDF');

      var imgUno = document.createElement('div');
      imgUno.append(logo, info);

      var img = document.createElement('div');
      img.style.display = 'flex';

      img.append(tablaIzq);

      for (let i = 0; i < tablasMed.length; i++) {

        if (img.children.length < 5) {

          img.append(tablasMed[i]);

        } else {

          images.push(img);

          while (img.firstChild) {
            img.removeChild(img.firstChild);
          }

          img.append(tablasMed[i]);

        }

      }

      setTimeout(() => {

        img.append(tablaDer);
        images.push(img);

        var borrar = images.shift();
        imgUno.append(borrar);
        images.unshift(imgUno);

        const doc = new jsPDF('l', 'pt', 'a3');
        const options = {
          background: 'white',
          scale: 3
        };

        for (let i = 0; i < images.length; i++) {

          PDF.append(images[i]);

          html2canvas(images[i], options).then((canvas) => {

            const img = canvas.toDataURL('image/JPEG');

            // Add image Canvas to PDF
            const bufferX = 15;
            const bufferY = 15;
            const imgProps = (doc as any).getImageProperties(img);
            const pdfWidth = doc.internal.pageSize.getWidth() - 2 * bufferX;
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            doc.addImage(img, 'JPEG', bufferX, bufferY, pdfWidth, pdfHeight, undefined, 'FAST');

            i + 1 == images.length ? window.open(doc.output('bloburl'), '_blank') : doc.addPage();

          });

        }

        while (PDF.firstChild) {
          PDF.removeChild(PDF.firstChild);
        }

      }, 5000);

    } else {

      this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.SELECTMUESTRA'));

    }

  }


















  /*name of the excel-file which will be downloaded. */
  fileName = 'ExcelSheet.xlsx';

  exportexcel(): void {

    if (this.selected != '') {

      /* table id is passed over here */
      let element = document.getElementById('tableExcel');
      const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);

      /* generate workbook and add the worksheet */
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

      /* save to file */
      XLSX.writeFile(wb, this.fileName);


    } else {

      this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.SELECTMUESTRA'));

    }

  }

}




