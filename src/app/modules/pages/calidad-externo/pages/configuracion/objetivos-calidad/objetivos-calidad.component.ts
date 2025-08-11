import { DatePipe, NgFor, NgIf, AsyncPipe, TitleCasePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { TemplateRef } from '@angular/core';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { FuentesQceService } from '@app/services/calidad-externo/fuentesQce.service';
import { ObjetivosCalidadQceService } from '@app/services/calidad-externo/objetivosCalidadQce.service';
import { UnitsQceService } from '@app/services/calidad-externo/unitsQce.service';
import { AnalytesQceService } from '@app/services/calidad-externo/AnalytesQce.service';
import { LogsService } from '@app/services/configuracion/logs.service';
import { VentanasModalesService } from '@app/services/general/ventanas-modales.service';
import { SharedService } from '@app/services/shared.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ProgramConfQceDetailsService } from '@app/services/calidad-externo/ProgramconfQceDetails.service';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexPlotOptions,
  ApexLegend,
  ApexYAxis,
  ApexGrid
} from "ng-apexcharts";
import { ProgramaQceService } from '@app/services/calidad-externo/programaQce.service';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject } from 'rxjs';
import { map, startWith, takeUntil } from 'rxjs/operators';
import { ImageCdnPipe } from '../../../../../core/pipes/image-cdn.pipe';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { LoaderService } from '@app/services/loader/loader.service';
import { MatDialog } from '@angular/material/dialog';
import { TablaComunComponent } from '@app/modules/shared/general-tablas/tabla-comun/tabla-comun.component';
import { ModalData } from '@app/Models/Modaldata';
import { ModalGeneralComponent } from '@app/modules/shared/modals/modal-general/modal-general.component';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

type ApexXAxis = {
  type?: "category" | "datetime" | "numeric";
  categories?: any;
  labels?: {
    style?: {
      colors?: string | string[];
      fontSize?: string;
    };
  };
};
export type ChartOptions1 = {
  series1: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  legend: ApexLegend;
  colors: string[];
};
export type ChartOptions2 = {
  series2: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  yaxis: ApexYAxis;
  xaxis: ApexXAxis;
  grid: ApexGrid;
  colors: string[];
  legend: ApexLegend;
};
@Component({
  selector: 'app-objetivos-calidad',
  templateUrl: './objetivos-calidad.component.html',
  styleUrls: ['./objetivos-calidad.component.css'],
  providers: [DatePipe],
  standalone: true,
  imports: [FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    NgFor,
    MatTooltipModule,
    NgIf, MatInputModule,
    MatTableModule,
    MatSortModule,
    MatSlideToggleModule,
    MatPaginatorModule,
    MatAutocompleteModule,
    AsyncPipe, TitleCasePipe,
    TranslateModule,
    ImageCdnPipe,
    TablaComunComponent,
    NgxMatSelectSearchModule]
})
export class ObjetivosCalidadComponent implements OnInit {
  titulo1 = "Coeficiente de Variación Relativo (% Pruebas con CVR < 1)";

  public chartOptions1: Partial<ChartOptions1>;
  public chartOptions2: Partial<ChartOptions2>;


  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();
  dateNowMilliseconds = this.dateNow.getTime();
  formularioRegistroEditar: FormGroup;
  accionEditar: any;
  accion: any;
  tituloAccion: any;
  ventanaModal: BsModalRef;
  titulo: any;
  text: any;
  textError: any;
  cancelar: any;
  confirmar: any;
  desactivar = false;
  messageError: any;
  titulo2: string;
  messageSinDatos: string;
  listaAnalitos: any[] = [];
  listaAnalitosCopy: any[] = [];
  listaFuentes: any[] = [];
  listaFuentesCopy: any[] = [];
  listaUnits: any[] = [];
  listaUnitsCopy: any[] = [];
  listaObjetivosCalidad = [];
  formulario: FormGroup;
  programas = [];
  programasActive = [];
  programasActiveCopy = [];
  bandera: boolean = false;
  ver: boolean = false;
  ok: string;
  selectedProgram: string;
  idprogram: number;

  //predictivos create
  filteredOptionsAnalyteCreate: Observable<string[]>;
  listanalytecreate: any;
  listanalytecreateCopy: any;
  filteredOptionsSourceCreate: Observable<string[]>;
  listsourcecreate: any;
  filteredOptionsUnitsCreate: Observable<string[]>;
  listunitscreate: any;

