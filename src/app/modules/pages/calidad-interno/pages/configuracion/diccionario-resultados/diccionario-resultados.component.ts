import { DatePipe, NgIf, NgClass, LowerCasePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { TemplateRef } from '@angular/core';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { DiccionarioResultadosService } from '@app/services/configuracion/diccionario-resultados.service';
import { VentanasModalesService } from '@app/services/general/ventanas-modales.service';
import { SharedService } from '@app/services/shared.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
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
    selector: 'app-diccionario-resultados',
    templateUrl: './diccionario-resultados.component.html',
    styleUrls: ['./diccionario-resultados.component.css'],
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
      LowerCasePipe,
      TranslateModule,
      ImageCdnPipe,
      TablaComunComponent
    ]
})
export class DiccionarioResultadosComponent implements OnInit {
  log = new createLog(this.datePipe, this.translate, this.diccionarioResultadosService);
  dataAnt: any;
  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();
  ventanaModal: BsModalRef;
  formaRegistroDiccionario: FormGroup;
  accionEditar: any;
  tituloAccion: any;
  desactivar = false;
  accion: any;
  messageError: string;
  listaSections: [];

  displayedColumns: string[] = ['Resultado', 'Estado', 'Editar', 'Eliminar'];
  dataSource: MatTableDataSource<any>;
  dataTableBody:any[]=[];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  constructor(
    private diccionarioResultadosService: DiccionarioResultadosService,
    private modalService: BsModalService,
    private translate: TranslateService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private ventanaService: VentanasModalesService,
    private datePipe: DatePipe,
    private sharedService: SharedService,
    private dialog: MatDialog
  ) { }

  
  ngOnInit(): void {
    this.cargarDiccionario();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();
  }


