import { DatePipe, NgIf, NgClass, LowerCasePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { TemplateRef } from '@angular/core';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { DiccionarioResultadosQceService } from '@app/services/calidad-externo/diccionarioResultadosQce.service';
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
import { LoaderService } from '@app/services/loader/loader.service';
import { Subject, takeUntil } from 'rxjs';
import { ModalData } from '@app/Models/Modaldata';
import { ModalGeneralComponent } from '@app/modules/shared/modals/modal-general/modal-general.component';

@Component({
  selector: 'app-diccionario-resultados-qce',
  templateUrl: './diccionario-resultados-qce.component.html',
  styleUrls: ['./diccionario-resultados-qce.component.css'],
  providers: [DatePipe],
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatTableModule, MatSortModule, MatSlideToggleModule, MatPaginatorModule, NgIf, FormsModule, ReactiveFormsModule, NgClass, LowerCasePipe, TranslateModule, ImageCdnPipe, TablaComunComponent]
})
export class DiccionarioResultadosQceComponent implements OnInit {
  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();
  ventanaModal: BsModalRef;
  formaRegistroDiccionario: FormGroup;
  accionEditar: any;
  tituloAccion: any;
  accion: any;
  desactivar = false;
  messageError: string;
  listaSections: [];
  displayedColumns: string[] = ['Resultado', 'Estado', 'Editar', 'Eliminar'];
  dataSource: MatTableDataSource<any>;
  dataTableBody: any[] = [];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private diccionarioResultadosQceService: DiccionarioResultadosQceService,
    private modalService: BsModalService,
    private translate: TranslateService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private ventanaService: VentanasModalesService,
    private datePipe: DatePipe,
    private sharedService: SharedService,
    private dialog: MatDialog,
    private loaderService: LoaderService

  ) { }

  ngOnInit(): void {
    this.cargarDiccionarioQce();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal()
  }
  cargarDiccionarioQce() {
    this.loaderService.show()
    this.diccionarioResultadosQceService.getAllAsync().then(respuesta => {
      const filtrarDataTable: any[] = respuesta;
      this.dataTableBody = filtrarDataTable.map(x => {
        return { Resultado: x.desresults, Estado: x.active, item: x, item3: x, item4: x };
      });
      this.dataSource = new MatTableDataSource(respuesta);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }).finally(() => {
      this.loaderService.hide(); // Oculta el loader independientemente del resultado
    });
  }

  openModal(descripcion) {
    const data = { descripcion: descripcion, accion: this.tituloAccion }
    this.ventanaService.openModal(data);
  }
  openModalRegistroDiccionario(templateRegistroDiccionarioQce: TemplateRef<any>, datos: any) {

    this.crearFormularioRegistroDiccionarioQce(datos);
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
      content: templateRegistroDiccionarioQce,
      btn: this.accionEditar ? 'Actualizar' : 'Guardar',
      btn2: 'Cerrar',
      footer: true,
      title: this.accion,
      image: this.accionEditar ? 'assets/rutas/iconos/editar.png' : 'assets/rutas/iconos/editar.png',
    };
    const dialogRef = this.dialog.open(ModalGeneralComponent, { height: 'auto', width: '40em', data, disableClose: true });

    dialogRef.componentInstance.primaryEvent?.pipe(takeUntil(destroy$)).subscribe(x => {
      if (this.formaRegistroDiccionario.invalid) {
        this.formaRegistroDiccionario.markAllAsTouched();
        return
      }
      this.crearEditarDiccionarioQce();
      dialogRef.close();
    });

  }
  crearFormularioRegistroDiccionarioQce(datos: any) {
    this.formaRegistroDiccionario = this.fb.group({
      idresultsdictionary: [datos.idresultsdictionary ? datos.idresultsdictionary : ''],
      desresults: [datos.desresults ? datos.desresults : '', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      active: [datos.active ? datos.active : false],
    });
  }
  get desNoValido() {
    return this.formaRegistroDiccionario.get('desresults');
  }
  crearEditarDiccionarioQce() {
    if (!this.formaRegistroDiccionario.invalid) {

      if (this.accion === 'Crear') {

        this.desactivar = true;
        this.diccionarioResultadosQceService.create(this.formaRegistroDiccionario.value).subscribe(respuesta => {

          this.cargarDiccionarioQce();
          this.toastr.success('Registro creado');
          this.desactivar = false;

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            Hora: this.dateNowISO,
            Metodo: 'creación',
            Datos: JSON.stringify(this.formaRegistroDiccionario.value),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: status
          }


          this.diccionarioResultadosQceService.createLogAsync(Loguser).then(respuesta => { });

        }, (error) => {


          const Loguser = {
            fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.dateNowISO,
            metodo: 'creación',
            datos: JSON.stringify(this.formaRegistroDiccionario.value),
            respuesta: error.message,
            tipoRespuesta: error.status
          }
          this.diccionarioResultadosQceService.createLogAsync(Loguser).then(respuesta => { });

        });
      } else {
        this.diccionarioResultadosQceService.update(this.formaRegistroDiccionario.value, this.formaRegistroDiccionario.value.idresultsdictionary).subscribe(respuesta => {


          this.cargarDiccionarioQce();
          this.toastr.success('Registro actualizado');

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            Hora: this.dateNowISO,
            Metodo: 'actualización',
            Datos: JSON.stringify(this.formaRegistroDiccionario.value),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: status
          }


          this.diccionarioResultadosQceService.createLogAsync(Loguser).then(respuesta => {
          });

        }, (error) => {

          const Loguser = {
            fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.dateNowISO,
            metodo: 'actualización',
            datos: JSON.stringify(this.formaRegistroDiccionario.value),
            respuesta: error.message,
            tipoRespuesta: error.status
          }

          this.diccionarioResultadosQceService.createLogAsync(Loguser).then(respuesta => { });

        });
      }
    }
  }
  actualizarEstadoDiccionarioQce(datosDiccionario) {
    const [data, estado] = datosDiccionario;
    const datos = { idresultsdictionary: data.idresultsdictionary, desresults: data.desresults, active: estado };
    this.diccionarioResultadosQceService.update(datos, data.idresultsdictionary).subscribe(respuesta => {
      this.tituloAccion = 'Editar';
      this.cargarDiccionarioQce();
      this.toastr.success('Estado actualizado', 'Actualización');
    }, err => {
      this.toastr.error('No fue posible actualizar el estado', 'Error')
    });
  }

  eliminarDiccionarioQce(id: any) {

    this.diccionarioResultadosQceService.delete('resultsdictionaryQce', id).subscribe({

      next: (respuesta) => {
        this.cargarDiccionarioQce();
        this.tituloAccion = '';
        this.toastr.success('Registro eliminado');

        const Loguser = {
          fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.dateNowISO,
          metodo: 'eliminación',
          datos: JSON.stringify(id),
          respuesta: JSON.stringify(respuesta),
          tipoRespuesta: status
        }
        this.diccionarioResultadosQceService.createLogAsync(Loguser).then(respuesta => {
          console.log(respuesta);
        });
      }, error: (err) => {
        this.toastr.error(this.messageError);

        const Loguser = {
          fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.dateNowISO,
          metodo: 'eliminación',
          datos: JSON.stringify(id),
          respuesta: err.message,
          tipoRespuesta: err.status
        }
        this.diccionarioResultadosQceService.createLogAsync(Loguser).then(respuesta => {
          console.log(respuesta);
        });

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
