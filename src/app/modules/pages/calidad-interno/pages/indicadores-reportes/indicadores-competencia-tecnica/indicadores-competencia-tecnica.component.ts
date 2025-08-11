import { AfterViewInit, Component, ElementRef, Input, OnInit, QueryList, signal, ViewChild, ViewChildren } from '@angular/core';
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
import moment from 'moment';
import { ImageCdnPipe } from '../../../../../core/pipes/image-cdn.pipe';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgIf, NgFor, NgClass, LowerCasePipe, NgStyle, TitleCasePipe } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { MatIcon } from '@angular/material/icon';
import { LoaderService } from '@app/services/loader/loader.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { SedesService } from '@app/services/configuracion/sedes.service';
import { TestsService } from '@app/services/configuracion/test.service';

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
  IDM: string;
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
  selector: 'app-indicadores-competencia-tecnica',
  templateUrl: './indicadores-competencia-tecnica.component.html',
  styleUrls: [
    './indicadores-competencia-tecnica.component.css',
    '../reporte-analitos-alerta/reporte-analitos-alerta.component.css',
    '../../ingreso/ingreso-datos/ingreso-datos.component.css'
  ],
  standalone: true,
  imports: [NgIf, FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatSelectModule,
    MatOptionModule,
    NgFor,
    MatTooltipModule,
    NgClass,
    LowerCasePipe,
    TranslateModule,
    ImageCdnPipe,
    MatIcon,
    NgStyle,
    TitleCasePipe,
    NgxMatSelectSearchModule
  ]
})
export class IndicadoresCompetenciaTecnicaComponent implements OnInit, AfterViewInit {

  @ViewChild('scroll') scroll: ElementRef;
  @Input() flagFromParent: boolean = true;

  dataSource: MatTableDataSource<any>;
  displayedColumns: string[] = ['1', '2', '3', '4', '5', '6', '7'];
  displayedColumns2: string[] = ['Control', 'N° Datos', 'Concordancia', 'No concordancia', '% Aceptación', '% Rechazados', 'Métrica Sigma'];

  highlightStyle = {
    transform: 'translateX(0px)',
    width: '0px'
  };

  private columnWidth: number = 0;
  private currentHighlightIndex: number = -1;
  @ViewChildren('slide') slides: QueryList<ElementRef>;

  flagViewTable = signal<boolean>(false);

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

  tests = [];
  secciones = [];
  secciones_Tmp = [];
  secciones_TmpCopy = [];
  sedes = [];
  sedesCopy = [];
  equipos = [];
  equiposCopy = [];
  analitos = [];
  analitosCopy = [];
  lotes = [];
  lotesCopy = [];
  seccionSeleccionado: any;

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


  formulario: FormGroup = this.fb.group({

    desde: ['', [Validators.required]],
    hasta: ['', [Validators.required]],
    ict: [''],
    secciones: ['', [Validators.required]],
    sedes: ['', [Validators.required]],
    equipos: ['', [Validators.required]],
    analitos: ['', [Validators.required]],
    lotes: ['', [Validators.required]]

  })

  filterSede = new FormControl('');
  filterSeccion = new FormControl('');
  filterEquipo = new FormControl('');
  filterAnalito = new FormControl('');
  filterLote = new FormControl('');

  constructor(private fb: FormBuilder,
    private sanitizer: DomSanitizer,
    private seccionesService: SeccionesService,
    private sedesXUserService: SedesXUserService,
    private equiposService: AnalizadoresService,
    private analitosService: AnalitosService,
    private lotesService: LotesService,
    private reporteICTService: ReporteICTService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private laboratoriosService: LaboratoriosService,
    private ExporterService: ExporterService,
    private loader: LoaderService,
    private SedesService: SedesService,
    private TestsService: TestsService
  ) { }

  ngOnInit() {

    this.getLogoSource();
    //Se comentarea la función ya que se encuentra un servicio nuevo que dependiendo de las fechas retorna las sedes
    //this.dataFilters();
    this.validarCliente();
    this.validselect();
    this.filtrosAutocomplete();

    this.calculateColumnWidth();
    this.moveHighlight(0);
  }

  ngAfterViewInit() {
    const pdfContainer = document.getElementById('charts');
    if (pdfContainer) {
      // Manipula el DOM de forma segura aquí
    } else {
      console.error('Contenedor no disponible al cargar la vista');
    }
  }

  private calculateColumnWidth(): void {
    const gridContainer = document.querySelector('.grid-container') as HTMLElement;
    if (gridContainer) {
      this.columnWidth = gridContainer.offsetWidth / 2; // Assuming 5 columns
    }
  }

  moveHighlight(columnIndex: number): void {
    if (this.columnWidth === 0) {
      this.calculateColumnWidth();
    }
    const columnPosition = columnIndex * this.columnWidth;
    this.highlightStyle = {
      transform: `translateX(${columnPosition}px)`,
      width: `${this.columnWidth}px`
    };
    // Remueve la clase de texto blanco del div anterior
    if (this.currentHighlightIndex !== -1) {
      const previousElement = this.slides.toArray()[this.currentHighlightIndex];
      if (previousElement) {
        previousElement.nativeElement.classList.remove('highlight-active');
      }
    }

    // Añade la clase de texto blanco al nuevo div
    const newElement = this.slides?.toArray()[columnIndex];
    if (newElement) {
      newElement.nativeElement.classList.add('highlight-active');
    }

    // Actualiza el índice del highlight actual
    this.currentHighlightIndex = columnIndex;
  }


  async observeFechas(campo: string) {

    let x = this.formulario.get("desde").value;
    let y = this.formulario.get("hasta").value;
    let fechaX = null;
    let fechaY = null;
    if (x) {
      fechaX = moment(x).format()
    }
    if (y) {
      fechaY = moment(y).format()
    }

    if (fechaX === 'Invalid date') {
      this.formulario.get(campo).setValue(null);
      this.toastr.error('La fecha es invalida');
      return
    }

    if (x !== 'Invalid date' && x && y && y !== 'Invalid date') {
      if (moment(x).format() > moment(y).format()) {
        this.formulario.get('hasta').setValue(null);
        this.toastr.error(`La fecha "hasta" no puede ser menor a la fecha "desde"`);
      }
    }

    if (fechaX !== null && fechaY !== null) {
      //Nuevo servicio creado el 5/12/2024 para filtrar los test en donde existen resultados según fecha desde - hasta
      await this.TestsService.TestXResultadosAsync(fechaX, fechaY).then((dtTests: any) => {
        this.tests = dtTests.filter(dt => dt.active).map(x => x.idTest);
      });

      //Con los test retornados en el servicio anterior TestXResultadosAsync se envian al servicio para traer las sedes
      await this.SedesService.sedesXResultadosAsync(this.tests).then((data: any) => {
        this.sedes = data.filter(data => data.active);
        this.sedesCopy = data.filter(data => data.active);
      });
    }
  }


