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
import { DatePipe, NgIf, NgClass } from '@angular/common';
import { ProgramaQceService } from '@app/services/calidad-externo/programaQce.service';
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

@Component({
  selector: 'app-proveedores',
  templateUrl: './crear-programa.component.html',
  styleUrls: ['./crear-programa.component.css'],
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatTableModule, MatSortModule, MatSlideToggleModule, MatPaginatorModule, NgIf, FormsModule, ReactiveFormsModule, NgClass, TranslateModule, ImageCdnPipe, TablaComunComponent]
})
export class CrearProgramaComponent implements OnInit {

  dateNow: Date = new Date();
  formulario: FormGroup;
  accionEditar: any;
  accion: any;
  tituloAccion: any;
  vantanaModal: BsModalRef;
  titulo: any;
  text: any;
  textError: any;
  cancelar: any;
  desactivar = false;
  confirmar: any;
  messageError: any;
  dateNowISO = this.dateNow.toTimeString();

  constructor(

    private translate: TranslateService,
    private programQceService: ProgramaQceService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private modalService: BsModalService,
    private sharedService: SharedService,
    private ventanaService: VentanasModalesService,
    private datePipe: DatePipe,
    private dialog: MatDialog

  ) { }

  displayedColumns: string[] = ['Programa', 'Estado', 'Editar', 'Eliminar'];
  dataSource: MatTableDataSource<any>;
  dataTableBody: any[] = [];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  ngOnInit(): void {

    this.getProgramas();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();

  }

  openModal(descripcion) {
    const data = { descripcion: descripcion, accion: this.accion }
    this.ventanaService.openModal(data);
  }

  getProgramas() {

    this.programQceService.getAllAsync().then(respuesta => {
      const filtrarDataTable: any[] = respuesta;
      this.dataTableBody = filtrarDataTable.map(x => {
        return { Programa: x.desprogram, Estado: x.active, item: x, item3: x, item4: x };
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

  openModalGestionProgramas(templateGestionProgramas: TemplateRef<any>, datos: any) {
    this.crearFormularioGestionProgramas(datos);
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
      content: templateGestionProgramas,
      btn: this.accionEditar ? 'Actualizar' : 'Guardar',
      btn2: 'Cerrar',
      footer: true,
      title: this.accion,
      image: this.accionEditar ? 'assets/rutas/iconos/editar.png' : 'assets/rutas/iconos/editar.png',
    };
    const dialogRef = this.dialog.open(ModalGeneralComponent, { height: 'auto', width: '40em', data, disableClose: true });

    dialogRef.componentInstance.primaryEvent?.pipe(takeUntil(destroy$)).subscribe(x => {
      if (this.formulario.invalid) {
        this.formulario.markAllAsTouched();
        return
      }
      this.crearEditarGestionProgramas();
      dialogRef.close();
    });

  }

  get desprogramNoValido() {
    return this.formulario.get('desprogram');
  }

  crearFormularioGestionProgramas(datos: any) {

    this.formulario = this.fb.group({

      idProgram: [datos.idProgram ? datos.idProgram : ''],
      desprogram: [datos.desprogram ? datos.desprogram : '', [Validators.required, Validators.minLength(2)]],
      active: [datos.active ? datos.active : false]

    });

  }

  crearEditarGestionProgramas() {

    if (!this.formulario.invalid) {

      if (this.accion === 'Crear') {

        this.desactivar = true;
        this.programQceService.create(this.formulario.value).subscribe(respuesta => {

          this.getProgramas();
          this.toastr.success('Registro creado');
          this.desactivar = false;

          const Loguser = {

            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            Hora: this.dateNowISO,
            Metodo: 'creación',
            Datos: JSON.stringify(this.formulario.value),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: status

          }

          this.programQceService.createLogAsync(Loguser).then(respuesta => { });

        }, (error) => {

          this.toastr.error(this.translate.instant(error.error));
          this.desactivar = false;

          const Loguser = {

            fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.dateNowISO,
            metodo: 'creación',
            datos: JSON.stringify(this.formulario.value),
            respuesta: error.message,
            tipoRespuesta: error.status

          }

          this.programQceService.createLogAsync(Loguser).then(respuesta => { });

        });

      } else {

        this.programQceService.update(this.formulario.value, this.formulario.value.idProgram).subscribe(respuesta => {
          this.getProgramas();
          this.toastr.success('Registro actualizado');

          const Loguser = {

            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            Hora: this.dateNowISO,
            Metodo: 'actualización',
            Datos: JSON.stringify(this.formulario.value),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: status

          }

          this.programQceService.createLogAsync(Loguser).then(respuesta => { });

        }, (error) => {

          const Loguser = {

            fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.dateNowISO,
            metodo: 'actualización',
            datos: JSON.stringify(this.formulario.value),
            respuesta: error.message,
            tipoRespuesta: error.status
          }

          this.programQceService.createLogAsync(Loguser).then(respuesta => { });

        });

      }

    }

  }

  actualizarEstadoGestionProgramas(datosGestion) {

    const [data, estado] = datosGestion;
    const datos = { idProgram: data.idProgram, desprogram: data.desprogram, active: estado }

    this.programQceService.update(datos, data.idProgram).subscribe(respuesta => {
      this.getProgramas();
      this.toastr.success('Estado actualizado', 'Actualización');
    }, err => {
      this.toastr.error('No fue posible actualizar el estado', 'Error')
    });

  }

  eliminarGestionProgramas(id: any) {

    this.programQceService.delete('Programas', id).subscribe({
      next: (respuesta) => {
        this.getProgramas();
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

        this.programQceService.createLogAsync(Loguser).then(respuesta => { });
      }, error :(err) => {
        this.toastr.error(this.messageError);

        const Loguser = {

          fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.dateNowISO,
          metodo: 'eliminación',
          datos: JSON.stringify(id),
          respuesta: err.message,
          tipoRespuesta: err.status

        }

        this.programQceService.createLogAsync(Loguser).then(respuesta => { });
      }

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

