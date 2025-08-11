import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SharedService } from '@app/services/shared.service';
import { HttpErrorResponse } from '@angular/common/http';
import { VentanasModalesService } from '@app/services/general/ventanas-modales.service';
import { InstrumentosService } from '@app/services/configuracion/instrumentos.service';
import { CasasComercialesService } from '@app/services/configuracion/casascomerciales.service';
import { DatePipe, NgIf, NgFor, NgClass } from '@angular/common';
import { DetailsAnalyzerService } from '@app/services/configuracion/detailsAnalyzer.service';
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
    selector: 'app-gestion-instrumentos-lab',
    templateUrl: './gestion-instrumentos-lab.component.html',
    styleUrls: ['./gestion-instrumentos-lab.component.css'],
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
      TablaComunComponent,
       NgxMatSelectSearchModule
      ]
})
export class GestionInstrumentosLabComponent implements OnInit {
  log = new createLog(this.datePipe, this.translate, this.instrumentosService);
  dataAnt: any;

  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();
  formaGestionIntrumentos: FormGroup;
  accionEditar: any;
  tituloAccion: any;
  accion: any;
  vantanaModal: BsModalRef;
  listaCiudades: any;
  listaTradeMark: [];
  listaTradeMarkFilter: any;
  titulo: any;
  text: any;
  desactivar = false;
  textError: any;
  cancelar: any;
  confirmar: any;
  messageError: any;
  filterTradeMark = new FormControl('');

  constructor(
    private translate: TranslateService,
    private instrumentosService: InstrumentosService,
    private detailsAnalyzerService: DetailsAnalyzerService,
    private casasComercialesService: CasasComercialesService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private sharedService: SharedService,
    private datePipe: DatePipe,
    private dialog: MatDialog
  ) { }

  displayedColumns: string[] = ['Instrumento', 'Modelo', 'Casa comercial', 'Estado', 'Editar', 'Eliminar'];
  dataSource: MatTableDataSource<any>;
  dataTableBody:any[]=[];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  ngOnInit(): void {
    this.cargarGestionInstrumentos();
    this.cargarTradeMark();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();
    this.filtrosAutocomplete();
  }

