import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ClientesService } from '@app/services/configuracion/clientes.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { VentanasModalesService } from '@app/services/general/ventanas-modales.service';
import { DatePipe, NgIf, NgFor, AsyncPipe } from '@angular/common';
import { SharedService } from '@app/services/shared.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject } from 'rxjs';
import { map, startWith, takeUntil } from 'rxjs/operators';
import { HeaderClientService } from '@app/services/calidad-externo/HeaderClient.service';
import { ImageCdnPipe } from '../../../../../core/pipes/image-cdn.pipe';
import { MatOptionModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TablaComunComponent } from '@app/modules/shared/general-tablas/tabla-comun/tabla-comun.component';
import { MatDialog } from '@angular/material/dialog';
import { LoaderService } from '@app/services/loader/loader.service';
import { ModalData } from '@app/Models/Modaldata';
import { ModalGeneralComponent } from '@app/modules/shared/modals/modal-general/modal-general.component';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css'],
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
    MatAutocompleteModule,
    NgFor,
    MatOptionModule,
    AsyncPipe,
    TranslateModule,
    ImageCdnPipe,
    TablaComunComponent,
    NgxMatSelectSearchModule,
    MatTooltipModule,
    MatSelectModule
  ],
})
export class ClientesComponent implements OnInit {
  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();
  ventanaModal: BsModalRef;
  formaRegistroCliente: FormGroup;
  base64textString: any;
  accionEditar: any;
  tituloAccion: any;
  dataTable = [];
  desactivar = false;
  accion: any;
  image: string;
  messageError: string;
  clientant: any;
  nitant: any;
  seleccioneArchivo: string;
  displayedColumns: string[] = ['Código', 'Cliente', 'NIT', 'Dirección', 'Teléfono', 'Email', 'Contacto', 'Estado', 'Editar', 'Eliminar'];
  dataSource: MatTableDataSource<any>;
  dataTableBody: any[] = [];

  //predictivos create
  filterHeaderClientCreate: Observable<String[]>;
  listHeaderClientCreate: any;
  listHeaderClientCreateCopy: any;
  imageSrc: string | null = null;
  currentBase64: string | null = null;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  filterCliente = new FormControl('')

  constructor(
    private clientesService: ClientesService,
    private modalService: BsModalService,
    private translate: TranslateService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private ventanaService: VentanasModalesService,
    private datePipe: DatePipe,
    private sharedService: SharedService,
    private headerClientService: HeaderClientService,
    private dialog: MatDialog,
    private loaderService: LoaderService
  ) { }

  async ngOnInit(): Promise<void> {
   await this.cargarClientes();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();
    this.filtro();
  }