  /**
   *  Método para filtrar los datos de los select de autocomplete
   */
  validarCliente() {
    this.laboratoriosService.getAllAsync().then(lab => {
      // Verificar si 'lab' tiene datos
      if (lab && lab.length > 0) {
        this.clienteName = lab[0].name;
        this.clienteNit = lab[0].nit;
        this.clienteAddres = lab[0].addres;

        // Validación de datos vacíos
        if (!this.clienteName || !this.clienteNit || !this.clienteAddres) {
          this.toastr.warning('Información del laboratorio incompleta. Por favor, complete todos los datos del laboratorio.');
        }
      } else {
        this.toastr.warning('No se encontraron datos del laboratorio.');
      }
    }).catch(error => {
      this.toastr.error('Error al obtener los datos del laboratorio.');
      console.error('Error:', error);
    });
  }


  validselect() {
    if (this.equipos.length == 0) {
      this.vertodosequipos = false;
    }
    if (this.secciones_Tmp.length == 0) {
      this.vertodassecciones = false;
    }
    if (this.analitos.length == 0) {
      this.vertodosanalitos = false;
    }
  }


  getLogoSource() {
    this.laboratoriosService.getLogoImage()
      .subscribe(logo => {
        this.logoSource = this.sanitizer.bypassSecurityTrustResourceUrl(`data:image/jpg;base64,${logo}`);
        this.logoSourceToPDF = `data:image/jpg;base64,${logo}`;
        let noimage = '/9j/4QAYRXhpZgAASUkqAAgAAAAAAAAAAAAAAP/sABFEdWNreQABAAQAAAAeAAD/4QMvaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjYtYzEzOCA3OS4xNTk4MjQsIDIwMTYvMDkvMTQtMDE6MDk6MDEgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE3IChXaW5kb3dzKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo5RjhGRDhDMjg2OEQxMUU3OTkxQ0Y0M0JBQ0I2RENFQyIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo5RjhGRDhDMzg2OEQxMUU3OTkxQ0Y0M0JBQ0I2RENFQyI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjlGOEZEOEMwODY4RDExRTc5OTFDRjQzQkFDQjZEQ0VDIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjlGOEZEOEMxODY4RDExRTc5OTFDRjQzQkFDQjZEQ0VDIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+/+4ADkFkb2JlAGTAAAAAAf/bAIQAEAsLCwwLEAwMEBcPDQ8XGxQQEBQbHxcXFxcXHx4XGhoaGhceHiMlJyUjHi8vMzMvL0BAQEBAQEBAQEBAQEBAQAERDw8RExEVEhIVFBEUERQaFBYWFBomGhocGhomMCMeHh4eIzArLicnJy4rNTUwMDU1QEA/QEBAQEBAQEBAQEBA/8AAEQgAqgCqAwEiAAIRAQMRAf/EAGgAAQEBAQEBAAAAAAAAAAAAAAAFBAMCAQEBAAAAAAAAAAAAAAAAAAAAABAAAgECAwUIAwEBAAAAAAAAAAECAwQRUhQhMZGhEkFRcYHBMhMzsSJyYdERAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AN4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAdbeg608N0VvYHIFNW9BLDoXntPvwUckeAEsFT4KOSPAfBRyR4ASwVPgo5I8B8FHJHgBLBU+CjkjwHwUckeAEsFT4KOSPAfBRyR4ASwVPgo5I8B8FHJHgBLBU+CjkjwM9zaxUXOmsMN8QMYAAAAAAABusPZLx9DCbrD65ePoByvZyVVJNpYLYjh1zzPidr77l/KPFvRdaeG6K3sDx1zzPiOueZ8SlGhSisFBeLWLOda0pzi3BdMuzDcwMPXPM+I655nxPLTTwe9AD11zzPiOueZ8TyAPXXPM+I655nxPIA9dc8z4jrnmfE8gD18k8z4lR7YPHtRJKz9nkBJAAAAAAAAN1h9cvH0MJusPrl4+gHG++5fyjtYYfHLvx9Djffcv5R4t67ozxe2L3oCmDxGtSmsYyRyrXVOmmovqn2JbgMlzh888O85Btttva3vAAA0W1s6r6pbILmB8t7Z1f2lsh3954rUZUpdMt3Y+8ppJLBbEtyPNSnGpFxktn4AlA6VqMqUumW7sfecwBWfs8iSVn7PICSAAAAAAAAbrD65ePoYTdYfXLx9AON99y/lepnNF99y/lflmcAD6k5NRisW9yKFC2jTj+y6pS3/8AnA0XNs6T6o7YPkLa2dR9c9kPyAtrZ1H1z2QXM3pJLBbEgkksFsSPoAAAeKlONSLjJbPwTq1GVKXTLd2PvKh4qU41IuMls/AEorP2eRJKz9nkBJAAAAAAAAN1h9cvH0MJusPrl4+gHG++5fyvyzgk5NRisW9yO999y/lflnaxhHoc8P2xwx/wD3b26pLF7Zve+47gAfGk1g9qe9BJJYLYkfQAAAAAAAABHe8rP2eRJe8rP2eQEkAAAAAAAA3WH1y8fQwm6wf6SX+gcb77l/K/LOlpWpQpYTkk8XsF3RqzqKUI4rDA4aavkfIDdqaGdDU0M6MOmr5HyGmr5HyA3amhnQ1NDOjDpq+R8hpq+R8gN2poZ0NTQzow6avkfIaavkfIDdqaGdDU0M6MOmr5HyGmr5HyA3amhnQ1NDOjDpq+R8hpq+Rgcis/Z5E7TV8jKMtkHj2ICSAAAAAAAAdKNaVGfUtqe9HMAUFeUGsW2n3NH3V2+bkycAKOrt83JjV2+bkycAKOrt83JjV2+bkycAKOrt83JjV2+bkycAKOrt83JjV2+bkycAKOrt83JjV2+bkycAKOrt83JnC4u+uLhT2Re9vtMoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k=';

        if (logo == "") {
          this.logoSourceToPDF = `data:image/png;base64,${noimage}`;
        }
      });
  }

  // llenar filtros - selects
  async dataFilters() {

    await this.sedesXUserService.getByIdAsync(this.idUser).then((data: any) => {
      this.sedes = data.filter(data => data.active);
      this.sedesCopy = data.filter(data => data.active);
    });
  }

  // Select - Options

  selectAll(control: string) {
    let all = this.lotes.map(e => { return e.idLot })
    all.unshift("-1")
    this.formulario.get(control).setValue(all)

  }

  selectNone(control: string) {
    this.formulario.get(control).setValue('');
  }

