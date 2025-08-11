import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SharedService } from '@app/services/shared.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { HttpErrorResponse } from '@angular/common/http';
import { VentanasModalesService } from '@app/services/general/ventanas-modales.service';
import { DatePipe, NgIf, NgClass, NgFor } from '@angular/common';
import { SupplierQceService } from '@app/services/calidad-externo/supplierQce.service';
import { LotesQceService } from '@app/services/calidad-externo/lotsQce.service';
import { ControlMaterialQceService } from '@app/services/calidad-externo/controlMaterialQce.service';
import { LotesQceDetailsService } from '@app/services/calidad-externo/lotsQceDetails.service';
import { ToastrService } from 'ngx-toastr';
import dayjs from 'dayjs';
import { createLog } from '@app/globals/logUser';
import { ImageCdnPipe } from '../../../../../core/pipes/image-cdn.pipe';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TablaComunComponent } from '@app/modules/shared/general-tablas/tabla-comun/tabla-comun.component';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { ModalData } from '@app/Models/Modaldata';
import { ModalGeneralComponent } from '@app/modules/shared/modals/modal-general/modal-general.component';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { LoaderService } from '@app/services/loader/loader.service';

@Component({
  selector: 'app-proveedores',
  templateUrl: './lotes.component.html',
  styleUrls: ['./lotes.component.css'],
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatTableModule, NgxMatSelectSearchModule, MatSortModule, MatSlideToggleModule, MatPaginatorModule, NgIf, FormsModule, ReactiveFormsModule, MatSelectModule, NgClass, MatOptionModule, NgFor, MatTooltipModule, MatDatepickerModule, DatePipe, TranslateModule, ImageCdnPipe, TablaComunComponent]
})
export class LotesComponent implements OnInit {

  dateNow: Date = new Date();
  formulario: FormGroup;
  accionEditar: any;
  accion: any;
  tituloAccion: any;
  vantanaModal: BsModalRef;
  titulo: any;
  desactivar = false;
  text: any;
  textError: any;
  cancelar: any;
  confirmar: any;
  messageError: any;

  today = dayjs().format('YYYY-MM-DD');
  proveedores = [];
  proveedoresActive = [];
  proveedoresActiveCopy = [];
  controlMaterials = [];
  controlMaterialsActive = [];
  controlMaterialsActiveCopy = [];
  lotesActive = [];

  dateNowISO = this.dateNow.toTimeString();
  log = new createLog(this.datePipe, this.translate, this.supplierQceService);

  displayedColumns: string[] = ['Proveedor', 'Material de Control', 'N° Lote', 'Fecha Expedición', 'Estado', 'Editar', 'Eliminar'];
  dataSource: MatTableDataSource<any>;
  dataTableBody: any[] = [];


