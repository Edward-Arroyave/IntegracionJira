import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { SedesService } from '@app/services/configuracion/sedes.service';
import { SeccionesService } from '@app/services/configuracion/secciones.service';
import { ControlMaterialService } from '@app/services/configuracion/materialescontrol.service';
import { LotesService } from '@app/services/configuracion/lotes.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { TestsService } from '@app/services/configuracion/test.service';
import { ToastrService } from 'ngx-toastr';
import { SidebarService } from '@app/services/general/sidebar.service';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { DatePipe, NgFor, NgIf, NgClass, AsyncPipe, TitleCasePipe } from '@angular/common';
import { lastValueFrom, Observable, Subject } from 'rxjs';
import { map, startWith, switchMap, takeUntil, tap, filter } from 'rxjs/operators';
import { SharedService } from '@app/services/shared.service';
import { IngresoDatosService } from '@app/services/configuracion/ingreso-datos.service';
import { PorcentajeConfianzaService } from '@app/services/calidad-interno/porcentaje-confianza.service';

import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NombreLotePipe } from '@app/modules/shared/pipe/nombre-lote.pipe';
import { NombreControlmaterialPipe } from '@app/modules/shared/pipe/nombre-contmat.pipe';
import { NombreSeccionPipe } from '@app/modules/shared/pipe/nombre-seccion.pipe';
import { ImageCdnPipe } from '@app/modules/core/pipes/image-cdn.pipe';
import { MatDialog } from '@angular/material/dialog';
import { TablaComunComponent } from '@app/modules/shared/general-tablas/tabla-comun/tabla-comun.component';
import { ModalData } from '@app/Models/Modaldata';
import { ModalGeneralComponent } from '@app/modules/shared/modals/modal-general/modal-general.component';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NombreTestPipe } from "../../../../../shared/pipe/nombre-test.pipe";
import { createLog } from '@app/globals/logUser';

@Component({
    selector: 'app-porcentaje-confianza',
    templateUrl: './porcentaje-confianza.component.html',
    styleUrls: ['./porcentaje-confianza.component.css'],
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
    NgIf,
    MatTableModule,
    MatSortModule,
    MatSlideToggleModule,
    MatPaginatorModule,
    NgClass,
    AsyncPipe,
    TranslateModule,
    NombreLotePipe,
    NombreControlmaterialPipe,
    NombreSeccionPipe,
    ImageCdnPipe,
    TitleCasePipe,
    TablaComunComponent,
    NgxMatSelectSearchModule, NombreTestPipe]
})
export class PorcentajeConfianzaComponent implements OnInit {
  log = new createLog(this.datePipe, this.translate, this.PorcentajeConfianzaService);
  dataAnt: any;
  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();
  dateNowMilliseconds = this.dateNow.getTime();

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
  idObjeto: any;
  sedeId: number = 0;
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
  idTest: number;

  sedes = [];
  sedesActiveFilter = [];
  secciones = [];
  materiales = [];
  lotes = [];
  tests = [];
  dataTable = [];
  verBtn = false;
  ver = false;
  leveltest:number;
  banderacreate: boolean;
  horaActual: string;

  formFiltro: FormGroup = this.fb.group({

    sede: ['', [Validators.required]],
    seccion: ['', [Validators.required]],
    material: ['', [Validators.required]],
    lote: ['', [Validators.required]],
    test: ['', []]
  });

  formFiltroTest: FormGroup = this.fb.group({

    test: ['', [Validators.required]]

  });
  filterHeadquarters = new FormControl('');

  constructor(

    private fb: FormBuilder,
    private sedesService: SedesService,
    private seccionesService: SeccionesService,
    private translate: TranslateService,
    private testService: TestsService,
    private toastr: ToastrService,
    private sidebarservice: SidebarService,
    private datePipe: DatePipe,
    private lotesService: LotesService,
    private ControlMaterialService: ControlMaterialService,
    private sharedService: SharedService,
    private IDCN: IngresoDatosService,
    private PorcentajeConfianzaService: PorcentajeConfianzaService,
    private dialog: MatDialog
  ) {

  }

  displayedColumns: string[] = ['Analito','Equipo','Control material','Nivel','% confianza', 'Estado', 'Editar', 'Eliminar'];
  dataSource: MatTableDataSource<any>;
  dataTableBody:any[]=[];
  ventanaModal: BsModalRef;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('sedeselect', { static: true }) sedeselect: MatSelect;

  ngOnDestroy(): void {
    
  }

