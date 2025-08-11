import { DatePipe, NgIf, NgClass } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { TemplateRef } from '@angular/core';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { SeccionesQceService } from '@app/services/calidad-externo/seccionesQce.service';
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
import { error } from 'console';
import { environment } from '@environment/environment';
import { HttpClient } from '@angular/common/http';
import { Section } from '@app/interfaces/section';
import { stat } from 'fs';

@Component({
  selector: 'app-secciones',
  templateUrl: './secciones.component.html',
  styleUrls: ['./secciones.component.css'],
  providers: [DatePipe],
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatTableModule, MatSortModule, MatSlideToggleModule, MatPaginatorModule, NgIf, FormsModule, ReactiveFormsModule, NgClass, TranslateModule, ImageCdnPipe, TablaComunComponent]
})
export class SeccionesComponentQce implements OnInit {
  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();
  ventanaModal: BsModalRef;
  formaRegistroSeccionesQce: FormGroup;
  accionEditar: any;
  tituloAccion: any;
  desactivar = false;
  accion: any;
  messageError: string;
  listaSections: Section[] = [];
  displayedColumns: string[] = ['Sección', 'Estado', 'Editar', 'Eliminar'];
  dataSource: MatTableDataSource<any>;
  dataTableBody: any[] = [];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  constructor(
    private seccionesQceService: SeccionesQceService,
    private modalService: BsModalService,
    private translate: TranslateService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private ventanaService: VentanasModalesService,
    private datePipe: DatePipe,
    private sharedService: SharedService,
    private dialog: MatDialog,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.cargarSeccionesQce();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();
  }



