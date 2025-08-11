import { Component, OnInit, ViewChild, TemplateRef, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SharedService } from '@app/services/shared.service';
import { ToastrService } from 'ngx-toastr';
import { DatePipe} from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { VentanasModalesService } from '@app/services/general/ventanas-modales.service';
import { GeneralConfigurationInterface } from '@app/interfaces/generalConfiguration.interface';
import { LaboratoriosService } from '@app/services/configuracion/laboratorios.service';
import { DefaultImagePipe } from '../../../../../core/pipes/default-image.pipe';
import { ImageCdnPipe } from '../../../../../core/pipes/image-cdn.pipe';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TablaComunComponent } from '@app/modules/shared/general-tablas/tabla-comun/tabla-comun.component';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { ModalData } from '@app/Models/Modaldata';
import { ModalGeneralComponent } from '@app/modules/shared/modals/modal-general/modal-general.component';



@Component({
    selector: 'app-gestion-laboratorios',
    templateUrl: './gestion-laboratorios.component.html',
    styleUrls: ['./gestion-laboratorios.component.css'],
    providers: [DatePipe],
    standalone: true,
    imports: [
        MatFormFieldModule,
        MatInputModule,
        MatTableModule,
        MatSortModule,
        MatPaginatorModule,
        FormsModule,
        ReactiveFormsModule,
        TranslateModule,
        ImageCdnPipe,
        DefaultImagePipe,
        TablaComunComponent
    ],
})

export class GestionLaboratoriosComponent implements OnInit {

  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();
  formaGestionLab: FormGroup;
  accionEditar: any;
  accion: any;
  tituloAccion: any;
  vantanaModal: BsModalRef;
  titulo: any;
  text: any;
  textError: any;
  cancelar: any;
  aceptar: any;
  desactivar = false;
  confirmar: any;
  messageError: any;
  seleccioneArchivo: string;
  foto: any;
  spin: boolean = false;
  nameant:any;
  nitant:any;
  addresant:any;
  phoneant:any;


  constructor(private datePipe: DatePipe,
    private translate: TranslateService,
    private laboratoriosService: LaboratoriosService,
    private fb: FormBuilder,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private ventanaService: VentanasModalesService,
    private sharedService: SharedService,
    private dialog: MatDialog,) { }

  displayedColumns: string[] = ['Nombre', 'Nit', 'Dirección', 'Teléfono', 'Email', 'Contacto', 'Editar'];
  dataSource: MatTableDataSource<any>;
  dataTableBody:any[]=[];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;


