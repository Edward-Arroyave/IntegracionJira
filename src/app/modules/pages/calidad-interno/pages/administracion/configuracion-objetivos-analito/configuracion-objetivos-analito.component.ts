import { DatePipe, NgFor, NgIf, NgClass, AsyncPipe, TitleCasePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ConfiguracionObjetivosAnalitoService } from '@app/services/configuracion/configuracion-objetivos-analito.service';
import { FuentesService } from '@app/services/configuracion/fuentes.service';
import { LotesService } from '@app/services/configuracion/lotes.service';
import { ControlMaterialService } from '@app/services/configuracion/materialescontrol.service';
import { Unidadeservice } from '@app/services/configuracion/unidades.service';
import { AnalitosService } from '@app/services/configuracion/analitos.service';
import { PublicService } from '@app/services/public.service';
import { SharedService } from '@app/services/shared.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { SeccionesService } from '@app/services/configuracion/secciones.service';
import { TestsService } from '@app/services/configuracion/test.service';
import { ToastrService } from 'ngx-toastr';
import { SedesService } from '../../../../../../services/configuracion/sedes.service';
import { ValoresDianaService } from '../../../../../../services/configuracion/valores-diana.service';
import { PrecargaService } from '@app/services/post-analitico/precarga.service';
import dayjs from 'dayjs';
import { map, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';
import { lastValueFrom, Observable, Subject } from 'rxjs';
import { ImageCdnPipe } from '../../../../../core/pipes/image-cdn.pipe';
import { NombreSeccionPipe } from '../../../../../shared/pipe/nombre-seccion.pipe';
import { NombreControlmaterialPipe } from '../../../../../shared/pipe/nombre-contmat.pipe';
import { NombreLotePipe } from '../../../../../shared/pipe/nombre-lote.pipe';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TablaComunComponent } from '@app/modules/shared/general-tablas/tabla-comun/tabla-comun.component';
import { ModalData } from '@app/Models/Modaldata';
import { ModalGeneralComponent } from '@app/modules/shared/modals/modal-general/modal-general.component';
import { MatDialog } from '@angular/material/dialog';
import { error } from 'console';
import { LoaderService } from '@app/services/loader/loader.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NombreTestPipe } from "../../../../../shared/pipe/nombre-test.pipe";
import { createLog } from '@app/globals/logUser';

@Component({
    selector: 'app-configuracion-objetivos-analito',
    templateUrl: './configuracion-objetivos-analito.component.html',
    styleUrls: ['./configuracion-objetivos-analito.component.css'],
    encapsulation: ViewEncapsulation.None,
    providers: [DatePipe],
    standalone: true,
    imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    NgFor,
    NgIf,
    MatInputModule,
    MatAutocompleteModule,
    MatTooltipModule,
    MatTableModule,
    MatSortModule,
    MatSlideToggleModule,
    MatPaginatorModule,
    NgClass,
    AsyncPipe,
    TitleCasePipe,
    DatePipe,
    TranslateModule,
    NombreLotePipe,
    NombreControlmaterialPipe,
    NombreSeccionPipe,
    ImageCdnPipe,
    TablaComunComponent,
    NgxMatSelectSearchModule,
    NombreTestPipe
],
})

export class ConfiguracionObjetivosAnalitoComponent implements OnInit,OnDestroy {
  log = new createLog(this.datePipe, this.translate, this.configuracionObjetivosAnalitoService);
  displayedColumns: string[] = ['Analito', 'Fuente', 'Unidad', 'ETMP', 'Cvmp', 'Sesgo mp', 'Nivel', 'Ult. actualización', 'Responsable', 'Estado', 'Editar', 'Eliminar'];
  dataSource: MatTableDataSource<any>;
  dataTableBody:any[]=[];

  ventanaModal: BsModalRef;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  formaBuscarDatos: FormGroup;
  formaRegistroConfiObj: FormGroup;
  bandera: boolean;
  accion: any;
  accionEditar: any;
  tituloAccion: any;
  messageError: any;
  messageSinDatos: string;
  titulo: string = '';
  ok: string;
  text: string = '';
  text2: string = '';
  text3: string = '';
  aceptar: string = '';
  dateNow: Date = new Date();
  test: number;
  desactivar = false;
  lab: number;
  sec: number;
  ver: boolean = undefined;
  verBtn: boolean = false;
  mat: number;
  lote: number;
  listaOBDC = [];
  idSource: number;
  idanalytes: number;
  valideleveltest: any;
  leveltest: any;

  dateNowISO = this.dateNow.toTimeString();
  sedes = [];
  sedesActive = [];
  secciones = [];
  seccionesActive = [];
  controlMaterial = [];
  controlMaterialActive = [];
  lotes = [];
  lotesActive = [];
  fuentes = [];
  fuentesActive: any;
  tests = [];
  unidades = [];
  unidadesActive: any;
  dataActive: any;
  sedeId: number = 0;
  habilitarSede: boolean = false;
  idtestinfo: number = 0;
  banderacreate: boolean;
  dataTest: any;
  today = dayjs().format('YYYY-MM-DD');

  //predictivos
  filteredOptionsSections: Observable<string[]>;
  filteredOptionsControlmaterial: Observable<string[]>;
  filteredOptionsLots: Observable<string[]>;
  filteredOptionsTest: Observable<string[]>;

  listsectionspr: any;
  idsectionspr: number;
  listcontrolmanterialpr: any;
  idcontrolmaterialpr: number;
  listlotspr: any;
  idlotspr: number;

  //predictivos modal
  filteredOptionssourceEdit: Observable<string[]>;
  idsourcepr: number;
  dessourcepr: any;
  listasourcepr: any;

  filteredOptionsunitsEdit: Observable<string[]>;
  idunitspr: number;
  desunitspr: any;
  listaunitspr: any;

  //predictivos create
  filteredOptionsSourcesCreate: Observable<string[]>;
  listsourcescreate: any;
  filteredOptionsUnitsCreate: Observable<string[]>;
  listunitscreate: any;

  //trazabilidad
  sourcenew:any;
  sourceant:any;
  analytenew:any;
  analyteant:any;
  idanalytenew:any;
  unitnew:any;
  unitant:any;
  idunitnew:any;
  etmpnew:any;
  etmpant:any;
  sesgonew:any;
  sesgompant:any;
  levelnew:any;
  levelant:any;

  formaRegistroConfiObjEdit: FormGroup = this.fb.group({
    idconfobjquaanalyte: [],
    idsource: [, [Validators.required]],
    idTest: [, [Validators.required]],
    idunits: [, [Validators.required]],
    etmp: [, [Validators.required]],
    cvmp: [, [Validators.required]],
    sesgomp: [, [Validators.required]],
    level: [, [Validators.required]],
    datemod: [this.datePipe.transform(new Date, "yyyy-MM-dd")],
    userid: [],
    active: [],
  });

  filterHeadquarters = new FormControl('');
  sedesActiveFilter: any;
  dataAnt: any;
  
  constructor(
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private publicService: PublicService,
    private seccionesService: SeccionesService,
    private controlMaterialService: ControlMaterialService,
    private lotesService: LotesService,
    private fuentesService: FuentesService,
    private toastr: ToastrService,
    private unidadeservice: Unidadeservice,
    private analitosService: AnalitosService,
    private sharedService: SharedService,
    private translate: TranslateService,
    private configuracionObjetivosAnalitoService: ConfiguracionObjetivosAnalitoService,
    private TestsService: TestsService,
    private sedesService: SedesService,
    private valoresDianaService: ValoresDianaService,
    private precargaService:PrecargaService,
    private dialog:MatDialog,
    private loaderService: LoaderService,
  ) { }

  ngOnDestroy(): void {
    
  }

