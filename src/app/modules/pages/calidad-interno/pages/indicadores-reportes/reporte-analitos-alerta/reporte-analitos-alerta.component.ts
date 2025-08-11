import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgModel, Validators, FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { AnalyzerQceService } from '@app/services/calidad-externo/AnalyzerQce.service';
import { AnalitosQceService } from '@app/services/configuracion/analitos-qce.service';
import { AnalitosService } from '@app/services/configuracion/analitos.service';
import { AnalizadoresService } from '@app/services/configuracion/analizadores.service';
import { LotesService } from '@app/services/configuracion/lotes.service';
import { ProgramasQceService } from '@app/services/configuracion/programas-qce.service';
import { SedesXUserService } from '@app/services/configuracion/sedesxuser.service';
import { VentanasModalesService } from '@app/services/general/ventanas-modales.service';
import { LaboratoriosService } from '@app/services/configuracion/laboratorios.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { DomSanitizer } from '@angular/platform-browser';
import { SeccionesService } from '../../../../../../services/configuracion/secciones.service';
import { SedesService } from '../../../../../../services/configuracion/sedes.service';
import { ReporteAlertasService } from '../../../../../../services/configuracion/reporte-alertas.service';
import { ObservationsanalytealertService } from '../../../../../../services/configuracion/Observationsanalytealert.service';
import dayjs from 'dayjs';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from 'pdfmake/build/vfs_fonts';
(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;

import { ToastrService } from 'ngx-toastr';
import { ExporterService } from '@app/services/mantenimiento-calibradores/exporter.service';
import { PdfMakeWrapper } from 'pdfmake-wrapper';
import { textAlign } from 'html2canvas/dist/types/css/property-descriptors/text-align';
import { Style } from 'pdfmake/interfaces';
import moment from 'moment';
import { ImageCdnPipe } from '../../../../../core/pipes/image-cdn.pipe';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { LoaderService } from '@app/services/loader/loader.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

@Component({
  selector: "app-reporte-analitos-alerta",
  templateUrl: "./reporte-analitos-alerta.component.html",
  styleUrls: ["./reporte-analitos-alerta.component.css"],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatSelectModule,
    MatOptionModule,
    NgFor,
    MatTooltipModule,
    NgIf,
    NgClass,
    TranslateModule,
    ImageCdnPipe,
    MatIcon,
    NgxMatSelectSearchModule
  ],
})
export class ReporteAnalitosAlertaComponent implements OnInit {

  @ViewChild('scroll') scroll: ElementRef;
  @Input() flagFromParent: boolean = true;

  seccionSeleccionado: string;

  meta: number;
  actual: any;
  desde: any;
  hasta: any;
  formAdicional = false;
  tienePermisos = false;

  formDates: FormGroup = this.fb.group({

    desde: ['', [Validators.required]],
    hasta: ['', [Validators.required]]
  });

  formOne: FormGroup = this.fb.group({

    secciones: ['', [Validators.required]],
    sedes: ['', [Validators.required]],
    equipos: ['', [Validators.required]],

  });

  formTwo: FormGroup = this.fb.group({

    analitos: ['', [Validators.required]],
    lotes: ['', [Validators.required]],
    reportes: ['', [Validators.required]],

  });

  formThree: FormGroup = this.fb.group({

    ict: [''],
    programas: [''],
    analitosExterno: [''],
    equiposExterno: ['']

  });

  vertodosequipos: boolean = true;
  vertodassecciones: boolean = true;
  vertodosanalitos: boolean = false;

  desactivado = true;
  minFecha: any;
  verFormAdicional = false;
  infoprueba2 = false;
  secciones = [];
  seccionesCopy = [];
  sedes = [];
  sedesCopy = [];
  equipos = [];
  equiposCopy = [];
  analitos = [];
  analitosCopy = [];
  analitosFiltrados = [];
  lotes = [];
  lotesCopy = [];
  reportes: any = [

    { value: 'sigmometria', item: 'Sigmometría' },
    { value: 'coeficiente', item: 'Coeficiente de variación' },
    { value: 'sesgo', item: 'Sesgo relativo' },
    { value: 'error', item: 'Indice de error' },

  ];
  externo = "";
  interno = "";
  ver = false;
  verCalidadExterno = false;
  accion = "";
  ict = [
    { value: 1, item: "Valor asignado" },
    { value: 2, item: "Z-Score" },
  ];
  programas = [];
  programasCopy = [];
  analitosExterno = [];
  analitosExternoCopy = [];
  equiposExterno = [];
  equiposExternoCopy = [];
  logoSource: any;

  idUser: number = parseInt(sessionStorage.getItem("userid"));
  txtSecciones = "";
  txtSedes = "";
  txtEquipos = "";
  txtAnalitos = "";
  txtLotes = "";
  txtReportes = "";
  txtICT = "";
  txtProgramas = "";
  txtAnalitosExterno = "";
  txtEquiposExterno = "";

  jsonDesde: any;
  jsonHasta: any;

  jsonSecciones = "";
  jsonSedes = "";
  jsonEquipos = "";
  jsonAnalitos = "";
  jsonLotes = "";
  jsonReportes = "";
  jsonICT = "";
  jsonProgramas = "";
  jsonAnalitosExterno = "";
  jsonEquiposExterno = "";

  jsonForDesvio: any;
  jsonNormal: any;
  jsonNormalQCE: any;
  dataTable: any;

  datatablefilter: any;
  dataobvsfilter: any;
  dataTableQCE: any;
  constante: any;

  sedesid = [];
  seccionesid = [];
  equiposid = [];
  analitosid = [];
  secciones_Tmp = [];
  secciones_TmpCopy = [];

  dataobservaciones: any;
  //create observations
  idobservations = [];

  formObservations = this.fb.group({
    observations: [""],
  });

