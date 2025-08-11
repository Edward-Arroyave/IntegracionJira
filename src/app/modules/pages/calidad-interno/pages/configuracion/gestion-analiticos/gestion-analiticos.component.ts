import { AfterContentInit, AfterViewInit, ChangeDetectorRef, Component, OnChanges, OnDestroy, OnInit, QueryList, signal, SimpleChanges, TemplateRef, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SharedService } from '@app/services/shared.service';
import { MatTable, MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorIntl, PageEvent, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { HttpErrorResponse } from '@angular/common/http';
import { VentanasModalesService } from '@app/services/general/ventanas-modales.service';
import { AnalitosService } from '@app/services/configuracion/analitos.service';
import { DatePipe, NgIf, NgClass, NgFor, AsyncPipe, TitleCasePipe } from '@angular/common';
import { SeccionesService } from '@app/services/configuracion/secciones.service';
import { ToastrService } from 'ngx-toastr';
import { lastValueFrom, Observable, Subject } from 'rxjs';
import { catchError, map, startWith, takeUntil } from 'rxjs/operators';
import { Unidadeservice } from '@app/services/configuracion/unidades.service';
import { FuentesService } from '@app/services/configuracion/fuentes.service';
import { PrecargaService } from '@app/services/post-analitico/precarga.service';
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
import { MatIconModule } from '@angular/material/icon';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { createLog } from '@app/globals/logUser';

@Component({
  selector: 'app-gestion-analiticos',
  templateUrl: './gestion-analiticos.component.html',
  styleUrls: ['./gestion-analiticos.component.css'],
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
    TitleCasePipe,
    TranslateModule,
    ImageCdnPipe,
    TablaComunComponent,
    MatIconModule,
    NgxMatSelectSearchModule
  ]
})
export class GestionAnaliticosComponent implements OnInit, OnDestroy {
  log = new createLog(this.datePipe, this.translate, this.analitosService);

  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();
  formaGestionAnaliticos: FormGroup;
  formulariologdatosant: FormGroup;
  formulariolog: FormGroup;

  filteredOptionsUnitsCreate: Observable<string[]>;
  filteredOptionsSourcesCreate: Observable<string[]>;

  accionEditar: any;
  accion: any;
  tituloAccion: any;
  ventanaModal: BsModalRef;
  ventanaError: BsModalRef;
  titulo: any;
  desactivar = false;
  text: any;
  textError: any;
  cancelar: any;
  confirmar: any;
  messageError: any;
  sections = [];
  sectionsActive: any;
  secciones: any;
  seccionesActive = [];
  seccionesant: any;
  filteredOptionssectionsEdit: Observable<string[]>;
  idsectionpr: number;
  dessectionpr: any;
  listaSecciones: any;


  listunitscreate: any;
  unidadesActive: any;
  fuentesActive: any;
  listsourcescreate: any;



  //predictivos create
  filteredOptionsSectionCreate: Observable<string[]>;
  sectionsActiveFilter: any;
  listsectionscreate: any;

