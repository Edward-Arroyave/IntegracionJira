import { DatePipe, NgFor, NgIf, NgClass, AsyncPipe, TitleCasePipe } from '@angular/common';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Validators, FormGroup, FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { LotesService } from '@app/services/configuracion/lotes.service';
import { ControlMaterialService } from '@app/services/configuracion/materialescontrol.service';
import { VentanasModalesService } from '@app/services/general/ventanas-modales.service';
import { PublicService } from '@app/services/public.service';
import { SharedService } from '@app/services/shared.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ConfiguracionMediaDSService } from '@app/services/configuracion/configuracion-media-ds.service';
import { AppConstants } from '@app/Constants/constants';
import { ReportesService } from '@app/services/configuracion/reportes.service';
import Swal from 'sweetalert2';
import { SeccionesService } from '@app/services/configuracion/secciones.service';
import { ToastrService } from 'ngx-toastr';
import { SedesService } from '../../../../../../services/configuracion/sedes.service';
import { map, startWith, takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { ImageCdnPipe } from '../../../../../core/pipes/image-cdn.pipe';
import { NombreSeccionPipe } from '../../../../../shared/pipe/nombre-seccion.pipe';
import { NombreControlmaterialPipe } from '../../../../../shared/pipe/nombre-contmat.pipe';
import { NombreLotePipe } from '../../../../../shared/pipe/nombre-lote.pipe';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TablaComunComponent } from '@app/modules/shared/general-tablas/tabla-comun/tabla-comun.component';
import { MatDialog } from '@angular/material/dialog';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { ModalData } from '@app/Models/Modaldata';
import { ModalGeneralComponent } from '@app/modules/shared/modals/modal-general/modal-general.component';
import { LoaderService } from '@app/services/loader/loader.service';
import dayjs from 'dayjs';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NombreTestPipe } from "../../../../../shared/pipe/nombre-test.pipe";

@Component({
  selector: 'app-configuracion-media-ds',
  templateUrl: './configuracion-media-ds.component.html',
  styleUrls: ['./configuracion-media-ds.component.css'],
  providers: [DatePipe],
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
    MatPaginatorModule,
    AsyncPipe,
    TitleCasePipe,
    DatePipe,
    TranslateModule,
    NombreLotePipe,
    NombreControlmaterialPipe,
    NombreSeccionPipe,
    ImageCdnPipe,
    TablaComunComponent,
    MatDatepickerModule,
    NgxMatSelectSearchModule, NombreTestPipe
  ]
})

export class ConfiguracionMediaDsComponent implements OnInit {

  displayedColumns: string[] = ['Analito', 'Unidades', 'Nivel', 'Media', 'Ds', 'Cv', 'Tipo de dato', 'Última actualización', 'Responsable', 'Editar', 'Eliminar'];
  dataSource: MatTableDataSource<any>;
  dataTableBody: any[] = [];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();
  dateNowMilliseconds = this.dateNow.getTime();
  formaBuscarDatos: FormGroup;
  formaRegistroConfiMedia: FormGroup;
  arrayTipo = [];
  ventanaModal: BsModalRef;
  accionEditar: boolean;
  accionAbrir: boolean;
  ok: string;
  accion: string;
  tituloAccion: string;
  hidden;
  messageAlerta: string;
  desvestandar: any;
  coefvariacion: any;
  media: any;
  messageSinDatos: string;
  titulo: string = '';
  aceptar: string = '';
  test: number;
  text: string = '';
  ver: boolean = undefined;
  verBtn: boolean = false;
  lab: number;
  sec: number;
  mat: number;
  lote: number;

  sedes = [];
  sedesActive = [];
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

  listsectionspr: any;
  idsectionspr: number;
  listcontrolmanterialpr: any;
  idcontrolmaterialpr: number;
  listlotspr: any;
  idlotspr: number;

  // Variable para el test seleccionado
  testSeleccionado: any = null; 
  dataAnt: any;

  constructor(

    private fb: FormBuilder,
    private configuracionMediaDSService: ConfiguracionMediaDSService,
    private publicService: PublicService,
    private controlMaterialService: ControlMaterialService,
    private lotesService: LotesService,
    private seccionesService: SeccionesService,
    private sharedService: SharedService,
    private toastr: ToastrService,
    private modalService: BsModalService,
    private translate: TranslateService,
    private reportesService: ReportesService,
    private datePipe: DatePipe,
    private sedesService: SedesService,
    private dialog: MatDialog,
    private loader: LoaderService
  ) { }

