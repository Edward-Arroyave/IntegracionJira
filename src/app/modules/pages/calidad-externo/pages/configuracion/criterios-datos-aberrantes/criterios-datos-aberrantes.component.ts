import { DatePipe, NgIf } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { SharedService } from '@app/services/shared.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { VentanasModalesService } from '@app/services/general/ventanas-modales.service';
import { DatosAberrantesService } from '@app/services/calidad-externo/DatosAberrantesQce.service';
import { ToastrService } from 'ngx-toastr';
import { ImageCdnPipe } from '../../../../../core/pipes/image-cdn.pipe';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog } from '@angular/material/dialog';
import { LoaderService } from '@app/services/loader/loader.service';
import { ModalData } from '@app/Models/Modaldata';
import { Subject, takeUntil } from 'rxjs';
import { ModalGeneralComponent } from '@app/modules/shared/modals/modal-general/modal-general.component';
import { TablaComunComponent } from '@app/modules/shared/general-tablas/tabla-comun/tabla-comun.component';


@Component({
  selector: 'app-criterios-datos-aberrantes',
  templateUrl: './criterios-datos-aberrantes.component.html',
  styleUrls: ['./criterios-datos-aberrantes.component.css'],
  providers: [DatePipe],
  standalone: true,
  imports: [
    NgIf,
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
export class CriteriosDatosAberrantesComponent implements OnInit {

  displayedColumns: string[] = ['N° Datos', 'Z-Score', 'Estado', 'Editar', 'Eliminar'];
  dataSource: MatTableDataSource<any>;
  ventanaModal: BsModalRef;
  dataTableBody: any[] = [];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  formaBuscarDatos: FormGroup;
  formaRegistroDatosAberrantes: FormGroup;
  bandera: boolean;
  accion: any;
  desactivar = false;
  accionEditar: any;
  tituloAccion: any;
  messageError: any;
  messageSinDatos: string;
  titulo: string = '';
  dataTable = [];
  ok: string;
  text: string = '';
  text2: string = '';
  text3: string = '';
  aceptar: string = '';
  dateNow: Date = new Date();
  ver: boolean = undefined;
  verBtn: boolean = false;
  spinner: boolean;
  datos: any;

  dateNowISO = this.dateNow.toTimeString();

  constructor(

    private fb: FormBuilder,
    private datePipe: DatePipe,
    private DatosAberrantesService: DatosAberrantesService,
    private sharedService: SharedService,
    private toastr: ToastrService,
    private modalService: BsModalService,
    private translate: TranslateService,
    private ventanaService: VentanasModalesService,
    private dialog: MatDialog,
    private loaderService: LoaderService
  ) { }

  ngOnInit(): void {

    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();
    this.cargarDatosAberrantes();

  }

  openModal(descripcion) {

    const data = { descripcion: descripcion, accion: this.accion }
    this.ventanaService.openModal(data);

  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  get participantsNoValido() {
    return this.formaRegistroDatosAberrantes.get('participants');
  }
  get zscoreNoValido() {
    return this.formaRegistroDatosAberrantes.get('zscore');
  }


  crearFormularioDatosAberrantes(datos: any) {

    this.formaRegistroDatosAberrantes = this.fb.group({

      idaberrantfiltercriteria: [datos.idaberrantfiltercriteria ? datos.idaberrantfiltercriteria : ''],
      participants: [datos.participants ? datos.participants : '', [Validators.required]],
      zscore: [datos.zscore ? datos.zscore : '', [Validators.required]],
      active: [datos.active ? datos.active : false],

    });
  }


  openModalRegistroDatosaberrantes(templateRegistroDatosAberrantes: TemplateRef<any>, datos: any) {

    this.crearFormularioDatosAberrantes(datos);

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
      content: templateRegistroDatosAberrantes,
      btn: this.accionEditar ? 'Actualizar' : 'Guardar',
      btn2: 'Cerrar',
      footer: true,
      title: this.accion,
      image: this.accionEditar ? 'assets/rutas/iconos/editar.png' : 'assets/rutas/iconos/editar.png',
    };
    const dialogRef = this.dialog.open(ModalGeneralComponent, { height: 'auto', width: '40em', data, disableClose: true });

    dialogRef.componentInstance.primaryEvent?.pipe(takeUntil(destroy$)).subscribe(x => {
      if (this.formaRegistroDatosAberrantes.invalid) {
        this.formaRegistroDatosAberrantes.markAllAsTouched();
        return
      }
      this.crearEditarCA();
      dialogRef.close();
    });
  }

  cargarDatosAberrantes() {
    this.loaderService.show();
    this.DatosAberrantesService.getAllAsync().then(respuesta => {
      const filtrarDataTable: any[] = respuesta;
      this.dataTableBody = filtrarDataTable.map(x => {
        return { 'N° Datos': x.participants, 'Z-Score': x.zscore, Estado: x.active, item: x, item4: x, item5: x };
      });
      this.dataTable = respuesta;
      this.dataSource = new MatTableDataSource(respuesta);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }).finally(() => {
      this.loaderService.hide(); // Oculta el loader independientemente del resultado
    });
  }

  crearEditarCA() {

    if (!this.formaRegistroDatosAberrantes.invalid) {

      if (this.accion === 'Crear') {

        let participantes = this.formaRegistroDatosAberrantes.get('participants').value;
        let existeNumero = this.dataTable.find(dato => dato.participants == participantes) || undefined;

        if (existeNumero != undefined) {


          this.accion = 'noDatos';
          this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.YAEXISTEPARTICIPANTES'));

        } else {

          this.accion = 'Crear';
          this.desactivar = true;
          this.DatosAberrantesService.create(this.formaRegistroDatosAberrantes.value).subscribe(respuesta => {


            this.cargarDatosAberrantes();
            this.toastr.success('Registro creado');
            this.desactivar = false;

            const Loguser = {

              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              Hora: this.dateNowISO,
              Metodo: 'creación',
              Datos: JSON.stringify(this.formaRegistroDatosAberrantes.value),
              Respuesta: JSON.stringify(respuesta),
              TipoRespuesta: status

            }

            this.DatosAberrantesService.createLogAsync(Loguser).then(respuesta => {

            });

          }, error => {

            const Loguser = {
              fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.dateNowISO,
              metodo: 'creación',
              datos: JSON.stringify(this.formaRegistroDatosAberrantes.value),
              respuesta: error.message,
              tipoRespuesta: error.status
            }

            this.DatosAberrantesService.createLogAsync(Loguser).then(respuesta => {
            });

          });

        }

      } else {

        this.accion = 'Editar';

        this.DatosAberrantesService.update(this.formaRegistroDatosAberrantes.value, this.formaRegistroDatosAberrantes.value.idaberrantfiltercriteria).subscribe(respuesta => {


          this.cargarDatosAberrantes();
          this.toastr.success('Registro actualizado');

          const Loguser = {

            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            Hora: this.dateNowISO,
            Metodo: 'actualización',
            Datos: JSON.stringify(this.formaRegistroDatosAberrantes.value),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: status

          }

          this.DatosAberrantesService.createLogAsync(Loguser).then(respuesta => {
          });

        }, (error) => {

          const Loguser = {

            fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.dateNowISO,
            metodo: 'actualización',
            datos: JSON.stringify(this.formaRegistroDatosAberrantes.value),
            respuesta: error.message,
            tipoRespuesta: error.status

          }

          this.DatosAberrantesService.createLogAsync(Loguser).then(respuesta => {
          });

        });

      }

    }

  }

  actualizarCAEstado(datosConfi) {

    const [data, estado] = datosConfi;
    const datos = { idaberrantfiltercriteria: data.idaberrantfiltercriteria, participants: data.participants, zscore: data.zscore, active: estado }
    this.loaderService.show();
    this.DatosAberrantesService.update(datos, data.idaberrantfiltercriteria).subscribe(respuesta => {
      this.loaderService.hide();

      this.cargarDatosAberrantes();
      this.accion = 'Editar';
      this.toastr.success('Estado actualizado', 'Actualización');
    }, err => {
      this.loaderService.hide();
      this.toastr.error('No fue posible actualizar el estado', 'Error')
    });

  }

  eliminarCA(id: any) {
    this.DatosAberrantesService.delete('CA', id).subscribe({
      next: (respuesta) => {
        this.cargarDatosAberrantes();
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
        this.DatosAberrantesService.createLogAsync(Loguser).then(respuesta => {
        });
      }, error: (err) => {


        const Loguser = {
          fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.dateNowISO,
          metodo: 'eliminación',
          datos: JSON.stringify(id),
          respuesta: err.message,
          tipoRespuesta: err.status
        }
        this.DatosAberrantesService.createLogAsync(Loguser).then(respuesta => {
        });
        this.toastr.error(this.messageError);
      }

    });
  }

  titulosSwal() {
    this.translate.get('MODULES.SWAL.MESAGEERROR').subscribe(respuesta => this.messageError = respuesta);
    this.translate.get('MODULES.SWAL.SINDATOS').subscribe(respuesta => this.messageSinDatos = respuesta);
    this.translate.get('MODULES.SWAL.TITULO_ERROR').subscribe(respuesta => this.titulo = `<b>${respuesta}</b>`);
    this.translate.get('MODULES.SWAL.ACEPTAR').subscribe(respuesta => this.aceptar = respuesta);
    this.translate.get('MODULES.SWAL.OK').subscribe(respuesta => this.ok = `<b>${respuesta}</b>`);

  }




}
