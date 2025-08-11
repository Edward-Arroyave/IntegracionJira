import { InfoResultQceService } from '@app/services/calidad-externo/inforesultQce.service';
import { AfterViewInit, Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SharedService } from '@app/services/shared.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { VentanasModalesService } from '@app/services/general/ventanas-modales.service';
import { AsyncPipe, DatePipe, NgClass, NgFor, NgIf, TitleCasePipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { lastValueFrom, Observable } from 'rxjs';
import { PublicService } from '@app/services/public.service';
import { ProgramConfQceDetailsService } from '@app/services/calidad-externo/ProgramconfQceDetails.service';
import { ProgramConfClientHeaderqQceService } from '@app/services/calidad-externo/program-conf-client-headerq-qce.service';
import { MethodsQceService } from '@app/services/calidad-externo/MethodsQce.service';
import { UnitsQceService } from '@app/services/calidad-externo/unitsQce.service';
import { AnalyzerQceService } from '@app/services/calidad-externo/AnalyzerQce.service';
import { ClientesService } from '@app/services/configuracion/clientes.service';
import { ProgramaQceService } from '@app/services/calidad-externo/programaQce.service';
import { ReactivosQceService } from '@app/services/calidad-externo/reactivos-qce.service';
import { catchError, map, startWith, switchMap, tap } from 'rxjs/operators';
import $ from 'jquery';
import { createLog } from '@app/globals/logUser';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { ResultQceService } from '@app/services/calidad-externo/resultQce.service';
import { ProgramaConfQceService } from '@app/services/calidad-externo/ProgramconfQce.service';
import { ImageCdnPipe } from '../../../../../core/pipes/image-cdn.pipe';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { LoaderService } from '@app/services/loader/loader.service';
import { MatDialog } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { environment } from '@environment/environment';
import { error } from 'console';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-asignacion-programas',
  templateUrl: './asignacion-programas.component.html',
  styleUrls: ['./asignacion-programas.component.css'],
  standalone: true,
  imports: [FormsModule, NgxMatSelectSearchModule, ReactiveFormsModule,
    MatInputModule, MatFormFieldModule, MatAutocompleteModule, MatSelectModule,
    MatOptionModule, NgFor, MatTooltipModule, NgIf, MatTableModule, MatSortModule,
    MatSlideToggleModule, MatPaginatorModule, TitleCasePipe,
    TranslateModule, ImageCdnPipe, MatTabsModule, MatIconModule, NgClass, AsyncPipe]
})
export class AsignacionProgramasComponent implements OnInit {
  updateReason = new FormControl();

  fechaActual = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
  dateNow: Date = new Date();
  accionEditar: any;
  accion: any;
  tituloAccion: any;
  vantanaModal: BsModalRef;
  titulo: any;
  text: any;
  desactivar = false;
  textError: any;
  cancelar: any;
  confirmar: any;
  messageError: any;
  //predictivos create
  filteredOptionsLotsCreate: Observable<string[]>;
  listlotscreate: any;
  //predictivo edit
  idlotpr: number;
  deslotpr: any;
  listalotpre: any;

  analizador = new FormControl('');
  metodo = new FormControl('');
  unidades = new FormControl('');
  existeasign: any;

  formaBuscarDatos = this.fb.group({

    cliente: ['', [Validators.required]],
    sede: ['', [Validators.required]],
    programa: ['', [Validators.required]]

  });

  dateNowISO = this.dateNow.toTimeString();
  clientes: any[] = [];
  clientesCopy: any[] = [];
  sedes: any;
  sedesActive: any[] = [];
  sedesActiveCopy: any[] = [];
  listaProgramas: any[] = [];
  listaProgramasCopy: any[] = [];
  verTabla: boolean = false;
  analyzers: any;
  methods: any;
  methodsActive: any;
  listaUnits: any;
  programSelected: any;
  sedeSeleccionada: any;
  clienteSeleccionado: any;
  arrProgram: any = [];
  consultaSedeExterna = 0;
  isCuanti = false;
  reactivos: any;
  desprogramconfig: string;
  buttonClicked = false;

  log = new createLog(this.datePipe, this.translate, this.programConfClientHeaderqQceService);

  isLocked: boolean = true
  openT1: boolean = true

  //Datos de la tabla
  programaSeleccionado: { idprogram: number, nombre: string } | null = null;

  //
  asignacionAnteriorOriginal: any[] = [];
  datosOriginalesProgramConf: any[] = [];


  @ViewChild('Toogle') Toogle!: ElementRef;

  //Predictivos
  filterClients = new FormControl('')
  filterSede = new FormControl('')
  filterPrograma = new FormControl('')

  //listas filrtradas
  filteredAnalyzers: any[] = [];
  filteredReactivos: any[] = [];
  filteredMetodos: any[] = [];
  filteredUnidades: any[] = [];
  reactivo = new FormControl('');


  //
  // Agrega el FormControl para cada celda que va a filtrar.
  public rowControls = {};

  // Filtro de clientes, sedes, programas, etc.
  public analizadorControl = new FormControl('');
  public reactivoControl = new FormControl('');
  public metodoControl = new FormControl('');
  public unidadesControl = new FormControl('');






