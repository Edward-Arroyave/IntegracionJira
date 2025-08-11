import { Component, ElementRef, OnInit, TemplateRef, ViewChild, Sanitizer, ViewContainerRef, ViewChildren, QueryList } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject, timer } from 'rxjs';
import { map, startWith, takeUntil } from 'rxjs/operators';
import $ from 'jquery';
import { ProgramConfClientHeaderqQceService } from '@app/services/calidad-externo/program-conf-client-headerq-qce.service';
import { RondasQceService } from '@app/services/configuracion/rondas-qce.service';
import { LotesQceService } from '@app/services/calidad-externo/lotsQce.service';
import { AnalytesQceService } from '@app/services/calidad-externo/AnalytesQce.service';
import { SampleQceService } from '@app/services/calidad-externo/SampleQce.service';
import { LaboratoriosService } from '@app/services/configuracion/laboratorios.service';
import * as echarts from 'echarts';
import { PdfService } from '@app/services/pdfs/pdf.service';
import { ImageCdnPipe } from '../../../../../core/pipes/image-cdn.pipe';
import { CargadorComponent } from '../../../../../shared/cargador/cargador.component';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { NgFor, NgIf, NgSwitch, NgSwitchCase, NgTemplateOutlet, NgStyle, AsyncPipe, TitleCasePipe, NgClass } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LoaderService } from '@app/services/loader/loader.service';
import { MatDialog } from '@angular/material/dialog';
import { ModalData } from '@app/Models/Modaldata';
import { ModalGeneralComponent } from '@app/modules/shared/modals/modal-general/modal-general.component';
import { DomSanitizer } from '@angular/platform-browser';
import { PublicService } from '@app/services/public.service';
import { ClientesService } from '@app/services/configuracion/clientes.service';
import { ReportesExternoService } from '@app/services/calidad-externo/reportesExterno.service';
import { LogsService } from '@app/services/configuracion/logs.service';
import { Router } from '@angular/router';
import { AnalyticalProblemsService } from '@app/services/calidad-externo/AnalyticalProblems.service';
import { MatNativeDateModule } from '@angular/material/core'; // Requerido por el datepicker
import { MatRadioModule } from '@angular/material/radio';
import { MatDatepickerModule } from '@angular/material/datepicker';
import moment from 'moment';
import dayjs from 'dayjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reportes-desempenio-cualitativo-cliente-copy',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatAutocompleteModule,
    NgFor, MatOptionModule, NgIf, MatSelectModule, NgSwitch, NgSwitchCase, NgTemplateOutlet, CargadorComponent,
    NgStyle, AsyncPipe, TranslateModule, ImageCdnPipe, TitleCasePipe, NgxMatSelectSearchModule, MatIconModule, MatTooltipModule, NgClass,MatRadioModule,
    MatDatepickerModule],
  templateUrl: './reportes-desempenio-cualitativo-cliente-copy.component.html',
  styleUrl: './reportes-desempenio-cualitativo-cliente-copy.component.css'
})
export class ReportesDesempenioCualitativoClienteCopyComponent {
  @ViewChild('item_2') item_2: ElementRef;
  @ViewChild('item_3') item_3: ElementRef;
  @ViewChild('item_4') item_4: ElementRef;
  @ViewChild('item_5') item_5: ElementRef;
  @ViewChildren('chartZscore') chartElements!: QueryList<ElementRef>;

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

  rondas: any = [];
  rondasCopy: any = [];
  interpretacion = [
    {
      value: 'Verdadero positivo',
      puntuacion: '0'
    },
    {
      value: 'Verdadero negativo',
      puntuacion: '0'
    },
    {
      value: 'Indeterminado',
      puntuacion: '2'
    },
    {
      value: 'Falso positivo',
      puntuacion: '6'
    },
    {
      value: 'Falso negativo',
      puntuacion: '-10'
    },
  ]

  form2: FormGroup;

