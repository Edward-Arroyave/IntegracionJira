import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SharedService } from '@app/services/shared.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
import { VentanasModalesService } from '@app/services/general/ventanas-modales.service';
import { DepartmentsService } from '@app/services/configuracion/departamentos.service';
import { PaisesService } from '@app/services/configuracion/paises.service';
import { DatePipe, NgIf, NgFor, NgClass } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { ImageCdnPipe } from '../../../../../core/pipes/image-cdn.pipe';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TablaComunComponent } from '@app/modules/shared/general-tablas/tabla-comun/tabla-comun.component';
import { lastValueFrom, Subject, takeUntil } from 'rxjs';
import { ModalData } from '@app/Models/Modaldata';
import { ModalGeneralComponent } from '@app/modules/shared/modals/modal-general/modal-general.component';
import { MatDialog } from '@angular/material/dialog';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

@Component({
  selector: 'app-departamentos',
  templateUrl: './departamentos.component.html',
  styleUrls: ['./departamentos.component.css'],
  providers: [DatePipe],
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatTableModule,
    MatInputModule,
    MatSortModule,
    MatSlideToggleModule,
    MatPaginatorModule,
    NgIf,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatOptionModule,
    NgFor,
    NgClass,
    TranslateModule,
    ImageCdnPipe,
    TablaComunComponent,
    NgxMatSelectSearchModule
  ]
})
export class DepartamentosComponent implements OnInit {
  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();
  formaRegistroDepartamento: FormGroup;
  accionEditar: any;
  accion: any;
  desactivar = false;
  tituloAccion: any;
  vantanaModal: BsModalRef;
  listaPaises: [];
  listaPaisesFilter: any;
  titulo: any;
  text: any;
  textError: any;
  cancelar: any;
  confirmar: any;
  messageError: any;
  desdepartamentant: any;
  estadoant: any;
  filterCountry = new FormControl('');
  
  constructor(
    private translate: TranslateService,
    private departmentsService: DepartmentsService,
    private paisesService: PaisesService,
    private fb: FormBuilder,
    private modalService: BsModalService,
    private sharedService: SharedService,
    private ventanaService: VentanasModalesService,
    private datePipe: DatePipe,
    private toastr: ToastrService,
    private dialog: MatDialog
  ) { }
  displayedColumns: string[] = ['Departamento', 'Cod. divipola', 'Estado', 'Editar', 'Eliminar'];
  dataSource: MatTableDataSource<any>;
  dataTableBody: any[] = [];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  ngOnInit(): void {
    this.cargarDepartamentos();
    this.cargarPaises();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();
  this.filtrosAutocomplete();
  }

