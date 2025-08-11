import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';

import { ReporteICTService } from '@app/services/configuracion/reporteICT.service';
import { LaboratoriosService } from '@app/services/configuracion/laboratorios.service';
import { DomSanitizer } from '@angular/platform-browser';

import html2canvas from 'html2canvas';
import dayjs from 'dayjs';
import * as echarts from 'echarts';
import jsPDF from 'jspdf';
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import pdfMake from 'pdfmake/build/pdfmake';
import { Canvas, Cell, Columns, Img, ITable, Line, PdfMakeWrapper, Stack, Table, Txt } from 'pdfmake-wrapper';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { AnalitosService } from '@app/services/configuracion/analitos.service';
import { AnalizadoresService } from '@app/services/configuracion/analizadores.service';
import { LotesService } from '@app/services/configuracion/lotes.service';
import { SeccionesService } from '@app/services/configuracion/secciones.service';
import { SedesXUserService } from '@app/services/configuracion/sedesxuser.service';
import { ExporterService } from '@app/services/mantenimiento-calibradores/exporter.service';
import { isNumber } from '@ng-bootstrap/ng-bootstrap/util/util';
import { ClientesService } from '@app/services/configuracion/clientes.service';
import { PublicService } from '@app/services/public.service';
import { ProgramConfClientHeaderqQceService } from '@app/services/calidad-externo/program-conf-client-headerq-qce.service';
import moment from 'moment';
import { Observable } from 'rxjs';
import { AnalyzerQceService } from '@app/services/calidad-externo/AnalyzerQce.service';
import { map, startWith } from 'rxjs/operators';
import { AnalytesQceService } from '@app/services/calidad-externo/AnalytesQce.service';
import { ImageCdnPipe } from '../../../../../core/pipes/image-cdn.pipe';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgIf, NgFor, NgClass, LowerCasePipe, TitleCasePipe, JsonPipe } from '@angular/common';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatIconModule } from '@angular/material/icon';
import { LoaderService } from '@app/services/loader/loader.service';

pdfMake.vfs = pdfFonts.pdfMake.vfs;
PdfMakeWrapper.setFonts(pdfFonts);
//---Interface ----------
interface DataICTInt {

  Analito: string;
  Bias: string;
  CVR: string;
  Ciudad: string;
  Constz: string;
  Cv: string;
  Cva: string;
  Dianavalue: string;
  Ds: string;
  ET: string;
  Equipo: string;
  Fuente: string;
  IET: string;
  Laboratorio: string;
  Lote: string;
  Media: string;
  Nivel: string;
  SIG: string;
  SR: string;
  Seccion: string;
  Sede: string;
  Sesgo: string;
  Tea: string;
  Unidad: string;
  idtest: string;
  ndatos: string;



}


interface DataICTExt {

  Consecutivo: string;
  Desanalytes: string;
  Desprograma: string;
  DesvPermitida: string;
  Fuente: string;
  Indicedesvio: string;
  Nameanalyzer: string;
  Resultado: string;
  Unidad: string;
  UnidadObjetivo: string; //--pendiente
  Zscore: string;
  ds: string;
  media: string;


}



@Component({
  selector: 'app-reporte-itc-copy',
  standalone: true,
  imports: [NgIf, FormsModule, ReactiveFormsModule, MatFormFieldModule,
    MatInputModule, MatDatepickerModule, MatSelectModule, MatOptionModule,
    NgFor, MatTooltipModule, NgClass, LowerCasePipe, JsonPipe,
    TitleCasePipe, TranslateModule, ImageCdnPipe, NgxMatSelectSearchModule, MatIconModule],
  templateUrl: './reporte-itc-copy.component.html',
  styleUrl: './reporte-itc-copy.component.css'
})
export class ReporteItcCOPYComponent {
  @ViewChild('scroll') scroll: ElementRef;
  @Input() flagFromParent: boolean = true;

  imgToPdf: ElementRef;
  snapshotImg: ElementRef;

  idUser: number = parseInt(sessionStorage.getItem('userid'));

  dataTableInterno: any = [];
  dataTableInterno_Tmp: any = [];
  dataTableExterno: any = [];
  dataTableExterno_Tmp: any = [];
  divCharts: any;
  ver: boolean = false;
  verCard: boolean = false;
  verTablaInt: boolean = false;
  verTablaExt: boolean = false;
  desde: any;
  hasta: any;
  hoy = dayjs().format('YYYY-MM-DD');
  hoyPdf = dayjs().format('DD-MM-YYYY');
  tipo: string;
  logoSource: any;
  logoSourceToPDF: string;
  sedesid = [];
  seccionesid = [];
  equiposid = [];
  analitosid = [];

  secciones = [];
  secciones_Tmp = [];
  sedes = [];
  listaEquipos: any[] = [];
  listaEquiposCopy: any[] = [];
  analitos: any[] = [];
  analitosCopy: any[] = [];
  lotes: any[] = [];
  lotesCopy: any[] = [];
  seccionSeleccionado: string;

  ndatosxseccion: any = [];

  jsonTxtSecciones = [];
  jsonTxtSedes = [];
  jsonTxtEquipos = [];
  jsonTxtAnalitos = [];
  jsonTxtLotes = [];

  // paginacion
  page = 1;
  pageSize = 3;
  collectionSize = 0;
  maxSize = 0;

  clienteName: string;
  clienteNit: string;
  clienteAddres: string;

  grafico01sig: string[] = [];
  grafico01ext: string[] = [];
  listanalytesxidanalyzer: any;
  verbtnexcelint: boolean = undefined;
  verbtnexcelext: boolean = undefined;
  vertodosequipos: boolean = true;
  vertodassecciones: boolean = true;
  vertodosanalitos: boolean = false;

  listaClientes: any[] = [];
  listaClientesCopy: any[] = [];
  idCliente: number;
  clienteSeleccionado: any;
  programSelected: any;
  sedeSeleccionada: any;
  sedesActive: any[] = [];
  sedesActiveCopy: any[] = [];
  idsede: number;
  assignprograms: any = [];
  listaProgramas: any[] = [];
  listaProgramasCopy: any[] = [];
  listaasignacionprogramas = [];
  filteredOptionsAnalyzerCreate: Observable<string[]>;
  listAnalyzercreate: any;

  formulario: FormGroup = this.fb.group({

    desde: ['', [Validators.required]],
    hasta: ['', [Validators.required]],
    ict: ['', Validators.required],
    cliente: ['', Validators.required],
    sede: ['', Validators.required],
    programa: ['', [Validators.required]],
    equipos: ['', [Validators.required]],
    analitos: ['', [Validators.required]]
    //lotes: ['', [Validators.required]]

  })

  filterPrograma = new FormControl('')
  filterSedes = new FormControl('')
  filterRonda = new FormControl('')
  filterCliente = new FormControl('')
  filterAnalito = new FormControl('')
  filterEquipo = new FormControl('')

