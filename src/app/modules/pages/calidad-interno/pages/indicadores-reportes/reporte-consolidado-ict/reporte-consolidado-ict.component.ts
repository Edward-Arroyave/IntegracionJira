import { Component, effect, Input, OnInit, signal } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';

import { AnalitosService } from '@app/services/configuracion/analitos.service';
import { AnalizadoresService } from '@app/services/configuracion/analizadores.service';
import { LotesService } from '@app/services/configuracion/lotes.service';
import { ReporteICTService } from '@app/services/configuracion/reporteICT.service';
import { SeccionesService } from '@app/services/configuracion/secciones.service';
import { SedesXUserService } from '@app/services/configuracion/sedesxuser.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { AnalyzerQceService } from '@app/services/calidad-externo/AnalyzerQce.service';
import { AnalitosQceService } from '@app/services/configuracion/analitos-qce.service';
import { ProgramasQceService } from '@app/services/configuracion/programas-qce.service';

import dayjs from 'dayjs';
import * as echarts from 'echarts';
import pdfMake from 'pdfmake/build/pdfmake';
import html2canvas from 'html2canvas';
import { LaboratoriosService } from '@app/services/configuracion/laboratorios.service';
import { DomSanitizer } from '@angular/platform-browser';
import moment from 'moment';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { ImageCdnPipe } from '../../../../../core/pipes/image-cdn.pipe';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { LoaderService } from '@app/services/loader/loader.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';


@Component({
    selector: 'app-reporte-consolidado-ict',
    templateUrl: './reporte-consolidado-ict.component.html',
    styleUrls: ['./reporte-consolidado-ict.component.css'],
    standalone: true,
    imports: [FormsModule,
      ReactiveFormsModule,
      MatFormFieldModule,
      MatInputModule,
      MatDatepickerModule,
      MatSelectModule,
      MatOptionModule,
      NgFor,
      MatTooltipModule,
      NgIf,
      TranslateModule,
      ImageCdnPipe,
      MatIcon,
      NgClass,
      NgxMatSelectSearchModule
    ]
})

export class ReporteConsolidadoICTComponent implements OnInit {

  @Input() flagFromParent: boolean = true;

  idUser: number = parseInt(sessionStorage.getItem('userid'));

  desde: any;
  hasta: any;
  actual = dayjs().format('YYYY-MM-DD');
  meta: number;
  divCharts: any;
  logoSource: any;
  calculadoPor = '';

  show = false;
  tienePermisos = false;
  formAdicional = false;

  dataGraphs = [];
  dataGraphDesvio = [];

  jsonTxtSecciones = [];
  jsonTxtSedes = [];
  jsonTxtEquipos = [];
  jsonTxtAnalitos = [];
  jsonTxtLotes = [];
  jsonTxtReportes = [];
  jsonTxtProgramas = [];
  jsonTxtAnalitosExterno = [];
  jsonTxtEquiposExterno = [];

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
  reportes: any = [

    { value: 'sigmometria', item: 'Sigmometría' },
    { value: 'coeficiente', item: 'Coeficiente de variación' },
    { value: 'sesgo', item: 'Sesgo relativo' },
    { value: 'error', item: 'Indice de error' },

  ];

  programas = [];
  programasCopy = [];
  analitosExterno = [];
  analitosExternoCopy = [];
  equiposExterno = [];
  equiposExternoCopy = [];

  sedesid = [];

  ict = [
    { value: 1, item: 'Valor asignado' },
    { value: 2, item: 'Z-Score' }
  ];

  formDates: FormGroup = this.fb.group({

    desde: ['', [Validators.required]],
    hasta: ['', [Validators.required]],
    meta: ['', [Validators.required, Validators.max(100), Validators.min(1)]],

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

  arrsections2 = [];

  flagVisualizarInfo= signal<boolean>(false);
  graficasFlag= signal<boolean>(false);

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
    private sedesXUserService: SedesXUserService,
    private equiposService: AnalizadoresService,
    private analitosService: AnalitosService,
    private lotesService: LotesService,
    private reporteICTService: ReporteICTService,
    private translate: TranslateService,
    private toastr: ToastrService,
    private programasService: ProgramasQceService,
    private analitosExternoService: AnalitosQceService,
    private equiposExternoService: AnalyzerQceService,
    private laboratoriosService: LaboratoriosService,
    private sanitizer: DomSanitizer,
    private loader:LoaderService

  ) {

    effect(x=>{
      this.graficasFlag();
    })
   }

  ngOnInit() {

    this.dataFilters();
    this.validarModulo();
    this.showFormAdicional();
    this.getLogoSource();
    this.validselect();
    this.filtrosAutocomplete();
  }

  observeFechas(campo: string) {

    let x = this.formDates.get("desde").value;
    let y = this.formDates.get("hasta").value;
    let fechaX;
    let fechaY;
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
        this.toastr.error(`La fecha "hasta" no puede ser menor a la fecha "desde"`);
      }
    }
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

