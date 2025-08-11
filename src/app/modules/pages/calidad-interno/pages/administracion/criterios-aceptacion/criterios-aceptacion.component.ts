import { DatePipe, NgFor, NgIf, NgClass, AsyncPipe, UpperCasePipe, TitleCasePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { LotesService } from '@app/services/configuracion/lotes.service';
import { ControlMaterialService } from '@app/services/configuracion/materialescontrol.service';
import { PublicService } from '@app/services/public.service';
import { SharedService } from '@app/services/shared.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { VentanasModalesService } from '@app/services/general/ventanas-modales.service';
import { SeccionesService } from '@app/services/configuracion/secciones.service';
import { CriteriosAceptacionService } from '@app/services/configuracion/criterios-aceptacion.service';
import { DiccionarioResultadosService } from '@app/services/configuracion/diccionario-resultados.service';
import { TestsService } from '../../../../../../services/configuracion/test.service';
import { AnalitosService } from '../../../../../../services/configuracion/analitos.service';
import { ToastrService } from 'ngx-toastr';
import { SedesService } from '../../../../../../services/configuracion/sedes.service';
import { lastValueFrom, Observable, Subject } from 'rxjs';
import { map, startWith, takeUntil } from 'rxjs/operators';
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
import { LoaderService } from '@app/services/loader/loader.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NombreTestPipe } from "../../../../../shared/pipe/nombre-test.pipe";
import { createLog } from '@app/globals/logUser';

@Component({
    selector: 'app-criterios-aceptacion',
    templateUrl: './criterios-aceptacion.component.html',
    styleUrls: ['./criterios-aceptacion.component.css'],
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
    NgClass,
    MatTableModule,
    MatSortModule,
    MatSlideToggleModule,
    MatPaginatorModule,
    AsyncPipe,
    UpperCasePipe,
    TitleCasePipe,
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


export class CriteriosAceptacionComponent implements OnInit {
  log = new createLog(this.datePipe, this.translate, this.caService);

  displayedColumns: string[] = ['Analitos', 'Nivel', 'Resultado', 'Ar', 'Order grafíca', 'Estado', 'Editar', 'Eliminar'];
  dataSource: MatTableDataSource<any>;
  dataTableBody:any[]=[];

  ventanaModal: BsModalRef;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  formaBuscarDatos: FormGroup;
  formaRegistroCA: FormGroup;
  bandera: boolean;
  accion: any;
  accionEditar: any;
  tituloAccion: any;
  messageError: any;
  messageSinDatos: string;
  titulo: string = '';
  ok: string;
  text: string = '';
  band: boolean = false;
  text2: string = '';
  text3: string = '';
  desactivar = false;
  aceptar: string = '';
  dateNow: Date = new Date();
  idAnalyte: number;
  nivelsAnalyte: number;
  ver: boolean = undefined;
  verBtn: boolean = false;
  dataTable = [];
  test: number;
  lab: number;
  sec: number;
  mat: number;
  lote: number;

  //Info Log
  lotnew: any;
  analitonew:any;
  resultadoant:any;
  arant:any;
  seccionnew:any;
  idanalitonew:any;
  idlotenew:any;

  dateNowISO = this.dateNow.toTimeString();
  sedes = [];
  sedesActive = [];
  sedesActiveFilter = [];
  secciones = [];
  seccionesActive = [];
  controlMaterial = [];
  controlMaterialActive = [];
  lotes = [];
  lotesActive = [];
  tests = [];
  resultsDictionary = [];
  resultsDictionaryActive: any;
  dataAnt: any;
  sedeId:number = 0;
  habilitarSede:boolean = false;

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

  //predictivos modal
  filteredOptionsresultsEdit: Observable<string[]>;
  idresultspr: number;
  desresultspr: any;
  listaresultspr: any;

  //predictivos create
  filteredOptionsreultsCreate: Observable<string[]>;
  listresultscreate: any;
  filterHeadquarters = new FormControl('');


  constructor(

    private fb: FormBuilder,
    private datePipe: DatePipe,
    private publicService: PublicService,
    private seccionesService: SeccionesService,
    private controlMaterialService: ControlMaterialService,
    private lotesService: LotesService,
    private caService: CriteriosAceptacionService,
    private diccionarioResultadosService: DiccionarioResultadosService,
    private analitosService: AnalitosService,
    private sharedService: SharedService,
    private toastr: ToastrService,
    private modalService: BsModalService,
    private translate: TranslateService,
    private testService: TestsService,
    private ventanaService: VentanasModalesService,
    private sedesService: SedesService,
    private dialog: MatDialog,
    private loader: LoaderService
  ) { }

  ngOnInit(): void {
    this.crearFormularioBuscarDatos();
    this.cargarSedes();
    this.cargarDicResul();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();
    this.cargarSeccionesPre();
    this.sedeId = JSON.parse(sessionStorage.getItem('sede'));

    if (this.sedeId > 0){
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

  private _filterresultsCreate(value: string): string[] {
    const filterValue = value;
    return this.resultsDictionaryActive
      .filter(results =>
        results.desresults.includes(filterValue)).filter(e => e.active == true)

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

  private _filterResultsEdit(value: string): string[] {
    const filterValue = value;
    return this.resultsDictionaryActive
              .filter(results =>
                results.desresults.includes(filterValue)).filter(e=>e.active == true)

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

  async lotesFun(nombreLote: string)
  {

    var desnumlot = this.formaBuscarDatos.get('numLote').setValue(nombreLote.split('|')[1]);
    var idlot0 = nombreLote.split('|')[0];
    this.idlotspr = Number(idlot0);

    const { numLaboratorio, seccion, numMaterialControl } = this.formaBuscarDatos.value;

    this.lab = parseInt(numLaboratorio);
    this.sec = parseInt(seccion);
    this.mat = parseInt(numMaterialControl);


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
    await this.caService.getTestFiltroCA(this.lab, this.idsectionspr, this.idcontrolmaterialpr, this.idlotspr).subscribe(response => {
      
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
        this.dataSource = new MatTableDataSource([]);
        this.accion = 'noDatos';
        this.toastr.error('No se encontraron datos');
        // this.formaBuscarDatos.reset({ numLaboratorio: '', seccion: '', numMaterialControl: '', numLote: '' });
        this.tests = [];
        this.ver = false;
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

  async search() {

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


    this.formaBuscarDatos.get('numLote').valueChanges.subscribe(async data => {


      if (data != '') {

        this.ver = false;

        const { numLaboratorio, seccion, numMaterialControl } = this.formaBuscarDatos.value;

        this.lab = parseInt(numLaboratorio);
        this.sec = parseInt(seccion);
        this.mat = parseInt(numMaterialControl);

        var arr0 = [];
        arr0 = data.split('|');
        var idlotpre = Number(arr0[0]);

        await this.caService.getTestFiltroCA(this.lab, this.idsectionspr, this.idcontrolmaterialpr, idlotpre).subscribe(response => {

          this.tests = [];
          this.verBtn = false;
          this.tests = response;
          this.formaBuscarDatos.get('idtest').setValue('');

        }, error => {


            this.dataSource = new MatTableDataSource([]);
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
    if (test != '') {
      this.test = parseInt(id);
      this.testService.getByIdAsync(this.test).then((data: any) => {
        this.nivelsAnalyte = data.level;
      });
      this.verBtn = true;
    } else {
      this.verBtn = false;
    }
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

  async cargarDicResul() {
    this.resultsDictionary = await this.diccionarioResultadosService.getAllAsync();
    this.resultsDictionaryActive = this.resultsDictionary.filter(e => e.active == true);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  get idresultsdictionaryNoValido() {
    return this.formaRegistroCA.get('idresultsdictionary');
  }
  get levelNoValido() {
    return this.formaRegistroCA.get('level');
  }
  get arNoValido() {
    return this.formaRegistroCA.get('ar');
  }
  get ordergraphNoValido() {
    return this.formaRegistroCA.get('ordergraph');
  }

  get idresultsdictionaryNoValidoEdit() {
    return this.formaRegistroCA.get('idresultsdictionary');
  }
  get levelNoValidoEdit() {
    return this.formaRegistroCA.get('level');
  }
  get arNoValidoEdit() {
    return this.formaRegistroCA.get('ar');
  }
  get ordergraphNoValidoEdit() {
    return this.formaRegistroCA.get('ordergraph');
  }

  crearFormularioCA(datos: any) {

    this.formaRegistroCA = this.fb.group({

      idacceptancerequirements: [datos.Idacceptancerequirements ? datos.Idacceptancerequirements : ''],
      idresultsdictionary: [datos.Idresultsdictionary ? datos.Idresultsdictionary : '', [Validators.required]],
      idTest: [datos.IdTest ? datos.IdTest : this.test],
      level: [datos.Level ? datos.Level : '', [Validators.required, Validators.min(1), this.nivelsAnalyte == 1 ? Validators.max(1) : this.nivelsAnalyte == 2 ? Validators.max(2) : Validators.max(3)]],
      ar: [datos.Ar ? datos.Ar : '', [Validators.required]],
      ordergraph: [datos.Ordergraph ? datos.Ordergraph : '', [Validators.required, Validators.min(1)]],
      active: [datos.Active ? datos.Active : false],

    });
  }

  async crearFormularioCAEdit(datos: any) {

    await this.diccionarioResultadosService.getByIdAsync(datos.Idresultsdictionary).then((results: any) => {
      this.desresultspr = results.desresults;
    });
    
    this.formaRegistroCA.get('idacceptancerequirements').setValue(datos.Idacceptancerequirements ? datos.Idacceptancerequirements : '')
    this.formaRegistroCA.get('idresultsdictionary').setValue(this.desresultspr.toLowerCase() ? this.desresultspr.toLowerCase() : '')
    this.formaRegistroCA.get('idTest').setValue(datos.IdTest ? datos.IdTest : this.test)
    this.formaRegistroCA.get('level').setValue(datos.Level ? datos.Level : '')
    this.formaRegistroCA.get('ar').setValue(datos.Ar ? datos.Ar : '')
    this.formaRegistroCA.get('ordergraph').setValue(datos.Ordergraph ? datos.Ordergraph : '')
    this.formaRegistroCA.get('active').setValue(datos.Active ? datos.Active : false)


    this.listaresultspr = await this.diccionarioResultadosService.getAllAsync();
    this.resultsDictionaryActive = this.listaresultspr.filter(e => e.active);

    this.resultsDictionaryActive.sort((a, b) => {
      if (a.desresults < b.desresults) return -1;
      if (a.desresults > b.desresults) return 1;
      return 0;
    })

    this.filteredOptionsreultsCreate = this.formaRegistroCA.get('idresultsdictionary').valueChanges.pipe(
      startWith(''),
      map(value => {
        return this._filterResultsEdit(value)
      }),
    );

  }

  async openModalRegistroCA(templateRegistroCA: TemplateRef<any>, datos: any) {

    
    this.crearFormularioCA(datos);

    this.listaresultspr = await this.diccionarioResultadosService.getAllAsync();
    this.resultsDictionaryActive = this.listaresultspr.filter(e => e.active);

    this.resultsDictionaryActive.sort((a, b) => {
      if (a.desresults < b.desresults) return -1;
      if (a.desresults > b.desresults) return 1;
      return 0;
    })

    this.filteredOptionsreultsCreate = this.formaRegistroCA.get('idresultsdictionary').valueChanges.pipe(
      startWith(''),
      map(value => {
        return this._filterresultsCreate(value)
      }),
    );


    let img = "";
    if(datos){
      this.accionEditar = true;
      this.accion = "Editar" ;
      img = 'assets/rutas/iconos/editar.png';
    }else{
      this.accionEditar = false;
      this.accion = "Crear";
     img = 'assets/rutas/iconos/crear.png';
    }

    const destroy$: Subject<boolean> = new Subject<boolean>();
    /* Variables recibidas por el modal */
    const data: ModalData = {
      content: templateRegistroCA,
      btn: this.accionEditar?'Actualizar':'Guardar',
      btn2: 'Cerrar',
      footer:true,
      title: this.accion,
      image:img
    };
    const dialogRef = this.dialog.open(ModalGeneralComponent, { height:'auto' ,width: '60em', data, disableClose: true });

    dialogRef.componentInstance.primaryEvent?.pipe(takeUntil(destroy$)).subscribe(x =>{
      if(this.formaRegistroCA.invalid){
        this.formaRegistroCA.markAllAsTouched();
        return
      }
      this.crearEditarCA('add');
      dialogRef.close();
    });
  }

  openModalRegistroCAEdit(templateRegistroCAEdit: TemplateRef<any>, datos: any) {
    this.crearFormularioCA(datos);
    let img = '';
    if(datos){
      this.accionEditar = true;
      this.accion = "Editar" ;
      img = 'assets/rutas/iconos/editar.png';
    }else{
      this.accionEditar = false;
      this.accion = "Crear";
      img = 'assets/rutas/iconos/crear.png';
    }

    const destroy$: Subject<boolean> = new Subject<boolean>();
    /* Variables recibidas por el modal */
    const data: ModalData = {
      content: templateRegistroCAEdit,
      btn: this.accionEditar?'Actualizar':'Guardar',
      btn2: 'Cerrar',
      footer:true,
      title: this.accion,
      image:img
    };
    const dialogRef = this.dialog.open(ModalGeneralComponent, { height:'auto' ,width: '60em', data, disableClose: true });
    this.crearFormularioCAEdit(datos);
    dialogRef.componentInstance.primaryEvent?.pipe(takeUntil(destroy$)).subscribe(x =>{
      if(this.formaRegistroCA.invalid){
        this.formaRegistroCA.markAllAsTouched();
        return
      }
      this.crearEditarCAEdit('edit');
      dialogRef.close();
    });
  }

  loadData() {
    this.loader.show();
    this.ver = false;

    this.caService.getDataCA(this.test).subscribe(respuesta => {
      this.dataTable = respuesta;
      this.dataAnt = respuesta;

      const filtrarDataTable:any[] = respuesta;
      this.dataTableBody = filtrarDataTable.map( x =>  {
        return { Analitos:x.Desanalytes ,Nivel:x.Level,Resultado:x.Desresults,Ar:x.Ar,'Order grafíca':x.Ordergraph,Estado:x.Active, item: x,item7:x,item8:x };
      });
      this.dataSource = new MatTableDataSource(respuesta);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;

      this.analitonew = this.dataTable[0].Desanalytes;
      setTimeout(() => {

        this.loader.hide();
        this.ver = true;

      }, 3000);

    }, error => {
      this.dataTable = [];
      this.ver = true;
      this.dataSource = new MatTableDataSource([]);
      this.accion = 'noDatos';
      this.toastr.error('No se encontraron datos');
      this.loader.hide();

    });

  }

  async crearEditarCA(accion: string) {

    let nomIdresult = this.formaRegistroCA.get('idresultsdictionary').value
    let nuevaData = this.formaRegistroCA.value;

    this.resultsDictionaryActive.sort((a, b) => {
      if (a.desresults < b.desresults) return -1;
      if (a.desresults > b.desresults) return 1;
      return 0;
    })

    this.resultsDictionaryActive.filter(result => {
      if (result.desresults.toLowerCase() === nomIdresult.toLowerCase()) {
        nuevaData.idresultsdictionary = result.idresultsdictionary;
        return
      }
      return
    })


    var idresultdic = nuevaData.idresultsdictionary;

    if (!this.formaRegistroCA.invalid) {

      var nameresult = null;

      await this.diccionarioResultadosService.getresultadoslog(idresultdic).subscribe((datadicresult: any) => {
        nameresult = datadicresult.desresults;
      });

      this.resultadoant = nameresult;

      // crear
      if (accion == 'add' || accion == 'close') {

        let nivel = this.dataTable.filter(criterio => criterio.Level == this.formaRegistroCA.get('level').value) || [];
        let resultado = nivel.find(criterio => criterio.Idresultsdictionary == this.formaRegistroCA.get('idresultsdictionary').value);
        let ordergraph = nivel.find(criterio => criterio.Ordergraph == this.formaRegistroCA.get('ordergraph').value);

        // si están ordergraph y resultado
        if (resultado != undefined && ordergraph != undefined) {

          
          this.accion = 'noDatos';
          this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.YAHAYRESULTADOYODERGRAPH'));

          // si está resultado
        } else if (resultado != undefined && ordergraph == undefined) {

          
          this.accion = 'noDatos';
          this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.YAHAYRESULTADO'));

          // si está ordergraph
        } else if (resultado == undefined && ordergraph != undefined) {

          
          this.accion = 'noDatos';
          this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.YAHAYORDERGRAPH'));

        } else {

          if (accion == 'add') {

            nuevaData.idTest = this.test
            this.formaRegistroCA.get('idTest').setValue(this.test)

            //this.desactivar = true;
            await this.caService.createAsync(nuevaData).then(respuesta => {

              this.loadData();
              this.toastr.success('Registro creado');
              this.desactivar = false;
              this.band = true;
              nuevaData.idTest = this.test
              this.formaRegistroCA.get('idTest').setValue(this.test)

              this.formaRegistroCA.reset({ idresultsdictionary: '', level: '', ar: '', ordergraph: '', active: false });

              const Loguser = {

                Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
                hora: this.datePipe.transform(Date.now(), "shortTime"),
                Modulo:'Control Calidad Interno',
                Submodulo: 'Administración',
                Item:'Criterios de Aceptación',
                Metodo: 'creación',
                Datos: ('Test: '+ this.analitonew  +  '| Resultado: ' + this.resultadoant + ' |Nivel: ' + respuesta.level ),
                Respuesta: JSON.stringify(respuesta),
                TipoRespuesta: 200,
                Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')

              }
              this.caService.createLogAsync(Loguser).then(respuesta => {

              });
            }, error => {

              const Loguser = {
                Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
                hora: this.datePipe.transform(Date.now(), "shortTime"),
                Modulo:'Control Calidad Interno',
                Submodulo: 'Administración',
                Item:'Criterios de Aceptación',
                Metodo: 'creación',
                Datos: ('Test: '+ this.analitonew  +' | Resultado: ' + this.resultadoant + ' |Nivel: ' + this.formaRegistroCA.value.level ),
                respuesta: error.message,
                tipoRespuesta: error.status,
                Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
              }

              this.caService.createLogAsync(Loguser).then(respuesta => {
              });

            });
            //this.loadData();

          } else {

            nuevaData.idTest = this.test
            this.formaRegistroCA.get('idTest').setValue(this.test)

            var nameresult = null;
            this.diccionarioResultadosService.getresultadoslog(idresultdic).subscribe((datadicresult: any) => {
              nameresult = datadicresult.desresults;
            });

            this.resultadoant = nameresult;

            this.desactivar = true;
            await this.caService.createAsync(nuevaData).then(respuesta => {

              
              this.loadData();
              this.toastr.success('Registro creado');
              this.desactivar = false;
              this.band = true;
              this.formaRegistroCA.reset({ idresultsdictionary: '', level: '', ar: '', ordergraph: '', active: false });

              const Loguser = {

                Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
                hora: this.datePipe.transform(Date.now(), "shortTime"),
                Modulo:'Control Calidad Interno',
                Submodulo: 'Administración',
                Item:'Criterios de Aceptación',
                Metodo: 'creación',
                Datos: ('Test: '+ this.analitonew  + ' | Resultado: ' + this.resultadoant + ' |Nivel: ' + respuesta.level ),
                Respuesta: JSON.stringify(respuesta),
                TipoRespuesta: 200,
                Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')

              }

              this.caService.createLogAsync(Loguser).then(respuesta => {

              });

            }, error => {

              const Loguser = {
                Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
                hora: this.datePipe.transform(Date.now(), "shortTime"),
                Modulo:'Control Calidad Interno',
                Submodulo: 'Administración',
                Item:'Criterios de Aceptación',
                Metodo: 'creación',
                Datos: ('Test: '+ this.analitonew  +' | Resultado: ' + this.resultadoant + ' |Nivel: ' + this.formaRegistroCA.value.level ),
                respuesta: error.message,
                tipoRespuesta: error.status,
                Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
              }

              this.caService.createLogAsync(Loguser).then(respuesta => {
              });
            });
          }
        }
      }
    }
  }

  crearEditarCAEdit(accion: string) {

    let nomIdresult = this.formaRegistroCA.get('idresultsdictionary').value
    let nuevaData = this.formaRegistroCA.value;
    // let arrresults = this.resultsDictionaryActive.sort((a, b) => {
    //   a.desresults = a.desresults.charAt(0).toLowerCase() + a.desresults.slice(1);
    //   b.desresults = b.desresults.charAt(0).toLowerCase() + b.desresults.slice(1);

    // })
    this.resultsDictionaryActive.sort((a, b) => {
      if (a.desresults < b.desresults) return -1;
      if (a.desresults > b.desresults) return 1;
      return 0;
    })

    this.resultsDictionaryActive.filter(result => {
      if (result.desresults.toLowerCase() === nomIdresult) {
        nuevaData.idresultsdictionary = result.idresultsdictionary;
        return
      }
      return
    })

    //var idresultdic = this.formaRegistroCA.get('idresultsdictionary').value;
    var idresultdic = nuevaData.idresultsdictionary;

    if (!this.formaRegistroCA.invalid) {

      var nameresult = null;

      this.diccionarioResultadosService.getresultadoslog(idresultdic).subscribe((datadicresult: any) => {
        nameresult = datadicresult.desresults;
      });

      this.resultadoant = nameresult;

      // crear
      if (accion === 'add' || accion === 'close') {

        let nivel = this.dataTable.filter(criterio => criterio.Level == this.formaRegistroCA.get('level').value) || [];
        let resultado = nivel.find(criterio => criterio.Idresultsdictionary == idresultdic);
        let ordergraph = nivel.find(criterio => criterio.Ordergraph == this.formaRegistroCA.get('ordergraph').value);

        // si están ordergraph y resultado
        if (resultado != undefined && ordergraph != undefined) {

          
          this.accion = 'noDatos';
          this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.YAHAYRESULTADOYODERGRAPH'));

          // si está resultado
        } else if (resultado != undefined && ordergraph == undefined) {

          
          this.accion = 'noDatos';
          this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.YAHAYRESULTADO'));

          // si está ordergraph
        } else if (resultado == undefined && ordergraph != undefined) {

          
          this.accion = 'noDatos';
          this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.YAHAYORDERGRAPH'));

        } else {

          if (accion == 'add') {
          } else {

            var nameresult = null;

            this.diccionarioResultadosService.getresultadoslog(idresultdic).subscribe((datadicresult: any) => {
              nameresult = datadicresult.desresults;
            });

            this.resultadoant = nameresult;

            this.desactivar = true;
            lastValueFrom(this.caService.create(this.formaRegistroCA.value)).then(respuesta => {

              
              this.loadData();
              this.toastr.success('Registro creado');
              this.desactivar = false;

              this.band = true;
              this.formaRegistroCA.reset({ idresultsdictionary: '', level: '', ar: '', ordergraph: '', active: false });

              const Loguser = {

                Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
                hora: this.datePipe.transform(Date.now(), "shortTime"),
                Modulo:'Control Calidad Interno',
                Submodulo: 'Administración',
                Item:'Criterios de Aceptación',
                Metodo: 'creación',
                Datos: ('Test: '+ this.analitonew  + ' | Resultado: ' + this.resultadoant + ' |Nivel: ' + respuesta.level ),
                Respuesta: JSON.stringify(respuesta),
                TipoRespuesta: 200,
                Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')

              }

              this.caService.createLogAsync(Loguser).then(respuesta => {

              });

            }).catch(error =>{
              
              const Loguser = {
                Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
                hora: this.datePipe.transform(Date.now(), "shortTime"),
                Modulo:'Control Calidad Interno',
                Submodulo: 'Administración',
                Item:'Criterios de Aceptación',
                Metodo: 'creación',
                Datos: ('Test: '+ this.analitonew  +' | Resultado: ' + this.resultadoant + ' |Nivel: ' + this.formaRegistroCA.value.level ),
                respuesta: error.message,
                tipoRespuesta: error.status,
                Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
              }

              this.caService.createLogAsync(Loguser).then(respuesta => {
              });
            })
          }
        }

      } else {

        let nivel = this.dataTable.filter(criterio => criterio.Level == this.formaRegistroCA.get('level').value) || [];
        let nivelesAparteActual = nivel.filter(criterio => criterio.Idacceptancerequirements != this.formaRegistroCA.get('idacceptancerequirements').value)
        let resultado = nivelesAparteActual.find(criterio => criterio.Idresultsdictionary == idresultdic);
        let ordergraph = nivelesAparteActual.find(criterio => criterio.Ordergraph == this.formaRegistroCA.get('ordergraph').value);

        // si están ordergraph y resultado
        if (resultado != undefined && ordergraph != undefined) {

          
          this.accion = 'noDatos';
          this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.YAHAYRESULTADOYODERGRAPH'));

          // si está resultado
        } else if (resultado != undefined && ordergraph == undefined) {

          
          this.accion = 'noDatos';
          this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.YAHAYRESULTADO'));

          // si está ordergraph
        } else if (resultado == undefined && ordergraph != undefined) {
          
          this.accion = 'noDatos';
          this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.YAHAYORDERGRAPH'));

        } else {

          lastValueFrom(this.caService.update(nuevaData, this.formaRegistroCA.value.idacceptancerequirements)).then(respuesta => {
            
            this.loadData();
            this.toastr.success('Registro actualizado');

            const Loguser = {

              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo:'Control Calidad Interno',
              Submodulo: 'Administración',
              Item:'Criterios de Aceptación',
              Metodo: 'actualización',
              Datos: ('Test: '+ this.analitonew  +' | Resultado: ' + this.formaRegistroCA.value.idresultsdictionary + ' |Nivel: ' + this.formaRegistroCA.value.level ),
              DatosAnteriores: ('Test: '+ this.analitonew  +' | Resultado: ' + this.resultadoant + ' |Nivel: ' + this.formaRegistroCA.value.level ),
              Respuesta: JSON.stringify(respuesta),
              TipoRespuesta: 200,
              Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }

            this.caService.createLogAsync(Loguser).then(respuesta => {
            });

          }).catch(error =>{
            const Loguser = {

              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo:'Control Calidad Interno',
              Submodulo: 'Administración',
              Item:'Criterios de Aceptación',
              metodo: 'actualización',
              Datos: ('Test: '+ this.analitonew  +' | Resultado: ' + this.formaRegistroCA.value.idresultsdictionary + ' |Nivel: ' + this.formaRegistroCA.value.level ),
              DatosAnteriores: ('Test: '+ this.analitonew  +' | Resultado: ' + this.resultadoant + ' |Nivel: ' + this.formaRegistroCA.value.level ),
              respuesta: error.message,
              tipoRespuesta: error.status,
              Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }
            this.caService.createLogAsync(Loguser).then(respuesta => {
            });

          })
        }
      }
    }
  }

  actualizarCAEstado(datosConfi) {
    const [data,estado ] = datosConfi;
    data.Active = estado;
    const datosAnteriores = this.dataAnt.find(x => x.Idacceptancerequirements == data.Idacceptancerequirements);
    lastValueFrom(this.caService.update(data, data.Idacceptancerequirements)).then(respuesta => {
      this.loadData();
      this.accion = 'Editar';
      this.log.logObj('Control Calidad Interno', 'Administración', 'Criterios de aceptación', 'a', data, JSON.stringify(respuesta), 200, this.datosAnt(datosAnteriores));
      this.toastr.success('Estado actualizado','Actualización');
    }).catch(err =>{
      this.log.logObj('Control Calidad Interno', 'Administración', 'Criterios de aceptación', 'a', data, err.message, err.status, this.datosAnt(datosAnteriores));
      this.toastr.error('No fue posible actualizar el estado', 'Error')
    })
  }

  datosAnt(data: any) {
    return ` Idacceptancerequirements: ${data.Idacceptancerequirements} - Desanalytes: ${data.Desanalytes} - Desmethods: ${data.Desmethods} - Desreagents: ${data.Desreagents} - Desresults: ${data.Desresults} - Desunits: ${data.Desunits} - NameAnalyzer: ${data.NameAnalyzer} - Ar: ${data.Ar} - Active: ${!data.Active}`;
  }

  eliminarCA(id: any) {
    let datosAnteriores = this.dataAnt.find(x => x.Idacceptancerequirements == id);
    this.caService.delete('CA', id).subscribe({
      next:(respuesta) => {
        this.loadData();
        this.accion = '';
        this.toastr.success('Registro eliminado');
  
        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo:'Control Calidad Interno',
          Submodulo: 'Administración',
          Item:'Criterios de Aceptación',
          metodo: 'eliminación',
          datos: JSON.stringify(id),
          DatosAnteriores: `${datosAnteriores.Idacceptancerequirements} | Analito: ${datosAnteriores.Desanalytes} | Método ${datosAnteriores.Desmethods} | Reactivo ${datosAnteriores.Desreagents}`,
          respuesta: JSON.stringify(respuesta),
          tipoRespuesta: 200,
          Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
        this.lotesService.createLogAsync(Loguser).then(respuesta => {
        });
      },error:(err)=> {
        this.toastr.error(this.messageError);
    
        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo:'Control Calidad Interno',
          Submodulo: 'Administración',
          Item:'Criterios de Aceptación',
          metodo: 'eliminación',
          datos: JSON.stringify(id),
          respuesta: err.message,
          tipoRespuesta: err.status,
          Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
        this.lotesService.createLogAsync(Loguser).then(respuesta => {
        });
      }

    });
  }

  titulosSwal() {
    this.translate.get('MODULES.SWAL.MESAGEERROR').subscribe(respuesta => this.messageError = respuesta);
    this.translate.get('MODULES.SWAL.SINDATOS').subscribe(respuesta => this.messageSinDatos = respuesta);
    this.translate.get('MODULES.SWAL.TITULO_ERROR').subscribe(respuesta => this.titulo = `<b>${respuesta}</b>`);
    this.translate.get('MODULES.SWAL.ACEPTAR').subscribe(respuesta => this.aceptar = respuesta);
    this.translate.get('MODULES.SWAL.OK').subscribe(respuesta => this.ok = `<b>${respuesta}</b>`);

  }

  async materialControl(id:any)
  {
    this.formaBuscarDatos.controls['numMaterialControl'].setValue('');
    this.formaBuscarDatos.controls['numLote'].setValue('');

     lastValueFrom(this.sedesService.gebByIdSeccionMateriasSedeControl(id,this.sedeId)).then((data:any) => {
      if (data.length > 0)
      {
         this.controlMaterialActive = data;

         this.controlMaterialActive = this.controlMaterialActive.filter(e => e.Active);

         this.lotesActive = [];

      }
     }).catch(e =>{
       this.controlMaterialActive = [];
     })

  }
}


