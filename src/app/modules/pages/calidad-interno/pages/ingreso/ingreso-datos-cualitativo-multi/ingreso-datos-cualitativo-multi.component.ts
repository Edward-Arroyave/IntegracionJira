import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import dayjs from 'dayjs';
import { CuantitativosService } from '@app/modules/graficos/services/cuantitativos.service';
import { AccionesCorrectivasService } from '@app/services/configuracion/asociaciones.service';
import { IngresoDatosService } from '@app/services/configuracion/ingreso-datos.service';
import { LotesService } from '@app/services/configuracion/lotes.service';
import { ControlMaterialService } from '@app/services/configuracion/materialescontrol.service';
import { SeccionesService } from '@app/services/configuracion/secciones.service';
import { SedesService } from '@app/services/configuracion/sedes.service';
import { DEAService } from '@app/services/configuracion/servicesDatosEstadisticosAcumulados.service';
import { TestsService } from '@app/services/configuracion/test.service';
import { SidebarService } from '@app/services/general/sidebar.service';
import { CualitativosService } from '@app/modules/graficos/services/cualitativos.service';
import { IngresoDatosCualitativoService } from '@app/services/configuracion/ingreso-datos-cualitativo.service';
import { CriteriosAceptacionService } from '@app/services/configuracion/criterios-aceptacion.service';
import { Observable, Subject } from 'rxjs';
import { map, startWith, takeUntil } from 'rxjs/operators';
import { ExporterService } from '@app/services/mantenimiento-calibradores/exporter.service';
import { PermisosEspecialesService } from '@app/services/configuracion/permisos-especiales.service';
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import pdfMake from 'pdfmake/build/pdfmake';
import { Canvas, Cell, Columns, Img, Line, PdfMakeWrapper, Stack, Table, Txt } from 'pdfmake-wrapper';
import { LaboratoriosService } from '@app/services/configuracion/laboratorios.service';
import { ImageCdnPipe } from '../../../../../core/pipes/image-cdn.pipe';
import { NombreSeccionPipe } from '../../../../../shared/pipe/nombre-seccion.pipe';
import { NombreControlmaterialPipe } from '../../../../../shared/pipe/nombre-contmat.pipe';
import { NombreLotePipe } from '../../../../../shared/pipe/nombre-lote.pipe';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { CualitativosNivelTresComponent } from '../../../../../graficos/cualitativos-nivel-tres/cualitativos-nivel-tres.component';
import { CualitativosNivelDosComponent } from '../../../../../graficos/cualitativos-nivel-dos/cualitativos-nivel-dos.component';
import { CualitativosNivelUnoComponent } from '../../../../../graficos/cualitativos-nivel-uno/cualitativos-nivel-uno.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { NgFor, NgClass, NgIf, AsyncPipe, UpperCasePipe, TitleCasePipe, DatePipe, Location } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { ModalData } from '@app/Models/Modaldata';
import { ModalGeneralComponent } from '@app/modules/shared/modals/modal-general/modal-general.component';
import { Router } from '@angular/router';
import { LoaderService } from '@app/services/loader/loader.service';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
PdfMakeWrapper.setFonts(pdfFonts);

@Component({
  selector: 'app-ingreso-datos-cualitativo-multi',
  templateUrl: './ingreso-datos-cualitativo-multi.component.html',
  styleUrls: ['./ingreso-datos-cualitativo-multi.component.css'],
  standalone: true,
  imports: [FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    NgFor,
    MatOptionModule,
    MatInputModule,
    MatAutocompleteModule,
    MatTooltipModule,
    NgClass,
    NgIf,
    CualitativosNivelUnoComponent,
    CualitativosNivelDosComponent,
    CualitativosNivelTresComponent,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatDatepickerModule,
    AsyncPipe,
    UpperCasePipe,
    TitleCasePipe,
    DatePipe,
    TranslateModule,
    NombreLotePipe,
    NombreControlmaterialPipe,
    NombreSeccionPipe,
    ImageCdnPipe,
    MatIconModule]
})
export class IngresoDatosCualitativoMultiComponent implements OnInit {

  @ViewChild('TablaTresPaginator', { static: true }) tableTresPaginator: MatPaginator;
  @ViewChild('tabla3', { static: true }) tableTresSort: MatSort;
  @ViewChild('sedeselect', { static: true }) sedeselect: MatSelect;
  // PFD
  no_image = `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`
  qc_blanco = `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`
  clienteName: string;
  clienteNit: string;
  clienteAddres: string;// PFD

  sedes = [];
  secciones = [];
  materiales = [];
  lotes = [];
  tests = [];
  testsForm_arr = [];
  tests_arr_tmp = [];
  testId_arr_ref = [];
  dataTable = [];
  listaAccionesC = [];

  logoSourceToPDF: string;

  testByModal: any;
  sedeActual: any;

  index: number;
  sedeId: number;

  showAC = false;

  reglasW = '';

  opcion: number;