  ngOnInit(): void {

    this.crearFormularioBuscarDatos();
    this.cargarFuentes();
    this.cargarSedes();
    this.cargarSecciones();
    this.cargarSeccionesPre();
    /*this.cargarControlMaterial();
    this.cargarLotes();*/
    this.cargarUnidadMedida();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();
    //this.search();
    this.sedeId = JSON.parse(sessionStorage.getItem('sede'));

    if (this.sedeId > 0) {
      this.formaBuscarDatos.controls['numLaboratorio'].setValue(this.sedeId);
      this.habilitarSede = true
    }
  this.filtrosAutocomplete();
  }

  filtrosAutocomplete() {
    this.filterHeadquarters.valueChanges.subscribe(word => {
      if (word) {
        this.sedesActive = this.sedesActiveFilter.filter((item: any) => {
          return item.desheadquarters.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.sedesActive = this.sedesActiveFilter;
      }
    });
  }

  private _filterSourcesCreate(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.fuentesActive
      .filter(source =>
        source.dessource.toLowerCase().includes(filterValue)).filter(e => e.active == true)

  }

  private _filterUnitsCreate(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.unidadesActive
      .filter(units =>
        units.desunits.toLowerCase().includes(filterValue)).filter(e => e.active == true)

  }

  private _filterSourcesEdit(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.fuentesActive
      .filter(source =>
        source.dessource.toLowerCase().includes(filterValue)).filter(e => e.active == true)

  }

  private _filterUnitsEdit(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.unidadesActive
      .filter(units =>
        units.desunits.toLowerCase().includes(filterValue)).filter(e => e.active == true)

  }

  private _filterSections(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.listsectionspr
      .filter(seccion =>
        seccion.namesection.toLowerCase().includes(filterValue)).filter(e => e.Active == true)

  }

  private _filterControlMaterial(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.listcontrolmanterialpr
      .filter(contmat =>
        contmat.descontmat.toLowerCase().includes(filterValue)).filter(e => e.Active == true)
  }

  private _filterLots(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.listlotspr
      .filter(lots =>
        lots.Numlot.toLowerCase().includes(filterValue)).filter(e => e.Active == true)
  }

  private _filterTest(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.tests.filter(test => test.value.toLowerCase().includes(filterValue));
  }

  async cargarSeccionesPre() {
    await this.seccionesService.getAllAsyncSecciones().then(data => {
      this.listsectionspr = data.filter(e => e.Active == true);

      this.listsectionspr.sort((a: any, b: any) => {
        a.namesection = a.namesection.charAt(0) + a.namesection.slice(1);
        b.namesection = b.namesection.charAt(0) + b.namesection.slice(1);
      })

      this.listsectionspr.sort((a: any, b: any) => {
        if (a.namesection < b.namesection) return -1;
        if (a.namesection > b.namesection) return 1;
        return 0;
      })

      this.filteredOptionsSections = this.formaBuscarDatos.get('seccion').valueChanges.pipe(
        startWith(''),
        map(value => {
          return this._filterSections(value)
        }),
      );
    });
  }

  async cambiarSeccion(NombreSeccion: string, idsection?: number) {

    var namesection0 = this.formaBuscarDatos.get('seccion').setValue(NombreSeccion.split('|')[1]);
    var idsection0 = NombreSeccion.split('|')[0];
    this.idsectionspr = Number(idsection0);

    this.formaBuscarDatos.controls['numMaterialControl'].setValue('');
    this.formaBuscarDatos.controls['numLote'].setValue('');
      this.formaBuscarDatos.get('idtest').setValue('');

    await this.controlMaterialService.getAllAsyncControlMaterialxsedesec(this.idsectionspr, this.sedeId).then(data => {
      this.listcontrolmanterialpr = data.filter(e => e.Active == true);


      this.listcontrolmanterialpr.sort((a: any, b: any) => {
        a.descontmat = a.descontmat.charAt(0) + a.descontmat.slice(1);
        b.descontmat = b.descontmat.charAt(0) + b.descontmat.slice(1);
      })

      this.listcontrolmanterialpr.sort((a: any, b: any) => {
        if (a.descontmat < b.descontmat) return -1;
        if (a.descontmat > b.descontmat) return 1;
        return 0;
      })

      this.filteredOptionsControlmaterial = this.formaBuscarDatos.get('numMaterialControl').valueChanges.pipe(
        startWith(''),
        map(value => {

          return this._filterControlMaterial(value)
        }),
      );
    });

  }

  async cambiarControlMaterial(NombreControlmaterial: string, idcontrolmaterial?: number) {

    var descontmat001 = this.formaBuscarDatos.get('numMaterialControl').setValue(NombreControlmaterial.split('|')[1]);
    var idcontmat = NombreControlmaterial.split('|')[0];
    this.idcontrolmaterialpr = Number(idcontmat);

    if (idcontmat != '') {

      this.formaBuscarDatos.get('numLote').reset('');

      await this.lotesService.getAllAsynclotsxsedecontm(this.idcontrolmaterialpr, this.sedeId).then(data => {
        this.listlotspr = data.filter(e => e.Active == true);

        this.listlotspr.sort((a: any, b: any) => {
          a.Numlot = a.Numlot.charAt(0) + a.Numlot.slice(1);
          b.Numlot = b.Numlot.charAt(0) + b.Numlot.slice(1);
        })

        this.listlotspr.sort((a: any, b: any) => {
          if (a.Numlot < b.Numlot) return -1;
          if (a.Numlot > b.Numlot) return 1;
          return 0;
        })

        this.filteredOptionsLots = this.formaBuscarDatos.get('numLote').valueChanges.pipe(
          startWith(''),
          map(value => {
            return this._filterLots(value)
          }),
        );
      });
    } else {

      this.lotesActive = [];
      this.formaBuscarDatos.get('numLote').setValue('');
    }
  }

  async lotesPre(nombreLote: string) {

    var desnumlot = this.formaBuscarDatos.get('numLote').setValue(nombreLote.split('|')[1]);
    var idlot0 = nombreLote.split('|')[0];
    this.idlotspr = Number(idlot0);

    this.formaBuscarDatos.get('numLaboratorio').valueChanges.subscribe(data => {

      this.ver = false;
      this.tests = [];

      if (data != '') {

        this.seccionesActive = this.secciones.filter(e => e.active);

        this.formaBuscarDatos.get('seccion').reset('');
        this.formaBuscarDatos.get('numMaterialControl').reset('');
        this.formaBuscarDatos.get('numLote').reset('');
      this.formaBuscarDatos.get('idtest').setValue('');

      } else {

        this.seccionesActive = [];
        this.controlMaterialActive = [];
        this.lotesActive = [];

        this.formaBuscarDatos.get('seccion').reset('');
        this.formaBuscarDatos.get('numMaterialControl').reset('');
        this.formaBuscarDatos.get('numLote').reset('');
      this.formaBuscarDatos.get('idtest').setValue('');

      }

    });

    this.formaBuscarDatos.get('seccion').valueChanges.subscribe(data => {

      this.ver = false;
      this.tests = [];

      if (data != '') {

        this.controlMaterialActive = this.controlMaterial.filter(e => e.active);
        this.formaBuscarDatos.get('numMaterialControl').reset('');
        this.formaBuscarDatos.get('numLote').reset('');
        this.formaBuscarDatos.get('idtest').setValue('');

      } else {
        this.controlMaterialActive = [];
        this.lotesActive = [];
        this.formaBuscarDatos.get('numMaterialControl').reset('');
        this.formaBuscarDatos.get('numLote').reset('');
      }

    });

    this.formaBuscarDatos.get('numMaterialControl').valueChanges.subscribe(data => {

      this.ver = false;
      this.tests = [];

      if (data != '') {

        this.lotesActive = this.lotes.filter(e => e.active);
        this.formaBuscarDatos.get('numLote').reset('');

      } else {
        this.lotesActive = [];
        this.formaBuscarDatos.get('numLote').reset('');
      }

    });

    this.configuracionObjetivosAnalitoService.getTestFiltro(this.sedeId, this.idsectionspr, this.idcontrolmaterialpr, this.idlotspr).subscribe(response => {

      this.tests = [];
      this.verBtn = false;
      for (let item of response) { 
        item.value = `${item.IdTest},${item.Desanalytes} | ${item.Desunits} | ${item.Desmethods} | ${item.Desreagents} | ${item.NameAnalyzer}`
      }
      this.tests = response;
      this.formaBuscarDatos.get('idtest').setValue('');

      this.filteredOptionsTest = this.formaBuscarDatos.get('idtest').valueChanges.pipe(
        startWith(''),
        map(value => {
          return this._filterTest(value)
        }),
      );

    }, error => {

      let arr = [];
      this.dataSource = new MatTableDataSource(arr);
      this.accion = 'noDatos';
      this.toastr.error('No se encontraron datos');
      // this.formaBuscarDatos.reset({ numLaboratorio: '', seccion: '', numMaterialControl: '', numLote: '' });
      this.tests = [];
      this.ver = false;
    });
  }

  async cargarSedes() {
    this.sedes = await this.publicService.obtenerSedes();
    this.sedesActive = this.sedes.filter(e => e.active);
    this.sedesActiveFilter = this.sedes.filter(e => e.active == true);
  }

  async cargarSecciones() {
    this.secciones = await this.seccionesService.getAllAsync();
    this.seccionesActive = this.secciones.filter(e => e.active == true);

  }

  async cargarUnidadMedida() {
    this.unidades = await this.unidadeservice.getAllAsync();
    this.unidadesActive = this.unidades.filter(e => e.active);
  }

  async cargarFuentes() {
    this.fuentes = await this.fuentesService.getAllAsync();
    this.fuentesActive = this.fuentes.filter(e => e.active);
  }

  async Consultatest(idtest) {

    this.TestsService.getByIdAsync(idtest).then((data: any) => {

      this.dataTest = data;
      this.idtestinfo = data.idTest;
      this.leveltest = data.level;
      console.log(data);

      // this.analitosService.getanalitoslog(data.idanalytes).subscribe((datanalito) => {
      //   this.analyteant = datanalito.desanalytes;
      // })
    });
  }

  crearFormularioBuscarDatos() {

    this.formaBuscarDatos = this.fb.group({

      numLaboratorio: ['', [Validators.required]],
      seccion: ['', [Validators.required]],
      numMaterialControl: ['', [Validators.required]],
      numLote: ['', [Validators.required]],
      idtest: ['']

    });

  }

  search() {

    this.formaBuscarDatos.get('numLaboratorio').valueChanges.subscribe(data => {
      this.ver = false;
      this.tests = [];

      if (data != '') {
        this.seccionesActive = this.secciones.filter(e => e.active);

        this.formaBuscarDatos.get('seccion').reset('');
        this.formaBuscarDatos.get('numMaterialControl').reset('');
        this.formaBuscarDatos.get('numLote').reset('');

      } else {
        this.seccionesActive = [];
        this.controlMaterialActive = [];
        this.lotesActive = [];

        this.formaBuscarDatos.get('seccion').reset('');
        this.formaBuscarDatos.get('numMaterialControl').reset('');
        this.formaBuscarDatos.get('numLote').reset('');
      }
    });

    this.formaBuscarDatos.get('seccion').valueChanges.subscribe(data => {

      this.ver = false;
      this.tests = [];
      if (data != '') {
        this.formaBuscarDatos.get('numMaterialControl').reset('');
        this.formaBuscarDatos.get('numLote').reset('');

      } else {
        this.lotesActive = [];
        this.formaBuscarDatos.get('numMaterialControl').reset('');
        this.formaBuscarDatos.get('numLote').reset('');
      }
    });

    this.formaBuscarDatos.get('numMaterialControl').valueChanges.subscribe(data => {
      this.ver = false;
      this.tests = [];
      if (data != '') {
        this.lotesActive = this.lotes.filter(e => e.active);
        this.formaBuscarDatos.get('numLote').reset('');
      } else {
        this.lotesActive = [];
        this.formaBuscarDatos.get('numLote').reset('');
      }
    });

    this.formaBuscarDatos.get('numLote').valueChanges.subscribe(data => {
      if (data != '') {
        this.ver = false;
        const { numLaboratorio, seccion, numMaterialControl } = this.formaBuscarDatos.value;
        this.lab = parseInt(numLaboratorio);
        this.sec = parseInt(seccion);
        this.mat = parseInt(numMaterialControl);
        this.lote = parseInt(data);
        this.configuracionObjetivosAnalitoService.getTestFiltro(this.lab, this.sec, this.mat, this.lote).subscribe({
          next:(response) => {
            this.tests = [];
            this.verBtn = false;
            this.tests = response;
            this.formaBuscarDatos.get('idtest').setValue('');              
          },error:(err) => {
            let arr = [];
            this.dataSource = new MatTableDataSource(arr);
            this.accion = 'noDatos';
            this.toastr.error('No se encontraron datos');
            // this.formaBuscarDatos.reset({ numLaboratorio: '', seccion: '', numMaterialControl: '', numLote: '' });
            this.tests = [];
            this.ver = false;
          }
        });

      }

    });

  }

  setTest(event: any) {
    let id = event.split(',')[0];
    this.formaBuscarDatos.controls['idtest'].setValue(event.split(',')[1]);
    const test = id;
    if (test != '') {
      this.test = parseInt(test);
      this.verBtn = true;
    } else {
      this.verBtn = false;
    }
  }



  get idsourceNoValido() {
    return this.formaRegistroConfiObj.get('idsource');
  }
  get idtestNoValido() {
    return this.formaRegistroConfiObj.get('idtest');
  }
  get idunitsNoValido() {
    return this.formaRegistroConfiObj.get('idunits');
  }
  get etmpNoValido() {
    return this.formaRegistroConfiObj.get('etmp');
  }
  get cvmpNoValido() {
    return this.formaRegistroConfiObj.get('cvmp');
  }
  get sesgompNoValido() {
    return this.formaRegistroConfiObj.get('sesgomp');
  }
  get levelNoValido() {
    return this.formaRegistroConfiObj.get('level');
  }

  get idsourceNoValidoEdit() {
    return this.formaRegistroConfiObjEdit.get('idsource');
  }
  get idtestNoValidoEdit() {
    return this.formaRegistroConfiObjEdit.get('idtest');
  }
  get idunitsNoValidoEdit() {
    return this.formaRegistroConfiObjEdit.get('idunits');
  }
  get etmpNoValidoEdit() {
    return this.formaRegistroConfiObjEdit.get('etmp');
  }
  get cvmpNoValidoEdit() {
    return this.formaRegistroConfiObjEdit.get('cvmp');
  }
  get sesgompNoValidoEdit() {
    return this.formaRegistroConfiObjEdit.get('sesgomp');
  }
  get levelNoValidoEdit() {
    return this.formaRegistroConfiObjEdit.get('level');
  }

  crearFormularioConfiObj(datos: any) {

    this.formaRegistroConfiObj = this.fb.group({

      idconfobjquaanalyte: [datos.Idconfobjquaanalyte ? datos.Idconfobjquaanalyte : ''],
      idsource: [datos.Idsource ? datos.Idsource : '', [Validators.required]],
      idTest: [datos.IdTest ? datos.IdTest : this.test, [Validators.required]],
      idunits: [datos.Idunits ? datos.Idunits : '', [Validators.required]],
      etmp: [datos.Etmp ? datos.Etmp : '', [Validators.required, Validators.min(0)]],
      cvmp: [datos.Cvmp ? datos.Cvmp : '', [Validators.required, Validators.min(0)]],
      sesgomp: [datos.Sesgomp ? datos.Sesgomp : '', [Validators.required, Validators.min(0)]],
      level: [datos.Level ? datos.Level : '', [Validators.required, Validators.min(1), Validators.max(3)]],
      datemod: [this.datePipe.transform(new Date, "yyyy-MM-dd")],
      userid: [datos.Userid ? datos.Userid : sessionStorage.getItem('userid')],
      active: [datos.Active ? datos.Active : false],

    });
  }

  async crearFormularioConfiObjEdit(datos: any) {

    await this.fuentesService.getByIdAsync(datos.Idsource).then((source: any) => {
      this.dessourcepr = source.dessource;
    });
    await this.unidadeservice.getByIdAsync(datos.Idunits).then((results: any) => {
      this.desunitspr = results.desunits;
    });

    this.formaRegistroConfiObjEdit.get('idconfobjquaanalyte').setValue(datos.Idconfobjquaanalyte ? datos.Idconfobjquaanalyte : '')
    this.formaRegistroConfiObjEdit.get('idsource').setValue(this.dessourcepr.toLowerCase() ? this.dessourcepr.toLowerCase() : '')
    this.formaRegistroConfiObjEdit.get('idTest').setValue(datos.IdTest ? datos.IdTest : this.test)
    this.formaRegistroConfiObjEdit.get('idunits').setValue(this.desunitspr.toLowerCase() ? this.desunitspr.toLowerCase() : '')
    this.formaRegistroConfiObjEdit.get('etmp').setValue(datos.Etmp ? datos.Etmp : '')
    this.formaRegistroConfiObjEdit.get('cvmp').setValue(datos.Cvmp ? datos.Cvmp : '')
    this.formaRegistroConfiObjEdit.get('sesgomp').setValue(datos.Sesgomp ? datos.Sesgomp : '')
    this.formaRegistroConfiObjEdit.get('level').setValue(datos.Level ? datos.Level : '')
    this.formaRegistroConfiObjEdit.get('datemod').setValue(this.datePipe.transform(new Date, "yyyy-MM-dd"))
    this.formaRegistroConfiObjEdit.get('userid').setValue(datos.Userid ? datos.Userid : sessionStorage.getItem('userid'))
    this.formaRegistroConfiObjEdit.get('active').setValue(datos.Active ? datos.Active : false)

    this.listasourcepr = await this.fuentesService.getAllAsync();
    this.fuentesActive = this.listasourcepr.filter(e => e.active);
    this.fuentesActive.sort((a, b) => {
      a.dessource = a.dessource.charAt(0).toLowerCase() + a.dessource.slice(1);
      b.dessource = b.dessource.charAt(0).toLowerCase() + b.dessource.slice(1);
    })
    this.fuentesActive.sort((a, b) => {
      if (a.dessource < b.dessource) return -1;
      if (a.dessource > b.dessource) return 1;
      return 0;
    })

    this.filteredOptionssourceEdit = this.formaRegistroConfiObjEdit.get('idsource').valueChanges.pipe(
      startWith(''),
      map(value => {
        return this._filterSourcesEdit(value)
      }),
    );

    this.listaunitspr = await this.unidadeservice.getAllAsync();
    this.unidadesActive = this.listaunitspr.filter(e => e.active);
    this.unidadesActive.sort((a, b) => {
      a.desunits = a.desunits.charAt(0).toLowerCase() + a.desunits.slice(1);
      b.desunits = b.desunits.charAt(0).toLowerCase() + b.desunits.slice(1);
    })
    this.unidadesActive.sort((a, b) => {
      if (a.desunits < b.desunits) return -1;
      if (a.desunits > b.desunits) return 1;
      return 0;
    })

    this.filteredOptionsunitsEdit = this.formaRegistroConfiObjEdit.get('idunits').valueChanges.pipe(
      startWith(''),
      map(value => {
        return this._filterUnitsEdit(value)
      }),
    );
  }

  async openModalRegistroConfiObj(templateRegistroConfiObj: TemplateRef<any>, datos: any) {

    this.crearFormularioConfiObj(datos);
    this.Consultatest(this.test);

    await this.fuentesService.getAllAsync().then(data => {
      this.listsourcescreate = data.filter(e => e.Active == true);

      this.listsourcescreate.sort((a: any, b: any) => {
        a.dessource = a.dessource.charAt(0) + a.dessource.slice(1);
        b.dessource = b.dessource.charAt(0) + b.dessource.slice(1);
      })

      this.listsourcescreate.sort((a: any, b: any) => {
        if (a.dessource < b.dessource) return -1;
        if (a.dessource > b.dessource) return 1;
        return 0;
      })

      this.filteredOptionsSourcesCreate = this.formaRegistroConfiObj.get('idsource').valueChanges.pipe(
        startWith(''),
        map(value => {
          return this._filterSourcesCreate(value)
        }),
      );
    });

    await this.unidadeservice.getAllAsync().then(data => {
      this.listunitscreate = data.filter(e => e.Active == true);

      this.listunitscreate.sort((a: any, b: any) => {
        a.desunits = a.desunits.charAt(0) + a.desunits.slice(1);
        b.desunits = b.desunits.charAt(0) + b.desunits.slice(1);
      })

      this.listunitscreate.sort((a: any, b: any) => {
        if (a.desunits < b.desunits) return -1;
        if (a.desunits > b.desunits) return 1;
        return 0;
      })

      this.filteredOptionsUnitsCreate = this.formaRegistroConfiObj.get('idunits').valueChanges.pipe(
        startWith(''),
        map(value => {
          return this._filterUnitsCreate(value)
        }),
      );
    });

    if(datos){
      this.accionEditar = true;
      this.accion = "Editar" ;
    }else{
      this.accionEditar = false;
      this.accion = "Crear";
    }

    const destroy$: Subject<boolean> = new Subject<boolean>();
    /* Variables recibidas por el modal */
    const data: ModalData = {
      content: templateRegistroConfiObj,
      btn: 'Guardar',
      btn2: 'Cerrar',
      footer:true,
      title: this.accion,
      image:'assets/rutas/iconos/crear.png'
    };
    const dialogRef = this.dialog.open(ModalGeneralComponent, { height:'auto' ,width: '50em', data, disableClose: true });

    dialogRef.componentInstance.primaryEvent?.pipe(takeUntil(destroy$)).subscribe(x =>{
      if(this.formaRegistroConfiObj.invalid){
        this.formaRegistroConfiObj.markAllAsTouched();
        return
      }
      this.crearEditarConfiObj();
      dialogRef.close();
    });
  }

  openModalRegistroConfiObjEdit(templateRegistroConfiObjEdit: TemplateRef<any>, datos: any) {

    this.crearFormularioConfiObjEdit(datos);
    this.sourceant = datos.Dessource;
    this.unitant = datos.Desunits;
    this.etmpant = datos.Etmp;
    this.sesgompant = datos.Sesgomp;
    this.levelant = datos.Level;
    this.analyteant = datos.Desanalytes;
    this.Consultatest(this.test);

    if(datos){
      this.accionEditar = true;
      this.accion = "Editar" ;
    }else{
      this.accionEditar = false;
      this.accion = "Crear";
    }

    const destroy$: Subject<boolean> = new Subject<boolean>();
    /* Variables recibidas por el modal */
    const data: ModalData = {
      content: templateRegistroConfiObjEdit,
      btn: 'Actualizar',
      btn2: 'Cerrar',
      footer:true,
      title: this.accion,
      image:'assets/rutas/iconos/editar.png'
    };
    const dialogRef = this.dialog.open(ModalGeneralComponent, { height:'auto' ,width: '50em', data, disableClose: true });

    dialogRef.componentInstance.primaryEvent?.pipe(takeUntil(destroy$)).subscribe(x =>{
      if(this.formaRegistroConfiObjEdit.invalid){
        this.formaRegistroConfiObjEdit.markAllAsTouched();
        return
      }
      this.crearEditarConfiObjEdit();
      dialogRef.close();
    });
  }

  loadData() {
    this.dataSource = new MatTableDataSource();
    this.dataTableBody = [];
    this.loaderService.show();
    this.ver = false;

    this.configuracionObjetivosAnalitoService.getBuscadorConfigObjCalidad(this.test).subscribe({
      next:(respuesta) => {
        this.listaOBDC = respuesta;
        this.dataAnt = respuesta;

        respuesta.forEach((d)=>{
          d.Datemod = dayjs(d.Datemod).format("YYYY-MM-DD")
       });
        this.dataTableBody = this.listaOBDC .map( x =>  {
          return { Analito:x.Desanalytes,Fuente:x.Dessource,Unidad:x.Desunits,
                  ETMP:x.Etmp,Cvmp:x.Cvmp,'Sesgo mp':x.Sesgomp,Nivel:x.Level,
                  'Ult. actualización':x.Datemod,Responsable:x.Username,Estado:x.Active, item: x,item11:x, item12:x };
        });
        this.dataSource = new MatTableDataSource(respuesta);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.ver = true;  
        this.loaderService.hide();
      },error:(err)=>{
        this.ver = true;
        this.dataSource = new MatTableDataSource([]);
        this.accion = 'noDatos';
        this.toastr.error('No se encontraron datos');
        this.loaderService.hide();
      },

    });
  }

  async FnCreateLog(nuevaData: any) {
    this.desactivar = false;
    return new Promise((resolve, errPr) => {
      setTimeout(() => {
        this.fuentesService.getByIdAsync2(nuevaData.idsource)
          .pipe(
            tap((X: any) => {
              this.sourcenew = X.dessource;
              this.formaRegistroConfiObj.value.idsource = nuevaData.idsource;
              this.formaRegistroConfiObj.value.idTest = nuevaData.idTest;
              this.formaRegistroConfiObj.value.idunits = nuevaData.idunits;
              this.formaRegistroConfiObj.value.etmp = nuevaData.etmp;
              this.formaRegistroConfiObj.value.cvmp = nuevaData.cvmp;
              this.formaRegistroConfiObj.value.sesgomp = nuevaData.sesgomp;
              this.formaRegistroConfiObj.value.level = nuevaData.level;
              this.formaRegistroConfiObj.value.datemod = nuevaData.datemod;
              this.formaRegistroConfiObj.value.userid = nuevaData.userid;
              this.formaRegistroConfiObj.value.active = nuevaData.active;
            }),
            switchMap(Y => this.TestsService.getByIdAsync2(nuevaData.idTest)
              .pipe(
                tap((respY: any) => this.idanalytenew = respY.idanalytes)
              )
            ),
            switchMap(Z => this.analitosService.getByIdAsync2(this.idanalytenew)
              .pipe(
                tap((respZ: any) => this.analytenew = respZ.desanalytes)
              )
            ),
            switchMap(Z => this.unidadeservice.getByIdAsync2(nuevaData.idunits)
              .pipe(
                tap((respZ: any) => this.unitnew = respZ.desunits)
              )
            ),
            switchMap(Z => this.configuracionObjetivosAnalitoService.create(this.formaRegistroConfiObj.value))
          )

          .subscribe({
            next:(resp: any) => {
              this.loadData();
              this.toastr.success('Registro creado');
              this.desactivar = false;
  
              const Loguser = {
                Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
                hora: this.datePipe.transform(Date.now(), "shortTime"),
                Modulo: 'Control Calidad Interno',
                Submodulo: 'Administración',
                Item: 'Metas de calidad por test',
                Metodo: 'creación',
                Datos: ('Analito: ' + this.analytenew + '|Fuente: ' + this.sourcenew + '|unidad: ' + this.unitnew + '|ETMP: '+ nuevaData.etmp + '|SESGOMP: ' + nuevaData.sesgomp  + '|Nivel: ' + nuevaData.level),
                Respuesta: JSON.stringify(resp),
                TipoRespuesta: 200,
                Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
              }
  
              this.configuracionObjetivosAnalitoService.createLogAsync(Loguser).then(respuesta => { });
              resolve(true)
            },error:(err) => {
              if (err.status === 400) {
                this.toastr.error(err.error);
              } else {
                this.toastr.error('Ocurrió un error inesperado.');
              }
              this.desactivar = false;
              const Loguser = {
                Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
                hora: this.datePipe.transform(Date.now(), "shortTime"),
                Modulo: 'Control Calidad Interno',
                Submodulo: 'Administración',
                Item: 'Metas de calidad por test',
                Metodo: 'creación',
                Datos: ('Analito: ' + this.analytenew + '| ' + this.sourcenew + '| ' + this.unitnew + '| '+ nuevaData.etmp + '| ' + nuevaData.sesgomp  + '| ' + nuevaData.level),
                respuesta: err.message,
                tipoRespuesta: err.status,
                Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
              }
              this.configuracionObjetivosAnalitoService.createLogAsync(Loguser).then(respuesta => { });
              errPr(false);
                
            }
          });
      }, 500);
    })
  }

  async FnCreatePreloadMetLog(nuevaData: any) {

    this.desactivar = false;
    return new Promise((resolve, errPr) => {
      setTimeout(() => {
        this.fuentesService.getByIdAsync2(nuevaData.idsource)
          .pipe(
            tap((X: any) => {
              this.sourcenew = X.dessource;
            }),
            switchMap(Y => this.TestsService.getByIdAsync2(nuevaData.idtest)
              .pipe(
                tap((respY: any) => this.idanalytenew = respY.idanalytes)
              )
            ),
            switchMap(Z => this.analitosService.getByIdAsync2(this.idanalytenew)
              .pipe(
                tap((respZ: any) => this.analytenew = respZ.desanalytes)
              )
            ),
            switchMap(Z => this.unidadeservice.getByIdAsync2(nuevaData.idunits)
              .pipe(
                tap((respZ: any) => this.unitnew = respZ.desunits)
              )
            ),
            switchMap(Z => this.configuracionObjetivosAnalitoService.create(nuevaData))
          )

          .subscribe({
            next:(resp: any) => {
              this.loadData();
              this.toastr.success('Registro creado');
              this.desactivar = false;
  
              const Loguser = {
                Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
                hora: this.datePipe.transform(Date.now(), "shortTime"),
                Modulo: 'Control Calidad Interno',
                Submodulo: 'Administración',
                Item: 'Metas de calidad por test',
                Metodo: 'creación',
                Datos: ('Analito: ' + this.analytenew + '|Fuente: ' + this.sourcenew + '|unidad: ' + this.unitnew + '|ETMP: '+ nuevaData.etmp + '|SESGOMP: ' + nuevaData.sesgomp  + '|Nivel: ' + nuevaData.level),
                Respuesta: JSON.stringify(resp),
                TipoRespuesta: 200,
                Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
              }
  
              this.configuracionObjetivosAnalitoService.createLogAsync(Loguser).then(respuesta => { });
              resolve(true)
            },error:(err) => {
              this.desactivar = false;
              const Loguser = {
                Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
                hora: this.datePipe.transform(Date.now(), "shortTime"),
                Modulo: 'Control Calidad Interno',
                Submodulo: 'Administración',
                Item: 'Metas de calidad por test',
                Metodo: 'creación',
                Datos: ('Analito: ' + this.analytenew + '| ' + this.sourcenew + '| ' + this.unitnew + '| '+ nuevaData.etmp + '| ' + nuevaData.sesgomp  + '| ' + nuevaData.level),
                respuesta: err.message,
                tipoRespuesta: err.status,
                Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
              }
              this.configuracionObjetivosAnalitoService.createLogAsync(Loguser).then(respuesta => { });
              errPr(false);
                
            }
          });
      }, 500);
    })
  }

  async crearEditarConfiObj() {

    let nomIdsource = this.formaRegistroConfiObj.get('idsource').value
    let nomIdunits = this.formaRegistroConfiObj.get('idunits').value
    let nuevaData = this.formaRegistroConfiObj.value;
    let arrrsources = this.fuentesActive.sort((a, b) => {
      a.dessource = a.dessource.charAt(0).toLowerCase() + a.dessource.slice(1);
      b.dessource = b.dessource.charAt(0).toLowerCase() + b.dessource.slice(1);

    })
    arrrsources.sort((a, b) => {
      if (a.dessource < b.dessource) return -1;
      if (a.dessource > b.dessource) return 1;
      return 0;
    })

    arrrsources.filter(result => {
      if (result.dessource.toLowerCase() === nomIdsource.toLowerCase()) {
        nuevaData.idsource = result.idsource;
        return
      }
      return
    })

    let arrrunits = this.unidadesActive.sort((a, b) => {
      a.desunits = a.desunits.charAt(0).toLowerCase() + a.desunits.slice(1);
      b.desunits = b.desunits.charAt(0).toLowerCase() + b.desunits.slice(1);

    })
    arrrunits.sort((a, b) => {
      if (a.desunits < b.desunits) return -1;
      if (a.desunits > b.desunits) return 1;
      return 0;
    })

    arrrunits.filter(result => {
      if (result.desunits.toLowerCase() === nomIdunits.toLowerCase()) {
        nuevaData.idunits = result.idunits;
        return
      }
      return
    })

    let _iddianavalue;

    if (!this.formaRegistroConfiObj.invalid) {
      if (this.accion === 'Crear') {
        
        let idSource = nuevaData.idsource;
        var idtest = nuevaData.idTest;

        const data = this.dataSource.data.findIndex(e => e.Idsource == idSource && e.Level == nuevaData.level);

        await this.configuracionObjetivosAnalitoService.getmetascalidadxtest(idtest).then(respuesta => {

          respuesta.forEach(item => {
            if (item.Level == nuevaData.level) {
              
              this.banderacreate = false;
            }
          });

          if (this.banderacreate == false) {
            this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.VALIDCREATEOBJETIVO'));
          }
        }).catch(error => {
          this.banderacreate = true;
        });

        this.banderacreate = true;

        if (this.banderacreate == true) {

          if (data == -1) {

            if (nuevaData.level > this.leveltest) {

              this.accion = 'noDatos';
              this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.VALIDLEVELTEST'));
            }
            else
            {
              let idanalyte;
              await this.TestsService.getByIdAsync(nuevaData.idTest).then((test: any) => {
                idanalyte = test.idanalytes;
              });

              await this.precargaService.obtenerPrecargaPorFuenteAnalitoAsync(nuevaData.idsource,idanalyte).then((data:any) => {

                data.forEach(element => {

                  //if(element.Leveltest == nuevaData.level)
                  //{
                    if(element.Active)
                    {
                      const Preloadanalyte={
                        idsource: element.IdSource,
                        idtest: nuevaData.idTest,
                        idunits: element.IdUnits,
                        etmp: element.Etmp,
                        sesgomp: element.Sesgomp,
                        cvmp: element.Cvmp,
                        userid:nuevaData.userid,
                        datemod: element.Datemod,
                        level: nuevaData.level,
                        active: element.Active

                      }
                      this.FnCreatePreloadMetLog(Preloadanalyte);
                    }
                  //}
                });
              }).catch(error => {
                this.FnCreateLog(nuevaData);
              })
              this.desactivar = true;
            }
          }
        }
      }
    }
  }

  FnEditLog(nuevaData: any) {

    return new Promise((resolve, errPr) => {
      setTimeout(() => {
        this.fuentesService.getByIdAsync2(nuevaData.idsource)
          .pipe(
            tap((X: any) => {
              this.sourcenew = X.dessource;
            }),
            switchMap(Y => this.TestsService.getByIdAsync2(nuevaData.idTest)
              .pipe(
                tap((respY: any) => this.idanalytenew = respY.idanalytes)
              )
            ),
            switchMap(Z => this.analitosService.getByIdAsync2(this.idanalytenew)
              .pipe(
                tap((respZ: any) => this.analytenew = respZ.desanalytes)
              )
            ),
            switchMap(Z => this.unidadeservice.getByIdAsync2(nuevaData.idunits)
              .pipe(
                tap((respZ: any) => this.unitnew = respZ.desunits)
              )
            ),
            switchMap(Z => this.configuracionObjetivosAnalitoService.update(nuevaData, nuevaData.idconfobjquaanalyte))
          )
          .subscribe({
            next:(resp: any) => {
                
              this.valoresDianaService.getDianaValueByObj(nuevaData.idconfobjquaanalyte).subscribe((res: any) => {
  
                let _iddianavalue = res.iddianavalue;
                const dianacalculate = 30;
                const leveltest = res.level;
                const idheadquaerters = this.dataTest.idheadquarters;
                const idanalyzer = this.dataTest.idAnalyzer;
                const idcontrolmaterial = this.dataTest.idControlMaterial;
                const idlot = this.dataTest.idLot;
                const idanalyte = this.dataTest.idanalytes;
                const dianavaluepropia = res.dianavalue;
                const idTest = this.test;
  
                this.valoresDianaService.getLimitesByDianaPropia(this.today, dianacalculate, leveltest, idTest, dianavaluepropia).subscribe((res: any) => {
  
                  const lowlimit = res.lowlimit;
                  const upperlimit = res.upperlimit;
  
                  this.valoresDianaService.getByIdAsync(_iddianavalue).then((res: any) => {
                    const dianaValuesObj = {
                      iddianavalue: _iddianavalue,
                      idDianacalculate: res.idDianacalculate,
                      idconfobjquaanalyte: res.idconfobjquaanalyte,
                      level: res.level,
                      dianavalue: res.dianavalue,
                      lowlimit: lowlimit,
                      upperlimit: upperlimit,
                      active: res.active
                    }
  
                    this.valoresDianaService.update(dianaValuesObj, _iddianavalue).subscribe(res => {
                      this.toastr.success('Limite Interior y Superior Actualizados');
                    });
                  });
                }, (error) => {
                  this.toastr.error('Configurar objetivo de calidad para el nivel seleccionado');
                });
              });
              
              this.loadData();
              this.toastr.success('Registro actualizado');
  
              const Loguser = {
                Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
                hora: this.datePipe.transform(Date.now(), "shortTime"),
                Modulo: 'Control Calidad Interno',
                Submodulo: 'Administración',
                Item: 'Metas de calidad por test',
                Metodo: 'actualización',
                Datos: ('Analito: ' + this.analytenew + '|Fuente: ' + this.sourcenew + '|unidad: ' + this.unitnew + '|ETMP: '+ nuevaData.etmp + '|SESGOMP: ' + nuevaData.sesgomp  + '|Nivel: ' + nuevaData.level),
                DatosAnteriores: ('Analito: ' + this.analyteant + '|Fuente: ' + this.sourceant + '|unidad: ' + this.unitant + '|ETMP: '+ this.etmpant + '|SESGOMP: ' + this.sesgompant  + '|Nivel: ' + this.levelant),
                Respuesta: JSON.stringify(resp),
                TipoRespuesta: 200,
                Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
              }
  
              this.configuracionObjetivosAnalitoService.createLogAsync(Loguser).then(respuesta => { });
              resolve(true)
            },error:(err) => {
              if (err.status === 400) {
                this.toastr.error(err.error);
              } else {
                this.toastr.error('Ocurrió un error inesperado.');
              }
  
              const Loguser = {
                Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
                Hora: this.datePipe.transform(Date.now(), "shortTime"),
                Modulo: 'Control Calidad Interno',
                Submodulo: 'Administración',
                Item: 'Test',
                Metodo: 'actualización',
                Datos: ('Analito: ' + this.analytenew + '|Fuente: ' + this.sourcenew + '|unidad: ' + this.unitnew + '|ETMP: '+ nuevaData.etmp + '|SESGOMP: ' + nuevaData.sesgomp  + '|Nivel: ' + nuevaData.level),
                DatosAnteriores: ('Analito: ' + this.analyteant + '|Fuente: ' + this.sourceant + '|unidad: ' + this.unitant + '|ETMP: '+ this.etmpant + '|SESGOMP: ' + this.sesgompant  + '|Nivel: ' + this.levelant),
                Respuesta: JSON.stringify(nuevaData),
                respuesta: err.message,
                tipoRespuesta: err.status,
                Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
              }
              this.configuracionObjetivosAnalitoService.createLogAsync(Loguser).then(respuesta => {
              });
              errPr(false); 
            }
          });
      }, 500);
    })
  }

  FnEditPreLoadMetLog(nuevaData: any) {

    return new Promise((resolve, errPr) => {
      setTimeout(() => {
        this.fuentesService.getByIdAsync2(nuevaData.idsource)
          .pipe(
            tap((X: any) => {
              this.sourcenew = X.dessource;
            }),
            switchMap(Y => this.TestsService.getByIdAsync2(nuevaData.idtest)
              .pipe(
                tap((respY: any) => this.idanalytenew = respY.idanalytes)
              )
            ),
            switchMap(Z => this.analitosService.getByIdAsync2(this.idanalytenew)
              .pipe(
                tap((respZ: any) => this.analytenew = respZ.desanalytes)
              )
            ),
            switchMap(Z => this.unidadeservice.getByIdAsync2(nuevaData.idunits)
              .pipe(
                tap((respZ: any) => this.unitnew = respZ.desunits)
              )
            ),
            switchMap(Z => this.configuracionObjetivosAnalitoService.update(nuevaData, nuevaData.idconfobjquaanalyte))
          )
          .subscribe({
            next:(resp: any)=> {
              this.valoresDianaService.getDianaValueByObj(nuevaData.idconfobjquaanalyte).subscribe((res: any) => {
  
                let _iddianavalue = res.iddianavalue;
                const dianacalculate = 30;
                const leveltest = res.level;
                const idheadquaerters = this.dataTest.idheadquarters;
                const idanalyzer = this.dataTest.idAnalyzer;
                const idcontrolmaterial = this.dataTest.idControlMaterial;
                const idlot = this.dataTest.idLot;
                const idanalyte = this.dataTest.idanalytes;
                const dianavaluepropia = res.dianavalue;
                const idTest = this.test;
  
                this.valoresDianaService.getLimitesByDianaPropia(this.today, dianacalculate, leveltest, idTest, dianavaluepropia).subscribe((res: any) => {
  
                  const lowlimit = res.lowlimit;
                  const upperlimit = res.upperlimit;
  
                  this.valoresDianaService.getByIdAsync(_iddianavalue).then((res: any) => {
                    const dianaValuesObj = {
                      iddianavalue: _iddianavalue,
                      idDianacalculate: res.idDianacalculate,
                      idconfobjquaanalyte: res.idconfobjquaanalyte,
                      level: res.level,
                      dianavalue: res.dianavalue,
                      lowlimit: lowlimit,
                      upperlimit: upperlimit,
                      active: res.active
                    }
  
                    this.valoresDianaService.update(dianaValuesObj, _iddianavalue).subscribe(res => {
                      this.toastr.success('Limite Interior y Superior Actualizados');
                    });
                  });
                }, (error) => {
                  this.toastr.error('Configurar objetivo de calidad para el nivel seleccionado');
                });
              });
              this.loadData();
              this.toastr.success('Registro actualizado');
  
              const Loguser = {
                Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
                hora: this.datePipe.transform(Date.now(), "shortTime"),
                Modulo: 'Control Calidad Interno',
                Submodulo: 'Administración',
                Item: 'Metas de calidad por test',
                Metodo: 'actualización',
                Datos: ('Analito: ' + this.analytenew + '|Fuente: ' + this.sourcenew + '|unidad: ' + this.unitnew + '|ETMP: '+ nuevaData.etmp + '|SESGOMP: ' + nuevaData.sesgomp  + '|Nivel: ' + nuevaData.level),
                DatosAnteriores: ('Analito: ' + this.analyteant + '|Fuente: ' + this.sourceant + '|unidad: ' + this.unitant + '|ETMP: '+ this.etmpant + '|SESGOMP: ' + this.sesgompant  + '|Nivel: ' + this.levelant),
                Respuesta: JSON.stringify(resp),
                TipoRespuesta: 200,
                Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
              }
  
              this.configuracionObjetivosAnalitoService.createLogAsync(Loguser).then(respuesta => { });
              resolve(true)
                
            },error:(err) => {
              if (err.status === 400) {
                this.toastr.error(err.error);
              } else {
                this.toastr.error('Ocurrió un error inesperado.');
              }
  
              const Loguser = {
                Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
                Hora: this.datePipe.transform(Date.now(), "shortTime"),
                Modulo: 'Control Calidad Interno',
                Submodulo: 'Administración',
                Item: 'Test',
                Metodo: 'actualización',
                Datos: ('Analito: ' + this.analytenew + '|Fuente: ' + this.sourcenew + '|unidad: ' + this.unitnew + '|ETMP: '+ nuevaData.etmp + '|SESGOMP: ' + nuevaData.sesgomp  + '|Nivel: ' + nuevaData.level),
                DatosAnteriores: ('Analito: ' + this.analyteant + '|Fuente: ' + this.sourceant + '|unidad: ' + this.unitant + '|ETMP: '+ this.etmpant + '|SESGOMP: ' + this.sesgompant  + '|Nivel: ' + this.levelant),
                Respuesta: JSON.stringify(nuevaData),
                respuesta: err.message,
                tipoRespuesta: err.status,
                Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
              }
              this.configuracionObjetivosAnalitoService.createLogAsync(Loguser).then(respuesta => {
              });
              errPr(false);
                
            },
            
          });
      }, 500);
    })
  }

  async crearEditarConfiObjEdit() {

    let nomIdsource = this.formaRegistroConfiObjEdit.get('idsource').value
    let nomIdunits = this.formaRegistroConfiObjEdit.get('idunits').value
    let nuevaData = this.formaRegistroConfiObjEdit.value;
    let arrrsources = this.fuentesActive.sort((a, b) => {
      a.dessource = a.dessource.charAt(0).toLowerCase() + a.dessource.slice(1);
      b.dessource = b.dessource.charAt(0).toLowerCase() + b.dessource.slice(1);

    })
    arrrsources.sort((a, b) => {
      if (a.dessource < b.dessource) return -1;
      if (a.dessource > b.dessource) return 1;
      return 0;
    })

    arrrsources.filter(result => {
      if (result.dessource.toLowerCase() === nomIdsource.toLowerCase()) {
        nuevaData.idsource = result.idsource;
        return
      }
      return
    })

    let arrrunits = this.unidadesActive.sort((a, b) => {
      a.desunits = a.desunits.charAt(0).toLowerCase() + a.desunits.slice(1);
      b.desunits = b.desunits.charAt(0).toLowerCase() + b.desunits.slice(1);

    })
    arrrunits.sort((a, b) => {
      if (a.desunits < b.desunits) return -1;
      if (a.desunits > b.desunits) return 1;
      return 0;
    })

    arrrunits.filter(result => {
      if (result.desunits.toLowerCase() === nomIdunits.toLowerCase()) {
        nuevaData.idunits = result.idunits;
        return
      }
      return
    })
    let _iddianavalue;
    if (!this.formaRegistroConfiObjEdit.invalid) {


      if (this.accion === 'Crear') {
      } else {

        var idtest = this.formaRegistroConfiObjEdit.value.idTest;
        this.banderacreate = true;
        if (this.banderacreate = true) {
          let idanalyte;
              await this.TestsService.getByIdAsync(nuevaData.idTest).then((test: any) => {
                idanalyte = test.idanalytes;
              });

              await this.precargaService.obtenerPrecargaPorFuenteAnalitoAsync(nuevaData.idsource,idanalyte).then((data:any) => {

                data.forEach(element => {
                  if(element.Active)
                    {
                      const dataGF:any [] = this.unidadesActive;
                      let name = this.formaRegistroConfiObjEdit.get('idunits')?.value;
                      const Preloadanalyte={
                        idconfobjquaanalyte: nuevaData.idconfobjquaanalyte,
                        idsource: element.IdSource,
                        idtest: nuevaData.idTest,
                        idunits: dataGF.find(x => x.desunits ===  name).idunits,
                        etmp: this.formaRegistroConfiObjEdit.get('etmp')?.value,
                        sesgomp: this.formaRegistroConfiObjEdit.get('sesgomp')?.value,
                        cvmp: this.formaRegistroConfiObjEdit.get('cvmp')?.value,
                        userid:nuevaData.userid,
                        datemod: this.datePipe.transform(new Date, "yyyy-MM-dd"),
                        level: this.formaRegistroConfiObjEdit.get('level')?.value,
                        active: this.formaRegistroConfiObjEdit.get('active')?.value
                      }
                      this.FnEditPreLoadMetLog(Preloadanalyte);
                    }
                });
              }).catch(error => {
                this.FnEditLog(nuevaData);
              })
        }
      }
    }
  }

  actualizarConfiObjEstado(datosConfi:any) {
    const [data,estado ] = datosConfi;
    data.Active = estado
    const datosAnteriores = this.dataAnt.find(x => x.Idconfobjquaanalyte == data.Idconfobjquaanalyte);
    this.configuracionObjetivosAnalitoService.update(data, data.Idconfobjquaanalyte).subscribe({
      next:(value) => {
        this.loadData();
        this.accion = 'Editar';
        this.log.logObj('Control Calidad Interno', 'Administración', 'Metas de calidad por test', 'a', data, JSON.stringify(value), 200, this.datosAnt(datosAnteriores));
        this.toastr.success('Estado actualizado','Actualización');
      },error:(err) => {
        this.toastr.error('No fue posible actualizar el estado', 'Error')
        this.log.logObj('Control Calidad Interno', 'Administración', 'Metas de calidad por test', 'a', data, err.message, err.status, this.datosAnt(datosAnteriores));
      },
    });
  }

  datosAnt(data: any) {
    return ` Idconfobjquaanalyte: ${data.Idconfobjquaanalyte} - Datemod: ${data.Datemod} - Desanalytes: ${data.Desanalytes} - Dessource: ${data.Dessource} - Desunits: ${data.Desunits} - Cvmp: ${data.Cvmp} - Etmp: ${data.Etmp} - Sesgomp: ${data.Sesgomp} - Level: ${data.Level} - Active: ${!data.Active}`;
  }

  eliminarConfiAnalito(id: any) {
    let datosAnteriores = this.dataAnt.find(x => x.Idconfobjquaanalyte == id);
    this.configuracionObjetivosAnalitoService.delete('Confobjquaanalyte', id).subscribe({

      next:(respuesta) => {
        this.loadData();
        this.accion = '';
        this.toastr.success('Registro eliminado');
  
        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo: 'Control Calidad Interno',
          Submodulo: 'Administración',
          Item: 'Metas de calidad por test',
          metodo: 'eliminación',
          datos: JSON.stringify(id),
          DatosAnteriores: `${datosAnteriores.Idconfobjquaanalyte} | analito - ${datosAnteriores.Desanalytes}, fuente - ${datosAnteriores.Desanalytes}, unidad - ${datosAnteriores.Desunits}`,
          respuesta: JSON.stringify(respuesta),
          tipoRespuesta: 200,
          Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
        this.lotesService.createLogAsync(Loguser).then(respuesta => {
        });
      },error:(err) => {
        this.toastr.error(this.messageError);
        
        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo: 'Control Calidad Interno',
          Submodulo: 'Administración',
          Item: 'Metas de calidad por test',
          metodo: 'eliminación',
          datos: JSON.stringify(id),
          DatosAnteriores: `${datosAnteriores.Idconfobjquaanalyte} | analito - ${datosAnteriores.Desanalytes}, fuente - ${datosAnteriores.Desanalytes}, unidad - ${datosAnteriores.Desunits}`,
          respuesta: err.message,
          tipoRespuesta: err.status,
          Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
        this.lotesService.createLogAsync(Loguser).then(respuesta => {
        });
          
      },
    });
  }

  titulosSwal() {
    this.translate.get('MODULES.SWAL.MESAGEERROR').subscribe(respuesta => this.messageError = respuesta);
    this.translate.get('MODULES.SWAL.SINDATOS').subscribe(respuesta => this.messageSinDatos = respuesta);
    this.translate.get('MODULES.SWAL.TITULO_ERROR').subscribe(respuesta => this.titulo = `<b>${respuesta}</b>`);
    this.translate.get('MODULES.SWAL.TEXT3').subscribe(respuesta => this.text3 = respuesta);
    this.translate.get('MODULES.SWAL.SINDATOS').subscribe(respuesta => this.text2 = respuesta);
    this.translate.get('MODULES.SWAL.ACEPTAR').subscribe(respuesta => this.aceptar = respuesta);
    this.translate.get('MODULES.SWAL.OK').subscribe(respuesta => this.ok = `<b>${respuesta}</b>`);

  }

  closeVentana(): void {
    if(this.ventanaModal){
      this.ventanaModal.hide();
    }
  }

  async materialControl(id: any) {
    this.formaBuscarDatos.controls['numMaterialControl'].setValue('');
    this.formaBuscarDatos.controls['numLote'].setValue('');

    lastValueFrom(this.sedesService.gebByIdSeccionMateriasSedeControl(id, this.sedeId)).then((data: any) => {
      if (data.length > 0) {
        this.controlMaterialActive = data;
        this.controlMaterialActive = this.controlMaterialActive.filter(e => e.Active == true);

        this.lotesActive = [];

      }
    }).catch(e => this.controlMaterialActive = []);
  }

  async lotesFun(id: any) {

    this.formaBuscarDatos.controls['numLote'].setValue('');
    this.sedesService.gebByIdMaterialSedeLote(id, this.sedeId).then((data: any) => {

      if (data.length > 0) {
        this.lotesActive = data;
        this.lotesActive = this.lotesActive.filter(e => e.Active == true);
      }
    }).catch(e =>this.lotesActive = []);
  }

  async cambioDeFuente(data:any,event:any,num:number){
    if (event.isUserInput) {
      await this.precargaService.obtenerPrecargaPorFuenteAnalitoAsync(data.idsource,this.dataTest.idanalytes).then((data:any) => {

        const dataGF:any [] = this.unidadesActive;
        if(num===1){
          this.formaRegistroConfiObj.get('idunits').setValue( dataGF.find(x => x.idunits ===  data[0].IdUnits).desunits);
          this.formaRegistroConfiObj.get('etmp').setValue( data[0].Etmp);
          this.formaRegistroConfiObj.get('cvmp').setValue( data[0].Cvmp);
          this.formaRegistroConfiObj.get('sesgomp').setValue( data[0].Sesgomp);
          this.formaRegistroConfiObj.get('level').setValue( data[0].Leveltest);
          this.formaRegistroConfiObj.get('active').setValue( data[0].Active);
          return
        }
        this.formaRegistroConfiObjEdit.get('idunits').setValue(dataGF.find(x => x.idunits ===  data[0].IdUnits).desunits);
        this.formaRegistroConfiObjEdit.get('etmp').setValue(data[0].Etmp);
        this.formaRegistroConfiObjEdit.get('cvmp').setValue(data[0].Cvmp);
        this.formaRegistroConfiObjEdit.get('sesgomp').setValue(data[0].Sesgomp);
        this.formaRegistroConfiObjEdit.get('level').setValue(data[0].Leveltest);
        this.formaRegistroConfiObjEdit.get('active').setValue(data[0].Active);
      }).catch(error => {
        if(num===1){
          this.formaRegistroConfiObj.get('idunits').setValue('');
          this.formaRegistroConfiObj.get('etmp').setValue('');
          this.formaRegistroConfiObj.get('cvmp').setValue('');
          this.formaRegistroConfiObj.get('sesgomp').setValue('');
          this.formaRegistroConfiObj.get('level').setValue('');
          this.formaRegistroConfiObj.get('active').setValue('');
          return
        }
        this.formaRegistroConfiObjEdit.get('idunits').setValue('');
        this.formaRegistroConfiObjEdit.get('etmp').setValue('');
        this.formaRegistroConfiObjEdit.get('cvmp').setValue('');
        this.formaRegistroConfiObjEdit.get('sesgomp').setValue('');
        this.formaRegistroConfiObjEdit.get('level').setValue('');
        this.formaRegistroConfiObjEdit.get('active').setValue('');
      })
    }

  }
}
