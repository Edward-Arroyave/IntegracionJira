import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { SharedService } from '@app/services/shared.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { HttpErrorResponse } from '@angular/common/http';
import { VentanasModalesService } from '@app/services/general/ventanas-modales.service';
import { CasasComercialesService } from '@app/services/configuracion/casascomerciales.service';
import { DatePipe, NgIf, NgClass } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { ImageCdnPipe } from '../../../../../core/pipes/image-cdn.pipe';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog } from '@angular/material/dialog';
import { TablaComunComponent } from '@app/modules/shared/general-tablas/tabla-comun/tabla-comun.component';
import { Subject, takeUntil } from 'rxjs';
import { ModalData } from '@app/Models/Modaldata';
import { ModalGeneralComponent } from '@app/modules/shared/modals/modal-general/modal-general.component';
import { createLog } from '@app/globals/logUser';

@Component({
    selector: 'app-gestion-casas-comerciales',
    templateUrl: './gestion-casas-comerciales.component.html',
    styleUrls: ['./gestion-casas-comerciales.component.css'],
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
       TablaComunComponent]
})
export class GestionCasasComercialesComponent implements OnInit {
  log = new createLog(this.datePipe, this.translate, this.casasComercialesService);
  dataAnt: any;

  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();
  formaCasasComerciales: FormGroup;
  accionEditar: any;
  accion: any;
  desactivar = false;
  tituloAccion: any;
  vantanaModal: BsModalRef;
  titulo: any;
  text: any;
  textError: any;
  cancelar: any;
  confirmar: any;
  messageError: any;

  constructor(private translate: TranslateService,
    private casasComercialesService: CasasComercialesService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private modalService: BsModalService,
    private sharedService: SharedService,
    private ventanaService: VentanasModalesService,
    private datePipe: DatePipe,
    private dialog: MatDialog) { }

  displayedColumns: string[] = ['Casas comerciales', 'Estado', 'Editar', 'Eliminar'];
  dataSource: MatTableDataSource<any>;
  dataTableBody:any[]=[];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  ngOnInit(): void {
    this.cargarCasasComerciales();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();
  }

  get destrademarkNoValido() {
    return this.formaCasasComerciales.get('destrademark');
  }
  crearFormularioCasasComerciales(datos: any) {
    this.formaCasasComerciales = this.fb.group({
      idtrademark: [datos.idtrademark ? datos.idtrademark : ''],
      destrademark: [datos.destrademark ? datos.destrademark : '', [Validators.required, Validators.minLength(2), Validators.maxLength(200)]],
      active: [datos.active ? datos.active : false],
    });
  }
  cargarCasasComerciales() {
    this.casasComercialesService.getAllAsync().then(respuesta => {
      const filtrarDataTable: any[] = respuesta;
      this.dataAnt = respuesta;
      this.dataTableBody = filtrarDataTable.map( x =>  {
        return { 'Casas comerciales':x.destrademark,Estado:x.active, item:x, item3:x,item4:x };
      });
      this.dataSource = new MatTableDataSource(respuesta);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });

  }

