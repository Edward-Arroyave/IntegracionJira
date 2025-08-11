import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { SharedService } from '@app/services/shared.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { HttpErrorResponse } from '@angular/common/http';
import { VentanasModalesService } from '@app/services/general/ventanas-modales.service';
import { AccionesCorrectivasService } from '@app/services/configuracion/asociaciones.service';
import { DatePipe, NgIf, NgClass } from '@angular/common';
import { ImageCdnPipe } from '../../../../../core/pipes/image-cdn.pipe';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TablaComunComponent } from '@app/modules/shared/general-tablas/tabla-comun/tabla-comun.component';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { ModalData } from '@app/Models/Modaldata';
import { ModalGeneralComponent } from '@app/modules/shared/modals/modal-general/modal-general.component';
import { createLog } from '@app/globals/logUser';

@Component({
    selector: 'app-gestion-acciones-correctivas',
    templateUrl: './gestion-acciones-correctivas.component.html',
    styleUrls: ['./gestion-acciones-correctivas.component.css'],
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
        NgClass,
        TranslateModule,
        ImageCdnPipe,
        TablaComunComponent
      ]
})
export class GestionAccionesCorrectivasComponent implements OnInit {
  dateNow: Date = new Date();
  log = new createLog(this.datePipe, this.translate, this.accionesCorrectivasService);
  dataAnt: any;

  dateNowISO = this.dateNow.toTimeString();
  formaAccionesCorrectivas: FormGroup;
  accionEditar: any;
  accion: any;
  tituloAccion: any;
  vantanaModal: BsModalRef;
  titulo: any;
  text: any;
  textError: any;
  desactivar = false;
  cancelar: any;
  confirmar: any;
  messageError: any;

  constructor(
    private translate: TranslateService,
    private accionesCorrectivasService: AccionesCorrectivasService,
    private fb: FormBuilder,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private sharedService: SharedService,
    private ventanaService: VentanasModalesService,
    private datePipe: DatePipe,
    private dialog: MatDialog
  ) { }
  displayedColumns: string[] = ['Acción correctiva', 'Estado', 'Editar', 'Eliminar'];
  dataSource: MatTableDataSource<any>;
  dataTableBody:any[]=[];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  ngOnInit(): void {
    this.cargarAccionesCorrectivas();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();
  }


  get descorrectiveNoValido() {
    return this.formaAccionesCorrectivas.get('descorrectiveactions');
  }


  crearFormularioAccionesCorrectivas(datos: any) {
    this.formaAccionesCorrectivas = this.fb.group({
      idcorrectiveactions: [datos.idcorrectiveactions ? datos.idcorrectiveactions : ''],
      descorrectiveactions: [datos.descorrectiveactions ? datos.descorrectiveactions : '', [Validators.required, Validators.minLength(2), Validators.maxLength(400)]],
      active: [datos.active ? datos.active : false],
    });
  }


