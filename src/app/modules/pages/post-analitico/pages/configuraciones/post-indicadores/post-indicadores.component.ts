import { DatePipe, NgIf, NgFor } from '@angular/common';
import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { PostIndicacoresService } from '@app/services/post-analitico/post-indicacores.service';

import { MatTableDataSource } from '@angular/material/table';
import { HttpErrorResponse } from '@angular/common/http';
import { CdkDragDrop, moveItemInArray, transferArrayItem, CdkDropList, CdkDrag } from '@angular/cdk/drag-drop';
import { UnitsQceService } from '@app/services/calidad-externo/unitsQce.service';
import { ImageCdnPipe } from '../../../../../core/pipes/image-cdn.pipe';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { LoaderService } from '@app/services/loader/loader.service';

// ---------Interfaces----------------
interface Indicador{

  idindicators: number;
  nameindicators: string;
  idarea: number;
  idturns: number;
  descriptionindicators: string;
  aim: number;
  unitofmeasurement: string;
  measurementfrequency: string;
  sourceofinformation: string;
  responsiblemeasurement: string;
  headanalysis: string;
  active: boolean;

}
@Component({
    selector: 'app-post-indicadores',
    templateUrl: './post-indicadores.component.html',
    styleUrls: ['./post-indicadores.component.css'],
    standalone: true,
    imports: [NgIf, NgFor, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, CdkDropList, CdkDrag, TranslateModule, ImageCdnPipe]
})
export class PostIndicadoresComponent implements OnInit {
  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();

  indicador: any;
  accionEditar: any;
  tituloAccion: any;
  accion: any;

  ventanaModal: BsModalRef;
  formulario: FormGroup;
  desactivar = false;
  messageError: string;

  dataSource: MatTableDataSource<any>;
  indicadoresArr = [];
  turnosArrTodo = [];
  turnosArrDone = [];
  areasArrTodo = [];
  areasArrDone = [];
  unidadesArr = [];

  sendArr = [];

  homeBtnHide: boolean = true;
  selectIndHide: boolean = false;
  page1Hide: boolean = true;
  page2Hide: boolean = true;
  page3Hide: boolean = true;
  tituloInd: string = '';
  IndSelected: number = -1;
  formShow: boolean = false;
  indFound: any;
  menuListPending: any[] = [];
  turnosPending: any[] = [];
  //------------------

  constructor(
    private fb: FormBuilder,
    private PostIndicacoresService:PostIndicacoresService,
    private unitsQceService: UnitsQceService,
    private translate: TranslateService,
    private toastr: ToastrService,
    private datePipe: DatePipe,
    private loader: LoaderService
  ) { }

  ngOnInit(): void {
    this.cargarIndicadores();
    this.cargarAreas();
    this.cargarTurnos();
    //this.cargarUnidades();

    //this.crearFormularioIndcador();
    this.titulosSwal();
  }


  //----------formulario------------

  get nameindicatorsNoValido() {
    return this.formulario.get('nameindicators');
  }

  get measurementfrequencyNoValido() {
    return this.formulario.get('measurementfrequency');
  }

  get aimNoValido() {
    return this.formulario.get('aim');
  }

  get unitofmeasurementNoValido() {
    return this.formulario.get('unitofmeasurement');
  }

  get sourceofinformationNoValido() {
    return this.formulario.get('sourceofinformation');
  }

  get responsiblemeasurementNoValido() {
    return this.formulario.get('responsiblemeasurement');
  }

  get headanalysisNoValido() {
    return this.formulario.get('headanalysis');
  }

  get descriptionindicatorsNoValido() {
    return this.formulario.get('descriptionindicators');
  }



