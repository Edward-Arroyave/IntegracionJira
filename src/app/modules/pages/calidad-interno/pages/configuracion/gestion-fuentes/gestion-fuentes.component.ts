import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { FuentesService } from '@app/services/configuracion/fuentes.service';
import { SharedService } from '@app/services/shared.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { HttpErrorResponse } from '@angular/common/http';
import { VentanasModalesService } from '@app/services/general/ventanas-modales.service';
import { Unidadeservice } from '@app/services/configuracion/unidades.service';
import { DatePipe, NgIf, NgClass, NgFor } from '@angular/common';
import { FuentesDetailsService } from '@app/services/configuracion/fuentesDetails.service';
import { ToastrService } from 'ngx-toastr';
import { ImageCdnPipe } from '../../../../../core/pipes/image-cdn.pipe';
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
import { createLog } from '@app/globals/logUser';

@Component({
    selector: 'app-gestion-fuentes',
    templateUrl: './gestion-fuentes.component.html',
    styleUrls: ['./gestion-fuentes.component.css'],
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
      MatSelectModule,
      MatOptionModule,
      NgFor,
      TranslateModule,
      ImageCdnPipe,
      TablaComunComponent,
      NgxMatSelectSearchModule
    ]
})
export class GestionFuentesComponent implements OnInit {
  log = new createLog(this.datePipe, this.translate, this.fuentesService);
  dataAnt: any;
  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();
  formaGestionFuentes: FormGroup;
  listUnits: any;
  desactivar = false;
  unitsActive: any;
  unitsActiveFilter: any;
  accionEditar: any;
  tituloAccion: any;
  accion: any;
  vantanaModal: BsModalRef;
  listaCiudades: any;
  titulo: any;
  text: any;
  textError: any;
  cancelar: any;
  confirmar: any;
  messageError: any;
  filterUnit = new FormControl('');

  constructor(
    private translate: TranslateService,
    private fuentesService: FuentesService,
    private fuentesDetailsService: FuentesDetailsService,
    private unidadeservice: Unidadeservice,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private modalService: BsModalService,
    private sharedService: SharedService,
    private ventanaService: VentanasModalesService,
    private datePipe: DatePipe,
    private dialog: MatDialog
  ) { }
  displayedColumns: string[] = ['Fuente', 'U. de medidad', 'Estado', 'Editar', 'Eliminar'];
  dataSource: MatTableDataSource<any>;
  dataTableBody:any[]=[];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  ngOnInit(): void {
    this.cargarGestionFuentes();
    this.cargarUnits();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();
    this.filtrosAutocomplete();
  }

  filtrosAutocomplete() {
    this.filterUnit.valueChanges.subscribe(word => {
      if (word) {
        this.unitsActive = this.unitsActiveFilter.filter((item: any) => {
          return item.desunits.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.unitsActive = this.unitsActiveFilter;
      }
    });
  }

  async cargarUnits() {
    this.listUnits = await this.unidadeservice.getAllAsync();
    this.unitsActive = this.listUnits.filter(e => e.active == true);
    this.unitsActiveFilter = this.listUnits.filter(e => e.active == true);
  }


  get desSourceNoValido() {
    return this.formaGestionFuentes.get('dessource');
  }


  get idUnitsNoValido() {
    return this.formaGestionFuentes.get('idunits');
  }


  crearFormularioGestionFuentes(datos: any) {
    this.formaGestionFuentes = this.fb.group({
      idsource: [datos.Idsource ? datos.Idsource : ''],
      dessource: [datos.Dessource ? datos.Dessource : '', [Validators.required, Validators.minLength(5), Validators.maxLength(400)]],
      idunits: [datos.Idunits ? datos.Idunits : '', [Validators.required]],
      Active: [datos.Active ? datos.Active : false],
    });
  }


  cargarGestionFuentes() {
    this.fuentesDetailsService.getAllAsync().then(respuesta => {
      const filtrarDataTable: any[] = respuesta;
      this.dataAnt = respuesta;
      
      this.dataTableBody = filtrarDataTable.map( x =>  {
        return { Fuente:x.Dessource,'U. de medidad':x.Desunits,Estado:x.Active, item:x, item4:x };
      });
      this.dataSource = new MatTableDataSource(respuesta);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }


  crearEditarGestionFuentes(datos?:any) {
    if (!this.formaGestionFuentes.invalid) {

      if (this.accion === 'Crear') {
        this.desactivar = true;
        this.fuentesService.create(this.formaGestionFuentes.value).subscribe({
          next:(respuesta) => {
            
            this.cargarGestionFuentes();
            this.toastr.success('Registro creado');
            this.desactivar = false;
  
            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo:'Control Calidad Interno',
              Submodulo: 'Configuración',
              Item:'Fuentes',
              Metodo: 'creación',
              Datos: JSON.stringify(this.formaGestionFuentes.value),
              Respuesta: JSON.stringify(respuesta),
              TipoRespuesta: 200,
              Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }
  
            this.fuentesService.createLogAsync(Loguser).then(respuesta => {});
          },error:(err) => {
            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo:'Control Calidad Interno',
              Submodulo: 'Configuración',
              Item:'Fuentes',
              metodo: 'creación',
              datos: JSON.stringify(this.formaGestionFuentes.value),
              respuesta: err.message,
              tipoRespuesta: err.status,
              Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }
            this.fuentesService.createLogAsync(Loguser).then(respuesta => {
              console.log(respuesta);
            });
          }
        });
      } else {
        let datosAnteriores = this.dataAnt.find(x => x.Idsource == datos.Idsource);

        this.fuentesService.update(this.formaGestionFuentes.value, this.formaGestionFuentes.value.idsource).subscribe({
          next:(respuesta)=> {
  
            this.cargarGestionFuentes();
            this.toastr.success('Registro actualizado');
  
            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo:'Control Calidad Interno',
              Submodulo: 'Configuración',
              Item:'Fuentes',
              Metodo: 'actualización',
              Datos: JSON.stringify(this.formaGestionFuentes.value),
              DatosAnteriores: `${datosAnteriores.Idsource} | Fuente: ${datosAnteriores.Dessource} | Estado: ${datosAnteriores.Active}`,
              Respuesta: JSON.stringify(respuesta),
              TipoRespuesta: 200,
              Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }
  
            this.fuentesService.createLogAsync(Loguser).then(respuesta => {});
          },error:(err)=> {
            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo:'Control Calidad Interno',
              Submodulo: 'Configuración',
              Item:'Fuentes',
              metodo:'actualización',
              datos: JSON.stringify(this.formaGestionFuentes.value),
              DatosAnteriores: `${datosAnteriores.Idsource} | Fuente: ${datosAnteriores.Dessource} | Estado: ${datosAnteriores.Active}`,
              respuesta: err.message,
              tipoRespuesta: err.status,
              Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }
            this.fuentesService.createLogAsync(Loguser).then(respuesta => {});
          },
        });
      }
    }
  }

