import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SharedService } from '@app/services/shared.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
import { VentanasModalesService } from '@app/services/general/ventanas-modales.service';
import { DatePipe, NgFor, NgIf, NgClass, AsyncPipe, TitleCasePipe } from '@angular/common';
import { ValoresDianaService } from '@app/services/configuracion/valores-diana.service';
import { LogsService } from '@app/services/configuracion/logs.service';
import { LotesService } from '@app/services/configuracion/lotes.service';
import { PublicService } from '@app/services/public.service';
import { ControlMaterialService } from '@app/services/configuracion/materialescontrol.service';
import { ConfiguracionObjetivosAnalitoService } from '@app/services/configuracion/configuracion-objetivos-analito.service';
import { TestsService } from '@app/services/configuracion/test.service';
import { AnalitosService } from '@app/services/configuracion/analitos.service';
import Swal from 'sweetalert2';
import { AppConstants } from '@app/Constants/constants';
import { ReportesService } from '@app/services/configuracion/reportes.service';
import { DianaCalculateService } from '@app/services/configuracion/diana-calculate.service';
import { SeccionesService } from '@app/services/configuracion/secciones.service';
import { ToastrService } from 'ngx-toastr';
import { SedesService } from '../../../../../../services/configuracion/sedes.service';
import { catchError, map, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { ImageCdnPipe } from '../../../../../core/pipes/image-cdn.pipe';
import { NombreSeccionPipe } from '../../../../../shared/pipe/nombre-seccion.pipe';
import { NombreControlmaterialPipe } from '../../../../../shared/pipe/nombre-contmat.pipe';
import { NombreLotePipe } from '../../../../../shared/pipe/nombre-lote.pipe';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TablaComunComponent } from '@app/modules/shared/general-tablas/tabla-comun/tabla-comun.component';
import { MatDialog } from '@angular/material/dialog';
import { ModalData } from '@app/Models/Modaldata';
import { ModalGeneralComponent } from '@app/modules/shared/modals/modal-general/modal-general.component';
import { LoaderService } from '@app/services/loader/loader.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NombreTestPipe } from "../../../../../shared/pipe/nombre-test.pipe";
import { createLog } from '@app/globals/logUser';

@Component({
    selector: 'app-valores-diana',
    templateUrl: './valores-diana.component.html',
    styleUrls: ['./valores-diana.component.css'],
    standalone: true,
    imports: [FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    NgFor,
    NgIf,
    MatInputModule,
    MatAutocompleteModule,
    MatTooltipModule,
    NgClass,
    MatTableModule,
    MatSortModule,
    MatSlideToggleModule,
    MatPaginatorModule,
    MatDatepickerModule,
    AsyncPipe,
    TitleCasePipe,
    TranslateModule,
    NombreLotePipe,
    NombreControlmaterialPipe,
    NombreSeccionPipe,
    ImageCdnPipe,
    TablaComunComponent,
    NgxMatSelectSearchModule, NombreTestPipe]
})
export class ValoresDianaComponent implements OnInit {

  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();
  formularioRegistroEditar: FormGroup;
  accionEditar: any;
  tituloAccion: any;
  accion: any;
  vantanaModal: BsModalRef;
  titulo: any;
  text: any;
  textError: any;
  cancelar: any;
  confirmar: any;
  messageError: any;
  ok: string;
  formaBuscarDatos: FormGroup;
  hidden: boolean = false;
  messageSinDatos: string;
  messageAlerta: string;
  messageobj:string;
  dianavalue: any;
  limitlow: any;
  limitUpper: any;
  datosEnvio: any;
  test: number;
  aceptar: string = '';
  text2: string = '';
  text4: string = '';
  ver: boolean = undefined;
  verBtn: boolean = false;
  lab: number;
  sec: number;
  mat: number;
  lote: number;
  show: boolean = false;

  sedes = [];
  sedesActive = [];
  sedesActiveFilter = [];
  secciones = [];
  seccionesActive = [];
  controlMaterial = [];
  controlMaterialActive = [];
  lotes = [];
  lotesActive = [];
  arrayTipo = [];
  arrayTipoActive = [];
  tests = [];
  sedeId:number = 0;
  habilitarSede:boolean = false;

  //predictivos
  filteredOptionsSections: Observable<string[]>;
  filteredOptionsControlmaterial: Observable<string[]>;
  filteredOptionsLots: Observable<string[]>;
  filteredOptionsTest: Observable<string[]>;

  listsectionspr:any;
  idsectionspr:number;
  listcontrolmanterialpr:any;
  idcontrolmaterialpr:number;
  listlotspr:any;
  idlotspr:number;

  //trazabilidad
  idtestnew:any;
  analytenew:any;
  analyteant:any;
  idanalytenew:any;
  levelnew:any;
  levelant:any;
  dianavalueant:any;
  lowlimitant:any;
  upperlimitant:any;
  filterHeadquarters = new FormControl('');
  dataAnt: any;
  log = new createLog(this.datePipe, this.translate, this.dianaCalculateService);