  formulario: FormGroup = this.fb.group({
    idclient: ['', [Validators.required]],
    idsede: ['', [Validators.required]],
    idProgram: ['', [Validators.required]],
    idRonda: ['', [Validators.required]],
    idMuestra: ['', [Validators.required]],
    idAnalito: ['', [Validators.required]],
  });
  analitos: any = [{
    Idanalytes: 1,
    Desanalytes: 'Prueba'
  }];
  @ViewChild('scroll') scroll: ElementRef;
  graficasBase64: any = {
    barras: [],
    torta: [],
    lineas: [],
    zscore: [],
  };
  score = ['-10', '6', '0', '2', '0'];
  analites: any = [];
  indexSelect = 0;
  verInfo: boolean = false;
  lotes: any;
  listaMuestras: any = [];
  listaMuestrasCopy: any = [];
  programaSeleccionado: any;
  rondaSeleccionada: any;
  loteSeleccionado: any;
  muestraSeleccionado: any;
  analytes: any = [];
  analytesCopy: any = [];
  analitoSeleccionado: any;
  datosFiltro: any;
  dataReporteCualitativo: any;
  idClient: any;
  imgFilter = [
    {
      id: 1,
      img: 'btn_ensayo.png'
    },
    {
      id: 2,
      img: 'btn_world.png'
    },
    {
      id: 3,
      img: 'btn_consenso.png'
    },
    {
      id: 4,
      img: 'btn_puntiacion.png'
    },
  ]
  itemSelected: number = 1;
  canvas: any;
  // @ViewChild("chart") chart: ChartComponent;
  EChartsOption = echarts;
  chartDom: any;
  datosGraf: any;
  verInterpret: boolean;
  showOverlay: boolean = false;
  arrValueX: any = [];
  dataSeriesX: any = [];
  graficaSelect: any = 2;
  
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
  
  filterCliente = new FormControl('');
  filterSede = new FormControl('');

  filterPrograma = new FormControl('')
  filterRonda = new FormControl('')
  filterMuestra = new FormControl('')
  filterAnalito = new FormControl('')
  
  formStatusSample: FormGroup = this.fb.group({
    typeSample: ['', Validators.required],
    sampleConditions: ['', Validators.required],
    dateReception: ['', Validators.required],
    sampleReceived: ['', Validators.required],
    observations: ['', [Validators.minLength(3), Validators.maxLength(200)]],
  });

  navTabs: any[] = [
    {
      name: 'Concordancia de resultados',
      image: 'assets/rutas/iconos/concordancia.svg',
      imageActive: 'assets/rutas/iconos/concordancia-blanco.svg',
      registro: "concordancia"
    },
    {
      name: 'Desempeño global',
      image: 'assets/rutas/iconos/desempeño-global.svg',
      imageActive: 'assets/rutas/iconos/desempeño-global-blanco.svg',
      registro: "desempeno"
    },
    {
      name: 'Resultado consenso',
      image: 'assets/rutas/iconos/resultado-concenso.svg',
      imageActive: 'assets/rutas/iconos/resultado-concenso-blanco.svg',
      registro: "resultado"
    } ,{
      name: 'Puntaje score',
      image: 'assets/rutas/iconos/puntaje-score.svg',
      imageActive: 'assets/rutas/iconos/puntaje-score-blanco.svg',
      registro: "puntaje"
    }]

  currendTab: number = 0;
  problemsAnalytical: any = [];
  fechaActual = dayjs().format('YYYY-MM-DD');
  client:any;
  
