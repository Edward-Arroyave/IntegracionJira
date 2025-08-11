import { DatePipe, NgIf, NgClass } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { SharedService } from '@app/services/shared.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { VentanasModalesService } from '@app/services/general/ventanas-modales.service';
import { DatosAberrantesIntService } from '@app/services/configuracion/datos-aberrantes-int.service';
import { SedesService } from '../../../../../../services/configuracion/sedes.service';
import { PublicService } from '@app/services/public.service';
import { ControlMaterialService } from '@app/services/configuracion/materialescontrol.service';
import { SeccionesService } from '@app/services/configuracion/secciones.service';
import { LotesService } from '@app/services/configuracion/lotes.service';
import { Observable, Subject } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { ImageCdnPipe } from '../../../../../core/pipes/image-cdn.pipe';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TablaComunComponent } from '@app/modules/shared/general-tablas/tabla-comun/tabla-comun.component';
import { MatDialog } from '@angular/material/dialog';
import { ModalData } from '@app/Models/Modaldata';
import { ModalGeneralComponent } from '@app/modules/shared/modals/modal-general/modal-general.component';
import { LoaderService } from '@app/services/loader/loader.service';
import { createLog } from '@app/globals/logUser';

@Component({
    selector: 'datos-aberrantes',
    templateUrl: './datos-aberrantes.component.html',
    styleUrls: ['./datos-aberrantes.component.css'],
    providers: [DatePipe],
    standalone: true,
    imports: [
        MatFormFieldModule,
        MatInputModule,
        MatTableModule,
        MatSortModule,
        MatSlideToggleModule,
        MatPaginatorModule,
        FormsModule,
        ReactiveFormsModule,
        TranslateModule,
        ImageCdnPipe,
        TablaComunComponent
    ],
})
export class DatosAberrantesComponent implements OnInit {
  log = new createLog(this.datePipe, this.translate, this.DatosAberrantesIntService);
  dataAnt: any;
  displayedColumns: string[] = ['N° datos', 'Z-score', 'Estado', 'Editar', 'Eliminar'];
  dataSource: MatTableDataSource<any>;
  dataTableBody:any[]=[];

  ventanaModal: BsModalRef;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  formaRegistroDatosAberrantes: FormGroup;
  bandera: boolean;
  accion: any;
  desactivar = false;
  accionEditar: any;
  tituloAccion: any;
  messageError: any;
  messageSinDatos: string;
  titulo: string = '';
  dataTable = [];
  ok: string;
  text: string = '';
  text2: string = '';
  text3: string = '';
  aceptar: string = '';
  dateNow: Date = new Date();
  ver: boolean = undefined;
  verBtn: boolean = false;
  datos: any;

  formaBuscarDatos: FormGroup;
  sedesActive = [];
  sedes = [];
  habilitarSede: boolean = false;
  sedeId: number = 0;

  //predictivos
  filteredOptionsSections: Observable<string[]>;
  filteredOptionsControlmaterial: Observable<string[]>;
  filteredOptionsLots: Observable<string[]>;
  listsectionspr: any;
  idsectionspr: number;
  listcontrolmanterialpr: any;
  idcontrolmaterialpr: number;
  listlotspr: any;
  idlotspr: number;
  lotes = [];
  lotesActive = [];
  tests = [];
  secciones = [];
  seccionesActive = [];
  controlMaterial = [];
  controlMaterialActive = [];
  test: number;
  leveltest:number;
  dateNowISO = this.dateNow.toTimeString();

  constructor(

    private fb: FormBuilder,
    private datePipe: DatePipe,
    private DatosAberrantesIntService : DatosAberrantesIntService,
    private sharedService: SharedService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private publicService: PublicService,
    private dialog: MatDialog,
    private loader: LoaderService
  ) { }

  ngOnInit(): void {
    //this.cargarSeccionesPre();
    this.crearFormularioBuscarDatos();
    this.loadData();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();
    this.cargarSedes();
    this.sedeId = JSON.parse(sessionStorage.getItem('sede'));
    if (this.sedeId > 0) {
        this.formaBuscarDatos.controls['numLaboratorio'].setValue(this.sedeId);
        this.habilitarSede = true
      }
  }

