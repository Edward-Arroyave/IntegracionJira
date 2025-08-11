import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SedesService } from '@app/services/configuracion/sedes.service';
import { SharedService } from '@app/services/shared.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
import { VentanasModalesService } from '@app/services/general/ventanas-modales.service';
import { CiudadesService } from '@app/services/configuracion/ciudades.service';
import { DatePipe, NgIf, NgFor, NgClass } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { ImageCdnPipe } from '../../../../../core/pipes/image-cdn.pipe';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TablaComunComponent } from '@app/modules/shared/general-tablas/tabla-comun/tabla-comun.component';
import { MatDialog } from '@angular/material/dialog';
import { lastValueFrom, Subject, takeUntil } from 'rxjs';
import { ModalData } from '@app/Models/Modaldata';
import { ModalGeneralComponent } from '@app/modules/shared/modals/modal-general/modal-general.component';


@Component({
    selector: 'app-sedes',
    templateUrl: './sedes.component.html',
    styleUrls: ['./sedes.component.css'],
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
       MatSelectModule,
       MatOptionModule,
       NgFor,
       NgClass,
       TranslateModule,
       ImageCdnPipe,
       TablaComunComponent
      ]
})
export class SedesComponent implements OnInit {

  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();
  dateNowMilliseconds = this.dateNow.getTime();
  formaRegistroSede: FormGroup;
  accionEditar: any;
  desactivar = false;
  accion: any;

  tituloAccion: any;
  vantanaModal: BsModalRef;
  listaCiudades:any = [];
  titulo: any;
  text: any;
  textError: any;
  cancelar: any;
  confirmar: any;
  messageError: any;
  descityant:any;
  sedeant:any;
  direccionant:any;

  constructor(
    private ventanaService: VentanasModalesService,
    private translate: TranslateService,
    private sedesService: SedesService,
    private ciudadesService: CiudadesService,
    private fb: FormBuilder,
    private modalService: BsModalService,
    private sharedService: SharedService,
    private datePipe: DatePipe,
    private toastr: ToastrService,
    private dialog: MatDialog,

  ) { }
  displayedColumns: string[] = ['Ciudad', 'Sede', 'Teléfono', 'Dirección', 'Estado', 'Editar', 'Eliminar'];
  dataSource: MatTableDataSource<any>;
  dataTableBody:any[] = [];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  ngOnInit(): void {
    this.cargarCiudades();
    this.titulosSwal();
    this.sharedService.customTextPaginator(this.paginator);
    this.cargarSedes();

  }
  openModal(descripcion) {
    const data = { descripcion: descripcion, accion: this.accion }
    this.ventanaService.openModal(data);
  }