  ngOnInit(): void {

    this.crearFormularioBuscarDatos();
    /*  this.cargarLotes();
      this.cargarControlMaterial();*/
    this.cargarSedes();
    this.cargarSecciones();
    this.titulosSwal();
    this.cargarSeccionesPre();
    //this.search();
    this.sharedService.customTextPaginator(this.paginator);

    this.sedeId = JSON.parse(sessionStorage.getItem('sede'));

    if (this.sedeId > 0) {
      this.formaBuscarDatos.controls['numLaboratorio'].setValue(this.sedeId);
      this.habilitarSede = true
    }
  }

  private _filterTest(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.tests.filter(test => test.value.toLowerCase().includes(filterValue));
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

    this.configuracionMediaDSService.getTestFiltroMediaDS(this.sedeId, this.idsectionspr, this.idcontrolmaterialpr, this.idlotspr).subscribe({
      next: (response) => {
        
        this.tests = [];
        this.verBtn = false;
      this.tests = response;
      this.formaBuscarDatos.get('idtest').setValue('');
      
      for (let item of response) { 
        item.value = `${item.IdTest},${item.Desanalytes} | ${item.Desunits} | ${item.Desmethods} | ${item.Desreagents} | ${item.NameAnalyzer}`
      }

      this.tests = response;

      this.filteredOptionsTest = this.formaBuscarDatos.get('idtest').valueChanges.pipe(
        startWith(''),
        map(value => {
          return this._filterTest(value)
        }),
      );
      
    }, error: (error) => {

      let arr = [];
      this.dataSource = new MatTableDataSource(arr);
      this.accion = 'noDatos';
      this.toastr.error('No se encontraron datos');
      //  this.formaBuscarDatos.reset({ numLaboratorio: '', seccion: '', numMaterialControl: '', numLote: '' });
      this.tests = [];
      this.ver = false;

    }
  })
  }

  async cargarSedes() {
    this.sedes = await this.publicService.obtenerSedes();
    this.sedesActive = this.sedes.filter(e => e.active == true);
  }

  async cargarSecciones() {
    this.secciones = await this.seccionesService.getAllAsync();
    this.seccionesActive = this.secciones.filter(e => e.active == true);
  }

  get numLaboratorioNoValido() {
    return this.formaBuscarDatos.get('numLaboratorio');
  }

  get seccionNoValido() {
    return this.formaBuscarDatos.get('seccion');
  }

  get numMaterialControlNoValido() {
    return this.formaBuscarDatos.get('numMaterialControl');
  }

  get numLoteNoValido() {
    return this.formaBuscarDatos.get('numLote');
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
      if (data != '') {

        this.seccionesActive = this.secciones.filter(e => e.active);
        this.tests = [];
        this.ver = false;

        this.formaBuscarDatos.patchValue({ seccion: '', numMaterialControl: '', numLote: '' });

      } else {

        this.seccionesActive = [];
        this.controlMaterialActive = [];
        this.lotesActive = [];
        this.tests = [];
        this.ver = false;

        this.formaBuscarDatos.patchValue({ seccion: '', numMaterialControl: '', numLote: '' });

      }

    });

    this.formaBuscarDatos.get('seccion').valueChanges.subscribe(data => {
      if (data != '') {

        this.controlMaterialActive = this.controlMaterial.filter(e => e.active);
        this.tests = [];
        this.ver = false;

        this.formaBuscarDatos.patchValue({ numMaterialControl: '', numLote: '' });

      } else {

        this.controlMaterialActive = [];
        this.lotesActive = [];
        this.tests = [];
        this.ver = false;

        this.formaBuscarDatos.patchValue({ numMaterialControl: '', numLote: '' });

      }

    });

    this.formaBuscarDatos.get('numMaterialControl').valueChanges.subscribe(data => {

      if (data != '') {

        this.lotesActive = this.lotes.filter(e => e.active);
        this.tests = [];
        this.ver = false;

        this.formaBuscarDatos.patchValue({ numLote: '' });

      } else {

        this.lotesActive = [];
        this.tests = [];
        this.ver = false;

        this.formaBuscarDatos.patchValue({ numLote: '' });

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

        this.configuracionMediaDSService.getTestFiltroMediaDS(this.lab, this.sec, this.mat, this.lote).subscribe(response => {

          this.tests = [];
          this.verBtn = false;
          this.tests = response;
          this.formaBuscarDatos.get('idtest').setValue('');

        }, error => {

          let arr = [];
          this.dataSource = new MatTableDataSource(arr);
          this.accion = 'noDatos';
          this.toastr.error('No se encontraron datos');
          //  this.formaBuscarDatos.reset({ numLaboratorio: '', seccion: '', numMaterialControl: '', numLote: '' });
          this.tests = [];
          this.ver = false;

        });

      }

    });

  }

