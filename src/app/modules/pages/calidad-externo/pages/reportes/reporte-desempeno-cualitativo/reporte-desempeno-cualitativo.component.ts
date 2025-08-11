import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ProgramConfClientHeaderqQceService } from '@app/services/calidad-externo/program-conf-client-headerq-qce.service';
import { RondasQceService } from '@app/services/configuracion/rondas-qce.service';
import { LotesQceService } from '@app/services/calidad-externo/lotsQce.service';
import { AnalytesQceService } from '@app/services/calidad-externo/AnalytesQce.service';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { ImageCdnPipe } from '../../../../../core/pipes/image-cdn.pipe';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatOptionModule } from '@angular/material/core';
import { NgFor, NgIf, NgClass, NgStyle, AsyncPipe, TitleCasePipe } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { LoaderService } from '@app/services/loader/loader.service';
import { MatDialog } from '@angular/material/dialog';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatIconModule } from '@angular/material/icon';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import { LaboratoriosService } from '@app/services/configuracion/laboratorios.service';
import { PublicService } from '@app/services/public.service';
import { ClientesService } from '@app/services/configuracion/clientes.service';
import { ProgramasQceService } from '@app/services/configuracion/programas-qce.service';
import { ReportesExternoService } from '@app/services/calidad-externo/reportesExterno.service';

@Component({
  selector: 'app-reporte-desempeno-cualitativo',
  templateUrl: './reporte-desempeno-cualitativo.component.html',
  styleUrls: ['./reporte-desempeno-cualitativo.component.css'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, MatFormFieldModule
    , MatInputModule, MatAutocompleteModule, NgFor, MatOptionModule
    , MatTooltipModule, NgIf, MatSelectModule, NgClass, NgStyle,
    AsyncPipe, TranslateModule, ImageCdnPipe, TitleCasePipe, NgxMatSelectSearchModule, MatIconModule]
})
export class ReporteDesempenoCualitativoComponent implements OnInit {
  //predictivos
  filteredOptionsProgram: Observable<string[]>;
  listprogram: any = [];
  listprogramCopy: any = [];
  filteredOptionsRonda: Observable<string[]>;
  listRonda: any;
  filteredOptionsLote: Observable<string[]>;
  listLote: any;
  filteredOptionsAnalito: Observable<string[]>;
  listAnalito: any;

  rondas: any = [];
  rondasCopy: any = [];
  cliente: any;
  form2: FormGroup;
  formulario: FormGroup = this.fb.group({
    idclient: ['', [Validators.required]],
    idsede: ['', [Validators.required]],
    idProgram: ['', [Validators.required]],
    idRonda: ['', [Validators.required]],
    idLote: ['', [Validators.required]],
    idAnalito: [''],
  });
  analitos: any = [{
    Idanalytes: 1,
    Desanalytes: 'Prueba'
  }];
  @ViewChild('scroll') scroll: ElementRef;


  analites: any = [];
  indexSelect = 0;
  verInfo: boolean = false;
  lotes: any = [];
  lotesCopy: any = [];
  programaSeleccionado: any;
  rondaSeleccionada: any;
  loteSeleccionado: any;
  analytes: any = [];
  analytesCopy: any = [];
  analitoSeleccionado: string = '';
  datosFiltro: any = {}
  reactivoXanalito: any = []
  itemSample: any = [];