  crearFormularioIndcador(datos: Indicador) {

    this.formulario = this.fb.group({

      idindicators: [datos.idindicators ? datos.idindicators : ''],
      nameindicators: [datos.nameindicators ? datos.nameindicators : ''],
      idarea: [datos.idarea ? datos.idarea : ''],
      idturns: [datos.idturns ? datos.idturns : ''],
      descriptionindicators: [datos.descriptionindicators ? datos.descriptionindicators : '', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      aim: [datos.aim ? datos.aim : '', [Validators.required, Validators.min(0), Validators.max(100)]],
      unitofmeasurement: [datos.unitofmeasurement ? datos.unitofmeasurement : '', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
      measurementfrequency: [datos.measurementfrequency ? datos.measurementfrequency : '', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      sourceofinformation: [datos.sourceofinformation ? datos.sourceofinformation : '', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      responsiblemeasurement: [datos.responsiblemeasurement ? datos.responsiblemeasurement : '', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      headanalysis: [datos.headanalysis ? datos.headanalysis : '', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      active: [datos.active ? datos.active : false],

    });


  }

  //----------------------------
  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }



    //------Areas Validación------------
    //console.log('AreasArrDone: ', this.areasArrDone);

    const areaFilterFound = this.areasArrDone.filter(element => element.desarea !== 'Todas');
    //console.log('Filter', areaFilterFound);

    const areaTodaFound = this.areasArrDone.find(element => element.desarea == 'Todas');

    //console.log('Todas', areaTodaFound);

    if (areaTodaFound != undefined) {

      this.areasArrDone = [areaTodaFound];

      areaFilterFound.forEach(item => this.areasArrTodo.push(item));

      this.areasArrTodo.forEach(item =>{
        item.disabled = true;
      });

    }else{
      this.areasArrTodo.forEach(item =>{
        item.disabled = false;
      });
    }
    //------Turnos Validación------------
    //console.log('TurnosArrDone: ', this.turnosArrDone);

    const turnoFilterFound = this.turnosArrDone.filter(element => element.desturns !== 'Completo');
    //console.log('Filter', turnoFilterFound);

    const turnoTodaFound = this.turnosArrDone.find(element => element.desturns == 'Completo');

    //console.log('Completo', turnoTodaFound);

    if (turnoTodaFound != undefined) {

      this.turnosArrDone = [turnoTodaFound];

      turnoFilterFound.forEach(item => this.turnosArrTodo.push(item));

      this.turnosArrTodo.forEach(item =>{
        item.disabled = true;
      });

    }else{
      this.turnosArrTodo.forEach(item =>{
        item.disabled = false;
      });
    }


    // armardo Array con data para configurar

    this.sendArr = [];

    this.areasArrDone.forEach(item =>{
            let idarea = {
              idarea: item.idarea
            }
            this.sendArr.push(idarea);
    });
    this.turnosArrDone.forEach(item =>{
            let idturns = {
              idturns: item.idturns
            }
            this.sendArr.push(idturns);
    });






  }
  //----------------------------


  cargarIndicadores() {
    this.PostIndicacoresService.getAllAsync().then(respuesta => {

      console.log('Indicadores Servicio Nuevo: ', respuesta);
      if (respuesta) {
        this.indicadoresArr = respuesta;
        //this.dataSource = new MatTableDataSource(respuesta);

        // this.dataSource.paginator = this.paginator;
        // this.dataSource.sort = this.sort;

      }
    });
  }

  cargarTurnos() {
    this.PostIndicacoresService.getAllAsyncTurno().then(respTurnos => {

      if (respTurnos) {

          respTurnos.forEach(item => {

              const itemTurno = {
                desturns: item.desturns,
                idturns: item.idturns,
                tbIndicatorsPre: item.tbIndicatorsPre,
                active: item.active,
                disabled: false

              }

              this.turnosArrTodo.push(itemTurno);

        });

        console.log('TurnosArrTodo: ', this.turnosArrTodo);

    }

    });
  }


  cargarAreas() {
    this.PostIndicacoresService.getAllAsyncArea().then(respAreas => {

      if (respAreas) {

        respAreas.forEach(item => {

          const itemArea = {
            desarea: item.desarea,
            idarea: item.idarea,
            tbIndicatorsPre: item.tbIndicatorsPre,
            active: item.active,
            disabled: false
          }

          this.areasArrTodo.push(itemArea);


        });



        console.log('AreasTodoArr: ', this.areasArrTodo);

      }

    });
  }
  cargarUnidades() {
    this.unitsQceService.getAllAsync().then(respuesta => {

      if (respuesta) {
        this.unidadesArr = respuesta;
        console.log('Unidades: ', this.unidadesArr);

      }

    });
  }



  //-------back Home-----

  getHome(){

    this.cargarIndicadores();
    this.homeBtnHide = true;
    this.selectIndHide = false;
    this.page1Hide = true;
    this.page2Hide = true;
    this.page3Hide = true;
  }
  getBackPage2(){

    this.homeBtnHide = false;
    this.selectIndHide = true;
    this.page1Hide = false;
    this.page2Hide = true;
    this.page3Hide = true;
  }

  getBackPage3(){

    if (this.IndSelected == 1) {

      this.homeBtnHide = false;
      this.selectIndHide = true;
      this.page1Hide = true;
      this.page2Hide = false;
      this.page3Hide = true;

    }else{
      this.getBackPage2();
    }


  }

  // -------------------------
  // --- configura solo Q2 ----
  // -------------------------
  getNext2(){



    if  (this.areasArrDone.length == 0 || this.turnosArrDone.length == 0) {
      return;
     }

     this.loader.show();



   //console.log('Next Q2: ', this.formulario.value);

    const IndQ2Found = this.indicadoresArr.filter(element => element.nameindicators == this.tituloInd);

    console.log(IndQ2Found);

    if (IndQ2Found != undefined) {

        IndQ2Found.forEach(async item =>{
         await this.eliminarIndicador(item.idindicators);
        });

    }




  setTimeout(async () => {
    console.log("getNext2",this.sendArr);

          this.sendArr.forEach(async item =>{


            if (item.idarea) {
              this.formulario.get('idarea').setValue(item.idarea);

            }
            if (item.idturns) {
              this.formulario.get('idturns').setValue(item.idturns);

            }
            console.log("getNext2",this.formulario.value);

            // this.tituloAccion = 'Crear';
            // this.crearEditarIndicadores();
            this.formulario.removeControl('idindicators');
            await this.PostIndicacoresService.create(this.formulario.value).subscribe(respuesta => {
           console.log("Respuesta Crear", respuesta)

            },  (error: HttpErrorResponse) => {
                           this.toastr.error(this.messageError);
            });
        });

       
        this.toastr.success('Registro creado');
        this.cargarIndicadores();


        // navegacion
        this.homeBtnHide = false;
        this.selectIndHide = true;
        this.page1Hide = true;
        this.page2Hide = true;
        this.page3Hide = false;
        this.loader.hide()

  }, 1000);




  }


  // -----Selección del Item Indicador-----------
selectedIndicatorByApi(_indicador: Indicador, index:number){

  console.log(_indicador);

  this.tituloInd = _indicador.nameindicators;
  this.IndSelected = index; // referencia

  this.indicador = _indicador;

  this.crearFormularioIndcador(_indicador);
  this.formShow = true;


  const itemIndicador = document.getElementById(`ind-${index}`);
  this.aplicarActiveBtn(itemIndicador);


   // navegación
   this.homeBtnHide = false;
   this.selectIndHide = true;
   this.page1Hide = false;
   this.page2Hide = true;
   this.page3Hide = true;

}


  selectedIndicador(itemIndicador: Document, pElement: HTMLHRElement, ind: number){
    this.tituloInd = pElement.innerText;
    this.IndSelected = ind; // referencia
    //console.log(pElement);

   // if(this.indicadoresArr.length < 3){
     console.log('llegamos');
     

              this.indFound = this.indicadoresArr.find(element => element.nameindicators == this.tituloInd );

              if (this.indFound != undefined) {

                   console.log('indFound 1', this.indFound);

                   this.crearFormularioIndcador(this.indFound);

              }else{

                    this.indicador = {

                              idindicators: null,
                              nameindicators: this.tituloInd,
                              idarea: null,
                              idturns: null,
                              descriptionindicators: null,
                              aim: null,
                              unitofmeasurement: null,
                              measurementfrequency: null,
                              sourceofinformation: null,
                              responsiblemeasurement: null,
                              headanalysis: null,
                              active: null,

                    }

              this.crearFormularioIndcador(this.indicador);

            }




    //}


    this.formShow = true;


    // navegación
    this.homeBtnHide = false;
    this.selectIndHide = true;
    this.page1Hide = false;
    this.page2Hide = true;
    this.page3Hide = true;

    this.aplicarActiveBtn(itemIndicador);

    this.infoIndicador();

  }

 // metodo para cambiar de activar el Boton
 aplicarActiveBtn(link: any){

  const selectores: any = document.getElementsByClassName('indicador');

  for (const ref of selectores){
    ref.classList.remove('active');
  }

  link.classList.add('active');

}

//-------------------------------------------------------------------
//-------Seleccionando la Configuracion del Indicador----------------
//-------------------------------------------------------------------
setIndConfiguration(){

    console.log("Configuracion crear",this.formulario.value);
  if (this.formulario.invalid) {
    return  Object.values( this.formulario.controls ).forEach( control => {
      control.markAsTouched();
    });
  }

  // si todo OK

  // condicion indicador diferente a Q2
  if (this.IndSelected == 4 || this.IndSelected == 5 || this.IndSelected == 6 ) {

    this.loader.show();

    //if(this.indicadoresArr.length < 3){

          const indFound = this.indicadoresArr.find(element => element.nameindicators == this.tituloInd);
          console.log('indFound ', indFound);

          if (indFound == undefined) {


            this.tituloAccion = 'Crear';
            this.crearEditarIndicadores();

          }else{

            this.tituloAccion = 'Editar';
            this.crearEditarIndicadores();

          }



    // }else{

    //     this.tituloAccion = 'Editar';
    //     this.crearEditarIndicadores();

    // }

  }


  // navegacion
  if(this.IndSelected !== 4 && this.IndSelected !== 5 && this.IndSelected !== 6 ){

    this.selectIndHide = true;
    this.page1Hide = true;
    this.page2Hide = false;
    this.page3Hide = true;

  }else{
    this.selectIndHide = true;
    this.page1Hide = true;
    this.page2Hide = true;
    //this.page3Hide = false;

  }



}




  // ------CRUD--------
  crearEditarIndicadores() {
    if (!this.formulario.invalid) {
      if (this.tituloAccion === 'Crear') {

        this.desactivar = true;



        this.PostIndicacoresService.create(this.formulario.value).subscribe(respuesta => {


          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            Hora: this.dateNowISO,
            Metodo: 'actualización',
            Datos: JSON.stringify(this.formulario.value),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: status
          }

          console.log(Loguser);

          this.PostIndicacoresService.createLogAsync(Loguser).then(respuesta => {
            console.log(respuesta);
          });

          console.log('Ind Creado: ', respuesta);

          this.loader.hide();

          this.page3Hide = false; // modal guardado correctamente
          this.cargarIndicadores();
          this.toastr.success('Registro creado');
         console.log("Respuesta Crear",respuesta)

        }, (error) => {
          this.loader.hide();
          // navegacion
          this.page1Hide = false;
          this.page3Hide = true;
          this.toastr.error(this.messageError);

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            Hora: this.dateNowISO,
            Metodo: 'actualización',
            Datos: JSON.stringify(this.formulario.value),
            Respuesta:   error.status,
            TipoRespuesta: status
          }
          console.log(Loguser);
          this.PostIndicacoresService.createLogAsync(Loguser).then(respuesta => {
            console.log(respuesta);
          });
        });

      } else { // ------actualiza el indicador------
       this.PostIndicacoresService.update(this.formulario.value, this.formulario.value.idindicators).subscribe(respuesta => {
          console.log('Ind Actualizado: ', respuesta);
          this.loader.hide();
          this.page3Hide = false; // modal guardado correctamente
          this.cargarIndicadores();
          this.toastr.success('Registro actualizado');
         console.log("Actualizar Indicadores",respuesta);

         const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          Hora: this.dateNowISO,
          Metodo: 'actualización',
          Datos: JSON.stringify(this.formulario.value),
          Respuesta: JSON.stringify(respuesta),
          TipoRespuesta: status
        }

        console.log(Loguser);

        this.PostIndicacoresService.createLogAsync(Loguser).then(respuesta => {
          console.log(respuesta);
        });

        }, (error: HttpErrorResponse) => {
          this.loader.hide();
          // navegacion
          this.page1Hide = false;
          this.page3Hide = true;
          this.toastr.error(this.messageError);

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            Hora: this.dateNowISO,
            Metodo: 'actualización',
            Datos: JSON.stringify(this.formulario.value),
            Respuesta:   error.status,
            TipoRespuesta: status
          }
          console.log(Loguser);
          this.PostIndicacoresService.createLogAsync(Loguser).then(respuesta => {
            console.log(respuesta);
          });
        });

      }
    }
  }