  cargarSeccionesQce() {
    this.seccionesQceService.getAllAsync().then(respuesta => {
      const filtrarDataTable: any[] = respuesta;
      this.listaSections = filtrarDataTable;  // Almacena los datos en listaSections
      this.dataTableBody = filtrarDataTable.map(x => {
        return { Sección: x.dessection, Estado: x.active, item: x, item3: x, item4: x };
      });
      this.dataSource = new MatTableDataSource(respuesta);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }



  openModal(descripcion) {
    const data = { descripcion: descripcion, accion: this.tituloAccion }
    this.ventanaService.openModal(data);
  }
  openModalRegistroSeccionesQce(templateRegistroSeccionesQce: TemplateRef<any>, datos: any) {

    this.crearFormularioRegistroSeccionesQce(datos);
    // this.ventanaModal = this.modalService.show(templateRegistroSeccionesQce ,{backdrop: 'static', keyboard: false });
    //this.accionEditar = !!datos;
    // datos ? this.translate.get('MODULES.SECCIONESQCE.FORMULARIO.ACTUALIZAR').subscribe(respuesta => this.tituloAccion = respuesta) : this.translate.get('MODULES.SECCIONESQCE.FORMULARIO.REGISTRAR').subscribe(respuesta => this.tituloAccion = respuesta);

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
      content: templateRegistroSeccionesQce,
      btn: this.accionEditar ? 'Actualizar' : 'Guardar',
      btn2: 'Cerrar',
      footer: true,
      title: this.accion,
      image: this.accionEditar ? 'assets/rutas/iconos/editar.png' : 'assets/rutas/iconos/editar.png',
    };
    const dialogRef = this.dialog.open(ModalGeneralComponent, { height: 'auto', width: '40em', data, disableClose: true });

    dialogRef.componentInstance.primaryEvent?.pipe(takeUntil(destroy$)).subscribe(x => {
      if (this.formaRegistroSeccionesQce.invalid) {
        this.formaRegistroSeccionesQce.markAllAsTouched();
        return
      }
      this.crearEditarSeccionQce();
      dialogRef.close();
    });
  }

  crearFormularioRegistroSeccionesQce(datos: any) {
    this.formaRegistroSeccionesQce = this.fb.group({
      idsection: [datos.idsection ? datos.idsection : ''],
      dessection: [datos.dessection ? datos.dessection : '', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      active: [datos.active ? datos.active : false]
    });
  }

  get dessectionNoValido() {
    return this.formaRegistroSeccionesQce.get('dessection');
  }


  obtenerDatosAnteriores(idsection: number) {
    if (!this.listaSections || this.listaSections.length === 0) {
      return null; // Retornamos null si no hay datos en la lista
    }

    const id = Number(idsection);
    const datosAnteriores = this.listaSections.find(seccion => Number(seccion.idsection) === id);

    return datosAnteriores || null;
  }


  crearEditarSeccionQce() {
    if (!this.formaRegistroSeccionesQce.invalid) {
      const usuario = sessionStorage.getItem('userid') || 'desconocido';
      const nombreUsuario = sessionStorage.getItem('nombres') || 'desconocido';

      const inicio = Date.now();
      const endpoint = `${environment.apiUrl}qce/SectionQce`;
      const userAgent = navigator.userAgent;

      if (this.accion === 'Crear') {
        this.desactivar = true;

        // Llamada HTTP para crear la sección
        this.seccionesQceService.create(this.formaRegistroSeccionesQce.value, true).subscribe(
          (respuesta) => {
            const fin = Date.now();
            const tiempoEjecucion = fin - inicio;

            this.cargarSeccionesQce();
            this.toastr.success('Registro creado');
            this.desactivar = false;

            const tipoRespuesta = respuesta?.status === 200 || respuesta?.status === 201 || respuesta?.status === 204 ? 200 : respuesta?.status ?? 200;

            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              Hora: this.dateNowISO,
              modulo: 'Control Calidad Externo',
              SubModulo: 'Configuración',
              item: 'Secciones',
              metodo: 'creación',
              Datos: JSON.stringify(this.formaRegistroSeccionesQce.value),
              DatosAnteriores: '',
              Respuesta: respuesta?.body ? JSON.stringify(respuesta.body) : JSON.stringify(respuesta),
              TipoRespuesta: tipoRespuesta,
              userid: usuario,
              usuario: nombreUsuario,
              executionTime: tiempoEjecucion,
              endpoint: endpoint,
              userAgent: userAgent
            };

            this.seccionesQceService.createLogAsync(Loguser);
          },
          (error) => {
            const fin = Date.now();
            const tiempoEjecucion = fin - inicio;

            const tipoRespuesta = error.status ?? 500;

            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              Hora: this.dateNowISO,
              metodo: 'creación',
              Datos: JSON.stringify(this.formaRegistroSeccionesQce.value),
              DatosAnteriores: '',
              Respuesta: error?.message || 'Sin contenido en la respuesta',
              TipoRespuesta: tipoRespuesta,
              userid: usuario,
              usuario: nombreUsuario,
              executionTime: tiempoEjecucion,
              endpoint: endpoint,
              userAgent: userAgent,
              modulo: 'Control Calidad Externo',
              SubModulo: 'Configuración',
              item: 'Secciones'
            };

            this.seccionesQceService.createLogAsync(Loguser);
          }
        );
      } else {
        // Si es una actualización (update)
        const id = Number(this.formaRegistroSeccionesQce.value.idsection);
        const datosAnteriores = this.obtenerDatosAnteriores(id);
        const datosNuevos = this.formaRegistroSeccionesQce.value;

        this.seccionesQceService.update(datosNuevos, id, true).subscribe(
          (respuesta) => {
            const fin = Date.now();
            const tiempoEjecucion = fin - inicio;

            this.cargarSeccionesQce();
            this.toastr.success('Registro actualizado');

            const tipoRespuesta = respuesta?.status === 200 || respuesta?.status === 201 || respuesta?.status === 204 ? 200 : respuesta?.status ?? 200;

            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              Hora: this.dateNowISO,
              Metodo: 'actualización',
              Datos: JSON.stringify(datosNuevos),
              DatosAnteriores: datosAnteriores ? JSON.stringify(datosAnteriores) : '',
              Respuesta: respuesta?.body ? JSON.stringify(respuesta.body) : JSON.stringify(respuesta),
              TipoRespuesta: tipoRespuesta,
              userid: usuario,
              usuario: nombreUsuario,
              executionTime: tiempoEjecucion,
              endpoint: endpoint,
              userAgent: userAgent,
              modulo: 'Control Calidad Externo',
              SubModulo: 'Configuración',
              item: 'Secciones'
            };

            this.seccionesQceService.createLogAsync(Loguser);
          },
          (error) => {
            const fin = Date.now();
            const tiempoEjecucion = fin - inicio;

            const tipoRespuesta = error.status ?? 500;

            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              Hora: this.dateNowISO,
              Metodo: 'actualización',
              Datos: JSON.stringify(datosNuevos),
              DatosAnteriores: datosAnteriores ? JSON.stringify(datosAnteriores) : '',
              Respuesta: error?.message || 'Sin contenido en la respuesta',
              TipoRespuesta: tipoRespuesta,
              userid: usuario,
              usuario: nombreUsuario,
              executionTime: tiempoEjecucion,
              endpoint: endpoint,
              userAgent: userAgent,
              modulo: 'Control Calidad Externo',
              SubModulo: 'Configuración',
              item: 'Secciones'
            };

            this.seccionesQceService.createLogAsync(Loguser);
          }
        );
      }
    }
  }







  actualizarEstadoSeccionQce(datosSeccion) {
    const [data, estado] = datosSeccion;
    const datos = { idsection: data.idsection, dessection: data.dessection, active: estado };

    const usuario = sessionStorage.getItem('userid') || 'desconocido';
    const nombreUsuario = sessionStorage.getItem('nombres') || 'desconocido';

    const inicio = Date.now();
    const endpoint = `${environment.apiUrl}qce/SectionQce`;
    const userAgent = navigator.userAgent;

    this.seccionesQceService.update(datos, data.idsection, true).subscribe(
      (respuesta) => {
        const fin = Date.now();
        const tiempoEjecucion = fin - inicio;

        this.tituloAccion = 'Editar';
        this.cargarSeccionesQce();
        this.toastr.success('Estado actualizado', 'Actualización');

        const tipoRespuesta = respuesta?.status === 200 || respuesta?.status === 204 ? 200 : respuesta?.status ?? 200;

        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          Hora: this.dateNowISO,
          Metodo: 'actualización de estado',
          Datos: JSON.stringify(datos),
          DatosAnteriores: JSON.stringify(data),
          // ⬇ Aquí usamos toda la respuesta si body no existe
          Respuesta: respuesta?.body ? JSON.stringify(respuesta.body) : JSON.stringify(respuesta),
          TipoRespuesta: tipoRespuesta,
          userid: usuario,
          usuario: nombreUsuario,
          executionTime: tiempoEjecucion,
          endpoint: endpoint,
          userAgent: userAgent,
          modulo: 'Control Calidad Externo',
          SubModulo: 'Configuración',
          item: 'Secciones'
        };

        this.seccionesQceService.createLogAsync(Loguser);
      },
      (err) => {
        const fin = Date.now();
        const tiempoEjecucion = fin - inicio;

        this.toastr.error('No fue posible actualizar el estado', 'Error');

        const tipoRespuesta = err.status ?? 500;

        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          Hora: this.dateNowISO,
          Metodo: 'actualización de estado',
          Datos: JSON.stringify(datos),
          DatosAnteriores: JSON.stringify(data),
          Respuesta: err.message,
          TipoRespuesta: tipoRespuesta,
          userid: usuario,
          usuario: nombreUsuario,
          executionTime: tiempoEjecucion,
          endpoint: endpoint,
          userAgent: userAgent,
          modulo: 'Control Calidad Externo',
          SubModulo: 'Configuración',
          item: 'Secciones'
        };

        this.seccionesQceService.createLogAsync(Loguser);
      }
    );
  }





  eliminarSeccionQce(id: any) {
    const datosAnteriores = this.obtenerDatosAnteriores(id);

    if (!datosAnteriores) {
      this.toastr.error('No se encontraron los datos anteriores para esta sección');
      return;
    }

    const usuario = sessionStorage.getItem('userid') || 'desconocido';
    const nombreUsuario = sessionStorage.getItem('nombres') || 'desconocido';

    const inicio = Date.now();
    const endpoint = `${environment.apiUrl}qce/SectionQce`;
    const userAgent = navigator.userAgent;

    this.seccionesQceService.delete('sectionQce', id).subscribe({
      next: (respuesta) => {
        const fin = Date.now();
        const tiempoEjecucion = fin - inicio;

        this.cargarSeccionesQce();
        this.toastr.success('Registro eliminado');

        // Verifica si la respuesta es 200 OK o 204 No Content
        const tipoRespuesta = respuesta?.status === 200 || respuesta?.status === 204 ? 200 : respuesta?.status ?? 200;

        // Log de éxito
        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          Hora: this.dateNowISO,
          Metodo: 'eliminación',
          Datos: JSON.stringify(id),
          DatosAnteriores: JSON.stringify(datosAnteriores),
          Respuesta: JSON.stringify(respuesta),
          TipoRespuesta: tipoRespuesta,
          userid: usuario,
          usuario: nombreUsuario,
          executionTime: tiempoEjecucion,
          endpoint: endpoint,
          userAgent: userAgent,
          modulo: 'Control Calidad Externo',
          SubModulo: 'Configuración',
          item: 'Secciones'
        };

        this.seccionesQceService.createLogAsync(Loguser);
      },
      error: (err) => {
        const fin = Date.now();
        const tiempoEjecucion = fin - inicio;

        // Log de error
        const tipoRespuesta = err.status ?? 500;

        const Loguser = {
          fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.dateNowISO,
          metodo: 'eliminación',
          datos: JSON.stringify(id),
          datosanteriores: JSON.stringify(datosAnteriores),
          respuesta: err.message,
          tipoRespuesta: tipoRespuesta,
          userid: usuario,
          usuario: nombreUsuario,
          executionTime: tiempoEjecucion,
          endpoint: endpoint,
          userAgent: userAgent,
          modulo: 'Control Calidad Externo',
          SubModulo: 'Configuración',
          item: 'Secciones'
        };

        this.seccionesQceService.createLogAsync(Loguser);
        this.toastr.error(this.messageError);
      }
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
