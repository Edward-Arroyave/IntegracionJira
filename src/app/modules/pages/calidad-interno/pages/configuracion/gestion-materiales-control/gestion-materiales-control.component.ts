import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SharedService } from '@app/services/shared.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { HttpErrorResponse } from '@angular/common/http';
import { VentanasModalesService } from '@app/services/general/ventanas-modales.service';
import { ControlMaterialService } from '@app/services/configuracion/materialescontrol.service';
import { DatePipe, NgIf, NgClass } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { PermisosEspecialesService } from '@app/services/configuracion/permisos-especiales.service';
import { ImageCdnPipe } from '../../../../../core/pipes/image-cdn.pipe';
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
    selector: 'app-gestion-materiales-control',
    templateUrl: './gestion-materiales-control.component.html',
    styleUrls: ['./gestion-materiales-control.component.css'],
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
       TranslateModule, 
       ImageCdnPipe,
       TablaComunComponent
      ]
})
export class GestionMaterialesControlComponent implements OnInit {
  log = new createLog(this.datePipe, this.translate, this.controlMaterialService);

  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();
  formaGestionMateriales: FormGroup;
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
  antmaterialcontrol:any;
  antestado:any;

  //permisos
  eliminarsi: boolean = false;
  editarsi: boolean = false;
  crearsi: boolean = false;
  rolid: number;
  userid: number;

  buttonValidate: boolean = true;
  dataAnt: any;

  constructor(
    private translate: TranslateService,
    private controlMaterialService: ControlMaterialService,
    private fb: FormBuilder,
    private modalService: BsModalService,
    private sharedService: SharedService,
    private toastr: ToastrService,
    private ventanaService: VentanasModalesService,
    private datePipe: DatePipe,
    private PermisosEspecialesService: PermisosEspecialesService,
    private dialog: MatDialog
  ) { }