  resultadosNvl1 = [];
  resultadosNvl2 = [];
  resultadosNvl3 = [];

  arrImages: any[] = [];

  idTest: number;
  idAnalyte: number;

  verBtn = false;

  verTabla = false;

  decimales: number;

  mediaLvl1: any;
  mediaLvl2: any;
  mediaLvl3: any;

  desactivar = false;

  analito: any;
  hayReglas = false;
  usuario: any;

  crear = true;

  FVLote: any;

  decimalInvalidoLvl1 = false;
  decimalInvalidoLvl2 = false;
  decimalInvalidoLvl3 = false;

  verInfoprueba = false;
  levelTest: number;
  ver = false;


  dataSource: MatTableDataSource<any>;

  displayedColumns: string[] = [];
  summers = [];
  columnas = [];

  ventanaModal: BsModalRef;

  fechaActual = dayjs().format('YYYY-MM-DD');

  //-----------

  homeBtnHide: boolean = true;
  selectionTestHide: boolean = true;

  //------------

  //predictivos
  filteredOptionsSections: Observable<string[]>;
  filteredOptionsControlmaterial: Observable<string[]>;
  filteredOptionsLots: Observable<string[]>;
  indexSamen: number = 0;
  listsectionspr: any;
  idsectionspr: number;
  listcontrolmanterialpr: any;
  idcontrolmaterialpr: number;
  listlotspr: any;
  idlotspr: number;

  formGroupTable: FormGroup;
  levels = [];
  formGroups_ref = [];

  formFiltro: FormGroup = this.fb.group({

    sede: ['', [Validators.required]],
    seccion: ['', [Validators.required]],
    material: ['', [Validators.required]],
    lote: ['', [Validators.required]],
    idTest: ['', []]
  });

  // formFiltroTest: FormGroup = this.fb.group({

  //   test: ['', [Validators.required]]

  // });

  formaMasDatos: FormGroup = this.fb.group({

    actions: [''],
    comments: ['']

  });

  filtroFecha: FormGroup = this.fb.group({

    desde: [''],
    hasta: ['']

  });

  formularioDatos: FormGroup = this.fb.group({

    idresultqualitative: [''],
    idTest: [''],
    userid: [sessionStorage.getItem('userid')],
    idcorrectiveactions: [''],
    supervisor: [1],
    resultlevel1: [''],
    arlevel1: [''],
    resultcharlevel1: [''],
    resultlevel2: [''],
    arlevel2: [''],
    resultcharlevel2: [''],
    resultlevel3: [''],
    arlevel3: [''],
    resultcharlevel3: [''],
    evengroup: [''],
    comments: [''],
    date: [''],
    hour: [''],
    active: [false]


  });

  formaCalendarModal = this.fb.group({
    startDate: ['', [Validators.required]],
    endDate: ['', [Validators.required]]
  });

  btnDisabled: boolean = true;
  btnChkDisabled: boolean = true;

  //permisos 
  eliminarsi: boolean;
  editarsi: boolean;
  crearsi: boolean;
  rolid: number;
  userid: number;

  constructor(

    private fb: FormBuilder,
    private sedesService: SedesService,
    private seccionesService: SeccionesService,
    private materialService: ControlMaterialService,
    private lotesService: LotesService,
    private IDCL: IngresoDatosCualitativoService,
    private translate: TranslateService,
    private testService: TestsService,
    private accionesCorrectivasService: AccionesCorrectivasService,
    private toastr: ToastrService,
    private cualitativosService: CualitativosService,
    private caService: CriteriosAceptacionService,
    private sidebarservice: SidebarService,
    private modalService: BsModalService,
    private PermisosEspecialesService: PermisosEspecialesService,
    private dialog: MatDialog,
    private location: Location,
    private router: Router,
    private loader:LoaderService
  ) { }

  ngOnInit() {
    this.sedeId = JSON.parse(sessionStorage.getItem('sede'));

    this.dataForm();
    //this.filtraTest();
    this.cargarSeccionesPre();
    // cargar test
    this.testService.detalleTest().then(tests => this.tests_arr_tmp = tests);
    this.getPermissionsRol();

    const datosMulti: any = this.location.getState();

    if (datosMulti?.filtroMulti?.formulario) {
      console.log(datosMulti);
      this.idTest = datosMulti.filtroMulti.idTest;
      this.formFiltro.setValue(datosMulti.filtroMulti.formulario)
      this.idsectionspr = datosMulti.filtroMulti.idSeccion;
      this.idcontrolmaterialpr = datosMulti.filtroMulti.idMaterial;
      this.lotesPre(datosMulti.filtroMulti.lote, false);
      this.getTest()
    }
  }

