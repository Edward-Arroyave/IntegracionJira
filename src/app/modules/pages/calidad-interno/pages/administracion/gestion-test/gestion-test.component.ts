import { Component, OnInit, ViewChild, TemplateRef, Input, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SharedService } from '@app/services/shared.service';
import { DatePipe, NgIf, NgFor, NgClass, AsyncPipe, NgTemplateOutlet } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { TestsService } from '@app/services/configuracion/test.service';
import { ControlMaterialService } from '@app/services/configuracion/materialescontrol.service';
import { AnalitosService } from '@app/services/configuracion/analitos.service';
import { MetodosService } from '@app/services/configuracion/metodos.service';
import { Unidadeservice } from '@app/services/configuracion/unidades.service';
import { ReactivosService } from '@app/services/configuracion/reactivos.service';
import { InstrumentosService } from '@app/services/configuracion/instrumentos.service';
import { DetalleTestInterface } from '@app/interfaces/detalleTest.interface';
import { SedesXUserService } from '@app/services/configuracion/sedesxuser.service';
import { SedesService } from '@app/services/configuracion/sedes.service';
import { AnalizadoresService } from '@app/services/configuracion/analizadores.service';
import { VentanasModalesService } from '@app/services/general/ventanas-modales.service';
import { LotMatControlService } from '../../../../../../services/configuracion/lotmatcontrol.service';
import { ToastrService } from 'ngx-toastr';
import { LotesService } from '../../../../../../services/configuracion/lotes.service';
import { PrecargaService } from '@app/services/post-analitico/precarga.service';
import { ConfiguracionObjetivosAnalitoService } from '@app/services/configuracion/configuracion-objetivos-analito.service';
import dayjs from 'dayjs';
import { SelectionModel } from '@angular/cdk/collections';
import { SeccionesService } from '@app/services/configuracion/secciones.service';
import { map, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';
import { lastValueFrom, Observable, of, Subject } from 'rxjs';
import { ImageCdnPipe } from '../../../../../core/pipes/image-cdn.pipe';
import { NombreUnidadPipe } from '../../../../../shared/pipe/nombre-unidad.pipe';
import { NombreReactivoPipe } from '../../../../../shared/pipe/nombre-reactivo.pipe';
import { NombreMetodoPipe } from '../../../../../shared/pipe/nombre-metodo.pipe';
import { NombreAnalyzerPipe } from '../../../../../shared/pipe/nombre-analizer.pipe';
import { NombreAnalitoPipe } from '../../../../../shared/pipe/nombre-analito.pipe';
import { NombreSedePipe } from '../../../../../shared/pipe/nombre-sede.pipe';
import { NombreControlmaterialPipe } from '../../../../../shared/pipe/nombre-contmat.pipe';
import { NombreLotePipe } from '../../../../../shared/pipe/nombre-lote.pipe';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatOptionModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TablaComunComponent } from '@app/modules/shared/general-tablas/tabla-comun/tabla-comun.component';
import { MatDialog } from '@angular/material/dialog';
import { ModalData } from '@app/Models/Modaldata';
import { ModalGeneralComponent } from '@app/modules/shared/modals/modal-general/modal-general.component';
import { LoaderService } from '@app/services/loader/loader.service';
import { MatIcon } from '@angular/material/icon';
import { createLog } from '@app/globals/logUser';


@Component({
    selector: 'app-gestion-test',
    templateUrl: './gestion-test.component.html',
    styleUrls: ['./gestion-test.component.css'],
    providers: [DatePipe],
    standalone: true,
    imports: [
      MatFormFieldModule,
      MatInputModule,
      MatTableModule,
      MatSortModule,
      MatSlideToggleModule,
      MatPaginatorModule,
      NgIf,
      FormsModule,
      ReactiveFormsModule,
      MatAutocompleteModule,
      NgFor,
      MatOptionModule,
      MatTooltipModule,
      NgClass,
      MatDatepickerModule,
      MatSelectModule,
      AsyncPipe,
      TranslateModule,
      NombreLotePipe,
      NombreControlmaterialPipe,
      NombreSedePipe,
      NombreAnalitoPipe,
      NombreAnalyzerPipe,
      NombreMetodoPipe,
      NombreReactivoPipe,
      NombreUnidadPipe,
      ImageCdnPipe,
      TablaComunComponent,
      NgTemplateOutlet,
      DatePipe,
      MatIcon
    ]
})


export class GestionTestComponent implements OnInit {
  log = new createLog(this.datePipe, this.translate, this.testsService);

  @Input() lotmatconrol: string = '';
  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();
  formularioTest: FormGroup;
  formularioLote: FormGroup;
  listAnalytesxId: any;
  listAnalytes: any;
  analytesActive: any;
  listAnalizador: any;
  analyzerActive: any;
  today = dayjs().format('YYYY-MM-DD');
  listMetodos: any;
  idLote: any;
  idControl: any = 0;
  lotesMultiples: any = []
  consulta: boolean = true
  lotes: any;
  lotesNuevo: any;
  listlotes: any;

  metodosActive: any;
  listUnidadMedida: any;
  unitsActive: any;
  listReactivo: any;
  reagentsActive: any;
  lotActive: any;
  listaControlmaterial: any;
  controlmaterialActive: any;
  listSedes: any;
  selection: any;
  sedesActive: any;
  controlCalidadDuplicar: any;

  detalleTest: any[];
  testsActive = [];
  accionEditar: any;
  accion: any;
  tituloAccion: any;
  tituloLote: any;
  desactivar = true;
  desactivarTest = true;
  desactivarTestCreado = true
  verbtncrearlote: boolean = false;
  nodup: boolean = false;
  verbtn: boolean = true;
  vantanaModal: BsModalRef;
  titulo: any;
  text: any;
  filteredOptions: Observable<string[]>;
  filteredOptionsNuevo: Observable<string[]>;
  filteredOptionsControlMaterial: Observable<string[]>;
  filteredOptionsControlMaterialEdit: Observable<string[]>;
  filteredOptionsLots: Observable<string[]>;
  filteredOptionsLotsEdit: Observable<string[]>;
  filteredOptionsSedes: Observable<string[]>;
  filteredOptionsSedesEdit: Observable<string[]>;
  filteredOptionsAnalitos: Observable<string[]>;
  filteredOptionsAnalitosEdit: Observable<string[]>;
  filteredOptionsAnalizadores: Observable<string[]>;
  filteredOptionsAnalizadoresEdit: Observable<string[]>;
  filteredOptionsMethods: Observable<string[]>;
  filteredOptionsMethodsEdit: Observable<string[]>;
  filteredOptionsReagents: Observable<string[]>;
  filteredOptionsReagentsEdit: Observable<string[]>;
  filteredOptionsUnits: Observable<string[]>;
  filteredOptionsUnitsEdit: Observable<string[]>;
  tituloanalito: any;
  textanalito: any;
  textadd: any;
  textError: any;
  cancelar: any;
  confirmar: any;
  est: boolean = false;
  messageError: any;
  aceptar: any;
  equipos: any = [];
  visibleDuplicar: boolean = false;
  dataModalDetalles: any;
  loteSeleccionado: number = 0
  idcontmatpr: number;
  contmatprname: any;
  idcontmatpredit: number;
  nombrecontmat: any;
  idlotpr: number;
  numlote: any;
  idsedepr: number;
  descsede: any;
  idanalitopr: number;
  desanalito: any;
  idanalyzerpr: number;
  desanalyzer: any;
  idmethospr: number;
  desmetodo: any;
  idreagentspr: number;
  desreactivo: any;
  idunitspr: number;
  desunit: any;

  //control btn open modal
  openmodales: boolean = false;

  desactivarbtnaceptar : boolean = false;

  //log datos anteriores
  testant: any;
  analitoant: any;
  lotant: any;
  sectionant: any;
  levelant: any;
  idsectionant: any;
  idtestant: any;
  idanalyteant: any;
  idlotant: any;

  //log datos nuevos
  testnew: any;
  analitonew: any;
  lotnew: any;
  sectionnew: any;
  levelnew: any;
  idsectionnew: any;

  idlote001: any;
  listcontrolmaterial: any;
  listcontrolmaterialedit: any;
  listsedes: any;
  listanalitos: any;
  listanalyzers: any;
  listmethodos: any;
  listreagentspr: any;
  listunitspr: any;
  listalotesactive: any;

  
  displayedColumnsTabla: string[] = ['control'];
  dataSourcesTabla: MatTableDataSource<any>;
  selections = new SelectionModel<any>(true, []);
  items: any[]
  displayedColumns: string[] = ['Detalles', 'Analito | Analizador | Control Material | Lote', 'Estado', 'Editar', 'Eliminar'];
  dataSource: MatTableDataSource<any>;
  dataTableBody:any[]=[];
  dataTableNuevoLote:any[]=[];

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  verLoteFlag= signal<boolean>(false)


  formularioSerial = this.fb.group({
    controlmaterial: ['', [Validators.required]],
  });
  formularioTestEdit: FormGroup = this.fb.group({
    idTest: [],
    idControlMaterial: [, [Validators.required]],
    idLot: [, [Validators.required]],
    idheadquarters: [, [Validators.required]],
    idanalytes: [, [Validators.required]],
    idAnalyzer: [, [Validators.required]],
    idreagents: [, [Validators.required]],
    idmethods: [, [Validators.required]],
    idunits: [, [Validators.required]],
    decimals: [, [Validators.required, Validators.min(0)]],
    level: [, [Validators.required, Validators.min(1), Validators.max(3), Validators.pattern(/^\d+$/)]],
    homologation: [],
    active: [],
  });
  dataAnt: any;