  eliminarGestionFuentes(id: any) {
    let datosAnteriores = this.dataAnt.find(x => x.Idsource == id.Idsource);
    this.fuentesService.delete('Sources', id.Idsource).subscribe({
      next:(respuesta)=> {
        this.cargarGestionFuentes();
        this.accion = '';
        this.toastr.success('Registro eliminado');
  
        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo:'Control Calidad Interno',
          Submodulo: 'Configuración',
          Item:'Fuentes',
          metodo: 'eliminación',
          datos: JSON.stringify(id),
          DatosAnteriores: `${datosAnteriores.Idsource} | Fuente: ${datosAnteriores.Dessource}`,
          respuesta: JSON.stringify(respuesta),
          tipoRespuesta: 200,
          Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
        this.fuentesService.createLogAsync(Loguser).then(respuesta => {});
      },error:(err) => {
        this.toastr.error(this.messageError);
    
        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo:'Control Calidad Interno',
          Submodulo: 'Configuración',
          Item:'Fuentes',
          metodo: 'eliminación',
          datos: JSON.stringify(id),
          respuesta: err.message,
          tipoRespuesta: err.status,
          Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
        this.fuentesService.createLogAsync(Loguser).then(respuesta => {});
      },
    });
  }


  actualizarEstadoGestionFuentes(datosGestionFuente:any[]) {
    const [data,estado ] = datosGestionFuente;
    data.Active = estado;
    const datosAnteriores = this.dataAnt.find(x => x.Idsource == data.Idsource);
    this.fuentesService.update(data, data.Idsource).subscribe({
      next:(value)=> {
        this.cargarGestionFuentes();
        this.accion = 'Editar';
      this.log.logObj('Control Calidad Interno', 'Configuración', 'Fuente', 'a', data, JSON.stringify(value), 200, this.datosAnt(datosAnteriores));
        this.toastr.success('Estado actualizado','Actualización');
      },error:(err)=> {
      this.log.logObj('Control Calidad Interno', 'Configuración', 'Fuente', 'a', data, err.message, err.status, this.datosAnt(datosAnteriores));
        this.toastr.error('No fue posible actualizar el estado', 'Error');
      },
    });
  }

  datosAnt(data: any) {
    return ` Idsource: ${data.Idsource} - Dessource: ${data.Dessource} - Idunits: ${data.Idunits} - Desunits: ${data.Desunits} - Active: ${!data.Active}`;
  }


  openModalGestionFuentes(templateGestionFuentes: TemplateRef<any>, datos: any) {

    this.crearFormularioGestionFuentes(datos);

    if(datos){
      this.accionEditar = true;
      this.accion = "Editar" ;
    }else{
      this.accionEditar = false;
      this.accion = "Crear";
    }

    const destroy$: Subject<boolean> = new Subject<boolean>();
    /* Variables recibidas por el modal */
    const data: ModalData = {
      content: templateGestionFuentes,
      btn: this.accionEditar?'Actualizar':'Guardar',
      btn2: 'Cerrar',
      footer:true,
      title: this.accion,
      image:''
    };
    const dialogRef = this.dialog.open(ModalGeneralComponent, { height:'16em' ,width: '40em', data, disableClose: true });

    dialogRef.componentInstance.primaryEvent?.pipe(takeUntil(destroy$)).subscribe(x =>{
      if(this.formaGestionFuentes.invalid){
        this.formaGestionFuentes.markAllAsTouched();
        return
      }
      this.crearEditarGestionFuentes(datos);
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
