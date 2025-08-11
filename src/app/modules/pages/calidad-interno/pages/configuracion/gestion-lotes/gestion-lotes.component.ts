import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SharedService } from '@app/services/shared.service';
import { DatePipe, NgIf, NgClass } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { VentanasModalesService } from '@app/services/general/ventanas-modales.service';
import { LotesService } from '@app/services/configuracion/lotes.service';
import dayjs from 'dayjs';
import { ToastrService } from 'ngx-toastr';
import { PermisosEspecialesService } from '@app/services/configuracion/permisos-especiales.service';
import { ImageCdnPipe } from '../../../../../core/pipes/image-cdn.pipe';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TablaComunComponent } from '@app/modules/shared/general-tablas/tabla-comun/tabla-comun.component';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { ModalData } from '@app/Models/Modaldata';
import { ModalGeneralComponent } from '@app/modules/shared/modals/modal-general/modal-general.component';
import { createLog } from '@app/globals/logUser';

@Component({
    selector: 'app-gestion-lotes',
    templateUrl: './gestion-lotes.component.html',
    styleUrls: ['./gestion-lotes.component.css'],
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
        MatDatepickerModule,
        DatePipe,
        TranslateModule,
        ImageCdnPipe,
        TablaComunComponent
    ],
})
export class GestionLotesComponent implements OnInit {
  log = new createLog(this.datePipe, this.translate, this.lotesService);

  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();
  formaGestionLotes: FormGroup;
  accionEditar: any;
  accion: any;
  desactivar = false;
  tituloAccion: any;
  vantanaModal: BsModalRef;
  titulo: any;
  text: any;
  today = dayjs().format('YYYY-MM-DD');
  textError: any;
  cancelar: any;
  confirmar: any;
  messageError: any;

  antnumlot:any;
  antexpdate:any;
  dataAnt: any;

  //permisos
  eliminarsi: boolean = false;
  editarsi: boolean = false;
  crearsi: boolean = false;
  rolid: number;
  userid: number;

  buttonValidate: boolean = true;

  constructor(
    private datePipe: DatePipe,
    private translate: TranslateService,
    private lotesService: LotesService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private modalService: BsModalService,
    private sharedService: SharedService,
    private ventanaService: VentanasModalesService,
    private PermisosEspecialesService: PermisosEspecialesService,
    private dialog: MatDialog
  ) { }
  displayedColumns: string[] = ['N° Lote', 'FV', 'Estado', 'Editar', 'Eliminar'];
  dataSource: MatTableDataSource<any>;
  dataTableBody:any[]=[];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  ngOnInit(): void {
    this.cargarGestionLotes();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();
    this.getPermissionsRol();
  }


