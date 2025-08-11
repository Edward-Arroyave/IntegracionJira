import { Component, OnInit, signal, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { DatePipe, NgIf, NgClass, NgFor, TitleCasePipe } from '@angular/common';
import { UsuariosService } from 'app/services/usuarios/usuarios.service';
import { SidebarService } from 'app/services/general/sidebar.service';
import { PublicService } from '@app/services/public.service';
import { Usuarios } from 'app/Models/Usuarios';
import { AddMenu } from 'app/Models/AddMenu';
import { UserMenu } from 'app/Models/UserMenu';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { DateAdapter, MatOptionModule } from '@angular/material/core';
import dayjs from 'dayjs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ImageCdnPipe } from '@app/modules/core/pipes/image-cdn.pipe';
import { DefaultImagePipe } from '@app/modules/core/pipes/default-image.pipe';
import { TablaComunComponent } from '@app/modules/shared/general-tablas/tabla-comun/tabla-comun.component';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { ModalData } from '@app/Models/Modaldata';
import { ModalGeneralComponent } from '@app/modules/shared/modals/modal-general/modal-general.component';
import { MatIconModule } from '@angular/material/icon';
import { CdkAccordionModule } from '@angular/cdk/accordion';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { LoaderService } from '@app/services/loader/loader.service';

@Component({
  selector: 'app-listar-usuario',
  templateUrl: './listar-usuario.component.html',
  styleUrls: ['./listar-usuario.component.css'],
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
    NgClass,
    MatSelectModule,
    MatOptionModule,
    MatDatepickerModule,
    TranslateModule,
    TitleCasePipe,
    ImageCdnPipe,
    DefaultImagePipe,
    TablaComunComponent,
    MatIconModule,
    NgFor,
    NgIf,
    CdkAccordionModule,
    NgxMatSelectSearchModule
  ],
  animations: [
    trigger('indicatorRotate', [
      state('false', style({ transform: 'rotate(0deg)' })),
      state('true', style({ transform: 'rotate(90deg)' })),
      transition('true <=> false', animate('300ms ease-in-out'))
    ])]
})


