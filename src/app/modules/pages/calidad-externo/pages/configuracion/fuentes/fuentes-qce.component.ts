import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FuentesQceService } from '@app/services/calidad-externo/fuentesQce.service';
import { LogsService } from '@app/services/configuracion/logs.service';
import { SharedService } from '@app/services/shared.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { VentanasModalesService } from '@app/services/general/ventanas-modales.service';
import { DatePipe, NgIf, NgClass } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { TemplateRef } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { ImageCdnPipe } from '../../../../../core/pipes/image-cdn.pipe';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TablaComunComponent } from '@app/modules/shared/general-tablas/tabla-comun/tabla-comun.component';
import { MatDialog } from '@angular/material/dialog';
import { LoaderService } from '@app/services/loader/loader.service';
import { Subject, takeUntil } from 'rxjs';
import { ModalData } from '@app/Models/Modaldata';
import { ModalGeneralComponent } from '@app/modules/shared/modals/modal-general/modal-general.component';

@Component({
  selector: 'app-fuentes',
  templateUrl: './fuentes-qce.component.html',
  styleUrls: ['./fuentes-qce.component.css'],
  providers: [DatePipe],
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatTableModule, MatSortModule, MatSlideToggleModule, MatPaginatorModule, NgIf, FormsModule, ReactiveFormsModule, NgClass, TranslateModule, ImageCdnPipe,
    TablaComunComponent
  ]
})
export class FuentesQceComponent implements OnInit {
  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();
  dateNowMilliseconds = this.dateNow.getTime();
  formularioRegistroEditar: FormGroup;
  accionEditar: any;
  tituloAccion: any;
  accion: any;
  desactivar = false;
  ventanaModal: BsModalRef;
  titulo: any;
  text: any;
  way: boolean = false;
  textError: any;
  cancelar: any;
  confirmar: any;
  messageError: any;

  constructor(
    private translate: TranslateService,
    private fuentesQceService: FuentesQceService,
    private logsService: LogsService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private modalService: BsModalService,
    private sharedService: SharedService,
    private ventanaService: VentanasModalesService,
    private datePipe: DatePipe,
    private dialog: MatDialog,
    private loaderService: LoaderService
  ) { }
  displayedColumns: string[] = ['Fuentes', 'Estado', 'Editar', 'Eliminar'];
  dataSource: MatTableDataSource<any>;
  dataTableBody: any[] = [];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  ngOnInit(): void {
    this.cargarValores();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();
  }
  openModal(descripcion) {
    const data = { descripcion: descripcion, accion: this.accion }
    this.ventanaService.openModal(data);
  }
  cargarValores() {
    this.loaderService.show();
    this.loaderService.text.emit({ text: 'Cargando fuentes...' });
    this.fuentesQceService.getAllAsync().then(respuesta => {
      this.loaderService.hide();
      const filtrarDataTable: any[] = respuesta;
      this.dataTableBody = filtrarDataTable.map(x => {
        return { Fuentes: x.dessource, Estado: x.active, item: x, item3: x, item4: x };
      });
      this.dataSource = new MatTableDataSource(respuesta);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    })


  }


  crearFormulario(datos: any) {
    this.formularioRegistroEditar = this.fb.group({
      idsource: [datos.idsource],
      dessource: [datos.dessource ? datos.dessource : '', [Validators.required, Validators.maxLength(20)]],
      active: [datos.active ? datos.active : false]
    });
  }
  get desSourceNoValido() {
    return this.formularioRegistroEditar.get('dessource');
  }
  openModalRegistro(templateRegistro: TemplateRef<any>, datos: any) {
    this.way = false;
    this.crearFormulario(datos);
    if (datos) {
      this.accionEditar = true;
      this.accion = "Editar";
    } else {
      this.accionEditar = false;
      this.accion = "Crear";
    }
    const destroy$: Subject<boolean> = new Subject<boolean>();
    /* Variables recibidas por el modal */
    const data: ModalData = {
      content: templateRegistro,
      btn: this.accionEditar ? 'Actualizar' : 'Guardar',
      btn2: 'Cerrar',
      footer: true,
      title: this.accion,
      image: this.accionEditar ? 'assets/rutas/iconos/editar.png' : 'assets/rutas/iconos/editar.png',
    };
    const dialogRef = this.dialog.open(ModalGeneralComponent, { height: 'auto', width: '40em', data, disableClose: true });

    dialogRef.componentInstance.primaryEvent?.pipe(takeUntil(destroy$)).subscribe(x => {
      if (this.formularioRegistroEditar.invalid) {
        this.formularioRegistroEditar.markAllAsTouched();
        return
      }
      this.crearEditar();
      dialogRef.close();
    });

  }