  // ---no usado--
  actualizarEstadoIndicador(datosIndicador) {
    const estado = datosIndicador.active ? false : true;

    const datos = { idindicators: datosIndicador.idindicators, active: estado };
    this.PostIndicacoresService.update(datos, datosIndicador.idindicators).subscribe(respuesta => {
      console.log("Mensaje Actualizar", respuesta);

      const Loguser = {
        Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
        Hora: this.dateNowISO,
        Metodo: 'actualización',
        Datos: JSON.stringify(this.formulario.value),
        Respuesta: JSON.stringify(respuesta),
        TipoRespuesta: status
      }

      console.log(Loguser);

      this.PostIndicacoresService.createLogAsync(Loguser).then(respuesta => {
        console.log(respuesta);
      });
      this.cargarIndicadores();


    });
  }
 // ---no usado--
 async eliminarIndicador(id: any) {

    this.PostIndicacoresService.delete('pos', id).subscribe(respuesta => {
      this.cargarIndicadores();
    },
      (err: HttpErrorResponse) => {
        this.toastr.error(this.messageError);
      });
  }
  infoIndicador(){
    this.PostIndicacoresService.getDatosIndicador(this.indFound.nameindicators).subscribe((respuesta: any) => {
      const arrayIds = respuesta.map((m: any) => m.Idarea);
      const arrayTurnos = respuesta.map((m: any) => m.Desturns);      
      
    this.areasArrDone = [];
    this.menuListPending = [];

    this.turnosArrDone =[];
    this.turnosPending =[];

    this.areasArrTodo.forEach((m: any) => {
      if (arrayIds.includes(m.idarea)) {
        this.areasArrDone.push(m);
      } else {
        this.menuListPending.push(m);
      }
    });

    this.turnosArrTodo.forEach((m: any) => {
      if (arrayTurnos.includes(m.desturns)) {
        this.turnosArrDone.push(m);
      } else {
        this.turnosPending.push(m);
      }
    });
    
    });
  }

  titulosSwal() {
    this.translate.get('MODULES.SWAL.MESAGEERROR').subscribe(respuesta => this.messageError = respuesta);
  }




}