  // public chartOptions: Partial<ChartOptions>;
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
    private pdfService: PdfService,
    private loaderService: LoaderService,
    private dialog: MatDialog,
    private matIconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer,
    private publicService: PublicService,
    private clientesService: ClientesService,
    private reportesExternoService: ReportesExternoService,
    private logsService: LogsService,
    private router: Router,
    private AnalyticalProblemsService: AnalyticalProblemsService
  ) {

    this.matIconRegistry.addSvgIcon("concordancia", this.sanitizer.bypassSecurityTrustResourceUrl('assets/rutas/iconos/concordancia.svg'))
    this.matIconRegistry.addSvgIcon("desempeno", this.sanitizer.bypassSecurityTrustResourceUrl('assets/rutas/iconos/desempeño-global.svg'))
    this.matIconRegistry.addSvgIcon("resultado", this.sanitizer.bypassSecurityTrustResourceUrl('assets/rutas/iconos/resultado-concenso.svg'))
    this.matIconRegistry.addSvgIcon("puntaje", this.sanitizer.bypassSecurityTrustResourceUrl('assets/rutas/iconos/puntaje-score.svg'))
  }

  ngOnInit(): void {
    this.cargarGestionLab();
    this.crearForm2();
    this.filtrosAutocomplete();
  }
  
  cargarGestionLab() {
      this.laboratoriosService.getAllAsync().then(respuesta => {
        this.cliente = respuesta[0].header;
        this.participante = respuesta[0].name;
        this.codigoparticipante = respuesta[0].codecliente;
        this.cargarSelects();
      });
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
          this.analites = datos;        
        }, _ => {
          this.analites = [];
          this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.NOHAYANALITOS'));
        });
      }
    });
  }

  async cargarSedes(id) {
    this.formulario.get('idsede')?.setValue('');
    this.formulario.get('idProgram')?.setValue('');
    this.formulario.get('idRonda')?.setValue('');
    this.formulario.get('idMuestra')?.setValue('');
    this.formulario.get('idAnalito')?.setValue('');
    let cliente = this.clientes.find(x => x.header === id);
    this.client = cliente;
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

  consultarProgramas() {
    this.formulario.get('idProgram').setValue('')
    this.formulario.get('idRonda').setValue('')
    this.formulario.get('idMuestra').setValue('')
    this.formulario.get('idAnalito').setValue('')
    let idsede = this.formulario.get('idsede')?.value;
    let nit = this.form2.value.Nit;
    if ( idsede ){
      nit = this.clientes.filter(x => x.idclient === this.formulario.get('idclient')?.value)[0].nit;
    }else{
      idsede = this.form2.get('Idheadquarters')?.value;
    }

    this.getProgram();
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
        this.listprogram = this.listprogramCopy.filter((item: any) => {
          return item.desprogram.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.listprogram = this.listprogramCopy
      }
    });
    this.filterRonda.valueChanges.subscribe(word => {
      if (word) {
        this.rondas = this.rondasCopy.filter((item: any) => {
          return item.nroround.toString().toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.rondas = this.rondasCopy
      }
    });
    this.filterMuestra.valueChanges.subscribe(word => {
      if (word) {
        this.listaMuestras = this.listaMuestrasCopy.filter((item: any) => {
          return item.Serialsample.toString().toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.listaMuestras = this.listaMuestrasCopy
      }
    });
    this.filterAnalito.valueChanges.subscribe(word => {
      if (word) {
        this.analytes = this.analytesCopy.filter((item: any) => {
          return item.desanalytes.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.analytes = this.analytesCopy
      }
    });

  }



  getCoord(item) {
    if (item.resultClientInterpretation === 'VP') return [0, 0]
    if (item.resultClientInterpretation === 'VN') return [1, 0]
    if (item.resultClientInterpretation === 'FP') return [2, 0]
    if (item.resultClientInterpretation === 'FN') return [3, 0]
  }


  async graficaBarras(it?) {
    this.itemSelected = 2;
    $("#key_2").show();
    this.graficasBase64.barras = [];

    setTimeout(async () => {
      for (let index = 0; index < this.datosGraf.length; index++) {
        
        const chartBarras = echarts.init(document.getElementById('chart' + index));

        const option = {
          title: {
            left: 'center',
            text: 'N°' + (index + 1) + ' - ' + this.datosFiltro.analytesList.filter(x => x.idAnalytes === this.datosGraf[index].IdAnalytes)[0].desAnalytes,
            textStyle: {
              fontSize: 12
            }
          },
          xAxis: {
            type: 'category',
            data: ['VP', 'VN', 'FP', 'FN']
          },
          yAxis: {
            type: 'value'
          },
          series: [
            {
              color: 'black',

              data: [
                {
                  value: this.datosGraf[index].TVP,
                  label: {
                    show: true,
                    position: 'inside'
                  },
                  itemStyle: {
                    color: '#3850EB',
                    decal: this.datosGraf[index].ResultClientInterpretation === 'VP' ? {
                      symbol: 'circle',
                      symbolSize: 0,
                      symbolKeepAspect: true,
                      symbolOffset: [2, 2],
                      color: '#3850EB',
                      resultCLient: 'VP'
                    } : ''
                  }
                },
                {
                  value: this.datosGraf[index].TVN,
                  label: {
                    show: true,
                    position: 'inside'
                  },
                  itemStyle: {
                    color: '#28a745',
                    decal: this.datosGraf[index].ResultClientInterpretation === 'VN' ? {
                      symbol: 'arrow',
                      symbolSize: 0,
                      symbolKeepAspect: true,
                      symbolOffset: [2, 2],
                      color: '#28a745'
                    } : ''
                  }
                },
                {
                  value: this.datosGraf[index].TFP,
                  label: {
                    show: true,
                    position: 'inside'
                  },
                  itemStyle: {
                    color: '#ffc107',
                    decal: this.datosGraf[index].ResultClientInterpretation === 'FP' ? {
                      symbol: 'arrow',
                      symbolSize: 0,
                      symbolKeepAspect: true,
                      symbolOffset: [2, 2],
                      color: '#ffc107'
                    } : ''
                  }
                },
                {
                  value: this.datosGraf[index].TFN,
                  label: {
                    show: true,
                    position: 'inside'
                  },
                  itemStyle: {
                    color: '#dc3545',
                    decal: this.datosGraf[index].ResultClientInterpretation === 'FN' ? {
                      symbol: 'arrow',
                      symbolSize: 0,
                      symbolKeepAspect: true,
                      symbolOffset: [2, 2],
                      color: '#dc3545'
                    } : ''
                  }
                }],
              type: 'bar',
            }
          ]
        };
        chartBarras.setOption(option);
        await new Promise((res, e) => {
          chartBarras.on('finished', () => {
            res(this.graficasBase64.barras[index] = chartBarras.getDataURL())
          });
        });
      }
      if (it === 1) {
        this.graficaSelect = 3;
        this.cargarGraficas();
      }
    }, 500);
  }

  async graficaTorta(it?) {
    this.graficasBase64.torta = [];
    this.itemSelected = 3;
    $("#key_3").show();
    setTimeout(async () => {
      for (let index = 0; index < this.datosGraf.length; index++) {
        const graficaTorta = echarts.init(document.getElementById('chartTorta' + index));

        let optionTorta = {
          title: {
            left: 'center',
            text: 'N°' + (index + 1) + ' - ' + this.datosFiltro.analytesList.filter(x => x.idAnalytes === this.datosGraf[index].IdAnalytes)[0].desAnalytes,
            textStyle: {
              fontSize: 12
            }

          },
          // legend: {
          //   top: 'bottom'
          // },
          series: [
            {
              name: 'Access From',
              type: 'pie',
              radius: '50%',
              label: {
                formatter: function (data) {
                  return `${data.name}: ${Math.round(data.percent * 10) / 10}%`;
                },
                backgroundColor: '#FFF',
                borderColor: '#FFF',
                borderWidth: 1,
                borderRadius: 2,
                outerWidth: 20,
                rich: {
                  per: {
                    color: '#3A49A5',
                    backgroundColor: '#FFF',
                    padding: [2, 0],
                    with: [20, 20],
                    borderRadius: 0
                  }
                }
              },
              data: [
                { value: this.datosGraf[index].PVP, name: 'VP' },
                { value: this.datosGraf[index].PVN, name: 'VN' },
                { value: this.datosGraf[index].PFP, name: 'FP' },
                { value: this.datosGraf[index].PFN, name: 'FN' },
              ],
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
              }
            }
          ]
        };

        await new Promise((res, e) => {
          graficaTorta.setOption(optionTorta);
          graficaTorta.on('rendered', () => res(this.graficasBase64.torta[index] = graficaTorta.getDataURL()));
        })
      }
      if (it === 1) {
        this.graficaSelect = 4;
        this.cargarGraficas();
      }
    }, 500);
  }

  async graficaLineas(it?) {
    this.itemSelected = 4;
    $("#key_4").show();
    setTimeout(async () => {

      let dataGrafica = [];
      for(let a = 0; a < this.datosGraf.length; a++){
        
        dataGrafica = this.datosFiltro.dataJson.filter(x=>x.IdAnalytes === this.datosGraf[a].IdAnalytes);
        
        if(dataGrafica.length > 0){
          this.arrValueX = [];
        this.dataSeriesX = [];
        
        for (let index = 0; index < dataGrafica.length; index++) {
          this.dataSeriesX.push([dataGrafica[index].nroSample,dataGrafica[index].zscoredev]);
        }

        let chartDom = document.getElementById('chartLine' + a);
        let chartInstance = echarts.getInstanceByDom(chartDom);
        if (chartInstance) {
          chartInstance.dispose();
        }
        let graficaLine = echarts.init(chartDom);
                
        const option = {
          title: {
            left: 'center',
            text: 'N°' + (a + 1) + ' - ' + dataGrafica[0].DesAnalytes,
            textStyle: {
              fontSize: 12
            }
          },
          xAxis: {
          type: 'value',
          name:'Muestra',
          min: 0,
          max: dataGrafica[0].ejex,
          boundaryGap: false,
          nameLocation:'center',
          nameTextStyle: {
            padding: [8, 8, 8, 8],
            color:'black'
          },
        },
        yAxis: {
          type: 'value',
          min: -10,
          max: 10
        },
        series: [
          {
            type: 'line',
            symbol: 'circle',
            data: this.dataSeriesX,
            symbolSize:10,
          },
        ]
      };
    
      await new Promise((res, e) => {
        
        const dtGrapZscore = {
          idAnalytes: this.datosGraf[a].IdAnalytes,
          grafica: ''
        }          
        
        graficaLine.setOption(option);
        graficaLine.resize({
            width: 350,
            height: 350
        });
        
        graficaLine.on('rendered', () => res(
          dtGrapZscore.grafica = graficaLine.getDataURL({
            pixelRatio: 3,
            backgroundColor: '#ffffff'
          })
        )
      );
      
      this.graficasBase64.lineas.push(dtGrapZscore)
    })
  }
}
    
    if (it === 1) {
      this.graficaSelect = 5;
      this.cargarGraficas();
    }
  }, 500);
}

  async graficaZscore(it?) {

    this.graficasBase64.zscore = [];
    this.itemSelected = 5;
    $("#key_5").show();
    setTimeout(async () => {

      for(let z = 0; z < this.datosGraf.length; z++){
        let ejexejey = [];
        let dataGrap = this.datosFiltro.dataJson.filter(x=>x.IdAnalytes === this.datosGraf[z].IdAnalytes);
        
        if(dataGrap.length > 0){
          for (let index = 0; index < dataGrap.length; index++) {
            ejexejey.push([dataGrap[index].nroSample,dataGrap[index].zscore]);
          }
        
        let chartDom = document.getElementById('chartZscore' + z);
        let chartInstance = echarts.getInstanceByDom(chartDom);
        if (chartInstance) {
          chartInstance.dispose();
        }
        let chartZ = echarts.init(chartDom);

        let optionZ = {
          xAxis: {
            type: 'value',
            name:'Muestra',
            min: 0,
            max: dataGrap[0].ejex,
            boundaryGap: false,
            nameLocation:'center',
            nameTextStyle: {
              padding: [8, 8, 8, 8],
              color:'black'
            },
          },
          yAxis: {
            type: 'value',
            min: 0,
            max: 15,
          },
          series: [
            {
              type: 'line',
              symbol:'circle',
              data: ejexejey,
              symbolSize:10,
            },
          ]
        };
        
        await new Promise((res, e) => {
        
          const dtGrapZscore = {
            idSample: this.datosGraf[z].IdSample,
            idAnalytes: this.datosGraf[z].IdAnalytes,
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

    if(it === 1){
      this.reportePDF();
    }

  }, 500);
}
  

  async getProgram() {

    try {
      this.loaderService.show()
      this.loaderService.text.emit({ text: 'Cargando programas' })
      let lab = await this.laboratoriosService.getAllAsync()
      let data = await this.programConfClientHeaderqQceService.getProgramReportCualiCl(this.client.nit, Number(sessionStorage.getItem('sede')))
      this.loaderService.hide()
      this.listprogram = data;
      this.listprogramCopy = data;

    } catch (error) {
      this.loaderService.hide()
      this.toastr.info('No hay programas para este filtro');
    }

  }


  async selectRonda(programa) {
    try {
      this.formulario.get('idRonda')?.setValue('');
      this.formulario.get('idMuestra')?.setValue('');
      this.formulario.get('idAnalito')?.setValue('');
      this.loaderService.show()
      this.loaderService.text.emit({ text: 'Cargando rondas...' })
      this.programaSeleccionado = programa;
      this.idClient = this.listprogram.find((x: any) => x.idProgram === programa);
      let datos = await this.rondasQceService.getRoundReportCualiCl(programa, this.idClient.idClient)
      this.loaderService.hide()
      if (datos) {
        this.rondas = datos;
        this.rondasCopy = datos;
        this.formulario.get('idRonda').setValue('')
        this.formulario.get('idMuestra').setValue('')
        this.formulario.get('idAnalito').setValue('')
      }

    } catch (error) {
      this.loaderService.hide()
      this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.NOHAYRONDAS'));
    }

  }


  selectLote(nroround) {
    this.rondaSeleccionada = nroround;
    this.lotesQceService.getLotReportCualiCl(Number(this.programaSeleccionado), nroround, this.idClient.idClient).then((datos: any) => {
      this.lotes = datos;
    }, _ => {
      this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.NOHAYRONDAS'));
    });
  }

  //filtro de muestras por ronda-programa
  async selectSample(nroround) {
    try {
      this.loaderService.show()
      this.loaderService.text.emit({ text: 'Cargando muestras...' })
      this.formulario.get('idMuestra').setValue('');
      this.formulario.get('idAnalito').setValue('');
      this.rondaSeleccionada = nroround;
      let datos = await this.SampleQceService.getSamplesByClienteReport(this.idClient.idClient, Number(sessionStorage.getItem('sede')), Number(this.programaSeleccionado), nroround);
      if (datos) {
        this.listaMuestras = datos;
        this.listaMuestrasCopy = datos;
      }
      this.loaderService.hide()
    } catch (error) {
      this.loaderService.hide()
      this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.NOHAYRONDAS'));
    }



  }


  async selectAnalito(muestra) {
    try {
      this.loaderService.show()
      this.loaderService.text.emit({ text: 'Cargando analitos...' })
      this.muestraSeleccionado = muestra;
      let datos = await this.analytesQceService.getAnalytesReportCualiClxsamples(Number(this.programaSeleccionado), this.rondaSeleccionada, muestra, this.idClient.idClient);
      if (datos) {
        this.analytes = datos;
        this.analytesCopy = datos;
        this.formulario.get('idAnalito').setValue('')
      }
      this.loaderService.hide()
    } catch (error) {
      this.loaderService.hide()
      this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.NOHAYRONDAS'));
    }


  }

  selectNone(control: string) {
    this.formulario.get(control).setValue('');
  }
  selectAll(control: string) {
    let data = [];
    data.push('-1');
    this.formulario.get(control).setValue(['-1']);
    if (control == 'idAnalito') {

      for (let i = 0; i < this.analytesCopy.length; i++) {
        data.push(this.analytesCopy[i].idanalytes);
      }
      this.formulario.get('idAnalito').setValue(data);

    }

  }

  selectOne(control: string) {
    if (this.formulario.get(control).value[0] == '-1' || this.formulario.get(control).value[0] == '') {
      this.formulario.get(control).value.shift();
      this.formulario.get(control).setValue(this.formulario.get(control).value);
    }
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



  buscar() {
    if (this.formulario.valid) {
      this.verInfo = false;
      const obj = {
        "IdProgram": Number(this.programaSeleccionado),
        "NRound": Number(this.rondaSeleccionada),
        "IdSample": [Number(this.muestraSeleccionado)],
        "IdAnalytes": this.formulario.value.idAnalito == "" ? [] : this.formulario.value.idAnalito,
        "IdClient": this.formulario.value.idclient,
        "idSede": this.formulario.value.idsede,
      }
      this.loaderService.show()
      this.loaderService.text.emit({ text: 'Cargando información...' })
      this.programConfClientHeaderqQceService.performanceReportCualiCl(obj).then(async r => {

        this.loaderService.hide()

        if (r.analytesList.length > 0) {
          this.datosFiltro = r;

          //Validar los valores asignados, sino se mostrara un cuadro mostrando cuales faltan. 

          let withValueAssign = this.datosFiltro.dataJson.filter(x=>x.ValueAssign === '-').map(y=> {
            return{
              Sample:  y.Sample, 
              DesAnalytes:  y.DesAnalytes,
              DesAnalyzer:  y.DesAnalyzer
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
              </table>
              `,
              icon: 'info'
            });
            
            this.loaderService.hide();
            return;
          }

          let idRound =  this.datosFiltro.dataJson.filter(x=>x.IdSample === this.formulario.get('idMuestra').value);
          await this.consultAnalyticalProblems(idRound[0].IdRound, this.formulario.get('idsede').value);
          this.datosFiltro.reactivoValueList = this.datosFiltro.reactivoValueList.filter(x=>x.idSample === this.muestraSeleccionado);
          this.datosGraf = this.datosFiltro.dataJson.filter(x=>x.IdSample === this.muestraSeleccionado);;
          this.dataReporteCualitativo = this.datosFiltro.dataJson;
          this.analitoSeleccionado = this.datosFiltro.analytesList[0];
          this.verInfo = true;
          this.loaderService.show()
          setTimeout(() => {
            this.moverAmbulante(1);
            this.itemSelected = 1;
            this.calcularAltoTabla()
            this.loaderService.hide()
          }, 100);
        } else {
          this.loaderService.hide()
          this.verInfo = false;
          this.toastr.info('No se encontraron resultados para esta búsqueda');
        }
      }).catch(err => {
        this.loaderService.hide()
        console.log(err);
        this.toastr.info('No se encontraron resultados para esta búsqueda');
      });
    } else {
      this.toastr.info('Debe ingresar los datos solicitados');
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

  buscarAnalitos(_analito: string, btnSecc: any, i: any) {
    this.analitoSeleccionado = _analito;
    this.indexSelect = Number(i);
  }


  selecItem(img) {

    this.itemSelected = img.id;
    switch (img.id) {
      case 2:
        setTimeout(() => {
          this.graficaBarras();
        }, 500);
        break;
      case 3:
        setTimeout(() => {
          this.graficaTorta();
        }, 500);
        break;
      case 4:
        setTimeout(() => {
          this.graficaLineas();
        }, 500);
        break;
      case 5:
        setTimeout(() => {
          this.graficaZscore();
        }, 500);
        break;
    }
  }

  interpretar(template: TemplateRef<any>) {
    const destroy$: Subject<boolean> = new Subject<boolean>();
    /* Variables recibidas por el modal */
    const data: ModalData = {
      content: template,
      btn2: 'Cerrar',
      footer: true,
      title: 'Tabla',
      image: 'assets/rutas/iconos/tabla.png'
    };
    const dialogRef = this.dialog.open(ModalGeneralComponent, { height: 'auto', width: '40em', data, disableClose: true });

    dialogRef.componentInstance.secondaryEvent?.pipe(takeUntil(destroy$)).subscribe(x => {

      dialogRef.close();
    });

  }

  valorSccore(item) {
    if (item.tvp == 1) return '0';
    if (item.tvn == 1) return '0';
    if (item.ti == 1) return '2';
    if (item.tfp == 1) return '6';
    if (item.tfn == 1) return '-10';
  }

  cargarGraficas() {
    // this.showOverlay = true;
    this.loaderService.show();
    this.loaderService.text.emit({ text: 'Generando reporte...' });
    if (this.graficaSelect == 2) {
      this.graficaBarras(1);
    } else if (this.graficaSelect === 3) {
      this.graficaTorta(1);
    } else if (this.graficaSelect == 4) {
      this.graficaLineas(1);
    } else if (this.graficaSelect == 5) {
      this.graficaZscore(1);
    }
  }

  async consultAnalyticalProblems(idRound:number, idHeadQuarters: number)
  {
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

  async reportePDF() {
    let puntuacion = [];

    for (let index = 0; index < this.datosFiltro.reactivoValueList.length; index++) {
      puntuacion.push({ cod: this.datosFiltro.reactivoValueList[index].sample, dev: this.valorSccore(this.datosFiltro.reactivoValueList[index]) });
    }

    let dataSede = this.sedes.find(x => x.idheadquarters === this.formulario.get('idsede').value) || null;
    let infoCabecera = {
      deteccion: this.analitoSeleccionado.desAnalytes,
      metodologia: this.datosFiltro.nameMethod,
      ronda: this.formulario.get('idRonda').value,
      codLab: this.datosFiltro.codclient,
      programa: this.datosFiltro.dataJson[0].DesProgram,
      sample: this.datosGraf[0].Sample,
      dataSede: dataSede,
      formStatusSample: this.formStatusSample.value,
      fechaImpresion: moment(this.fechaActual).format('YYYY-MM-DD'),
      fechaFinal: this.datosGraf[0].EndDate,
      yes: this.formStatusSample.get('sampleReceived')?.value == "true" ? ' X ' : '___',
      not: this.formStatusSample.get('sampleReceived')?.value == "false" ? ' X ' : '___',
    }
    let displayedColumns = ['N°', 'Muestra', 'VP', 'VN', 'FN', 'FP', 'I', 'Consenso', 'Resultado', '%C (%concordancia)', 'Desempeño'];
    let displayedColumns2 = ['Resultado total concordancia %', 'Desempeño global'];
    let headPuntuacion = ['Muestra', '(%DEV)'];

    let dataTotal = [
      {
        desempeGlobal: this.datosFiltro.desempeGlobal,
        resultConcor: this.datosFiltro.resultConcor,
      }
    ]
    
    timer(15000).subscribe( async x =>{
      
    await this.pdfService.PdfPlantillaCualiCliente(this.graficasBase64, displayedColumns, this.datosFiltro.dataJson, displayedColumns2, dataTotal, headPuntuacion, puntuacion, infoCabecera, this.muestraSeleccionado, this.datosFiltro.analytesList, this.dataReporteCualitativo, this.problemsAnalytical).then(async base64 => {

      this.loaderService.hide();
      let datosLogs = this.datosFiltro.dataJson.map(item => {
        const data = {
          idRound: item.IdRound,
          idSample: item.IdSample,
          serialSample: item.Sample,
          idAnalytes: item.IdAnalytes,
          desAnalytes: item.DesAnalytes,
          idAnalyzer: item.IdAnalyzer,
          desAnalyzer: item.DesAnalyzer,
          idReagents: item.IdReactivo,
          desReagents: item.DesReactivo,
          idMethod: item.IdMethods,
          desMethods: item.DesMethods,
          idUnit: item.IdUnits,
          desUnits: item.DesUnits,
          resultClient: item.Resultado,
          valueAsign: item.ResultClientInterpretation,
          zscore: item.zscore,
          performance: item.Desempeno
        };

        return data;
      });

          //Insertar log
          const logs = {
            idRound: this.datosGraf[0].IdRound,
            idSample: this.datosGraf[0].IdSample,
            nroRound: this.formulario.value.idRonda,
            tipoMuestra: this.formStatusSample.value.typeSample,
            condicionMuestra: this.formStatusSample.value.sampleConditions,
            observations: this.formStatusSample.value.observations,
            muestraRecibida: this.formStatusSample.value.sampleReceived,
            fechaRecepcion: this.formStatusSample.value.dateReception,
            analito: this.formulario.value.idAnalito,
            idCliente: this.formulario.value.idclient,
            idSede:this.formulario.value.idsede,
            idPrograma: this.programaSeleccionado,
            pdf: base64,
            fechaGeneracion: '',
            resumenRonda: datosLogs
          }
          
          await this.ventanaConfirmacionPdf(logs);
    });

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
            await this.logsService.createLogsReportes(dataLog, 'LogsReporteDC');
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


  moverAmbulante(posicion: number) {
    const cuadro = document.querySelector('.cuadro-ambulante');
    // Remover cualquier clase previa
    cuadro.classList.remove('move-to-firts', 'move-to-second', 'move-to-third', 'move-to-fourth');
    // Agregar la clase correspondiente a la posición deseada
    if (posicion === 1) {
      cuadro.classList.add('move-to-firts');
    } else if (posicion === 2) {
      cuadro.classList.add('move-to-second');
    } else if (posicion === 3) {
      cuadro.classList.add('move-to-third');
    } else if (posicion === 4) {
      cuadro.classList.add('move-to-fourth');
    }

    this.currendTab = posicion;
    this.itemSelected = posicion
    this.selecItem({ id: posicion })

  }


  calcularAltoTabla() {
    const hoja = $('.hoja').height();
    const form = $('.formulario-principal').height()
    const tabs = $('.bar-nav-tabs').height()
    let he = hoja - form - tabs - 150;
    if (he < 400) {
      he = 400
    }

    $('.graphs-container').css('height', `${he}px`);
  }

      async openModalReporteSemiCuantitativo(templateReportDesempenioCualitativo: TemplateRef<any>) {

      const destroy$: Subject<boolean> = new Subject<boolean>();
      
      const data: ModalData = {
        content: templateReportDesempenioCualitativo,
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

      this.cargarGraficas();

      dialogRef.close();
    });
  }



}
