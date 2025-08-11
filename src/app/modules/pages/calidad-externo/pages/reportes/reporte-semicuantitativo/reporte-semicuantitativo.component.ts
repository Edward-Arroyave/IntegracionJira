import { Component, ElementRef, OnInit, QueryList, TemplateRef, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { lastValueFrom, Observable, Subject, timer } from 'rxjs';
import { map, startWith, takeUntil } from 'rxjs/operators';
import $ from 'jquery';
import { ProgramConfClientHeaderqQceService } from '@app/services/calidad-externo/program-conf-client-headerq-qce.service';
import { RondasQceService } from '@app/services/configuracion/rondas-qce.service';
import { LotesQceService } from '@app/services/calidad-externo/lotsQce.service';
import { AnalytesQceService } from '@app/services/calidad-externo/AnalytesQce.service';
import { LaboratoriosService } from '@app/services/configuracion/laboratorios.service';
import * as echarts from 'echarts';
import { PdfSemicualitativoService } from '@app/services/pdfs/pdf-semicualitativo.service';
import { ImageCdnPipe } from '../../../../../core/pipes/image-cdn.pipe';
import { CargadorComponent } from '../../../../../shared/cargador/cargador.component';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatOptionModule } from '@angular/material/core';
import { NgFor, NgIf, NgClass, NgSwitch, NgSwitchCase, NgTemplateOutlet, NgStyle, AsyncPipe, TitleCasePipe } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon, MatIconRegistry } from '@angular/material/icon';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { DomSanitizer } from '@angular/platform-browser';
import { LoaderService } from '@app/services/loader/loader.service';
import { PublicService } from '@app/services/public.service';
import { ClientesService } from '@app/services/configuracion/clientes.service';
import { ProgramasQceService } from '@app/services/configuracion/programas-qce.service';
import { ReportesExternoService } from '@app/services/calidad-externo/reportesExterno.service';
import { SampleQceService } from '@app/services/calidad-externo/SampleQce.service';
import { ModalGeneralComponent } from '@app/modules/shared/modals/modal-general/modal-general.component';
import { ModalData } from '@app/Models/Modaldata';
import { MatDialog } from '@angular/material/dialog';
import { LogsService } from '@app/services/configuracion/logs.service';
import { Router } from '@angular/router';
import { EstadisticaSemiCuantitativaQce } from '@app/services/calidad-externo/EstadisticaSemiCuantitativaQce.service';
import { AnalyticalProblemsService } from '@app/services/calidad-externo/AnalyticalProblems.service';
import { MatNativeDateModule } from '@angular/material/core'; // Requerido por el datepicker
import { MatRadioModule } from '@angular/material/radio';
import { MatDatepickerModule } from '@angular/material/datepicker';
import moment from 'moment';
import dayjs from 'dayjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reporte-semicuantitativo',
  templateUrl: './reporte-semicuantitativo.component.html',
  styleUrls: ['./reporte-semicuantitativo.component.css'],
  standalone: true,
  imports: [FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    NgFor,
    MatOptionModule,
    MatTooltipModule,
    NgIf,
    MatSelectModule,
    NgClass,
    NgSwitch,
    NgSwitchCase,
    NgTemplateOutlet,
    CargadorComponent,
    NgStyle,
    AsyncPipe,
    TranslateModule,
    ImageCdnPipe,
    MatIcon,
    TitleCasePipe,
    NgxMatSelectSearchModule,
    MatRadioModule,
    MatDatepickerModule,
  ]
})
export class ReporteSemicuantitativoComponent implements OnInit {
  @ViewChild('item_1') item_1: ElementRef;
  @ViewChild('scroll') scroll: ElementRef;
  @ViewChildren('grafZscore') chartElements!: QueryList<ElementRef>;
  
  
    //predictivos
    filteredOptionsProgram: Observable<string[]>;
    listprogram: any = [];
    listprogramCopy: any = [];
    filteredOptionsRonda: Observable<string[]>;
    listRonda: any;
    filteredOptionsLote: Observable<string[]>;
    listLote: any;
    filteredOptionsSample: Observable<string[]>;
    listSample: any;
    filteredOptionsAnalito: Observable<string[]>;
    listAnalito: any;
    chartDom: any;
  
