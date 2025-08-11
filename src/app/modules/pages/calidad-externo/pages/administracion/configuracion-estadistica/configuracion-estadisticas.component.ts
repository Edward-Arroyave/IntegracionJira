import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, Validators, FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SharedService } from '@app/services/shared.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { ProgramConfQceDetailsService } from '@app/services/calidad-externo/ProgramconfQceDetails.service';
import { UnitsQceService } from '@app/services/calidad-externo/unitsQce.service';
import { LotesQceDetailsService } from '@app/services/calidad-externo/lotsQceDetails.service';
import { AssignValuesExpectedQceService } from '@app/services/calidad-externo/assign-values-expected-qce.service';
import { AnalitosService } from '@app/services/configuracion/analitos.service';
import { ConfiguracionEstadisticaService } from '@app/services/calidad-externo/configuracion-estadistica.service';
import { createLog } from '@app/globals/logUser';
import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { AnalyzerQceService } from '@app/services/calidad-externo/AnalyzerQce.service';
import { MethodsQceService } from '@app/services/calidad-externo/MethodsQce.service';
import { ImageCdnPipe } from '../../../../../core/pipes/image-cdn.pipe';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { HttpErrorResponse } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { LoaderService } from '@app/services/loader/loader.service';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { ModalData } from '@app/Models/Modaldata';
import { ModalGeneralComponent } from '@app/modules/shared/modals/modal-general/modal-general.component';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';


@Component({
  selector: 'app-configuracion-estadisticas',
  templateUrl: './configuracion-estadisticas.component.html',
  styleUrls: ['./configuracion-estadisticas.component.css'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, MatFormFieldModule, MatSelectModule,
    MatOptionModule, NgFor, MatTooltipModule, NgIf, MatInputModule, MatTableModule,
    MatSortModule, MatSlideToggleModule, MatPaginatorModule, TranslateModule,
    ImageCdnPipe, MatIconModule, NgxMatSelectSearchModule, NgClass]
})
export class ConfiguracionEstadisticasComponent implements OnInit {

  displayedColumns: string[] = ['desanalytes', 'nameAnalyzer', 'desmethods', 'codunits', 'average', 'ds', 'totalData', 'estado', 'editar', 'borrar'];
  // dataSource: MatTableDataSource<any>;
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  ventanaModal!: BsModalRef;
  
  formaBuscarDatos = this.fb.group({
    lote: ['', [Validators.required]],
    programa: ['', [Validators.required]],
  });
  
  formCrearEditar = this.fb.group({
    idGeneralStatisticalValues: [0, []],
    idProgram: [, []],
    idLot: [, []],
    idAnalytes: ['', [Validators.required]],
    totalData: [, [Validators.required]],
    average: [, [Validators.required]],
    ds: [, [Validators.required]],
    Measuringsystem: ['', []],
    active: [true, []],
    idAnalyzer: [, [Validators.required]],
    idunits: [, [Validators.required]],
    idMethods: [, [Validators.required]]
  });
  
  
  lotes: any[] = [];
  lotesCopy: any[] = [];
  listaProgramas: any[] = [];
  listaProgramasCopy: any[] = [];
  analitos: any[] = [];
  analitosCopy: any[] = [];
  listaUnidades: any[] = [];
  listaUnidadesCopy: any[] = [];
  listaUnits: any;
  analyzers: any[] = [];
  analyzersCopy: any[] = [];
  methods: any;
  methodsActive: any;
  methodsActiveCopy: any;
  
  verTabla: boolean = true;
  flagEditar: boolean = false;
  log = new createLog(this.datePipe, this.translate, this.configuracionEstadisticaService);

  filterLotes = new FormControl('')
  filterPrograma = new FormControl('')
  filterAnalytes = new FormControl('')
  filterAnalizer = new FormControl('')
  filterMetodo = new FormControl('')
  filterUnits = new FormControl('')

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  constructor(
    private configuracionEstadisticaService: ConfiguracionEstadisticaService,
    private lotesQceDetailsService: LotesQceDetailsService,
    private programConfQceDetailsService: ProgramConfQceDetailsService,
    private analitosService: AnalitosService,
    private fb: FormBuilder,
    private translate: TranslateService,
    private toastr: ToastrService,
    private sharedService: SharedService,
    private datePipe: DatePipe,
    private modalService: BsModalService,
    private analyzerQceService: AnalyzerQceService,
    private methodsQceService: MethodsQceService,
    private unitsQceService: UnitsQceService,
    private loaderService: LoaderService,
    private dialog: MatDialog
  ) { }