  //predictivo edit
  filteredOptionsAnalytesEdit: Observable<string[]>;
  idanalytepr: number;
  desanalytepr: any;
  listaanalytepre: any;
  filteredOptionsSourceEdit: Observable<string[]>;
  idsourcepr: number;
  dessourcepr: any;
  listasourcepre: any;
  filteredOptionsUnitsEdit: Observable<string[]>;
  idunitspr: number;
  desunitspr: any;
  listaunitspre: any;

  formularioRegistroEditarPre: FormGroup = this.fb.group({
    Idconfobjquaprogramanalyte: [],
    Idanalytes: [, [Validators.required]],
    Idsource: [, [Validators.required]],
    Objective: [, [Validators.required]],
    Idunits: [, [Validators.required]],
    idprogramconf: [],
    Datemod: [this.datePipe.transform(new Date, "yyyy-MM-dd")],
    Active: []
  });

  filterPrograma = new FormControl('')
  filterAnalito = new FormControl('')
  filterFuentes = new FormControl('')
  filterUnidades = new FormControl('')

  constructor(
    private translate: TranslateService,
    private objetivosCalidadQceService: ObjetivosCalidadQceService,
    private programQceService: ProgramaQceService,
    private fuentesQceService: FuentesQceService,
    private unitsQceService: UnitsQceService,
    private AnalytesQceService: AnalytesQceService,
    private logsService: LogsService,
    private fb: FormBuilder,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private sharedService: SharedService,
    private ventanaService: VentanasModalesService,
    private datePipe: DatePipe,
    private programConfQceDetailsService: ProgramConfQceDetailsService,
    private loaderService: LoaderService,
    private dialog: MatDialog
  ) { }

  displayedColumns: string[] = ['Analito', 'Fuente', 'Objetivo', 'Unidad', 'Estado', 'Editar', 'Eliminar'];
  dataSource: MatTableDataSource<any>;
  dataTableBody: any[] = [];

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;


  ngOnInit(): void {
    this.crearFormularioFiltro();
    this.getPrograms();
    this.consultarFuentes();
    this.consultarUnits();
    this.titulosSwal();
    this.grafica();
    this.grafica2();
    this.filtros();
  }