    arrGraficasUno: any[] = [];
    arrGraficasDos: any[] = [];
    arrGraficasTres: any[] = [];
    arrGraficasCuatro: any[] = [];
    arrImgGraficasUno: any[] = [];
    arrImgGraficasDos: any[] = [];
    arrImgGraficasTres: any[] = [];
    arrImgGraficasCuatro: any[] = [];
  
    formulario: FormGroup = this.fb.group({
      idclient: ['', [Validators.required]],
      idsede: ['', [Validators.required]],
      idProgram: ['', [Validators.required]],
      idRonda: ['', [Validators.required]],
      idMuestra: ['', [Validators.required]],
      idAnalito: ['', [Validators.required]],
    });
    
    formStatusSample: FormGroup = this.fb.group({
      typeSample: ['', Validators.required],
      sampleConditions: ['', Validators.required],
      dateReception: ['', Validators.required],
      sampleReceived: ['', Validators.required],
      observations: ['', [Validators.minLength(3), Validators.maxLength(200)]],
    });

  
    graficasBase64: any = {
      cont1: [],
      cont2: [],
      zscore: [],
      cont3: {
        graf1: '',
        graf2: []
      },
      cont4: {
        graf1: '',
        graf2: []
      }
    };
    idRound:number;
    rondas: any;
    indexSelect = 0;
    verInfo: boolean = false;
    lotes: any;
    muestras: any;
    programaSeleccionado: any;
    rondaSeleccionada: any;
    loteSeleccionado: any;
    MuestraSeleccionada: any;
    analytes: any = [];
    analytesCopy: any = [];
    analitoSeleccionado: any;
    datosFiltro: any;
    sliderAnalitos: any;
    tablaEvaluacion: any;
    dataSlider: any;
    grapZscore: any;
    idClient: any;
    imgFilter = [
      {
        id: 1,
        img: 'btn_ensayo.png',
        flag: true
      },
      {
        id: 2,
        img: 'btn_iconStar.png',
        flag: true
      },
      {
        id: 3,
        img: 'btn_graficaConcord.png',
        flag: false
      },
      {
        id: 4,
        img: 'btn_consenso.png',
        flag: false
      },
    ]
    itemSelected: number = 1;
    datosGraf: any;
    verInterpret: boolean;
    dataSeriesX: any = [];
    graficaSelect: any = 2;
    headersTabla: any = [];
    dataGrafEstGenMetVal: any = [];
    dataGrafEstGenVal: any = [];
    dataAnalitoTblConcord: { idAnalytes: number; desAnalytes: string; Muestras: { samples: string; total: number; aceptados: number; rechazados: number; acepPorcentaje: any; recPorcentaje: string; }[]; GraficaGeneral: { aceptado: any; rechazado: string; }[]; };
    arrDataGraf2: any = [];
    dataConcordancia: any;
    dataFinCiclo: any;
    showOverlay: boolean = false;
  
    cliente: any;
    sedes: any[] = [];
    sedesCopy: any[] = [];
    clientes: any[] = [];
    clientesCopy: any[] = [];
    programas: any[] = [];
    programasCopy: any[] = [];
    participante: any = '';
    codigoparticipante: any = '';
    clienteSeleccionado: any = '';
    confStatisticalSemiCuantitive: any[] = [];
  
    filterCliente = new FormControl('');
    filterSede = new FormControl('');
    filterAnalito = new FormControl('');
    filterPrograma = new FormControl('');
    form2: FormGroup;

    problemsAnalytical: any = [];
    viewButtonReport: boolean = false;
    fechaActual = dayjs().format('YYYY-MM-DD');