setTest(test: any) {
  // Verificar si el valor seleccionado es válido
  if (test) {

    // Limpiar datos anteriores y forzar la actualización de la tabla
    this.dataTableBody = [];
    this.dataSource = new MatTableDataSource();
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.formaBuscarDatos.controls['idtest'].setValue(test.split(',')[1]);
    let id = test.split(',')[0];
    if (id !== '' || null || undefined) {
      this.test = parseInt(id);
      this.verBtn = true;
    } else {
      this.verBtn = false;
    }

    // Llamar a la función loadData para cargar los nuevos datos
    this.loadData();
  } else {
    // Si no se selecciona un test, ocultar el botón y limpiar la tabla
    this.verBtn = false;
  }
}



loadData() {
  this.dataTableBody = [];
  this.dataSource = new MatTableDataSource();
  this.loader.show();
  this.ver = false;

  // Llamar al servicio para obtener los datos del test seleccionado
  this.configuracionMediaDSService.getBuscadorConfiMediaDS(this.test).then(respuesta => {
    this.arrayTipo = AppConstants.LISTATIPODATOS;
    // Mapear los datos recibidos para agregar información del test
    const filtrarDataTable:any[] = respuesta;
      this.dataAnt = respuesta;

      respuesta.forEach((d)=>{
        d.Date = dayjs(d.Date).format("YYYY-MM-DD")
     });
     
      this.dataTableBody = filtrarDataTable.map( x =>  {
        return { 
          Analito:x.Desanalytes,Unidades:x.Desunits,Nivel:x.Level,
          Media:x.Average,Ds:x.Ds,Cv:x.Cv,'Tipo de dato':x.Datatype,
          'Última actualización':x.Date,Responsable:x.Username, item: x,item10:x
         };
      });

          // Actualizar el dataSource con los nuevos datos
      this.dataSource = new MatTableDataSource(respuesta);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;

    // Mostrar la tabla después de cargar los datos
    setTimeout(() => {
      this.loader.hide();
      this.ver = true;
    }, 1000);

  }).catch(error => {

    this.ver = true;
    this.dataSource = new MatTableDataSource([]);
    this.accion = 'noDatos';
    this.toastr.error('No se encontraron datos');
    this.loader.hide();
  });
}


  async createMediaDS(datos: any) {

  // Usar el test seleccionado almacenado para evitar buscar nuevamente
  if (this.testSeleccionado) {
    datos.idaverageds = 0;
    datos.idtest = this.test;
    datos.desanalytes = this.testSeleccionado.Desanalytes;
    datos.desunits = this.testSeleccionado.Desunits;
    datos.desmethods = this.testSeleccionado.Desmethods;
    datos.desreagents = this.testSeleccionado.Desreagents;
    datos.nameanalyzer = this.testSeleccionado.NameAnalyzer;
    datos.idanalytes = this.testSeleccionado.Idanalytes;
    datos.idanalyzer = this.testSeleccionado.IdAnalyzer;
    datos.idunits = this.testSeleccionado.IdUnits;
  }

  const usuario = sessionStorage.getItem('userid') || '';
  const nombreUsuario = `${sessionStorage.getItem('nombres') || ''} ${sessionStorage.getItem('apellidos') || ''}`;
  const endpoint = `${window.location.origin}/api/qci/ConfiMedia`;
  const userAgent = navigator.userAgent;
  const tiempoInicio = Date.now();

  // Log de datos previos
  const previewDataLog = {
    idtest: this.test,
    desanalytes: datos.desanalytes,
    desunits: datos.desunits,
    level: datos.level,
    average: datos.average,
    ds: datos.ds,
    cv: datos.cv,
    datatype: datos.datatype,
    date: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
    username: datos.username || 'admin',
  };

  this.configuracionMediaDSService.create(datos).subscribe({
    next: async (respuesta: any) => {
      const tiempoEjecucion = Date.now() - tiempoInicio;

      const Loguser = {
        Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
        Hora: new Date().toISOString(),
        Metodo: 'creación',
        Datos: JSON.stringify(datos),
        Respuesta: JSON.stringify(respuesta),
        TipoRespuesta: respuesta?.status ?? 200,
        userid: usuario,
        usuario: nombreUsuario,
        executionTime: tiempoEjecucion,
        endpoint: endpoint,
        userAgent: userAgent,
        modulo: 'Control Calidad Interno',
        SubModulo: 'Administración',
        item: 'Configuración Media y DS'
      };

      await this.configuracionMediaDSService.createLogAsync(Loguser);

      this.toastr.success('Registro creado con éxito');
      this.accion = 'Crear';

      // Recargar datos desde backend para evitar duplicados
      this.loadData();
    },
    error: (error) => {
      const tiempoEjecucion = Date.now() - tiempoInicio;

      const Loguser = {
        Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
        Hora: new Date().toISOString(),
        Metodo: 'creación',
        Datos: JSON.stringify(datos),
        Respuesta: error?.message || 'Error desconocido',
        TipoRespuesta: error?.status ?? 500,
        userid: usuario,
        usuario: nombreUsuario,
        executionTime: tiempoEjecucion,
        endpoint: endpoint,
        userAgent: userAgent,
        modulo: 'Control Calidad Interno',
        SubModulo: 'Administración',
        item: 'Configuración Media y DS'
      };

      this.configuracionMediaDSService.createLogAsync(Loguser).then(() => {
        this.toastr.error('Error al crear el registro');
      });
    }
  });
}









  /**
   * Elimina un registro de configuración de media y DS.
   * @param id 
   * @returns 
   */
  async deleteConfigMedia(dtDelete: any) {
    let datosAnteriores = this.dataAnt.find(x => x.Idaverageds == dtDelete.Idaverageds);
    const usuario = sessionStorage.getItem('userid') || '';
    const nombreUsuario = `${sessionStorage.getItem('nombres') || ''} ${sessionStorage.getItem('apellidos') || ''}`;
    const endpoint = `${window.location.origin}/api/qci/ConfiMedia/${dtDelete.Idaverageds}`;
    const userAgent = navigator.userAgent;
    const tiempoInicio = Date.now();

    // Datos de la fila para el log (antes de eliminar)
    const previewDataLog = {
      idaverageds: dtDelete.Idaverageds,
      desanalytes: dtDelete.Desanalytes,
      desunits: dtDelete.Desunits,
      level: dtDelete.Level,
      average: dtDelete.Average,
      ds: dtDelete.Ds,
      cv: dtDelete.Cv,
      datatype: dtDelete.Datatype,
      date: dtDelete.Date,
      username: dtDelete.Username
    };

    // Datos eliminados (puedes personalizar según lo que quieras guardar)
    const deleteDataLog = { ...previewDataLog };

    // Realizar la eliminación
    this.configuracionMediaDSService.delete(endpoint, dtDelete.Idaverageds).subscribe({
      next: (respuesta) => {
        const tiempoEjecucion = Date.now() - tiempoInicio;
        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          Hora: new Date().toISOString(),
          Metodo: 'eliminación',
          Datos: JSON.stringify(deleteDataLog),
          // DatosAnteriores: JSON.stringify(previewDataLog),
          DatosAnteriores: `${datosAnteriores.Idaverageds} | Nivel: ${datosAnteriores.Level} - Tipo de dato: ${datosAnteriores.Datatype} - Media: ${datosAnteriores.Average} - Ds: ${datosAnteriores.Ds} - Cv: ${datosAnteriores.Cv}`,
          Respuesta: JSON.stringify(respuesta),
          TipoRespuesta: respuesta?.status ?? 200,
          userid: usuario,
          usuario: nombreUsuario,
          executionTime: tiempoEjecucion,
          endpoint: endpoint,
          userAgent: userAgent,
          modulo: 'Control Calidad Interno',
          SubModulo: 'Administración',
          item: 'Configuración Media y DS'
        };

        this.configuracionMediaDSService.createLogAsync(Loguser).then(() => {
          this.loadData();
          this.toastr.success("Registro eliminado correctamente");
          // Si ya no hay datos, muestra mensaje y oculta la tabla
          if (this.dataTableBody.length === 0) {
            this.accion = 'noDatos';
            this.ver = false;
          }
        });
      },
      error: (error) => {
        const tiempoEjecucion = Date.now() - tiempoInicio;
        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          Hora: new Date().toISOString(),
          Metodo: 'eliminación',
          Datos: JSON.stringify({ dtDelete }),
          // DatosAnteriores: JSON.stringify(previewDataLog),
          DatosAnteriores: `${datosAnteriores.Idaverageds} | Nivel: ${datosAnteriores.Level} - Tipo de dato: ${datosAnteriores.Datatype} - Media: ${datosAnteriores.Average} - Ds: ${datosAnteriores.Ds} - Cv: ${datosAnteriores.Cv}`,
          Respuesta: error?.message || 'Error desconocido',
          TipoRespuesta: error?.status ?? 500,
          userid: usuario,
          usuario: nombreUsuario,
          executionTime: tiempoEjecucion,
          endpoint: endpoint,
          userAgent: userAgent,
          modulo: 'Control Calidad Interno',
          SubModulo: 'Administración',
          item: 'Configuración Media y DS'
        };

        this.configuracionMediaDSService.createLogAsync(Loguser).then(() => {
          this.toastr.error("Ocurrió un error al eliminar el registro");
        });
      }
    });
  }



  openModalConfiMedia(templateConfigMedia: TemplateRef<any>, datos: any) {
    this.accionEditar = true;
    this.accion = 'Editar';
    // Restablecer el formulario antes de abrir el modal
    //this.formaRegistroConfiMedia.reset();

    if (datos.Datatype == "fecha") {

      this.hidden = true;

    }

    this.crearFormularioConfiMedia(datos);
    const destroy$: Subject<boolean> = new Subject<boolean>();
    /* Variables recibidas por el modal */
    const data: ModalData = {
      content: templateConfigMedia,
      //btn: this.accionEditar ? 'Actualizar' : 'Guardar',
      btn: 'Actualizar',
      btn2: 'Cerrar',
      footer: true,
      title: this.accion,
      image: 'assets/rutas/iconos/editar.png'
    };
    const dialogRef = this.dialog.open(ModalGeneralComponent, { height: 'auto', width: '40em', data, disableClose: true });

    dialogRef.componentInstance.primaryEvent?.pipe(takeUntil(destroy$)).subscribe(x => {
      if (this.formaRegistroConfiMedia.invalid) {
        this.formaRegistroConfiMedia.markAllAsTouched();
        return
      }
      this.validarSeleccion();
      dialogRef.close();
    });
  }



  /**
 * Abre un modal para crear o editar la configuración de media y DS.
 * @param template - TemplateRef del modal.
 * @param datos - Datos del formulario (si se está editando).
 */
  async openModalCreateMediaDS(template: TemplateRef<any>, datos: any) {
    this.accionEditar = datos && typeof datos === 'object' && Object.keys(datos).length > 0;
    this.accion = this.accionEditar ? 'Editar' : 'Crear';

    // Si es creación (no edición)
    if (!this.accionEditar) {
      const idtest = this.test;

      if (!idtest) {
        this.toastr.warning('Seleccione un test antes de crear un nuevo registro');
        return;
      }

      // Filtrar registros del test actual
      const registrosDelTest = this.dataTableBody.filter(
        item => item.item10?.IdTest === idtest
      );

      // Obtener niveles ya asignados (asegúrate que estén en formato numérico)
      const nivelesUsados = registrosDelTest
        .map(r => Number(r.item10?.Level))
        .filter(n => !isNaN(n) && n >= 1 && n <= 3);

      // Buscar el primer nivel disponible entre 1 y 3
      const nivelesDisponibles = [1, 2, 3].filter(n => !nivelesUsados.includes(n));

      if (nivelesDisponibles.length === 0) {
        this.toastr.warning('Ya existen 3 niveles configurados para este test');
        return;
      }

      // Asignar el menor nivel disponible
      const nivelAsignado = nivelesDisponibles[0];

      const createData = {
        ...datos,
        Level: nivelAsignado,
        IdTest: this.test // asegurar que tenga el idtest
      };

      // Crear formulario
      this.crearFormularioConfiMedia(createData);
    }

    // Abrir modal con lógica existente
    const destroy$ = new Subject<boolean>();
    const data: ModalData = {
      content: template,
      btn: this.accionEditar ? 'Actualizar' : 'Guardar',
      btn2: 'Cerrar',
      footer: true,
      title: this.accion,
      image: this.accionEditar
        ? 'assets/rutas/iconos/editar.png'
        : 'assets/rutas/iconos/crear.png'
    };

    const dialogRef = this.dialog.open(ModalGeneralComponent, {
      height: 'auto',
      width: '40em',
      data,
      disableClose: true
    });

    dialogRef.componentInstance.primaryEvent?.pipe(takeUntil(destroy$)).subscribe(async () => {
        if (this.formaRegistroConfiMedia.invalid) {
          this.formaRegistroConfiMedia.markAllAsTouched();
          return;
        }

        await this.validarSeleccion();

        dialogRef.close();
        destroy$.next(true);
        destroy$.complete();
    });
  }



  get datatypeNoValido() {
    return this.formaRegistroConfiMedia.get('datatype');
  }

  get averageNoValido() {
    return this.formaRegistroConfiMedia.get('average');
  }

  get dsNoValido() {
    return this.formaRegistroConfiMedia.get('ds');
  }

  get cvNoValido() {
    return this.formaRegistroConfiMedia.get('cv');
  }

  get fechaInicioNoValido() {
    return this.formaRegistroConfiMedia.get('fechaInicio');
  }

  get fechaFinNoValido() {
    return this.formaRegistroConfiMedia.get('fechaFin');
  }

  /**
   * Crea el formulario para la configuración de media y DS.
   * @param datos - Datos iniciales para el formulario.
   */
