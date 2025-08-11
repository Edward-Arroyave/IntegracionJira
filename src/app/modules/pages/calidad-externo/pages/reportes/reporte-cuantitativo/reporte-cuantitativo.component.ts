import { Component, ElementRef, OnInit, signal, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProgramasQceService } from '@app/services/configuracion/programas-qce.service';
import { ReportesExternoService } from '@app/services/calidad-externo/reportesExterno.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { ReporteCuantitativoService } from '@app/services/calidad-externo/reporte-cuantitativo.service';
import { Chart, registerables } from 'chart.js';
import { LaboratoriosService } from '@app/services/configuracion/laboratorios.service';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { Canvas, Columns, Img, Line, PdfMakeWrapper, Stack, Table, Txt } from 'pdfmake-wrapper';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import dayjs from 'dayjs';

import { DomSanitizer } from '@angular/platform-browser';
import { AnalitoElement, GroupedAnalitos, Sedes, TablaAnalitos } from '@app/interfaces/sedes.interface';
import { PdfService } from '@app/services/pdfs/pdf.service';
import { Location, NgClass, NgIf, NgFor, NgSwitch, NgSwitchCase, NgTemplateOutlet, NgSwitchDefault, LowerCasePipe, JsonPipe, NgStyle, TitleCasePipe } from '@angular/common';
import { ClientesService } from '@app/services/configuracion/clientes.service';
import { PublicService } from '@app/services/public.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import moment from 'moment';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ImageCdnPipe } from '../../../../../core/pipes/image-cdn.pipe';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { GraficaLineasComponent } from '../../../../../shared/graficos/grafica-lineas/grafica-lineas.component';
import { GraficaBarrasComponent } from '../../../../../shared/graficos/grafica-barras/grafica-barras.component';
import { MatRadioModule } from '@angular/material/radio';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CargadorComponent } from '../../../../../shared/cargador/cargador.component';
import { LoaderService } from '@app/services/loader/loader.service';
import { MatIcon, MatIconRegistry } from '@angular/material/icon';
import { lastValueFrom, Subject, takeUntil, timer } from 'rxjs';
import { GraficasPuntosComponent } from '@app/modules/shared/graficos/graficas-puntos/graficas-puntos.component';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { DateTime } from 'luxon';
import { ModalData } from '@app/Models/Modaldata';
import { ModalGeneralComponent } from '@app/modules/shared/modals/modal-general/modal-general.component';
import { MatDialog } from '@angular/material/dialog';
import { LogsService } from '@app/services/configuracion/logs.service';
import { SharedService } from '@app/services/shared.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AnalyticalProblemsService } from '@app/services/calidad-externo/AnalyticalProblems.service';

Chart.register(...registerables);
@Component({
    selector: 'app-reporte-cuantitativo',
    templateUrl: './reporte-cuantitativo.component.html',
    styleUrls: ['./reporte-cuantitativo.component.css'],
    standalone: true,
    imports: [CargadorComponent,
      NgClass,
      NgIf,
      FormsModule,
      ReactiveFormsModule,
      MatFormFieldModule,
      MatSelectModule,
      MatOptionModule,
      NgFor,
      MatTooltipModule,
      MatRadioModule,
      NgSwitch,
      NgSwitchCase,
      NgTemplateOutlet,
      NgSwitchDefault,
      GraficaBarrasComponent,
      GraficaLineasComponent,
      MatInputModule,
      MatDatepickerModule,
      MatSlideToggleModule,
      MatTabsModule,
      MatTableModule,
      MatSortModule,
      MatPaginatorModule,
      LowerCasePipe,
      JsonPipe,
      TranslateModule,
      ImageCdnPipe,
      MatIcon,
      NgStyle,
      TitleCasePipe,
      GraficasPuntosComponent,
      NgxMatSelectSearchModule
    ]
})
export class ReporteCuantitativoComponent implements OnInit {
  canvas: any;
  ctx: any;
  @ViewChild('mychart') mychart: ElementRef;
  @ViewChild('mychartDiv') mychartDiv: ElementRef;
  @ViewChild('mychartDivTres') mychartDivTres: ElementRef;
  @ViewChild('myChartEvaluacion2DivOculto') myChartEvaluacion2DivOculto: ElementRef;
  @ViewChild('myChartEvaluacion3DivOculto') myChartEvaluacion3DivOculto: ElementRef;
  @ViewChild('myChartEvaluacion3DivOcultoZscore') myChartEvaluacion3DivOcultoZscore: ElementRef;
  @ViewChild('myChartEvaluacionDivocultoZescore') myChartEvaluacionDivocultoZescore: ElementRef;

  @ViewChild('myChartEvaluacion2') myChartEvaluacion2: ElementRef;
  @ViewChild('myChartEvaluacion3') myChartEvaluacion3: ElementRef;
  @ViewChild('myChartGraficaResumenRonda') myChartGraficaResumenRonda: ElementRef;
  @ViewChild('myChartGraficaResumenRondaDivOculto') myChartGraficaResumenRondaDivOculto: ElementRef;
  @ViewChild('myChartGraficaResumenRondaDivOculto2') myChartGraficaResumenRondaDivOculto2: ElementRef;


  @ViewChild('scroll') scroll: ElementRef;
  
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  private nameUser: string = sessionStorage.getItem('nombres');
  private lastNameUser: string = sessionStorage.getItem('apellidos');

  alternarSeleccionMuestrasFlag = signal<boolean>(true);
  verMuestraModal = signal<boolean>(false);
  verGraficaNueva = signal<boolean>(false);
  barrasDataResumen:string[]=[];
  ZscoreData1= signal<string[]>([]);
  ZscoreData2= signal<string[]>([]);
  listAnalytes = signal<number[]>([]);
  imageZscoreNuevo:string[]=[];
  imageZscoreNuevoConcentracion:string[]=[];
  imageZscoreTotal:string[]=[];

  selectedSection: string = 'muestra';
  rondas = [];
  programas = [];
  programasCopy = [];
  analitos = [];
  analitosCopy = [];
  
  tipoReporte = -1;
  itemSeleccionado = -1;
  
  flagViewTable = signal<boolean>(false);
  flagVisualizarInfo = signal<boolean>(false);
  flagVisualizarInfo2 = signal<boolean>(false);
  
  uniqueSample: Boolean = false;
  reporteUno = false;
  reporteDos = false;
  reporteTres = false;
  mostrarReportes = false;
  mostrarMuestras = false;
  mostrarDivOculto = signal<boolean>(false);
  tipoGeneracion = null;
  mostrarBotonExportar = false;
  formaCuantitativo: FormGroup;
  formCuantitativoReporte2: FormGroup;
  formCuantitativoReporte3: FormGroup;
  formaEvaluacion: FormGroup;
  formaSelecione: FormGroup;
  formaSelecionMuestra: FormGroup = this.fb.group({
    muestra: ['', [Validators.required]],
    /*
    tipoMuestra: ['', [Validators.required, Validators.minLength(1)]],
    condicionMuestra: ['', [Validators.required, Validators.minLength(2)]],
    calidad: ['', [Validators.required]],
    recepcion: ['', [Validators.required]],
    */
  });
  
  formStatusSample: FormGroup = this.fb.group({
    typeSample: ['', Validators.required],
    sampleConditions: ['', Validators.required],
    dateReception: ['', Validators.required],
    sampleReceived: ['', Validators.required],
    observations: ['', [Validators.minLength(3), Validators.maxLength(200)]],
  });

  analitoSeleccionado: string;
  dataListaMuestra: string;
  clienteName: string;
  clienteNit: string;
  clienteAddres: string;
  logoSource: any;
  logoSourceToPDF: string;
  programaSeleccionado = [];

  listaAnalytes = [];
  respuestaBusqueda: any;
  tablaEstadisticaGeneral = [];
  tablaEstadisticaGeneralDivOculto = [];
  valorAsignado: number;
  maximo: number;
  valoresEjex = [];
  imageEvaluacionExterna: any;
  imageEstadisticaGeneral: any;
  imageZscoreUno: any;
  imageZscoreDos: any;
  imageIndiceUno: any;
  imageIndiceDos: any;
  imageIndiceTres: any;
  imageRonda: any[] = [];
  imageDatosLaboratorio: any;
  valoresTodosResultadosEjex = [];
  valoresEquipoMetodoEjex = [];
  valoresMetodoEjex = [];
  datosEvaluacionAnalito = [];
  listaAnalitos = [];
  clientesEvaluacionMuestra = [];
  selectMuestra = [];
  listaAnalitosEvaluacion = [];
  datosClienteTable = [];
  listaResumenRonda = [];
  listaResumenRondaTable = [];
  datosClienteTableDivZscore = []
  datosClienteTableDivVasignado = [];

  datosFinRonda = [];
  datosFinRondaTabla: any = {};
  datosFinRondaConstantes = [];
  xAxis = [];

  arrConsolidadoReporeUno = [];

  // Reporte 2
  analitosFiltradosVer: any[] = [];
  dataAnalitoFiltrada: Sedes[] = [];
  dataTablaReporte2: any[] = [];
  graficasGrupalesAniltos: any[] = [];
  dataBarraReporte2: any[] = [];
  dataLineasReporte2: any[] = [];
  datosCompletosOrdenados: any[] = [];
  analitosList: any[] = [];
  analitosListCopy: any[] = [];
  equipoList: any[] = [];
  equipoListCopy: any[] = [];
  graficasReporte2: any[] = [];
  seccionSeleccionado: any = '';
  sedes: any[] = [];
  sedesCopy: any[] = [];
  itemData: any[] = [];
  datosLab: any = {};
  headerMayor: any[] = [];
  resumenMuestra: any[] = [];
  totalSamples = [];
  verifDatosResumenMuestra: any;
  countAnalitosEquipos: any;

  idUser: number = parseInt(sessionStorage.getItem('userid'));
  no_image = this.pdfService.returnNo_image;
  qc_blanco = this.pdfService.returnQc_blanco;

  ventanaModalMuestra: BsModalRef;
  ventanaModalInformativo: BsModalRef;
  viewAnalytesSample: BsModalRef;


  // Reporte 2

  cliente: any;
  numGrafica: number = 1;
  mediaMetodo = 0;
  mediaListaTodosResultados = 0;
  mediaEquipoMetodo = 0;
  myGrafica: any;
  myGraficaDiv: any;
  myGraficaDivTres: any;
  graficaEvaluacion2: any;
  graficaEvaluacion3: any;
  graficaResumenRonda: any;
  graficaResumenRonda2: any;

  graficaUnoEjemplo: any;
  graficaDosEjemplo: any;
  ejex: number = 0; 

  dd: any;
  fechaActual = dayjs().format('YYYY-MM-DD');

  verTabla: boolean = true; idSample: any[] = [];



  tituloTablasReporteDos: any[] = [
    'Red de laboratorios',
    'Programa',
    'Datos laboratorio',
    'Sistema medición/Equipo',
    'Reactivo',
    'Analito',
    'Unidades',
  ]

  // Clientes
  flagCliente: boolean = true;
  clientes: any[] = [];
  clientesCopy: any[] = [];
  ulr = this.location.path();
  participante: any = '';
  codigoparticipante: any = '';
  clienteSeleccionado: any = '';
  resumenRonda: any[] = [];
  idSampleGenerado: any;
  problemsAnalytical: any = [];

  // resumen de muestra
  dataSource: MatTableDataSource<any>;
  dataSourceMuestra: MatTableDataSource<any>;
  dataSourceAsigMuestra: MatTableDataSource<any>;
  displayedColumns: string[] = ['analito', 'analizador', 'asignacion', 'sistema_medicion'];
  //displayedColumnsMuestras: string[] = ['Muestra','asigparametros'];
  displayedColumnsMuestras: string[] = ['Muestra', 'asigparametros'];
  displayedColumnsAsigMuestra: string[] = ['analito', 'equipo', 'sistema_medicion'];
  flagMuestraPDF: number = 0;

  sistema_medicion = [{ name: 'EM' }, { name: 'M' }, { name: 'T' }];
  selectedOption = '';
  asignaciones = [{ name: 'z-score' }, { name: 'Valor asignado' },]
  allAnalytes: boolean = false
  jsonResumenMuestra: any = {
    Idprogram: 0,
    IdAnalytes: 0,
    Nroround: 0,
    Idclient: 0,
    Idsede: 0,
    idestadistica: 0,
    IdSample: 0,
    dataGenerate: false,
    DataAnalytes: [],
    resumenRonda: [],
  }

  sistemaMedicionMA = {};
  asignacion = new FormControl("");
  sistema = new FormControl("");
  borrador = new FormControl("");
  listAnalytesReport: any[] = []


  filterCliente = new FormControl('');
  filterSede = new FormControl('');
  filterPrograma = new FormControl('');
  filterEquipo = new FormControl('');
  filterAnalito = new FormControl('');
  filterAnalito2 = new FormControl('');


  formSystem: FormGroup;

  filterSamples = new FormControl();
  filteredSamples: string[] = [];

  constructor(private fb: FormBuilder,
    private programQceService: ProgramasQceService,
    private reportesExternoService: ReportesExternoService,
    private reporteCuantitativoService: ReporteCuantitativoService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private laboratoriosService: LaboratoriosService,
    private sanitizer: DomSanitizer,
    private pdfService: PdfService,
    private clientesService: ClientesService,
    private location: Location,
    private publicService: PublicService,
    private modalService: BsModalService,
    private loader:LoaderService,
    private matIconRegistry: MatIconRegistry,
    private dialog: MatDialog,
    private logsService: LogsService,
    private sharedService: SharedService,
    private router: Router,
    private AnalyticalProblemsService: AnalyticalProblemsService
  ) { 

    this.matIconRegistry.addSvgIcon("chart_line",this.sanitizer.bypassSecurityTrustResourceUrl("../assets/rutas/iconos/chart-line.svg"));
    this.matIconRegistry.addSvgIcon("table_line",this.sanitizer.bypassSecurityTrustResourceUrl("../assets/rutas/iconos/concordancia.svg"));
    this.matIconRegistry.addSvgIcon("resumen",this.sanitizer.bypassSecurityTrustResourceUrl("../assets/rutas/iconos/Rondas.svg"));
    this.matIconRegistry.addSvgIcon("chart_custom",this.sanitizer.bypassSecurityTrustResourceUrl("../assets/rutas/iconos/puntaje-score.svg"));
    this.matIconRegistry.addSvgIcon("score",this.sanitizer.bypassSecurityTrustResourceUrl("../assets/rutas/iconos/zscore.svg"));

  }

  
  @ViewChild('seleccionMuestra') seleccionMuestra: TemplateRef<any>;
  @ViewChild('modalInformativo') modalInformativo: TemplateRef<any>;
  @ViewChild('asignacionparametros') asignacionparametros: TemplateRef<any>;

  ngOnInit() {
    sessionStorage.setItem('consultaSedeExterna', '0');
    this.crearFomularioCuantitativo();
    this.crearFomularioSelccione();

    this.filtrosAutocomplete();
    this.consultarEquipos();
    this.crearFomularioCuantitativoReporte2();
    this.tipo(1);
    this.cargarGestionLab();
    this.getLogoSource();
    this.validarCliente();
    if (this.ulr.includes('reporte-cuantitativo-cliente')) {
      this.flagCliente = false;
      this.formCuantitativoReporte2.get('Nit').setValidators(null);
      this.formCuantitativoReporte2.updateValueAndValidity();
      // this.consultarProgramas();
    }

    this.sharedService.customTextPaginator(this.paginator);
    this.configurarFiltroMuestras();
  }

   selectSection(section: string): void {
    this.selectedSection = section;
  }

  private configurarFiltroMuestras(): void {
  this.filteredSamples = [...this.totalSamples];

  this.filterSamples.valueChanges.subscribe(search => {
    if (!search) {
      this.filteredSamples = [...this.totalSamples];
      return;
    }

    const filterValue = search.toLowerCase();
    this.filteredSamples = this.totalSamples.filter(sample =>
      sample.toLowerCase().includes(filterValue)
    );
  });
}



  UpdateFilterIfNecessary() {
  // Si el usuario abre el select antes de que se carguen los datos
  if (!this.filteredSamples?.length && this.totalSamples?.length) {
    this.filteredSamples = [...this.totalSamples];
    this.filterSamples.setValue('');
  }
}


  openSelecionMuestra() {
    this.verMuestraModal.set(true); 
    this.reporteUno = false; 
  }

  openModalInformativo() {
    this.ventanaModalInformativo = this.modalService.show(this.modalInformativo, { backdrop: 'static', keyboard: false, class: 'modal-lg modal-dialog-centered' });
  }

  async cargarSelects(header?: string) {
    this.clientes = await this.clientesService.getAllAsync();
    this.clientes = this.clientes.filter(z => z.header);
    this.clientesCopy = this.clientes.filter(z => z.header);
    if (header) {
      const idcliente = this.clientes.filter(x => String(x.header).toLocaleLowerCase() === String(header).toLocaleLowerCase())[0].idclient
      this.formaCuantitativo.get('idclient').setValue(idcliente)
      this.cargarSedes(this.clientes.filter(x => String(x.header).toLocaleLowerCase() === String(header).toLocaleLowerCase())[0].header);
      this.formaCuantitativo.get('idclient').setValue(this.clientes.filter(x => x.header === header)[0].idclient)
    }
  }