  async ngOnInit(): Promise<void> {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.sharedService.customTextPaginator(this.paginator);
    // this.verTabla = false;
    await this.getLotes();
    await this.consultarProgramas();
    await this.getAnalizadores();
    this.getMethods();
    this.getUnidades();
    this.filters();
  }


  filters() {
    this.filterLotes.valueChanges.subscribe(word => {

      if (word) {
        this.lotes = this.lotesCopy.filter((lote: any) => {
          return lote.Numlot.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.lotes = this.lotesCopy
      }
    });

    this.filterPrograma.valueChanges.subscribe(word => {

      if (word) {
        this.listaProgramas = this.listaProgramasCopy.filter((item: any) => {
          return item.Desprogram.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.listaProgramas = this.listaProgramasCopy
      }
    });
    this.filterAnalytes.valueChanges.subscribe(word => {

      if (word) {
        this.analitos = this.analitosCopy.filter((item: any) => {
          return item.desanalytes.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.analitos = this.analitosCopy
      }
    });
    this.filterAnalizer.valueChanges.subscribe(word => {

      if (word) {
        this.analyzers = this.analyzersCopy.filter((item: any) => {
          return item.nameAnalyzer.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.analyzers = this.analyzersCopy
      }
    });
    this.filterMetodo.valueChanges.subscribe(word => {

      if (word) {
        this.methodsActive = this.methodsActiveCopy.filter((metodo: any) => {
          return metodo.desmethods.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.methodsActive = this.methodsActiveCopy
      }
    });
    this.filterUnits.valueChanges.subscribe(word => {

      if (word) {
        this.listaUnidades = this.listaUnidadesCopy.filter((metodo: any) => {
          return metodo.codunits.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.listaUnidades = this.listaUnidadesCopy
      }
    });
  }

  get obtenerAccion() {
    return this.formCrearEditar.get('Measuringsystem').value;
  }


  estadosFormulario(campos: string[], validators: any[]) {
    this.formCrearEditar.controls[campos[0]].setValidators(validators[0]);
    this.formCrearEditar.controls[campos[0]].clearValidators();
    this.formCrearEditar.controls[campos[0]].updateValueAndValidity();

    this.formCrearEditar.controls[campos[1]].clearValidators();
    this.formCrearEditar.controls[campos[1]].setValidators(validators[1]);
    this.formCrearEditar.controls[campos[1]].updateValueAndValidity();
  }



  cambiarEstadoforms(value: string = "", idGeneralStatisticalValues: number = 0) {
    this.formCrearEditar.reset({ active: true, idGeneralStatisticalValues, Measuringsystem: value });
    switch (value) {
      case "M":
        this.estadosFormulario(['idAnalyzer', 'idMethods'], [Validators.nullValidator, Validators.required]);
        break;
      case "T":
        this.estadosFormulario(['idAnalyzer', 'idMethods'], [Validators.nullValidator, Validators.nullValidator]);
        break;
      default:
        this.estadosFormulario(['idAnalyzer', 'idMethods'], [Validators.required, Validators.required]);
        break;
    }
  }

  aplicarFiltro(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  async getUnidades() {

    try {
      this.loaderService.show()
      let unidades: any = await this.unitsQceService.unidadesList()
      if (unidades) {
        this.listaUnidades = unidades;
        this.listaUnidadesCopy = unidades;
      }
      this.loaderService.hide()

    } catch (error) {
      this.loaderService.hide()
    }


  }

  async getAnalitosxPrograma(event: any) {

    try {
      this.verTabla = false;
      this.loaderService.show()
      let analitos: any = await this.analitosService.getAnalitosPorPrograma(event.value).toPromise();
      if (analitos) {
        this.analitos = analitos;
        this.analitosCopy = analitos;
      }
      this.loaderService.hide()

    } catch (error) {
      this.loaderService.hide()
      this.toastr.error('No se encontraron analitos relacionados al programa');
    }

  }

  async getLotes() {

    try {
      this.loaderService.show()
      let lotes: any = await this.lotesQceDetailsService.getAllAsync()
      if (lotes) {
        this.lotes = lotes
        this.lotesCopy = lotes

      }
      this.loaderService.hide()

    } catch (error) {
      this.loaderService.hide()

    }





  }


  async consultarProgramas() {
    try {
      this.loaderService.show()
      let programas: any = await this.programConfQceDetailsService.getProgramEsp("N").toPromise()
      if (programas) {
        this.listaProgramas = programas
        this.listaProgramasCopy = programas
      }
      this.loaderService.hide()

    } catch (error) {
      this.loaderService.hide()

    }

  }

  buscar() {
    this.dataSource = new MatTableDataSource();
    if (this.formaBuscarDatos.valid) {
      this.configuracionEstadisticaService
        .getConfiguracionesEstadisticas(Number(this.formaBuscarDatos.value.programa), Number(this.formaBuscarDatos.value.lote)).toPromise()
        .then(r => {
          if (!r) {
            this.toastr.error('No hay datos registrados');
          }
          this.verTabla = true;
          this.generarData(r);
        })
        .catch(err => {
          this.toastr.error('No hay datos registrados');
          this.verTabla = true;
        });

    } else {
      this.toastr.error('Debe diligenciar todos los campos.');
      this.formaBuscarDatos.markAllAsTouched();
    }
  }



  organizarDataEditarOCrear(): any {
    const {
      idGeneralStatisticalValues,
      idAnalytes,
      totalData,
      average,
      ds,
      active,
      Measuringsystem,
      idAnalyzer,
      idMethods,
      idunits } = this.formCrearEditar.value;
    const { lote, programa } = this.formaBuscarDatos.value;
    const newObj = {
      idGeneralStatisticalValues,
      idProgram: programa,
      idLot: lote,
      idAnalytes: idAnalytes,
      totalData,
      average,
      ds,
      active,
      Measuringsystem,
      idAnalyzer: idAnalyzer,
      idMethods: idMethods,
      idunits
    }
    return newObj;
  }


  detailObj() {
    let lote = this.lotes.find(x => x.IdLot == this.formaBuscarDatos.value.lote);
    let programa = this.listaProgramas.find(x => x.IdProgram == this.formaBuscarDatos.value.programa);
    let analito = this.analitos.find(x => x.idanalytes == this.formCrearEditar.value.idAnalytes);
    let data = {
      Analytes: analito?.desanalytes,
      average: this.formCrearEditar.value.average,
      ds: this.formCrearEditar.value.ds,
      totalData: this.formCrearEditar.value.totalData,
      estado: this.formCrearEditar.value.active,
      Measuringsystem: this.formCrearEditar.value.Measuringsystem,
      idAnalyzer: this.formCrearEditar.value.idAnalyzer,
      idMethods: this.formCrearEditar.value.idMethods,
      idunits: this.formCrearEditar.value.idunits
    }
    let obj = {
      Lote: lote.Numlot,
      Programa: programa.Desprogram,
      tabla: data
    }

    return obj;
  }

  // crearAsignacion() {
  //   this.detailObj();
  //   const newObj = this.organizarDataEditarOCrear();
  //   if (this.formCrearEditar.invalid) {
  //     this.toastr.error('Por favor diligencie todos los datos')
  //     this.formCrearEditar.markAllAsTouched();
  //     return
  //   }
  //   this.configuracionEstadisticaService.createConfiguracionesEstadisticas(newObj).then(r => {
  //     this.toastr.success('La configuración de estadistica general fue creada exitosamente.');
  //     this.log.logObj('Control Calidad Externo', 'Administración', 'Configuración estadísticas', 'c', this.detailObj(), JSON.stringify(r), 200);
  //     this.buscar();
  //     this.formCrearEditar.reset({ active: true, idGeneralStatisticalValues: 0, Measuringsystem: 'EM' });

  //   })
  //     .catch(err => {
  //       this.toastr.error(err.error);
  //       this.log.logObj('Control Calidad Externo', 'Administración', 'Configuración estadísticas', 'c', this.detailObj(), err.message, err.status);
  //       // this.formCrearEditar.reset({active:true,idGeneralStatisticalValues:0,Measuringsystem:'EM'});
  //       // this.closeVentana();
  //     });
  // }

  crearAsignacion() {
    // Inicio de log
    const usuario = sessionStorage.getItem('userid') || 'desconocido';
    const nombreUsuario = sessionStorage.getItem('nombres') || 'desconocido';
    const inicio = Date.now();
    const endpoint = `${window.location.origin}/api/ConfiguracionEstadistica`; // Ajusta el endpoint si es necesario
    const userAgent = navigator.userAgent;

    this.detailObj();
    const newObj = this.organizarDataEditarOCrear();
    if (this.formCrearEditar.invalid) {
      this.toastr.error('Por favor diligencie todos los datos')
      this.formCrearEditar.markAllAsTouched();
      return
    }
    this.configuracionEstadisticaService.createConfiguracionesEstadisticas(newObj).then(r => {
      this.toastr.success('La configuración de estadistica general fue creada exitosamente.');
      this.buscar();
      this.formCrearEditar.reset({ active: true, idGeneralStatisticalValues: 0, Measuringsystem: 'EM' });

      // Log personalizado
      const fin = Date.now();
      const tiempoEjecucion = fin - inicio;
      const tipoRespuesta = r?.status === 200 || r?.status === 201 || r?.status === 204 ? 200 : r?.status ?? 200;
      const Loguser = {
        Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
        Hora: this.datePipe.transform(new Date(), "HH:mm:ss"),
        modulo: 'Control Calidad Externo',
        SubModulo: 'Administración',
        item: 'Configuración estadística general',
        metodo: 'creación',
        Datos: JSON.stringify(newObj),
        DatosAnteriores: '',
        Respuesta: r?.body ? JSON.stringify(r.body) : JSON.stringify(r),
        TipoRespuesta: tipoRespuesta,
        userid: usuario,
        usuario: nombreUsuario,
        executionTime: tiempoEjecucion,
        endpoint: endpoint,
        userAgent: userAgent
      };
      this.configuracionEstadisticaService.createLogAsync(Loguser);
    })
      .catch(err => {
        this.toastr.error(err.error);

        // Log personalizado error
        const fin = Date.now();
        const tiempoEjecucion = fin - inicio;
        const tipoRespuesta = err.status ?? 500;
        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          Hora: this.datePipe.transform(new Date(), "HH:mm:ss"),
          modulo: 'Control Calidad Externo',
          SubModulo: 'Administración',
          item: 'Configuración estadística general',
          metodo: 'creación',
          Datos: JSON.stringify(newObj),
          DatosAnteriores: '',
          Respuesta: err?.message || 'Sin contenido en la respuesta',
          TipoRespuesta: tipoRespuesta,
          userid: usuario,
          usuario: nombreUsuario,
          executionTime: tiempoEjecucion,
          endpoint: endpoint,
          userAgent: userAgent
        };
        this.configuracionEstadisticaService.createLogAsync(Loguser);
        // this.formCrearEditar.reset({active:true,idGeneralStatisticalValues:0,Measuringsystem:'EM'});
        // this.closeVentana();
      });
  }
  

  // async editarData(idGeneralStatisticalValues: number, newObj: any, pasaInvalido: boolean = false) {
  //   if (!pasaInvalido) {
  //     if (this.formCrearEditar.invalid) {
  //       this.formCrearEditar.markAllAsTouched();
  //       return
  //     }
  //   }
  //   return this.configuracionEstadisticaService.updateConfiguracionesEstadisticas(idGeneralStatisticalValues, newObj)
  //     .then(r => {
  //       this.toastr.success('Estado actualizado', 'Actualización')
  //       this.log.logObj('Control Calidad Externo', 'Administración', 'Configuración estadísticas', 'a', this.detailObj(), JSON.stringify(r), 200);
  //       this.buscar();
  //       this.formCrearEditar.reset({ active: true });

  //     })
  //     .catch(err => {
  //       this.toastr.error('No fue posible actualizar el estado', 'Error')
  //       this.log.logObj('Control Calidad Externo', 'Administración', 'Configuración estadísticas', 'a', this.detailObj(), err.message, err.status);
  //       this.formCrearEditar.reset({ active: true });

  //     });
  // }

  async editarData(idGeneralStatisticalValues: number, newObj: any, pasaInvalido: boolean = false) {
    const usuario = sessionStorage.getItem('userid') || 'desconocido';
    const nombreUsuario = sessionStorage.getItem('nombres') || 'desconocido';
    const inicio = Date.now();
    const endpoint = `${window.location.origin}/api/ConfiguracionEstadistica`;
    const userAgent = navigator.userAgent;

    // Capturar datos anteriores antes de editar
    let datosAnteriores: any = '';
    try {
      const response = await this.configuracionEstadisticaService.getByIdAsync(idGeneralStatisticalValues);
      datosAnteriores = response ? JSON.stringify(response) : 'No disponible';
    } catch (e) {
      datosAnteriores = 'No disponible';
    }

    if (!pasaInvalido) {
      if (this.formCrearEditar.invalid) {
        this.formCrearEditar.markAllAsTouched();
        return;
      }
    }
    return this.configuracionEstadisticaService.updateConfiguracionesEstadisticas(idGeneralStatisticalValues, newObj)
      .then(r => {
        this.toastr.success('Estado actualizado', 'Actualización');
        this.buscar();
        this.formCrearEditar.reset({ active: true });

        // Log personalizado ÚNICO
        const fin = Date.now();
        const tiempoEjecucion = fin - inicio;
        const tipoRespuesta = r?.status === 200 || r?.status === 201 || r?.status === 204 ? 200 : r?.status ?? 200;
        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          Hora: this.datePipe.transform(new Date(), "HH:mm:ss"),
          modulo: 'Control Calidad Externo',
          SubModulo: 'Administración',
          item: 'Configuración estadística general',
          metodo: 'actualización',
          Datos: JSON.stringify(newObj),
          DatosAnteriores: datosAnteriores,
          Respuesta: r?.body ? JSON.stringify(r.body) : JSON.stringify(r),
          TipoRespuesta: tipoRespuesta,
          userid: usuario,
          usuario: nombreUsuario,
          executionTime: tiempoEjecucion,
          endpoint: endpoint,
          userAgent: userAgent
        };
        this.configuracionEstadisticaService.createLogAsync(Loguser);
      })
      .catch(err => {
        this.toastr.error('No fue posible actualizar el estado', 'Error');
        this.formCrearEditar.reset({ active: true });

        // Log personalizado ÚNICO
        const fin = Date.now();
        const tiempoEjecucion = fin - inicio;
        const tipoRespuesta = err.status ?? 500;
        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          Hora: this.datePipe.transform(new Date(), "HH:mm:ss"),
          modulo: 'Control Calidad Externo',
          SubModulo: 'Administración',
          item: 'Configuración estadística general',
          metodo: 'actualización',
          Datos: JSON.stringify(newObj),
          DatosAnteriores: datosAnteriores,
          Respuesta: err?.message || 'Sin contenido en la respuesta',
          TipoRespuesta: tipoRespuesta,
          userid: usuario,
          usuario: nombreUsuario,
          executionTime: tiempoEjecucion,
          endpoint: endpoint,
          userAgent: userAgent
        };
        this.configuracionEstadisticaService.createLogAsync(Loguser);
      });
  }

  async editar(idGeneralStatisticalValues: number) {
    const newObj = this.organizarDataEditarOCrear();
    await this.editarData(idGeneralStatisticalValues, newObj);
  }

  async editarToggle(event: any, row: any) {
    row.active = event.checked
    await this.editarData(row.idGeneralStatisticalValues, row, true);
  }

  private generarData(r) {
    this.dataSource = new MatTableDataSource(r);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.verTabla = true;
  }



  async modalCrear(templateRegistroRondasQce: TemplateRef<any>) {
    this.formCrearEditar.reset({ active: true, idGeneralStatisticalValues: 0, Measuringsystem: 'EM' });



    const destroy$: Subject<boolean> = new Subject<boolean>();
    /* Variables recibidas por el modal */
    const data: ModalData = {
      content: templateRegistroRondasQce,
      btn: 'Guardar',
      btn2: 'Cerrar',
      footer: true,
      title: 'Crear',
      image: 'assets/rutas/iconos/crear.png',
    };
    const dialogRef = this.dialog.open(ModalGeneralComponent, { height: 'auto', width: '40em', data, disableClose: true });

    dialogRef.componentInstance.primaryEvent?.pipe(takeUntil(destroy$)).subscribe(x => {
      if (this.formCrearEditar.invalid) {
        this.formCrearEditar.markAllAsTouched();
        return
      }
      this.crearAsignacion();
      dialogRef.close();
    });

  }

  async modalEditar(templateRegistroConfEdit: TemplateRef<any>, datos: any) {
    this.flagEditar = true;
    const newObj = {
      idGeneralStatisticalValues: datos.idGeneralStatisticalValues,
      idLot: datos.idLot,
      idProgram: datos.idProgram,
      idAnalytes: datos.idAnalytes,
      totalData: datos.totalData,
      average: datos.average,
      ds: datos.ds,
      active: datos.active,
      Measuringsystem: datos.measuringsystem,
      idAnalyzer: datos.idAnalyzer,
      idMethods: datos.idMethods,
      idunits: datos.idunits
    }
    this.formCrearEditar.setValue(newObj);

    const destroy$: Subject<boolean> = new Subject<boolean>();
    /* Variables recibidas por el modal */
    const data: ModalData = {
      content: templateRegistroConfEdit,
      btn: 'Actualizar',
      btn2: 'Cerrar',
      footer: true,
      title: 'Editar',
      image:'assets/rutas/iconos/editar.png'
    };
    const dialogRef = this.dialog.open(ModalGeneralComponent, { height: 'auto', width: '40em', data, disableClose: true });

    dialogRef.componentInstance.primaryEvent?.pipe(takeUntil(destroy$)).subscribe(x => {
      if (this.formCrearEditar.invalid) {
        this.formCrearEditar.markAllAsTouched();
        return
      }
      this.editar(datos.idGeneralStatisticalValues);
      dialogRef.close();
    });


    //this.ventanaModal = this.modalService.show(templateRegistroConfEdit, { 'class': 'modal-lg modal-dialog-centered', backdrop: 'static', keyboard: false });
  }

  async getMethods() {
    try {
      this.loaderService.show()
      this.methods = await this.methodsQceService.getAllAsync();
      this.methodsActive = this.methods.filter(e => e.active);
      this.methodsActiveCopy = this.methods.filter(e => e.active);
      this.loaderService.hide()
    } catch (error) {
      this.loaderService.hide()
    }

  }

  async getAnalizadores() {

    try {
      this.loaderService.show()
      let equipos: any = await this.analyzerQceService.getAllAsync()
      if (equipos) {
        this.analyzers = equipos
        this.analyzersCopy = equipos
      }
      this.loaderService.hide()

    } catch (error) {
      this.loaderService.hide()
    }

  }



  async eliminarConfEstadisticaGeneral(id: any) {
    // Capturar datos anteriores antes de eliminar
    let configurationEstadisticaGeneral: any = '';
    try {
      const dataEG = await this.configuracionEstadisticaService.getByIdAsync(id);
      configurationEstadisticaGeneral = dataEG ? JSON.stringify(dataEG) : 'No disponible';
    } catch (e) {
      configurationEstadisticaGeneral = 'No disponible';
    }

    const usuario = sessionStorage.getItem('userid') || 'desconocido';
    const nombreUsuario = sessionStorage.getItem('nombres') || 'desconocido';
    const inicio = Date.now();
    const endpoint = `${window.location.origin}/api/ConfiguracionEstadistica`;
    const userAgent = navigator.userAgent;

    this.configuracionEstadisticaService.DeleteConfiguracionesEstadisticas(id).subscribe(
      respuesta => {
        this.buscar();
        this.toastr.success('Registro eliminado');

        const fin = Date.now();
        const tiempoEjecucion = fin - inicio;
        const tipoRespuesta = respuesta?.status === 200 || respuesta?.status === 201 || respuesta?.status === 204 ? 200 : respuesta?.status ?? 200;
        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          Hora: this.datePipe.transform(new Date(), "HH:mm:ss"),
          modulo: 'Control Calidad Externo',
          SubModulo: 'Administración',
          item: 'Configuración estadística general',
          metodo: 'eliminación',
          Datos: JSON.stringify({ id }), 
          DatosAnteriores: configurationEstadisticaGeneral,
          Respuesta: respuesta?.body ? JSON.stringify(respuesta.body) : JSON.stringify(respuesta),
          TipoRespuesta: tipoRespuesta,
          userid: usuario,
          usuario: nombreUsuario,
          executionTime: tiempoEjecucion,
          endpoint: endpoint,
          userAgent: userAgent
        };
        this.configuracionEstadisticaService.createLogAsync(Loguser);
      },
      (err: HttpErrorResponse) => {
        const fin = Date.now();
        const tiempoEjecucion = fin - inicio;
        const tipoRespuesta = err.status ?? 500;
        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          Hora: this.datePipe.transform(new Date(), "HH:mm:ss"),
          modulo: 'Control Calidad Externo',
          SubModulo: 'Administración',
          item: 'Configuración estadística general',
          metodo: 'eliminación',
          Datos: JSON.stringify({ id }),
          DatosAnteriores: configurationEstadisticaGeneral,
          Respuesta: err?.message || 'Sin contenido en la respuesta',
          TipoRespuesta: tipoRespuesta,
          userid: usuario,
          usuario: nombreUsuario,
          executionTime: tiempoEjecucion,
          endpoint: endpoint,
          userAgent: userAgent
        };
        this.configuracionEstadisticaService.createLogAsync(Loguser);
      }
    );
  }


  borderTypeColor(measuringsystem: string): string {
    switch (measuringsystem) {
      case "EM":
        return 'pink-border'
        break;
      case "M":
        return 'orange-border'
        break;
      case "T":
        return 'blue-border'
        break;

      default:
        return 'blue-border'
        break;
    }
  }
}