  constructor(
    private reactivosQceService: ReactivosQceService,
    private unitsQceService: UnitsQceService,
    private programConfQceDetailsService: ProgramConfQceDetailsService,
    private methodsQceService: MethodsQceService,
    private analyzerQceService: AnalyzerQceService,
    private programConfClientHeaderqQceService: ProgramConfClientHeaderqQceService,
    private programaQceService: ProgramaQceService,
    private publicService: PublicService,
    private clientesService: ClientesService,
    private translate: TranslateService,
    private fb: FormBuilder,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private sharedService: SharedService,
    private ventanaService: VentanasModalesService,
    private datePipe: DatePipe,
    private resultQceService: ResultQceService,
    private infoResultQceService: InfoResultQceService,
    private ProgramaConfQceService: ProgramaConfQceService,
    private loaderService: LoaderService,
    private dialog: MatDialog,

  ) { }

  displayedColumns: string[] = ['analito', 'equipo', 'reactivo', 'metodo', 'unidades', 'active'];
  dataSource: MatTableDataSource<any>;
  dataSourceconfig: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatPaginator) paginator2: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  async ngOnInit(): Promise<void> {
    await this.getAnalizadores();
    await this.cargarClientes();
    await this.consultarProgramas();
    await this.getReactivos();
    await this.getMethods();
    await this.consultarUnits();
    sessionStorage.setItem('consultaSedeExterna', '0');
    this.sharedService.customTextPaginator(this.paginator);
    this.sharedService.customTextPaginator(this.paginator2);
    this.filters();
  }

  filters() {
    // Filtro de clientes
    this.filterClients.valueChanges.subscribe(word => {
      if (word) {
        this.clientes = this.clientesCopy.filter((cliente: any) => {
          return cliente.name?.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.clientes = [...this.clientesCopy];
      }
    });

    // Filtro de sedes
    this.filterSede.valueChanges.subscribe(word => {
      if (word) {
        this.sedesActive = this.sedesActiveCopy.filter((sede: any) => {
          return sede.desheadquarters?.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.sedesActive = [...this.sedesActiveCopy];
      }
    });

    // Filtro de programas
    this.filterPrograma.valueChanges.subscribe(word => {
      if (word) {
        this.listaProgramas = this.listaProgramasCopy.filter((programa: any) => {
          return programa.Desprogram?.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.listaProgramas = [...this.listaProgramasCopy];
      }
    });

    // Filtros individuales por celda (por fila)
    if (this.dataSourceconfig && this.dataSourceconfig.data) {
      this.dataSourceconfig.data.forEach((row, rowIndex) => {
        if (!this.rowControls[rowIndex]) this.rowControls[rowIndex] = {};

        // Analizador (equipo)
        if (!this.rowControls[rowIndex].analizador) {
          this.rowControls[rowIndex].analizador = new FormControl(row.id_Analyzer || '');
          this.rowControls[rowIndex].analizadorSearch = new FormControl('');
          this.rowControls[rowIndex].filteredAnalyzers = this.analyzers || [];
          this.rowControls[rowIndex].analizadorSearch.valueChanges
            .pipe(
              startWith(''),
              map(value => this._filterUnique(this.analyzers || [], value as string, 'nameAnalyzer'))
            )
            .subscribe(filtered => {
              this.rowControls[rowIndex].filteredAnalyzers = filtered;
            });
          // Inicializar filtro
          this.rowControls[rowIndex].filteredAnalyzers = this.analyzers || [];
        }

        // Reactivo
        if (!this.rowControls[rowIndex].reactivo) {
          this.rowControls[rowIndex].reactivo = new FormControl(row.idReagents || '');
          this.rowControls[rowIndex].reactivoSearch = new FormControl('');
          this.rowControls[rowIndex].filteredReactivos = this.reactivos || [];
          this.rowControls[rowIndex].reactivoSearch.valueChanges
            .pipe(
              startWith(''),
              map(value => this._filter(this.reactivos || [], value as string, 'desreagents'))
            )
            .subscribe(filtered => {
              this.rowControls[rowIndex].filteredReactivos = filtered;
            });
          this.rowControls[rowIndex].filteredReactivos = this.reactivos || [];
        }

        // Método
        if (!this.rowControls[rowIndex].metodo) {
          this.rowControls[rowIndex].metodo = new FormControl(row.idMethod || '');
          this.rowControls[rowIndex].metodoSearch = new FormControl('');
          this.rowControls[rowIndex].filteredMetodos = this.methodsActive || [];
          this.rowControls[rowIndex].metodoSearch.valueChanges
            .pipe(
              startWith(''),
              map(value => this._filter(this.methodsActive || [], value as string, 'desmethods'))
            )
            .subscribe(filtered => {
              this.rowControls[rowIndex].filteredMetodos = filtered;
            });
          this.rowControls[rowIndex].filteredMetodos = this.methodsActive || [];
        }

        // Unidades
        if (!this.rowControls[rowIndex].unidad) {
          this.rowControls[rowIndex].unidad = new FormControl(row.idUnit || '');
          this.rowControls[rowIndex].unidadSearch = new FormControl('');
          this.rowControls[rowIndex].filteredUnidades = this.listaUnits || [];
          this.rowControls[rowIndex].unidadSearch.valueChanges
            .pipe(
              startWith(''),
              map(value => this._filter(this.listaUnits || [], value as string, 'codunits'))
            )
            .subscribe(filtered => {
              this.rowControls[rowIndex].filteredUnidades = filtered;
            });
          this.rowControls[rowIndex].filteredUnidades = this.listaUnits || [];
        }

        // Sincronizar cambios de select con el modelo de datos
        this.rowControls[rowIndex].analizador.valueChanges.subscribe(val => {
          row.id_Analyzer = val;
        });
        this.rowControls[rowIndex].reactivo.valueChanges.subscribe(val => {
          row.idReagents = val;
        });
        this.rowControls[rowIndex].metodo.valueChanges.subscribe(val => {
          row.idMethod = val;
        });
        this.rowControls[rowIndex].unidad.valueChanges.subscribe(val => {
          row.idUnit = val;
        });
      });
    }

    // Filtro global para autocompletes generales (si quieres mantenerlos)
    this.analizador.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filterUnique(this.analyzers || [], value as string, 'nameAnalyzer'))
      )
      .subscribe(filtered => this.filteredAnalyzers = filtered);

    this.reactivo.valueChanges
      .pipe(startWith(''), map(value => this._filter(this.reactivos || [], value as string, 'desreagents')))
      .subscribe(filtered => this.filteredReactivos = filtered);

    this.metodo.valueChanges
      .pipe(startWith(''), map(value => this._filter(this.methodsActive || [], value as string, 'desmethods')))
      .subscribe(filtered => this.filteredMetodos = filtered);

    this.unidades.valueChanges
      .pipe(startWith(''), map(value => this._filter(this.listaUnits || [], value as string, 'codunits')))
      .subscribe(filtered => this.filteredUnidades = filtered);
  }

  // Método para filtrar los valores
  private _filter(lista: any[], value: string, campo: string): any[] {
    const filtro = (value || '').toLowerCase();
    return lista.filter(item => item[campo]?.toLowerCase().includes(filtro));
  }

  // Método para filtrar y mantener la referencia de los objetos originales (evita que Angular Material autocomplete borre los valores de otros campos)
  private _filterUnique(lista: any[], value: string, campo: string): any[] {
    const filtro = (value || '').toLowerCase();
    if (!filtro) return lista;
    return lista.filter(item => item[campo]?.toLowerCase().includes(filtro));
  }

  selectOne(idx, row, value?) {
    switch (idx) {
      case 1:
        row.id_Analyzer = Number(value);
        break;
      case 2:
        row.idReagents = Number(value);
        break;
      case 3:
        row.idMethod = Number(value);
        break;
      case 4:
        row.idUnit = Number(value);
        break;
      case 5:
        const estado = !row.active;
        row.active = estado;
        this.EstadoAnalito(row, estado, value);
        break;
    }
  }

  generarData(r: any) {
    this.dataSource = new MatTableDataSource(r);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.verTabla = true;
    this.openT1 = true;

    //Guardar una copia de los datos originales para futuras comparaciones
    this.datosOriginalesProgramConf = r;
  }

  async generarDataassign(r: any) {

    this.asignacionAnteriorOriginal = JSON.parse(JSON.stringify(r));
    this.dataSourceconfig = new MatTableDataSource(r);
    this.dataSourceconfig.paginator = this.paginator2;
    this.dataSourceconfig.sort = this.sort;
    this.verTabla = true;
    
    // Inicializar controles de fila para filtros y selects
    setTimeout(() => {
      if (this.dataSourceconfig && this.dataSourceconfig.data) {
        this.dataSourceconfig.data.forEach((row, rowIndex) => {
          if (!this.rowControls[rowIndex]) this.rowControls[rowIndex] = {};

          // Analizador
          if (!this.rowControls[rowIndex].analizador) {
            this.rowControls[rowIndex].analizador = new FormControl(row.id_Analyzer || '');
            this.rowControls[rowIndex].analizadorSearch = new FormControl('');
            this.rowControls[rowIndex].filteredAnalyzers = this.analyzers || [];
            this.rowControls[rowIndex].analizadorSearch.valueChanges
              .pipe(
                startWith(''),
                map(value => this._filterUnique(this.analyzers || [], value as string, 'nameAnalyzer'))
              )
              .subscribe(filtered => {
                this.rowControls[rowIndex].filteredAnalyzers = filtered;
              });
            this.rowControls[rowIndex].filteredAnalyzers = this.analyzers || [];
          }

          // Reactivo
          if (!this.rowControls[rowIndex].reactivo) {
            this.rowControls[rowIndex].reactivo = new FormControl(row.idReagents || '');
            this.rowControls[rowIndex].reactivoSearch = new FormControl('');
            this.rowControls[rowIndex].filteredReactivos = this.reactivos || [];
            this.rowControls[rowIndex].reactivoSearch.valueChanges
              .pipe(
                startWith(''),
                map(value => this._filter(this.reactivos || [], value as string, 'desreagents'))
              )
              .subscribe(filtered => {
                this.rowControls[rowIndex].filteredReactivos = filtered;
              });
            this.rowControls[rowIndex].filteredReactivos = this.reactivos || [];
          }

          // Método
          if (!this.rowControls[rowIndex].metodo) {
            this.rowControls[rowIndex].metodo = new FormControl(row.idMethod || '');
            this.rowControls[rowIndex].metodoSearch = new FormControl('');
            this.rowControls[rowIndex].filteredMetodos = this.methodsActive || [];
            this.rowControls[rowIndex].metodoSearch.valueChanges
              .pipe(
                startWith(''),
                map(value => this._filter(this.methodsActive || [], value as string, 'desmethods'))
              )
              .subscribe(filtered => {
                this.rowControls[rowIndex].filteredMetodos = filtered;
              });
            this.rowControls[rowIndex].filteredMetodos = this.methodsActive || [];
          }

          // Unidades
          if (!this.rowControls[rowIndex].unidad) {
            this.rowControls[rowIndex].unidad = new FormControl(row.idUnit || '');
            this.rowControls[rowIndex].unidadSearch = new FormControl('');
            this.rowControls[rowIndex].filteredUnidades = this.listaUnits || [];
            this.rowControls[rowIndex].unidadSearch.valueChanges
              .pipe(
                startWith(''),
                map(value => this._filter(this.listaUnits || [], value as string, 'codunits'))
              )
              .subscribe(filtered => {
                this.rowControls[rowIndex].filteredUnidades = filtered;
              });
            this.rowControls[rowIndex].filteredUnidades = this.listaUnits || [];
          }

          // Sincronizar cambios de select con el modelo de datos
          this.rowControls[rowIndex].analizador.valueChanges.subscribe(val => {
            row.id_Analyzer = val;
          });
          this.rowControls[rowIndex].reactivo.valueChanges.subscribe(val => {
            row.idReagents = val;
          });
          this.rowControls[rowIndex].metodo.valueChanges.subscribe(val => {
            row.idMethod = val;
          });
          this.rowControls[rowIndex].unidad.valueChanges.subscribe(val => {
            row.idUnit = val;
          });
        });
      }
    }, 100);
  }





























  


  async cargarClientes() {

    try {
      this.loaderService.show()
      this.loaderService.text.emit({ text: 'Cargando clientes...' })
      this.clientes = await this.clientesService.getAllAsync()
      this.clientesCopy = this.clientes;
      this.loaderService.hide()
    } catch (error) {
      this.loaderService.hide()
    }


  }

  async cargarSedes(dataClient) {

    sessionStorage.setItem('consultaSedeExterna', '1');
    await this.publicService.obtenerSedesAsigProg(this.clienteSeleccionado.header).then(async r => {

      this.sedesActive = r.filter(e => e.active);
      this.sedesActiveCopy = r.filter(e => e.active);
      sessionStorage.setItem('consultaSedeExterna', '0');
    });
  }

  async consultarProgramas() {
    try {
      this.loaderService.show()
      this.loaderService.text.emit({ text: 'Cargando programas...' })
      let respuesta = await this.programConfQceDetailsService.getListprogramasign().toPromise()
      this.loaderService.show()

      this.listaProgramas = respuesta
      this.listaProgramasCopy = respuesta
    } catch (error) {
      this.loaderService.show()

    }

  }

  async getAnalizadores() {
    try {
      this.loaderService.show()
      this.loaderService.text.emit({ text: 'Cargando analizadores...' })
      let equipos = await this.analyzerQceService.getAllAsync()
      this.loaderService.hide()
      this.analyzers = equipos;

    } catch (error) {
      this.loaderService.hide()
    }

  }

  async getReactivos() {
    try {
      this.loaderService.show()
      this.loaderService.text.emit({ text: 'Cargando reactivos...' })
      let react = await this.reactivosQceService.getAllAsync()
      this.loaderService.hide()
      this.reactivos = react.filter(e => e.active);

    } catch (error) {
      this.loaderService.hide()
    }

  }

  async getMethods() {
    try {
      this.loaderService.show()
      this.loaderService.text.emit({ text: 'Cargando metodos...' })
      this.methods = await this.methodsQceService.getAllAsync();
      this.methodsActive = this.methods.filter(e => e.active);
      this.loaderService.hide()
    } catch (error) {
      this.loaderService.hide()
    }

  }

  async consultarUnits() {

    try {
      this.loaderService.show()
      this.loaderService.text.emit({ text: 'Cargando unidades...' })
      let respuesta = await this.unitsQceService.getAllAsync()
      this.listaUnits = respuesta.filter(datos => datos.active == true);
      this.loaderService.hide()

    } catch (error) {
      this.loaderService.hide()
    }

  }


  selectFilter(idx, data) {
    this.desprogramconfig = null;
    this.dataSourceconfig = new MatTableDataSource();
    this.dataSource = new MatTableDataSource();
    switch (idx) {
      case 1:
        this.clienteSeleccionado = data;
        this.cargarSedes(data);
        break;
      case 2:
        this.sedeSeleccionada = data;
        break;
      case 3:
        this.programSelected = data;
        break;
    }
  }

    generateTableRows(data): string {
    return data.map(row => `
      <tr>
      <td>${row.Nroround}</td>
      <td>${row.SerialSample}</td>
      </tr>
      `).join('');
    }

  EstadoAnalito(data: any, estado: any, idx: any) {


     const posicion = this.dataSourceconfig.filteredData.indexOf(data);
  if (posicion === -1) {
    return;
  }

  if (estado === false) {
    this.infoResultQceService.getData(data.idClient, this.sedeSeleccionada.idheadquarters, data.idProgram).subscribe(r => {
      debugger
      let dtExists = r.filter(e=> e.IdProgramConfClientHeadq === data.idProgramConfClientHeadq);

      if (dtExists.length > 0) {
        const activeColumnElement = document.getElementById(String(idx));
        data.active = true;
        if (activeColumnElement) {
          activeColumnElement.style.display = 'hidden';
          setTimeout(() => activeColumnElement.style.visibility = 'visible', 100);
        }

        //
        Swal.fire({
          title: 'Actualización denegada',
          titleText: "La parametrización que se requiere desactivar, está siendo utilizada, para poder realizar este proceso diríjase a rondas: ",
          html: `
          <table class="table table-bordered">
          <thead>
          <tr>
          <th>Nro Ronda</th>
          <th>Muestra</th>
          </tr>
          </thead>
          <tbody>
          ${this.generateTableRows(dtExists)}
          </tbody>
          </table>
          `,
          icon: 'info'
        });

        return;
      }

      data = { idProgramConfClientHeadq: data.idProgramConfClientHeadq, idClient: data.idClient, idHeadQuarterClientQCE: data.idHeadQuarterClientQCE, idAnalytes: data.idAnalytes,idMethod:data.idMethod, idProgram: data.idProgram, idReagents: data.idReagents, idUnit: data.idUnit, id_Analyzer:data.id_Analyzer,Active: estado }
      
      this.loaderService.show();
      this.programConfClientHeaderqQceService.UpdateProgramConfClientHeader(data, data.idProgramConfClientHeadq).subscribe({ 
        next: (respuesta) => {
          this.buscar();
          this.loaderService.hide();
          this.toastr.success( 'Estado de configuración actualizado!.');
          this.accion = 'Editar';
        }, error: (err) => {
          this.loaderService.hide();
          this.toastr.error(err.error);
          return;
        },
      });

    });
  } else {
      data = { idProgramConfClientHeadq: data.idProgramConfClientHeadq, idClient: data.idClient, idHeadQuarterClientQCE: data.idHeadQuarterClientQCE, idAnalytes: data.idAnalytes,idMethod:data.idMethod, idProgram: data.idProgram, idReagents: data.idReagents, idUnit: data.idUnit, id_Analyzer:data.id_Analyzer,Active: estado }
      
      this.loaderService.show();
      this.programConfClientHeaderqQceService.UpdateProgramConfClientHeader(data, data.idProgramConfClientHeadq).subscribe({ 
        next: (respuesta) => {
          this.buscar();
          this.loaderService.hide();
          this.toastr.success( 'Estado de configuración actualizado!.');
          this.accion = 'Editar';
        }, error: (err) => {
          this.loaderService.hide();
          this.toastr.error(err.error);
          return;
        },
      });
    this.toastr.success('Analito activado correctamente.');
  }
  }

// EstadoAnalito(data: any, estado: any, idx: any) {

//     // data = { idProgramConfClientHeadq: data.idProgramConfClientHeadq, idClient: data.idClient, idHeadQuarterClientQCE: data.idHeadQuarterClientQCE,idMethod:data.idMethod, idProgram: data.idProgram, idReagents: data.idReagents, idUnit: data.idUnit, id_Analyzer:data.id_Analyzer,Active: estado }

//     // if(estado === false){
//     //   this.toastr.info( 'Al desactivar el analito, no se asignará dentro del programa.');
//     // }

//     // this.programConfClientHeaderqQceService.update(data, data.idProgramConfClientHeadq).subscribe(respuesta => {

//     //   this.buscar();
//     //   this.loaderService.show();
//     //   this.toastr.success( 'Estado de configuración actualizado!.');
//     //   this.accion = 'Editar';

//     // });


//     let posicion = this.dataSourceconfig.filteredData.indexOf(data);
//     let posicionTablaArriba = this.dataSource.filteredData[posicion]



//     if (estado == false) {

//       this.infoResultQceService.getData(data.idClient, this.sedeSeleccionada.idheadquarters, data.idProgram).subscribe(r => {


//         let found: any;
//         if (r && r.length) {
//           found = r.find((e: any) => e.IdProgramConfClientHeadq == data.idProgramConfClientHeadq && e.Result !== "")
//           if (found) {
//             this.toastr.error('No se puede desactivar el analito porque ya contiene resultados.');
//             const activeColumnElement = document.getElementById(String(idx));
//             data.active = true;
//             if (activeColumnElement) {
//               activeColumnElement.style.display = 'hidden';
//             }
//             setTimeout(() => {
//               if (activeColumnElement) {
//                 activeColumnElement.style.visibility = 'visible';
//               }
//             }, 100);
//             return
//           }
//         }

//         var jsonTexto = '{"IdProgram":"' + data.idProgram + '","Idanalytes":"' + data.idAnalytes + '", "IdAnalyzer":"' + this.dataSource.filteredData[posicion].IdAnalyzer + '","Idunit":"' + this.dataSource.filteredData[posicion].Idunits + '" ,"Idmethod":"' + this.dataSource.filteredData[posicion].Idmethods + '" ,"Idreagents":"' + this.dataSource.filteredData[posicion].IdReagents + '"}';

//         this.ProgramaConfQceService.getinfoConfigprogramid(jsonTexto).then(dataprgramconf => {
          
//           dataprgramconf.forEach(dtResults => {
//               let idprogramconf = dtResults.IdProgramconf;
//               let idresult = dtResults.Idresult;
//               //Inactiva el resultado
//               this.resultQceService.deleteresultxidprogramconf(idresult, idprogramconf).then(resultDelete => {});
//             });

//           }).catch(error => {
//             console.log(error.error);
//           });
//       });
//     }
//   }



  buscarInfoProgramConf() {
    const obj =
    {
      "IdProgram": this.programSelected.IdProgram
    }

    this.programConfQceDetailsService.getInfoconfigprograma(obj).toPromise()
      .then(r => {
        this.generarData(r);
        this.loaderService.hide();
        this.desprogramconfig = r[0].Desprogram;
        this.datosOriginalesProgramConf = JSON.parse(JSON.stringify(r));
      })
      .catch(err => {
        this.toastr.error('No hay datos.');
      });
  }


  async buscar() {
    if (this.formaBuscarDatos.valid) {
      this.verTabla = false;
      let consulta = {
        client: this.clienteSeleccionado.idclient,
        sede: this.sedeSeleccionada.idheadquarters,
        programa: this.programSelected.IdProgram,
      }

      await lastValueFrom(this.programConfClientHeaderqQceService.getProgramAssignment(Number(consulta.client), Number(consulta.sede), Number(consulta.programa))) 
        .then(async r => {
          //Datos de la tabla
          for (let i = 0; i < r.length; i++) {
            r[i].idTab = i;
          }
          this.asignacionAnteriorOriginal = r;
          await this.generarDataassign(r);
        })
        .catch(err => {
          this.toastr.error('No hay asignaciones.');
          return;
        });

    } else {
      this.verTabla = false;
      this.toastr.error('Debe diligenciar los campos completamente.');
      this.formaBuscarDatos.markAllAsTouched();

    }
  }

  detailObj() {
    let obj = {
      Cliente: this.clienteSeleccionado.name,
      Programa: this.programSelected.Desprogram,
      Sede: this.sedeSeleccionada.desheadquarters,
      tabla: this.dataSource.filteredData,
    }
    return obj;
  }



  crearAsignacion() {
    this.buttonClicked = true;
    const objcreate = [];
    const datosGenerados = [];

    const usuario = sessionStorage.getItem('userid') || 'desconocido';
    const nombreUsuario = sessionStorage.getItem('nombres') || 'desconocido';
    const inicio = Date.now();
    const userAgent = navigator.userAgent;
    const endpoint = `${environment.apiUrl}qce/ProgramConfClientHeadq`;

    this.dataSource.filteredData.forEach(element => {
      const yaExiste = this.dataSourceconfig.filteredData.length !== 0 &&
        this.dataSourceconfig.filteredData.some(datos =>
          datos.idMethod == element.Idmethods &&
          datos.idReagents == element.IdReagents &&
          datos.idUnit == element.Idunits &&
          datos.id_Analyzer == element.IdAnalyzer &&
          datos.idAnalytes == element.Idanalytes
        );

      if (!yaExiste && element.Active) {
        const obj = {
          idProgramConfClientHeadq: 0,
          idClient: this.clienteSeleccionado.idclient,
          idHeadQuarterClientQCE: this.sedeSeleccionada.idheadquarters,
          idAnalytes: element.Idanalytes,
          id_Analyzer: element.IdAnalyzer,
          idMethod: element.Idmethods,
          idUnit: element.Idunits,
          idProgram: element.IdProgram,
          idReagents: element.IdReagents,
          valueAsign: 0,
          active: element.Active
        };
        objcreate.push(obj);
        datosGenerados.push(obj);
      }
    });

    if (objcreate.length === 0) {
      this.toastr.error('Las configuraciones ya están asignadas.');
      this.buttonClicked = false;
      return;
    }

    const logJsonBase = {
      Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
      Hora: this.dateNowISO,
      Metodo: 'creación',
      Datos: JSON.stringify(datosGenerados),
      DatosAnteriores: '[]',
      Respuesta: '',
      TipoRespuesta: null,
      userid: usuario,
      usuario: nombreUsuario,
      executionTime: 0,
      endpoint: endpoint,
      userAgent: userAgent,
      modulo: 'Control Calidad Externo',
      SubModulo: 'Administración',
      item: 'Asignación programa'
    };

    this.loaderService.show();

    this.programConfClientHeaderqQceService.createProgramAssignment(objcreate).subscribe({
      next: (response) => {
        const fin = Date.now();
        const tiempoEjecucion = fin - inicio;

        const tipoRespuesta = [200, 201, 204].includes(response?.status)
          ? 200
          : response?.status ?? 500;

        const logJson = {
          ...logJsonBase,
          Respuesta: response?.body && Object.keys(response.body).length > 0
            ? JSON.stringify(response.body)
            : 'Operación exitosa (sin contenido)',
          TipoRespuesta: tipoRespuesta,
          executionTime: tiempoEjecucion
        };

        this.toastr.success('Asignación programa generada correctamente.');
        this.ProgramaConfQceService.logOperacionAsync(logJson);
        this.buscar();
        this.loaderService.hide();
        this.buttonClicked = false;
      },
      error: (err) => {
        const fin = Date.now();
        const tiempoEjecucion = fin - inicio;

        const logJson = {
          ...logJsonBase,
          Respuesta: err.message,
          TipoRespuesta: err.status ?? 500,
          executionTime: tiempoEjecucion
        };

        this.toastr.error('Error al generar asignación.');
        this.ProgramaConfQceService.logOperacionAsync(logJson);
        this.loaderService.hide();
        this.buttonClicked = false;
      }
    });
  }



  async guardar() {
    try {
      let duplicateParametrization = false;

      // Validar si hay parametrizaciones duplicadas
      const seen = new Set();
      this.dataSourceconfig.filteredData.forEach(element => {
        const uniqueKey = `${element.idMethod}-${element.idReagents}-${element.idUnit}-${element.id_Analyzer}-${element.idAnalytes}`;
        if (seen.has(uniqueKey)) {
          duplicateParametrization = true;
          this.toastr.error("Hay parametrizaciones del mismo analito que se encuentran duplicadas. Por favor validar");
        }
        seen.add(uniqueKey);
      });

      if (duplicateParametrization) return;

      if (!this.asignacionAnteriorOriginal || this.asignacionAnteriorOriginal.length === 0) {
        this.toastr.error("Debe buscar antes de guardar.");
        return;
      }

      this.loaderService.show();
      const inicio = Date.now();
      const usuario = sessionStorage.getItem('userid') || 'desconocido';
      const nombreUsuario = sessionStorage.getItem('nombres') || 'desconocido';
      const userAgent = navigator.userAgent;
      const endpoint = `${environment.apiUrl}qce/ProgramconfQce`;

      // Datos generales sin títulos
      const generalData = {
        idCliente: this.clienteSeleccionado?.idclient,
        nombreCliente: this.clienteSeleccionado?.name,
        idPrograma: this.programSelected?.IdProgram,
        nombrePrograma: this.programSelected?.Desprogram,
        idSede: this.sedeSeleccionada?.idheadquarters,
        nombreSede: this.sedeSeleccionada?.desheadquarters
      };

      // Enriquecer la tabla actual
      const tablaActual = this.dataSourceconfig.filteredData.map(row => {
        const equipo = this.analyzers?.find((a: any) => a.idAnalyzer == row.id_Analyzer);
        const reactivo = this.reactivos?.find((r: any) => r.idreagents == row.idReagents);
        const metodo = this.methodsActive?.find((m: any) => m.idmethods == row.idMethod);
        const unidad = this.listaUnits?.find((u: any) => u.idunits == row.idUnit);

        return {
          idProgramConfClientHeadq: row.idProgramConfClientHeadq,
          idAnalytes: row.idAnalytes,
          desanalytes: row.desanalytes,
          valueAsign: row.valueAsign,
          active: row.active,
          Equipo: {
            id_Analyzer: row.id_Analyzer,
            NameAnalyzer: equipo?.nameAnalyzer || ''
          },
          Reactivo: {
            idReagents: row.idReagents,
            Desreagents: reactivo?.desreagents || ''
          },
          Metodo: {
            idMethod: row.idMethod,
            Desmethods: metodo?.desmethods || ''
          },
          Unidad: {
            idUnit: row.idUnit,
            Codunits: unidad?.codunits || ''
          }
        };
      });

      // Enriquecer los datos anteriores
      const tablaAnterior = this.asignacionAnteriorOriginal.map(row => {
        const equipo = this.analyzers?.find((a: any) => a.idAnalyzer == row.id_Analyzer);
        const reactivo = this.reactivos?.find((r: any) => r.idreagents == row.idReagents);
        const metodo = this.methodsActive?.find((m: any) => m.idmethods == row.idMethod);
        const unidad = this.listaUnits?.find((u: any) => u.idunits == row.idUnit);

        return {
          idProgramConfClientHeadq: row.idProgramConfClientHeadq,
          idAnalytes: row.idAnalytes,
          desanalytes: row.desanalytes,
          valueAsign: row.valueAsign,
          active: row.active,
          Equipo: {
            id_Analyzer: row.id_Analyzer,
            NameAnalyzer: equipo?.nameAnalyzer || ''
          },
          Reactivo: {
            idReagents: row.idReagents,
            Desreagents: reactivo?.desreagents || ''
          },
          Metodo: {
            idMethod: row.idMethod,
            Desmethods: metodo?.desmethods || ''
          },
          Unidad: {
            idUnit: row.idUnit,
            Codunits: unidad?.codunits || ''
          }
        };
      });


      const datosLimpios = {
        ...generalData,
        tabla: tablaActual
      };

      const datosAnterioresLimpios = {
        ...generalData,
        tabla: tablaAnterior
      };

      // Crear log base
      const logJsonBase = {
        Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
        Hora: this.dateNowISO,
        Metodo: 'actualización',
        Datos: JSON.stringify(datosLimpios),
        DatosAnteriores: JSON.stringify(datosAnterioresLimpios),
        Respuesta: '',
        TipoRespuesta: null,
        userid: usuario,
        usuario: nombreUsuario,
        executionTime: 0,
        endpoint: endpoint,
        userAgent: userAgent,
        modulo: 'Control Calidad Externo',
        SubModulo: 'Administración',
        item: 'Asignación programa'
      };

      // Llamada al servicio
      await this.programConfClientHeaderqQceService.updateProgramAssignment(this.dataSourceconfig.filteredData)
        .then(response => {
          const fin = Date.now();
          const tiempoEjecucion = fin - inicio;

          let respuestaEnriquecida = [];
          if (Array.isArray(response?.body)) {
            respuestaEnriquecida = response.body.map((row: any) => {
              const equipo = this.analyzers?.find((a: any) => a.idAnalyzer == row.id_Analyzer);
              const reactivo = this.reactivos?.find((r: any) => r.idreagents == row.idReagents);
              const metodo = this.methodsActive?.find((m: any) => m.idmethods == row.idMethod);
              const unidad = this.listaUnits?.find((u: any) => u.idunits == row.idUnit);

              return {
                idProgramConfClientHeadq: row.idProgramConfClientHeadq,
                idAnalytes: row.idAnalytes,
                desanalytes: row.desanalytes,
                valueAsign: row.valueAsign,
                active: row.active,
                Equipo: {
                  id_Analyzer: row.id_Analyzer,
                  NameAnalyzer: equipo?.nameAnalyzer || ''
                },
                Reactivo: {
                  idReagents: row.idReagents,
                  Desreagents: reactivo?.desreagents || ''
                },
                Metodo: {
                  idMethod: row.idMethod,
                  Desmethods: metodo?.desmethods || ''
                },
                Unidad: {
                  idUnit: row.idUnit,
                  Codunits: unidad?.codunits || ''
                }
              };
            });
          }

          const tipoRespuesta = [200, 201, 204].includes(response?.status)
            ? 200
            : response?.status ?? 500;

          const logJson = {
            ...logJsonBase,
            Respuesta: respuestaEnriquecida.length > 0
              ? JSON.stringify({
                  ...generalData,
                  tabla: respuestaEnriquecida
                })
              : (response?.body && Object.keys(response.body).length > 0
                ? JSON.stringify(response.body)
                : 'Operación exitosa (sin contenido)'),
            TipoRespuesta: tipoRespuesta,
            executionTime: tiempoEjecucion
          };

          this.toastr.success('Asignación de programa actualizada correctamente.');
          this.ProgramaConfQceService.logOperacionAsync(logJson);
          for (let i = 0; i < response.body.length; i++) {
            response.body[i].idTab = i;
          }
          this.generarDataassign(response.body);
          this.loaderService.hide();
        })
        .catch(err => {
          const fin = Date.now();
          const tiempoEjecucion = fin - inicio;

          const logJson = {
            ...logJsonBase,
            Respuesta: err.message,
            TipoRespuesta: err.status ?? 500,
            executionTime: tiempoEjecucion
          };

          this.toastr.error('Datos no actualizados.');
          this.ProgramaConfQceService.logOperacionAsync(logJson);
          this.loaderService.hide();
        });

    } catch (err: any) {
      const usuario = sessionStorage.getItem('userid') || 'desconocido';
      const nombreUsuario = sessionStorage.getItem('nombres') || 'desconocido';
      const userAgent = navigator.userAgent;
      const endpoint = `${environment.apiUrl}qce/ProgramconfQce`;

      const logJson = {
        Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
        Hora: this.dateNowISO,
        Metodo: 'actualización',
        Datos: JSON.stringify({
          idCliente: this.clienteSeleccionado?.idclient,
          nombreCliente: this.clienteSeleccionado?.name,
          idPrograma: this.programSelected?.IdProgram,
          nombrePrograma: this.programSelected?.Desprogram,
          idSede: this.sedeSeleccionada?.idheadquarters,
          nombreSede: this.sedeSeleccionada?.desheadquarters,
          tabla: []
        }),
        DatosAnteriores: '',
        Respuesta: err.message,
        TipoRespuesta: err.status ?? 500,
        userid: usuario,
        usuario: nombreUsuario,
        executionTime: 0,
        endpoint: endpoint,
        userAgent: userAgent,
        modulo: 'Control Calidad Externo',
        SubModulo: 'Administración',
        item: 'Asignación programa'
      };

      this.toastr.error('Datos no actualizados.');
      this.ProgramaConfQceService.logOperacionAsync(logJson);
      this.loaderService.hide();
    }
  }







  /**
   * Configuración emisor, actualiza el estado de la configuración del programa.
   */
async actualizarEstadoGestionProgramas(datosGestion:any) {

    const estado = datosGestion.Active ? false : true;

    let datos = null;

    if (datosGestion.Valueasign != null) {

      this.isCuanti = true;
      datos = { idProgramconf: datosGestion.IdProgramconf, idanalytes: datosGestion.Idanalytes, idAnalyzer: datosGestion.IdAnalyzer, idReagents: datosGestion.IdReagents, idmethods: datosGestion.Idmethods, idunits: datosGestion.Idunits, idProgram: datosGestion.IdProgram, valueasign: datosGestion.Valueasign, active: estado }

    } else {

      this.isCuanti = false;
      datos = { idProgramconf: datosGestion.IdProgramconf, idanalytes: datosGestion.Idanalytes, idAnalyzer: datosGestion.IdAnalyzer, idReagents: datosGestion.IdReagents, idmethods: datosGestion.Idmethods, idunits: datosGestion.Idunits, idProgram: datosGestion.IdProgram, active: estado }

    }
    if (estado === false) {
      this.toastr.info('Al desactivar el analito, no se asignará dentro del programa.');
    }

    this.ProgramaConfQceService.update(datos, datosGestion.IdProgramconf).subscribe(respuesta => {
      this.loaderService.show();
      this.toastr.success('Estado de configuración actualizado!.');
      this.accion = 'Editar';
      this.buscarInfoProgramConf();
    });

  }


  cancelarAsig() {
    this.verTabla = false;
    this.openT1 = true;
    this.formaBuscarDatos.get('cliente').setValue('')
    this.formaBuscarDatos.get('sede').setValue('')
    this.formaBuscarDatos.get('programa').setValue('')
    this.dataSource = new MatTableDataSource();
  }





  changeTab(tab: number) {
    switch (tab) {
      case 1:
        this.openT1 = true
        break;
      case 2:
        if (this.dataSourceconfig.data.length > 0) {
          this.openT1 = false
          setTimeout(() => {
            this.dataSourceconfig.paginator = this.paginator2;
            this.dataSourceconfig.sort = this.sort;
          }, 100);
        }
        break;

      default:
        break;
    }
    ;


  }

}
