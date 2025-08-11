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
import { ReactivosService } from '@app/services/configuracion/reactivos.service';
import { DatePipe, NgIf, NgClass } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
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
    selector: 'app-gestion-reactivos',
    templateUrl: './gestion-reactivos.component.html',
    styleUrls: ['./gestion-reactivos.component.css'],
    providers: [DatePipe],
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
export class GestionReactivosComponent implements OnInit {
  log = new createLog(this.datePipe, this.translate, this.reactivosService);

  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();
  formaGestionReactivos: FormGroup;
  accionEditar: any;
  accion: any;
  tituloAccion: any;
  vantanaModal: BsModalRef;
  titulo: any;
  text: any;
  desactivar = false;
  textError: any;
  cancelar: any;
  confirmar: any;
  messageError: any;
  dataAnt: any;

  constructor(
    private datePipe: DatePipe,
    private translate: TranslateService,
    private reactivosService: ReactivosService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private modalService: BsModalService,
    private sharedService: SharedService,
    private ventanaService: VentanasModalesService,
    private dialog: MatDialog
  ) { }

  displayedColumns: string[] = ['Reactivo', 'Generación', 'Estado', 'Editar', 'Eliminar'];
  dataSource: MatTableDataSource<any>;
  dataTableBody:any[]=[];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  ngOnInit(): void {
    this.cargarGestionReactivos();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();
  }

  cargarGestionReactivos() {
    this.reactivosService.getAllAsync().then(respuesta => {
      const filtrarDataTable: any[] = respuesta;
      this.dataAnt = respuesta;
      this.dataTableBody = filtrarDataTable.map( x =>  {
        return { Reactivo:x.desreagents,Generación:x.generation,Estado:x.active, item:x, item4:x };
      });
      this.dataSource = new MatTableDataSource(respuesta);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;

    });
  }

  openModalGestionReactivos(templateGestionReactivos: TemplateRef<any>, datos: any) {
    this.crearFormularioGestionReactivos(datos);

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
      content: templateGestionReactivos,
      btn: this.accionEditar?'Actualizar':'Guardar',
      btn2: 'Cerrar',
      footer:true,
      title: this.accion,
      image:''
    };
    const dialogRef = this.dialog.open(ModalGeneralComponent, { height:'16em' ,width: '40em', data, disableClose: true });