  cargarDiccionario() {
    this.diccionarioResultadosService.getAllAsync().then(respuesta => {
      const filtrarDataTable: any[] = respuesta;
      this.dataAnt = respuesta;
      this.dataTableBody = filtrarDataTable.map( x =>  {
        return { Resultado:x.desresults,Estado:x.active, item:x, item3:x,item4:x };
      });
      
      this.dataSource = new MatTableDataSource(respuesta);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }


  openModalRegistroDiccionario(templateRegistroDiccionario: TemplateRef<any>, datos: any) {

    this.crearFormularioRegistroDiccionario(datos);
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
      content: templateRegistroDiccionario,
      btn: this.accionEditar?'Actualizar':'Guardar',
      btn2: 'Cerrar',
      footer:true,
      title: this.accion,
      image:''
    };
    const dialogRef = this.dialog.open(ModalGeneralComponent, { height:'16em' ,width: '40em', data, disableClose: true });

    dialogRef.componentInstance.primaryEvent?.pipe(takeUntil(destroy$)).subscribe(x =>{
      if(this.formaRegistroDiccionario.invalid){
        this.formaRegistroDiccionario.markAllAsTouched();
        return
      }
      this.crearEditarDiccionario(datos);
      dialogRef.close();
    });
  }


  crearFormularioRegistroDiccionario(datos: any) {
    this.formaRegistroDiccionario = this.fb.group({
      idresultsdictionary: [datos.idresultsdictionary ? datos.idresultsdictionary : ''],
      desresults: [datos.desresults ? datos.desresults : '', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
      active: [datos.active ? datos.active : false],
    });
  }


  get desNoValido() {
    return this.formaRegistroDiccionario.get('desresults');
  }


  crearEditarDiccionario(datos?: any) {
    if (!this.formaRegistroDiccionario.invalid) {
      if (this.accion === 'Crear') {
        this.desactivar = true;
        this.diccionarioResultadosService.create(this.formaRegistroDiccionario.value).subscribe({
          next:(respuesta)=> {
            this.cargarDiccionario();
            this.toastr.success('Registro creado');
            this.desactivar = false;
  
            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo:'Control Calidad Interno',
              Submodulo: 'Configuración',
              Item:'Diccionario de Resultados',
              Metodo: 'creación',
              Datos: JSON.stringify(this.formaRegistroDiccionario.value),
              Respuesta: JSON.stringify(respuesta),
              TipoRespuesta: 200,
              Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }
  
  
            this.diccionarioResultadosService.createLogAsync(Loguser).then(respuesta => { });
          },error:(err) =>  {
            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo:'Control Calidad Interno',
              Submodulo: 'Configuración',
              Item:'Diccionario de Resultados',
              metodo: 'creación',
              datos: JSON.stringify(this.formaRegistroDiccionario.value),
              respuesta: err.message,
              tipoRespuesta: err.status,
              Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }
            this.diccionarioResultadosService.createLogAsync(Loguser).then(respuesta => { });
          },


        });
      } else {
        let datosAnteriores = this.dataAnt.find(x => x.idresultsdictionary == datos.idresultsdictionary);

        this.diccionarioResultadosService.update(this.formaRegistroDiccionario.value, this.formaRegistroDiccionario.value.idresultsdictionary).subscribe({
          next:(respuesta) => {
            this.cargarDiccionario();
            this.toastr.success('Registro actualizado');
  
            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo:'Control Calidad Interno',
              Submodulo: 'Configuración',
              Item:'Diccionario de Resultados',
              Metodo:'actualización',
              Datos: JSON.stringify(this.formaRegistroDiccionario.value),
              DatosAnteriores: `${datosAnteriores.idresultsdictionary} | Diccionario: ${datosAnteriores.desresults} | Estado: ${datosAnteriores.active}`,
              Respuesta: JSON.stringify(respuesta),
              TipoRespuesta: 200,
              Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }
  
  
            this.diccionarioResultadosService.createLogAsync(Loguser).then(respuesta => {
            });
          },error:(err)=> {
            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo:'Control Calidad Interno',
              Submodulo: 'Configuración',
              Item:'Diccionario de Resultados',
              metodo: 'actualización',
              datos: JSON.stringify(this.formaRegistroDiccionario.value),
              DatosAnteriores: `${datosAnteriores.idresultsdictionary} | Diccionario: ${datosAnteriores.desresults} | Estado: ${datosAnteriores.active}`,
              respuesta: err.message,
              tipoRespuesta: err.status,
              Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }
  
            this.diccionarioResultadosService.createLogAsync(Loguser).then(respuesta => { });
          },
        });
      }
    }
  }


  actualizarEstadoDiccionario(datosDiccionario:any[]) {
    const [data,estado ] = datosDiccionario;
    data.active = estado;
    const datosAnteriores = this.dataAnt.find(x => x.idresultsdictionary == data.idresultsdictionary);

    this.diccionarioResultadosService.update(data, data.idresultsdictionary).subscribe({
      next:(respuesta) =>{
        this.cargarDiccionario();
        this.toastr.success('Estado actualizado','Actualización');
        this.log.logObj('Control Calidad Interno', 'Configuración', 'Diccionario', 'a', data, JSON.stringify(respuesta), 200, this.datosAnt(datosAnteriores));
      },error:(err) => {
        this.log.logObj('Control Calidad Interno', 'Configuración', 'Diccionario', 'a', data, err.message, err.status, this.datosAnt(datosAnteriores));
        this.toastr.error('No fue posible actualizar el estado', 'Error')
      },
    });
  }
  datosAnt(data: any) {
    return ` idresultsdictionary: ${data.idresultsdictionary} - desresults: ${data.desresults} - Active: ${!data.Active}`;
  }


  eliminarDiccionario(id: any) {
    let datosAnteriores = this.dataAnt.find(x => x.idresultsdictionary == id.idresultsdictionary);

    this.diccionarioResultadosService.delete('resultsdictionaries', id.idresultsdictionary).subscribe({
      next:(respuesta) => {
          
        this.cargarDiccionario();
        this.toastr.success('Registro eliminado');
  
        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo:'Control Calidad Interno',
          Submodulo: 'Configuración',
          Item:'Diccionario de Resultados',
          metodo: 'eliminación',
          datos: JSON.stringify(id),
          DatosAnteriores: `${datosAnteriores.idresultsdictionary} | Diccionario: ${datosAnteriores.desresults}`,
          respuesta: JSON.stringify(respuesta),
          tipoRespuesta: 200,
          Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
        this.diccionarioResultadosService.createLogAsync(Loguser).then(respuesta => {});
      },error:(err) => {
        this.toastr.error(this.messageError);
    
        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo:'Control Calidad Interno',
          Submodulo: 'Configuración',
          Item:'Diccionario de Resultados',
          metodo: 'eliminación',
          datos: JSON.stringify(id),
          respuesta: err.message,
          tipoRespuesta: err.status,
          Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
        this.diccionarioResultadosService.createLogAsync(Loguser).then(respuesta => {});
      }

    });
  }


  titulosSwal() {
    this.translate.get('MODULES.SWAL.MESAGEERROR').subscribe(respuesta => this.messageError = respuesta);
  }
}
