import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, Validators, FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SharedService } from '@app/services/shared.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { ToastrService } from 'ngx-toastr';
import { ProgramConfQceDetailsService } from '@app/services/calidad-externo/ProgramconfQceDetails.service';
import { UnitsQceService } from '@app/services/calidad-externo/unitsQce.service';
import { LotesQceDetailsService } from '@app/services/calidad-externo/lotsQceDetails.service';
import { AnalitosService } from '@app/services/configuracion/analitos.service';
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
import { lastValueFrom, Subject, takeUntil } from 'rxjs';
import { ModalData } from '@app/Models/Modaldata';
import { ModalGeneralComponent } from '@app/modules/shared/modals/modal-general/modal-general.component';
import { EstadisticaSemiCuantitativaQce } from '@app/services/calidad-externo/EstadisticaSemiCuantitativaQce.service';

@Component({
  selector: 'app-estadistica-general-semicuantitativa',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, MatFormFieldModule, MatSelectModule,
    MatOptionModule, NgFor, MatTooltipModule, NgIf, MatInputModule, MatTableModule,
    MatSortModule, MatSlideToggleModule, MatPaginatorModule, TranslateModule,
    ImageCdnPipe, MatIconModule, NgxMatSelectSearchModule, NgClass],
  templateUrl: './estadistica-general-semicuantitativa.component.html',
  styleUrl: './estadistica-general-semicuantitativa.component.css',
})
export class EstadisticaGeneralSemicuantitativaComponent {
  
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  displayedColumns: string[] = ['analito', 'equipo', 'metodo', 'unidad', 'resultado', 'sistema_medicion','total', 'estado', 'editar', 'borrar'];
  dataSource: MatTableDataSource<any>;

  ventanaModal!: BsModalRef;

  formaBuscarDatos = this.fb.group({
    lote: ['', [Validators.required]],
    programa: ['', [Validators.required]],
  });

