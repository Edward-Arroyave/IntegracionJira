import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { VentanasModalesService } from '@app/services/general/ventanas-modales.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ConfiguracionWestgardService } from '@app/services/configuracion/configuracion-westgard.service';
import { WestgardService } from '@app/services/configuracion/westgard.service';
import { DatePipe, NgFor, NgIf, NgClass, AsyncPipe, TitleCasePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { SharedService } from '@app/services/shared.service';
import { TestsService } from '@app/services/configuracion/test.service';
import { PublicService } from '@app/services/public.service';
import { ControlMaterialService } from '@app/services/configuracion/materialescontrol.service';
import { LotesService } from '@app/services/configuracion/lotes.service';
import { SeccionesService } from '@app/services/configuracion/secciones.service';
import { ToastrService } from 'ngx-toastr';
import { SedesService } from '../../../../../../services/configuracion/sedes.service';
import { map, startWith } from 'rxjs/operators';
import { Observable } from 'rxjs';
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
import { LoaderService } from '@app/services/loader/loader.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NombreTestPipe } from "../../../../../shared/pipe/nombre-test.pipe";
import { createLog } from '@app/globals/logUser';

@Component({
    selector: 'app-configuracion-westgard',
    templateUrl: './configuracion-westgard.component.html',
    styleUrls: ['./configuracion-westgard.component.css'],
    providers: [DatePipe],
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, MatFormFieldModule, MatSelectModule, MatOptionModule, NgFor, NgIf, MatInputModule, MatAutocompleteModule, MatTooltipModule, NgClass, MatTableModule, MatSortModule, MatSlideToggleModule, MatPaginatorModule, AsyncPipe, TitleCasePipe, TranslateModule, NombreLotePipe, NombreControlmaterialPipe, NombreSeccionPipe, ImageCdnPipe, NgxMatSelectSearchModule, NombreTestPipe]
})

export class ConfiguracionWestgardComponent implements OnInit {
  log = new createLog(this.datePipe, this.translate, this.westgardService);
  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();
  dateNowMilliseconds = this.dateNow.getTime();
  formaConfiguracionWestgard: FormGroup;
  formaFiltroConfigWestgard: FormGroup;

  ventanaModal: BsModalRef;
  accionEditar: any;
  accion: any;
  tituloAccion: any;
  messageError: any;
  messageNoEstado: String;
  datosEstados: any;
  messageSinDatos: string;
  titulo: string = '';
  aceptar: string = '';
  ok: string;
  test: number;
  text: string = '';
  ver: boolean = undefined;
  verBtn: boolean = false;
  lab: number;
  sec: number;
  mat: number;
  lote: number;
  intracorridaError: boolean = false;
  intercorridaError: boolean = false;



  listaWestgard = [];
  listaGestionTest = [];
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
  sedeId: number = 0;
  habilitarSede: boolean = false;

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

  dataSource: MatTableDataSource<any>;
  displayedColumns: string[] = ['code', 'notice', 'reject', 'disabled', 'intracorrida', 'intercorrida'];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  filterHeadquarters = new FormControl('');
  dataAnt: any;

  constructor(
    private sharedService: SharedService,
    private ventanaService: VentanasModalesService,
    private westgardService: WestgardService,
    private seccionesService: SeccionesService,
    private translate: TranslateService,
    private modalService: BsModalService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private testsService: TestsService,
    private configuracionWestgardService: ConfiguracionWestgardService,
    private publicService: PublicService,
    private controlMaterialService: ControlMaterialService,
    private lotesService: LotesService,
    private sedesService: SedesService,
    private datePipe: DatePipe,
    private loader: LoaderService) { }

