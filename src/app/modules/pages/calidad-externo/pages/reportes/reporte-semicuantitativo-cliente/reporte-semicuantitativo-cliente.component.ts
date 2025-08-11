import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import $ from 'jquery';
import { ProgramConfClientHeaderqQceService } from '@app/services/calidad-externo/program-conf-client-headerq-qce.service';
import { RondasQceService } from '@app/services/configuracion/rondas-qce.service';
import { LotesQceService } from '@app/services/calidad-externo/lotsQce.service';
import { AnalytesQceService } from '@app/services/calidad-externo/AnalytesQce.service';
import { SampleQceService } from '@app/services/calidad-externo/SampleQce.service';
import { LaboratoriosService } from '@app/services/configuracion/laboratorios.service';
import * as echarts from 'echarts';
import { PdfSemicualitativoService } from '@app/services/pdfs/pdf-semicualitativo.service';
import { ImageCdnPipe } from '../../../../../core/pipes/image-cdn.pipe';
import { CargadorComponent } from '../../../../../shared/cargador/cargador.component';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { NgFor, NgIf, NgClass, NgSwitch, NgSwitchCase, NgTemplateOutlet, NgStyle, AsyncPipe, TitleCasePipe } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIcon, MatIconRegistry } from '@angular/material/icon';
import { LoaderService } from '@app/services/loader/loader.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { DomSanitizer } from '@angular/platform-browser';
import { PublicService } from '@app/services/public.service';
import { ClientesService } from '@app/services/configuracion/clientes.service';
import { ProgramasQceService } from '@app/services/configuracion/programas-qce.service';
import { ReportesExternoService } from '@app/services/calidad-externo/reportesExterno.service';

@Component({
    selector: 'app-reporte-semicuantitativo-cliente',
    templateUrl: './reporte-semicuantitativo-cliente.component.html',
    styleUrls: ['./reporte-semicuantitativo-cliente.component.css'],
    standalone: true,
    imports: [
      FormsModule,
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
      NgxMatSelectSearchModule
    ]
})
export class ReporteSemicuantitativoClienteComponent implements OnInit {
  @ViewChild('item_2') item_2: ElementRef;
  @ViewChild('item_3') item_3: ElementRef;
  @ViewChild('item_4') item_4: ElementRef;