export class ListarUsuarioComponent implements OnInit {


  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();
  MenusXuserid: any;
  lista: any[];
  user: any;
  permisosUser = [];
  moduleAcess = [];
  formaRegistroParametro: FormGroup;
  formEditPass: FormGroup = this.fb.group({
    pass: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20)]],
    newPass: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20)]],
    confirmNewPass: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20)]]
  });
  today = dayjs().format('YYYY-MM-DD');
  listaSedes: any;
  sedesActive: any;
  listaRoles: any;
  listaRolesFilter: any;
  listaDocs: any;
  docsActive: any;
  docsActiveFilter: any;
  desactivar = false;
  accionEditar: any;
  tituloAccion: any;
  vantanaModal: BsModalRef;
  spin: boolean = false;
  titulo: any;
  foto: string;
  text: any;
  cancelar: any;
  confirmar: any;

  menuListAll: any[] = [];
  menuIdsAssigned: any[] = [];
  menuListAssignedDb: any[] = [];
  menuListPendingDb: any[] = [];
  menuListAssigned: any[] = [];
  menuListPending: any[] = [];
  seleccionados: any[] = [];

  formAsignarMenUsuario: FormGroup;
  idUsuario: number;

  nameant: any;
  lastnameant: any;
  usernameant: any;

  visualizarPass = signal<string>('password');
  visualizarIcon = signal<string>('visibility_off');

  flagPermisos: boolean = false;

  filterDoc = new FormControl('');
  filterRole = new FormControl('');


  inputTypes = {
    pass: 'password',
    newPass: 'password',
    confirmNewPass: 'password',
  };

  visibilityIcon = {
    pass: 'visibility_off',
    newPass: 'visibility_off',
    confirmNewPass: 'visibility_off',
  };
  constructor(private translate: TranslateService,
    private datePipe: DatePipe,
    private modalService: BsModalService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private sidebarService: SidebarService,
    private publicService: PublicService,
    private usuariosService: UsuariosService,
    public sidebarservice: SidebarService,
    private _adapter: DateAdapter<any>,
    private dialog: MatDialog,
    private loaderSvc: LoaderService
    
  ) { }

  userList: any[];
  displayedColumns: string[] = ['Nombre', 'Apellido', 'Usuario', 'Email', 'Estado', 'Permisos', 'Contraseña', 'Editar', 'Eliminar'];
  dataSource: MatTableDataSource<any>;
  dataTableBody: any[] = [];

  @ViewChild('templateAsignarMenu', { read: TemplateRef }) templateAsignarMenu: TemplateRef<any>;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  ngOnInit(): void {
    this.cargarUsuarios();
    this.obtenerMenu();
    this.cargarRoles();
    this.cargarSedes();
    this.cargarTiposDoc();
    // this.validarPermisosUser();
    this.titulosSwal();
    this._adapter.setLocale('es');
    this.filtrosAutocomplete();
  }

  filtrosAutocomplete() {
    this.filterDoc.valueChanges.subscribe(word => {
      if (word) {
        this.docsActive = this.docsActiveFilter.filter((item: any) => {
          return item.desparam.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.docsActive = this.docsActiveFilter;
      }
    });

    this.filterRole.valueChanges.subscribe(word => {
      if (word) {
        this.listaRoles = this.listaRolesFilter.filter((item: any) => {
          return item.namerol.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.listaRoles = this.listaRolesFilter;
      }
    });
  }



  visualizarPassFn() {
    if (this.visualizarPass() === 'text') {
      this.visualizarPass.set('password');
      this.visualizarIcon.set('visibility_off');
      return
    }
    this.visualizarIcon.set('visibility');
    this.visualizarPass.set('text');
  }

  // async validarPermisosUser() {
  //   const user = sessionStorage.getItem('userid');
  //   this.permisosUser = await this.usuariosService.obtenerPermisosXuser(user);
  //   this.permisosUser.forEach(async (p: any) => {
  //     if (p.eliminar === 0 || p.editar === 0) {
  //       const action = p.eliminar === 0 ? 'editar' : 'borrar';
  //       this.displayedColumns = ['name', 'lastname', 'username', 'email', 'Active', action];
  //       this.userList = await this.usuariosService.listarusuarios();
  //       this.dataSource = new MatTableDataSource(this.userList);
  //     }
  //     const ModuleAccess = await this.usuariosService.ObtenerModule(p.idmoduleaccess);
  //     this.moduleAcess.push(ModuleAccess); // TODO: Validar que se hace con este array, abajo repite código y no se usa en el template

  //     if (ModuleAccess.length > 0) {
  //       this.moduleAcess.push(ModuleAccess);
  //     }
  //   });
  // }

  async cargarUsuarios() {
    this.userList = await this.usuariosService.Listinfousuarios();
    const filtrarDataTable: any[] = this.userList;
    this.dataTableBody = filtrarDataTable.map(x => {
      return {
        Nombre: x.name,
        Apellido: x.lastname,
        Usuario: x.username,
        Email: x.email,
        Estado: x.active,
        'Contraseña':x,
        item: x, 
        item6: x,
        item7: x,
        item8: x
      };
    });

    this.dataSource = new MatTableDataSource(this.userList);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }



  getFoto(foto: File) {
    if (foto != undefined) {
      this.spin = true;
      var reader = new FileReader();
      var base64: any;
      reader.readAsDataURL(foto);
      reader.onload = function () {
        base64 = reader.result;
      };
      setTimeout(() => {
        this.spin = false;
        this.foto = base64.substr(base64.indexOf(',') + 1);
      }, 3000)
    }

  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  actualizarEstadoUsuario(datosUsuario: any[]) {
    const [data, estado] = datosUsuario;
    const datos = {

      userid: data.userid,
      rolid: data.rolid,
      typeid: data.typeid,
      nrodoc: data.nrodoc,
      idparametro: data.idparametro,
      tarprof: data.tarprof,
      name: data.name,
      lastname: data.lastname,
      birthdate: data.birthdate,
      phone: data.phone,
      username: data.username,
      pass: data.pass,
      email: data.email,
      datecreate: data.datecreate,
      dateexp: data.dateexp,
      ativeexp: data.ativeexp,
      superusersede: data.superusersede,
      active: estado

    }

    this.usuariosService.updateAsync(datos, data.userid).then((data: any) => {
      this.toastr.success('Registro actualizado');
      this.cargarUsuarios();
    }, (error) => {
      // handle the error here, show some alerts, warnings, etc
    });
  }


  get nombreNoValido() {
    return this.formaRegistroParametro.get('nombres');
  }
  get apellidoNoValido() {
    return this.formaRegistroParametro.get('apellidos');
  }
  get usuarioIdNoValido() {
    return this.formaRegistroParametro.get('usuarioId');
  }
  get nombreUsuarioNoValido() {
    return this.formaRegistroParametro.get('nombreUsuario');
  }
  get passwordUsuarioNoValido() {
    return this.formaRegistroParametro.get('pass');
  }
  get tipoDocumentoNoValido() {
    return this.formaRegistroParametro.get('tipoDocumento');
  }
  get numeroDocumentoNoValido() {
    return this.formaRegistroParametro.get('numeroDocumento');
  }
  get celularNoValido() {
    return this.formaRegistroParametro.get('celular');
  }
  get fechaNacimientoNoValido() {
    return this.formaRegistroParametro.get('fechaNacimiento');
  }
  get tarjetaProfesionalNoValido() {
    return this.formaRegistroParametro.get('tarjetaProfesional');
  }
  get correoElectronicoNoValido() {
    return this.formaRegistroParametro.get('correoElectronico');
  }

  get rolNoValido() {
    return this.formaRegistroParametro.get('rol');
  }

  get fechaExpiracionNoValido() {
    return this.formaRegistroParametro.get('fechaExpiracion');
  }


  openModalRegistroUsuario(templateRegistroUsuario: TemplateRef<any>, datos: any) {
    this.spin = false;
    this.crearFormularioRegistroUsuario(datos);
    if (datos.userid != null) {
      this.usuariosService.getUser(datos.userid).then((res: any) => {
        if (res.imagenuser) {
          this.foto = res.imagenuser;
        } else {
          this.foto = '';
        }
      }, (err: any) => {

      })
    } else {
      this.foto = '';
    }

    this.desactivar = false;

    if (datos) {
      this.accionEditar = true;
      this.tituloAccion = "Editar";
    } else {
      this.accionEditar = false;
      this.tituloAccion = "Crear";
    }

    this.crearFormularioRegistroUsuario(datos);

    const destroy$: Subject<boolean> = new Subject<boolean>();
    /* Variables recibidas por el modal */
    const data: ModalData = {
      content: templateRegistroUsuario,
      btn: this.accionEditar ? 'Actualizar' : 'Guardar',
      btn2: 'Cerrar',
      footer: true,
      title: this.tituloAccion,
      image: ''
    };
    const dialogRef = this.dialog.open(ModalGeneralComponent, { height: 'auto', width: '75em', data, disableClose: true });

    dialogRef.componentInstance.primaryEvent?.pipe(takeUntil(destroy$)).subscribe(x => {
      if(this.formaRegistroParametro.invalid){
        this.formaRegistroParametro.markAllAsTouched();
        return
      }
      this.crearEditarUsusario();
      dialogRef.close();
    });

    if (this.formaRegistroParametro.value.userid !== '') {
      this.cargarSedesUsuario();
    }

  }

  openModalEditPass(templateEditPass: TemplateRef<any>, $event: any) { 
    this.inputTypes = {
      pass: 'password',
      newPass: 'password',
      confirmNewPass: 'password',
    };

    this.visibilityIcon = {
      pass: 'visibility_off',
      newPass: 'visibility_off',
      confirmNewPass: 'visibility_off',
    };

    const destroy$: Subject<boolean> = new Subject<boolean>();
    
    const data: ModalData = {
      content: templateEditPass,
      btn: 'Guardar',
      btn2: 'Cerrar',
      footer: true,
      title: 'Actualización de contraseña',
      image: 'assets/rutas/gestion-acciones-correctivas.png'
    };

    const dialogRef = this.dialog.open(ModalGeneralComponent, { height: 'auto', width: '55em', data, disableClose: true });

    dialogRef.componentInstance.primaryEvent?.pipe(takeUntil(destroy$)).subscribe(x => {
      if(this.formEditPass.invalid){
        this.formEditPass.markAllAsTouched();
        return
      }

      if (this.formEditPass.value.newPass != this.formEditPass.value.confirmNewPass) {
        this.toastr.error(this.translate.instant("La contraseña nueva no coincide"));
        return;
      }
    this.loaderSvc.show();

      const datos =  {
        pass: this.formEditPass.value.newPass,
        username: $event.username,
        passActual: this.formEditPass.value.pass,
        ConfirmPass: this.formEditPass.value.confirmNewPass,
      }
      
      this.usuariosService.restaurarcontrasena(datos).subscribe(respuesta => {
        this.toastr.success(this.translate.instant(respuesta.mensaje));
        
        let dataUser = {
          pass: this.formEditPass.value.newPass,
          username: $event.username
        }
        this.emailNotification(dataUser, true);
        this.formEditPass.reset();
        dialogRef.close();
      }, (error)=>{
        this.toastr.error(this.translate.instant(error.error.message));
        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          Hora: this.dateNowISO,
          Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGCREADO'),
          Datos: JSON.stringify(datos),
          Respuesta: JSON.stringify(error),
          TipoRespuesta: status
        }
        this.usuariosService.createLogAsync(Loguser).then(respuesta => { });
        this.formEditPass.reset();
    this.loaderSvc.hide();

        dialogRef.close();
      });

    });

    dialogRef.componentInstance.secondaryEvent?.pipe(takeUntil(destroy$)).subscribe(x => {
      this.formEditPass.reset();
      dialogRef.close();
    });
  }

  emailNotification(dataUser:any, updatePass: boolean) {
    this.loaderSvc.show();
    this.usuariosService.recuperacionContrasena(dataUser, updatePass).subscribe({
      next: (data) => {
        this.toastr.success(data.mensaje);
        this.loaderSvc.hide();
      },
      error: (error: any) => {
        this.toastr.error('Fallo al enviar el correo. ¡Intente en unos minutos!');
        this.loaderSvc.hide();
      }
    });
  }




  async cargarSedes() {
    this.listaSedes = await this.publicService.obtenerSedes();
    this.sedesActive = this.listaSedes.filter(e => e.active === true);
  }

  async cargarRoles() {
    this.listaRoles = await this.publicService.obtenerRoles();
    this.listaRolesFilter = await this.publicService.obtenerRoles();
  }

  async cargarTiposDoc() {
    this.listaDocs = await this.publicService.obtenerTiposDoc();
    this.docsActive = this.listaDocs.filter(e => e.active === true);
    this.docsActiveFilter = this.listaDocs.filter(e => e.active === true);
  }

  validaterol() {
    this.usuariosService.validarRol();
  }

  async cargarSedesUsuario() {
    this.user = this.formaRegistroParametro.value.userid;
    const listSedesUser = await this.usuariosService.obtenerSedesXUsuario(this.user);
    for (let i = 0; i < listSedesUser.length; i++) {
      this.lista = listSedesUser[i].desheadquarters; // TODO: validar que se hace con la variable list, no se usa en otro lugar
    }
  }

  crearFormularioRegistroUsuario(datos: any) {


    //Se elimino el validador de min y max permitido para la contraseña de 5 a 20, ya que se necesita un modulo de actualización de contraseña
    this.formaRegistroParametro = this.fb.group({
      userid: [datos.userid ? datos.userid : ''],
      typeid: [datos.typeid ? datos.typeid : ''],
      nombres: [datos.name ? datos.name : '', [Validators.required, Validators.minLength(4), Validators.maxLength(50)]],
      apellidos: [datos.lastname ? datos.lastname : '', [Validators.required, Validators.minLength(4), Validators.maxLength(50)]],
      nombreUsuario: [datos.username ? datos.username : '', [Validators.required, Validators.minLength(5), Validators.maxLength(20)]],
      pass: [datos.pass ? datos.pass : '', [Validators.required, Validators.minLength(8), Validators.maxLength(20)]],
      tipoDocumento: [datos.idparametro ? datos.idparametro : '', [Validators.required]],
      numeroDocumento: [datos.nrodoc ? datos.nrodoc : '', [Validators.required]],
      celular: [datos.phone ? datos.phone : '', [Validators.required]],
      fechaNacimiento: [datos.birthdate ? dayjs(datos.birthdate).format() : '', [Validators.required]],
      tarjetaProfesional: [datos.tarprof ? datos.tarprof : '', [Validators.required, Validators.minLength(5), Validators.maxLength(20)]],
      correoElectronico: [datos.email ? datos.email : '', [Validators.required, Validators.minLength(5), Validators.maxLength(50), Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
      rol: [datos.rolid ? datos.rolid : '', [Validators.required]],
      sede: [datos.superusersede ? datos.superusersede : false],
      fechaCreacion: [datos.datecreate ? dayjs(datos.datecreate).format() : this.today],
      fechaExpiracion: [datos.dateexp ? dayjs(datos.dateexp).format() : '', [Validators.required]],
      Active: [datos.active ? datos.active : false],
    });



    if (datos !== '') {

      //this.formaRegistroParametro.get('pass').setValue('');
      this.formaRegistroParametro.get('pass').clearValidators();

    }


  }

  changeDate(id: string) {

    let fechaVencimiento = document.getElementById(id);
    fechaVencimiento.classList.remove('is-valid');

  }

  crearEditarUsusario() {

    var iduser = this.formaRegistroParametro.value.userid;

    this.usuariosService.getByIdAsync(iduser).then((datauserant: any) => {

      this.nameant = datauserant.name;
      this.lastnameant = datauserant.lastname;
      this.usernameant = datauserant.username;

    }).catch(error => { });

    if (!this.formaRegistroParametro.invalid) {
      const usuarioCreate: Usuarios = {
        rolid: this.formaRegistroParametro.get('rol').value,
        typeid: this.formaRegistroParametro.get('tipoDocumento').value,
        name: this.formaRegistroParametro.get('nombres').value,
        lastname: this.formaRegistroParametro.get('apellidos').value,
        nrodoc: this.formaRegistroParametro.get('numeroDocumento').value,
        idparametro: this.formaRegistroParametro.get('tipoDocumento').value,
        tarprof: this.formaRegistroParametro.get('tarjetaProfesional').value,
        birthdate: this.formaRegistroParametro.get('fechaNacimiento').value,
        phone: this.formaRegistroParametro.get('celular').value,
        username: this.formaRegistroParametro.get('nombreUsuario').value,
        pass: this.formaRegistroParametro.get('pass').value,
        email: this.formaRegistroParametro.get('correoElectronico').value,
        datecreate: this.formaRegistroParametro.get('fechaCreacion').value,
        dateexp: this.formaRegistroParametro.get('fechaExpiracion').value,
        ativeexp: this.formaRegistroParametro.get('Active').value,
        active: this.formaRegistroParametro.get('Active').value,
        superusersede: this.formaRegistroParametro.get('sede').value,
        imagenuser: this.foto != '' ? this.foto : ''
      };


      if (this.tituloAccion === 'Crear') {
        this.desactivar = true;
        this.usuariosService.createAsync(usuarioCreate).then((data: any) => {

          this.cargarUsuarios();
          this.desactivar = false;
          this.formaRegistroParametro.reset();
          this.openModalAsignarMenu(data);
          this.toastr.success('Registro creado');

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo: 'Configuración',
            Submodulo: 'Usuarios',
            Item: 'Usuario',
            Metodo: 'creación',
            Datos: ('Nombre: ' + usuarioCreate.name + '| ' + 'Apellido: ' + usuarioCreate.lastname + '| ' + 'Username: ' + usuarioCreate.username),
            Respuesta: JSON.stringify(usuarioCreate),
            TipoRespuesta: 200,
            Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          };
          this.usuariosService.createLogAsync(Loguser).then(respuesta => {
          });
          this.desactivar = false;

        }, (error: any) => {

          this.toastr.error(this.translate.instant(error.error.error));
          this.desactivar = false;

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo: 'Configuración',
            Submodulo: 'Usuarios',
            Item: 'Usuario',
            Metodo: 'creación',
            Datos: ('Nombre: ' + usuarioCreate.name + '| ' + 'Apellido: ' + usuarioCreate.lastname + '| ' + 'Username: ' + usuarioCreate.username),
            respuesta: error.message,
            tipoRespuesta: error.status,
            Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          };
          this.usuariosService.createLogAsync(Loguser).then(respuesta => {
          });
        });
      } else {
        const usuarioUpdate: Usuarios = {
          userid: this.formaRegistroParametro.get('userid').value,
          rolid: this.formaRegistroParametro.get('rol').value,
          typeid: this.formaRegistroParametro.get('tipoDocumento').value,
          name: this.formaRegistroParametro.get('nombres').value,
          lastname: this.formaRegistroParametro.get('apellidos').value,
          nrodoc: this.formaRegistroParametro.get('numeroDocumento').value,
          idparametro: this.formaRegistroParametro.get('tipoDocumento').value,
          tarprof: this.formaRegistroParametro.get('tarjetaProfesional').value,
          birthdate: this.formaRegistroParametro.get('fechaNacimiento').value,
          phone: this.formaRegistroParametro.get('celular').value,
          username: this.formaRegistroParametro.get('nombreUsuario').value,
          pass: this.formaRegistroParametro.get('pass').value,
          email: this.formaRegistroParametro.get('correoElectronico').value,
          datecreate: this.formaRegistroParametro.get('fechaCreacion').value,
          dateexp: this.formaRegistroParametro.get('fechaExpiracion').value,
          ativeexp: this.formaRegistroParametro.get('Active').value,
          active: this.formaRegistroParametro.get('Active').value,
          superusersede: this.formaRegistroParametro.get('sede').value,
          imagenuser: this.foto != '' ? this.foto : ''

        };

        const Userid = this.formaRegistroParametro.value.userid;
        this.usuariosService.updateAsync(usuarioUpdate, Userid).then((data: any) => {

          this.cargarUsuarios();
          this.toastr.success('Registro actualizado');

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo: 'Configuración',
            Submodulo: 'Usuarios',
            Item: 'Usuario',
            Metodo: 'actualización',
            Datos: ('Nombre: ' + usuarioUpdate.name + '| ' + 'Apellido: ' + usuarioUpdate.lastname + '| ' + 'Username: ' + usuarioUpdate.username),
            DatosAnteriores: ('Nombre: ' + this.nameant + '| ' + 'Apellido: ' + this.lastnameant + '| ' + 'Username: ' + this.usernameant),
            Respuesta: JSON.stringify(usuarioUpdate),
            TipoRespuesta: 200,
            Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')

          };
          this.usuariosService.createLogAsync(Loguser).then(respuesta => {
          });
        }, (error) => {
          // handle the error here, show some alerts, warnings, etc
          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo: 'Configuración',
            Submodulo: 'Usuarios',
            Item: 'Usuario',
            Metodo: 'actualización',
            Datos: ('Nombre: ' + usuarioUpdate.name + '| ' + 'Apellido: ' + usuarioUpdate.lastname + '| ' + 'Username: ' + usuarioUpdate.username),
            DatosAnteriores: ('Nombre: ' + this.nameant + '| ' + 'Apellido: ' + this.lastnameant + '| ' + 'Username: ' + this.usernameant),
            respuesta: error.message,
            tipoRespuesta: error.status,
            Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          };
          this.usuariosService.createLogAsync(Loguser).then(respuesta => {
          });
        });
      }
    }
  }

  titulosSwal() {
    this.translate.get('MODULES.SWALUSUARIO.TITULO').subscribe(respuesta => this.titulo = respuesta);
    this.translate.get('MODULES.SWALUSUARIO.TEXT').subscribe(respuesta => this.text = respuesta);
    this.translate.get('MODULES.SWALUSUARIO.CANCEL').subscribe(respuesta => this.cancelar = respuesta);
    this.translate.get('MODULES.SWALUSUARIO.CONFIRM').subscribe(respuesta => this.confirmar = respuesta);
  }

/**
 * metodo para eliminar usuario
 * @param id 
 */
async eliminarUsuario(id: any) {
  try {
    const datauser: any = await this.usuariosService.getByIdAsync(id.userid);
    const nameuser = datauser.name;
    const lastnameuser = datauser.lastname;
    const username = datauser.username;

    this.usuariosService.deleteAsync(id.userid).subscribe({
      next: async (data: any) => {
  
        await this.cargarUsuarios();

        // Mostrar mensaje dependiendo del tipo de respuesta
        let mensaje = '';
        if (typeof data === 'string') {
          mensaje = data;
        } else if (typeof data === 'object' && data.mensaje) {
          mensaje = data.mensaje;
        } else {
          mensaje = 'Usuario eliminado exitosamente.';
        }

        this.toastr.success(mensaje);

        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo: 'Configuración',
          Submodulo: 'Usuarios',
          Item: 'Usuario',
          Metodo: 'eliminación',
          Datos: `${id.userid}| ${nameuser}| ${lastnameuser}| ${username}`,
          respuesta: mensaje,
          tipoRespuesta: 200,
          Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        };
        await this.usuariosService.createLogAsync(Loguser);
      },
      error: async (err) => {

        await this.cargarUsuarios();
        this.toastr.error('Error al eliminar el usuario ya que este se encuentre relacionado en otros módulos');

        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo: 'Configuración',
          Submodulo: 'Usuarios',
          Item: 'Usuario',
          Metodo: 'eliminación',
          Datos: `${id.userid}| ${nameuser}| ${lastnameuser}| ${username}`,
          respuesta: err.message,
          tipoRespuesta: err.status,
          Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        };
        await this.usuariosService.createLogAsync(Loguser);
      }
    });

  } catch (error) {
    this.toastr.error('Error al obtener información del usuario.');
  }
}

  // TODO: Validar esta función, no se usa en ningún lado
  async openModalActualizarMenu(templateAsignarMenu: TemplateRef<any>, datos: any) {
    this.menuListAll = await this.sidebarService.obtenerMenuXUser(datos.userid);

    this.asignarMenUsuarioFormulario(datos);
    this.vantanaModal = this.modalService.show(templateAsignarMenu, { backdrop: 'static', keyboard: false });
    this.vantanaModal.setClass('modal-lg');
  }

  async obtenerMenu() {
    this.menuListAll = await this.sidebarService.obtenerMenu();
  }


  async dropped(event: CdkDragDrop<any[]>, action: 'add' | 'remove') {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
      const items = event.container.data;
      const menuIdsArray = this.menuListAssignedDb.map((i: any) => i.menuid);
      if (action === 'add') {
        const menu = items.find((m: any) => !menuIdsArray.includes(m.menuid));
        const resp = await this._saveUserMenu(menu);
        if (resp && resp.menuid && resp.menuid === menu.menuid) {
          this._getAllDataMenus();
        }
      } else {
        const menu = items.find((m: any) => menuIdsArray.includes(m.menuid));
        const itemRemove = this.menuIdsAssigned.find((i: any) => i.menuid === menu.menuid);
        const resp = await this._deleteUserMenu(itemRemove.id);
        if (resp && resp.id && resp.id === itemRemove.id) {
          this._getAllDataMenus();
        }
      }
    }
  }

  async onSelect(id: number) {
    const user = sessionStorage.getItem('userid');
    const user1 = this.formAsignarMenUsuario.value.id;
    const menu = this.formAsignarMenUsuario.value.menuid;

    const InsertMenu: UserMenu = {
      userid: user1,
      menuid: menu,
    };

    this.usuariosService.createUserMenu(InsertMenu).subscribe(respuesta => {
      this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.MENU_ASIGNADO'));
    }, (error) => {
      // handle the error here, show some alerts, warnings, etc
    });
    // this.submenuList = await this.sidebarService.obtenerSubMenuXuser(id, user);
  }

  modalPassFn(field: any) {
    this.inputTypes[field] = this.inputTypes[field] === 'password' ? 'text' : 'password';
    if (this.inputTypes[field] === 'text') {
      this.visibilityIcon[field] = 'visibility';
      return
    }
    this.visibilityIcon[field] = 'visibility_off';
  }

  // TODO: Validar en donde se está usando
  asignarEditarMenUsuario() {
    const user1 = this.formAsignarMenUsuario.value.id;

    for (let i = 0; i < this.menuListAll.length; i++) {
      const accion = this.seleccionados[i].accion;
      const url = this.seleccionados[i].url;
      const valMenuid = this.seleccionados[i].menuid;

      const insertSubMenuser: AddMenu = {
        userid: user1,
        menuid: valMenuid,
        accion,
        url,
      };

      this.usuariosService.create(insertSubMenuser).subscribe(respuesta => {
        this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.MENU_ASIGNADO'));
      }, (error) => {
        // handle the error here, show some alerts, warnings, etc
      });

    }
  }
  //// desarrollo Fabian

    // asignacionMenu
  async openModalAsignarMenu(datos: any) {
    if (datos.userid) {
      this.asignarMenUsuarioFormulario(datos);
      this.idUsuario = datos.userid;
      this._getAllDataMenus();
    } else {
      this.asignarMenUsuarioFormulario(datos);
      this.idUsuario = datos.id;
      this._getAllDataMenus();
    }
    this.flagPermisos = true;
  }

    asignarMenUsuarioFormulario(datos: any) {
    this.formAsignarMenUsuario = this.fb.group({
      id: [datos.Userid ? datos.Userid : ''],
      menuid: ['', Validators.required],
      submenu: ['', Validators.required],
    });
  }
   private async _getAllDataMenus() {
    this.menuIdsAssigned = await this.ValidateMenusXUser(this.idUsuario);

    this.MenusXuserid = await this.usuariosService.obtenerMenu();
    this.MenusXuserid.forEach((m: any) => {
      if (m.menuIcon != '') {
        m.menuIcon = m.menuIcon.replace('iconos', 'iconosModal')
      }
      var filtro = this.menuIdsAssigned.filter(dato => dato.menuid == m.idMenu);

      if (filtro.length > 0) {
        m.activeMenu = true
        m.id = filtro[0].id
      } else {
        m.activeMenu = false
        m.id = null
      }
      m.items.forEach((val: any) => {
        if (val.menuIcon != '') {
          val.menuIcon = val.menuIcon.replace('iconos', 'iconosModal')
        }
        var filtroSubMenu = this.menuIdsAssigned.filter(dato => dato.menuid == val.idMenu);


        if (filtroSubMenu.length > 0) {
          val.activeSubMenu = true
          val.id = filtroSubMenu[0].id
        } else {
          val.activeSubMenu = false
          val.id = null
        }
        val.items.forEach((data: any) => {
          var filtroSubMenu = this.menuIdsAssigned.filter(dato => dato.menuid == data.idMenu);
          if (filtroSubMenu.length > 0) {
            data.activeSubMenu = true
            data.id = filtroSubMenu[0].id
          } else {
            data.activeSubMenu = false
            data.id = null
          }
        })
      })


    });

  }
    async ValidateMenusXUser(userId: number) {
    return this.usuariosService.validarUserMenu(userId);
  }