  ngOnInit(): void {
    const fechaHora = new Date();
    this.horaActual = `${fechaHora.getHours()}:${fechaHora.getMinutes()}:${fechaHora.getSeconds()}`;
    this.sedeId = JSON.parse(sessionStorage.getItem('sede'));
    this.cargarSeccionesPre();
    this.mainData();
    this.filtrosAutocomplete();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();
    const arrow = this.sedeselect._elementRef.nativeElement.querySelector('div.mat-select-arrow.ng-tns-c196-2');
    if (arrow) {
      arrow.style.color = "#FFF";
    }
  }

  filtrosAutocomplete() {
    this.filterHeadquarters.valueChanges.subscribe(word => {
      if (word) {
        this.sedes = this.sedesActiveFilter.filter((item: any) => {
          return item.Desheadquarters.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.sedes = this.sedesActiveFilter;
      }
    });
  }

  async Consultatest(idtest) {
    this.testService.getByIdAsync(idtest).then((data: any) => {
      this.leveltest = data.level;
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

  private _filterTest(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.tests.filter(test => test.value.toLowerCase().includes(filterValue));
  }

  async mainData() {
    await this.sedesService.getAllAsync().then(data => {
      this.sedes = data.filter(sede => sede.Active);
      this.sedesActiveFilter = data.filter(sede => sede.Active);
      const sedeId = sessionStorage.getItem('sede');
      this.formFiltro.get('sede').setValue(parseInt(sedeId));
    });
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

    await this.ControlMaterialService.getAllAsyncControlMaterialxsedesec(this.idsectionspr, this.sedeId).then(data => {
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

      //let id: number = parseInt(idcontmat);

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

  async lotesPre(nombreLote: string) {

    var desnumlot = this.formFiltro.get('lote').setValue(nombreLote.split('|')[1]);
    var idlot0 = nombreLote.split('|')[0];
    this.idlotspr = Number(idlot0);

    if (this.formFiltro.valid) {
      this.IDCN.getTestFiltroIngresoDatos(this.sedeId, this.idsectionspr, this.idcontrolmaterialpr, this.idlotspr).subscribe(response => {
        for (let item of response) { 
          item.value = `${item.IdTest},${item.Desanalytes} | ${item.Desunits} | ${item.Desmethods} | ${item.Desreagents} | ${item.NameAnalyzer}`
        }
        this.tests = response;
        this.ver = false;
        this.verBtn = false;
        this.formFiltroTest.get('test').setValue('');
        this.formFiltro.get('test').setValue('');
        this.filteredOptionsTest = this.formFiltro.get('test').valueChanges.pipe(
          startWith(''),
          map(value => {
            return this._filterTest(value)
          }),
        );
      }, error => {

        this.ver = false;
        this.tests = [];

        this.toastr.error('No se encontraron datos');
      });
    }
  }

  async byTest(test: any) {
    let id = test.split(',')[0];
    this.formFiltro.controls['test'].setValue(test.split(',')[1]);
    if (id != '') {
      this.idTest = id;
      this.verBtn = true;
    } else {
      this.verBtn = false;
    }
  }

  async search(recargar: boolean) {
    var _dataTable;
    this.dataSource = new MatTableDataSource();
    this.dataTable = [];
    this.dataTableBody = [];
    if (screen.width <= 768) {
      if (!this.sidebarservice.getSidebarState()) {
        this.sidebarservice.setSidebarState(!this.sidebarservice.getSidebarState());
      }
    }

    this.ver = false;
    var jsonTexto: any = '{"idtest":"' + this.idTest + '"}';

    this.PorcentajeConfianzaService.getinfoConfidencepercent(jsonTexto)
          .then(datavalid => {
            const filtrarDataTable: any[] = datavalid;
            this.dataAnt = datavalid;
            
            this.dataTableBody = filtrarDataTable.map( x =>  {
              return { Analito:x.Desanalytes,Equipo:x.NameAnalyzer,'Control material':x.Descontmat,Nivel:x.Leveltest
                      ,'% confianza':x.Percentconf,Estado:x.Active, item: x, item7:x,item8:x };
            });

            this.dataTable = datavalid;
            this.dataSource = new MatTableDataSource(this.dataTable);
            this.ver = true;

          })
          .catch(error => {

            this.dataTable = [];
            this.dataSource = new MatTableDataSource(this.dataTable);
            this.ver = true;
            this.toastr.error('No se encontraron datos');

          });
  }


  get leveltestNoValido() {
    return this.formularioRegistroEditar.get('leveltest');
  }
  get PercentconfNoValido() {
    return this.formularioRegistroEditar.get('Percentconf');
  }


  crearFormulario(datos: any) {

    this.formularioRegistroEditar = this.fb.group({

      Idconfidencepercent: [datos.Idconfidencepercent ? datos.Idconfidencepercent : ''],
      Id_test: [datos.IdTest ? datos.IdTest : this.idTest, [Validators.required]],
      Percentconf: [datos.Percentconf ? datos.Percentconf : '', [Validators.required, Validators.min(0)]],
      leveltest: [datos.Leveltest ? datos.Leveltest : '', [Validators.required, Validators.min(1), Validators.max(3)]],
      Datecreate: [this.datePipe.transform(new Date, "yyyy-MM-dd")],
      Hourcreate: [this.horaActual],
      userid: [datos.Userid ? datos.Userid : sessionStorage.getItem('userid')],
      active: [datos.Active ? datos.Active : false],

    });
  }

  async openModalRegistroPorctconf(templateRegistroPorcentajeconf: TemplateRef<any>, datos: any) {

    this.crearFormulario(datos);
    this.Consultatest(this.idTest);


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
      content: templateRegistroPorcentajeconf,
      btn: this.accionEditar?'Actualizar':'Guardar',
      btn2: 'Cerrar',
      footer:true,
      title: this.accion,
      image:''
    };
    const dialogRef = this.dialog.open(ModalGeneralComponent, { height:'auto' ,width: '60em', data, disableClose: true });

    dialogRef.componentInstance.primaryEvent?.pipe(takeUntil(destroy$)).subscribe(x =>{
      if(this.formularioRegistroEditar.invalid){
        this.formularioRegistroEditar.markAllAsTouched();
        return
      }
      this.crearEditarConfiObj(datos);
      dialogRef.close();
    });
  }

  async consultaPorcentajeConfianzaTest(nuevaData:any){
    var jsonTexto: any = '{"idtest":"' + this.idTest + '"}';

    await this.PorcentajeConfianzaService.getinfoConfidencepercent(jsonTexto).then(respuesta => {

      let searchLevel: any;
      if(this.accion === 'Editar'){
        searchLevel = respuesta.find(x => x.Leveltest === nuevaData.leveltest && x.Idconfidencepercent !== nuevaData.Idconfidencepercent) || null;
      }else{
        searchLevel = respuesta.find(x => x.Leveltest === nuevaData.leveltest) || null;
      }

      if(searchLevel !== null){
        this.banderacreate = false;
      }else{
        this.banderacreate = true;
      }

      if (this.banderacreate === false) {
        this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.VALIDCREATEPORCENTAJECONF'));
      }

      return;

    }).catch(error => {
      this.banderacreate = true;
      return;
    });
  }

  async crearEditarConfiObj(datos?:any) {
    let nuevaData = this.formularioRegistroEditar.value;
    if (!this.formularioRegistroEditar.invalid) {

      if (this.accion === 'Crear') {
        await this.consultaPorcentajeConfianzaTest(nuevaData);
        if (this.banderacreate) {
          if (nuevaData.leveltest > this.leveltest) {
            this.accion = 'noDatos';
            this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.VALIDLEVELTESTCONF'));
          }
          else
          {
            lastValueFrom(this.PorcentajeConfianzaService.create(nuevaData)).then(respuesta => {
              
              this.search(true);
              this.toastr.success('Registro creado');

              const Loguser = {
                Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
                hora: this.datePipe.transform(Date.now(), "shortTime"),
                Modulo:'Control Calidad Interno',
                Submodulo: 'Administración',
                Item:'Porcentaje de Confianza',
                Metodo: 'creación',
                Datos: JSON.stringify(nuevaData),
                Respuesta: JSON.stringify(respuesta),
                TipoRespuesta: 200,
                Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
              }

              this.PorcentajeConfianzaService.createLogAsync(Loguser).then(respuesta => {
              });
            }).catch(error =>{
              
              const Loguser = {
                Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
                hora: this.datePipe.transform(Date.now(), "shortTime"),
                Modulo:'Control Calidad Interno',
                Submodulo: 'Administración',
                Item:'Porcentaje de Confianza',
                metodo: 'creación',
                datos: JSON.stringify(nuevaData),
                respuesta: error.message,
                tipoRespuesta: error.status,
                Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
              }
              this.PorcentajeConfianzaService.createLogAsync(Loguser).then(respuesta => {});
            }) ;
          }
        }
      }else{
        if (nuevaData.leveltest > this.leveltest) {
          this.accion = 'noDatos';
          this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.VALIDLEVELTESTCONF'));
        } else {
          await this.consultaPorcentajeConfianzaTest(nuevaData);
          let datosAnteriores = this.dataAnt.find(x => x.Idconfidencepercent == datos.Idconfidencepercent);

          if(this.banderacreate){
            lastValueFrom(this.PorcentajeConfianzaService.update(nuevaData,nuevaData.Idconfidencepercent)).then(respuesta => {
              this.search(true);
              this.toastr.success('Registro actualizado');
  
              const Loguser = {
                Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
                hora: this.datePipe.transform(Date.now(), "shortTime"),
                Modulo:'Control Calidad Interno',
                Submodulo: 'Administración',
                Item:'Porcentaje de Confianza',
                Metodo: 'actualización',
                Datos: JSON.stringify(nuevaData),
                DatosAnteriores: `${datosAnteriores.Idconfidencepercent} | % confianza: ${datosAnteriores.Percentconf} - Nivel: ${datosAnteriores.Leveltest}`,
                Respuesta: JSON.stringify(respuesta),
                TipoRespuesta: 200,
                Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
              }
  
              this.PorcentajeConfianzaService.createLogAsync(Loguser).then(respuesta => {
              });
            }).catch(error =>{
              const Loguser = {
                Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
                hora: this.datePipe.transform(Date.now(), "shortTime"),
                Modulo:'Control Calidad Interno',
                Submodulo: 'Administración',
                Item:'Porcentaje de Confianza',
                metodo: 'actualización',
                datos: JSON.stringify(nuevaData),
                DatosAnteriores: `${datosAnteriores.Idconfidencepercent} | % confianza: ${datosAnteriores.Percentconf} - Nivel: ${datosAnteriores.Leveltest}`,
                respuesta: error.message,
                tipoRespuesta: error.status,
                Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
              }
              this.PorcentajeConfianzaService.createLogAsync(Loguser).then(respuesta => {});
  
            })
          }
        }
      }
    }
  }

  actualizarConfiObjEstado(datosConfi) {
    const [data,estado ] = datosConfi;
    data.Active = estado;
    lastValueFrom(this.PorcentajeConfianzaService.update(data, data.Idconfidencepercent)).then(_ => {
      this.search(true);
      this.accion = 'Editar';
      this.toastr.success('Estado actualizado','Actualización');
      this.log.logObj('Control Calidad Interno', 'Administración', 'Porcentaje de confianza', 'a', data, JSON.stringify(_), 200);
    },err =>{
    }).catch(error =>{
      this.toastr.error('No fue posible actualizar el estado', 'Error')
      this.log.logObj('Control Calidad Interno', 'Administración', 'Porcentaje de confianza', 'a', data, error.message, error.status);
    })
  }

  eliminarPorcentajeconfianza(id: any) {
    let datosAnteriores = this.dataAnt.find(x => x.Idconfidencepercent == id);
    this.PorcentajeConfianzaService.delete('Confobjquaanalyte', id).subscribe({
      next:(respuesta) => {
        this.search(true);
        this.accion = '';
        this.toastr.success('Registro eliminado');
  
        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo: 'Control Calidad Interno',
          Submodulo: 'Administración',
          Item: 'Porcentaje de Confianza',
          metodo: 'eliminación',
          datos: JSON.stringify(id),
          DatosAnteriores: `${datosAnteriores.Idconfidencepercent} | % confianza: ${datosAnteriores.Percentconf} - Nivel: ${datosAnteriores.Leveltest}`,
          respuesta: JSON.stringify(respuesta),
          tipoRespuesta: 200,
          Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
        this.lotesService.createLogAsync(Loguser).then(respuesta => {
        });
      },error:(err)=> {
        this.toastr.error(this.messageError);
        
        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo: 'Control Calidad Interno',
          Submodulo: 'Administración',
          Item: 'Porcentaje de Confianza',
          metodo: 'eliminación',
          datos: JSON.stringify(id),
          DatosAnteriores: `${datosAnteriores.Idconfidencepercent} | % confianza: ${datosAnteriores.Percentconf} - Nivel: ${datosAnteriores.Leveltest}`,
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
    this.translate.get('MODULES.SWAL.TITULO').subscribe(respuesta => this.titulo = respuesta);
    this.translate.get('MODULES.SWAL.TEXT').subscribe(respuesta => this.text = respuesta);
    this.translate.get('MODULES.SWAL.CANCEL').subscribe(respuesta => this.cancelar = respuesta);
    this.translate.get('MODULES.SWAL.CONFIRM').subscribe(respuesta => this.confirmar = respuesta);
    this.translate.get('MODULES.SWAL.TEXTERROR').subscribe(respuesta => this.textError = respuesta);
    this.translate.get('MODULES.SWAL.MESAGEERROR').subscribe(respuesta => this.messageError = respuesta);
  }
}