  filterProveedor = new FormControl('')
  filterMaterialControl = new FormControl('')

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private translate: TranslateService,
    private lotesQceService: LotesQceService,
    private lotesQceDetailsService: LotesQceDetailsService,
    private supplierQceService: SupplierQceService,
    private controlMatetialQceService: ControlMaterialQceService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private modalService: BsModalService,
    private sharedService: SharedService,
    private ventanaService: VentanasModalesService,
    private datePipe: DatePipe,
    private dialog: MatDialog,
    private loaderService: LoaderService
  ) { }



  async ngOnInit(): Promise<void> {
    await this.getLotes();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();
    await this.getProveedores();
    await this.getControlMaterial();
    this.filtros()
  }

  filtros() {
    this.filterProveedor.valueChanges.subscribe(word => {
      if (word) {
        this.proveedoresActive = this.proveedoresActiveCopy.filter((item: any) => {
          return item.dessupplier.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.proveedoresActive = this.proveedoresActiveCopy
      }
    });
    this.filterMaterialControl.valueChanges.subscribe(word => {
      if (word) {
        this.controlMaterialsActive = this.controlMaterialsActiveCopy.filter((item: any) => {
          return item.descontmat.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.controlMaterialsActive = this.controlMaterialsActiveCopy
      }
    });
  }

  async getProveedores() {
    try {
      this.loaderService.show();
      this.loaderService.text.emit({ text: 'Cargando proveedores...' });
      let proveedoresList = await this.supplierQceService.getAllAsync();
      this.proveedores = proveedoresList
      this.proveedoresActive = proveedoresList.filter(e => e.active);
      this.proveedoresActiveCopy = proveedoresList.filter(e => e.active);
      this.loaderService.hide();
    } catch (error) {
      this.loaderService.hide();
    }

  }

  async getControlMaterial() {
    try {
      this.loaderService.show();
      this.loaderService.text.emit({ text: 'Cargando materiales de control...' });
      let materiales = await this.controlMatetialQceService.getAllAsync();
      this.controlMaterials = materiales
      this.controlMaterialsActive = materiales.filter(e => e.active);
      this.controlMaterialsActiveCopy = materiales.filter(e => e.active);

      this.loaderService.hide();
    } catch (error) {
      this.loaderService.hide();
    }
  }

  openModal(descripcion) {
    const data = { descripcion: descripcion, accion: this.accion }
    this.ventanaService.openModal(data);
  }

  async getLotes() {
    try {
      this.loaderService.show();
      this.loaderService.text.emit({ text: 'Cargando lotes...' });
      let lotes = await this.lotesQceDetailsService.getAllAsync()
      const filtrarDataTable: any[] = lotes;
      this.dataTableBody = filtrarDataTable.map(x => {
        return { Proveedor: x.Dessupplier, 'Material de Control': x.Descontmat, 'N° Lote': x.Numlot, 'Fecha Expedición': this.formatDate(new Date(x.Expdate)), Estado: x.Active, item: x, item6: x, item7: x };
      });
      this.dataSource = new MatTableDataSource(lotes);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;

      this.loaderService.hide();
    } catch (error) {
      this.loaderService.hide();
    }

  }

  formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Meses de 0-11
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openModalGestionLotes(templateGestionLotes: TemplateRef<any>, datos: any) {
    this.crearFormularioGestionLotes(datos);
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
      content: templateGestionLotes,
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
      this.crearEditarGestionLotes();
      dialogRef.close();
    });
  }

  get idsupplierNoValido() {
    return this.formulario.get('idsupplier');
  }

  get idControlMaterialNoValido() {
    return this.formulario.get('idControlMaterial');
  }

  get numlotNoValido() {
    return this.formulario.get('numlot');
  }

  get expdateNoValido() {
    return this.formulario.get('expdate');
  }

  crearFormularioGestionLotes(datos: any) {
    this.formulario = this.fb.group({
      idLot: [datos.IdLot ? datos.IdLot : ''],
      idsupplier: [datos.Idsupplier ? datos.Idsupplier : '', [Validators.required]],
      idControlMaterial: [datos.IdControlMaterial ? datos.IdControlMaterial : '', [Validators.required]],
      numlot: [datos.Numlot ? datos.Numlot : '', [Validators.required, Validators.min(1)]],
      expdate: [datos.Expdate ? dayjs(datos.Expdate).format() : '', [Validators.required]],
      active: [datos.Active ? datos.Active : false],
    });
  }

  crearEditarGestionLotes() {
    if (this.formulario.valid) {
      let idsupplier: number = parseInt(this.formulario.get('idsupplier').value);
      let idControlMaterial: number = parseInt(this.formulario.get('idControlMaterial').value);
      const data = {
        idLot: this.formulario.get('idLot').value,
        idsupplier: idsupplier,
        idControlMaterial: idControlMaterial,
        numlot: this.formulario.get('numlot').value,
        expdate: this.formulario.get('expdate').value,
        active: this.formulario.get('active').value,
      }

      if (this.accion === 'Crear') {
        this.desactivar = true;
        this.lotesQceService.create(data).subscribe(respuesta => {

          this.getLotes();
          this.toastr.success('Registro creado');
          this.desactivar = false;
          this.log.logObj('Control Calidad Externo', 'Configuración', 'Lotes', 'c', data, JSON.stringify(respuesta), 200);
        }, (error) => {
          this.log.logObj('Control Calidad Externo', 'Configuración', 'Lotes', 'c', data, error.message, error.status);
        });
      } else {
        this.lotesQceService.update(data, data.idLot).subscribe(respuesta => {

          this.getLotes();
          this.toastr.success('Registro actualizado');
          this.log.logObj('Control Calidad Externo', 'Configuración', 'Lotes', 'a', data, JSON.stringify(respuesta), 200);
        }, (error) => {
          this.log.logObj('Control Calidad Externo', 'Configuración', 'Lotes', 'a', data, error.message, error.status);
        });
      }
    }
  }

  actualizarEstadoGestionLotes(datosGestion) {
    const [data, estado] = datosGestion;
    //const estado = datosGestion.Active ? false : true;
    const datos = { idLot: data.IdLot, idsupplier: data.Idsupplier, idControlMaterial: data.IdControlMaterial, numlot: data.Numlot, expdate: data.Expdate, active: estado }
    this.lotesQceService.update(datos, data.IdLot).subscribe(respuesta => {
      this.getLotes();
      this.accion = 'Editar';
      this.toastr.success('Estado actualizado', 'Actualización');
    }, err => {
      this.toastr.error('No fue posible actualizar el estado', 'Error')
    });
  }

  eliminarGestionLotes(id: any) {
    this.lotesQceService.delete('Lotes', id).subscribe({
      next: (respuesta) => {
        this.getLotes();
        this.accion = '';
        this.toastr.success('Registro eliminado');
        this.log.logObj('Control Calidad Externo', 'Configuración', 'Lotes', 'e', id, JSON.stringify(respuesta), 200);

      }, error: (error) => {
        this.log.logObj('Control Calidad Externo', 'Configuración', 'Lotes', 'e', id, error.message, error.status);
        this.toastr.error(this.messageError);
      }
    })

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
