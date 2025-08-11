import { DatePipe, NgIf, NgFor } from "@angular/common";
import { Component, OnInit, TemplateRef } from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { TranslateService, TranslateModule } from "@ngx-translate/core";
import { BsModalRef } from "ngx-bootstrap/modal";
import { ToastrService } from "ngx-toastr";
import { PreIndicadoresService } from "@app/services/pre-analitico/pre-indicadores.service";
import { MatTableDataSource } from "@angular/material/table";
import { HttpErrorResponse } from "@angular/common/http";
import { PreAreasService } from "@app/services/pre-analitico/pre-areas.service";
import { PreTurnosService } from "@app/services/pre-analitico/pre-turnos.service";
import { CdkDragDrop, moveItemInArray, transferArrayItem, CdkDropList, CdkDrag } from "@angular/cdk/drag-drop";
import { UnitsQceService } from "@app/services/calidad-externo/unitsQce.service";
import { ImageCdnPipe } from "../../../../../core/pipes/image-cdn.pipe";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { LoaderService } from '@app/services/loader/loader.service';
// ---------Interfaces----------------
interface Indicador {
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
    selector: "app-indicadores-confg",
    templateUrl: "./indicadores-confg.component.html",
    styleUrls: ["./indicadores-confg.component.css"],
    providers: [DatePipe],
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSlideToggleModule,
        CdkDropList,
        CdkDrag,
        TranslateModule,
        ImageCdnPipe,
    ],
})
export class IndicadoresConfgComponent implements OnInit {
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
  menuListPending: any[] = [];
  areasPending: any[] = [];
  turnosPending: any[] = [];

  sendArrAreas = [];
  sendArrTurnos = [];

  homeBtnHide: boolean = true;
  selectIndHide: boolean = false;
  page1Hide: boolean = true;
  page2Hide: boolean = true;
  page3Hide: boolean = true;
  tituloInd: string = "";
  IndSelected: number = -1;
  formShow: boolean = false;
  indFound: any;

  constructor(
    private fb: FormBuilder,
    private preIndicadoresService: PreIndicadoresService,
    private preAreasService: PreAreasService,
    private preTurnosService: PreTurnosService,
    private unitsQceService: UnitsQceService,
    private translate: TranslateService,
    private toastr: ToastrService,
    private datePipe: DatePipe,
    private loader: LoaderService
  ) {}

  ngOnInit(): void {
    this.cargarIndicadores();
    this.cargarAreas();
    this.cargarTurnos();
    //this.cargarUnidades();

    //this.crearFormularioIndcador();
    this.titulosSwal();
  }

  //----------formulario------------

  // get nameindicatorsNoValido() {
  //   return this.formulario.get("nameindicators");
  // }

  get measurementfrequencyNoValido() {
    return this.formulario.get("measurementfrequency");
  }

  get aimNoValido() {
    return this.formulario.get("aim");
  }

  get unitofmeasurementNoValido() {
    return this.formulario.get("unitofmeasurement");
  }

  get sourceofinformationNoValido() {
    return this.formulario.get("sourceofinformation");
  }

  get responsiblemeasurementNoValido() {
    return this.formulario.get("responsiblemeasurement");
  }

  get headanalysisNoValido() {
    return this.formulario.get("headanalysis");
  }

  get descriptionindicatorsNoValido() {
    return this.formulario.get("descriptionindicators");
  }

