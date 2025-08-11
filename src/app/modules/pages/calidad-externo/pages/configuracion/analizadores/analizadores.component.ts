import { DatePipe, NgIf, NgClass } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { createLog } from '@app/globals/logUser';
import { AnalyzerQceService } from '@app/services/calidad-externo/AnalyzerQce.service';
import { VentanasModalesService } from '@app/services/general/ventanas-modales.service';
import { SharedService } from '@app/services/shared.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { ImageCdnPipe } from '../../../../../core/pipes/image-cdn.pipe';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog } from '@angular/material/dialog';
import { TablaComunComponent } from '@app/modules/shared/general-tablas/tabla-comun/tabla-comun.component';
import { Subject, takeUntil } from 'rxjs';
import { ModalData } from '@app/Models/Modaldata';
import { ModalGeneralComponent } from '@app/modules/shared/modals/modal-general/modal-general.component';

@Component({
    selector: 'app-analizadores',
    templateUrl: './analizadores.component.html',
    styleUrls: ['./analizadores.component.css'],
    providers: [DatePipe],
    standalone: true,
    imports: [
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
        TablaComunComponent
    ],
})
export class AnalizadoresComponent implements OnInit {
  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();
  ventanaModal: BsModalRef;
  formaRegistroAnalizador: FormGroup;
  accionEditar: any;
  tituloAccion: any;
  accion: any;
  desactivar = false;
  image: string;
  messageError: string;
  displayedColumns: string[] = ['Analizador', 'Estado', 'Editar', 'Eliminar'];
  dataSource: MatTableDataSource<any>;
  dataTableBody: any[] = [];
  log = new createLog(this.datePipe,this.translate,this.analizadoresqceService);

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  constructor(
    private analizadoresqceService: AnalyzerQceService,
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
    this.cargarAnalizadores();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();
  }

  cargarAnalizadores() {
    this.analizadoresqceService.getAllAsync().then(respuesta => {
      const filtrarDataTable: any[] = respuesta;
      this.dataTableBody = filtrarDataTable.map(x => {
        return { Analizador: x.nameAnalyzer, Estado: x.active, item: x, item3: x, item4: x };
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
  openModalRegistroAnalizador(templateRegistroAnalizador: TemplateRef<any>, datos: any) {

    this.crearFormularioRegistroCliente(datos);
    // this.ventanaModal = this.modalService.show(templateRegistroAnalizador,{backdrop: 'static', keyboard: false });
    // this.ventanaModal.setClass('modal-md');
    // this.accionEditar = !!datos;
    // datos ? this.translate.get('MODULES.ANALIZADORES.FORMULARIO.ACTUALIZAR').subscribe(respuesta => this.tituloAccion = respuesta) : this.translate.get('MODULES.ANALIZADORES.FORMULARIO.REGISTRAR').subscribe(respuesta => this.tituloAccion = respuesta);
    if (datos) {
      this.accionEditar = true;
      this.accion = "Editar";
    } else {
      this.accionEditar = false;
      this.accion = "Crear";
    }
    type NewType = Subject<boolean>;

    const destroy$: NewType = new Subject<boolean>();
    /* Variables recibidas por el modal */
    const data: ModalData = {
      content: templateRegistroAnalizador,
      btn: this.accionEditar ? 'Actualizar' : 'Guardar',
      btn2: 'Cerrar',
      footer: true,
      title: this.accion,
      image: this.accionEditar ? 'assets/rutas/iconos/editar.png' : 'assets/rutas/iconos/editar.png',
    };
    const dialogRef = this.dialog.open(ModalGeneralComponent, { height: 'auto', width: '40em', data, disableClose: true });

    dialogRef.componentInstance.primaryEvent?.pipe(takeUntil(destroy$)).subscribe(x => {
      if (this.formaRegistroAnalizador.invalid) {
        this.formaRegistroAnalizador.markAllAsTouched();
        return
      }
      this.crearEditarAnalizador();
      dialogRef.close();
    });

  }
  crearFormularioRegistroCliente(datos: any) {

    this.formaRegistroAnalizador = this.fb.group({

      idAnalyzer: [datos.idAnalyzer ? datos.idAnalyzer : ''],
      nameAnalyzer: [datos.nameAnalyzer ? datos.nameAnalyzer : '', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      active: [datos.active ? datos.active : false],

    });

  }

  get nameNoValido() {
    return this.formaRegistroAnalizador.get('nameAnalyzer');
  }

  crearEditarAnalizador() {
    if (!this.formaRegistroAnalizador.invalid) {

      if (this.accion === 'Crear') {

        this.desactivar = true;
        this.analizadoresqceService.create(this.formaRegistroAnalizador.value).subscribe(respuesta => {


          this.cargarAnalizadores();
          this.toastr.success('Registro creado');
          this.desactivar = false;
          this.log.logObj('Control Calidad Externo','Configuración','Analizadores','c',this.formaRegistroAnalizador.value,JSON.stringify(respuesta),200);
        }, (error) => {
          this.log.logObj('Control Calidad Externo','Configuración','Analizadores','c',this.formaRegistroAnalizador.value,error.message,error.status);
        });
      } else {
        this.analizadoresqceService.update(this.formaRegistroAnalizador.value, this.formaRegistroAnalizador.value.idAnalyzer).subscribe(respuesta => {

          this.cargarAnalizadores();
          this.toastr.success('Registro actualizado');
          this.log.logObj('Control Calidad Externo','Configuración','Analizadores','a',this.formaRegistroAnalizador.value,JSON.stringify(respuesta),200);
        }, (error) => {
          this.log.logObj('Control Calidad Externo','Configuración','Analizadores','a',this.formaRegistroAnalizador.value,error.message,error.status);
        });
      }
    }
  }
  actualizarEstadoAnalizador(datosAnalizador) {
    const [data,estado ] = datosAnalizador;

    const datos = { idAnalyzer: data.idAnalyzer, nameAnalyzer: data.nameAnalyzer, model: data.model, marker: data.marker, active: estado };
    this.analizadoresqceService.update(datos, data.idAnalyzer).subscribe(respuesta => {
      this.tituloAccion = 'Editar';
      this.cargarAnalizadores();
      this.toastr.success('Estado actualizado','Actualización');
    },err =>{
      this.toastr.error('No fue posible actualizar el estado', 'Error')
    });
  }

  eliminarAnalizador(id: any) {
    this.analizadoresqceService.delete('analyzerQce', id).subscribe({
      next: (respuesta) => {
        this.cargarAnalizadores();
        this.tituloAccion = '';
        this.toastr.success('Registro eliminado');
        this.log.logObj('Control Calidad Externo','Configuración','Analizadores','e',id,JSON.stringify(respuesta),200);
      }, error :(err) => {
        this.log.logObj('Control Calidad Externo','Configuración','Analizadores','e',id,err.message,err.status);
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