  crearEditar() {
    if (!this.formularioRegistroEditar.invalid) {

      if (this.accion === 'Crear') {

        this.desactivar = true;
        this.fuentesQceService.create(this.formularioRegistroEditar.value).subscribe(respuesta => {


          this.cargarValores();
          this.accion = 'Crear';
          this.toastr.success('Registro creado');
          this.desactivar = false;

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            Hora: this.dateNowISO,
            Metodo: 'creación',
            Datos: JSON.stringify(this.formularioRegistroEditar.value),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: status
          }
          this.logsService.createLogAsync(Loguser).then(respuesta => {
            console.log(respuesta);
          });

        }, (error) => {
          this.toastr.error(this.translate.instant(error.error));
          this.desactivar = false;
          const Loguser = {
            fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.dateNowISO,
            metodo:'creación',
            datos: JSON.stringify(this.formularioRegistroEditar.value),
            respuesta: error.message,
            tipoRespuesta: error.status
          }
          this.logsService.createLogAsync(Loguser).then(respuesta => {
            console.log(respuesta);
          });
        });
      } else {
        this.fuentesQceService.update(this.formularioRegistroEditar.value, this.formularioRegistroEditar.value.idsource).subscribe(respuesta => {
          this.cargarValores();
          this.toastr.success('Registro actualizado');
          this.way = true;

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            Hora: this.dateNowISO,
            Metodo: 'actualización',
            Datos: JSON.stringify(this.formularioRegistroEditar.value),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: status
          }


          this.logsService.createLogAsync(Loguser).then(respuesta => {

          });
        }, (error) => {

          const Loguser = {
            fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.dateNowISO,
            metodo: 'actualización',
            datos: JSON.stringify(this.formularioRegistroEditar.value),
            respuesta: error.message,
            tipoRespuesta: error.status
          }
          this.logsService.createLogAsync(Loguser).then(respuesta => {

          });
        });
      }
    }
  }

  eliminar(id: any) {

    this.fuentesQceService.delete('qce/SourcesQce', id).subscribe({
      next: (respuesta) => {


        this.cargarValores();
        this.accion = '';
        this.toastr.success('Registro eliminado');

        const Loguser = {
          fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.dateNowISO,
          metodo: 'eliminación',
          datos: JSON.stringify(id),
          respuesta: JSON.stringify(respuesta),
          tipoRespuesta: status
        }
        this.logsService.createLogAsync(Loguser).then(respuesta => {
          console.log(respuesta);
        });
      }, error :(err) => {
        this.loaderService.hide();
        this.toastr.error(this.messageError);
        const Loguser = {
          fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.dateNowISO,
          metodo: 'eliminación',
          datos: JSON.stringify(id),
          respuesta: err.message,
          tipoRespuesta: err.status
        }
        this.logsService.createLogAsync(Loguser).then(respuesta => {
          console.log(respuesta);
        })
      }
    })
  }
  actualizarEstado(objeto: any) {

    const [data, estado] = objeto;
    const datos = { idsource: data.idsource, idunits: data.idunits, dessource: data.dessource, active: estado }
    this.loaderService.show();
    this.fuentesQceService.update(datos, data.idsource).subscribe(respuesta => {
      this.loaderService.hide();
      this.tituloAccion = 'Editar';
      this.cargarValores();
      this.toastr.success('Estado actualizado', 'Actualización');
    }, err => {
      this.toastr.error('No fue posible actualizar el estado', 'Error')
      this.loaderService.hide();
    });
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  titulosSwal() {
    this.translate.get('MODULES.SWAL.MESAGEERROR').subscribe(respuesta => this.messageError = respuesta);

  }



}