  constructor(private datePipe: DatePipe,
    private translate: TranslateService,
    private testsService: TestsService,
    private analitosService: AnalitosService,
    private unidadeservice: Unidadeservice,
    private reactivosService: ReactivosService,
    private ControlMaterialService: ControlMaterialService,
    private metodosService: MetodosService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private modalService: BsModalService,
    private sharedService: SharedService,
    private InstrumentosService: InstrumentosService,
    private lotMatCtrlService: LotMatControlService,
    private sedesXUserService: SedesXUserService,
    private ventanaService: VentanasModalesService,
    private lotesService: LotesService,
    private seccionesService: SeccionesService,
    private SedesService: SedesService,
    private AnalizadoresService: AnalizadoresService,
    private dialog:MatDialog,
    private loader:LoaderService
  ) {

  }

  ngOnInit(): void {

    this.titulosSwal();
    this.titulosSinAnalitosxIdLotMatSwal();
    this.sharedService.customTextPaginator(this.paginator);
    this.cargarAnalites();
    this.cargarAnalizador();
    this.cargarMetodos();
    this.cargarReactivos();
    this.cargarUnidadMedida();
    this.obtenerControlMaterial();
    this.crearFormularioGestionTest('');
    this.cargarGestionTest();
    this.obtenerSedes();
    this.obtenerlotes();
  }

  ampliar(id: any, accion: boolean) {

    let span = document.getElementById(id) as HTMLSpanElement;

    if (accion) {
      span.classList.add('classToltipClose');
    } else {
      span.classList.remove('classToltipClose');
    }

  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourcesTabla.filter = filterValue.trim().toLowerCase();
  }

  private _filterControlMaterial(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.listcontrolmaterial
      .filter(contmat =>
        contmat.descontmat.toLowerCase().includes(filterValue)).filter(e => e.Active == true)

  }

  private _filterControlMaterialEdit(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.controlmaterialActive
      .filter(contmat => contmat.descontmat.toLowerCase().includes(filterValue))

  }

  private _filterlistlot(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.listlotes
      .filter(lot => lot.Numlot.toLowerCase().includes(filterValue)).filter(e => e.Active == true)

  }

  private _filterLoteEdit(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.lotActive
      .filter(lote => lote.Numlot.toLowerCase().includes(filterValue))

  }

  private _filterlistSedesxUser(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.listSedes
      .filter(sede => sede.desheadquarters.toLowerCase().includes(filterValue)).filter(e => e.Active == true)

  }

  private _filterlistSedesxUserEdit(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.sedesActive
      .filter(sede => sede.desheadquarters.toLowerCase().includes(filterValue)).filter(e => e.active == true)

  }

  private _filterlistAnalitos(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.listanalitos
      .filter(analito => analito.Desanalyte.toLowerCase().includes(filterValue)).filter(e => e.Active == true)

  }

  private _filterlistAnalitosEdit(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.analytesActive
      .filter(analito => analito.desanalytes.toLowerCase().includes(filterValue)).filter(e => e.active == true)

  }

  private _filterlistAnalyzer(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.listanalyzers
      .filter(analizer => analizer.Desanalyzer.toLowerCase().includes(filterValue)).filter(e => e.Active == true)

  }

  private _filterlistAnalyzerEdit(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.analyzerActive
      .filter(analizer => analizer.nameAnalyzer.toLowerCase().includes(filterValue)).filter(e => e.active == true)

  }

  private _filterlistMethods(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.listMetodos
      .filter(metodos => metodos.Desmethods.toLowerCase().includes(filterValue)).filter(e => e.Active == true)

  }

  private _filterlistMethodsEdit(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.metodosActive
      .filter(metodos => metodos.desmethods.includes(filterValue)).filter(e => e.active == true)

  }

  private _filterlistReagents(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.listreagentspr
      .filter(reagents => reagents.Desreagents.toLowerCase().includes(filterValue)).filter(e => e.Active == true)

  }

  private _filterlistReagentsEdit(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.reagentsActive
      .filter(reagents => reagents.desreagents.toLowerCase().includes(filterValue)).filter(e => e.active == true)

  }

  private _filterlistUnits(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.listunitspr
      .filter(units => units.Desunits.toLowerCase().includes(filterValue)).filter(e => e.Active == true)

  }

  private _filterlistUnitsEdit(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.unitsActive
      .filter(units => units.desunits.toLowerCase().includes(filterValue)).filter(e => e.active == true)

  }

  async cargarListControlMaterial() {
    this.listcontrolmaterial = this.ControlMaterialService.getAllAsync().then(res => res).catch(_ => []);
  }


  async cargarGestionTest() {

    this.detalleTest = await this.testsService.detalleTest();
    this.dataAnt = this.detalleTest;

    this.dataTableBody = this.detalleTest.map( x =>  {
     let dtImportant = x.Desanalytes + ' | ' + x.NameAnalyzer + ' | ' + x.Descontmat + ' | ' + x.Numlot;
      return { Detalles:x,'Analito | Analizador | Control Material | Lote':dtImportant,Estado:x.Active, item:x,item4:x,item5:x,item6:x};
    });
    this.dataSource = new MatTableDataSource(this.detalleTest);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

  }

  private _filter(value: string, idLote: number): string[] {
    const filterValue = value;
    return this.lotes.filter((equipo: any) => equipo.Numlot.includes(filterValue));
  }

  private _filterNuevo(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.lotesNuevo.filter(equipo => equipo.Numlot.toLowerCase().includes(filterValue));
  }

  // get lotes
  async getLots(idCtrlMat: any) {

    const filterValue = idCtrlMat;

    if (idCtrlMat != '') {

      let nuevaData = this.formularioTestEdit.value;
      let arrcontrolmaterial = this.controlmaterialActive.sort((a, b) => {
        a.descontmat = a.descontmat.charAt(0).toLowerCase() + a.descontmat.slice(1);
        b.descontmat = b.descontmat.charAt(0).toLowerCase() + b.descontmat.slice(1);

      })
      arrcontrolmaterial.sort((a, b) => {
        if (a.descontmat < b.descontmat) return -1;
        if (a.descontmat > b.descontmat) return 1;
        return 0;
      })

      arrcontrolmaterial.filter(result => {
        if (result.descontmat.toLowerCase() === idCtrlMat.toLowerCase()) {
          nuevaData.idControlMaterial = result.idControlMaterial;
          return
        }
        return
      })

      this.formularioTest.get('idLot').reset('');
      let id: number = parseInt(nuevaData.idControlMaterial);
      this.lotMatCtrlService.filtroLotePorMC(id).subscribe(lotes => {

        this.lotActive = lotes;

        if (this.lotActive.length) {
          this.lotActive.sort((a, b) => {
            if (a.Numlot < b.Numlot) return -1;
            if (a.Numlot > b.Numlot) return 1;
            return 0;
          })

          this.filteredOptionsLotsEdit = this.formularioTestEdit.get('idLot').valueChanges.pipe(
            startWith(''),
            map(value => {
              return this._filterLoteEdit(value)
            }),
          );
        }
      })


    } else {

      this.lotActive = [];
      this.formularioTest.get('idLot').setValue('');

    }

  }

  // set level test by select analitos
  setLevel(idanalito: string) {
    this.formularioTest.get('idanalytes').setValue(idanalito.split('|')[1]);
    var idanalyte001 = idanalito.split('|')[0];
    var idanalitoenv = Number(idanalito.split('|')[0]);
    this.idanalitopr = idanalitoenv;
  }

  //list
  async obtenerControlMaterial() {
    this.listaControlmaterial = await this.ControlMaterialService.getAllAsync();
    this.controlmaterialActive = this.listaControlmaterial.filter(e => e.active == true);
    this.controlmaterialActive.sort((a, b) => {
      a.descontmat = a.descontmat.charAt(0).toLowerCase() + a.descontmat.slice(1);
      b.descontmat = b.descontmat.charAt(0).toLowerCase() + b.descontmat.slice(1);
    })
    this.controlmaterialActive.sort((a, b) => {
      if (a.descontmat < b.descontmat) return -1;
      if (a.descontmat > b.descontmat) return 1;
      return 0;
    })
  }

  //list
  async obtenerlotes() {
    this.listalotesactive = await this.lotesService.getAllAsync();
    this.listalotesactive = this.listalotesactive.filter(e => e.active == true);
    this.listalotesactive.sort((a, b) => {
      a.numlot = a.numlot.charAt(0).toLowerCase() + a.numlot.slice(1);
      b.numlot = b.numlot.charAt(0).toLowerCase() + b.numlot.slice(1);
    })
    this.listalotesactive.sort((a, b) => {
      if (a.numlot < b.numlot) return -1;
      if (a.numlot > b.numlot) return 1;
      return 0;
    })
  }

  async obtenerSedes() {

    let idUser: number = parseInt(sessionStorage.getItem('userid'));
    this.listSedes = await this.sedesXUserService.getByIdAsync(idUser);
    this.sedesActive = this.listSedes.filter(e => e.active == true);

  }

  async obtenerControlCalidad() {

    let idUser: number = parseInt(sessionStorage.getItem('userid'));

    this.listSedes = await this.sedesXUserService.getByIdAsync(idUser);
    this.sedesActive = this.listSedes.filter(e => e.active == true);

    if (this.sedesActive.length = 1) {
      this.sedesActive[0].desheadquarters = this.sedesActive[0].desheadquarters.charAt(0).toUpperCase() + this.sedesActive[0].desheadquarters.slice(1);
    }
    this.sedesActive.sort((a, b) => {
      a.desheadquarters = a.desheadquarters.charAt(0).toLowerCase() + a.desheadquarters.slice(1);
      b.desheadquarters = b.desheadquarters.charAt(0).toLowerCase() + b.desheadquarters.slice(1);
    })
    this.sedesActive.sort((a, b) => {
      if (a.desheadquarters < b.desheadquarters) return -1;
      if (a.desheadquarters > b.desheadquarters) return 1;
      return 0;
    })
  }
  async cargarAnalites() {
    this.listAnalytes = await this.analitosService.getAllAsync();
    this.analytesActive = this.listAnalytes.filter(e => e.active);
    this.analytesActive.sort((a, b) => {
      a.desanalytes = a.desanalytes.charAt(0).toLowerCase() + a.desanalytes.slice(1);
      b.desanalytes = b.desanalytes.charAt(0).toLowerCase() + b.desanalytes.slice(1);
    })
    this.analytesActive.sort((a, b) => {
      if (a.desanalytes < b.desanalytes) return -1;
      if (a.desanalytes > b.desanalytes) return 1;

      return 0;
    })
  }