  async dataFilters() {

    await this.seccionesService.getAllAsync().then(data => {

      this.secciones = data.filter(data => data.active);

    });

    await this.sedesXUserService.getByIdAsync(this.idUser).then((data: any) => {

      this.sedes = data.filter(data => data.active);
      this.sedesCopy = data.filter(data => data.active);

    });

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

  selectNone(control: string, form: string) {
    form == 'formOne' ? this.formOne.get(control).setValue('') : form == 'formTwo' ? this.formTwo.get(control).setValue('') : this.formThree.get(control).setValue('');
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

  // Select - Options

  // selectAll(control: string) {
  //   this.formOne.get(control).setValue(['-1']);
  // }

  //selectNone(control: string) {
  //   this.formOne.get(control).setValue('');
  // }

  // selectOne(control: string) {
  //   if (this.formOne.get(control).value[0] == '-1' || this.formOne.get(control).value[0] == '') {

  //     this.formOne.get(control).value.shift();
  //     this.formOne.get(control).setValue(this.formOne.get(control).value);
  //   }
  // }

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


    if(this.formOne.get(control).value.length == this.sedes.length){
      let all =  this.sedes.map(e => { return e.idheadquarters })
      all.unshift("-1")
      this.formOne.get('sedes').setValue(all)
    }

    arrsedes = (this.sedesid.filter((item, index) => {
      return this.sedesid.indexOf(item) === index;
    }));
    this.selectheadquarter(arrsedes);

  }

  selectedAllheadquaerter(control: string) {


    let all =  this.sedes.map(e => { return e.idheadquarters })
    all.unshift("-1")
    this.formOne.get('sedes').setValue(all)
    this.formOne.value.sedes.forEach(element => {

      this.sedesid.push(element);
    });

    this.selectheadquarterAlls(this.sedesid);

  }

  async selectheadquarterAlls(sedes) {


    var jsonTexto: any = '{"Idheadquarters":"' + sedes + '"}';

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

    await this.seccionesService.getAllAsyncSeccionesxsede(jsonTexto).subscribe((data: any) => {
      this.vertodassecciones = true;
      this.secciones_Tmp = data.filter(data => data.active);

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


  showFormAdicional() {

    this.formTwo.get('reportes').valueChanges.subscribe(data => {

      data.includes('desvio') || (this.tienePermisos && data.includes('-1')) ? this.formAdicional = true : this.formAdicional = false;

    });

  }

  async filtrar() {
    if ((this.formAdicional && this.formDates.valid && this.formOne.valid && this.formTwo.valid && this.formThree.valid) || (!this.formAdicional && this.formDates.valid && this.formOne.valid && this.formTwo.valid)) {
      await new Promise((res,rej)=>{
        this.graficasFlag.set(true);
        setTimeout(() => {
          res(true);
        }, 500);
      }).then(x=>{
        this.divCharts = document.getElementById('charts');
        while (this.divCharts.firstChild) {
          this.divCharts.removeChild(this.divCharts.firstChild);
        }
      });


      this.show = false;
      this.loader.show();

      this.desde = dayjs(this.formDates.get('desde').value).format('YYYY-MM-DD');
      this.hasta = dayjs(this.formDates.get('hasta').value).format('YYYY-MM-DD');
      this.meta = this.formDates.get('meta').value;

      this.jsonTxtSecciones = this.buildJsons(this.formOne.value.secciones.includes("-1") ? ["-1"] : this.formOne.value.secciones, 'secciones');
      this.jsonTxtSedes = this.buildJsons(this.formOne.value.sedes.includes("-1") ? ["-1"] : this.formOne.value.sedes, 'sedes');
      this.jsonTxtEquipos = this.buildJsons(this.formOne.value.equipos.includes("-1") ? ["-1"] : this.formOne.value.equipos, 'equipos');
      this.jsonTxtAnalitos = this.buildJsons(this.formTwo.value.analitos.includes("-1") ? ["-1"] : this.formTwo.value.analitos, 'analitos');
      this.jsonTxtLotes = this.buildJsons(this.formTwo.value.lotes.includes("-1") ? ["-1"] : this.formTwo.value.lotes, 'lotes');
      this.jsonTxtReportes = this.buildJsons(this.formTwo.value.reportes.includes("-1") ? ["-1"] : this.formTwo.value.reportes, 'reportes');

      var json = {

        fechadesde: this.desde,
        fechahasta: this.hasta,
        idsection: this.jsonTxtSecciones[0],
        idheadquarter: this.jsonTxtSedes[0],
        idanalytes: this.jsonTxtAnalitos[0],
        idanalyzer: this.jsonTxtEquipos[0],
        idlot: this.jsonTxtLotes[0],

      }

      await this.reporteICTService.getDataForGraphics(json).then((data: any) => {

        this.dataGraphs = data;

        if (this.formAdicional) {

          this.jsonTxtProgramas = this.buildJsons(this.formThree.value.programas.includes("-1") ? ["-1"] : this.formThree.value.programas, 'programas');
          this.jsonTxtAnalitosExterno = this.buildJsons(this.formThree.value.analitosExterno.includes("-1") ? ["-1"] : this.formThree.value.analitosExterno, 'analitosExterno');
          this.jsonTxtEquiposExterno = this.buildJsons(this.formThree.value.equiposExterno.includes("-1") ? ["-1"] : this.formThree.value.equiposExterno, 'equiposExterno');

          this.calculadoPor = this.formThree.value.ict == 1 ? 'Valor asignado' : 'Z-Score';

          var jsonDos = {

            fechadesde: this.desde,
            fechahasta: this.hasta,
            idprogram: this.jsonTxtProgramas[0],
            idanalyzer: this.jsonTxtEquiposExterno[0],
            idanalytes: this.jsonTxtAnalitosExterno[0],
            Idcalculado: this.formThree.value.ict == 1 ? 'valor asignado' : 'zscore'

          }

          this.reporteICTService.getDataForGraphicsDos(jsonDos).then((datos: any) => {

            this.dataGraphDesvio = datos;

          }).catch(error => {

            this.dataGraphDesvio = [];

          });

        }

        this.validarReportes(this.jsonTxtReportes);

        setTimeout(() => {

          this.show = true;
          this.loader.hide();

        }, 5000);

      }).catch(error => {

        this.dataGraphs = [];
        this.loader.hide();
        this.toastr.error('No se encontraron datos');

      });

    } else { this.toastr.error('Todos los campos deben ser llenados'); }

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

  validarReportes(tipos: any) {
    if (tipos[1] == "Todos") {

      this.sigmo();
      this.coeficiente(this.meta);
      this.sesgo(this.meta);
      this.error(this.meta);

      if (this.tienePermisos && this.dataGraphDesvio.length > 0) {
        this.desvio(this.meta);
      }

    }

    if (tipos[0] == "sigmometria") {
      this.sigmo();
    }

    if (tipos[0] == "coeficiente") {
      this.coeficiente(this.meta);
    }

    if (tipos[0] == "sesgo") {
      this.sesgo(this.meta);
    }

    if (tipos[0] == "error") {
      this.error(this.meta);
    }

    if (tipos[0] == "sigmometria,coeficiente,sesgo,error") {
      this.sigmo();
      this.coeficiente(this.meta);
      this.sesgo(this.meta);
      this.error(this.meta);
    }

    if (tipos[0] == "desvío" && this.dataGraphDesvio.length > 0) {
      this.desvio(this.meta);
    }
  }

  sigmo() {

    var seccionessele = [];

    for (let i = 0; i < this.dataGraphs.length; i++) {
      if (!seccionessele.includes(this.dataGraphs[i].Seccion)) {
        seccionessele.push(this.dataGraphs[i].Seccion);
      }
    }

    for (let i = 0; i < this.arrsections2.length; i++) {

      var seccionesFiltradas = this.dataGraphs.filter(data => data.Seccion == seccionessele[i]);
      var constZ: number = parseFloat(seccionesFiltradas[0].Constz.replace(',', '.'));
      var labels = [`< a ${constZ}`, `Entre ${constZ} y 2,99`, 'Entre 3 y 3,99', 'Entre 4 y 5,99', '> a 6', 'Total'];
      var grupo1 = seccionesFiltradas.filter(data => {
        const sigValue = parseFloat(data.SIG.replace(',', '.'));
        return !isNaN(sigValue) && sigValue < constZ;
      });
      var grupo2 = seccionesFiltradas.filter(data => {
        const sigValue = parseFloat(data.SIG.replace(',', '.'));
        return !isNaN(sigValue) && sigValue >= constZ && sigValue < 3;
      });
      var grupo3 = seccionesFiltradas.filter(data => {
        const sigValue = parseFloat(data.SIG.replace(',', '.'));
        return !isNaN(sigValue) && sigValue >= 3 && sigValue < 4;
      });
      var grupo4 = seccionesFiltradas.filter(data => {
        const sigValue = parseFloat(data.SIG.replace(',', '.'));
        return !isNaN(sigValue) && sigValue >= 4 && sigValue < 6;
      });
      var grupo5 = seccionesFiltradas.filter(data => {
        const sigValue = parseFloat(data.SIG.replace(',', '.'));
        return !isNaN(sigValue) && sigValue > 6;
      });

      var chart = document.createElement("div");
      // var br = document.createElement("br");
      chart.setAttribute("id", seccionessele[i]);
      this.divCharts.append(chart);
      //this.divCharts.append(br);

      Object.defineProperty(document.getElementById(seccionessele[i]), 'clientWidth', { get: function () { return 800 } });
      Object.defineProperty(document.getElementById(seccionessele[i]), 'clientHeight', { get: function () { return 350 } });
      document.getElementById(seccionessele[i]).style.marginTop = "16px";
      document.getElementById(seccionessele[i]).style.marginTop = "16px";

      var grafico = echarts.init(document.getElementById(seccionessele[i]));
      console.log("Consolidado de Métrica 03", labels);

      grafico.setOption({
        title: {
          text: `Resumen Consolidado de Métrica Sigma-${seccionessele[i]}`,
          //left: 'center',
          textStyle: {
            color: '#6F4B8B',
            fontSize: 15,
          }
        },
        xAxis: {
          type: 'category',
          data: labels,
          axisLabel: {
            fontWeight: 'bold',
            color: '#6F4B8B',
            //rotate: 45
          }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            fontWeight: 'bold',
            color: '#6F4B8B',
          }
        },
        series: [
          {
            data: [
              {
                label: {
                  show: true,
                  position: 'top',
                  fontWeight: 'bold',
                  color: '#6F4B8B'
                },
                value: grupo1.length,
                itemStyle: {
                  color: '#FF1A00'
                }
              },
              {
                label: {
                  show: true,
                  position: 'top',
                  fontWeight: 'bold',
                  color: '#6F4B8B'
                },
                value: grupo2.length,
                itemStyle: {
                  color: '#00A2F4'
                }
              },
              {
                label: {
                  show: true,
                  position: 'top',
                  fontWeight: 'bold',
                  color: '#6F4B8B'
                },
                value: grupo3.length,
                itemStyle: {
                  color: '#FFF000'
                }
              },
              {
                label: {
                  show: true,
                  position: 'top',
                  fontWeight: 'bold',
                  color: '#6F4B8B'
                },
                value: grupo4.length,
                itemStyle: {
                  color: '#8EC24B'
                }
              },
              {
                label: {
                  show: true,
                  position: 'top',
                  fontWeight: 'bold',
                  color: '#6F4B8B'
                },
                value: grupo5.length,
                itemStyle: {
                  color: '#009A4F'
                }
              },
              {
                label: {
                  show: true,
                  position: 'top',
                  fontWeight: 'bold',
                  color: '#6F4B8B'
                },
                value: seccionesFiltradas.length,
                itemStyle: {
                  color: '#7F7F7F'
                }
              }
            ],
            type: 'bar'
          }
        ]

      });

    }

  }

  coeficiente(meta: number) {
    var seccion = this.dataGraphs[0].Seccion;
    var seccionesFiltradas = this.dataGraphs.filter(data => data.Seccion == seccion);
    seccionesFiltradas.sort((a, b) => Number(a.Mes) - Number(b.Mes));
    var mesesFiltrados = [];
    var labels = [];
    var metas = [];
    var data = [];

    for (let i = 0; i < seccionesFiltradas.length; i++) {
      if (!mesesFiltrados.includes(seccionesFiltradas[i].Mes)) {
        mesesFiltrados.push(seccionesFiltradas[i].Mes);
      }
    }

    for (let i = 0; i < mesesFiltrados.length; i++) {
      var meses = seccionesFiltradas.filter(data => data.Mes == mesesFiltrados[i]);
      var datos = meses.filter(data => {
        const cvr = parseFloat(data.CVR.replace(',', '.'));
        return !isNaN(cvr) && cvr < 1;
      });
      var porcentaje = Math.round((datos.length * 100) / meses.length);
      var nombreMes = '';

      var objeto = {
        label: {
          show: true,
          position: 'top',
          fontWeight: 'bold',
          color: '#6F4B8B',
          formatter: function (data) {
            return data.value + '%'
          }
        },
        value: porcentaje,
        itemStyle: {
          color: '#4472C4'
        }
      }

      var month = mesesFiltrados[i];

      month == '1' ? nombreMes = 'ENE' : month == '2' ? nombreMes = 'FEB' : month == '3' ? nombreMes = 'MAR' : month == '4' ? nombreMes = 'ABR' : month == '5' ? nombreMes = 'MAY' : month == '6' ? nombreMes = 'JUN' : month == '7' ? nombreMes = 'JUL' : month == '8' ? nombreMes = 'AGO' : month == '9' ? nombreMes = 'SEP' : month == '10' ? nombreMes = 'OCT' : month == '11' ? nombreMes = 'NOV' : nombreMes = 'DIC';

      labels.push(nombreMes);
      metas.push(meta);
      data.push(objeto);
    }

    if (mesesFiltrados.length == 1) {
      labels.push('');
      metas.push(meta);
    }

    var chart = document.createElement("div");
    // var br = document.createElement("br");
    chart.setAttribute("id", 'coeficiente');
    this.divCharts.append(chart);
    // this.divCharts.append(br);


    Object.defineProperty(document.getElementById('coeficiente'), 'clientWidth', { get: function () { return 1000 } });
    Object.defineProperty(document.getElementById('coeficiente'), 'clientHeight', { get: function () { return 350 } });
    document.getElementById('coeficiente').style.marginTop = "16px";
    document.getElementById('coeficiente').style.marginTop = "16px";

    var grafico = echarts.init(document.getElementById('coeficiente'));

    grafico.setOption({
      title: {
        text: 'Coeficiente de variación relativo (% pruebas con CVR <1)',
        left: 'center',
        textStyle: {
          color: '#6F4B8B'
        }
      },
      legend: {
        data: ['Mes', 'Meta'],
        top: 'bottom',
        icon: 'rect',
        itemHeight: 7,
        itemWidth: 40
      },
      xAxis: {
        type: 'category',
        data: labels,
        axisLabel: {
          fontWeight: 'bold',
          color: '#6F4B8B',
        }
      },
      yAxis: {
        type: 'value',
        max: 110,
        axisLabel: {
          fontWeight: 'bold',
          color: '#6F4B8B',
        }
      },
      series: [
        {
          name: 'Mes',
          color: '#4472C4',
          data: data,
          type: 'bar',
          barWidth: '100'
        },
        {
          name: 'Meta',
          type: 'line',
          data: metas,
          showSymbol: false,
          lineStyle: {
            width: 4,
            color: '#EB5F58'
          },
          itemStyle: {
            color: '#EB5F58'
          }
        }
      ]

    });

  }

  sesgo(meta: number) {

    var seccion = this.dataGraphs[0].Seccion;
    var seccionesFiltradas = this.dataGraphs.filter(data => data.Seccion == seccion);
    seccionesFiltradas.sort((a, b) => Number(a.Mes) - Number(b.Mes));
    var mesesFiltrados = [];
    var labels = [];
    var metas = [];
    var data = [];

    for (let i = 0; i < seccionesFiltradas.length; i++) {
      if (!mesesFiltrados.includes(seccionesFiltradas[i].Mes)) {
        mesesFiltrados.push(seccionesFiltradas[i].Mes);
      }
    }

    for (let i = 0; i < mesesFiltrados.length; i++) {

      var meses = seccionesFiltradas.filter(data => data.Mes == mesesFiltrados[i]);
      var datos = meses.filter(data => {
        const srValue = parseFloat(data.SR.replace(',', '.'));
        return !isNaN(srValue) && srValue < 1;
      });
      var porcentaje = Math.round(datos.length * 100 / meses.length);
      var nombreMes = '';

      var objeto = {
        label: {
          show: true,
          position: 'top',
          fontWeight: 'bold',
          color: '#6F4B8B',
          formatter: function (data) {

            return data.value + '%'

          }
        },
        value: porcentaje,
        itemStyle: {
          color: '#09C6E1'
        }
      }

      var month = mesesFiltrados[i];

      month == '1' ? nombreMes = 'ENE' : month == '2' ? nombreMes = 'FEB' : month == '3' ? nombreMes = 'MAR' : month == '4' ? nombreMes = 'ABR' : month == '5' ? nombreMes = 'MAY' : month == '6' ? nombreMes = 'JUN' : month == '7' ? nombreMes = 'JUL' : month == '8' ? nombreMes = 'AGO' : month == '9' ? nombreMes = 'SEP' : month == '10' ? nombreMes = 'OCT' : month == '11' ? nombreMes = 'NOV' : nombreMes = 'DIC';

      labels.push(nombreMes);
      metas.push(meta);
      data.push(objeto);

    }

    if (mesesFiltrados.length == 1) {

      labels.push('');
      metas.push(meta);

    }

    var chart = document.createElement("div");
    // var br = document.createElement("br");
    chart.setAttribute("id", 'sesgo');
    this.divCharts.append(chart);
    // this.divCharts.append(br);

    Object.defineProperty(document.getElementById('sesgo'), 'clientWidth', { get: function () { return 800 } });
    Object.defineProperty(document.getElementById('sesgo'), 'clientHeight', { get: function () { return 350 } });
    document.getElementById('sesgo').style.marginTop = "16px";
    document.getElementById('sesgo').style.marginTop = "16px";

    var grafico = echarts.init(document.getElementById('sesgo'));

    grafico.setOption({
      title: {
        text: 'Sesgo relativo (% pruebas con SR <1)',
        left: 'center',
        textStyle: {
          color: '#6F4B8B'
        }
      },
      legend: {
        data: ['Mes', 'Meta'],
        top: 'bottom',
        icon: 'rect',
        itemHeight: 7,
        itemWidth: 40
      },
      xAxis: {
        type: 'category',
        data: labels,
        axisLabel: {
          fontWeight: 'bold',
          color: '#6F4B8B',
        }
      },
      yAxis: {
        type: 'value',
        max: 110,
        axisLabel: {
          fontWeight: 'bold',
          color: '#6F4B8B',
        }
      },
      series: [
        {
          name: 'Mes',
          color: '#09C6E1',
          data: data,
          type: 'bar',
          barWidth: '100'
        },
        {
          name: 'Meta',
          type: 'line',
          data: metas,
          showSymbol: false,
          lineStyle: {
            width: 4,
            color: '#EB5F58'
          },
          itemStyle: {
            color: '#EB5F58'
          }
        }
      ]

    });

  }

  error(meta: number) {

    var seccion = this.dataGraphs[0].Seccion;
    var seccionesFiltradas = this.dataGraphs.filter(data => data.Seccion == seccion);
    seccionesFiltradas.sort((a, b) => Number(a.Mes) - Number(b.Mes));
    var mesesFiltrados = [];
    var labels = [];
    var metas = [];
    var data = [];

    for (let i = 0; i < seccionesFiltradas.length; i++) {

      if (!mesesFiltrados.includes(seccionesFiltradas[i].Mes)) {

        mesesFiltrados.push(seccionesFiltradas[i].Mes);

      }

    }

    for (let i = 0; i < mesesFiltrados.length; i++) {

      var meses = seccionesFiltradas.filter(data => data.Mes == mesesFiltrados[i]);
      var datos = meses.filter(data => {
        const ietValue = parseFloat(data.IET.replace(',', '.'));
        return !isNaN(ietValue) && ietValue < 1;
      });

      var porcentaje = Math.round(datos.length * 100 / meses.length);
      var nombreMes = '';

      var objeto = {
        label: {
          show: true,
          position: 'top',
          fontWeight: 'bold',
          color: '#6F4B8B',
          formatter: function (data) {

            return data.value + '%'

          }
        },
        value: porcentaje,
        itemStyle: {
          color: '#6B4B8B'
        }
      }

      var month = mesesFiltrados[i];

      month == '1' ? nombreMes = 'ENE' : month == '2' ? nombreMes = 'FEB' : month == '3' ? nombreMes = 'MAR' : month == '4' ? nombreMes = 'ABR' : month == '5' ? nombreMes = 'MAY' : month == '6' ? nombreMes = 'JUN' : month == '7' ? nombreMes = 'JUL' : month == '8' ? nombreMes = 'AGO' : month == '9' ? nombreMes = 'SEP' : month == '10' ? nombreMes = 'OCT' : month == '11' ? nombreMes = 'NOV' : nombreMes = 'DIC';

      labels.push(nombreMes);
      metas.push(meta);
      data.push(objeto);

    }

    if (mesesFiltrados.length == 1) {

      labels.push('');
      metas.push(meta);

    }

    var chart = document.createElement("div");
    // var br = document.createElement("br");
    chart.setAttribute("id", 'error');
    this.divCharts.append(chart);
    // this.divCharts.append(br);

    Object.defineProperty(document.getElementById('error'), 'clientWidth', { get: function () { return 800 } });
    Object.defineProperty(document.getElementById('error'), 'clientHeight', { get: function () { return 350 } });
    document.getElementById('error').style.marginTop = "16px";
    document.getElementById('error').style.marginTop = "16px";

    var grafico = echarts.init(document.getElementById('error'));

    grafico.setOption({
      title: {
        text: 'Indice de error total IET (% pruebas con IET < 1)',
        left: 'center',
        textStyle: {
          color: '#6F4B8B'
        }
      },
      legend: {
        data: ['Mes', 'Meta'],
        top: 'bottom',
        icon: 'rect',
        itemHeight: 7,
        itemWidth: 40
      },
      xAxis: {
        type: 'category',
        data: labels,
        axisLabel: {
          fontWeight: 'bold',
          color: '#6F4B8B',
        }
      },
      yAxis: {
        type: 'value',
        max: 110,
        axisLabel: {
          fontWeight: 'bold',
          color: '#6F4B8B',
        }
      },
      series: [
        {
          name: 'Mes',
          color: '#6B4B8B',
          data: data,
          type: 'bar',
          barWidth: '100'
        },
        {
          name: 'Meta',
          type: 'line',
          data: metas,
          showSymbol: false,
          lineStyle: {
            width: 4,
            color: '#EB5F58'
          },
          itemStyle: {
            color: '#EB5F58'
          }
        }
      ]

    });

  }

  desvio(meta: number) {

    if (this.dataGraphDesvio.length > 0) {

      this.dataGraphDesvio.sort((a, b) => Number(a.Mes) - Number(b.Mes));
      var mesesFiltrados = [];
      var labels = [];
      var metas = [];
      var data = [];

      for (let i = 0; i < this.dataGraphDesvio.length; i++) {

        if (!mesesFiltrados.includes(this.dataGraphDesvio[i].Mes)) {
          mesesFiltrados.push(this.dataGraphDesvio[i].Mes);
        }

      }

      for (let i = 0; i < mesesFiltrados.length; i++) {

        var meses = this.dataGraphDesvio.filter(data => data.Mes == mesesFiltrados[i]);
        var datos = meses.filter(data => {
          const indiceDesvioValue = parseFloat(data.Indicedesvio.replace(',', '.'));
          return !isNaN(indiceDesvioValue) && indiceDesvioValue < 1;
        });
        var porcentaje = Math.round(datos.length * 100 / meses.length);
        var nombreMes = '';

        var objeto = {
          label: {
            show: true,
            position: 'top',
            fontWeight: 'bold',
            color: '#6F4B8B',
            formatter: function (data) {

              return data.value + '%'

            }
          },
          value: porcentaje,
          itemStyle: {
            color: '#72C85D'
          }
        }

        var month = mesesFiltrados[i];

        month == '1' ? nombreMes = 'ENE' : month == '2' ? nombreMes = 'FEB' : month == '3' ? nombreMes = 'MAR' : month == '4' ? nombreMes = 'ABR' : month == '5' ? nombreMes = 'MAY' : month == '6' ? nombreMes = 'JUN' : month == '7' ? nombreMes = 'JUL' : month == '8' ? nombreMes = 'AGO' : month == '9' ? nombreMes = 'SEP' : month == '10' ? nombreMes = 'OCT' : month == '11' ? nombreMes = 'NOV' : nombreMes = 'DIC';

        labels.push(nombreMes);
        metas.push(meta);
        data.push(objeto);

      }

      if (mesesFiltrados.length == 1) {

        labels.push('');
        metas.push(meta);

      }

      var chart = document.createElement("div");
      // var br = document.createElement("br");
      chart.setAttribute("id", 'desvio');
      this.divCharts.append(chart);
      // this.divCharts.append(br);

      Object.defineProperty(document.getElementById('desvio'), 'clientWidth', { get: function () { return 800 } });
      Object.defineProperty(document.getElementById('desvio'), 'clientHeight', { get: function () { return 350 } });
      document.getElementById('desvio').style.marginTop = "16px";
      document.getElementById('desvio').style.marginTop = "16px";

      var grafico = echarts.init(document.getElementById('desvio'));

      grafico.setOption({
        title: {
          text: 'Indice de desvío (% pruebas con ID < 1)',
          left: 'center',
          textStyle: {
            color: '#6F4B8B'
          }
        },
        legend: {
          data: ['Mes', 'Meta'],
          top: 'bottom',
          icon: 'rect',
          itemHeight: 7,
          itemWidth: 40
        },
        xAxis: {
          type: 'category',
          data: labels,
          axisLabel: {
            fontWeight: 'bold',
            color: '#6F4B8B',
          }
        },
        yAxis: {
          type: 'value',
          max: 110,
          axisLabel: {
            fontWeight: 'bold',
            color: '#6F4B8B',
          }
        },
        series: [
          {
            name: 'Mes',
            color: '#72C85D',
            data: data,
            type: 'bar',
            barWidth: '100'
          },
          {
            name: 'Meta',
            type: 'line',
            data: metas,
            showSymbol: false,
            lineStyle: {
              width: 4,
              color: '#EB5F58'
            },
            itemStyle: {
              color: '#EB5F58'
            }
          }
        ]

      });

    }

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

      });
  }

  async downloadPDF() {
    this.loader.show();
    const DATA = document.getElementById('coeficiente');
    const DATA2 = document.getElementById('sesgo');
    const DATA3 = document.getElementById('error');

    let imagenes:any[]=[];

    const options = {
      background: 'white',
      scale: 3
    };

    await new Promise((res,rej)=>{
      this.flagVisualizarInfo.set(true);
      setTimeout(() => {
        res(true);
      }, 700);
    }).then( async(x)=>{
      const DATA = document.getElementById('info-oculta');
      await html2canvas(DATA, options).then((canvas) => {
        let splitAt = 775;
        let y = 0;
        while (canvas.height > y) {
          imagenes.push(this.getClippedRegion(canvas, 0, y, canvas.width, splitAt));
          y += splitAt;
        }      
      });
    })
    
    await new Promise((res,rej)=>{
      this.flagVisualizarInfo.set(false);
      setTimeout(() => {
        res(true);
      }, 500);
    }).then( async(x)=>{})
    
    await html2canvas(DATA, options).then((canvas) => {
      let splitAt = 775;
      let y = 0;
      while (canvas.height > y) {
        imagenes.push(this.getClippedRegion(canvas, 0, y, canvas.width, splitAt));
        y += splitAt;
      }      
    });
    await html2canvas(DATA2, options).then((canvas) => {
      let splitAt = 775;
      let y = 0;
      while (canvas.height > y) {
        imagenes.push(this.getClippedRegion(canvas, 0, y, canvas.width, splitAt));
        y += splitAt;
      }      
    });
    await html2canvas(DATA3, options).then((canvas) => {
      let splitAt = 775;
      let y = 0;
      while (canvas.height > y) {
        imagenes.push(this.getClippedRegion(canvas, 0, y, canvas.width, splitAt));
        y += splitAt;
      }      
    });
    
    const docDefinition: TDocumentDefinitions = {
      content: imagenes,
      pageSize: "LETTER",
      pageMargins: [45, 10, 10, 10]
    };

    this.loader.hide();
    pdfMake.createPdf(docDefinition).open();
  }



  getClippedRegion(image, x, y, width, height) {

    var canvas = document.createElement("canvas"),
      ctx = canvas.getContext("2d");

    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(image, x, y, width, height, 0, 0, width, height);

    return {
      image: canvas.toDataURL(),
      width: 520,
      height: 150
    };

  }


}