  formCrearEditar = this.fb.group({
    idSemiQuantitativeGeneralStatistics: [0, []],
    idProgram: [, []],
    idLot: [, []],
    idAnalytes: ['', [Validators.required]],
    idAnalyzer: [, [Validators.required]],
    idunits: [, [Validators.required]],
    idMethods: [, [Validators.required]],
    idResultsDictionary: [, [Validators.required]],
    totalData: [, [Validators.required]],
    Measuringsystem: ['', []],
    active: [true, []],
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
  valoresAsignadosCopy: any[] = [];
  valoresAsignados: any[] = [];

  verTabla: boolean = false;
  flagEditar: boolean = false;

  filterLotes = new FormControl('')
  filterPrograma = new FormControl('')
  filterAnalytes = new FormControl('')
  filterAnalizer = new FormControl('')
  filterMetodo = new FormControl('')
  filterUnits = new FormControl('')
  filterResultDictionary = new FormControl('')

  constructor(
    private EstadisticaSemiCuantitativaQce: EstadisticaSemiCuantitativaQce,
    private lotesQceDetailsService: LotesQceDetailsService,
    private programConfQceDetailsService: ProgramConfQceDetailsService,
    private analitosService: AnalitosService,
    private fb: FormBuilder,
    private translate: TranslateService,
    private toastr: ToastrService,
    private sharedService: SharedService,
    private datePipe: DatePipe,
    private analyzerQceService: AnalyzerQceService,
    private methodsQceService: MethodsQceService,
    private unitsQceService: UnitsQceService,
    private loaderService: LoaderService,
    private dialog: MatDialog
  ) { }

  async ngOnInit(): Promise<void> {
    this.sharedService.customTextPaginator(this.paginator);
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
    
    this.filterResultDictionary.valueChanges.subscribe(word => {
      
      if (word) {
        this.valoresAsignados = this.valoresAsignadosCopy.filter((value: any) => {
          return value.Desresults.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.valoresAsignados = this.valoresAsignadosCopy
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



  async cambiarEstadoforms(value: string = "", idSemiQuantitativeGeneralStatistics: number = 0) {
    this.formCrearEditar.reset({ active: true, idSemiQuantitativeGeneralStatistics, Measuringsystem: value });
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
      this.loaderService.show();
      
      this.verTabla = false;
      await lastValueFrom(this.EstadisticaSemiCuantitativaQce.GetinfoAnalytesSemiQuantitative(Number(this.formaBuscarDatos.value.programa)))
      .then(async dataAnalytes => {
        this.analitos = dataAnalytes;
        this.analitosCopy = dataAnalytes;
        this.loaderService.hide();
      }).catch(err => {
        this.toastr.error('No se encontraron analitos relacionados al programa');
      });
    } catch (error) {
      this.loaderService.hide()
      this.toastr.error('Hubo un error en el sistema');
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
      let programas: any = await this.programConfQceDetailsService.getProgramEsp("S").toPromise()
      if (programas) {
        this.listaProgramas = programas
        this.listaProgramasCopy = programas
      }
      this.loaderService.hide()

    } catch (error) {
      this.loaderService.hide()

    }

  }

  async buscar() {
    this.dataSource = new MatTableDataSource();
    if (this.formaBuscarDatos.valid) {
      await this.buscarResultadosAsignados();
      await lastValueFrom(this.EstadisticaSemiCuantitativaQce.GetEstadisticaSemiCuantitativa(Number(this.formaBuscarDatos.value.programa), Number(this.formaBuscarDatos.value.lote)))
        .then(async r => {
          if (!r) {
            this.toastr.error('No se encontraron datos parametrizados con el lote y programa escogidos.');
          }
          this.verTabla = true;
          this.generarData(r);
        }).catch(err => {
          this.toastr.error('No hay datos registrados');
          this.verTabla = true;
        });

    } else {
      this.toastr.error('Debe diligenciar todos los campos.');
      this.formaBuscarDatos.markAllAsTouched();
    }
  }

  async buscarResultadosAsignados() {
    if (this.formaBuscarDatos.valid) {
      await lastValueFrom(this.EstadisticaSemiCuantitativaQce.getConsultValueAssign(Number(this.formaBuscarDatos.value.programa)))
        .then(r => {
          if (!r) {
            this.toastr.error('No hay resultados registrados según el programa');
          }
          this.valoresAsignados = r;
          this.valoresAsignadosCopy = r;
        })
        .catch(err => {
          this.toastr.error('No hay resultados registrados con el lote y programa');
          this.verTabla = true;
        });

    } else {
      this.toastr.error('Debe diligenciar todos los campos.');
      this.formaBuscarDatos.markAllAsTouched();
    }
  }


  organizarDataEditarOCrear(): any {
    const {
      idSemiQuantitativeGeneralStatistics,
      idAnalytes,
      totalData,
      active,
      Measuringsystem,
      idAnalyzer,
      idMethods,
      idunits, 
      idResultsDictionary } = this.formCrearEditar.value;
    const { lote, programa } = this.formaBuscarDatos.value;
    const newObj = {
      idSemiQuantitativeGeneralStatistics,
      idProgram: programa,
      idLot: lote,
      idAnalytes: idAnalytes,
      totalData,
      active,
      Measuringsystem,
      idAnalyzer: idAnalyzer,
      idMethods: idMethods,
      idunits: idunits,
      idResultsDictionary: idResultsDictionary
    }
    return newObj;
  }


  detailObj() {
    let lote = this.lotes.find(x => x.IdLot == this.formaBuscarDatos.value.lote);
    let programa = this.listaProgramas.find(x => x.IdProgram == this.formaBuscarDatos.value.programa);
    let analito = this.analitos.find(x => x.idanalytes == this.formCrearEditar.value.idAnalytes);
    let data = {
      Analytes: analito?.desanalytes,
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
    this.EstadisticaSemiCuantitativaQce.createAsync(newObj).then(r => {
      this.toastr.success('La configuración de estadistica general fue creada exitosamente.');
      this.buscar();
      this.formCrearEditar.reset({ active: true, idSemiQuantitativeGeneralStatistics: 0, Measuringsystem: 'EM' });

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
      this.EstadisticaSemiCuantitativaQce.createLogAsync(Loguser);
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
        this.EstadisticaSemiCuantitativaQce.createLogAsync(Loguser);
      });
  }
  
  async editarData(idSemiQuantitativeGeneralStatistic: number, newObj: any, pasaInvalido: boolean = false) {
    const usuario = sessionStorage.getItem('userid') || 'desconocido';
    const nombreUsuario = sessionStorage.getItem('nombres') || 'desconocido';
    const inicio = Date.now();
    const endpoint = `${window.location.origin}/api/ConfiguracionEstadistica`;
    const userAgent = navigator.userAgent;

    // Capturar datos anteriores antes de editar
    let datosAnteriores: any = '';
    try {
      const response = await this.EstadisticaSemiCuantitativaQce.getByIdAsync(idSemiQuantitativeGeneralStatistic);
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

    this.EstadisticaSemiCuantitativaQce.updateConfiguracionesEstadisticas(idSemiQuantitativeGeneralStatistic, newObj)
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
        this.EstadisticaSemiCuantitativaQce.createLogAsync(Loguser);
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
        this.EstadisticaSemiCuantitativaQce.createLogAsync(Loguser);
      });
  }

  async editar(idSemiQuantitativeGeneralStatistic: number) {
    const newObj = this.organizarDataEditarOCrear();
    await this.editarData(idSemiQuantitativeGeneralStatistic, newObj);
  }

  async editarToggle(event: any, row: any) {
    row.active = event.checked
    await this.editarData(row.idSemiQuantitativeGeneralStatistic, row, true);
  }

  private generarData(r) {
    this.dataSource = new MatTableDataSource(r);
    this.verTabla = true;
    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;

    }, 100);
  }



  async modalCrear(templateRegistroRondasQce: TemplateRef<any>) {
    this.formCrearEditar.reset({ active: true, idSemiQuantitativeGeneralStatistics: 0, Measuringsystem: 'EM' });



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
      idSemiQuantitativeGeneralStatistics: datos.idSemiQuantitativeGeneralStatistic,
      idLot: datos.idLot,
      idProgram: datos.idProgram,
      idAnalytes: datos.idAnalytes,
      totalData: datos.totalData,
      active: datos.active,
      Measuringsystem: datos.measuringsystem,
      idAnalyzer: datos.idAnalyzer,
      idMethods: datos.idMethods,
      idunits: datos.idunits,
      idResultsDictionary: datos.idResultsDictionary
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
      this.editar(datos.idSemiQuantitativeGeneralStatistic);
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
      const dataEG = await this.EstadisticaSemiCuantitativaQce.getByIdAsync(id);
      configurationEstadisticaGeneral = dataEG ? JSON.stringify(dataEG) : 'No disponible';
    } catch (e) {
      configurationEstadisticaGeneral = 'No disponible';
    }

    const usuario = sessionStorage.getItem('userid') || 'desconocido';
    const nombreUsuario = sessionStorage.getItem('nombres') || 'desconocido';
    const inicio = Date.now();
    const endpoint = `${window.location.origin}/api/ConfiguracionEstadistica`;
    const userAgent = navigator.userAgent;

    this.EstadisticaSemiCuantitativaQce.deleteConfiguracionesEstadisticas(id).subscribe({
      next: (respuesta) => {
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
        this.EstadisticaSemiCuantitativaQce.createLogAsync(Loguser);
      },
      error: (error) => {
        const fin = Date.now();
        const tiempoEjecucion = fin - inicio;
        const tipoRespuesta = error.status ?? 500;
        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          Hora: this.datePipe.transform(new Date(), "HH:mm:ss"),
          modulo: 'Control Calidad Externo',
          SubModulo: 'Administración',
          item: 'Configuración estadística general',
          metodo: 'eliminación',
          Datos: JSON.stringify({ id }),
          DatosAnteriores: configurationEstadisticaGeneral,
          Respuesta: error?.message || 'Sin contenido en la respuesta',
          TipoRespuesta: tipoRespuesta,
          userid: usuario,
          usuario: nombreUsuario,
          executionTime: tiempoEjecucion,
          endpoint: endpoint,
          userAgent: userAgent
        };
        this.EstadisticaSemiCuantitativaQce.createLogAsync(Loguser);
      }
    })
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