    constructor(
      private fb: FormBuilder,
      private toastr: ToastrService,
      private translate: TranslateService,
      private programConfClientHeaderqQceService: ProgramConfClientHeaderqQceService,
      private rondasQceService: RondasQceService,
      private laboratoriosService: LaboratoriosService,
      private lotesQceService: LotesQceService,
      private analytesQceService: AnalytesQceService,
      private SampleQceService: SampleQceService,
      private pdfSemicualitativoService: PdfSemicualitativoService,
      private loader:LoaderService,
      private matIconRegistry: MatIconRegistry,
      private sanitizer: DomSanitizer,
      private publicService: PublicService,
      private clientesService: ClientesService,
      private programQceService: ProgramasQceService,
      private reportesExternoService: ReportesExternoService,
      private dialog: MatDialog,
      private logsService: LogsService,
      private router: Router,
      private EstadisticaSemiCuantitativaQce: EstadisticaSemiCuantitativaQce,
      private AnalyticalProblemsService: AnalyticalProblemsService
    ) { 
      this.matIconRegistry.addSvgIcon("score",this.sanitizer.bypassSecurityTrustResourceUrl("../assets/rutas/iconos/zscore.svg"));
      this.matIconRegistry.addSvgIcon("table_check",this.sanitizer.bypassSecurityTrustResourceUrl("../assets/rutas/iconos/listado.svg"));
      this.matIconRegistry.addSvgIcon("ciclo",this.sanitizer.bypassSecurityTrustResourceUrl("../assets/rutas/iconos/ciclo.svg"));
      this.matIconRegistry.addSvgIcon("bar",this.sanitizer.bypassSecurityTrustResourceUrl("../assets/rutas/iconos/desempeño-global.svg"));
    }
  
    ngOnInit(): void {
      this.filtrosAutocomplete();
      this.cargarGestionLab();
      this.crearForm2();
    }
  
    cargarGestionLab() {
      this.laboratoriosService.getAllAsync().then(respuesta => {
        this.cliente = respuesta[0].header;
        this.participante = respuesta[0].name;
        this.codigoparticipante = respuesta[0].codecliente;
        this.cargarSelects();
        
      });
    } 
  
    crearForm2() {
      this.form2 = this.fb.group({
        Idprogram: [, [Validators.required]],
        Idanalyzer: [, [Validators.required]],
        Idheadquarters: [, [Validators.required]],
        IdAnalytes: [[], [Validators.required]],
        Nit: [null, [Validators.required]]
      });
  
        this.form2.get('Idprogram').valueChanges.subscribe(x => {
  
          if(x !== null && x !== ''){
            this.reportesExternoService.getAnalitos(x).subscribe((datos: any) => {
              this.analytes = datos;
              this.analytesCopy = datos;
            }, _ => {
              this.analytes = [];
              this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.NOHAYANALITOS'));
            });
          }
        });
      
    }
  
  async consultarProgramas() {
  
    if(this.formulario.get('idsede')?.value !== ''){
      let idsede = this.formulario.get('idsede')?.value;
      let nit = this.form2.value.Nit;
      if ( idsede ){
        nit = this.clientes.filter(x => x.idclient === this.formulario.get('idclient')?.value)[0].nit;
      }else{
        idsede = this.form2.get('Idheadquarters')?.value;
      }
    
      await this.getProgram(idsede, nit);
    }
  }
  
    async cargarSelects(header?: string) {
      this.clientes = await this.clientesService.getAllAsync();
      this.clientes = this.clientes.filter(z => z.header);
      this.clientesCopy = this.clientes.filter(z => z.header);
      if (header) {
        const idcliente = this.clientes.filter(x => String(x.header).toLocaleLowerCase() === String(header).toLocaleLowerCase())[0].idclient
        this.formulario.get('idclient').setValue(idcliente)
        this.cargarSedes(this.clientes.filter(x => String(x.header).toLocaleLowerCase() === String(header).toLocaleLowerCase())[0].header);
        this.formulario.get('idclient').setValue(this.clientes.filter(x => x.header === header)[0].idclient)
      }
    }
  
