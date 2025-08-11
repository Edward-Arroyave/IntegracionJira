import { DatePipe, NgIf, NgClass, NgFor, AsyncPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { createLog } from '@app/globals/logUser';
import { AnalitosQceService } from '@app/services/configuracion/analitos-qce.service';
import { SectionsQceService } from '@app/services/configuracion/sections-qce.service';
import { VentanasModalesService } from '@app/services/general/ventanas-modales.service';
import { SharedService } from '@app/services/shared.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject } from 'rxjs';
import { map, startWith, takeUntil } from 'rxjs/operators';
import { ImageCdnPipe } from '../../../../../core/pipes/image-cdn.pipe';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TablaComunComponent } from '@app/modules/shared/general-tablas/tabla-comun/tabla-comun.component';
import { MatDialog } from '@angular/material/dialog';
import { ModalData } from '@app/Models/Modaldata';
import { ModalGeneralComponent } from '@app/modules/shared/modals/modal-general/modal-general.component';
import { LoaderService } from '@app/services/loader/loader.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatTooltipModule } from '@angular/material/tooltip';
import { environment } from '@environment/environment';

@Component({
  selector: 'app-analitos',
  templateUrl: './analitos.component.html',
  styleUrls: ['./analitos.component.css'],
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
    MatAutocompleteModule,
    NgFor,
    MatOptionModule,
    MatSelectModule,
    AsyncPipe,
    TranslateModule,
    ImageCdnPipe,
    TablaComunComponent,
    NgxMatSelectSearchModule,
    MatTooltipModule
  ],
})
export class AnalitosComponent implements OnInit {

  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();
  ventanaModal: BsModalRef;
  formaRegistroAnalitosQce: FormGroup;
  accionEditar: any;
  tituloAccion: any;
  accion: any;
  image: string;
  desactivar = false;
  messageError: string;
  listaSections: any;
  displayedColumns: string[] = ['Analito', 'Sección', 'Tipo de resultado', 'Estado', 'Editar', 'Eliminar'];
  dataSource: MatTableDataSource<any>;
  dataTableBody: any[] = [];

  //predictivos create
  filteredOptionssectionsCreate: Observable<string[]>;
  listsectionscreate: any[] = [];
  listsectionscreateCopy: any[] = [];

  //predictivo edit
  filteredOptionssectionsEdit: Observable<string[]>;
  idsectionpr: number;
  dessectionspr: any;
  listasectionspre: any;

  //propiedad lista analitos
  listaAnalitosQce: any[] = [];

  formaRegistroAnalitosQceEdit: FormGroup = this.fb.group({
    idanalytes: [],
    desanalytes: [, [Validators.required]],
    idsection: [, [Validators.required]],
    typeresult: [, [Validators.required]],
    active: [],
  });

  //DatosAnteriores log
  datosAnterioresSectionQce: any = null;


  filterSeccion = new FormControl('')

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  log = new createLog(this.datePipe, this.translate, this.analitosQceService);

  constructor(
    private analitosQceService: AnalitosQceService,
    private sectionsQceService: SectionsQceService,
    private modalService: BsModalService,
    private translate: TranslateService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private ventanaService: VentanasModalesService,
    private datePipe: DatePipe,
    private sharedService: SharedService,
    private dialog: MatDialog,
    private loader: LoaderService
  ) { }

  ngOnInit(): void {
    this.cargarAnalitosQce();
    this.cargarSections();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();
    this.filtros()
  }