  cargarGestionLab() {
    this.laboratoriosService.getAllAsync().then(respuesta => {
      this.cliente = respuesta[0].header;
      this.participante = respuesta[0].name;
      this.codigoparticipante = respuesta[0].codecliente;
      if (this.ulr.includes('reporte-cuantitativo-cliente')) {
        this.formaCuantitativo.get('idclient').setValidators(null);
        this.formaCuantitativo.updateValueAndValidity();
        this.cargarSelects(this.cliente);
      } else {
        this.cargarSelects();
      }
    });
  }

  crearFomularioEvaluacion() {
    this.formaEvaluacion = this.fb.group({
      tipoFiltro: ['', [Validators.required]],
      idestadistica: ['', [Validators.required]],
    });
  }
  get tipoFiltro() {
    return this.formaEvaluacion.get('tipoFiltro');
  }
  crearFomularioSelccione() {
    this.formaSelecione = this.fb.group({
      tipoFiltro: ['', [Validators.required]],

    });
  }

  crearFomularioCuantitativo() {
    this.formaCuantitativo = this.fb.group({
      programa: ['', [Validators.required]],
      ronda: ['', [Validators.required]],
      idclient: ['', [Validators.required]],
      idsede: ['', [Validators.required]],
      analyte: ['', [Validators.required]],
      dataGenerate: [false, [Validators.required]],
    });
    this.formaCuantitativo.valueChanges.subscribe(x => {
      this.mostrarReportes = false;
      this.mostrarMuestras = false;
      this.analitoSeleccionado = '';
      this.itemSeleccionado = -1;
      this.tablaEstadisticaGeneral = [];
      this.respuestaBusqueda = null;
      this.listaAnalytes = [];
      this.datosClienteTable = [];
      this.formaEvaluacion?.reset()
      this.formaSelecione?.reset()
    })

    this.filtrar();

  }

  crearFomularioCuantitativoReporte2() {
    this.formCuantitativoReporte2 = this.fb.group({
      Idprogram: [, [Validators.required]],
      Idanalyzer: [, [Validators.required]],
      Idheadquarters: [, [Validators.required]],
      IdAnalytes: [[], [Validators.required]],
      Nit: [null, [Validators.required]]
    });

    this.formCuantitativoReporte2.valueChanges.subscribe(x => {
      this.mostrarReportes = false;
    });

      this.formCuantitativoReporte2.get('Idprogram').valueChanges.subscribe(x => {

        if(x !== null && x !== ''){
          this.reportesExternoService.getAnalitos(x).subscribe((datos: any) => {
            this.analitosList = datos;
            this.analitosListCopy = datos;
          }, _ => {
            this.analitosList = [];
            this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.NOHAYANALITOS'));
          });
        }
      });
    
  }

  consultarProgramas() {
    this.programas = [];
    this.formaCuantitativo.controls['programa'].setValue('');
    this.formaCuantitativo.controls['ronda'].setValue('');
    this.formaCuantitativo.controls['analyte'].setValue('');
    let idsede = this.formaCuantitativo.get('idsede')?.value;
    let nit = this.formCuantitativoReporte2.value.Nit;
    if ( idsede ){
      nit = this.clientes.filter(x => x.idclient === this.formaCuantitativo.get('idclient')?.value)[0].nit;
    }else{
      idsede = this.formCuantitativoReporte2.get('Idheadquarters')?.value;
    }

    this.programQceService.getProgramasPorCliente(nit, idsede).then(respuesta => {
      this.programas = [...respuesta];
      this.programasCopy = [...respuesta];
    }).catch(e => {
      this.toastr.error(e.error);
    });
  }

  consultarEquipos() {
    this.reportesExternoService.getEquipo().subscribe((x: any) => {
      this.equipoList = [...x];
      this.equipoListCopy = [...x];
    })
  }

  filtrar() {
    this.formaCuantitativo.get('programa').valueChanges.subscribe(programa => {
      this.analitos = [];
      this.rondas = [];
      this.formaCuantitativo.get('analyte').setValue('');
      this.formaCuantitativo.get('ronda').setValue('');

      if (programa !== '' && programa !== null) {
        this.reportesExternoService.getRondas(programa).subscribe((datos: any) => {
          this.rondas = datos;
        }, _ => {
          this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.NOHAYRONDAS'));
        });

        this.reportesExternoService.getAnalitos(programa).subscribe((datos: any) => {
          this.analitos = datos;
          this.analitosCopy = datos;
        }, _ => {
          this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.NOHAYANALITOS'));
        });
      }
    });
  }

  selectNone(control: string) {
    this.formaCuantitativo.get(control).setValue('');
  }
  selectAll(control: string) {
    this.formaCuantitativo.get(control).setValue(['-1']);
  }

  selectOne(control: string) {
    if(control == "ronda") this.formaCuantitativo.controls['analyte'].setValue('');
    if (this.formaCuantitativo.get(control).value[0] == '-1' || this.formaCuantitativo.get(control).value[0] == '') {
      this.formaCuantitativo.get(control).value.shift();
      this.formaCuantitativo.get(control).setValue(this.formaCuantitativo.get(control).value);
    }
  }
  
  obtenerPrograma(event) {
    if (event) {
      this.programaSeleccionado = this.programas.filter(datos => datos.IdProgram == event);
    }
  }

  async cargarSedes(id) {
    this.formaCuantitativo.controls['idsede'].setValue('');
    this.formaCuantitativo.controls['programa'].setValue('');
    this.formaCuantitativo.controls['ronda'].setValue('');
    this.formaCuantitativo.controls['analyte'].setValue('');
    let cliente = this.clientes.find(x => x.header === id);
    if (cliente) {
      this.participante = cliente.name;
      this.clienteSeleccionado = cliente
    }
    sessionStorage.setItem('consultaSedeExterna', '1');
    await this.publicService.obtenerSedesAsigProg(id).then(r => {
      this.sedes = r.filter(e => e.active);
      this.sedesCopy = r.filter(e => e.active);
      sessionStorage.setItem('consultaSedeExterna', '0');
    }, e => this.sedes = []);
  }

  organizarInformacion(item: any): boolean {
    const temporal = this.datosFinRonda.filter(x => x.Analyte === item);
    if (temporal.length === 0) {
      this.loader.hide();
      return false
    }
    this.listaResumenRondaTable = temporal;
    this.datosFinRondaTabla['zscore'] = ['Z-score', ...temporal.map(x => x.Zscore)];
    //Se comentarea el indice de desvio ya que no se esta utilizando esto por los requerimientos del mes de diciembre 2024
    //this.datosFinRondaTabla['desvio'] = ['Indice Desvío', ...temporal.map(x => x.IndiceDesv)];
    this.datosFinRondaTabla['resultado'] = ['Resultado', ...temporal.map(x => x.Resultado)];
    this.datosFinRondaTabla['media'] = ['Media', ...temporal.map(x => x.Media)];
    this.datosFinRondaTabla['ds'] = ['DS', ...temporal.map(x => x.DS)];
    this.datosFinRondaTabla['cv'] = ['CV', ...temporal.map(x => x.CV)];
    this.datosFinRondaTabla['um'] = ['UM', ...temporal.map(x => x.UM)];
    this.datosFinRondaTabla['serial'] = ['Muestra', ...temporal.map(x => x.Serialsample)];
    return true;
  }

  informacionFinRonda(data: any) {
    this.reporteCuantitativoService.finDeRonda(data).subscribe(async (res: any) => {
      this.datosFinRonda = [...res[0].Data.Analitos];
      this.datosFinRondaTabla = [];
      if (this.analitoSeleccionado) this.organizarInformacion(this.analitoSeleccionado);

    }, e => {
      this.datosFinRonda = [];
      this.datosFinRondaTabla = [];
    });
  }

  async search() {
    if (this.formaCuantitativo.valid) {
      this.obtenerPrograma(this.formaCuantitativo.value.programa);
      const idestadistica = this.formaEvaluacion?.get('idestadistica')?.value;
      const {programa,analyte,ronda,idclient,idsede,dataGenerate} = this.formaCuantitativo.value;
      let json = {
        idprogram: programa,
        idAnalytes: analyte.join(),
        nroround: ronda,
        Idclient: idclient,
        Idsede: idsede,
        idestadistica: idestadistica ? idestadistica: null,
        dataGenerate
      }

      this.loader.show();
      this.informacionFinRonda(json);
      await lastValueFrom(this.reporteCuantitativoService.getDatos(json)).then(async res => {
        if (res[0].Data.length > 0) {
          this.mostrarReportes = true;
          this.respuestaBusqueda = res;
          const analytes = res[0].Data;
          this.resumenRonda = res[0].Evaluacion.resumenronda;
          this.listaAnalytes = await this.filtrarAnalytes(analytes);
        } else {
          this.loader.hide();
          this.toastr.info('No se encontraron datos');
          return;
        }

        this.loader.hide();
      }).catch(error => {
        this.loader.hide();
        this.toastr.error(error.error);
        return;
      });
    } else {
      this.toastr.error('Todos los campos deben ser llenados');
      return;
    }
  }

  tipo(tipo: number) {
    this.reporteUno = false;
    this.reporteDos = false;
    this.reporteTres = false;
    this.mostrarReportes = false;
    this.mostrarBotonExportar = false;
    this.dataTablaReporte2 = [];
    this.graficasReporte2 = [];
    this.dataBarraReporte2 = [];

    this.flagVisualizarInfo.set(false);
    this.flagVisualizarInfo2.set(false);

    this.dataLineasReporte2 = [];
    this.datosCompletosOrdenados = [];
    this.seccionSeleccionado = '';
    this.formCuantitativoReporte2.reset();
    this.formaCuantitativo.reset();
    this.itemSeleccionado = 0;

    if (this.ulr.includes('reporte-cuantitativo-cliente')) {
      this.cargarSelects(this.cliente);
    } else { this.sedes = [] }

    switch (tipo) {
      case 1:
        this.reporteUno = true;
        this.tipoReporte = 1;
        break;
      case 2:
        this.reporteDos = true;
        this.tipoReporte = 2;

        break;
      case 3:
        this.reporteTres = true;
        this.tipoReporte = 3;

        break;

      default:
        this.reporteUno = false;
        this.reporteDos = false;
        this.reporteTres = false;
        break;
    }
  }

  setItem(item: number): void {
    this.numGrafica = item;
    this.datosClienteTable = [];
    this.mostrarDivOculto.set(false);
    this.formaEvaluacion.reset();
    this.formaSelecione.reset();
    this.mostrarMuestras = false;

    if (this.analitoSeleccionado === '') {
      this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.NOANALITO'));
      return;
    }

    this.itemSeleccionado = item;

    if (item === 1) {
      this.crearFomularioEvaluacion();
    }
    if (item === 2) {
      this.estadisticaGeneral();
    }
    if (item === 3) {
      this.resumenRondaData();
    }
    if (item === 4) {
      if (!this.organizarInformacion(this.analitoSeleccionado)) {
        this.toastr.error('No se encontro información del analito');
        return
      }
    }
  }

  reporteDosSeleccionar(item: number) {
    this.itemSeleccionado = item;
  }

  reiniciarCampos(value:string,caso:number){
    this.ZscoreData1.set([]);
    this.ZscoreData2.set([]);
    if(caso === 1){
      this.mostrarDivOculto.set(false);
      this.formaEvaluacion.reset({tipoFiltro:value});
      this.mostrarMuestras = false;
      this.formaSelecione.reset();
    }else{
      let tipo = this.formaEvaluacion.get('tipoFiltro')?.value;
      this.mostrarDivOculto.set(false);
      this.formaEvaluacion.reset({tipoFiltro:tipo,idestadistica:value});
      this.formaSelecione.reset();
    }
  }

  graficaIndividualPuntosZscore(){
    
    const muestra = this.formaSelecione.get('tipoFiltro')?.value;
    
    if (!muestra) return
    let graficaZscoreVar: any[] = this.respuestaBusqueda[0].Evaluacion.Analitos;
    
    this.ZscoreData1.set([]);
    this.ZscoreData2.set([]);


    this.clientesEvaluacionMuestra = graficaZscoreVar.filter(x => x.Analyte=== this.analitoSeleccionado && x.Serialsample === muestra)
    
    let graficaZscore:any[] = graficaZscoreVar.map(x => {
      if (x.Analyte === this.analitoSeleccionado && x.Serialsample === muestra) {
        if( x.Zscore >= 2 || x.Zscore <= -2){
          return {
            value: [x.ValueEjex, x.Zscore],
            itemStyle: {
              color: "red"
            }
          }
        }
        return [x.ValueEjex, x.Zscore]
      };
    }).filter(x => x !== undefined);

    let zScoreConcentracion:any[] = graficaZscoreVar.map(x => {
      if (x.Analyte === this.analitoSeleccionado && x.Serialsample === muestra) {
        if( x.Zscore > 2 || x.Zscore < -2){
          return {
            value: [x.Resultado, x.Zscore],
            itemStyle: {
              color: "red"
            }
          }
        }
        return [x.Resultado, x.Zscore];
      };
    }).filter(x => x !== undefined);

    if(graficaZscore.length === 0 || zScoreConcentracion.length === 0) {
      this.toastr.error('No se encontro información del analito');
      this.loader.hide();
      return
    }

    this.ZscoreData1.set(graficaZscore);
    this.ZscoreData2.set(zScoreConcentracion); 
    this.loader.hide();
  }

  async estadisticaGeneral(){
    const analito =  this.analitoSeleccionado;
    const datosMetodo = this.respuestaBusqueda[0].Estadistica.Metodo;
    const equipoMetodo = this.respuestaBusqueda[0].Estadistica.EquipoMetodo;
    const todosResultados = this.respuestaBusqueda[0].Estadistica.TodosResultados;

    let listaMetodos = await this.promesaEstadistica(datosMetodo, analito);
    let listaEquipoMetodo = await this.promesaEstadistica(equipoMetodo, analito);
    let listaTodosResultados = await this.promesaEstadistica(todosResultados, analito);

    this.tablaEstadisticaGeneral = [listaMetodos, listaEquipoMetodo, listaTodosResultados];

    this.valoresEjex = await this.ValoresEjex(listaTodosResultados);

  }

  async resumenRondaData(){
    let graficaZscoreVar: any[] = this.respuestaBusqueda[0].Evaluacion.Analitos;
    this.listaResumenRonda = graficaZscoreVar.filter(x => x.Analyte === this.analitoSeleccionado);
  }

  async obtenerDatosCliente(muestrax?: string) {
    this.loader.show();
    this.mostrarDivOculto.set(true);
    await this.search();
    this.graficaIndividualPuntosZscore();
    this.loader.hide();
    //const datos = this.listaAnalitosEvaluacion.filter(datos => datos.Name === this.cliente);
    // const datos = this.listaAnalitosEvaluacion;
    // this.datosClienteTable = datos.filter(datos => datos.Serialsample === muestra);
    // setTimeout(() => {
    //   this.graficoTres();
    //   this.graficoCuatro();
    //   if (this.tipoFiltro.value === '2') {
    //     this.z();
    //   }
    // }, 1000);
  }

  tipoOpcion() {
    this.mostrarMuestras = true;
  }



