import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { BsModalRef, BsModalService, ModalModule } from 'ngx-bootstrap/modal';
import { SharedService } from '@app/services/shared.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
import { PaisesService } from '@app/services/configuracion/paises.service';
import { VentanasModalesService } from '@app/services/general/ventanas-modales.service';
import { DatePipe, NgIf, NgClass } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { ImageCdnPipe } from '../../../../../core/pipes/image-cdn.pipe';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TablaComunComponent } from "../../../../../shared/general-tablas/tabla-comun/tabla-comun.component";
import { lastValueFrom, Subject, takeUntil } from 'rxjs';
import { ModalData } from '@app/Models/Modaldata';
import { ModalGeneralComponent } from '@app/modules/shared/modals/modal-general/modal-general.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'app-paises',
    templateUrl: './paises.component.html',
    styleUrls: ['./paises.component.css'],
    providers: [DatePipe],
    standalone: true,
    imports: [
       ModalModule,
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
       TablaComunComponent]
})

export class PaisesComponent implements OnInit {


  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();
  formaRegistroPais: FormGroup;
  accionEditar: any;
  desactivar = false;
  accion: any;
  tituloAccion: any;
  vantanaModal: BsModalRef;
  titulo: any;
  text: any;
  textError: any;
  cancelar: any;
  confirmar: any;
  messageError: any;
  descountryant: any;
  estadoant: any;


  constructor(
    private translate: TranslateService,
    private paisesService: PaisesService,
    private fb: FormBuilder,
    private sharedService: SharedService,
    private ventanaService: VentanasModalesService,
    private datePipe: DatePipe,
    private toastr: ToastrService,
    private dialog: MatDialog,
  ) { }