  viejoModulo: boolean = false;
  // scroll
  showLeftScroll: boolean = true;
  showRightScroll: boolean = true;
  //Filtros para autocomplete ngx

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
  filterLote = new FormControl('')
  filterAnalito = new FormControl('')
  @ViewChild('contentScrollable', { static: false }) ContScroll: ElementRef | undefined;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private translate: TranslateService,
    private programConfClientHeaderqQceService: ProgramConfClientHeaderqQceService,
    private rondasQceService: RondasQceService,
    private lotesQceService: LotesQceService,
    private analytesQceService: AnalytesQceService,
    private loaderService: LoaderService,
    private dialog: MatDialog,
    private publicService: PublicService,
    private clientesService: ClientesService,
    private programQceService: ProgramasQceService,
    private reportesExternoService: ReportesExternoService,
    private laboratoriosService: LaboratoriosService,
  ) { }

  ngOnInit(): void {
    this.filtrosAutocomplete();
    this.cargarGestionLab();
    this.crearForm2();

    setTimeout(() => {
      this.verifyScroll()
      this.calcularAltoTabla()
    }, 100);
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
    this.filterLote.valueChanges.subscribe(word => {
      if (word) {
        this.lotes = this.lotesCopy.filter((item: any) => {
          return item.numlot.toString().toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.lotes = this.lotesCopy
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

  private _filterAnalitosCreate(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.analitos.filter(result => result.desanalytes.includes(filterValue));
  }

  async getProgram() {

    try {
      this.loaderService.show()
      this.loaderService.text.emit({ text: 'Cargando programas...' })
      let data = await this.programConfClientHeaderqQceService.getProgramReportCuali()
      this.loaderService.hide()
      if (data) {
        this.listprogram = data;
        this.listprogramCopy = data;
      }
    } catch (error) {
      this.loaderService.hide()
      this.toastr.info('No hay programas para este filtro');
    }
    // await this.programConfClientHeaderqQceService.getProgramReportCuali().then(data => {



    //   this.listprogram.sort((a: any, b: any) => {
    //     a.desprogram = a.desprogram.charAt(0) + a.desprogram.slice(1);
    //     b.desprogram = b.desprogram.charAt(0) + b.desprogram.slice(1);
    //   })

    //   this.listprogram.sort((a: any, b: any) => {
    //     if (a.desprogram < b.desprogram) return -1;
    //     if (a.desprogram > b.desprogram) return 1;
    //     return 0;
    //   })

    //   this.filteredOptionsProgram = this.formulario.get('idProgram').valueChanges.pipe(
    //     startWith(''),
    //     map(value => {
    //       return this._filterProgramsCreate(value)
    //     }),
    //   );
    // }, _ => {
    //   this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.NOHAYRONDAS'));
    // });
  }


  async selectRonda(programa: any) {
    try {
      this.loaderService.show()
      this.loaderService.text.emit({ text: 'Cargando rondas...' })
      this.programaSeleccionado = programa;
      let datos = await this.rondasQceService.getRoundReportCuali(programa);
      this.loaderService.hide()
      if (datos) {

        this.rondas = datos;
        this.rondasCopy = datos;
        this.formulario.get('idRonda').setValue('')
        this.formulario.get('idLote').setValue('')
        this.formulario.get('idAnalito').setValue('')
      }

    } catch (error) {


      this.loaderService.hide()
      this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.NOHAYRONDAS'));
    }
    //this.programaSeleccionado = programa;
    //this.rondasQceService.getRoundReportCuali(programa).then((datos: any) => {
    //this.rondas = datos;
    //this.rondas = datos;
    // this.filteredOptionsRonda = this.formulario.get('idRonda').valueChanges.pipe(
    //   startWith(''),
    //   map(value => {
    //     return this._filterRondasCreate(value)
    //   }),
    // );
    //}, _ => {
    // this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.NOHAYRONDAS'));
    // });
  }


  async selectLote(nroround: number) {

    try {
      this.loaderService.show()
      this.loaderService.text.emit({ text: 'Cargando lotes...' })
      this.rondaSeleccionada = nroround;
      let datos = await this.lotesQceService.getLotReportCuali(Number(this.programaSeleccionado), nroround)
      if (datos) {
        this.lotes = datos;
        this.lotesCopy = datos;
        this.formulario.get('idLote').setValue('')
        this.formulario.get('idAnalito').setValue('')
      }
      this.loaderService.hide()
    } catch (error) {
      this.loaderService.hide()
      this.toastr.info('No hay lotes con la ronda seleccionada');
    }
    // this.rondaSeleccionada = nroround;
    // this.lotesQceService.getLotReportCuali(Number(this.programaSeleccionado), nroround).then((datos: any) => {
    //   this.lotes = datos;
    //   this.filteredOptionsLote = this.formulario.get('idLote').valueChanges.pipe(
    //     startWith(''),
    //     map(value => {
    //       return this._filterLotesCreate(value)
    //     }),
    //   );
    // }, _ => {
    //   this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.NOHAYRONDAS'));
    // });
  }

  async selectAnalito(lote) {
    try {
      this.loaderService.show()
      this.loaderService.text.emit({ text: 'Cargando analitos...' })
      this.loteSeleccionado = lote;
      let datos = await this.analytesQceService.getAnalytesReportCuali(Number(this.programaSeleccionado), this.rondaSeleccionada, lote)
      if (datos) {
        this.analytes = datos;
        this.analytesCopy = datos;

        this.formulario.get('idAnalito').setValue('')
      }
      this.loaderService.hide()
    } catch (error) {
      this.loaderService.hide()
      this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.NOHAYANALITOS'));
    }


    // this.loteSeleccionado = lote;
    // this.analytesQceService.getAnalytesReportCuali(Number(this.programaSeleccionado), this.rondaSeleccionada, lote).then((datos: any) => {
    //   this.analytes = datos;
    //   this.analytesCopy = datos;
    //   this.filteredOptionsAnalito = this.formulario.get('idAnalito').valueChanges.pipe(
    //     startWith(''),
    //     map(value => {
    //       return this._filterAnalitosCreate(value)
    //     }),
    //   );
    // }, _ => {
    //   this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.NOHAYRONDAS'));
    // });
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

  get idClienteNoValido() {
    return this.formulario.get('idclient');
  }
  get idSedeNoValido() {
    return this.formulario.get('idsede');
  }
  get idProgramNoValido() {
    return this.formulario.get('idProgram');
  }
  get idRondaNoValido() {
    return this.formulario.get('idRonda');
  }
  get idLoteNoValido() {
    return this.formulario.get('idLote');
  }
  get idAnalitoNoValido() {
    return this.formulario.get('idAnalito');
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

  consultarProgramas() {
    let idsede = this.formulario.get('idsede')?.value;
    let nit = this.form2.value.Nit;
    if ( idsede ){
      nit = this.clientes.filter(x => x.idclient === this.formulario.get('idclient')?.value)[0].nit;
    }else{
      idsede = this.form2.get('Idheadquarters')?.value;
    }

    this.getProgram();
  }


  buscar() {
    if (this.formulario.valid) {
      const obj =
      {
        "IdProgram": Number(this.programaSeleccionado),
        "NRound": Number(this.rondaSeleccionada),
        "IdLot": [Number(this.loteSeleccionado)],
        "IdAnalytes": this.formulario.value.idAnalito == "" ? [] : this.formulario.value.idAnalito
      }

      this.programConfClientHeaderqQceService.performanceReportCuali(obj).then(r => {

        if (r.analytesList.length > 0) {
          this.datosFiltro = r;
          console.log(r)
          this.itemSample = [];
          for (let item of this.datosFiltro.listResult) {
            this.itemSample.push(item.analiList);
          }

          for (let i = 0; i < this.datosFiltro.reactivoValueList.length; i++) {
            this.datosFiltro.reactivoValueList[i].tableSample = [];
            for (let j = 0; j < this.itemSample.length; j++) {

              this.datosFiltro.reactivoValueList[i].tableSample.push({ nameSample: '-', result: '-', c: '-' });
            }

          }


          for (let index = 0; index < this.itemSample.length; index++) {
            for (let j = 0; j < this.itemSample[index].length; j++) {
              if (this.itemSample[index][j] != undefined) {
                let sample = this.datosFiltro.reactivoValueList.find(x => x.sample === this.itemSample[index][j].sample)
                sample.tableSample.splice(index, 1, this.itemSample[index][j]);
              }
            }
          }

          this.verInfo = true;
          this.analitoSeleccionado = ''
          setTimeout(() => {
            this.verifyScroll()
            this.calcularAltoTabla()
          }, 100);

        } else {
          this.verInfo = false;
          this.toastr.info('No se encontraron resultados para esta búsqueda');
        }
      }).catch(err => {
        console.log(err)
        this.toastr.info('No se encontraron resultados para esta búsqueda');
      });
    } else {
      this.toastr.info('Debe ingresar los datos solicitados');
    }
  }

  pdfTodosAnalitos() {
    let tablaLabs: any[] = [];
    let tablaMuestras: any[] = [];
    let tablaGlobal: any[] = [];

    this.datosFiltro.listResult.map(x => {
      const { idLab, idHeader, nameLab, conGlobal, deseGlobal } = x;
      tablaLabs.push({ idLab, idHeader, nameLab });
      tablaGlobal.push({ conGlobal, deseGlobal });
    })
    this.datosFiltro.reactivoValueList.map(x => {
      const { tableSample } = x;
      tablaMuestras.push(tableSample);
    })
  }

  //------------------------
  scrollCards(flow: number): void {
    this.scroll.nativeElement.scrollLeft += (136.1 * flow);
  }

  buscarAnalitos(_analito: any, i: any) {

    this.analitoSeleccionado = _analito;
    this.indexSelect = Number(i);
    this.reactivoXanalito = this.datosFiltro.reactivoValueList.filter(e => e.idAnalit == _analito.idAnalite)

    setTimeout(() => {
      this.calcularAltoTabla()
    }, 100);
    //  console.log(_analito);
  }



  onScroll() {
    if (!this.ContScroll) return;

    this.showLeftScroll = this.ContScroll.nativeElement.scrollLeft > 0;
    this.showRightScroll = this.ContScroll.nativeElement.scrollLeft < this.ContScroll.nativeElement.scrollWidth - this.ContScroll.nativeElement.clientWidth - 1;
  }


  ScrollLeft() {
    if (!this.ContScroll) return;

    this.ContScroll.nativeElement.scrollTo({
      left: this.ContScroll.nativeElement.scrollLeft - 100,
      behavior: 'smooth'
    });
  }

  ScrollRight() {

    if (!this.ContScroll) return;

    this.ContScroll.nativeElement.scrollTo({
      left: this.ContScroll.nativeElement.scrollLeft + 100,
      behavior: 'smooth'
    });
  }

  verifyScroll() {
    setTimeout(() => {
      if (!this.ContScroll) return;
      this.showRightScroll = this.ContScroll?.nativeElement.scrollWidth > this.ContScroll?.nativeElement.clientWidth;
      this.showLeftScroll = this.ContScroll?.nativeElement.scrollLeft > 0;

    }, 100);
  }

  calcularAltoTabla() {
    const hoja = $('.hoja').height();
    const form = $('.formulario-principal').height()
    const slider = $('.slider-analitos').height()
    let he = hoja - form - slider - 150;
    if (he < 200) {
      he = 200
    }
    $('.no-data').css('height', `${he}px`);
    $('.container-tables').css('height', `${he}px`);
  }

}