    async cargarSedes(id) {
      this.formulario.get('idsede').setValue('');
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
  
    filtrosAutocomplete(){
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
          this.listprogram = this.listprogramCopy.filter((item: any) => {
            return item.desprogram.toLowerCase().includes(word.toLowerCase());
          });
        } else {
          this.listprogram = this.listprogramCopy;
        }
      });
      this.filterAnalito.valueChanges.subscribe(word => {
        if (word) {
          this.analytes = this.analytesCopy.filter((item: any) => {
            return item.desanalytes.toLowerCase().includes(word.toLowerCase());
          });
        } else {
          this.analytes = this.analytesCopy;
        }
      });
  
    }
  
    get idProgramNoValido() {
      return this.formulario.get('idProgram');
    }
    get idRondaNoValido() {
      return this.formulario.get('idRonda');
    }
    get idmuestraNoValido() {
      return this.formulario.get('idMuestra');
    }
    get idAnalitoNoValido() {
      return this.formulario.get('idAnalito');
    }
  
  
    private _filterProgramsCreate(value: string): string[] {
      const filterValue = value.toLowerCase();
      return this.listprogram.filter(result => result.desprogram.toLowerCase().includes(filterValue));
    }
  
    private _filterRondasCreate(value: string): string[] {
      const filterValue = value;
      return this.rondas;
    }
  
    private _filterLotesCreate(value: string): string[] {
      const filterValue = value.toLowerCase();
      return this.lotes.filter(result => result.numlot.includes(filterValue));
    }
  
    private _filterMuestrasCreate(value: string): string[] {
      const filterValue = value.toLowerCase();
      return this.muestras.filter(result => result.Serialsample.includes(filterValue));
    }
  
    private _filterAnalitosCreate(value: string): string[] {
      const filterValue = value.toLowerCase();
      return this.analytes.filter(result => result.desanalytes.includes(filterValue));
    }
  
    selectNone(control: string) {
      this.formulario.get(control).setValue('');
    }
    selectAll(control: string) {
      this.formulario.get(control).setValue(['-1']);
    }
  
    selectOne(control: string) {
      if (this.formulario.get(control).value[0] == '-1' || this.formulario.get(control).value[0] == '') {
        this.formulario.get(control).value.shift();
        this.formulario.get(control).setValue(this.formulario.get(control).value);
      }
    }
  
  
    async getProgram(idsede: number, nit: any) {
      this.formulario.get('idProgram').setValue('');
      this.laboratoriosService.getAllAsync().then(async lab => {
        await this.programConfClientHeaderqQceService.programReportSemiCualiCl(nit, idsede).then(data => {
  
          this.listprogram = [...data];
          this.listprogram.sort((a: any, b: any) => {
            a.desprogram = a.desprogram.charAt(0) + a.desprogram.slice(1);
            b.desprogram = b.desprogram.charAt(0) + b.desprogram.slice(1);
          })
  
          this.listprogram.sort((a: any, b: any) => {
            if (a.desprogram < b.desprogram) return -1;
            if (a.desprogram > b.desprogram) return 1;
            return 0;
          })
  
          this.filteredOptionsProgram = this.formulario.get('idProgram').valueChanges.pipe(
            startWith(''),
            map(value => {
              return this._filterProgramsCreate(value)
            }),
          );
        }, _ => {
          this.toastr.info('No hay programas para este filtro');
        });
      });
    }
  
    selectRonda(programa) {
      this.formulario.get('idRonda').setValue('');
      this.programaSeleccionado = programa;
      this.idClient = this.listprogram.find((x: any) => x.idProgram === programa);
      this.rondasQceService.getRoundReportCualiCl(programa, this.idClient.idClient).then((datos: any) => {
        this.rondas = datos;
        this.filteredOptionsRonda = this.formulario.get('idRonda').valueChanges.pipe(
          startWith(''),
          map(value => {
            return this._filterRondasCreate(value)
          }),
        );
      }, _ => {
        this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.NOHAYRONDAS'));
      });
    }
  
    selectLote(nroround) {
      this.formulario.get('idMuestra').setValue('');
      this.rondaSeleccionada = nroround;
      this.lotesQceService.getLotReportCualiCl(Number(this.programaSeleccionado), nroround, this.idClient.idClient).then((datos: any) => {
        this.lotes = datos;
        this.filteredOptionsLote = this.formulario.get('idLote').valueChanges.pipe(
          startWith(''),
          map(value => {
            return this._filterLotesCreate(value)
          }),
        );
      }, _ => {
        this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.NOHAYRONDAS'));
      });
    }
  
    //filtro de muestras por ronda-programa
    selectSample(nroround) {
      this.formulario.get('idMuestra').setValue('');
      this.rondaSeleccionada = nroround;
      this.SampleQceService.getSamplesByClienteReport(this.idClient.idClient, Number(sessionStorage.getItem('sede')), Number(this.programaSeleccionado), nroround).then((datos: any) => {
        this.muestras = datos;
        this.filteredOptionsSample = this.formulario.get('idMuestra').valueChanges.pipe(
          startWith(''),
          map(value => {
            return this._filterMuestrasCreate(value)
          }),
        );
      }, _ => {
        this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.NOHAYRONDAS'));
      });
    }
  
    selectAnalito(muestra:any) {
      this.formulario.get('idAnalito').setValue('');
      this.MuestraSeleccionada = muestra.IdSample;
      this.idRound = muestra.IdRound;
      this.analytesQceService.getAnalytesReportCualiClxsamples(Number(this.programaSeleccionado), this.rondaSeleccionada, muestra.IdSample, this.idClient.idClient).then((datos: any) => {
        this.analytes = datos;
        this.analytesCopy = [...datos];
      }, _ => {
        this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.NOHAYRONDAS'));
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
  
    async buscar() {
      if (this.formulario.valid) {
        this.loader.show();
        const obj =
        {
          "IdProgram": Number(this.programaSeleccionado),
          "NRound": Number(this.rondaSeleccionada),
          "IdSample": [Number(this.MuestraSeleccionada)],
          "IdAnalytes": this.formulario.value.idAnalito === "" || this.formulario.value.idAnalito === null ? [] : this.formulario.value.idAnalito,
          "IdClient": this.formulario.value.idclient,
          "idSede": this.formulario.value.idsede,
        }
  
        await this.programConfClientHeaderqQceService.PostReporteCuantitativo(obj).then(async r => {
          this.datosFiltro = r;
          
          //Validar los valores asignados, sino se mostrara un cuadro mostrando cuales faltan. 
          // 
          let withValueAssign = this.datosFiltro.filter(x=>x.ValorAsignado === '').map(y=> {
            return{
              Sample:  y.SerialSample, 
              DesAnalytes:  y.DesAnalytes,
              DesAnalyzer:  y.Name_Analyzer
            }
          });

          if(withValueAssign.length > 0){
            Swal.fire({
              title: 'Parametrización incompleta',
              titleText: " Las siguientes muestras, analitos y equipos mostrados son aquellos que faltan por parametrizar valores asignados. ",
              html: `
              <table class="table table-bordered">
              <thead>
              <tr>
              <th>Muestra</th>
              <th>Analito</th>
              <th>Equipo</th>
              </tr>
              </thead>
              <tbody>
              ${this.generateTableRows(withValueAssign)}
              </tbody>
              </table>`,
              icon: 'info'
            });
            
            this.loader.hide();
            return;
          }
          
          const objS = {
            idClient: Number(this.formulario.value.idclient),
            idSede: Number(this.formulario.value.idsede),
            idProgram: Number(this.programaSeleccionado),
            idLot: Number(this.datosFiltro[0].idLot)
          }

          this.loader.hide();
          //Llamada del servicio de traer los datos configurados en estadistica general semicuantitativa
          //Según el idlot y idprogram
          await lastValueFrom(this.EstadisticaSemiCuantitativaQce.GetConsultMatchStatisticalGeneral(objS.idClient, objS.idSede, objS.idProgram, objS.idLot)).then(async r => {
            this.confStatisticalSemiCuantitive = r;
          }).catch(err => {
            this.toastr.info(err.error);
          });
          
          this.sliderAnalitos = this.datosFiltro.filter(x=>x.IdSample === this.MuestraSeleccionada);
          this.tablaEvaluacion =  this.datosFiltro.filter(x=>x.IdSample === this.MuestraSeleccionada);
          if(this.tablaEvaluacion.length === 0){
            this.toastr.info('No hay resultados registrados de la muestra escogida');
            return;
          }

          await this.consultAnalyticalProblems(this.tablaEvaluacion[0].IdRound, this.formulario.get('idsede').value);
          this.viewButtonReport = true;
          this.dataSlider = this.tablaEvaluacion;
          this.buscarAnalitos(this.tablaEvaluacion[0], 0);
          this.verInfo = true;
            
        }).catch(err => {
          this.viewButtonReport = false;
          this.loader.hide();
          this.toastr.info('No se encontraron resultados para esta búsqueda');
          return;
        });
      } else {
        this.toastr.info('Debe ingresar los datos solicitados');
        return;
      }
    }
    
    generateTableRows(data): string {
      return data.map(row => `
      <tr>
      <td>${row.Sample}</td>
      <td>${row.DesAnalytes}</td>
      <td>${row.DesAnalyzer}</td>
      </tr>
      `).join('');
    }
  
  
    scrollCards(flow: number): void {
      this.scroll.nativeElement.scrollLeft += (136.1 * flow);
    }
  
    async buscarAnalitos(_analito: any, i?: any, btnSecc?: any, flagConsolidado: boolean = false) {
      this.analitoSeleccionado = _analito;
      this.grapZscore = _analito;
      this.dataSlider = this.datosFiltro.filter(x=>x.IdAnalytes === _analito.IdAnalytes && x.IdSample === _analito.IdSample);
      this.graficaSelect = 1;
      this.cargarGraficas();
    }

    selecItem(num:number) {
      //Logica por si ahi mas opciones de info analito
    }
  
    calcProm(data) {
      let score = 0;
      for (let item of data) {
        score += Number(item.score)
      }
      return score / data.length;
    }
  
     async graficaZscore(contSelect, it?: any, consolidado: boolean = false) {
  
      this.itemSelected = 1;
      this.graficasBase64.zscore = [];
      $("#key_1").show();
      setTimeout(async () => {
        for(let a = 0; a < this.tablaEvaluacion.length; a++){
          
          let dataGrap = this.datosFiltro.filter(x=>x.IdAnalytes === this.tablaEvaluacion[a].IdAnalytes);

          if(dataGrap.length > 0){
            this.dataSeriesX = [];
            for (let index = 0; index < dataGrap.length; index++) {
              this.dataSeriesX.push([dataGrap[index].nroSample, dataGrap[index].zscore]);
            }
            
            let chartDom = document.getElementById('chartZscore' + a);
            if (chartDom) {
              let chartInstance = echarts.getInstanceByDom(chartDom);
              if(chartInstance){
                chartInstance.dispose();
              }
            }
            
            let chartZ = echarts.init(chartDom);
            
            let optionZ = {
              xAxis: {
                type: 'value',
                boundaryGap: false,
                name:'Muestra',
                min: 0,
                max: this.tablaEvaluacion[0].ejex,
                nameLocation:'center',
                nameTextStyle: {
                  padding: [8, 8, 8, 8],
                  color:'blue'
                }
              },
              yAxis: {
                type: 'value',
                min: 0,
                max: 10,
                lineStyle: {
                  color: 'red',
                  width: 2
                }
              },
              series: [
                {
                  type: 'line',
                  symbol: 'circle',
                  symbolSize:10,
                  data: this.dataSeriesX
                },
              ]
            };
            
            await new Promise((res, e) => {
              
              let dtGrapZscore = {
                idAnalytes: this.tablaEvaluacion[a].IdAnalytes,
                grafica: ''
              }
              
              chartZ.setOption(optionZ);
              
              chartZ.resize();
        
              chartZ.on('rendered', () => res(
                dtGrapZscore.grafica = chartZ.getDataURL({
                  pixelRatio: 3,
                  backgroundColor: '#ffffff'
                })
              ));
              
              this.graficasBase64.zscore.push(dtGrapZscore);
            });
          }
        }
      }, 500);
    }
    
    async cargarGraficas(flagConsolidado: boolean = false, cont: number = 2) {
      this.showOverlay = true;
      if (this.graficaSelect == 1) {
        setTimeout( async() => {
          await this.graficaZscore(cont, 1, flagConsolidado);
        }, 500);
      } 
    }

    async generateReportSemiCuantitativo() {
  
      this.loader.show();
        this.showOverlay = false;
        let dataSede = this.sedes.find(x => x.idheadquarters === this.formulario.get('idsede').value) || null;
  
        const infoCabecera = {
          codLab: this.tablaEvaluacion[0].CodeClient,
          programa: this.formulario.get('idProgram').value,
          ronda: this.formulario.get('idRonda').value,
          sample: this.tablaEvaluacion[0].SerialSample,
          dataSede: dataSede,
          idLot: this.tablaEvaluacion[0].idLot,
          formStatusSample: this.formStatusSample.value,
          fechaImpresion: moment(this.fechaActual).format('YYYY-MM-DD'),
          fechaFinal: this.tablaEvaluacion[0].EndDate,
          yes: this.formStatusSample.get('sampleReceived')?.value == "true" ? ' X ' : '___',
          not: this.formStatusSample.get('sampleReceived')?.value == "false" ? ' X ' : '___',
        }
  
        let headerTBL = {
          headerTblCont1: ['Resultado', 'Resultado Asignado', 'Score', 'Desempeño']
        }
        
        timer(15000).subscribe( async x =>{
        
        //Nueva función para el reporte semicuantitativo
        await this.pdfSemicualitativoService.PdfSemiCuantitativo(infoCabecera, headerTBL, this.datosFiltro, this.graficasBase64.zscore, this.MuestraSeleccionada, this.confStatisticalSemiCuantitive, this.problemsAnalytical).then(async base64 => {
          this.itemSelected = 1;
          this.loader.hide();
          let datosLogs = this.datosFiltro.map(item => {
            
            const data = {
              idRound: item.IdRound,
              idSample: item.IdSample,
              serialSample: item.SerialSample,
              idAnalytes: item.IdAnalytes,
              desAnalytes: item.DesAnalytes,
              idAnalyzer: item.Id_Analyzer,
              desAnalyzer: item.Name_Analyzer,
              idReagents: item.IdReagents,
              desReagents: item.Desreagents,
              idMethod: item.IdMethod,
              desMethods: item.DesMethods,
              idUnit: item.IdUnit,
              desUnits: item.Desunits,
              resultClient: item.ResultsClient,
              valueAsign: item.ValorAsignado,
              zscore: item.zscore,
              performance: item.desempenio
            };
            
            return data;
          });

            //Insertar log
            const logs = {
              idRound: this.idRound,
              idSample: this.MuestraSeleccionada,
              nroRound: this.formulario.value.idRonda,
              tipoMuestra: this.formStatusSample.value.typeSample,
              condicionMuestra: this.formStatusSample.value.sampleConditions,
              observations: this.formStatusSample.value.observations,
              muestraRecibida: this.formStatusSample.value.sampleReceived,
              analito: this.formulario.value.idAnalito,
              idCliente: this.formulario.value.idclient,
              idSede:this.formulario.value.idsede,
              idPrograma: this.programaSeleccionado,
              fechaRecepcion: this.formStatusSample.value.dateReception,
              pdf: base64,
              fechaGeneracion: '',
              resumenRonda: datosLogs
            }
            
            await this.ventanaConfirmacionPdf(logs);
        })
      });
    }

      async ventanaConfirmacionPdf(dataLog:any){
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
            await this.logsService.createLogsReportes(dataLog, 'LogsReporteSC');
            this.toastr.success("La trazabilidad fue guardada exitosamente.");
            dialogRef.close();
          }, error: (error) => {
            this.toastr.warning("La trazabilidad del reporte no fue guardada, el cliente no podra ver el reporte descargado");
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
    
    async openModalReporteSemiCuantitativo(templateReportSemiQuantitative: TemplateRef<any>) {

      const destroy$: Subject<boolean> = new Subject<boolean>();
      
      const data: ModalData = {
        content: templateReportSemiQuantitative,
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

      await this.generateReportSemiCuantitativo();

      dialogRef.close();
    });
  }
}
  
  