  crearEditarCasasComerciales(datos?:any) {
    if (!this.formaCasasComerciales.invalid) {

      if (this.accion === 'Crear') {

        this.desactivar = true;
        this.casasComercialesService.create(this.formaCasasComerciales.value).subscribe({
          next:(respuesta)=> {
            
            this.cargarCasasComerciales();
            this.toastr.success('Registro creado');
            this.desactivar = false;
  
            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo:'Control Calidad Interno',
              Submodulo: 'Configuración',
              Item:'Casas comerciales',
              Metodo: 'creación',
              Datos: JSON.stringify(this.formaCasasComerciales.value),
              Respuesta: JSON.stringify(respuesta),
              TipoRespuesta: 200,
              Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }
  
            this.casasComercialesService.createLogAsync(Loguser).then(respuesta => {
  
            });
          },error:(err) => {
            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo:'Control Calidad Interno',
              Submodulo: 'Configuración',
              Item:'Casas comerciales',
              metodo: 'creación',
              datos: JSON.stringify(this.formaCasasComerciales.value),
              respuesta: err.message,
              tipoRespuesta: err.status,
              Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }
            this.casasComercialesService.createLogAsync(Loguser).then(respuesta => {
              console.log(respuesta);
            });   
          }
        });

      } else {

        let datosAnteriores = this.dataAnt.find(x => x.idtrademark == datos.idtrademark);
        this.casasComercialesService.update(this.formaCasasComerciales.value, this.formaCasasComerciales.value.idtrademark).subscribe({
          next:(respuesta)=> {
  
            this.cargarCasasComerciales();
            this.toastr.success('Registro actualizado');
  
            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo:'Control Calidad Interno',
              Submodulo: 'Configuración',
              Item:'Casas comerciales',
              Metodo: 'actualización',
              Datos: JSON.stringify(this.formaCasasComerciales.value),
              DatosAnteriores: `${datosAnteriores.idtrademark} | Casa comercial: ${datosAnteriores.destrademark}`,
              Respuesta: JSON.stringify(respuesta),
              TipoRespuesta: 200,
              Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }
  
            this.casasComercialesService.createLogAsync(Loguser).then(respuesta => {
  
            });
          },error:(err) => {
            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo:'Control Calidad Interno',
              Submodulo: 'Configuración',
              Item:'Casas comerciales',
              metodo: 'actualización',
              datos: JSON.stringify(this.formaCasasComerciales.value),
              DatosAnteriores: `${datosAnteriores.idtrademark} | Casa comercial: ${datosAnteriores.destrademark}`,
              respuesta: err.message,
              tipoRespuesta: err.status,
              Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }
            this.casasComercialesService.createLogAsync(Loguser).then(respuesta => {
  
            });
              
          },
        });
      }
    }
  }
  actualizarEstadoCasasComerciales(datosCasasComerciales:any[]) {
    const [data,estado ] = datosCasasComerciales;
    data.active = estado;
    const datosAnteriores = this.dataAnt.find(x => x.idtrademark == data.idtrademark);
    this.casasComercialesService.update(data, data.idtrademark).subscribe({
      next:(respuesta) => {
        this.cargarCasasComerciales();
        this.accion = 'Editar';
        this.log.logObj('Control Calidad Interno', 'Configuración', 'Casas comerciales', 'a', data, JSON.stringify(respuesta), 200, this.datosAnt(datosAnteriores));
        this.toastr.success('Estado actualizado','Actualización');
      },error:(err) => {
        this.log.logObj('Control Calidad Interno', 'Configuración', 'Casas comerciales', 'a', data, err.message, err.status, this.datosAnt(datosAnteriores));
        this.toastr.error('No fue posible actualizar el estado', 'Error')
      },
    });
  }

  datosAnt(data: any) {
    return ` idtrademark: ${data.idtrademark} - destrademark: ${data.destrademark} - Active: ${!data.active}`;
  }

  openModalCasasComercialess(templateCasasComerciales: TemplateRef<any>, datos: any) {
    this.crearFormularioCasasComerciales(datos);

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
      content: templateCasasComerciales,
      btn: this.accionEditar?'Actualizar':'Guardar',
      btn2: 'Cerrar',
      footer:true,
      title: this.accion,
      image:''
    };
    const dialogRef = this.dialog.open(ModalGeneralComponent, { height:'16em' ,width: '40em', data, disableClose: true });

    dialogRef.componentInstance.primaryEvent?.pipe(takeUntil(destroy$)).subscribe(x =>{
      if(this.formaCasasComerciales.invalid){
        this.formaCasasComerciales.markAllAsTouched();
        return
      }
      this.crearEditarCasasComerciales(datos);
      dialogRef.close();
    });
  }

  eliminarCasasComerciales(id: any) {
    let datosAnteriores = this.dataAnt.find(x => x.idtrademark == id.idtrademark);
    this.casasComercialesService.delete('TradeMarks', id.idtrademark).subscribe({
      next:(respuesta) => {
        this.cargarCasasComerciales();
        this.accion = '';
        this.toastr.success('Registro eliminado');
  
        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo:'Control Calidad Interno',
          Submodulo: 'Configuración',
          Item:'Casas comerciales',
          metodo: 'eliminación',
          datos: JSON.stringify(id),
          DatosAnteriores: `${datosAnteriores.idtrademark} | Casa comercial: ${datosAnteriores.destrademark}`,
          respuesta: JSON.stringify(respuesta),
          tipoRespuesta: 200,
          Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
        this.casasComercialesService.createLogAsync(Loguser).then(respuesta => {});
          
      },error:(err) => {
        this.toastr.error(this.messageError);
    
        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo:'Control Calidad Interno',
          Submodulo: 'Configuración',
          Item:'Casas comerciales',
          metodo: 'eliminación',
          datos: JSON.stringify(id),
          respuesta: err.message,
          tipoRespuesta: err.status,
          Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
        this.casasComercialesService.createLogAsync(Loguser).then(respuesta => {});
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
