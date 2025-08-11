import { MatIconModule } from '@angular/material/icon';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SharedService } from '@app/services/shared.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { ToastrService } from 'ngx-toastr';
import { ProgramConfQceDetailsService } from '@app/services/calidad-externo/ProgramconfQceDetails.service';
import { MethodsQceService } from '@app/services/calidad-externo/MethodsQce.service';
import { UnitsQceService } from '@app/services/calidad-externo/unitsQce.service';
import { AnalyzerQceService } from '@app/services/calidad-externo/AnalyzerQce.service';
import { ReactivosQceService } from '@app/services/calidad-externo/reactivos-qce.service';
import { LotesQceDetailsService } from '@app/services/calidad-externo/lotsQceDetails.service';
import { AssignValuesExpectedQceService } from '@app/services/calidad-externo/assign-values-expected-qce.service';
import { AnalitosService } from '@app/services/configuracion/analitos.service';
import { AsyncPipe, DatePipe, NgFor, NgIf } from '@angular/common';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { createLog } from "../../../../../../globals/logUser";
import { ImageCdnPipe } from '../../../../../core/pipes/image-cdn.pipe';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog } from '@angular/material/dialog';
import { ModalData } from '@app/Models/Modaldata';
import { map, Observable, startWith, Subject, takeUntil } from 'rxjs';
import { MatAutocomplete, MatAutocompleteModule } from '@angular/material/autocomplete';
import { TablaComunComponent } from '@app/modules/shared/general-tablas/tabla-comun/tabla-comun.component';
import { LoaderService } from '@app/services/loader/loader.service';
import { ModalGeneralComponent } from '@app/modules/shared/modals/modal-general/modal-general.component';
import $ from 'jquery';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