  cargarGestionLotes() {
    this.lotesService.getAllAsync().then(respuesta => {
      const filtrarDataTable:any[] = respuesta;
      this.dataAnt = respuesta;
      respuesta.forEach((d)=>{
        d.expdate = dayjs(d.expdate).format("YYYY-MM-DD")
     });

      this.dataTableBody = filtrarDataTable.map( x =>  {
        return { 'N° Lote':x.numlot,FV:x.expdate,Estado:x.active, item:x, item4:x,item5:x };
      });
      this.dataSource = new MatTableDataSource(respuesta);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  openModalGestionLotes(templateGestionLotes: TemplateRef<any>, datos: any) {
    this.crearFormularioGestionLotes(datos);

    var idlotant = this.formaGestionLotes.get('idLot').value;
    this.lotesService.getByIdAsync(idlotant).then((datalotant: any) => {

      this.antnumlot = datalotant.numlot;
      this.antexpdate = dayjs(datalotant.expdate).format('YYYY-MM-DD');
    }).catch(error => {});

    if(datos !== ''){
      this.accionEditar = true;
      this.accion = "Editar" ;
    }else{
      this.accionEditar = false;
      this.accion = "Crear";
    }

    const destroy$: Subject<boolean> = new Subject<boolean>();
    /* Variables recibidas por el modal */
    const data: ModalData = {
      content: templateGestionLotes,
      btn: this.accionEditar?'Editar':'Guardar',
      btn2: 'Cerrar',
      footer:true,
      title: this.accion,
      image:''
    };
    const dialogRef = this.dialog.open(ModalGeneralComponent, { height:'20em' ,width: '50em', data, disableClose: true });

    dialogRef.componentInstance.primaryEvent?.pipe(takeUntil(destroy$)).subscribe(x =>{
      if(this.formaGestionLotes.invalid){
        this.formaGestionLotes.markAllAsTouched();
        return
      }
      this.crearEditarGestionLotes();
      dialogRef.close();
    });
  }
  get numLotNoValido() {
    return this.formaGestionLotes.get('numLot');
  }
  get expDateNoValido() {
    return this.formaGestionLotes.get('expDate');
  }
  crearFormularioGestionLotes(datos: any) {
    this.formaGestionLotes = this.fb.group({
      idLot: [datos.idLot ? datos.idLot : ''],
      numLot: [datos.numlot ? datos.numlot : '', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      expDate: [datos.expdate ? datos.expdate : '', [Validators.required]],
      active: [datos.active ? datos.active : false]
    });
  }

  changeDate() {

    let fechaVencimiento = document.getElementById("expDate");
    fechaVencimiento.classList.remove('is-valid');

  }

  getPermissionsRol() {
    this.rolid = JSON.parse(sessionStorage.getItem('rolid'));
    this.userid = JSON.parse(sessionStorage.getItem('id'));
    this.PermisosEspecialesService.getAllAsyncpermissionsRol(this.rolid).then(lab => {
      lab.forEach(element => {
        if (element.Desmoduleaccess === "QCI Configuración") {
          if (element.Editar) {
            this.editarsi = true;
          } else {
            this.editarsi = false;
          }

          if (element.Eliminar) {
            this.eliminarsi = true;
          } else {
            this.eliminarsi = false;
          }

          if (element.Crear){
            this.crearsi = true;
            this.buttonValidate = true;
          }else{
            this.crearsi = false;
            this.buttonValidate = false;
          }

          //Validación para quitar permisos
          if(this.editarsi == false && this.eliminarsi == false){
            this.displayedColumns = ['N° Lote', 'FV'];
          } else if (this.editarsi && this.eliminarsi == false){
            this.displayedColumns = ['N° Lote', 'FV', 'Estado','Editar'];
          } else if (this.editarsi == false && this.eliminarsi){
            this.displayedColumns = ['N° Lote', 'FV','Eliminar'];
          }
        }
    });
  }, error => {
    this.crearsi = false;
    this.editarsi = false;
    this.eliminarsi = false;
    this.displayedColumns = ['N° Lote', 'FV'];
  });
 }

  crearEditarGestionLotes() {

    if (!this.formaGestionLotes.invalid) {
      if (this.accion === 'Crear') {

        this.desactivar = true;
        this.lotesService.create(this.formaGestionLotes.value).subscribe({
          next:(respuesta)=> {
            
            this.cargarGestionLotes();
            this.toastr.success('Registro creado');
            this.desactivar = false;
  
            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo:'Control Calidad Interno',
              Submodulo: 'Configuración',
              Item:'Lotes',
              Metodo: 'creación',
              Datos: JSON.stringify(this.formaGestionLotes.value.numLot),
              Respuesta: JSON.stringify(respuesta),
              TipoRespuesta: 200,
              Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }
  
            this.lotesService.createLogAsync(Loguser).then(respuesta => {});
          },error:(err) => {
            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo:'Control Calidad Interno',
              Submodulo: 'Configuración',
              Item:'Lotes',
              Metodo: 'creación',
              Datos: ('Lote: '+ this.formaGestionLotes.value.numLot  + ' | Expdate: ' + dayjs(this.formaGestionLotes.value.expDate).format('YYYY-MM-DD')),
              respuesta: err.message,
              tipoRespuesta: err.status,
              Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }
            this.lotesService.createLogAsync(Loguser).then(respuesta => {});
    
            this.toastr.error(err.error);
            this.desactivar = false;
              
          },
        });
      } else {

        this.lotesService.update(this.formaGestionLotes.value, this.formaGestionLotes.value.idLot).subscribe({

          next:(respuesta)=> {
            this.cargarGestionLotes();
            this.toastr.success('Registro actualizado');

            let datosAnteriores = this.dataAnt.find(x=>x.idLot = this.formaGestionLotes.value.idLot);
            
            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo:'Control Calidad Interno',
              Submodulo: 'Configuración',
              Item:'Lotes',
              Metodo: 'actualización',
              Datos: JSON.stringify(this.formaGestionLotes.value),
              DatosAnteriores: JSON.stringify(datosAnteriores),
              Respuesta: JSON.stringify(respuesta),
              TipoRespuesta: 200,
              Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }
  
            this.lotesService.createLogAsync(Loguser).then(respuesta => { });
          },error:(err) => {
            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo:'Control Calidad Interno',
              Submodulo: 'Configuración',
              Item:'Lotes',
              Metodo:'actualización',
              Datos: ('Lote: '+ this.formaGestionLotes.value.numLot  + ' | Expdate: ' + dayjs(this.formaGestionLotes.value.expDate).format('YYYY-MM-DD')),
              DatosAnteriores: ('Lote: '+ this.antnumlot  + ' | Expdate: ' + this.antexpdate),
              respuesta: err.message,
              tipoRespuesta: err.status,
              Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }
            this.lotesService.createLogAsync(Loguser).then(respuesta => {
            });
  
            this.toastr.error(err.error);
            this.desactivar = false;
              
          },
        });
      }
    }
  }
  actualizarGestionLotes(datosLote:any[]) {
    const [data,estado ] = datosLote;
    data.active = estado;
    const datosAnteriores = this.dataAnt.find(x => x.idLot == data.idLot);
    this.lotesService.update(data, data.idLot).subscribe({
      next: (value) => {
        this.cargarGestionLotes();
        this.accion = 'Editar';
        this.toastr.success('Estado actualizado','Actualización');
        this.log.logObj('Control Calidad Interno', 'Configuración', 'Lotes', 'a', data, JSON.stringify(value), 200, this.datosAnt(datosAnteriores));
      },
      error: (err) => {
      this.log.logObj('Control Calidad Interno', 'Configuración', 'Lotes', 'a', data, err.message, err.status, this.datosAnt(datosAnteriores));
        this.toastr.error('no fue posible actualizar el estado', 'Error')
        this.toastr.error(err.error);    
      }
    });
  }