  //----------------------------
  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }

    //------Areas Validación------------

    const areaFilterFound = this.areasArrDone.filter(
      (element) => element.desarea !== "Todas"
    );


    const areaTodaFound = this.areasArrDone.find(
      (element) => element.desarea === "Todas" 
    );

    if (areaTodaFound != undefined) {
      this.areasArrDone = [areaTodaFound];

      areaFilterFound.forEach((item) => this.areasArrTodo.push(item));

      this.areasArrTodo.forEach((item) => {
        item.disabled = true;
      });
    } else {
      this.areasPending.forEach((item) => {
        item.disabled = false;
      });
    }
    //------Turnos Validación------------


    const turnoFilterFound = this.turnosArrDone.filter(
      (element) => element.desturns !== "Completo"
    );


    const turnoTodaFound = this.turnosArrDone.find(
      (element) => element.desturns == "Completo"
    );



    if (turnoTodaFound != undefined) {
      this.turnosArrDone = [turnoTodaFound];

      turnoFilterFound.forEach((item) => this.turnosArrTodo.push(item));

      this.turnosArrTodo.forEach((item) => {
        item.disabled = true;
      });
    } else {
      this.areasPending.forEach((item) => {
        item.disabled = false;
      });
    }

    // armardo Array con data para configurar

    this.sendArrAreas = [];
    this.sendArrTurnos = [];

    this.areasArrDone.forEach((item) => {
      let idarea = {
        idarea: item.idarea,
      };
      this.sendArrAreas.push(idarea);
    });
    this.turnosArrDone.forEach((item) => {
      let idturns = {
        idturns: item.idturns,
      };
      this.sendArrTurnos.push(idturns);
    });
  }
  //----------------------------

 cargarIndicadores() {
  this.preIndicadoresService.getAllAsync().then((respuesta) => {
    if (respuesta) {
      this.indicadoresArr = respuesta;
      //this.dataSource = new MatTableDataSource(respuesta);
      // this.dataSource.paginator = this.paginator;
      // this.dataSource.sort = this.sort;
    }
  });
}

  cargarTurnos() {
    this.preTurnosService.getAllAsync().then((respTurnos) => {
      if (respTurnos) {
        respTurnos.forEach((item) => {
          const itemTurno = {
            desturns: item.desturns,
            idturns: item.idturns,
            tbIndicatorsPre: item.tbIndicatorsPre,
            active: item.active,
            disabled: false,
          };

          this.turnosArrTodo.push(itemTurno);
          this.turnosPending.push(itemTurno);
        });


      }
    });
  }

  cargarAreas() {
    this.preAreasService.getAllAsync().then((respAreas) => {
      if (respAreas) {
        respAreas.forEach((item) => {
          const itemArea = {
            desarea: item.desarea,
            idarea: item.idarea,
            tbIndicatorsPre: item.tbIndicatorsPre,
            active: item.active,
            disabled: false,
          };

          this.areasArrTodo.push(itemArea);
          this.areasPending.push(itemArea);
        });


      }
    });
  }
  cargarUnidades() {
    this.unitsQceService.getAllAsync().then((respuesta) => {
      if (respuesta) {
        this.unidadesArr = respuesta;

      }
    });
  }
  
  infoIndicador() {
     this.preIndicadoresService
      .getDatosIndicador(this.tituloInd)
       .subscribe((respuesta: any) => {
        this.areasArrDone = [];
        this.menuListPending = [];
        this.areasPending = [];
        this.turnosArrDone = [];
        this.turnosPending = [];
         const arrayIds = respuesta.filter(x=>x.Idarea !== null).map((m: any) => m.Idarea);
         if(arrayIds[0] != null){
          this.areasArrTodo.forEach((m: any) => {
            if (arrayIds.includes(m.idarea)) {
               this.areasArrDone.push(m);
               this.menuListPending.push(m);
             } else {
               this.areasPending.push(m);
             }
          });
         }else{
          this.cargarAreas();
         }
         
         const arrayTurnos = respuesta.filter(y=>y.Idturns !== null).map((m: any) => m.Idturns);
         if(arrayTurnos[0] != null){
          this.turnosArrTodo.forEach((m: any) => {
            if (arrayTurnos.includes(m.idturns)) {
            this.turnosArrDone.push(m);
           } else {
             this.turnosPending.push(m);
            }
          });
         }else{
          this.cargarTurnos();
         }

       });
  }

  //-------back Home-----
  getHome() {
    this.cargarIndicadores();
    this.homeBtnHide = true;
    this.selectIndHide = false;
    this.page1Hide = true;
    this.page2Hide = true;
    this.page3Hide = true;
  }

  getBackPage2() {
    this.homeBtnHide = false;
    this.selectIndHide = true;
    this.page1Hide = false;
    this.page2Hide = true;
    this.page3Hide = true;
  }

  getBackPage3() {
    if (this.IndSelected == 1) {
      this.homeBtnHide = false;
      this.selectIndHide = true;
      this.page1Hide = true;
      this.page2Hide = false;
      this.page3Hide = true;
    } else {
      this.getBackPage2();
    }
  }

  // -------------------------
  // --- configura solo Q2 ----
  // -------------------------
  getNext2() {
    if (this.areasArrDone.length === 0 || this.turnosArrDone.length === 0) {
      return;
    }

    this.loader.show();

    setTimeout(() => {
          for (let a = 0; a < this.sendArrAreas.length; a++) {
        this.formulario.get("idarea").setValue(this.sendArrAreas[a].idarea);
        this.formulario.get("idturns").setValue(null);

        let exists = this.indicadoresArr.filter(t=>t.idarea === this.sendArrAreas[a].idarea && t.nameindicators === this.tituloInd) || null;

        if(exists.length !== 0){
          //Actualizar
          let dataIndicadores = this.indicadoresArr.find(x=>x.idindicators === exists[0].idindicators);
          dataIndicadores.idturns = null;
          dataIndicadores.idarea = this.sendArrAreas[a].idarea;
          this.preIndicadoresService
          .update(dataIndicadores, dataIndicadores.idindicators)
          .subscribe((respuesta) => {});
        }
        else{
          // this.tituloAccion = 'Crear';
          // this.crearEditarIndicadores();
          this.formulario.removeControl("idindicators");
  
            this.preIndicadoresService
            .create(this.formulario.value)
            .subscribe(
              (respuesta) => {
                const Loguser = {
                  Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
                  Hora: this.dateNowISO,
                  Metodo:'creación',
                  Datos: JSON.stringify(this.formulario.value),
                  Respuesta: JSON.stringify(respuesta),
                  TipoRespuesta: status,
                };
  
                this.preIndicadoresService
                  .createLogAsync(Loguser)
                  .then((respuesta) => {});
              },
              (error: HttpErrorResponse) => {
                this.toastr.error(this.messageError);
  
                const Loguser = {
                  fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
                  hora: this.dateNowISO,
                  metodo: 'creación',
                  datos: JSON.stringify(this.formulario.value),
                  respuesta: error.message,
                  tipoRespuesta: error.status,
                };
                this.preIndicadoresService
                  .createLogAsync(Loguser)
                  .then((respuesta) => {});
              }
            );
          }
    }

    for (let b = 0; b < this.sendArrTurnos.length; b++) {
      this.formulario.get("idturns").setValue(this.sendArrTurnos[b].idturns);
      this.formulario.get("idarea").setValue(null);

      let exists = this.indicadoresArr.filter(t=>t.idturns === this.sendArrTurnos[b].idturns && t.nameindicators === this.tituloInd) || null;

      if(exists.length !== 0){
        //Actualizar
        this.indicadoresArr[b].idindicators;
        let dataIndicadores = this.indicadoresArr.find(x=>x.idindicators === exists[0].idindicators);
        dataIndicadores.idarea = null;
        dataIndicadores.idturns = this.sendArrTurnos[b].idturns;
        this.preIndicadoresService
        .update(dataIndicadores, dataIndicadores.idindicators)
        .subscribe((respuesta) => {});
      }
      else{
        // this.tituloAccion = 'Crear';
        // this.crearEditarIndicadores();
        this.formulario.removeControl("idindicators");

          this.preIndicadoresService
          .create(this.formulario.value)
          .subscribe(
            (respuesta) => {
              const Loguser = {
                Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
                Hora: this.dateNowISO,
                Metodo: 'creación',
                Datos: JSON.stringify(this.formulario.value),
                Respuesta: JSON.stringify(respuesta),
                TipoRespuesta: status,
              };

              this.preIndicadoresService
                .createLogAsync(Loguser)
                .then((respuesta) => {});
            },
            (error: HttpErrorResponse) => {
              this.toastr.error(this.messageError);

              const Loguser = {
                fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
                hora: this.dateNowISO,
                metodo: 'creación',
                datos: JSON.stringify(this.formulario.value),
                respuesta: error.message,
                tipoRespuesta: error.status,
              };
              this.preIndicadoresService
                .createLogAsync(Loguser)
                .then((respuesta) => {});
            }
          );
        }
  }
  });
  
  this.toastr.success('Registro creado');
  
  this.cargarIndicadores();
  
  // navegacion
  this.homeBtnHide = false;
  this.selectIndHide = true;
  this.page1Hide = true;
  this.page2Hide = true;
  this.page3Hide = false;
  this.loader.hide();
}
  

  // -----Selección del Item Indicador-----------
  selectedIndicatorByApi(_indicador: Indicador, index: number) {
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

  crearFormularioIndcador(datos: Indicador) {
    this.formulario = this.fb.group({
      idindicators: [datos.idindicators ? datos.idindicators : ""],
      nameindicators: [datos.nameindicators ? datos.nameindicators : ""],
      idarea: [datos.idarea ? datos.idarea : ""],
      idturns: [datos.idturns ? datos.idturns : ""],
      descriptionindicators: [
      datos.descriptionindicators ? datos.descriptionindicators : "",
        [Validators.required, Validators.minLength(2)],
      ],
      aim: [
        datos.aim ? datos.aim : "",
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
      unitofmeasurement: [
        datos.unitofmeasurement ? datos.unitofmeasurement : "",
        [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(50),
        ],
      ],
      measurementfrequency: [
        datos.measurementfrequency ? datos.measurementfrequency : "",
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
        ],
      ],
      sourceofinformation: [
        datos.sourceofinformation ? datos.sourceofinformation : "",
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
        ],
      ],
      responsiblemeasurement: [
        datos.responsiblemeasurement ? datos.responsiblemeasurement : "",
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
        ],
      ],
      headanalysis: [
        datos.headanalysis ? datos.headanalysis : "",
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
        ],
      ],
       active: [datos.active ? datos.active : false],
    });
  }

  selectedIndicador(itemIndicador: Document, pElement: HTMLHRElement, ind: number) {
    this.tituloInd = pElement.innerText;
    this.IndSelected = ind; // referencia
    this.indFound = this.indicadoresArr.find((e) => e.nameindicators == this.tituloInd);

    const linIni = document.getElementById(`linIni`);
    const num3Ini = document.getElementById(`num3Ini`);
    const num2Fin = document.getElementById(`num2Fin`);
    const linFin = document.getElementById(`linFin`);
    const num3Fin = document.getElementById(`num3Fin`);

    if(this.tituloInd === "Errores de Identificación del paciente (Q1)" || this.tituloInd === "Satisfacción en la toma de muestras (Q3)"){
      num3Ini.style.display = 'none';
      linIni.style.display = 'none';
      num2Fin.classList.add('dot');
      linFin.style.display = 'none';
      num3Fin.style.display = 'none';
    }else{
      num3Ini.style.display = '';
      linIni.style.display = '';
      num2Fin.classList.add('dot-border');
      linFin.style.display = '';
      num3Fin.style.display = '';
    }

    if (this.indFound != undefined) {

      const idIndicador = this.indFound.idindicators;

      this.crearFormularioIndcador(this.indFound);
    } else {
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
      };

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
  aplicarActiveBtn(link: any) {
    const selectores: any = document.getElementsByClassName("indicador");

    for (const ref of selectores) {
      ref.classList.remove("active");
    }

    link.classList.add("active");
  }

  //-------------------------------------------------------------------
  //-------Seleccionando la Configuracion del Indicador----------------
  //-------------------------------------------------------------------
  setIndConfiguration() {
    if (this.formulario.invalid) {
      return Object.values(this.formulario.controls).forEach((control) => {
        control.markAsTouched();
      });
    }

    // si todo OK

    // condicion indicador diferente a Q2
    if (this.IndSelected !== 1) {
      this.loader.show();

      //if(this.indicadoresArr.length < 3){

      const indFound = this.indicadoresArr.find(
        (element) => element.nameindicators == this.tituloInd
      );

      if (indFound == undefined) {


        this.tituloAccion = "Crear";
        this.crearEditarIndicadores();
      } else {
        this.tituloAccion = "Editar";
        this.crearEditarIndicadores();
      }

      // }else{

      //     this.tituloAccion = 'Editar';
      //     this.crearEditarIndicadores();

      // }
    }

    // navegacion
    if (this.IndSelected == 1) {
      this.selectIndHide = true;
      this.page1Hide = true;
      this.page2Hide = false;
      this.page3Hide = true;
    } else {
      this.selectIndHide = true;
      this.page1Hide = true;
      this.page2Hide = true;
      //this.page3Hide = true;
    }
  }

  // ------CRUD--------
  crearEditarIndicadores() {
    if (!this.formulario.invalid) {
      if (this.tituloAccion === "Crear") {
        this.desactivar = true;

        if(this.tituloInd !== "Muestras rechazadas(Q2)"){

        const jsonCreate = {
          idindicators: 0,
          aim: this.formulario.value.aim,
          descriptionindicators: this.formulario.value.descriptionindicators,
          headanalysis: this.formulario.value.headanalysis,
          measurementfrequency: this.formulario.value.measurementfrequency,
          responsiblemeasurement: this.formulario.value.responsiblemeasurement,
          sourceofinformation: this.formulario.value.sourceofinformation,
          unitofmeasurement: this.formulario.value.unitofmeasurement,
          nameindicators: this.tituloInd,
          active: this.formulario.value.active
        };

        this.preIndicadoresService.create(jsonCreate).subscribe(
          (respuesta) => {


            this.loader.hide();

            this.page3Hide = false; // modal guardado correctamente
            this.cargarIndicadores();
            this.toastr.success('Registro creado');

            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              Hora: this.dateNowISO,
              Metodo: 'creación',
              Datos: JSON.stringify(this.formulario.value),
              Respuesta: JSON.stringify(respuesta),
              TipoRespuesta: status,
            };

            this.preIndicadoresService
              .createLogAsync(Loguser)
              .then((respuesta) => {});
          },
          (error) => {
            this.loader.hide();
            // navegacion
            this.page1Hide = false;
            this.page3Hide = true;

            this.toastr.error(this.messageError);

            const Loguser = {
              fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.dateNowISO,
              metodo: 'creación',
              datos: JSON.stringify(this.formulario.value),
              respuesta: error.message,
              tipoRespuesta: error.status,
            };
            this.preIndicadoresService
              .createLogAsync(Loguser)
              .then((respuesta) => {});
          }
        );
        }
      }else{
                // ------actualiza el indicador------
                const jsonUpd = {
                  idindicators: this.indFound.idindicators,
                  aim: this.formulario.value.aim,
                  descriptionindicators: this.formulario.value.descriptionindicators,
                  headanalysis: this.formulario.value.headanalysis,
                  measurementfrequency: this.formulario.value.measurementfrequency,
                  responsiblemeasurement: this.formulario.value.responsiblemeasurement,
                  sourceofinformation: this.formulario.value.sourceofinformation,
                  unitofmeasurement: this.formulario.value.unitofmeasurement,
                  nameindicators: this.tituloInd,
                  active: this.formulario.value.active
                };
                this.preIndicadoresService
                  .update(jsonUpd, this.indFound.idindicators)
                  .subscribe(
                    (respuesta) => {
                      this.loader.hide();
                      this.page3Hide = false; // modal guardado correctamente
                      this.cargarIndicadores();
                      this.toastr.success('Registro actualizado');
        
                      const Loguser = {
                        Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
                        Hora: this.dateNowISO,
                        Metodo: 'actualización',
                        Datos: JSON.stringify(this.formulario.value),
                        Respuesta: JSON.stringify(respuesta),
                        TipoRespuesta: status,
                      };
                    },
                    (error: HttpErrorResponse) => {
                      this.loader.hide();
                      // navegacion
                      this.page1Hide = false;
                      this.page3Hide = true;
        
                      this.toastr.error(this.messageError);
        
                      const Loguser = {
                        fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
                        hora: this.dateNowISO,
                        metodo: 'actualización',
                        datos: JSON.stringify(this.formulario.value),
                        respuesta: error.message,
                        tipoRespuesta: error.status,
                      };
        
                      this.preIndicadoresService
                        .createLogAsync(Loguser)
                        .then((respuesta) => {});
                    }
                  );
      }
    }
  }

  // ---no usado--
  actualizarEstadoIndicador(datosIndicador) {
    const estado = datosIndicador.active ? false : true;

    const datos = { idindicators: datosIndicador.idindicators, active: estado };
    this.preIndicadoresService
      .update(datos, datosIndicador.idindicators)
      .subscribe((respuesta) => {
        this.cargarIndicadores();
      });
  }
  // ---no usado--
  async eliminarIndicador(id: any) {
    this.preIndicadoresService.delete("pre", id).subscribe(
      (respuesta) => {
        this.cargarIndicadores();
        const Loguser = {
          fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.dateNowISO,
          metodo: 'eliminación',
          datos: JSON.stringify(id),
          respuesta: JSON.stringify(respuesta),
          tipoRespuesta: status,
        };
        this.preIndicadoresService.createLogAsync(Loguser).then((respuesta) => {

        });
      },
      (err: HttpErrorResponse) => {
        this.toastr.error(this.messageError);

        const Loguser = {
          fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.dateNowISO,
          metodo: 'eliminación',
          datos: JSON.stringify(id),
          respuesta: err.message,
          tipoRespuesta: err.status,
        };
        this.preIndicadoresService.createLogAsync(Loguser).then((respuesta) => {

        });
      }
    );
  }

  titulosSwal() {
    this.translate
      .get("MODULES.SWAL.MESAGEERROR")
      .subscribe((respuesta) => (this.messageError = respuesta));
  }

  closeVentana(): void {
    this.ventanaModal.hide();
  }
} // end class