@Component({
  selector: 'app-asignacion-valor-esperado',
  templateUrl: './asignacion-valor-esperado.component.html',
  styleUrls: ['./asignacion-valor-esperado.component.css'],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    NgFor
    , MatTooltipModule,
    NgIf,
    MatInputModule,
    MatTableModule,
    MatSortModule,
    MatSlideToggleModule,
    MatPaginatorModule,
    TranslateModule,
    ImageCdnPipe,
    MatAutocompleteModule,
    TablaComunComponent,
    AsyncPipe,
    MatIconModule,
    NgxMatSelectSearchModule,
    MatSelectModule
  ]
})
export class AsignacionValorEsperadoComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  displayedColumns: string[] = ['Analito', 'Equipo', 'Reactivo', 'Método', 'Valor esperado', 'Unidades', 'Estado', 'Editar', 'Eliminar'];
  dataSource: MatTableDataSource<any>;
  dataTableBody: any[] = [];
  analizador = new FormControl('');
  metodo = new FormControl('');
  unidades = new FormControl('');

  ventanaModal!: BsModalRef;

  formaBuscarDatos = this.fb.group({
    lote: ['', [Validators.required]],
    programa: ['', [Validators.required]],
  });

  formCrearEditar = this.fb.group({
    idAssignValuesExpected: [0, []],
    idAnalytes: ['', [Validators.required]],
    idAnalyzer: ['', [Validators.required]],
    idReagents: ['', [Validators.required]],
    idMethods: ['', [Validators.required]],
    idUnits: ['', [Validators.required]],
    valueExpected: ['', [Validators.required]],
    active: [true, []],
  });


  lotes: any;
  lotesCopy: any;
  listaProgramas: any;
  listaProgramasCopy: any;
  analyzers: any;
  analyzersCopy: any;
  analitos: any[] = [];
  analitosCopy: any[] = [];
  methods: any;
  methodsActive: any;
  methodsActiveCopy: any;
  listaUnits: any;
  listaUnitsCopy: any;
  reactivos: any;
  reactivosCopy: any;

  verTabla: boolean = false;
  flagEditar: boolean = false;
  Loguser: any;

  // Loguser
  listaDatosAnteriores: any[] = [];

  log = new createLog(this.datePipe, this.translate, this.assignValuesExpectedQceService);

  filterLotes = new FormControl('')
  filterPrograma = new FormControl('')
  filterAnalytes = new FormControl('')
  filterAnalizer = new FormControl('')
  filterMetodo = new FormControl('')
  filterUnits = new FormControl('')
  filterReactivo = new FormControl('')


  constructor(
    private datePipe: DatePipe,
    private translate: TranslateService,
    private assignValuesExpectedQceService: AssignValuesExpectedQceService,
    private unitsQceService: UnitsQceService,
    private reactivosQceService: ReactivosQceService,
    private methodsQceService: MethodsQceService,
    private lotesQceDetailsService: LotesQceDetailsService,
    private analyzerQceService: AnalyzerQceService,
    private programConfQceDetailsService: ProgramConfQceDetailsService,
    private analitosService: AnalitosService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private sharedService: SharedService,
    private modalService: BsModalService,
    private dialog: MatDialog,
    private loaderService: LoaderService
  ) { }

  async ngOnInit(): Promise<void> {
    this.sharedService.customTextPaginator(this.paginator);
    await this.getLotes();
    this.filters()
  }

  limpiarDatos() {
    this.analyzers = [];
    this.analyzersCopy = [];
    this.analitos = [];
    this.analitosCopy = [];
    this.methods = [];
    this.methodsActiveCopy = [];
    this.methodsActive = [];
    this.listaUnits = [];
    this.listaUnitsCopy = [];
    this.reactivos = [];
    this.reactivosCopy = [];
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
        this.methodsActive = this.methodsActiveCopy.filter((item: any) => {
          return item.desmethods.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.methodsActive = this.methodsActiveCopy
      }
    });
    this.filterUnits.valueChanges.subscribe(word => {

      if (word) {
        this.listaUnits = this.listaUnitsCopy.filter((item: any) => {
          return item.codunits.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.listaUnits = this.listaUnitsCopy
      }
    });
    this.filterReactivo.valueChanges.subscribe(word => {

      if (word) {
        this.reactivos = this.reactivosCopy.filter((item: any) => {
          return item.desreagents.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.reactivos = this.reactivosCopy
      }
    });
  }


  aplicarFiltro(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }



  async getLotes() {
    try {
      this.loaderService.show();
      this.loaderService.text.emit({ text: 'Cargando lotes' });
      let lotes = await this.lotesQceDetailsService.getAllAsync();
      if (lotes) {
        this.lotes = lotes;
        this.lotesCopy = lotes;
      }
      this.loaderService.hide();
      await this.consultarProgramas();
    } catch (error) {
      this.loaderService.hide();

    }

  }


  async consultarProgramas() {
    try {
      this.loaderService.show();
      this.loaderService.text.emit({ text: 'Cargando programas' });
      let programas = await this.programConfQceDetailsService.getProgramEsp("N").toPromise()
      if (programas) {
        this.listaProgramas = programas;
        this.listaProgramasCopy = programas;
      }
      this.loaderService.hide();
      await this.getAnalizadores();
    } catch (error) {
      this.loaderService.hide();
    }
  }

  async getAnalizadores() {
    try {
      this.loaderService.show();
      this.loaderService.text.emit({ text: 'Cargando analizadores' });
      let analizadores = await this.analyzerQceService.getAllAsync()
      if (analizadores) {
        this.analyzers = analizadores;
        this.analyzersCopy = analizadores;
      }
      this.loaderService.hide();
      await this.getReactivos();
    } catch (error) {
      this.loaderService.hide();
    }

  }



  async getReactivos() {
    try {
      this.loaderService.show();
      this.loaderService.text.emit({ text: 'Cargando reactivos' });
      let reactivos = await this.reactivosQceService.getAllAsync()
      if (reactivos) {
        this.reactivos = reactivos;
        this.reactivosCopy = reactivos;
      }
      this.loaderService.hide();
      await this.getMethods();
    } catch (error) {
      this.loaderService.hide();
    }

  }

  async getMethods() {
    try {
      this.loaderService.show();
      this.loaderService.text.emit({ text: 'Cargando metodos' });
      this.methods = await this.methodsQceService.getAllAsync();
      if (this.methods) {
        this.methodsActive = this.methods.filter(e => e.active);
        this.methodsActiveCopy = this.methods.filter(e => e.active);
      }
      this.loaderService.hide();
      await this.consultarUnits();
    } catch (error) {
      this.loaderService.hide();
    }
  }

  async consultarUnits() {
    try {
      this.loaderService.show();
      this.loaderService.text.emit({ text: 'Cargando unidades' });
      let unidades = await this.unitsQceService.getAllAsync()
      if (unidades) {
        this.listaUnits = unidades.filter(datos => datos.active == true);
        this.listaUnitsCopy = unidades.filter(datos => datos.active == true);
      }
      this.loaderService.hide();

    } catch (error) {
      this.loaderService.hide();
    }
  }

  async getAnalitosxPrograma(programa: any) {

    try {
      this.loaderService.show();
      this.loaderService.text.emit({ text: 'Cargando analitos' });
      this.verTabla = false;
      let analitos = await this.analitosService.getAnalitosPorPrograma(programa.IdProgram).toPromise();

      this.analitos = analitos;
      this.analitosCopy = analitos;
      await this.getAnalizadores();
      await this.getMethods();
      await this.getReactivos();
      await this.consultarUnits();
      this.loaderService.hide();
    } catch (error) {
      this.loaderService.hide();
      this.limpiarDatos();
      this.toastr.error('No se encontraron analitos relacionados al programa');
      return;
    }
  }


  selectOne(idx, row, item?) {
    switch (idx) {
      case 1:
        row.idAnalyzer = Number(item.target.value);
        break;
      case 2:
        row.idReagents = Number(item.target.value);
        break;
      case 3:
        row.idMethods = Number(item.target.value);
        break;
      case 4:
        row.idUnits = Number(item.target.value);
        break;
      case 5:
        row.valueExpected = item;
        break;
    }
  }

  async buscar() {
    this.dataSource = new MatTableDataSource();
    this.dataTableBody = [];
    if (this.formaBuscarDatos.valid) {
      try {
        this.loaderService.show();
        this.loaderService.text.emit({ text: 'Cargando datos...' });

        let lote = this.formaBuscarDatos.value.lote
        let programa = this.formaBuscarDatos.value.programa
        let r = await this.assignValuesExpectedQceService.getAssignValuesExpected(Number(lote), Number(programa)).toPromise();
        this.loaderService.hide();
        this.verTabla = true;
        this.listaDatosAnteriores = r;
        this.generarData(r);
      } catch (error) {
        this.loaderService.hide();
        this.toastr.error('No hay datos');
        this.verTabla = true;
      }

    } else {
      this.toastr.error('Debe diligenciar los campos completamente.');
      this.formaBuscarDatos.markAllAsTouched();
    }
  }

  organizarDataEditarOCrear(): any {

    const { lote, programa } = this.formaBuscarDatos.value;

    // Crear el objeto nuevo
    const newObj = {
      idAssignValuesExpected: this.formCrearEditar.get('idAssignValuesExpected').value || 0,
      idAnalytes: this.formCrearEditar.get('idAnalytes').value,
      idAnalyzer: this.formCrearEditar.get('idAnalyzer').value,
      idReagents: this.formCrearEditar.get('idReagents').value,
      idMethods: this.formCrearEditar.get('idMethods').value,
      idUnits: this.formCrearEditar.get('idUnits').value,
      valueExpected: this.formCrearEditar.get('valueExpected').value || '',
      active: this.formCrearEditar.get('active').value,
      id_Lot: lote,
      idProgram: programa
    };

    return newObj;

  }

  hasNullOrUndefinedValues(obj: any): boolean {
    return Object.values(obj).some(value => value === null || value === undefined);
  }
  detailObj() {
    const newObj = this.organizarDataEditarOCrear();
    let lote = this.lotes.find(x => x.IdLot == newObj.id_Lot);
    let programa = this.listaProgramas.find(x => x.IdProgram = newObj.idProgram);
    let analito = this.analitos.find(x => x.idanalytes == newObj.idAnalytes)
    let analizador = this.analyzers.find(x => x.idAnalyzer == newObj.idAnalyzer);
    let reactivo = this.reactivos.find(x => x.idreagents == newObj.idReagents);
    let metodo = this.methodsActive.find(x => x.idmethods == newObj.idMethods);
    let unidades = this.listaUnits.find(x => x.idunits == newObj.idUnits);
    let obj = {
      Lote: lote.Numlot,
      Program: programa.Desprogram,
      Analytes: analito?.desanalytes,
      Analyzer: analizador?.nameAnalyzer,
      Methods: metodo?.desmethods,
      Units: unidades?.codunits,
      Reagents: reactivo?.desreagents,
      valueExpected: this.formCrearEditar.value.valueExpected,
      active: this.formCrearEditar.value.active
    }
    return obj;
  }

  // async crearAsignacion() {

  //   const newObj = this.organizarDataEditarOCrear();
  //   const hasNull = this.hasNullOrUndefinedValues(newObj);

  //   if (hasNull) {
  //     return this.toastr.error('Ocurrio un error con los datos asignados, por favor intente de nuevo')
  //   }

  //   if (this.formCrearEditar.invalid) {
  //     this.formCrearEditar.markAllAsTouched();
  //     return
  //   }
  //   try {
  //     this.loaderService.show()
  //     this.loaderService.text.emit({ text: 'Guardando datos...' })
  //     let r = await this.assignValuesExpectedQceService.createAssignValuesExpected(newObj)
  //     this.loaderService.hide()
  //     this.toastr.success('Asignación valor esperado generado correctamente.');
  //     this.log.logObj('Control Calidad Externo', 'Administración', 'Asignación de valores', 'c', this.detailObj(), JSON.stringify(r), 200);
  //     this.buscar()

  //     this.formCrearEditar.reset({ active: true });
  //   } catch (error) {
  //     this.loaderService.hide()
  //     this.toastr.error('Error al guardar, intente de nuevo');
  //     this.log.logObj('Control Calidad Externo', 'Administración', 'Asignación de valores', 'c', this.detailObj(), error.message, error.status);
  //     this.formCrearEditar.reset({ active: true });
  //   }
  // }


  /**
   * método para crear una asignación de valores esperados.
   * @returns 
   */
  async crearAsignacion() {
    const newObj = this.organizarDataEditarOCrear();
    const hasNull = this.hasNullOrUndefinedValues(newObj);

    if (hasNull) {
      return this.toastr.error('Ocurrio un error con los datos asignados, por favor intente de nuevo');
    }

    if (this.formCrearEditar.invalid) {
      this.formCrearEditar.markAllAsTouched();
      return;
    }

    const usuario = sessionStorage.getItem('userid') || 'desconocido';
    const nombreUsuario = sessionStorage.getItem('nombres') || 'desconocido';
    const inicio = Date.now();
    const endpoint = `${window.location.origin}/api/qce/AssignValuesExpected`;
    const userAgent = navigator.userAgent;

    // Generar datosLog usando el método separado
    const datosLog = this.generarDatosLog(newObj);

    try {
      this.loaderService.show();
      this.loaderService.text.emit({ text: 'Guardando datos...' });
      let r = await this.assignValuesExpectedQceService.createAssignValuesExpected(newObj);
      this.loaderService.hide();
      this.toastr.success('Asignación valor esperado generado correctamente.');
      this.buscar();

      this.formCrearEditar.reset({ active: true });

      // Obtener respuestaLog usando el método separado
      const respuestaLog = await this.obtenerUltimaAsignacionCreada(r, newObj);

      // Crear objeto Loguser usando el método separado
      const Loguser = this.crearObjetoLog({
        metodo: 'creación',
        datos: datosLog,
        datosAnteriores: '',
        respuesta: respuestaLog,
        tipoRespuesta: 200,
        inicio,
        usuario,
        nombreUsuario,
        endpoint,
        userAgent
      });

      if (this.assignValuesExpectedQceService.createLogAsync) {
        this.assignValuesExpectedQceService.createLogAsync(Loguser);
      }

    } catch (error: any) {
      this.loaderService.hide();
      this.toastr.error('Error al guardar, intente de nuevo');
      this.formCrearEditar.reset({ active: true });


      const Loguser = this.crearObjetoLog({
        metodo: 'creación',
        datos: datosLog,
        datosAnteriores: '',
        respuesta: error?.message || error?.error || 'Error desconocido',
        tipoRespuesta: error?.status ?? 500,
        inicio,
        usuario,
        nombreUsuario,
        endpoint,
        userAgent
      });

      if (this.assignValuesExpectedQceService.createLogAsync) {
        this.assignValuesExpectedQceService.createLogAsync(Loguser);
      }

    }
  }


  /**
   * Genera un objeto con los datos necesarios para el log de creación o edición de asignación de valores esperados.
   * @param newObj 
   * @returns 
   */
  generarDatosLog(newObj: any) {
    const loteObj = this.lotes?.find(x => x.IdLot == newObj.id_Lot) || {};
    const programaObj = this.listaProgramas?.find(x => x.IdProgram == newObj.idProgram) || {};
    const analitoObj = this.analitos?.find(x => x.idanalytes == newObj.idAnalytes) || {};
    const analizadorObj = this.analyzers?.find(x => x.idAnalyzer == newObj.idAnalyzer) || {};
    const reactivoObj = this.reactivos?.find(x => x.idreagents == newObj.idReagents) || {};
    const metodoObj = this.methodsActive?.find(x => x.idmethods == newObj.idMethods) || {};
    const unidadObj = this.listaUnits?.find(x => x.idunits == newObj.idUnits) || {};

    return {
      LoteYPrograma: {
        id_Lot: newObj.id_Lot,
        numlot: loteObj.Numlot ?? '',
        idProgram: newObj.idProgram,
        desprogram: programaObj.Desprogram ?? ''
      },
      analito: {
        idAnalytes: newObj.idAnalytes,
        desanalytes: analitoObj.desanalytes ?? ''
      },
      analizador: {
        idAnalyzer: newObj.idAnalyzer,
        nameAnalyzer: analizadorObj.nameAnalyzer ?? ''
      },
      reactivo: {
        idReagents: newObj.idReagents,
        desreagents: reactivoObj.desreagents ?? ''
      },
      metodo: {
        idMethods: newObj.idMethods,
        desmethods: metodoObj.desmethods ?? ''
      },
      unidad: {
        idUnits: newObj.idUnits,
        codunits: unidadObj.codunits ?? ''
      },
      valorEsperado: {
        valueExpected: newObj.valueExpected
      },
      active: newObj.active
    };
  }

  /**
   * método para obtener la última asignación creada.
   * @param r 
   * @param newObj 
   * @returns 
   */
  async obtenerUltimaAsignacionCreada(r: any, newObj: any) {
    let respuestaLog: any = {};

    if (r && Object.keys(r).length > 0) {
      respuestaLog = r;
    } else {
      try {
        const lote = newObj.id_Lot;
        const programa = newObj.idProgram;
        const lista = await this.assignValuesExpectedQceService.getAssignValuesExpected(Number(lote), Number(programa)).toPromise();
        if (Array.isArray(lista) && lista.length > 0) {
          respuestaLog = lista.find((item: any) =>
            item.idAnalytes == newObj.idAnalytes &&
            item.idAnalyzer == newObj.idAnalyzer &&
            item.idReagents == newObj.idReagents &&
            item.idMethods == newObj.idMethods &&
            item.idUnits == newObj.idUnits &&
            item.valueExpected == newObj.valueExpected
          ) || lista[lista.length - 1];
        }
      } catch (e) {
        respuestaLog = {};
      }
    }

    return respuestaLog;
  }

  /**
   * Crea un objeto de log con la información de la operación realizada.
   */
  crearObjetoLog({
    metodo,
    datos,
    datosAnteriores,
    respuesta,
    tipoRespuesta,
    inicio,
    usuario,
    nombreUsuario,
    endpoint,
    userAgent
  }: {
    metodo: string,
    datos: any,
    datosAnteriores: any,
    respuesta: any,
    tipoRespuesta: number,
    inicio: number,
    usuario: string,
    nombreUsuario: string,
    endpoint: string,
    userAgent: string
  }) {
    const fin = Date.now();
    const tiempoEjecucion = fin - inicio;

    return {
      Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
      Hora: new Date().toISOString(),
      Metodo: metodo,
      Datos: JSON.stringify(datos),
      DatosAnteriores: datosAnteriores,
      Respuesta: typeof respuesta === 'string' ? respuesta : JSON.stringify(respuesta),
      TipoRespuesta: tipoRespuesta,
      userid: usuario,
      usuario: nombreUsuario,
      executionTime: tiempoEjecucion,
      endpoint: endpoint,
      userAgent: userAgent,
      modulo: 'Control Calidad Externo',
      SubModulo: 'Administración',
      item: 'Asignación de valores'
    };
  }



  async editarData(idAssignValuesExpected: number, newObj: any, pasaInvalido: boolean = false) {
    if (!pasaInvalido) {
      if (this.formCrearEditar.invalid) {
        this.formCrearEditar.markAllAsTouched();
        return;
      }
    }

    let objeto = this.organizarDataEditarOCrear();
    objeto.idAssignValuesExpected = idAssignValuesExpected;

    const hasNull = this.hasNullOrUndefinedValues(objeto);
    if (hasNull) {
      return this.toastr.error('Ocurrio un error con los datos asignados, por favor intente de nuevo');
    }

    const datosAnterioresRaw = this.listaDatosAnteriores?.find(
      x => x.idAssignValuesExpected === idAssignValuesExpected
    );
    const usuario = sessionStorage.getItem('userid') || 'desconocido';
    const nombreUsuario = sessionStorage.getItem('nombres') || 'desconocido';
    const inicio = Date.now();
    const endpoint = `${window.location.origin}/api/qce/AssignValuesExpected/${idAssignValuesExpected}`;
    const userAgent = navigator.userAgent;

    // --- Extraer id_Lot, numlot, programaId y objetos relacionados ---
    const { loteId, numlot, programaId, loteObj, programaObj } = this.obtenerDatosLotePrograma(newObj, datosAnterioresRaw);

    // --- Obtener datos anteriores ---
    const datosAnteriores = this.obtenerDatosAnteriores(datosAnterioresRaw);

    // --- Obtener valor activo ---
    const activeValue = this.obtenerActiveValue(newObj, datosAnterioresRaw);

    try {
      const r = await this.assignValuesExpectedQceService.updateAssignValuesExpected(idAssignValuesExpected, objeto);
      this.toastr.success('Estado actualizado', 'Actualización');
      this.generarData(r);
      this.formCrearEditar.reset({ active: true });

      // --- Log de éxito ---
      const fin = Date.now();
      const tiempoEjecucion = fin - inicio;

      const datosLog = this.obtenerDatosLog(r, idAssignValuesExpected, loteId, numlot, programaId, loteObj, programaObj, newObj, datosAnterioresRaw, activeValue);
      const Loguser = this.construirLogUsuario('actualización', datosLog, datosAnteriores, r, usuario, nombreUsuario, tiempoEjecucion, endpoint, userAgent);

      if (this.assignValuesExpectedQceService.createLogAsync) {
        this.assignValuesExpectedQceService.createLogAsync(Loguser);
      }

    } catch (error) {
      this.toastr.error('No fue posible actualizar el estado', 'Error');
      this.formCrearEditar.reset({ active: true });

      // --- Log de error ---
      const fin = Date.now();
      const tiempoEjecucion = fin - inicio;

      const LoguserError = this.construirLogUsuarioError('actualización', datosAnteriores, error, usuario, nombreUsuario, tiempoEjecucion, endpoint, userAgent);

      if (this.assignValuesExpectedQceService.createLogAsync) {
        this.assignValuesExpectedQceService.createLogAsync(LoguserError);
      }
    }
  }




private obtenerDatosLotePrograma(newObj: any, datosAnterioresRaw: any) {
  let loteId = newObj.id_Lot ?? datosAnterioresRaw?.id_Lot;
  let numlot = newObj.numlot ?? datosAnterioresRaw?.numlot;

  if ((!loteId || loteId === null) && numlot && Array.isArray(this.lotes)) {
    const loteObjFind = this.lotes.find(l => l.Numlot == numlot);
    loteId = loteObjFind?.IdLot ?? null;
  }

  if ((!loteId || loteId === null) && datosAnterioresRaw?.id_lot) {
    loteId = datosAnterioresRaw.id_lot;
  }

  const programaId = newObj.idProgram ?? datosAnterioresRaw?.idProgram ?? null;
  const loteObj = this.lotes?.find((l: any) => l.IdLot == loteId) || {};
  const programaObj = this.listaProgramas?.find((p: any) => p.IdProgram == programaId) || {};

  return { loteId, numlot, programaId, loteObj, programaObj };
}

private obtenerDatosAnteriores(datosAnterioresRaw: any) {
  let datosAnteriores_id_Lot = datosAnterioresRaw?.id_Lot;
  if ((!datosAnteriores_id_Lot || datosAnteriores_id_Lot === null) && datosAnterioresRaw?.id_lot) {
    datosAnteriores_id_Lot = datosAnterioresRaw.id_lot;
  }
  if ((!datosAnteriores_id_Lot || datosAnteriores_id_Lot === null) && datosAnterioresRaw?.numlot && Array.isArray(this.lotes)) {
    const loteObjFind = this.lotes.find(l => l.Numlot == datosAnterioresRaw.numlot);
    datosAnteriores_id_Lot = loteObjFind?.IdLot ?? null;
  }

  return {
    LoteYPrograma: {
      id_Lot: datosAnteriores_id_Lot ?? null,
      numlot: datosAnterioresRaw?.numlot ?? '',
      idProgram: datosAnterioresRaw?.idProgram ?? null,
      desprogram: datosAnterioresRaw?.desprogram ?? ''
    },
    analito: {
      idAnalytes: datosAnterioresRaw?.idAnalytes ?? null,
      desanalytes: datosAnterioresRaw?.desanalytes ?? ''
    },
    analizador: {
      idAnalyzer: datosAnterioresRaw?.idAnalyzer ?? null,
      nameAnalyzer: datosAnterioresRaw?.nameAnalyzer ?? ''
    },
    reactivo: {
      idReagents: datosAnterioresRaw?.idReagents ?? null,
      desreagents: datosAnterioresRaw?.desreagents ?? ''
    },
    metodo: {
      idMethods: datosAnterioresRaw?.idMethods ?? null,
      desmethods: datosAnterioresRaw?.desmethods ?? ''
    },
    unidad: {
      idUnits: datosAnterioresRaw?.idUnits ?? null,
      codunits: datosAnterioresRaw?.codunits ?? ''
    },
    valorEsperado: {
      valueExpected: datosAnterioresRaw?.valueExpected ?? ''
    },
    activo: datosAnterioresRaw?.active ?? null
  };
}

private obtenerActiveValue(newObj: any, datosAnterioresRaw: any) {
  if (typeof newObj.active === 'boolean') {
    return newObj.active;
  } else if (typeof newObj.active === 'string') {
    return newObj.active === 'true';
  } else if (typeof datosAnterioresRaw?.active === 'boolean') {
    return datosAnterioresRaw.active;
  } else if (typeof datosAnterioresRaw?.active === 'string') {
    return datosAnterioresRaw.active === 'true';
  } else {
    return false;
  }
}

private obtenerDatosLog(r: any, idAssignValuesExpected: number, loteId: any, numlot: any, programaId: any, loteObj: any, programaObj: any, newObj: any, datosAnterioresRaw: any, activeValue: boolean) {
  let registroActualizado: any = null;

  if (Array.isArray(r)) {
    registroActualizado = r.find((item: any) => item.idAssignValuesExpected === idAssignValuesExpected);
  } else if (r && typeof r === 'object') {
    registroActualizado = r;
  }

  if (registroActualizado) {
    return {
      LoteYPrograma: {
        id_Lot: registroActualizado.id_lot ?? registroActualizado.id_Lot ?? null,
        numlot: registroActualizado.numlot ?? '',
        idProgram: registroActualizado.idProgram ?? null,
        desprogram: registroActualizado.desprogram ?? ''
      },
      analito: {
        idAnalytes: registroActualizado.idAnalytes ?? null,
        desanalytes: registroActualizado.desanalytes ?? ''
      },
      analizador: {
        idAnalyzer: registroActualizado.idAnalyzer ?? null,
        nameAnalyzer: registroActualizado.nameAnalyzer ?? ''
      },
      reactivo: {
        idReagents: registroActualizado.idReagents ?? null,
        desreagents: registroActualizado.desreagents ?? ''
      },
      metodo: {
        idMethods: registroActualizado.idMethods ?? null,
        desmethods: registroActualizado.desmethods ?? ''
      },
      unidad: {
        idUnits: registroActualizado.idUnits ?? null,
        codunits: registroActualizado.codunits ?? ''
      },
      valorEsperado: {
        valueExpected: registroActualizado.valueExpected ?? ''
      },
      activo: registroActualizado.active ?? null
    };
  } else {
    return {
      LoteYPrograma: {
        id_Lot: loteId,
        numlot: loteObj.Numlot ?? numlot ?? '',
        idProgram: programaId,
        desprogram: programaObj.Desprogram ?? datosAnterioresRaw?.desprogram ?? ''
      },
      analito: {
        idAnalytes: newObj.idAnalytes,
        desanalytes: newObj.desanalytes ?? datosAnterioresRaw?.desanalytes ?? ''
      },
      analizador: {
        idAnalyzer: newObj.idAnalyzer,
        nameAnalyzer: newObj.nameAnalyzer ?? datosAnterioresRaw?.nameAnalyzer ?? ''
      },
      reactivo: {
        idReagents: newObj.idReagents,
        desreagents: newObj.desreagents ?? datosAnterioresRaw?.desreagents ?? ''
      },
      metodo: {
        idMethods: newObj.idMethods,
        desmethods: newObj.desmethods ?? datosAnterioresRaw?.desmethods ?? ''
      },
      unidad: {
        idUnits: newObj.idUnits,
        codunits: newObj.codunits ?? datosAnterioresRaw?.codunits ?? ''
      },
      valorEsperado: {
        valueExpected: newObj.valueExpected ?? datosAnterioresRaw?.valueExpected ?? ''
      },
      activo: activeValue
    };
  }
}

private construirLogUsuario(metodo: string, datosLog: any, datosAnteriores: any, respuesta: any, userid: string, usuario: string, tiempoEjecucion: number, endpoint: string, userAgent: string) {
  return {
    Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
    Hora: new Date().toISOString(),
    Metodo: metodo,
    Datos: JSON.stringify(datosLog),
    DatosAnteriores: JSON.stringify(datosAnteriores),
    Respuesta: JSON.stringify(respuesta),
    TipoRespuesta: respuesta?.status ?? 200,
    userid: userid,
    usuario: usuario,
    executionTime: tiempoEjecucion,
    endpoint: endpoint,
    userAgent: userAgent,
    modulo: 'Control Calidad Externo',
    SubModulo: 'Administración',
    item: 'Asignación de valores'
  };
}

private construirLogUsuarioError(metodo: string, datosAnteriores: any, error: any, userid: string, usuario: string, tiempoEjecucion: number, endpoint: string, userAgent: string) {
  return {
    Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
    Hora: new Date().toISOString(),
    Metodo: metodo,
    Datos: '', // No hay datos nuevos en error
    DatosAnteriores: JSON.stringify(datosAnteriores),
    Respuesta: error?.message,
    TipoRespuesta: error?.status ?? 500,
    userid: userid,
    usuario: usuario,
    executionTime: tiempoEjecucion,
    endpoint: endpoint,
    userAgent: userAgent,
    modulo: 'Control Calidad Externo',
    SubModulo: 'Administración',
    item: 'Asignación de valores'
  };
}





      // async editarData(idAssignValuesExpected: number, newObj: any, pasaInvalido: boolean = false) {
      //   if (!pasaInvalido) {
      //     if (this.formCrearEditar.invalid) {
      //       this.formCrearEditar.markAllAsTouched();
      //       return
      //     }
      //   }
      //   let objeto = this.organizarDataEditarOCrear();
      //   objeto.idAssignValuesExpected = idAssignValuesExpected
      //   const hasNull = this.hasNullOrUndefinedValues(objeto);

      //   if (hasNull) {
      //     return this.toastr.error('Ocurrio un error con los datos asignados, por favor intente de nuevo')
      //   }

      //   // --- Nuevo log ---
      //   const datosAnterioresRaw = this.listaDatosAnteriores?.find(
      //     x => x.idAssignValuesExpected === idAssignValuesExpected
      //   );
      //   const usuario = sessionStorage.getItem('userid') || 'desconocido';
      //   const nombreUsuario = sessionStorage.getItem('nombres') || 'desconocido';
      //   const inicio = Date.now();
      //   const endpoint = `${window.location.origin}/api/qce/AssignValuesExpected/${idAssignValuesExpected}`;
      //   const userAgent = navigator.userAgent;

      //   // --- Lógica para obtener id_Lot y programaId ---
      //   let loteId = newObj.id_Lot ?? datosAnterioresRaw?.id_Lot;
      //   let numlot = newObj.numlot ?? datosAnterioresRaw?.numlot;
      //   if ((!loteId || loteId === null) && numlot && Array.isArray(this.lotes)) {
      //     const loteObjFind = this.lotes.find(l => l.Numlot == numlot);
      //     loteId = loteObjFind?.IdLot ?? null;
      //   }
      //   if ((!loteId || loteId === null) && datosAnterioresRaw?.id_lot) {
      //     loteId = datosAnterioresRaw.id_lot;
      //   }
      //   const programaId = newObj.idProgram ?? datosAnterioresRaw?.idProgram ?? null;
      //   const loteObj = this.lotes?.find((l: any) => l.IdLot == loteId) || {};
      //   const programaObj = this.listaProgramas?.find((p: any) => p.IdProgram == programaId) || {};

      //   // --- Datos anteriores ---
      //   let datosAnteriores_id_Lot = datosAnterioresRaw?.id_Lot;
      //   if ((!datosAnteriores_id_Lot || datosAnteriores_id_Lot === null) && datosAnterioresRaw?.id_lot) {
      //     datosAnteriores_id_Lot = datosAnterioresRaw.id_lot;
      //   }
      //   if ((!datosAnteriores_id_Lot || datosAnteriores_id_Lot === null) && datosAnterioresRaw?.numlot && Array.isArray(this.lotes)) {
      //     const loteObjFind = this.lotes.find(l => l.Numlot == datosAnterioresRaw.numlot);
      //     datosAnteriores_id_Lot = loteObjFind?.IdLot ?? null;
      //   }

      //   const datosAnteriores = {
      //     LoteYPrograma: {
      //       id_Lot: datosAnteriores_id_Lot ?? null,
      //       numlot: datosAnterioresRaw?.numlot ?? '',
      //       idProgram: datosAnterioresRaw?.idProgram ?? null,
      //       desprogram: datosAnterioresRaw?.desprogram ?? ''
      //     },
      //     analito: {
      //       idAnalytes: datosAnterioresRaw?.idAnalytes ?? null,
      //       desanalytes: datosAnterioresRaw?.desanalytes ?? ''
      //     },
      //     analizador: {
      //       idAnalyzer: datosAnterioresRaw?.idAnalyzer ?? null,
      //       nameAnalyzer: datosAnterioresRaw?.nameAnalyzer ?? ''
      //     },
      //     reactivo: {
      //       idReagents: datosAnterioresRaw?.idReagents ?? null,
      //       desreagents: datosAnterioresRaw?.desreagents ?? ''
      //     },
      //     metodo: {
      //       idMethods: datosAnterioresRaw?.idMethods ?? null,
      //       desmethods: datosAnterioresRaw?.desmethods ?? ''
      //     },
      //     unidad: {
      //       idUnits: datosAnterioresRaw?.idUnits ?? null,
      //       codunits: datosAnterioresRaw?.codunits ?? ''
      //     },
      //     valorEsperado: {
      //       valueExpected: datosAnterioresRaw?.valueExpected ?? ''
      //     },
      //     activo: datosAnterioresRaw?.active ?? null
      //   };

      //   // --- Lógica para el campo active ---
      //   let activeValue: boolean = false;
      //   if (typeof newObj.active === 'boolean') {
      //     activeValue = newObj.active;
      //   } else if (typeof newObj.active === 'string') {
      //     activeValue = newObj.active === 'true';
      //   } else if (typeof datosAnterioresRaw?.active === 'boolean') {
      //     activeValue = datosAnterioresRaw.active;
      //   } else if (typeof datosAnterioresRaw?.active === 'string') {
      //     activeValue = datosAnterioresRaw.active === 'true';
      //   } else {
      //     activeValue = false;
      //   }

      //   return this.assignValuesExpectedQceService.updateAssignValuesExpected(idAssignValuesExpected, objeto)
      //     .then(r => {
      //       this.toastr.success('Estado actualizado', 'Actualización')
      //       this.log.logObj('Control Calidad Externo', 'Administración', 'Asignación de valores', 'a', this.detailObj(), JSON.stringify(r), 200);
      //       this.generarData(r);
      //       this.formCrearEditar.reset({ active: true });

      //       // --- Nuevo log éxito ---
      //       const fin = Date.now();
      //       const tiempoEjecucion = fin - inicio;

      //       let registroActualizado: any = null;
      //       if (Array.isArray(r)) {
      //         registroActualizado = r.find((item: any) => item.idAssignValuesExpected === idAssignValuesExpected);
      //       } else if (r && typeof r === 'object') {
      //         registroActualizado = r;
      //       }

      //       const datosLog = registroActualizado
      //         ? {
      //           LoteYPrograma: {
      //             id_Lot: registroActualizado.id_lot ?? registroActualizado.id_Lot ?? null,
      //             numlot: registroActualizado.numlot ?? '',
      //             idProgram: registroActualizado.idProgram ?? null,
      //             desprogram: registroActualizado.desprogram ?? ''
      //           },
      //           analito: {
      //             idAnalytes: registroActualizado.idAnalytes ?? null,
      //             desanalytes: registroActualizado.desanalytes ?? ''
      //           },
      //           analizador: {
      //             idAnalyzer: registroActualizado.idAnalyzer ?? null,
      //             nameAnalyzer: registroActualizado.nameAnalyzer ?? ''
      //           },
      //           reactivo: {
      //             idReagents: registroActualizado.idReagents ?? null,
      //             desreagents: registroActualizado.desreagents ?? ''
      //           },
      //           metodo: {
      //             idMethods: registroActualizado.idMethods ?? null,
      //             desmethods: registroActualizado.desmethods ?? ''
      //           },
      //           unidad: {
      //             idUnits: registroActualizado.idUnits ?? null,
      //             codunits: registroActualizado.codunits ?? ''
      //           },
      //           valorEsperado: {
      //             valueExpected: registroActualizado.valueExpected ?? ''
      //           },
      //           activo: registroActualizado.active ?? null
      //         }
      //         : {
      //           LoteYPrograma: {
      //             id_Lot: loteId,
      //             numlot: loteObj.Numlot ?? numlot ?? '',
      //             idProgram: programaId,
      //             desprogram: programaObj.Desprogram ?? datosAnterioresRaw?.desprogram ?? ''
      //           },
      //           analito: {
      //             idAnalytes: newObj.idAnalytes,
      //             desanalytes: newObj.desanalytes ?? datosAnterioresRaw?.desanalytes ?? ''
      //           },
      //           analizador: {
      //             idAnalyzer: newObj.idAnalyzer,
      //             nameAnalyzer: newObj.nameAnalyzer ?? datosAnterioresRaw?.nameAnalyzer ?? ''
      //           },
      //           reactivo: {
      //             idReagents: newObj.idReagents,
      //             desreagents: newObj.desreagents ?? datosAnterioresRaw?.desreagents ?? ''
      //           },
      //           metodo: {
      //             idMethods: newObj.idMethods,
      //             desmethods: newObj.desmethods ?? datosAnterioresRaw?.desmethods ?? ''
      //           },
      //           unidad: {
      //             idUnits: newObj.idUnits,
      //             codunits: newObj.codunits ?? datosAnterioresRaw?.codunits ?? ''
      //           },
      //           valorEsperado: {
      //             valueExpected: newObj.valueExpected ?? datosAnterioresRaw?.valueExpected ?? ''
      //           },
      //           activo: activeValue
      //         };

      //       const Loguser = {
      //         Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
      //         Hora: new Date().toISOString(),
      //         Metodo: 'actualización',
      //         Datos: JSON.stringify(datosLog),
      //         DatosAnteriores: JSON.stringify(datosAnteriores),
      //         Respuesta: JSON.stringify(r),
      //         TipoRespuesta: r?.status ?? 200,
      //         userid: usuario,
      //         usuario: nombreUsuario,
      //         executionTime: tiempoEjecucion,
      //         endpoint: endpoint,
      //         userAgent: userAgent,
      //         modulo: 'Control Calidad Externo',
      //         SubModulo: 'Administración',
      //         item: 'Asignación de valores'
      //       };

      //       if (this.assignValuesExpectedQceService.createLogAsync) {
      //         this.assignValuesExpectedQceService.createLogAsync(Loguser);
      //       }
      //     })
      //     .catch(error => {
      //       this.toastr.error('No fue posible actualizar el estado', 'Error')
      //       this.log.logObj('Control Calidad Externo', 'Administración', 'Asignación de valores', 'a', this.detailObj(), error.message, error.status);
      //       this.formCrearEditar.reset({ active: true });

      //       // --- Nuevo log error ---
      //       const fin = Date.now();
      //       const tiempoEjecucion = fin - inicio;

      //       const LoguserError = {
      //         Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
      //         Hora: new Date().toISOString(),
      //         Metodo: 'actualización',
      //         Datos: '', // No hay datos nuevos en error
      //         DatosAnteriores: JSON.stringify(datosAnteriores),
      //         Respuesta: error?.message,
      //         TipoRespuesta: error?.status ?? 500,
      //         userid: usuario,
      //         usuario: nombreUsuario,
      //         executionTime: tiempoEjecucion,
      //         endpoint: endpoint,
      //         userAgent: userAgent,
      //         modulo: 'Control Calidad Externo',
      //         SubModulo: 'Administración',
      //         item: 'Asignación de valores'
      //       };

      //       if (this.assignValuesExpectedQceService.createLogAsync) {
      //         this.assignValuesExpectedQceService.createLogAsync(LoguserError);
      //       }
      //     });
      // }




  /**
   * Método para editar una asignación de valores esperados.
   */
  // async editarData(idAssignValuesExpected: number, newObj: any, pasaInvalido: boolean = false) {
  //   if (!pasaInvalido && this.formCrearEditar.invalid) {
  //     this.formCrearEditar.markAllAsTouched();
  //     return;
  //   }

  //   const datosAnterioresRaw = this.listaDatosAnteriores?.find(
  //     x => x.idAssignValuesExpected === idAssignValuesExpected
  //   );

  //   const usuario = sessionStorage.getItem('userid') || 'desconocido';
  //   const nombreUsuario = sessionStorage.getItem('nombres') || 'desconocido';
  //   const inicio = Date.now();
  //   const endpoint = `${window.location.origin}/api/qce/AssignValuesExpected/${idAssignValuesExpected}`;
  //   const userAgent = navigator.userAgent;

  //   // --- Lógica para obtener id_Lot y programaId ---
  //   let loteId = newObj.id_Lot ?? datosAnterioresRaw?.id_Lot;
  //   let numlot = newObj.numlot ?? datosAnterioresRaw?.numlot;
  //   if ((!loteId || loteId === null) && numlot && Array.isArray(this.lotes)) {
  //     const loteObjFind = this.lotes.find(l => l.Numlot == numlot);
  //     loteId = loteObjFind?.IdLot ?? null;
  //   }
  //   if ((!loteId || loteId === null) && datosAnterioresRaw?.id_lot) {
  //     loteId = datosAnterioresRaw.id_lot;
  //   }
  //   const programaId = newObj.idProgram ?? datosAnterioresRaw?.idProgram ?? null;
  //   const loteObj = this.lotes?.find((l: any) => l.IdLot == loteId) || {};
  //   const programaObj = this.listaProgramas?.find((p: any) => p.IdProgram == programaId) || {};

  //   // --- Datos anteriores ---
  //   let datosAnteriores_id_Lot = datosAnterioresRaw?.id_Lot;
  //   if ((!datosAnteriores_id_Lot || datosAnteriores_id_Lot === null) && datosAnterioresRaw?.id_lot) {
  //     datosAnteriores_id_Lot = datosAnterioresRaw.id_lot;
  //   }
  //   if ((!datosAnteriores_id_Lot || datosAnteriores_id_Lot === null) && datosAnterioresRaw?.numlot && Array.isArray(this.lotes)) {
  //     const loteObjFind = this.lotes.find(l => l.Numlot == datosAnterioresRaw.numlot);
  //     datosAnteriores_id_Lot = loteObjFind?.IdLot ?? null;
  //   }

  //   const datosAnteriores = {
  //     LoteYPrograma: {
  //       id_Lot: datosAnteriores_id_Lot ?? null,
  //       numlot: datosAnterioresRaw?.numlot ?? '',
  //       idProgram: datosAnterioresRaw?.idProgram ?? null,
  //       desprogram: datosAnterioresRaw?.desprogram ?? ''
  //     },
  //     analito: {
  //       idAnalytes: datosAnterioresRaw?.idAnalytes ?? null,
  //       desanalytes: datosAnterioresRaw?.desanalytes ?? ''
  //     },
  //     analizador: {
  //       idAnalyzer: datosAnterioresRaw?.idAnalyzer ?? null,
  //       nameAnalyzer: datosAnterioresRaw?.nameAnalyzer ?? ''
  //     },
  //     reactivo: {
  //       idReagents: datosAnterioresRaw?.idReagents ?? null,
  //       desreagents: datosAnterioresRaw?.desreagents ?? ''
  //     },
  //     metodo: {
  //       idMethods: datosAnterioresRaw?.idMethods ?? null,
  //       desmethods: datosAnterioresRaw?.desmethods ?? ''
  //     },
  //     unidad: {
  //       idUnits: datosAnterioresRaw?.idUnits ?? null,
  //       codunits: datosAnterioresRaw?.codunits ?? ''
  //     },
  //     valorEsperado: {
  //       valueExpected: datosAnterioresRaw?.valueExpected ?? ''
  //     },
  //     activo: datosAnterioresRaw?.active ?? null
  //   };

  //   // --- Lógica para el campo active ---
  //   let activeValue: boolean = false;
  //   if (typeof newObj.active === 'boolean') {
  //     activeValue = newObj.active;
  //   } else if (typeof newObj.active === 'string') {
  //     activeValue = newObj.active === 'true';
  //   } else if (typeof datosAnterioresRaw?.active === 'boolean') {
  //     activeValue = datosAnterioresRaw.active;
  //   } else if (typeof datosAnterioresRaw?.active === 'string') {
  //     activeValue = datosAnterioresRaw.active === 'true';
  //   } else {
  //     activeValue = false;
  //   }

  //   // --- Objeto para enviar al servicio ---
  //   const objeto = {
  //     ...this.organizarDataEditarOCrear(),
  //     idAssignValuesExpected: idAssignValuesExpected,
  //     id_Lot: loteId,
  //     desanalytes: newObj.desanalytes ?? datosAnterioresRaw?.desanalytes ?? '',
  //     nameAnalyzer: newObj.nameAnalyzer ?? datosAnterioresRaw?.nameAnalyzer ?? '',
  //     desreagents: newObj.desreagents ?? datosAnterioresRaw?.desreagents ?? '',
  //     desmethods: newObj.desmethods ?? datosAnterioresRaw?.desmethods ?? '',
  //     codunits: newObj.codunits ?? datosAnterioresRaw?.codunits ?? '',
  //     valueExpected: newObj.valueExpected ?? datosAnterioresRaw?.valueExpected ?? '',
  //     active: activeValue
  //   };

  //   const hasNull = this.hasNullOrUndefinedValues(objeto);
  //   if (hasNull) {
  //     return this.toastr.error('Ocurrió un error con los datos asignados, por favor intente de nuevo');
  //   }

  //   return this.assignValuesExpectedQceService.updateAssignValuesExpected(idAssignValuesExpected, objeto)
  //     .then(r => {
  //       this.toastr.success('Registro actualizado', 'Actualización');
  //       this.generarData(r);
  //       this.formCrearEditar.reset({ active: true });

  //       const fin = Date.now();
  //       const tiempoEjecucion = fin - inicio;

  //       let registroActualizado: any = null;
  //       if (Array.isArray(r)) {
  //         registroActualizado = r.find((item: any) => item.idAssignValuesExpected === idAssignValuesExpected);
  //       } else if (r && typeof r === 'object') {
  //         registroActualizado = r;
  //       }

  //       const datosLog = registroActualizado
  //         ? {
  //           LoteYPrograma: {
  //             id_Lot: registroActualizado.id_lot ?? registroActualizado.id_Lot ?? null,
  //             numlot: registroActualizado.numlot ?? '',
  //             idProgram: registroActualizado.idProgram ?? null,
  //             desprogram: registroActualizado.desprogram ?? ''
  //           },
  //           analito: {
  //             idAnalytes: registroActualizado.idAnalytes ?? null,
  //             desanalytes: registroActualizado.desanalytes ?? ''
  //           },
  //           analizador: {
  //             idAnalyzer: registroActualizado.idAnalyzer ?? null,
  //             nameAnalyzer: registroActualizado.nameAnalyzer ?? ''
  //           },
  //           reactivo: {
  //             idReagents: registroActualizado.idReagents ?? null,
  //             desreagents: registroActualizado.desreagents ?? ''
  //           },
  //           metodo: {
  //             idMethods: registroActualizado.idMethods ?? null,
  //             desmethods: registroActualizado.desmethods ?? ''
  //           },
  //           unidad: {
  //             idUnits: registroActualizado.idUnits ?? null,
  //             codunits: registroActualizado.codunits ?? ''
  //           },
  //           valorEsperado: {
  //             valueExpected: registroActualizado.valueExpected ?? ''
  //           },
  //           activo: registroActualizado.active ?? null
  //         }
  //         : {
  //           LoteYPrograma: {
  //             id_Lot: loteId,
  //             numlot: loteObj.Numlot ?? numlot ?? '',
  //             idProgram: programaId,
  //             desprogram: programaObj.Desprogram ?? datosAnterioresRaw?.desprogram ?? ''
  //           },
  //           analito: {
  //             idAnalytes: newObj.idAnalytes,
  //             desanalytes: newObj.desanalytes ?? datosAnterioresRaw?.desanalytes ?? ''
  //           },
  //           analizador: {
  //             idAnalyzer: newObj.idAnalyzer,
  //             nameAnalyzer: newObj.nameAnalyzer ?? datosAnterioresRaw?.nameAnalyzer ?? ''
  //           },
  //           reactivo: {
  //             idReagents: newObj.idReagents,
  //             desreagents: newObj.desreagents ?? datosAnterioresRaw?.desreagents ?? ''
  //           },
  //           metodo: {
  //             idMethods: newObj.idMethods,
  //             desmethods: newObj.desmethods ?? datosAnterioresRaw?.desmethods ?? ''
  //           },
  //           unidad: {
  //             idUnits: newObj.idUnits,
  //             codunits: newObj.codunits ?? datosAnterioresRaw?.codunits ?? ''
  //           },
  //           valorEsperado: {
  //             valueExpected: newObj.valueExpected ?? datosAnterioresRaw?.valueExpected ?? ''
  //           },
  //           activo: activeValue
  //         };

  //       const Loguser = {
  //         Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
  //         Hora: new Date().toISOString(),
  //         Metodo: 'actualización',
  //         Datos: JSON.stringify(datosLog),
  //         DatosAnteriores: JSON.stringify(datosAnteriores),
  //         Respuesta: JSON.stringify(r),
  //         TipoRespuesta: r?.status ?? 200,
  //         userid: usuario,
  //         usuario: nombreUsuario,
  //         executionTime: tiempoEjecucion,
  //         endpoint: endpoint,
  //         userAgent: userAgent,
  //         modulo: 'Control Calidad Externo',
  //         SubModulo: 'Administración',
  //         item: 'Asignación de valores'
  //       };

  //       if (this.assignValuesExpectedQceService.createLogAsync) {
  //         this.assignValuesExpectedQceService.createLogAsync(Loguser);
  //       }
  //     })
  //     .catch(error => {
  //       this.toastr.error('No fue posible actualizar el registro', 'Error');
  //       this.formCrearEditar.reset({ active: true });

  //       const fin = Date.now();
  //       const tiempoEjecucion = fin - inicio;

  //       const LoguserError = {
  //         Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
  //         Hora: new Date().toISOString(),
  //         Metodo: 'actualización',
  //         Datos: '', // No hay datos nuevos en error
  //         DatosAnteriores: JSON.stringify(datosAnteriores),
  //         Respuesta: error?.message,
  //         TipoRespuesta: error?.status ?? 500,
  //         userid: usuario,
  //         usuario: nombreUsuario,
  //         executionTime: tiempoEjecucion,
  //         endpoint: endpoint,
  //         userAgent: userAgent,
  //         modulo: 'Control Calidad Externo',
  //         SubModulo: 'Administración',
  //         item: 'Asignación de valores'
  //       };

  //       if (this.assignValuesExpectedQceService.createLogAsync) {
  //         this.assignValuesExpectedQceService.createLogAsync(LoguserError);
  //       }
  //     });
  // }




  async editar(idAssignValuesExpected: number) {
    const newObj = this.organizarDataEditarOCrear();
    await this.editarData(idAssignValuesExpected, newObj);
  }

  // async editarToggle(datos: any) {

  //   const [data, estado] = datos;

  //   data.active = estado;

  //   return this.assignValuesExpectedQceService.updateAssignValuesExpected(data.idAssignValuesExpected, data)
  //     .then(r => {
  //       this.toastr.success('Estado actualizado', 'Actualización')
  //       this.log.logObj('Control Calidad Externo', 'Administración', 'Asignación de valores', 'a', this.detailObj(), JSON.stringify(r), 200);
  //       this.generarData(r);

  //     })
  //     .catch(error => {
  //       this.toastr.error('No fue posible actualizar el estado', 'Error')
  //       this.log.logObj('Control Calidad Externo', 'Administración', 'Asignación de valores', 'a', this.detailObj(), error.message, error.status);


  //     });
  // }

  /**
   * Cambia el estado activo/inactivo de una asignación de valores esperados.
   */
  async editarToggle(datos: any) {
    const [dataOriginal, nuevoEstado] = datos;

    // Clonar el objeto original ANTES de modificarlo, para usarlo como datos anteriores
    const datosAnteriores = JSON.parse(JSON.stringify(dataOriginal));

    // Crear copia para modificar y enviar al backend
    const data = { ...datosAnteriores, active: nuevoEstado };

    const usuario = sessionStorage.getItem('userid') || 'desconocido';
    const nombreUsuario = sessionStorage.getItem('nombres') || 'desconocido';
    const inicio = Date.now();
    const endpoint = `${window.location.origin}/api/qce/AssignValuesExpected/${data.idAssignValuesExpected}`;
    const userAgent = navigator.userAgent;

    return this.assignValuesExpectedQceService.updateAssignValuesExpected(data.idAssignValuesExpected, data)
      .then(respuesta => {
        this.toastr.success('Estado actualizado', 'Actualización');
        this.generarData(respuesta);

        const fin = Date.now();
        const tiempoEjecucion = fin - inicio;

        // Buscar el registro actualizado
        const registroActualizado = Array.isArray(respuesta)
          ? respuesta.find((item: any) => item.idAssignValuesExpected === data.idAssignValuesExpected)
          : respuesta;

        const datosLog = registroActualizado
          ? {
            LoteYPrograma: {
              id_Lot: registroActualizado.id_lot ?? null,
              numlot: registroActualizado.numlot ?? '',
              idProgram: registroActualizado.idProgram ?? null,
              desprogram: registroActualizado.desprogram ?? ''
            },
            analito: {
              idAnalytes: registroActualizado.idAnalytes ?? null,
              desanalytes: registroActualizado.desanalytes ?? ''
            },
            analizador: {
              idAnalyzer: registroActualizado.idAnalyzer ?? null,
              nameAnalyzer: registroActualizado.nameAnalyzer ?? ''
            },
            reactivo: {
              idReagents: registroActualizado.idReagents ?? null,
              desreagents: registroActualizado.desreagents ?? ''
            },
            metodo: {
              idMethods: registroActualizado.idMethods ?? null,
              desmethods: registroActualizado.desmethods ?? ''
            },
            unidad: {
              idUnits: registroActualizado.idUnits ?? null,
              codunits: registroActualizado.codunits ?? ''
            },
            valorEsperado: {
              valueExpected: registroActualizado.valueExpected ?? ''
            },
            active: registroActualizado.active ?? null
          }
          : { ...data };


        const datosAnterioresSinActivo = { ...datosAnteriores };
        delete datosAnterioresSinActivo.activo;

        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          Hora: new Date().toISOString(),
          Metodo: 'actualización',
          Datos: JSON.stringify(datosLog),
          DatosAnteriores: JSON.stringify(datosAnterioresSinActivo),
          Respuesta: JSON.stringify(respuesta),
          TipoRespuesta: respuesta?.status ?? 200,
          userid: usuario,
          usuario: nombreUsuario,
          executionTime: tiempoEjecucion,
          endpoint: endpoint,
          userAgent: userAgent,
          modulo: 'Control Calidad Externo',
          SubModulo: 'Administración',
          item: 'Asignación de valores'
        };

        if (this.assignValuesExpectedQceService.createLogAsync) {
          this.assignValuesExpectedQceService.createLogAsync(Loguser);
        }
      })
      .catch(error => {
        this.toastr.error('No fue posible actualizar el estado', 'Error');
        const fin = Date.now();
        const tiempoEjecucion = fin - inicio;


        const datosAnterioresSinActivo = { ...datosAnteriores };
        delete datosAnterioresSinActivo.activo;

        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          Hora: new Date().toISOString(),
          Metodo: 'actualización',
          Datos: '', // No se modificó nada
          DatosAnteriores: JSON.stringify(datosAnterioresSinActivo),
          Respuesta: error?.message,
          TipoRespuesta: error?.status ?? 500,
          userid: usuario,
          usuario: nombreUsuario,
          executionTime: tiempoEjecucion,
          endpoint: endpoint,
          userAgent: userAgent,
          modulo: 'Control Calidad Externo',
          SubModulo: 'Administración',
          item: 'Asignación de valores'
        };

        if (this.assignValuesExpectedQceService.createLogAsync) {
          this.assignValuesExpectedQceService.createLogAsync(Loguser);
        }
      });
  }


  private generarData(r) {
    this.verTabla = true;
    const filtrarDataTable: any[] = r;
    this.dataTableBody = filtrarDataTable.map(x => {
      return { 'Analito': x.desanalytes, 'Equipo': x.nameAnalyzer, 'Reactivo': x.desreagents, 'Método': x.desmethods, 'Valor esperado': x.valueExpected, 'Unidades': x.codunits, 'Estado': x.active, item: x, item8: x, item9: x };
    });
    this.dataSource = new MatTableDataSource(r);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  async modalCrear(templateRegistroRondasQce: TemplateRef<any>) {
    this.formCrearEditar.reset({ active: true });

    const destroy$: Subject<boolean> = new Subject<boolean>();
    /* Variables recibidas por el modal */
    const data: ModalData = {
      content: templateRegistroRondasQce,
      btn: 'Guardar',
      btn2: 'Cerrar',
      footer: true,
      title: 'Crear',
      image: 'assets/rutas/iconos/editar.png',
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


    // this.ventanaModal = this.modalService.show(templateRegistroRondasQce, { 'class': 'modal-lg modal-dialog-centered', backdrop: 'static', keyboard: false });
  }

  async modalEditar(templateRegistroConfEdit: TemplateRef<any>, datos: any) {
    this.flagEditar = true;


    const newObj = {
      idAssignValuesExpected: datos.idAssignValuesExpected,
      idAnalytes: datos.idAnalytes || '',
      idReagents: datos.idReagents || '',
      idAnalyzer: datos.idAnalyzer || '',
      idMethods: datos.idMethods || '',
      idUnits: datos.idUnits,
      valueExpected: datos.valueExpected,
      active: datos.active
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
      image: 'assets/rutas/iconos/editar.png'
    };
    const dialogRef = this.dialog.open(ModalGeneralComponent, { height: 'auto', width: '40em', data, disableClose: true });

    dialogRef.componentInstance.primaryEvent?.pipe(takeUntil(destroy$)).subscribe(x => {
      if (this.formCrearEditar.invalid) {
        this.formCrearEditar.markAllAsTouched();
        return
      }
      this.editarData(datos.idAssignValuesExpected, this.formCrearEditar.value, true);
      dialogRef.close();
    });

    //this.ventanaModal = this.modalService.show(templateRegistroConfEdit, { 'class': 'modal-lg modal-dialog-centered', backdrop: 'static', keyboard: false });
  }

  /**
   * Elimina una asignación de valores esperados y registra el log con el nuevo formato.
   */
  eliminarValoresAsign(row: any) {
    // Buscar datos anteriores por idAssignValuesExpected
    const datosAnterioresRaw = this.listaDatosAnteriores?.find(
      x => x.idAssignValuesExpected === row.idAssignValuesExpected
    );

    // --- Lógica para obtener id_Lot y programaId ---
    let loteId = row.id_Lot ?? datosAnterioresRaw?.id_Lot;
    let numlot = row.numlot ?? datosAnterioresRaw?.numlot;
    if ((!loteId || loteId === null) && numlot && Array.isArray(this.lotes)) {
      const loteObjFind = this.lotes.find(l => l.Numlot == numlot);
      loteId = loteObjFind?.IdLot ?? null;
    }
    if ((!loteId || loteId === null) && datosAnterioresRaw?.id_lot) {
      loteId = datosAnterioresRaw.id_lot;
    }
    const programaId = row.idProgram ?? datosAnterioresRaw?.idProgram ?? null;
    const loteObj = this.lotes?.find(l => l.IdLot == loteId) || {};
    const programaObj = this.listaProgramas?.find(p => p.IdProgram == programaId) || {};

    // --- Datos anteriores ---
    let datosAnteriores_id_Lot = datosAnterioresRaw?.id_Lot;
    if ((!datosAnteriores_id_Lot || datosAnteriores_id_Lot === null) && datosAnterioresRaw?.id_lot) {
      datosAnteriores_id_Lot = datosAnterioresRaw.id_lot;
    }
    if ((!datosAnteriores_id_Lot || datosAnteriores_id_Lot === null) && datosAnterioresRaw?.numlot && Array.isArray(this.lotes)) {
      const loteObjFind = this.lotes.find(l => l.Numlot == datosAnterioresRaw.numlot);
      datosAnteriores_id_Lot = loteObjFind?.IdLot ?? null;
    }

    const datosEliminados = {
      LoteYPrograma: {
        id_Lot: datosAnteriores_id_Lot ?? null,
        numlot: datosAnterioresRaw?.numlot ?? row.numlot ?? '',
        idProgram: datosAnterioresRaw?.idProgram ?? row.idProgram ?? null,
        desprogram: datosAnterioresRaw?.desprogram ?? row.desprogram ?? ''
      },
      analito: {
        idAnalytes: datosAnterioresRaw?.idAnalytes ?? row.idAnalytes ?? null,
        desanalytes: datosAnterioresRaw?.desanalytes ?? row.desanalytes ?? ''
      },
      analizador: {
        idAnalyzer: datosAnterioresRaw?.idAnalyzer ?? row.idAnalyzer ?? null,
        nameAnalyzer: datosAnterioresRaw?.nameAnalyzer ?? row.nameAnalyzer ?? ''
      },
      reactivo: {
        idReagents: datosAnterioresRaw?.idReagents ?? row.idReagents ?? null,
        desreagents: datosAnterioresRaw?.desreagents ?? row.desreagents ?? ''
      },
      metodo: {
        idMethods: datosAnterioresRaw?.idMethods ?? row.idMethods ?? null,
        desmethods: datosAnterioresRaw?.desmethods ?? row.desmethods ?? ''
      },
      unidad: {
        idUnits: datosAnterioresRaw?.idUnits ?? row.idUnits ?? null,
        codunits: datosAnterioresRaw?.codunits ?? row.codunits ?? ''
      },
      valorEsperado: {
        valueExpected: datosAnterioresRaw?.valueExpected ?? row.valueExpected ?? ''
      },
      activo: datosAnterioresRaw?.active ?? row.active ?? null
    };

    const usuario = sessionStorage.getItem('userid') || 'desconocido';
    const nombreUsuario = sessionStorage.getItem('nombres') || 'desconocido';
    const inicio = Date.now();
    const endpoint = `${window.location.origin}/api/qce/AssignValuesExpected/${row.idAssignValuesExpected}`;
    const userAgent = navigator.userAgent;

    this.assignValuesExpectedQceService.deleteAssignValuesExpected(row.idAssignValuesExpected).subscribe({
      next: (respuesta) => {
        this.buscar();
        this.toastr.success('Registro eliminado');

        const fin = Date.now();
        const tiempoEjecucion = fin - inicio;

        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          Hora: new Date().toISOString(),
          Metodo: 'eliminación',
          Datos: JSON.stringify(datosEliminados), // Ahora se registra lo eliminado
          DatosAnteriores: JSON.stringify(datosEliminados),
          Respuesta: JSON.stringify(respuesta),
          TipoRespuesta: 200,
          userid: usuario,
          usuario: nombreUsuario,
          executionTime: tiempoEjecucion,
          endpoint: endpoint,
          userAgent: userAgent,
          modulo: 'Control Calidad Externo',
          SubModulo: 'Administración',
          item: 'Asignación de valores'
        };

        if (this.assignValuesExpectedQceService.createLogAsync) {
          this.assignValuesExpectedQceService.createLogAsync(Loguser);
        }
      },
      error: (error) => {
        this.toastr.error('Ocurrio un error al eliminar');

        const fin = Date.now();
        const tiempoEjecucion = fin - inicio;

        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          Hora: new Date().toISOString(),
          Metodo: 'eliminación',
          Datos: JSON.stringify(datosEliminados), // También en error
          DatosAnteriores: JSON.stringify(datosEliminados),
          Respuesta: error?.message || error?.error || 'Ocurrio un error al eliminar',
          TipoRespuesta: error?.status ?? 500,
          userid: usuario,
          usuario: nombreUsuario,
          executionTime: tiempoEjecucion,
          endpoint: endpoint,
          userAgent: userAgent,
          modulo: 'Control Calidad Externo',
          SubModulo: 'Administración',
          item: 'Asignación de valores'
        };

        if (this.assignValuesExpectedQceService.createLogAsync) {
          this.assignValuesExpectedQceService.createLogAsync(Loguser);
        }
      }
    });
  }



  async modalEliminar(idAssignValuesExpected: any) {

    this.assignValuesExpectedQceService.deleteAssignValuesExpected(idAssignValuesExpected).subscribe({
      next: (respuesta) => {
        this.buscar();
        this.toastr.success('Registro eliminado');
        this.log.logObj('Control Calidad Externo', 'Administración', 'Asignación de valores esperados', 'e', idAssignValuesExpected, JSON.stringify(respuesta), 200);
      }, error: (error) => {
        this.toastr.error('Ocurrio un error al eliminar');
        this.log.logObj('Control Calidad Externo', 'Administración', 'Rondas', 'e', idAssignValuesExpected, 'Ocurrio un error al eliminar', error.status);

      }
    })

  }


}