  async cargarAnalizador() {
    this.listAnalizador = await this.InstrumentosService.getAllAsync();
    this.analyzerActive = this.listAnalizador.filter(e => e.active);

    this.analyzerActive.sort((a, b) => {
      a.nameAnalyzer = a.nameAnalyzer.charAt(0).toLowerCase() + a.nameAnalyzer.slice(1);
      b.nameAnalyzer = b.nameAnalyzer.charAt(0).toLowerCase() + b.nameAnalyzer.slice(1);
    })
    this.analyzerActive.sort((a, b) => {
      if (a.nameAnalyzer < b.nameAnalyzer) return -1;
      if (a.nameAnalyzer > b.nameAnalyzer) return 1;
      return 0;
    })
  }

  async cargarMetodos() {
    this.listMetodos = await this.metodosService.getAllAsync();
    this.metodosActive = this.listMetodos.filter(e => e.active == true);
    if (this.metodosActive.length > 0) {
      this.metodosActive.sort((a, b) => {
        a.desmethods = a.desmethods.charAt(0).toLowerCase() + a.desmethods.slice(1);
        b.desmethods = b.desmethods.charAt(0).toLowerCase() + b.desmethods.slice(1);
      })
    }

    this.metodosActive.sort((a, b) => {
      if (a.desmethods < b.desmethods) return -1;
      if (a.desmethods > b.desmethods) return 1;
      return 0;
    })
  }

  async cargarUnidadMedida() {
    this.listUnidadMedida = await this.unidadeservice.getAllAsync();
    this.unitsActive = this.listUnidadMedida.filter(e => e.active);

    this.unitsActive.sort((a, b) => {
      a.desunits = a.desunits.charAt(0).toLowerCase() + a.desunits.slice(1);
      b.desunits = b.desunits.charAt(0).toLowerCase() + b.desunits.slice(1);
    })
    this.unitsActive.sort((a, b) => {
      if (a.desunits < b.desunits) return -1;
      if (a.desunits > b.desunits) return 1;
      return 0;
    })
  }

  async cargarReactivos() {
    this.listReactivo = await this.reactivosService.getAllAsync();
    this.reagentsActive = this.listReactivo.filter(e => e.active == true);

    this.reagentsActive.sort((a, b) => {
      a.desreagents = a.desreagents.charAt(0).toLowerCase() + a.desreagents.slice(1);
      b.desreagents = b.desreagents.charAt(0).toLowerCase() + b.desreagents.slice(1);
    })

    this.reagentsActive.sort((a, b) => {
      if (a.desreagents < b.desreagents) return -1;
      if (a.desreagents > b.desreagents) return 1;
      return 0;
    })
  }

  //validators FormularioTest
  get lotmatcontrolForm() {
    return this.formularioTest.get('idControlMaterial');
  }

  get lotForm() {
    return this.formularioTest.get('idLot');
  }

  get sedeForm() {
    return this.formularioTest.get('idheadquarters');
  }

  get idAnalytesForm() {
    return this.formularioTest.get('idanalytes');
  }
  get idAnalyzerForm() {
    return this.formularioTest.get('idAnalyzer');
  }

  get idMethodsForm() {
    return this.formularioTest.get('idmethods');
  }

  get idregentsForm() {
    return this.formularioTest.get('idreagents');
  }

  get idUnitsForm() {
    return this.formularioTest.get('idunits');
  }


  get decimalsForm() {
    return this.formularioTest.get('decimals');
  }

  //validators FormularioTestEdit
  get lotmatcontrolFormEdit() {
    return this.formularioTestEdit.get('idControlMaterial');
  }

  get lotFormEdit() {
    return this.formularioTestEdit.get('idLot');
  }

  get sedeFormEdit() {
    return this.formularioTestEdit.get('idheadquarters');
  }

  get idAnalytesFormEdit() {
    return this.formularioTestEdit.get('idanalytes');
  }
  get idAnalyzerFormEdit() {
    return this.formularioTestEdit.get('idAnalyzer');
  }

  get idMethodsFormEdit() {
    return this.formularioTestEdit.get('idmethods');
  }

  get idregentsFormEdit() {
    return this.formularioTestEdit.get('idreagents');
  }

  get idUnitsFormEdit() {
    return this.formularioTestEdit.get('idunits');
  }


  get decimalsFormEdit() {
    return this.formularioTestEdit.get('decimals');
  }

  get levelFormEdit() {
    return this.formularioTestEdit.get('level');
  }

  openModalDetalleGestionTest(templateDetallesGestionTest: TemplateRef<any>, datos: DetalleTestInterface) {

    if (datos.Active == true) {

      this.est = true;

    } else {

      this.est = false;

    }
    this.dataModalDetalles = datos;

    //Se comentarea if de openmodales
    //if (this.openmodales === false) {
      const destroy$: Subject<boolean> = new Subject<boolean>();
      /* Variables recibidas por el modal */
      const data: ModalData = {
        content: templateDetallesGestionTest,
        btn: null,
        btn2: 'Cerrar',
        footer:true,
        title: 'Detalle',
        image:'assets/rutas/iconos/editar.png'
      };
      this.dialog.open(ModalGeneralComponent, { height:'auto' ,width: '60em', data, disableClose: true });
  
    //}

  }

  async openModalGestionTest(templateGestionTest: TemplateRef<any>, datos: any) {

    if (datos != '') {
      this.testsService.getByIdAsync(datos).then((test: any) => {
        this.crearFormularioGestionTest(test);
      });
    } else {
      this.lotActive = [];
      this.crearFormularioGestionTest(datos);
    }

    this.loader.show();
    await this.ControlMaterialService.getAllAsyncControlMaterial().then(data => {
      this.listcontrolmaterial = data.filter(e => e.Active == true);

      this.consulta = true
      this.listcontrolmaterial.sort((a: any, b: any) => {
        a.descontmat = a.descontmat.charAt(0) + a.descontmat.slice(1);
        b.descontmat = b.descontmat.charAt(0) + b.descontmat.slice(1);
      })

      this.listcontrolmaterial.sort((a: any, b: any) => {
        if (a.descontmat < b.descontmat) return -1;
        if (a.descontmat > b.descontmat) return 1;
        return 0;
      })

      this.filteredOptionsControlMaterial = this.formularioTest.get('idControlMaterial').valueChanges.pipe(
        startWith(''),
        map(value => {
          return this._filterControlMaterial(value)
        }),
      );
    });

    let idUser: number = parseInt(sessionStorage.getItem('userid'));
    await this.SedesService.getAllAsyncHeadquarters(idUser).then(data => {
      this.listSedes = data.filter(e => e.Active == true);

      this.consulta = true
      this.listSedes.sort((a: any, b: any) => {
        a.desheadquarters = a.desheadquarters.charAt(0) + a.desheadquarters.slice(1);
        b.desheadquarters = b.desheadquarters.charAt(0) + b.desheadquarters.slice(1);
      })

      this.listSedes.sort((a: any, b: any) => {
        if (a.desheadquarters < b.desheadquarters) return -1;
        if (a.desheadquarters > b.desheadquarters) return 1;
        return 0;
      })

      this.filteredOptionsSedes = this.formularioTest.get('idheadquarters').valueChanges.pipe(
        startWith(''),
        map(value => {

          return this._filterlistSedesxUser(value)
        }),
      );
    });

    await this.analitosService.getAllAsyncAnalytes().then(data => {
      this.listanalitos = data.filter(e => e.Active == true);

      this.consulta = true

      this.listanalitos.sort((a: any, b: any) => {
        a.Desanalyte = a.Desanalyte.charAt(0) + a.Desanalyte.slice(1);
        b.Desanalyte = b.Desanalyte.charAt(0) + b.Desanalyte.slice(1);
      })

      this.listanalitos.sort((a: any, b: any) => {
        if (a.Desanalyte < b.Desanalyte) return -1;
        if (a.Desanalyte > b.Desanalyte) return 1;
        return 0;
      })

      this.filteredOptionsAnalitos = this.formularioTest.get('idanalytes').valueChanges.pipe(
        startWith(''),
        map(value => {
          return this._filterlistAnalitos(value)
        }),
      );
    });

    await this.AnalizadoresService.getAllAsyncAnalyzers().then(data => {
      this.listanalyzers = data.filter(e => e.Active == true);

      this.consulta = true

      this.listanalyzers.sort((a: any, b: any) => {
        a.Desanalyzer = a.Desanalyzer.charAt(0) + a.Desanalyzer.slice(1);
        b.Desanalyzer = b.Desanalyzer.charAt(0) + b.Desanalyzer.slice(1);
      })

      this.listanalyzers.sort((a: any, b: any) => {
        if (a.Desanalyzer < b.Desanalyzer) return -1;
        if (a.Desanalyzer > b.Desanalyzer) return 1;
        return 0;
      })

      this.filteredOptionsAnalizadores = this.formularioTest.get('idAnalyzer').valueChanges.pipe(
        startWith(''),
        map(value => {
          return this._filterlistAnalyzer(value)
        }),
      );
    });

    await this.metodosService.getAllAsyncMethods().then(data => {
      this.listMetodos = data.filter(e => e.Active == true);

      this.consulta = true

      this.listMetodos.sort((a: any, b: any) => {
        a.Desmethods = a.Desmethods.charAt(0) + a.Desmethods.slice(1);
        b.Desmethods = b.Desmethods.charAt(0) + b.Desmethods.slice(1);
      })

      this.listMetodos.sort((a: any, b: any) => {
        if (a.Desmethods < b.Desmethods) return -1;
        if (a.Desmethods > b.Desmethods) return 1;
        return 0;
      })

      this.filteredOptionsMethods = this.formularioTest.get('idmethods').valueChanges.pipe(
        startWith(''),
        map(value => {
          return this._filterlistMethods(value)
        }),
      );
    });

    await this.reactivosService.getAllAsyncReactivos().then(data => {
      this.listreagentspr = data.filter(e => e.Active == true);

      this.consulta = true

      this.listreagentspr.sort((a: any, b: any) => {
        a.Desreagents = a.Desreagents.charAt(0) + a.Desreagents.slice(1);
        b.Desreagents = b.Desreagents.charAt(0) + b.Desreagents.slice(1);
      })

      this.listreagentspr.sort((a: any, b: any) => {
        if (a.Desreagents < b.Desreagents) return -1;
        if (a.Desreagents > b.Desreagents) return 1;
        return 0;
      })

      this.filteredOptionsReagents = this.formularioTest.get('idreagents').valueChanges.pipe(
        startWith(''),
        map(value => {
          return this._filterlistReagents(value)
        }),
      );
    });

    await this.unidadeservice.getAllAsyncUnits().then(data => {
      this.listunitspr = data.filter(e => e.Active == true);

      this.consulta = true

      this.listunitspr.sort((a: any, b: any) => {
        a.Desunits = a.Desunits.charAt(0) + a.Desunits.slice(1);
        b.Desunits = b.Desunits.charAt(0) + b.Desunits.slice(1);
      })

      this.listunitspr.sort((a: any, b: any) => {
        if (a.Desunits < b.Desunits) return -1;
        if (a.Desunits > b.Desunits) return 1;
        return 0;
      })

      this.filteredOptionsUnits = this.formularioTest.get('idunits').valueChanges.pipe(
        startWith(''),
        map(value => {
          return this._filterlistUnits(value)
        }),
      );
    });


    this.idtestant = this.formularioTestEdit.get('idTest').value;
    if (datos.idtest != null) {
      this.testsService.gettest(datos).subscribe((datatest) => {
        this.idanalyteant = datatest.idanalytes;
        this.idlotant = datatest.idLot;
        this.levelant = datatest.level;

        this.analitosService.getanalitoslog(this.idanalyteant).subscribe((datanalito) => {
          this.analitoant = datanalito.desanalytes;
          this.idsectionant = datanalito.idsection;

          this.seccionesService.getByIdAsync(datanalito.idsection).then((dataseccionant: any) => {
            this.sectionant = dataseccionant.namesection;

          }).catch(error => { });
        })

        this.lotesService.getByIdAsync(datatest.idLot).then((datalotant: any) => {
          this.lotant = datalotant.numlot;
        }).catch(error => { });
      })
    }

    this.openmodales = true;
    const destroy$: Subject<boolean> = new Subject<boolean>();
    /* Variables recibidas por el modal */
    const data: ModalData = {
      content: templateGestionTest,
      btn: 'Guardar',
      btn2: 'Cerrar',
      footer:true,
      title: this.accion,
      image:'assets/rutas/iconos/crear.png',
    };
    const dialogRef = this.dialog.open(ModalGeneralComponent, { height:'auto' ,width: '60em', data, disableClose: true });

    this.loader.hide();
    dialogRef.componentInstance.primaryEvent?.pipe(takeUntil(destroy$)).subscribe(x =>{
      if(this.formularioTest.invalid){
        this.formularioTest.markAllAsTouched();
        return
      }
      
      datos ? this.accionEditar = true : this.accionEditar = false;
      datos ? this.accion = "Editar" : this.accion = "Crear";
      this.crearEditarTest();
      dialogRef.close();
    });
  }

