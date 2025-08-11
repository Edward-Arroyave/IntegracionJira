import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SharedService } from '@app/services/shared.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { VentanasModalesService } from '@app/services/general/ventanas-modales.service';
import { CiudadesService } from '@app/services/configuracion/ciudades.service';
import { DepartmentsService } from '@app/services/configuracion/departamentos.service';
import { DatePipe, NgIf, NgClass, NgFor } from '@angular/common';
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
    selector: 'app-ciudades',
    templateUrl: './ciudades.component.html',
    styleUrls: ['./ciudades.component.css'],
    providers: [DatePipe],
    standalone: true,
    imports: [
      MatFormFieldModule,
      MatInputModule,
      MatTableModule,
      MatSortModule,
      MatSlideToggleModule,
      MatPaginatorModule,
      FormsModule,
      ReactiveFormsModule,
      MatSelectModule,
      MatOptionModule,
      TranslateModule,
      ImageCdnPipe,
      TablaComunComponent,
      NgxMatSelectSearchModule
    ]
})
export class CiudadesComponent implements OnInit {

  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();
  dateNowMilliseconds = this.dateNow.getTime();

  formaRegistroCiudad: FormGroup;
  accionEditar: any;
  tituloAccion: any;
  accion: any;
  desactivar = false;
  vantanaModal: BsModalRef;
  listaCiudades: any;
  listaDepartamentos: any[];
  listaDepartamentosFilter: any;
  titulo: any;
  text: any;
  textError: any;
  cancelar: any;
  confirmar: any;
  messageError: any;
  descityant: any;
  estadoant: any;
  filterDepartament = new FormControl('');


  constructor(
    private translate: TranslateService,
    private departmentsService: DepartmentsService,
    private ciudadesService: CiudadesService,
    private fb: FormBuilder,
    private sharedService: SharedService,
    private datePipe: DatePipe,
    private toastr: ToastrService,
    private dialog: MatDialog
  ) { }

  displayedColumns: string[] = ['Ciudad', 'Estado', 'Editar', 'Eliminar'];
  dataSource: MatTableDataSource<any>;
  dataTableBody:any[]=[];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  ngOnInit(): void {
    this.cargarCiudades();
    this.cargarDepartamentos();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();
    this.filtrosAutocomplete();
  }