  filtros(){
    this.filterSeccion.valueChanges.subscribe(word => {
      if (word) {
        this.listaSections = this.listsectionscreateCopy.filter((item: any) => {
          return item.dessection.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.listaSections = this.listsectionscreateCopy
      }
    });
  }
  cargarSections() {
    this.sectionsQceService.getAllAsync().then(respuesta => {
      this.listaSections = respuesta.filter(datos => datos.active == true);
      this.listsectionscreateCopy = this.listaSections;
    });
  }
  private _filterSectionsCreate(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.listsectionscreate
      .filter(result =>
        result.dessection.toLowerCase().includes(filterValue)).filter(e => e.active == true)
  }

  private _filtersectionEdit(value: string): string[] {

    const filterValue = value.toLowerCase();
    return this.listasectionspre.filter(result => result.dessection.toLowerCase().includes(filterValue))

  }

  cargarAnalitosQce() {
    this.analitosQceService.getAllAsyncAnalytes().then(respuesta => {
      const filtrarDataTable: any[] = respuesta;
      this.listaAnalitosQce = filtrarDataTable; // Asegúrate de que los datos sean asignados correctamente
      this.dataTableBody = filtrarDataTable.map(x => {
        return { Analito: x.Desanalytes, Sección: x.Dessection, 'Tipo de resultado': x.Typeresult, Estado: x.Active, item: x, item5: x, item6: x };
      });
      this.dataSource = new MatTableDataSource(respuesta);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }).catch(error => {
      console.error('[ERROR] Error al cargar los analitos:', error);
    });
}


  openModal(descripcion) {
    const data = { descripcion: descripcion, accion: this.accion }
    this.ventanaService.openModal(data);
  }
  // async openModalRegistroAnalitosQce(templateRegistroAnalitoQce: TemplateRef<any>, datos: any) {

  //   try {
  //     this.loader.show()
  //     let secciones  =  await this.sectionsQceService.getAllAsync()
  //     this.listsectionscreate = secciones.filter(e => e.active == true);
  //     this.listsectionscreateCopy = secciones.filter(e => e.active == true);
  //     this.crearFormularioRegistroAnalitoQce(datos);

  //     this.loader.hide()
  //     if (datos) {
  //       this.accionEditar = true;
  //       this.accion = "Editar";
  //     } else {
  //       this.accionEditar = false;
  //       this.accion = "Crear";
  //     }
  //     const destroy$: Subject<boolean> = new Subject<boolean>();
  //     /* Variables recibidas por el modal */
  //     const data: ModalData = {
  //       content: templateRegistroAnalitoQce,
  //       btn: this.accionEditar ? 'Actualizar' : 'Guardar',
  //       btn2: 'Cerrar',
  //       footer: true,
  //       title: this.accion,
  //       image: this.accionEditar ? 'assets/rutas/iconos/editar.png' : 'assets/rutas/iconos/editar.png',
  //     };
  //     const dialogRef = this.dialog.open(ModalGeneralComponent, { height: 'auto', width: '40em', data, disableClose: true });

  //     dialogRef.componentInstance.primaryEvent?.pipe(takeUntil(destroy$)).subscribe(x => {
  //       if (this.formaRegistroAnalitosQce.invalid) {
  //         this.formaRegistroAnalitosQce.markAllAsTouched();
  //         return
  //       }
  //       this.crearEditarAnalitoQce();
  //       dialogRef.close();
  //     });

  //   } catch (error) {
  //     this.loader.hide()
  //   }


  async openModalRegistroAnalitosQce(templateRegistroAnalitoQce: TemplateRef<any>, datos: any) {
    try {
      this.loader.show();
  
      // Cargar secciones
      const secciones = await this.sectionsQceService.getAllAsync();
      this.listsectionscreate = secciones.filter(e => e.active == true);
      this.listsectionscreateCopy = [...this.listsectionscreate];
  
      // Cargar analitos si aún no están cargados
      if (!this.listaAnalitosQce || this.listaAnalitosQce.length === 0) {
        const analitos = await this.analitosQceService.getAllAsyncAnalytes();
        this.listaAnalitosQce = analitos;
      }
  
      this.crearFormularioRegistroAnalitoQce(datos);
      this.loader.hide();
  
      this.accionEditar = !!datos;
      this.accion = this.accionEditar ? 'Editar' : 'Crear';
  
      const data: ModalData = {
        content: templateRegistroAnalitoQce,
        btn: this.accionEditar ? 'Actualizar' : 'Guardar',
        btn2: 'Cerrar',
        footer: true,
        title: this.accion,
        image: 'assets/rutas/iconos/editar.png',
      };
  
      const dialogRef = this.dialog.open(ModalGeneralComponent, {
        height: 'auto', width: '40em', data, disableClose: true
      });
  
      const destroy$ = new Subject<boolean>();
      dialogRef.componentInstance.primaryEvent?.pipe(takeUntil(destroy$)).subscribe(x => {
        if (this.formaRegistroAnalitosQce.invalid) {
          this.formaRegistroAnalitosQce.markAllAsTouched();
          return;
        }
        this.crearEditarAnalitoQce();  // Aquí ya listaAnalitosQce está cargada
        dialogRef.close();
      });
  
    } catch (error) {
      console.error('Error abriendo modal:', error);
      this.loader.hide();
    }
  }
  
  //   // await this.sectionsQceService.getAllAsync().then(data => {
  //   //   this.loader.hide()
  //   //   this.listsectionscreate = data.filter(e => e.active == true);
  //   //   this.listsectionscreateCopy = data.filter(e => e.active == true);
  //   //   this.listsectionscreate.sort((a: any, b: any) => {
  //   //     a.dessection = a.dessection.charAt(0) + a.dessection.slice(1);
  //   //     b.dessection = b.dessection.charAt(0) + b.dessection.slice(1);
  //   //   })

  //   //   this.listsectionscreate.sort((a: any, b: any) => {
  //   //     if (a.dessection < b.dessection) return -1;
  //   //     if (a.dessection > b.dessection) return 1;
  //   //     return 0;
  //   //   })
  //   //   this.crearFormularioRegistroAnalitoQce(datos);


  //   //   this.filteredOptionssectionsCreate = this.formaRegistroAnalitosQce.get('idsection').valueChanges.pipe(
  //   //     startWith(''),
  //   //     map(value => {
  //   //       return this._filterSectionsCreate(value)
  //   //     }),
  //   //   );


  //   // });



  // }
  async openModalRegistroAnalitosQceEdit(templateRegistroAnalitoQce: TemplateRef<any>, datos: any) {

    await this.crearFormularioRegistroAnalitoQceEdit(datos);
    if (datos) {
      this.accionEditar = true;
      this.accion = "Editar";
    } else {
      this.accionEditar = false;
      this.accion = "Crear";
    }
    let destroy$: Subject<boolean> = new Subject<boolean>();
    /* Variables recibidas por el modal */
    let data: ModalData = {
      content: templateRegistroAnalitoQce,
      btn: this.accionEditar ? 'Actualizar' : 'Guardar',
      btn2: 'Cerrar',
      footer: true,
      title: this.accion,
      image: this.accionEditar ? 'assets/rutas/iconos/editar.png' : 'assets/rutas/iconos/editar.png',
    };
    let dialogRef = this.dialog.open(ModalGeneralComponent, { height: 'auto', width: '40em', data, disableClose: true });

    dialogRef.componentInstance.primaryEvent?.pipe(takeUntil(destroy$)).subscribe(x => {
      if (this.formaRegistroAnalitosQce.invalid) {
        this.formaRegistroAnalitosQce.markAllAsTouched();
        return
      }
      this.crearEditarAnalitoQce();
      dialogRef.close();
    });
  }
  crearFormularioRegistroAnalitoQce(datos: any) {
    this.formaRegistroAnalitosQce = this.fb.group({
      idanalytes: [datos.Idanalytes ? datos.Idanalytes : ''],
      desanalytes: [datos.Desanalytes ? datos.Desanalytes : '', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      idsection: [datos.Idsection ? datos.Idsection : '', [Validators.required]],
      typeresult: [datos.Typeresult ? datos.Typeresult : '', [Validators.required, Validators.minLength(1), Validators.maxLength(1)]],
      active: [datos.Active ? datos.Active : false],
    });
  }


  async crearFormularioRegistroAnalitoQceEdit(datos: any) {
    await this.sectionsQceService.getByIdAsync(datos.Idsection).then((result: any) => {
      this.dessectionspr = result.dessection;
      this.datosAnterioresSectionQce = result;
    });
    this.idsectionpr = datos.Idsection;
    // Inicializar formulario reactivo
    this.formaRegistroAnalitosQce = this.fb.group({
      idanalytes: [datos.Idanalytes || ''],
      desanalytes: [datos.Desanalytes || '', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      idsection: [datos.Idsection ? datos.Idsection : ''],
      typeresult: [datos.Typeresult || '', [Validators.required, Validators.minLength(1), Validators.maxLength(1)]],
      active: [!!datos.Active] // Asegurar que active sea booleano
    });
    await this.sectionsQceService.getAllAsync().then(data => {
      this.listasectionspre = data.filter(e => e.active == true);
      this.listasectionspre.sort((a: any, b: any) => {
        a.dessection = a.dessection.charAt(0) + a.dessection.slice(1);
        b.dessection = b.dessection.charAt(0) + b.dessection.slice(1);
      })

      this.listasectionspre.sort((a: any, b: any) => {
        if (a.dessection < b.dessection) return -1;
        if (a.dessection > b.dessection) return 1;
        return 0;
      })

      this.filteredOptionssectionsEdit = this.formaRegistroAnalitosQce.get('idsection').valueChanges.pipe(
        startWith(''),
        map(value => {
          return this._filtersectionEdit(value)
        }),
      );
    });

  }
  get desNoValido() {
    return this.formaRegistroAnalitosQce.get('desanalytes');
  }
  get seccionValido() {
    return this.formaRegistroAnalitosQce.get('idsection');
  }
  get typeNoValido() {
    return this.formaRegistroAnalitosQce.get('typeresult');
  }
  get desNoValidoEdit() {
    return this.formaRegistroAnalitosQceEdit.get('desanalytes');
  }
  get seccionValidoEdit() {
    return this.formaRegistroAnalitosQceEdit.get('idsection');
  }
  get typeNoValidoEdit() {
    return this.formaRegistroAnalitosQceEdit.get('typeresult');
  }


/**
 * Metodo para crear o editar un analito QCE.
 * Fecha: 2025-05-07
 */
crearEditarAnalitoQce() {
  const nomIdsections = this.formaRegistroAnalitosQce.get('idsection').value;
  const nuevaData = this.formaRegistroAnalitosQce.value;

  // Ordenar secciones  
  const arrsection = this.listaSections.sort((a, b) => {
    a.dessection = a.dessection.charAt(0).toLowerCase() + a.dessection.slice(1);
    b.dessection = b.dessection.charAt(0).toLowerCase() + b.dessection.slice(1);
    return a.dessection.localeCompare(b.dessection);
  });

  if (!this.formaRegistroAnalitosQce.invalid) {
    const usuario = sessionStorage.getItem('userid') || 'desconocido';
    const nombreUsuario = sessionStorage.getItem('nombres') || 'desconocido';
    const inicio = Date.now();
    const endpoint = `${environment.apiUrl}qce/analytesQces`;
    const userAgent = navigator.userAgent;

    const datosAnteriores = this.accion === 'Crear'
      ? ''
      : JSON.stringify(this.obtenerDatosAnterioresAnalitos(nuevaData.idanalytes) || '');

    const tipoAccion = this.accion === 'Crear' ? 'crear' : 'actualizar';

    this.desactivar = true;

    // Llamada al servicio create o update con response: true
    const request$ = this.accion === 'Crear'
      ? this.analitosQceService.create(nuevaData, true)  // Agregar true para observar la respuesta completa
      : this.analitosQceService.update(nuevaData, nuevaData.idanalytes, true);  // Agregar true para observar la respuesta completa

    request$.subscribe(
      (respuesta) => {
        const fin = Date.now();
        const tiempoEjecucion = fin - inicio;

        // Verificar si la respuesta tiene un status de éxito (200, 201, 204)
        const tipoRespuesta = [200, 201, 204].includes(respuesta?.status)
          ? 200
          : respuesta?.status ?? 500;

        const logJson = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          Hora: this.dateNowISO,
          Metodo: tipoAccion,
          Datos: JSON.stringify(nuevaData),
          DatosAnteriores: datosAnteriores,
          Respuesta: respuesta?.body && Object.keys(respuesta.body).length > 0
            ? JSON.stringify(respuesta.body)
            : `Sin contenido. Status: ${respuesta?.status ?? 'desconocido'}`,
          TipoRespuesta: tipoRespuesta,
          userid: usuario,
          usuario: nombreUsuario,
          executionTime: tiempoEjecucion,
          endpoint: endpoint,
          userAgent: userAgent,
          modulo: 'Control Calidad Externo',
          SubModulo: 'Configuración',
          item: 'Analítos'
        };

        this.analitosQceService.createLogAsync(logJson);

        this.cargarAnalitosQce();
        this.toastr.success(`Registro ${this.accion === 'Crear' ? 'creado' : 'actualizado'}`);
        this.accion = "Crear";
        this.desactivar = false;
      },
      (error) => {
        const fin = Date.now();
        const tiempoEjecucion = fin - inicio;

        const logJson = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          Hora: this.dateNowISO,
          Metodo: tipoAccion,
          Datos: JSON.stringify(nuevaData),
          DatosAnteriores: datosAnteriores,
          Respuesta: error.message,
          TipoRespuesta: error.status ?? 500,
          executionTime: tiempoEjecucion,
          endpoint: endpoint,
          userAgent: userAgent,
          modulo: 'Control Calidad Externo',
          SubModulo: 'Configuración',
          item: 'Analítos'
        };

        this.analitosQceService.createLogAsync(logJson);
        this.toastr.error(this.translate.instant(error.error || 'Error desconocido'));
        this.desactivar = false;
      }
    );
  }
}


  
  /**
   * mwtodo para obtener los datos anteriores de un analito
   * @param id 
   * @returns 
   */
  obtenerDatosAnterioresAnalitos(id: number): any | null {
    if (!this.listaAnalitosQce || !Array.isArray(this.listaAnalitosQce)) {
      return null;
    }
  
    const idNumerico = Number(id);
  
    const analitoAnterior = this.listaAnalitosQce.find(item => item.Idanalytes === idNumerico);
  
    if (analitoAnterior) {
      return { ...analitoAnterior }; 
    }
  
    return null;
  }
  


  crearEditarAnalitoQceEditar() {
    //   let nomIdsections = this.formaRegistroAnalitosQceEdit.get('idsection').value
    let nuevaData = this.formaRegistroAnalitosQce.value;
    let arrsection = this.listaSections.sort((a, b) => {
      a.dessection = a.dessection.charAt(0).toLowerCase() + a.dessection.slice(1);
      b.dessection = b.dessection.charAt(0).toLowerCase() + b.dessection.slice(1);

    })
    arrsection.sort((a, b) => {
      if (a.dessection < b.dessection) return -1;
      if (a.dessection > b.dessection) return 1;
      return 0;
    })

    // arrsection.filter(result => {
    //   if (result.dessection.toLowerCase() === nomIdsections.toLowerCase()) {
    //     nuevaData.idsection = result.idsection;
    //     return
    //   }
    //   return
    // })
    if (!this.formaRegistroAnalitosQceEdit.invalid) {
      if (this.accion === 'Crear') {

        this.desactivar = true;

        this.analitosQceService.create(nuevaData).subscribe(respuesta => {

          this.cargarAnalitosQce();
          this.accion = "Crear";
          this.toastr.success('Registro creado');
          this.log.logObj('Control Calidad Externo', 'Configuración', 'Analitos', 'c', this.formaRegistroAnalitosQce.value, JSON.stringify(respuesta), 200);
          this.desactivar = false;
        }, (error) => {
          this.log.logObj('Control Calidad Externo', 'Configuración', 'Analitos', 'c', this.formaRegistroAnalitosQce.value, error.message, error.status);
        });
      } else {

        this.analitosQceService.update(nuevaData, this.formaRegistroAnalitosQceEdit.value.idanalytes).subscribe(respuesta => {
          this.cargarAnalitosQce();
          this.toastr.success('Registro actualizado');

          //var datos = ('Analito: ' + respuesta.desanalytes + '| ' + 'Sección: ' + this.formaRegistroAnalitosQceEdit.value.idsection + '| tipo resultado:' + this.formaRegistroAnalitosQceEdit.value.typeresult)
          var datos = ('Analito: ' + respuesta.body?.desanalytes + '| ' + 'Sección: ' + this.formaRegistroAnalitosQceEdit.value.idsection + '| tipo resultado:' + this.formaRegistroAnalitosQceEdit.value.typeresult)

          this.log.logObj('Control Calidad Externo', 'Configuración', 'Analitos', 'a', datos, JSON.stringify(respuesta), 200);
        }, (error) => {
          this.log.logObj('Control Calidad Externo', 'Configuración', 'Analitos', 'a', this.formaRegistroAnalitosQce.value, error.message, error.status);
        });
      }
    }
  }

/**
 * Metodo para actualizar el estado de un analito QCE.
 * Fecha: 2025-05-07
 * @param datosAnalitoQce 
 */
actualizarEstadoAnalitoQce(datosAnalitoQce: any) {
  const [data, estado] = datosAnalitoQce;

  const nuevaData = {
    idanalytes: data.Idanalytes,
    desanalytes: data.Desanalytes,
    idsection: data.Idsection,
    typeresult: data.Typeresult,
    active: estado
  };

  const usuario = sessionStorage.getItem('userid') || 'desconocido';
  const nombreUsuario = sessionStorage.getItem('nombres') || 'desconocido';
  const inicio = Date.now();
  const endpoint = `${environment.apiUrl}qce/analytesQces`;
  const userAgent = navigator.userAgent;

  const datosAnteriores = this.listaAnalitosQce.find(x => x.Idanalytes === data.Idanalytes);
  const datosAnterioresOrdenados = datosAnteriores
    ? JSON.stringify(datosAnteriores, Object.keys(datosAnteriores).sort())
    : '""';

  const logJsonBase = {
    Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
    Hora: this.dateNowISO,
    Metodo: 'actualización',
    Datos: JSON.stringify(nuevaData),
    DatosAnteriores: datosAnterioresOrdenados,
    Respuesta: '',
    TipoRespuesta: null,
    userid: usuario,
    usuario: nombreUsuario,
    executionTime: 0,
    endpoint: endpoint,
    userAgent: userAgent,
    modulo: 'Control Calidad Externo',
    SubModulo: 'Configuración',
    item: 'Analítos'
  };

  this.desactivar = true;

  // Llamada al servicio update con observe: 'response'
  this.analitosQceService.update(nuevaData, data.Idanalytes, true).subscribe(
    (respuesta) => {
      const fin = Date.now();
      const tiempoEjecucion = fin - inicio;

      // Verificar si la respuesta tiene un status de éxito (200, 201, 204)
      const tipoRespuesta = [200, 201, 204].includes(respuesta?.status)
        ? 200
        : respuesta?.status ?? 500;

      const logJson = {
        ...logJsonBase,
        Respuesta: respuesta?.body && Object.keys(respuesta.body).length > 0
          ? JSON.stringify(respuesta.body)
          : 'Operación exitosa (sin contenido)',
        TipoRespuesta: tipoRespuesta,
        executionTime: tiempoEjecucion
      };

      this.cargarAnalitosQce();
      this.toastr.success('Estado actualizado', 'Actualización');
      this.analitosQceService.createLogAsync(logJson);
      this.desactivar = false;
    },
    (error) => {
      const fin = Date.now();
      const tiempoEjecucion = fin - inicio;

      // Log de error con el estado y mensaje
      const logJson = {
        ...logJsonBase,
        Respuesta: error?.message || 'Error desconocido',
        TipoRespuesta: error?.status ?? 500,
        executionTime: tiempoEjecucion
      };

      this.analitosQceService.createLogAsync(logJson);

      // Si el error tiene un mensaje más detallado
      if (error?.error) {
        this.toastr.error(this.translate.instant(error.error || 'Error desconocido'));
      } else {
        this.toastr.error('Ocurrió un error al actualizar el estado del analito.');
      }

      this.desactivar = false;
    }
  );
}



eliminarAnalitoQce(id: any) {
  const usuario = sessionStorage.getItem('userid') || 'desconocido';
  const nombreUsuario = sessionStorage.getItem('nombres') || 'desconocido';
  const inicio = Date.now();
  const endpoint = `${environment.apiUrl}qce/analytesQces/${id}`;
  const userAgent = navigator.userAgent;

  const datosAnteriores = this.listaAnalitosQce.find(x => x.Idanalytes === id);
  const datosAnterioresOrdenados = datosAnteriores
    ? JSON.stringify(datosAnteriores, Object.keys(datosAnteriores).sort())
    : '""';

  const logJsonBase = {
    Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
    Hora: this.dateNowISO,
    Metodo: 'eliminación',
    Datos: JSON.stringify(datosAnteriores) || '',
    DatosAnteriores: datosAnterioresOrdenados,
    Respuesta: '',
    TipoRespuesta: '',
    userid: usuario,
    usuario: nombreUsuario,
    executionTime: 0,
    endpoint: endpoint,
    userAgent: userAgent,
    modulo: 'Control Calidad Externo',
    SubModulo: 'Configuración',
    item: 'Analítos'
  };

  // ✅ PASAMOS response: true
  this.analitosQceService.delete('', id, true).subscribe({
    next: (respuesta) => {
      const fin = Date.now();
      const tiempoEjecucion = fin - inicio;

      const tipoRespuesta = [200, 201, 204].includes(respuesta?.status)
        ? 200
        : respuesta?.status ?? 500;

      const logJson = {
        ...logJsonBase,
        Respuesta: respuesta?.body && Object.keys(respuesta.body).length > 0
          ? JSON.stringify(respuesta.body)
          : `Sin contenido. Status: ${respuesta?.status ?? 'desconocido'}`,
        TipoRespuesta: tipoRespuesta,
        executionTime: tiempoEjecucion
      };

      this.cargarAnalitosQce();
      this.accion = '';
      this.toastr.success('Registro eliminado');
      this.analitosQceService.createLogAsync(logJson);
    },
    error: (err) => {
      const fin = Date.now();
      const tiempoEjecucion = fin - inicio;

      const logJson = {
        ...logJsonBase,
        Respuesta: err.message,
        TipoRespuesta: err.status ?? 500,
        executionTime: tiempoEjecucion
      };

      this.analitosQceService.createLogAsync(logJson);
      this.toastr.error(this.messageError);
    }
  });
}


  
  

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }



  titulosSwal() {
    this.translate.get('MODULES.SWAL.MESAGEERROR').subscribe(respuesta => this.messageError = respuesta);
  }

}