  formaGestionAnaliticosEdit: FormGroup = this.fb.group({
    idanalytes: [],
    desanalytes: [, [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
    nivels: [, [Validators.required, Validators.min(1), Validators.max(3), Validators.pattern(/^\d+$/)]],
    idsection: [, [Validators.required]],
    resulttype: [, [Validators.required]],
    active: []
  });

  listaTemporalPrecarga: any[] = [];
  headersPrecargar: string[] = ['etmp', 'cvmp', 'sesgomp','idsource', 'idunits', 'editar', 'eliminar', 'active']
  dataSourcePrecarga = new MatTableDataSource<any>();

  displayedColumns: string[] = ['Analito', 'Sección', 'Tipo resultado', 'Precarga', 'Estado', 'Editar', 'Eliminar'];
  dataSource: MatTableDataSource<any>;
  dataTableBody: any[] = [];

  precargaBtnText=signal<string>('Guardar');

  // dataSourcePrecarga: MatTableDataSource<any>;

  @ViewChild('MatPaginator2', { static: true }) paginator2: MatPaginator;
  @ViewChildren(MatPaginator) paginator: QueryList<MatPaginator> = new QueryList<MatPaginator>();
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();

  // Precarga
  miFormPrecarga: FormGroup = this.fb.group({
    idunits: [, []], // cubierto
    nameUnit: [, [Validators.required]], // cubierto
    idsource: [, []], // cubierto
    nameSource: [, [Validators.required]], // cubierto
    sesgomp: [, [Validators.required]], // cubierto
    etmp: [, [Validators.required]], // cubierto
    cvmp: [, [Validators.required]], // cubierto
    //leveltest: [,[Validators.required,Validators.pattern(/^[1-3]$/)]], // cubierto
    idSection: [, [Validators.required]], // cubierto
    idAnaytes: [, [Validators.required]], // cubierto
    idpreloadmetquality: [, []],
    datemod: [, []],
    active: [true, []],  // cubierto
    idEliminar: [, []],  // cubierto
  });
  flagEditar: boolean = false;
  filterSection = new FormControl('');
  dataAnt: any;


  constructor(private translate: TranslateService,
    private analitosService: AnalitosService,
    private seccionesService: SeccionesService,
    private fb: FormBuilder,
    private modalService: BsModalService,
    private toastr: ToastrService,
    private sharedService: SharedService,
    private unidadeservice: Unidadeservice,
    private fuentesService: FuentesService,
    private ventanaService: VentanasModalesService,
    private datePipe: DatePipe,
    private precargaService: PrecargaService,
    private dialog: MatDialog) { }

  ngOnDestroy(): void {
    if (this.ventanaError) this.ventanaError.hide();
    if (this.ventanaModal) this.ventanaModal.hide();
  }

  ngOnInit(): void {

    this.cargarGestionAnaliticos();
    this.sharedService.customTextPaginator(this.paginator.toArray()[0]);
    // this.sharedService.customTextPaginator(this.paginator.toArray()[1]);
    this.titulosSwal();
    this.getSections();
    this.unidades();
    this.fuente();
    this.filtrosAutocomplete();
  }

  filtrosAutocomplete() {
    this.filterSection.valueChanges.subscribe(word => {
      if (word) {
        this.sectionsActive = this.sectionsActiveFilter.filter((item: any) => {
          return item.namesection.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.sectionsActive = this.sectionsActiveFilter;
      }
    });
  }

  private _filterSectionsCreate(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.sectionsActive
      .filter(section =>
        section.namesection.toLowerCase().includes(filterValue)).filter(e => e.active == true)

  }


  cargarGestionAnaliticos() {
    this.analitosService.getDetailsAnalytes().subscribe((respuesta: any[]) => {
      const filtrarDataTable: any[] = respuesta;
      this.dataAnt = respuesta;

      this.dataTableBody = filtrarDataTable.map(x => {
        return { Analito: x.Desanalytes, Sección: x.Namesection, 'Tipo resultado': x.Resulttype, Precarga: x, Estado: x.Active, item:x,  item6: x, item7: x };
      });
      this.dataSource = new MatTableDataSource(respuesta);
      this.dataSource.paginator = this.paginator.toArray()[0];
      this.dataSource.sort = this.sort.toArray()[0];
    });
  }

  async openModalGestionAnaliticos(templateGestionAnaliticos: TemplateRef<any>, datos: any) {

    this.crearFormularioGestionAnaliticos(datos);

    await this.seccionesService.getAllAsync().then(data => {
      this.listsectionscreate = data.filter(e => e.active == true);

      this.listsectionscreate.sort((a: any, b: any) => {
        a.namesection = a.namesection.charAt(0) + a.namesection.slice(1);
        b.namesection = b.namesection.charAt(0) + b.namesection.slice(1);
      })

      this.listsectionscreate.sort((a: any, b: any) => {
        if (a.namesection < b.namesection) return -1;
        if (a.namesection > b.namesection) return 1;
        return 0;
      })

      // this.filteredOptionsSectionCreate = this.formaGestionAnaliticos.get('idsection').valueChanges.pipe(
      //   startWith(''),
      //   map(value => {
      //     return this._filterSectionsCreate(value)
      //   }),
      // );
      // this.SectionCreateFilter = this.formaGestionAnaliticos.get('idsection').valueChanges.pipe(
      //   startWith(''),
      //   map(value => {
      //     return this._filterSectionsCreate(value)
      //   }),
      // );
      // console.log(this.SectionCreateFilter);
    });
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
      content: templateGestionAnaliticos,
      btn: this.accionEditar ? 'Actualizar' : 'Guardar',
      btn2: 'Cerrar',
      footer: true,
      title: this.accion,
      image: ''
    };
    const dialogRef = this.dialog.open(ModalGeneralComponent, { height: '22.5em', width: '50em', data, disableClose: true });

    dialogRef.componentInstance.primaryEvent?.pipe(takeUntil(destroy$)).subscribe(x => {
      if (this.formaGestionAnaliticos.invalid) {
        this.formaGestionAnaliticos.markAllAsTouched();
        return
      }
      this.crearEditarGestionAnaliticos();
      dialogRef.close();
    });
  }

  async getSections() {
    this.sections = await this.seccionesService.getAllAsync();
    this.sectionsActive = this.sections.filter(e => e.active);
    this.sectionsActiveFilter = this.sections.filter(e => e.active);
  }

  get desAnalytesNoValido() {
    return this.formaGestionAnaliticos.get('desanalytes');
  }
  get nivelsNoValido() {
    return this.formaGestionAnaliticos.get('nivels');
  }
  get sectionNoValido() {
    return this.formaGestionAnaliticos.get('idsection');
  }
  get resulttypeNoValido() {
    return this.formaGestionAnaliticos.get('resulttype');
  }

  get desAnalytesNoValidoedit() {
    return this.formaGestionAnaliticosEdit.get('desanalytes');
  }
  get nivelsNoValidoedit() {
    return this.formaGestionAnaliticosEdit.get('nivels');
  }
  get sectionNoValidoedit() {
    return this.formaGestionAnaliticosEdit.get('idsection');
  }
  get resulttypeNoValidoedit() {
    return this.formaGestionAnaliticosEdit.get('resulttype');
  }

  crearFormularioGestionAnaliticos(datos: any) {
    let idSeccion:any;
    if(datos) idSeccion = this._filterSectionsCreate(datos.Namesection)[0];
    this.formaGestionAnaliticos = this.fb.group({

      idanalytes: [datos.Idanalytes ? datos.Idanalytes : ''],
      desanalytes: [datos.Desanalytes ? datos.Desanalytes : '', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      nivels: [datos.Nivels ? datos.Nivels : '', [Validators.required, Validators.min(1), Validators.max(3), Validators.pattern(/^\d+$/)]],
      idsection: [datos.Idsection ? idSeccion.idsection : '', [Validators.required]],
      resulttype: [datos.Resulttype ? datos.Resulttype : '', [Validators.required]],
      active: [datos.Active ? datos.Active : false]

    });

    this.formulariologdatosant = this.fb.group({

      idanalytes: [datos.Idanalytes],
      desanalytes: [datos.Desanalytes],
      nivels: [datos.Nivels],
      idsection: [datos.Idsection],
      resulttype: [datos.Resulttype],
      active: [datos.Active]
    });
  }

  crearEditarGestionAnaliticos() {

    let nomIdsection = this.formaGestionAnaliticos.get('idsection').value;
    let nuevaData = this.formaGestionAnaliticos.value;
    let arrsections = this.sectionsActive.sort((a, b) => {
      a.namesection = a.namesection.charAt(0).toLowerCase() + a.namesection.slice(1);
      b.namesection = b.namesection.charAt(0).toLowerCase() + b.namesection.slice(1);
    })
  
    arrsections.sort((a, b) => {
      if (a.namesection < b.namesection) return -1;
      if (a.namesection > b.namesection) return 1;
      return 0;
    })

    arrsections.filter(result => {
      if (String(result.namesection).toLowerCase() === String(nomIdsection).toLowerCase()) {
        nuevaData.idsection = result.idsection;
        return
      }
      return
    })

    if (!this.formaGestionAnaliticos.invalid) {

      let idsection = this.formaGestionAnaliticos.get('idsection').value;

      this.seccionesService.getByIdAsync(nuevaData.idsection).then((dataseccion: any) => {

        this.secciones = dataseccion.namesection;

      }).catch(error => {

      });

      const data = {

        idanalytes: this.formaGestionAnaliticos.get('idanalytes').value,
        desanalytes: this.formaGestionAnaliticos.get('desanalytes').value,
        nivels: this.formaGestionAnaliticos.get('nivels').value,
        resulttype: this.formaGestionAnaliticos.get('resulttype').value,
        idsection: nuevaData.idsection,
        active: this.formaGestionAnaliticos.get('active').value

      }

      if (this.accion === 'Crear') {

        this.desactivar = true;
        this.analitosService.create(nuevaData).subscribe({
          next: (respuesta) => {
            this.cargarGestionAnaliticos();
            this.toastr.success('Registro creado');
            this.desactivar = false;
            if (data.resulttype == 'N') {
              data.resulttype = 'Cuantitativo';
            } else {
              data.resulttype = 'Cualitativo';
            }

            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo: 'Control Calidad Interno',
              Submodulo: 'Configuración',
              Item: 'Analítos',
              Metodo: 'creación',
              Datos: ('Analito: ' + data.desanalytes + '| ' + 'Nivel: ' + data.nivels + '| ' + 'Sección: ' + nuevaData.idsection + '| ' + data.resulttype),
              Respuesta: JSON.stringify(respuesta),
              TipoRespuesta: 200,
              Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }

            this.analitosService.createLogAsync(Loguser).then(respuesta => {});

          }, error:(err) => {
            let idsection = data.idsection;
            this.seccionesService.getByIdAsync(idsection).then((data: any) => {
              this.secciones = data.namesection;
            }).catch(error => { });
            
            if (data.resulttype == 'N') {
              data.resulttype = 'Cuantitativo';
            } else {
              data.resulttype = 'Cualitativo';
            }
            const Loguser = {
              fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo: 'Control Calidad Interno',
              Submodulo: 'Configuración',
              Item: 'Analítos',
              metodo: 'creación',
              Datos: ('Analito: ' + data.desanalytes + '| ' + 'Nivel: ' + data.nivels + '| ' + 'Sección: ' + nuevaData.idsection + '| ' + data.resulttype),
              respuesta: err.message,
              tipoRespuesta: err.status,
              Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }
            this.analitosService.createLogAsync(Loguser).then(respuesta => {
            });
          }
        });

      } else {
        let antdesanalyte = this.formulariologdatosant.get('desanalytes').value;
        let antnivel = this.formulariologdatosant.get('nivels').value;
        let antresulttype = this.formulariologdatosant.get('resulttype').value;
        let antsection = this.formulariologdatosant.get('idsection').value;
        let idseccionnueva = this.formaGestionAnaliticos.get('idsection').value;

        //seccion anterior
        let idsectionant = antsection;
        this.seccionesService.getByIdAsync(idsectionant).then((dataseccionant: any) => {
          this.seccionesant = dataseccionant.namesection;
        }).catch(error => {});

        //seccion nueva
        let idsectionnueva = idseccionnueva;
        this.seccionesService.getByIdAsync(idsectionnueva).then((dataseccionueva: any) => {
          this.secciones = dataseccionueva.namesection;
        }).catch(error => {});

        if (antresulttype == 'N') {
          antresulttype = 'Cuantitativo';
        } else {
          antresulttype = 'Cualitativo';
        }

        this.analitosService.update(data, data.idanalytes).subscribe({
          next: (respuesta) => {
            this.cargarGestionAnaliticos();
            this.toastr.success('Registro actualizado');

            if (data.resulttype == 'N') {
              data.resulttype = 'Cuantitativo';
            } else {
              data.resulttype = 'Cualitativo';
            }

            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo: 'Control Calidad Interno',
              Submodulo: 'Configuración',
              Item: 'Analítos',
              Metodo: 'actualización',
              Datos: ('Analito: ' + data.desanalytes + '| ' + 'Nivel: ' + data.nivels + '| ' + 'Sección: ' + this.secciones + '| ' + data.resulttype),
              DatosAnteriores: ('Analito: ' + antdesanalyte + '| ' + 'Nivel: ' + antnivel + '| ' + 'Sección: ' + this.seccionesant + '| ' + antresulttype),
              Respuesta: JSON.stringify(respuesta),
              TipoRespuesta: 200,
              Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }

            this.analitosService.createLogAsync(Loguser).then(respuesta => {
            });

          }, error:(err) => {
            this.toastr.error(this.translate.instant('No es posible modificar el nivel del analito, Existe configuración de resultados'));

            let idsectionnueva = data.idsection;
            this.seccionesService.getByIdAsync(idsectionnueva).then((dataseccionnueva: any) => {
              this.secciones = dataseccionnueva.namesection;
            }).catch(error => {

            });
            //seccion anterior
            let idsectionant = antsection;
            this.seccionesService.getByIdAsync(idsectionant).then((dataseccionant: any) => {
              this.seccionesant = dataseccionant.namesection;
            }).catch(error => {});
            if (data.resulttype == 'N') {
              data.resulttype = 'Cuantitativo';
            } else {
              data.resulttype = 'Cualitativo';
            }
            const Loguser = {
              fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo: 'Control Calidad Interno',
              Submodulo: 'Configuración',
              Item: 'Analítos',
              metodo: 'actualización',
              Datos: ('Analito: ' + data.desanalytes + '| ' + 'Nivel: ' + data.nivels + '| ' + 'Sección: ' + this.secciones + '| ' + data.resulttype),
              DatosAnteriores: ('Analito: ' + antdesanalyte + '| ' + 'Nivel: ' + antnivel + '| ' + 'Sección: ' + this.seccionesant + '| ' + antresulttype),
              respuesta: err.message,
              tipoRespuesta: err.status,
              Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }
            this.analitosService.createLogAsync(Loguser).then(respuesta => {
            });
          }
        });
      }
    }
  }


  actualizarGestionAnaliticos(datosAnalitico: any[]) {
    const [data, estado] = datosAnalitico;
    data.active = estado;
    const datosAnteriores = this.dataAnt.find(x => x.Idanalytes == data.Idanalytes);
    this.analitosService.update(data, data.Idanalytes).subscribe({
      next: (value) => {
        this.accion = 'Editar';
      this.log.logObj('Control Calidad Interno', 'Configuración', 'Analitos', 'a', data, JSON.stringify(value), 200, this.datosAnt(datosAnteriores));
        this.toastr.success('Estado actualizado', 'Actualización');
      }, error: (err) => {
      this.log.logObj('Control Calidad Interno', 'Configuración', 'Analitos', 'a', data, err.message, err.status, this.datosAnt(datosAnteriores));
        this.toastr.error('No se pudo actualizar el estado', 'Error');
      },
      //this.cargarGestionAnaliticos();
    });
  }

  datosAnt(data: any) {
    return ` Idanalytes: ${data.Idanalytes} - Desanalytes: ${data.Desanalytes} - Idsection: ${data.Idsection} - Namesection: ${data.Namesection} - Nivels: ${data.Nivels} - Active: ${!data.active}`;
  }

  eliminarGestionAnaliticos(id: any) {
    let namedesanalyte = null;
    this.analitosService.getByIdAsync(id.Idanalytes).then((datanalyte: any) => {
      namedesanalyte = datanalyte.desanalytes;
    });
    let datosAnteriores = this.dataAnt.find(x => x.Idanalytes == id.Idanalytes);
    this.analitosService.delete('Analytes', id.Idanalytes).subscribe({
      next: (respuesta) => {
        this.cargarGestionAnaliticos();
        this.accion = '';
        this.toastr.success('Registro eliminado');

        const Loguser = {
          fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo: 'Control Calidad Interno',
          Submodulo: 'Configuración',
          Item: 'Analítos',
          metodo: 'eliminación',
          datos: (id + '| ' + 'Analito: ' + namedesanalyte),
          DatosAnteriores: `${datosAnteriores.Idanalytes} | Analito: ${datosAnteriores.Desanalytes}`,
          respuesta: JSON.stringify(respuesta),
          tipoRespuesta: 200,
          Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
        this.analitosService.createLogAsync(Loguser).then(respuesta => {
        });
      }, error: (err) => {
        this.toastr.error(this.messageError);

        const Loguser = {
          fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo: 'Control Calidad Interno',
          Submodulo: 'Configuración',
          Item: 'Analítos',
          metodo: 'eliminación',
          datos: (id + '| ' + namedesanalyte),
          respuesta: this.messageError,
          tipoRespuesta: err.status,
          Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
        this.analitosService.createLogAsync(Loguser).then(respuesta => {
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
  closeVentana(): void {
    this.ventanaModal.hide();
  }

  async modalPrecarga(template: TemplateRef<any>, item: any) {
    console.log(item);
    
    this.taerPrecargaPorAnalito(item.Idanalytes);

    this.miFormPrecarga.reset();
    this.miFormPrecarga.get('idSection')?.setValue(item.Idsection);
    this.miFormPrecarga.get('idAnaytes')?.setValue(item.Idanalytes);
    this.miFormPrecarga.get('active')?.setValue(true);
    const destroy$: Subject<boolean> = new Subject<boolean>();
    /* Variables recibidas por el modal */
    const data: ModalData = {
      content: template,
      btn: null,
      btn2: 'Cerrar',
      footer:true,
      title: 'Precarga de objetivos de calidad',
      image:''//TODO : IMAGENRED
    };
    let dialogRef =this.dialog.open(ModalGeneralComponent, { height:'auto' ,width: '70em', data, disableClose: true });
    dialogRef.componentInstance.secondaryEvent?.pipe(takeUntil(destroy$)).subscribe(x =>{
      this.precargaBtnText.set('Guardar');
    })
  }

  unidades() {
    this.unidadeservice.getAllAsync().then(data => {

      this.listunitscreate = [...data.filter(e => e.active === true)];

      this.listunitscreate.sort((a: any, b: any) => {
        a.desunits = a.desunits.charAt(0) + a.desunits.slice(1);
        b.desunits = b.desunits.charAt(0) + b.desunits.slice(1);
      })

      this.listunitscreate.sort((a: any, b: any) => {
        if (a.desunits < b.desunits) return -1;
        if (a.desunits > b.desunits) return 1;
        return 0;
      })
      this.filteredOptionsUnitsCreate = this.miFormPrecarga.get('nameUnit')?.valueChanges.pipe(
        startWith(''),
        map(value => {
          return this._filterUnitsCreate(value)
        }),
      );
    });
  }

  fuente() {
    this.fuentesService.getAllAsync().then(data => {
      this.listsourcescreate = [...data.filter(e => e.active === true)];

      this.listsourcescreate.sort((a: any, b: any) => {
        a.dessource = a.dessource.charAt(0) + a.dessource.slice(1);
        b.dessource = b.dessource.charAt(0) + b.dessource.slice(1);
      })

      this.listsourcescreate.sort((a: any, b: any) => {
        if (a.dessource < b.dessource) return -1;
        if (a.dessource > b.dessource) return 1;
        return 0;
      })
      this.filteredOptionsSourcesCreate = this.miFormPrecarga.get('nameSource')?.valueChanges
        .pipe(
          startWith(''),
          map(value => {
            return this._filterSourcesCreate(value)
          }),
        );
    });
  }

  private _filterUnitsCreate(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.listunitscreate
      .filter((units: any) => units.desunits.toLowerCase().includes(filterValue)).filter(e => e.active === true)
  }

  private _filterSourcesCreate(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.listsourcescreate
      .filter((source: any) => source.dessource.toLowerCase().includes(filterValue.split(',')[0])).filter(e => e.active === true)
  }

  limpiarCamposPrecarga() {
    this.miFormPrecarga.get('nameUnit').reset('');
    this.miFormPrecarga.get('nameSource').reset('');
    this.miFormPrecarga.get('idunits').reset('');
    this.miFormPrecarga.get('idsource').reset('');
    this.miFormPrecarga.get('sesgomp').reset();
    this.miFormPrecarga.get('etmp').reset();
    this.miFormPrecarga.get('cvmp').reset();
    //this.miFormPrecarga.get('leveltest').reset();
    this.miFormPrecarga.get('active').reset(true);
  }

  guardarTemporalPrecarga() {
    if (this.miFormPrecarga.invalid) {
      this.miFormPrecarga.markAllAsTouched();
      return
    }
    let fechaActual = new Date();
    let dia = ('0' + fechaActual.getDate()).slice(-2);
    let mes = ('0' + (fechaActual.getMonth() + 1)).slice(-2);
    let anio = fechaActual.getFullYear();
    let fechaActualString = `${anio}/${mes}/${dia}`;
    let id1 = this.listunitscreate.filter(x => String(x.desunits).toLocaleLowerCase() === String(this.miFormPrecarga.get('nameUnit')?.value).toLocaleLowerCase())
    let id2 = this.listsourcescreate.filter(x => String(x.dessource).toLocaleLowerCase() === String(this.miFormPrecarga.get('nameSource')?.value).toLocaleLowerCase())

    this.miFormPrecarga.get('datemod')?.setValue(new Date(fechaActualString));
    this.miFormPrecarga.get('idpreloadmetquality').setValue(null);
    this.miFormPrecarga.get('idunits').setValue(id1[0].idunits);
    this.miFormPrecarga.get('idsource').setValue(id2[0].idsource);

    this.precargaService.guardarPrecarga(this.miFormPrecarga.value).subscribe({
      next:(x:any) => {
        this.miFormPrecarga.get('idpreloadmetquality').setValue(x.idpreloadmetquality);
        this.listaTemporalPrecarga.push(this.miFormPrecarga.value);
        this.dataSourcePrecarga = new MatTableDataSource([...this.listaTemporalPrecarga]);
        this.dataSourcePrecarga.paginator = this.paginator.toArray()[0];
        this.limpiarCamposPrecarga();
        this.toastr.success('Registro creado');
      },error:(err)=> {
          
        this.toastr.error('Error al crear el registro, recuerde que no puede existir dos fuentes iguales');
      },
    })

  }

  eliminarPrecarga(idPrecarga:number) {
    this.precargaService.eliminarPrecarga(idPrecarga)
      .subscribe({
        next:(x) => {
          this.listaTemporalPrecarga = [...this.listaTemporalPrecarga.filter(z => z.idpreloadmetquality !== idPrecarga)];
          this.dataSourcePrecarga = new MatTableDataSource([...this.listaTemporalPrecarga]);
          this.dataSourcePrecarga.paginator = this.paginator.toArray()[0];
          this.toastr.success('Registro eliminado');
          this.ventanaError.hide();
        },error:(err) => {
            
        }
      })
  }

  prepararEdicion(item: any) {
    this.flagEditar = !this.flagEditar;
    this.precargaBtnText.set('Actualizar');
    let fechaActual = new Date();
    let dia = ('0' + fechaActual.getDate()).slice(-2);
    let mes = ('0' + (fechaActual.getMonth() + 1)).slice(-2);
    let anio = fechaActual.getFullYear();
    let fechaActualString = `${anio}/${mes}/${dia}`;
    item.idEliminar = null;
    this.miFormPrecarga.setValue(item)
    this.miFormPrecarga.get('datemod')?.setValue(new Date(fechaActualString));
  }

  editarPrecarga() {
    if (this.miFormPrecarga.invalid) {
      this.miFormPrecarga.markAllAsTouched();
      return
    }
    const idPrecarga = this.miFormPrecarga.get('idpreloadmetquality')?.value;
    this.precargaService.actualizarPrecarga(idPrecarga, this.miFormPrecarga.value)
      .subscribe({
        next:(x) => {
          const index = this.listaTemporalPrecarga.findIndex((x) => x.idpreloadmetquality === idPrecarga);
          this.listaTemporalPrecarga[index] = this.miFormPrecarga.value;
          this.dataSourcePrecarga = new MatTableDataSource([...this.listaTemporalPrecarga]);
          this.dataSourcePrecarga.paginator = this.paginator.toArray()[0];
          this.flagEditar = !this.flagEditar;
          this.precargaBtnText.set('Guardar');
          this.limpiarCamposPrecarga();
          this.toastr.success('Registro actualizado');
        },error:(err)=> {
          this.toastr.error(this.translate.instant('MODULES.NOTIFICACIONES.ERRORALACTUALIZAR'));
        },
      })
  }

  editarEstado(item: any) {
    item.active = !item.active;
    this.precargaService.actualizarPrecarga(item.idpreloadmetquality, item)
      .subscribe( {
        next:(x) => {
          const index = this.listaTemporalPrecarga.findIndex((x) => x.idpreloadmetquality === item.idpreloadmetquality);
          this.listaTemporalPrecarga[index] = item;
          this.dataSourcePrecarga = new MatTableDataSource([...this.listaTemporalPrecarga]);
          this.dataSourcePrecarga.paginator = this.paginator.toArray()[0];
          this.toastr.success('Registro actualizado');
        },error:(err) => {
          this.toastr.error(this.translate.instant('MODULES.NOTIFICACIONES.ERRORALACTUALIZAR'));
        },
      })
  }

  async taerPrecargaPorAnalito(idAnalito: number) {
    await lastValueFrom(this.precargaService.obtenerPrecargaPorAnalito(idAnalito))
      .then((x: any[]) => {
          console.log(x);
          
          if (x.length !== 0) {
            this.listaTemporalPrecarga = [];
            
            this.listaTemporalPrecarga = x.map(z => {
              return {
                idunits: z.IdUnits,
                nameUnit: z.Desunits,
                idsource: z.IdSource,
                nameSource: z.Dessource,
                sesgomp: z.Sesgomp,
                etmp: z.Etmp,
                cvmp: z.Cvmp,
                //leveltest:z.Leveltest,
                idSection: z.IdSection,
                idAnaytes: z.IdAnaytes,
                idpreloadmetquality: z.Idpreloadmetquality,
                datemod: z.Datemod,
                active: z.Active
              }
            })
            this.dataSourcePrecarga = new MatTableDataSource([...this.listaTemporalPrecarga]);
            this.dataSourcePrecarga.paginator = this.paginator.toArray()[0];
          }
        }).catch(e =>{
          this.dataSourcePrecarga = new MatTableDataSource([]);
          this.toastr.error(e.error.text);
        })

  }

  guardarEditarPrecarga(){
    if(this.miFormPrecarga.invalid){
      this.miFormPrecarga.markAllAsTouched();
      return
    }
    if(!this.flagEditar){
      this.guardarTemporalPrecarga()
    }else{
      this.editarPrecarga();
    }
  }

}