  filtros() {

    this.filterPrograma.valueChanges.subscribe(word => {
      if (word) {
        this.programasActive = this.programasActiveCopy.filter((item: any) => {
          return item.desprogram.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.programasActive = this.programasActiveCopy
      }
    });
    this.filterAnalito.valueChanges.subscribe(word => {
      if (word) {
        this.listaAnalitos = this.listaAnalitosCopy.filter((item: any) => {
          return item.Desanalytes.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.listaAnalitos = this.listaAnalitosCopy
      }
    });

    this.filterFuentes.valueChanges.subscribe(word => {
      if (word) {
        this.listaFuentes = this.listaFuentesCopy.filter((item: any) => {
          return item.dessource.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.listaFuentes = this.listaFuentesCopy
      }
    });
    this.filterUnidades.valueChanges.subscribe(word => {
      if (word) {
        this.listaUnits = this.listaUnitsCopy.filter((item: any) => {
          return item.codunits.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.listaUnits = this.listaUnitsCopy
      }
    });
  }



  async getPrograms() {
    try {
      this.loaderService.show()
      this.programas = await this.programQceService.getAllAsync();
      this.programasActive = this.programas.filter(e => e.active);
      this.programasActiveCopy = this.programas.filter(e => e.active);
      this.loaderService.hide()
    } catch (error) {
      this.loaderService.hide()

    }
  }

  async consultarAnalitos(programa) {
    try {
      this.loaderService.show()
      let analitos = await this.objetivosCalidadQceService.listaAnalytes(programa);
      if (analitos) {
        this.listaAnalitos = analitos;
        this.listaAnalitosCopy = analitos;
      }
      this.loaderService.hide()
    } catch (error) {
      this.loaderService.hide()
    }

  }

  async consultarFuentes() {
    try {
      this.loaderService.show()
      let fuentes = await this.fuentesQceService.getAllAsync();
      if (fuentes) {
        this.listaFuentes = fuentes.filter(datos => datos.active == true);
        this.listaFuentesCopy = fuentes.filter(datos => datos.active == true);
      }
      this.loaderService.hide()
    } catch (error) {
      this.loaderService.hide()
    }

  }
  async consultarUnits() {

    try {
      this.loaderService.show()
      let unidades = await this.unitsQceService.getAllAsync();
      if (unidades) {
        this.listaUnits = unidades.filter(datos => datos.active == true);
        this.listaUnitsCopy = unidades.filter(datos => datos.active == true);
      }
      this.loaderService.hide()
    } catch (error) {
      this.loaderService.hide()
    }
  }
  openModal(descripcion) {
    const data = { descripcion: descripcion, accion: this.tituloAccion }
    this.ventanaService.openModal(data);
  }
  crearFormularioFiltro() {
    this.formulario = this.fb.group({
      idProgram: ['', [Validators.required]],
    });
  }
  get idProgramInvalido() {
    return this.formulario.get('idProgram');
  }

  //obtener idprogram
  enviarId(id: number) {
    this.idprogram = id;
  }

  crearFormulario(datos: any) {

    this.formularioRegistroEditar = this.fb.group({
      Idconfobjquaprogramanalyte: [datos.Idconfobjquaprogramanalyte],
      Idanalytes: [datos.Idanalytes ? datos.Idanalytes : '', [Validators.required]],
      Idsource: [datos.Idsource ? datos.Idsource : '', [Validators.required]],
      Objective: [datos.Objective ? datos.Objective : '', [Validators.required, Validators.maxLength(20)]],
      Idunits: [datos.Idunits ? datos.Idunits : '', [Validators.required]],
      idprogramconf: [this.idProgramInvalido.value],
      Datemod: [this.datePipe.transform(new Date, "yyyy-MM-dd")],
      Active: [datos.Active ? datos.Active : false]
    });
  }

  get IdanalytesNoValido() {
    return this.formularioRegistroEditar.get('Idanalytes');
  }
  get IdsourceNoValido() {
    return this.formularioRegistroEditar.get('Idsource');
  }
  get ObjectiveNoValido() {
    return this.formularioRegistroEditar.get('Objective');
  }
  get IdunitsNoValido() {
    return this.formularioRegistroEditar.get('Idunits');
  }
  get IdanalytesNoValidoEdit() {
    return this.formularioRegistroEditarPre.get('Idanalytes');
  }
  get IdsourceNoValidoEdit() {
    return this.formularioRegistroEditarPre.get('Idsource');
  }
  get ObjectiveNoValidoEdit() {
    return this.formularioRegistroEditarPre.get('Objective');
  }
  get IdunitsNoValidoEdit() {
    return this.formularioRegistroEditarPre.get('Idunits');
  }

  async openModalRegistro(templateRegistro: TemplateRef<any>, datos: any) {

    this.crearFormulario(datos);
    await this.consultarAnalitos(this.idprogram);
    await this.consultarFuentes();
    await this.consultarUnits();


    if (datos) {
      this.accionEditar = true;
      this.accion = "Editar";
    } else {
      this.accionEditar = false;
      this.accion = "Crear";
    }
    const destroy$: Subject<boolean> = new Subject<boolean>();
    /* Variables recibidas por el modal */
    const data: ModalData = {
      content: templateRegistro,
      btn: this.accionEditar ? 'Actualizar' : 'Guardar',
      btn2: 'Cerrar',
      footer: true,
      title: this.accion,
      image: this.accionEditar ? 'assets/rutas/iconos/editar.png' : 'assets/rutas/iconos/editar.png',
    };
    const dialogRef = this.dialog.open(ModalGeneralComponent, { height: 'auto', width: '40em', data, disableClose: true });

    dialogRef.componentInstance.primaryEvent?.pipe(takeUntil(destroy$)).subscribe(x => {
      if (this.formularioRegistroEditar.invalid) {
        this.formularioRegistroEditar.markAllAsTouched();
        return
      }
      this.crearEditar();
      dialogRef.close();
    });

  }


  async crearEditar() {

    let nuevaData = this.formularioRegistroEditar.value;

    if (!this.formularioRegistroEditar.invalid) {
      const respuesta = await this.programxanalito(nuevaData.Idanalytes, this.idprogram);
      nuevaData.idprogramconf = respuesta[0].IdProgramconf;
      const datos = {
        Idconfobjquaprogramanalyte: this.formularioRegistroEditar.value.Idconfobjquaprogramanalyte,
        Idanalytes: this.formularioRegistroEditar.value.Idanalytes,
        Idsource: this.formularioRegistroEditar.value.Idsource,
        Objective: this.formularioRegistroEditar.value.Objective,
        Idunits: this.formularioRegistroEditar.value.Idunits,
        idProgramconf: respuesta[0].IdProgramconf,
        Datemod: this.datePipe.transform(new Date, "yyyy-MM-dd"),
        active: this.formularioRegistroEditar.value.Active
      }

      if (this.accion === 'Crear') {

        let analito = nuevaData.Idanalytes;
        let existeAnalito = this.listaObjetivosCalidad.find(objetivo => objetivo.Idanalytes == analito) || undefined;

        if (existeAnalito != undefined) {
          this.tituloAccion = 'noDatos';
          this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.YAEXISTEANALITO'));

        } else {

          try {
            this.tituloAccion = 'Crear';
            this.desactivar = true;
            this.loaderService.show();
            this.loaderService.text.emit({ text: 'Guardando registro' });
            let creacion = await this.objetivosCalidadQceService.create(nuevaData).toPromise();
            this.loaderService.hide();

            this.filtrar();
            this.toastr.success('Registro creado');
            this.desactivar = false;

            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              Hora: this.dateNowISO,
              Metodo: 'creación',
              Datos: JSON.stringify(this.formularioRegistroEditar.value),
              Respuesta: JSON.stringify(respuesta),
              TipoRespuesta: status
            }
            this.logsService.createLogAsync(Loguser).then(respuesta => {
            });


          } catch (error) {
            this.loaderService.hide();
            const Loguser = {
              fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.dateNowISO,
              metodo: 'creación',
              datos: JSON.stringify(this.formularioRegistroEditar.value),
              respuesta: error.message,
              tipoRespuesta: error.status
            }
            this.logsService.createLogAsync(Loguser).then(respuesta => {
            });
          }




        }

      } else {

        try {
          this.loaderService.show();
          this.loaderService.text.emit({ text: 'Editando registro' });
          this.tituloAccion = 'Editar';
          let respuesta = await this.objetivosCalidadQceService.update(datos, datos.Idconfobjquaprogramanalyte).toPromise();
          this.loaderService.hide()
          this.filtrar();
          this.toastr.success('Registro actualizado');

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            Hora: this.dateNowISO,
            Metodo: 'actualización',
            Datos: JSON.stringify(this.formularioRegistroEditar.value),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: status
          }


          this.logsService.createLogAsync(Loguser).then(respuesta => {
          });
        } catch (error) {
          this.loaderService.hide()
          const Loguser = {
            fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.dateNowISO,
            metodo: 'actualización',
            datos: JSON.stringify(this.formularioRegistroEditar.value),
            respuesta: error.message,
            tipoRespuesta: error.status
          }
          this.logsService.createLogAsync(Loguser).then(respuesta => {
            console.log(respuesta);
          });
        }



      }

    }
  }


  async actualizarEstado(dataConfig) {
    const [data, estado] = dataConfig
    this.loaderService.show();
    const respuesta = await this.programxanalito(data.Idanalytes, this.idprogram)
    this.loaderService.hide();


    const datos = {
      Idconfobjquaprogramanalyte: data.Idconfobjquaprogramanalyte,
      Idanalytes: data.Idanalytes,
      Idsource: data.Idsource,
      Objective: data.Objective,
      Idunits: data.Idunits,
      idProgramconf: respuesta[0].IdProgramconf,
      Datemod: this.datePipe.transform(new Date, "yyyy-MM-dd"),
      active: estado
    }
    this.loaderService.show();
    this.objetivosCalidadQceService.update(datos, data.Idconfobjquaprogramanalyte).subscribe(respuesta => {
      this.loaderService.hide();
      this.filtrar();
      this.toastr.success('Estado actualizado', 'Actualización');
    }, err => {
      this.loaderService.hide();
      this.toastr.error('No fue posible actualizar el estado', 'Error')
    });
  }
  eliminar(id: any) {

    this.objetivosCalidadQceService.delete('qce/ConfobjquaprogramanalyteQce', id).subscribe({

      next: (respuesta) => {
        this.filtrar();
        this.tituloAccion = '';
        this.toastr.success('Registro eliminado');

        const Loguser = {
          fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.dateNowISO,
          metodo: 'eliminación',
          datos: JSON.stringify(id),
          respuesta: JSON.stringify(respuesta),
          tipoRespuesta: status
        }
        this.logsService.createLogAsync(Loguser).then(respuesta => {
        });
      },
      error: (err) => {
        this.toastr.error(this.messageError);

        const Loguser = {
          fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.dateNowISO,
          metodo: 'eliminación',
          datos: JSON.stringify(id),
          respuesta: err.message,
          tipoRespuesta: err.status
        }
        this.logsService.createLogAsync(Loguser).then(respuesta => {
        });
      }

    });

  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  titulosSwal() {
    this.translate.get('MODULES.SWAL.MESAGEERROR').subscribe(respuesta => this.messageError = respuesta);
    this.translate.get('MODULES.SWAL.TITULO_ERROR').subscribe(respuesta => this.titulo2 = `<b>${respuesta}</b>`);
    this.translate.get('MODULES.SWAL.SINDATOS').subscribe(respuesta => this.messageSinDatos = respuesta);
    this.translate.get('MODULES.SWAL.OK').subscribe(respuesta => this.ok = `<b>${respuesta}</b>`);
  }


  filtrar() {
    if (!this.formulario.invalid) {
      this.loaderService.show()
      this.loaderService.text.emit({ text: 'Cargando datos...' })
      this.objetivosCalidadQceService.filtrarDatos(this.formulario.value.idProgram).then(respuesta => {
        setTimeout(() => {
          this.loaderService.hide()
          this.ver = true
          const filtrarDataTable: any[] = respuesta;
          this.dataTableBody = filtrarDataTable.map(x => {
            return { Analito: x.Desanalytes, Fuente: x.Dessource, Objetivo: x.Objective, Unidad: x.Codunits, Estado: x.active, item: x, item6: x, item7: x };
          });
          this.listaObjetivosCalidad = respuesta;
          this.dataSource = new MatTableDataSource(this.listaObjetivosCalidad);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.sharedService.customTextPaginator(this.paginator);

        }, 1000);
        this.bandera = true;
      }, err => {
        this.ver = false
        this.loaderService.hide()
        this.bandera = true;
        this.listaObjetivosCalidad = [];
        this.tituloAccion = 'noDatos';
        this.toastr.error('No se encontraron datos');
        this.dataSource = new MatTableDataSource([]);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.sharedService.customTextPaginator(this.paginator);
      });
    }
  }
  changeValue(value) {

    if (this.programasActive && value) {
      var seleccion = this.programasActive.find(s => s.idProgram == value);
      if (seleccion)
        this.selectedProgram = seleccion.desprogram;
    }
  }
  async programxanalito(Idanalytes, idProgram) {
    return this.objetivosCalidadQceService.programaAnalito(Idanalytes, idProgram);
  }

  grafica() {
    this.chartOptions1 = {
      series1: [
        {
          name: "Actual",
          data: [
            {
              x: "Enero",
              y: 1292,
              goals: [
                {
                  name: "Expectativa",
                  value: 6000,
                  strokeWidth: 5,
                  strokeColor: "#775DD0"
                }
              ]
            },
            {
              x: "Febrero",
              y: 4432,
              goals: [
                {
                  name: "Expectativa",
                  value: 6000,
                  strokeWidth: 5,
                  strokeColor: "#775DD0"
                }
              ]
            },
            {
              x: "Marzo",
              y: 5423,
              goals: [
                {
                  name: "Expectativa",
                  value: 6000,
                  strokeWidth: 5,
                  strokeColor: "#775DD0"
                }
              ]
            },
            {
              x: "Abril",
              y: 6653,
              goals: [
                {
                  name: "Expectativa",
                  value: 6000,
                  strokeWidth: 5,
                  strokeColor: "#775DD0"
                }
              ]
            },
            {
              x: "Mayo",
              y: 8133,
              goals: [
                {
                  name: "Expectativa",
                  value: 6000,
                  strokeWidth: 5,
                  strokeColor: "#775DD0"
                }
              ]
            },
            {
              x: "Junio",
              y: 7132,
              goals: [
                {
                  name: "Expectativa",
                  value: 6000,
                  strokeWidth: 5,
                  strokeColor: "#775DD0"
                }
              ]
            },
            {
              x: "Julio",
              y: 7332,
              goals: [
                {
                  name: "Expectativa",
                  value: 6000,
                  strokeWidth: 5,
                  strokeColor: "#775DD0"
                }
              ]
            },
            {
              x: "Agosto",
              y: 6553,
              goals: [
                {
                  name: "Expectativa",
                  value: 6000,
                  strokeWidth: 5,
                  strokeColor: "#775DD0"
                }
              ]
            }
          ]
        }
      ],
      chart: {
        height: 350,
        type: "bar"
      },
      plotOptions: {
        bar: {
          columnWidth: "60%"
        }
      },
      colors: ["#00E396"],
      dataLabels: {
        enabled: true
      },
      legend: {
        show: true,
        showForSingleSeries: true,
        customLegendItems: ["Actual", "Expectativa"],
        markers: {
          fillColors: ["#00E396", "#775DD0"]
        }
      }
    };
  }
  grafica2() {
    this.chartOptions2 = {
      series2: [
        {
          name: "Cantidad",
          data: [21, 22, 10, 28, 16, 21]
        }
      ],
      chart: {
        height: 350,
        type: "bar",
        events: {
          click: function (chart, w, e) {
            // console.log(chart, w, e)
          }
        }
      },
      colors: [
        "#008FFB",
        "#00E396",
        "#FEB019",
        "#FF4560",
        "#775DD0",
        "#546E7A",
        "#26a69a",
        "#D10CE8"
      ],
      plotOptions: {
        bar: {
          columnWidth: "45%",
          distributed: true
        }
      },
      dataLabels: {
        enabled: true
      },
      legend: {
        show: false
      },
      grid: {
        show: true
      },
      xaxis: {
        categories: [
          "Menor 1,65",
          "Entre 1,65 y 2,99",
          "Entre 3 y 3,99",
          "Entre 4 y 5,99",
          "Mayor a 6",
          "Total"
        ],
        /*labels: {
          style: {
            colors: [
              "#008FFB",
              "#00E396",
              "#FEB019",
              "#FF4560",
              "#775DD0",
              "#546E7A"
            ],
            fontSize: "12px"
          }
        }*/
      }
    };
  }

  /* this.chartOptions2 = {
     series2: [
       {
         name: "Cantidad",
         data: [44, 55, 41, 67, 22, 43]
       }
     ],
     annotations: {
       points: [
         {
           x: "Total",
           seriesIndex: 0,
           label: {
             borderColor: "#775DD0",
             offsetY: 0,
             style: {
               color: "#fff",
               background: "#9b9b9b"
             },
             text: "Total"
           }
         }
       ]
     },
     chart: {
       height: 350,
       type: "bar"
     },
     colors: [
       "#008FFB",
       "#00E396",
       "#FEB019",
       "#FF4560",
       "#775DD0",
       "#546E7A",
       "#26a69a",
       "#D10CE8"
     ],
     plotOptions: {
       bar: {
         columnWidth: "50%",
         //endingShape: "rounded"
       }
     },
     dataLabels: {
       enabled: false
     },
     stroke: {
       width: 2
     },

     grid: {
       row: {
         colors: ["#fff", "#f2f2f2"]
       }
     },
     xaxis: {
       categories: [
         "Menor 1,65",
         "Entre 1,65 y 2,99",
         "Entre 3 y 3,99",
         "Entre 4 y 5,99",
         "Mayor a 6",
         "Total"
       ]
     },
     labels: {
       style: {
         colors: [
           "#008FFB",
           "#00E396",
           "#FEB019",
           "#FF4560",
           "#775DD0",
           "#546E7A",
           "#26a69a",
           "#D10CE8"
         ],
         fontSize: "12px"
       }
     },
     yaxis: {
       title: {
         text: "Servings"
       }
     },
     fill: {
       type: "gradient",
       gradient: {
         shade: "light",
         type: "horizontal",
         shadeIntensity: 0.25,
         gradientToColors: undefined,
         inverseColors: true,
         opacityFrom: 0.85,
         opacityTo: 0.85,
         stops: [50, 0, 100]
       }
     }
   };
 }*/
}
