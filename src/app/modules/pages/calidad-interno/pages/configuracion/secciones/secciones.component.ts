import { DatePipe, NgClass } from '@angular/common';
import { TemplateRef } from '@angular/core';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { SeccionesService } from '@app/services/configuracion/secciones.service';
import { VentanasModalesService } from '@app/services/general/ventanas-modales.service';
import { SharedService } from '@app/services/shared.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { ImageCdnPipe } from '../../../../../core/pipes/image-cdn.pipe';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog } from '@angular/material/dialog';
import { lastValueFrom, Subject, takeUntil } from 'rxjs';
import { ModalData } from '@app/Models/Modaldata';
import { ModalGeneralComponent } from '@app/modules/shared/modals/modal-general/modal-general.component';
import { TablaComunComponent } from '@app/modules/shared/general-tablas/tabla-comun/tabla-comun.component';
import { createLog } from '@app/globals/logUser';

@Component({
    selector: 'app-secciones',
    templateUrl: './secciones.component.html',
    styleUrls: ['./secciones.component.css'],
    providers: [DatePipe],
    standalone: true,
    imports: [MatFormFieldModule,
      MatInputModule,
      MatTableModule,
      MatSortModule,
      MatSlideToggleModule,
      MatPaginatorModule,
      FormsModule,
      ReactiveFormsModule,
      NgClass,
      TranslateModule,
      ImageCdnPipe,
      TablaComunComponent
    ]
})
export class SeccionesComponent implements OnInit {
  log = new createLog(this.datePipe, this.translate, this.seccionesService);
  dataAnt: any;
  dateNow: Date = new Date();
  dateNowISO = Date.now();
  ventanaModal: BsModalRef;
  formaRegistroSecciones: FormGroup;
  accionEditar: any;
  accion: any;
  desactivar = false;
  messageError: string;
  listaSections: [];
  desseccionant:any;
  desconstzant:any;
  estadoant:any;
  displayedColumns: string[] = ['Sección','Constante z', 'Estado', 'Editar', 'Eliminar'];
  dataSource: MatTableDataSource<any>;
  dataTableBody:any[]=[];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  constructor(
    private seccionesService: SeccionesService,
    private translate: TranslateService,
    private fb: FormBuilder,
    private ventanaService: VentanasModalesService,
    private datePipe: DatePipe,
    private toastr: ToastrService,
    private sharedService: SharedService,
    private dialog: MatDialog
  ) { }


  ngOnInit(): void {
    this.cargarSecciones();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();
  }