  constructor(

    private translate: TranslateService,
    private publicService: PublicService,
    private seccionesService: SeccionesService,
    private controlMaterialService: ControlMaterialService,
    private lotesService: LotesService,
    private valoresDianaService: ValoresDianaService,
    private configuracionObjetivosAnalitoService: ConfiguracionObjetivosAnalitoService,
    private logsService: LogsService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private modalService: BsModalService,
    private sharedService: SharedService,
    private ventanaService: VentanasModalesService,
    private datePipe: DatePipe,
    private reportesService: ReportesService,
    private dianaCalculateService: DianaCalculateService,
    private sedesService: SedesService,
    private TestsService: TestsService,
    private analitosService: AnalitosService,
    private dialog: MatDialog,
    private loader: LoaderService
  ) { }

  displayedColumns: string[] = ['Analito', 'Nivel', 'Objetivo de calidad', 'Limite inferior', 'Limite superior', 'Estado', 'Editar', 'Eliminar'];
  dataSource: MatTableDataSource<any>;
  dataTableBody:any[]=[];

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  ngOnInit(): void {

    this.crearFormularioBuscarDatos();
    this.cargarSedes();
    this.cargarSecciones();
    this.cargarSeccionesPre();
    /*this.cargarControlMaterial();
    this.cargarLotes();*/
    this.sharedService.customTextPaginator(this.paginator);
    this.cargarDianaCalculate();
    this.titulosSwal();
    //this.search();

    this.sedeId = JSON.parse(sessionStorage.getItem('sede'));

    if (this.sedeId > 0)

    {
     this.formaBuscarDatos.controls['numLaboratorio'].setValue(this.sedeId);
    this.habilitarSede =  true
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

  private _filterSections(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.listsectionspr
              .filter(seccion =>
                seccion.namesection.toLowerCase().includes(filterValue)).filter(e=>e.Active == true)

  }

  private _filterControlMaterial(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.listcontrolmanterialpr
              .filter(contmat =>
                contmat.descontmat.toLowerCase().includes(filterValue)).filter(e=>e.Active == true)

  }

  private _filterLots(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.listlotspr
              .filter(lots =>
                lots.Numlot.toLowerCase().includes(filterValue)).filter(e=>e.Active == true)

  }

  private _filterTest(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.tests.filter(test => test.value.toLowerCase().includes(filterValue));
  }

  async cargarSeccionesPre() {
    await this.seccionesService.getAllAsyncSecciones().then(data => {
      this.listsectionspr = data.filter(e => e.Active == true);


      this.listsectionspr.sort((a:any, b:any) => {
        a.namesection =   a.namesection.charAt(0) +  a.namesection.slice(1);
        b.namesection =  b.namesection.charAt(0) +  b.namesection.slice(1);
      })

      this.listsectionspr.sort((a:any, b:any) => {
        if(a.namesection < b.namesection) return -1;
        if(a.namesection > b.namesection) return  1;
        return 0;
      })

      this.filteredOptionsSections = this.formaBuscarDatos.get('seccion').valueChanges.pipe(
        startWith(''),
        map(value =>{

          return this._filterSections(value)
        }),
      );
    });
  }

  async cambiarSeccion(NombreSeccion: string,idsection?:number){

    var namesection0 = this.formaBuscarDatos.get('seccion').setValue(NombreSeccion.split('|')[1]);
    var idsection0 = NombreSeccion.split('|')[0];
    this.idsectionspr = Number(idsection0);

    this.formaBuscarDatos.controls['numMaterialControl'].setValue('');
    this.formaBuscarDatos.controls['numLote'].setValue('');
      this.formaBuscarDatos.get('idtest').setValue('');

    await this.controlMaterialService.getAllAsyncControlMaterialxsedesec(this.idsectionspr,this.sedeId).then(data => {
      this.listcontrolmanterialpr = data.filter(e => e.Active == true);


      this.listcontrolmanterialpr.sort((a:any, b:any) => {
        a.descontmat =   a.descontmat.charAt(0) +  a.descontmat.slice(1);
        b.descontmat =  b.descontmat.charAt(0) +  b.descontmat.slice(1);
      })

      this.listcontrolmanterialpr.sort((a:any, b:any) => {
        if(a.descontmat < b.descontmat) return -1;
        if(a.descontmat > b.descontmat) return  1;
        return 0;
      })

      this.filteredOptionsControlmaterial = this.formaBuscarDatos.get('numMaterialControl').valueChanges.pipe(
        startWith(''),
        map(value =>{

          return this._filterControlMaterial(value)
        }),
      );
    });

  }

  async cambiarControlMaterial(NombreControlmaterial: string,idcontrolmaterial?:number){

    var descontmat001 = this.formaBuscarDatos.get('numMaterialControl').setValue(NombreControlmaterial.split('|')[1]);
    var idcontmat = NombreControlmaterial.split('|')[0];
    this.idcontrolmaterialpr = Number(idcontmat);

  if (idcontmat != '') {

    this.formaBuscarDatos.get('numLote').reset('');
      this.formaBuscarDatos.get('idtest').setValue('');

    //let id: number = parseInt(idcontmat);

    await this.lotesService.getAllAsynclotsxsedecontm(this.idcontrolmaterialpr,this.sedeId).then(data => {
      this.listlotspr = data.filter(e => e.Active == true);

      this.listlotspr.sort((a:any, b:any) => {
        a.Numlot =   a.Numlot.charAt(0) +  a.Numlot.slice(1);
        b.Numlot =  b.Numlot.charAt(0) +  b.Numlot.slice(1);
      })

      this.listlotspr.sort((a:any, b:any) => {
        if(a.Numlot < b.Numlot) return -1;
        if(a.Numlot > b.Numlot) return  1;
        return 0;
      })

      this.filteredOptionsLots = this.formaBuscarDatos.get('numLote').valueChanges.pipe(
        startWith(''),
        map(value =>{
          return this._filterLots(value)
        }),
      );
    });
  } else {

    this.lotesActive = [];
    this.formaBuscarDatos.get('numLote').setValue('');

  }


  }

  async lotesPre(nombreLote: string)
  {

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
      this.formaBuscarDatos.get('idtest').setValue('');

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

    this.valoresDianaService.getTestFiltroDianaValues(this.sedeId, this.idsectionspr, this.idcontrolmaterialpr, this.idlotspr).subscribe(response => {

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

  async cargarDianaCalculate() {

    this.arrayTipo = await this.dianaCalculateService.getAllAsync();
    this.arrayTipoActive = this.arrayTipo.filter(e => e.active);
    this.arrayTipoActive.splice(3, 1); // devuelve ['dos']
    this.arrayTipoActive.splice(4, 1); // devuelve ['dos']

  }

  async cargarSedes() {
    this.sedes = await this.publicService.obtenerSedes();
    this.sedesActive = this.sedes.filter(e => e.active == true);
    this.sedesActiveFilter = this.sedes.filter(e => e.active == true);

  }

  async cargarSecciones() {
    this.secciones = await this.seccionesService.getAllAsync();
    this.seccionesActive = this.secciones.filter(e => e.active == true);

  }

  get mesNoValido() {
    return this.formularioRegistroEditar.get('idDianacalculate');
  }
  get fechaInicioNoValido() {
    return this.formularioRegistroEditar.get('fechaInicio');
  }
  get fechaFinNoValido() {
    return this.formularioRegistroEditar.get('fechaFin');
  }
  get stringDianaNoValido() {
    return this.formularioRegistroEditar.get('stringDiana');
  }
  get DianaNoValido() {
    return this.formularioRegistroEditar.get('dianavalue');
  }

  crearFormulario(datos: any) {

    this.formularioRegistroEditar = this.fb.group({

      iddianavalue: [datos.Iddianavalue],
      idconfobjquaanalyte: [datos.Idconfobjquaanalyte],
      idDianacalculate: ['', [Validators.required]],
      fechaInicio: [''],
      fechaFin: [''],
      stringDiana: [''],
      level: [datos.Level ? datos.Level : '', [Validators.required, Validators.min(1), Validators.max(3)]],
      dianavalue: [datos.Dianavalue ? datos.Dianavalue : ''],
      lowlimit: [datos.Lowlimit ? datos.Lowlimit : 0],
      upperlimit: [datos.Upperlimit ? datos.Upperlimit : 0],
      active: [datos.Active ? datos.Active : false],
      idanalyte: [datos.Idanalytes],
      idanalyzer: [datos.IdAnalyzer]

    });

    if (this.mesNoValido.value === 5) {

      this.hidden = true;
      this.fechaInicioNoValido.setValidators([Validators.required]);
      this.fechaFinNoValido.setValidators([Validators.required]);

    } else {
      this.fechaInicioNoValido.clearValidators();
      this.fechaFinNoValido.clearValidators();
      this.hidden = false;

    }

    if (this.mesNoValido.value === 7) {

      this.show = true;
      this.DianaNoValido.setValidators([Validators.required]);

    } else {
      this.fechaInicioNoValido.clearValidators();
      this.fechaFinNoValido.clearValidators();
      this.hidden = false;
    }
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
        this.controlMaterialActive = this.controlMaterial.filter(e => e.active);
        this.formaBuscarDatos.get('numMaterialControl').reset('');
        this.formaBuscarDatos.get('numLote').reset('');

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

    this.formaBuscarDatos.get('numLote').valueChanges.subscribe(data => {

      if (data != '') {
        this.ver = false;
        const { numLaboratorio, seccion, numMaterialControl } = this.formaBuscarDatos.value;
        this.lab = parseInt(numLaboratorio);
        this.sec = parseInt(seccion);
        this.mat = parseInt(numMaterialControl);
        this.lote = parseInt(data);

        this.valoresDianaService.getTestFiltroDianaValues(this.lab, this.sec, this.mat, this.lote).subscribe(response => {

          this.tests = [];
          this.verBtn = false;
          this.tests = response;
          this.formaBuscarDatos.get('idtest').setValue('');

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
    });
  }

  setTest(test: any) {
    this.formaBuscarDatos.controls['idtest'].setValue(test.split(',')[1]);
    let id = test.split(',')[0];
    if (id !== '' || null || undefined) {
      this.test = parseInt(id);
      this.verBtn = true;
    } else {
      this.verBtn = false;
    }
  }

  loadData() {

    this.loader.show();
    this.ver = false;

    this.valoresDianaService.getBuscadorConfiDianaValue(this.test).then(respuesta => {

      let firstLvl1 = respuesta.find(data => data.Level == 1);
      let firstLvl2 = respuesta.find(data => data.Level == 2);
      let firstLvl3 = respuesta.find(data => data.Level == 3);

      let data = [];
      if (firstLvl1 != undefined) {
        data.push(firstLvl1);
      }
      if (firstLvl2 != undefined) {
        data.push(firstLvl2);
      }
      if (firstLvl3 != undefined) {
        data.push(firstLvl3);
      }
      const filtrarDataTable: any[] = respuesta;
      this.dataAnt = respuesta;
      
      this.dataTableBody = filtrarDataTable.map( x =>  {
        return { Analito:x.Desanalytes,Nivel:x.Level,'Objetivo de calidad':x.Dianavalue,'Limite inferior':x.Lowlimit,
               'Limite superior':x.Upperlimit,Estado:x.Active, item: x, item7:x,item8:x  };
      });

      this.dataSource = new MatTableDataSource(data);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;

      setTimeout(() => {

        this.loader.hide();
        this.ver = true;

      }, 3000);

    }).catch(error => {

      this.ver = true;
      this.dataSource = new MatTableDataSource([]);
      this.accion = 'noDatos';
      this.toastr.error('No se encontraron datos');
      this.loader.hide();

    });

  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  async FnCreateLog(nuevaData) {
    return new Promise((resolve, errPr) => {
      setTimeout(() => {
        this.configuracionObjetivosAnalitoService.getByIdAsync2(nuevaData.idconfobjquaanalyte)
          .pipe(
            tap((X: any) => {
              this.idtestnew = X.idtest;
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
            switchMap(Z => this.valoresDianaService.create(nuevaData))
          )

          .subscribe((resp: any) => {
  
            this.loadData();
            this.toastr.success('Registro creado');

            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo: 'Control Calidad Interno',
              Submodulo: 'Administración',
              Item: 'Objetivos de Calidad',
              Metodo: 'creación',
              Datos: ('Analito: ' + this.analytenew + '|Obj.calidad: ' + nuevaData.dianavalue + '|LimiteInf: ' + nuevaData.lowlimit + '|LimiteSup: '+ nuevaData.upperlimit + '|Nivel: ' + nuevaData.level),
              Respuesta: JSON.stringify(resp),
              TipoRespuesta: 200,
              Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }

            this.valoresDianaService.createLogAsync(Loguser).then(respuesta => { });
            resolve(true)
          }, err => {

            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo: 'Control Calidad Interno',
              Submodulo: 'Administración',
              Item: 'Objetivos de Calidad',
              Metodo: 'creación',
              Datos: ('Analito: ' + this.analytenew + '|Obj.calidad: ' + nuevaData.dianavalue + '|LimiteInf: ' + nuevaData.lowlimit + '|LimiteSup: '+ nuevaData.upperlimit + '|Nivel: ' + nuevaData.level),
              respuesta: err.message,
              tipoRespuesta: err.status,
              Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }
            this.valoresDianaService.createLogAsync(Loguser).then(respuesta => { });
            errPr(false);
          });
      }, 500);
    })
  }

  FnEditLog(nuevaData: any) {

    return new Promise((resolve, errPr) => {
      setTimeout(() => {
        this.configuracionObjetivosAnalitoService.getByIdAsync2(nuevaData.idconfobjquaanalyte)
          .pipe(
            tap((X: any) => {
              this.idtestnew = X.idTest;
            }),
            switchMap(Y => this.TestsService.getByIdAsync2(this.idtestnew)
              .pipe(
                tap((respY: any) => this.idanalytenew = respY.idanalytes)
              )
            ),
            switchMap(Z => this.analitosService.getByIdAsync2(this.idanalytenew)
              .pipe(
                tap((respZ: any) => this.analytenew = respZ.desanalytes)
              )
            ),

            switchMap(Z => this.valoresDianaService.update(nuevaData, nuevaData.iddianavalue))
          )
          .subscribe((resp: any) => {
  
            this.loadData();
            this.toastr.success('Registro actualizado');

            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo: 'Control Calidad Interno',
              Submodulo: 'Administración',
              Item: 'Objetivos de Calidad',
              Metodo: 'actualización',
              Datos: ('Analito: ' + this.analytenew + '|Obj.calidad: ' + nuevaData.dianavalue + '|LimiteInf: ' + nuevaData.lowlimit + '|LimiteSup: '+ nuevaData.upperlimit + '|Nivel: ' + nuevaData.level),
              DatosAnteriores: ('Analito: ' + this.analyteant + '|Obj.calidad: ' + this.dianavalueant + '|LimiteInf: ' + this.lowlimitant + '|LimiteSup: '+ this.upperlimitant + '|Nivel: ' + this.levelant),
              Respuesta: JSON.stringify(resp),
              TipoRespuesta: 200,
              Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }

            this.configuracionObjetivosAnalitoService.createLogAsync(Loguser).then(respuesta => { });
            resolve(true)
          }, error => {
            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo: 'Control Calidad Interno',
              Submodulo: 'Administración',
              Item: 'Objetivos de Calidad',
              Metodo: 'actualización',
              Datos: ('Analito: ' + this.analytenew + '|Obj.calidad: ' + nuevaData.dianavalue + '|LimiteInf: ' + nuevaData.lowlimit + '|LimiteSup: '+ nuevaData.upperlimit + '|Nivel: ' + nuevaData.level),
              DatosAnteriores: ('Analito: ' + this.analyteant + '|Obj.calidad: ' + this.dianavalueant + '|LimiteInf: ' + this.lowlimitant + '|LimiteSup: '+ this.upperlimitant + '|Nivel: ' + this.levelant),
              Respuesta: JSON.stringify(nuevaData),
              respuesta: error.message,
              tipoRespuesta: error.status,
              Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }
            this.configuracionObjetivosAnalitoService.createLogAsync(Loguser).then(respuesta => {
            });
            errPr(false);
          });
      }, 500);
    })
  }

  async crearEditar() {
    if (this.formularioRegistroEditar.status === 'VALID') {
      if (this.accion === 'Crear') {
        this.FnCreateLog(this.formularioRegistroEditar.value);

      } else {

        if (this.mesNoValido.value === 1 || this.mesNoValido.value === 3) {
          this.dianavalue = this.dianavalue ? this.dianavalue : this.formularioRegistroEditar.value.dianavalue;
          this.limitlow = this.limitlow ? this.limitlow : this.formularioRegistroEditar.value.lowlimit;
          this.limitUpper = this.limitUpper ? this.limitUpper : this.formularioRegistroEditar.value.upperlimit;
        }
        if (this.mesNoValido.value === 5) {

          try {
            const mediaF = 'dianavalue';
            const medialimite = 'limitesrangofecha';
            const respuesta = await this.getVaribles(mediaF);
            const resplimites = await this.getVaribles(medialimite);
            this.dianavalue = respuesta.dianavalue;
            this.limitlow = resplimites.lowlimit ;
            this.limitUpper = resplimites.upperlimit;

          } catch (err) {
            this.toastr.info(this.translate.instant( `${this.messageSinDatos}`));

            return;
          }
          this.dianavalue = this.dianavalue ? this.dianavalue : this.formularioRegistroEditar.value.dianavalue
          this.limitlow = this.limitlow ? this.limitlow : this.formularioRegistroEditar.value.lowlimit;
          this.limitUpper = this.limitUpper ? this.limitUpper : this.formularioRegistroEditar.value.upperlimit;

        }
        if (this.mesNoValido.value === 2) {
          this.dianavalue = this.dianavalue ? this.dianavalue : this.formularioRegistroEditar.value.dianavalue;
          this.limitlow = this.limitlow ? this.limitlow : this.formularioRegistroEditar.value.lowlimit;
          this.limitUpper = this.limitUpper ? this.limitUpper : this.formularioRegistroEditar.value.upperlimit;

        }
        if (this.mesNoValido.value === 'estadoArte') {
          this.dianavalue = this.formularioRegistroEditar.value.dianavalue;
          this.limitlow = this.formularioRegistroEditar.value.lowlimit;
          this.limitUpper = this.formularioRegistroEditar.value.upperlimit;
        }
        if (this.mesNoValido.value == 7) {

          try {

            const respuesta = await this.getVarMediaPropia();
            this.dianavalue = respuesta.dianavalue;
            this.dianavalue = this.formularioRegistroEditar.value.dianavalue;
            this.limitlow = respuesta.lowlimit;
            this.limitUpper = respuesta.upperlimit;

          } catch (err) {
            this.toastr.info(this.translate.instant( `${this.messageobj}`));
            return;
          }
        }

        this.datosEnvio = {
          iddianavalue: this.formularioRegistroEditar.value.iddianavalue,
          idDianacalculate: this.formularioRegistroEditar.value.idDianacalculate,
          idconfobjquaanalyte: this.formularioRegistroEditar.value.idconfobjquaanalyte,
          level: this.formularioRegistroEditar.value.level,
          dianavalue: this.dianavalue,
          lowlimit: this.limitlow,
          upperlimit: this.limitUpper,
          active: this.formularioRegistroEditar.value.active
        }
        this.actualizarDatos(this.datosEnvio);

      }
    }
  }
  actualizarDatos(datos) {
    this.FnEditLog(datos);
  }


  eliminar(id: any) {
    let datosAnteriores = this.dataAnt.find(x => x.Iddianavalue == id);
    this.valoresDianaService.delete('', id).subscribe(respuesta => {

      this.loadData();
      this.accion = '';
      this.toastr.success('Registro eliminado');

      const Loguser = {
        Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
        hora: this.datePipe.transform(Date.now(), "shortTime"),
        Modulo:'Control Calidad Interno',
        Submodulo: 'Administración',
        Item:'Objetivos de Calidad',
        metodo: 'eliminación',
        datos: JSON.stringify(id),
        DatosAnteriores: `${datosAnteriores.Iddianavalue} | Analito: ${datosAnteriores.Desanalytes} Reactivo: ${datosAnteriores.Desreagents} Método: ${datosAnteriores.Desmethods} Analizador: ${datosAnteriores.NameAnalyzer}`,
        respuesta: JSON.stringify(respuesta),
        tipoRespuesta: 200,
        Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
      }
      this.logsService.createLogAsync(Loguser).then(respuesta => {
      });
    },
      (err: HttpErrorResponse) => {
        this.toastr.error(this.messageError);
        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo:'Control Calidad Interno',
          Submodulo: 'Administración',
          Item:'Objetivos de Calidad',
          metodo:'eliminación',
          datos: JSON.stringify(id),
          DatosAnteriores: `${datosAnteriores.Iddianavalue} | Analito: ${datosAnteriores.Desanalytes} Reactivo: ${datosAnteriores.Desreagents} Método: ${datosAnteriores.Desmethods} Analizador: ${datosAnteriores.NameAnalyzer}`,
          respuesta: err.message,
          tipoRespuesta: err.status,
          Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
        this.logsService.createLogAsync(Loguser).then(respuesta => {
        });
      });
  }


  actualizarEstado(objeto) {
    const estado = objeto.Active ? false : true;
    const datos = {
      idconfobjquaanalyte: objeto.Idconfobjquaanalyte,
      iddianavalue: objeto.Iddianavalue,
      level: objeto.Level,
      dianavalue: objeto.Dianavalue,
      lowlimit: objeto.Lowlimit,
      upperlimit: objeto.Upperlimit,
      active: estado
    }
    this.valoresDianaService.update(datos, objeto.Iddianavalue).subscribe(respuesta => {
      this.accion = 'Editar';
      this.loadData();
      this.log.logObj('Control Calidad Interno', 'Administración', 'Objetivos de calidad', 'a', datos, JSON.stringify(respuesta), 200);
      this.toastr.success('Estado actualizado','Actualización');
    },err =>{
      this.log.logObj('Control Calidad Interno', 'Administración', 'Objetivos de calidad', 'a', datos, err.message, err.status);
      this.toastr.error('No fue posible actualizar el estado', 'Error')
    });
  }

  openModalRegistro(templateRegistro: TemplateRef<any>, datos: any) {

    this.crearFormulario(datos);
    this.analyteant = datos.Desanalytes;
    this.dianavalueant= datos.Dianavalue;
    this.lowlimitant = datos.Lowlimit;
    this.upperlimitant = datos.Upperlimit;
    this.levelant = datos.Level;

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
      content: templateRegistro,
      btn: this.accionEditar?'Actualizar':'Guardar',
      btn2: 'Cerrar',
      footer:true,
      title: this.accion,
      image:''
    };
    const dialogRef = this.dialog.open(ModalGeneralComponent, { height:'auto' ,width: '40em', data, disableClose: true });

    dialogRef.componentInstance.primaryEvent?.pipe(takeUntil(destroy$)).subscribe(x =>{
      if(this.formularioRegistroEditar.invalid){
        this.formularioRegistroEditar.markAllAsTouched();
        return
      }
      this.crearEditar();
      dialogRef.close();
    });
  }

  async changeValue() {
    this.show = false;
    if (this.mesNoValido.value === 1) {
      this.fechaInicioNoValido.clearValidators();
      this.fechaFinNoValido.clearValidators();
      this.formularioRegistroEditar.get('dianavalue').clearValidators();
      this.hidden = false;
      this.show = false;

      const data = {
        complemento: `Reportes/dianavalueflotante`,
        date: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
        dianaCalulate: AppConstants.TREINTA,
        level: this.formularioRegistroEditar.value.level,
        idheadquaerters: this.formaBuscarDatos.value.numLaboratorio,
        idanalyzer: this.formularioRegistroEditar.value.idanalyzer,
        idcontrolmaterial: this.idcontrolmaterialpr,
        idlot: this.idlotspr,
        idanalyte: this.formularioRegistroEditar.value.idanalyte,
        idtest: this.test
      }

      const datalimit = {
        complemento: `Reportes/limites`,
        date: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
        dianaCalulate: AppConstants.TREINTA,
        level: this.formularioRegistroEditar.value.level,
        idheadquaerters: this.formaBuscarDatos.value.numLaboratorio,
        idanalyzer: this.formularioRegistroEditar.value.idanalyzer,
        idcontrolmaterial: this.idcontrolmaterialpr,
        idlot: this.idlotspr,
        idanalyte: this.formularioRegistroEditar.value.idanalyte,
        idtest: this.test

      }

      try {
        const respuesta = await this.reportesService.getDianaFlotante(data);
        this.dianavalue = respuesta.dianavalue;

        const resultLimites = await this.reportesService.getLimitsFloat(datalimit);

        this.limitlow = resultLimites.lowlimit;
        this.limitUpper = resultLimites.upperlimit;


      } catch (err) {
        this.toastr.info(this.translate.instant( `${this.messageAlerta}`));
        return;
      }

    }
    if (this.mesNoValido.value === 2) {
      this.fechaInicioNoValido.clearValidators();
      this.fechaFinNoValido.clearValidators();
      this.formularioRegistroEditar.get('dianavalue').clearValidators();
      this.hidden = false;
      this.show = false;

      const data = {
        complemento: `Reportes/dianavalueflotante`,
        date: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
        dianaCalulate: 365,
        level: this.formularioRegistroEditar.value.level,
        idheadquaerters: this.formaBuscarDatos.value.numLaboratorio,
        idanalyzer: this.formularioRegistroEditar.value.idanalyzer,
        idcontrolmaterial: this.idcontrolmaterialpr,
        idlot: this.idlotspr,
        idanalyte: this.formularioRegistroEditar.value.idanalyte,
        idtest: this.test
      }

      const datalimit = {
        complemento: `Reportes/limites`,
        date: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
        dianaCalulate: 365,
        level: this.formularioRegistroEditar.value.level,
        idheadquaerters: this.formaBuscarDatos.value.numLaboratorio,
        idanalyzer: this.formularioRegistroEditar.value.idanalyzer,
        idcontrolmaterial: this.idcontrolmaterialpr,
        idlot: this.idlotspr,
        idanalyte: this.formularioRegistroEditar.value.idanalyte,
        idtest: this.test

      }
      try {
        const respuesta = await this.reportesService.getDianaFlotante(data);
        this.dianavalue = respuesta.dianavalue;

        const resultLimites = await this.reportesService.getLimitsFloat(datalimit);
        this.limitlow = resultLimites.lowlimit;
        this.limitUpper = resultLimites.upperlimit;

      } catch (err) {
        this.toastr.info(this.translate.instant(`${this.messageAlerta}`));
        return;
      }
    }
    if (this.mesNoValido.value === 3) {
      this.fechaInicioNoValido.clearValidators();
      this.fechaFinNoValido.clearValidators();
      this.formularioRegistroEditar.get('dianavalue').clearValidators();
      this.hidden = false;
      this.show = false;
      const data = {
        complemento: `Reportes/dianavalueflotante`,
        date: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
        dianaCalulate: 180,
        level: this.formularioRegistroEditar.value.level,
        idheadquaerters: this.formaBuscarDatos.value.numLaboratorio,
        idanalyzer: this.formularioRegistroEditar.value.idanalyzer,
        idcontrolmaterial: this.idcontrolmaterialpr,
        idlot: this.idlotspr,
        idanalyte: this.formularioRegistroEditar.value.idanalyte,
        idtest: this.test
      }

      const datalimit = {
        complemento: `Reportes/limites`,
        date: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
        dianaCalulate: 180,
        level: this.formularioRegistroEditar.value.level,
        idheadquaerters: this.formaBuscarDatos.value.numLaboratorio,
        idanalyzer: this.formularioRegistroEditar.value.idanalyzer,
        idcontrolmaterial: this.idcontrolmaterialpr,
        idlot: this.idlotspr,
        idanalyte: this.formularioRegistroEditar.value.idanalyte,
        idtest: this.test

      }

      try {
        const respuesta = await this.reportesService.getDianaFlotante(data);
        this.dianavalue = respuesta.dianavalue;

        const resultLimites = await this.reportesService.getLimitsFloat(datalimit);
        this.limitlow = resultLimites.lowlimit;
        this.limitUpper = resultLimites.upperlimit;

      } catch (err) {
        this.toastr.info(this.translate.instant( `${this.messageAlerta}`));
        return;
      }
    }

    if (this.mesNoValido.value === 5) {
      this.hidden = true;
      this.show = false;
      this.fechaInicioNoValido.setValidators([Validators.required]);
      this.fechaFinNoValido.setValidators([Validators.required]);
      this.formularioRegistroEditar.get('dianavalue').clearValidators();

    }
    if (this.mesNoValido.value === 'estadoArte') {
      this.hidden = false;
      const datalimit = {
        complemento: `Reportes/limites`,
        date: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
        dianaCalulate: AppConstants.TREINTA,
        level: this.formularioRegistroEditar.value.level,
        idheadquaerters: this.formaBuscarDatos.value.numLaboratorio,
        idanalyzer: this.formularioRegistroEditar.value.idanalyzer,
        idcontrolmaterial: this.idcontrolmaterialpr,
        idlot: this.idlotspr,
        idanalyte: this.formularioRegistroEditar.value.idanalyte,
        idtest: this.test
      }

      try {
        const resultLimites = await this.reportesService.getLimitsFloat(datalimit);
        this.limitlow = resultLimites.lowlimit;
        this.limitUpper = resultLimites.upperlimit;

      } catch (err) {
        this.toastr.info(this.translate.instant(`${this.messageAlerta}`));
        return;
      }


    }
    if (this.mesNoValido.value == 7) {

      this.fechaInicioNoValido.clearValidators();
      this.fechaFinNoValido.clearValidators();
      this.hidden = false;
      this.show = true;
      this.formularioRegistroEditar.get('dianavalue').setValidators([Validators.required]);
      this.DianaNoValido.setValidators([Validators.required]);
    }

  }
  async getVaribles(variableString) {
    var fechainicial0 = this.datePipe.transform(this.formularioRegistroEditar.value.fechaInicio,"yyyy-MM-dd");
    var fechafinal0 = this.datePipe.transform(this.formularioRegistroEditar.value.fechaFin,"yyyy-MM-dd");
    const data = {
      complemento: `Reportes/${variableString}`,
      fechaInicial: fechainicial0,
      fechaFinal:fechafinal0 ,
      level: this.formularioRegistroEditar.value.level,
      idheadquaerters: this.formaBuscarDatos.value.numLaboratorio,
      idanalyzer: this.formularioRegistroEditar.value.idanalyzer,
      idcontrolmaterial: this.idcontrolmaterialpr,
      idlot: this.idlotspr,
      idanalyte: this.formularioRegistroEditar.value.idanalyte,
      idtest: this.test
    }
    return this.reportesService.getVaribles(data).toPromise();
  }

  async getVarMediaPropia() {

    const datalimitxdianapropia = {
      complemento: `Reportes/limitesxdianapropia`,
      date: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
      dianaCalulate: AppConstants.TREINTA,
      level: this.formularioRegistroEditar.value.level,
      dianavaluepropia: this.formularioRegistroEditar.value.dianavalue,
      idTest: this.test
    }

    return this.reportesService.getLimitsFloatxdianapropiadata(datalimitxdianapropia).toPromise();

  }

  titulosSwal() {
    this.translate.get('MODULES.SWAL.TITULO_ERROR').subscribe(respuesta => this.titulo = `<b>${respuesta}</b>`);
    this.translate.get('MODULES.SWAL.TEXT').subscribe(respuesta => this.text = respuesta);
    this.translate.get('MODULES.SWAL.TEXT4').subscribe(respuesta => this.text4 = respuesta);
    this.translate.get('MODULES.SWAL.SINDATOS').subscribe(respuesta => this.text2 = respuesta);
    this.translate.get('MODULES.SWAL.CANCEL').subscribe(respuesta => this.cancelar = respuesta);
    this.translate.get('MODULES.SWAL.ACEPTAR').subscribe(respuesta => this.aceptar = respuesta);
    this.translate.get('MODULES.SWAL.CONFIRM').subscribe(respuesta => this.confirmar = respuesta);
    this.translate.get('MODULES.SWAL.TEXTERROR').subscribe(respuesta => this.textError = respuesta);
    this.translate.get('MODULES.SWAL.MESAGEERROR').subscribe(respuesta => this.messageError = respuesta);
    this.translate.get('MODULES.SWAL.SINDATOS').subscribe(respuesta => this.messageSinDatos = respuesta);
    this.translate.get('MODULES.SWAL.MENSAJEALERTA').subscribe(respuesta => this.messageAlerta = respuesta);
    this.translate.get('MODULES.SWAL.SINCONFIGOBJ').subscribe(respuesta => this.messageobj = respuesta);
    this.translate.get('MODULES.SWAL.OK').subscribe(respuesta => this.ok = `<b>${respuesta}</b>`);


  }

  closeVentana(): void {
    this.vantanaModal.hide();
    this.hidden = false;
  }

  async materialControl(id:any)
  {
    this.formaBuscarDatos.controls['numMaterialControl'].setValue('');
    this.formaBuscarDatos.controls['numLote'].setValue('');

     (await this.sedesService.gebByIdSeccionMateriasSedeControl(id, this.sedeId)).subscribe((data:any) => {
      if (data.length > 0)
      {
         this.controlMaterialActive = data;
         this.lotesActive = [];

      }
     },(err:any)=>{
      this.controlMaterialActive = [];
     });
  }

  async lotesFun(id:any)
  {

    this.formaBuscarDatos.controls['numLote'].setValue('');
     (await this.sedesService.gebByIdMaterialSedeLote(id, this.sedeId)).subscribe((data:any) => {
      if (data.length > 0)
      {
         this.lotesActive = data;
      }
     },(err:any)=>{
      this.lotesActive = [];
     });
  }

}