  async buscarAnalitos(analito: string, muestra?: string, consolidado: boolean = false) {

    if (!this.organizarInformacion(analito)) {
      this.toastr.error('No se encontro información del analito');
      return
    }
    let graficaZscoreVar: any[] = this.respuestaBusqueda[0].Evaluacion.Analitos;
    
    this.selectMuestra = graficaZscoreVar
                        .filter(item => item.Analyte === analito)
                        .reduce((acc, item) => {
                          if (!acc.some(e => e.Serialsample === item.Serialsample)) {
                            acc.push(item);
                          }
                          return acc;
                        }, []);

    this.crearFomularioEvaluacion();
    this.mostrarDivOculto.set(false);
    this.formaEvaluacion?.reset();
    this.formaSelecione?.reset();
    this.mostrarMuestras = false;
    this.analitoSeleccionado = analito;
    const dataEvaluacion:any[] = this.respuestaBusqueda[0].Evaluacion.Analitos;
    this.totalSamples = [...new Set(dataEvaluacion.map(x=>x.Serialsample))];
    const objSourceMuestra:any[]= [];
    dataEvaluacion.map(x =>{
      if(!objSourceMuestra.find(y => x.Serialsample === y.Serialsample)){
        objSourceMuestra.push({Serialsample:x.Serialsample,idSample:x.idSample, nroSample: x.nroSample, statisticalGeneral:x.statisticalGeneral})
      }
    });
    
    this.dataSourceMuestra = new MatTableDataSource<any>(JSON.parse(JSON.stringify(objSourceMuestra.map(x => {x.statisticalGeneral = null;return x;}))));
    this.itemSeleccionado = 1;
    return

    this.tablaEstadisticaGeneral = [];
    this.tablaEstadisticaGeneralDivOculto = [];
    this.valorAsignado = 0;

    // const datosMetodo = this.respuestaBusqueda[0].Estadistica.Metodo;
    // const equipoMetodo = this.respuestaBusqueda[0].Estadistica.EquipoMetodo;
    // const todosResultados = this.respuestaBusqueda[0].Estadistica.TodosResultados;
    const data = this.respuestaBusqueda[0].Data;
    // const dataEvaluacion:any[] = this.respuestaBusqueda[0].Evaluacion.Analitos;


    this.totalSamples = [...new Set(dataEvaluacion.map(x=>x.Serialsample))];
    this.idSample = data;

    // let listaMetodos = await this.promesaEstadistica(datosMetodo, analito);
    // let listaEquipoMetodo = await this.promesaEstadistica(equipoMetodo, analito);
    // let listaTodosResultados = await this.promesaEstadistica(todosResultados, analito);
    this.listaAnalitosEvaluacion = await this.promesaEstadistica(dataEvaluacion, analito);
    // if (listaMetodos.length === 0 || listaEquipoMetodo.length === 0 ||
    //   listaTodosResultados.length === 0 || this.listaAnalitosEvaluacion.length === 0) {
    //   this.toastr.error('No se encontro información del analito');
    //   this.loader.hide();
    //   this.itemSeleccionado = 1;
    //   return
    // }


    // this.listaResumenRonda = await this.promesaListaResumenRonda(this.listaAnalitosEvaluacion, listaEquipoMetodo);

    this.listaAnalitos = await this.promesaAnalitosData(data, analito);
    this.dataListaMuestra = await this.promesaListaMuestra(this.listaAnalitos);
    this.datosEvaluacionAnalito = await this.promesaAnalitoEvaluacion(dataEvaluacion, analito);
    this.clientesEvaluacionMuestra = await this.clientesAnalitoEvaluacionMuestra(this.listaAnalitosEvaluacion);

    // if (listaMetodos.length === 0) {
    //   listaMetodos = [{
    //     Analyte: "0",
    //     CV: 0,
    //     Comments: "0",
    //     DS: 0,
    //     Metodo: "0",
    //     ReceptionDate: "0",
    //     SampleCondition: "",
    //     Um: 0,
    //     ValorAsignado: 0,
    //     media: 0,
    //     participantes: 0
    //   }]
    // }
    // if (listaEquipoMetodo.length === 0) {
    //   listaEquipoMetodo = [{
    //     Analyte: "0",
    //     CV: 0,
    //     Comments: "0",
    //     DS: 0,
    //     Metodo: "0",
    //     ReceptionDate: "0",
    //     SampleCondition: "",
    //     Um: 0,
    //     ValorAsignado: 0,
    //     media: 0,
    //     participantes: 0
    //   }]
    // }
    // if (listaTodosResultados.length === 0) {
    //   listaTodosResultados = [{
    //     Analyte: "0",
    //     CV: 0,
    //     Comments: "0",
    //     DS: 0,
    //     Metodo: "0",
    //     ReceptionDate: "0",
    //     SampleCondition: "",
    //     Um: 0,
    //     ValorAsignado: 0,
    //     media: 0,
    //     participantes: 0
    //   }]
    // }

    // this.valorAsignado = listaTodosResultados[0].ValorAsignado;
    // this.mediaEquipoMetodo = listaMetodos[0].media;
    // this.mediaMetodo = listaEquipoMetodo[0].media;
    // this.mediaListaTodosResultados = listaTodosResultados[0].media;
    // this.maximo = listaTodosResultados[0].participantes;

    // this.tablaEstadisticaGeneral = [listaMetodos, listaEquipoMetodo, listaTodosResultados];
    // this.tablaEstadisticaGeneralDivOculto = this.tablaEstadisticaGeneral;
    // this.valoresEjex = await this.ValoresEjex(listaTodosResultados);
    // this.valoresTodosResultadosEjex = listaTodosResultados[0].Data_resultALL;
    // this.valoresEquipoMetodoEjex = listaEquipoMetodo[0].Data_resultEM;
    // this.valoresMetodoEjex = listaMetodos[0].Data_result;
    this.setItem(this.numGrafica);
    setTimeout(async () => {
      await this.graficoDosDiv();
      this.obtenerDatosClienteDiv(muestra, consolidado);
    }, 1500);
    await new Promise(() => {
      setTimeout(() => {
        this.mostrarBotonExportar = true;
      }, 1500);
    })

  }
  async promesaEstadistica(newData, analito) {
    const ar = newData.filter(datos => datos.Analyte === analito);
    return ar;
  }
  async promesaListaResumenRonda(listaAnalitosEvaluacion, listaEquipoMetodo) {
    //Por duplicidad de datos solo se filtra por lista de analitos de evaluación y no por lista equipo metodo.
    const ar = [];
      listaAnalitosEvaluacion.forEach(evaluacion => {
        ar.push({
          Serialsample: evaluacion.Serialsample,
          Resultado: evaluacion.Resultado,
          media: evaluacion.Media,
          DS: evaluacion.DS,
          CV: evaluacion.CV,
          Um: evaluacion.UM,
          IndiceDesv: evaluacion.IndiceDesv,
          Zscore: evaluacion.Zscore,
          statisticalGeneral: evaluacion.statisticalGeneral
        });
      });
    return ar;
  }
  async clientesAnalitoEvaluacionMuestra(newData) {
    const datosAnalitoEvaluacion = [];
    //const ar = newData.filter(datos => datos.Name === this.cliente);
    const ar = newData;
    ar.forEach(element => {
      datosAnalitoEvaluacion.push(element.Serialsample);
    });
    return datosAnalitoEvaluacion;
  }
  async promesaAnalitoEvaluacion(newData, analito) {
    const datosAnalitoEvaluacion = [];
    let ar = newData.filter(datos => datos.Analyte === analito);
    ar.forEach(element => {
      datosAnalitoEvaluacion.push(element.Resultado);
    });
    return datosAnalitoEvaluacion;
  }
  async promesaAnalitosData(newData, analito) {
    const ar = newData.filter(datos => datos.desAnalytes === analito);
    return ar;
  }
  async promesaListaMuestra(data) {
    let ar: string = '';
    data.forEach(element => {
      ar += element.serialSample + ',';
    });
    return ar;
  }
  async filtrarAnalytes(newData) {
    const ar = [];
    newData.forEach(item => {
      ar.push(item.desAnalytes);
    });

    const dataArr = new Set(ar);
    let result = [...dataArr];

    return result;
  }
  async filtrarEquipoMetodo(newData) {
    const ar = [];
    newData.forEach(item => {
      let separado = item.EquipoMetodo.split("-");
      ar.push(separado[0].trim());
    });

    const dataArr = new Set(ar);
    let result = [...dataArr];

    return result;
  }
  graficoTres() {
    
    var xyValues = [{
      x: this.datosClienteTable[0].ValueEjex,
      y: this.tipoFiltro.value === '2' ? this.datosClienteTable[0].IndiceDesv : this.datosClienteTable[0].Zscore
    },];
    this.canvas = this.mychart.nativeElement;
    this.ctx = this.canvas.getContext('2d');

    if (this.myGrafica) {
      this.myGrafica.destroy();
    }

    this.myGrafica = new Chart(this.ctx, {
      type: "scatter",
      data: {
        datasets: [{
          pointRadius: 4,
          pointBackgroundColor: (context) => {
            if (this.tipoFiltro.value === '2') {
              if (context.parsed.y > 1 || context.parsed.y < -1) {
                return 'red';
              } else if (context.parsed.y <= 1 && context.parsed.y >= -1 && context.parsed.y != 0) {
                return '#25d366';
              }

              return '#000000';
            } else {
              if (context.parsed.y > 2 || context.parsed.y < -2) {
                return 'red';
              } else if (context.parsed.y <= 2 && context.parsed.y >= -2 && context.parsed.y != 0) {
                return '#25d366';
              }

              return '#000000';
            }

          },
          data: xyValues
        }]
      },
      options: {
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: this.tipoFiltro.value === '2' ? 'Indice desvío' : 'Zscore'
          },
          subtitle: {
            display: true,
            text: this.datosClienteTable[0].Resultado,
            color: 'blue',
            padding: {
              bottom: 10
            }
          }
        },

        scales: {
          
          x: {
            beginAtZero: true,
            max: this.datosClienteTable[0].DataEjex,
            grid: {
              display: true,
              // drawBorder: true,
              drawOnChartArea: true,
              drawTicks: true,
              
              // color: '#000000'
            },
            title: {
              display: true,
              text: 'Muestra',
              align:'center'
            }
          },
          y: {
            max: 3,
            min: -3,
            grid: {
              // drawBorder: false,
              color: (context) => {
                if (this.tipoFiltro.value === '2') {
                  if (context.tick.value > 1 || context.tick.value < -1) {
                    return 'blue';
                  } else if (context.tick.value <= 1 && context.tick.value >= -1 && context.tick.value != 0) {
                    return 'red';
                  }

                  return '#000000';
                } else {
                  if (context.tick.value > 2 || context.tick.value < -2) {
                    return 'blue';
                  } else if (context.tick.value === 2 || context.tick.value === -2) {
                    return 'red';
                  }

                  return '#000000';
                }

              },
            }
          }
        }
      }
    });
  }
  graficoCuatro() {
    var xyValues = [{
      x: Number(this.datosClienteTable[0].Resultado),
      y: this.tipoFiltro.value === '2' ? this.datosClienteTable[0].IndiceDesv : this.datosClienteTable[0].Zscore
    },];
    this.canvas = this.myChartEvaluacion2.nativeElement;
    this.ctx = this.canvas.getContext('2d');

    if (this.graficaEvaluacion2) {
      this.graficaEvaluacion2.destroy();
    }

    this.graficaEvaluacion2 = new Chart(this.ctx, {
      type: "scatter",
      data: {
        datasets: [{
          pointRadius: 4,
          pointBackgroundColor: (context) => {
            if (this.tipoFiltro.value === '2') {
              if (context.parsed.y > 1 || context.parsed.y < -1) {
                return 'red';
              } else if (context.parsed.y <= 1 && context.parsed.y >= -1 && context.parsed.y != 0) {
                return '#25d366';
              }

              return '#000000';
            } else {
              if (context.parsed.y > 2 || context.parsed.y < -2) {
                return 'red';
              } else if (context.parsed.y <= 2 && context.parsed.y >= -2 && context.parsed.y != 0) {
                return '#25d366';
              }

              return '#000000';
            }

          },
          data: xyValues
        }]
      },
      options: {
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: this.tipoFiltro.value === '2' ? 'Indice de Desvío /Concentración' : 'Z-score Concentración'
          },
          subtitle: {
            display: true,
            text: this.datosClienteTable[0].Resultado,
            color: 'blue',
            padding: {
              bottom: 10
            }
          }
        },

        scales: {
          x: {
            beginAtZero: true,
            max: this.tipoFiltro.value === '2' ? this.datosClienteTable[0].Resultado + 15 : Math.trunc(this.datosClienteTable[0].Resultado + 15),
            grid: {
              display: true,
              // drawBorder: true,
              drawOnChartArea: true,
              drawTicks: true,
              // color: '#000000'
            },
            title: {
              display: true,
              text: `Concentración`,
              align:'center'
            },
          },
          y: {
            max: 3,
            min: -3,
            grid: {
              // drawBorder: false,
              color: (context) => {
                if (this.tipoFiltro.value === '2') {
                  if (context.tick.value > 1 || context.tick.value < -1) {
                    return 'blue';
                  } else if (context.tick.value <= 1 && context.tick.value >= -1 && context.tick.value != 0) {
                    return 'red';
                  }

                  return '#000000';
                } else {
                  if (context.tick.value > 2 || context.tick.value < -2) {
                    return 'blue';
                  } else if (context.tick.value === 2 || context.tick.value === -2) {
                    return 'red';
                  }

                  return '#000000';
                }

              },
            }
          }
        }
      }
    });
  }
  z() {
    var xyValues = [{
      x: 1,
      y: this.datosClienteTable[0].Desvio
    },];
    this.canvas = this.myChartEvaluacion3.nativeElement;
    this.ctx = this.canvas.getContext('2d');

    if (this.graficaEvaluacion3) {
      this.graficaEvaluacion3.destroy();
    }

    this.graficaEvaluacion3 = new Chart(this.ctx, {
      type: "scatter",
      data: {
        datasets: [{
          pointRadius: 4,
          pointBackgroundColor: function (context) {

            if (context.parsed.y > 1 || context.parsed.y < -1) {
              return 'red';
            } else if (context.parsed.y <= 1 && context.parsed.y >= -1 && context.parsed.y != 0) {
              return '#25d366';
            }

            return '#000000';
          },
          data: xyValues
        }]
      },
      options: {
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: '% Desvío'
          },
          subtitle: {
            display: true,
            text: this.datosClienteTable[0].Desvio,
            color: 'blue',
            padding: {
              bottom: 10
            }
          }
        },

        scales: {
          x: {
            beginAtZero: true,
            max: Math.trunc(this.datosClienteTable[0].Desvio + 15),
            grid: {
              display: true,
              // drawBorder: true,
              drawOnChartArea: true,
              drawTicks: true,
              // color: '#000000'
            }
          },
          y: {
            max: this.datosClienteTable[0].Desvio + 15,
            min: -this.datosClienteTable[0].Desvio - 15,
            grid: {
              // drawBorder: false,
              color: (context) => {
                if (context.tick.value === this.datosClienteTable[0].DesvAceptable || context.tick.value === -this.datosClienteTable[0].DesvAceptable) {
                  return 'red';
                } else if (context.tick.value > this.datosClienteTable[0].DesvAceptable || context.tick.value < -this.datosClienteTable[0].DesvAceptable) {
                  return 'blue';
                }

                return '#000000';
              },
            }
          }
        }
      }
    });
  }
  graficoDos() {
    const arrayTR = [];
    const arrayEM = [];
    const arrayM = [];

    const arrayTodosResultados = [];
    const arrayEquipoMetodo = [];
    const arrayMetodo = [];

    this.valoresTodosResultadosEjex.forEach((element, index) => {
      arrayTR.push(element.Result);
    });
    this.valoresEquipoMetodoEjex.forEach((element, index) => {
      arrayEM.push(element.Result);
    });
    this.valoresMetodoEjex.forEach((element, index) => {
      arrayM.push(element.Result);
    });

    console.log(arrayTR);
    console.log(arrayEM);
    console.log(arrayM);
    


    this.valoresEjex.forEach((element, index) => {
      let res = arrayTR.includes(element.toString());
      if (res) {
        let resultado = this.buscarCantidadResultados(this.listaAnalitos, element);
        arrayTodosResultados.push(resultado);
      } else {
        arrayTodosResultados.push(0);
      }
    });
    this.valoresEjex.forEach((element, index) => {
      let res = arrayEM.includes(element.toString());
      if (res) {
        let resultado = this.buscarCantidadResultados(this.listaAnalitos, element);
        arrayEquipoMetodo.push(resultado);
      } else {
        arrayEquipoMetodo.push(0);
      }
    });
    this.valoresEjex.forEach((element, index) => {
      let res = arrayM.includes(element.toString());
      if (res) {
        let resultado = this.buscarCantidadResultados(this.listaAnalitos, element);
        arrayMetodo.push(resultado);
      } else {
        arrayMetodo.push(0);
      }
    });
    const arrayAnalito = [];
    this.listaAnalitos.forEach((element, index) => {

      arrayAnalito.push(element.result);

    });

    this.canvas = this.mychart.nativeElement;
    this.ctx = this.canvas.getContext('2d');

    if (this.myGrafica) {
      this.myGrafica.destroy();
    }

    console.log(arrayTodosResultados);
    console.log(arrayEquipoMetodo);
    console.log(arrayMetodo);
    

    this.myGrafica = new Chart(this.ctx, {
      type: 'bar',
      data: {
        datasets: [{
          label: 'Todos los resultados',
          data: arrayTodosResultados,
          backgroundColor: "#E8BC5B",
          borderColor: "#E8BC5B",
        },
        {
          label: 'Equipo- Método',
          data: arrayEquipoMetodo,
          backgroundColor: "#3ac47d",
          borderColor: "#3ac47d"
        },
        {
          label: 'Método',
          data: arrayMetodo,
          backgroundColor: "#007bff",
          borderColor: "#007bff"
        },

        ],
        labels: this.valoresEjex

      },
      options: {
        plugins: {
          legend: {
            display: false,

          },
        },
        scales: {
          x: {
            stacked: true,
            beginAtZero: true,
            offset: true,
            grid: {
              display: false
            },
            title: {
              display: true,
              text: `Concentraciones`,
            },
            ticks: {
              color: (context) => {
                let numero = context.tick.label;
                let n = Number(numero);
                if (n === this.mediaListaTodosResultados) {
                  return '#007bff';
                }
                return '#000000';
              }
            }
          },
          y: {
            stacked: true,
            max: this.maximo,
            title: {
              display: true,
              text: `Participantes (${this.maximo})`,
            }
          }
        }
      }
    });

  }
  graficoSeis() {

    let idMenor = 0,
      zscoreMenor = 0,
      idMayor = 0,
      zscoreMayor = 0;
    let datosGraficaSeis = [];
    this.listaResumenRonda.forEach(element => {
      if (element.IndiceDesv < 1) {
        idMenor++;
      } else if (element.IndiceDesv > 1) {
        idMayor++;
      }
      if (element.Zscore < 2) {
        zscoreMenor++;
      } else if (element.Zscore > 2) {
        zscoreMayor++;
      }
    });
    datosGraficaSeis.push(idMenor, zscoreMenor, idMayor, zscoreMayor, this.listaResumenRonda.length)
    this.canvas = this.myChartGraficaResumenRonda.nativeElement;
    this.ctx = this.canvas.getContext('2d');

    if (this.graficaResumenRonda) {
      this.graficaResumenRonda.destroy();
    }

    this.graficaResumenRonda = new Chart(this.ctx, {

      type: 'bar',
      data: {
        datasets: [{
          data: datosGraficaSeis,
          backgroundColor: ["#42ab49", "#77dd77", "#c63637", "#ff6961", "#888a8a"],
          borderColor: ["#42ab49", "#77dd77", "#c63637", "#ff6961", "#888a8a"]
        }

        ],
        labels: ['< 1', 'Z-score < 2', '> 1', 'Z-score > 2', 'Total']

      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: 'Resumen Ronda 1 Índice de Desvío'
          },
        },
        scales: {
          x: {
            stacked: false,
            beginAtZero: true,
            offset: true,
            grid: {
              display: false
            },
            ticks: {
              font: {
                size: 11
              }
            }
          },
          y: {
            stacked: false,
            grid: {
              // drawBorder: true,
            }
          }
        }
      }
    });
  }
  async ValoresEjex(listaDatos) {

    let mediaMas = listaDatos[0].media;
    let mediaMenos = listaDatos[0].media;

    const desviacion = listaDatos[0].DS;
    const vueltas = [...Array(2)]
    let nuevoArray = [mediaMas];
    this.listaAnalitos.forEach(element => {
      nuevoArray.push(Number(element.result));
    });
    vueltas.forEach(element => {
      mediaMas = desviacion + mediaMas;
      nuevoArray.push(mediaMas.toFixed(1));
    });

    vueltas.forEach(element => {
      mediaMenos = mediaMenos - desviacion;
      if (mediaMenos >= 0) {
        nuevoArray.push(mediaMenos.toFixed(1));
      }
    });
    const dataArr = new Set(nuevoArray);
    let result = [...dataArr];

    result.sort(function (a, b) {
      return a - b;
    });

    return result;
  }

  public scrollCards(flow: number): void {
    this.scroll.nativeElement.scrollLeft += (136.1 * flow);
  }

  validarRepetidos(array) {
    return new Set(array).size !== array.length;
  }

  buscarCantidadResultados(listaAnalitos, element) {

    const ar = listaAnalitos.filter(datos => datos.result === element.toString());
    return ar.length;

  }

  

  getLogoSource() {
    this.laboratoriosService.getLogoImage()
      .subscribe(logo => {

        this.logoSource = this.sanitizer.bypassSecurityTrustResourceUrl(`data:image/jpg;base64,${logo}`);
        this.logoSourceToPDF = `data:image/jpg;base64,${logo}`;
        
        if (logo == "") {
          this.logoSourceToPDF = 'data:image/jpg;base64,' + this.no_image;
        }
      });
  }

  validarCliente() {

    this.laboratoriosService.getAllAsync().then(lab => {
      //console.log(lab);
      this.datosLab['name'] = lab[0].name;
      this.datosLab['nit'] = lab[0].nit;
      this.datosLab['addres'] = lab[0].addres;
      this.clienteName = lab[0].name;
      this.clienteNit = lab[0].nit;
      this.clienteAddres = lab[0].addres;

    });

  }
  async graficoDosDiv() {
    const arrayTR = [];
    const arrayEM = [];
    const arrayM = [];

    const arrayTodosResultados = [];
    const arrayEquipoMetodo = [];
    const arrayMetodo = [];


    await new Promise((res, e) => {
      this.valoresTodosResultadosEjex.forEach((element, index) => {
        arrayTR.push(element.Result);
      });
      this.valoresEquipoMetodoEjex.forEach((element, index) => {
        arrayEM.push(element.Result);
      });
      this.valoresMetodoEjex.forEach((element, index) => {
        arrayM.push(element.Result);
      });

      this.valoresEjex.forEach((element, index) => {
        let res = arrayTR.includes(element.toString());
        if (res) {
          let resultado = this.buscarCantidadResultados(this.listaAnalitos, element);
          arrayTodosResultados.push(resultado);
        } else {
          arrayTodosResultados.push(0);
        }
      });
      this.valoresEjex.forEach((element, index) => {
        let res = arrayEM.includes(element.toString());
        if (res) {
          let resultado = this.buscarCantidadResultados(this.listaAnalitos, element);
          arrayEquipoMetodo.push(resultado);
        } else {
          arrayEquipoMetodo.push(0);
        }
      });
      this.valoresEjex.forEach((element, index) => {
        let res = arrayM.includes(element.toString());
        if (res) {
          let resultado = this.buscarCantidadResultados(this.listaAnalitos, element);
          arrayMetodo.push(resultado);
        } else {
          arrayMetodo.push(0);
        }
      });
      const arrayAnalito = [];
      this.listaAnalitos.forEach((element, index) => {

        arrayAnalito.push(element.result);

      });

      this.canvas = this.mychartDiv.nativeElement;
      this.ctx = this.canvas.getContext('2d');

      if (this.myGraficaDiv) {
        this.myGraficaDiv.destroy();
      }

      this.myGraficaDiv = new Chart(this.ctx, {
        type: 'bar',
        data: {
          datasets: [{
            label: 'Todos los resultados',
            data: arrayTodosResultados,
            backgroundColor: "#E8BC5B",
            borderColor: "#E8BC5B"
          },
          {
            label: 'Equipo- Método',
            data: arrayEquipoMetodo,
            backgroundColor: "#3ac47d",
            borderColor: "#3ac47d"
          },
          {
            label: 'Método',
            data: arrayMetodo,
            backgroundColor: "#007bff",
            borderColor: "#007bff"
          },

          ],
          labels: this.valoresEjex

        },
        options: {
          animation: {
            onComplete: () => {
              this.imageEstadisticaGeneral = this.myGraficaDiv.toBase64Image();

            }
          },
          plugins: {
            legend: {
              display: false,

            },
          },
          scales: {
            x: {
              stacked: true,
              beginAtZero: true,
              offset: true,
              grid: {
                display: false
                // color: '#000000'
              },
              title: {
                display: true,
                text: `Concentración`,
                align:'center'
              },
              ticks: {
                color: (context) => {
                  let numero = context.tick.label;
                  let n = Number(numero);
                  if (n === this.mediaListaTodosResultados) {
                    return '#007bff';
                  }
                  return '#000000';
                }
              }
            },
            /*x2: {
              labels: this.valoresTodosResultadosEjex,
              offset: true,
              ticks: {
                color: (context) => {
                  let numero =context.tick.label;
                  let n =Number(numero);
                  if (n === this.mediaListaTodosResultados) {
                    return '#E8BC5B';
                  } else {
                    return '#000000';
                  }
                }
             }
            },*/
            y: {
              stacked: true,
              max: this.maximo,
              grid: {
                // drawBorder: true,
              },
              title: {
                display: true,
                text: `Participantes (${this.maximo})`,
              }
            }
          }
        }
      });

      res(this.myGraficaDiv);
    }).then(x => {
    })
  }

  graficoTresDiv(muestra?: string) {

    let xyValues: any;
    if (!muestra) {
      xyValues = [{
        x: 1,
        y: this.datosClienteTableDivVasignado[0].IndiceDesv
      },];
    } else {
      xyValues = [{
        x: 1,
        y: this.datosClienteTableDivVasignado.filter(x => x.Serialsample === muestra)[0].IndiceDesv
      },];
    }


    this.canvas = this.mychartDivTres.nativeElement;
    this.ctx = this.canvas.getContext('2d');

    if (this.myGraficaDivTres) {
      this.myGraficaDivTres.destroy();
    }

    this.myGraficaDivTres = new Chart(this.ctx, {
      type: "scatter",
      data: {
        datasets: [{
          pointRadius: 4,
          pointBackgroundColor: (context) => {

            if (context.parsed.y > 1 || context.parsed.y < -1) {
              return 'red';
            } else if (context.parsed.y <= 1 && context.parsed.y >= -1 && context.parsed.y != 0) {
              return '#25d366';
            }

            return '#000000';


          },
          data: xyValues
        }]
      },
      options: {
        animation: {
          onComplete: () => {
            this.imageIndiceUno = this.myGraficaDivTres.toBase64Image();
          }
        },
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: 'Indice desvío'
          },
        },

        scales: {
          x: {
            beginAtZero: true,
            max: 5,
            grid: {
              display: true,
              // drawBorder: true,
              drawOnChartArea: true,
              drawTicks: true,
              // color: '#000000'
            },
            title: {
              display: true,
              text: `Muestra`,
              align:'center'
            },
          },
          y: {
            max: 3,
            min: -3,
            grid: {
              // drawBorder: false,
              color: (context) => {

                if (context.tick.value > 1 || context.tick.value < -1) {
                  return 'blue';
                } else if (context.tick.value <= 1 && context.tick.value >= -1 && context.tick.value != 0) {
                  return 'red';
                }

                return '#000000';


              },
            }
          }
        }
      }
    });
  }

  graficoCuatroDiv(muestra?: string) {

    let xyValues: any;
    if (!muestra) {
      xyValues = [{
        x: Number(this.datosClienteTableDivVasignado[0].Resultado),
        y: this.datosClienteTableDivVasignado[0].IndiceDesv
      },];
    } else {
      xyValues = [{
        x: Number(this.datosClienteTableDivVasignado.filter(x => x.Serialsample === muestra)[0].Resultado),
        y: this.datosClienteTableDivVasignado.filter(x => x.Serialsample === muestra)[0].IndiceDesv
      },];
    }
    this.canvas = this.myChartEvaluacion2DivOculto.nativeElement;
    this.ctx = this.canvas.getContext('2d');

    if (this.graficaEvaluacion2) { this.graficaEvaluacion2.destroy(); }

    this.graficaEvaluacion2 = new Chart(this.ctx, {
      type: "scatter",
      data: {
        datasets: [{
          pointRadius: 4,
          pointBackgroundColor: (context) => {

            if (context.parsed.y > 1 || context.parsed.y < -1) {
              return 'red';
            } else if (context.parsed.y <= 1 && context.parsed.y >= -1 && context.parsed.y != 0) {
              return '#25d366';
            }

            return '#000000';


          },
          data: xyValues
        }]
      },
      options: {
        animation: {
          onComplete: () => {
            this.imageIndiceDos = this.graficaEvaluacion2.toBase64Image();
          }
        },
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: 'Indice de Desvío /Concentración'
          },
        },

        scales: {
          x: {
            beginAtZero: true,
            max: xyValues[0].y + 5,
            grid: {
              display: true,
              // drawBorder: true,
              drawOnChartArea: true,
              drawTicks: true,
              // color: '#000000'
            },
            title: {
              display: true,
              text: `Concentración`,
              align:'center'
            },

          },
          y: {
            max: 3,
            min: -3,
            grid: {
              // drawBorder: false,
              color: (context) => {

                if (context.tick.value > 1 || context.tick.value < -1) {
                  return 'blue';
                } else if (context.tick.value <= 1 && context.tick.value >= -1 && context.tick.value != 0) {
                  return 'red';
                }

                return '#000000';


              },
            }
          }
        }
      }
    });
  }

  zDiv(muestra?: string) {

    let xyValues: any;
    if (!muestra) {
      xyValues = [{
        x: 1,
        y: this.datosClienteTableDivVasignado[0].Desvio
      },];
    } else {
      xyValues = [{
        x: 1,
        y: this.datosClienteTableDivVasignado.filter(x => x.Serialsample === muestra)[0].Desvio
      },];
    }
    this.canvas = this.myChartEvaluacion3DivOculto.nativeElement;
    this.ctx = this.canvas.getContext('2d');

    if (this.graficaEvaluacion3) { this.graficaEvaluacion3.destroy(); }

    this.graficaEvaluacion3 = new Chart(this.ctx, {
      type: "scatter",
      data: {
        datasets: [{
          pointRadius: 4,
          pointBackgroundColor: function (context) {

            if (context.parsed.y > 1 || context.parsed.y < -1) {
              return 'red';
            } else if (context.parsed.y <= 1 && context.parsed.y >= -1 && context.parsed.y != 0) {
              return '#25d366';
            }

            return '#000000';
          },
          data: xyValues
        }]
      },
      options: {
        animation: {
          onComplete: () => {
            this.imageIndiceTres = this.graficaEvaluacion3.toBase64Image();
          }
        },
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: '% Desvío'
          },
        },

        scales: {
          x: {
            beginAtZero: true,
            max: Math.trunc(xyValues[0].y + 15),
            grid: {
              display: true,
              // drawBorder: true,
              drawOnChartArea: true,
              drawTicks: true,
              // color: '#000000'
            }
          },
          y: {
            max: xyValues[0].y + 20,
            min: -xyValues[0].y - 20,
            grid: {
              // drawBorder: false,
              color: (context) => {
                if (context.tick.value === this.datosClienteTableDivVasignado[0].DesvAceptable || context.tick.value === -this.datosClienteTableDivVasignado[0].DesvAceptable) {
                  return 'red';
                } else if (context.tick.value > this.datosClienteTableDivVasignado[0].DesvAceptable || context.tick.value < -this.datosClienteTableDivVasignado[0].DesvAceptable) {
                    return 'blue';
                  }

                return '#000000';
              },
            }
          }
        }
      }
    });
  }

  graficoTresDivZscore(muestra?: string) {
    let xyValues: any;
    if (!muestra) {
      xyValues = [{
        x:1,
        y: this.datosClienteTableDivZscore[0].Zscore
      },];
    } else {
      xyValues = [{
        x: this.datosClienteTableDivZscore.filter(x => x.Serialsample === muestra)[0].xdata,
        y: this.datosClienteTableDivZscore.filter(x => x.Serialsample === muestra)[0].Zscore
      },];
    }
    this.canvas = this.myChartEvaluacion3DivOcultoZscore.nativeElement;
    this.ctx = this.canvas.getContext('2d');
    if (this.graficaUnoEjemplo) { this.graficaUnoEjemplo.destroy(); }

    this.graficaUnoEjemplo = new Chart(this.ctx, {
      type: "scatter",
      data: {
        datasets: [{
          pointRadius: 4,
          pointBackgroundColor: (context) => {

            if (context.parsed.y > 2 || context.parsed.y < -2) {
              return 'red';
            } else if (context.parsed.y <= 2 && context.parsed.y >= -2 && context.parsed.y != 0) {
              return '#25d366';
            }

            return '#000000';


          },
          data: xyValues
        }]
      },
      options: {
        animation: {
          onComplete: () => {
            
            this.imageZscoreUno = this.graficaUnoEjemplo.toBase64Image();
          }
        },
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: 'Zscore'
          },
        },

        scales: {
          x: {
            beginAtZero: true,
            max: this.datosClienteTableDivZscore[0].xmaximo ,
            grid: {
              display: true,
              // drawBorder: true,
              drawOnChartArea: true,
              drawTicks: true,
              // color: '#000000'
            },
            title: {
              display: true,
              text: `Muestra`,
              align:'center'
            },
          },
          y: {
            max: 3,
            min: -3,
            grid: {
              // drawBorder: false,
              color: (context) => {

                if (context.tick.value > 2 || context.tick.value < -2) {
                  return 'blue';
                } else if (context.tick.value === 2 || context.tick.value === -2) {
                  return 'red';
                }

                return '#000000';


              },
            }
          }
        }
      }
    });
  }

  graficoCuatroDivZscore(muestra?: string) {
    let xyValues: any;
    if (!muestra) {
      xyValues = [{
        x: Number(this.datosClienteTableDivZscore[0].Resultado),
        y: this.datosClienteTableDivZscore[0].Zscore
      },];
    } else {
      xyValues = [{
        x: Number(this.datosClienteTableDivZscore.filter(x => x.Serialsample === muestra)[0].Resultado),
        y: this.datosClienteTableDivZscore.filter(x => x.Serialsample === muestra)[0].Zscore
      },];
    }
    this.canvas = this.myChartEvaluacionDivocultoZescore.nativeElement;
    this.ctx = this.canvas.getContext('2d');

    if (this.graficaDosEjemplo) { this.graficaDosEjemplo.destroy(); }

    this.graficaDosEjemplo = new Chart(this.ctx, {
      type: "scatter",
      data: {
        datasets: [{
          pointRadius: 4,
          pointBackgroundColor: (context) => {

            if (context.parsed.y > 2 || context.parsed.y < -2) {
              return 'red';
            } else if (context.parsed.y <= 2 && context.parsed.y >= -2 && context.parsed.y != 0) {
              return '#25d366';
            }

            return '#000000';


          },
          data: xyValues
        }]
      },
      options: {
        animation: {
          onComplete: () => {
            this.imageZscoreDos = this.graficaDosEjemplo.toBase64Image();
          }
        },
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: 'Z-score Concentración'
          },
        },

        scales: {
          x: {
            beginAtZero: true,
            max: Math.trunc(xyValues[0].x + 15),
            grid: {
              display: true,
              // drawBorder: true,
              drawOnChartArea: true,
              drawTicks: true,
              // color: '#000000'
            },
            title: {
              display: true,
              text: `Concentración`,
              align:'center'
            },
          },
          y: {
            max: 3,
            min: -3,
            grid: {
              // drawBorder: false,
              color: (context) => {

                if (context.tick.value > 2 || context.tick.value < -2) {
                  return 'blue';
                } else if (context.tick.value === 2 || context.tick.value === -2) {
                  return 'red';
                }

                return '#000000';


              },
            }
          }
        }
      }
    });
  }

  graficoSeisDivOculto(consolidado: boolean,key:string) {
    let idMenor = 0;
    let idMayor = 0;
    let datosGraficaSeis = 
    [];
    this.resumenMuestra.forEach(element => {
      const valor = element[key]; 
      if (valor < -2 || valor > 2) idMenor++;
      if (valor > -2 && valor < 2) idMayor++;
    });
    
    
    datosGraficaSeis.push(idMenor, idMayor, this.resumenMuestra.length)
    this.canvas =  this.myChartGraficaResumenRondaDivOculto.nativeElement;
    this.ctx = this.canvas.getContext('2d');


    if (this.graficaResumenRonda) { this.graficaResumenRonda.destroy(); }

    this.graficaResumenRonda = new Chart(this.ctx, {
      type: 'bar',
      data: {
        datasets: [{
          data: datosGraficaSeis,
          backgroundColor: ["#42ab49", "#77dd77", "#888a8a"],
          borderColor: ["#42ab49", "#77dd77", "#888a8a"]
        }

        ],
        labels: ['Z-score < -2 o > 2', 'Z-score > -2 o < 2', 'Total']

      },
      options: {
        animation: {
          onComplete: () => {
            this.imageRonda[0]=this.graficaResumenRonda.toBase64Image();
            if (!consolidado) {
              this.mostrarDivOculto.set(false);
              this.loader.hide();
              return;
            }
          }
        },
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: 'Z-score'
          },
        },
        scales: {
          x: {
            stacked: false,
            beginAtZero: true,
            offset: true,
            grid: {
              display: false
            },
            ticks: {
              font: {
                size: 11
              }
            }
          },
          y: {
            stacked: false,
            grid: {
              // drawBorder: true,
            }
          }
        }
      }
    });
  }

  graficoSeisDivOculto2(consolidado: boolean,key:string) {
    let idMenor = 0;
    let idMayor = 0;
    let datosGraficaSeis = [];
    this.resumenMuestra.forEach(element => {
      const valor = element[key]; 
      if (valor < -1 || valor > 1) idMenor++;
      if (valor > -1 && valor < 1) idMayor++;
    });
    
    
    datosGraficaSeis.push(idMenor, idMayor, this.resumenMuestra.length)
    this.canvas = this.myChartGraficaResumenRondaDivOculto2.nativeElement;
    this.ctx = this.canvas.getContext('2d');


    if (this.graficaResumenRonda2) { this.graficaResumenRonda2.destroy(); }

    this.graficaResumenRonda2 = new Chart(this.ctx, {
      type: 'bar',
      data: {
        datasets: [{
          data: datosGraficaSeis,
          backgroundColor: ["#42ab49", "#77dd77", "#888a8a"],
          borderColor: ["#42ab49", "#77dd77", "#888a8a"]
        }

        ],
        labels: ['ID < -1 o > 1', 'ID > -1 o < 1', 'Total']

      },
      options: {
        animation: {
          onComplete: () => {
            this.imageRonda[1]=this.graficaResumenRonda2.toBase64Image();
            if (!consolidado) {
              this.mostrarDivOculto.set(false);
              this.loader.hide();
              return;
            }
          }
        },
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text:'Índice de Desvío'
          },
        },
        scales: {
          x: {
            stacked: false,
            beginAtZero: true,
            offset: true,
            grid: {
              display: false
            },
            ticks: {
              font: {
                size: 11
              }
            }
          },
          y: {
            stacked: false,
            grid: {
              // drawBorder: true,
            }
          }
        }
      }
    });
  }

  onImgChart(img:string,pos:number){
    this.imageZscoreNuevo[pos] = img;
  }
  onImgChart2(img:string,pos:number){
    this.imageZscoreNuevoConcentracion[pos]=img;
  }
  onImgChartBar(img:string,pos:number){
    this.imageRonda[pos]=img;
  }


   async ventanaConfirmacionPdf(dataLogReporteCuantitativo:any){
    this.tipoGeneracion = false;
    const destroy$: Subject<boolean> = new Subject<boolean>();
    const data: ModalData = {
      message: `¿Desea guardar este PDF para ser visto por el cliente?`,
      btn: 'Aceptar',
      btn2: 'Cancelar',
      footer: true,
      title: 'Confirmación',
      image: 'assets/rutas/iconos/pregunta.png'
    };
    const dialogRef = this.dialog.open(ModalGeneralComponent, { height: 'auto', width: '40em', data, disableClose: true });
    dialogRef.componentInstance.primaryEvent?.pipe(takeUntil(destroy$)).subscribe({
      next: async (response) => {
        this.tipoGeneracion = true;
        await this.logsService.createLogsReportes(dataLogReporteCuantitativo, 'LogsReporteCuantitativo');
        this.toastr.success("La trazabilidad fue guardada exitosamente.");
        dialogRef.close();
      }, error: (error) => {
        this.toastr.info("No fue registrado ningún log de trazabilidad");
      }
    });

    await this.navegarRutaInicial();
  }

  async navegarRutaInicial(){
    const rutaActual = this.router.url;
    this.router.navigateByUrl('/empty', { skipLocationChange: true }).then(() => {
      this.router.navigate([rutaActual]);
    });
  }

  async generarPdf(FlagConsolidado: boolean = false) {
    this.arrConsolidadoReporeUno.length = 0;
    let json = this.jsonResumenMuestra;
    let muestraSeleccionda = "";
    this.imageZscoreNuevo = [];
    this.imageZscoreNuevoConcentracion = [];
    this.imageZscoreTotal = [];
    let exists = false;
  
    if (json?.DataAnalytes?.length !== 0) {
      let iNotsValid = json.DataAnalytes.find(e => e.statisticalGeneral === "" || e.statisticalGeneral === "-")

      if (iNotsValid) {
        iNotsValid.IdAnalytes == -1 ? this.toastr.error('Debe seleccionar un sistema de medición') : this.toastr.error('Debe seleccionar un sistema de medición para los analitos seleccionados')
        return
      }

    } else {
      this.toastr.error('Debe asignar todos los sistemas de medición en resumen de muestra')
      return
    } 

    /*
    if (this.mostrarDivOculto()) {
    return
    }
    */

    muestraSeleccionda = this.formaSelecionMuestra.value.muestra;

    this.verifDatosResumenMuestra = this.respuestaBusqueda[0].Evaluacion.Analitos.filter(m => m.Serialsample === muestraSeleccionda);

    this.countAnalitosEquipos = this.verifDatosResumenMuestra.map(x => {
      return [{
        idAnalytes: x.idAnalytes, 
        idAnalyzer: x.idAnalyzer
      }]
    });

    this.idSampleGenerado = this.respuestaBusqueda[0].Data.filter(x=>x.serialSample === this.formaSelecionMuestra.value.muestra)[0];
    
    let newObje = JSON.parse(JSON.stringify(json));
    if (!this.allAnalytes) {
      if (json.DataAnalytes.filter(x => x.statisticalGeneral === null).length > 0 && this.countAnalitosEquipos.length !== json.DataAnalytes.length) {
        this.toastr.error('Debe seleccionar todos los sistemas de medición para los analitos de la muestra ' + muestraSeleccionda);
        return;
      } else {
        json = { ...newObje, DataAnalytes: json.DataAnalytes };
      }
    } else {
      json = { ...newObje, DataAnalytes: [{ IdAnalytes: '-1', IdAnalyzer:'-1', statisticalGeneral: this.sistema.value }] };
    }

    if (!this.allAnalytes) {
      if(json.resumenRonda.length > 0){
          let dataWithStatisticalGeneral = this.jsonResumenMuestra.resumenRonda.filter(y=>y.statisticalGeneral === '');

          let dtWithSG = [];
          dataWithStatisticalGeneral.forEach(element => {
            let data1 = this.respuestaBusqueda[0].Evaluacion.Analitos
                                                .filter(x=>x.idAnalytes === element.idAnalytes
                                                  && x.idAnalyzer === element.idAnalyzer
                                                  && x.idSample === element.idSample
                                                );

            if(data1.length > 0){
              const dt = {
                Sample: data1[0].Serialsample,
                Analyte: data1[0].Analyte
              }
              dtWithSG.push(dt);
      }
    });

          if(dtWithSG.length > 0){
                      
            Swal.fire({
              title: 'Información incompleta',
              titleText: " Las siguientes muestras y analitos mostrados son aquellos que faltan por generar historicos: Por ende, complete el sistema de medición manualmente. ",
              html: `
                  <table class="table table-bordered">
                    <thead>
                      <tr>
                        <th>Muestra</th>
                        <th>Analito</th>
                      </tr>
                    </thead>
                    <tbody>
                    ${this.generateTableRows(dtWithSG)}
                    </tbody>
                  </table>
                `,
              icon: 'info'
            });
            
            return;
          }

      } else {
        
        if(this.totalSamples.length === 1){
          //Esta logica se agrega para cuando hay una ronda que solo se puede descargar una muestra
          json.resumenRonda = json.DataAnalytes.map(objeto => {
            return {
              idSample: this.idSampleGenerado.idSample,
              idAnalytes: objeto.IdAnalytes,
              idAnalyzer: objeto.IdAnalyzer,
              statisticalGeneral: objeto.statisticalGeneral
            };
          });
        }
      }
    } else {
      json = { ...newObje, resumenRonda: [{ idSample: '-1', idAnalytes: '-1', idAnalyzer: '-1', statisticalGeneral: this.sistema.value }] };
    }

    this.jsonResumenMuestra = {
      Idprogram: this.formaCuantitativo.value.programa,
      IdAnalytes: this.formaCuantitativo.value.analyte.join(),
      Nroround: this.formaCuantitativo.value.ronda,
      Idclient: this.formaCuantitativo.value.idclient,
      Idsede: this.formaCuantitativo.value.idsede,
      IdSample: this.idSampleGenerado.idSample,
      dataGenerate: this.formaCuantitativo.value.dataGenerate,
      DataAnalytes: json.DataAnalytes,
      resumenRonda: json.resumenRonda,
    }

    json = this.jsonResumenMuestra;
    
    this.loader.show();

    let datosFiltro = [];
    await this.reporteCuantitativoService.getDatos2(json).toPromise()
      .then(async (x: any) => {
        exists = true;
        this.mostrarReportes = true;
        this.respuestaBusqueda = x;
        this.resumenRonda = x[0].Evaluacion.resumenronda;
        datosFiltro = x[0].Evaluacion.Analitos.filter(x=>x.Serialsample === muestraSeleccionda);
        await this.consultAnalyticalProblems(datosFiltro[0].idRound, this.formaCuantitativo.get('idsede').value);
        this.ejex = Math.max(...x[0].Evaluacion.Analitos.map(d => d.nroSample));

        this.resumenMuestra = datosFiltro.map(x => {
          return {
            analito: x.Analyte, 
            resultado: x.Resultado,
            valorAsignado: x.ValorAsign, 
            media: x.Media,
            DS: x.DS, 
            CV: x.CV,
            UM: x.UM, 
            indiceDesvio: x.IndiceDesv,
            zScore: x.Zscore,
            grupo: x.statisticalGeneral
          }
        });
        
        //this.allAnalytes = false;
        //Revisar si se tiene que mejorar la función para la limpieza de formulario
        //this.limpiarFormulario(false);

      }).catch(error => {
        exists = false;
        this.loader.hide();
        this.toastr.error(error.error);
        return;
      });

      if (exists){
        const caberosTablaEstadisticaGeneral = ['N', 'Media', 'DS', 'CV', 'UM', 'Grupo'];
        const caberosTablasZscore = ['Resultado', 'Z-score', 'Media', 'DS', 'Grupo'];
        const caberosTablasDesvio = ['Resultado', 'Valor asignado', '% Desvío', '% Desviación Aceptable', '% Indice de Desvío', 'RMID'];
        //Se retira el indice de desvio de esta tabla ya que por el momento no se utiliza
        // const caberosTablasResumenRonda_Ciclo = ['Muestra', 'Resultado', 'Media', 'DS', 'CV', 'UM', 'Indice Desvio', 'Z-score'];
        const caberosTablasResumenRonda_Ciclo = ['Muestra', 'Resultado', 'Media', 'DS', 'CV', 'UM', 'Z-score'];
        const caberosTablasResumenMuestras = ['Analito', 'Resultado', 'Media', 'DS', 'CV', 'UM', 'Z-Score', 'Grupo'];
        const caberosTablasResumenRonda = ['Ronda', 'Muestra', 'Analito', 'Resultado', 'Media', 'DS', 'CV', 'UM', 'Z-Score', 'Grupo'];
        const grupos = ['Método', 'Equipo - Método', 'Todos los resultado'];
    
        const resumenes = [caberosTablasResumenMuestras, caberosTablasResumenRonda]
        const cabeceros = [caberosTablaEstadisticaGeneral, caberosTablasDesvio, caberosTablasZscore, caberosTablasResumenRonda_Ciclo];
    
        let datosEstadistica : any[] = this.respuestaBusqueda[0].StatisticalGeneral.filter(x=>x.Serialsample === muestraSeleccionda);
    
        let tablaDatos=[];
        let tablaResumenRonda:any[]=[];
        let tablaComparacionZscore:any[]=[];
        let totalAnalitos:any[];
        let datosCabecero:any[]=[];
        let analitosCabecero:any[];
        let zScoreConcentracion:any[];
        let graficaZscore:any[];
        let graficaZscore2:any[];
        let zScoreConcentracion2:any[];
        let graficaZscoreVar: any[] = this.respuestaBusqueda[0].Evaluacion.Analitos;
        let analitosSelected: { IdAnalytes: number, statisticalGeneral: string }[] = this.jsonResumenMuestra.DataAnalytes;
        
        //Nuevo codigo implementado
        graficaZscore2 = graficaZscoreVar.map(x => {
          return { idSample:x.idSample, idAnalytes: x.idAnalytes, idAnalyzer: x.idAnalyzer ,ValueEjex: x.ValueEjex, Zscore: x.Zscore, ejex: this.ejex};
        });
    
        zScoreConcentracion2 = graficaZscoreVar.map(x => {
          return { idSample:x.idSample, idAnalytes: x.idAnalytes, idAnalyzer: x.idAnalyzer, Resultado: x.Resultado, Zscore: x.Zscore};
        });
    
        graficaZscoreVar = graficaZscoreVar.filter(x => x.Serialsample === muestraSeleccionda);
    
        totalAnalitos = graficaZscoreVar.map(x => {
                                              return [{
                                                idSample: x.idSample,
                                                idAnalytes: x.idAnalytes, 
                                                idAnalyzer: x.idAnalyzer
                                              }]
                                            });
          
        if (this.jsonResumenMuestra.DataAnalytes.length === 1) {
          graficaZscore = graficaZscoreVar.map(x => [x.ValueEjex, x.Zscore]);
          zScoreConcentracion = graficaZscoreVar.map(x => [x.Resultado, x.Zscore]);
          analitosCabecero = graficaZscoreVar.map(x => String(x.Analyte).trim());
        }
        if (this.jsonResumenMuestra.DataAnalytes.length > 1) {
          graficaZscore = graficaZscoreVar.map(x => {
            if (analitosSelected.filter(y => y.IdAnalytes === x.idAnalytes).length !== 0) {
              if( x.Zscore > 2 || x.Zscore < -2){
                return {
                  value: [x.ValueEjex, x.Zscore],
                  itemStyle: {
                    color: "red"
                  }
                }
              }
              return [x.ValueEjex, x.Zscore];
            }
          }).filter(x => x !== undefined);
    
          zScoreConcentracion = graficaZscoreVar.map(x => {
            if (analitosSelected.filter(y => y.IdAnalytes === x.idAnalytes).length !== 0) {
              if( x.Zscore > 2 || x.Zscore < -2){
                return {
                  value: [x.Resultado, x.Zscore],
                  itemStyle: {
                    color: "red"
                  }
                }
              }
              return [x.Resultado, x.Zscore];
            };
          }).filter(x => x !== undefined);
    
          analitosCabecero = graficaZscoreVar.map(x => {
            if (analitosSelected.filter(y => y.IdAnalytes === x.idAnalytes).length !== 0) {
              return { Analyte: String(x.Analyte).trim(), idAnalyzer: x.idAnalyzer };
            }
          }).filter(x => x !== undefined);
        }
    
        //Grafico general zscore
        let datosBarras =[];
        let aceptable:number= 0;
        let advertencia:number= 0;
        let Inaceptable:number= 0;
        this.resumenMuestra.forEach(element => {
          let valor = element['zScore'];
          if (valor > -2 && valor < 2) {
            aceptable++; 
            return 'green'; 
          } else if ((valor >= 2.0 && valor <= 3) || (valor <= -2.0 && valor >= -3)) {
            advertencia++;
            return 'yellow'; 
          } else if (valor > 3 || valor < -3) {
            Inaceptable++;
            return 'red'; 
          }
        });
        datosBarras.push(
          {
            value: aceptable,
            itemStyle: {
              color: '#7bfaaa'
            } 
          },
          {
            value: advertencia,
            itemStyle: {
              color: '#f7fa7b'
            }
          },
          {
            value: Inaceptable,
            itemStyle: {
              color: '#d04e42'
            }
          },
          {
            value: this.resumenMuestra.length ,
            itemStyle: {
              color: '#888a8a'
            } 
          });    
        this.barrasDataResumen = [...datosBarras];
    
        let grupAnalytesAnalyzer = graficaZscoreVar
        .map(item => ({
          idSample: item.idSample,
          idAnalytes: item.idAnalytes,
          idAnalyzer: item.idAnalyzer,
          idUnits: item.idUnits,
          idMethods: item.idMethods
        }));
    
        let listForeachAnalytes = Array.from(
          new Map(grupAnalytesAnalyzer.map(item => [`${item.idAnalytes}-${item.idAnalyzer}-${item.idSample}-${item.idMethods}-${item.idUnits}`, item])).values()
        );
    
        listForeachAnalytes.forEach(element => {
          let datosAdicionales = graficaZscoreVar.filter(eq => eq.idAnalytes === element.idAnalytes && eq.idAnalyzer === element.idAnalyzer && eq.idSample === element.idSample
                                                          && eq.idMethods === element.idMethods && eq.idUnits === element.idUnits);
          const capturaFecha = this.datosFinRonda.filter(eq => eq.Serialsample === muestraSeleccionda)[0];
    
          datosCabecero.push ({
            analito: datosAdicionales[0].Analyte,
            programa: this.programaSeleccionado[0].Desprogram,
            ronda: this.formaCuantitativo.value.ronda,
            muestra: muestraSeleccionda,
            fecha: moment(this.fechaActual).format('YYYY-MM-DD'),
            tipomuestra: this.formStatusSample.get('typeSample')?.value,
            condicionesmuestra: this.formStatusSample.get('sampleConditions')?.value,
            fecharecepcion: moment(this.formStatusSample.get('dateReception')?.value).format('YYYY-MM-DD'),
            si: this.formStatusSample.get('sampleReceived')?.value == "true" ? ' X ' : '___',
            no: this.formStatusSample.get('sampleReceived')?.value == "false" ? ' X ' : '___',
            cod: this.respuestaBusqueda[0].Data[0].codeClient,
            equipo: datosAdicionales[0].Equipo,
            metodo: datosAdicionales[0].Metodo,
            reactivo: datosAdicionales[0].Reactivo,
            unidades: datosAdicionales[0].Unidades,
            valorAsign: datosAdicionales[0].ValorAsign,
            fechaFinal: moment(capturaFecha.EndDate).format('YYYY-MM-DD')
          });
    
          // Tabla zscore comparación 
          tablaComparacionZscore.push(graficaZscoreVar
          .filter(y => y.idAnalytes === element.idAnalytes && y.idAnalyzer === element.idAnalyzer && y.idSample === element.idSample
            && y.idMethods === element.idMethods && y.idUnits === element.idUnits

          )
          .map(xz => {
            return {
              A_resultado: xz.Resultado,
              B_zScore: xz.Zscore,
              C_media: xz.Media,
              D_ds: xz.DS,
              E_Grupo: xz.statisticalGeneral,
              idAnalytes: xz.idAnalytes,
              idAnalyzer: xz.idAnalyzer,
              idSample: xz.idSample,
              idMethods: xz.idMethods,
              idUnits: xz.idUnits
            }
          }));

          // Tabla de datos
          //Equipo metodo
          let contenido = datosEstadistica.filter(y => y.idAnalytes === element.idAnalytes && y.idAnalyzer === element.idAnalyzer && y.idMethods === element.idMethods && y.idSample === element.idSample && y.idUnits == element.idUnits && y.tipo === 'Equipo-Método')[0];

          if(contenido){  
            const dtFinal1 = {
              participantes: contenido.participantes,
              media: contenido.media,
              DS: contenido.DS,
              CV: contenido.CV,
              Um: contenido.Um,
              tipo: contenido.tipo,
              idAnalytes: contenido.idAnalytes,
              idAnalyzer: contenido.idAnalyzer,
              idSample: contenido.idSample,
              idMethods: contenido.idMethods,
              idUnits: contenido.idUnits
            };
            
            tablaDatos.push(dtFinal1);
          }
          
          //Metodo
          let contenido2 = datosEstadistica.filter(y => y.idAnalytes === element.idAnalytes && y.idAnalyzer === '' && y.idMethods === element.idMethods && y.idSample === element.idSample && y.idUnits == element.idUnits && y.tipo === 'Método')[0];
          
          if(contenido2){
            const dtFinal2 = {
              participantes: contenido2.participantes,
              media: contenido2.media,
              DS: contenido2.DS,
              CV: contenido2.CV,
              Um: contenido2.Um,
              tipo: contenido2.tipo,
              idAnalytes: contenido2.idAnalytes,
              idAnalyzer: contenido2.idAnalyzer,
              idSample: contenido2.idSample,
              idMethods: contenido2.idMethods,
              idUnits: contenido2.idUnits
            };
            
            tablaDatos.push(dtFinal2);
          }
          
          //Todos los resultados
          let contenido3 = datosEstadistica.filter(y => y.idAnalytes === element.idAnalytes && y.idAnalyzer === '' && y.idMethods === '' && y.idSample === element.idSample && y.idUnits == element.idUnits && y.tipo === 'Todos los resultados')[0];

          if(contenido3){
            const dtFinal3 = {
              participantes: contenido3.participantes,
              media: contenido3.media,
              DS: contenido3.DS,
              CV: contenido3.CV,
              Um: contenido3.Um,
              tipo: contenido3.tipo,
              idAnalytes: contenido3.idAnalytes,
              idAnalyzer: contenido3.idAnalyzer,
              idSample: contenido3.idSample,
              idMethods: contenido3.idMethods,
              idUnits: contenido3.idUnits
            };
            
            tablaDatos.push(dtFinal3);
          }
        })
        
        //CODIGO ANTERIOR 
        /*
        this.ZscoreData1.set(graficaZscore);
        this.ZscoreData2.set(zScoreConcentracion);
        */
    
        tablaResumenRonda = graficaZscoreVar.map(resumen => {
          return {
            A_serialSample: resumen.Serialsample,
            B_resultado: resumen.Resultado,
            C_media: resumen.Media,
            D_ds: resumen.DS,
            E_cv: resumen.CV,
            F_um: resumen.UM,
            h_ZScore: resumen.Zscore === 'No Determinado' ? `♾` : resumen.Zscore,
            i_grupo: resumen.statisticalGeneral
          }
        });
    
        //Codigo nuevo
        this.listAnalytes.set(totalAnalitos);
        this.ZscoreData1.set(graficaZscore2);
        this.ZscoreData2.set(zScoreConcentracion2);
    
        this.verGraficaNueva.set(true);
        this.loader.show();
    
        let result = tablaComparacionZscore.reduce((acc, curr) => acc.concat(curr), []);
    
        timer(15000).subscribe( async x =>{
          
          let datosCompletos:any[]=[];
    
          let i:number=0;
          for (const key in listForeachAnalytes) {
            let tablaEstadistica = [];
            let dtTablaZscore = result.find(x=>x.idAnalytes === listForeachAnalytes[key].idAnalytes && x.idAnalyzer === listForeachAnalytes[key].idAnalyzer && x.idSample === listForeachAnalytes[key].idSample
              && x.idMethods === listForeachAnalytes[key].idMethods && x.idUnits === listForeachAnalytes[key].idUnits
            );
            if(dtTablaZscore){
              delete dtTablaZscore.idAnalytes;
              delete dtTablaZscore.idAnalyzer;
              delete dtTablaZscore.idSample;
              delete dtTablaZscore.idMethods;
              delete dtTablaZscore.idUnits;
            }

            let contenidoEM = tablaDatos.filter(y => y.idAnalytes === listForeachAnalytes[key].idAnalytes && y.idAnalyzer === listForeachAnalytes[key].idAnalyzer && y.idMethods === listForeachAnalytes[key].idMethods && y.idSample === listForeachAnalytes[key].idSample && y.idUnits == listForeachAnalytes[key].idUnits && y.tipo === 'Equipo-Método')[0];

            if(contenidoEM){  
              const dtFinal1 = {
                A_resultado: contenidoEM.participantes,
                B_media: contenidoEM.media,
                C_DS: contenidoEM.DS,
                D_CV: contenidoEM.CV,
                E_UM: contenidoEM.Um,
                F_tipo: contenidoEM.tipo,
              };
              
              tablaEstadistica.push(dtFinal1);
            }
            
            //Metodo
            let contenidoM = datosEstadistica.filter(y => y.idAnalytes === listForeachAnalytes[key].idAnalytes && y.idAnalyzer === '' && y.idMethods === listForeachAnalytes[key].idMethods && y.idSample === listForeachAnalytes[key].idSample && y.idUnits == listForeachAnalytes[key].idUnits && y.tipo === 'Método')[0];
            if(contenidoM){
              const dtFinal2 = {
                A_resultado: contenidoM.participantes,
                B_media: contenidoM.media,
                C_DS: contenidoM.DS,
                D_CV: contenidoM.CV,
                E_UM: contenidoM.Um,
                F_tipo: contenidoM.tipo,
              };
              
              tablaEstadistica.push(dtFinal2);
            }
            
            //Todos los resultados
            let contenidoT = datosEstadistica.filter(y => y.idAnalytes === listForeachAnalytes[key].idAnalytes && y.idAnalyzer === '' && y.idMethods === '' && y.idSample === listForeachAnalytes[key].idSample && y.idUnits == listForeachAnalytes[key].idUnits && y.tipo === 'Todos los resultados')[0];
  
            if(contenidoT){
              const dtFinal3 = {
                A_resultado: contenidoT.participantes,
                B_media: contenidoT.media,
                C_DS: contenidoT.DS,
                D_CV: contenidoT.CV,
                E_UM: contenidoT.Um,
                F_tipo: contenidoT.tipo,
              };
              
              tablaEstadistica.push(dtFinal3);
            }

            const tablas = [tablaEstadistica, [], [dtTablaZscore] , tablaResumenRonda, []];
      
            const nuevoArrImagen = [ null, [this.imageZscoreNuevo[i], this.imageZscoreNuevoConcentracion[i]]];        
            let cabeceroUnico =datosCabecero[i];
            datosCompletos.push([nuevoArrImagen,tablas,cabeceros,cabeceroUnico])
      
            if(listForeachAnalytes[key] === listForeachAnalytes[listForeachAnalytes.length-1]){
              let clienteInfo:any;
              if (this.flagCliente) {
              clienteInfo = {
                  isClient: true,
                  header: this.clienteSeleccionado.header,
                  nameClient: this.clienteSeleccionado.name
                }
              }
              
              let dataSede = this.sedes.find(x => x.idheadquarters === this.formaCuantitativo.get('idsede').value) || null;
              await this.pdfService.PdfExternoCuantitativo(datosCompletos,datosCabecero[0],this.resumenMuestra,resumenes,this.resumenRonda,this.imageRonda,clienteInfo,dataSede, this.problemsAnalytical).then(async base64 => {
            
                let dataLogReporteCuantitativo: any = {
                  IdRound: datosFiltro[0].idRound,
                  IdSample: datosFiltro[0].idSample,
                  NroRound: this.formaCuantitativo.get('ronda')?.value,
                  Analito: this.formaCuantitativo.get('analyte')?.value,
                  IdCliente: this.formaCuantitativo.get('idclient')?.value,
                  IdSede: this.formaCuantitativo.get('idsede')?.value,
                  IdPrograma: this.formaCuantitativo.get('programa')?.value,
                  DatosAcumulados: Boolean(this.formaCuantitativo.get('dataGenerate')?.value),
                  ResumenMuestra: json.DataAnalytes,
                  ResumenRonda: json.resumenRonda,
                  OpcionTodos: this.allAnalytes,
                  Pdf: base64,
                  TipoMuestra: this.formStatusSample.value.typeSample,
                  CondicionMuestra: this.formStatusSample.value.sampleConditions,
                  observations: this.formStatusSample.value.observations,
                  MuestraRecibida: this.formStatusSample.value.sampleReceived,
                  FechaRecepcion: this.formStatusSample.value.dateReception,
                }
    
                await this.ventanaConfirmacionPdf(dataLogReporteCuantitativo);
              
    
              }).catch(error => {
                this.toastr.error('Error generando el reporte:', error);
              });
    
              this.verGraficaNueva.set(false);
              this.loader.hide();
            }
            i++;
          }
        });

      } else {
        return;
      }
  }

  obtenerDatosClienteDiv(muestra?: string, consolidado?: boolean) {
    this.datosClienteTableDivZscore.length = 0;
    this.datosClienteTableDivVasignado.length = 0;
    
    //const datos = this.listaAnalitosEvaluacion.filter(datos => datos.Name === this.cliente);
    let datos = this.listaAnalitosEvaluacion;
    this.clientesEvaluacionMuestra.forEach(async element => {
      let retorno = await this.arrayZscore(element, datos);
      this.datosClienteTableDivZscore.push({
        Serialsample: retorno[0].Serialsample,
        Resultado: retorno[0].Resultado,
        Zscore: retorno[0].Zscore,
        Media: retorno[0].Media,
        DS: retorno[0].DS,
        xmaximo:retorno[0].DataEjex,
        xdata:retorno[0].ValueEjex,
        idAnalytes:retorno[0].idAnalytes,
        Analyte:retorno[0].Analyte,
        statisticalGeneral:retorno[0].statisticalGeneral
      });

      let retornoindiceDesvio = await this.arrayIndiceDesvio(element, datos);
      this.datosClienteTableDivVasignado.push({
        Serialsample: retornoindiceDesvio[0].Serialsample,
        Resultado: retornoindiceDesvio[0].Resultado,
        ValorAsign: retornoindiceDesvio[0].ValorAsign,
        Desvio: retornoindiceDesvio[0].Desvio,
        DesvAceptable: retornoindiceDesvio[0].DesvAceptable,
        IndiceDesv: retornoindiceDesvio[0].IndiceDesv
      });
    });

    setTimeout(() => {
      // Indice de desvio
      this.graficoTresDiv(muestra);
      this.graficoCuatroDiv(muestra);
      this.zDiv(muestra);
      // zScore
      this.graficoTresDivZscore(muestra);
      this.graficoCuatroDivZscore(muestra);

      this.graficoSeisDivOculto(consolidado,'zScore');
      this.graficoSeisDivOculto2(consolidado,'indiceDesvio');
    }, 1000);
  }
  async arrayZscore(elemento, datos) {
    let retorno = datos.filter(t => t.Serialsample === elemento);
    return retorno;
  }
  async arrayIndiceDesvio(elemento, datos) {
    let retorno = datos.filter(datos => datos.Serialsample === elemento);
    return retorno;
  }


  // Reporte 2

  groupAnalitosBySede(data: AnalitoElement[], sedeName: string) {
    const sedeMap: { [key: string]: { [key: string]: AnalitoElement[] } } = {};
    data.forEach((d: AnalitoElement) => {

      if (!sedeMap[d.Sede]) {
        sedeMap[d.Sede] = {};
      }
      if (!sedeMap[d.Sede][d.Analito]) {
        sedeMap[d.Sede][d.Analito] = [];
      }
      if (!sedeMap[d.Sede][d.Analito].includes(d)) {
        sedeMap[d.Sede][d.Analito].push(d);
      }
      // sedeMap[d.Sede][d.Analito].push(d);
    });
    const result: GroupedAnalitos[] = [];
    Object.keys(sedeMap).forEach((sedeKey: string) => {
      result.push({
        Sede: sedeName,
        Analitos: sedeMap[sedeKey]
      });
    });

    return result;
  }

  limpiar1(campo: string) {
    let sinMenosUno: any[] = this.formCuantitativoReporte2.get(campo)?.value;
    if (sinMenosUno.length !== 1 && sinMenosUno.includes('-1')) {
      sinMenosUno = sinMenosUno.filter(x => x !== '-1');
    }
    this.formCuantitativoReporte2.get(campo).setValue(sinMenosUno);
    this.consultarProgramas();
  }

  limpiar2(campo: string) {
    let sinMenosUno: any[] = this.formCuantitativoReporte2.get(campo)?.value;
    if (sinMenosUno.length !== 1 && sinMenosUno.includes('-1')) {
      sinMenosUno = sinMenosUno.filter(x => x !== '-1');
    }
    this.formaCuantitativo.get(campo).setValue(sinMenosUno);
  }

  clearCancellation(){
    this.formStatusSample.reset();
    this.reporteUno = true;
    this.alternarSeleccionMuestrasFlag.set(true);
    this.verMuestraModal.set(false);
    this.formaSelecionMuestra.reset();
    this.reiniciarAnalitos();
    this.listAnalytesReport = [];
  }

  filtrarAnalitos(campo: string) {

    let ids: any[] = this.formCuantitativoReporte2.get(campo).value;
    this.analitosFiltradosVer = [];

    if (ids.includes('-1') && ids.length === 1) {
      if (ids.includes('')) {
        this.analitosFiltradosVer = [];
        ids = ids.filter(x => x !== '');
        this.formCuantitativoReporte2.get(campo).setValue(ids);
        return
      }
      this.analitosFiltradosVer = this.analitosList;
    } else {
      // if (ids.length !== 1 && !ids.includes('-1')) {
      //   ids = ids.filter(x => x !== '-1');

      // }
      const isMultipleSelection = ids.length !== 1;
      const hasNegativeOne = ids.includes('-1');

      if (isMultipleSelection && hasNegativeOne) {
        ids = ids.filter(selectedId => selectedId !== '-1');
      }

      this.formCuantitativoReporte2.get(campo).setValue(ids);
      this.analitosFiltradosVer = this.analitosList.filter(x => ids.includes(x.Idanalytes));
    }
  }

  crearGraficaBarrasReporte2(arryReturn: any[]) {
    let contador1 = 0;
    let contador2 = 0;
    const colores = ['red', 'green', 'gray'];
    let iterar: any = [1, 2, 3];

    arryReturn.map(i => {
      i.analito.map((z, index) => {
        if (z.IndiceDesvio > 1) {
          contador1 += 1;
        } else {
          contador2 += 1;
        }
      })
    });

    iterar = iterar.map((x: any, index: number) => {
      return {
        value: '',
        itemStyle: { color: colores[index] },
        label: {
          show: true,
          position: 'inside',
          color: 'white'
        },
      }
    });

    iterar[0].value = contador1;
    iterar[1].value = contador2;
    iterar[2].value = contador2 + contador1;

    this.dataBarraReporte2 = [...iterar];
  }

  async traerInfoAnalitoReporte2Individual(analito: string) {
    let arryReturn = [];
    this.dataLineasReporte2 = [];
    this.seccionSeleccionado = analito;
    this.dataTablaReporte2 = []
    // Extrae informacion zScore, indices desvio por el filtro de analitos
    await new Promise((res, e) => {
      this.dataAnalitoFiltrada.map(x => {

        let cambio = this.groupAnalitosBySede((x.Programas[0].Analitos), x.Sede)[0];
        const { Sede, Unidad, Programa, Equipo, Reactivo } = x;
        Object.keys(cambio.Analitos)
          .filter(f => f === analito)
          .forEach(f => {
            const objetoTabla = {
              ['titulo']: ['Red de laboratorios', 'Programa', 'Datos laboratorio', 'Sistema medición/Equipo', 'Reactivo', 'Analito', 'Unidades'],
              ['informacion']: ['ANNAR DX', Programa, Sede, Equipo, Reactivo, f, Unidad],
              ['sedeNumber']: [],
            };
            arryReturn.push({ sede: cambio.Sede, analito: cambio.Analitos[f] });
            this.mostrarReportes = true;
            this.dataTablaReporte2.push(objetoTabla);
            this.itemData = [Sede, Unidad, Programa, Equipo, Reactivo, f];
            res(true);
          });
        if (arryReturn.length === 0) {
          e(false);
          this.toastr.error('No se encontraron datos para el analito "' + analito + '"');
        }
      })
    });

    if (arryReturn.length === 0) {
      this.mostrarReportes = false;
      this.toastr.error('No se encontraron datos');
      return
    }

    // Grafica de lineas
    let arrTemporalIndiceDesvio = [];
    let arrTemporalZscore = [];
    arrTemporalIndiceDesvio = arryReturn.map((item, index) => {
      let data = item.analito.map((x: AnalitoElement) => String(x.IndiceDesvio));
      // Informacion de la tabla
      this.dataTablaReporte2[index].desvio = ['Índice desvío', ...data];
      if (index === 0) this.dataTablaReporte2[index].sedeNumber = data.length;
      if (this.dataTablaReporte2[index].sedeNumber < data.length) this.dataTablaReporte2[index].sedeNumber = data.length;
      // Informacion de la tabla
      return {
        name: item.sede,
        type: 'line',
        data
      }
    });
    arrTemporalZscore = arryReturn.map((item, index) => {
      const data = item.analito.map((x: AnalitoElement) => String(x.Zscore));
      const arrSedeNumber = [];
      // Informacion de la tabla
      this.dataTablaReporte2[index].zScore = ['Z-score', ...data];
      if (index === 0) this.dataTablaReporte2[index].sedeNumber = data.length;
      if (this.dataTablaReporte2[index].sedeNumber < data.length) this.dataTablaReporte2[index].sedeNumber = data.length;
      for (let index = 0; index < data.length; index++) {
        arrSedeNumber.push(index + 1);
      }
      this.dataTablaReporte2[index].sedeNumber = [item.sede, ...arrSedeNumber];
      // Informacion de la tabla
      return {
        name: item.sede,
        type: 'line',
        data: item.analito.map((x: AnalitoElement) => String(x.Zscore))
      }
    });  // Fin Grafica de lineas

    this.dataTablaReporte2.map(x => {
      if (x.zScore.length > this.headerMayor.length) {
        this.headerMayor = [...x.zScore];
      }
    })
    this.headerMayor.shift();
    this.dataLineasReporte2.push(arrTemporalIndiceDesvio, arrTemporalZscore);
    // Organizar informacion de grafica barras
    this.crearGraficaBarrasReporte2(arryReturn);
  }

  traerInfoAnalitoReporte2Grupal(arr: Sedes[]) {
    let analitos: string[] = [];
    let data: any[] = [];
    let agrupado: any[] = [];
    let agrupadoreturn: any[] = [];
    const colores = ['red', 'green', 'gray'];

    arr.map((x, index) => {
      x.Programas[0].Analitos.filter((y) => {
        if (!analitos.includes(y.Analito)) analitos.push(y.Analito);
      })
    });

    arr.map((x, index) => {
      // Informacion lineas
      analitos.map((i, index2) => {
        let contador1 = 0;
        let contador2 = 0;
        let iterar: any = [1, 2, 3];
        let desvio = [];
        let zScore = [];

        x.Programas[0].Analitos.filter((y) => {
          if (y.Analito === i) {
            if (y.IndiceDesvio > 1) {
              contador1 += 1;
            } else {
              contador2 += 1;
            }

            desvio.push(String(y.IndiceDesvio));
            zScore.push(String(y.Zscore));
          }
        });// Informacion lineas
        // Informacion grafica de barras
        iterar = iterar.map((x: any, index: number) => {
          return {
            value: '',
            itemStyle: { color: colores[index] },
            label: { show: true, position: 'inside', color: 'white' },
          }
        });

        iterar[0].value = String(contador1);
        iterar[1].value = String(contador2);
        iterar[2].value = String((contador2 + contador1)); // Informacion grafica de barras

        data.push({
          analito: i,
          informacion: [
            {
              sede: x.Sede,
              unidad: x.Unidad,
              programa: x.Programa,
              equipo: x.Equipo,
              reactivo: x.Reactivo,
              lineas: {
                desvio: { name: x.Sede, type: "line", data: desvio },
                zScore: { name: x.Sede, type: "line", data: zScore },
                barra: iterar
              }
            }
          ]
        });
      });
    });

    analitos.map(x => {
      agrupado.push(data.filter(y => y.analito === x));
    })

    agrupadoreturn = agrupado.map((y: any) => {
      let informacion = []
      y.map(z => {
        informacion.push(z.informacion[0])
      })
      return { base64Grafica: [], analito: y[0].analito, lineas: informacion }
    })
    this.datosCompletosOrdenados = [...agrupadoreturn];
    this.pdf2Reporte2([...agrupadoreturn])
  }

  datosClienteSelect(z) {
    this.reporteCuantitativoService.getDatosLabXcliente(z).subscribe(x => this.datosLab = { ...x });
  }

  consultarReporte2() {
    if (this.formCuantitativoReporte2.invalid) {
      this.formCuantitativoReporte2.markAllAsTouched();
      return
    }
    this.dataTablaReporte2 = [];
    this.dataBarraReporte2 = [];
    this.graficasReporte2 = [];
    this.headerMayor = [];

    let data = {
      Idprogram: this.formCuantitativoReporte2.get('Idprogram')?.value,
      Idanalyzer: this.formCuantitativoReporte2.get('Idanalyzer')?.value.join(),
      IdAnalytes: this.formCuantitativoReporte2.get('IdAnalytes')?.value.join(),
      Idheadquarters: this.formCuantitativoReporte2.get('Idheadquarters')?.value.join(),
    }
    this.reporteCuantitativoService.getDatosReporte2(data, this.formCuantitativoReporte2.get('Nit')?.value).subscribe((resp: any) => {

      if (resp[0].Sedes.Sedes.length === 0) {
        this.toastr.error('No se encontraron datos');
        return
      }
      this.dataAnalitoFiltrada = resp[0].Sedes.Sedes;
      this.traerInfoAnalitoReporte2Individual(resp[0].Sedes.Sedes[0].Programas[0].Analitos[0].Analito);
      this.reporteDosSeleccionar(1);
      this.mostrarReportes = true;
      this.mostrarBotonExportar = true;
    }, err => {
      this.dataTablaReporte2 = [];
      this.dataBarraReporte2 = [];
      this.graficasReporte2 = [];
      this.dataLineasReporte2 = [];
      this.datosCompletosOrdenados = [];
      this.headerMayor = [];
      this.seccionSeleccionado = '';
      this.mostrarReportes = false;
      this.mostrarBotonExportar = false;
      this.toastr.error('No se encontraron datos');
    })
  }

  obtenerGraficas(num: number, base64: string) {
    this.graficasReporte2[num] = base64;
  }

  crearColumnas(): any[] {
    let newArray = [];
    this.dataTablaReporte2.map(async (x: any, index: number) => {
      newArray[index] = new Stack([
        new Columns([
          new Stack([
            x.titulo.map((y: any, j: number) => {
              return new Txt(y).alignment('right').color('#3A49A5').bold().end
            })
          ]).noWrap().end,
          new Stack([
            x.informacion.map((y: any, j: number) => {
              return new Txt(y).alignment('left').end
            })
          ]).end,
          new Stack([
            x.sedeNumber.map((y: any, j: number) => {
              if (j === 0) {
                return new Txt(y).alignment('left').color('#3A49A5').bold().end
              }
              return new Txt(y).alignment('left').end
            })
          ]).end,
          new Stack([
            x.desvio.map((y: any, j: number) => {
              if (j === 0) {
                return new Txt(y).alignment('left').color('#3A49A5').bold().end
              }
              return new Txt(y).alignment('left').end

            })
          ]).end,
          new Stack([
            x.zScore.map((y: any, j: number) => {
              if (j === 0) {
                return new Txt(y).alignment('left').color('#3A49A5').bold().end
              }
              return new Txt(y).alignment('left').end
            })
          ]).end,
        ]).columnGap(10).alignment('center').fontSize(11).margin([0, 35, 0, 20]).width('90%').end
      ]).end
    });

    return newArray
  }

  reportePDF2() {
    this.loader.show();
    this.itemSeleccionado = 4;
    setTimeout(async () => {

      PdfMakeWrapper.setFonts(pdfFonts);
      const pdf = new PdfMakeWrapper();
      pdf.pageSize('B4');
      pdf.pageMargins([30, 220, 30, 50]);
      pdf.header(
        new Stack([
          new Canvas([
            new Line([298, 70], [300, 70]).lineWidth(160).lineColor('#6E6E6E').end,
          ]).absolutePosition(-50, 55).end,
          await new Img('assets/rutas/pdfs/headerPDF.png').relativePosition(0, 0).width(700).height(100).build(),
          await new Img(this.logoSourceToPDF).width(100).height(100).relativePosition(80, 40).build(),
          '\n',

          new Stack([
            new Columns([
              new Txt(`Cliente : ${this.clienteName}`).width(200).fontSize(11).end,
              new Txt(``).fontSize(11).end,
              new Txt(``).fontSize(11).end,
            ]).end
          ]).width(100).relativePosition(20, 140).end,
          // new Txt (`Cliente : ${this.clienteName} \nNit : ${this.clienteNit}\nDirección : ${this.clienteAddres}`).relativePosition(60,140).fontSize(11).end,
          new Stack([
            new Txt('Reporte Consolidado\nCuantitativo').margin([250, 0, 0, 20]).bold().fontSize(20).end
          ]).margin(20).end
        ]).width('100%').height('auto').alignment('left').end
      );

      pdf.add(
        this.crearColumnas()
      )
      for (const key in this.graficasReporte2) { //Graficas
        pdf.add(await new Img(this.graficasReporte2[key]).height(180).width(600).alignment('center').build());
        pdf.add('\n');
      }
      pdf.add(
        new Stack([
          new Txt([new Txt(`Homogeneidad y estabilidad:`).bold().end, ` La información relacionada con la homogeneidad y estabilidad de esta muestra ha sido declarada por el fabricante.
           `, new Txt(`Confidencialidad:`).bold().end, ` El informe presentado a continuación presenta información de caracter confidencia; la divulgación del mismo se realiza únicamente con el participante al cual corresponde; en caso que alguna autoridad requiera la socialización del mismo, esta solo se realiza con autorización expresa del participante.
           `, new Txt(`Subcontratación:`).bold().end, ` Annar Health Technologies no realiza la subcontratación de actividades relacionadas con la planificación, análisis y emisión de los reportes de resultados relacionados con los reportes de control de calidad externo.
           `, new Txt(`Autorizado por:`).bold().end, ` Leydy Paola González, Especialista de producto.
           `]).end
        ]).end
      )

      async function getBase64ImageFromUrl(imageUrl) {
        var res = await fetch(imageUrl);
        var blob = await res.blob();

        return new Promise((resolve, reject) => {
          var reader = new FileReader();
          reader.addEventListener("load", function () {
            resolve(reader.result);
          }, false);

          reader.onerror = () => {
            return reject(this);
          };
          reader.readAsDataURL(blob);
        })
      }
      function footerFunc(img) {
        pdf.footer(function (page: any, pages: any) {
          return {
            // margin: [5, 0, 10, 0],
            height: 30,
            columns: [
              {
                alignment: "center",
                image: img,

                fit: [700, 100],
                absolutePosition: { x: 10, y: 10 }
              },
              {
                text: [
                  { text: 'Pag ' + page.toString() },
                  " - ",
                  { text: pages.toString() }
                ],
                color: 'white',
                fontSize: 8,
                absolutePosition: { x: 640, y: 38 }
              },

            ],

          }
        });
      }
      let base64Footer: any = '';
      await getBase64ImageFromUrl('assets/rutas/pdfs/footerPDF.png')
        .then(result => base64Footer = result)
        .catch(err => console.error(err));
      footerFunc(base64Footer);
      pdf.create().open();
      this.loader.hide();
      this.itemSeleccionado = 1;
    }, 3000);
  }

  iterarTablasCompletasAnlitos(informacionTabla: TablaAnalitos[]) {
    let newArray = [];
    informacionTabla.map(async (x: TablaAnalitos, index: number) => {
      newArray[index] = x.lineas.map((infoTablas, index2: number) => {
        let numIterar = 0;
        let arrIterar = [];
        const desvio = infoTablas.lineas.desvio.data.length;
        const zScore = infoTablas.lineas.zScore.data.length;
        desvio > zScore ? numIterar = desvio : numIterar = zScore;
        for (let index = 0; index < numIterar; index++) {
          arrIterar.push(index + 0);
        }
        const imagenesGrafica = (): any => {
          let data = {}
          if ((x.lineas.length - 1) === index2) {
            data = x.base64Grafica.map(img => {
              return {
                alignment: "center",
                image: img,
                height: 180,
                width: 600,
              }
            })
          }
          return data
        }

        return new Stack([
          new Columns([
            new Stack([
              new Txt('Red de laboratorios').color('#3A49A5').bold().alignment('right').end,
              new Txt('Programa').color('#3A49A5').bold().alignment('right').end,
              new Txt('Datos laboratorio').color('#3A49A5').bold().alignment('right').end,
              new Txt('Sistema medición/Equipo').color('#3A49A5').bold().alignment('right').end,
              new Txt('Reactivo').color('#3A49A5').bold().alignment('right').end,
              new Txt('Analito').color('#3A49A5').bold().alignment('right').end,
              new Txt('Unidades').color('#3A49A5').bold().alignment('right').end,
            ]).width(150).noWrap().end,
            new Stack([
              new Txt('ANNAR DX').alignment('left').end,
              new Txt(infoTablas.programa).alignment('left').end,
              new Txt(infoTablas.sede).alignment('left').end,
              new Txt(infoTablas.equipo).alignment('left').end,
              new Txt(infoTablas.reactivo).alignment('left').end,
              new Txt(x.analito).alignment('left').end,
              new Txt(infoTablas.unidad).alignment('left').end,
            ]).width(250).end,
            new Stack([
              new Txt(infoTablas.sede).color('#3A49A5').bold().alignment('center').end,
              arrIterar.map(item => new Txt(String((parseInt(item) + 1))).alignment('center').end)
            ]).noWrap().width(80).end,
            new Stack([
              new Txt('Índice desvío').color('#3A49A5').bold().alignment('center').end,
              infoTablas.lineas.desvio.data.map(item => new Txt(String(item)).alignment('center').end)
            ]).noWrap().width(80).end,
            new Stack([
              new Txt('Z-score').color('#3A49A5').bold().alignment('center').end,
              infoTablas.lineas.zScore.data.map(item => new Txt(String(item)).alignment('center').end)
            ]).noWrap().width(80).end,
          ]).columnGap(5).alignment('left').fontSize(11).width('95%').end,
          imagenesGrafica(),
          index2 + 1 === x.lineas.length && (index + 1) !== informacionTabla.length ? new Txt('').pageBreak('after').end : new Txt('').pageOrientationAndBreak('portrait', 'after').end,
          index2 + 1 === x.lineas.length && (index + 1) === informacionTabla.length ? new Stack([
            new Txt([new Txt(`Homogeneidad y estabilidad:`).bold().end, ` La información relacionada con la homogeneidad y estabilidad de esta muestra ha sido declarada por el fabricante.
             `, new Txt(`Confidencialidad:`).bold().end, ` El informe presentado a continuación presenta información de caracter confidencia; la divulgación del mismo se realiza únicamente con el participante al cual corresponde; en caso que alguna autoridad requiera la socialización del mismo, esta solo se realiza con autorización expresa del participante.
             `, new Txt(`Subcontratación:`).bold().end, ` Annar Health Technologies no realiza la subcontratación de actividades relacionadas con la planificación, análisis y emisión de los reportes de resultados relacionados con los reportes de control de calidad externo.
             `, new Txt(`Autorizado por:`).bold().end, ` Leydy Paola González, Especialista de producto.
             `]).end
          ]).margin([30, 0]).end : ''
        ]).end
      });
    })

    return newArray
  }

  pdf2Reporte2(informacionTabla: TablaAnalitos[]) {
    this.loader.show();
    this.itemSeleccionado = 5;
    setTimeout(async () => {
      PdfMakeWrapper.setFonts(pdfFonts);
      const pdf = new PdfMakeWrapper();
      pdf.pageSize('B4');
      pdf.pageMargins([5, 250, 30, 50]);
      pdf.header(
        new Stack([
          new Canvas([
            new Line([298, 70], [300, 70]).lineWidth(200).lineColor('#6E6E6E').end,
          ]).absolutePosition(-50, 55).end,
          await new Img('assets/rutas/pdfs/headerPDF.png').relativePosition(0, 0).width(700).height(100).build(),
          await new Img(this.logoSourceToPDF).width(100).height(100).relativePosition(80, 40).build(),
          '\n',

          new Stack([
            new Columns([
              new Txt(`Cliente : ${this.clienteName}`).width(200).fontSize(11).end,
              new Txt(``).fontSize(11).end,
              new Txt(``).fontSize(11).end,
            ]).end
          ]).width(100).relativePosition(20, 140).end,
          // new Txt (`Cliente : ${this.clienteName} \nNit : ${this.clienteNit}\nDirección : ${this.clienteAddres}`).relativePosition(60,140).fontSize(11).end,
          new Stack([
            new Txt('Reporte de Analitos\nCuantitativos').margin([250, 0, 0, 20]).bold().fontSize(20).end
          ]).margin(20).end
        ]).width('100%').height('auto').alignment('left').end
      );

      pdf.add(this.iterarTablasCompletasAnlitos(informacionTabla).reduce((a, b) => a.concat(b), []));

      async function getBase64ImageFromUrl(imageUrl) {
        var res = await fetch(imageUrl);
        var blob = await res.blob();

        return new Promise((resolve, reject) => {
          var reader = new FileReader();
          reader.addEventListener("load", function () {
            resolve(reader.result);
          }, false);

          reader.onerror = () => {
            return reject(this);
          };
          reader.readAsDataURL(blob);
        })
      }
      function footerFunc(img) {
        pdf.footer(function (page: any, pages: any) {
          return {
            // margin: [5, 0, 10, 0],
            height: 30,
            columns: [
              {
                alignment: "center",
                image: img,

                fit: [700, 100],
                absolutePosition: { x: 10, y: 10 }
              },
              {
                text: [
                  { text: 'Pag ' + page.toString() },
                  " - ",
                  { text: pages.toString() }
                ],
                color: 'white',
                fontSize: 8,
                absolutePosition: { x: 640, y: 38 }
              },

            ],

          }
        });
      }
      let base64Footer: any = '';
      await getBase64ImageFromUrl('assets/rutas/pdfs/footerPDF.png')
        .then(result => base64Footer = result)
        .catch(err => console.error(err));
      footerFunc(base64Footer);
      pdf.create().open();
      this.itemSeleccionado = 1;
      this.loader.hide();
    }, 3000);
  }


  activarTodos(event: any) {

    if (this.jsonResumenMuestra.DataAnalytes.length) {
      this.listAnalytesReport.forEach((item) => {
        let current = `analyte_${item.idAnalytes}_analyzer_${item.idAnalyzer}`;
        this.formSystem.get(current).setValue("")
        item.isSelect = false;
      });
    }

    this.allAnalytes = event.checked;

    if (event.checked) {
      this.allAnalytes = event.checked;
      this.jsonResumenMuestra = {
        Idprogram: this.formaCuantitativo.value.programa,
        IdAnalytes: this.formaCuantitativo.value.analyte.join(),
        Nroround: this.formaCuantitativo.value.ronda,
        Idclient: this.formaCuantitativo.value.idclient,
        Idsede: this.formaCuantitativo.value.idsede,
        IdSample: this.listAnalytesReport[0].idSample,
        dataGenerate: this.formaCuantitativo.value.dataGenerate,
        DataAnalytes: [
          {
            IdAnalytes: -1,
            IdAnalyzer: -1,
            statisticalGeneral: ""
          }
        ],
        resumenRonda:[
          {
            idSample: -1,
            idAnalytes: -1,
            idAnalyzer: -1,
            statisticalGeneral: ""
          }
        ]
      }

    } else {
      this.jsonResumenMuestra.DataAnalytes = [];
      this.jsonResumenMuestra.resumenRonda = [];
      this.sistema.setValue("")
    }
  }



  async traerAnalitos(muestra: any) {
    this.listAnalytesReport = this.respuestaBusqueda[0].Data
                                  .filter(e => e.serialSample == muestra)
                                  .map(e => {
                                    e.isSelect = false;
                                    return e
                                  });

    this.reconstructRoundSummaryInformation(this.listAnalytesReport[0]);
    this.allAnalytes = false;
    this.dataSource = new MatTableDataSource<any>(this.listAnalytesReport);
  
    //Según requerimiento en el tag de resumen de muestra solo puede mostrar hasta la muestra que se selecciono
    //las muestras con el numero mayor no se tendran en cuenta.
    let obtDataTableSamples = [];

    let dataMuestra = this.respuestaBusqueda[0].Evaluacion.Analitos
    .filter(e => e.Serialsample === muestra)
    .map(e => {
      return e
    });

    this.respuestaBusqueda[0].Evaluacion.Analitos.map(y =>{
     
        if(y.ValueEjex < dataMuestra[0].ValueEjex && !obtDataTableSamples.find(z=>z.Serialsample === y.Serialsample)){
          obtDataTableSamples.push({Serialsample:y.Serialsample,idSample:y.idSample, nroSample: y.nroSample, statisticalGeneral:y.statisticalGeneral})
        }      
      
    });

    this.dataSourceMuestra = new MatTableDataSource<any>(obtDataTableSamples.map(x => {x.statisticalGeneral = null;return x;}));
    this.crearFormularioTabla();
    // ✅ Lógica mínima para activar el toastr cuando cambie la fecha
    const recepcionControl = this.formaSelecionMuestra?.get('recepcion');
    const calidadControl = this.formaSelecionMuestra?.get('calidad');

    if (recepcionControl && !recepcionControl['_hasToastrSubscription']) {
      recepcionControl['_hasToastrSubscription'] = true; // solo una vez

      recepcionControl.valueChanges.subscribe(() => {
        if (!calidadControl?.value) {
          this.toastr.warning('Debe seleccionar si la muestra fue recibida en buen estado', 'Atención');
        }
      });
    }
    
  }

  reconstructRoundSummaryInformation(sample:any){ 
    this.jsonResumenMuestra.resumenRonda = [];
    this.jsonResumenMuestra.resumenRonda = this.respuestaBusqueda[0].Evaluacion.Analitos.filter(e=>e.nroSample <= sample.nroSample)
    .map(e => {
      return {
        idSample: e.idSample,
        idAnalytes: e.idAnalytes, 
        idAnalyzer: e.idAnalyzer,
        statisticalGeneral: e.systemMeditionRR,
      }
    });
  }


  crearFormularioTabla() {
    this.formSystem = this.fb.group({});
    this.listAnalytesReport.forEach((item) => {
      let current = `analyte_${item.idAnalytes}_analyzer_${item.idAnalyzer}`;
      this.formSystem.addControl(current, new FormControl(''));
    });
  }

  limpiarFormulario(borrar: boolean) {
    if (!borrar) {
      this.listAnalytesReport.forEach((item) => {
        let current = `analyte_${item.idAnalytes}_analyzer_${item.idAnalyzer}`;
        this.formSystem.get(current).setValue("");
      });
    }
  }

  AgregarAnalito(event: any, analito, id, idAnalyzer) {
    const controlName = `analyte_${id}_analyzer_${idAnalyzer}`;
    const formControl = this.formSystem.get(controlName);
    
    if (formControl) {
      formControl.setValue(event); 
    }

    let item = this.listAnalytesReport.find(e => e.idAnalytes == id && e.idAnalyzer == idAnalyzer);
    if (item) {
      item.isSelect = event
    }
    if (event) {
        let jsonData = this.jsonResumenMuestra.DataAnalytes.find(x=>x.IdAnalytes === id && x.IdAnalyzer == idAnalyzer);

        if(jsonData === undefined){
          this.jsonResumenMuestra.DataAnalytes.push({
            IdAnalytes: id,
            IdAnalyzer: idAnalyzer,
            statisticalGeneral: ""
          });
        }
    }
  }

  reiniciarAnalitos() {
    this.formaSelecionMuestra.reset()
    this.jsonResumenMuestra.DataAnalytes = [];
    this.allAnalytes = false;
  }


  selectSistema(event: any) {

    if (this.jsonResumenMuestra.DataAnalytes && this.jsonResumenMuestra.DataAnalytes.length) {
      let item = this.jsonResumenMuestra.DataAnalytes.find(e => e.IdAnalytes === -1 && e.IdAnalyzer === -1)
      if (item) {
        item.statisticalGeneral = event.value
      }
    }

    if (this.jsonResumenMuestra.resumenRonda && this.jsonResumenMuestra.resumenRonda.length) {
      let item = this.jsonResumenMuestra.resumenRonda.find(e => e.idAnalytes === -1 && e.idAnalyzer === -1 && e.idSample === -1)
      if (item) {
        item.statisticalGeneral = event.value
      }
    }
  }

  
  selectBorrador(event: any) {
    let dato = JSON.parse(event.value);
    this.tipoGeneracion = dato;
  }

  selectSistemInInput(value: any, datos: any) {
    this.AgregarAnalito(value,'', datos.idAnalytes, datos.idAnalyzer);
    let item = this.jsonResumenMuestra.DataAnalytes.find(e => e.IdAnalytes == datos.idAnalytes && e.IdAnalyzer == datos.idAnalyzer);
    let item2 = this.jsonResumenMuestra.resumenRonda.find(e => e.idAnalytes == datos.idAnalytes && e.idAnalyzer == datos.idAnalyzer && e.idSample === datos.idSample);

    if (item) {
      item.statisticalGeneral = value;
    }
    
    if (item2) {
      item2.statisticalGeneral = value;
    }
  }

  filtrosAutocomplete() {

    this.filterCliente.valueChanges.subscribe(word => {
      if (word) {
        this.clientes = this.clientesCopy.filter((item: any) => {
          return item.name.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.clientes = this.clientesCopy;
      }
    });

    this.filterSede.valueChanges.subscribe(word => {
      if (word) {
        this.sedes = this.sedesCopy.filter((item: any) => {
          return item.desheadquarters.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.sedes = this.sedesCopy;
      }
    });

    this.filterPrograma.valueChanges.subscribe(word => {
      if (word) {
        this.programas = this.programasCopy.filter((item: any) => {
          return item.Desprogram.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.programas = this.programasCopy;
      }
    });

    this.filterAnalito.valueChanges.subscribe(word => {
      if (word) {
        this.analitos = this.analitosCopy.filter((item: any) => {
          return item.Desanalytes.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.analitos = this.analitosCopy;
      }
    });
    this.filterAnalito2.valueChanges.subscribe(word => {
      if (word) {
        this.analitosList = this.analitosListCopy.filter((item: any) => {
          return item.Desanalytes.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.analitosList = this.analitosListCopy;
      }
    });

    this.filterEquipo.valueChanges.subscribe(word => {
      if (word) {
        this.equipoList = this.equipoListCopy.filter((item: any) => {
          return item.nameAnalyzer.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.equipoList = this.equipoListCopy;
      }
    });

  }

  selectSistemInInputSampleAnalyte(value: any, id: any, idsample: any, idAnalyzer: any) {
    let item = this.jsonResumenMuestra.resumenRonda.find(e => e.idAnalytes === id && e.idSample == idsample && e.idAnalyzer == idAnalyzer);
    if (item) {
      item.statisticalGeneral = value;
    }
  }

  seleccionMuestraParametros(asignacionparametros: TemplateRef<any>, rowSample:any){

    this.listAnalytesReport = this.respuestaBusqueda[0].Evaluacion.Analitos
    .filter(e => e.idSample === rowSample.idSample)
    .map(e => {
      e.isSelect = false;
      return e
    });
    
    this.allAnalytes = false;

    this.dataSourceAsigMuestra = new MatTableDataSource<any>(this.listAnalytesReport);

    this.listAnalytesReport.forEach(dt => {
      // Verificar si existe el analito, el equipo y muestra en el json
      let existe = this.jsonResumenMuestra.resumenRonda.some(rr => rr.idSample === dt.idSample
                                                              && rr.idAnalytes == dt.idAnalytes
                                                              && rr.idAnalyzer == dt.idAnalyzer
      );
      
      let systemMedition = '';
      if(dt.existsHistoricRR){
        systemMedition = dt.systemMeditionRR;
      }
      
      // Si no existe, agregamos la relación al json
      if (!existe) {
        const arrResumenRonda = {
          idSample: dt.idSample,
          idAnalytes: dt.idAnalytes,
          idAnalyzer: dt.idAnalyzer,
          statisticalGeneral: systemMedition,
        };
        this.jsonResumenMuestra.resumenRonda.push(arrResumenRonda);
      }
    });

    try {
      const destroy$: Subject<boolean> = new Subject<boolean>();
      /* Variables recibidas por el modal */
      const data: ModalData = {
        content: asignacionparametros,
        btn: 'Aceptar',
        btn2: 'Cerrar',
        footer: true,
        title: 'Asignación de parámetros - Muestra:  ' + this.listAnalytesReport[0].Serialsample,
        image: 'assets/rutas/iconoParametros.png'
      };
      const dialogRef = this.dialog.open(ModalGeneralComponent, { height: 'auto', width: '40em', data, disableClose: true });

      dialogRef.componentInstance.primaryEvent?.pipe(takeUntil(destroy$)).subscribe(x => {
        if (this.formaSelecionMuestra.invalid) {
          this.formaSelecionMuestra.markAllAsTouched();
          return
        }
        dialogRef.close();
      });

    } catch (error) {
      //this.loaderService.hide()
    }
  }

  generateTableRows(data): string {
    return data.map(row => `
      <tr>
      <td>${row.Sample}</td>
      <td>${row.Analyte}</td>
      </tr>
      `).join('');
    }
    
    async openModalConditionsSample(templateReportQuantitative: TemplateRef<any>) {

      const destroy$: Subject<boolean> = new Subject<boolean>();
      
      const data: ModalData = {
        content: templateReportQuantitative,
        btn: 'Guardar',
        btn2: 'Cerrar',
        footer: true,
        title: 'Observación del reporte',
        image: 'assets/rutas/iconos/IconObservationReport.png',
      };

      const dialogRef = this.dialog.open(ModalGeneralComponent, {
        height: '28em',
        width: '88em',
        data,
        disableClose: true
      });

      dialogRef.componentInstance.primaryEvent?.pipe(takeUntil(destroy$)).subscribe(async () => {
        if (this.formStatusSample.invalid) {
          this.formStatusSample.markAllAsTouched();
          return;
        }

      await this.generarPdf(false);

      dialogRef.close();
    });
  }
  
  async consultAnalyticalProblems(idRound:number, idHeadQuarters: number){
    this.AnalyticalProblemsService.GetAnalyricalProblemsRound(idRound, idHeadQuarters).subscribe({
      next: (returnAnalyticalProblems: any) => {
        this.problemsAnalytical = returnAnalyticalProblems;
      },
      error: (err) => {
        this.toastr.info(err.error.message);
        return;
      },
    });
  }
}