  filtrosAutocomplete() {
    this.filterDepartament.valueChanges.subscribe(word => {
      if (word) {
        this.listaDepartamentos = this.listaDepartamentosFilter.filter((item: any) => {
          return item.desdepartament.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.listaDepartamentos = this.listaDepartamentosFilter;
      }
    });
  }
  
  get DesCiudadNoValido() {
    return this.formaRegistroCiudad.get('DesCity');
  }
  get idDepartamentNoValido() {
    return this.formaRegistroCiudad.get('idDepartament');
  }

  crearFormularioRegistroCiudad(datos: any) {
    this.formaRegistroCiudad = this.fb.group({
      idCity: [datos.idcity ? datos.idcity : ''],
      DesCity: [datos.descity ? datos.descity : '', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      idDepartament: [datos.iddepartament ? datos.iddepartament : '', [Validators.required]],
      codDivipola: [datos.coddivipola ? datos.coddivipola : ''],
      Active: [datos.active ? datos.active : false],
    });
  }
  cargarCiudades() {
    this.ciudadesService.getAllAsync().then(respuesta => {
      const filtrarDataTable:any[] = respuesta;
      this.dataTableBody = filtrarDataTable.map( x =>  {
        return { Ciudad:x.descity,Estado:x.active, item:x, item3:x,item4:x };
      });
      this.dataSource = new MatTableDataSource(respuesta);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  cargarDepartamentos() {
    this.departmentsService.getAllAsync().then(respuesta => {
      this.listaDepartamentos = respuesta.filter(datos => datos.active == true);
      this.listaDepartamentosFilter = respuesta.filter(datos => datos.active == true);
    });

  }

  crearEditarCiudad() {
    if (!this.formaRegistroCiudad.invalid) {

      var idcityant = this.formaRegistroCiudad.value.idCity;

      this.ciudadesService.getByIdAsync(idcityant).then((datacityant: any) => {
        this.descityant = datacityant.descity;
        this.estadoant = datacityant.active;
      }).catch(error => { });

      if (this.accion === 'Crear') {

        this.desactivar = true;
        lastValueFrom(this.ciudadesService.create(this.formaRegistroCiudad.value)).then(respuesta => {

          this.cargarCiudades();
          this.toastr.success('Registro creado');
          this.desactivar = false;

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo: 'Configuración',
            Submodulo: 'Ubicaciones',
            Item: 'Ciudades',
            Metodo: 'creación',
            Datos: ('Ciudad: ' + this.formaRegistroCiudad.value.DesCity + '| ' + this.formaRegistroCiudad.value.Active),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: 200,
            Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }

          this.ciudadesService.createLogAsync(Loguser).then(respuesta => {
          });

        }).catch((error) => {

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo: 'Configuración',
            Submodulo: 'Ubicaciones',
            Item: 'Ciudades',
            Metodo: 'creación',
            Datos: ('Ciudad: ' + this.formaRegistroCiudad.value.DesCity + '| ' + this.formaRegistroCiudad.value.Active),
            respuesta: error.message,
            tipoRespuesta: error.status,
            Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }
          this.ciudadesService.createLogAsync(Loguser).then(respuesta => {
          });
        });
      } else {
        lastValueFrom(this.ciudadesService.update(this.formaRegistroCiudad.value, this.formaRegistroCiudad.value.idCity)).then(respuesta => {

          this.cargarCiudades();
          this.toastr.success('Registro actualizado');

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo: 'Configuración',
            Submodulo: 'Ubicaciones',
            Item: 'Ciudades',
            Metodo: 'actualización',
            Datos: ('Ciudad: ' + this.formaRegistroCiudad.value.DesCity + '| ' + this.formaRegistroCiudad.value.Active),
            DatosAnteriores: ('Ciudad: ' + this.descityant + '| ' + this.estadoant),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: 200,
            Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }


          this.ciudadesService.createLogAsync(Loguser).then(respuesta => {
          });
        }).catch( (error) => {
          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo: 'Configuración',
            Submodulo: 'Ubicaciones',
            Item: 'Ciudades',
            Metodo: 'actualización',
            Datos: ('Ciudad: ' + this.formaRegistroCiudad.value.DesCity + '| ' + this.formaRegistroCiudad.value.Active),
            DatosAnteriores: ('Ciudad: ' + this.descityant + '| ' + this.estadoant),
            respuesta: error.message,
            tipoRespuesta: error.status,
            Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }
          this.ciudadesService.createLogAsync(Loguser).then(respuesta => {
          });
        });
      }
    }
  }

  eliminarCiudad(id: any) {
    let namecity = null;
    this.ciudadesService.getByIdAsync(id.idcity).then((datacity: any) => {

      namecity = datacity.descity;

    });

    this.ciudadesService.delete('Cities', id.idcity).subscribe({
      next:(respuesta)=>{
        this.cargarCiudades();
        this.accion = '';
        this.toastr.success('Registro eliminado');

        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo:'Configuración',
          Submodulo: 'Ubicaciones',
          Item:'Ciudades',
          Metodo: 'eliminación',
          Datos: (id +'| ' + namecity ),
          respuesta: JSON.stringify(respuesta),
          tipoRespuesta: 200,
          Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
        this.ciudadesService.createLogAsync(Loguser).then(respuesta => {
        });
      },
      error:(err) => {
        this.toastr.error(this.messageError);

        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo:'Configuración',
          Submodulo: 'Ubicaciones',
          Item:'Ciudades',
          Metodo: 'eliminación',
          Datos: (id +'| ' + namecity ),
          respuesta: err.message,
          tipoRespuesta: err.status,
          Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
        this.ciudadesService.createLogAsync(Loguser).then(respuesta => {
        });
      }
    })
  }

  actualizarEstadoCiudad(datosCiudad:any[]) {
    const [data,estado ] = datosCiudad;
    data.active = estado;
    this.ciudadesService.update(data, data.idcity).subscribe(respuesta => {
      this.accion = 'Editar';
      this.toastr.success('Registro actualizado');
      this.cargarCiudades();
    });
  }
  openModalRegistroCiudad(templateRegistroCiudad: TemplateRef<any>, datos: any) {

    if(datos){
      this.accionEditar = true;
      this.accion = "Editar" ;
    }else{
      this.accionEditar = false;
      this.accion = "Crear";
    }

    this.crearFormularioRegistroCiudad(datos);

    const destroy$: Subject<boolean> = new Subject<boolean>();
    /* Variables recibidas por el modal */
    const data: ModalData = {
      content: templateRegistroCiudad,
      btn: this.accionEditar?'Actualizar':'Guardar',
      btn2: 'Cerrar',
      footer:true,
      title: this.accion,
      image:''
    };
    const dialogRef = this.dialog.open(ModalGeneralComponent, { height:'22.5em' ,width: '40em', data, disableClose: true });

    dialogRef.componentInstance.primaryEvent?.pipe(takeUntil(destroy$)).subscribe(x =>{
      if(this.formaRegistroCiudad.invalid){
        this.formaRegistroCiudad.markAllAsTouched();
        return
      }
      this.crearEditarCiudad();
      dialogRef.close();
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