  async cargarSedes() {
   await this.sedesService.getAllAsync().then(respuesta => {
      const filtrarDataTable:any[] = respuesta;
      this.dataTableBody = filtrarDataTable.map( x =>  { 
        return { Ciudad:x.Descity,Sede:x.Desheadquarters,Teléfono:x.Telephone,Dirección:x.Address,Estado:x.Active, item: x, item6:x,item7:x };
      });
      this.dataSource = new MatTableDataSource(respuesta);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }
  async cargarCiudades() {
   await  this.ciudadesService.getAllAsync().then(respuesta => {
      this.listaCiudades = respuesta.filter(datos => datos.active == true);
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  openModalRegistroSedes(templateRegistroSede: TemplateRef<any>, datos: any) {
    if(datos){
      this.accionEditar = true; 
      this.accion = "Editar" ;
    }else{
      this.accionEditar = false;
      this.accion = "Crear";
    }
  
    this.crearFormularioRegistroSede(datos);

    const destroy$: Subject<boolean> = new Subject<boolean>();
    /* Variables recibidas por el modal */
    const data: ModalData = {
      content: templateRegistroSede,
      btn: this.accionEditar?'Actualizar':'Guardar',
      btn2: 'Cerrar',
      footer:true,
      title: this.accion,
      image:''
    };
    const dialogRef = this.dialog.open(ModalGeneralComponent, { height:'29em' ,width: '50em', data, disableClose: true });

    dialogRef.componentInstance.primaryEvent?.pipe(takeUntil(destroy$)).subscribe(x =>{
      if(this.formaRegistroSede.invalid){
        this.formaRegistroSede.markAllAsTouched();
        return
      }
      this.crearEditarSede();
      dialogRef.close();
    });
  }

  get idcityNoValido() {
    return this.formaRegistroSede.get('idcity');
  }
  get codheadquartersNoValido() {
    return this.formaRegistroSede.get('codheadquarters');
  }
  get desheadquartersNoValido() {
    return this.formaRegistroSede.get('desheadquarters');
  }
  get emailNoValido() {
    return this.formaRegistroSede.get('email');
  }
  get addressNoValido() {
    return this.formaRegistroSede.get('address');
  }
  get telefonoNoValido() {
    return this.formaRegistroSede.get('telephone');
  }
  get numerationNoValido() {
    return this.formaRegistroSede.get('numeration');
  }
  crearFormularioRegistroSede(datos: any) {
    this.formaRegistroSede = this.fb.group({
      idheadquarters: [datos.Idheadquarters ? datos.Idheadquarters : ''],
      idcity: [datos.Idcity ? datos.Idcity : '', [Validators.required]],
      codheadquarters: [datos.Codheadquarters ? datos.Codheadquarters : '', [Validators.required, Validators.minLength(5), Validators.maxLength(50)]],
      desheadquarters: [datos.Desheadquarters ? datos.Desheadquarters : '', [Validators.required, Validators.minLength(5), Validators.maxLength(50)]],
      email: [datos.Email ? datos.Email : '', [Validators.required, Validators.minLength(5), Validators.maxLength(50), Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
      address: [datos.Address ? datos.Address : '', [Validators.required, Validators.minLength(5), Validators.maxLength(50)]],
      telephone: [datos.Telephone ? datos.Telephone : '', [Validators.required]],
      numeration: [datos.Numeration ? datos.Numeration : ''],
      Active: [datos.Active ? datos.Active : false]
    });
  }
  crearEditarSede() {
    if (!this.formaRegistroSede.invalid) {

      var idsedeant = this.formaRegistroSede.value.idheadquarters;

      this.sedesService.getByIdAsync(idsedeant).then((datasedeant: any) => {
        
        this.sedeant = datasedeant.desheadquarters;
        this.direccionant = datasedeant.address;
        
      }).catch(error => {});

      if (this.accion === 'Crear') {

        this.desactivar = true;
        lastValueFrom(this.sedesService.create(this.formaRegistroSede.value)).then(respuesta => {

          this.cargarSedes();
          this.toastr.success('Registro creado');
          this.desactivar = false;

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Configuración',
            Submodulo: 'Ubicaciones',
            Item:'Sedes',
            Metodo: 'creación',
            Datos: ('Sede: ' + this.formaRegistroSede.value.desheadquarters + '| ' + this.formaRegistroSede.value.address ),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: 200,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }

          this.sedesService.createLogAsync(Loguser).then(respuesta => {
          });

        }).catch((error) => {
          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Configuración',
            Submodulo: 'Ubicaciones',
            Item:'Sedes',
            Metodo: 'creación',
            Datos: ('Sede: ' + this.formaRegistroSede.value.desheadquarters + '| ' + this.formaRegistroSede.value.address ),
            respuesta: error.message,
            tipoRespuesta: error.status,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }
          this.sedesService.createLogAsync(Loguser).then(respuesta => {
          });
        });
      } else {
        lastValueFrom(this.sedesService.update(this.formaRegistroSede.value, this.formaRegistroSede.value.idheadquarters)).then(respuesta => {

          this.cargarSedes();
          this.toastr.success('Registro actualizado');

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Configuración',
            Submodulo: 'Ubicaciones',
            Item:'Sedes',
            Metodo: 'actualización',
            Datos: ('Sede: ' + this.formaRegistroSede.value.desheadquarters + '| ' + this.formaRegistroSede.value.address ),
            DatosAnteriores: ('Sede: ' + this.sedeant + '| ' + this.direccionant ),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: 200,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }

          this.sedesService.createLogAsync(Loguser).then(respuesta => {
          });

        }).catch(  (error) => {
          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Configuración',
            Submodulo: 'Ubicaciones',
            Item:'Sedes',
            Metodo: 'actualización',
            Datos: ('Sede: ' + this.formaRegistroSede.value.desheadquarters + '| ' + this.formaRegistroSede.value.address ),
            DatosAnteriores: ('Sede: ' + this.sedeant + '| ' + this.direccionant ),
            respuesta: error.message,
            tipoRespuesta: error.status,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }
          this.sedesService.createLogAsync(Loguser).then(respuesta => {
          });
        });
      }
    }
  }


  eliminarSede(id: any) {
    this.sedesService.delete('Headquarters', id.Idheadquarters).subscribe({
      next:(respuesta)=> {
        this.cargarSedes();
        this.accion = '';
        this.toastr.success('Registro eliminado');
  
        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo:'Configuración',
          Submodulo: 'Ubicaciones',
          Item:'Sedes',
          Metodo: 'eliminación',
          Datos: ( id +'| ' + this.formaRegistroSede.value.desheadquarters),
          respuesta: JSON.stringify(respuesta),
          tipoRespuesta: 200,
          Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
        this.sedesService.createLogAsync(Loguser).then(respuesta => {
          console.log(respuesta);
        });
      },
      error:(err) => {
        this.toastr.error(this.messageError);
  
        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo:'Configuración',
          Submodulo: 'Ubicaciones',
          Item:'Sedes',
          Metodo: 'eliminación',
          Datos: ( id +'| ' + this.formaRegistroSede.value.desheadquarters),
          respuesta: err.message,
          tipoRespuesta: err.status,
          Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
        this.sedesService.createLogAsync(Loguser).then(respuesta => {
        });
      }
    })
  }

  actualizarEstadoSede(datosSede:any[]) {

    const [data,estado ] = datosSede;
    data.Active = estado;
    this.sedesService.update(data, data.Idheadquarters).subscribe(respuesta => {
      this.cargarSedes();
      this.toastr.success('Registro actualizado');
      this.accion = 'Editar';
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
  closeVentana(): void {
    this.vantanaModal.hide();
  }

}