crearFormularioConfiMedia(datos: any) {
  this.formaRegistroConfiMedia = this.fb.group({
    idaverageds: [datos.Idaverageds ? datos.Idaverageds : ''],
    datatype: [datos.Datatype ? datos.Datatype : '', [Validators.required]],  // Asegurarse que es obligatorio
    fechaInicio: [''],
    fechaFin: [''],
    date: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
    average: [datos.Average, [Validators.required, Validators.min(0)]],
    ds: [datos.Ds, [Validators.required, Validators.min(0)]],
    cv: [datos.Cv, [Validators.required, Validators.min(0)]],
    userid: [datos.Userid || sessionStorage.getItem('userid') || ''],
    idAnalyzer: [datos.IdAnalyzer ? datos.IdAnalyzer : ''],
    idAnalyte: [datos.Idanalytes ? datos.Idanalytes : ''],
    level: [datos.Level ? datos.Level : ''],
    idtest: [this.test],
    active: [datos.Active ? datos.Active : true]
  });
}




changeValue() {
  const tipoDato = this.formaRegistroConfiMedia.get('datatype')?.value;

  // Mostrar/ocultar fechas según el tipo de dato
  this.hidden = tipoDato === 'fecha';

  // Obtener controles del formulario
  const fechaInicioCtrl = this.formaRegistroConfiMedia.get('fechaInicio');
  const fechaFinCtrl = this.formaRegistroConfiMedia.get('fechaFin');
  const mediaCtrl = this.formaRegistroConfiMedia.get('average');
  const dsCtrl = this.formaRegistroConfiMedia.get('ds');
  const cvCtrl = this.formaRegistroConfiMedia.get('cv');

  // Si es "fecha", solo las fechas son requeridas
  if (tipoDato === 'fecha') {
    fechaInicioCtrl?.setValidators([Validators.required]);
    fechaFinCtrl?.setValidators([Validators.required]);

    // No requerido para media, ds, y cv
    mediaCtrl?.clearValidators();
    dsCtrl?.clearValidators();
    cvCtrl?.clearValidators();
  } else if (tipoDato === 'manual') {
    // Si es "manual", entonces media, ds, y cv son obligatorios
    mediaCtrl?.setValidators([Validators.required]);
    dsCtrl?.setValidators([Validators.required]);
    cvCtrl?.setValidators([Validators.required]);

    // No requerido para fechas
    fechaInicioCtrl?.clearValidators();
    fechaFinCtrl?.clearValidators();
  } else {
    // Si no hay opción seleccionada, limpiamos los validadores
    fechaInicioCtrl?.clearValidators();
    fechaFinCtrl?.clearValidators();
    mediaCtrl?.clearValidators();
    dsCtrl?.clearValidators();
    cvCtrl?.clearValidators();
  }

  // Actualizar validaciones para todos los campos
  fechaInicioCtrl?.updateValueAndValidity();
  fechaFinCtrl?.updateValueAndValidity();
  mediaCtrl?.updateValueAndValidity();
  dsCtrl?.updateValueAndValidity();
  cvCtrl?.updateValueAndValidity();
}


  async validarSeleccion() {
    if (this.datatypeNoValido.value === 'fecha') {
      if (!this.formaRegistroConfiMedia.invalid) {
        try {
          const mediaF = 'mediafija';
          this.media = await this.getVaribles(mediaF);
        } catch (err) {
          Swal.fire({
            text: `${this.messageAlerta}`,
            icon: 'info'
          });
          return;
        }

        try {
          const dsF = 'dsfija';
          this.desvestandar = await this.getVaribles(dsF);
        } catch (err) {
          Swal.fire({
            text: `${this.messageAlerta}`,
            icon: 'info'
          });
          return;
        }

        try {
          const cvF = 'cvfija';
          this.coefvariacion = await this.getVaribles(cvF);
        } catch (err) {
          Swal.fire({
            text: `${this.messageAlerta}`,
            icon: 'info'
          });
          return;
        }

        if (
          this.media.media !== 0 &&
          this.desvestandar.desvestandar !== 0 &&
          this.coefvariacion.coefvariacion !== 0
        ) {
          const datos = {
            idaverageds: this.formaRegistroConfiMedia.value.idaverageds,
            idtest: this.test,
            userid: this.formaRegistroConfiMedia.value.userid,
            level: this.formaRegistroConfiMedia.value.level,
            average: this.media.media,
            ds: this.desvestandar.desvestandar,
            cv: this.coefvariacion.coefvariacion,
            datatype: this.formaRegistroConfiMedia.value.datatype,
            date: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            active: this.formaRegistroConfiMedia.value.active
          };

          if (this.accionEditar) {
            this.crearEditarConfiMedia(datos);
          } else {
            this.createMediaDS(datos);
            this.loadData(); // ✅ Puedes dejar esto si ya funciona bien
          }
        } else {
          Swal.fire({
            text: `${this.messageAlerta}`,
            icon: 'info'
          });
          return;
        }
      }
    } else {
      if (this.formaRegistroConfiMedia.valid) {
        const datos = {
          idaverageds: this.formaRegistroConfiMedia.value.idaverageds,
          idtest: this.test,
          userid: this.formaRegistroConfiMedia.value.userid,
          level: this.formaRegistroConfiMedia.value.level,
          average: this.formaRegistroConfiMedia.value.average,
          ds: this.formaRegistroConfiMedia.value.ds,
          cv: this.formaRegistroConfiMedia.value.cv,
          datatype: this.formaRegistroConfiMedia.value.datatype,
          date: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          active: this.formaRegistroConfiMedia.value.active
        };

        if (this.accionEditar) {
          this.crearEditarConfiMedia(datos);
        } else {
          this.createMediaDS(datos);
          this.loadData(); 
        }
      }
    }
  }



  /**
   * metodo para armar los datos del formulario de configuración de media y DS.
   * @param esFecha 
   * @returns 
   */
  armarDatos(esFecha: boolean) {
    return {
      idaverageds: this.formaRegistroConfiMedia.value.idaverageds,
      idtest: this.formaRegistroConfiMedia.value.idtest,
      userid: this.formaRegistroConfiMedia.value.userid,
      username: sessionStorage.getItem('username') || 'admin',
      level: this.formaRegistroConfiMedia.value.level,
      average: esFecha ? this.media.media : this.formaRegistroConfiMedia.value.average,
      ds: esFecha ? this.desvestandar.desvestandar : this.formaRegistroConfiMedia.value.ds,
      cv: esFecha ? this.coefvariacion.coefvariacion : this.formaRegistroConfiMedia.value.cv,
      datatype: this.formaRegistroConfiMedia.value.datatype,
      date: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
      active: this.formaRegistroConfiMedia.value.active,
      // Estos campos extras debes traerlos de tu formulario:
      desanalytes: this.formaRegistroConfiMedia.value.desanalytes,
      idanalytes: this.formaRegistroConfiMedia.value.idanalytes,
      idanalyzer: this.formaRegistroConfiMedia.value.idanalyzer,
      desunits: this.formaRegistroConfiMedia.value.desunits,
      desmethods: this.formaRegistroConfiMedia.value.desmethods,
      desreagents: this.formaRegistroConfiMedia.value.desreagents,
      nameanalyzer: this.formaRegistroConfiMedia.value.nameanalyzer,
      idunits: this.formaRegistroConfiMedia.value.idunits
    };
  }


  async getVaribles(variableString) {
    let fechaini = dayjs(this.formaRegistroConfiMedia.value.fechaInicio).format("YYYY-MM-DD");
    let fechafin = dayjs(this.formaRegistroConfiMedia.value.fechaFin).format("YYYY-MM-DD");
    const data = {
      complemento: `Reportes/${variableString}`, fechaInicial: fechaini,
      fechaFinal: fechafin, level: this.formaRegistroConfiMedia.value.level,
      idheadquaerters: this.formaBuscarDatos.value.numLaboratorio, idanalyzer: this.formaRegistroConfiMedia.value.idAnalyzer,
      idcontrolmaterial: this.idcontrolmaterialpr, idlot: this.idlotspr,
      idanalyte: this.formaRegistroConfiMedia.value.idAnalyte,
      idtest: this.test
    }
    return this.reportesService.getVaribles(data).toPromise();
  }

  crearEditarConfiMedia(datos) {
    let datosAnteriores = this.dataAnt.find(x => x.Idaverageds == datos.idaverageds);
    this.configuracionMediaDSService.update(datos, datos.idaverageds).subscribe(respuesta => {
      this.loadData();
      this.accion = 'Editar';
      this.toastr.success('Registro actualizado');

      const Loguser = {
        Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
        hora: this.datePipe.transform(Date.now(), "shortTime"),
        Modulo: 'Control Calidad Interno',
        Submodulo: 'Administración',
        Item: 'Configuración Media y DS',
        Metodo: 'actualización',
        Datos: JSON.stringify(datos),
        DatosAnteriores: `${datosAnteriores.Idaverageds} | Nivel: ${datosAnteriores.Level} - Tipo de dato: ${datosAnteriores.Datatype} - Media: ${datosAnteriores.Average} - Ds: ${datosAnteriores.Ds} - Cv: ${datosAnteriores.Cv}`,
        Respuesta: JSON.stringify(respuesta),
        TipoRespuesta: 200,
        Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
      };
      
      this.configuracionMediaDSService.createLogAsync(Loguser).then(respuesta => {
      });
      
    }, (error) => {
      
      const Loguser = {
        Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
        hora: this.datePipe.transform(Date.now(), "shortTime"),
        Modulo: 'Control Calidad Interno',
        Submodulo: 'Administración',
        Item: 'Configuración Media y DS',
        metodo: 'actualización',
        datos: JSON.stringify(datos),
        DatosAnteriores: `${datosAnteriores.Idaverageds} | Nivel: ${datosAnteriores.Level} - Tipo de dato: ${datosAnteriores.Datatype} - Media: ${datosAnteriores.Average} - Ds: ${datosAnteriores.Ds} - Cv: ${datosAnteriores.Cv}`,
        respuesta: error.message,
        tipoRespuesta: error.status,
        Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
      };
      this.configuracionMediaDSService.createLogAsync(Loguser).then(respuesta => {
      });
    });
  }



  titulosSwal() {
    this.translate.get('MODULES.SWAL.MENSAJEALERTA').subscribe(respuesta => this.messageAlerta = respuesta);
    this.translate.get('MODULES.SWAL.SINDATOS').subscribe(respuesta => this.messageSinDatos = respuesta);
    this.translate.get('MODULES.SWAL.TITULO_ERROR').subscribe(respuesta => this.titulo = `<b>${respuesta}</b>`);
    this.translate.get('MODULES.SWAL.ACEPTAR').subscribe(respuesta => this.aceptar = respuesta);
    this.translate.get('MODULES.SWAL.OK').subscribe(respuesta => this.ok = `<b>${respuesta}</b>`);

  }

  async materialControl(id: any) {
    this.formaBuscarDatos.controls['numMaterialControl'].setValue('');
    this.formaBuscarDatos.controls['numLote'].setValue('');

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

    this.formaBuscarDatos.controls['numLote'].setValue('');
    (await this.sedesService.gebByIdMaterialSedeLote(id, this.sedeId)).subscribe((data: any) => {

      if (data.length > 0) {
        this.lotesActive = data;
        this.lotesActive = this.lotesActive.filter(e => e.Active == true);
      }
    }, (err: any) => {
      this.lotesActive = [];
    });
  }
}