  filtro() {
    this.filterCliente.valueChanges.subscribe(word => {
      if (word) {
        this.listHeaderClientCreate = this.listHeaderClientCreateCopy.filter((item: any) => {
          return item.descriptionHeader.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.listHeaderClientCreate = this.listHeaderClientCreateCopy
      }
    });
  }
  async cargarClientes() {

    try {
      this.loaderService.show()
      this.loaderService.text.emit({ text: 'Cargando clientes...' })
      let respuesta = await this.clientesService.getAllAsync();
      this.loaderService.hide()
      const filtrarDataTable: any[] = respuesta;
      this.dataTableBody = filtrarDataTable.map(x => {
        return { Código: x.codeClient, Cliente: x.name, NIT: x.nit, Dirección: x.addres, Teléfono: x.phone, Email: x.email, Contacto: x.contact, Estado: x.active, item: x, item9: x, item10: x };
      });
      this.dataTable = respuesta;
      this.dataSource = new MatTableDataSource(respuesta);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    } catch (error) {
      this.loaderService.hide()
    }


  }

  openModal(descripcion) {
    const data = { descripcion: descripcion, accion: this.accion }
    this.ventanaService.openModal(data);
  }

  async openModalRegistroCliente(templateRegistroCliente: TemplateRef<any>, datos: any) {
    this.imageSrc = null
    this.currentBase64 = null
    this.crearFormularioRegistroCliente(datos);
    //-----------------------------
    await this.LoadHeaderClient();

    if (datos.idclient != null) {
      this.clientant = datos.name;
      this.nitant = datos.nit;
    }

    if (datos) {
      this.accionEditar = true;
      this.accion = "Editar";
    } else {
      this.accionEditar = false;
      this.accion = "Crear";
    }
    const destroy$: Subject<boolean> = new Subject<boolean>();
    /* Variables recibidas por el modal */
    const data: ModalData = {
      content: templateRegistroCliente,
      btn: this.accionEditar ? 'Actualizar' : 'Guardar',
      btn2: 'Cerrar',
      footer: true,
      title: this.accion,
      image: this.accionEditar ? 'assets/rutas/iconos/editar.png' : 'assets/rutas/iconos/editar.png',
    };
    const dialogRef = this.dialog.open(ModalGeneralComponent, { height: 'auto', width: '40em', data, disableClose: true });

    dialogRef.componentInstance.primaryEvent?.pipe(takeUntil(destroy$)).subscribe(x => {
      if (this.formaRegistroCliente.invalid) {
        this.formaRegistroCliente.markAllAsTouched();
        return
      }
      this.crearEditarCliente();
      dialogRef.close();
    });
  }

  crearFormularioRegistroCliente(datos: any) {

    this.formaRegistroCliente = this.fb.group({
      idclient: [datos.idclient ? datos.idclient : ''],
      name: [datos.name ? datos.name : '', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      nit: [datos.nit ? datos.nit : '', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      addres: [datos.addres ? datos.addres : '', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      phone: [datos.phone ? datos.phone : '', [Validators.required, Validators.minLength(7), Validators.maxLength(20)]],
      email: [datos.email ? datos.email : '', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
      contact: [datos.contact ? datos.contact : '', [Validators.required, Validators.minLength(7), Validators.maxLength(150)]],
      logo: [datos.logo ? this.image = datos.logo : this.base64textString],
      active: [datos.active ? datos.active : false],
      header: [datos.header ? datos.header : ''],
      codeClient: [datos.codeClient ? datos.codeClient : '']
    });
    console.log(datos.logo)
    if (datos.logo) {
      this.currentBase64 = datos.logo
      this.imageSrc = 'data:image/jpeg;base64,' + datos.logo as string;
    }
  }

  get nameNoValido() {
    return this.formaRegistroCliente.get('name');
  }

  get nitNoValido() {
    return this.formaRegistroCliente.get('nit');
  }

  get addresNoValido() {
    return this.formaRegistroCliente.get('addres');
  }

  get phoneNoValido() {
    return this.formaRegistroCliente.get('phone');
  }

  get emailNoValido() {
    return this.formaRegistroCliente.get('email');
  }

  get contactNoValido() {
    return this.formaRegistroCliente.get('contact');
  }

  crearEditarCliente() {
    if (!this.formaRegistroCliente.invalid) {
      this.desactivar = true;
      if (this.accion === 'Crear') {

        let nit = this.formaRegistroCliente.get('nit').value;
        let existeNit = this.dataTable.find(cliente => cliente.nit == nit) || undefined;

        if (existeNit != undefined) {
          this.accion = 'noDatos';
          this.toastr.info('Ya hay un cliente con ese nit');
        } else {

          let codeClient: string;
          if (this.dataTable.length != 0) {
            codeClient = 'LAB23' + (parseInt(this.dataTable.find(c => c.idclient == Math.max(...this.dataTable.map(c => c.idclient))).codeClient.split("").pop()) + 1).toString().padStart(2, '0');
          } else {
            codeClient = 'LAB2301'
          }
          if (this.currentBase64) {
            this.base64textString = this.currentBase64
          }

          const datos = {
            idclient: this.formaRegistroCliente.value.idclient,
            name: this.formaRegistroCliente.value.name,
            nit: this.formaRegistroCliente.value.nit,
            addres: this.formaRegistroCliente.value.addres,
            phone: this.formaRegistroCliente.value.phone,
            email: this.formaRegistroCliente.value.email,
            contact: this.formaRegistroCliente.value.contact,
            logo: this.base64textString,
            active: this.formaRegistroCliente.value.active,
            header: this.listHeaderClientCreate.find(h => h.descriptionHeader == this.formaRegistroCliente.value.name).headName,
            codeClient: codeClient,

          }

          this.clientesService.create(datos).subscribe(respuesta => {

            this.cargarClientes();
            this.accion = 'Crear';
            this.toastr.success('Registro creado');
            this.base64textString = '';
            this.seleccioneArchivo = '';

            const Loguser = {
              fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo: 'Control Calidad Externo',
              Submodulo: 'Configuración',
              Item: 'Clientes',
              Metodo: 'creación',
              Datos: ('Cliente: ' + datos.name + '| ' + 'Nit: ' + datos.nit),
              Respuesta: JSON.stringify(respuesta),
              TipoRespuesta: 200,
              Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }

            this.clientesService.createLogAsync(Loguser).then(respuesta => { });
          }, (error) => {

            const Loguser = {
              fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo: 'Control Calidad Externo',
              Submodulo: 'Configuración',
              Item: 'Clientes',
              Metodo: 'creación',
              Datos: ('Cliente: ' + datos.name + '| ' + 'Nit: ' + datos.nit),
              respuesta: error.message,
              tipoRespuesta: error.status,
              Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }
            this.clientesService.createLogAsync(Loguser).then(respuesta => { });

          });

        }
      } else {

        let nit = this.formaRegistroCliente.get('nit').value;
        let existeNit = this.dataTable.find(cliente => cliente.nit == nit) || undefined;
        let idcliente = this.formaRegistroCliente.value.idclient;

        if (existeNit != undefined && existeNit.idclient != idcliente) {
          this.accion = 'noDatos';
          this.toastr.info('Ya hay un cliente con ese nit');
        } else {

          if (this.base64textString === "") {
            this.base64textString = this.formaRegistroCliente.value.logo;
          }
          if (this.currentBase64) {
            this.base64textString = this.currentBase64
          }

          let nameHeader = "";
          let header = this.listHeaderClientCreate.find(h => h.idClient == this.formaRegistroCliente.value.idclient) || undefined;

          if (header !== undefined) {
            nameHeader = header.headName;
          } else {
            nameHeader = null;
          }

          const datos = {
            idclient: this.formaRegistroCliente.value.idclient,
            name: this.formaRegistroCliente.value.name,
            nit: this.formaRegistroCliente.value.nit,
            addres: this.formaRegistroCliente.value.addres,
            phone: this.formaRegistroCliente.value.phone,
            email: this.formaRegistroCliente.value.email,
            contact: this.formaRegistroCliente.value.contact,
            logo: this.base64textString,
            active: this.formaRegistroCliente.value.active,
            header: nameHeader,
            codeClient: this.formaRegistroCliente.value.codeClient
          }
          this.loaderService.show()
          this.loaderService.text.emit({ text: 'Guardando registro...' })
          this.clientesService.update(datos, this.formaRegistroCliente.value.idclient).subscribe(respuesta => {
            this.loaderService.hide()
            this.cargarClientes();
            this.toastr.success('Registro actualizado');
            this.base64textString = '';
            this.seleccioneArchivo = '';

            const Loguser = {
              fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo: 'Control Calidad Externo',
              Submodulo: 'Configuración',
              Item: 'Clientes',
              Metodo: 'actualización',
              Datos: ('Cliente: ' + datos.name + '| ' + 'Nit: ' + datos.nit),
              DatosAnteriores: ('Cliente: ' + this.clientant + '| ' + 'Nit: ' + this.nitant),
              Respuesta: JSON.stringify(respuesta),
              TipoRespuesta: 200,
              Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }

            this.clientesService.createLogAsync(Loguser).then(respuesta => { });

          }, (error) => {
            this.loaderService.hide()
            const Loguser = {
              fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo: 'Control Calidad Externo',
              Submodulo: 'Configuración',
              Item: 'Clientes',
              Metodo: 'actualización',
              Datos: ('Cliente: ' + datos.name + '| ' + 'Nit: ' + datos.nit),
              DatosAnteriores: ('Cliente: ' + this.clientant + '| ' + 'Nit: ' + this.nitant),
              respuesta: error.message,
              tipoRespuesta: error.status,
              Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }

            this.clientesService.createLogAsync(Loguser).then(respuesta => { });

          });

        }
      }
      // this.closeVentana();
      this.desactivar = false;
    }
  }

  openModalViewImage(templateViewImage: TemplateRef<any>, logo: string) {
    this.ventanaModal = this.modalService.show(templateViewImage, { backdrop: 'static', keyboard: false });
    this.image = logo;
  }

  actualizarEstadoCliente(datosCliente) {
    const [data, estado] = datosCliente;
    const datos = { idclient: data.idclient, name: data.name, nit: data.nit, addres: data.addres, phone: data.phone, email: data.email, contact: data.contact, logo: data.logo, active: estado, codeClient: data.codeClient };

    this.clientesService.update(datos, data.idclient).subscribe(respuesta => {
      this.cargarClientes();
      this.toastr.success('Estado actualizado', 'Actualización');
    }, err => {
      this.toastr.error('No fue posible actualizar el estado', 'Error')
    });
  }

  eliminarCliente(id: any) {
    this.clientesService.delete('clientQce', id).subscribe({

      next: (respuesta) => {
        this.cargarClientes();
        this.accion = '';
        this.toastr.success('Registro eliminado');

        const Loguser = {
          fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo: 'Control Calidad Externo',
          Submodulo: 'Configuración',
          Item: 'Clientes',
          metodo:'eliminación',
          datos: JSON.stringify(id),
          respuesta: JSON.stringify(respuesta),
          tipoRespuesta: 200,
          Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
        this.clientesService.createLogAsync(Loguser).then(respuesta => {
          console.log(respuesta);
        });
      },
      error: (err) => {
        this.toastr.error(this.messageError);

        const Loguser = {
          fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo: 'Control Calidad Externo',
          Submodulo: 'Configuración',
          Item: 'Clientes',
          metodo: 'eliminación',
          datos: JSON.stringify(id),
          respuesta: err.message,
          tipoRespuesta: err.status,
          Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
        this.clientesService.createLogAsync(Loguser).then(respuesta => {

        });
      }
    });
  }

  openInputFile(): void {
    const element = document.getElementById('file-1');
    element.click();
  }

  handleFileSelect(evt) {
    const files = evt.target.files;
    const file = files[0];
    var base64: any;
    if (files && file) {
      const reader = new FileReader();
      this.seleccioneArchivo = files[0].name;
      reader.onload = this._handleReaderLoaded.bind(this);
      reader.readAsBinaryString(file);
      console.log(reader)


    }
  }

  _handleReaderLoaded(readerEvt) {
    const binaryString = readerEvt.target.result;
    this.base64textString = btoa(binaryString);
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // closeVentana(): void {
  //   this.ventanaModal.hide();
  //   this.titulosSwal();
  //   this.seleccioneArchivo = '';

  // }

  titulosSwal() {
    this.translate.get('MODULES.SWAL.MESAGEERROR').subscribe(respuesta => this.messageError = respuesta);
  }

  //#region metodos para los predictivos
  //#region HeaderClient
  private _filterHeaderClientCreate(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.listHeaderClientCreate
      .filter(result =>
        result.descriptionHeader.toLowerCase().includes(filterValue));
  }

  async LoadHeaderClient() {
    try {

      this.loaderService.show()
      this.loaderService.text.emit({ text: 'Cargando lista de clientes...' })
      let clientes = await this.headerClientService.getAllAsync();

      if (clientes.length == 0) {
        this.toastr.info("No hay clientes registrados")
        return
      }
      this.listHeaderClientCreate = clientes;
      this.listHeaderClientCreateCopy = clientes;


      this.loaderService.hide()
    } catch (error) {
      this.loaderService.hide()
      this.toastr.info("No hay clientes registrados")
    }
    // await this.headerClientService.getAllAsync().then(data => {

    //   if (data.length == 0) {
    //     console.log("No hay clientes registrados")
    //   }

    //   this.listHeaderClientCreate = data;
    //   this.listHeaderClientCreateCopy = data;

    //   this.listHeaderClientCreate.sort((a: any, b: any) => {
    //     a.descriptionHeader = a.descriptionHeader.charAt(0) + a.descriptionHeader.slice(1);
    //     b.descriptionHeader = b.descriptionHeader.charAt(0) + b.descriptionHeader.slice(1);
    //   })

    //   this.listHeaderClientCreate.sort((a: any, b: any) => {
    //     if (a.descriptionHeader < b.descriptionHeader) return -1;
    //     if (a.descriptionHeader > b.descriptionHeader) return 1;
    //     return 0;
    //   })

    //   this.filterHeaderClientCreate = this.formaRegistroCliente.get('name')
    //     .valueChanges.pipe(startWith(''), map(value => {
    //       return this._filterHeaderClientCreate(value)
    //     }),
    //     );
    //});
  }

  openDownloader(id: any) {
    const FILEUPLOAD = document.getElementById(id) as HTMLInputElement
    FILEUPLOAD.click()
  }

  async loadFileSeguimiento($event: any) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        this.imageSrc = reader.result as string;
        this.currentBase64 = this.imageSrc.split(',')[1];
        console.log(this.imageSrc)
        console.log(this.currentBase64)
      };

      reader.readAsDataURL(file);
    }
  }

  openCamera(): void {
    this.loaderService.show()
    this.loaderService.text.emit({ text: 'Tomando foto' })
    const videoElement = document.createElement('video');
    const canvasElement = document.createElement('canvas');
    const context = canvasElement.getContext('2d');

    // Pedir permiso para usar la cámara del dispositivo
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        this.loaderService.hide()
        videoElement.srcObject = stream;
        videoElement.play();
        this.loaderService.show()
        this.loaderService.text.emit({ text: 'Tomando foto' })
        // Esperar un segundo para que la cámara se active
        setTimeout(() => {
          // Establecer el tamaño del canvas
          this.loaderService.hide()
          canvasElement.width = videoElement.videoWidth;
          canvasElement.height = videoElement.videoHeight;

          // Dibujar la imagen del video en el canvas
          context?.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

          // Parar el video y liberar el stream
          videoElement.pause();
          stream.getTracks().forEach(track => track.stop());

          // Obtener la imagen como data URL
          this.imageSrc = canvasElement.toDataURL('image/png');
          this.currentBase64 = this.imageSrc.split(',')[1];
        }, 1000);
      })
      .catch(error => {
        this.loaderService.hide()
        this.toastr.error('No se pudo acceder a la cámara. Por favor, verifica los permisos del navegador.');
      });
  }

}

//#endregion
//#endregion