  selectOne(control: string) {
    if (this.formulario.get(control).value[0] == '-1' || this.formulario.get(control).value[0] == '') {

      this.formulario.get(control).value.shift();
      this.formulario.get(control).setValue(this.formulario.get(control).value);

    }

    if (this.formulario.get(control).value.length == this.lotes.length) {
      let all = this.lotes.map(e => { return e.idLot })
      all.unshift("-1")
      this.formulario.get(control).setValue(all)
    }
  }

  selectedHeadquarter0(control: string) {
    if (this.formulario.get(control).value[0] == '-1' || this.formulario.get(control).value[0] == '') {

      this.formulario.get(control).value.shift();
      this.formulario.get(control).setValue(this.formulario.get(control).value);


    }
    //let arrcontrol = this.formulario.get(control).value;
    let arrsedes;
    this.formulario.get(control).value.forEach(element => {
      this.sedesid.push(element);

    });


    if (this.formulario.get(control).value.length == this.sedes.length) {
      let all = this.sedes.map(e => { return e.idheadquarters })
      all.unshift("-1")
      this.formulario.get('sedes').setValue(all)
    }

    arrsedes = (this.sedesid.filter((item, index) => {
      return this.sedesid.indexOf(item) === index;
    }));
    this.selectheadquarter(arrsedes);

  }

  selectedAllheadquaerter(control: string) {


    let all = this.sedes.map(e => { return e.idheadquarters })
    all.unshift("-1")
    this.formulario.get('sedes').setValue(all)
    this.formulario.value.sedes.forEach(element => {

      this.sedesid.push(element);
    });

    this.selectheadquarterAlls(this.sedesid);

  }

  async selectheadquarterAlls(sedes) {

    //Se comentarea el servicio ya que este servicio es más general para traer las secciones por sede
    /*
    let jsonTexto: any = '{"Idheadquarters":"' + sedes + '"}';

    await this.seccionesService.getAllAsyncSeccionesxsede(jsonTexto).subscribe((data: any) => {

      this.secciones_Tmp = data.filter(data => data.active);
      this.secciones_TmpCopy = data.filter(data => data.active);
      this.vertodassecciones = true;
    });
    */

    let json: any = '{"idheadquarters":' + `"${sedes}"` + "," + `"idTest":` + `[${this.tests}]` + '}';
    await this.seccionesService.getAllSeccionesxSedeTest(json).subscribe((data: any) => {
      this.secciones_Tmp = data.filter(data => data.active);
      this.secciones_TmpCopy = data.filter(data => data.active);
      this.vertodassecciones = true;
    });
  }

  async selectheadquarter(sedes) {

    let arrsedes2 = [];

    sedes.forEach(element => {
      if (element != '-1') {
        arrsedes2.push(element)
      }
    });

    let idsedes = arrsedes2.filter((item, index) => { return arrsedes2.indexOf(item) === index; });

    /*
    let jsonTexto: any = '{"Idheadquarters":"' + idsedes + '"}';
    await this.seccionesService.getAllAsyncSeccionesxsede(jsonTexto).subscribe((data: any) => {
      this.vertodassecciones = true;
      this.secciones_Tmp = data.filter(data => data.active);
    });
    */

    let json: any = '{"idheadquarters":' + `"${idsedes}"` + "," + `"idTest":` + `[${this.tests}]` + '}';
    await this.seccionesService.getAllSeccionesxSedeTest(json).subscribe((data: any) => {
      this.vertodassecciones = true;
      this.secciones_Tmp = data.filter(data => data.active);
    });
  }

  selectedsection(control: string) {


    if (this.formulario.get(control).value[0] == '-1' || this.formulario.get(control).value[0] == '') {

      this.formulario.get(control).value.shift();
      this.formulario.get(control).setValue(this.formulario.get(control).value);
    }

    if (this.formulario.get(control).value[0] != '-1' || this.formulario.get(control).value[0] != ' ') {

      this.selectsection(this.formulario.get(control).value);

    }

    if (this.formulario.get(control).value.length == this.secciones_Tmp.length) {
      let all = this.secciones_Tmp.map(e => { return e.idsection })
      all.unshift("-1")
      this.formulario.get(control).setValue(all)
    }



  }

  selectedAllsection(control: string) {
    let all = this.secciones_Tmp.map(e => { return e.idsection })
    all.push("-1")
    this.formulario.get(control).setValue(all)
    this.selectsectionAlls(this.formulario.get(control).value);
  }

  async selectsectionAlls(secciones) {

    //Se comentarea el servicio de traer los equipos filtrando por las secciones ya que se realizo el servicio mas especifico 
    // de traer los equipos por secciones y por los test
    /*
    let jsonTexto: any = '{"Idsection":"' + secciones + '"}';
    this.equiposService.getAllAsyncAnalyzersxseccion(jsonTexto).subscribe((data: any) => {
      this.vertodosequipos = true;
      this.equipos = data.filter(data => data.active);
      this.equiposCopy = data.filter(data => data.active);
    });
    */

    let json: any = '{"Idsection":' + `"${secciones}"` + "," + `"idTest":` + `[${this.tests}]` + '}';
    await this.equiposService.getAllAnalyzerXTestXSeccion(json).subscribe((data: any) => {
      this.equipos = data.filter(data => data.active);
      this.equiposCopy = data.filter(data => data.active);
      this.vertodosequipos = true;
    });


  }

  async selectsection(secciones) {

    if (secciones.length == 0) {
      return;
    }
    let arrsections2 = [];

    secciones.forEach(element => {
      if (element != '-1') {
        arrsections2.push(element)
      }
    });

    let idsecciones = null;
    idsecciones = arrsections2.filter((item, index) => { return arrsections2.indexOf(item) === index; });

    //Se comentarea el servicio de traer los equipos filtrando por las secciones ya que se realizo el servicio mas especifico 
    // de traer los equipos por secciones y por los test
    /*
    let jsonTexto: any = '{"Idsection":"' + idsecciones + '"}';
    this.equiposService.getAllAsyncAnalyzersxseccion(jsonTexto).subscribe((data: any) => {
      this.equipos = data.filter(data => data.active);
      this.vertodosequipos = true;
    });
    */

    let json: any = '{"Idsection":' + `"${idsecciones}"` + "," + `"idTest":` + `[${this.tests}]` + '}';
    this.equiposService.getAllAnalyzerXTestXSeccion(json).subscribe((data: any) => {
      this.equipos = data.filter(data => data.active);
      this.vertodosequipos = true;
    });

  }

  selectedanalyzer(control: string) {

    if (this.formulario.get(control).value[0] == '-1' || this.formulario.get(control).value[0] == '') {

      this.formulario.get(control).value.shift();
      this.formulario.get(control).setValue(this.formulario.get(control).value);
    }
    if (this.formulario.get(control).value[0] != '-1' || this.formulario.get(control).value[0] != '') {

      this.selectanalyzer(this.formulario.get(control).value);
    }

    if (this.formulario.get(control).value.length == this.equipos.length) {
      let all = this.equipos.map(e => { return e.idAnalyzer })
      all.unshift("-1")
      this.formulario.get(control).setValue(all)
    }
  }

