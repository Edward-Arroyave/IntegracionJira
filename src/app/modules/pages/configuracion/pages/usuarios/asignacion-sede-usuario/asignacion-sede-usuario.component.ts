import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SharedService } from '@app/services/shared.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
import { UsuariosService } from '@app/services/usuarios/usuarios.service';
import { UserheadquartersService } from '@app/services/configuracion/userheadquarters.service';
import { VentanasModalesService } from '@app/services/general/ventanas-modales.service';
import { SedesService } from '@app/services/configuracion/sedes.service';
import { DatePipe, NgIf, NgFor } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ImageCdnPipe } from '@app/modules/core/pipes/image-cdn.pipe';
import { TablaComunComponent } from '@app/modules/shared/general-tablas/tabla-comun/tabla-comun.component';
import { MatDialog } from '@angular/material/dialog';
import { lastValueFrom, Subject, takeUntil } from 'rxjs';
import { ModalData } from '@app/Models/Modaldata';
import { ModalGeneralComponent } from '@app/modules/shared/modals/modal-general/modal-general.component';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

@Component({
    selector: 'app-asignacion-sede-usuario',
    templateUrl: './asignacion-sede-usuario.component.html',
    styleUrls: ['./asignacion-sede-usuario.component.css'],
    providers: [DatePipe],
    standalone: true,
    imports: [
      MatFormFieldModule,
      MatInputModule,
      MatTableModule,
      MatSortModule,
      MatPaginatorModule,
      NgIf,
      FormsModule,
      ReactiveFormsModule,
      MatSelectModule,
      MatOptionModule,
      NgFor,
      TranslateModule,
      ImageCdnPipe,
      TablaComunComponent,
      NgxMatSelectSearchModule
    ]
})
export class AsignacionSedeUsuarioComponent implements OnInit {
  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();

  formaRegistroAsignacionSede: FormGroup;
  accionEditar: any;
  accion: any;
  tituloAccion: any;
  vantanaModal: BsModalRef;
  listaUsuarios: [];
  listaUsuariosFilter: any;
  desactivar = false;
  listaUsuariosSede: any[];
  detalleSede = [];
  detalleUsuario = [];
  listaSedes: [];
  listaSedesFilter: any;
  titulo: any;
  text: any;
  cancelar: any;
  confirmar: any;
  messageError: any;

  userant: any;
  lastnameant:any;
  sedeant: any;
  activeant:any;

  usernew:any;
  lasnamenew:any;
  sedenew:any;

  banderacreate :boolean;
  filterSede = new FormControl('');
  filterUser = new FormControl('');

  constructor(
    private translate: TranslateService,
    private usuariosService: UsuariosService,
    private sedesService: SedesService,
    private fb: FormBuilder,
    private modalService: BsModalService,
    private sharedService: SharedService,
    private ventanaService: VentanasModalesService,
    private userheadquartersService: UserheadquartersService,
    private datePipe: DatePipe,
    private toastr: ToastrService,
    private dialog: MatDialog,
  ) { }
  displayedColumns: string[] = ['Usuario', 'Sede', 'Editar', 'Eliminar'];
  dataSource: MatTableDataSource<any>;
  dataTableBody:any[]=[];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  ngOnInit(): void {
    this.cargarSedesUsuarios();
    this.cargarUsuarios();
    this.cargarSedes();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();
   this.filtrosAutocomplete();
  }

