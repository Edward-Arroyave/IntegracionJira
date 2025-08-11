import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SharedService } from '@app/services/shared.service';
import { ToastrService } from 'ngx-toastr';
import { DatePipe, NgIf, NgClass } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { VentanasModalesService } from '@app/services/general/ventanas-modales.service';
import { MetodosService } from '@app/services/configuracion/metodos.service';
import { ImageCdnPipe } from '../../../../../core/pipes/image-cdn.pipe';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TablaComunComponent } from '@app/modules/shared/general-tablas/tabla-comun/tabla-comun.component';
import { Subject, takeUntil } from 'rxjs';
import { ModalData } from '@app/Models/Modaldata';
import { ModalGeneralComponent } from '@app/modules/shared/modals/modal-general/modal-general.component';
import { MatDialog } from '@angular/material/dialog';
import { createLog } from '@app/globals/logUser';

@Component({
    selector: 'app-gestion-metodos',
    templateUrl: './gestion-metodos.component.html',
    styleUrls: ['./gestion-metodos.component.css'],
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
export class GestionMetodosComponent implements OnInit {
  log = new createLog(this.datePipe, this.translate, this.metodosService);

  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();
  formaGestionMetodos: FormGroup;
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
  dataAnt: any;

  constructor(private datePipe: DatePipe,
    private translate: TranslateService,
    private metodosService: MetodosService,
    private fb: FormBuilder,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private sharedService: SharedService,
    private ventanaService: VentanasModalesService,
    private dialog: MatDialog) { }

  displayedColumns: string[] = ['Método', 'Estado', 'Editar', 'Eliminar'];
  dataSource: MatTableDataSource<any>;
  dataTableBody:any[]=[];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  ngOnInit(): void {
    this.cargarGestionMetodos();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();
  }

  cargarGestionMetodos() {
    this.metodosService.getAllAsync().then(respuesta => {
      const filtrarDataTable: any[] = respuesta;
      this.dataAnt = respuesta;
      this.dataTableBody = filtrarDataTable.map( x =>  {
        return { Método:x.desmethods,Estado:x.active, item:x, item3:x,item4:x };
      });
      this.dataSource = new MatTableDataSource(respuesta);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;

    });
  }
  openModalGestionMetodos(templateGestionMetodos: TemplateRef<any>, datos: any) {

    this.crearFormularioGestionMetodos(datos);

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
      content: templateGestionMetodos,
      btn: this.accionEditar?'Actualizar':'Guardar',
      btn2: 'Cerrar',
      footer:true,
      title: this.accion,
      image:''
    };
    const dialogRef = this.dialog.open(ModalGeneralComponent, { height:'16em' ,width: '40em', data, disableClose: true });

    dialogRef.componentInstance.primaryEvent?.pipe(takeUntil(destroy$)).subscribe(x =>{
      if(this.formaGestionMetodos.invalid){
        this.formaGestionMetodos.markAllAsTouched();
        return
      }
      this.crearEditarGestionMetodos(datos);
      dialogRef.close();
    });
  }

  get desMethodsNoValido() {
    return this.formaGestionMetodos.get('desmethods');
  }

  crearFormularioGestionMetodos(datos: any) {
    this.formaGestionMetodos = this.fb.group({
      idmethods: [datos.idmethods ? datos.idmethods : ''],
      desmethods: [datos.desmethods ? datos.desmethods : '', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      active: [datos.active ? datos.active : false]
    });
  }
  crearEditarGestionMetodos(datos?:any) {
    if (!this.formaGestionMetodos.invalid) {
      if (this.accion === 'Crear') {

        this.desactivar = true;
        this.metodosService.create(this.formaGestionMetodos.value).subscribe({
          next:(respuesta)=> {

            this.cargarGestionMetodos();
            this.toastr.success('Registro creado');
            this.desactivar = false;
  
            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo:'Control Calidad Interno',
              Submodulo: 'Configuración',
              Item:'Métodos',
              Metodo:'creación',
              Datos: JSON.stringify(this.formaGestionMetodos.value),
              Respuesta: JSON.stringify(respuesta),
              TipoRespuesta: 200,
              Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }
  
            this.metodosService.createLogAsync(Loguser).then(respuesta => {});
          },error:(err) => {
            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo:'Control Calidad Interno',
              Submodulo: 'Configuración',
              Item:'Métodos',
              metodo: 'creación',
              datos: JSON.stringify(this.formaGestionMetodos.value),
              respuesta: err.message,
              tipoRespuesta: err.status,
              Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }
            this.metodosService.createLogAsync(Loguser).then(respuesta => {});
              
          },

        });
      } else {

        let datosAnteriores = this.dataAnt.find(x => x.idmethods == datos.idmethods);
        this.metodosService.update(this.formaGestionMetodos.value, this.formaGestionMetodos.value.idmethods).subscribe({
          next:(respuesta)=> {

            this.cargarGestionMetodos();
            this.toastr.success('Registro actualizado');
  
            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo:'Control Calidad Interno',
              Submodulo: 'Configuración',
              Item:'Métodos',
              Metodo: 'actualización',
              Datos: JSON.stringify(this.formaGestionMetodos.value),
              DatosAnteriores: ('Métodos: ' + datosAnteriores.desmethods + '| ' + 'id: '+ datosAnteriores.idmethods +'| ' + 'Estado: ' +  datosAnteriores.active ),
              Respuesta: JSON.stringify(respuesta),
              TipoRespuesta: 200,
              Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }
  
            this.metodosService.createLogAsync(Loguser).then(respuesta => {});    
          },error:(err) => {
            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo:'Control Calidad Interno',
              Submodulo: 'Configuración',
              Item:'Métodos',
              metodo: 'actualización',
              datos: JSON.stringify(this.formaGestionMetodos.value),
              respuesta: err.message,
              tipoRespuesta: err.status,
              Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }
            this.metodosService.createLogAsync(Loguser).then(respuesta => {});
          } 
        });
      }
    }
  }
  actualizarGestionMetodos(datosMetodo:any[]) {
    const [data,estado ] = datosMetodo;
    data.active = estado;
    const datosAnteriores = this.dataAnt.find(x => x.idmethods == data.idmethods);
    this.metodosService.update(data, data.idmethods).subscribe({
      next: (value) => {
        this.cargarGestionMetodos();
        this.accion = 'Editar';
        this.toastr.success('Estado actualizado','Actualización');
        this.log.logObj('Control Calidad Interno', 'Configuración', 'Métodos', 'a', data, JSON.stringify(value), 200, this.datosAnt(datosAnteriores));
      },error:(err) => {
        this.log.logObj('Control Calidad Interno', 'Configuración', 'Métodos', 'a', data, err.message, err.status, this.datosAnt(datosAnteriores));
        this.toastr.error('No fue posible actualizar el estado', 'Error');     
      },
    });
  }

  datosAnt(data: any) {
    return ` idmethods: ${data.idmethods} - desmethods: ${data.desmethods} - Active: ${!data.active}`;
  }

  eliminarGestionMetodo(id: any) {

    let datosAnteriores = this.dataAnt.find(x => x.idmethods == id.idmethods);

    this.metodosService.delete('Methods', id.idmethods).subscribe({
      next:(respuesta)=> {
        this.cargarGestionMetodos();
        this.accion = '';
        this.toastr.success('Registro eliminado');
  
        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo:'Control Calidad Interno',
          Submodulo: 'Configuración',
          Item:'Métodos',
          metodo: 'eliminación',
          datos: JSON.stringify(id),
          DatosAnteriores: `${datosAnteriores.idmethods} | Método: ${datosAnteriores.namesection}`,
          respuesta: JSON.stringify(respuesta),
          tipoRespuesta: 200,
          Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
        this.metodosService.createLogAsync(Loguser).then(respuesta => {});
      },error:(err) => {
          
        this.toastr.error(this.messageError);
    
        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo:'Control Calidad Interno',
          Submodulo: 'Configuración',
          Item:'Métodos',
          metodo: 'eliminación',
          datos: JSON.stringify(id),
          respuesta: err.message,
          tipoRespuesta: err.status,
          Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
        this.metodosService.createLogAsync(Loguser).then(respuesta => {
    
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