  async openModalGestionTestEdit(templateGestionTestEdit: TemplateRef<any>, datos: any) {

    if (datos != '') {
      this.loader.show();
      let idcontrolmaterialedit: any;
      await this.testsService.getByIdAsync(datos).then((test: any) => {
        this.editFormularioGestionTest(test);
        idcontrolmaterialedit = test.idControlMaterial;

        this.idanalyteant = test.idanalytes;
        this.idlotant = test.idLot;
        this.levelant = test.level;

        this.analitosService.getanalitoslog(this.idanalyteant).subscribe((datanalito) => {
          this.analitoant = datanalito.desanalytes;
          this.idsectionant = datanalito.idsection;

          this.seccionesService.getByIdAsync(datanalito.idsection).then((dataseccionant: any) => {
            this.sectionant = dataseccionant.namesection;

          }).catch(error => { });
        })

        this.lotesService.getByIdAsync(test.idLot).then((datalotant: any) => {
          this.lotant = datalotant.numlot;
        }).catch(error => { });
      });


    }
    else {

      this.lotActive = [];

    }

    this.idtestant = this.formularioTest.get('idTest').value;
    if (datos.idtest != null) {
      this.testsService.gettest(datos).subscribe((datatest) => {
        this.idanalyteant = datatest.idanalytes;
        this.idlotant = datatest.idLot;
        this.levelant = datatest.level;

        this.analitosService.getanalitoslog(this.idanalyteant).subscribe((datanalito) => {
          this.analitoant = datanalito.desanalytes;
          this.idsectionant = datanalito.idsection;

          this.seccionesService.getByIdAsync(datanalito.idsection).then((dataseccionant: any) => {
            this.sectionant = dataseccionant.namesection;

          }).catch(error => { });
        })

        this.lotesService.getByIdAsync(datatest.idLot).then((datalotant: any) => {
          this.lotant = datalotant.numlot;
        }).catch(error => { });
      })
    }

    const destroy$: Subject<boolean> = new Subject<boolean>();
    /* Variables recibidas por el modal */
    const data: ModalData = {
      content: templateGestionTestEdit,
      btn: 'Actualizar',
      btn2: 'Cerrar',
      footer:true,
      title: this.accion,
      image:'assets/rutas/iconos/editar.png'
    };

    this.loader.hide();
    const dialogRef = this.dialog.open(ModalGeneralComponent, { height:'auto' ,width: '60em', data, disableClose: true });

    dialogRef.componentInstance.primaryEvent?.pipe(takeUntil(destroy$)).subscribe(x =>{
      if(this.formularioTestEdit.invalid){
        this.formularioTestEdit.markAllAsTouched();
        return
      }
      this.EditarTest();
      dialogRef.close();
    });
  }

  async openLote() {
    this.loader.show();
    this.verLoteFlag.set(true);
    await this.lotesService.getAllAsyncNoDuplicado().then(data => {
      this.lotes = data.filter(e => e.Active == true);

      this.consulta = true
      this.lotes.sort((a: any, b: any) => {
        a.Numlot = a.Numlot.charAt(0) + a.Numlot.slice(1);
        b.Numlot = b.Numlot.charAt(0) + b.Numlot.slice(1);
      })

      this.lotes.sort((a: any, b: any) => {
        if (a.Numlot < b.Numlot) return -1;
        if (a.Numlot > b.Numlot) return 1;
        return 0;
      })
      this.lotesNuevo = data.filter(e => e.Active == true);

      let idLote = this.formularioLote.get('idLote').value;
      this.filteredOptions = this.formularioLote.get('idLote').valueChanges.pipe(
        startWith(''),
        map(value => {
          return this._filter(value, idLote)
        }),
      );
    });

    await this.lotesService.getAllAsyncNoDuplicadonew().then(data => {
      this.lotesNuevo = data.filter(e => e.Active == true);

      this.filteredOptionsNuevo = this.formularioLote.get('LoteNuevo').valueChanges.pipe(
        startWith(''),
        map(value => this._filterNuevo(value)),
      );

    });

    this.loader.hide();
    this.formularioLote.reset({ idLote: '', LoteNuevo: '', fVencimiento: '', mContro: '', lotes: '' });
    this.desactivarTest = true;
    this.visibleDuplicar = false;
    this.desactivarTestCreado = true;

  }


  crearFormularioGestionTest(datos: any) {

    if (datos != '') {

      this.lotMatCtrlService.filtroLotePorMC(datos.idControlMaterial).subscribe(lotes => {

        this.lotActive = lotes;
      });

    }

    this.formularioTest = this.fb.group({

      idTest: [datos.idTest ? datos.idTest : ''],
      idControlMaterial: [datos.idControlMaterial ? datos.idControlMaterial : '', [Validators.required]],
      idLot: [datos.idLot ? datos.idLot : '', [Validators.required]],
      idheadquarters: [datos.idheadquarters ? datos.idheadquarters : '', [Validators.required]],
      idanalytes: [datos.idanalytes ? datos.idanalytes : '', [Validators.required]],
      idAnalyzer: [datos.idAnalyzer ? datos.idAnalyzer : '', [Validators.required]],
      idreagents: [datos.idreagents ? datos.idreagents : '', [Validators.required]],
      idmethods: [datos.idmethods ? datos.idmethods : '', [Validators.required]],
      idunits: [datos.idunits ? datos.idunits : '', [Validators.required]],
      decimals: [datos.decimals ? datos.decimals : '', [Validators.required, Validators.min(0)]],
      level: [datos.level ? datos.level : '', [Validators.required, Validators.min(1), Validators.max(3), Validators.pattern(/^\d+$/)]],
      homologation: [datos.homologation],
      active: [datos.active ? datos.active : false],

    });


    this.formularioLote = this.fb.group({
      idLote: ['', [Validators.required]],
      LoteNuevo: ['', [Validators.required]],
      fVencimiento: ['', [Validators.required]],
      mContro: ['', [Validators.required]],
      lotes: ['', [Validators.required]],
      aux: ['', [Validators.required]],
    })
  }

