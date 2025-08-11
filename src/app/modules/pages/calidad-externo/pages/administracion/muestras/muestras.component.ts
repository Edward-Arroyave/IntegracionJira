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
import { DatePipe, NgIf, NgFor, AsyncPipe } from '@angular/common';
import { LotesQceService } from '@app/services/calidad-externo/lotsQce.service';
import { SampleQceService } from '@app/services/calidad-externo/SampleQce.service';
import { SampleQceDetailsService } from '@app/services/calidad-externo/SampleQceDetails.service';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject } from 'rxjs';
import { map, startWith, takeUntil } from 'rxjs/operators';
import { createLog } from "../../../../../../globals/logUser";
import { ImageCdnPipe } from '../../../../../core/pipes/image-cdn.pipe';
import { MatOptionModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TablaComunComponent } from '@app/modules/shared/general-tablas/tabla-comun/tabla-comun.component';
import { LoaderService } from '@app/services/loader/loader.service';
import { MatDialog } from '@angular/material/dialog';
import { ModalGeneralComponent } from '@app/modules/shared/modals/modal-general/modal-general.component';
import { ModalData } from '@app/Models/Modaldata';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'app-proveedores',
  templateUrl: './muestras.component.html',
  styleUrls: ['./muestras.component.css'],
  standalone: true,
  imports: [MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatSortModule,
    MatSlideToggleModule,
    MatPaginatorModule,
    NgIf, FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    NgFor,
    MatOptionModule,
    AsyncPipe,
    TranslateModule,
    ImageCdnPipe,
    TablaComunComponent,
    NgxMatSelectSearchModule,
    MatSelectModule,
    MatTooltip
  ]
})

export class MuestrasComponent implements OnInit {
  log = new createLog(this.datePipe, this.translate, this.sampleQceService);

  fechaActual = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
  dateNow: Date = new Date();
  formulario: FormGroup;
  accionEditar: any;
  accion: any;
  tituloAccion: any;
  vantanaModal: BsModalRef;
  titulo: any;
  text: any;
  desactivar = false;
  textError: any;
  cancelar: any;
  confirmar: any;
  messageError: any;

  //predictivo edit
  idlotpr: number;
  deslotpr: any;
  listalotpre: any;
  formularioEdit: FormGroup = this.fb.group({
    idSample: [],
    idLot: [, [Validators.required]],
    serialsample: [, [Validators.required]],
    active: []

  });

  lotes = [];
  lotesActive = [];
  lotesActiveCopy = [];
  filterLote = new FormControl('')

  dateNowISO = this.dateNow.toTimeString();

  constructor(

    private translate: TranslateService,
    private lotesQceService: LotesQceService,
    private sampleQceDetailsService: SampleQceDetailsService,
    private sampleQceService: SampleQceService,
    private fb: FormBuilder,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private sharedService: SharedService,
    private ventanaService: VentanasModalesService,
    private datePipe: DatePipe,
    private dialog: MatDialog,
    private loaderService: LoaderService

  ) { }

  displayedColumns: string[] = ['N° Muestra', 'N° Lote', 'Estado', 'Editar', 'Eliminar'];
  dataSource: MatTableDataSource<any>;
  dataTableBody: any[] = [];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  async ngOnInit(): Promise<void> {

    await this.getMuestras();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();
    await this.getLotes();
    this.filtros();

  }