  ngOnInit(): void {

    this.crearFormularioFiltroWestgard();
    this.cargarWestgard();
    this.cargarGestionTest();
    this.cargarSecciones();
    /*this.cargarLotes();
    this.cargarControlMaterial();*/
    this.cargarSedes();
    this.titulosSwal();
    //this.search();
    this.cargarSeccionesPre();
    this.sedeId = JSON.parse(sessionStorage.getItem('sede'));

    if (this.sedeId > 0) {
      this.formaFiltroConfigWestgard.controls['numLaboratorio'].setValue(this.sedeId);
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

      this.filteredOptionsSections = this.formaFiltroConfigWestgard.get('seccion').valueChanges.pipe(
        startWith(''),
        map(value =>{

          return this._filterSections(value)
        }),
      );
    });
  }

  async cambiarSeccion(NombreSeccion: string,idsection?:number){

    var namesection0 = this.formaFiltroConfigWestgard.get('seccion').setValue(NombreSeccion.split('|')[1]);
    var idsection0 = NombreSeccion.split('|')[0];
    this.idsectionspr = Number(idsection0);

    this.formaFiltroConfigWestgard.controls['numMaterialControl'].setValue('');
    this.formaFiltroConfigWestgard.controls['numLote'].setValue('');
      this.formaFiltroConfigWestgard.get('idtest').setValue('');

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

      this.filteredOptionsControlmaterial = this.formaFiltroConfigWestgard.get('numMaterialControl').valueChanges.pipe(
        startWith(''),
        map(value =>{

          return this._filterControlMaterial(value)
        }),
      );
    });

  }

  async cambiarControlMaterial(NombreControlmaterial: string,idcontrolmaterial?:number){

    var descontmat001 = this.formaFiltroConfigWestgard.get('numMaterialControl').setValue(NombreControlmaterial.split('|')[1]);
    var idcontmat = NombreControlmaterial.split('|')[0];
    this.idcontrolmaterialpr = Number(idcontmat);

  if (idcontmat != '') {

    this.formaFiltroConfigWestgard.get('numLote').reset('');
      this.formaFiltroConfigWestgard.get('idtest').setValue('');

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

      this.filteredOptionsLots = this.formaFiltroConfigWestgard.get('numLote').valueChanges.pipe(
        startWith(''),
        map(value =>{
          return this._filterLots(value)
        }),
      );
    });
  } else {

    this.lotesActive = [];
    this.formaFiltroConfigWestgard.get('numLote').setValue('');

  }
  }

  async lotesPre(nombreLote: string)
  {

    var desnumlot = this.formaFiltroConfigWestgard.get('numLote').setValue(nombreLote.split('|')[1]);
    var idlot0 = nombreLote.split('|')[0];
    this.idlotspr = Number(idlot0);

    this.formaFiltroConfigWestgard.get('numLaboratorio').valueChanges.subscribe(data => {

      this.ver = false;
      this.tests = [];

      if (data != '') {

        this.seccionesActive = this.secciones.filter(e => e.active);

        this.formaFiltroConfigWestgard.get('seccion').reset('');
        this.formaFiltroConfigWestgard.get('numMaterialControl').reset('');
        this.formaFiltroConfigWestgard.get('numLote').reset('');
      this.formaFiltroConfigWestgard.get('idtest').setValue('');

      } else {

        this.seccionesActive = [];
        this.controlMaterialActive = [];
        this.lotesActive = [];

        this.formaFiltroConfigWestgard.get('seccion').reset('');
        this.formaFiltroConfigWestgard.get('numMaterialControl').reset('');
        this.formaFiltroConfigWestgard.get('numLote').reset('');
      this.formaFiltroConfigWestgard.get('idtest').setValue('');

      }

    });

    this.formaFiltroConfigWestgard.get('seccion').valueChanges.subscribe(data => {

      this.ver = false;
      this.tests = [];

      if (data != '') {

        this.controlMaterialActive = this.controlMaterial.filter(e => e.active);

        this.formaFiltroConfigWestgard.get('numMaterialControl').reset('');
        this.formaFiltroConfigWestgard.get('numLote').reset('');
      this.formaFiltroConfigWestgard.get('idtest').setValue('');

      } else {

        this.controlMaterialActive = [];
        this.lotesActive = [];

        this.formaFiltroConfigWestgard.get('numMaterialControl').reset('');
        this.formaFiltroConfigWestgard.get('numLote').reset('');
      this.formaFiltroConfigWestgard.get('idtest').setValue('');

      }

    });

    this.formaFiltroConfigWestgard.get('numMaterialControl').valueChanges.subscribe(data => {

      this.ver = false;
      this.tests = [];

      if (data != '') {

        this.lotesActive = this.lotes.filter(e => e.active);

        this.formaFiltroConfigWestgard.get('numLote').reset('');

      } else {

        this.lotesActive = [];

        this.formaFiltroConfigWestgard.get('numLote').reset('');

      }

    });

    this.configuracionWestgardService.getTestFiltroConfigWestgard(this.sedeId, this.idsectionspr, this.idcontrolmaterialpr, this.idlotspr).subscribe(response => {

      this.tests = [];
      this.verBtn = false;
      for (let item of response) { 
        item.value = `${item.IdTest},${item.Desanalytes} | ${item.Desunits} | ${item.Desmethods} | ${item.Desreagents} | ${item.NameAnalyzer}`
      }
      this.tests = response;
      this.formaFiltroConfigWestgard.get('idtest').setValue('');

      this.filteredOptionsTest = this.formaFiltroConfigWestgard.get('idtest').valueChanges.pipe(
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
      //this.formaFiltroConfigWestgard.reset({ numLaboratorio: '', seccion: '', numMaterialControl: '', numLote: '' });
      this.tests = [];
      this.ver = false;

    });
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

  async cargarControlMaterial() {
    this.controlMaterial = await this.controlMaterialService.getAllAsync();

  }

  async cargarLotes() {
    this.lotes = await this.lotesService.getAllAsync();

  }

  get numLaboratorioNoValido() {
    return this.formaFiltroConfigWestgard.get('numLaboratorio');
  }

  get seccionNoValido() {
    return this.formaFiltroConfigWestgard.get('seccion');
  }

  get numMaterialControlNoValido() {
    return this.formaFiltroConfigWestgard.get('numMaterialControl');
  }

  get numLoteNoValido() {
    return this.formaFiltroConfigWestgard.get('numLote');
  }

  crearFormularioFiltroWestgard() {

    this.formaFiltroConfigWestgard = this.fb.group({

      numLaboratorio: ['', [Validators.required]],
      seccion: ['', [Validators.required]],
      numMaterialControl: ['', [Validators.required]],
      numLote: ['', [Validators.required]],
      idtest: ['']

    });

  }

  search() {

    this.formaFiltroConfigWestgard.get('numLaboratorio').valueChanges.subscribe(data => {

      if (data != '') {

        this.seccionesActive = this.secciones.filter(e => e.active);
        this.tests = [];
        this.ver = false;

        this.formaFiltroConfigWestgard.patchValue({ seccion: '', numMaterialControl: '', numLote: '' });

      } else {

        this.seccionesActive = [];
        this.controlMaterialActive = [];
        this.lotesActive = [];
        this.tests = [];
        this.ver = false;

        this.formaFiltroConfigWestgard.patchValue({ seccion: '', numMaterialControl: '', numLote: '' });

      }

    });

    this.formaFiltroConfigWestgard.get('seccion').valueChanges.subscribe(data => {

      if (data != '') {

        this.controlMaterialActive = this.controlMaterial.filter(e => e.active);
        this.tests = [];
        this.ver = false;

        this.formaFiltroConfigWestgard.patchValue({ numMaterialControl: '', numLote: '' });

      } else {

        this.controlMaterialActive = [];
        this.lotesActive = [];
        this.tests = [];
        this.ver = false;

        this.formaFiltroConfigWestgard.patchValue({ numMaterialControl: '', numLote: '' });

      }

    });

    this.formaFiltroConfigWestgard.get('numMaterialControl').valueChanges.subscribe(data => {

      if (data != '') {

        this.lotesActive = this.lotes.filter(e => e.active);
        this.tests = [];
        this.ver = false;

        this.formaFiltroConfigWestgard.patchValue({ numLote: '' });

      } else {

        this.lotesActive = [];
        this.tests = [];
        this.ver = false;

        this.formaFiltroConfigWestgard.patchValue({ numLote: '' });

      }

    });

    this.formaFiltroConfigWestgard.get('numLote').valueChanges.subscribe(data => {

      if (data != '') {

        this.ver = false;

        const { numLaboratorio, seccion, numMaterialControl } = this.formaFiltroConfigWestgard.value;

        this.lab = parseInt(numLaboratorio);
        this.sec = parseInt(seccion);
        this.mat = parseInt(numMaterialControl);
        this.lote = parseInt(data);

        this.configuracionWestgardService.getTestFiltroConfigWestgard(this.lab, this.sec, this.mat, this.lote).subscribe(response => {

          this.tests = [];
          this.verBtn = false;
          this.tests = response;

        }, error => {

          let arr = [];
          this.dataSource = new MatTableDataSource(arr);
          this.accion = 'noDatos';
          this.toastr.error('No se encontraron datos');
          //this.formaFiltroConfigWestgard.reset({ numLaboratorio: '', seccion: '', numMaterialControl: '', numLote: '' });
          this.tests = [];
          this.ver = false;
        });
      }
    });
  }

  setTest(test: any) {
    this.formaFiltroConfigWestgard.controls['idtest'].setValue(test.split(',')[1]);
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

    this.configuracionWestgardService.getBuscadorWestgard(this.test).subscribe(respuesta => {
      this.dataAnt = respuesta;
      this.dataSource = new MatTableDataSource(respuesta);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;

      setTimeout(() => {

        this.loader.hide();
        this.ver = true;

      }, 3000);

    }, error => {

      this.ver = true;
      this.dataSource = new MatTableDataSource([]);
      this.accion = 'noDatos';
      this.toastr.error('No se encontraron datos');
      this.loader.hide();

    });

  }

  openModal(descripcion) {
    const data = { descripcion: descripcion, accion: this.accion }
    this.ventanaService.openModal(data);
  }

  cargarConfiguracionWestgard() {

    this.configuracionWestgardService.getAllAsync().then(respuesta => {
      this.dataSource = new MatTableDataSource(respuesta.resultConfigwestgard);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  async cargarGestionTest() {
    this.listaGestionTest = await this.testsService.detalleTest();
  }

  cargarWestgard() {

    this.westgardService.getAllAsync().then(respuesta => {
      this.listaWestgard = respuesta.filter(datos => datos.active == true);
    });
  }

  get idwesgardrulesNoValido() {
    return this.formaConfiguracionWestgard.get('idwesgardrules');
  }

  get idTestNoValido() {
    return this.formaConfiguracionWestgard.get('idtest');
  }

  crearFormularioConfiguracionWestgard(datos: any) {

    this.formaConfiguracionWestgard = this.fb.group({

      idwesgardrulesconfiguration: [datos.Idwesgardrulesconfiguration ? datos.Idwesgardrulesconfiguration : ''],
      idwesgardrules: [datos.Idwesgardrules ? datos.Idwesgardrules : '', [Validators.required]],
      idtest: [datos.IdTest ? datos.IdTest : this.test, [Validators.required]],
      reject: [datos.reject ? datos.reject : false],
      notice: [datos.Notice ? datos.Notice : false],
      disabled: [datos.Disabled ? datos.Disabled : false],
      active: [datos.Active ? datos.Active : false],
      intracorrida: [datos.Intracorrida ? datos.Intracorrida : false],
      intercorrida: [datos.Intercorrida ? datos.Intercorrida : false],

    });

  }

  openModalconfiguracionWestgard(templateRegistroConfiguracionWestgard: TemplateRef<any>, datos: any) {
    this.crearFormularioConfiguracionWestgard(datos);

    this.ventanaModal = this.modalService.show(templateRegistroConfiguracionWestgard, { backdrop: 'static', keyboard: false });
    datos ? this.accionEditar = true : this.accionEditar = false;
    datos ? this.accion = "Editar" : this.accion = "Crear";
    datos ? this.translate.get('MODULES.CONFIGURACIONWESTGARD.FORMULARIO.ACTUALIZAR').subscribe(respuesta => this.tituloAccion = respuesta) : this.translate.get('MODULES.CONFIGURACIONWESTGARD.FORMULARIO.REGISTRAR').subscribe(respuesta => this.tituloAccion = respuesta);

  }

  actualizarEstadoWestgard(datosConfiWestgard, accion) {

    switch (accion) {
      case 1:
        if (!datosConfiWestgard.Notice) {
          this.datosEstados = {
            idwesgardrulesconfiguration: datosConfiWestgard.Idwesgardrulesconfiguration,
            idwesgardrules: datosConfiWestgard.Idwesgardrules,
            idTest: datosConfiWestgard.IdTest,
            notice: datosConfiWestgard.Notice ? false : true,
            reject: false,
            disabled: false,
            intercorrida: datosConfiWestgard.Intercorrida,
            intracorrida: datosConfiWestgard.Intracorrida,
            active: datosConfiWestgard.Active
          }
        } else {
          this.datosEstados = {
            idwesgardrulesconfiguration: datosConfiWestgard.Idwesgardrulesconfiguration,
            idwesgardrules: datosConfiWestgard.Idwesgardrules,
            idTest: datosConfiWestgard.IdTest,
            notice: datosConfiWestgard.Notice ? false : true,
            reject: false,
            disabled: datosConfiWestgard.Disabled ? false : true,
            intercorrida: datosConfiWestgard.Intercorrida,
            intracorrida: datosConfiWestgard.Intracorrida,
            active: datosConfiWestgard.Active
          }
        }

        break;

      case 2:
        if (!datosConfiWestgard.Reject) {
          this.datosEstados = {
            idwesgardrulesconfiguration: datosConfiWestgard.Idwesgardrulesconfiguration,
            idwesgardrules: datosConfiWestgard.Idwesgardrules,
            idTest: datosConfiWestgard.IdTest,
            notice: false,
            reject: datosConfiWestgard.Reject ? false : true,
            disabled: false,
            intercorrida: datosConfiWestgard.Intercorrida,
            intracorrida: datosConfiWestgard.Intracorrida,
            active: datosConfiWestgard.Active
          }
        } else {
          this.datosEstados = {
            idwesgardrulesconfiguration: datosConfiWestgard.Idwesgardrulesconfiguration,
            idwesgardrules: datosConfiWestgard.Idwesgardrules,
            idTest: datosConfiWestgard.IdTest,
            notice: false,
            reject: datosConfiWestgard.Reject ? false : true,
            disabled: datosConfiWestgard.Disabled ? false: true,
            intercorrida: datosConfiWestgard.Intercorrida,
            intracorrida: datosConfiWestgard.Intracorrida,
            active: datosConfiWestgard.Active
          }
        }

        break;

      case 3:

        this.datosEstados = {
          idwesgardrulesconfiguration: datosConfiWestgard.Idwesgardrulesconfiguration,
          idwesgardrules: datosConfiWestgard.Idwesgardrules,
          idTest: datosConfiWestgard.IdTest,
          notice: false,
          reject: false,
          disabled: datosConfiWestgard.Disabled ? false : true,
          intercorrida: datosConfiWestgard.Intercorrida,
          intracorrida: datosConfiWestgard.Intracorrida,
          active: datosConfiWestgard.Active
        }
        break;

      case 4:
        if (datosConfiWestgard.Code == '2-2s'
          || datosConfiWestgard.Code == '4-1s'
          || datosConfiWestgard.Code == 'R-4s'
          || datosConfiWestgard.Code == '7-T'
          || datosConfiWestgard.Code == '7-x'
          || datosConfiWestgard.Code == '8-x'
          || datosConfiWestgard.Code == '9-x'
          || datosConfiWestgard.Code == '10-x'
          || datosConfiWestgard.Code == '11-x'
          || datosConfiWestgard.Code == '12-x'
        ) {

          if (datosConfiWestgard.Intercorrida == false && datosConfiWestgard.Intracorrida == false) {

            this.datosEstados = {
              idwesgardrulesconfiguration: datosConfiWestgard.Idwesgardrulesconfiguration,
              idwesgardrules: datosConfiWestgard.Idwesgardrules,
              idTest: datosConfiWestgard.IdTest,
              notice: datosConfiWestgard.Notice,
              reject: datosConfiWestgard.Reject,
              disabled: datosConfiWestgard.Disabled,
              intercorrida: true,
              intracorrida: false,
              active: datosConfiWestgard.Active
            }

          } else if (datosConfiWestgard.Intercorrida == true && datosConfiWestgard.Intracorrida == true) {

            this.datosEstados = {
              idwesgardrulesconfiguration: datosConfiWestgard.Idwesgardrulesconfiguration,
              idwesgardrules: datosConfiWestgard.Idwesgardrules,
              idTest: datosConfiWestgard.IdTest,
              notice: datosConfiWestgard.Notice,
              reject: datosConfiWestgard.Reject,
              disabled: datosConfiWestgard.Disabled,
              intercorrida: false,
              intracorrida: true,
              active: datosConfiWestgard.Active
            }

          } else {

            this.datosEstados = {
              idwesgardrulesconfiguration: datosConfiWestgard.Idwesgardrulesconfiguration,
              idwesgardrules: datosConfiWestgard.Idwesgardrules,
              idTest: datosConfiWestgard.IdTest,
              notice: datosConfiWestgard.Notice,
              reject: datosConfiWestgard.Reject,
              disabled: datosConfiWestgard.Disabled,
              intercorrida: datosConfiWestgard.Intercorrida ? false : true,
              intracorrida: datosConfiWestgard.Intracorrida ? false : true,
              active: datosConfiWestgard.Active
            }

          }
        } else {
          this.intracorridaError = true

          this.datosEstados = {
            idwesgardrulesconfiguration: datosConfiWestgard.Idwesgardrulesconfiguration,
            idwesgardrules: datosConfiWestgard.Idwesgardrules,
            idTest: datosConfiWestgard.IdTest,
            notice: datosConfiWestgard.Notice,
            reject: datosConfiWestgard.Reject,
            disabled: datosConfiWestgard.Disabled,
            intercorrida: false,
            intracorrida: datosConfiWestgard.Intracorrida,
            active: datosConfiWestgard.Active
          }
        }

        break;

      case 5:
        if (datosConfiWestgard.Code == '2-2s'
          || datosConfiWestgard.Code == '7-T'
          || datosConfiWestgard.Code == '7-x'
          || datosConfiWestgard.Code == '8-x'
          || datosConfiWestgard.Code == '9-x'
          || datosConfiWestgard.Code == '10-x'
          || datosConfiWestgard.Code == '11-x'
          || datosConfiWestgard.Code == '12-x'
        ) {
          if (datosConfiWestgard.Intracorrida == false && datosConfiWestgard.Intercorrida == false) {

            this.datosEstados = {
              idwesgardrulesconfiguration: datosConfiWestgard.Idwesgardrulesconfiguration,
              idwesgardrules: datosConfiWestgard.Idwesgardrules,
              idTest: datosConfiWestgard.IdTest,
              notice: datosConfiWestgard.Notice,
              reject: datosConfiWestgard.Reject,
              disabled: datosConfiWestgard.Disabled,
              intercorrida: false,
              intracorrida: true,
              active: datosConfiWestgard.Active
            }

          } else if (datosConfiWestgard.Intracorrida == true && datosConfiWestgard.Intercorrida == true) {

            this.datosEstados = {
              idwesgardrulesconfiguration: datosConfiWestgard.Idwesgardrulesconfiguration,
              idwesgardrules: datosConfiWestgard.Idwesgardrules,
              idTest: datosConfiWestgard.IdTest,
              notice: datosConfiWestgard.Notice,
              reject: datosConfiWestgard.Reject,
              disabled: datosConfiWestgard.Disabled,
              intercorrida: true,
              intracorrida: false,
              active: datosConfiWestgard.Active
            }

          } else {

            this.datosEstados = {
              idwesgardrulesconfiguration: datosConfiWestgard.Idwesgardrulesconfiguration,
              idwesgardrules: datosConfiWestgard.Idwesgardrules,
              idTest: datosConfiWestgard.IdTest,
              notice: datosConfiWestgard.Notice,
              reject: datosConfiWestgard.Reject,
              disabled: datosConfiWestgard.Disabled,
              intercorrida: datosConfiWestgard.Intercorrida ? false : true,
              intracorrida: datosConfiWestgard.Intracorrida ? false : true,
              active: datosConfiWestgard.Active
            }

          }

        } else {
          this.intercorridaError = true
          this.datosEstados = {
            idwesgardrulesconfiguration: datosConfiWestgard.Idwesgardrulesconfiguration,
            idwesgardrules: datosConfiWestgard.Idwesgardrules,
            idTest: datosConfiWestgard.IdTest,
            notice: datosConfiWestgard.Notice,
            reject: datosConfiWestgard.Reject,
            disabled: datosConfiWestgard.Disabled,
            intercorrida: false,
            intracorrida: true,
            active: datosConfiWestgard.Active
          }
        }


        break;

      case 6:
        this.datosEstados = {
          idwesgardrulesconfiguration: datosConfiWestgard.Idwesgardrulesconfiguration,
          idwesgardrules: datosConfiWestgard.Idwesgardrules,
          idTest: datosConfiWestgard.IdTest,
          notice: datosConfiWestgard.Notice,
          reject: datosConfiWestgard.Reject,
          disabled: datosConfiWestgard.Disabled,
          intercorrida: datosConfiWestgard.Intercorrida,
          intracorrida: datosConfiWestgard.Intracorrida,
          active: datosConfiWestgard.Active ? false : true
        }
        break;

      default:
        break;
    }

    const datosAnteriores = this.dataAnt.find(x => x.Idwesgardrulesconfiguration == datosConfiWestgard.Idwesgardrulesconfiguration);
    
    if (this.intracorridaError == false && this.intercorridaError == false) {
      this.configuracionWestgardService.update(this.datosEstados, datosConfiWestgard.Idwesgardrulesconfiguration).subscribe(respuesta => {
        //this.cargarConfiguracionWestgard();
        this.loadData();
        this.accion = 'Editar';
        this.toastr.success('Estado actualizado', 'Actualización');
        this.log.logObj('Control Calidad Interno', 'Administración', 'Configuración de reglas de westgard', 'a', this.datosEstados, JSON.stringify(respuesta), 200, this.datosAnt(datosAnteriores));
        
      },err =>{
        this.toastr.error('No fue posible actualizar el estado', 'Error')
        this.log.logObj('Control Calidad Interno', 'Administración', 'Configuración de reglas de westgard', 'a', this.datosEstados, err.message, err.status, this.datosAnt(datosAnteriores));
      });
    } else if (this.intracorridaError == true) {
      this.loadData();
      this.toastr.error('Esta regla solo se aplica en intercorrida')
      this.intracorridaError = false
    }else{
      this.loadData();
      this.toastr.error('Esta regla debe estar activa en intercorrida')
      this.intercorridaError = false
    }

  }

  datosAnt(data: any) {
    return `Idwesgardrulesconfiguration: ${data.Idwesgardrulesconfiguration} - Code: ${data.Code} - Desanalytes: ${data.Desanalytes} - Desmethods: ${data.Desmethods} - Desreagents: ${data.Desreagents} - Desunits: ${data.Desunits} - NameAnalyzer: ${data.NameAnalyzer} - Disabled: ${data.Disabled} - Desanalytes: ${data.Desanalytes} - Intercorrida: ${data.Intercorrida} - Intracorrida: ${data.Intracorrida} - Notice: ${data.Notice} - Reject: ${data.Reject}`;
  }

  crearEditarConfiguracionWestgard() {
    if (!this.formaConfiguracionWestgard.invalid) {

      if (this.accion === 'Crear') {

        this.configuracionWestgardService.create(this.formaConfiguracionWestgard.value).subscribe(respuesta => {
          this.closeVentana();
          this.cargarConfiguracionWestgard();
          this.toastr.success('Registro creado');

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo: 'Control Calidad Interno',
            Submodulo: 'Administración',
            Item: 'Reglas de Westgard',
            Metodo:'creación',
            Datos: JSON.stringify(this.formaConfiguracionWestgard.value),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: 200,
            Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }

          this.configuracionWestgardService.createLogAsync(Loguser).then(respuesta => {

          });

        }, (error) => {

          console.log(error);

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo: 'Control Calidad Interno',
            Submodulo: 'Administración',
            Item: 'Reglas de Westgard',
            metodo: 'creación',
            datos: JSON.stringify(this.formaConfiguracionWestgard.value),
            respuesta: error.message,
            tipoRespuesta: error.status,
            Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }
          this.configuracionWestgardService.createLogAsync(Loguser).then(respuesta => {

          });
        });
      } else {
        this.configuracionWestgardService.update(this.formaConfiguracionWestgard.value, this.formaConfiguracionWestgard.value.idwesgardrulesconfiguration).subscribe(respuesta => {
          this.closeVentana();
          this.cargarConfiguracionWestgard();
          this.toastr.success('Registro actualizado');

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo: 'Control Calidad Interno',
            Submodulo: 'Administración',
            Item: 'Reglas de Westgard',
            Metodo: 'actualización',
            Datos: JSON.stringify(this.formaConfiguracionWestgard.value),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: 200,
            Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }

          this.configuracionWestgardService.createLogAsync(Loguser).then(respuesta => {

          });

        }, (error) => {

          console.log(error);

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo: 'Control Calidad Interno',
            Submodulo: 'Administración',
            Item: 'Reglas de Westgard',
            metodo: 'actualización',
            datos: JSON.stringify(this.formaConfiguracionWestgard.value),
            respuesta: error.message,
            tipoRespuesta: error.status,
            Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }
          this.configuracionWestgardService.createLogAsync(Loguser).then(respuesta => {

          });
        });
      }
    }
  }

  eliminarConfiguracionWestgard(id: any) {
    this.configuracionWestgardService.delete('Westgardrulesconfiguration', id).subscribe(respuesta => {

      this.cargarConfiguracionWestgard();
      this.accion = '';
      this.toastr.success('Registro eliminado');

      const Loguser = {
        Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
        hora: this.datePipe.transform(Date.now(), "shortTime"),
        Modulo: 'Control Calidad Interno',
        Submodulo: 'Administración',
        Item: 'Reglas de Westgard',
        metodo: 'eliminación',
        datos: JSON.stringify(id),
        respuesta: JSON.stringify(respuesta),
        tipoRespuesta: 200,
        Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
      }
      this.configuracionWestgardService.createLogAsync(Loguser).then(respuesta => {

      });
    },
      (err: HttpErrorResponse) => {

        this.toastr.error(this.messageError);

        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo: 'Control Calidad Interno',
          Submodulo: 'Administración',
          Item: 'Reglas de Westgard',
          metodo: 'eliminación',
          datos: JSON.stringify(id),
          respuesta: err.message,
          tipoRespuesta: err.status,
          Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
        this.configuracionWestgardService.createLogAsync(Loguser).then(respuesta => {
          console.log(respuesta);
        });
      });
  }

  closeVentana(): void {
    this.ventanaModal.hide();
  }

  titulosSwal() {
    this.translate.get('MODULES.SWAL.MESAGEERROR').subscribe(respuesta => this.messageError = respuesta);
    this.translate.get('MODULES.SWAL.ERRORESTADO').subscribe(respuesta => this.messageNoEstado = respuesta);
    this.translate.get('MODULES.SWAL.SINDATOS').subscribe(respuesta => this.messageSinDatos = respuesta);
    this.translate.get('MODULES.SWAL.TITULO_ERROR').subscribe(respuesta => this.titulo = `<b>${respuesta}</b>`);
    this.translate.get('MODULES.SWAL.ACEPTAR').subscribe(respuesta => this.aceptar = respuesta);
    this.translate.get('MODULES.SWAL.OK').subscribe(respuesta => this.ok = `<b>${respuesta}</b>`);


  }


  async materialControl(id: any) {
    this.formaFiltroConfigWestgard.controls['numMaterialControl'].setValue('');
    this.formaFiltroConfigWestgard.controls['numLote'].setValue('');

    (await this.sedesService.gebByIdSeccionMateriasSedeControl(id, this.sedeId)).subscribe((data: any) => {
      if (data.length > 0) {
        this.controlMaterialActive = data;

        this.controlMaterialActive = this.controlMaterialActive.filter(e => e.Active == true);
        this.lotesActive = [];

      }
    }, (err: any) => {
      this.controlMaterialActive = [];
    });
  }

  async lotesFun(id: any) {

    this.formaFiltroConfigWestgard.controls['numLote'].setValue('');
    (await this.sedesService.gebByIdMaterialSedeLote(id, this.sedeId)).subscribe((data: any) => {
      console.log("Lote", data)
      if (data.length > 0) {
        this.lotesActive = data;
        this.lotesActive = this.lotesActive.filter(e => e.Active == true);
      }
    }, (err: any) => {
      this.lotesActive = [];
    });
  }

}