  selectedAllanalyzer(control: string) {

    this.formulario.get(control).setValue(['-1']);
    let all = this.equipos.map(e => { return e.idAnalyzer })
    all.unshift("-1")
    this.formulario.get(control).setValue(all)
    this.selectanalyzerall(this.formulario.get(control).value);
  }

  async selectanalyzerall(equipos) {

    /*
    let jsonTexto: any = '{"IdAnalyzer":"' + equipos + '"}';
     this.analitosService.getAllAsyncAnalytesxanalyzer(jsonTexto).subscribe((data: any) => {
      this.vertodosanalitos = true;
      this.analitos = data.filter(data => data.active);
      this.analitosCopy = data.filter(data => data.active);
    });
    */

    let json: any = '{"IdAnalyzer":' + `"${equipos}"` + "," + `"idTest":` + `[${this.tests}]` + '}';
    await this.analitosService.getAllAnalytesxSedeTest(json).subscribe((data: any) => {
      this.analitos = data.filter(data => data.active);
      this.analitosCopy = data.filter(data => data.active);
      this.vertodosanalitos = true;
    });

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


    let idequipos = arranalyzer2.filter((item, index) => { return arranalyzer2.indexOf(item) === index; });

    //Se comentarea el servicio de traer los analitos filtrando por los equipos ya que se realizo el servicio mas especifico 
    // de traer los analitos por equipos y por los test
    /*
    let jsonTexto: any = '{"IdAnalyzer":"' + idequipos + '"}';

    await this.analitosService.getAllAsyncAnalytesxanalyzer(jsonTexto).subscribe((data: any) => {
      this.vertodosanalitos = true;
      this.analitos = data.filter(data => data.active);

    });
    */

    let json: any = '{"IdAnalyzer":' + `"${idequipos}"` + "," + `"idTest":` + `[${this.tests}]` + '}';
    await this.analitosService.getAllAnalytesxSedeTest(json).subscribe((data: any) => {
      this.analitos = data.filter(data => data.active);
      this.vertodosanalitos = true;
    });

  }

  selectedanalyte(control: string) {

    if (this.formulario.get(control).value[0] == '-1' || this.formulario.get(control).value[0] == '') {

      this.formulario.get(control).value.shift();
      this.formulario.get(control).setValue(this.formulario.get(control).value);

    }
    if (this.formulario.get(control).value[0] != '-1' || this.formulario.get(control).value[0] != '') {

      this.selectanalyte(this.formulario.get(control).value);
    }


    if (this.formulario.get(control).value.length == this.analitos.length) {
      let all = this.analitos.map(e => { return e.idanalytes })
      all.unshift("-1")
      this.formulario.get(control).setValue(all)
    }
  }

  selectedAllanalyte(control: string) {
    let all = this.analitos.map(e => { return e.idanalytes })
    all.unshift("-1")
    this.formulario.get(control).setValue(all)

    this.selectanalyteAlls(this.formulario.get(control).value);
  }

  async selectanalyteAlls(analitos) {

    /*
    let jsonTexto: any = '{"Idanalytes":"' + analitos + '"}';
    this.lotesService.getAllAsyncLotsxanalyte(jsonTexto).subscribe((data: any) => {
      this.lotes = data.filter(data => data.active);
      this.lotesCopy = data.filter(data => data.active);

    });
    */

    let json: any = '{"Idanalytes":' + `"${analitos}"` + "," + `"idTest":` + `[${this.tests}]` + '}';
    await this.lotesService.getAllLotesxTest(json).subscribe((data: any) => {
      this.lotes = data.filter(data => data.active);
      this.lotesCopy = data.filter(data => data.active);
    });


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

    let idanalitos = arranalyte2.filter((item, index) => { return arranalyte2.indexOf(item) === index; });

    /*
    let jsonTexto: any = '{"Idanalytes":"' + idanalitos + '"}';

    await this.lotesService.getAllAsyncLotsxanalyte(jsonTexto).subscribe((data: any) => {
      this.lotes = data.filter(data => data.active);
    });
    */

    let json: any = '{"Idanalytes":' + `"${idanalitos}"` + "," + `"idTest":` + `[${this.tests}]` + '}';
    await this.lotesService.getAllLotesxTest(json).subscribe((data: any) => {
      this.lotes = data.filter(data => data.active);
    });

  }

  // ------------------------------------

  async filtrar() {

    if (this.formulario.valid) {
      this.ver = false;
      this.verCard = false;
      this.verTablaInt = false;
      this.verTablaExt = false;

      this.loader.show();

      this.desde = dayjs(this.formulario.get('desde').value).format('YYYY-MM-DD');
      this.hasta = dayjs(this.formulario.get('hasta').value).format('YYYY-MM-DD');
      this.formulario.get('ict').value == 'zscore' ? this.tipo = 'Z-Score' : this.tipo = 'Valor asignado';

      let jsonExt = {

        Fechadesde: this.desde,
        Fechahasta: this.hasta,
        Idcalculado: this.formulario.get('ict').value

      }

      this.jsonTxtSecciones = this.buildJsons(this.formulario.value.secciones.includes("-1") ? ["-1"] : this.formulario.value.secciones, 'secciones');
      this.jsonTxtSedes = this.buildJsons(this.formulario.value.sedes.includes("-1") ? ["-1"] : this.formulario.value.sedes, 'sedes');
      this.jsonTxtEquipos = this.buildJsons(this.formulario.value.equipos.includes("-1") ? ["-1"] : this.formulario.value.equipos, 'equipos');
      this.jsonTxtAnalitos = this.buildJsons(this.formulario.value.analitos.includes("-1") ? ["-1"] : this.formulario.value.analitos, 'analitos');
      this.jsonTxtLotes = this.buildJsons(this.formulario.value.lotes.includes("-1") ? ["-1"] : this.formulario.value.lotes, 'lotes');


      let jsonInt = {

        Fechadesde: this.desde,
        Fechahasta: this.hasta,
        Idcalculado: this.formulario.get('ict').value,
        idanalytes: this.jsonTxtAnalitos[0],//"2,33",//,
        idanalyzer: this.jsonTxtEquipos[0],//"2,4",//
        idheadquarter: this.jsonTxtSedes[0], // "-1", //
        idlot: this.jsonTxtLotes[0],// "1,19",//
        idsection: this.jsonTxtSecciones[0]// "1,6",//

      }


      let arrSecc = [];
      this.secciones = [];
      arrSecc = this.formulario.value.secciones;

      arrSecc.forEach(x => {

        let findSecc = this.secciones_Tmp.find(s => s.idsection == x);

        if (findSecc != undefined) {
          this.secciones.push({
            namesection: findSecc.namesection
          });
        }

      });

      // ICT Interno
      await this.reporteICTService.getDataICTInterno(jsonInt).then(data => {

        this.dataTableInterno_Tmp = data;

        this.verTablaExt = false;
        this.verTablaInt = true;
        this.verCard = true;

        this.dataTableInterno = [];
        this.reporteICTService.getDataICTExterno(jsonExt).then((datos: any) => {
          this.dataTableExterno_Tmp = datos;
          this.dataTableExterno = datos; // TODO: ****
        }).catch(error => {

          this.dataTableExterno_Tmp = [];

        });

        this.loader.hide();
        this.ver = true;

      }).catch(error => {

        this.toastr.error('No se encontraron datos');
        this.loader.hide();
        this.ver = false;

        this.dataTableInterno_Tmp = [];

      });

    } else {
      this.toastr.info('Selecciones todos los Filtros');
    }

  }