  async cargarSedes() {
    this.sedes = await this.publicService.obtenerSedes();
    this.sedesActive = this.sedes.filter(e => e.active);
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


  setTest(event: any) {
    const test = event.value;
    if (test != '') {
      this.test = parseInt(test);
      this.verBtn = true;
    } else {
      this.verBtn = false;
    }
  }


  loadData() {
    this.loader.show();
    this.DatosAberrantesIntService.GetInfoAberrantData().subscribe({
      next:(respuesta) => {
        const filtrarDataTable: any[] = respuesta;
        this.dataAnt = respuesta;
        
        this.dataTableBody = filtrarDataTable.map( x =>  {
          return { 'N° datos':x.Participants,'Z-score':x.Zscore,Estado:x.Active, item:x, item4:x ,item5:x };
        });
        this.dataSource = new MatTableDataSource(respuesta);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loader.hide();
      },error:(err) => {
        this.loader.hide();
        this.dataSource = new MatTableDataSource([]);
        this.accion = 'noDatos';
        this.toastr.error('No se encontraron datos');
          
      }
    });
  }

  
  get participantsNoValido() {
    return this.formaRegistroDatosAberrantes.get('participants');
  }
  get zscoreNoValido() {
    return this.formaRegistroDatosAberrantes.get('zscore');
  }


  crearFormularioDatosAberrantes(datos: any) {
    this.formaRegistroDatosAberrantes = this.fb.group({
      idaberrantdatafilter: [datos.Idaberrantdatafilter ? datos.Idaberrantdatafilter : ''],
      participants: [datos.Participants ? datos.Participants : '', [Validators.required]],
      zscore: [datos.Zscore ? datos.Zscore : '', [Validators.required]],
      active: [datos.Active ? datos.Active : false],
    });
  }


  openModalRegistroDatosaberrantes(templateRegistroDatosAberrantes: TemplateRef<any>, datos: any) {

    this.crearFormularioDatosAberrantes(datos);
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
      content: templateRegistroDatosAberrantes,
      btn: this.accionEditar?'Actualizar':'Guardar',
      btn2: 'Cerrar',
      footer:true,
      title: this.accion,
      image:''
    };
    const dialogRef = this.dialog.open(ModalGeneralComponent, { height:'16em' ,width: '40em', data, disableClose: true });

    dialogRef.componentInstance.primaryEvent?.pipe(takeUntil(destroy$)).subscribe(x =>{
      if(this.formaRegistroDatosAberrantes.invalid){
        this.formaRegistroDatosAberrantes.markAllAsTouched();
        return
      }
      this.crearEditarCA(datos);
      dialogRef.close();
    });
  }


  crearEditarCA(datos?: any) {
    if (!this.formaRegistroDatosAberrantes.invalid) {
      if (this.accion === 'Crear') {
        let participantes = this.formaRegistroDatosAberrantes.get('participants').value;
        let existeNumero = this.dataTable.find(dato => dato.participants == participantes) || undefined;

        if (existeNumero != undefined) {
          this.accion = 'noDatos';
          this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.YAEXISTEPARTICIPANTES'));
        } else {
          this.accion = 'Crear';
          this.desactivar = true;
          this.DatosAberrantesIntService.create(this.formaRegistroDatosAberrantes.value).subscribe({
            next:(respuesta) => {
              this.loadData();
              
              this.toastr.success('Registro creado');
              this.desactivar = false;
  
              const Loguser = {
                fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
                hora: this.datePipe.transform(Date.now(), "shortTime"),
                Modulo:'Control Calidad Interno',
                Submodulo: 'Configuración',
                Item:'Datos Grubbs',
                Metodo: 'creación',
                Datos: JSON.stringify(this.formaRegistroDatosAberrantes.value),
                Respuesta: JSON.stringify(respuesta),
                TipoRespuesta: 200,
                Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
              }
              this.DatosAberrantesIntService.createLogAsync(Loguser).then(() => {
              });
            },error:(err)=> {
              const Loguser = {
                fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
                hora: this.datePipe.transform(Date.now(), "shortTime"),
                Modulo:'Control Calidad Interno',
                Submodulo: 'Configuración',
                Item:'Datos Grubbs',
                metodo: 'creación',
                datos: JSON.stringify(this.formaRegistroDatosAberrantes.value),
                respuesta: err.message,
                tipoRespuesta: err.status,
                Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
              }
  
              this.DatosAberrantesIntService.createLogAsync(Loguser).then(() => {
              });
            }, 
          });
        }

      } else {
        this.accion = 'Editar';
        let datosAnteriores = this.dataAnt.find(x => x.Idaberrantdatafilter == datos.Idaberrantdatafilter);

        this.DatosAberrantesIntService.update(this.formaRegistroDatosAberrantes.value, this.formaRegistroDatosAberrantes.value.idaberrantdatafilter).subscribe({
           next:(respuesta) => {
             this.loadData();
             this.toastr.success('Registro actualizado');
             const Loguser = {
                fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
                hora: this.datePipe.transform(Date.now(), "shortTime"),
                Modulo:'Control Calidad Interno',
                Submodulo: 'Configuración',
                Item:'Datos Grubbs',
                Metodo: 'actualización',
                Datos: JSON.stringify(this.formaRegistroDatosAberrantes.value),
                DatosAnteriores: `${datosAnteriores.Idaberrantdatafilter} | Datos Grubbs: ${datosAnteriores.Zscore} | Estado: ${datosAnteriores.Active}`,
                Respuesta: JSON.stringify(respuesta),
                TipoRespuesta: 200,
                Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
              }
              this.DatosAberrantesIntService.createLogAsync(Loguser).then(() => {
              });
            },error:(err) => {
              const Loguser = {
                fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
                hora: this.datePipe.transform(Date.now(), "shortTime"),
                Modulo:'Control Calidad Interno',
                Submodulo: 'Configuración',
                Item:'Datos Grubbs',
                metodo: 'actualización',
                datos: JSON.stringify(this.formaRegistroDatosAberrantes.value),
                DatosAnteriores: `${datosAnteriores.Idaberrantdatafilter} | Datos Grubbs: ${datosAnteriores.Zscore} | Estado: ${datosAnteriores.Active}`,
                respuesta: err.message,
                tipoRespuesta: err.status,
                Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
             }
             this.DatosAberrantesIntService.createLogAsync(Loguser).then(() => {
             });
           }
        });
      }
    }
  }


