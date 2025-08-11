
import { DatePipe, NgFor, NgIf, TitleCasePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { TemplateRef } from '@angular/core';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ClientesService } from '@app/services/configuracion/clientes.service';
import { ProgramasQceService } from '@app/services/configuracion/programas-qce.service';
import { RondasQceService } from '@app/services/configuracion/rondas-qce.service';
import { SampleQceService } from '@app/services/configuracion/sample-qce.service';
import { VentanasModalesService } from '@app/services/general/ventanas-modales.service';
import { SharedService } from '@app/services/shared.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import moment from 'moment';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject } from 'rxjs';
import { map, startWith, takeUntil } from 'rxjs/operators';
import { PublicService } from '@app/services/public.service';
import { SedesService } from '@app/services/configuracion/sedes.service';
import { ProgramConfClientHeaderqQceService } from '@app/services/calidad-externo/program-conf-client-headerq-qce.service';
import { createLog } from "../../../../../../globals/logUser";
import { SampleAssignAnalytesQceService } from '@app/services/calidad-externo/SampleAssignAnalytes.service';
import { ImageCdnPipe } from '../../../../../core/pipes/image-cdn.pipe';
import { NgbPagination, NgbPaginationPrevious, NgbPaginationNext } from '@ng-bootstrap/ng-bootstrap';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog } from '@angular/material/dialog';
import { ModalData } from '@app/Models/Modaldata';
import { ModalColors, ModalMessageComponent } from '@app/modules/shared/modals/modal-message/modal-message.component';
import { LoaderService } from '@app/services/loader/loader.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { TablaComunComponent } from '@app/modules/shared/general-tablas/tabla-comun/tabla-comun.component';
import { MatIconModule } from '@angular/material/icon';
import { ModalGeneralComponent } from '@app/modules/shared/modals/modal-general/modal-general.component';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-rondas',
  templateUrl: './rondas.component.html',
  styleUrls: ['./rondas.component.css'],
  providers: [DatePipe],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule,
    MatFormFieldModule, MatSelectModule, MatOptionModule,
    NgFor, MatTooltipModule, MatInputModule, MatTableModule,
    MatSortModule, MatPaginatorModule, NgIf, MatDatepickerModule,
    NgbPagination, NgbPaginationPrevious, NgbPaginationNext,
    TitleCasePipe, DatePipe, TranslateModule, ImageCdnPipe,
    NgxMatSelectSearchModule, TablaComunComponent, MatIconModule, MatCheckboxModule]
})
export class RondasComponent implements OnInit {
  log = new createLog(this.datePipe, this.translate, this.rondasQceService);
  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();
  ventanaModal: BsModalRef;
  formaRegistroRondasQce: FormGroup;
  formaBuscarDatos: FormGroup = this.fb.group({
    cliente: ['', [Validators.required]],
    sede: ['', [Validators.required]],
    programa: ['', [Validators.required]]
  })
  formularioSamples: FormGroup = this.fb.group({
    idSample: ['', Validators.required],
    idProgramConfClientHeadq: ['', Validators.required],
    fechaInicio: ['', Validators.required],
    fechaFin: ['', Validators.required]

  });
  accionEditar: any;
  tituloAccion: any;
  dataTable = [];
  accion: any;
  today = moment().format('YYYY-MM-DD');
  messageError: string;
  programa: string;
  idCliente: number;
  idPrograma: number;
  idsede: number;
  show = false;
  desactivar = false;
  show2 = false;
  verBtnAdd = false;
  cliente: string;
  idround: number;
  listaClientes = [];
  listaClientesCopy = [];
  listaProgramas = [];
  listaProgramasCopy = [];
  listaasignacionprogramas = [];
  listaSamples = [];
  listaSamplesCopy = [];
  rondas0: number;
  nroSamples = [];
  programAnalytesTmp = [];
  programAnalytes = [];
  page = 1;
  pageSize = 3;
  collectionSize = 0;
  maxSize = 0;
  indices = [];
  verSamples = false;
  numeromuestras: number;
  //predictivos create
  filteredOptionsSamplesCreate: Observable<string[]>;
  listsamplescreate: any;
  //predictivo edit
  idsamplepr: number;
  dessamplepr: any;
  listasamplepre: any;
  sedesActive: any;
  sedesActiveCopy: any;
  assignprograms: any = [];
  validrondas = [];
  isButtonDisabled = false;
  listaAnalitosXPrograma = [];
  listaAnalitosXProgramaCopy = [];
  listaAnalitosSinasignar = [];
  jsonTxtAnalitos = [];
  dataTableBody: any[] = [];
  vertodosanalitos: boolean = true;
  bloquearbuscar: boolean = true;
  isHabilited: boolean = true;
  openForm: boolean = false;

  //Filtro predictivo muestra

  sampleFilterControl = new FormControl('');
  filteredSamples: any[] = [];

  formaRegistroRondasQceEdit = this.fb.group({

    idround: [],
    idProgram: [],
    idclient: [],
    nroround: [Validators.required],
    nrosample: [],
    active: [],
    idSample: [],
    enddate: [],
    begindate: []

  });
  clienteSeleccionado: any;
  programSelected: any;
  sedeSeleccionada: any;

  displayedColumns: string[] = ['Cliente', 'Rondas', 'N° Muestras', 'Fecha Inicial', 'Fecha Final', 'Detalles', 'Editar', 'Eliminar'];
  dataSource: MatTableDataSource<any>;

  displayedColumnsDetalle: string[] = ['numuestra', 'idmuestra', 'inicial', 'final'];
  dataSourceDetalle: any[] = []

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  @ViewChild(MatPaginator, { static: false }) paginatorDetalle: MatPaginator;
  @ViewChild(MatSort, { static: true }) sortDetalle: MatSort;

  //Predictivos
  filterClients = new FormControl('')
  filterSede = new FormControl('')
  filterPrograma = new FormControl('')
  filterSamples = new FormControl('')