  arrsections2 = [];
  modelGroup: any;
  filterSede = new FormControl('');
  filterPrograma = new FormControl('');
  filterSeccion = new FormControl('');
  filterEquipo = new FormControl('');
  filterEquipoExt = new FormControl('');
  filterAnalito = new FormControl('');
  filterAnalitoExt = new FormControl('');
  filterLote = new FormControl('');

  constructor(
    private fb: FormBuilder,
    private seccionesService: SeccionesService,
    private sanitizer: DomSanitizer,
    private sedesXUserService: SedesXUserService,
    private sedesService: SedesService,
    private equiposService: AnalizadoresService,
    private analitosService: AnalitosService,
    private lotesService: LotesService,
    private laboratoriosService: LaboratoriosService,
    private toastr: ToastrService,
    private programasService: ProgramasQceService,
    private analitosExternoService: AnalitosQceService,
    private equiposExternoService: AnalyzerQceService,
    private reporteAlertasService: ReporteAlertasService,
    private ObservationsanalytealertService: ObservationsanalytealertService,
    private ventanaService: VentanasModalesService,
    private translate: TranslateService,
    private ExporterService: ExporterService,
    private loader: LoaderService
  ) {
  }

  ngOnInit(): void {
    this.dataFilters();
    this.showFormAdicional();
    this.getLogoSource();
    this.validarModulo();
    this.filtrosAutocomplete();
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

    this.filterAnalitoExt.valueChanges.subscribe(word => {
      if (word) {
        this.analitosExterno = this.analitosExternoCopy.filter((item: any) => {
          return item.desanalytes.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.analitosExterno = this.analitosExternoCopy;
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

    this.filterEquipoExt.valueChanges.subscribe(word => {
      if (word) {
        this.equiposExterno = this.equiposExternoCopy.filter((item: any) => {
          return item.nameAnalyzer.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.equiposExterno = this.equiposExternoCopy;
      }
    });

    this.filterPrograma.valueChanges.subscribe(word => {
      if (word) {
        this.programas = this.programasCopy.filter((item: any) => {
          return item.desprogram.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.programas = this.programasCopy;
      }
    });

  }


  getLogoSource() {
    this.laboratoriosService.getLogoImage().subscribe((logo) => {
      this.logoSource = this.sanitizer.bypassSecurityTrustResourceUrl(
        `data:image/jpg;base64,${logo}`
      );
    });
  }

  openModal(descripcion) {
    const data = { descripcion, accion: this.accion };
    this.ventanaService.openModal(data);
  }

  observeFechas(campo: string) {

    let x = this.formDates.get("desde").value;
    let y = this.formDates.get("hasta").value;
    let fechaX
    let fechaY
    if (x) {
      fechaX = moment(x).format()
    }
    if (y) {
      fechaY = moment(y).format()
    }

    if (fechaX === 'Invalid date') {
      this.formDates.get(campo).setValue(null);
      this.toastr.error('La fecha es invalida');
      return
    }

    if (x !== 'Invalid date' && x && y && y !== 'Invalid date') {
      if (moment(x).format() > moment(y).format()) {
        this.formDates.get('hasta').setValue(null);
        this.toastr.error(`La fecha "hasta" no puede se menor a la fecha "desde"`);
      }
    }
  }

  showFormAdicional() {

    this.formTwo.get('reportes').valueChanges.subscribe(data => {

      data.includes('desvio') || (this.tienePermisos && data.includes('-1')) ? this.formAdicional = true : this.formAdicional = false;

    });

  }

  selectNone(control: string, form: string) {
    form == 'formOne' ? this.formOne.get(control).setValue('') : form == 'formTwo' ? this.formTwo.get(control).setValue('') : this.formThree.get(control).setValue('');
    console.log(this.formOne);
  }


  selectAll(control: string, form: string) {
    switch (control) {
      case 'sedes':
        let all = this.sedes.map(e => { return e.idheadquarters })
        all.unshift("-1")
        this.formOne.get(control).setValue(all)
        break;

      case 'lotes':
        let lotes = this.lotes.map(e => { return e.idLot })
        lotes.unshift("-1")
        this.formTwo.get(control).setValue(lotes)
        break;

      case 'reportes':
        let reportes = this.reportes.map(e => { return e.value })
        reportes.unshift("-1")
        this.formTwo.get(control).setValue(reportes)
        break;

      case 'programas':
        let programas = this.programas.map(e => { return e.idProgram })
        programas.unshift("-1")
        this.formThree.get(control).setValue(programas)
        break;
      case 'analitosExterno':
        let analitosExterno = this.analitosExterno.map(e => { return e.idanalytes })
        analitosExterno.unshift("-1")
        this.formThree.get(control).setValue(analitosExterno)
        break;
      case 'equiposExterno':
        let equiposExterno = this.equiposExterno.map(e => { return e.idAnalyzer })
        equiposExterno.unshift("-1")
        this.formThree.get(control).setValue(equiposExterno)
        break;

      default:
        break;
    }

    // form == 'formOne' ? this.formOne.get(control).setValue(['-1']) : form == 'formTwo' ? this.formTwo.get(control).setValue(['-1']) : this.formThree.get(control).setValue(['-1']);
  }

  selectOne(control: string, form: string) {
    if (form == 'formOne' && (this.formOne.get(control).value[0] == '-1' || this.formOne.get(control).value[0] == '')) {

      this.formOne.get(control).value.shift();
      this.formOne.get(control).setValue(this.formOne.get(control).value);

    } else if (form == 'formTwo' && (this.formTwo.get(control).value[0] == '-1' || this.formTwo.get(control).value[0] == '')) {

      this.formTwo.get(control).value.shift();
      this.formTwo.get(control).setValue(this.formTwo.get(control).value);

    } else if (form == 'formThree' && (this.formThree.get(control).value[0] == '-1' || this.formThree.get(control).value[0] == '')) {

      this.formThree.get(control).value.shift();
      this.formThree.get(control).setValue(this.formThree.get(control).value);
    }



    switch (control) {
      case 'sedes':
        if (this.formOne.get(control).value.length == this.sedes.length) {
          let all = this.sedes.map(e => { return e.idheadquarters })
          all.unshift("-1")
          this.formOne.get(control).setValue(all)
        }
        break;

      case 'lotes':
        if (this.formTwo.get(control).value.length == this.lotes.length) {
          let lotes = this.lotes.map(e => { return e.idLot })
          lotes.unshift("-1")
          this.formTwo.get(control).setValue(lotes)
        }
        break;


      case 'reportes':

        if (this.formTwo.get(control).value.length == this.reportes.length) {
          let reportes = this.reportes.map(e => { return e.value })
          reportes.unshift("-1")
          this.formTwo.get(control).setValue(reportes)
        }

        break;

      case 'programas':
        if (this.formThree.get(control).value.length == this.programas.length) {
          let programas = this.programas.map(e => { return e.idProgram })
          programas.unshift("-1")
          this.formThree.get(control).setValue(programas)
        }

        break;
      case 'analitosExterno':
        if (this.formThree.get(control).value.length == this.analitosExterno.length) {
          let analitosExterno = this.analitosExterno.map(e => { return e.idanalytes })
          analitosExterno.unshift("-1")
          this.formThree.get(control).setValue(analitosExterno)
        }
        break;
      case 'equiposExterno':
        if (this.formThree.get(control).value.length == this.equiposExterno.length) {
          let equiposExterno = this.equiposExterno.map(e => { return e.idAnalyzer })
          equiposExterno.unshift("-1")
          this.formThree.get(control).setValue(equiposExterno)
        }

        break;

      default:
        break;


    }

  }


  selectedHeadquarter0(control: string) {
    this.sedesid = [];
    if (this.formOne.get(control).value[0] == '-1' || this.formOne.get(control).value[0] == '') {

      this.formOne.get(control).value.shift();
      this.formOne.get(control).setValue(this.formOne.get(control).value);
    }
    //let arrcontrol = this.formulario.get(control).value;
    let arrsedes;
    this.formOne.get(control).value.forEach(element => {
      this.sedesid.push(element);

    });


    if (this.formOne.get(control).value.length == this.sedes.length) {
      let all = this.sedes.map(e => { return e.idheadquarters })
      all.unshift("-1")
      this.formOne.get('sedes').setValue(all)
    }

    arrsedes = (this.sedesid.filter((item, index) => {
      return this.sedesid.indexOf(item) === index;
    }));
    this.selectheadquarter(arrsedes);

  }

  selectedAllheadquaerter(control: string) {
    this.sedesid = [];
    let all = this.sedes.map(e => { return e.idheadquarters })
    all.unshift("-1")
    this.formOne.get('sedes').setValue(all)
    this.formOne.value.sedes.forEach(element => {

      this.sedesid.push(element);
    });

    this.selectheadquarterAlls(this.sedesid);

  }

  async selectheadquarterAlls(sedes) {
    const jsonTexto: any = '{"Idheadquarters":"' + sedes + '"}';
    this.seccionesService.getAllAsyncSeccionesxsede(jsonTexto).subscribe((data: any) => {

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

    let idsedes;
    idsedes = arrsedes2.filter((item, index) => { return arrsedes2.indexOf(item) === index; })
    var jsonTexto: any = '{"Idheadquarters":"' + idsedes + '"}';

    this.seccionesService.getAllAsyncSeccionesxsede(jsonTexto).subscribe((data: any) => {
      this.vertodassecciones = true;
      this.secciones_Tmp = data.filter(data => data.active);
      this.secciones_TmpCopy = data.filter(data => data.active);

    });
  }

  selectedsection(control: string) {

    if (this.formOne.get(control).value[0] == '-1' || this.formOne.get(control).value[0] == '') {

      this.formOne.get(control).value.shift();
      this.formOne.get(control).setValue(this.formOne.get(control).value);
    }

    if (this.formOne.get(control).value[0] != '-1' || this.formOne.get(control).value[0] != ' ') {

      this.selectsection(this.formOne.get(control).value);
    }

    if (this.formOne.get(control).value.length == this.secciones.length) {
      let all = this.secciones.map(e => { return e.idsection })
      all.unshift("-1")
      this.formOne.get(control).setValue(all)
    }
  }

  selectedAllsection(control: string) {

    let all = this.secciones.map(e => { return e.idsection })
    all.unshift("-1")
    this.formOne.get(control).setValue(all)
    this.selectsectionAlls(this.formOne.get(control).value);
  }

  async selectsectionAlls(secciones) {
    var jsonTexto: any = '{"Idsection":"' + secciones + '"}';
    this.equiposService.getAllAsyncAnalyzersxseccion(jsonTexto).subscribe((data: any) => {
      this.vertodosequipos = true;
      this.equipos = data.filter(data => data.active);
      this.equiposCopy = data.filter(data => data.active);
    });

  }

  async selectsection(secciones) {
    if (secciones.length == 0) {
      return;
    }

    this.arrsections2 = [];
    secciones.forEach(element => {
      if (element != '-1') {
        this.arrsections2.push(element)
      }
    });

    let idsecciones;
    idsecciones = this.arrsections2.filter((item, index) => { return this.arrsections2.indexOf(item) === index; })
    var jsonTexto: any = '{"Idsection":"' + idsecciones + '"}';

    this.equiposService.getAllAsyncAnalyzersxseccion(jsonTexto).subscribe((data: any) => {
      this.equipos = data.filter(data => data.active);
      this.vertodosequipos = true;
    });

  }

  selectedanalyzer(control: string) {

    if (this.formOne.get(control).value[0] == '-1' || this.formOne.get(control).value[0] == '') {

      this.formOne.get(control).value.shift();
      this.formOne.get(control).setValue(this.formOne.get(control).value);
    }
    if (this.formOne.get(control).value[0] != '-1' || this.formOne.get(control).value[0] != '') {

      this.selectanalyzer(this.formOne.get(control).value);
    }

    if (this.formOne.get(control).value.length == this.equipos.length) {
      let all = this.equipos.map(e => { return e.idAnalyzer })
      all.unshift("-1")
      this.formOne.get(control).setValue(all)
    }
  }

  selectedAllanalyzer(control: string) {
    let all = this.equipos.map(e => { return e.idAnalyzer })
    all.unshift("-1")
    this.formOne.get(control).setValue(all)
    this.selectanalyzerall(this.formOne.get(control).value);
  }

  async selectanalyzerall(equipos) {


    var jsonTexto: any = '{"IdAnalyzer":"' + equipos + '"}';
    this.analitosService.getAllAsyncAnalytesxanalyzer(jsonTexto).subscribe((data: any) => {
      this.vertodosanalitos = true;
      this.analitos = data.filter(data => data.active);
      this.analitosCopy = data.filter(data => data.active);
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

    let idequipos;
    idequipos = arranalyzer2.filter((item, index) => { return arranalyzer2.indexOf(item) === index; })
    var jsonTexto: any = '{"IdAnalyzer":"' + idequipos + '"}';

    await this.analitosService.getAllAsyncAnalytesxanalyzer(jsonTexto).subscribe((data: any) => {
      this.vertodosanalitos = true;
      this.analitos = data.filter(data => data.active);
    });
  }

  selectedanalyte(control: string) {

    if (this.formTwo.get(control).value[0] == '-1' || this.formTwo.get(control).value[0] == '') {
      this.formTwo.get(control).value.shift();
      this.formTwo.get(control).setValue(this.formTwo.get(control).value);

    }
    if (this.formTwo.get(control).value[0] != '-1' || this.formTwo.get(control).value[0] != '') {
      this.selectanalyte(this.formTwo.get(control).value);
    }

    if (this.formTwo.get(control).value.length == this.analitos.length) {
      let all = this.analitos.map(e => { return e.idanalytes })
      all.unshift("-1")
      this.formTwo.get(control).setValue(all)
    }
  }

  selectedAllanalyte(control: string) {

    let all = this.analitos.map(e => { return e.idanalytes })
    all.unshift("-1")
    this.formTwo.get(control).setValue(all)

    this.selectanalyteAlls(this.formTwo.get(control).value);
  }

  async selectanalyteAlls(analitos) {

    var jsonTexto: any = '{"Idanalytes":"' + analitos + '"}';
    this.lotesService.getAllAsyncLotsxanalyte(jsonTexto).subscribe((data: any) => {
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

    let idanalitos;
    idanalitos = arranalyte2.filter((item, index) => { return arranalyte2.indexOf(item) === index; })
    var jsonTexto: any = '{"Idanalytes":"' + idanalitos + '"}';

    await this.lotesService.getAllAsyncLotsxanalyte(jsonTexto).subscribe((data: any) => {
      this.lotes = data.filter(data => data.active);
    });

  }

  async dataFilters() {

    await this.seccionesService.getAllAsync().then(data => {

      this.secciones = data.filter(data => data.active);
      this.seccionesCopy = data.filter(data => data.active);

    });

    await this.sedesXUserService.getByIdAsync(this.idUser).then((data: any) => {

      this.sedes = data.filter(data => data.active);
      this.sedesCopy = data.filter(data => data.active);

    });

    // await this.equiposService.getAllAsync().then(data => {

    //   this.equipos = data.filter(data => data.active);

    // });

    // await this.analitosService.getAllAsync().then(data => {

    //   this.analitos = data.filter(data => data.active);

    // });

    // await this.lotesService.getAllAsync().then(data => {

    //   this.lotes = data.filter(data => data.active);

    // });

    await this.programasService.getAllAsync().then(data => {

      this.programas = data.filter(data => data.active);
      this.programasCopy = data.filter(data => data.active);

    });

    await this.analitosExternoService.getAllAsync().then(data => {

      this.analitosExterno = data.filter(data => data.active);
      this.analitosExternoCopy = data.filter(data => data.active);

    });

    await this.equiposExternoService.getAllAsync().then(data => {

      this.equiposExterno = data.filter(data => data.active);
      this.equiposExternoCopy = data.filter(data => data.active);

    });


  }
  validarModulo() {

    if (sessionStorage.getItem('externo') == 'S' && sessionStorage.getItem('interno') == 'S') {

      this.reportes.push({ value: 'desvio', item: 'Indice de desvío' });
      this.tienePermisos = true;

    } else {

      this.tienePermisos = false;

    }

  }
  setData() {
    this.txtSecciones = "";
    this.txtSedes = "";
    this.txtEquipos = "";
    this.txtAnalitos = "";
    this.txtLotes = "";
    this.txtReportes = "";
    this.txtICT = "";
    this.txtProgramas = "";
    this.txtAnalitosExterno = "";
    this.txtEquiposExterno = "";

    this.jsonSecciones = "";
    this.jsonSedes = "";
    this.jsonEquipos = "";
    this.jsonAnalitos = "";
    this.jsonLotes = "";
    this.jsonReportes = "";
    this.jsonICT = "";
    this.jsonProgramas = "";
    this.jsonAnalitosExterno = "";
    this.jsonEquiposExterno = "";
  }

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

        if (control == 'secciones') {

          var ref = this.secciones.find(dato => dato.idsection == array[i]);
          cadena += ref.namesection + ', ';

        }

        if (control == 'sedes') {

          var ref = this.sedes.find(dato => dato.idheadquarters == array[i]);
          cadena += ref.desheadquarters + ', ';

        }

        if (control == 'equipos') {

          var ref = this.equipos.find(dato => dato.idAnalyzer == array[i]);
          cadena += ref.nameAnalyzer + ', ';

        }

        if (control == 'analitos') {

          var ref = this.analitos.find(dato => dato.idanalytes == array[i]);
          cadena += ref.desanalytes + ', ';

        }

        if (control == 'lotes') {

          var ref = this.lotes.find(dato => dato.idLot == array[i]);
          cadena += ref.numlot + ', ';

        }

        if (control == 'reportes') {

          var ref = this.reportes.find(dato => dato.value == array[i]);
          cadena += ref.item + ', ';

        }

        if (control == 'programas') {

          var ref = this.programas.find(dato => dato.idProgram == array[i]);
          cadena += ref.desprogram + ', ';

        }

        if (control == 'analitosExterno') {

          var ref = this.analitosExterno.find(dato => dato.idanalytes == array[i]);
          cadena += ref.desanalytes + ', ';

        }

        if (control == 'equiposExterno') {

          var ref = this.equiposExterno.find(dato => dato.idAnalyzer == array[i]);
          cadena += ref.nameAnalyzer + ', ';
        }
      }
    }
    return [json, cadena];
  }

  async filtrar() {
    if (
      this.formDates.get('desde').valid &&
      this.formDates.get('hasta').valid &&
      this.formOne.get('secciones').valid &&
      this.formOne.get('sedes').valid &&
      this.formOne.get('equipos').valid &&
      this.formTwo.get('analitos').valid &&
      this.formTwo.get('lotes').valid &&
      this.formTwo.get('reportes').valid
    ) {
      this.loader.show();
      this.ver = true;
      this.infoprueba2 = false;

      this.setData();

      this.actual = dayjs().format("DD-MM-YYYY");
      this.desde = dayjs(this.formDates.value.desde).format("DD-MM-YYYY");
      this.hasta = dayjs(this.formDates.value.hasta).format("DD-MM-YYYY");
      this.jsonDesde = dayjs(this.formDates.value.desde).format("YYYY-MM-DD");
      this.jsonHasta = dayjs(this.formDates.value.hasta).format("YYYY-MM-DD");

      for (let i = 0; i < this.formOne.value.secciones.length; i++) {
        if (this.formOne.value.secciones[0] === "-1") {
          this.txtSecciones = "Todas";
          this.jsonSecciones = "-1";
          break;
        } else {
          this.jsonSecciones = this.formOne.value.secciones.join();

          await this.seccionesService
            .getByIdAsync(this.formOne.value.secciones[i])
            .then((data: any) => {
              this.txtSecciones += data.namesection + ", ";
            });
        }
      }

      for (let i = 0; i < this.formOne.value.sedes.length; i++) {
        if (this.formOne.value.sedes[0] == "-1") {
          this.txtSedes = "Todas";
          this.jsonSedes = "-1";
          break;
        } else {
          this.jsonSedes = this.formOne.value.sedes.join();

          await this.sedesService
            .getByIdAsync(this.formOne.value.sedes[i])
            .then((data: any) => {
              this.txtSedes += data.desheadquarters + ", ";
            });
        }
      }

      // equipos
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < this.formOne.value.equipos.length; i++) {
        if (this.formOne.value.equipos[0] === "-1") {
          this.txtEquipos = "Todos";
          this.jsonEquipos = "-1";
          break;
        } else {
          this.jsonEquipos = this.formOne.value.equipos.join();

          await this.equiposService
            .getByIdAsync(this.formOne.value.equipos[i])
            .then((data: any) => {
              this.txtEquipos += data.nameAnalyzer + ", ";
            });
        }
      }

      // analitos
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < this.formTwo.value.analitos.length; i++) {
        if (this.formTwo.value.analitos[0] === "-1") {
          this.txtAnalitos = "Todos";
          this.jsonAnalitos = "-1";
          break;
        } else {
          this.jsonAnalitos = this.formTwo.value.analitos.join();

          await this.analitosService
            .getByIdAsync(this.formTwo.value.analitos[i])
            .then((data: any) => {
              this.txtAnalitos += data.desanalytes + ", ";
            });
        }
      }

      // lotes
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < this.formTwo.value.lotes.length; i++) {
        if (this.formTwo.value.lotes[0] === "-1") {
          this.txtLotes = "Todos";
          this.jsonLotes = "-1";
          break;
        } else {
          this.jsonLotes = this.formTwo.value.lotes.join();

          await this.lotesService
            .getByIdAsync(this.formTwo.value.lotes[i])
            .then((data: any) => {
              this.txtLotes += data.numlot + ", ";
            });
        }
      }

      // reportes
      if (this.formTwo.value.reportes[0] === "-1") {
        this.txtReportes = "Todos";
      } else {
        this.txtReportes = this.formTwo.value.reportes;
      }

      // DATOS DEL OTRO INFOPRUEBA
      if (
        this.formTwo.value.programas !== "" &&
        this.formTwo.value.reportes.includes("desvio")
      ) {
        // ict
        if (this.formThree.value.ict === 1) {
          this.txtICT = "Valor asignado";
          this.jsonICT = "valor asignado";
        } else {
          this.txtICT = "Z-Score";
          this.jsonICT = "zscore";
        }

        // programas
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < this.formThree.value.programas.length; i++) {
          if (this.formThree.value.programas[0] === "-1") {
            this.txtProgramas = "Todos";
            this.jsonProgramas = "-1";
            break;
          } else {
            this.jsonProgramas = this.formThree.value.programas.join();

            await this.programasService
              .getByIdAsync(this.formThree.value.programas[i])
              .then((data: any) => {
                this.txtProgramas += data.desprogram + ", ";
              });
          }
        }

        // analitos externo
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < this.formThree.value.analitosExterno.length; i++) {
          if (this.formThree.value.analitosExterno[0] === "-1") {
            this.txtAnalitosExterno = "Todos";
            this.jsonAnalitosExterno = "-1";
            break;
          } else {
            this.jsonAnalitosExterno =
              this.formThree.value.analitosExterno.join();

            await this.analitosExternoService
              .getByIdAsync(this.formThree.value.analitosExterno[i])
              .then((data: any) => {
                this.txtAnalitosExterno += data.desanalytes + ", ";
              });
          }
        }

        // equipos externo
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < this.formThree.value.equiposExterno.length; i++) {
          if (this.formThree.value.equiposExterno[0] === "-1") {
            this.txtEquiposExterno = "Todos";
            this.jsonEquiposExterno = "-1";
            break;
          } else {
            this.jsonEquiposExterno =
              this.formThree.value.equiposExterno.join();

            await this.equiposExternoService
              .getByIdAsync(this.formThree.value.equiposExterno[i])
              .then((data: any) => {
                this.txtEquiposExterno += data.nameAnalyzer + ", ";
              });
          }
        }

        this.infoprueba2 = true;
      } else {
        this.infoprueba2 = false;
      }

      // CONSTRUCCIÓN DEL JSON

      this.jsonNormal = {
        fechadesde: this.jsonDesde,
        fechahasta: this.jsonHasta,
        idsection: this.jsonSecciones,
        idheadquarter: this.jsonSedes,
        idanalytes: this.jsonAnalitos,
        idanalyzer: this.jsonEquipos,
        idlot: this.jsonLotes,
      };
      this.jsonNormalQCE = {
        fechadesde: this.jsonDesde,
        fechahasta: this.jsonHasta,
        idanalyzer: this.jsonEquipos,
        idanalytes: this.jsonAnalitos,
        idcalculado: this.jsonICT,
        idprogram: this.jsonProgramas,
      };

      await this.reporteAlertasService
        .getDataAnalitosAlerta(this.jsonNormal)
        .then((data: any) => {

          this.dataTable = data.map((item) => {
            item.CVR =
              item.CVR == "∞" ||
                item.CVR == "NaN" ||
                item.CVR == "-∞" ||
                item.CVR == "0"
                ? "--"
                : Number(item.CVR.replace(/,/g, "."));
            item.SR =
              item.SR == "∞" ||
                item.SR == "NaN" ||
                item.SR == "-∞" ||
                item.SR == "0"
                ? "--"
                : Number(item.SR.replace(/,/g, "."));
            item.IET =
              item.IET == "∞" ||
                item.IET == "NaN" ||
                item.IET == "-∞" ||
                item.IET == "0"
                ? "--"
                : Number(item.IET.replace(/,/g, "."));
            item.SIG =
              item.SIG == "∞" ||
                item.SIG == "NaN" ||
                item.SIG == "-∞" ||
                item.SIG == "0"
                ? "--"
                : item.SIG.replace(/,/g, ".");

            return item;
          });

          //this.dataTable = data;
          this.constante = data[0].Constz;
          console.log(this.dataTable)
          this.datatablefilter = this.dataTable.filter(
            (x) =>
              x.SIG !== "--" &&
              x.CVR !== "--" &&
              x.SR !== "--" &&
              x.IET !== "--"
          );
          this.dataobvsfilter = this.dataTable.filter(
            (x) =>
              x.SIG !== "--" &&
              x.CVR !== "--" &&
              x.SR !== "--" &&
              x.IET !== "--"
          );
          this.datatablefilter = this.dataTable.filter(
            (x) =>
              x.SIG > 1 ||
              x.CVR > 1 ||
              x.SR > 1 ||
              x.IET > 1
          );
          this.datatablefilter = this.dataTable.filter(
            (x) =>
              x.SIG < 1.65 ||
              x.CVR > 1 ||
              x.SR > 1 ||
              x.IET > 1
          )
        })
        .catch((error) => {
          this.ver = false;
          this.loader.hide();
          this.infoprueba2 = false;
          this.accion = "noDatos";
          this.datatablefilter = undefined;
          this.toastr.error('No se encontraron datos en Sigmometria');
        });
      await this.ObservationsanalytealertService.getDataObservationsAnalitosAlerta(
        this.jsonNormal
      )
        .then((data) => {
          this.dataobservaciones = data;
        })
        .catch((error) => {
          // this.verCalidadExterno = false;
          // this.loader.hide();
          // this.infoprueba2 = false;
          this.accion = "noDatos";
          this.toastr.error('No se encontraron datos en las Listas de observaciones');
        });

      if (this.dataobservaciones == null) {

        // console.log('no hay observaciones');

      } else {

        this.datatablefilter.forEach((value: any, index: number) => {
          this.dataobservaciones.forEach((element: any) => {
            if (value.idconsecutivo === element.idconsecutivo) {
              this.datatablefilter[index].obsXY = element.Observations;
            }
          });
        });

        this.datatablefilter = this.dataobvsfilter;
      }


      if (this.externo === "S" && this.interno === "S") {
        this.verCalidadExterno = true;
        await this.reporteAlertasService
          .getDataAnalitosAlertaQCE(this.jsonNormalQCE)
          .then((data) => {
            this.dataTableQCE = data;
          })
          .catch((error) => {
            this.verCalidadExterno = false;
            this.loader.hide();
            this.infoprueba2 = false;
            this.accion = "noDatos";
            this.toastr.error('No se encontraron datos en los indices de desvio');
          });
      }
      this.loader.hide();
    } else {
      this.toastr.error('Todos los campos deben ser llenados');
    }
  }

  async validReportObservations(datostable: any) {
    const inputobservations = document.getElementById(
      "descripcion-" + datostable.idconsecutivo
    ) as HTMLInputElement | null;

    let Idheadquarter = parseInt(datostable.Idsede);
    let Idanalyte = parseInt(datostable.Idanalyte);
    let Idsection = parseInt(datostable.Idsection);
    let Leveltest = parseInt(datostable.Nivel);
    let numsig = parseFloat(datostable.SIG);
    let numcvr = parseFloat(datostable.CVR);
    let numsr = parseFloat(datostable.SR);
    let numiet = parseFloat(datostable.IET);

    this.jsonNormal = {
      fechadesde: this.jsonDesde,
      fechahasta: this.jsonHasta,
      idsection: this.jsonSecciones,
      idheadquarter: this.jsonSedes,
      idanalytes: this.jsonAnalitos,
      idanalyzer: this.jsonEquipos,
      idlot: this.jsonLotes,
    };

    let banderacreate = false;

    this.ObservationsanalytealertService.getDataObservationsAnalitosAlertaxid(
      Idheadquarter,
      Idanalyte,
      Idsection,
      Leveltest,
      numsig,
      numcvr,
      numsr,
      numiet
    )
      .then((dataobservation: any) => {
        let idobservation = dataobservation[0].Idobservationsanalytesalert;
        let numsig = parseFloat(datostable.SIG);
        let numcvr = parseFloat(datostable.CVR);
        let numsr = parseFloat(datostable.SR);
        let numiet = parseFloat(datostable.IET);

        banderacreate = true;

        if (
          numsig < datostable.Constz ||
          numcvr >= 1 ||
          numsr >= 1 ||
          numiet >= 1
        ) {
          const dataObservations = {
            Idobservationsanalytesalert: idobservation,
            idconsecutivo: parseInt(datostable.idconsecutivo),
            Idtest: parseInt(datostable.idtest),
            Idheadquarter: parseInt(datostable.Idsede),
            Idanalyzer: parseInt(dataobservation[0].Idanalyzer),
            Idlot: parseInt(dataobservation[0].Idlot),
            Idanalyte: parseInt(datostable.Idanalyte),
            Idsection: parseInt(datostable.Idsection),
            Idsource: parseInt(dataobservation[0].Idsource),
            Idunit: parseInt(datostable.Idunits),
            Idconfobjquaanalyte: parseInt(
              dataobservation[0].Idconfobjquaanalyte
            ),
            Iddianavalue: parseInt(dataobservation[0].Iddianavalue),
            Idaverageds: parseInt(dataobservation[0].Idaverageds),
            Leveltest: parseInt(datostable.Nivel),
            Dateinitial: this.jsonDesde,
            Datefinal: this.jsonHasta,
            Valuesig: numsig,
            Valuecvr: numcvr,
            Valuesr: numsr,
            Valueiet: numiet,
            Observations: inputobservations.value,
            Active: true,
          };

          this.ObservationsanalytealertService.update(
            dataObservations,
            idobservation
          ).subscribe(
            (resp: any) => {
              this.filtrar();
              this.datatablefilter = this.dataTable.filter(
                (x) =>
                  x.SIG !== "--" &&
                  x.CVR !== "--" &&
                  x.SR !== "--" &&
                  x.IET !== "--"
              );
              console.log(this.datatablefilter);

            },
            (error) => {
              console.log(error);
            }
          );
        }
      })
      .catch((error) => {
        // this.accion = 'noDatos';
        // this.toastr.error(this.translate.instant('No se encontraron datos'));
      });

    if (!banderacreate) {
      if (
        numsig < datostable.Constz ||
        numcvr >= 1 ||
        numsr >= 1 ||
        numiet >= 1
      ) {
        const dataObservations = {
          idconsecutivo: parseInt(datostable.idconsecutivo),
          Idtest: parseInt(datostable.idtest),
          Idheadquarter: parseInt(datostable.Idsede),
          Idanalyzer: parseInt(datostable.Idanalyzer),
          Idlot: parseInt(datostable.Idlot),
          Idanalyte: parseInt(datostable.Idanalyte),
          Idsection: parseInt(datostable.Idsection),
          Idsource: parseInt(datostable.Idsource),
          Idunit: parseInt(datostable.Idunits),
          Idconfobjquaanalyte: parseInt(datostable.Idconfobjquaanalyte),
          Iddianavalue: parseInt(datostable.Iddianavalue),
          Idaverageds: parseInt(datostable.idaverageds),
          Leveltest: parseInt(datostable.Nivel),
          Dateinitial: this.jsonDesde,
          Datefinal: this.jsonHasta,
          Valuesig: numsig,
          Valuecvr: numcvr,
          Valuesr: numsr,
          Valueiet: numiet,
          Observations: inputobservations.value,
          Active: true,
        };

        if (dataObservations.Observations == "") {
          this.toastr.error('No se encontraron datos');
          return;
        }

        this.ObservationsanalytealertService.create(dataObservations).subscribe(
          (resp: any) => {
            this.filtrar();
            this.toastr.success('Registro creado');
          },
          (error) => {
            console.log(error);
          }
        );
      }
    }
  }

  exportToExcel(): void {
    this.ExporterService.exportToExcel(
      this.datatablefilter,
      "Reporte Analitos con alerta"
    );
  }

  filtrarAnalitos(campo: string) {
    let ids: any[] = this.formTwo.get('analitos').value;
    this.analitosFiltrados = [];
    if (ids.includes('-1')) {
      if (ids.includes('')) {
        this.analitosFiltrados = [];
        ids = ids.filter(x => x !== '');
        this.formTwo.get(campo).setValue(ids);
        return
      }
      this.analitosFiltrados = this.analitos;
    } else {
      if (ids.length !== 1 && ids.includes('-1')) {
        ids = ids.filter(x => x !== '-1');
      }
      this.formTwo.get(campo).setValue(ids);
      this.analitosFiltrados = this.analitos.filter(x => ids.includes(x.idanalytes))
    }
  }

  limpiar1(campo: string) {

  }

  downloadPDF() {
    let $dataTableQCE = []

    let $datatablefilter = this.datatablefilter;

    $dataTableQCE = this.dataTableQCE;
    if ($dataTableQCE != undefined) {
      $dataTableQCE = $dataTableQCE;
    } else {
      $dataTableQCE = [
        { Analito: "Sin datos", Indicedesvio: "Sin datos" }
      ]
    }
    const docDefinition: any = {
      content: [
        {

          image: this.logoSource.changingThisBreaksApplicationSecurity,
          width: 100,
          style: 'img'

        },
        {
          text: "Reporte De Analitos Con Alerta",
          style: "header",
        },
        {
          text: `fechas: ${this.desde}   ${this.hasta} `,
          style: "parrafo",
        },
        {
          text: `Reporte generado: ${this.actual}`,
          style: "parrafo",
        },
        {
          text: "------------------------------------------------------------------------------------------------------",
          style: "hr",
        },
        {
          columns: [
            [
              {
                text: `Secciones: ${this.txtSecciones}`,
                style: 'parrafoHeader'
              },
              {
                text: `Sedes:  ${this.txtSedes}`,
                style: 'parrafoHeader'
              },
            ],
            [
              {
                text: `Equipo: ${this.txtEquipos}`,
                style: 'parrafoHeader'
              },
              {
                text: `Analito : ${this.txtAnalitos} `,
                style: 'parrafoHeader'
              },
            ],
            [
              {
                text: ` Lote control calidad: ${this.txtLotes} `,
                style: 'parrafoHeader'
              },
              {
                text: ` Tipo de reporte: ${this.txtReportes}`,
                style: 'parrafoHeader'
              },
            ]
          ],
        },
        {
          text: "------------------------------------------------------------------------------------------------------",
          style: "hr",
        },

        {
          table: {
            headerRows: 1,

            widths: ["auto", "auto", 50, "auto", "auto", 40, 40, 40, "auto"],
            body: [
              [{ text: "QCI", colSpan: 9, alignment: "center", fillColor: "#1E90FF", color: "#ffffff" }, "", "", "", "", "", "", "", ""],
              [
                "Sedes",
                "Sección",
                "Analito",
                "Nivel",
                "sigmometria",
                "CVR",
                "SR",
                "IET",
                "Observación",
              ], // encabezado de la tabla
              ...$datatablefilter.map((item) => {
                return [
                  item.Sede,
                  item.Seccion,
                  item.Analito,
                  item.Nivel,
                  {
                    text: item.SIG > 1 ? '--' : item.SIG,
                    style: "colorRojo",
                  },
                  {
                    text: item.CVR < 1 ? '--' : item.CVR,
                    style: "colorRojo",
                  },
                  {
                    text: item.SR < 1 ? '--' : item.SR,
                    style: "colorRojo",
                  },
                  {
                    text: item.IET < 1 ? '--' : item.IET,
                    style: "colorRojo",
                  },
                  item.obsXY ? item.obsXY : "SIN COMENTARIOS",
                ];
                // aquí se asume que cada elemento de la matriz tiene cuatro propiedades
              }),
            ],
          },
          style: "tableStyle",
        },
        {
          text: "------------------------------------------------------------------------------------------------------",
          style: "hr",
        },
        {
          text: 'Información Para El Control De Calidad Externo',
          style: "header",
        }
        ,
        {
          columns: [
            [
              {
                text: `ITC Externo por: ${this.txtICT}`,
                style: 'parrafoCalidaExterno'
              },

            ],
            [
              {
                text: ` Programa : ${this.txtProgramas} `,
                style: 'parrafoCalidaExterno'
              },
            ],
            [
              {
                text: `Equipo: ${this.txtEquiposExterno}`,
                style: 'parrafoCalidaExterno'
              },
            ],
            [
              {
                text: ` Analito: ${this.txtAnalitosExterno} `,
                style: 'parrafoCalidaExterno'
              },
            ],

          ],
        },
        {
          text: "------------------------------------------------------------------------------------------------------",
          style: "hr",
        },
        {
          table: {

            headerRows: 1,

            widths: ["auto", "auto"],
            body: [
              [{ text: "QCE", colSpan: 2, alignment: "center", fillColor: "#1E90FF", color: "#ffffff" }
                , ""],

              ["Analito", "Indicedesvio"], // encabezado de la tabla
              ...$dataTableQCE.map((item) => {
                return [
                  item.Analito,
                  item.Indicedesvio ? item.Indicedesvio : "Sin desvio",
                ]; // aquí se asume que cada elemento de la matriz tiene cuatro propiedades
              }),
            ],
          },
          style: "tableStyle",
        },
        {
          text: "------------------------------------------------------------------------------------------------------",
          style: "hr",
        },

        {
          text: "Abreviaturas",
          style: "header",
        },
        {
          columns: [
            [
              {
                text: ` CVR: Coeficiente de variación relativo: `,
                style: "parrafoFooter",
              },
              {
                text: `SR: Sesgo relativo: `,
                style: "parrafoFooter",
              },
              {
                text: `IET: Índice de error total`,
                style: "parrafoFooter",
              },
              {
                text: 'σ : Sigma',
                style: "parrafoFooter",
              }
            ],
            [
              {
                text: ` Eta: Error total máximo permitido `,
                style: "parrafoFooter",
              },
              {
                text: `DS: Desviación estanda`,
                style: "parrafoFooter",
              },
              {
                text: `Cva: Coeficiente de variación máximo permitido`,
                style: "parrafoFooter",
              },

              {
                text: `BIASa: Sesgo máximo permitido`,
                style: "parrafoFooter",
              },

            ],
          ],
        }
      ],
      styles: {
        img: {
          alignment: "center",
        } as Style,

        header: {
          bold: true,
          alignment: "center",
          fontSize: 14,
          color: "#6b4b8b",
          margin: [0, 20, 0, 20],
        } as Style,
        parrafoHeader: {
          bold: true,
          fontSize: 10
        } as Style,
        parrafoCalidaExterno: {
          bold: true,
          fontSize: 8,
          alignment: 'justify'
        } as Style,
        tableStyle: {
          fontSize: 8,
          margin: [0, 20, 0, 20],
        } as Style,

        parrafo: {
          alignment: "center",
          fontSize: 8,
          color: "#808080",
        } as Style,
        parrafoFooter: {
          alignment: "center",
          fontSize: 10,
        } as Style,
        hr: {
          bold: true,
          alignment: "center",
          fontSize: 14,
          color: "#6b4b8b",
        } as Style,
        colorRojo: {
          color: "red",
        } as Style,
      },
    };
    $dataTableQCE = [];
    this.dataTableQCE = [];
    const pdf = pdfMake.createPdf(docDefinition);
    pdf.download();
  }



  scrollCards(flow: number): void {
    this.scroll.nativeElement.scrollLeft += (136.1 * flow);
  }

}
