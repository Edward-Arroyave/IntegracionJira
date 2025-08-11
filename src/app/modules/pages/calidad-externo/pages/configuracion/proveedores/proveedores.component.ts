import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SharedService } from '@app/services/shared.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { HttpErrorResponse } from '@angular/common/http';
import { VentanasModalesService } from '@app/services/general/ventanas-modales.service';
import { DatePipe, NgIf, NgClass } from '@angular/common';
import { SupplierQceService } from '@app/services/calidad-externo/supplierQce.service';
import { ToastrService } from 'ngx-toastr';
import { createLog } from '@app/globals/logUser';
import { ImageCdnPipe } from '../../../../../core/pipes/image-cdn.pipe';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TablaComunComponent } from '@app/modules/shared/general-tablas/tabla-comun/tabla-comun.component';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { ModalData } from '@app/Models/Modaldata';
import { ModalGeneralComponent } from '@app/modules/shared/modals/modal-general/modal-general.component';

@Component({
    selector: 'app-proveedores',
    templateUrl: './proveedores.component.html',
    styleUrls: ['./proveedores.component.css'],
    standalone: true,
    imports: [MatFormFieldModule,
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
export class ProveedoresComponent implements OnInit {

  dateNow: Date = new Date();
  formulario: FormGroup;
  accionEditar: any;
  accion: any;
  tituloAccion: any;
  vantanaModal: BsModalRef;
  titulo: any;
  text: any;
  textError: any;
  cancelar: any;
  desactivar = false;
  confirmar: any;
  messageError: any;

  dateNowISO = this.dateNow.toTimeString();
  log = new createLog(this.datePipe,this.translate,this.supplierQceService);

  displayedColumns: string[] = ['Proveedor', 'Estado', 'Editar', 'Eliminar'];
  dataSource: MatTableDataSource<any>;
  dataTableBody:any[]=[];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  constructor(
    private translate: TranslateService,
    private supplierQceService: SupplierQceService,
    private fb: FormBuilder,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private sharedService: SharedService,
    private ventanaService: VentanasModalesService,
    private datePipe: DatePipe,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.cargarProveedores();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();

  }

  openModal(descripcion) {
    const data = { descripcion: descripcion, accion: this.accion }
    this.ventanaService.openModal(data);
  }

  cargarProveedores() {
    this.supplierQceService.getAllAsync().then(respuesta => {
      const filtrarDataTable:any[] = respuesta;
      this.dataTableBody = filtrarDataTable.map( x =>  {
        return { Proveedor:x.dessupplier,Estado:x.active, item: x, item3:x,item4:x };
      });
      this.dataSource = new MatTableDataSource(respuesta);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }


  openModalGestionProveedores(templateGestionProveedores: TemplateRef<any>, datos: any) {
    this.crearFormularioGestionProveedores(datos);
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
      content: templateGestionProveedores,
      btn: this.accionEditar?'Actualizar':'Guardar',
      btn2: 'Cerrar',
      footer:true,
      title: this.accion,
      image: this.accionEditar ? 'assets/rutas/iconos/editar.png' : 'assets/rutas/iconos/editar.png',
    };
    const dialogRef = this.dialog.open(ModalGeneralComponent, { height:'auto' ,width: '40em', data, disableClose: true });

    dialogRef.componentInstance.primaryEvent?.pipe(takeUntil(destroy$)).subscribe(x =>{
      if(this.formulario.invalid){
        this.formulario.markAllAsTouched();
        return
      }
      this.crearEditarGestionProveedores();
      dialogRef.close();
    });
  }

  get dessupplierNoValido() {
    return this.formulario.get('dessupplier');
  }

  crearFormularioGestionProveedores(datos: any) {
    this.formulario = this.fb.group({
      idsupplier: [datos.idsupplier ? datos.idsupplier : ''],
      dessupplier: [datos.dessupplier ? datos.dessupplier : '', [Validators.required, Validators.minLength(2), Validators.maxLength(200)]],
      active: [datos.active ? datos.active : false]
    });
  }

  crearEditarGestionProveedores() {
    if (!this.formulario.invalid) {
      if (this.accion === 'Crear') {
        this.desactivar = true;
        this.supplierQceService.create(this.formulario.value).subscribe(respuesta => {

          this.cargarProveedores();
          this.toastr.success('Registro creado');
          this.desactivar = false;
          this.log.logObj('Control Calidad Externo','Configuración','Proveedores','c',this.formulario.value,JSON.stringify(respuesta),200);
        }, (err) => {
          this.log.logObj('Control Calidad Externo','Configuración','Proveedores','c',this.formulario.value,err.message,err.status);
        });

      } else {

        this.supplierQceService.update(this.formulario.value, this.formulario.value.idsupplier).subscribe(respuesta => {
          this.cargarProveedores();
          this.toastr.success('Registro actualizado');
          this.log.logObj('Control Calidad Externo','Configuración','Proveedores','a',this.formulario.value,JSON.stringify(respuesta),200);
        }, (err) => {
          this.log.logObj('Control Calidad Externo','Configuración','Proveedores','a',this.formulario.value,err.message,err.status);
        });
      }
    }

  }

  actualizarEstadoGestionProveedores(datosGestion) {
    const [data,estado ] = datosGestion;
    data.active = estado;
    this.supplierQceService.update(data, data.idsupplier).subscribe(respuesta => {
      this.cargarProveedores();
      this.accion = 'Editar';
      this.toastr.success('Estado actualizado','Actualización');
    },err =>{
      this.toastr.error('No fue posible actualizar el estado', 'Error')
    });
  }

  eliminarGestionProveedores(id: any) {
    this.supplierQceService.delete('Proveedores', id).subscribe( {
      next:(respuesta) => {
        this.cargarProveedores();
        this.accion = '';
        this.toastr.success('Registro eliminado');
        this.log.logObj('Control Calidad Externo','Configuración','Proveedores','e',this.formulario.value,JSON.stringify(respuesta),200);

      }, error :(err) => {
        this.toastr.error(this.messageError);
        this.log.logObj('Control Calidad Externo','Configuración','Proveedores','e',this.formulario.value,err.message,err.status);

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