  filtrosAutocomplete() {
    this.filterSede.valueChanges.subscribe(word => {
      if (word) {
        this.listaSedes = this.listaSedesFilter.filter((item: any) => {
          return item.Desheadquarters.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.listaSedes = this.listaSedesFilter;
      }
    });

    this.filterUser.valueChanges.subscribe(word => {
      if (word) {
        this.listaUsuarios = this.listaUsuariosFilter.filter((item: any) => {
          return item.Username.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.listaUsuarios = this.listaUsuariosFilter;
      }
    });
  }
  openModal(descripcion) {
    const data = { descripcion: descripcion, accion: this.accion }
    this.ventanaService.openModal(data);
  }
  async cargarSedesUsuarios() {

    this.listaUsuariosSede = await this.usuariosService.DetalleUsuarioSede();
    const filtrarDataTable:any[] = this.listaUsuariosSede;
    this.dataTableBody = filtrarDataTable.map( x =>  { 
      return { Usuario:x.Username,Sede:x.Desheadquarters, item: x, item3:x,item4:x };
    });
    this.dataSource = new MatTableDataSource(this.listaUsuariosSede);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

  }
  cargarUsuarios() {
    this.usuariosService.getAllAsync().then(respuesta => {
      this.listaUsuarios = respuesta.filter(datos => datos.Active == true);
      this.listaUsuariosFilter = respuesta.filter(datos => datos.Active == true);
    });
  }
  cargarSedes() {
    this.sedesService.getAllAsync().then(respuesta => {
      this.listaSedes = respuesta.filter(datos => datos.Active == true);
      this.listaSedesFilter = respuesta.filter(datos => datos.Active == true);
    });
  }
  openModalAsignacionSede(templateAsignacionSede: TemplateRef<any>, datos: any) {

    this.crearFormularioAsignacionSede(datos);

    if(datos.Iduserheadquarter != null){
      this.usuariosService.getByIdAsync(datos.Userid).then((datauserant: any) => {
        
        this.userant = datauserant.name;
        this.lastnameant = datauserant.lastname;
        
      }).catch(error => {});

      this.sedeant = datos.Desheadquarters
    }

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
      content: templateAsignacionSede,
      btn: this.accionEditar?'Actualizar':'Guardar',
      btn2: 'Cerrar',
      footer:true,
      title: this.accion,
      image:''
    };
    const dialogRef = this.dialog.open(ModalGeneralComponent, { height:'16em' ,width: '30em', data, disableClose: true });

    dialogRef.componentInstance.primaryEvent?.pipe(takeUntil(destroy$)).subscribe(x =>{
      if(this.formaRegistroAsignacionSede.invalid){
        this.formaRegistroAsignacionSede.markAllAsTouched();
        return
      }
      this.crearEditarAsignacionSede();
      dialogRef.close();
    });
  }

  get userIdNoValido() {
    return this.formaRegistroAsignacionSede.get('userid');
  }
  get idheadquartersNoValido() {
    return this.formaRegistroAsignacionSede.get('idheadquarters');
  }
  crearFormularioAsignacionSede(datos: any) {

    this.formaRegistroAsignacionSede = this.fb.group({
      iduserheadquarter: [datos.Iduserheadquarter ? datos.Iduserheadquarter : ''],
      userid: [datos.Userid ? datos.Userid : '', [Validators.required]],
      idheadquarters: [datos.Idheadquarters ? datos.Idheadquarters : '', [Validators.required]]
    });

    
  }

  eliminarAsignacionSede(id: any) {

    let desuser :any;
    let dessede:any;

    console.log(id);
    

    this.userheadquartersService.getByIdAsync(id).then((datasedeuser: any) => {

      let useridsede = datasedeuser.userid;
      let idsedeuser = datasedeuser.idheadquarters;
      
      this.usuariosService.getByIdAsync(useridsede).then((datausuario: any) => {
  
        desuser = datausuario.username;
      }).catch(error => {});

      this.sedesService.getByIdAsync(idsedeuser).then((datasedenew: any) => {
        dessede = datasedenew.desheadquarters;
      }).catch(error => {});

    }).catch(error => {});

    this.userheadquartersService.delete('Userheadquarters', id.Iduserheadquarter).subscribe({
      next:(respuesta)=> {
        this.cargarSedesUsuarios();
        this.accion = '';
        this.toastr.success('Registro eliminado');
  
        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo:'Configuración',
          Submodulo: 'Usuarios',
          Item:'Asignación de Sede',
          Metodo: 'eliminación',
          Datos: ('Nombre Usuario: '+ desuser + '| ' + ' Sede asignada: ' + dessede ),
          respuesta: JSON.stringify(respuesta),
          tipoRespuesta: 200,
          Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
        this.userheadquartersService.createLogAsync(Loguser).then(respuesta => {
        });
      },error:(err) => {
        this.toastr.error(this.messageError);
  
        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo:'Configuración',
          Submodulo: 'Usuarios',
          Item:'Asignación de Sede',
          Metodo:'eliminación',
          Datos: ('Nombre Usuario: '+ desuser + '| ' + ' Sede asignada: ' + dessede ),
          respuesta: err.message,
          tipoRespuesta: err.status,
          Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
        this.userheadquartersService.createLogAsync(Loguser).then(respuesta => {
        });
      }
    })

  }
  async crearEditarAsignacionSede() {

    //Obtener datos nuevos -Log
    var idsedenew = this.formaRegistroAsignacionSede.get('idheadquarters').value;
    var useridnew = this.formaRegistroAsignacionSede.get('userid').value;

    await this.sedesService.getinfosedeuser(useridnew,idsedenew).then(respuesta => {
      
      
      if(respuesta == null){
        this.banderacreate = true;
      }else{
        this.banderacreate = false;
      }

    },
    (err: HttpErrorResponse) => {
      this.banderacreate = false;
    });
  
    if(this.banderacreate == true){

      await this.usuariosService.getUser(useridnew).then((datausernew: any) => {
        this.usernew = datausernew.name;
        this.lasnamenew = datausernew.lastname;
      }).catch(error => {});

      await this.sedesService.getByIdAsync(idsedenew).then((datasedenew: any) => {
        this.sedenew = datasedenew.desheadquarters;
      }).catch(error => {});

      if (!this.formaRegistroAsignacionSede.invalid) {
        if (this.accion == 'Crear') {
         
          this.desactivar = true;
          this.userheadquartersService.create(this.formaRegistroAsignacionSede.value).subscribe(respuesta => {
  
            var idsedenew = this.formaRegistroAsignacionSede.get('idheadquarters').value;
            var useridnew = this.formaRegistroAsignacionSede.get('userid').value;
  
            this.usuariosService.getUser(useridnew).then((datausernew: any) => {
                this.usernew = datausernew.name;
                this.lasnamenew = datausernew.lastname;
            }).catch(error => {});
            this.sedesService.getByIdAsync(idsedenew).then((datasedenew: any) => {
              this.sedenew = datasedenew.desheadquarters;
            }).catch(error => {});
            
            this.cargarSedesUsuarios();
            this.toastr.success('Registro creado');
            this.desactivar = false;
  
            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo:'Configuración',
              Submodulo: 'Usuarios',
              Item:'Asignación de Sede',
              Metodo: 'creación',
              Datos: ('Nombre Usuario: '+ this.usernew + ' - ' + this.lasnamenew + '| ' + ' Sede asignada: ' + this.sedenew ),
              Respuesta: JSON.stringify(respuesta),
              TipoRespuesta: 200,
              Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }
  
  
            this.userheadquartersService.createLogAsync(Loguser).then(respuesta => {
            });
          }, (error) => {
            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo:'Configuración',
              Submodulo: 'Usuarios',
              Item:'Asignación de Sede',
              Metodo: 'creación',
              Datos: ('Nombre Usuario: '+ this.usernew + ' ' + this.lasnamenew  + 'Sede asignada: ' + this.sedenew ),
              respuesta: error.message,
              tipoRespuesta: error.status,
              Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }
            this.userheadquartersService.createLogAsync(Loguser).then(respuesta => {
            });
          });
        } else {
  
          this.userheadquartersService.update(this.formaRegistroAsignacionSede.value, this.formaRegistroAsignacionSede.value.iduserheadquarter).subscribe(respuesta => {
            
            
            this.cargarSedesUsuarios();
            this.toastr.success('Registro actualizado');
  
            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo:'Configuración',
              Submodulo: 'Usuarios',
              Item:'Asignación de Sede',
              Metodo: 'creación',
              Datos: ('Nombre Usuario: '+ this.usernew + ' - ' + this.lasnamenew + '| ' + ' Sede asignada: ' + this.sedenew ),
              DatosAnteriores: ('Nombre Usuario: '+ this.userant + ' - ' + this.lastnameant + '| ' + ' Sede asignada: ' + this.sedeant ),
              Respuesta: JSON.stringify(respuesta),
              TipoRespuesta: 200,
              Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }
  
  
            this.userheadquartersService.createLogAsync(Loguser).then(respuesta => {
            });
  
          }, (error) => {
            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo:'Configuración',
              Submodulo: 'Usuarios',
              Item:'Asignación de Sede',
              Metodo:'creación',
              Datos: ('Nombre Usuario: '+ this.usernew + ' - ' + this.lasnamenew + '| ' + ' Sede asignada: ' + this.sedenew ),
              DatosAnteriores: ('Nombre Usuario: '+ this.userant + ' - ' + this.lastnameant + '| ' + ' Sede asignada: ' + this.sedeant ),
              respuesta: error.message,
              tipoRespuesta: error.status,
              Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }
            this.userheadquartersService.createLogAsync(Loguser).then(respuesta => {
            });
  
          });
        }
      }
    }else{
      
      this.toastr.info(this.translate.instant('La sede seleccionada ya esta asiganda al usuario seleccionado.'));
    }
  }

  titulosSwal() {
    this.translate.get('MODULES.SWALUSEDE.TITULO').subscribe(respuesta => this.titulo = respuesta);
    this.translate.get('MODULES.SWALUSEDE.TEXT').subscribe(respuesta => this.text = respuesta);
    this.translate.get('MODULES.SWALUSEDE.CANCEL').subscribe(respuesta => this.cancelar = respuesta);
    this.translate.get('MODULES.SWALUSEDE.CONFIRM').subscribe(respuesta => this.confirmar = respuesta);
    this.translate.get('MODULES.SWAL.MESAGEERROR').subscribe(respuesta => this.messageError = respuesta);

  }
}