  maxEndDate = new Date()

  constructor(
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private clientesService: ClientesService,
    private programQceService: ProgramasQceService,
    private rondasQceService: RondasQceService,
    private sampleQceService: SampleQceService,
    private toastr: ToastrService,
    private sharedService: SharedService,
    private translate: TranslateService,
    private modalService: BsModalService,
    private ventanaService: VentanasModalesService,
    private publicService: PublicService,
    private SedesService: SedesService,
    private programConfClientHeaderqQceService: ProgramConfClientHeaderqQceService,
    private SampleAssignAnalytesQceService: SampleAssignAnalytesQceService,
    private dialog: MatDialog,
    private loaderService: LoaderService
  ) { }

  async ngOnInit(): Promise<void> {
    sessionStorage.setItem('consultaSedeExterna', '0');
    this.crearFormulario('');
    await this.consultarClientes();
    //this.consultarProgramas();
    await this.consultarSamples();
    this.titulosSwal();
    this.filters()
    this.Limpiarprograma()
    this.initializeData(); 
  }

  filters() {
    this.filterClients.valueChanges.subscribe(word => {

      if (word) {
        this.listaClientes = this.listaClientesCopy.filter((cliente: any) => {
          return cliente.name.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.listaClientes = this.listaClientesCopy
      }
    });
    this.filterSede.valueChanges.subscribe(word => {

      if (word) {
        this.sedesActive = this.sedesActiveCopy.filter((sede: any) => {
          return sede.desheadquarters.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.sedesActive = this.sedesActiveCopy
      }
    });
    this.filterPrograma.valueChanges.subscribe(word => {

      if (word) {
        this.listaProgramas = this.listaProgramasCopy.filter((sede: any) => {
          return sede.Desprogram.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.listaProgramas = this.listaProgramasCopy
      }
    });
  }
  
  // Método de muestras para inicializar los datos necesarios al cargar el componente
  initializeData() {

  // Al principio, muestra todas las muestras sin aplicar ningún filtro
  this.filteredSamples = this.listaSamplesCopy;

  // Se suscribe a los cambios del campo de búsqueda (sampleFilterControl)
  // Cada vez que el usuario escribe algo, se filtra la lista de muestras
  this.sampleFilterControl.valueChanges
    .pipe(
      startWith(''), // Empieza con una cadena vacía para mostrar todo al inicio
      map(value => this._filterSamples(value || '')) // Aplica el filtro con el valor ingresado
    )
    .subscribe(filtered => {
      // Actualiza la lista filtrada que se mostrará en el select
      this.filteredSamples = filtered;
    });
}

// Función que realiza el filtrado de muestras basado en el texto ingresado
_filterSamples(value: string): any[] {
  // Devuelve solo las muestras cuyo 'serialsample' incluye el texto ingresado (ignorando mayúsculas/minúsculas)
  return this.listaSamplesCopy.filter(muestra => {
    return muestra.serialsample.toLowerCase().includes(value.toLowerCase());
  });
}

  async cargarSedes(dataClient) {


    try {
      this.loaderService.show()
      this.loaderService.text.emit({ text: 'Cargando sedes..' })
      sessionStorage.setItem('consultaSedeExterna', '1');
      let respuesta = await this.publicService.obtenerSedesAsigProg(this.clienteSeleccionado.header)
      this.loaderService.hide()
      this.sedesActive = respuesta.filter(e => e.active);
      this.sedesActiveCopy = respuesta.filter(e => e.active);
      sessionStorage.setItem('consultaSedeExterna', '0');
    } catch (error) {
      this.loaderService.hide()
    }

  }

  selectFilter(idx, data) {
    switch (idx) {
      case 1:

        this.clienteSeleccionado = data;
        this.cargarSedes(data);
        this.formaBuscarDatos.get('sede').reset()
        this.formaBuscarDatos.get('programa').reset()
        break;
      case 2:
        this.sedeSeleccionada = data;
        this.consultarProgramas(data);
        break;
      case 3:
        this.programSelected = data;
        this.AsignacionesProgram(data.IdProgram)
        break;
    }

  }

  async consultarSamples() {
    try {
      this.loaderService.show()
      let respuesta = await this.sampleQceService.getAllAsync()
      if (respuesta) {
        this.listaSamples = respuesta.filter(datos => datos.active);
        this.listaSamplesCopy = respuesta.filter(datos => datos.active);
      }
      this.loaderService.hide()
    } catch (error) {
      this.loaderService.hide()

    }



  }

  AnalitosSinAsignar(muestra: number, programa: number) {

    const obj =
    {
      "Idsample": muestra,
      "Idprogram": this.idPrograma,
      "IdRound": this.idround,
      "IdClient": this.idCliente,
      "IdSede": this.idsede
    }

    this.SampleAssignAnalytesQceService.AnalitosQcesinasignar(obj).then((data: any) => {
      if (data.length) {
        this.listaAnalitosXPrograma = data;
        this.listaAnalitosXProgramaCopy = data;
        let analitosAsignados = data
          .filter(analito => analito.activeSampleAnalyte === 1)  // Filtra los elementos donde `active` es true
          .map(analito => analito.idProgramConfClientHeadq); // Mapea para obtener solo `idProgramConfClientHeadq`
        if (analitosAsignados.length) {
          if (analitosAsignados.length == data.length) {
            analitosAsignados.unshift('-1')
          }
          this.formularioSamples.get('idProgramConfClientHeadq').setValue(analitosAsignados);
        }
      }


    }).catch(error => {
      console.log(error.error)
      this.formularioSamples.get('idProgramConfClientHeadq').disable();
      this.listaAnalitosXPrograma=[];
      this.toastr.error(this.translate.instant('No hay analitos para asignar a la muestra seleccionada.'));

    });
  }


  async consultarClientes() {

    try {
      this.loaderService.show()
      this.loaderService.text.emit({ text: 'Cargando clientes..' })
      let respuesta = await this.clientesService.getAllAsync();
      this.listaClientes = respuesta;
      this.listaClientesCopy = respuesta;
      this.loaderService.hide()
    } catch (error) {
      this.loaderService.hide()
    }
  }

  async consultarProgramas(data: any) {

    try {

      this.loaderService.show()
      this.loaderService.text.emit({ text: 'Cargando programas..' })
      this.idCliente = this.clienteSeleccionado.idclient;
      this.idsede = this.sedeSeleccionada.idheadquarters;
      let respusta = await this.programConfClientHeaderqQceService.getProgramAssignAll(this.idCliente, this.idsede)
      this.listaProgramas = respusta;
      this.listaProgramasCopy = respusta;
      this.loaderService.hide()
    } catch (error) {
      this.loaderService.hide()
    }




  }

  // Select - Options

  selectAll(control: string) {
    this.formularioSamples.get(control).setValue(['-1']);
  }

  selectNone(control: string) {
    this.formularioSamples.get(control).setValue('');
  }

  selectOne(control: string) {
    if (this.formularioSamples.get(control).value[0] == '-1' || this.formularioSamples.get(control).value[0] == '') {

      this.formularioSamples.get(control).value.shift();
      this.formularioSamples.get(control).setValue(this.formularioSamples.get(control).value);
    }
  }

  selectedanalyte(control: string) {

    if (this.formularioSamples.get(control).value[0] == '-1' || this.formularioSamples.get(control).value[0] == '') {

      this.formularioSamples.get(control).value.shift();
      this.formularioSamples.get(control).setValue(this.formularioSamples.get(control).value);
    }
    if (this.formularioSamples.get(control).value[0] != '-1' || this.formularioSamples.get(control).value[0] != '') {

      this.selectanalyte(this.formularioSamples.get(control).value);
    }

    if (this.formularioSamples.get(control).value.length == this.listaAnalitosXPrograma.length) {
      let all = this.listaAnalitosXPrograma.map(e => { return e.idProgramConfClientHeadq })
      all.unshift("-1")
      this.formularioSamples.get(control).setValue(all)
    }
  }

  async selectanalyte(idProgramConfClientHeadq) {

    if (idProgramConfClientHeadq.length == 0) {
      return;
    }

    let arranalyte2 = [];
    idProgramConfClientHeadq.forEach(element => {
      if (element !== '-1') {
        arranalyte2.push(element)
      }
    });


  }

  selectedAllanalyte(control: string) {

    let all = this.listaAnalitosXPrograma.map(e => { return e.idProgramConfClientHeadq })
    all.unshift("-1")
    this.formularioSamples.get(control).setValue(all)

  }

  buildJsons(array: Array<any>, control: string): Array<any> {


    var cadena = '';
    var json = '';

    if (array[0] == '-1') {
      array.shift()
    }

    for (let i = 0; i < array.length; i++) {

      // if (array[0] == '-1') {

      //   cadena = 'Todos';
      //   json = '-1';
      //   break;

      // } else {

      json = array.join();
      var ref: any;

      if (control == 'idProgramConfClientHeadq') {
        var ref = this.listaAnalitosXPrograma.find(dato => dato.idProgramConfClientHeadq == array[i]);
        cadena += ref.desanalytes + ', ';
      }

    }
    return [json, cadena];
  }

  validselect() {

    if (this.listaAnalitosXPrograma.length == 0) {
      this.vertodosanalitos = false;
      return false
    }
    return true
  }

  async AsignacionesProgram(idprogram: number) {

    this.assignprograms = [];
    
    await this.programConfClientHeaderqQceService.Getprogramassignxidprogram(idprogram, this.idCliente, this.idsede).then(respuesta => {

      this.listaasignacionprogramas = respuesta.filter(datos => datos.Active);

      for (let item of respuesta) {
        this.assignprograms.push(item.IdProgramConfClientHeadq);
      }

    });
  }

  openModal(descripcion) {
    const data = { descripcion: descripcion, accion: this.accion }
    this.ventanaService.openModal(data);
  }

  async getDataTable() {
    try {
      this.dataTableBody = []
      this.dataTable = [];
      this.bloquearbuscar = true;

      const obj =
      {
        "IdClient": this.formaBuscarDatos.get('cliente').value,
        "Idsede": this.formaBuscarDatos.get('sede').value,
        "IdProgram": this.formaBuscarDatos.get('programa').value,
      }

      this.validrondas = [];
      this.idPrograma = this.formaBuscarDatos.get('programa').value;
      this.idsede = this.formaBuscarDatos.get('sede').value;

      this.loaderService.show()
      this.loaderService.text.emit({ text: 'Cargando rondas..' })


      await this.rondasQceService.buscarRondasQce(obj).then((data: any) => {
        if (data.length) {
          this.loaderService.hide()
          this.bloquearbuscar = false
          var rondas = [];
          this.validrondas = data;
          
          for (let a = 0; a < data.length; a++) {
            
            this.cliente = data[a].name;
            this.programa = data[a].desprogram;
            
            if (!rondas.includes(data[a].nroround)) {
              rondas.push(data[a].nroround);
            }
          }

      for (let i = 0; i < rondas.length; i++) {

        let arreglo = data.filter(ronda => ronda.nroround == rondas[i]);
        //let arreglo = data;
        let ronda = arreglo.pop();
        this.dataTable.push(ronda);

      }

      this.dataTable.sort(((a, b) => a.nroround - b.nroround));
      const filtrarDataTable: any[] = this.dataTable;
      this.dataTableBody = filtrarDataTable.map(x => {
        return {
          Cliente: x.name,
          Rondas: x.nroround,
          'N° Muestras': x.nrosample,
          'Fecha Inicial': this.formatDate(new Date(x.begindate)), // Formatear la fecha
          'Fecha Final': this.formatDate(new Date(x.enddate)),   // Formatear la fecha
          Detalles: x,
          item: x,
          item7: x,
          item8: x
        };
      });
      this.dataSource = new MatTableDataSource(this.dataTable);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.sharedService.customTextPaginator(this.paginator);
      //this.rondas = this.dataTable.length + 1;
      this.show = true;

      //this.assignprograms=[];
        }
      }).catch(error => {
        this.show = true;
        this.loaderService.hide()
      });
    } catch (error) {
      this.loaderService.hide()

      this.dataSource = new MatTableDataSource([]);

      this.clientesService.getByIdAsync(this.idCliente).then((cliente: any) => {
        this.cliente = cliente.name;
      });

      this.programQceService.getByIdAsync(this.idPrograma).then((programa: any) => {
        this.programa = programa.desprogram;
      });

      this.accion = 'noDatos';
      this.show = true;
      this.toastr.error(this.translate.instant('MODULES.NOTIFICACIONES.NOHAYDATOS'));
      //this.rondas = 1;

      this.show = true;
    }



  }

  loader() {

    if (this.accion == 'Crear') {

      setTimeout(() => {

        this.getDataTable();
        //   this.closeVentana();
        this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROCREADO'));
        this.desactivar = false;
        this.openForm = false;

      }, 2000);

    } else if (this.accion == 'Editar') {
      setTimeout(() => {
        this.getDataTable();
        this.openForm = false;
        //  this.closeVentana();
        this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROACTUALIZADO'));

      }, 2000);

    } else {
      this.openForm = false;
      this.getDataTable();
      //  this.closeVentana();
      this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROELIMINADO'));
    }
  }

  async buscarDatos() {

    this.dataSource = new MatTableDataSource();
    this.dataTableBody = [];
    this.dataTable = [];
    this.dataSourceDetalle = [];
    this.bloquearbuscar = false;

    if (this.formaBuscarDatos.valid) {
     this.getDataTable();
    } else {
      this.bloquearbuscar = true
      this.formaBuscarDatos.markAllAsTouched()
    }



  }



  Limpiarprograma() {

    this.formaBuscarDatos.get('programa').valueChanges.subscribe(() => {

      this.show = false;
      this.dataTable = [];
      this.assignprograms = [];
    });

  }

  limpiarFormBuscarDatos() {
    this.formaBuscarDatos.get('sede').reset();
    this.formaBuscarDatos.get('programa').reset();
    this.assignprograms = [];
  }
  limpiarFormBuscarDatosSede() {
    this.formaBuscarDatos.get('programa').reset();
    this.assignprograms = [];
  }


  //Pestaña de crear///
  async openRegistroRondas(datos: any) {
    this.idround = undefined;
    this.nroSamples = [];
    this.formularioSamples.reset({ idSample: '', fechaInicio: '', fechaFin: '' });
    this.formaRegistroRondasQce.get('nroround').reset();

    if (datos != '') {
      this.idround = datos.idround;
      this.verBtnAdd = false;
      this.show2 = false;
      this.rondas0 = datos.nroround;

      try {
        this.loaderService.show()
        let data = await this.rondasQceService.getSamples(datos.idclient, this.idsede, datos.idProgram, datos.nroround)
        this.formularioSamples.get('idProgramConfClientHeadq').enable();
        this.loaderService.hide()
        this.nroSamples = data;
        this.crearFormularioEdit(datos);

      } catch (error) {
        this.openForm = true;
        this.loaderService.hide()

      }


    } else {

      this.formularioSamples.get('idProgramConfClientHeadq').enable();
      this.verBtnAdd = true;
      this.show2 = true;


    }

    await this.AsignacionesProgram(this.formaBuscarDatos.get('programa').value);
    this.openForm = true;
    this.maxEndDate = new Date()
    setTimeout(() => {
      this.calcularAltoTabla()

    }, 100);
    this.accionEditar = !!datos;
    datos != '' ? this.accion = 'Editar' : this.accion = 'Crear';

  }



  async openModalRegistroRondasQceEdit(templateRegistroRondasQce: TemplateRef<any>, datos: any) {

    this.nroSamples = [];
    this.formularioSamples.reset({ idSample: '', fechaInicio: '', fechaFin: '' });

    if (datos != '') {

      this.idround = datos.idround;
      this.verBtnAdd = false;
      this.show2 = false;

      await this.rondasQceService.getSamples(datos.idclient, this.idsede, datos.idProgram, datos.nroround).then(data => {

        this.nroSamples = data;

      });

    } else {

      this.verBtnAdd = true;
      this.show2 = true;

    }

    this.crearFormularioEdit(datos);
    this.ventanaModal = this.modalService.show(templateRegistroRondasQce, { 'class': 'modal-lg', backdrop: 'static', keyboard: false });
    this.accionEditar = !!datos;
    datos != '' ? this.accion = 'Editar' : this.accion = 'Crear';
    datos ? this.translate.get('MODULES.RONDASQCE.FORMULARIO.ACTUALIZAR').subscribe(respuesta => this.tituloAccion = respuesta) : this.translate.get('MODULES.RONDASQCE.FORMULARIO.REGISTRAR').subscribe(respuesta => this.tituloAccion = respuesta);

  }

  editarSample(muestra: any, template: TemplateRef<any>) {

    this.idround = muestra.Idround;
    this.formularioSamples.reset()

    let objeto: any = this.nroSamples.find(muestra => muestra.Idround == this.idround);


    this.numeromuestras = objeto.Nrosample;
    //this.show2 = true;
    this.verBtnAdd = false;
    this.formularioSamples.get('idProgramConfClientHeadq').enable();

    const destroy$: Subject<boolean> = new Subject<boolean>();

    const data: ModalData = {
      content: template,
      btn: 'Actualizar',
      btn2: 'Cerrar',
      footer: true,
      title: 'Editar',
      image: 'assets/rutas/iconos/editar.png'
    };
    const dialogRef = this.dialog.open(ModalGeneralComponent, { height: 'auto', width: '70em', data, disableClose: true });

    dialogRef.componentInstance.primaryEvent?.pipe(takeUntil(destroy$)).subscribe(x => {
      if (this.formularioSamples.invalid) {
        this.formularioSamples.markAllAsTouched();
        return
      }
      this.crearEditarRodasQce();
      dialogRef.close();
    });

    this.formularioSamples.get('idSample').setValue(objeto.IdSample);
    this.formularioSamples.get('fechaFin').setValue(objeto.Enddate);
    this.formularioSamples.get('fechaInicio').setValue(objeto.Begindate);

    const today = new Date();
    const beginDate = new Date(objeto.Begindate)
    if (beginDate < today) {
      this.maxEndDate = beginDate;
    } else {
      this.maxEndDate = today;
    }

    this.AnalitosSinAsignar(objeto.IdSample, muestra.IdProgram);

  }

  async openModalDetalleRondasQce(templateDetalleQce: TemplateRef<any>, datos) {
    try {

      let arr = [];
      this.loaderService.show()
      this.loaderService.text.emit({ text: 'Cargando detalle...' })
      let respuesta = await this.rondasQceService.getSamples(datos.idclient, this.idsede, datos.idProgram, datos.nroround);
      this.loaderService.hide()
      arr = respuesta.sort(((a, b) => a.Nrosample - b.Nrosample));
      this.dataSourceDetalle = arr;

      const destroy$: Subject<boolean> = new Subject<boolean>();

      const data: ModalData = {
        content: templateDetalleQce,
        btn: 'Anterior',
        footer: true,
        title: 'Detalle',
        image: 'assets/rutas/iconos/tabla.png',
      };
      const dialogRef = this.dialog.open(ModalGeneralComponent, { height: 'auto', width: '40em', data, disableClose: true });

      dialogRef.componentInstance.primaryEvent?.pipe(takeUntil(destroy$)).subscribe(x => {

        dialogRef.close();
      });

      setTimeout(() => {

        const hoja = $('.hoja').height();
        const form = $('.container_formSamples').height();

        $('.tableDetalle').css('max-height', `calc(${hoja}px - 100px)`);

      }, 100);

    } catch (error) {
      this.loaderService.hide()
    }
    //this.ventanaModal = this.modalService.show(templateDetalleQce, { backdrop: 'static', keyboard: false });

  }

  crearFormulario(datos: any) {


    this.formaRegistroRondasQce = this.fb.group({

      idround: [datos.idround ? datos.idround : ''],
      IdProgramConfClientHeadq: [{ value: this.programa, disabled: true }],
      idclient: [{ value: this.cliente, disabled: true }],
      nroround: [datos.nroround ? datos.nroround : '', [Validators.required]],
      nrosample: [datos.nrosample ? datos.nrosample : ''],
      active: [datos.active ? datos.active : true],
      idSample: [datos.idSample ? datos.idSample : ''],
      enddate: [datos.enddate ? datos.enddate : ''],
      begindate: [datos.begindate ? datos.begindate : ''],

    });

  }

  get nroroundsForm() {
    return this.formaRegistroRondasQce.get('nroround');
  }

  crearFormularioEdit(datos: any) {

    this.formaRegistroRondasQce = this.fb.group({

      idround: [datos.idround ? datos.idround : ''],
      IdProgramConfClientHeadq: [{ value: this.programa, disabled: true }],
      idclient: [{ value: this.cliente, disabled: true }],
      nroround: [datos.nroround ? datos.nroround : ''],
      nrosample: [datos.nrosample ? datos.nrosample : ''],
      active: [datos.active ? datos.active : true],
      idSample: [datos.idSample ? datos.idSample : ''],
      enddate: [datos.enddate ? datos.enddate : ''],
      begindate: [datos.begindate ? datos.begindate : '']

    });

  }

  detailObj() {
    let cliente = this.listaClientes.find(x => x.idclient == this.formaBuscarDatos.value.cliente);
    let sede = this.sedesActive.find(x => x.idheadquarters == this.formaBuscarDatos.value.sede);
    let programa = this.listaProgramas.find(x => x.IdProgram == this.formaBuscarDatos.value.programa);
    var muestras = [];
    for (let item of this.nroSamples) {
      const obj = {
        muestra: item.Serialsample,
        fechaInicio: item.Begindate,
        fechaFin: item.Enddate
      }
      muestras.push(obj);
    }
    let obj = {
      cliente: cliente.name,
      sede: sede.desheadquarters,
      programa: programa.Desprogram,
      rondas: this.formaRegistroRondasQce.get('nroround').value,
      muestras: muestras
    }
    return obj;
  }

  async crearEditarRodasQce() {
    if (!this.isButtonDisabled) {
      this.isButtonDisabled = true;
      // Realiza tu acción aquí, como una solicitud HTTP o procesamiento asincrónico
      // Una vez que se complete la acción, habilita nuevamente el botón
      setTimeout(() => {
        this.isButtonDisabled = false;
      }, 2000); // Cambia esto al tiempo necesario

    } else {
      return
    }

    if (this.accion == 'Crear') {

      if (this.formaRegistroRondasQce.valid) {


        if (this.nroSamples.length != 0) {
          let validnrorondas = this.formaRegistroRondasQce.get('nroround').value;
          for (let n = 0; n < this.validrondas.length; n++) {
            if (this.validrondas[n].nroround === validnrorondas) {
              this.toastr.error(this.translate.instant('Número de ronda ya está configurado. ingrese otro.'));
              return;
            }
          }

          const obj =
          {
            "IdClient": this.formaBuscarDatos.get('cliente').value,
            "Idsede": this.formaBuscarDatos.get('sede').value,
            "IdProgram": this.assignprograms
          }

          for (let c = 0; c < this.nroSamples.length; c++) {

            const data = {
              idround: '',
              idSample: this.nroSamples[c].IdSample,
              IdProgramConfClientHeadq: this.assignprograms[0],
              idclient: this.idCliente,
              nroround: this.formaRegistroRondasQce.get('nroround').value,
              nrosample: c + 1,
              enddate: this.datePipe.transform(this.nroSamples[c].Enddate, "yyyy-MM-dd"),
              begindate: this.datePipe.transform(this.nroSamples[c].Begindate, "yyyy-MM-dd"),
              active: this.formaRegistroRondasQce.get('active').value
            }

            this.desactivar = true;

            this.rondasQceService.create(data).subscribe(res => {

              const datasampleassignanalyte = {
                idsampleassignanalytes: '',
                idsample: this.nroSamples[c].IdSample,
                IdProgramConfClientHeadq: this.nroSamples[c].IdAnalyte,
                idprogram: this.idPrograma,
                ListProgramconfclientheadq: this.listaasignacionprogramas,
                idround: res.idround,
                idsede: this.idsede,
                idclient: this.idCliente,
              }

              this.SampleAssignAnalytesQceService.create(datasampleassignanalyte).subscribe({
                next: (respuesta01) => {

                },
                error: (error) => {
                  this.toastr.error("Error en la asignación de analitos en las muestras");
                  this.loaderService.hide();
                },
                complete() {
                  
                },
              });
              
              this.programAnalytesTmp.forEach(item => {

                const roundConf = {
                  IdProgramConf: item.IdProgramconf,
                  IdRound: res.idround,
                  DesResult: item.Desresults,
                  Valuetype: item.Valuetype,
                  Assignedvalue: item.Assignedvalue,
                  Active: true
                }
                this.loaderService.show();

                this.rondasQceService.createRoundConf(roundConf).subscribe({
                  next: (rep) => {
                    console.log('Res crear RondaConf', rep)
                    this.loaderService.hide();
                  },
                  error: (error) => {
                    this.loaderService.hide();
                  },
                  complete() {
                    
                  },
                });
              });
              this.formaRegistroRondasQce.get('nroround').reset();
              this.log.logObj('Control Calidad Externo', 'Administración', 'Rondas', 'c', this.detailObj(), JSON.stringify(res), 200);
              this.formularioSamples.get('idProgramConfClientHeadq').enable();
              
            }, error => {
              this.log.logObj('Control Calidad Externo', 'Administración', 'Asignación de valores', 'c', this.detailObj(), error.message, error.status);
            });
          }
          this.loader();
        }
      } else {
        this.toastr.error(this.translate.instant('Debe diligenciar todos los campos para crear la ronda.'));
        console.log(this.formaRegistroRondasQce.value)
        this.formaRegistroRondasQce.markAllAsTouched()
      }

    } else {
      let enddate = this.formularioSamples.get('fechaFin').value;
      let begindate = this.formularioSamples.get('fechaInicio').value;
      let validnrorondas = this.formaRegistroRondasQce.get('nroround').value;

      if (this.rondas0 != this.formaRegistroRondasQce.get('nroround').value) {

        for (let a = 0; a < this.validrondas.length; a++) {
          if (this.validrondas[a].nroround === validnrorondas) {
            this.toastr.error(this.translate.instant('Número de ronda ya está configurado. ingrese otro.'));
            return
          }
        }

        for (var i = 0; i < this.nroSamples.length; i++) {

          if (this.formularioSamples.get('fechaFin').value != this.nroSamples[i].Enddate) {
            enddate = this.formularioSamples.get('fechaFin').value;
          } if (this.formularioSamples.get('fechaFin').value === "") {
            enddate = this.nroSamples[i].Enddate;
          }
          if (this.formularioSamples.get('fechaInicio').value != this.nroSamples[i].Begindate) {
            begindate = this.formularioSamples.get('fechaInicio').value;
          } if (this.formularioSamples.get('fechaInicio').value === "") {
            begindate = this.nroSamples[i].Begindate;
          }

          const data = {
            idround: this.nroSamples[i].Idround,
            idSample: this.nroSamples[i].IdSample,
            idclient: this.idCliente,
            IdProgramConfClientHeadq: this.nroSamples[i].IdProgramConfClientHeadq,
            nroround: this.formaRegistroRondasQce.get('nroround').value,
            nrosample: this.nroSamples[i].Nrosample,
            enddate: this.datePipe.transform(enddate, "yyyy-MM-dd"),
            begindate: this.datePipe.transform(begindate, "yyyy-MM-dd"),
            active: this.formaRegistroRondasQce.get('active').value
          }

          const datasampleassignanalyte = {
            idsampleassignanalytes: '',
            idsample: this.nroSamples[i].IdSample,
            IdProgramConfClientHeadq: this.nroSamples[i].IdAnalyte,
            idprogram: this.idPrograma,
            ListProgramconfclientheadq: this.listaasignacionprogramas,
            idround: data.idround,
            idsede: this.idsede,
            idclient: this.idCliente,
          }

          this.SampleAssignAnalytesQceService.create(datasampleassignanalyte).subscribe(respuesta01 => {
            this.formularioSamples.get('idProgramConfClientHeadq').enable()

          }, error => { console.log(error.error) })

          this.rondasQceService.update(data, data.idround).subscribe(_ => {

            this.log.logObj('Control Calidad Externo', 'Administración', 'Rondas', 'a', this.detailObj(), JSON.stringify(_), 200);

          }, error => {

            this.log.logObj('Control Calidad Externo', 'Administración', 'Asignación de valores', 'a', this.detailObj(), error.message, error.status);

          });

          // const ultimaPosicion = this.nroSamples[this.nroSamples.length - 1];

          // if (ultimaPosicion == this.nroSamples[i]) {
          //   this.loader();
          // }
          //  this.loader();
          this.openForm = false;
          await this.getDataTable();
        }

      } else {

        //Cuando se edita una sola muestra
        let idSample: number = parseInt(this.formularioSamples.get('idSample').value);
        let enddate = this.formularioSamples.get('fechaFin').value;
        let begindate = this.formularioSamples.get('fechaInicio').value;
        if (this.formularioSamples.value.idProgramConfClientHeadq != null) {
          this.jsonTxtAnalitos = this.buildJsons(this.formularioSamples.value.idProgramConfClientHeadq, 'idProgramConfClientHeadq');
        }

        const buscarm = this.nroSamples.find(x => x.IdSample == idSample && x.Idround != this.idround) || null;
        if (buscarm !== null) {
          this.toastr.info("La muestra que desea adicionar ya se encuentra agregada.");
          this.isHabilited = true;
          return;
        }

        const data = {
          idround: this.idround,
          idSample: idSample,
          IdProgramConfClientHeadq: this.assignprograms[0],
          idclient: this.idCliente,
          nroround: this.formaRegistroRondasQce.get('nroround').value,
          nrosample: this.numeromuestras,
          enddate: this.datePipe.transform(enddate, "yyyy-MM-dd"),
          begindate: this.datePipe.transform(begindate, "yyyy-MM-dd"),
          active: this.formaRegistroRondasQce.get('active').value,
        }

        //update round -
        this.rondasQceService.update(data, data.idround).subscribe(async _ => {
          this.log.logObj('Control Calidad Externo', 'Administración', 'Rondas', 'a', this.detailObj(), JSON.stringify(_), 200);
          //  this.loader();
          // 
          await this.rondasQceService.getSamples(this.idCliente, this.idsede, this.idPrograma, this.rondas0).then(data => {
            this.nroSamples = data;
          });

          this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROACTUALIZADO'));
        }, error => {
          this.log.logObj('Control Calidad Externo', 'Administración', 'Asignación de valores', 'a', this.detailObj(), error.message, error.status);
        });


        if(this.jsonTxtAnalitos[0].length > 0){
        //Addd analytes -
        const datasampleassignanalyte = {
          idsampleassignanalytes: '',
          idsample: idSample,
          IdProgramConfClientHeadq: this.jsonTxtAnalitos[0],
          idprogram: this.idPrograma,
          ListProgramconfclientheadq: this.listaasignacionprogramas,
          idround: data.idround,
          idsede: this.idsede,
          idclient: this.idCliente,
        }
        try {

          this.loaderService.show();
          this.loaderService.text.emit({ text: 'Guardando muestra' });
          let respuesta = await this.SampleAssignAnalytesQceService.create(datasampleassignanalyte).toPromise();
          this.loaderService.hide();
          let itemEditado = this.nroSamples.find(e => e.Idround == data.idround)
          if (itemEditado) {

            itemEditado.Serialsample = this.listaSamples.find(sa => sa.idSample == data.idSample).serialsample;
            itemEditado.Enddate = data.enddate
            itemEditado.Begindate = data.begindate
          }

          await this.getDataTable();
        
        } catch (error) {
          this.loaderService.hide();
          console.log(error.error)
        }
      }
      }
    }
  }
  
  async updateNroRound() {
    if (!this.isButtonDisabled) {
      this.isButtonDisabled = true;
      // Realiza tu acción aquí, como una solicitud HTTP o procesamiento asincrónico
      // Una vez que se complete la acción, habilita nuevamente el botón
      setTimeout(() => {
        this.isButtonDisabled = false;
      }, 2000); // Cambia esto al tiempo necesario
    } else {
      return
    }
    
    if (this.nroSamples.length != 0) {

      this.loader();
      
      const obj = {
        "IdClient": this.formaBuscarDatos.get('cliente').value,
        "Idsede": this.formaBuscarDatos.get('sede').value,
        "IdProgram": this.assignprograms
      }
      
      for (let c = 0; c < this.nroSamples.length; c++) {

        const data = {
          idround: this.nroSamples[c].Idround,
          idSample: this.nroSamples[c].IdSample,
          IdProgramConfClientHeadq: this.nroSamples[c].IdProgramConfClientHeadq,
          idclient: this.nroSamples[c].Idclient,
          nroround: this.formaRegistroRondasQce.get('nroround').value,
          nrosample: this.nroSamples[c].Nrosample,
          enddate: this.datePipe.transform(this.nroSamples[c].Enddate, "yyyy-MM-dd"),
          begindate: this.datePipe.transform(this.nroSamples[c].Begindate, "yyyy-MM-dd"),
          active: this.nroSamples[c].Active
        }
        
        this.rondasQceService.update(data, data.idround).subscribe(_ => {

        }, error => {

        });
      }
    }
  }    

  removeSample(muestra: any, i: any) {

    if (this.accion == 'Crear') {

      const destroy$: Subject<boolean> = new Subject<boolean>();
      const data: ModalData = {
        message: `¿Esta seguro que desea continuar con la eliminación?`,
        btn: 'Aceptar',
        btn2: 'Cancelar',
        footer: true,
        title: 'Eliminar',
        image: ''
      };
      const dialogRef = this.dialog.open(ModalGeneralComponent, { height: 'auto', width: '40em', data, disableClose: true });

      dialogRef.componentInstance.primaryEvent?.pipe(takeUntil(destroy$)).subscribe(x => {
        this.nroSamples.splice(i, 1);

        dialogRef.close();
      });

    } else {
      
      this.rondasQceService.getResultsRound(muestra.Idround).subscribe({
        next: (answerServiceOne) => {

          if(answerServiceOne.flag){
            
            this.rondasQceService.delete('ronda', muestra.Idround).subscribe({
              next: (_) => {
                this.nroSamples.splice(i, 1);
                let all = this.nroSamples.map(e => { return e.Idround })
                this.rondasQceService.UpdateNumberSample(all).subscribe({
                  next: (respuesta) => {
                    this.getDataTable();
                    this.toastr.success(respuesta.message);
                  }, error: (error) => {
                    this.toastr.error(error.message);
                  }
                });
              },
              error: (error) => {
                this.toastr.error(error.error.message);
              }
            })
          }
        },
        error: (error) => {
          this.toastr.error(error.error.message);
        }
      })
    }












  }
  // -------------------------------- MUESTRA MODAL CON TABLA MUESTRAS-> PLUS BTN------------------------------------------------
  async addProgramAnalyteConfig() {



    this.isHabilited = false;
    this.programAnalytes = [];
    this.programAnalytesTmp = [];

    if (this.formularioSamples.get('idSample').value == '' || this.formularioSamples.get('fechaInicio').value == '' || this.formularioSamples.get('fechaFin').value == '') {
      this.isHabilited = true;
      this.formularioSamples.markAllAsTouched()
      return;
    }

    this.verSamples = false;
    this.addSample();



  }
  refreshprogramAnalytes() {
    this.programAnalytes = this.programAnalytesTmp.slice((this.page - 1) * this.pageSize, (this.page - 1) * this.pageSize + this.pageSize);

  }
  // cumple requerimiento -  Solo se debe permitir una opción por analito
  selectChanged(analyte: any) {

    this.indices = [];

    this.programAnalytesTmp.forEach(item => {

      if (item.Desanalytes == analyte.Desanalytes) {

        const index = item.ListTipoValores.findIndex((x: any) => x.value == item.Valuetype);

        if (index > 0) {
          this.indices.push(index);
        }

        this.programAnalytesTmp.forEach(vt => {
          for (let i = 0; i < vt.ListTipoValores.length; i++) {
            vt.ListTipoValores[i].status = false;
          }

          for (let j = 0; j < this.indices.length; j++) {
            vt.ListTipoValores[this.indices[j]].status = true;
          }

        });

      }

    });

  }
  // cumple requerimiento -  Solo se debe permitir una opción por analito
  toggleChanged(analyte: any) {

    this.programAnalytesTmp.forEach(item => {

      if (item._id != analyte._id && item.Desanalytes == analyte.Desanalytes) {

        item.Assignedvalue = false;
      }
    });
  }
  async addSample() {
    if (this.formularioSamples.get('fechaInicio').value == '' || this.formularioSamples.get('fechaFin').value == '') {
      this.isHabilited = true;
      this.formularioSamples.markAllAsTouched()
      return;
    }

    const idSampleNew = this.formularioSamples.get('idSample').value;
    this.programAnalytes = [];
    this.verSamples = true;
    this.jsonTxtAnalitos = this.buildJsons(this.formularioSamples.value.idProgramConfClientHeadq, 'idProgramConfClientHeadq');
    try {
      this.loaderService.show();
      let sample: any = await this.sampleQceService.getByIdAsync(this.formularioSamples.get('idSample').value)
      this.loaderService.hide();

      //Validar que la muestra no exista aún
      const buscarm = this.nroSamples.find(x => x.IdSample == idSampleNew) || null;
      if (buscarm !== null) {
        this.toastr.info("La muestra que desea adicionar ya se encuentra agregada.");
        this.isHabilited = true;
        return;
      }
      const data = {

        IdSample: this.formularioSamples.get('idSample').value,
        IdAnalyte: this.jsonTxtAnalitos[0],
        Begindate: this.datePipe.transform(this.formularioSamples.get('fechaInicio').value, "yyyy-MM-dd"),
        Enddate: this.datePipe.transform(this.formularioSamples.get('fechaFin').value, "yyyy-MM-dd"),
        Serialsample: sample.serialsample

      }
      this.nroSamples.push(data);
      this.formularioSamples.reset({ idSample: '', idProgramConfClientHeadq: '', fechaInicio: '', fechaFin: '' });
      this.formularioSamples.get('idSample').setValue('')
      this.formularioSamples.get('fechaInicio').setValue('')
      this.formularioSamples.get('fechaFin').setValue('')
      this.isHabilited = true;


    } catch (error) {
      this.loaderService.hide();
      this.isHabilited = true;
    }




  }
  async eliminarRondaQce(row: any) {

    let nroround = row.nroround;
    let idRoundsArray = []

    for (let i = 0; i < this.validrondas.length; i++) {
      console.log(this.validrondas[i].idround)
      if (this.validrondas[i].nroround === nroround) {
        idRoundsArray.push(this.validrondas[i].idround)
      }
    }
    this.rondasQceService.deleteArray('deleteRounds', idRoundsArray).subscribe({
      next: (respuesta) => {
        //const ultimaPosicion = this.validrondas[this.validrondas.length - 1];
        // if (ultimaPosicion == this.validrondas[i]) {

        this.getDataTable();
        this.show = false;
        this.tituloAccion = '';
        this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.REGISTROELIMINADO'));
        this.log.logObj('Control Calidad Externo', 'Administración', 'Rondas', 'e', this.detailObj(), JSON.stringify(respuesta), 200);
      }, error: (error) => {
        this.toastr.error(this.messageError);
        this.log.logObj('Control Calidad Externo', 'Administración', 'Rondas', 'e', this.detailObj(), this.messageError, error.status);
      }
    });
  }



  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // closeVentana(): void {
  //   this.ventanaModal.hide();
  //   this.programAnalytes = [];
  //   this.formularioSamples.get('idProgramConfClientHeadq').enable()
  // }

  titulosSwal() {
    this.translate.get('MODULES.SWAL.MESAGEERROR').subscribe(respuesta => this.messageError = respuesta);
  }


  calcularAltoTabla() {

    const hoja = $('.hoja').height();
    const form = $('.container_formSamples').height();
    const altura = $('#table_muestras').height();
    $('#table_muestras').css('height', `calc(${hoja}px - ${form}px - 155px)`);

  }

  closeCrear() {

    this.openForm = false;

  }

  formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Meses de 0-11
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

}