  cargarAccionesCorrectivas() {
    this.accionesCorrectivasService.getAllAsync().then(respuesta => {
      const filtrarDataTable: any[] = respuesta;
      this.dataAnt = respuesta;
      
      this.dataTableBody = filtrarDataTable.map( x =>  {
        return { 'Acción correctiva':x.descorrectiveactions,Estado:x.active, item:x, item3:x,item4:x };
      });
      this.dataSource = new MatTableDataSource(respuesta);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }


  crearEditarAccionesCorrectivas(datos?: any) {
    if (!this.formaAccionesCorrectivas.invalid) {
      if (this.accion === 'Crear') {

        this.desactivar = true;
        this.accionesCorrectivasService.create(this.formaAccionesCorrectivas.value).subscribe({
          next:(respuesta)=> {
            this.cargarAccionesCorrectivas();
            this.toastr.success('Registro creado');
            this.desactivar = false;
  
            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo:'Control Calidad Interno',
              Submodulo: 'Configuración',
              Item:'Acciones Correctivas',
              Metodo: 'creación',
              Datos: JSON.stringify(this.formaAccionesCorrectivas.value),
              Respuesta: JSON.stringify(respuesta),
              TipoRespuesta: 200,
              Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }
  
            this.accionesCorrectivasService.createLogAsync(Loguser).then(respuesta => {});
          },error:(err)=> {
            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo:'Control Calidad Interno',
              Submodulo: 'Configuración',
              Item:'Acciones Correctivas',
              metodo: 'creación',
              datos: JSON.stringify(this.formaAccionesCorrectivas.value),
              respuesta: err.message,
              tipoRespuesta: err.status,
              Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }
            this.accionesCorrectivasService.createLogAsync(Loguser).then(respuesta => { });   
          }
        });

      } else {
        let datosAnteriores = this.dataAnt.find(x => x.idcorrectiveactions == datos.idcorrectiveactions);
        
        this.accionesCorrectivasService.update(this.formaAccionesCorrectivas.value, this.formaAccionesCorrectivas.value.idcorrectiveactions).subscribe({
          next:(respuesta) => {
            this.cargarAccionesCorrectivas();
            this.toastr.success('Registro actualizado');
  
            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo:'Control Calidad Interno',
              Submodulo: 'Configuración',
              Item:'Acciones Correctivas',
              Metodo: 'actualización',
              Datos: JSON.stringify(this.formaAccionesCorrectivas.value),
              DatosAnteriores: `${datosAnteriores.idcorrectiveactions} | Acción correctiva: ${datosAnteriores.descorrectiveactions} | Estado: ${datosAnteriores.active}`,
              Respuesta: JSON.stringify(respuesta),
              TipoRespuesta: 200,
              Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }
            this.accionesCorrectivasService.createLogAsync(Loguser).then(respuesta => {});
          },error:(err)=> {
            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo:'Control Calidad Interno',
              Submodulo: 'Configuración',
              Item:'Acciones Correctivas',
              metodo:'actualización',
              datos: JSON.stringify(this.formaAccionesCorrectivas.value),
              DatosAnteriores: `${datosAnteriores.idcorrectiveactions} | Acción correctiva: ${datosAnteriores.descorrectiveactions} | Estado: ${datosAnteriores.active}`,
              respuesta: err.message,
              tipoRespuesta: err.status,
              Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }
            this.accionesCorrectivasService.createLogAsync(Loguser).then(respuesta => {
            });
          },
        });
      }
    }
  }

  
  actualizarEstadoAccionesCorrectivas( datosAccionesCorrectivas:any[]) {
    const [data,estado ] = datosAccionesCorrectivas;
    data.active = estado;
    const datosAnteriores = this.dataAnt.find(x => x.idcorrectiveactions == data.idcorrectiveactions);
    this.accionesCorrectivasService.update(data, data.idcorrectiveactions).subscribe({
      next:(value )=> {
        this.cargarAccionesCorrectivas();
        this.accion = 'Editar';
        this.log.logObj('Control Calidad Interno', 'Configuración', 'Acciones correctivas', 'a', data, JSON.stringify(value), 200, this.datosAnt(datosAnteriores));
        this.toastr.success('Estado actualizado','Actualización');
      },error:(err)=> {
        this.log.logObj('Control Calidad Interno', 'Configuración', 'Acciones correctivas', 'a', data, err.message, err.status, this.datosAnt(datosAnteriores));
        this.toastr.error('No fue posible actualizar el estado', 'Error')
      }
    });
  }

  datosAnt(data: any) {
    return ` idcorrectiveactions: ${data.idcorrectiveactions} - descorrectiveactions: ${data.descorrectiveactions} - Active: ${!data.Active}`;
  }


  openModalAccionesCorrectivas(templateAccionesCorrectivas: TemplateRef<any>, datos: any) {
    this.crearFormularioAccionesCorrectivas(datos);
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
      content: templateAccionesCorrectivas,
      btn: this.accionEditar?'Actualizar':'Guardar',
      btn2: 'Cerrar',
      footer:true,
      title: this.accion,
      image:''
    };
    const dialogRef = this.dialog.open(ModalGeneralComponent, { height:'16em' ,width: '40em', data, disableClose: true });

    dialogRef.componentInstance.primaryEvent?.pipe(takeUntil(destroy$)).subscribe(x =>{
      if(this.formaAccionesCorrectivas.invalid){
        this.formaAccionesCorrectivas.markAllAsTouched();
        return
      }
      this.crearEditarAccionesCorrectivas(datos);
      dialogRef.close();
    });
  }


  eliminarAccionCorrectiva(id: any) {
    let datosAnteriores = this.dataAnt.find(x => x.idcorrectiveactions == id.idcorrectiveactions);
    this.accionesCorrectivasService.delete('CorrectiveActions', id.idcorrectiveactions).subscribe({
      next:(respuesta)=> {
        this.cargarAccionesCorrectivas();
        this.accion = '';
        this.toastr.success('Registro eliminado');
  
        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo:'Control Calidad Interno',
          Submodulo: 'Configuración',
          Item:'Acciones Correctivas',
          metodo: 'eliminación',
          datos: JSON.stringify(id),
          DatosAnteriores: `${datosAnteriores.idcorrectiveactions} | Acción correctiva: ${datosAnteriores.descorrectiveactions}`,
          respuesta: JSON.stringify(respuesta),
          tipoRespuesta: 200,
          Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
        this.accionesCorrectivasService.createLogAsync(Loguser).then(respuesta => {});
      },error:(err)=> {
        this.toastr.error(this.messageError);
        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo:'Control Calidad Interno',
          Submodulo: 'Configuración',
          Item:'Acciones Correctivas',
          metodo: 'eliminación',
          datos: JSON.stringify(id),
          respuesta: err.message,
          tipoRespuesta: err.status,
          Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
        this.accionesCorrectivasService.createLogAsync(Loguser).then(respuesta => {
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