  actualizarCAEstado(datosConfi: any[]) {
    const [data,estado ] = datosConfi;
    data.Active = estado;
    const datosAnteriores = this.dataAnt.find(x => x.Idaberrantdatafilter == data.Idaberrantdatafilter);
    this.DatosAberrantesIntService.update(data, data.Idaberrantdatafilter).subscribe({
      next:(value) => {
        this.loadData();
        this.accion = 'Editar';
        this.log.logObj('Control Calidad Interno', 'Configuración', 'Datos Grubbs', 'a', data, JSON.stringify(value), 200, this.datosAnt(datosAnteriores));
        this.toastr.success('Estado actualizado','Actualización');
      },error:(err)=> {
        this.log.logObj('Control Calidad Interno', 'Configuración', 'Datos Grubbs', 'a', data, err.message, err.status, this.datosAnt(datosAnteriores));
        this.toastr.error('No fue posible actualizar el estado', 'Error')   
      }
    });
  }

  datosAnt(data: any) {
    return ` Idaberrantdatafilter: ${data.Idaberrantdatafilter} - Participants: ${data.Participants} - Zscore: ${data.Zscore} - Active: ${!data.Active}`;
  }


  eliminarCA(id: any) {
    let datosAnteriores = this.dataAnt.find(x => x.Idaberrantdatafilter == id.Idaberrantdatafilter);
    this.DatosAberrantesIntService.delete('CA', id.Idaberrantdatafilter).subscribe({
      next:(respuesta) => {
        this.loadData();
        this.accion = '';
        this.toastr.success('Registro eliminado');
  
        const Loguser = {
          fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo:'Control Calidad Interno',
          Submodulo: 'Configuración',
          Item:'Datos Grubbs',
          metodo: 'eliminación',
          DatosAnteriores: `${datosAnteriores.Idaberrantdatafilter} | Datos Grubbs: ${datosAnteriores.Zscore}`,
          datos: JSON.stringify(id),
          respuesta: JSON.stringify(respuesta),
          tipoRespuesta: 200,
          Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
        this.DatosAberrantesIntService.createLogAsync(Loguser).then(() => {
        });
      },error:(err) => {
        this.toastr.error(this.messageError);
        const Loguser = {
          fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo:'Control Calidad Interno',
          Submodulo: 'Configuración',
          Item:'Datos Grubbs',
          metodo: 'eliminación',
          DatosAnteriores: `${datosAnteriores.Idaberrantdatafilter} | Datos Grubbs Zscore: ${datosAnteriores.Zscore}`,
          datos: JSON.stringify(id),
          respuesta: err.message,
          tipoRespuesta: err.status,
          Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
        this.DatosAberrantesIntService.createLogAsync(Loguser).then(() => {
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
}