  filtrosAutocomplete() {
    this.filterCountry.valueChanges.subscribe(word => {
      if (word) {
        this.listaPaises = this.listaPaisesFilter.filter((item: any) => {
          return item.descountry.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.listaPaises = this.listaPaisesFilter;
      }
    });
  }

  openModal(descripcion) {
    const data = { descripcion: descripcion, accion: this.accion }
    this.ventanaService.openModal(data);
  }
  get DesDepartamentNoValido() {
    return this.formaRegistroDepartamento.get('DesDepartament');
  }
  get idcountryNoValido() {
    return this.formaRegistroDepartamento.get('idcountry');
  }
  crearFormularioRegistroDepartamento(datos: any) {
    this.formaRegistroDepartamento = this.fb.group({
      iddepartament: [datos.iddepartament ? datos.iddepartament : ''],
      idcountry: [datos.idcountry ? datos.idcountry : '', [Validators.required]],
      DesDepartament: [datos.desdepartament ? datos.desdepartament : '', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      codDivipola: [datos.coddivipola ? datos.coddivipola : ''],
      Active: [datos.active ? datos.active : false],
    });
  }
  cargarDepartamentos() {
    this.departmentsService.getAllAsync().then(respuesta => {
      const filtrarDataTable: any[] = respuesta;
      this.dataTableBody = filtrarDataTable.map(x => {
        return { 'Departamento': x.desdepartament, 'Cod. divipola': x.coddivipola, 'Estado': x.active, item: x, item4: x, item5: x };
      });
      this.dataSource = new MatTableDataSource(respuesta);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });

  }
  cargarPaises() {
    this.paisesService.getAllAsync().then(respuesta => {
      this.listaPaises = respuesta.filter(datos => datos.active == true);
      this.listaPaisesFilter = respuesta.filter(datos => datos.active == true);
    });
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  crearEditarDepartamento() {
    if (!this.formaRegistroDepartamento.invalid) {

      var indepartamentant = this.formaRegistroDepartamento.value.iddepartament;

      this.departmentsService.getByIdAsync(indepartamentant).then((datadepartament: any) => {
        this.desdepartamentant = datadepartament.desdepartament;
        this.estadoant = datadepartament.active;
      }).catch(error => { });

      if (this.accion === 'Crear') {

        this.desactivar = true;
        lastValueFrom(this.departmentsService.create(this.formaRegistroDepartamento.value)).then(respuesta => {
          this.cargarDepartamentos();
          this.toastr.success('Registro creado');
          this.desactivar = false;

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo: 'Configuración',
            Submodulo: 'Ubicaciones',
            Item: 'Departamentos',
            Metodo:'creación',
            Datos: ('Departamento: ' + this.formaRegistroDepartamento.value.DesDepartament + '| ' + this.formaRegistroDepartamento.value.Active),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: 200,
            Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')

          }

          this.departmentsService.createLogAsync(Loguser).then(respuesta => {
          });

        }).catch((error) => {

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo: 'Configuración',
            Submodulo: 'Ubicaciones',
            Item: 'Departamentos',
            Metodo: 'creación',
            Datos: ('Departamento: ' + this.formaRegistroDepartamento.value.DesDepartament + '| ' + this.formaRegistroDepartamento.value.Active),
            respuesta: error.message,
            tipoRespuesta: error.status,
            Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }
          this.departmentsService.createLogAsync(Loguser).then(respuesta => {
          });
        });
      } else {
        lastValueFrom(this.departmentsService.update(this.formaRegistroDepartamento.value, this.formaRegistroDepartamento.value.iddepartament))
          .then(respuesta => {
            this.cargarDepartamentos();
            this.toastr.success('Registro actualizado');

            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo: 'Configuración',
              Submodulo: 'Ubicaciones',
              Item: 'Departamentos',
              Metodo: 'eliminación',
              Datos: ('Departamento: ' + this.formaRegistroDepartamento.value.DesDepartament + '| ' + this.formaRegistroDepartamento.value.Active),
              DatosAnteriores: ('Departamento: ' + this.desdepartamentant + '| ' + this.estadoant),
              Respuesta: JSON.stringify(respuesta),
              TipoRespuesta: 200,
              Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }


            this.departmentsService.createLogAsync(Loguser).then(respuesta => {
            });

          }).catch((error) => {

            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo: 'Configuración',
              Submodulo: 'Ubicaciones',
              Item: 'Departamentos',
              Metodo: 'eliminación',
              Datos: ('Departamento: ' + this.formaRegistroDepartamento.value.DesDepartament + '| ' + this.formaRegistroDepartamento.value.Active),
              respuesta: error.message,
              tipoRespuesta: error.status,
              Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }
            this.departmentsService.createLogAsync(Loguser).then(respuesta => {
            });
          });
      }
    }
  }
  actualizarEstadoDepartamento(datosDepart: any[]) {
    const [data, estado] = datosDepart;
    data.active = estado;
    this.departmentsService.update(data, data.iddepartament).subscribe(respuesta => {
      this.cargarDepartamentos();
      this.toastr.success('Registro actualizado');
      this.accion = 'Editar';
    });
  }
  openModalRegistroDepartamento(templateRegistroDepartamento: TemplateRef<any>, datos: any) {
    if (datos) {
      this.accionEditar = true;
      this.accion = "Editar";
    } else {
      this.accionEditar = false;
      this.accion = "Crear";
    }

    this.crearFormularioRegistroDepartamento(datos);
    const destroy$: Subject<boolean> = new Subject<boolean>();
    /* Variables recibidas por el modal */
    const data: ModalData = {
      content: templateRegistroDepartamento,
      btn: this.accionEditar ? 'Actualizar' : 'Guardar',
      btn2: 'Cerrar',
      footer: true,
      title: this.accion,
      image: ''
    };
    const dialogRef = this.dialog.open(ModalGeneralComponent, { height: '22.5em', width: '40em', data, disableClose: true });

    dialogRef.componentInstance.primaryEvent?.pipe(takeUntil(destroy$)).subscribe(x => {
      if(this.formaRegistroDepartamento.invalid){
        this.formaRegistroDepartamento.markAllAsTouched();
        return
      }
      this.crearEditarDepartamento();
      dialogRef.close();
    });
  }

  eliminarDepartamento(id: any) {

    let namedept = null;
    this.departmentsService.getByIdAsync(id.iddepartament).then((datadep: any) => {
      namedept = datadep.desdepartament;
    });

    this.departmentsService.delete('Departments', id.iddepartament).subscribe({
      next: (respuesta) => {
        this.cargarDepartamentos();
        this.accion = '';
        this.toastr.success('Registro eliminado');

        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo: 'Configuración',
          Submodulo: 'Ubicaciones',
          Item: 'Departamentos',
          Metodo:'eliminación',
          Datos: (id + '| ' + namedept),
          respuesta: JSON.stringify(respuesta),
          tipoRespuesta: 200,
          Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')

        }
        this.departmentsService.createLogAsync(Loguser).then(respuesta => {
        });
      }, error:(err) => {

        this.toastr.error(this.messageError);

        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo: 'Configuración',
          Submodulo: 'Ubicaciones',
          Item: 'Departamentos',
          Metodo: 'eliminación',
          Datos: (id + '| ' + namedept),
          respuesta: err.message,
          tipoRespuesta: err.status,
          Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
        this.departmentsService.createLogAsync(Loguser).then(respuesta => {
        });

      },
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
  closeVentana(): void {
    this.vantanaModal.hide();
  }
}