  filtros() {
    this.filterLote.valueChanges.subscribe(word => {
      if (word) {
        this.lotesActive = this.lotesActiveCopy.filter((item: any) => {
          return item.numlot.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.lotesActive = this.lotesActiveCopy
      }
    });
  }


  async getLotes() {
    try {
      this.loaderService.show()
      this.loaderService.text.emit({ text: 'Cargando lotes....' })
      this.lotes = await this.lotesQceService.getAllAsync();
      this.lotesActive = this.lotes.filter(e => e.active);
      this.lotesActiveCopy = this.lotes.filter(e => e.active);
      this.loaderService.hide()
    } catch (error) {
      this.loaderService.hide()
    }

  }

  openModal(descripcion) {
    const data = { descripcion: descripcion, accion: this.accion }
    this.ventanaService.openModal(data);
  }

  async getMuestras() {
    try {
      this.loaderService.show()
      this.loaderService.text.emit({ text: 'Cargando muestras....' })
      let respuesta = await this.sampleQceDetailsService.getAllAsync()
      this.loaderService.hide()
      const filtrarDataTable: any[] = respuesta;
      this.dataTableBody = filtrarDataTable.map(x => {
        return { 'N° Muestra': x.Serialsample, 'N° Lote': x.Numlot, Estado: x.Active, item: x, item4: x, item5: x };
      });

      let muestras = respuesta;

      this.dataSource = new MatTableDataSource(muestras);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    } catch (error) {
      this.loaderService.hide()
    }



  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  async openModalGestionMuestras(templateGestionMuestras: TemplateRef<any>, datos: any) {

    this.crearFormularioGestionMuestras(datos);

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
      content: templateGestionMuestras,
      btn: this.accionEditar ? 'Actualizar' : 'Guardar',
      btn2: 'Cerrar',
      footer: true,
      title: this.accion,
      image: this.accionEditar ? 'assets/rutas/iconos/editar.png' : 'assets/rutas/iconos/editar.png',
    };
    const dialogRef = this.dialog.open(ModalGeneralComponent, { height: 'auto', width: '40em', data, disableClose: true });

    dialogRef.componentInstance.primaryEvent?.pipe(takeUntil(destroy$)).subscribe(async x => {
      if (this.formulario.invalid) {
        this.formulario.markAllAsTouched();
        return
      }
      await this.crearEditarGestionMuestras();
      dialogRef.close();
    });

    return


  }

  crearFormularioGestionMuestras(datos: any) {

    this.formulario = this.fb.group({

      idSample: [datos.IdSample ? datos.IdSample : ''],
      idLot: [datos.IdLot ? datos.IdLot : '', [Validators.required]],
      serialsample: [datos.Serialsample ? datos.Serialsample : '', [Validators.required, Validators.minLength(2)]],
      active: [datos.Active ? datos.Active : false]

    });

  }

  async crearEditarGestionMuestras() {

    let nuevaData = this.formulario.value;


    if (!this.formulario.invalid) {

      if (this.accion === 'Crear') {
        try {
          this.loaderService.show()
          this.loaderService.text.emit({ text: 'Guardando registro...' })
          let respuesta = await this.sampleQceService.create(nuevaData).toPromise();
          this.loaderService.hide()
          this.getMuestras();
          this.toastr.success('Registro creado');
          this.desactivar = false;
          this.log.logObj('Control Calidad Externo', 'Administración', 'Muestras', 'c', nuevaData, JSON.stringify(respuesta), 200);
        } catch (error) {
          this.loaderService.hide()
          this.toastr.error(this.translate.instant(error.error));
          this.desactivar = false;
          this.log.logObj('Control Calidad Externo', 'Administración', 'Muestras', 'c', nuevaData, error.message, error.status);
        }

      } else {

        try {
          this.loaderService.show()
          this.loaderService.text.emit({ text: 'Guardando registro...' })
          let respuesta = await this.sampleQceService.update(nuevaData, nuevaData.idSample).toPromise();
          this.loaderService.hide()
          this.getMuestras();
          this.toastr.success('Registro actualizado');
          this.log.logObj('Control Calidad Externo', 'Administración', 'Muestras', 'a', nuevaData, JSON.stringify(respuesta), 200);
        } catch (error) {
          this.loaderService.hide()
          this.log.logObj('Control Calidad Externo', 'Administración', 'Muestras', 'a', nuevaData, error.message, error.status);
        }



      }
    }
  }



  actualizarEstadoGestionMuestras(datosGestion) {

    const [data, estado] = datosGestion;
    const datos = { idSample: data.IdSample, idLot: data.IdLot, serialsample: data.Serialsample, active: estado }
    this.loaderService.show()
    this.sampleQceService.update(datos, data.IdSample).subscribe(respuesta => {
      this.loaderService.hide()
      this.getMuestras();
      this.accion = 'Editar';
      this.toastr.success('Estado actualizado', 'Actualización')
    }, err => {
      this.loaderService.hide()
      this.toastr.error('No fue posible actualizar el estado', 'Error')
    });

  }

  eliminarGestionMuestras(row: any) {
    this.sampleQceService.delete('Muestras', row.IdSample).subscribe({

      next: (respuesta) => {
        this.getMuestras();
        this.accion = '';
        this.toastr.success('Registro eliminado');
        this.log.logObj('Control Calidad Externo', 'Administración', 'Rondas', 'e', row, JSON.stringify(respuesta), 200);
      }, error: (error) => {
        this.toastr.error(this.messageError);
        this.log.logObj('Control Calidad Externo', 'Administración', 'Rondas', 'e', row, this.messageError, error.status);

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