  // ----------------------CTI----------------------------------
  getCtiInterno() {

    this.verTablaExt = false;
    this.verTablaInt = true;
    this.verCard = true;



    this.dataTableInterno = [];

    this.divCharts = document.getElementById('charts');
    if (this.divCharts) {
      while (this.divCharts.firstChild) {
        this.divCharts.removeChild(this.divCharts.firstChild);
      }
    }

  }


  getCtiExterno() {

    this.verTablaInt = false;
    this.verTablaExt = true;
    this.verCard = true;

    setTimeout(() => {
      this.divCharts = document.getElementById('charts');
      if (this.divCharts) {
        while (this.divCharts.firstChild) {
          this.divCharts.removeChild(this.divCharts.firstChild);
        }
      }

      this.buildGraphicDesvio(this.dataTableExterno, 'desvio');

    }, 1024);

  }

  //-----------------------------------------
  public scrollCards(flow: number): void {
    this.scroll.nativeElement.scrollLeft += (136.1 * flow);
  }

  async pruebaGra() {
    let _data = [...this.dataTableInterno_Tmp];
    let datainterno = _data.filter(x => x.Seccion == this.seccionSeleccionado.namesection);
    await new Promise((res, rej) => {
      this.flagViewTable.set(true);
      setTimeout(() => {
        res(true);
      }, 500);
    }).then(x => {
      this.divCharts = document.getElementById('charts');
      while (this.divCharts.firstChild) {
        this.divCharts.removeChild(this.divCharts.firstChild);
      }
    });
    this.buildGraphicSigmometria(datainterno, 'sig');
  }

  // -------Filtro data por Seccion--------------------
  async buscarSeccion(_seccion: any, btnSecc: any) {

    this.grafico01sig = [];
    this.aplicarActiveBtn(btnSecc);

    let _data = [];

    this.seccionSeleccionado = _seccion;

    _data = [...this.dataTableInterno_Tmp];

    this.dataTableInterno = [..._data.filter(x => x.Seccion == _seccion.namesection)
      .map(item => {
        item.Tea = item.Tea == '0' ? '--' : item.Tea;
        item.Cva = item.Cva == '0' ? '--' : item.Cva;
        item.Sesgo = item.Sesgo == '0' ? '--' : item.Sesgo;
        item.Dianavalue = item.Dianavalue == '0' ? '--' : item.Dianavalue;
        item.Media = item.Media == '0' ? '--' : item.Media;
        item.Ds = item.Ds == '0' ? '--' : item.Ds;
        item.Cv = item.Cv == '0' ? '--' : item.Cv;
        item.Bias = item.Bias == '∞' || item.Bias == '-∞' ? '--' : item.Bias;
        item.ET = item.ET == '∞' || item.ET == '-∞' ? '--' : item.ET;
        item.CVR = item.CVR == '∞' || item.CVR == '-∞' ? '--' : item.CVR;
        item.SR = item.SR == '∞' || item.SR == '-∞' ? '--' : item.SR;
        item.IET = item.IET == '∞' || item.IET == '-∞' ? '--' : item.IET;
        item.SIG = item.SIG == '∞' || item.SIG == '-∞' ? '--' : item.SIG;
        item.IDM = item.IDM == '∞' || item.IDM == '-∞' ? '--' : item.IDM;
        return item;
      })]

    let datainterno = _data.filter(x => x.Seccion == _seccion.namesection);

    await new Promise((res, rej) => {
      this.flagViewTable.set(true);
      setTimeout(() => {
        res(true);
      }, 500);
    }).then(x => {
      this.divCharts = document.getElementById('charts');
      while (this.divCharts.firstChild) {
        this.divCharts.removeChild(this.divCharts.firstChild);
      }
    });


    this.buildGraphicSigmometria(datainterno, 'sig'); // crea la grafica

    if (this.dataTableInterno.length == 0) {
      setTimeout(() => {
        this.toastr.error('No se encontraron datos');
      }, 700);
    }
  }

  //-----------------------------------------

  // metodo para cambiar de actilet el Boton
  aplicarActiveBtn(link: any) {

    const selectores: any = document.getElementsByClassName('styleSeccion'); // selecciona la clase del elemento HTML

    for (const ref of selectores) {
      ref.classList.remove('active');
    }
    link.classList.add('active');
  }


  //-----------------------------------------
  buildJsons(array: Array<any>, control: string): Array<any> {

    let cadena = '';
    let json = '';

    for (let i = 0; i < array.length; i++) {

      if (array[0] == '-1') {

        cadena = 'Todos';
        json = '-1';
        break;

      } else {

        json = array.join();
        let ref: any;

        if (control == 'secciones') {

          let ref = this.secciones_Tmp.find(dato => dato.idsection == array[i]);
          cadena += ref.namesection + ', ';

        }

        if (control == 'sedes') {

          let ref = this.sedes.find(dato => dato.idheadquarters == array[i]);
          cadena += ref.desheadquarters + ', ';

        }

        if (control == 'equipos') {

          let ref = this.equipos.find(dato => dato.idAnalyzer == array[i]);
          cadena += ref.nameAnalyzer + ', ';

        }

        if (control == 'analitos') {

          let ref = this.analitos.find(dato => dato.idanalytes == array[i]);
          cadena += ref.desanalytes + ', ';

        }

        if (control == 'lotes') {

          let ref = this.lotes.find(dato => dato.idLot == array[i]);
          cadena += ref.numlot + ', ';

        }

      }

    }

    return [json, cadena];

  }