  async editFormularioGestionTest(datos: any) {

    await this.ControlMaterialService.getByIdAsync(datos.idControlMaterial).then((contmat: any) => {
      this.nombrecontmat = contmat.descontmat;
    });

    await this.lotesService.getByIdAsync(datos.idLot).then((lot: any) => {
      this.numlote = lot.numlot;
    });

    await this.SedesService.getByIdAsync(datos.idheadquarters).then((sede: any) => {
      this.descsede = sede.desheadquarters;
    });

    await this.analitosService.getByIdAsync(datos.idanalytes).then((analito: any) => {
      this.desanalito = analito.desanalytes;
    });

    await this.AnalizadoresService.getByIdAsync(datos.idAnalyzer).then((analyzer: any) => {
      this.desanalyzer = analyzer.nameAnalyzer;
    });

    await this.metodosService.getByIdAsync(datos.idmethods).then((analyzer: any) => {
      this.desmetodo = analyzer.desmethods;
    });

    await this.reactivosService.getByIdAsync(datos.idreagents).then((analyzer: any) => {
      this.desreactivo = analyzer.desreagents;
    });

    await this.unidadeservice.getByIdAsync(datos.idunits).then((analyzer: any) => {
      this.desunit = analyzer.desunits;
    });
    this.formularioTestEdit.get('idTest').setValue(datos.idTest ? datos.idTest : '')
    this.formularioTestEdit.get('idControlMaterial').setValue(this.nombrecontmat ? this.nombrecontmat : '')
    this.formularioTestEdit.get('idLot').setValue(this.numlote ? this.numlote : '')
    this.formularioTestEdit.get('idheadquarters').setValue(this.descsede ? this.descsede : '')
    this.formularioTestEdit.get('idanalytes').setValue(this.desanalito.toLowerCase() ? this.desanalito.toLowerCase() : '')
    this.formularioTestEdit.get('idAnalyzer').setValue(this.desanalyzer.toLowerCase() ? this.desanalyzer.toLowerCase() : '')
    this.formularioTestEdit.get('idreagents').setValue(this.desreactivo.toLowerCase() ? this.desreactivo.toLowerCase() : '')
    this.formularioTestEdit.get('idmethods').setValue(this.desmetodo.toLowerCase() ? this.desmetodo.toLowerCase() : '')
    this.formularioTestEdit.get('idunits').setValue(this.desunit.toLowerCase() ? this.desunit.toLowerCase() : '')
    this.formularioTestEdit.get('decimals').setValue(datos.decimals ? datos.decimals : '')
    this.formularioTestEdit.get('level').setValue(datos.level ? datos.level : '')
    this.formularioTestEdit.get('homologation').setValue(datos.homologation)
    this.formularioTestEdit.get('active').setValue(datos.active ? datos.active : false)

    this.listaControlmaterial = await this.ControlMaterialService.getAllAsync();
    this.controlmaterialActive = this.listaControlmaterial.filter(e => e.active == true);
    this.controlmaterialActive.sort((a, b) => {
      a.descontmat = a.descontmat.charAt(0).toLowerCase() + a.descontmat.slice(1);
      b.descontmat = b.descontmat.charAt(0).toLowerCase() + b.descontmat.slice(1);
    })
    this.controlmaterialActive.sort((a, b) => {
      if (a.descontmat < b.descontmat) return -1;
      if (a.descontmat > b.descontmat) return 1;
      return 0;
    })
    let prueba00 = this.formularioTestEdit.get('idControlMaterial')
    this.filteredOptionsControlMaterialEdit = this.formularioTestEdit.get('idControlMaterial').valueChanges.pipe(
      startWith(''),
      map(value => {

        return this._filterControlMaterialEdit(value)
      }),
    );

    this.lotMatCtrlService.filtroLotePorMC(datos.idControlMaterial).subscribe(lotes => {
      this.lotActive = lotes;

      if (this.lotActive.length) {
        this.lotActive.sort((a, b) => {
          if (a.Numlot < b.Numlot) return -1;
          if (a.Numlot > b.Numlot) return 1;
          return 0;
        })
        this.filteredOptionsLotsEdit = this.formularioTestEdit.get('idLot').valueChanges.pipe(
          startWith(''),
          map(value => {
            return this._filterLoteEdit(value)
          }),
        );
      }
    });

    let idUser: number = parseInt(sessionStorage.getItem('userid'));
    this.listSedes = await this.sedesXUserService.getByIdAsync(idUser);
    this.sedesActive = this.listSedes.filter(e => e.active == true);
    this.sedesActive.sort((a, b) => {
      a.desheadquarters = a.desheadquarters.charAt(0).toLowerCase() + a.desheadquarters.slice(1);
      b.desheadquarters = b.desheadquarters.charAt(0).toLowerCase() + b.desheadquarters.slice(1);
    })
    this.sedesActive.sort((a, b) => {
      if (a.desheadquarters < b.desheadquarters) return -1;
      if (a.desheadquarters > b.desheadquarters) return 1;
      return 0;
    })

    this.filteredOptionsSedesEdit = this.formularioTestEdit.get('idheadquarters').valueChanges.pipe(
      startWith(''),
      map(value => {
        return this._filterlistSedesxUserEdit(value)
      }),
    );

    this.listAnalytes = await this.analitosService.getAllAsync();
    this.analytesActive = this.listAnalytes.filter(e => e.active);

    this.analytesActive.sort((a, b) => {
      a.desanalytes = a.desanalytes.charAt(0).toLowerCase() + a.desanalytes.slice(1);
      b.desanalytes = b.desanalytes.charAt(0).toLowerCase() + b.desanalytes.slice(1);
    })
    this.analytesActive.sort((a, b) => {
      if (a.desanalytes < b.desanalytes) return -1;
      if (a.desanalytes > b.desanalytes) return 1;

      return 0;
    })

    this.filteredOptionsAnalitosEdit = this.formularioTestEdit.get('idanalytes').valueChanges.pipe(
      startWith(''),
      map(value => {
        return this._filterlistAnalitosEdit(value)
      }),
    );

    this.listAnalizador = await this.InstrumentosService.getAllAsync();
    this.analyzerActive = this.listAnalizador.filter(e => e.active == true);
    this.analyzerActive.sort((a, b) => {
      a.nameAnalyzer = a.nameAnalyzer.charAt(0).toLowerCase() + a.nameAnalyzer.slice(1);
      b.nameAnalyzer = b.nameAnalyzer.charAt(0).toLowerCase() + b.nameAnalyzer.slice(1);
    })
    this.analyzerActive.sort((a, b) => {
      if (a.nameAnalyzer < b.nameAnalyzer) return -1;
      if (a.nameAnalyzer > b.nameAnalyzer) return 1;
      return 0;
    })

    this.filteredOptionsAnalizadoresEdit = this.formularioTestEdit.get('idAnalyzer').valueChanges.pipe(
      startWith(''),
      map(value => {
        return this._filterlistAnalyzerEdit(value)
      }),
    );

    this.listMetodos = await this.metodosService.getAllAsync();
    this.metodosActive = this.listMetodos.filter(e => e.active == true);
    if (this.metodosActive.length > 0) {
      this.metodosActive.sort((a, b) => {
        a.desmethods = a.desmethods.charAt(0).toLowerCase() + a.desmethods.slice(1);
        b.desmethods = b.desmethods.charAt(0).toLowerCase() + b.desmethods.slice(1);
      })
    }

    this.metodosActive.sort((a, b) => {
      if (a.desmethods < b.desmethods) return -1;
      if (a.desmethods > b.desmethods) return 1;
      return 0;
    })

    this.filteredOptionsMethodsEdit = this.formularioTestEdit.get('idmethods').valueChanges.pipe(
      startWith(''),
      map(value => {
        return this._filterlistMethodsEdit(value)
      }),
    );

    this.listReactivo = await this.reactivosService.getAllAsync();
    this.reagentsActive = this.listReactivo.filter(e => e.active == true);

    this.reagentsActive.sort((a, b) => {
      a.desreagents = a.desreagents.charAt(0).toLowerCase() + a.desreagents.slice(1);
      b.desreagents = b.desreagents.charAt(0).toLowerCase() + b.desreagents.slice(1);
    })

    this.reagentsActive.sort((a, b) => {
      if (a.desreagents < b.desreagents) return -1;
      if (a.desreagents > b.desreagents) return 1;
      return 0;
    })

    this.filteredOptionsReagentsEdit = this.formularioTestEdit.get('idreagents').valueChanges.pipe(
      startWith(''),
      map(value => {
        return this._filterlistReagentsEdit(value)
      }),
    );

    this.listUnidadMedida = await this.unidadeservice.getAllAsync();
    this.unitsActive = this.listUnidadMedida.filter(e => e.active);

    this.unitsActive.sort((a, b) => {
      a.desunits = a.desunits.charAt(0).toLowerCase() + a.desunits.slice(1);
      b.desunits = b.desunits.charAt(0).toLowerCase() + b.desunits.slice(1);
    })
    this.unitsActive.sort((a, b) => {
      if (a.desunits < b.desunits) return -1;
      if (a.desunits > b.desunits) return 1;
      return 0;
    })

    this.filteredOptionsUnitsEdit = this.formularioTestEdit.get('idunits').valueChanges.pipe(
      startWith(''),
      map(value => {
        return this._filterlistUnitsEdit(value)
      }),
    );

    this.formularioLote = this.fb.group({
      idLote: ['', [Validators.required]],
      LoteNuevo: ['', [Validators.required]],
      fVencimiento: ['', [Validators.required]],
      mContro: ['', [Validators.required]],
      lotes: ['', [Validators.required]],
      aux: ['', [Validators.required]],
    })
  }

  openModal(descripcion) {
    const data = { descripcion: descripcion, accion: this.accion }
    this.ventanaService.openModal(data);
  }