  getPermissionsRol() {
    this.rolid = JSON.parse(sessionStorage.getItem('rolid'));
    this.userid = JSON.parse(sessionStorage.getItem('id'));
    this.PermisosEspecialesService.getAllAsyncpermissionsRol(this.rolid).then(lab => {
      lab.forEach(element => {
        if (element.Desmoduleaccess === "QCI Ingreso Datos") {
          if (element.Eliminar) {
            this.eliminarsi = true;
          } else {
            this.eliminarsi = false;
          }

          if (element.Editar) {
            this.editarsi = true;
          } else {
            this.editarsi = false;
          }

          if (element.Crear) {
            this.crearsi = true;
            this.formularioDatos.enable({ onlySelf: true });
          } else {
            this.crearsi = false;
            this.formularioDatos.disable({ onlySelf: true });
          }
        }
      });
    }, error => {
      this.crearsi = false;
      this.editarsi = false;
      this.eliminarsi = false;
    });
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

      this.filteredOptionsSections = this.formFiltro.get('seccion').valueChanges.pipe(
        startWith(''),
        map(value => {

          return this._filterSections(value)
        }),
      );
    });
  }

  async cambiarSeccion(NombreSeccion: string, idsection?: number) {

    var namesection0 = this.formFiltro.get('seccion').setValue(NombreSeccion.split('|')[1]);
    var idsection0 = NombreSeccion.split('|')[0];
    this.idsectionspr = Number(idsection0);

    this.formFiltro.controls['material'].setValue('');
    this.formFiltro.controls['lote'].setValue('');

    this.formFiltro.get('sede').setValue(this.sedeId);

    await this.materialService.getAllAsyncControlMaterialxsedesec(this.idsectionspr, this.sedeId).then(data => {
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

      this.filteredOptionsControlmaterial = this.formFiltro.get('material').valueChanges.pipe(
        startWith(''),
        map(value => {

          return this._filterControlMaterial(value)
        }),
      );
    });

  }

  async cambiarControlMaterial(NombreControlmaterial: string, idcontrolmaterial?: number) {

    var descontmat001 = this.formFiltro.get('material').setValue(NombreControlmaterial.split('|')[1]);
    var idcontmat = NombreControlmaterial.split('|')[0];
    this.idcontrolmaterialpr = Number(idcontmat);

    if (idcontmat != '') {

      this.formFiltro.get('lote').reset('');

      this.formFiltro.get('sede').setValue(this.sedeId);

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

        this.filteredOptionsLots = this.formFiltro.get('lote').valueChanges.pipe(
          startWith(''),
          map(value => {
            return this._filterLots(value)
          }),
        );
      });
    } else {

      //this.lotesActive = [];
      this.formFiltro.get('lote').setValue('');

    }


  }

  async lotesPre(nombreLote: string, flagSplit: boolean = true) {

    if (flagSplit) {
      let desnumlot = this.formFiltro
        .get("lote")
        .setValue(nombreLote.split("|")[1]);
      let idlot0 = nombreLote.split("|")[0];
      this.idlotspr = Number(idlot0);
    } else {
      this.idlotspr = Number(nombreLote);
    }


    if (this.formFiltro.valid) {
      this.formFiltro.get('sede').setValue(this.sedeId);

      this.IDCL.getTestFiltroIngresoDatosCualitativo(this.sedeId, this.idsectionspr, this.idcontrolmaterialpr, this.idlotspr)
        .subscribe(response => {

          response.forEach(_test => {

            if (_test.Level) {

              this.btnChkDisabled = false;

            }

          });

        }, error => {
          // this.formFiltro.reset({ sede: parseInt(sessionStorage.getItem('sede')), seccion: '', material: '', lote: '' });
          this.toastr.error('No se encontraron datos');
          this.selectionTestHide = true;
          this.btnChkDisabled = true;
        });
    }
  }


  //-------------------------------------
  //---------------------
  get startDateNoValido() {
    return this.formaCalendarModal.get('startDate');
  }
  get endDateNoValido() {
    return this.formaCalendarModal.get('endDate');
  }


  changeDate() {

    let fechaVencimiento = document.getElementById("expDate");
    fechaVencimiento.classList.remove('is-valid');

  }

  enviarFechaForm() {

    if (this.formaCalendarModal.invalid) {
      return Object.values(this.formaCalendarModal.controls).forEach(control => {
        control.markAsTouched();
      });
    }

    this.searchByDate();

  }
  //-------------------------------------

  openGraficaModal(templateModal: TemplateRef<any>) {

    this.ventanaModal = this.modalService.show(templateModal, { backdrop: 'static', keyboard: false });
    let modal_size = 'modal-md';
    this.ventanaModal.setClass(modal_size);

    const destroy$: Subject<boolean> = new Subject<boolean>();
    /* Variables recibidas por el modal */
    const data: ModalData = {
      content: templateModal,
      btn: 'Actualizar',
      btn2: 'Cerrar',
      footer: true,
      title: 'Editar',
      image: ''
    };
    const dialogRef = this.dialog.open(ModalGeneralComponent, { height: 'auto', width: '60em', data, disableClose: true });

    dialogRef.componentInstance.primaryEvent?.pipe(takeUntil(destroy$)).subscribe(x => {
      if (this.formaMasDatos.invalid) {
        this.formaMasDatos.markAllAsTouched();
        return
      }
      this.setTestDataFromModal();
      dialogRef.close();
    });

  }
  //-------------------------------------


  async searchByDate() {


    var desde = dayjs(this.formaCalendarModal.get('startDate').value).format('YYYY-MM-DD');
    var hasta = dayjs(this.formaCalendarModal.get('endDate').value).format('YYYY-MM-DD');

    // desplaza el sideBar
    if (screen.width <= 768) {
      if (!this.sidebarservice.getSidebarState()) {
        this.sidebarservice.setSidebarState(!this.sidebarservice.getSidebarState());
      }
    }
    this.loader.show();
    this.buildForm('', false);
    this.opcion = 4;

    this.ver = false, this.verInfoprueba = false;

    await this.IDCL.getBuscadorCualitativo(this.idTest).then(data => {

      this.dataTable = data;
      this.dataSource = new MatTableDataSource(this.dataTable);



      this.cualitativosService.validarARByDates(desde, hasta, this.dataTable[0].Idheadquarters, this.dataTable[0].IdAnalyzer, this.dataTable[0].IdControlMaterial, this.dataTable[0].IdLot, this.dataTable[0].Idanalytes, this.dataTable[0].Level, this.dataTable).then(datos => {
        this.cualitativosService.getEjesByDates(desde, hasta, this.dataTable[0].Level, this.dataTable[0].Idheadquarters, this.dataTable[0].IdAnalyzer, this.dataTable[0].IdControlMaterial, this.dataTable[0].IdLot, this.dataTable[0].Idanalytes, this.dataTable);
      });

      this.time(7000);

      this.formaCalendarModal.reset();

    }).catch(error => {

      this.dataTable = [];
      this.dataSource = new MatTableDataSource(this.dataTable);
      this.loader.hide();
      this.ver = true;
      this.verInfoprueba = false;
      this.opcion = 1;
      this.toastr.error('No se encontraron datos');

    });
  }

  //--------------------------------------------------------



  async dataForm() {

    await this.sedesService.getAllAsync().then(data => {
      this.sedes = data.filter(sede => sede.Active);
      this.formFiltro.get('sede').setValue(this.sedeId);
    });

    this.sedeActual = this.sedes.filter(x=> x.Idheadquarters == this.sedeId);

    await this.seccionesService.getAllAsync().then(data => {
      this.secciones = data.filter(seccion => seccion.active);
    });

    /* await this.materialService.getAllAsync().then(data => {
         this.materiales = data.filter(material => material.active);
       });
   
       await this.lotesService.getAllAsync().then(data => {
         this.lotes = data.filter(lote => lote.active);
       });*/

    this.accionesCorrectivasService.getAllAsync().then(data => {
      this.listaAccionesC = data.filter(acc => acc.active);
    });

    this.usuario = sessionStorage.getItem('nombres');

  }

  // monitorea los filtros
  filtraTest() {

    this.formFiltro.valueChanges.subscribe(datos => {

      this.btnChkDisabled = true;

      if (this.formFiltro.valid) {

        this.IDCL.getTestFiltroIngresoDatosCualitativo(datos.sede, datos.seccion, datos.material, datos.lote)
          .subscribe(response => {

            response.forEach(_test => {

              if (_test.Level) {

                this.btnChkDisabled = false;

              }

            });

          }, error => {
            // this.formFiltro.reset({ sede: parseInt(sessionStorage.getItem('sede')), seccion: '', material: '', lote: '' });
            this.toastr.error('No se encontraron datos');
            this.selectionTestHide = true;
            this.btnChkDisabled = true;
          });
      }

    });
  }




  // -- monitorea cambios en el Formulario de filtros --
  async filtrarTestByBtn() {
    let datos = {
      sede: this.formFiltro.get('sede').value,
      seccion: this.formFiltro.get('seccion').value,
      material: this.formFiltro.get('material').value,
      lote: this.formFiltro.get('lote').value,
    }
    this.selectionTestHide = true;
    this.formGroupTable = new FormGroup({});
    let levelsGroup = new FormGroup({});
    this.btnDisabled = true;


    if (this.formFiltro.valid) {
      this.IDCL.getTestFiltroIngresoDatosCualitativo(datos.sede, this.idsectionspr, this.idcontrolmaterialpr, this.idlotspr).subscribe(response => {

        this.tests = response;
        this.ver = false;
        this.verInfoprueba = false;
        this.verBtn = false;

        this.levels = response;
        // codigo para armar los formularios en la tabla
        this.levels.map((_test, index) => {
          this.testResultados(_test, index);
          if (_test.Level) {

            const name = 'group-' + index.toString();
            if (_test.Level == 3) {
              const formGroup = this.fb.group({
                lvl1: ['', [Validators.required]],
                lvl2: ['', [Validators.required]],
                lvl3: ['', [Validators.required]]
              });
              levelsGroup.addControl(name, formGroup);
            }
            if (_test.Level == 2) {
              const formGroup = this.fb.group({
                lvl1: ['', [Validators.required]],
                lvl2: ['', [Validators.required]],
              });
              levelsGroup.addControl(name, formGroup);
            }
            if (_test.Level == 1) {
              const formGroup = this.fb.group({
                lvl1: ['', [Validators.required]],
              });
              levelsGroup.addControl(name, formGroup);
            }
          }
        })
        this.formGroupTable.addControl('levels', levelsGroup);
        this.selectionTestHide = false;

      }, error => {
        //  this.formFiltro.reset({ sede: parseInt(sessionStorage.getItem('sede')), seccion: '', material: '', lote: '' });
        this.ver = false;
        this.tests = [];
        this.verInfoprueba = false;
        this.formGroupTable.reset();
        this.formGroupTable.removeControl('levels');
        this.selectionTestHide = true;
      });

    }
  }

  testResultados(_test, i: number) {


    this.caService.getDataCA(_test.IdTest).subscribe(data => {

      //console.log('data', data);

      this.tests[i]['resultadosNvl1'] = data.filter(x => x.Level == 1) || [];
      this.tests[i]['resultadosNvl2'] = data.filter(x => x.Level == 2) || [];
      this.tests[i]['resultadosNvl3'] = data.filter(x => x.Level == 3) || [];

      //console.log(this.tests);


    }, error => {
    });
  }

  validaDatos(){
    if (this.testsForm_arr.length > 0){
      this.toastr.warning("Se encontraron datos que faltan por guardar.");
      return;
    }
  }


  // --------Seleccionando el Test----------------------------
  async byTest(id: any, flag: boolean) {

    if (id != '') {

      this.idTest = id;
      var test: any;

      this.validarTipoResultados(id);

      await this.testService.detalleTest().then(data => {

        test = data.find(dato => dato.IdTest == id);
        //test.sort();
        this.idAnalyte = test.Idanalytes;
        this.levelTest = test.Level;
        this.analito = test.Desanalytes;
        this.FVLote = test.Expdate;

        if (this.levelTest == 1) {
          this.displayedColumns = ['num', 'date', 'hour', 'valuelevel1', 'arlevel1', 'ac', 'com'];
          this.summers = ['num', 'date', 'hour', 'summer', 'ac', 'com'];
          this.columnas = ['valuelevel1', 'arlevel1'];
          if (this.eliminarsi == true && this.editarsi == true) {
            this.displayedColumns.push('editar', 'eliminar');
            this.summers.push('editar', 'eliminar');


          } else if (this.eliminarsi == true && this.editarsi == false) {
            this.displayedColumns.push('eliminar');
            this.summers.push('eliminar');


          } else if (this.eliminarsi == false && this.editarsi == true) {
            this.displayedColumns.push('editar');
            this.summers.push('editar');
          }
        }

        if (this.levelTest >= 2) {
          this.displayedColumns = ['num', 'date', 'hour', 'valuelevel1', 'arlevel1', 'valuelevel2', 'arlevel2', 'ac', 'com'];
          this.summers = ['num', 'date', 'hour', 'summer', 'summer2', 'ac', 'com'];
          this.columnas = ['valuelevel1', 'arlevel1', 'valuelevel2', 'arlevel2'];
          this.formularioDatos.controls['resultlevel2'].setValidators([Validators.required]);;
          if (this.eliminarsi == true && this.editarsi == true) {
            this.displayedColumns.push('editar', 'eliminar');
            this.summers.push('editar', 'eliminar');
          }
          if (this.eliminarsi == true && this.editarsi == false) {
            this.displayedColumns.push('eliminar');
            this.summers.push('eliminar');
          }
          if (this.eliminarsi == false && this.editarsi == true) {
            this.displayedColumns.push('editar');
            this.summers.push('editar');
          }
        }

        if (this.levelTest == 3) {
          this.displayedColumns = ['num', 'date', 'hour', 'valuelevel1', 'arlevel1', 'valuelevel2', 'arlevel2', 'valuelevel3', 'arlevel3', 'ac', 'com'];
          this.summers = ['num', 'date', 'hour', 'summer', 'summer2', 'summer3', 'ac', 'com'];
          this.columnas = ['valuelevel1', 'arlevel1', 'valuelevel2', 'arlevel2', 'valuelevel3', 'arlevel3'];
          this.formularioDatos.controls['resultlevel3'].setValidators([Validators.required]);;

          if (this.eliminarsi == true && this.editarsi == true) {
            this.displayedColumns.push('editar', 'eliminar');
            this.summers.push('editar', 'eliminar');
          }
          if (this.eliminarsi == true && this.editarsi == false) {
            this.displayedColumns.push('eliminar');
            this.summers.push('eliminar');
          }
          if (this.eliminarsi == false && this.editarsi == true) {
            this.displayedColumns.push('editar');
            this.summers.push('editar');
          }
        }
      });

      this.verBtn = true;

    } else {

      this.verBtn = false;

    }

    const navigateRoute = {
      idTest:this.idTest,
      hayReglasFlag:this.hayReglas,
      reglasW:this.reglasW,
      idSeccion:this.idsectionspr,
      idMaterial:this.idcontrolmaterialpr,
      lote:this.idlotspr,
      level:this.levelTest
    };
    this.router.navigateByUrl('panel/calidad-interno/ingreso-datos/cualitativos',
      {
        state:
        {
          filtro:navigateRoute,
          filtroMulti:this.formFiltro.value  
        }});

  }


  //-------------------------------------------------------
  async getTest() {

    await this.testService.detalleTest().then(tests => this.tests_arr_tmp = tests);
    await this.filtrarTestByBtn();

    this.testId_arr_ref = [];
    this.formGroups_ref = [];
    this.testsForm_arr = [];
    this.arrImages = [];
    this.index = 0;



  }
  //-------------------------------------------------------



  time(time: number) {

    setTimeout(() => {

      this.loader.hide();
      this.verInfoprueba = true, this.ver = true;
      this.opcion = 1;

      this.dataSource.paginator = this.tableTresPaginator;
      this.dataSource.sort = this.tableTresSort;

      //------------
      this.homeBtnHide = false;

    }, time);

  }


  validarTipoResultados(idTest: number) {

    this.caService.getDataCA(idTest).subscribe(data => {

      this.resultadosNvl1 = data.filter(dato => dato.Level == 1) || [];
      this.resultadosNvl2 = data.filter(dato => dato.Level == 2) || [];
      this.resultadosNvl3 = data.filter(dato => dato.Level == 3) || [];

    }, error => {

      this.resultadosNvl1 = [];
      this.resultadosNvl2 = [];
      this.resultadosNvl3 = [];

    });

  }

  async option(opcion: string) {

    if (opcion == 'levey') {
      this.opcion = 1;
    }

    if (opcion == 'tabla') {
      this.opcion = 2;
    }

  }

  buildForm(datos: any, flag: boolean) {

    datos != '' ? this.formularioDatos.get('idresultqualitative').setValue(datos.Idresultqualitative) : this.formularioDatos.get('idresultqualitative').setValue('');
    datos != '' ? this.formularioDatos.get('idTest').setValue(datos.IdTest) : this.formularioDatos.get('idTest').setValue(this.idTest);
    datos != '' ? this.formularioDatos.get('userid').setValue(datos.Userid) : this.formularioDatos.get('userid').setValue(sessionStorage.getItem('userid'));
    datos != '' ? this.formularioDatos.get('idcorrectiveactions').setValue(datos.Idcorrectiveactions != '' && datos.Idcorrectiveactions != null ? datos.Idcorrectiveactions : '') : this.formularioDatos.get('idcorrectiveactions').setValue('');
    datos != '' ? this.formularioDatos.get('supervisor').setValue(datos.Supervisor) : this.formularioDatos.get('supervisor').setValue(1);

    if (!flag) {
      datos != '' ? this.formularioDatos.get('resultlevel1').setValue(datos.Resultlevel1) : this.formularioDatos.get('resultlevel1').setValue('');
    }
    datos != '' ? this.formularioDatos.get('arlevel1').setValue(datos.Arlevel1) : this.formularioDatos.get('arlevel1').setValue('');
    datos != '' ? this.formularioDatos.get('resultcharlevel1').setValue(datos.Resultcharlevel1) : this.formularioDatos.get('resultcharlevel1').setValue('');

    if (!flag) {
      datos != '' ? this.formularioDatos.get('resultlevel2').setValue(datos.Resultlevel2) : this.formularioDatos.get('resultlevel2').setValue('');
    }
    datos != '' ? this.formularioDatos.get('arlevel2').setValue(datos.Arlevel2) : this.formularioDatos.get('arlevel2').setValue('');
    datos != '' ? this.formularioDatos.get('resultcharlevel2').setValue(datos.Resultcharlevel2) : this.formularioDatos.get('resultcharlevel2').setValue('');

    if (!flag) {
      datos != '' ? this.formularioDatos.get('resultlevel3').setValue(datos.Resultlevel3) : this.formularioDatos.get('resultlevel3').setValue('');
    }
    datos != '' ? this.formularioDatos.get('arlevel3').setValue(datos.Arlevel3) : this.formularioDatos.get('arlevel3').setValue('');
    datos != '' ? this.formularioDatos.get('resultcharlevel3').setValue(datos.Resultcharlevel3) : this.formularioDatos.get('resultcharlevel3').setValue('');

    datos != '' ? this.formularioDatos.get('comments').setValue(datos.Comments) : this.formularioDatos.get('comments').setValue('');
    datos != '' ? this.formularioDatos.get('active').setValue(datos.Active) : this.formularioDatos.get('active').setValue('');

    datos != '' ? this.formularioDatos.get('evengroup').setValue(datos.Evengroup) : this.formularioDatos.get('evengroup').setValue('');

    datos != '' ? this.formularioDatos.get('date').setValue(datos.Date) : this.formularioDatos.get('date').setValue(dayjs().format('YYYY-MM-DD'));
    datos != '' ? this.formularioDatos.get('hour').setValue(datos.Hour) : this.formularioDatos.get('hour').setValue(dayjs().format('HH:mm:ss'))

    if (datos == '') {

      this.crear = true;
      this.showAC = false;

    } else {

      this.crear = false;

      if (datos.Arlevel1 == 'R' || datos.Arlevel2 == 'R' || datos.Arlevel3 == 'R') {

        this.showAC = true;

      } else {

        this.showAC = false;

      }

      this.opcion = 1;

    }

  }


  validarDecimales(valor: any, nivel: any) {

    var expresion: RegExp;

    this.decimales == 1 ? expresion = /^(\d+)$|^(\d+\.{1}\d{1})$/ : '';
    this.decimales == 2 ? expresion = /^(\d+)$|^(\d+\.{1}\d{2})$/ : '';
    this.decimales == 3 ? expresion = /^(\d+)$|^(\d+\.{1}\d{3})$/ : '';
    this.decimales == 4 ? expresion = /^(\d+)$|^(\d+\.{1}\d{4})$/ : '';
    this.decimales == 5 ? expresion = /^(\d+)$|^(\d+\.{1}\d{5})$/ : '';
    this.decimales == 6 ? expresion = /^(\d+)$|^(\d+\.{1}\d{6})$/ : '';
    this.decimales == 7 ? expresion = /^(\d+)$|^(\d+\.{1}\d{7})$/ : '';
    this.decimales == 8 ? expresion = /^(\d+)$|^(\d+\.{1}\d{8})$/ : '';
    this.decimales == 9 ? expresion = /^(\d+)$|^(\d+\.{1}\d{9})$/ : '';
    this.decimales == 10 ? expresion = /^(\d+)$|^(\d+\.{1}\d{10})$/ : '';
    this.decimales == 11 ? expresion = /^(\d+)$|^(\d+\.{1}\d{11})$/ : '';
    this.decimales == 12 ? expresion = /^(\d+)$|^(\d+\.{1}\d{12})$/ : '';
    this.decimales == 13 ? expresion = /^(\d+)$|^(\d+\.{1}\d{13})$/ : '';
    this.decimales == 14 ? expresion = /^(\d+)$|^(\d+\.{1}\d{14})$/ : '';
    this.decimales == 15 ? expresion = /^(\d+)$|^(\d+\.{1}\d{15})$/ : '';

    if (!expresion.test(valor)) {

      nivel == 1 ? this.decimalInvalidoLvl1 = true : '';
      nivel == 2 ? this.decimalInvalidoLvl2 = true : '';
      nivel == 3 ? this.decimalInvalidoLvl3 = true : '';

    } else {
      nivel == 1 ? this.decimalInvalidoLvl1 = false : '';
      nivel == 2 ? this.decimalInvalidoLvl2 = false : '';
      nivel == 3 ? this.decimalInvalidoLvl3 = false : '';
    }


  }



  // ----------Cambios en los Inputs NIVELES del Test------------------------
  async setTestDataLvl(test, _index) {

    const formTable = this.formGroupTable.get('levels');
    const formGroupTest = formTable.get(`group-${_index}`);


    if (formGroupTest.valid) {
      const btnEllipsis = document.getElementById(`test-${_index}`);
      btnEllipsis.removeAttribute("disabled");
    }


    const _testId_arr_ref = [...new Set(this.testId_arr_ref)];

    const _find = _testId_arr_ref.find(item => item == test.IdTest);


    if (this.index != _index) {
      this.formularioDatos.reset({ valuelevel1: 0, valuelevel2: 0, valuelevel3: 0 });

    }


    //const _test: any = await this.testService.getByIdAsync(test.IdTest).then(data => data);
    const _test: any = this.tests_arr_tmp.find(dato => dato.IdTest == test.IdTest);




    this.idTest = test.IdTest;
    this.decimales = _test.Decimals || 3;
    this.levelTest = _test.Level;
    this.FVLote = _test.Expdate;

    //this.crear = true;

    this.testId_arr_ref.push(this.idTest);
    this.formGroups_ref.push(`group-${_index}`);



    const formGroups_ref = [...new Set(this.formGroups_ref)];



    const groups_arr = [];
    formGroups_ref.forEach(group => {

      const _group = formTable.get(`${group}`);

      groups_arr.push(_group.valid);

    });


    // valida el boton guardar
    this.btnDisabled = true;

    const findValid = groups_arr.find(x => x == false);

    if (findValid == undefined) {
      this.btnDisabled = false;
    }


    const valvl1 = formGroupTest.get('lvl1') ? formGroupTest.get('lvl1').value || '' : '';
    const valvl2 = formGroupTest.get('lvl2') ? formGroupTest.get('lvl2').value || '' : '';
    const valvl3 = formGroupTest.get('lvl3') ? formGroupTest.get('lvl3').value || '' : '';

    if(valvl1 !== '' && valvl1 !== undefined
      || valvl2 !== '' && valvl2 !== undefined
      || valvl3 !== '' && valvl3 !== undefined
    ){
      this.btnDisabled = false;
    }

    this.formularioDatos.get('resultlevel1').setValue(valvl1);
    this.formularioDatos.get('resultlevel2').setValue(valvl2);
    this.formularioDatos.get('resultlevel3').setValue(valvl3);

    this.buildForm('', true);


    if (_find != undefined) {

      const i = this.testsForm_arr.map(x => x.idTest).indexOf(_find);

      this.testsForm_arr[i].resultlevel1 = valvl1;
      this.testsForm_arr[i].resultlevel2 = valvl2;
      this.testsForm_arr[i].resultlevel3 = valvl3;


    } else {
      this.testsForm_arr.push(this.formularioDatos.value);

    }


    this.index = _index;


  }

  setTestDataFromModal() {


    if (this.testsForm_arr.length > 0) {
      const _testFind: any = this.testsForm_arr.find(dato => dato.idTest == this.testByModal.IdTest);
      if (_testFind !== undefined) {
        const _ind = this.testsForm_arr.indexOf(_testFind);
        this.testsForm_arr[_ind].comments = this.formaMasDatos.get('comments').value ? this.formaMasDatos.get('comments').value : '';
        this.testsForm_arr[_ind].idcorrectiveactions = this.formaMasDatos.get('actions').value ? this.formaMasDatos.get('actions').value : '';
      }
    }
    this.closeVentana();
  }


  // ----------------------------------

  crearEditarFromTable() {
    
    if (this.FVLote < this.fechaActual) {

      this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.LOTEINACTIVO'));

    } else {
      this.testsForm_arr.forEach(item => {

        if (!item.processing) {
            item.processing = true; 

          this.desactivar = true;
          this.IDCL.create(item).subscribe({
            next: (resp) => {
              item.processing = false; 
              this.toastr.success('Registro creado');
              this.btnDisabled = true;
              //this.search(true);
              this.desactivar = false;
              this.formGroupTable.reset();
              this.formaMasDatos.reset();
              this.formGroupTable.get('lvl1').setValue('--');
              this.formGroupTable.get('lvl2').setValue('--');
              this.formGroupTable.get('lvl3').setValue('--');
            }, error: (error) => {
              item.processing = false;
              this.toastr.error('Error');
            }
          });
        }
      });
    }
  }

  //-------------------------------

  async materialControl(id: any) {
    this.formFiltro.controls['material'].setValue('');
    this.formFiltro.controls['lote'].setValue('');


    (await this.sedesService.gebByIdSeccionMateriasSedeControl(id, this.sedeId)).subscribe((data: any) => {
      if (data.length > 0) {
        this.materiales = data.filter(material => material.Active);
        this.lotes = [];

      }
    }, (err: any) => {
      this.materiales = [];
    });
  }

  async lote(id: any) {
    this.formFiltro.controls['lote'].setValue('');
    (await this.sedesService.gebByIdMaterialSedeLote(id, this.sedeId)).subscribe((data: any) => {

      if (data.length > 0) {
        this.lotes = data.filter(lote => lote.Active);
      }
    }, (err: any) => {
      this.lotes = [];
    });
  }


  //------------------------
  // MODAL Mas Datos
  //------------------------
  closeVentana(): void {
    // this.ventanaModal.hide();
    this.formularioDatos.get('resultlevel1').setValue('');
    this.formularioDatos.get('resultcharlevel1').setValue('');

    this.formularioDatos.get('resultlevel2').setValue('');
    this.formularioDatos.get('resultcharlevel2').setValue('');

    this.formularioDatos.get('resultlevel3').setValue('');
    this.formularioDatos.get('resultcharlevel3').setValue('');

    this.formularioDatos.get('idcorrectiveactions').setValue('');
    this.formularioDatos.get('comments').setValue('');
  }

  openEditarTestModal(templateRegistroArea: TemplateRef<any>, test) {

    this.testByModal = test;
    this.formaMasDatos.reset();

    const destroy$: Subject<boolean> = new Subject<boolean>();
    /* Variables recibidas por el modal */
    const data: ModalData = {
      content: templateRegistroArea,
      btn: 'Guardar Temporalmente',
      btn2: 'Cerrar',
      footer: true,
      title: 'Editar',
      image: ''
    };
    const dialogRef = this.dialog.open(ModalGeneralComponent, { height: 'auto', width: '30em', data, disableClose: true });

    dialogRef.componentInstance.primaryEvent?.pipe(takeUntil(destroy$)).subscribe(x => {
      if (this.formaMasDatos.invalid) {
        this.formaMasDatos.markAllAsTouched();
        return
      }
      this.setTestDataFromModal();
      dialogRef.close();
    });
  }


  //-------back Home-----

}