  // -----------------------------------------
  // se crean las Tablas del PDF
  //------------------------------------------
  createTableICTInterno(data: DataICTInt[]): ITable {

    return new Table([
      [
        { text: 'Informacion de Laboratorio', style: 'tableHeader', colSpan: 5, alignment: 'center', bold: true, color: '#FFFFFF', fillColor: '#3850eb' },
        {},
        {},
        {},
        {},
        { text: 'Información de Test', style: 'tableHeader', colSpan: 5, alignment: 'center', bold: true, color: '#FFFFFF', fillColor: '#3850eb' },
        {},
        {},
        {},
        {},
        { text: 'Objetivos de Calidad', style: 'tableHeader', colSpan: 4, alignment: 'center', bold: true, color: '#FFFFFF', fillColor: '#3850eb' },
        {},
        {},
        {},
        { text: 'Datos de Desempeño', style: 'tableHeader', colSpan: 8, alignment: 'center', bold: true, color: '#FFFFFF', fillColor: '#3850eb' },
        {},
        {},
        {},
        {},
        {},
        {},
        {},
        { text: 'ICT Indicadores de Competencia Técnica', style: 'tableHeader', colSpan: 4, alignment: 'center', bold: true, color: '#FFFFFF', fillColor: '#3850eb' },
        {},
        {},
        {},
      ],
      [
        { text: "No", bold: true, color: '#FFFFFF', fillColor: '#3850eb' },
        { text: "Sección", bold: true, color: '#FFFFFF', fillColor: '#3850eb' },
        { text: "Sede", bold: true, color: '#FFFFFF', fillColor: '#3850eb' },
        { text: "Ciudad", bold: true, color: '#FFFFFF', fillColor: '#3850eb' },
        { text: "No Lab", bold: true, color: '#FFFFFF', fillColor: '#3850eb' },
        { text: "Equipo", bold: true, color: '#FFFFFF', fillColor: '#3850eb' },
        { text: "Lote QC", bold: true, color: '#FFFFFF', fillColor: '#3850eb' },
        { text: "Analito", bold: true, color: '#FFFFFF', fillColor: '#3850eb' },
        { text: "Nivel", bold: true, color: '#FFFFFF', fillColor: '#3850eb' },
        { text: "Unidad", bold: true, color: '#FFFFFF', fillColor: '#3850eb' },
        { text: "Fuente", bold: true, color: '#FFFFFF', fillColor: '#3850eb' },
        { text: "%Tea", bold: true, color: '#FFFFFF', fillColor: '#3850eb' },
        { text: "%CVa", bold: true, color: '#FFFFFF', fillColor: '#3850eb' },
        { text: "%BIAS", bold: true, color: '#FFFFFF', fillColor: '#3850eb' },
        { text: "Valor Diana", bold: true, color: '#FFFFFF', fillColor: '#3850eb' },
        { text: "Media", bold: true, color: '#FFFFFF', fillColor: '#3850eb' },
        { text: "DS", bold: true, color: '#FFFFFF', fillColor: '#3850eb' },
        { text: "%CV", bold: true, color: '#FFFFFF', fillColor: '#3850eb' },
        { text: "%Bias", bold: true, color: '#FFFFFF', fillColor: '#3850eb' },
        { text: "%ET", bold: true, color: '#FFFFFF', fillColor: '#3850eb' },
        { text: "IDM", bold: true, color: '#FFFFFF', fillColor: '#3850eb' },
        { text: "No Datos", bold: true, color: '#FFFFFF', fillColor: '#3850eb' },
        { text: "CVR", bold: true, color: '#FFFFFF', fillColor: '#3850eb' },
        { text: "SR", bold: true, color: '#FFFFFF', fillColor: '#3850eb' },
        { text: "IET", bold: true, color: '#FFFFFF', fillColor: '#3850eb' },
        { text: "SIG", bold: true, color: '#FFFFFF', fillColor: '#3850eb' },

      ],
      ...this.extractDataICTInt(data)
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
        fillColor: (rowIndex: number, node: any, columnIndex: number) => {

          if (rowIndex > 1) {

            //let CVR = parseInt(node.table.body[rowIndex][21].text, 10);
            let CVR = parseFloat(node.table.body[rowIndex][22].text);

            if (CVR > 1) {
              node.table.body[rowIndex][22].color = '#FFFFFF';
              node.table.body[rowIndex][22].fillColor = '#EB5F58'; //rojo
              //return;
            } else {
              node.table.body[rowIndex][22].color = '#FFFFFF';
              node.table.body[rowIndex][22].fillColor = '#72C85D'; // verde
              //return;
            }

            let SR = parseFloat(node.table.body[rowIndex][23].text);

            if (SR > 1) {
              node.table.body[rowIndex][23].color = '#FFFFFF';
              node.table.body[rowIndex][23].fillColor = '#EB5F58'; //rojo
              //return;
            } else {
              node.table.body[rowIndex][23].color = '#FFFFFF';
              node.table.body[rowIndex][23].fillColor = '#72C85D'; // verde
              //return;
            }
            let IET = parseFloat(node.table.body[rowIndex][24].text);

            if (IET > 1) {
              node.table.body[rowIndex][24].color = '#FFFFFF';
              node.table.body[rowIndex][24].fillColor = '#EB5F58'; //rojo
              //return;
            } else {
              node.table.body[rowIndex][24].color = '#FFFFFF';
              node.table.body[rowIndex][24].fillColor = '#72C85D'; // verde
              //return;
            }

            let SIG = parseFloat(node.table.body[rowIndex][25].text);
            let Constz = parseFloat(this.dataTableInterno[rowIndex - 2].Constz); // rowIndex - 2 evita el header

            if (SIG > 6) {
              node.table.body[rowIndex][25].color = '#FFFFFF';
              node.table.body[rowIndex][25].fillColor = '#438F63'; //verdeOscuro
              //return;
            }
            if (SIG >= 4 && SIG < 6) {
              node.table.body[rowIndex][25].color = '#FFFFFF';
              node.table.body[rowIndex][25].fillColor = '#72C85D'; // verde
              //return;
            }
            if (SIG >= 3 && SIG < 4) {
              node.table.body[rowIndex][25].color = '#FFFFFF';
              node.table.body[rowIndex][25].fillColor = '#FFDD57'; // amarillo
              //return;
            }

            if (SIG >= Constz && SIG < 3) {
              node.table.body[rowIndex][25].color = '#FFFFFF';
              node.table.body[rowIndex][25].fillColor = '#09C6E1'; // azul
              //return;
            }
            if (SIG < Constz) {
              node.table.body[rowIndex][25].color = '#FFFFFF';
              node.table.body[rowIndex][25].fillColor = '#EB5F58'; // rojo
            }

          } else {
            return ''
          }

        },
        hLineWidth: (i?: number, node?: any, columnIndex?: any) => 0.5,
      })
      .fontSize(9)
      .end;
  }

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