  displayedColumns: string[] = ['País', 'Estado', 'Editar', 'Eliminar'];
  dataSource: MatTableDataSource<any>;
  dataBody: any[] = [];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  ngOnInit(): void {
    this.cargarPaises();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();
  }
  get DesCountryNoValido() {
    return this.formaRegistroPais.get('descountry');
  }
  crearFormularioRegistroUsuario(datos: any) {
    this.formaRegistroPais = this.fb.group({
      idcountry: [datos.idcountry ? datos.idcountry : ''],
      descountry: [datos.descountry ? datos.descountry : '', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      active: [datos.active ? datos.active : false],
    });
  }

  openModal(descripcion) {
    const data = { descripcion: descripcion, accion: this.accion }
    this.ventanaService.openModal(data);
  }
  cargarPaises() {
    this.dataBody = [];
    this.paisesService.getAllAsync().then(respuesta => {
      const filtrarDataTable: any[] = respuesta;
      this.dataBody = filtrarDataTable.map( x =>  {
        return { País:x.descountry,Estado:x.active,item:x,item3:x,item4:x };
      });
      this.dataSource = new MatTableDataSource(respuesta);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });

  }

  crearEditarPais() {
    if (!this.formaRegistroPais.invalid) {

      var idcountyant = this.formaRegistroPais.value.idcountry;

      this.paisesService.getByIdAsync(idcountyant).then((datacountry: any) => {
        this.descountryant = datacountry.descountry;
        this.estadoant = datacountry.active;
      }).catch(error => { });

      if (this.accion === 'Crear') {

        this.desactivar = true;
        this.paisesService.create(this.formaRegistroPais.value).subscribe(respuesta => {

          // this.closeVentana();
          this.cargarPaises();
          this.toastr.success('Registro creado');
          this.desactivar = false;

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo: 'Configuración',
            Submodulo: 'Ubicaciones',
            Item: 'Países',
            Metodo: 'creación',
            Datos: ('País: ' + this.formaRegistroPais.value.descountry + '| ' + this.formaRegistroPais.value.active),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: 200,
            Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }

          this.paisesService.createLogAsync(Loguser).then(respuesta => {
          });

        }, (error) => {

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo: 'Configuración',
            Submodulo: 'Ubicaciones',
            Item: 'Países',
            Metodo: 'creación',
            Datos: ('País: ' + this.formaRegistroPais.value.descountry + '| ' + this.formaRegistroPais.value.active),
            respuesta: error.message,
            tipoRespuesta: error.status,
            Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }
          this.paisesService.createLogAsync(Loguser).then(respuesta => {
          });
        });

      } else {
        this.paisesService.update(this.formaRegistroPais.value, this.formaRegistroPais.value.idcountry).subscribe(respuesta => {
          // this.closeVentana();
          this.cargarPaises();
          this.toastr.success('Registro actualizado');

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo: 'Configuración',
            Submodulo: 'Ubicaciones',
            Item: 'Países',
            Metodo: 'actualización',
            Datos: ('País: ' + this.formaRegistroPais.value.descountry + '| ' + this.formaRegistroPais.value.active),
            DatosAnteriores: ('País: ' + this.descountryant + '| ' + this.estadoant),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: 200,
            Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')

          }

          this.paisesService.createLogAsync(Loguser).then(respuesta => {
          });
        }, (error) => {

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo: 'Configuración',
            Submodulo: 'Ubicaciones',
            Item: 'Países',
            Metodo: 'actualización',
            Datos: ('País: ' + this.formaRegistroPais.value.descountry + '| ' + this.formaRegistroPais.value.active),
            DatosAnteriores: ('País: ' + this.descountryant + '| ' + this.estadoant),
            respuesta: error.message,
            tipoRespuesta: error.status,
            Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }
          this.paisesService.createLogAsync(Loguser).then(respuesta => {
          });
        });
      }
    }

  }

  actualizarEstadoPais(datosCiudad: any[]) {
    const [data, estado] = datosCiudad;
    data.active = estado;
    this.paisesService.update(data, data.idcountry).subscribe(respuesta => {

      this.accion = 'Editar';
      this.toastr.success('Registro actualizado');
      this.cargarPaises();
    });

  }
  openModalRegistroPais(templateRegistroPais: TemplateRef<any>, datos: any) {
    if(datos){
      this.accionEditar = true;
      this.accion = "Editar" ;
    }else{
      this.accionEditar = false;
      this.accion = "Crear";
    }

    this.crearFormularioRegistroUsuario(datos);

    const destroy$: Subject<boolean> = new Subject<boolean>();
    /* Variables recibidas por el modal */
    const data: ModalData = {
      content: templateRegistroPais,
      btn: this.accionEditar ? 'Actualizar' : 'Guardar',
      btn2: 'Cerrar',
      footer: true,
      title: this.accion,
      image: ''
    };
    const dialogRef = this.dialog.open(ModalGeneralComponent, { height: '16em', width: '30em', data, disableClose: true });

    dialogRef.componentInstance.primaryEvent?.pipe(takeUntil(destroy$)).subscribe(x => {
      if(this.formaRegistroPais.invalid){
        this.formaRegistroPais.markAllAsTouched();
        return
      }
      this.crearEditarPais();
      dialogRef.close();
    });
  }

  eliminarPais(id: any) {
    let namepais = null;
    this.paisesService.getByIdAsync(id.idcountry).then((datapais: any) => {

      namepais = datapais.descountry;

    });
    this.paisesService.delete('Countries', id.idcountry).subscribe(
      {
        next: (respuesta) => {
          this.cargarPaises();
          this.accion = '';

          this.toastr.success('Registro eliminado');

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo: 'Configuración',
            Submodulo: 'Ubicaciones',
            Item: 'Países',
            Metodo: 'eliminación',
            Datos: (id + '| ' + 'País: ' + namepais),
            Respuesta: JSON.stringify(respuesta),
            tipoRespuesta: 200,
            Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }
          this.paisesService.createLogAsync(Loguser).then(respuesta => {
            console.log(respuesta);
          });
        },
        error:(err) => {
          this.toastr.error(this.messageError);

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo: 'Configuración',
            Submodulo: 'Ubicaciones',
            Item: 'Países',
            Metodo: 'eliminación',
            Datos: (id + '| ' + namepais),
            respuesta: err.message,
            tipoRespuesta: err.status,
            Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }
          this.paisesService.createLogAsync(Loguser).then(respuesta => {
            console.log(respuesta);
          });
        },
      }

    )

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