  cargarSecciones() {
    this.seccionesService.getAllAsync().then(respuesta => {
      const filtrarDataTable: any[] = respuesta;
      this.dataAnt = respuesta;
      this.dataTableBody = filtrarDataTable.map( x =>  {
        return { Sección:x.namesection,'Constante z':x.constz,Estado:x.active, item:x, item4:x,item5:x};
      });
      this.dataSource = new MatTableDataSource(respuesta);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  
  openModal(descripcion) {
    const data = { descripcion: descripcion, accion: this.accion }
    this.ventanaService.openModal(data);
  }
  openModalRegistroSecciones(templateRegistroSecciones: TemplateRef<any>, datos: any) {
    this.crearFormularioRegistroSecciones(datos);

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
      content: templateRegistroSecciones,
      btn: this.accionEditar?'Actualizar':'Guardar',
      btn2: 'Cerrar',
      footer:true,
      title: this.accion,
      image:''
    };
    const dialogRef = this.dialog.open(ModalGeneralComponent, { height:'16em' ,width: '40em', data, disableClose: true });

    dialogRef.componentInstance.primaryEvent?.pipe(takeUntil(destroy$)).subscribe(x =>{
      if(this.formaRegistroSecciones.invalid){
        this.formaRegistroSecciones.markAllAsTouched();
        return
      }
      this.crearEditarSeccion();
      dialogRef.close();
    });
  }
  
  crearFormularioRegistroSecciones(datos: any) {
    this.formaRegistroSecciones = this.fb.group({
      idsection: [datos.idsection ? datos.idsection : ''],
      constz: [datos.constz ? datos.constz : '', [Validators.required, Validators.max(3.5)]],
      namesection: [datos.namesection ? datos.namesection : '', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      active: [datos.active ? datos.active : false],
    });
  }
  get nameNoValido() {
    return this.formaRegistroSecciones.get('namesection');
  }
  get constzNoValido() {
    return this.formaRegistroSecciones.get('constz');
  }
  

  crearEditarSeccion() {
    if (!this.formaRegistroSecciones.invalid) {

      var idseccionant = this.formaRegistroSecciones.value.idsection;

      this.seccionesService.getByIdAsync(idseccionant).then((dataseccion: any) => {

        this.desseccionant = dataseccion.namesection;
        this.desconstzant = dataseccion.constz;
        this.estadoant = dataseccion.active;
      }).catch(error => {

      });
      if (this.accion === 'Crear') {

        this.desactivar = true;
        (this.seccionesService.create(this.formaRegistroSecciones.value)).subscribe({
          next:(respuesta) =>{
            this.cargarSecciones();
            this.toastr.success('Registro creado');
            this.desactivar = false;
  
            const Loguser = {
              fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo:'Control Calidad Interno',
              Submodulo: 'Configuración',
              Item:'Sección',
              metodo: 'creación',
              Datos: ('Sección: ' + this.formaRegistroSecciones.value.namesection + '| ' + 'constz: '+ this.formaRegistroSecciones.value.constz +'| ' + 'Estado: ' +  this.formaRegistroSecciones.value.active ),
              Respuesta: JSON.stringify(respuesta),
              TipoRespuesta: 200,
              Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }
  
            this.seccionesService.createLogAsync(Loguser).then(respuesta => { });
          },
          error:(err) => {
            
            const Loguser = {
              fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo:'Control Calidad Interno',
              Submodulo: 'Configuración',
              Item:'Sección',
              metodo: 'creación',
              Datos: ('Sección: ' + this.formaRegistroSecciones.value.namesection + '| ' + 'constz: '+ this.formaRegistroSecciones.value.constz +'| ' + 'Estado: ' +  this.formaRegistroSecciones.value.active ),
              respuesta: err.message,
              tipoRespuesta: err.status,
              Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }
            this.seccionesService.createLogAsync(Loguser).then(respuesta => { });  
          }
        });
      } else {
        this.seccionesService.update(this.formaRegistroSecciones.value, this.formaRegistroSecciones.value.idsection).subscribe({
          next:(respuesta)=> {
            this.cargarSecciones();
            this.toastr.success('Registro actualizado');
  
            const Loguser = {
              fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo:'Control Calidad Interno',
              Submodulo: 'Configuración',
              Item:'Sección',
              metodo: 'actualización',
              Datos: ('Sección: ' + this.formaRegistroSecciones.value.namesection + '| ' + 'constz: '+ this.formaRegistroSecciones.value.constz +'| ' + 'Estado: ' +  this.formaRegistroSecciones.value.active ),
              DatosAnteriores: ('Sección: ' + this.desseccionant + '| ' + 'constz: '+ this.desconstzant +'| ' + 'Estado: ' +  this.estadoant ),
              Respuesta: JSON.stringify(respuesta),
              TipoRespuesta: 200,
              Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }
  
  
            this.seccionesService.createLogAsync(Loguser).then(respuesta => {
            });
              
          },
          error:(err) => {
            const Loguser = {
              fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo:'Control Calidad Interno',
              Submodulo: 'Configuración',
              Item:'Sección',
              metodo: 'actualización',
              Datos: ('Sección: ' + this.formaRegistroSecciones.value.namesection + '| ' + 'constz: '+ this.formaRegistroSecciones.value.constz +'| ' + 'Estado: ' +  this.formaRegistroSecciones.value.active ),
              DatosAnteriores: ('Sección: ' + this.desseccionant + '| ' + 'constz: '+ this.desconstzant +'| ' + 'Estado: ' +  this.estadoant ),
              respuesta: err.message,
              tipoRespuesta: err.status,
              Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }
  
            this.seccionesService.createLogAsync(Loguser).then(respuesta => { });
        
          },
        });
      }
    }
  }
  async actualizarEstadoSeccion(datosSeccion:any[]) {
    const [data,estado ] = datosSeccion;
    data.active = estado;
    const datosAnteriores = this.dataAnt.find(x => x.idsection == data.idsection);
    try {
      let respuesta = await lastValueFrom(this.seccionesService.update(data, data.idsection));
      this.accion = 'Editar';
      this.cargarSecciones();
      this.accion = '';
      this.toastr.success('Estado actualizado', 'Actualización')
      this.log.logObj('Control Calidad Interno', 'Configuración', 'Secciones', 'a', data, JSON.stringify(respuesta), 200, this.datosAnt(datosAnteriores));
    } catch (error) {
      this.log.logObj('Control Calidad Interno', 'Configuración', 'Secciones', 'a', data, error.message, error.status, this.datosAnt(datosAnteriores));
      this.toastr.error('no fue posible actualizar el estado', 'Error')
    }
  }

  datosAnt(data: any) {
    return ` idsection: ${data.idsection} - namesection: ${data.namesection} - constz: ${data.constz} - Active: ${!data.active}`;
  }

  eliminarSeccion(id: any) {
    let namesectioneliminar;
    this.seccionesService.getByIdAsync(id.idsection).then((dataseccion: any) => {
      namesectioneliminar = dataseccion.namesection;
    }).catch(error => {});

    let datosAnteriores = this.dataAnt.find(x => x.idsection == id.idsection);
    this.seccionesService.delete('sections', id.idsection).subscribe({
      next:(respuesta)=> {
        this.cargarSecciones();
        this.accion = '';
        this.toastr.success('Registro eliminado');

        const Loguser = {
          fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo:'Control Calidad Interno',
          Submodulo: 'Configuración',
          Item:'Sección',
          metodo: 'eliminación',
          Datos: ( id +'| '+'Sección: ' + namesectioneliminar),
          DatosAnteriores: `${datosAnteriores.idsection} | Sección: ${datosAnteriores.namesection}`,
          respuesta: JSON.stringify(respuesta),
          tipoRespuesta: 200,
          Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
        this.seccionesService.createLogAsync(Loguser).then(respuesta => {
        });
          
      },error:(err) => {
        this.toastr.error(this.messageError);

        const Loguser = {
          fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo:'control calidad interno',
          Submodulo: 'configuración',
          Item:'sección',
          metodo: 'Registro eliminado',
          Datos: ( id +'| '+'Sección: ' + namesectioneliminar ),
          respuesta: err.message,
          tipoRespuesta: err.status,
          Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
        this.seccionesService.createLogAsync(Loguser).then(respuesta => {
        });
      }
    });
  }
  titulosSwal() {
    this.translate.get('MODULES.SWAL.MESAGEERROR').subscribe(respuesta => this.messageError = respuesta);
  }
}