  datosAnt(data: any) {
    return ` idLot: ${data.idLot} - numlot: ${data.numlot} - expdate: ${data.expdate} - Active: ${!data.active}`;
  }


  eliminarGestionLotes(id: any) {
    let datosAnteriores = this.dataAnt.find(x => x.idLot == id.idLot);
    this.lotesService.delete('Lots', id.idLot).subscribe({
      next:(respuesta)=> {
        this.cargarGestionLotes();
        this.accion = '';
        this.toastr.success('Registro eliminado');
        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo:'Control Calidad Interno',
          Submodulo: 'Configuración',
          Item:'Lotes',
          Metodo: 'eliminación',
          Datos: '',
          DatosAnteriores: this.datosAnt(id),
          respuesta: JSON.stringify(respuesta),
          tipoRespuesta: 200,
          Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
        this.lotesService.createLogAsync(Loguser).then(respuesta => {
        });
      },error:(err) => {
          
        this.toastr.error(this.messageError);
    
        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo:'Control Calidad Interno',
          Submodulo: 'Configuración',
          Item:'Lotes',
          Metodo: 'eliminación',
          Datos: JSON.stringify(id),
          respuesta: err.error,
          tipoRespuesta: err.status,
          Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
        this.lotesService.createLogAsync(Loguser).then(respuesta => {});
      },
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
