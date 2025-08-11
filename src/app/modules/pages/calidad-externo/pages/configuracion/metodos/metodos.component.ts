import { DatePipe, NgIf, NgClass } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { TemplateRef } from '@angular/core';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { createLog } from '@app/globals/logUser';
import { MetodosQceService } from '@app/services/configuracion/metodos-qce.service';
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
import { Subject, takeUntil } from 'rxjs';
import { ModalData } from '@app/Models/Modaldata';
import { ModalGeneralComponent } from '@app/modules/shared/modals/modal-general/modal-general.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-metodos',
  templateUrl: './metodos.component.html',
  styleUrls: ['./metodos.component.css'],
  providers: [DatePipe],
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatTableModule, MatSortModule, MatSlideToggleModule, MatPaginatorModule, NgIf, FormsModule, ReactiveFormsModule, NgClass, TranslateModule, ImageCdnPipe, TablaComunComponent]
})
export class MetodosComponent implements OnInit {
  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();
  ventanaModal: BsModalRef;
  formaRegistroMetodoQce: FormGroup;
  accionEditar: any;
  tituloAccion: any;
  desactivar = false;
  accion: any;
  image: string;
  messageError: string;
  listaSections: [];
  displayedColumns: string[] = ['Método', 'Estado', 'Editar', 'Eliminar'];
  dataSource: MatTableDataSource<any>;
  dataTableBody: any[] = [];


  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  log = new createLog(this.datePipe, this.translate, this.metodosQceService);

  constructor(
    private metodosQceService: MetodosQceService,
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
    this.cargarMetodosQce();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();
  }
  cargarMetodosQce() {
    this.metodosQceService.getAllAsync().then(respuesta => {
      const filtrarDataTable: any[] = respuesta;
      this.dataTableBody = filtrarDataTable.map(x => {
        return { Método: x.desmethods, Estado: x.active, item: x, item3: x, item4: x };
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
  openModalRegistroMetodoQce(templateRegistroMetodoQce: TemplateRef<any>, datos: any) {

    this.crearFormularioRegistroMetodoQce(datos);
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
      content: templateRegistroMetodoQce,
      btn: this.accionEditar ? 'Actualizar' : 'Guardar',
      btn2: 'Cerrar',
      footer: true,
      title: this.accion,
      image: this.accionEditar ? 'assets/rutas/iconos/editar.png' : 'assets/rutas/iconos/editar.png',
    };
    const dialogRef = this.dialog.open(ModalGeneralComponent, { height: 'auto', width: '40em', data, disableClose: true });

    dialogRef.componentInstance.primaryEvent?.pipe(takeUntil(destroy$)).subscribe(x => {
      if (this.formaRegistroMetodoQce.invalid) {
        this.formaRegistroMetodoQce.markAllAsTouched();
        return
      }
      this.crearEditarMetodoQce();
      dialogRef.close();
    });
  }
  crearFormularioRegistroMetodoQce(datos: any) {
    this.formaRegistroMetodoQce = this.fb.group({
      idmethods: [datos.idmethods ? datos.idmethods : ''],
      desmethods: [datos.desmethods ? datos.desmethods : '', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      active: [datos.active ? datos.active : false],
    });
  }
  get desNoValido() {
    return this.formaRegistroMetodoQce.get('desmethods');
  }

  crearEditarMetodoQce() {
    if (!this.formaRegistroMetodoQce.invalid) {
      if (this.accion === 'Crear') {
        this.desactivar = true;
        this.metodosQceService.create(this.formaRegistroMetodoQce.value).subscribe(respuesta => {
          this.cargarMetodosQce();
          this.toastr.success('Registro creado');
          this.desactivar = false;
          this.log.logObj('Control Calidad Externo', 'Configuración', 'Métodos', 'c', this.formaRegistroMetodoQce.value, JSON.stringify(respuesta), 200);
        }, (err) => {
          this.toastr.error(this.translate.instant(err.error));
          this.desactivar = false;
          this.log.logObj('Control Calidad Externo', 'Configuración', 'Métodos', 'c', this.formaRegistroMetodoQce.value, err.message, err.status);
        });
      } else {
        this.metodosQceService.update(this.formaRegistroMetodoQce.value, this.formaRegistroMetodoQce.value.idmethods).subscribe(respuesta => {


          this.cargarMetodosQce();
          this.toastr.success('Registro actualizado');
          this.log.logObj('Control Calidad Externo', 'Configuración', 'Métodos', 'a', this.formaRegistroMetodoQce.value, JSON.stringify(respuesta), 200);
        }, (err) => {
          this.log.logObj('Control Calidad Externo', 'Configuración', 'Métodos', 'a', this.formaRegistroMetodoQce.value, err.message, err.status);
        });
      }
    }
  }
  actualizarEstadoMetodoQce(datosMetodoQce) {
    const [data, estado] = datosMetodoQce;

    const datos = { idmethods: data.idmethods, desmethods: data.desmethods, active: estado };
    this.metodosQceService.update(datos, data.idmethods).subscribe(respuesta => {
      this.tituloAccion = 'Editar';
      this.cargarMetodosQce();
      this.toastr.success('Estado actualizado', 'Actualización');
    }, err => {
      this.toastr.error('No fue posible actualizar el estado', 'Error')
    });
  }

  eliminarMetodoQce(id: any) {
    this.metodosQceService.delete('methodsQce', id).subscribe({
      next: (respuesta) => {
        this.cargarMetodosQce();
        this.tituloAccion = '';
        this.toastr.success('Registro eliminado');
        this.log.logObj('Control Calidad Externo', 'Configuración', 'Métodos', 'e', id, JSON.stringify(respuesta), 200);
      }, error :(err) => {
        this.log.logObj('Control Calidad Externo', 'Configuración', 'Métodos', 'e', id, err.message, err.status);
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