// async crearEditar(data: any, silent: boolean = false) {
//   if (data.id == null) {
//     const menu = {
//       userid: this.idUsuario,
//       menuid: data.idMenu
//     };
//     const resp = await this._saveUserMenu(menu);
//     await this._getAllDataMenus();
//   } else {
//     // aquí decides si hacer la eliminación en modo silencioso
//     const resp = await this._deleteUserMenu(data.id, silent);
//     if (resp && resp.id && resp.id === data.id) {
//       await this._getAllDataMenus();
//     }
//   }
// }


// async crearEditar(data: any) {
//   this.loader.show();
//   if (data.id == null) {
//     //Crear permiso
//     const menu = {
//       userid: this.idUsuario,
//       menuid: data.idMenu
//     };

//     try {
//       const resp = await this._saveUserMenu(menu);

//       //Si tiene hijos, activarlos también
//       if (data.items?.length > 0) {
//         for (const child of data.items) {
//           await this.crearEditar(child);
//         }
//       }

//       await this._getAllDataMenus();
//     } catch (error) {
//       console.error('Error al asignar permiso:', error);
//     }

//   } else {
//     //Eliminar permiso
//     try {
//       const resp = await this._deleteUserMenu(data.id);

//       //Si tenía hijos activos, desactivarlos también
//       if (data.items?.length > 0) {
//         for (const child of data.items) {
//           if (child.id != null) {
//             await this.crearEditar(child);
//           }
//         }
//       }

