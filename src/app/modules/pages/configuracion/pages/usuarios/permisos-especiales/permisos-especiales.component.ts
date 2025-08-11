import { Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { UsuariosService } from "@app/services/usuarios/usuarios.service";
import { FormBuilder, FormGroup, Validators, AbstractControl, FormsModule, ReactiveFormsModule, FormControl } from "@angular/forms";
import { DatePipe, NgStyle, NgIf, NgFor, AsyncPipe } from '@angular/common';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { Rol } from "@app/interfaces/get-rol.interface";
import { ConfiguracionObjetivosAnalitoService } from '@app/services/configuracion/configuracion-objetivos-analito.service';
import { PermisosEspecialesService } from "@app/services/configuracion/permisos-especiales.service";

import { User } from "@app/interfaces/user.interface";
import { Observable, Subject, takeUntil } from 'rxjs';
import { RolService } from '@app/services/configuracion/rol.service';
import { ToastrService } from 'ngx-toastr';
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { TablaPermisosComponent } from "./tabla-permisos/tabla-permisos.component";
import { MatOptionModule } from "@angular/material/core";
import { MatSelectModule } from "@angular/material/select";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatCardModule } from "@angular/material/card";
import { ImageCdnPipe } from "@app/modules/core/pipes/image-cdn.pipe";
import { ModuleAccesses } from "@app/interfaces/module-access";
import { PublicService } from "@app/services/public.service";
import { CreateAccessPermission } from "@app/interfaces/permisos.interface";
import { MatIconModule } from "@angular/material/icon";
import { ModalData } from "@app/Models/Modaldata";
import { ModalGeneralComponent } from "@app/modules/shared/modals/modal-general/modal-general.component";
import { MatDialog } from "@angular/material/dialog";
import { NgxMatSelectSearchModule } from "ngx-mat-select-search";


@Component({
    selector: "app-permisos-especiales",
    templateUrl: "./permisos-especiales.component.html",
    styleUrls: ["./permisos-especiales.component.css"],
    standalone: true,
    imports: [
      NgIf,
      MatCardModule,
      FormsModule,
      ReactiveFormsModule,
      MatFormFieldModule,
      MatSelectModule,
      MatOptionModule,
      TablaPermisosComponent,
      MatSlideToggleModule,
      TranslateModule,
      AsyncPipe,
      ImageCdnPipe,
      MatIconModule,
      NgxMatSelectSearchModule
    ],
})
export class PermisosEspecialesComponent implements OnInit {
  roles: Rol[] = [];
  rolesFilter: Rol[] = [];
  form: FormGroup;
  cardVisible:boolean = false;
  usuarios: User[] = [];
  moduleAccesses: any[];
  moduleAccessesFilter: any;
  rolid:any;
  namerol: any;
  filterModule = new FormControl('');
  filterRole = new FormControl('');
  
  

  constructor(
    private datePipe: DatePipe,
    private readonly rolService: PublicService,
    private readonly fb: FormBuilder,
    private readonly usuariosService: UsuariosService,
    private readonly permisosEspecialesService: PermisosEspecialesService,
    private translate: TranslateService,
    private configuracionObjetivosAnalitoService: ConfiguracionObjetivosAnalitoService,
    private RolService: RolService,
    private toastr: ToastrService,
    private dialog: MatDialog
  ) {}

  async ngOnInit(): Promise<void> {
    this.getRolUser();
    this.form = this.fb.group({
      Modulo: ["", Validators.required],
      Rol: ["", Validators.required],
      Usuario: [""],
      Crear: [,],
      Eliminar: [,],
      Editar: [,],
    });
    await Promise.all([
      this.cargarModulos(),
      this.cargarRoles(),
      this.cargarUsuarios(),
    ]);
     this.permisosEspecialesService.getAllModulos().subscribe(
      {
        next:(value) =>{
          this.moduleAccesses = value;
          this.moduleAccessesFilter = value;
        },
      }
    );
    this.permisosEspecialesService.resfreh$.next();
  this.filtrosAutocomplete();
  }

  filtrosAutocomplete() {
    this.filterModule.valueChanges.subscribe(word => {
      if (word) {
        this.moduleAccesses = this.moduleAccessesFilter.filter((item: any) => {
          return item.desmoduleaccess.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.moduleAccesses = this.moduleAccessesFilter;
      }
    });
    
    this.filterRole.valueChanges.subscribe(word => {
      if (word) {
        this.roles = this.rolesFilter.filter((item: any) => {
          return item.namerol.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.roles = this.rolesFilter;
      }
    });
  }

  getRolUser(){
    this.rolid = JSON.parse(sessionStorage.getItem('rolid'));
    this.RolService.getByIdAsync(this.rolid).then((datarol:any)=>{
      this.namerol = datarol.namerol;
    })
    
  }

  showCard(template:TemplateRef<any>): void {
    this.form.reset();
    const destroy$: Subject<boolean> = new Subject<boolean>();
    /* Variables recibidas por el modal */
    const data: ModalData = {
      content: template,
      btn:'Guardar',
      btn2: 'Cerrar',
      footer:true,
      title: 'Crear',
      image:''
    };
    const dialogRef = this.dialog.open(ModalGeneralComponent, { height:'20em' ,width: '40em', data, disableClose: true });

    dialogRef.componentInstance.primaryEvent?.pipe(takeUntil(destroy$)).subscribe(x =>{
      if(this.form.invalid){
        this.form.markAllAsTouched();
        return
      }
      this.sendForm();
      dialogRef.close();
    })
  }

  get modulo(): AbstractControl {
    return this.form.get("Modulo");
  }

  get rol(): AbstractControl {
    return this.form.get("Rol");
  }

  get usuario(): AbstractControl {
    return this.form.get("Usuario");
  }

  async cargarModulos(): Promise<void> {
    // Code for loading modules goes here
  }

  async cargarRoles(): Promise<void> {
    this.roles = await this.rolService.obtenerRoles();
    this.rolesFilter = await this.rolService.obtenerRoles();
  }

  async cargarUsuarios(): Promise<void> {
    this.usuarios = await this.usuariosService.listarusuarios();
  }

  sendForm(): void {
    if (this.form.invalid) {
      return;
    }

    const { Modulo, Rol, Usuario, Crear, Editar, Eliminar } = this.form.value;

    const dto: CreateAccessPermission = {
      idmoduleaccess: Modulo.idmoduleaccess,
      userid: null,
      crear: Crear || false,
      editar: Editar || false,
      eliminar: Eliminar || false,
      rolid: Rol.rolid || false,
    };

    this.permisosEspecialesService.postNuevoPermiso(dto).subscribe(
    {
      next:(val:any)=>{

        //Todo: realizar una card para confirmación de cración de datos
        this.permisosEspecialesService.updatePermisosData();
        this.form.reset();
        this.cardVisible = false;
        
        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo: 'Configuración',
          Submodulo: 'Usuarios',
          Item: 'Permisos especiales',
          Metodo: 'creación',
          Datos: ('Usuario: ' + sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos') + '|Rol: ' + this.namerol + '|Crear: '+ val.crear + '|Editar: ' + val.editar + '|Eliminar: ' + val.eliminar ),
          Respuesta: JSON.stringify(val),
          TipoRespuesta: 200,
          Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }

        this.configuracionObjetivosAnalitoService.createLogAsync(Loguser).then(respuesta => { });
      },
      error:(error) => {
        this.form.reset();
        this.cardVisible = false;
        this.toastr.info(this.translate.instant(error.error));
      }
    })
  }
}