  async FnCreateLog() {
    this.desactivar = false;
    return new Promise((resolve, errPr) => {
      setTimeout(() => {
        this.analitosService.getByIdAsync2(this.idanalitopr)
          .pipe(
            tap((X: any) => {
              this.analitonew = X.desanalytes;
              this.formularioTest.value.idControlMaterial = this.idcontmatpr;
              this.formularioTest.value.idLot = this.idlotpr;
              this.formularioTest.value.idheadquarters = this.idsedepr;
              this.formularioTest.value.idanalytes = this.idanalitopr;
              this.formularioTest.value.idAnalyzer = this.idanalyzerpr;
              this.formularioTest.value.idmethods = this.idmethospr;
              this.formularioTest.value.idreagents = this.idreagentspr;
              this.formularioTest.value.idunits = this.idunitspr;
            }),
            switchMap(Y => this.seccionesService.getByIdAsync2(Y.idsection)
              .pipe(
                tap((respY: any) => this.sectionnew = respY.namesection)
              )
            ),
            switchMap(Z => this.lotesService.getByIdAsync2(this.idlotpr)
              .pipe(
                tap((respZ: any) => this.lotnew = respZ.numlot)
              )),

            switchMap(Z => this.testsService.createAsync(this.formularioTest.value))
          )

          .subscribe({
            next:(resp) => {
              this.closeVentana();
              this.cargarGestionTest();
              this.toastr.success('Registro creado');
              if(this.desactivarbtnaceptar = false){
                this.desactivar = false;
              }
  
              const Loguser = {
                Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
                Hora: this.datePipe.transform(Date.now(), "shortTime"),
                Modulo: 'Control Calidad Interno',
                Submodulo: 'Administración',
                Item: 'Test',
                Metodo: 'creación',
                Datos: ('Test: ' + this.analitonew + '| ' + this.lotnew + '| ' + this.sectionnew + '| ' + this.formularioTest.value.level),
                Respuesta: JSON.stringify(resp),
                TipoRespuesta: 200,
                Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
              }
  
              this.testsService.createLogAsync(Loguser).then(respuesta => { });
              resolve(true)
                
            },error:(err) => {
              this.desactivar = false;
              const Loguser = {
                Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
                Hora: this.datePipe.transform(Date.now(), "shortTime"),
                Modulo: 'Control Calidad Interno',
                Submodulo: 'Administración',
                Item: 'Test',
                Metodo: 'creación',
                Datos: ('Test: ' + this.analitonew + '| ' + this.lotnew + '| ' + this.sectionnew + '| ' + this.formularioTest.value.level),
                respuesta: err.message,
                tipoRespuesta: err.status,
                Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
              }
              this.testsService.createLogAsync(Loguser).then(respuesta => { });
              errPr(false);
            },
            // console.log(this.sectionnew);
          });
      }, 500);
    })
  }

  async crearEditarTest() {

    this.formularioTest.value.idControlMaterial = this.idcontmatpr;
    this.formularioTest.value.idLot = this.idlotpr;
    this.formularioTest.value.idheadquarters = this.idsedepr;
    this.formularioTest.value.idanalytes = this.idanalitopr;
    this.formularioTest.value.idAnalyzer = this.idanalyzerpr;
    this.formularioTest.value.idmethods = this.idmethospr;
    this.formularioTest.value.idreagents = this.idreagentspr;
    this.formularioTest.value.idunits = this.idunitspr;

    if (!this.formularioTest.invalid) {

      if (this.accion === 'Crear') {
        var idanalitonew = this.formularioTest.get('idanalytes').value;
        var idlotnew = this.formularioTest.get('idLot').value;
        await this.FnCreateLog();
        this.desactivar = true;
      }
    }
  }

