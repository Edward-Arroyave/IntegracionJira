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
import { Unidadeservice } from '@app/services/configuracion/unidades.service';
import { DatePipe, NgIf, NgClass } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { ImageCdnPipe } from '../../../../../core/pipes/image-cdn.pipe';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TablaComunComponent } from '@app/modules/shared/general-tablas/tabla-comun/tabla-comun.component';
import { MatDialog } from '@angular/material/dialog';
import { lastValueFrom, Subject, takeUntil } from 'rxjs';
import { ModalData } from '@app/Models/Modaldata';
import { ModalGeneralComponent } from '@app/modules/shared/modals/modal-general/modal-general.component';
import { createLog } from '@app/globals/logUser';

@Component({
  selector: 'app-unidades-medida',
  templateUrl: './unidades-medida.component.html',
  styleUrls: ['./unidades-medida.component.css'],
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
    ]
})
export class UnidadesMedidaComponent implements OnInit {
  log = new createLog(this.datePipe, this.translate, this.unidadeservice);
  
  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();

  formaUnidadMedida: FormGroup;
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
  dataAnt: any;
  desunitsant: any;
  estadoant: any;

  constructor(
    private translate: TranslateService,
    private unidadeservice: Unidadeservice,
    private fb: FormBuilder,
    private sharedService: SharedService,
    private toastr: ToastrService,
    private ventanaService: VentanasModalesService,
    private datePipe: DatePipe,
    private dialog: MatDialog
  ) { }
  displayedColumns: string[] = ['Unidad', 'Estado', 'Editar', 'Eliminar'];
  dataSource: MatTableDataSource<any>;
  dataTableBody:any[]=[];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  ngOnInit(): void {
    this.cargarUnidadesMedida();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();
  }
  openModal(descripcion) {
    const data = { descripcion: descripcion, accion: this.accion }
    this.ventanaService.openModal(data);
  }
  cargarUnidadesMedida() {
    this.unidadeservice.getAllAsync().then(respuesta => {
      const filtrarDataTable: any[] = respuesta;
      this.dataAnt = respuesta;
      
      this.dataTableBody = filtrarDataTable.map( x =>  {
        return { Unidad:x.desunits,Estado:x.active, item: x,item3:x,item4:x };
      });
      this.dataSource = new MatTableDataSource(respuesta);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  openModalUnidadMedida(templateUnidadMedida: TemplateRef<any>, datos: any) {

    this.crearFormularioUnidadesMedida(datos);

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
      content: templateUnidadMedida,
      btn: this.accionEditar?'Actualizar':'Guardar',
      btn2: 'Cerrar',
      footer:true,
      title: this.accion,
      image:''
    };
    const dialogRef = this.dialog.open(ModalGeneralComponent, { height:'16em' ,width: '40em', data, disableClose: true });

    dialogRef.componentInstance.primaryEvent?.pipe(takeUntil(destroy$)).subscribe(x =>{
      if(this.formaUnidadMedida.invalid){
        this.formaUnidadMedida.markAllAsTouched();
        return
      }
      this.crearEditarUnidadMedida();
      dialogRef.close();
    });

  }
  get desUnitsNoValido() {
    return this.formaUnidadMedida.get('desunits');
  }

  crearFormularioUnidadesMedida(datos: any) {
    this.formaUnidadMedida = this.fb.group({
      idunits: [datos.idunits ? datos.idunits : ''],
      desunits: [datos.desunits ? datos.desunits : '', [Validators.required, Validators.minLength(1), Validators.maxLength(100),]],
      active: [datos.active ? datos.active : false]
    });
  }
  crearEditarUnidadMedida() {
    if (!this.formaUnidadMedida.invalid) {

      var antunidad = this.formaUnidadMedida.get('desunits').value;
      var antestado = this.formaUnidadMedida.get('active').value;
      var idunit = this.formaUnidadMedida.value.idunits;

      this.unidadeservice.getByIdAsync(idunit).then((dataunit: any) => {

        this.desunitsant = dataunit.desunits;
        this.estadoant = dataunit.active;

      }).catch(error => {

      });

      if (this.accion === 'Crear') {

        this.desactivar = true;
        this.unidadeservice.create(this.formaUnidadMedida.value).subscribe({
          next:(respuesta)=> {
            this.cargarUnidadesMedida();
            this.toastr.success('Registro creado');
            this.desactivar = false;
  
            const Loguser = {
              fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo: 'Control Calidad Interno',
              Submodulo: 'Configuración',
              Item: 'Unidades de Medida',
              metodo: 'creación',
              Datos: ('Unidad: ' + this.formaUnidadMedida.value.desunits + '| ' + 'Estado: ' + this.formaUnidadMedida.value.active),
              respuesta: JSON.stringify(respuesta),
              tipoRespuesta: 200,
              Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }
  
            this.unidadeservice.createLogAsync(Loguser).then(respuesta => {
            });
          },error:(err) => {
            const Loguser = {
              fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo: 'Control Calidad Interno',
              Submodulo: 'Configuración',
              Item: 'Unidades de Medida',
              metodo: 'creación',
              Datos: ('Unidad: ' + this.formaUnidadMedida.value.desunits + '| ' + 'Estado: ' + this.formaUnidadMedida.value.active),
              respuesta: err.message,
              tipoRespuesta: err.status,
              Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }
            this.unidadeservice.createLogAsync(Loguser).then(respuesta => {
            });
              
          },

        });
      } else {

        this.unidadeservice.update(this.formaUnidadMedida.value, this.formaUnidadMedida.value.idunits).subscribe({
          next:(respuesta)=> {
            this.cargarUnidadesMedida();
            this.toastr.success('Registro actualizado');
  
            const Loguser = {
              fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo: 'Control Calidad Interno',
              Submodulo: 'Configuración',
              Item: 'Unidades de Medida',
              metodo: 'actualización',
              Datos: ('Unidad: ' + this.formaUnidadMedida.value.desunits + '| ' + 'Estado: ' + this.formaUnidadMedida.value.active),
              DatosAnteriores: ('Unidad: ' + this.desunitsant + '| ' + 'Estado: ' + this.estadoant),
              respuesta: JSON.stringify(respuesta),
              tipoRespuesta: 200,
              Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }
  
            this.unidadeservice.createLogAsync(Loguser).then(respuesta => {
            });
              
          },error:(err) => {
            const Loguser = {
              fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo: 'Control Calidad Interno',
              Submodulo: 'Configuración',
              Item: 'Unidades de Medida',
              metodo: 'actualización',
              Datos: ('Unidad: ' + this.formaUnidadMedida.value.desunits + '| ' + 'Estado: ' + this.formaUnidadMedida.value.active),
              DatosAnteriores: ('Unidad: ' + this.desunitsant + '| ' + 'Estado: ' + this.estadoant),
              respuesta: err.message,
              tipoRespuesta: err.status,
              Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }
            this.unidadeservice.createLogAsync(Loguser).then(respuesta => {
  
            });
          }
        });
      }
    }
  }

  async actualizarUnidadMedida(unidades:any[]) {
    const [data,estado ] = unidades;
    data.active = estado;
    const datosAnteriores = this.dataAnt.find(x => x.idunits == data.idunits);
    try {
      let respuesta = await lastValueFrom(this.unidadeservice.update(data, data.idunits));
      this.cargarUnidadesMedida();
      this.accion = 'Editar';
      this.toastr.success('Estado actualizado', 'Actualización');
      this.log.logObj('Control Calidad Interno', 'Configuración', 'unidades de medida', 'a', data, JSON.stringify(respuesta), 200, this.datosAnt(datosAnteriores));
    } catch (error) {
      this.log.logObj('Control Calidad Interno', 'Configuración', 'unidades de medida', 'a', data, error.message, error.status, this.datosAnt(datosAnteriores));
      this.toastr.error('Error al actualizar el estado', 'Actualización')
    }
  }

  datosAnt(data: any) {
    return ` idunits: ${data.idunits} - desunits: ${data.desunits} - Active: ${!data.active}`;
  }

  eliminarUnidadMedida(id: any) {
    let desunidad = null;
    this.unidadeservice.getByIdAsync(id.idunits).then((dataunit: any) => {
      desunidad = dataunit.desunits;
    });

    let datosAnteriores = this.dataAnt.find(x => x.idunits == id.idunits);

    this.unidadeservice.delete('Units', id.idunits).subscribe({
      next:(respuesta) => {
        this.cargarUnidadesMedida();
        this.accion = '';
        this.toastr.success('Registro eliminado');
  
        const Loguser = {
          fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo: 'Control Calidad Interno',
          Submodulo: 'Configuración',
          Item: 'Unidades de Medida',
          metodo:'eliminación',
          Datos: (id + '| ' + 'Unidad: ' + desunidad),
          DatosAnteriores: `${datosAnteriores.idunits} | Unidad: ${datosAnteriores.desunits}`,
          respuesta: JSON.stringify(respuesta),
          tipoRespuesta: 200,
          Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
        this.unidadeservice.createLogAsync(Loguser).then(respuesta => {
  
        })
      },error:(err) => {
        this.toastr.error(this.messageError);
    
        const Loguser = {
          fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo: 'Control Calidad Interno',
          Submodulo: 'Configuración',
          Item: 'Unidades de Medida',
          metodo: 'eliminación',
          Datos: (id + '| ' + 'Unidad: ' + desunidad),
          respuesta: err.message,
          tipoRespuesta: err.status,
          Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
        this.unidadeservice.createLogAsync(Loguser).then(respuesta => { });
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