  displayedColumns: string[] = ['M. de control', 'Estado', 'Editar', 'Eliminar'];
  dataSource: MatTableDataSource<any>;
  dataTableBody:any[]=[];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  ngOnInit(): void {
    this.cargarGestionMateriales();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();
    this.getPermissionsRol();
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
            this.displayedColumns = ['M. de control'];
          } else if (this.editarsi && this.eliminarsi == false){
            this.displayedColumns = ['M. de control', 'Estado','Editar'];
          } else if (this.editarsi == false && this.eliminarsi){
            this.displayedColumns = ['M. de control','Eliminar'];
          }
        }
    });
  }, error => {
    this.crearsi = false;
    this.editarsi = false;
    this.eliminarsi = false;
    this.displayedColumns = ['M. de control'];
  });
 }


  cargarGestionMateriales() {
    this.controlMaterialService.getAllAsync().then(respuesta => {
      const filtrarDataTable: any[] = respuesta;
      this.dataAnt = respuesta;
      
      this.dataTableBody = filtrarDataTable.map( x =>  {
        return { 'M. de control':x.descontmat,Estado:x.active, item:x, item3:x,item4:x };
      });
      this.dataSource = new MatTableDataSource(respuesta);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  openModalGestionMateriales(templateGestionMateriales: TemplateRef<any>, datos: any) {
    this.crearFormularioGestionMateriales(datos);

    var idcontrolmaterialant = this.formaGestionMateriales.get('idControlMaterial').value;
    this.controlMaterialService.getByIdAsync(idcontrolmaterialant).then((datacontrolmaterialant: any) => {

      this.antmaterialcontrol = datacontrolmaterialant.descontmat;
      this.antestado = datacontrolmaterialant.active;
    }).catch(error => {});

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
      content: templateGestionMateriales,
      btn: this.accionEditar?'Actualizar':'Guardar',
      btn2: 'Cerrar',
      footer:true,
      title: this.accion,
      image:''
    };
    const dialogRef = this.dialog.open(ModalGeneralComponent, { height:'16em' ,width: '40em', data, disableClose: true });

    dialogRef.componentInstance.primaryEvent?.pipe(takeUntil(destroy$)).subscribe(x =>{
      if(this.formaGestionMateriales.invalid){
        this.formaGestionMateriales.markAllAsTouched();
        return
      }
      this.crearEditarGestionMaterial();
      dialogRef.close();
    });
  }

  get desContMatNoValido() {
    return this.formaGestionMateriales.get('desContMat');
  }

  crearFormularioGestionMateriales(datos: any) {
    this.formaGestionMateriales = this.fb.group({
      idControlMaterial: [datos.idControlMaterial ? datos.idControlMaterial : ''],
      desContMat: [datos.descontmat ? datos.descontmat : '', [Validators.required, Validators.minLength(2), Validators.maxLength(200)]],
      active: [datos.active ? datos.active : false]
    });
  }
  crearEditarGestionMaterial() {
    if (!this.formaGestionMateriales.invalid) {
      if (this.accion === 'Crear') {

        this.desactivar = true;
        this.controlMaterialService.create(this.formaGestionMateriales.value).subscribe({
          next:(respuesta)=> {

            this.cargarGestionMateriales();
            this.toastr.success('Registro creado');
            this.desactivar = false;
  
            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo:'Control Calidad Interno',
              Submodulo: 'Configuración',
              Item:'Materiales de Control',
              Metodo: 'creación',
              Datos: ('Material de control : '+ this.formaGestionMateriales.value.desContMat  + ' | Estado: ' +  this.formaGestionMateriales.value.active),
              Respuesta: JSON.stringify(respuesta),
              TipoRespuesta: 200,
              Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }
  
            this.controlMaterialService.createLogAsync(Loguser).then(respuesta => {
            });
          },error:(err) => {
            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo:'Control Calidad Interno',
              Submodulo: 'Configuración',
              Item:'Materiales de Control',
              Metodo:'creación',
              Datos: ('Material de control : '+ this.formaGestionMateriales.value.desContMat  + ' | Estado: ' +  this.formaGestionMateriales.value.active),
              respuesta: err.message,
              tipoRespuesta: err.status,
              Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }
            this.controlMaterialService.createLogAsync(Loguser).then(respuesta => {
            });
  
            this.toastr.error(err.error);
            this.desactivar = false;
              
          },

        });
      } else {
        this.controlMaterialService.update(this.formaGestionMateriales.value, this.formaGestionMateriales.value.idControlMaterial).subscribe({
          next:(respuesta)=> {
  
            this.cargarGestionMateriales();
            this.toastr.success('Registro actualizado');
  
            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo:'Control Calidad Interno',
              Submodulo: 'Configuración',
              Item:'Materiales de Control',
              Metodo: 'actualización',
              Datos: ('Material de control : '+ this.formaGestionMateriales.value.desContMat  + ' | Estado: ' +  this.formaGestionMateriales.value.active),
              DatosAnteriores: ('Material de control : '+ this.antmaterialcontrol  + ' | Estado: ' +  this.antestado),
              Respuesta: JSON.stringify(respuesta),
              TipoRespuesta: 200,
              Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }
  
            this.controlMaterialService.createLogAsync(Loguser).then(respuesta => {
            });
          },error:(err) => {
            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo:'Control Calidad Interno',
              Submodulo: 'Configuración',
              Item:'Materiales de Control',
              Metodo: 'actualización',
              Datos: ('Material de control : '+ this.formaGestionMateriales.value.desContMat  + ' | Estado: ' +  this.formaGestionMateriales.value.active),
              DatosAnteriores: ('Material de control : '+ this.antmaterialcontrol  + ' | Estado: ' +  this.antestado),
              respuesta: err.message,
              tipoRespuesta: err.status,
              Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }
            this.controlMaterialService.createLogAsync(Loguser).then(respuesta => {
            });
  
            this.toastr.error(err.error);
            this.desactivar = false;
              
          },
        });
      }
    }
  }
  actualizarEstadoGestionMaterial(datosGestion:any) {
    const [data,estado ] = datosGestion;
    data.active = estado;
    const datosAnteriores = this.dataAnt.find(x => x.idControlMaterial == data.idControlMaterial);
    this.controlMaterialService.update(data, data.idControlMaterial).subscribe({
      next: (value) => {
        this.cargarGestionMateriales();
        this.accion = 'Editar';
        this.toastr.success('Actulización', 'Estado actualizado');
      this.log.logObj('Control Calidad Interno', 'Configuración', 'Material de control', 'a', data, JSON.stringify(value), 200, this.datosAnt(datosAnteriores));
          
      },error:(err) => {
        this.cargarGestionMateriales();
      this.log.logObj('Control Calidad Interno', 'Configuración', 'Material de control', 'a', data, err.message, err.status, this.datosAnt(datosAnteriores));
        this.toastr.error(err.error);
      },
    });
  }

  datosAnt(data: any) {
    return ` idControlMaterial: ${data.idControlMaterial} - descontmat: ${data.descontmat} - Active: ${!data.active}`;
  }

  eliminarGestionMateriales(id: any) {
    let matcontrolact = null;
    this.controlMaterialService.getByIdAsync(id.idControlMaterial).then((datamat: any) => {
      matcontrolact = datamat.descontmat;
    });

    let datosAnteriores = this.dataAnt.find(x => x.idControlMaterial == id.idControlMaterial);
    
    this.controlMaterialService.delete('ControlMaterial', id.idControlMaterial).subscribe({
      next:(respuesta)=> {
        this.cargarGestionMateriales();
        this.accion = '';
        this.toastr.success('Registro eliminado');
  
        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo:'Control Calidad Interno',
          Submodulo: 'Configuración',
          Item:'Materiales de Control',
          Metodo: 'eliminación',
          Datos: (  id +'| '+ matcontrolact ),
          DatosAnteriores: `${datosAnteriores.idControlMaterial} | Material de control: ${datosAnteriores.descontmat}`,
          respuesta: JSON.stringify(respuesta),
          tipoRespuesta: 200,
          Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
        this.controlMaterialService.createLogAsync(Loguser).then(respuesta => {
        });
      },error:(err) => {
        this.toastr.error(this.messageError);
    
        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo:'Control Calidad Interno',
          Submodulo: 'Configuración',
          Item:'Materiales de Control',
          Metodo: 'eliminación',
          Datos: (  id +'| '+ matcontrolact ),
          respuesta: err.message,
          tipoRespuesta: err.status,
          Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
        this.controlMaterialService.createLogAsync(Loguser).then(respuesta => {
        });
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