  maxData = new Date()

  constructor(private fb: FormBuilder,
    private sanitizer: DomSanitizer,
    private seccionesService: SeccionesService,
    private sedesXUserService: SedesXUserService,
    private analitosService: AnalitosService,
    private lotesService: LotesService,
    private reporteICTService: ReporteICTService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private laboratoriosService: LaboratoriosService,
    private clientesService: ClientesService,
    private publicService: PublicService,
    private programConfClientHeaderqQceService: ProgramConfClientHeaderqQceService,
    private analyzerQceService: AnalyzerQceService,
    private analytesQceService: AnalytesQceService,
    private ExporterService: ExporterService,
    private loaderService: LoaderService
  ) { }

  async ngOnInit() {

    this.getLogoSource();
    await this.dataFilters();
    this.validarCliente();
    //this.validselect();
    this.consultarClientes();
    this.filtrosAutocomplete()

  }

  filtrosAutocomplete() {
    this.filterCliente.valueChanges.subscribe(word => {
      if (word) {
        this.listaClientes = this.listaClientesCopy.filter((item: any) => {
          return item.name.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.listaClientes = this.listaClientesCopy
      }
    });
    this.filterSedes.valueChanges.subscribe(word => {
      if (word) {
        this.sedesActive = this.sedesActiveCopy.filter((item: any) => {
          return item.desheadquarters.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.sedesActive = this.sedesActiveCopy
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
    this.filterEquipo.valueChanges.subscribe(word => {
      if (word) {
        this.listaEquipos = this.listaEquiposCopy.filter((item: any) => {
          return item.nameAnalyzer.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.listaEquipos = this.listaEquiposCopy
      }
    });
    this.filterAnalito.valueChanges.subscribe(word => {
      if (word) {
        this.analitos = this.analitosCopy.filter((item: any) => {
          return item.desanalytes.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.analitos = this.analitosCopy
      }
    });
  }

  async consultarClientes() {
    try {
      this.loaderService.show()
      this.loaderService.text.emit({ text: 'Cargando clientes...' })
      const clientes = await this.clientesService.getAllAsync();
      this.listaClientes = clientes
      this.listaClientesCopy = clientes
      this.loaderService.hide();

    } catch (error) {

      this.loaderService.hide();
      this.toastr.info('No se encontraron clientes asociados')
    }


  }

  async cargarSedes(dataClient) {

    try {
      this.loaderService.show()
      this.loaderService.text.emit({ text: 'Cargando sedes...' })
      sessionStorage.setItem('consultaSedeExterna', '1');
      let sedes = await this.publicService.obtenerSedesAsigProg(this.clienteSeleccionado.header);
      let sedesActivas = sedes.filter(e => e.active);
      this.sedesActive = sedesActivas
      this.sedesActiveCopy = sedesActivas
      this.loaderService.hide();
    } catch (error) {
      this.loaderService.hide();
      this.toastr.info('No se encontraron sedes asociadas')
    }

    await this.publicService.obtenerSedesAsigProg(this.clienteSeleccionado.header).then(r => {
      this.sedesActive = r.filter(e => e.active);
      sessionStorage.setItem('consultaSedeExterna', '0');
    });
  }

  async consultarProgramas(data: any) {
    try {

      this.loaderService.show()
      this.loaderService.text.emit({ text: 'Cargando programas...' })
      this.idCliente = this.formulario.get('cliente').value;
      this.idsede = this.formulario.get('sede').value;
      let programas = await this.programConfClientHeaderqQceService.getProgramAssignAll(this.idCliente, this.idsede)
      let programasActivos = programas.filter(datos => datos.Active);
      this.listaProgramas = programasActivos;
      this.listaProgramasCopy = programasActivos;
      this.loaderService.hide();
    } catch (error) {
      this.loaderService.hide();
      this.toastr.info('No se encontraron programas asociadas')
    }
  }

  async AsignacionesProgram(idprogram: number) {

    await this.programConfClientHeaderqQceService.Getprogramassignxidprogram(idprogram, this.idCliente, this.idsede).then(respuesta => {
      this.listaasignacionprogramas = respuesta.filter(datos => datos.Active);

      for (let item of respuesta) {
        this.assignprograms.push(item.IdProgramConfClientHeadq);
      }

    });
  }

  Limpiarprograma() {

    this.formulario.get('programa').valueChanges.subscribe(() => {
      this.assignprograms = [];
    });

  }

  limpiarFormBuscarDatos() {
    this.formulario.get('sede').reset();
    this.formulario.get('programa').reset();
    this.assignprograms = [];
  }

  selectFilter(idx, data) {
    switch (idx) {
      case 1:
        this.clienteSeleccionado = data;
        this.cargarSedes(data);
        break;
      case 2:
        this.sedeSeleccionada = data;
        this.consultarProgramas(data);
        break;
      //   case 3:
      //     this.programSelected = data;
      //     break;
    }

  }


  observeFechas(campo: string) {
    let x = this.formulario.get(campo).value;
    let fechaX = moment(x).format()
    if (fechaX === 'Invalid date') {
      this.formulario.get(campo).setValue(null);
      this.toastr.error('La fecha es invalida');
      return
    }
    if (fechaX > moment().format()) {
      this.formulario.get(campo).setValue(null);
      this.toastr.error(`La fecha "${campo}" no puede superar la fecha actual`);
      return
    }
    let desde = this.formulario.get('desde').value;
    let hasta = this.formulario.get('hasta').value;
    if (desde !== 'Invalid date' && hasta !== 'Invalid date') {
      if (moment(hasta).format() < moment(desde).format()) {
        this.formulario.get('hasta').setValue(null);
        this.toastr.error(`La fecha "hasta" no puede se menor a la fecha "desde"`);
      }
    }
  }

  validarCliente() {

    this.laboratoriosService.getAllAsync().then(lab => {

      this.clienteName = lab[0].name;
      this.clienteNit = lab[0].nit;
      this.clienteAddres = lab[0].addres;

    });
  }

  // validselect() {
  //   if (this.listaEquipos.length == 0) {
  //     this.vertodosequipos = false;
  //   }
  //   if (this.secciones_Tmp.length == 0) {
  //     this.vertodassecciones = false;
  //   }
  //   if (this.analitos.length == 0) {
  //     this.vertodosanalitos = false;
  //   }
  // }


  getLogoSource() {
    this.laboratoriosService.getLogoImage()
      .subscribe(logo => {
        this.logoSource = this.sanitizer.bypassSecurityTrustResourceUrl(`data:image/jpg;base64,${logo}`);
        this.logoSourceToPDF = `data:image/jpg;base64,${logo}`;
        var noimage = '/9j/4QAYRXhpZgAASUkqAAgAAAAAAAAAAAAAAP/sABFEdWNreQABAAQAAAAeAAD/4QMvaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjYtYzEzOCA3OS4xNTk4MjQsIDIwMTYvMDkvMTQtMDE6MDk6MDEgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE3IChXaW5kb3dzKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo5RjhGRDhDMjg2OEQxMUU3OTkxQ0Y0M0JBQ0I2RENFQyIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo5RjhGRDhDMzg2OEQxMUU3OTkxQ0Y0M0JBQ0I2RENFQyI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjlGOEZEOEMwODY4RDExRTc5OTFDRjQzQkFDQjZEQ0VDIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjlGOEZEOEMxODY4RDExRTc5OTFDRjQzQkFDQjZEQ0VDIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+/+4ADkFkb2JlAGTAAAAAAf/bAIQAEAsLCwwLEAwMEBcPDQ8XGxQQEBQbHxcXFxcXHx4XGhoaGhceHiMlJyUjHi8vMzMvL0BAQEBAQEBAQEBAQEBAQAERDw8RExEVEhIVFBEUERQaFBYWFBomGhocGhomMCMeHh4eIzArLicnJy4rNTUwMDU1QEA/QEBAQEBAQEBAQEBA/8AAEQgAqgCqAwEiAAIRAQMRAf/EAGgAAQEBAQEBAAAAAAAAAAAAAAAFBAMCAQEBAAAAAAAAAAAAAAAAAAAAABAAAgECAwUIAwEBAAAAAAAAAAECAwQRUhQhMZGhEkFRcYHBMhMzsSJyYdERAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AN4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAdbeg608N0VvYHIFNW9BLDoXntPvwUckeAEsFT4KOSPAfBRyR4ASwVPgo5I8B8FHJHgBLBU+CjkjwHwUckeAEsFT4KOSPAfBRyR4ASwVPgo5I8B8FHJHgBLBU+CjkjwM9zaxUXOmsMN8QMYAAAAAAABusPZLx9DCbrD65ePoByvZyVVJNpYLYjh1zzPidr77l/KPFvRdaeG6K3sDx1zzPiOueZ8SlGhSisFBeLWLOda0pzi3BdMuzDcwMPXPM+I655nxPLTTwe9AD11zzPiOueZ8TyAPXXPM+I655nxPIA9dc8z4jrnmfE8gD18k8z4lR7YPHtRJKz9nkBJAAAAAAAAN1h9cvH0MJusPrl4+gHG++5fyjtYYfHLvx9Djffcv5R4t67ozxe2L3oCmDxGtSmsYyRyrXVOmmovqn2JbgMlzh888O85Btttva3vAAA0W1s6r6pbILmB8t7Z1f2lsh3954rUZUpdMt3Y+8ppJLBbEtyPNSnGpFxktn4AlA6VqMqUumW7sfecwBWfs8iSVn7PICSAAAAAAAAbrD65ePoYTdYfXLx9AON99y/lepnNF99y/lflmcAD6k5NRisW9yKFC2jTj+y6pS3/8AnA0XNs6T6o7YPkLa2dR9c9kPyAtrZ1H1z2QXM3pJLBbEgkksFsSPoAAAeKlONSLjJbPwTq1GVKXTLd2PvKh4qU41IuMls/AEorP2eRJKz9nkBJAAAAAAAAN1h9cvH0MJusPrl4+gHG++5fyvyzgk5NRisW9yO999y/lflnaxhHoc8P2xwx/wD3b26pLF7Zve+47gAfGk1g9qe9BJJYLYkfQAAAAAAAABHe8rP2eRJe8rP2eQEkAAAAAAAA3WH1y8fQwm6wf6SX+gcb77l/K/LOlpWpQpYTkk8XsF3RqzqKUI4rDA4aavkfIDdqaGdDU0M6MOmr5HyGmr5HyA3amhnQ1NDOjDpq+R8hpq+R8gN2poZ0NTQzow6avkfIaavkfIDdqaGdDU0M6MOmr5HyGmr5HyA3amhnQ1NDOjDpq+R8hpq+Rgcis/Z5E7TV8jKMtkHj2ICSAAAAAAAAdKNaVGfUtqe9HMAUFeUGsW2n3NH3V2+bkycAKOrt83JjV2+bkycAKOrt83JjV2+bkycAKOrt83JjV2+bkycAKOrt83JjV2+bkycAKOrt83JjV2+bkycAKOrt83JnC4u+uLhT2Re9vtMoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k=';

        if (logo == "") {
          this.logoSourceToPDF = `data:image/png;base64,${noimage}`;
        }
      });
  }

  // llenar filtros - selects
  async dataFilters() {

    await this.sedesXUserService.getByIdAsync(this.idUser).then((data: any) => {
      this.sedes = data.filter(data => data.active);
    });

    try {


      this.loaderService.show()
      this.loaderService.text.emit({ text: 'Cargando equipos...' })
      const equipos = await this.analyzerQceService.getAllAsync()
      const equiposActivos = equipos.filter(data => data.active);
      this.listaEquipos = equiposActivos
      this.listaEquiposCopy = equiposActivos
      this.loaderService.hide();

    } catch (error) {
      this.toastr.info('No se encontraron equipos asociadas')
      this.loaderService.hide();
    }



  }

  // Select - Options

  selectAll(control: string) {
    this.formulario.get(control).setValue(['-1']);
  }

  selectNone(control: string) {
    this.formulario.get(control).setValue('');
  }

  selectOne(control: string) {
    if (this.formulario.get(control).value[0] == '-1' || this.formulario.get(control).value[0] == '') {

      this.formulario.get(control).value.shift();
      this.formulario.get(control).setValue(this.formulario.get(control).value);
    }
  }



  selectedanalyzer(control: string) {

    if (this.formulario.get(control).value[0] == '-1' || this.formulario.get(control).value[0] == '') {

      this.formulario.get(control).value.shift();
      this.formulario.get(control).setValue(this.formulario.get(control).value);
    }
    if (this.formulario.get(control).value[0] != '-1' || this.formulario.get(control).value[0] != '') {

      this.selectanalyzer(this.formulario.get(control).value);
    }
  }

  selectedAllanalyzer(control: string) {



    let data = [];
    data.push('-1');
    this.formulario.get(control).setValue(['-1']);
    if (control == 'equipos') {
      for (let i = 0; i < this.listaEquiposCopy.length; i++) {
        data.push(this.listaEquiposCopy[i].idAnalyzer);
      }
      this.formulario.get('equipos').setValue(data);

    }
    this.selectanalyzerall(this.formulario.get(control).value);




  }

  async selectanalyzerall(equipos) {

    var jsonTexto: any = '{"IdAnalyzer":"' + equipos + '"}';

    try {
      this.loaderService.show()
      this.loaderService.text.emit({ text: 'Cargando analitos...' })
      const equipos = await this.analytesQceService.getAllAsync()
      this.vertodosanalitos = true;
      const analitosActivos = equipos.filter(data => data.active);
      this.analitos = analitosActivos
      this.analitosCopy = analitosActivos
      this.loaderService.hide();
    } catch (error) {
      this.toastr.info('No se encontraron analitos asociados')
      this.loaderService.hide();
    }


  }

  async selectanalyzer(equipos) {

    if (equipos.length == 0) {
      return;
    }

    this.analitos = [];
    let arranalyzer2 = [];

    equipos.forEach(element => {
      if (element != '-1') {
        arranalyzer2.push(element)
      }
    });

    let idequipos;
    idequipos = arranalyzer2.filter((item, index) => { return arranalyzer2.indexOf(item) === index; })
    var jsonTexto: any = '{"IdAnalyzer":"' + idequipos + '"}';

    try {
      this.loaderService.show()
      this.loaderService.text.emit({ text: 'Cargando analitos...' })
      const equipos = await this.analytesQceService.getAllAsync()
      this.vertodosanalitos = true;
      const analitosActivos = equipos.filter(data => data.active);
      this.analitos = analitosActivos
      this.analitosCopy = analitosActivos
      this.loaderService.hide();
    } catch (error) {
      this.toastr.info('No se encontraron analitos asociados')
      this.loaderService.hide();
    }


  }

  selectedanalyte(control: string) {

    if (this.formulario.get(control).value[0] == '-1' || this.formulario.get(control).value[0] == '') {

      this.formulario.get(control).value.shift();
      this.formulario.get(control).setValue(this.formulario.get(control).value);

    }
    if (this.formulario.get(control).value[0] != '-1' || this.formulario.get(control).value[0] != '') {

      this.selectanalyte(this.formulario.get(control).value);
    }
  }

  selectedAllanalyte(control: string) {
    let data = [];
    data.push('-1');
    this.formulario.get(control).setValue(['-1']);
    if (control == 'analitos') {
      for (let i = 0; i < this.analitosCopy.length; i++) {
        data.push(this.analitosCopy[i].idanalytes);
      }
      this.formulario.get('analitos').setValue(data);

    }
    this.selectanalyteAlls(this.formulario.get(control).value);
  }

  async selectanalyteAlls(analitos) {

    try {
      var jsonTexto: any = '{"Idanalytes":"' + analitos + '"}';
      this.loaderService.show()
      this.loaderService.text.emit({ text: 'Cargando lotes...' })
      const lotes = await this.lotesService.getAllAsyncLotsxanalyte(jsonTexto).toPromise();

      const lotesActivos = lotes.filter(data => data.active);
      this.lotes = lotesActivos
      this.lotesCopy = lotesActivos
      this.loaderService.hide();
    } catch (error) {
      this.toastr.info('No se encontraron lotes asociados')
      this.loaderService.hide();
    }

  }

  async selectanalyte(analitos) {

    if (analitos.length == 0) {
      return;
    }

    let arranalyte2 = [];
    analitos.forEach(element => {
      if (element != '-1') {
        arranalyte2.push(element)
      }
    });

    let idanalitos;
    idanalitos = arranalyte2.filter((item, index) => { return arranalyte2.indexOf(item) === index; })
    var jsonTexto: any = '{"Idanalytes":"' + idanalitos + '"}';

    try {
      var jsonTexto: any = '{"Idanalytes":"' + analitos + '"}';
      this.loaderService.show()
      this.loaderService.text.emit({ text: 'Cargando lotes...' })
      const lotes = await this.lotesService.getAllAsyncLotsxanalyte(jsonTexto).toPromise();

      const lotesActivos = lotes.filter(data => data.active);
      this.lotes = lotesActivos
      this.lotesCopy = lotesActivos
      this.loaderService.hide();
    } catch (error) {
      this.toastr.info('No se encontraron lotes asociados')
      this.loaderService.hide();
    }

  }

  // ------------------------------------

  async filtrar() {

    if (this.formulario.valid) {
      try {
        this.ver = false;
        this.verCard = false;
        this.verTablaInt = false;
        this.verTablaExt = false;

        this.loaderService.show();

        this.desde = dayjs(this.formulario.get('desde').value).format('YYYY-MM-DD');
        this.hasta = dayjs(this.formulario.get('hasta').value).format('YYYY-MM-DD');
        this.formulario.get('ict').value == 'zscore' ? this.tipo = 'Z-Score' : this.tipo = 'Valor asignado';


        this.jsonTxtEquipos = this.buildJsons(this.formulario.value.equipos, 'equipos');
        this.jsonTxtAnalitos = this.buildJsons(this.formulario.value.analitos, 'analitos');

        let jsonExt = {

          Fechadesde: this.desde,
          Fechahasta: this.hasta,
          Idcalculado: this.formulario.get('ict').value,
          idcliente: this.formulario.get('cliente').value,
          idsede: this.formulario.get('sede').value,
          Idprogram: this.formulario.get('programa').value,
          IdAnalyzerqce: this.jsonTxtEquipos[0],
          IdAnalytesqce: this.jsonTxtAnalitos[0],//"2,33",//,

        }

        this.loaderService.show();
        this.loaderService.text.emit({ text: 'Cargando información' });
        let datos = await this.reporteICTService.getDataICTExterno(jsonExt);

        this.dataTableExterno_Tmp = datos;
        this.dataTableExterno = datos; // TODO: ****
        //this.buildGraphicDesvio();
        this.loaderService.hide();
        this.ver = true;
        this.verTablaExt = true;

        this.verTablaExt = true;
        this.verCard = true;
        setTimeout(() => {
          this.calcularAnchoTabla();
        }, 100);

        setTimeout(() => {


          this.loaderService.hide();

          this.divCharts = document.getElementById('charts');
          if (this.divCharts) {
            while (this.divCharts.firstChild) {
              this.divCharts.removeChild(this.divCharts.firstChild);
            }
          }

          this.buildGraphicDesvio(this.dataTableExterno, 'desvio');
        }, 1024);


      } catch (error) {
        this.dataTableExterno_Tmp = [];
        this.toastr.error('No se encontraron datos');
        this.loaderService.hide();
        this.ver = false;
      }




    } else {
      this.toastr.info('Selecciones todos los Filtros');
    }

  }

  // ----------------------CTI----------------------------------

  public scrollCards(flow: number): void {
    this.scroll.nativeElement.scrollLeft += (136.1 * flow);
  }




  //-----------------------------------------
  buildJsons(array: Array<any>, control: string): Array<any> {

    var cadena = '';
    var json = '';

    for (let i = 0; i < array.length; i++) {

      if (array[0] == '-1') {

        cadena = 'Todos';
        json = '-1';
        break;

      } else {

        json = array.join();
        var ref: any;


        if (control == 'sedes') {

          var ref = this.sedes.find(dato => dato.idheadquarters == array[i]);
          cadena += ref.desheadquarters + ', ';

        }

        if (control == 'equipos') {

          var ref = this.listaEquipos.find(dato => dato.idAnalyzer == array[i]);
          cadena += ref.nameAnalyzer + ', ';

        }

        if (control == 'analitos') {

          var ref = this.analitos.find(dato => dato.idanalytes == array[i]);
          cadena += ref.desanalytes + ', ';

        }

      }

    }

    return [json, cadena];

  }

  // -----------------------------------------
  // se crean las Tablas del PDF
  //------------------------------------------

  createTableICTExterno(data: DataICTExt[]): ITable {

    return new Table([
      [
        { text: 'Informacion de Test', style: 'tableHeader', colSpan: 6, alignment: 'center', bold: true, color: '#FFFFFF', fillColor: '#3850eb' },
        {},
        {},
        {},
        {},
        {},
        { text: 'Grupo de Comparación', style: 'tableHeader', colSpan: 2, alignment: 'center', bold: true, color: '#FFFFFF', fillColor: '#3850eb' },
        {},
        { text: 'Criterios de Evaluación', style: 'tableHeader', colSpan: 3, alignment: 'center', bold: true, color: '#FFFFFF', fillColor: '#3850eb' },
        {},
        {},
        { text: 'ICT Externo', style: 'tableHeader', colSpan: 2, alignment: 'center', bold: true, color: '#FFFFFF', fillColor: '#3850eb' },
        {},
      ],
      [
        { text: "No", bold: true, color: '#FFFFFF', fillColor: '#3850eb' },
        { text: "Programa", bold: true, color: '#FFFFFF', fillColor: '#3850eb' },
        { text: "Equipo", bold: true, color: '#FFFFFF', fillColor: '#3850eb' },
        { text: "Analito", bold: true, color: '#FFFFFF', fillColor: '#3850eb' },
        { text: "Resultado", bold: true, color: '#FFFFFF', fillColor: '#3850eb' },
        { text: "Unidad Analito", bold: true, color: '#FFFFFF', fillColor: '#3850eb' },
        { text: "Media", bold: true, color: '#FFFFFF', fillColor: '#3850eb' },
        { text: "DS", bold: true, color: '#FFFFFF', fillColor: '#3850eb' },
        { text: "Fuente", bold: true, color: '#FFFFFF', fillColor: '#3850eb' },
        { text: "Desv. Permitida", bold: true, color: '#FFFFFF', fillColor: '#3850eb' },
        { text: "Unidades", bold: true, color: '#FFFFFF', fillColor: '#3850eb' },
        { text: "Zscore", bold: true, color: '#FFFFFF', fillColor: '#3850eb' },
        { text: "ID", bold: true, color: '#FFFFFF', fillColor: '#3850eb' },

      ],
      ...this.extractDataICTExt(data)
    ])
      .width('auto')
      .widths('auto')
      .layout({
        hLineColor: (rowIndex: number, node: any, columnIndex: number) => {
          return rowIndex <= 1 ? '#3850eb' : '#DEDEDE';
        },
        vLineColor: (rowIndex: number, node: any, columnIndex: number) => {
          return columnIndex == 1 ? '#3850eb' : '#DEDEDE';
        },
        hLineWidth: (i?: number, node?: any, columnIndex?: any) => 0.5,
      })
      .fontSize(9)
      .end;
  }



  extractDataICTExt(data: DataICTExt[]) {

    return data.map((row, index) =>
      [
        row.Consecutivo,//(index + 1),
        row.Desprograma,
        row.Nameanalyzer,
        row.Desanalytes,
        row.Resultado,
        row.Unidad,
        row.media,
        row.ds,
        row.Fuente,
        row.DesvPermitida,
        row.UnidadObjetivo,
        row.Zscore,
        row.Indicedesvio

      ]

    );


  }

  createTableICTExternoValorAsignado(data: DataICTExt[]): ITable {

    return new Table([
      [
        { text: 'Informacion de Test', style: 'tableHeader', colSpan: 7, alignment: 'center', bold: true, color: '#FFFFFF', fillColor: '#3850eb' },
        {},
        {},
        {},
        {},
        {},
        {},
        { text: 'Criterios de evaluación	', style: 'tableHeader', colSpan: 3, alignment: 'center', bold: true, color: '#FFFFFF', fillColor: '#3850eb' },
        {},
        {},
        { text: 'ICT Externo', style: 'tableHeader', colSpan: 2, alignment: 'center', bold: true, color: '#FFFFFF', fillColor: '#3850eb' },
        {},
      ],
      [
        { text: "No", bold: true, color: '#FFFFFF', fillColor: '#3850eb' },
        { text: "Programa", bold: true, color: '#FFFFFF', fillColor: '#3850eb' },
        { text: "Equipo", bold: true, color: '#FFFFFF', fillColor: '#3850eb' },
        { text: "Analito", bold: true, color: '#FFFFFF', fillColor: '#3850eb' },
        { text: "Resultado", bold: true, color: '#FFFFFF', fillColor: '#3850eb' },
        { text: "Unidad Analito", bold: true, color: '#FFFFFF', fillColor: '#3850eb' },
        { text: "V. Asignado", bold: true, color: '#FFFFFF', fillColor: '#3850eb' },
        { text: "Fuente", bold: true, color: '#FFFFFF', fillColor: '#3850eb' },
        { text: "Desv. permitida", bold: true, color: '#FFFFFF', fillColor: '#3850eb' },
        { text: "Unidades", bold: true, color: '#FFFFFF', fillColor: '#3850eb' },
        { text: "Desv. obtenid", bold: true, color: '#FFFFFF', fillColor: '#3850eb' },
        { text: "ID", bold: true, color: '#FFFFFF', fillColor: '#3850eb' },

      ],
      ...this.extractDataICTExtValorAsignado(data)
    ])
      .width('auto')
      .widths('auto')
      .layout({
        hLineColor: (rowIndex: number, node: any, columnIndex: number) => {
          return rowIndex <= 1 ? '#3850eb' : '#DEDEDE';
        },
        vLineColor: (rowIndex: number, node: any, columnIndex: number) => {
          return columnIndex == 1 ? '#3850eb' : '#DEDEDE';
        },
        hLineWidth: (i?: number, node?: any, columnIndex?: any) => 0.5,
      })
      .fontSize(9)
      .end;
  }



  extractDataICTExtValorAsignado(data: any[]) {


    return data.map((row, index) =>
      [
        row.Consecutivo,//(index + 1),
        row.Desprograma,
        row.Nameanalyzer,
        row.Desanalytes,
        row.Resultado,
        row.Unidadobjetivo,
        row.Valorasignado,
        row.Fuente,
        row.Desvpermitida,
        row.Unidad,
        row.Desvobtenida,
        row.Indicedesvio,


      ]

    );


  }



  pdfExterno() {

    try {
      //TODO: Solucionar error con sugnda descarga PDF
      this.loaderService.show()
      this.loaderService.text.emit({ text: 'Generando reporte...' })
      this.divCharts = document.getElementById('htmlData');
      this.divCharts.style.marginTop = "400px";


      this.buildGraphicSigmometria(this.dataTableInterno_Tmp, 'pdf');
      this.buildGraphicDesvio(this.dataTableExterno, 'pdf');


      // time delay
      setTimeout(async () => {


        var _imagesArr = [];
        const options = {
          background: null,
          scale: 0.88,
          //width: 300
        };

        const DATA = document.getElementById('main');
        var arrElmt = DATA.children;

        for (var i = 0; i < (arrElmt.length - 1); i++) {
          //console.log(arrElmt[i]);
          const rowElmt = document.getElementById(`row-${i}-pdf`);
          var loadImg = await html2canvas(rowElmt, options).then((canvas) => canvas.toDataURL());
          _imagesArr.push(loadImg);

        }

        const chartDesvioElmt = document.getElementById('pdf');
        var chartDesvioImg = await html2canvas(chartDesvioElmt, options).then((canvas) => canvas.toDataURL());




        // Archivo PDF - construccion
        PdfMakeWrapper.setFonts(pdfFonts);

        const pdf = new PdfMakeWrapper();
        pdf.pageSize('A3');
        pdf.pageOrientation('landscape');
        pdf.pageMargins([30, 50, 30, 50]);


        // REPORT
        //pdf.header('This is a header');
        //pdf.add( await new Img(this.logoSourceToPDF).width(140).build() );

        pdf.add(new Columns([ // Encabezado
          {
            width: '*',
            text: ''

          },
          {
            width: 'auto',
            alignment: 'left',
            stack: [
              {
                width: 100,
                image: this.logoSourceToPDF
              }
            ]
          },
          {
            width: 'auto',
            color: '#848484',
            text: `${this.clienteName}\n${this.clienteNit}\n${this.clienteAddres}`,
          },
          {
            width: '*',
            text: ''

          },
        ]).columnGap(0).end);
        pdf.add(pdf.ln(1));
        pdf.add(
          new Canvas([
            new Line([10, 0], [1100, 0])
              .color('#3850eb')
              .end
          ])
            .end
        );
        pdf.add(pdf.ln(2));

        pdf.add(pdf.ln(2));

        _imagesArr.forEach(img => { // imagenes Graficas

          pdf.add(
            new Stack(
              [
                {
                  width: 800,
                  height: 280,
                  image: img // imagenes Graficas
                }
              ]
            ).alignment('center').end
          );
          pdf.add(pdf.ln(3));
        });
        pdf.add(pdf.ln(3));
        pdf.add(
          new Table(
            [
              [
                {
                  text: `Indicadores de Competencia Técnica\nFechas: ${this.desde} - ${this.hasta}\n Fecha Reporte: ${this.hoyPdf}\nICT Externo calculado por: ${this.formulario.get('ict').value}`,
                  color: '#848484',
                  fillColor: '#F9F9F9',
                  border: [false, false, false, false],
                  alignment: 'center',
                  fontSize: 10,
                }
              ],
            ]
          ).widths('*').end
        );
        pdf.add(pdf.ln(2));
        if (this.tipo != 'Valor asignado') {
          pdf.add(new Columns(
            [new Txt("").width('*').end,

            this.createTableICTExterno(this.dataTableExterno_Tmp),
            new Txt("").width('*').end]
          ).end);
        }else{

          pdf.add(new Columns(
            [new Txt("").width('*').end,

            this.createTableICTExternoValorAsignado(this.dataTableExterno_Tmp),
            new Txt("").width('*').end]
          ).end);
        }

        pdf.add(pdf.ln(2));
        pdf.add(
          new Stack(
            [
              await new Img(this.grafico01ext[0]).width(400).build()
              // await new Img(chartDesvioImg).width(800).build()
            ]
          ).alignment('center').end

        );

        //pdf.create().download();
        pdf.create().open();

        setTimeout(() => {
          this.loaderService.hide()
          this.divCharts.style.marginTop = "0px"
          while (this.divCharts.firstChild) {
            this.divCharts.removeChild(this.divCharts.firstChild);
          }
        }, 300);


      }, 700);
    } catch (error) {
      console.error(error)
    }
  }

  exportToExcelInt(): void {
    this.ExporterService.exportToExcel(this.dataTableInterno, 'ICT-Interno');
  }

  exportToExcelExt(): void {
    this.ExporterService.exportToExcel(this.dataTableExterno, 'ICT-Externo');
  }
  // ----------------------------------------
  downloadPDF() {

    if (this.verTablaExt === true) {
      this.pdfExterno();
      this.verTablaInt = false;
      this.verbtnexcelext = true;
      this.verbtnexcelint = false;
    }


  }

  getClippedRegion(image, x, y, width, height) {
    var canvas = document.createElement("canvas"),
      ctx = canvas.getContext("2d");

    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(image, x, y, width, height, 0, 0, width, height);

    return {

      image: canvas.toDataURL(),
      width: 500

    };
  }

  buildGraphicSigmometria(_dataTableInterno: any, idIndx: string) {

    var secciones = [];

    for (let i = 0; i < _dataTableInterno.length; i++) {

      if (!secciones.includes(_dataTableInterno[i].Seccion)) {

        secciones.push(_dataTableInterno[i].Seccion);

      }

    }

    for (let i = 0; i < secciones.length; i++) {

      var seccionesFiltradas = _dataTableInterno.filter(data => data.Seccion == secciones[i]);

      var constZ: number = Number(seccionesFiltradas[0].Constz);
      var labels = [`< a ${constZ}`, `Entre ${constZ} y 2,99`, 'Entre 3 y 3,99', 'Entre 4 y 5,99', '> a 6', 'Total'];

      var grupo1 = seccionesFiltradas.filter(data => Number(data.SIG) < constZ);
      var grupo2 = seccionesFiltradas.filter(data => Number(data.SIG) >= constZ && Number(data.SIG) < 3);
      var grupo3 = seccionesFiltradas.filter(data => Number(data.SIG) >= 3 && Number(data.SIG) < 4);
      var grupo4 = seccionesFiltradas.filter(data => Number(data.SIG) >= 4 && Number(data.SIG) < 6);
      var grupo5 = seccionesFiltradas.filter(data => Number(data.SIG) > 6);

      // graficos sigmometria
      var row = document.createElement("div");
      row.setAttribute("id", `row-${i}-${idIndx}`);

      var col1 = document.createElement("div");
      var col2 = document.createElement("div");

      row.classList.add("row");
      row.classList.add("col-12");

      col1.classList.add("col-12");
      col1.classList.add("col-sm-12");
      col1.classList.add("col-md-12");
      col1.classList.add("col-lg-12");
      col1.classList.add("col-xl-6");
      col1.classList.add("mb-3");


      col2.classList.add("col-12");
      col2.classList.add("col-sm-12");
      col2.classList.add("col-md-12");
      col2.classList.add("col-lg-12");
      col2.classList.add("col-xl-6");

      row.append(col1, col2);
      this.divCharts.append(row);
      this.divCharts.style.minWidth = 'unset';

      var _wChartSIG = 480;

      var chart = document.createElement("div");
      chart.setAttribute("id", `${secciones[i]}-${idIndx}`);
      chart.style.marginLeft = "-25px";
      if (idIndx == 'pdf') {
        chart.style.marginLeft = "-35px";
      }

      if (this.divCharts.clientWidth > 1024) {
        _wChartSIG = this.divCharts.clientWidth * 0.45;
        chart.style.marginLeft = "0px";
      }

      col1.append(chart);

      //Object.defineProperty(document.getElementById(`${secciones[i]}-${idIndx}`), 'clientWidth', { get: function () { return 1100 } });
      Object.defineProperty(document.getElementById(`${secciones[i]}-${idIndx}`), 'clientWidth', { get: function () { return _wChartSIG } });
      //Object.defineProperty(document.getElementById(`${secciones[i]}-${idIndx}`), 'clientHeight', { get: function () { return 400 } });
      Object.defineProperty(document.getElementById(`${secciones[i]}-${idIndx}`), 'clientHeight', { get: function () { return 360 } });
      //document.getElementById(`${secciones[i]}-${idIndx}`).style.marginTop = "16px";

      var grafico0 = echarts.init(document.getElementById(`${secciones[i]}-${idIndx}`));

      grafico0.setOption({

        title: {
          text: `Resumen de Métrica Sigma-${secciones[i]}`,
          // left: 'center',
          textStyle: {
            color: '#6F4B8B',
            fontSize: 15,
          },

        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          boundaryGap: [0, 0.01]
        },
        yAxis: {
          type: 'category',
          data: labels,
          axisLabel: {
            fontWeight: 'bold',
            color: '#6F4B8B',
          }
        },
        series: [
          {
            name: '2011',
            type: 'bar',
            data: [
              {
                label: {
                  show: true,
                  position: 'right',
                  fontWeight: 'bold',
                  color: '#6F4B8B'
                },
                value: grupo1.length,
                itemStyle: {
                  color: '#FF0000'
                }
              },
              {
                label: {
                  show: true,
                  position: 'right',
                  fontWeight: 'bold',
                  color: '#6F4B8B'
                },
                value: grupo2.length,
                itemStyle: {
                  color: '#00B0F0'
                }
              },
              {
                label: {
                  show: true,
                  position: 'right',
                  fontWeight: 'bold',
                  color: '#6F4B8B'
                },
                value: grupo3.length,
                itemStyle: {
                  color: '#FFFF00'
                }
              },
              {
                label: {
                  show: true,
                  position: 'right',
                  fontWeight: 'bold',
                  color: '#6F4B8B'
                },
                value: grupo4.length,
                itemStyle: {
                  color: '#92D050'
                }
              },
              {
                label: {
                  show: true,
                  position: 'right',
                  fontWeight: 'bold',
                  color: '#6F4B8B'
                },
                value: grupo5.length,
                itemStyle: {
                  color: '#00B050'
                }
              },
              {
                label: {
                  show: true,
                  position: 'right',
                  fontWeight: 'bold',
                  color: '#6F4B8B'
                },
                value: seccionesFiltradas.length,
                itemStyle: {
                  color: '#7F7F7F'
                }
              }
            ]
          }
        ]

      });
      setTimeout(() => {
        this.grafico01sig.push(grafico0.getDataURL());
      }, 1000);

      var ptsDesempenio = [];
      var numeros = [];
      var maximo: number;
      var minimo: number;
      var maximoverde: number;

      for (let i = 0; i < seccionesFiltradas.length; i++) {

        numeros.push(Number(seccionesFiltradas[i].SIG));
        maximo = Math.max.apply(null, numeros);
        minimo = Math.min.apply(null, numeros);

        if (Number(seccionesFiltradas[i].SIG) < 0) {

          maximo -= 2;
          minimo -= 2;
        } else {

          maximo += 2;
        }

        if (!isNaN(Number(seccionesFiltradas[i].SIG)) && seccionesFiltradas[i].SIG !== '-∞' && seccionesFiltradas[i].SIG !== '∞' && seccionesFiltradas[i].SIG !== '--') {
          var obj = {
            nivel: Number(seccionesFiltradas[i].Nivel),
            analito: seccionesFiltradas[i].Analito,
            value: [Number(i + 1), Number(seccionesFiltradas[i].SIG)]
          };

          ptsDesempenio.push(obj);
        }
      }

      var _wChartDES = 520;

      // graficos desempeño
      var chartDesempenio = document.createElement("div");
      chartDesempenio.setAttribute("id", `desempenio${secciones[i]}-${idIndx}`);


      if (this.divCharts.clientWidth > 1024) {
        _wChartDES = this.divCharts.clientWidth * 0.5;
        chartDesempenio.style.marginLeft = "70px";
      }

      col2.append(chartDesempenio);

      //this.divCharts.append(chartDesempenio);

      // Object.defineProperty(document.getElementById(`desempenio${secciones[i]}-${idIndx}`), 'clientWidth', { get: function () { return 900 } });
      Object.defineProperty(document.getElementById(`desempenio${secciones[i]}-${idIndx}`), 'clientWidth', { get: function () { return _wChartDES } });
      // Object.defineProperty(document.getElementById(`desempenio${secciones[i]}-${idIndx}`), 'clientHeight', { get: function () { return 500 } });
      Object.defineProperty(document.getElementById(`desempenio${secciones[i]}-${idIndx}`), 'clientHeight', { get: function () { return 360 } });
      //document.getElementById(`desempenio${secciones[i]}-${idIndx}`).style.marginTop = "16px";


      var graficoDesempenio = echarts.init(document.getElementById(`desempenio${secciones[i]}-${idIndx}`));

      //var grafico = echarts.init(document.getElementById(idIndx));
      //maximo = ptsDesempenio.length;

      maximo = ptsDesempenio.sort((a, b) => {
        if (a.value[0] < b.value[0]) {
          return -1
        }
        if (a.value[0] > b.value[0]) {
          return 1
        }
        return 0
      })[ptsDesempenio.length - 1].value[0] + 3;


      let posY = ptsDesempenio.sort((a, b) => {
        if (a.value[1] < b.value[1]) {
          return -1
        }
        if (a.value[1] > b.value[1]) {
          return 1
        }
        return 0
      })[ptsDesempenio.length - 1].value[1];

      let posYmin = ptsDesempenio.sort((a, b) => {
        if (b.value[1] < a.value[1]) {
          return -1
        }
        if (b.value[1] > a.value[1]) {
          return 1
        }
        return 0
      })[ptsDesempenio.length - 1].value[1];


      posYmin < 0 ? posYmin -= 3 : posYmin;
      posY < 0 ? posY += 0.5 : posY += 0.5;

      posYmin = parseFloat(posYmin.toFixed(3));
      posY = parseFloat(posY.toFixed(3));

      graficoDesempenio.setOption({
        title: {
          text: `Resumen Consolidado de Métrica Sigma-${secciones[i]}`,
          //left: 'center',
          textStyle: {
            color: '#6F4B8B',
            fontSize: 15,
          }
        },
        grid: {
          left: '0%',
          right: '11%',
          bottom: '10%',
          with: '90%',
          containLabel: true,
          show: true,
          borderWidth: 3
        },
        tooltip: {
          trigger: 'item',
          formatter: function (data) {
            var color = '#6F4B8B';
            return `<b style="color: ${color}">Analito: ${data.data.analito}</b>` + '<br>' + `<b style="color: black">Nivel: ${data.data.nivel}</b>` + '<br>' + `<b style="color: black">Sigma: ${data.data.value[1]}</b>`;
          }
        },
        xAxis: [
          {
            type: 'value',
            boundaryGap: false,
            show: false,
            min: 0,
            max: maximo
          }
        ],
        yAxis: [
          {
            type: 'value',
            show: true,
            min: posYmin,
            max: posY
          }
        ],
        series: [
          {
            type: 'line',
            showSymbol: false,
            zlevel: 1,
            areaStyle: {
              color: '#8BD59E',
              opacity: 1
            },
            lineStyle: {
              width: 0
            },
            data: [
              [0, posY],
              [maximo, posY]
            ]
          },
          {
            type: 'line',
            showSymbol: false,
            zlevel: 2,
            areaStyle: {
              color: '#C8F7CA',
              opacity: 1
            },
            lineStyle: {
              width: 0
            },
            data: [
              [0, 5.99],
              [maximo, 5.99]
            ]
          },
          {
            type: 'line',
            showSymbol: false,
            zlevel: 3,
            areaStyle: {
              color: '#FFFDCA',
              opacity: 1
            },
            lineStyle: {
              width: 0
            },
            data: [
              [0, 3.99],
              [maximo, 3.99]
            ]
          },
          {
            type: 'line',
            showSymbol: false,
            zlevel: 4,
            areaStyle: {
              color: '#C8FAFF',
              opacity: 1
            },
            lineStyle: {
              width: 0
            },
            data: [
              [0, 2.99],
              [maximo, 2.99]
            ]
          },
          {
            type: 'line',
            showSymbol: false,
            zlevel: 5,
            areaStyle: {
              color: '#FF8D7E',
              opacity: 1
            },
            lineStyle: {
              width: 0
            },
            data: [
              [0, constZ],
              [maximo, constZ]
            ]
          },
          {
            type: 'line',
            showSymbol: false,
            zlevel: 6,
            areaStyle: {
              color: '#FF8D7E',
              opacity: 1
            },
            lineStyle: {
              width: 0
            },
            data: [
              [0, -2],
              [maximo, -2]
            ]
          }
          ,
          {
            type: 'scatter',
            symbolSize: 7,
            zlevel: 7,
            showSymbol: true,
            symbol: 'circle',
            itemStyle: {
              color: 'black',
              cursor: 'pointer'
            },
            data: ptsDesempenio
          }
        ]

      });


      setTimeout(() => {
        this.grafico01sig.push(graficoDesempenio.getDataURL());
      }, 1000);
    }
  }

  buildGraphicDesvio(_dataTableExterno: any, idIndx: string) {

    var labels = ['ID menor a 1', 'ID mayor a 1', 'Total'];

    var grupo1 = _dataTableExterno.filter(data => Number(data.Indicedesvio) < 1);
    var grupo2 = _dataTableExterno.filter(data => Number(data.Indicedesvio) > 1);

    var chart = document.createElement("div");
    chart.setAttribute("id", idIndx);

    this.divCharts.append(chart);

    var _wChartDESV = 600;

    if (this.divCharts.clientWidth > 1024) {
      _wChartDESV = this.divCharts.clientWidth * 0.95;
      this.divCharts.style.minWidth = '100%';
    }

    Object.defineProperty(document.getElementById(idIndx), 'clientWidth', { get: function () { return _wChartDESV } });
    Object.defineProperty(document.getElementById(idIndx), 'clientHeight', { get: function () { return 400 } });
    //document.getElementById(idIndx).style.marginTop = "40px";

    var grafico = echarts.init(document.getElementById(idIndx));

    grafico.setOption({

      title: {
        text: 'Reporte de QCE',
        left: 'center',
        textStyle: {
          color: '#6F4B8B'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        boundaryGap: [0, 0.01],
        axisLine: {
          show: true,
          lineStyle: {
            color: '#707070',  // Color del borde
            width: 1           // Grosor del borde
          }
        }
      },
      yAxis: {
        type: 'category',
        data: labels,
        axisLine: {
          show: true,
          lineStyle: {
            color: '#707070',  // Color del borde
            width: 1          // Grosor del borde
          }
        },
        axisLabel: {
          fontWeight: 'bold',
          color: '#6F4B8B',
        },

      },
      series: [
        {
          name: '2011',
          type: 'bar',
          data: [
            {
              label: {
                show: true,
                position: 'right',
                fontWeight: 'bold',
                color: '#6F4B8B'
              },
              value: grupo1.length,
              itemStyle: {
                color: '#0FD0CD'
              }
            },
            {
              label: {
                show: true,
                position: 'right',
                fontWeight: 'bold',
                color: '#6F4B8B'
              },
              value: grupo2.length,
              itemStyle: {
                color: '#D11B22'
              }
            },
            {
              label: {
                show: true,
                position: 'right',
                fontWeight: 'bold',
                color: '#6F4B8B'
              },
              value: _dataTableExterno.length,
              itemStyle: {
                color: '#7F7F7F'
              }
            }
          ]
        }
      ]

    });
    setTimeout(() => {
      this.grafico01ext = [];
      this.grafico01ext.push(grafico.getDataURL());

    }, 1000);

  }


  calcularAnchoTabla() {
    const hoja = $('.hoja').width();
    const hojaAncho = $('.hoja').height();
    let width = 0;
    let height = 0;

    if (hoja < 2000) {
      width = 2000
    } else {
      width = hoja
    }
    if (hojaAncho < 600) {
      height = 600
    } else {
      height = hojaAncho
    }

    $('.contTables').css('min-width', `${width}px`);
    // $('.tables-unificated').css('height', `${height}px`);
  }
}