  filtrosAutocomplete() {
    this.filterTradeMark.valueChanges.subscribe(word => {
      if (word) {
        this.listaTradeMark = this.listaTradeMarkFilter.filter((item: any) => {
          return item.destrademark.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.listaTradeMark = this.listaTradeMarkFilter;
      }
    });
  }


  get modelNoValido() {
    return this.formaGestionIntrumentos.get('model');
  }
  get nameAnalyzerNoValido() {
    return this.formaGestionIntrumentos.get('nameAnalyzer');
  }
  get markerNoValido() {
    return this.formaGestionIntrumentos.get('marker');
  }
  get idtrademarkNoValido() {
    return this.formaGestionIntrumentos.get('idtrademark');
  }
  crearFormularioGestionInstrumentos(datos: any) {
    this.formaGestionIntrumentos = this.fb.group({
      idAnalyzer: [datos.IdAnalyzer ? datos.IdAnalyzer : ''],
      idtrademark: [datos.Idtrademark ? datos.Idtrademark : '', [Validators.required]],
      nameAnalyzer: [datos.NameAnalyzer ? datos.NameAnalyzer : '', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      model: [datos.Model ? datos.Model : '', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      active: [datos.Active ? datos.Active : false],
    });
  }
  cargarGestionInstrumentos() {
    this.detailsAnalyzerService.getAllAsync().then(respuesta => {
      const filtrarDataTable: any[] = respuesta;
      this.dataAnt = respuesta;
      
      this.dataTableBody = filtrarDataTable.map( x =>  {
        return { Instrumento:x.NameAnalyzer,Modelo:x.Model,'Casa comercial':x.Destrademark,Estado:x.Active, item:x, item5:x ,item6:x };
      });
      this.dataSource = new MatTableDataSource(respuesta);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  cargarTradeMark() {
    this.casasComercialesService.getAllAsync().then(respuesta => {
      this.listaTradeMark = respuesta.filter(datos => datos.active == true);
      this.listaTradeMarkFilter = respuesta.filter(datos => datos.active == true);
    });

  }

  crearEditarGestionInstrumentos(datos?:any) {

    if (!this.formaGestionIntrumentos.invalid) {

      if (this.accion === 'Crear') {

        this.desactivar = true;
        this.instrumentosService.create(this.formaGestionIntrumentos.value).subscribe({
          next:(respuesta) =>{
            
            this.cargarGestionInstrumentos();
            this.toastr.success('Registro creado');
            this.desactivar = false;
  
            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo:'Control Calidad Interno',
              Submodulo: 'Configuración',
              Item:'Instrumentos',
              Metodo:'creación',
              Datos: JSON.stringify(this.formaGestionIntrumentos.value),
              Respuesta: JSON.stringify(respuesta),
              TipoRespuesta: 200,
              Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }
  
            this.instrumentosService.createLogAsync(Loguser).then(respuesta => {
            });
          },error:(err) => {
            this.toastr.error(err.error);
  
            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo:'Control Calidad Interno',
              Submodulo: 'Configuración',
              Item:'Instrumentos',
              metodo: 'creación',
              datos: JSON.stringify(this.formaGestionIntrumentos.value),
              respuesta: err.message,
              tipoRespuesta: err.status,
              Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }
            this.instrumentosService.createLogAsync(Loguser).then(respuesta => {});
              
          },
        });
      } else {

        let datosAnteriores = this.dataAnt.find(x => x.IdAnalyzer == datos.IdAnalyzer);
        
        this.instrumentosService.update(this.formaGestionIntrumentos.value, this.formaGestionIntrumentos.value.idAnalyzer).subscribe({
          next:(respuesta) => {
  
            this.cargarGestionInstrumentos();
            this.toastr.success('Registro actualizado');
  
            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo:'Control Calidad Interno',
              Submodulo: 'Configuración',
              Item:'Instrumentos',
              Metodo: 'actualización',
              Datos: JSON.stringify(this.formaGestionIntrumentos.value),
              DatosAnteriores: `id: ${datosAnteriores.IdAnalyzer} | instrumento: ${datosAnteriores.NameAnalyzer} | Modelo: ${datosAnteriores.Model} | Estado: ${datosAnteriores.datosAnteriores}`,
              Respuesta: JSON.stringify(respuesta),
              TipoRespuesta: 200,
              Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }
  
            this.instrumentosService.createLogAsync(Loguser).then(respuesta => {});
          },error:(err)=> {
            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo:'Control Calidad Interno',
              Submodulo: 'Configuración',
              Item:'Instrumentos',
              metodo: 'actualización',
              datos: JSON.stringify(this.formaGestionIntrumentos.value),
              DatosAnteriores: `id: ${datosAnteriores.IdAnalyzer} | instrumento: ${datosAnteriores.NameAnalyzer} | Modelo: ${datosAnteriores.Model} | Estado: ${datosAnteriores.datosAnteriores}`,
              respuesta: err.message,
              tipoRespuesta: err.status,
              Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }
            this.instrumentosService.createLogAsync(Loguser).then(respuesta => {
  
            });
          },
        });
      }
    }
  }

  eliminarGestionInstrumento(id: any) {
    let datosAnteriores = this.dataAnt.find(x => x.IdAnalyzer == id.IdAnalyzer);
    this.instrumentosService.delete('Analyzers', id.IdAnalyzer).subscribe({
      next:(respuesta) => {
        this.cargarGestionInstrumentos();
        this.accion = '';
        this.toastr.success('Registro eliminado');
  
        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo:'Control Calidad Interno',
          Submodulo: 'Configuración',
          Item:'Instrumentos',
          metodo:'eliminación',
          datos: JSON.stringify(id),
          DatosAnteriores: `${datosAnteriores.IdAnalyzer} | instrumento: ${datosAnteriores.NameAnalyzer} | Modelo: ${datosAnteriores.Model}`,
          respuesta: JSON.stringify(respuesta),
          tipoRespuesta: 200,
          Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
        this.instrumentosService.createLogAsync(Loguser).then(respuesta => { });
      },error:(err)=> {
        this.toastr.error(this.messageError);
    
        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo:'Control Calidad Interno',
          Submodulo: 'Configuración',
          Item:'Instrumentos',
          metodo: 'eliminación',
          datos: JSON.stringify(id),
          respuesta: err.message,
          tipoRespuesta: err.status,
          Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
        this.instrumentosService.createLogAsync(Loguser).then(respuesta => {
    
        });
      },

    });
  }
  actualizarEstadoGestionInstrumento(datosGestionInstrumento:any[]) {
    const [data,estado ] = datosGestionInstrumento;
    data.active = estado;
    const datosAnteriores = this.dataAnt.find(x => x.IdAnalyzer == data.IdAnalyzer);
    this.instrumentosService.update(data, data.IdAnalyzer).subscribe({
      next:(value)=> {
        this.cargarGestionInstrumentos();
        this.accion = 'Editar';
      this.log.logObj('Control Calidad Interno', 'Configuración', 'Instrumento', 'a', data, JSON.stringify(value), 200, this.datosAnt(datosAnteriores));
        this.toastr.success('Estado actualizado','Actualización');
      },error:(err) => {
        this.log.logObj('Control Calidad Interno', 'Configuración', 'Secciones', 'a', data, err.message, err.status, this.datosAnt(datosAnteriores));
        this.toastr.error('No fue posible actualizar el estado', 'Error')
      },
    });
  }

  datosAnt(data: any) {
    return `IdAnalyzer: ${data.IdAnalyzer} - NameAnalyzer: ${data.NameAnalyzer} - Model: ${data.Model} - Idtrademark: ${data.Idtrademark} - Destrademark: ${data.Destrademark} - Marker: ${data.Marker} - Active: ${!data.active}`;
  }


  openModalGestionInstrumentos(templateGestionInstrumentos: TemplateRef<any>, datos: any) {

    this.crearFormularioGestionInstrumentos(datos);

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
      content: templateGestionInstrumentos,
      btn: this.accionEditar?'Actualizar':'Guardar',
      btn2: 'Cerrar',
      footer:true,
      title: this.accion,
      image:''
    };
    const dialogRef = this.dialog.open(ModalGeneralComponent, { height:'22.5em' ,width: '40em', data, disableClose: true });

    dialogRef.componentInstance.primaryEvent?.pipe(takeUntil(destroy$)).subscribe(x =>{
      if(this.formaGestionIntrumentos.invalid){
        this.formaGestionIntrumentos.markAllAsTouched();
        return
      }
      this.crearEditarGestionInstrumentos(datos);
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