    dialogRef.componentInstance.primaryEvent?.pipe(takeUntil(destroy$)).subscribe(x =>{
      if(this.formaGestionReactivos.invalid){
        this.formaGestionReactivos.markAllAsTouched();
        return
      }
      this.crearEditarGestionReactivos(datos);
      dialogRef.close();
    });
  }
  get desReagentsNoValido() {
    return this.formaGestionReactivos.get('desreagents');
  }
  crearFormularioGestionReactivos(datos: any) {
    this.formaGestionReactivos = this.fb.group({
      idreagents: [datos.idreagents ? datos.idreagents : ''],
      desreagents: [datos.desreagents ? datos.desreagents : '', [Validators.required, Validators.minLength(2), Validators.maxLength(200)]],
      generation: [datos.generation ? datos.generation : '', [ Validators.maxLength(3)]],
      active: [datos.active ? datos.active : false]
    });
  }
  crearEditarGestionReactivos(datos?:any) {
    if (!this.formaGestionReactivos.invalid) {
      var idseccionant = this.formaGestionReactivos.value.idsection;

      if (this.accion === 'Crear') {

        this.desactivar = true;
        this.reactivosService.create(this.formaGestionReactivos.value).subscribe({
          next:(respuesta)=> {
            this.cargarGestionReactivos();
            this.toastr.success('Registro creado');
            this.desactivar = false;
            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo:'Control Calidad Interno',
              Submodulo: 'Configuración',
              Item:'Reactivos',
              Metodo: 'creación',
              Datos: JSON.stringify(this.formaGestionReactivos.value),
              Respuesta: JSON.stringify(respuesta),
              TipoRespuesta: 200,
              Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }
  
            this.reactivosService.createLogAsync(Loguser).then(respuesta => {
  
            });
          },error:(err) => {
            
            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo:'Control Calidad Interno',
              Submodulo: 'Configuración',
              Item:'Reactivos',
              metodo: 'creación',
              datos: JSON.stringify(this.formaGestionReactivos.value),
              respuesta: err.message,
              tipoRespuesta: err.status,
              Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }
            this.reactivosService.createLogAsync(Loguser).then(respuesta => {});  
          },
        });
      } else {
        let datosAnteriores = this.dataAnt.find(x => x.idreagents == datos.idreagents);
        
        this.reactivosService.update(this.formaGestionReactivos.value, this.formaGestionReactivos.value.idreagents).subscribe({
          next:(respuesta) => {
            this.cargarGestionReactivos();
            this.toastr.success('Registro actualizado');
  
            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo:'Control Calidad Interno',
              Submodulo: 'Configuración',
              Item:'Reactivos',
              Metodo: 'actualización',
              Datos: JSON.stringify(this.formaGestionReactivos.value),
              DatosAnteriores: ('Reactivo: ' + datosAnteriores.desreagents + '| ' + 'Generación: '+ datosAnteriores.generation +'| ' + 'Estado: ' +  datosAnteriores.active ),
              Respuesta: JSON.stringify(respuesta),
              TipoRespuesta: 200,
              Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }
  
            this.reactivosService.createLogAsync(Loguser).then(respuesta => {});
          },error:(err) => {
        
            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo:'Control Calidad Interno',
              Submodulo: 'Configuración',
              Item:'Reactivos',
              metodo: 'actualización',
              datos: JSON.stringify(this.formaGestionReactivos.value),
              DatosAnteriores: ('Reactivo: ' + datosAnteriores.desreagents + '| ' + 'Generación: '+ datosAnteriores.generation +'| ' + 'Estado: ' +  datosAnteriores.active ),
              respuesta: err.message,
              tipoRespuesta: err.status,
              Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }
            this.reactivosService.createLogAsync(Loguser).then(respuesta => {});
          },
        });
      }
    }
  }
  actualizarEstadoGestionReactivos(datosReactivos:any[]) {
    const [data,estado ] = datosReactivos;
    data.active = estado;
    const datosAnteriores = this.dataAnt.find(x => x.idreagents == data.idreagents);
    this.reactivosService.update(data, data.idreagents).subscribe({
      next: (value) => {
        this.cargarGestionReactivos();
        this.accion = 'Editar';
        this.toastr.success('Estado actualizado','Actualización');

        //Registro Log
        this.log.logObj('Control Calidad Interno', 'Configuración', 'Reactivos', 'a', data, JSON.stringify(value), 200, this.datosAnt(datosAnteriores));

        // const Loguser = {
        //   Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
        //   hora: this.datePipe.transform(Date.now(), "shortTime"),
        //   Modulo:'Control Calidad Interno',
        //   Submodulo: 'Configuración',
        //   Item:'Reactivos',
        //   Metodo: 'actualización',
        //   Datos: JSON.stringify(data),
        //   Respuesta: JSON.stringify(value),
        //   TipoRespuesta: 200,
        //   Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        // }

        // this.reactivosService.createLogAsync(Loguser).then(respuesta => {});
        
      },error:(err) => {
        this.toastr.error('No fue posible actualizar el estado', 'Error');
        
        //Registro Log
      this.log.logObj('Control Calidad Interno', 'Configuración', 'Reactivos', 'a', data, err.message, err.status, this.datosAnt(datosAnteriores));
        
        // const Loguser = {
        //   Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
        //   hora: this.datePipe.transform(Date.now(), "shortTime"),
        //   Modulo:'Control Calidad Interno',
        //   Submodulo: 'Configuración',
        //   Item:'Reactivos',
        //   Metodo: 'actualización',
        //   Datos: JSON.stringify(data),
        //   Respuesta: JSON.stringify(err),
        //   TipoRespuesta: 200,
        //   Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        // }
        // this.reactivosService.createLogAsync(Loguser).then(respuesta => {});
      },
    });
  }

  datosAnt(data: any) {
    return ` idreagents: ${data.idreagents} - desreagents: ${data.desreagents} - generation: ${data.generation} - Active: ${!data.active}`;
  }

  eliminarGestionReactivos(id: any) {
    let datosAnteriores = this.dataAnt.find(x => x.idreagents == id.idreagents);

    this.reactivosService.delete('Reagents', id.idreagents).subscribe({
      next:(respuesta)=> {
        this.cargarGestionReactivos();
        this.accion = '';
        this.toastr.success('Registro eliminado');
  
        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo:'Control Calidad Interno',
          Submodulo: 'Configuración',
          Item:'Reactivos',
          metodo: 'eliminación',
          datos: JSON.stringify(id),
          DatosAnteriores: `${datosAnteriores.idreagents} | Reactivo: ${datosAnteriores.desreagents}`,
          respuesta: JSON.stringify(respuesta),
          tipoRespuesta: 200,
          Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
        this.reactivosService.createLogAsync(Loguser).then(respuesta => {
  
        });
      },error:(err) => {
        this.toastr.error(this.messageError);
    
        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo:'Control Calidad Interno',
          Submodulo: 'Configuración',
          Item:'Reactivos',
          metodo:'eliminación',
          datos: JSON.stringify(id),
          respuesta: err.message,
          tipoRespuesta: err.status,
          Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
        this.reactivosService.createLogAsync(Loguser).then(respuesta => {
    
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