  FnEditLog(nuevaData: any) {
    return new Promise((resolve, errPr) => {    
      setTimeout(() => {
        this.analitosService.getByIdAsync2(nuevaData.idanalytes)
          .pipe(
            tap((X: any) => {
              this.analitonew = X.desanalytes;
            }),
            switchMap(Y => this.seccionesService.getByIdAsync2(Y.idsection)
              .pipe(
                tap((respY: any) => this.sectionnew = respY.namesection)
              )
            ),
            switchMap(Z => this.lotesService.getByIdAsync2(nuevaData.idLot)
              .pipe(
                tap((respZ: any) => this.lotnew = respZ.numlot)
              )),

            switchMap(Z => this.testsService.update(nuevaData, this.formularioTestEdit.value.idTest))
          )
          .subscribe((resp: any) => {

            this.closeVentana();
            this.cargarGestionTest();
            this.toastr.success('Registro actualizado');

            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              Hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo: 'Control Calidad Interno',
              Submodulo: 'Administración',
              Item: 'Test',
              Metodo: 'actualización',
              Datos: ('Test: ' + this.analitonew + '| ' + this.lotnew + '| ' + this.sectionnew + '| ' + nuevaData.level),
              DatosAnteriores: ('Test: ' + this.analitoant + '| ' + this.lotant + '| ' + this.sectionant + '| ' + this.levelant),
              Respuesta: JSON.stringify(resp),
              TipoRespuesta: 200,
              Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }

            this.testsService.createLogAsync(Loguser).then(respuesta => { });
            resolve(true)
            // console.log(this.sectionnew);
          }, error => {
            this.toastr.error(error.error.message);
            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              Hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo: 'Control Calidad Interno',
              Submodulo: 'Administración',
              Item: 'Test',
              Metodo:'actualización',
              Datos: ('Test: ' + this.analitonew + '| ' + this.lotnew + '| ' + this.sectionnew + '| ' + nuevaData.level),
              DatosAnteriores: ('Test: ' + this.analitoant + '| ' + this.lotant + '| ' + this.sectionant + '| ' + this.levelant),
              Respuesta: JSON.stringify(nuevaData),
              respuesta: error.error.message,
              tipoRespuesta: error.status,
              Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }
            this.testsService.createLogAsync(Loguser).then(respuesta => {
            });
            errPr(false);
          });
      }, 500);
    })
  }

  async EditarTest() {

    //this.desactivar = false;
    var idanalitonew = this.formularioTestEdit.get('idanalytes').value;
    var idlotnew = this.formularioTestEdit.get('idLot').value;
    let nomIdControl = this.formularioTestEdit.get('idControlMaterial').value
    let nomIdLote = this.formularioTestEdit.get('idLot').value
    let nomIdSede = this.formularioTestEdit.get('idheadquarters').value
    let nomIdanalito = this.formularioTestEdit.get('idanalytes').value
    let nomIdanalyzer = this.formularioTestEdit.get('idAnalyzer').value
    let nomIdmetodo = this.formularioTestEdit.get('idmethods').value
    let nomIdreactivo = this.formularioTestEdit.get('idreagents').value
    let nomIdunidad = this.formularioTestEdit.get('idunits').value
    let nomIdHomologation = this.formularioTestEdit.get('homologation').value
    let nuevaData = this.formularioTestEdit.value;
    var idsection01;

    let arrcontrolmaterial = this.controlmaterialActive.sort((a, b) => {
      a.descontmat = a.descontmat.charAt(0).toLowerCase() + a.descontmat.slice(1);
      b.descontmat = b.descontmat.charAt(0).toLowerCase() + b.descontmat.slice(1);

    })
    arrcontrolmaterial.sort((a, b) => {
      if (a.descontmat < b.descontmat) return -1;
      if (a.descontmat > b.descontmat) return 1;
      return 0;
    })

   arrcontrolmaterial.filter(result => {
      if (result.descontmat.toLowerCase() === nomIdControl.toLowerCase()) {
        nuevaData.idControlMaterial = result.idControlMaterial;
        return
      }
      return
    });

    let arrlotes = this.lotActive.sort((a, b) => {
      if (a.Numlot < b.Numlot) return -1;
      if (a.Numlot > b.Numlot) return 1;
      return 0;
    })

    arrlotes.filter(result => {
      if (result.Numlot.toLowerCase() === nomIdLote.toLowerCase()) {
        nuevaData.idLot = result.IdLot;

        return
      }
      return
    })

    let arrsedes = this.sedesActive.sort((a, b) => {
      a.desheadquarters = a.desheadquarters.charAt(0).toLowerCase() + a.desheadquarters.slice(1);
      b.desheadquarters = b.desheadquarters.charAt(0).toLowerCase() + b.desheadquarters.slice(1);
    })
    arrsedes.sort((a, b) => {
      if (a.desheadquarters < b.desheadquarters) return -1;
      if (a.desheadquarters > b.desheadquarters) return 1;
      return 0;
    })

    arrsedes.filter(result => {
      if (result.desheadquarters.toLowerCase() === nomIdSede.toLowerCase()) {
        nuevaData.idheadquarters = result.idheadquarters;
        return
      }
      return
    })

    let arranalitos = this.analytesActive.sort((a, b) => {
      a.desanalytes = a.desanalytes.charAt(0).toLowerCase() + a.desanalytes.slice(1);
      b.desanalytes = b.desanalytes.charAt(0).toLowerCase() + b.desanalytes.slice(1);
    })
    arranalitos.sort((a, b) => {
      if (a.desanalytes < b.desanalytes) return -1;
      if (a.desanalytes > b.desanalytes) return 1;

      return 0;
    })

    arranalitos.filter(result => {
      if (result.desanalytes.toLowerCase() === nomIdanalito.toLowerCase()) {
        nuevaData.idanalytes = result.idanalytes;
        return
      }
      return
    })

    let arranalyzer = this.analyzerActive.sort((a, b) => {
      a.nameAnalyzer = a.nameAnalyzer.charAt(0).toLowerCase() + a.nameAnalyzer.slice(1);
      b.nameAnalyzer = b.nameAnalyzer.charAt(0).toLowerCase() + b.nameAnalyzer.slice(1);
    })
    arranalyzer.sort((a, b) => {
      if (a.nameAnalyzer < b.nameAnalyzer) return -1;
      if (a.nameAnalyzer > b.nameAnalyzer) return 1;
      return 0;
    })

    arranalyzer.filter(result => {
      if (result.nameAnalyzer.toLowerCase() === nomIdanalyzer.toLowerCase()) {
        nuevaData.idAnalyzer = result.idAnalyzer;
        return
      }
      return
    })

    let arrmetodos = this.metodosActive.sort((a, b) => {
      a.desmethods = a.desmethods.charAt(0).toLowerCase() + a.desmethods.slice(1);
      b.desmethods = b.desmethods.charAt(0).toLowerCase() + b.desmethods.slice(1);
    })
    arrmetodos.sort((a, b) => {
      if (a.desmethods < b.desmethods) return -1;
      if (a.desmethods > b.desmethods) return 1;
      return 0;
    })

    arrmetodos.filter(result => {
      if (result.desmethods.toLowerCase() === nomIdmetodo.toLowerCase()) {
        nuevaData.idmethods = result.idmethods;
        return
      }
      return
    })

    let arreactivos = this.reagentsActive.sort((a, b) => {
      a.desreagents = a.desreagents.charAt(0).toLowerCase() + a.desreagents.slice(1);
      b.desreagents = b.desreagents.charAt(0).toLowerCase() + b.desreagents.slice(1);
    })

    arreactivos.sort((a, b) => {
      if (a.desreagents < b.desreagents) return -1;
      if (a.desreagents > b.desreagents) return 1;
      return 0;
    })

    arreactivos.filter(result => {
      if (result.desreagents.toLowerCase() === nomIdreactivo.toLowerCase()) {
        nuevaData.idreagents = result.idreagents;
        return
      }
      return
    })

    let arrunits = this.unitsActive.sort((a, b) => {
      a.desunits = a.desunits.charAt(0).toLowerCase() + a.desunits.slice(1);
      b.desunits = b.desunits.charAt(0).toLowerCase() + b.desunits.slice(1);
    })
    arrunits.sort((a, b) => {
      if (a.desunits < b.desunits) return -1;
      if (a.desunits > b.desunits) return 1;
      return 0;
    })

    arrunits.filter(result => {
      if (result.desunits.toLowerCase() === nomIdunidad.toLowerCase()) {
        nuevaData.idunits = result.idunits;
        return
      }
      return
    })

    if (!this.formularioTestEdit.invalid) {


      await this.FnEditLog(nuevaData);
    }
  }


  actualizarGestionTest(datos: any[]) {
    const [data2,estado ] = datos;
    data2.Active = estado
    const datosAnteriores = this.dataAnt.find(x => x.IdTest == data2.IdTest);
    this.testsService.getByIdAsync(data2.IdTest).then(async (response: any) => {

      const data = {
        decimals: response.decimals,
        idAnalyzer: response.idAnalyzer,
        idControlMaterial: response.idControlMaterial,
        idLot: response.idLot,
        idTest: response.idTest,
        idanalytes: response.idanalytes,
        idheadquarters: response.idheadquarters,
        idmethods: response.idmethods,
        idreagents: response.idreagents,
        idunits: response.idunits,
        homologation: response.homologation,
        level: response.level,
        active: estado
      }

      try {
        let respuesta = await lastValueFrom(this.testsService.update(data, data2.IdTest));
        this.cargarGestionTest();
        this.accion = 'Editar';
        this.toastr.success('Estado actualizado','Actualización');
        this.log.logObj('Control Calidad Interno', 'Administración', 'Gestión test', 'a', data, JSON.stringify(respuesta), 200, this.datosAnt(datosAnteriores));
      } catch (error) {
        this.cargarGestionTest();
        this.log.logObj('Control Calidad Interno', 'Administración', 'Gestión test', 'a', data, error.message, error.status, this.datosAnt(datosAnteriores));
        this.toastr.error('No fue posible actualizar el estado', 'Error')
      }
    });
  }

  datosAnt(data: any) {
    return ` IdTest: ${data.IdTest} - Idanalytes: ${data.Idanalytes} - Desanalytes: ${data.Desanalytes} - Idmethods: ${data.Idmethods} - Desmethods: ${data.Desmethods} - NameAnalyzer: ${!data.NameAnalyzer} - Numlot: ${!data.Numlot} - Active: ${!data.Active}`;
  }


  eliminarGestionTest(id: any) {
    var desnalyte: any;
    this.testsService.getByIdAsync(id).then((datatest: any) => {
      let idanalito = datatest.idanalytes;
      this.analitosService.getByIdAsync(idanalito).then((dataanalito: any) => {
        desnalyte = dataanalito.desanalytes;
      }).catch(error => { });
    }).catch(error => { });

    let datosAnteriores = this.dataAnt.find(x => x.IdTest == id);

    this.testsService.delete('Tests', id).subscribe(respuesta => {
      this.cargarGestionTest();
      this.toastr.success('Registro eliminado');
      const Loguser = {
        Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
        Hora: this.datePipe.transform(Date.now(), "shortTime"),
        Modulo: 'Control Calidad Interno',
        Submodulo: 'Administración',
        Item: 'Test',
        Metodo: 'eliminación',
        Datos: ('Test: ' + desnalyte),
        DatosAnteriores: `${datosAnteriores.IdTest} | Test: ${datosAnteriores.Desanalytes}`,
        respuesta: JSON.stringify(respuesta),
        tipoRespuesta: 200,
        Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
      }
      this.testsService.createLogAsync(Loguser).then(respuesta => {
      });
    },
      (err: HttpErrorResponse) => {
        this.toastr.error('no se puede eliminar test, existe configuración en resultados');

        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          Hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo: 'Control Calidad Interno',
          Submodulo: 'Administración',
          Item: 'Test',
          Metodo: 'eliminación',
          Datos: ('Test: ' + desnalyte),
          DatosAnteriores: `${datosAnteriores.IdTest} | Test: ${datosAnteriores.Desanalytes}`,
          respuesta: err.message,
          tipoRespuesta: err.status,
          Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
        this.testsService.createLogAsync(Loguser).then(respuesta => { });
      });
  }

  titulosSwal() {
    this.translate.get('MODULES.SWAL.TITULO').subscribe(respuesta => this.titulo = respuesta);
    this.translate.get('MODULES.SWAL.TEXT').subscribe(respuesta => this.text = respuesta);
    this.translate.get('MODULES.SWAL.CANCEL').subscribe(respuesta => this.cancelar = respuesta);
    this.translate.get('MODULES.SWAL.CONFIRM').subscribe(respuesta => this.confirmar = respuesta);
    this.translate.get('MODULES.SWAL.TEXTERROR').subscribe(respuesta => this.textError = respuesta);
    this.translate.get('MODULES.SWAL.MESAGEERROR').subscribe(respuesta => this.messageError = respuesta);
  }

  titulosSinAnalitosxIdLotMatSwal() {
    this.translate.get('MODULES.SWALSINANALITOSXIDLOTMAT.TITULO').subscribe(respuesta => this.tituloanalito = respuesta);
    this.translate.get('MODULES.SWALSINANALITOSXIDLOTMAT.TEXT').subscribe(respuesta => this.textanalito = respuesta);
    this.translate.get('MODULES.SWALSINANALITOSXIDLOTMAT.TEXTADD').subscribe(respuesta => this.textadd = respuesta);
    this.translate.get('MODULES.SWALSINANALITOSXIDLOTMAT.CONFIRM').subscribe(respuesta => this.aceptar = respuesta);
    this.translate.get('MODULES.SWALSINANALITOSXIDLOTMAT.TEXTERROR').subscribe(respuesta => this.textError = respuesta);
    this.translate.get('MODULES.SWALSINANALITOSXIDLOTMAT.MESAGEERROR').subscribe(respuesta => this.messageError = respuesta);
  }

  closeVentana(): void {

    this.openmodales = false;
    this.desactivarbtnaceptar = false;
  }
  changeDate() {
    let fechaVencimiento = document.getElementById("expDate");
    fechaVencimiento.classList.remove('is-valid');
  }

  cambiarLote(nombreLote: string, idLote?: number) {

    var numloteselected = this.formularioLote.get('idLote').setValue(nombreLote.split('|')[1]);
    var idloteselected = this.formularioLote.get('aux').setValue(nombreLote.split('|')[0]);
    var numlote001 = this.formularioLote.value.idLote;
    this.idlote001 = this.formularioLote.value.aux;
    this.formularioLote.reset({ idLote: numlote001, LoteNuevo: '', fVencimiento: '', mContro: '', lotes: '' });

    var numloteform = this.formularioLote.get('idLote').value
    if (this.loteSeleccionado != this.idlote001) {
      this.desactivarTest = true
      this.visibleDuplicar = false
      this.desactivarTestCreado = true
    }
    this.getLotsDuplicar();
  }

  async cambiarControlMaterial(NombreControlmaterial: string, idcontrolmaterial?: number) {

    this.contmatprname = this.formularioTest.get('idControlMaterial').setValue(NombreControlmaterial.split('|')[1]);
    var idcontmat = NombreControlmaterial.split('|')[0];
    this.idcontmatpr = Number(idcontmat);

    if (idcontmat != '') {

      this.formularioTest.get('idLot').reset('');

      let id: number = parseInt(idcontmat);

      await this.lotesService.getAllAsynclotxidcontmat(id).then(data => {
        this.listlotes = data.filter(e => e.Active == true);

        this.consulta = true
        this.listlotes.sort((a: any, b: any) => {
          a.Numlot = a.Numlot.charAt(0) + a.Numlot.slice(1);
          b.Numlot = b.Numlot.charAt(0) + b.Numlot.slice(1);
        })

        this.listlotes.sort((a: any, b: any) => {
          if (a.Numlot < b.Numlot) return -1;
          if (a.Numlot > b.Numlot) return 1;
          return 0;
        })

        this.filteredOptionsLots = this.formularioTest.get('idLot').valueChanges.pipe(
          startWith(''),
          map(value => {
            return this._filterlistlot(value)
          }),
        );
      });
    } else {

      this.lotActive = [];
      this.formularioTest.get('idLot').setValue('');

    }


  }

  async seleccionarlot(nombrelote: string) {

    var campolot = this.formularioTest.get('idLot').setValue(nombrelote.split('|')[1]);
    this.idlotpr = Number(nombrelote.split('|')[0]);

  }

  async seleccionarsede(nombresede: string) {

    this.formularioTest.get('idheadquarters').setValue(nombresede.split('|')[1]);
    this.idsedepr = Number(nombresede.split('|')[0]);

  }

  async seleccionaranalizadores(nombreanalyzer: string) {

    this.formularioTest.get('idAnalyzer').setValue(nombreanalyzer.split('|')[1]);
    this.idanalyzerpr = Number(nombreanalyzer.split('|')[0]);
  }

  async seleccionarmetodos(nombremetodo: string) {

    this.formularioTest.get('idmethods').setValue(nombremetodo.split('|')[1]);
    this.idmethospr = Number(nombremetodo.split('|')[0]);
  }

  async seleccionarreactivos(nombrereactivo: string) {

    this.formularioTest.get('idreagents').setValue(nombrereactivo.split('|')[1]);
    this.idreagentspr = Number(nombrereactivo.split('|')[0]);
  }

  async seleccionarUnidades(nombrereunidades: string) {

    this.formularioTest.get('idunits').setValue(nombrereunidades.split('|')[1]);
    this.idunitspr = Number(nombrereunidades.split('|')[0]);
  }

  cambiarLoteSelect(event: Event) {
  }

  async consultar(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;

    var jsonTexto: any = '{"numlot":"' + filterValue + '"}';
    this.verbtn = true;

    this.listReactivo = await lastValueFrom(this.lotesService.getAllAsyncLotesxNumlot(jsonTexto)).then((res: any) => {

      this.desactivarTest = true
      this.consulta = false

      if (res.length > 0) {
        this.formularioLote.get('fVencimiento').setValue(res[0]['expdate']);
        this.formularioLote.get('mContro').setValue(res[0]['idControlMaterial']);
        this.idControl = res[0]['idControlMaterial']
        this.idLote = res[0]['idLot']
        this.formularioLote.controls['mContro'].setValue(res[0]['IdControlMaterial'])
        this.desactivarTestCreado = false;
        this.formularioLote.get('LoteNuevo').setValue(filterValue);

      } else {
        this.desactivarTestCreado = true;
        this.desactivarTest = false;
      }

    }).catch(err =>{ 
      this.desactivarTestCreado = true;
      this.desactivarTest = false;
    })

  }

  async select(event: Event) {
    const filterValue: any = (event);
    var jsonTexto: any = '{"numlot":"' + filterValue.source.value + '"}';

    //await this.reactivosService.getConsultarLote(filterValue.source.value).then
    this.listReactivo = await lastValueFrom(this.lotesService.getAllAsyncLotesxNumlot(jsonTexto)).then((res: any) => {

      this.desactivarTest = true
      this.consulta = false
      this.verbtn = true;

      if (res.length > 0) {
        this.formularioLote.get('fVencimiento').setValue(res[0]['expdate']);
        this.formularioLote.get('mContro').setValue(res[0]['idControlMaterial']);
        this.idControl = res[0]['idControlMaterial']
        this.idLote = res[0]['idLot']
        this.formularioLote.controls['mContro'].setValue(res[0]['idControlMaterial'])
        this.desactivarTestCreado = false;
        this.formularioLote.get('LoteNuevo').setValue(filterValue.source.value);

      } else {
        this.desactivarTestCreado = true;
        this.desactivarTest = false;
      }

    }).catch(err =>{
      this.desactivarTestCreado = true;
      this.desactivarTest = false;
    })
  }

  // get lotes
  getLotsDuplicar() {
    let id_lote: any = this.formularioLote.controls['idLote'].value;
    let idloteselect = this.idlote001;
    //this.formularioLote.get('axu').value.trim()
    if (idloteselect !== '') {

      this.loteSeleccionado = idloteselect
      let dataTes: any = []
      lastValueFrom(this.testsService.getObtenerListadoTest(idloteselect)).then((res: any) => {
        if (res.length > 0) {
          this.desactivarTest = false
          this.visibleDuplicar = true
          dataTes = res
          dataTes = dataTes.filter(e => e.Active == true);
          this.dataSourcesTabla = new MatTableDataSource(dataTes);

        } else {
          this.visibleDuplicar = false
          this.desactivarTest = true
        }
      }).catch(x =>{ 
        this.desactivarTest = true
        this.toastr.error(this.translate.instant('MODULES.NOTIFICACIONES.NO_DATOS'));
      })
    }
  }

  AgregarLotes(id, component: any) {
    let elemen: any = document.getElementById(component);
    let elementselectall: any = document.getElementById('testall');
    let filtro: any = []
    if (this.lotesMultiples.length > 0) {
      elementselectall.checked = false;
      filtro = this.lotesMultiples.filter(e => e == id);
      if (filtro.length > 0) {
        this.lotesMultiples = this.lotesMultiples.filter(e => e != id);
        elemen.checked = false;
      } else {
        this.lotesMultiples.push(id)
      }
    } else {
      this.lotesMultiples.push(id)
    }
    this.formularioLote.controls['lotes'].setValue(this.lotesMultiples.toString());
  }

  agregarTablaLoteNuevo(element:any){
    let nuevo = element.Desanalytes+'|'+element.Desheadquarters+'|'+element.Desunits+'|'+element.NameAnalyzer+'|'+element.Desmethods+'|'+element.Descontmat;   
    if(this.dataTableNuevoLote.filter(x => x[0] === element.IdTest).length === 0){
      this.dataTableNuevoLote.push([element.IdTest, nuevo]);
    }else{
      this.dataTableNuevoLote =  this.dataTableNuevoLote.filter(x => x[0] !== element.IdTest);
    }
  }

  createLoteTest() {

    if(this.formularioLote.controls['fVencimiento'].value !== ''
      && this.formularioLote.controls['LoteNuevo'].value !== ''
      && this.formularioLote.controls['mContro'].value !== ''){
      if (this.desactivarTestCreado) {
        var fecha = new Date(this.formularioLote.controls['fVencimiento'].value)
        var jsonTexto = '{"numlot":"' + this.formularioLote.controls['LoteNuevo'].value + '","expdate":"' + fecha.getFullYear() + "-" + (fecha.getMonth() + 1) + "-" + fecha.getDate() + '", "active":true}';
  
        this.desactivarTest = true;
        this.testsService.createLote(jsonTexto).subscribe((res: any) => {
  
          this.idLote = res.idLot
          var jsonCrearControles = '{"idlot":' + this.idLote + ',"idControlMaterial":' + this.formularioLote.controls['mContro'].value + ', "active":true}';
          this.testsService.createLoteControl(jsonCrearControles).subscribe((resdata: any) => {
            this.idControl = resdata.idLotControlMaterial
            // console.log(this.idControl)
            if (this.idControl > 0) {
              this.visibleDuplicar = true
              this.toastr.success('Nuevo lote creado');
              this.desactivarTestCreado = false
              //this.desactivarTest = true;
            } else {
              this.visibleDuplicar = false
            }
          }, (errodata: any) => {
            this.toastr.error(this.translate.instant(errodata.error));
          })
        }, (err: any) => {
          this.toastr.error(this.translate.instant(err.error));
        })
      }  
    }
  }

  selectAllTest(event: any) {

    let filtros: any = []

    let selectedall: any = document.getElementById('testall')
    if (selectedall.checked === false) {

      let elemena: any = document.getElementById('lote_' + this.dataSourcesTabla.filteredData[0].IdTest)

      elemena.checked = true;
      this.dataSourcesTabla.filteredData.map(x => this.agregarTablaLoteNuevo(x));

      filtros.push(this.dataSourcesTabla.filteredData[0].IdTest)
      // let elemena: any = document.getElementById('lote_' + IdTest)
      // elemena.checked = false
      this.dataSourcesTabla.filteredData.sort((a, b) => {

        filtros = [];
        // filtros.push(a.IdTest)
        // filtros.push(b.IdTest)
        let elemena: any = document.getElementById('lote_' + a.IdTest)
        elemena.checked = false
        let elemenb: any = document.getElementById('lote_' + b.IdTest)
        elemenb.checked = false

        return 0
      })

    }
    else {

      this.dataTableNuevoLote = [];
      this.dataSourcesTabla.filteredData.map(x => this.agregarTablaLoteNuevo(x));
      this.dataSourcesTabla.filteredData.sort((a, b) => {

        filtros.push(a.IdTest)
        filtros.push(b.IdTest)
        //filtros.push(this.dataSourcesTabla.filteredData)
        let elemena: any = document.getElementById('lote_' + a.IdTest)
        elemena.checked = true
        let elemenb: any = document.getElementById('lote_' + b.IdTest)
        elemenb.checked = true

        return 0
      })
    }

    this.formularioLote.controls['lotes'].setValue(filtros.filter((item, index) => {
      return filtros.indexOf(item) === index;
    }));
    this.lotesMultiples = filtros.filter((item, index) => { return filtros.indexOf(item) === index; })

  }

  DuplicarLotes() {

    var iduser = sessionStorage.getItem('userid');
    var datecreate = this.datePipe.transform(new Date(), "yyyy-MM-dd");

    if (this.desactivarTestCreado == false) {

      this.verbtn = false;
      this.nodup = true;
      var jsonTexto: any = '{"Idlot":"' + this.idLote + '","Idtest":"' + this.formularioLote.controls['lotes'].value + '", "Idcontrolmaterial":"' + this.formularioLote.controls['mContro'].value + '", "Lotorigin":"' + this.idlote001 + '", "Userid":"' + iduser + '", "Datecreate":"' + datecreate + '"}';


      if (this.idLote > 0) {

        this.testsService.createduplicarLotes(jsonTexto).subscribe((res: any) => {

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo: 'Control Calidad Interno',
            Submodulo: 'Administración',
            Item: 'Test',
            Metodo: 'creación',
            Datos: (jsonTexto),
            Respuesta: JSON.stringify(jsonTexto),
            TipoRespuesta: 200,
            Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }

          this.testsService.createLogAsync(Loguser).then(respuesta => { });

          this.toastr.success('Test duplicado exitosamente');
          this.closeVentana()
          this.cargarGestionTest()
          this.verLoteFlag.set(false);
          this.dataTableNuevoLote = [];
          this.lotesMultiples = [];
          this.nodup = false;
        }, (err: any) => {
          this.nodup = false;

          this.toastr.error(this.translate.instant(err.error));
        })

      } else {
        this.toastr.error(this.translate.instant('MODULES.NOTIFICACIONES.NOLOTE'));
        this.nodup = false;
      }
    }

  }

  get loteNuevoForm() {
    return this.formularioLote.get('LoteNuevo');
  }

  get fVencimientoForm() {
    return this.formularioLote.get('fVencimiento');
  }

  get mControlForm() {
    return this.formularioLote.get('mContro');
  }



}