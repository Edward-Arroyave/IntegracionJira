import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { SharedService } from '@app/services/shared.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
import { VentanasModalesService } from '@app/services/general/ventanas-modales.service';
import { ParametrosGlobalesService } from '@app/services/configuracion/parametrosglobales.service';
import { DatePipe, NgIf, NgClass } from '@angular/common';
import { ImageCdnPipe } from '../../../../../core/pipes/image-cdn.pipe';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TablaComunComponent } from '@app/modules/shared/general-tablas/tabla-comun/tabla-comun.component';
import { MatDialog } from '@angular/material/dialog';
import { lastValueFrom, Subject, takeUntil } from 'rxjs';
import { ModalData } from '@app/Models/Modaldata';
import { ModalGeneralComponent } from '@app/modules/shared/modals/modal-general/modal-general.component';



@Component({
    selector: 'app-parametros-globales',
    templateUrl: './parametros-globales.component.html',
    styleUrls: ['./parametros-globales.component.css'],
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
export class ParametrosGlobalesComponent implements OnInit {

  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();
  formaRegistroParametrosGlobales: FormGroup;
  accionEditar: any;
  accion: any;
  tituloAccion: any;
  vantanaModal: BsModalRef;
  listaDiccionarioP: [];
  titulo: any;
  text: any;
  desactivar = false;
  textError: any;
  cancelar: any;
  confirmar: any;
  messageError: any;
  codparamant:any;
  desparamant:any;
  estadoant:any;

  constructor(
    private translate: TranslateService,
    private parametrosGlobalesService: ParametrosGlobalesService,
    private fb: FormBuilder,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private sharedService: SharedService,
    private ventanaService: VentanasModalesService,
    private datePipe: DatePipe,
    private dialog: MatDialog,
  ) { }
  displayedColumns: string[] = ['Cód. documento', 'Documento', 'Estado', 'Editar', 'Eliminar'];
  dataSource: MatTableDataSource<any>;
  dataTableBody:any[]=[];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  ngOnInit(): void {
    this.cargarParametrosGlobales();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();
  }
  openModal(descripcion) {
    const data = { descripcion: descripcion, accion: this.accion }
    this.ventanaService.openModal(data);
  }

  get codParamNoValido() {
    return this.formaRegistroParametrosGlobales.get('codParam');
  }
  get desParamNoValido() {
    return this.formaRegistroParametrosGlobales.get('desParam');
  }
  crearFormularioParametrosGlobales(datos: any) {
    this.formaRegistroParametrosGlobales = this.fb.group({
      idParametro: [datos.idparametro ? datos.idparametro : ''],
      codParam: [datos.codparam ? datos.codparam : '', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      desParam: [datos.desparam ? datos.desparam : '', [Validators.required, Validators.minLength(5), Validators.maxLength(50)]],
      active: [datos.active ? datos.active : false],
    });
  }
  cargarParametrosGlobales() {
    this.parametrosGlobalesService.getAllAsync().then(respuesta => {
      const filtrarDataTable:any[] = respuesta;
      this.dataTableBody = filtrarDataTable.map( x =>  {
        return { 'Cód. documento':x.codparam,Documento:x.desparam ,Estado:x.active, item: x, item4:x,item5:x };
      });
      this.dataSource = new MatTableDataSource(respuesta);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  crearEditarParametroGlobal() {
    if (!this.formaRegistroParametrosGlobales.invalid) {

      var idparamglobal = this.formaRegistroParametrosGlobales.value.idParametro;

      this.parametrosGlobalesService.getByIdAsync(idparamglobal).then((dataparams: any) => {

        this.codparamant = dataparams.codparam;
        this.desparamant = dataparams.desparam;
        this.estadoant = dataparams.active;

      }).catch(error => {});

      if (this.accion === 'Crear') {

        this.desactivar = true;
        lastValueFrom(this.parametrosGlobalesService.create(this.formaRegistroParametrosGlobales.value)).then(respuesta => {

          this.cargarParametrosGlobales();
          this.toastr.success('Registro creado');
          this.desactivar = false;

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Configuración',
            Submodulo: 'Generalidades',
            Item:'Parámetros Globales',
            Metodo: 'creación',
            Datos: ('Cód. documento: ' + this.formaRegistroParametrosGlobales.value.codParam + '| ' + 'Tipo documento: ' +  this.formaRegistroParametrosGlobales.value.desParam + '| estado: ' + this.formaRegistroParametrosGlobales.value.active ),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: 200,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }

          this.parametrosGlobalesService.createLogAsync(Loguser).then(respuesta => {
          });


        }).catch((error) => {
          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Configuración',
            Submodulo: 'Generalidades',
            Item:'Parámetros Globales',
            Metodo: 'creación',
            Datos: ('Cód. documento: ' + this.formaRegistroParametrosGlobales.value.codParam + '| ' + 'Tipo documento: ' +  this.formaRegistroParametrosGlobales.value.desParam + '| estado: ' + this.formaRegistroParametrosGlobales.value.active ),
            respuesta: error.message,
            tipoRespuesta: error.status,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }
          this.parametrosGlobalesService.createLogAsync(Loguser).then(respuesta => {
          });
        });
      } else {
        lastValueFrom(this.parametrosGlobalesService.update(this.formaRegistroParametrosGlobales.value, this.formaRegistroParametrosGlobales.value.idParametro)).then(respuesta => {

          this.cargarParametrosGlobales();
          this.toastr.success('Registro actualizado');

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Configuración',
            Submodulo: 'Generalidades',
            Item:'Parámetros Globales',
            Metodo: 'actualización',
            Datos: ('Cód. documento: ' + this.formaRegistroParametrosGlobales.value.codParam + '| ' + 'Tipo documento: ' +  this.formaRegistroParametrosGlobales.value.desParam + '| estado: ' + this.formaRegistroParametrosGlobales.value.active ),
            DatosAnteriores: ('Cód. documento: ' +this.codparamant + '| ' + 'Tipo documento: ' +this.desparamant+ '| estado: ' +this.estadoant ),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: 200,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }

          this.parametrosGlobalesService.createLogAsync(Loguser).then(respuesta => {
          });


        }).catch(  (error) => {
          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Configuración',
            Submodulo: 'Generalidades',
            Item:'Parámetros Globales',
            Metodo: 'actualización',
            Datos: ('Cód. documento: ' + this.formaRegistroParametrosGlobales.value.codParam + '| ' + 'Tipo documento: ' +  this.formaRegistroParametrosGlobales.value.desParam + '| estado: ' + this.formaRegistroParametrosGlobales.value.active ),
            DatosAnteriores: ('Cód. documento: ' +this.codparamant + '| ' + 'Tipo documento: ' +this.desparamant+ '| estado: ' +this.estadoant ),
            respuesta: error.message,
            tipoRespuesta: error.status,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }
          this.parametrosGlobalesService.createLogAsync(Loguser).then(respuesta => {
          });
        });
      }
    }
  }

  eliminarParametroGlobal(id: any) {
    let nameparametro = null;
    this.parametrosGlobalesService.getByIdAsync(id.idparametro).then((dataparametro: any) => {

      nameparametro = dataparametro.desparam;

    });
    this.parametrosGlobalesService.delete('Paramglobals', id.idparametro).subscribe({
      next:(respuesta)=> {
        this.cargarParametrosGlobales();
        this.accion = '';
        this.toastr.success('Registro eliminado');
  
        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo:'Configuración',
          Submodulo: 'Generalidades',
          Item:'Parámetros Globales',
          Metodo: 'eliminación',
          Datos: ( id + '| ' + nameparametro ),
          respuesta: JSON.stringify(respuesta),
          tipoRespuesta: 200,
          Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
        this.parametrosGlobalesService.createLogAsync(Loguser).then(respuesta => {
        });
      },error:(err) => {
        this.toastr.error(this.messageError);
  
        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo:'Configuración',
          Submodulo: 'Generalidades',
          Item:'Parámetros Globales',
          Metodo: 'eliminación',
          Datos: ( id + '| ' + nameparametro ),
          respuesta: err.message,
          tipoRespuesta: err.status,
          Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
        this.parametrosGlobalesService.createLogAsync(Loguser).then(respuesta => {
        });
      },
    })
  }
  actualizarEstadoParametroGlobal( datosParaGlo:any[]) {
    const [data,estado ] = datosParaGlo;
    data.active = estado;
    this.parametrosGlobalesService.update(data, data.idparametro).subscribe(respuesta => {
      this.cargarParametrosGlobales();
      this.toastr.success('Registro actualizado');
      this.accion = 'Editar';
      this.toastr.success('Estado actualizado', 'Actualización')

    },err=> {
      this.toastr.error('No fue posible actualizar el estado', 'Error')
    })
  }
  openModalRegistroParametro(templateRegistroCiudad: TemplateRef<any>, datos: any) {


    if(datos){
      this.accionEditar = true;
      this.accion = "Editar" ;
    }else{
      this.accionEditar = false;
      this.accion = "Crear";
    }

    this.crearFormularioParametrosGlobales(datos);

    const destroy$: Subject<boolean> = new Subject<boolean>();
    /* Variables recibidas por el modal */
    const data: ModalData = {
      content: templateRegistroCiudad,
      btn: this.accionEditar?'Actualizar':'Guardar',
      btn2: 'Cerrar',
      footer:true,
      title: this.accion,
      image:''
    };
    const dialogRef = this.dialog.open(ModalGeneralComponent, { height:'16em' ,width: '40em', data, disableClose: true });

    dialogRef.componentInstance.primaryEvent?.pipe(takeUntil(destroy$)).subscribe(x =>{
      if(this.formaRegistroParametrosGlobales.invalid){
        this.formaRegistroParametrosGlobales.markAllAsTouched();
        return
      }
      this.crearEditarParametroGlobal();
      dialogRef.close();
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
