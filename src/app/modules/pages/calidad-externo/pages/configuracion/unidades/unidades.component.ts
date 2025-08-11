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
import { UnitsQceService } from '@app/services/calidad-externo/unitsQce.service';
import { ToastrService } from 'ngx-toastr';
import { createLog } from '@app/globals/logUser';
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
  templateUrl: './unidades.component.html',
  styleUrls: ['./unidades.component.css'],
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatTableModule, MatSortModule, MatSlideToggleModule, MatPaginatorModule, NgIf, FormsModule, ReactiveFormsModule, NgClass, TranslateModule, ImageCdnPipe, TablaComunComponent]
})
export class UnidadesComponent implements OnInit {

  dateNow: Date = new Date();
  formulario: FormGroup;
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

  dateNowISO = this.dateNow.toTimeString();
  log = new createLog(this.datePipe, this.translate, this.unitsQceService);

  constructor(

    private translate: TranslateService,
    private unitsQceService: UnitsQceService,
    private fb: FormBuilder,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private sharedService: SharedService,
    private ventanaService: VentanasModalesService,
    private datePipe: DatePipe,
    private dialog: MatDialog

  ) { }

  displayedColumns: string[] = ['Unidad', 'Estado', 'Editar', 'Eliminar'];
  dataSource: MatTableDataSource<any>;
  dataTableBody: any[] = [];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  ngOnInit(): void {
    this.getUnits();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();
  }

  openModal(descripcion) {
    const data = { descripcion: descripcion, accion: this.accion }
    this.ventanaService.openModal(data);
  }

  getUnits() {
    this.unitsQceService.getAllAsync().then(respuesta => {
      const filtrarDataTable: any[] = respuesta;
      this.dataTableBody = filtrarDataTable.map(x => {
        return { Unidad: x.codunits, Estado: x.active, item: x, item3: x, item4: x };
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

  openModalGestionUnidades(templateUMedica: TemplateRef<any>, datos: any) {
    this.crearFormularioGestionUnidades(datos);
    // this.vantanaModal = this.modalService.show(templateGestionUnidades,{backdrop: 'static', keyboard: false });
    // datos ? this.accionEditar = true : this.accionEditar = false;
    // datos ? this.accion = "Editar" : this.accion = "Crear";
    // datos ? this.translate.get('MODULES.UNIDADES.FORMULARIO.EDITAR').subscribe(respuesta => this.tituloAccion = respuesta) : this.translate.get('MODULES.UNIDADES.FORMULARIO.CREAR').subscribe(respuesta => this.tituloAccion = respuesta);
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
      content: templateUMedica,
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
      this.crearEditarGestionUnidades();
      dialogRef.close();
    });
  }

  get codunitsNoValido() {
    return this.formulario.get('codunits');
  }

  crearFormularioGestionUnidades(datos: any) {
    this.formulario = this.fb.group({
      idunits: [datos.idunits ? datos.idunits : ''],
      codunits: [datos.codunits ? datos.codunits : '', [Validators.required]],
      active: [datos.active ? datos.active : false]
    });
  }

  crearEditarGestionUnidades() {

    if (!this.formulario.invalid) {
      if (this.accion === 'Crear') {
        this.desactivar = true;
        this.unitsQceService.create(this.formulario.value).subscribe(respuesta => {

          this.getUnits();
          this.toastr.success('Registro creado');
          this.desactivar = false;
          this.log.logObj('Control Calidad Externo', 'Configuración', 'Unidades', 'c', this.formulario.value, JSON.stringify(respuesta), 200);
        }, (err) => {
          this.toastr.error(this.translate.instant(err.error));
          this.desactivar = false;
          this.log.logObj('Control Calidad Externo', 'Configuración', 'Unidades', 'c', this.formulario.value, err.message, err.status);
        });
      } else {
        this.unitsQceService.update(this.formulario.value, this.formulario.value.idunits).subscribe(respuesta => {

          this.getUnits();
          this.toastr.success('Registro actualizado');
          this.log.logObj('Control Calidad Externo', 'Configuración', 'Unidades', 'a', this.formulario.value, JSON.stringify(respuesta), 200);
        }, (err) => {
          this.log.logObj('Control Calidad Externo', 'Configuración', 'Unidades', 'a', this.formulario.value, err.message, err.status);
        });
      }
    }
  }

  actualizarEstadoGestionUnidades(datosGestion) {
    const [data, estado] = datosGestion;
    const datos = { idunits: data.idunits, codunits: data.codunits, active: estado }
    this.unitsQceService.update(datos, data.idunits).subscribe(respuesta => {
      this.getUnits();
      this.accion = 'Editar';
      this.toastr.success('Estado actualizado', 'Actualización');
    }, e => {
      this.toastr.error('No fue posible actualizar el estado', 'Error')
    });
  }

  eliminarGestionUnidades(id: any) {
    this.unitsQceService.delete('Unidades', id).subscribe({

      next: (respuesta) => {
        this.getUnits();
        this.accion = '';
        this.toastr.success('Registro eliminado');
        this.log.logObj('Control Calidad Externo', 'Configuración', 'Unidades', 'e', id, JSON.stringify(respuesta), 200);
      }, error :(err) => {
        this.log.logObj('Control Calidad Externo', 'Configuración', 'Unidades', 'e', id, err.message, err.status);
        this.toastr.error(this.messageError);
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