  @ViewChild('scroll') scroll: ElementRef;

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
    // idLote: ['', [Validators.required]],
    idMuestra: ['', [Validators.required]],
    idAnalito: [''],
  });

  graficasBase64: any = {
    cont1: [],
    cont2: [],
    cont3: {
      graf1: '',
      graf2: []
    },
    cont4: {
      graf1: '',
      graf2: []
    }
  };
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
  listaCliente: any;
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
  arrValueX: any = [];
  dataSeriesX: any = [];
  graficaSelect: any = 2;
  dataTablaEstGenMet: any = [];
  dataTablaEstGen: any = [];
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

  filterCliente = new FormControl('');
  filterSede = new FormControl('');
  filterAnalito = new FormControl('');
  filterPrograma = new FormControl('');
  form2: FormGroup;

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
    private reportesExternoService: ReportesExternoService
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
  // get idLoteNoValido() {
  //   return this.formulario.get('idLote');
  // }
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

  selectAnalito(muestra) {
    this.MuestraSeleccionada = muestra;
    
    this.analytesQceService.getAnalytesReportCualiClxsamples(Number(this.programaSeleccionado), this.rondaSeleccionada, muestra, this.idClient.idClient).then((datos: any) => {
      this.analytes = datos;
      this.analytesCopy = [...datos];
    }, _ => {
      this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.NOHAYRONDAS'));
    });
  }

  buscar() {
    if (this.formulario.valid) {
      const obj =
      // { "IdProgram":43, "NRound":1, "IdLot": [70],  "IdAnalytes": [], "IdSede":5, "IdClient":29 }
      {
        "IdProgram": Number(this.programaSeleccionado),
        "NRound": Number(this.rondaSeleccionada),
        // "IdLot": [ Number(this.loteSeleccionado) ],
        "IdSample": [Number(this.MuestraSeleccionada)],
        "IdAnalytes": this.formulario.value.idAnalito === "" || this.formulario.value.idAnalito === null ? [] : this.formulario.value.idAnalito,
        "IdClient": this.formulario.value.idclient,
        "idSede": this.formulario.value.idsede,
      }

      this.programConfClientHeaderqQceService.performanceReportSemiCualiClientes(obj).then(r => {
        if (r.modelo1.length > 0) {
          this.programConfClientHeaderqQceService.ConcordancePlotsclients(obj).then(resp => {

            this.programConfClientHeaderqQceService.EndOfCycleclients(obj).then(response => {

              for (let item of r.modelo1) {
                item.tables = item.tables.filter((x: any) => x.idAnalytes === item.idAnalytes);

                for (let key of item.tables) {
                  if (key.results == key.valueAsing) {
                    key.score = '10';
                  } else {
                    key.score = '0';
                  }
                }
              }
              this.dataFinCiclo = response;
              this.dataConcordancia = resp;
              this.datosFiltro = r.modelo1;
              this.listaCliente = r.modelo2;
              this.buscarAnalitos(this.datosFiltro[0], 0)
              this.verInfo = true;
            });
          });
        } else {
          this.verInfo = false;
          this.toastr.info('No se encontraron resultados para esta búsqueda');
        }
      }).catch(err => {
        this.toastr.info('No se encontraron resultados para esta búsqueda');
      });
    } else {
      this.toastr.info('Debe ingresar los datos solicitados');
    }
  }


  scrollCards(flow: number): void {
    this.scroll.nativeElement.scrollLeft += (136.1 * flow);
  }

  async buscarAnalitos(_analito: string, i?: any, btnSecc?: any, flagConsolidado: boolean = false) {
    this.analitoSeleccionado = _analito;
    this.tablaEstGen(_analito);
    this.indexSelect = Number(i);
    let analito = this.dataConcordancia[0]?.analytes;
    this.dataAnalitoTblConcord = analito.find(x => x.idAnalytes === this.analitoSeleccionado.idAnalite);
    if (this.dataAnalitoTblConcord === undefined) {
      this.imgFilter[2].flag = false;
      this.imgFilter[3].flag = false;
      this.toastr.info('El analito seleccionado no contiene parametrización en asignación de valores ' +
        ' por ende, las opciones de GRAFICAS DE CONCORDANCIA y FIN DE CICLO no se mostraran.').message;
      return;
    }
    this.imgFilter[2].flag = true;
    this.imgFilter[3].flag = true;
    this.arrDataGraf2 = this.dataAnalitoTblConcord.Muestras.filter(x => x.samples === this.formulario.get('idMuestra').value);
    flagConsolidado ? await this.graficaCont1(i, 1, true) : await this.graficaCont1(1);
  }

  tablaEstGen(analito: any) {
    let arrXmethod = this.listaCliente.filter(x => x.idMethod === analito.idMethod);
    this.headersTabla = [];
    this.dataTablaEstGenMet = [];
    this.dataTablaEstGen = [];
    this.dataGrafEstGenMetVal = [];
    this.dataGrafEstGenVal = [];
    for (let item of analito.results) {
      this.headersTabla.push(item.results);
      let arrXresult = arrXmethod.filter(x => x.result === item.results);
      let arrXresultGen = this.listaCliente.filter(x => x.result === item.results);
      this.dataTablaEstGenMet.push(arrXresult);
      this.dataGrafEstGenMetVal.push(arrXresult.length);
      this.dataTablaEstGen.push(arrXresultGen);
      this.dataGrafEstGenVal.push(arrXresultGen.length);
    }
  }

  selecItem(num:number) {
    this.itemSelected = num;
    switch (num) {
      case 1:
        setTimeout(() => {
          this.graficaCont1(num);
        }, 100);
        break;
      case 2:
        setTimeout(() => {
          this.graficaCont2(num);
        }, 100);
        break;
      case 3:
        setTimeout(() => {
          this.graficaCont3(num);
        }, 100);
        break;
      case 4:
        setTimeout(() => {
          this.graficaCont4(num);
        }, 100);
        break;
    }
  }

  calcProm(data) {
    let score = 0;
    for (let item of data) {
      score += Number(item.score)
    }
    return score / data.length;
  }


  async graficaCont1(contSelect, it?: any, consolidado: boolean = false) {
    if (!consolidado) {
      this.itemSelected = contSelect;
      $("#key_1").show();
      this.graficasBase64.cont1 = [];
    }

    const option = {
      title: {
        text: 'Histograma',
        left:'center'
      },
      xAxis: [
        {
          type: 'category',
          data: this.headersTabla,
          axisPointer: {
            type: 'shadow'
          }
        }
      ],
      yAxis: [
        {
          type: 'value',
        }
      ],
      grid: {
        top: 'center',
        height: 110,
      },
      series: [
        {
          barWidth: '20%',
          name: '',
          type: 'bar',
          tooltip: {
            valueFormatter: function (value) {
              return value;
            }
          },
          data: this.dataGrafEstGenMetVal
        },
        {
          barWidth: '20%',
          name: '',
          type: 'bar',
          tooltip: {
            valueFormatter: function (value) {
              return value;
            }
          },
          data: this.dataGrafEstGenVal
        }
      ]
    };
    this.arrGraficasUno.push({ ...option });
    setTimeout(async () => {

      if (!consolidado) {
        this.chartDom = echarts.init(document.getElementById('graf1'));
        this.chartDom.setOption(option);
        await new Promise((res, e) => {
          this.chartDom.on('rendered', () => {
            res(this.graficasBase64.cont1 = this.chartDom.getDataURL())
          });
        });
      }
      if (it === 1) {

        this.graficaSelect = 2;
        this.cargarGraficas(consolidado, contSelect);
      }
    }, 300);

  }

  async graficaCont2(contSelect, it?: any, consolidado: boolean = false) {
    if (!consolidado) {
      this.itemSelected = contSelect;
      this.graficasBase64.cont2 = [];
    }

    var posicion = this.datosFiltro.filter(p => p.idAnalite == this.analitoSeleccionado.idAnalite).length - 1;
    var datosFiltradosAnalito = this.datosFiltro.filter(p => p.idAnalite == this.analitoSeleccionado.idAnalite);

    var results = datosFiltradosAnalito[posicion].results;
    var header = [];
    var value = [];
    var tables = datosFiltradosAnalito[posicion].tables;

    for (let item of datosFiltradosAnalito[posicion].tables) {
      header.push(item.serialSample);
      value.push(item.order);
      $("#key_2").show();
    }
    const option = {
      tooltip: {
        trigger: 'axis',
        formatter: function (data) {
          var resultado = tables.find(x => x.serialSample == data[0].axisValue);
          var muestra = data[0].axisValue;
          return '<b>Resultado:</b> ' + resultado.results + '<br>' + '<b>Muestra:</b> ' + muestra;
        }
      },
      xAxis: {
        type: 'category',
        data: datosFiltradosAnalito[posicion].tables.map(x => x.serialSample)
      },
      yAxis: {
        type: 'value',
        show: true,
        axisLabel: {
          fontWeight: 'bold',
          formatter: function (params) {
            let item = results.find(x => x.order == params);
            return item == undefined ? '' : item.results;
          }
        }
      },
      grid: {
        top: 'center',
        height: 100,
        left: 100,
        right: 20
      },
      series: [
        {
          name: 'Resultado',
          data: datosFiltradosAnalito[posicion].tables.map(x => x.order),
          type: 'line'
        }
      ]
    };
    this.arrGraficasDos.push({ ...option });

    setTimeout(async () => {

      if (!consolidado) {
        this.chartDom = echarts.init(document.getElementById('graf2'));
      }
      if (this.chartDom) {
        await new Promise((res, e) => {
          this.chartDom.on('finished', () => res(this.graficasBase64.cont2[0] = this.chartDom.getDataURL()));
          this.chartDom.setOption(option);
        })
      }
      if (it === 1) {
        this.graficaSelect = 3;
        this.cargarGraficas(consolidado);
      }
    }, 500);

  }

  async graficaCont3(contSelect, it?: any, consolidado: boolean = false) {
    let dataGraf1 = this.dataAnalitoTblConcord.GraficaGeneral[0];
    let arrOpcionesConsolidadas = [];
    this.graficasBase64.cont3.graf1 = '';
    this.graficasBase64.cont3.graf2 = [];
    if (!consolidado) {
      this.itemSelected = contSelect;
      $("#key_3").show();
    }

    const option = {
      dataset: {
        source: [
          ['score', 'product'],
          [dataGraf1.rechazado, 'Rechazados'],
          [dataGraf1.aceptado, 'Aceptados'],
        ]
      },
      grid: { containLabel: true },
      xAxis: { name: '' },
      yAxis: { type: 'category' },

      series: [
        {
          type: 'bar',
          encode: {
            // Map the "amount" column to X axis.
            x: 'score',
            // Map the "product" column to Y axis
            y: 'product'
          }
        }
      ]
    };
    arrOpcionesConsolidadas.push(option);
    setTimeout(async () => {

      if (!consolidado) {
        this.chartDom = echarts.init(document.getElementById('graf3'));
      }

      if (this.chartDom) {
        this.chartDom.setOption(option);
        await new Promise((res, e) => {
          this.chartDom.on('rendered', () => res(this.graficasBase64.cont3.graf1 = this.chartDom.getDataURL()));
        })
      }
    }, 200);


    setTimeout(async () => {
      for (let index = 0; index < this.arrDataGraf2.length; index++) {

        if (!consolidado) {
          this.chartDom = echarts.init(document.getElementById('graf4' + index));
        }
        const option2 = {
          title: {
            subtext: 'Muestra: ' + this.arrDataGraf2[index].samples,
            left: 'center'
          },
          xAxis: {
            type: 'category',
            data: ['Concord', 'No Concord']
          },
          yAxis: {
            type: 'value'
          },
          grid: {
            top: '20%',
            left: '4%',
            right: '4%',
            bottom: '1%',
            containLabel: true
          },
          series: [
            {
              data: [
                {
                  value: this.arrDataGraf2[index].acepPorcentaje,
                  itemStyle: {
                    color: '#5C7BD9'
                  }
                },
                {
                  value: this.arrDataGraf2[index].recPorcentaje,
                  itemStyle: {
                    color: '#6B4B8B'
                  }
                }
              ],
              type: 'bar',
              barWidth: '40%',
            }
          ]
        };
        arrOpcionesConsolidadas.push(option2);

        if (this.chartDom) {
          this.chartDom.setOption(option2);
          await new Promise((res, e) => {
            this.chartDom.on('rendered', () => res(this.graficasBase64.cont3.graf2[index] = this.chartDom.getDataURL()));
          })
        }
      }
      this.arrGraficasTres.push([...arrOpcionesConsolidadas]);
      if (it === 1) {
        this.graficaSelect = 4;
        this.cargarGraficas(consolidado);
      }
    }, 400);
  }

  graficaCont4(contSelect, it?: any, consolidado: boolean = false) {
    if (!consolidado) {
      this.itemSelected = contSelect;
      $("#key_4").show();
    }
    let arrOpcionesConsolidadas = [];
    this.graficasBase64.cont4.graf1 = '';
    this.graficasBase64.cont4.graf2 = [];

    let maxData = 100;
    const option = {
      xAxis: {
        max: maxData,
        splitLine: { show: false },
        offset: 10,
        axisLine: {
          lineStyle: {
            color: '#999'
          }
        },
        axisLabel: {
          margin: 0
        }
      },
      yAxis: {
        data: ['Concordancia'],
        inverse: true,
        axisTick: { show: false },
        axisLine: { show: false },
        axisLabel: {
          margin: 10,
          color: '#999',
          fontSize: 16
        }
      },
      grid: {
        top: 'center',
        height: 50,
        left: 120,
        right: 50
      },
      series: [
        {
          // current data
          type: 'pictorialBar',
          symbolRepeat: 'fixed',
          symbolMargin: '5%',
          symbolClip: true,
          symbolSize: 17,
          symbolBoundingData: maxData,
          data: [this.dataFinCiclo.OverallGraph[0].aceptado],
          markLine: {
            symbol: 'none',
            label: {
              formatter: 'max: {c}',
              position: 'start'
            },
            lineStyle: {
              color: 'blue',
              type: 'dotted',
              opacity: 0.2,
              width: 2
            },
            data: [
              {
                type: 'max'
              }
            ]
          },
          z: 10
        },
        {
          // full data
          type: 'pictorialBar',
          animationDuration: 0,
          symbolRepeat: 'fixed',
          symbolMargin: '5%',
          symbolSize: 17,
          symbolBoundingData: maxData,
          data: [this.dataFinCiclo.OverallGraph[0].aceptado],
          color: 'gray',
          z: 5
        }
      ]
    };
    arrOpcionesConsolidadas.push(option);
    setTimeout(async () => {

      if (!consolidado) {
        this.chartDom = echarts.init(document.getElementById('graf5'));
      }
      if (this.chartDom) {
        this.chartDom.setOption(option);
        await new Promise((res, e) => {
          this.chartDom.on('rendered', () => res(this.graficasBase64.cont4.graf1 = this.chartDom.getDataURL()));
        })
      }
    }, 200);
    setTimeout(async () => {
      for (let index = 0; index < this.dataFinCiclo.samples.length; index++) {

        if (!consolidado) {
          this.chartDom = echarts.init(document.getElementById('graf6' + index));
        }
        const option2 = {
          title: {
            subtext: 'Muestra: ' + this.dataFinCiclo.samples[index].serialNumber,
            left: 'center'
          },
          xAxis: {
            type: 'category',
            data: ['Concord', 'No Concord']
          },
          yAxis: {
            type: 'value'
          },
          grid: {
            top: '20%',
            left: '4%',
            right: '4%',
            bottom: '1%',
            containLabel: true
          },
          series: [
            {
              data: [
                {
                  value: this.dataFinCiclo.samples[index].acepPorcentaje,
                  itemStyle: {
                    color: '#5C7BD9'
                  }
                },
                {
                  value: this.dataFinCiclo.samples[index].recPorcentaje,
                  itemStyle: {
                    color: '#6B4B8B'
                  }
                }
              ],
              type: 'bar',
              barWidth: '40%',
            }
          ]
        };

        arrOpcionesConsolidadas.push(option2);

        if (this.chartDom) {
          this.chartDom.setOption(option2);
          await new Promise((res, e) => {
            this.chartDom.on('rendered', () => res(this.graficasBase64.cont4.graf2[index] = this.chartDom.getDataURL()));
          })
        }
      }
      ;
      this.arrGraficasCuatro.push([...arrOpcionesConsolidadas]);
      if (it === 1) {
        !consolidado ? this.reportePDF() : '';
      }
    }, 400);
  }
  async cargarGraficas(flagConsolidado: boolean = false, cont: number = 2) {
    this.showOverlay = true;
    if (this.graficaSelect == 2) {
      setTimeout( async() => {
        await this.graficaCont2(cont, 1, flagConsolidado);
      }, 1000);
    } else if (this.graficaSelect == 3) {
      setTimeout(async() => {
        await this.graficaCont3(3, 1, flagConsolidado);
      }, 1000);
    } else if (this.graficaSelect == 4) {
      setTimeout(() => {
        this.graficaCont4(4, 1, flagConsolidado);
      }, 1000);
    }
  }

  async reportePDF() {
    var date = new Date();
    const formatDate = (date) => {
      let formatted_date = date.getDate() + " / " + (date.getMonth() + 1) + " / " + date.getFullYear()
      return formatted_date;
    }

    this.datosFiltro[this.indexSelect].tables.forEach((element, index) => {
      index == this.datosFiltro[this.indexSelect].tables.length - 1 ? element.prom = this.calcProm(this.datosFiltro[this.indexSelect].tables) : element.prom = 0
    });


    var objTblCont1: any = []
    for (let key of this.datosFiltro[this.indexSelect].results) {
      objTblCont1.push(key);
    }

    this.datosFiltro[this.indexSelect].results.forEach((element, index) => {
      objTblCont1[index].metodo = this.dataTablaEstGenMet[index].length;
      objTblCont1[index].totalResults = this.dataTablaEstGen[index].length;
    });

    let infoCabecera = {
      deteccion: this.analitoSeleccionado.desAnalytes,
      metodologia: this.analitoSeleccionado.desMethods,
      fechaD: formatDate(date),
      codLab: this.datosFiltro[this.indexSelect].codeClient,
      programa: this.datosFiltro[this.indexSelect].desprogram,
      ronda: this.formulario.get('idRonda').value,
      muestra: this.MuestraSeleccionada,
    }

    const headerTBL = {
      headerTblCont1: ['Resultado', 'Por método', 'Todos los resultados'],
      headerTbl1Cont2: ['Sistema de medición', 'Reactivo', 'Analito', 'Unidades'],
      headerTbl2Cont2: ['Muestra', 'Resultado', 'Valor asignado', 'Score', 'Rms'],
      headerTblCont3: ['Control', 'N Datos', 'Aceptados', 'Rechazados', '% Aceptados', '% Rechazados'],
      headerTblCont4: ['Muestra', 'N Datos', 'Concordante', 'No Concordante', '% Concordante', '% No Concordante']
    }

    const colTBL = {
      colCont1: objTblCont1,
      colCont2Tbl1: this.datosFiltro[this.indexSelect],
      colCont2Tbl2: this.datosFiltro[this.indexSelect].tables,
      colCont3: this.dataAnalitoTblConcord.Muestras,
      colCont4: this.dataFinCiclo.samples
    }


    await this.pdfSemicualitativoService.PdfPlantillaCualiCliente(infoCabecera, this.graficasBase64, headerTBL, colTBL).then(_ => { })
    this.graficaSelect = 2;
    this.itemSelected = 1;
    // this.cargarGraficas()
    setTimeout(() => {
      this.showOverlay = false;
    }, 5000);
  }


  async obtenerImgraficas1() {
    let index = 0;
    for (const item in this.arrGraficasUno) {
      this.chartDom = echarts.init(document.getElementById('primera' + index));
      await new Promise((res, e) => {
        setTimeout(() => {
          this.chartDom.on('finished', () => {
            res(this.arrImgGraficasUno[index] = this.chartDom.getDataURL());
          });
          this.chartDom.setOption(this.arrGraficasUno[item]);
        }, 500);
      }).then(x => { })
      index++;

    }
  }
  async obtenerImgraficas2() {
    let index = 0;
    for (const item in this.arrGraficasDos) {
      this.chartDom = echarts.init(document.getElementById('segunda' + index));
      await new Promise((res, e) => {
        setTimeout(() => {
          this.chartDom.on('finished', () => {
            res(this.arrImgGraficasDos[index] = this.chartDom.getDataURL())
          });
          this.chartDom.setOption(this.arrGraficasDos[item]);
        }, 500);
      }).then(x => { })
      index++;
    }
  }
  async obtenerImgraficas3() {
    let index = 0;
    let index2 = 0;
    for (const item in this.arrGraficasTres) {
      let imagenes: string[] = [];
      for (const key in this.arrGraficasTres[item]) {
        this.chartDom = echarts.init(document.getElementById('tercera' + index2 + 'P' + index));
        await new Promise((res, e) => {
          setTimeout(() => {
            this.chartDom.on('finished', () => {
              res(imagenes[index] = this.chartDom.getDataURL())
            });
            this.chartDom.setOption(this.arrGraficasTres[item][key]);
          }, 500)
        }).then(x => { })
        index++;
      }
      this.arrImgGraficasTres[index2] = imagenes;
      index = 0;
      index2++;
    }
  }
  async obtenerImgraficas4() {
    let index = 0;
    let index2 = 0;
    for (const item in this.arrGraficasCuatro) {
      let imagenes: string[] = [];

      for (const key in this.arrGraficasCuatro[item]) {
        this.chartDom = echarts.init(document.getElementById('cuarta' + index2 + 'Z' + index));
        await new Promise((res, e) => {
          setTimeout(() => {
            this.chartDom.on('finished', () => {
              res(imagenes[index] = this.chartDom.getDataURL())
            });
            this.chartDom.setOption(this.arrGraficasCuatro[item][key]);
          }, 500)
        }).then(x => { })
        index++;
      }
      this.arrImgGraficasCuatro[index2] = imagenes;
      index = 0;
      index2++;
    }
  }

  async reporteConsolidado() {

    this.loader.show();

    this.arrGraficasUno = [];
    this.arrGraficasDos = [];
    this.arrGraficasTres = [];
    this.arrGraficasCuatro = [];
    this.itemSelected = 5;

    let j = 0;
    for (const key in this.datosFiltro) {
      const analito = this.dataConcordancia[0].analytes.find(z => z.idAnalytes === this.datosFiltro[key].idAnalite);
      if (analito !== undefined) await this.buscarAnalitos(this.datosFiltro[key], j, null, true);
      j++;
    }
    setTimeout(async () => {
      await this.obtenerImgraficas1();
      if (this.arrGraficasUno.length === 0) {
        this.toastr.error("Todos analitos no tienen la información completa para poder generar el reporte");
        return;
      }
      await this.obtenerImgraficas2();
      await this.obtenerImgraficas3();
      await this.obtenerImgraficas4();
      this.showOverlay = false;
      var date = new Date();
      const formatDate = (date) => {
        const formatted_date = date.getDate() + " / " + (date.getMonth() + 1) + " / " + date.getFullYear()
        return formatted_date;
      }

      let dataSede = this.sedes.find(x => x.idheadquarters === this.formulario.get('idsede').value) || null;

      const infoCabecera = {
        deteccion: this.analitoSeleccionado.desAnalytes,
        metodologia: this.analitoSeleccionado.desMethods,
        fechaD: formatDate(date),
        codLab: this.datosFiltro[this.indexSelect].codeClient,
        programa: this.datosFiltro[this.indexSelect].desprogram,
        ronda: this.formulario.get('idRonda').value,
        muestra: this.MuestraSeleccionada,
        dataSede: dataSede
      }

      let arrconsolidado: any[] = [];
      const headerTBL = {
        headerTblCont1: ['Resultado', 'Por método', 'Todos los resultados'],
        headerTbl1Cont2: ['Sistema de medición', 'Reactivo', 'Analito', 'Unidades'],
        headerTbl2Cont2: ['Muestra', 'Resultado', 'Valor asignado', 'Score', 'Rms'],
        headerTblCont3: ['Control', 'N Datos', 'Aceptados', 'Rechazados', '% Aceptados', '% Rechazados'],
        headerTblCont4: ['Muestra', 'N Datos', 'Concordante', 'No Concordante', '% Concordante', '% No Concordante']
      }

      this.datosFiltro.map(async (x, cont) => {
        const analito = this.dataConcordancia[0].analytes.find(z => z.idAnalytes === x.idAnalite);
        if (analito === undefined) return ;

        this.datosFiltro[cont].tables.forEach((element, index) => {
          index == this.datosFiltro[cont].tables.length - 1 ? element.prom = this.calcProm(this.datosFiltro[cont].tables) : element.prom = 0
        });
        let objTblCont1: any[] = [];
        for (let key of this.datosFiltro[cont].results) {
          await new Promise((r, e) => {
            r(objTblCont1.push({ ...key, metodo: this.datosFiltro[cont].results.length, totalResults: this.datosFiltro[cont].results.length }))
          })
        }
        const colTBL = {
          colCont1: objTblCont1,
          colCont2Tbl1: this.datosFiltro[cont],
          colCont2Tbl2: this.datosFiltro[cont].tables,
          colCont3: analito.Muestras,
          colCont4: this.dataFinCiclo.samples
        }
        const arrImg = [this.arrImgGraficasUno[cont], this.arrImgGraficasDos[cont], this.arrImgGraficasTres[cont], this.arrImgGraficasCuatro[cont]];
        arrconsolidado[cont] = { arrImg, headerTBL, colTBL };
      })

      await this.pdfSemicualitativoService.PdfPlantillaCualiClienteConsolidado(infoCabecera, arrconsolidado).then(_ => {
        this.itemSelected = 1;
        this.buscarAnalitos(this.datosFiltro[0], 0, null, false);
        this.loader.hide();
      })
    }, 1000);
  
  }

}