  //----------------
  extractDataICTInt(data: DataICTInt[]) {

    return data.map((row, index) =>
      [
        (index + 1),
        row.Seccion,
        row.Sede,
        row.Ciudad,
        row.Laboratorio,
        row.Equipo,
        row.Lote,
        row.Analito,
        row.Nivel,
        row.Unidad,
        row.Fuente,
        row.Tea,
        row.Cva,
        row.Sesgo,
        row.Dianavalue,
        row.Media,
        row.Ds,
        row.Cv,
        row.Bias,
        row.ET,
        row.IDM,
        row.ndatos,
        row.CVR,
        row.SR,
        row.IET,
        row.SIG,
        //row.Constz,
        //row.idtest,
      ]

    );


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


  /**
   * Genera el PDF para el informe interno
   * @returns 
   */
  async pdfInterno() {

    // Validar si hay datos antes de generar el PDF
    if (!this.dataTableInterno || this.dataTableInterno.length === 0) {
      this.toastr.warning('Para poder generar correctamente el reporte, por favor completar la información del laboratorio.', 'Aviso');
      return;
    }

    await new Promise((res, rej) => {
      this.flagViewTable.set(true);
      setTimeout(() => {
        res(true);
      }, 500);
    }).then(() => {
      this.divCharts = document.getElementById('charts');
      while (this.divCharts.firstChild) {
        this.divCharts.removeChild(this.divCharts.firstChild);
      }
    });

    this.verTablaInt = true;
    this.divCharts = document.getElementById('htmlData');
    this.buildGraphicSigmometria(this.dataTableInterno, 'pdf');

    setTimeout(async () => {
      let _imagesArr: string[] = [];
      const options = {
        background: null,
        scale: 0.88,
      };

      const DATA = document.getElementById('main');
      let arrElmt = DATA?.children || [];

      for (let i = 0; i < arrElmt.length - 1; i++) {
        const rowElmt = document.getElementById(`row-${i}-pdf`);
        if (rowElmt) {
          const loadImg = await html2canvas(rowElmt, options).then((canvas) => canvas.toDataURL());

          // Validar si la imagen cargada es válida antes de agregarla al array
          const isValidImage = await this.validateImage(loadImg);
          if (isValidImage) {
            _imagesArr.push(loadImg);
          } else {
            console.warn(`Imagen no válida para el elemento ${i}`);
          }
        }
      }

      PdfMakeWrapper.setFonts(pdfFonts);
      const pdf = new PdfMakeWrapper();
      pdf.pageSize('A3');
      pdf.pageOrientation('landscape');
      pdf.pageMargins([30, 50, 30, 50]);

      // Encabezado
      pdf.add(new Columns([
        { width: '*', text: '' },
        {
          width: 'auto',
          alignment: 'left',
          stack: [{ width: 100, image: this.logoSourceToPDF }]
        },
        {
          width: 'auto',
          color: '#848484',
          text: `${this.clienteName}\n${this.clienteNit}\n${this.clienteAddres}`,
        },
        { width: '*', text: '' }
      ]).columnGap(0).end);

      pdf.add(pdf.ln(1));
      pdf.add(
        new Canvas([
          new Line([10, 0], [1100, 0]).color('#3850eb').end
        ]).end
      );
      pdf.add(pdf.ln(2));

      // Título
      pdf.add(
        new Table([
          [{
            text: `Indicadores de Competencia Técnica\nFechas: ${this.desde} - ${this.hasta}\n Fecha Reporte: ${this.hoyPdf}`,
            color: '#848484',
            fillColor: '#F9F9F9',
            border: [false, false, false, false],
            alignment: 'center',
            fontSize: 10
          }]
        ]).widths('*').end
      );

      pdf.add(pdf.ln(2));

      // Tabla ICT
      pdf.add(new Columns([
        new Txt("").width('*').end,
        this.createTableICTInterno(this.dataTableInterno),
        new Txt("").width('*').end
      ]).end);

      pdf.add(pdf.ln(2));

      // Agregar las imágenes válidas al PDF
      _imagesArr.forEach((img) => {
        pdf.add(
          new Stack([
            { width: 800, height: 280, image: img }
          ]).alignment('center').end
        );
        pdf.add(pdf.ln(3));
      });

      pdf.add(pdf.ln(2));

      // Gráficos finales
      pdf.add(
        new Stack([
          await new Img(this.grafico01sig[0]).width(400).build(),
          await new Img(this.grafico01sig[1]).width(400).build()
        ]).alignment('center').end
      );

      pdf.create().open();

      setTimeout(() => {
        // Limpieza visual opcional
      }, 300);

    }, 700);
  }

  /**
   *  Método para validar si una imagen es válida
   * @param imageUrl 
   * @returns 
   */
  validateImage(imageUrl: string): Promise<boolean | null> {
    return new Promise((resolve) => {
      if (imageUrl) {
        const img = new Image();
        img.onload = () => {
          resolve(true);  // Imagen válida
        };
        img.onerror = () => {
          resolve(false); // Imagen no válida
        };
        img.src = imageUrl;
      } else {
        resolve(null);  // No se proporcionó URL de imagen
      }
    });
  }

  pdfExterno() {

    //TODO: Solucionar error con sugnda descarga PDF

    this.flagViewTable.set(true);
    this.divCharts = document.getElementById('htmlData');
    // this.divCharts.style.marginTop = "400px";

    this.buildGraphicSigmometria(this.dataTableInterno_Tmp, 'pdf');
    this.buildGraphicDesvio(this.dataTableExterno, 'pdf');


    // time delay
    setTimeout(async () => {

      let _imagesArr = [];
      const options = {
        background: null,
        scale: 0.88,
        //width: 300
      };

      const DATA = document.getElementById('main');
      let arrElmt = DATA.children;

      for (let i = 0; i < (arrElmt.length - 1); i++) {
        //console.log(arrElmt[i]);
        const rowElmt = document.getElementById(`row-${i}-pdf`);
        let loadImg = await html2canvas(rowElmt, options).then((canvas) => canvas.toDataURL());
        _imagesArr.push(loadImg);

      }

      const chartDesvioElmt = document.getElementById('pdf');
      let chartDesvioImg = await html2canvas(chartDesvioElmt, options).then((canvas) => canvas.toDataURL());




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
      pdf.add(new Columns(
        [new Txt("").width('*').end,
        this.createTableICTExterno(this.dataTableExterno_Tmp),
        new Txt("").width('*').end]
      ).end);
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
        while (this.divCharts.firstChild) {
          this.divCharts.removeChild(this.divCharts.firstChild);
        }
      }, 300);
    }, 700);

  }

  exportToExcelInt(): void {
    this.ExporterService.exportToExcel(this.dataTableInterno, 'ICT-Interno');
  }

  exportToExcelExt(): void {
    this.ExporterService.exportToExcel(this.dataTableExterno, 'ICT-Externo');
  }
  // ----------------------------------------
  downloadPDF() {

    if (this.verTablaInt === true) {
      this.pdfInterno();
      this.verTablaExt = false

    }
    if (this.verTablaExt === true) {
      this.pdfExterno();
      this.verTablaInt = false;
      this.verbtnexcelext = true;
      this.verbtnexcelint = false;
    }


  }

  getClippedRegion(image, x, y, width, height) {
    let canvas = document.createElement("canvas"),
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

    let secciones = [];

    for (let i = 0; i < _dataTableInterno.length; i++) {

      if (!secciones.includes(_dataTableInterno[i].Seccion)) {

        secciones.push(_dataTableInterno[i].Seccion);

      }

    }

    for (let i = 0; i < secciones.length; i++) {

      let seccionesFiltradas = _dataTableInterno.filter(data => data.Seccion == secciones[i]);

      let constZ: number = Number(seccionesFiltradas[0].Constz);
      let labels = [`< a ${constZ}`, `Entre ${constZ} y 2,99`, 'Entre 3 y 3,99', 'Entre 4 y 5,99', '> a 6', 'Total'];

      let grupo1 = seccionesFiltradas.filter(data => Number(data.SIG) < constZ);
      let grupo2 = seccionesFiltradas.filter(data => Number(data.SIG) >= constZ && Number(data.SIG) < 3);
      let grupo3 = seccionesFiltradas.filter(data => Number(data.SIG) >= 3 && Number(data.SIG) < 4);
      let grupo4 = seccionesFiltradas.filter(data => Number(data.SIG) >= 4 && Number(data.SIG) < 6);
      let grupo5 = seccionesFiltradas.filter(data => Number(data.SIG) > 6);

      // graficos sigmometria
      // let row = document.createElement("div");
      // row.setAttribute("id", `row-${i}-${idIndx}`);

      // let col1 = document.createElement("div");
      // let col2 = document.createElement("div");

      // this.divCharts.append(row);
      // this.divCharts.style.minWidth = 'unset';

      let _wChartSIG = 580;

      let chart = document.createElement("div");
      chart.setAttribute("id", `${secciones[i]}-${idIndx}`);
      chart.style.marginLeft = "-25px";
      if (idIndx == 'pdf') {
        chart.style.marginLeft = "-35px";
      }

      if (this.divCharts.clientWidth > 1024) {
        _wChartSIG = this.divCharts.clientWidth * 0.40;
        chart.style.marginLeft = "0px";
      }

      this.divCharts.append(chart);
      // col1.append(chart);

      let objectProperty = document.getElementById(`${secciones[i]}-${idIndx}`);

      Object.defineProperty(objectProperty, 'clientWidth', { value: _wChartSIG });
      Object.defineProperty(objectProperty, 'clientHeight', { value: 360 });
      document.getElementById(`${secciones[i]}-${idIndx}`).style.marginTop = "16px";

      // TODO: codigo usable

      let grafico0 = echarts.init(objectProperty);

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
          left: '0%',
          right: '11%',
          bottom: '10%',
          with: '90%',
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



      let _wChartDES = 580;

      // graficos desempeño
      let chartDesempenio = document.createElement("div");
      chartDesempenio.setAttribute("id", `desempenio${secciones[i]}-${idIndx}`);


      if (this.divCharts.clientWidth > 1024) {
        _wChartDES = this.divCharts.clientWidth * 0.40;
        chartDesempenio.style.marginLeft = "70px";
      }

      // col2.append(chartDesempenio);

      this.divCharts.append(chartDesempenio);

      let objectPropertyDesempenio = document.getElementById(`desempenio${secciones[i]}-${idIndx}`);

      Object.defineProperty(objectPropertyDesempenio, 'clientWidth', { value: _wChartDES });
      Object.defineProperty(objectPropertyDesempenio, 'clientHeight', { value: 360 });
      document.getElementById(`desempenio${secciones[i]}-${idIndx}`).style.marginTop = "16px";


      let graficoDesempenio = echarts.init(objectPropertyDesempenio);

      // let grafico = echarts.init(document.getElementById(idIndx));

      // TODO : codigo usable
      let ptsDesempenio = [];
      let numeros = [];
      let maximo: number;
      let minimo: number;
      maximo = ptsDesempenio.length;

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
          let obj = {
            nivel: Number(seccionesFiltradas[i].Nivel),
            analito: seccionesFiltradas[i].Analito,
            value: [Number(i + 1), Number(seccionesFiltradas[i].SIG)]
          };

          ptsDesempenio.push(obj);
        }
      }

      if (ptsDesempenio.length > 0) {
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
              let color = '#6F4B8B';
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

        // TODO: this.grafico01sig variable imagenes
      }
    }
  }

  buildGraphicDesvio(_dataTableExterno: any, idIndx: string) {

    let labels = ['ID menor a 1', 'ID mayor a 1', 'Total'];

    let grupo1 = _dataTableExterno.filter(data => Number(data.Indicedesvio) < 1);
    let grupo2 = _dataTableExterno.filter(data => Number(data.Indicedesvio) > 1);

    let chart = document.createElement("div");
    chart.setAttribute("id", idIndx);

    this.divCharts.append(chart);

    let _wChartDESV = 600;

    if (this.divCharts.clientWidth > 1024) {
      _wChartDESV = this.divCharts.clientWidth * 0.95;
      this.divCharts.style.minWidth = '100%';
    }

    Object.defineProperty(document.getElementById(idIndx), 'clientWidth', { get: function () { return _wChartDESV } });
    Object.defineProperty(document.getElementById(idIndx), 'clientHeight', { get: function () { return 400 } });
    //document.getElementById(idIndx).style.marginTop = "40px";

    let grafico = echarts.init(document.getElementById(idIndx));

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
      this.grafico01ext.push(grafico.getDataURL());
    }, 1000);

  }

  filtrosAutocomplete() {

    this.filterLote.valueChanges.subscribe(word => {
      if (word) {
        this.lotes = this.lotesCopy.filter((item: any) => {
          return item.numlot.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.lotes = this.lotesCopy;
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

    this.filterSeccion.valueChanges.subscribe(word => {
      if (word) {
        this.secciones_Tmp = this.secciones_TmpCopy.filter((item: any) => {
          return item.namesection.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.secciones_Tmp = this.secciones_TmpCopy;
      }
    });

    this.filterAnalito.valueChanges.subscribe(word => {
      if (word) {
        this.analitos = this.analitosCopy.filter((item: any) => {
          return item.desanalytes.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.analitos = this.analitosCopy;
      }
    });

    this.filterEquipo.valueChanges.subscribe(word => {
      if (word) {
        this.equipos = this.equiposCopy.filter((item: any) => {
          return item.nameAnalyzer.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.equipos = this.equiposCopy;
      }
    });

  }


}