  ngOnInit(): void {
    this.cargarGestionLab();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();
  }
  openModal(descripcion) {
    const data = { descripcion: descripcion, accion: this.accion }
    this.ventanaService.openModal(data);
  }
  async cargarGestionLab() {
    this.laboratoriosService.getAllAsync().then(async respuesta => {
      const filtrarDataTable:any[] = respuesta;
      this.dataTableBody = filtrarDataTable.map( x =>  { 
        return { Nombre:x.name,Nit:x.nit,Dirección:x.addres,Teléfono:x.phone,Email:x.email,Contacto:x.contact, item: x, item7:x };
      });
      this.dataSource = new MatTableDataSource(respuesta);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  openModalGestionLab(templateGestionLab: TemplateRef<any>, datos: any) {
    if (datos == '') {
      this.foto = '';
      if (this.dataSource.filteredData.length < 1) {
        this.crearFormularioGestionLab(datos);
        this.modal(templateGestionLab,datos);
      } else {
        this.accion = 'noDatos';
        this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.SOLOUNLAB'));
      }

    } else {

      this.laboratoriosService.getByIdlab(datos.idconfiguration).then((response: GeneralConfigurationInterface) => {

        if (response.logo) {

          this.foto = response.logo;

        } else {

          this.foto = '';

        }

        this.crearFormularioGestionLab(response);
        this.modal(templateGestionLab,response);
      });

    }
  }

  modal(templateGestionLab: TemplateRef<any>, datos: any){
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
      content: templateGestionLab,
      btn: this.accionEditar?'Actualizar':'Guardar',
      btn2: 'Cerrar',
      footer:true,
      title: this.accion,
      image:''
    };
    const dialogRef = this.dialog.open(ModalGeneralComponent, { height:'auto' ,width: '50em', data, disableClose: true });

    dialogRef.componentInstance.primaryEvent?.pipe(takeUntil(destroy$)).subscribe(x =>{
      if(this.formaGestionLab.invalid){
        this.formaGestionLab.markAllAsTouched();
        return
      }
      this.crearEditarGestionLab();
      dialogRef.close();
    });
  }

  get nameNoValido() {
    return this.formaGestionLab.get('name');
  }
  get nitNoValido() {
    return this.formaGestionLab.get('nit');
  }
  get addresNoValido() {
    return this.formaGestionLab.get('addres');
  }
  get phoneNoValido() {
    return this.formaGestionLab.get('phone');
  }
  get emailNoValido() {
    return this.formaGestionLab.get('email');
  }
  get contactNoValido() {
    return this.formaGestionLab.get('contact');
  }
  get profesionNoValido() {
    return this.formaGestionLab.get('profession');
  }


  crearFormularioGestionLab(datos: any) {

    this.formaGestionLab = this.fb.group({

      idconfiguration: [datos.idconfiguration ? datos.idconfiguration : ''],
      name: [datos.name ? datos.name : '', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      nit: [datos.nit ? datos.nit : '', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      addres: [datos.addres ? datos.addres : '', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      phone: [datos.phone ? datos.phone : '', [Validators.required, Validators.minLength(7), Validators.maxLength(50)]],
      email: [datos.email ? datos.email : '', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
      contact: [datos.contact ? datos.contact : '', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      profession: [datos.profession ? datos.profession : '', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      logo: [datos.logo ? datos.logo : this.foto],
      header: [datos.header ? datos.header : '']
    });

  }

  getFoto(foto: File) {

    if( foto != undefined ){

      this.spin = true;
      var reader = new FileReader();
      var base64: any;
      reader.readAsDataURL(foto);
      reader.onload = function () {

        base64 = reader.result;

      };

      setTimeout( () => {

        this.spin = false;
        this.foto = base64.substr(base64.indexOf(',') + 1);

      }, 3000)

    }

  }

  crearEditarGestionLab() {

    if (!this.formaGestionLab.invalid) {

      var idlabgeneral = this.formaGestionLab.value.idconfiguration;

      this.laboratoriosService.getByIdlab(idlabgeneral).then((datalab: any) => {
        
        this.nameant = datalab.name;
        this.nitant = datalab.nit;
        this.addresant = datalab.addres;
        this.phoneant = datalab.phone;
        
      }).catch(error => {});

      if (this.accion === 'Crear') {

        this.desactivar = true;

        const datos = {

          idconfiguration: this.formaGestionLab.value.idconfiguration,
          name: this.formaGestionLab.value.name,
          nit: this.formaGestionLab.value.nit,
          addres: this.formaGestionLab.value.addres,
          phone: this.formaGestionLab.value.phone,
          email: this.formaGestionLab.value.email,
          contact: this.formaGestionLab.value.contact,
          profession: this.formaGestionLab.value.profession,
          logo: this.foto != '' ? this.foto : '',
          
        }

        this.laboratoriosService.create(datos).subscribe(async respuesta => {

          this.cargarGestionLab();
          this.toastr.success('Registro creado');
          this.desactivar = false;

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Configuración',
            Submodulo: 'Generalidades',
            Item:'Configuración General',
            Metodo: 'creación',
            Datos: ('Nombre: ' + datos.name + '| ' + 'Nit: ' +  datos.nit + '| Dirección: ' + datos.addres + '| Teléfono: ' + datos.phone ),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: 200,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }


          this.laboratoriosService.createLogAsync(Loguser).then(respuesta => { });

        }, (error) => {


          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Configuración',
            Submodulo: 'Generalidades',
            Item:'Configuración General',
            Metodo: 'creación',
            Datos: ('Nombre: ' + datos.name + '| ' + 'Nit: ' +  datos.nit + '| Dirección: ' + datos.addres + '| Teléfono: ' + datos.phone ),
            respuesta: error.message,
            tipoRespuesta: error.status,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }
          this.laboratoriosService.createLogAsync(Loguser).then(respuesta => { });

        });

      } else {
        const datos = {

          idconfiguration: this.formaGestionLab.value.idconfiguration,
          name: this.formaGestionLab.value.name,
          nit: this.formaGestionLab.value.nit,
          addres: this.formaGestionLab.value.addres,
          phone: this.formaGestionLab.value.phone,
          email: this.formaGestionLab.value.email,
          contact: this.formaGestionLab.value.contact,
          profession: this.formaGestionLab.value.profession,
          logo: this.foto != '' ? this.foto : '',
          header: this.formaGestionLab.value.header
        }

        this.laboratoriosService.update(datos, this.formaGestionLab.value.idconfiguration).subscribe(async respuesta => {
          await this.cargarGestionLab();
          this.toastr.success('Registro actualizado');

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Configuración',
            Submodulo: 'Generalidades',
            Item:'Configuración General',
            Metodo: 'actualización',
            Datos: ('Nombre: ' + datos.name + '| ' + 'Nit: ' +  datos.nit + '| Dirección: ' + datos.addres + '| Teléfono: ' + datos.phone ),
            DatosAnteriores: ('Nombre: ' + this.nameant + '| ' + 'Nit: ' +  this.nitant + '| Dirección: ' + this.addresant + '| Teléfono: ' + this.phoneant ),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: 200,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }


          this.laboratoriosService.createLogAsync(Loguser).then(respuesta => {
          });

        }, (error) => {

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Configuración',
            Submodulo: 'Generalidades',
            Item:'Configuración General',
            Metodo: 'actualización',
            Datos: ('Nombre: ' + datos.name + '| ' + 'Nit: ' +  datos.nit + '| Dirección: ' + datos.addres + '| Teléfono: ' + datos.phone ),
            DatosAnteriores: ('Nombre: ' + this.nameant + '| ' + 'Nit: ' +  this.nitant + '| Dirección: ' + this.addresant + '| Teléfono: ' + this.phoneant ),
            respuesta: error.message,
            tipoRespuesta: error.status,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }

          this.laboratoriosService.createLogAsync(Loguser).then(respuesta => { });

        });

      }

    }

  }

  titulosSwal() {
    this.translate.get('MODULES.SWAL.TITULO_ERROR').subscribe(respuesta => this.titulo = `<b>${respuesta}</b>`);
    this.translate.get('MODULES.SWAL.TEXT2').subscribe(respuesta => this.text = respuesta);
    this.translate.get('MODULES.SWAL.ACEPTAR').subscribe(respuesta => this.aceptar = respuesta);
    this.translate.get('MODULES.CLIENTES.FORMULARIO.SELECCIONEARCHIVO').subscribe(respuesta => this.seleccioneArchivo = respuesta);

  }
  closeVentana(): void {
    this.vantanaModal.hide();
    this.titulosSwal();
  }

}