//       await this._getAllDataMenus();
//     } catch (error) {
//       console.error('Error al eliminar permiso:', error);
//     }
//   }
// }

async crearEditar(data: any) {
  this.loaderSvc.show(); // 👈 Mostrar loader antes de empezar

  try {
    if (data.id == null) {
      // Crear permiso
      const menu = {
        userid: this.idUsuario,
        menuid: data.idMenu
      };

      try {
        const resp = await this._saveUserMenu(menu);

        // Si tiene hijos, activarlos también
        if (data.items?.length > 0) {
          for (const child of data.items) {
            await this.crearEditar(child);
          }
        }

        await this._getAllDataMenus();
      } catch (error) {
        console.error('Error al asignar permiso:', error);
      }

    } else {
      // Eliminar permiso
      try {
        const resp = await this._deleteUserMenu(data.id);

        // Si tenía hijos activos, desactivarlos también
        if (data.items?.length > 0) {
          for (const child of data.items) {
            if (child.id != null) {
              await this.crearEditar(child);
            }
          }
        }

        await this._getAllDataMenus();
      } catch (error) {
        console.error('Error al eliminar permiso:', error);
      }
    }
  } finally {
    this.loaderSvc.hide(); // 👈 Ocultar loader siempre al final (con éxito o error)
  }
}


  
private _saveUserMenu(menuItem: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const InsertMenu: UserMenu = {
      userid: this.idUsuario,
      menuid: menuItem.menuid
    };

    this.usuariosService.usermenusSave(InsertMenu).subscribe(
      respuesta => {
        this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.MENU_ASIGNADO'));
        resolve(respuesta);
      },
      error => {
        reject(error);
      }
    );
  });
}

private _deleteUserMenu(id: any): Promise<any> {
  return new Promise((resolve, reject) => {
    if (id == null) {
      resolve(null);
      return;
    }

    this.usuariosService.usermenusDeleteEstado(id).subscribe(
      respuesta => {
        this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.MENU_DESASIGNADO'));
        resolve(respuesta);
      },
      error => {
        reject(error);
      }
    );
  });
}


onToggleMenu(item: any) {
  this.crearEditar(item); // Llama directo sin confirmación
} 
}