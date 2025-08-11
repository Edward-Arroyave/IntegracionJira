import { LoaderService } from '@app/services/loader/loader.service';
import { DatePipe, NgFor, NgIf, AsyncPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { TemplateRef } from '@angular/core';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ConfigResultsService } from '@app/services/calidad-externo/configResults.service';
import { DiccionarioResultadosQceService } from '@app/services/calidad-externo/diccionarioResultadosQce.service';
import { VentanasModalesService } from '@app/services/general/ventanas-modales.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import dayjs from 'dayjs';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject } from 'rxjs';
import { map, startWith, takeUntil } from 'rxjs/operators';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { staticNever } from 'rxjs-compat/add/observable/never';
import { debug, error } from 'console';
import { ImageCdnPipe } from '../../../../../core/pipes/image-cdn.pipe';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TablaComunComponent } from '@app/modules/shared/general-tablas/tabla-comun/tabla-comun.component';
import { ModalData } from '@app/Models/Modaldata';
import { MatDialog } from '@angular/material/dialog';
import { ModalGeneralComponent } from '@app/modules/shared/modals/modal-general/modal-general.component';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { AnalyzerQceService } from '@app/services/calidad-externo/AnalyzerQce.service';

@Component({
  selector: 'app-configuracion-resultados',
  templateUrl: './configuracion-resultados.component.html',
  styleUrls: ['./configuracion-resultados.component.css'],
  providers: [DatePipe],
  standalone: true,
  imports: [FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    NgFor,
    MatTooltipModule,
    MatInputModule,
    MatTableModule,
    MatSortModule,
    MatSlideToggleModule,
    MatPaginatorModule,
    NgIf,
    MatAutocompleteModule,
    AsyncPipe,
    TranslateModule,
    ImageCdnPipe,
    TablaComunComponent,
    NgxMatSelectSearchModule
  ]
})
export class ConfiguracionResultadosComponent implements OnInit {

  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();
  ventanaModal: BsModalRef;
  formaRegistroConf: FormGroup;
  accionEditar: any;
  tituloAccion: any;
  show = false;
  idPrograma: number;
  IdProgramconf: any;
  idAnalito: number;
  desactivar = false;
  fromCreate = false;
  accion: any;
  interpretation: any;
  dataTable = [];
  dataTableList = [];
  idProgram
  today = dayjs().format('YYYY-MM-DD');
  messageError: string;
  listaAnalitos = [];
  listaAnalitosCopy = [];
  listaProgramas = [];
  listaProgramasCopy = [];
  listaResultados: any = [];
  listaResultadosCopy: any = [];
  listaEquipos = [];
  listaEquiposCopy = [];
  listProgramConf: any;

  //predictivos create
  filteredOptionsesultadosCreate: Observable<string[]>;
  listresultadoscreate: any;

  //predictivo edit
  filteredOptionsresultsEdit: Observable<string[]>;
  idresultspr: number;
  desresultspr: any;
  listaresultadospre: any;

  formaRegistroConfEdit: FormGroup = this.fb.group({
    idconfanalyteresult: [],
    idProgramconf: [],
    idprogram: [, [Validators.required]],
    idanalytes: [, [Validators.required]],
    idanalyzer: [, [Validators.required]],
    idresultsdictionary: [, [Validators.required]],
    ordergraph: [, [Validators.required]],
    active: [],
    interpretation: [],
  });

  ver: boolean = undefined;


  displayedColumns: string[] = ['Analito','Equipo','Resultado', 'Interpretation', 'Orden grafica', 'Estado', 'Editar', 'Eliminar'];
  dataSource: MatTableDataSource<any>;
  dataTableBody: any[] = [];

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  @ViewChild(MatPaginator, { static: false }) paginatorDetalle: MatPaginator;
  @ViewChild(MatSort, { static: true }) sortDetalle: MatSort;

  formaBuscarDatos: FormGroup = this.fb.group({

    programa: ['', [Validators.required]],

  });

  filterAnalito = new FormControl('');
  filterPrograma = new FormControl('');
  filterResultados = new FormControl('');
  filterEquipo = new FormControl('');

  constructor(
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private configResultsService: ConfigResultsService,
    private resultsdictionaryQce: DiccionarioResultadosQceService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private modalService: BsModalService,
    private ventanaService: VentanasModalesService,
    private loaderService: LoaderService,
    private dialog: MatDialog,
    private analyzerQceService: AnalyzerQceService

  ) { }

  async ngOnInit(): Promise<void> {
    this.crearFormularioConf('');
    await this.consultarProgramas();
    this.consultarResultados();
    this.titulosSwal();
    this.filtros();
  }

  filtros() {

    this.filterPrograma.valueChanges.subscribe(word => {
      if (word) {
        this.listaProgramas = this.listaProgramasCopy.filter((item: any) => {
          return item.Desprogram.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.listaProgramas = this.listaProgramasCopy
      }
    });
    this.filterAnalito.valueChanges.subscribe(word => {
      if (word) {
        this.listaAnalitos = this.listaAnalitosCopy.filter((item: any) => {
          return item.Desanalytes.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.listaAnalitos = this.listaAnalitos
      }
    });
    this.filterEquipo.valueChanges.subscribe(word => {
      if (word) {
        this.listaEquipos = this.listaEquiposCopy.filter((item: any) => {
          return item.nameAnalyzer.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.listaEquipos = this.listaEquipos
      }
    });
    this.filterResultados.valueChanges.subscribe(word => {
      if (word) {
        this.listaResultados = this.listaResultadosCopy.filter((item: any) => {
          return item.desresults.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.listaResultados = this.listaResultadosCopy
      }
    });
  }

  private _filterResultsCreate(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.listaResultados
      .filter(result =>
        result.desresults.toLowerCase().includes(filterValue)).filter(e => e.active == true)

  }

  private _filterResultadosEdit(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.listaResultados
      .filter(result => result.desresults.toLowerCase().includes(filterValue))

  }

  async consultarProgramas() {
    try {
      this.loaderService.show();
      this.loaderService.text.emit({ text: 'Cargando programas...' })
      let resp: any = await this.configResultsService.getProgramas().toPromise();
      this.loaderService.hide();

      var filtro = [];

      for (let i = 0; i < resp.length; i++) {

        if (!filtro.includes(resp[i].IdProgram)) {

          filtro.push(resp[i].IdProgram);

        }

      }

      this.listaProgramas = [];
      for (let i = 0; i < filtro.length; i++) {

        let arreglo = resp.filter(programa => programa.IdProgram == filtro[i]);

        let objeto = arreglo.pop();
        this.listaProgramas.push(objeto);
        this.listaProgramasCopy.push(objeto);

      }
    } catch (error) {
      this.loaderService.hide();
    }


  }

 async consultarAnalitos(programa: any) {

    this.listaAnalitos = [];

    if (programa != '') {
      try {
        this.loaderService.show();
        this.loaderService.text.emit({ text: 'Cargando analitos...' })
        let analitos: any = await this.configResultsService.getAnalitos(programa).toPromise()
        this.loaderService.hide();
        this.listaAnalitos = analitos.filter(analito => analito.Typeresult == 'C' || analito.Typeresult == 'S');
        this.listaAnalitosCopy = analitos.filter(analito => analito.Typeresult == 'C' || analito.Typeresult == 'S');
      } catch (error) {
        this.loaderService.hide();
      }

    }

  }

  async consultarEquipos(programa: any) {

    this.listaEquipos = [];

    if (programa != '') {
      try {
        this.loaderService.show();
        this.loaderService.text.emit({ text: 'Cargando equipos...' })
        let equipos: any = await this.analyzerQceService.getAllAsync().then().catch();
        this.loaderService.hide();
        this.listaEquipos = equipos.filter(x => x.active == true);
        this.listaEquiposCopy = equipos.filter(x => x.active == true);
      } catch (error) {
        this.loaderService.hide();
      }

    }

  }

  consultarResultados() {

    this.resultsdictionaryQce.getAllAsync().then(respuesta => {

      this.listaResultados = respuesta.filter(datos => datos.active);

    });

  }

  openModal(descripcion) {
    const data = { descripcion: descripcion, accion: this.accion }
    this.ventanaService.openModal(data);
  }

  getIdParametrizacion(){
    this.loaderService.show();
    this.show = false;
    this.loaderService.text.emit({ text: 'Cargando información...' })
    this.configResultsService.getIDProgramConf(this.idPrograma).subscribe(data => {
      this.listProgramConf = data;
      this.loaderService.hide()
    }, error => {
      this.dataSource = new MatTableDataSource();
      this.dataTable = [];
      this.dataTableList = [];
      this.dataTableBody = [];
      
      this.loaderService.hide()
    })
  }

 async getData() {

  this.getIdParametrizacion();
  
  this.loaderService.show()
  this.loaderService.text.emit({ text: 'Cargando información...' })
  this.configResultsService.getResults(this.idPrograma).subscribe((data: any) => {
      this.loaderService.hide();
      this.ver = true
      const filtrarDataTable: any[] = data;
      this.dataTableBody = filtrarDataTable.map(x => {
        return { Analito: x.Desanalytes, Equipo:x.NameAnalyzer, Resultado: x.Desresults, Interpretation: x.Interpretation, 'Orden grafica': x.Ordergraph, Estado: x.Active, item: x, item7: x, item8: x };
      });

      this.dataTable = data;
      this.dataTableList = data;
      this.dataTable.sort(((a, b) => a.Ordergraph - b.Ordergraph));
      this.dataSource = new MatTableDataSource(this.dataTable);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;

      setTimeout(() => {

        this.loaderService.hide();
        this.show = true;

      }, 2000);

    }, error => {
      this.dataTableList = [];
      this.dataTable = [];
      this.dataSource = new MatTableDataSource(this.dataTable);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.ver = true;

      this.accion = 'noDatos';
      this.toastr.error('No se encontraron datos');

      this.loaderService.hide();
      this.show = true;
    });

  }

  async buscarDatos() {
    this.dataTable = [];
    this.dataSource = new MatTableDataSource();
    this.dataTableBody = [];
    this.dataTableList = [];
    if (this.formaBuscarDatos.get('programa').value != '') {
      this.loaderService.hide();
      this.idPrograma = parseInt(this.formaBuscarDatos.get('programa').value);
      await this.consultarAnalitos(this.idPrograma);
      await this.consultarEquipos(this.idPrograma);
      this.getData();
    }

  }

  async openModalRegistroRondasQce(templateRegistroRondasQce: TemplateRef<any>, datos: any) {

    try {
      this.fromCreate = true;
      this.crearFormularioConf(datos);
      this.loaderService.show()
      let respuesta = await this.resultsdictionaryQce.getAllAsync()
      this.listaResultados = respuesta.filter(e => e.active == true);
      this.listaResultadosCopy = respuesta.filter(e => e.active == true);
      this.loaderService.hide()
    } catch (error) {
      this.loaderService.hide()

    }


    //   this.listaResultados.sort((a: any, b: any) => {
    //     a.desresults = a.desresults.charAt(0) + a.desresults.slice(1);
    //     b.desresults = b.desresults.charAt(0) + b.desresults.slice(1);
    //   })

    //   this.listaResultados.sort((a: any, b: any) => {
    //     if (a.desresults < b.desresults) return -1;
    //     if (a.desresults > b.desresults) return 1;
    //     return 0;
    //   })

    //   this.filteredOptionsesultadosCreate = this.formaRegistroConf.get('idresultsdictionary').valueChanges.pipe(
    //     startWith(''),
    //     map(value => {
    //       return this._filterResultsCreate(value)
    //     }),
    //   );
    // });



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
      content: templateRegistroRondasQce,
      btn: this.accionEditar ? 'Actualizar' : 'Guardar',
      btn2: 'Cerrar',
      footer: true,
      title: this.accion,
      image: this.accionEditar ? 'assets/rutas/iconos/editar.png' : 'assets/rutas/iconos/crear.png',
    };
    const dialogRef = this.dialog.open(ModalGeneralComponent, { height: 'auto', width: '40em', data, disableClose: true });

    dialogRef.componentInstance.primaryEvent?.pipe(takeUntil(destroy$)).subscribe(x => {
      if (this.formaRegistroConf.invalid) {
        this.formaRegistroConf.markAllAsTouched();
        return
      }
      this.crearEditarConf();
      dialogRef.close();
    });
  }

  async openModalRegistroRondasQceEdit(templateRegistroConfEdit: TemplateRef<any>, datos: any) {
    this.crearFormularioConfEdit(datos);


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
      content: templateRegistroConfEdit,
      btn: this.accionEditar ? 'Actualizar' : 'Guardar',
      btn2: 'Cerrar',
      footer: true,
      title: this.accion,
      image: this.accionEditar ? 'assets/rutas/iconos/editar.png' : 'assets/rutas/iconos/editar.png',
    };
    const dialogRef = this.dialog.open(ModalGeneralComponent, { height: 'auto', width: '40em', data, disableClose: true });

    dialogRef.componentInstance.primaryEvent?.pipe(takeUntil(destroy$)).subscribe(x => {

      if (this.formaRegistroConfEdit.invalid) {
        this.formaRegistroConf.markAllAsTouched();
        return
      }
      this.crearEditarConfEdit();
      dialogRef.close();
    });

    // this.ventanaModal = this.modalService.show(templateRegistroConfEdit, { 'class': 'modal-md', backdrop: 'static', keyboard: false });
    // this.accionEditar = !!datos;
    // datos != '' ? this.accion = 'Editar' : this.accion = 'Crear';
    // datos ? this.translate.get('MODULES.RONDASQCE.FORMULARIO.ACTUALIZAR').subscribe(respuesta => this.tituloAccion = respuesta) : this.translate.get('MODULES.RONDASQCE.FORMULARIO.REGISTRAR').subscribe(respuesta => this.tituloAccion = respuesta);

  }

  crearEditarConf() {

    let nomIdresults = this.formaRegistroConf.get('idresultsdictionary').value
    let nuevaData = this.formaRegistroConf.value;

    this.listaResultados.filter(result => {
      if (result.desresults.toLowerCase() === nomIdresults.toLowerCase()) {
        nuevaData.idresultsdictionary = result.idresultsdictionary;
        return
      }
      return
    })

    if (!this.formaRegistroConf.invalid) {

      if (this.accion == 'Crear') {
          this.desactivar = true;
          this.configResultsService.create(nuevaData).subscribe({
            next: (respuesta) => {

            this.getData();
            this.accion = 'Crear';
            this.toastr.success('Registro creado');
            this.desactivar = false;

            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              Hora: this.dateNowISO,
              Metodo: 'creación',
              Datos: JSON.stringify(this.formaRegistroConf.value),
              Respuesta: JSON.stringify(respuesta),
              TipoRespuesta: status
            }

            this.configResultsService.createLogAsync(Loguser).then(respuesta => {
            });
          }, error: (error) => {
            this.toastr.error(error.error.error);
            const Loguser = {
              fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.dateNowISO,
              metodo: 'creación',
              datos: JSON.stringify(this.formaRegistroConf.value),
              respuesta: error.message,
              tipoRespuesta: error.status
            }
            this.configResultsService.createLogAsync(Loguser).then(respuesta => {
            });
          }
        })
        

      } else {
        let ordengrafica: number = parseInt(this.formaRegistroConf.get('ordergraph').value);
        let Idconfanalyteresult: number = parseInt(this.formaRegistroConf.value.idconfanalyteresult);

          this.configResultsService.update(this.formaRegistroConf.value, this.formaRegistroConf.value.idconfanalyteresult).subscribe({
            next: (respuesta) => {
              
              this.getData();
              this.toastr.success('Registro actualizado');
              
              const Loguser = {
                Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
                Hora: this.dateNowISO,
                Metodo: 'actualización',
                Datos: JSON.stringify(this.formaRegistroConf.value),
                Respuesta: JSON.stringify(respuesta),
                TipoRespuesta: status
              }

              this.configResultsService.createLogAsync(Loguser).then(respuesta => {});

          }, error: (error) => {
            this.toastr.error(error.error.error);
            const Loguser = {
              fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.dateNowISO,
              metodo: 'actualización',
              datos: JSON.stringify(this.formaRegistroConf.value),
              respuesta: error.message,
              tipoRespuesta: error.status
            }
            this.configResultsService.createLogAsync(Loguser).then(respuesta => {});
          }
        });
    }
      //} else {
      //this.toastr.info('Ya existe un registro con esa Interpretación');
      //}
    }
  }

  crearEditarConfEdit() {

    let nomIdresults = this.formaRegistroConfEdit.get('idresultsdictionary').value
    let nuevaData = this.formaRegistroConfEdit.value;

    this.listaResultados.filter(result => {
      if (result.desresults.toLowerCase() === nomIdresults.toLowerCase()) {
        nuevaData.idresultsdictionary = result.idresultsdictionary;
        return
      }
      return
    })

    if (!this.formaRegistroConfEdit.invalid) {

      if (this.accion == 'Crear') {
          this.desactivar = true;
          this.configResultsService.create(nuevaData).subscribe({
            next: (respuesta) => {
            
              this.getData();
              this.accion = 'Crear';
              this.toastr.success('Registro creado');
              this.desactivar = false;

              const Loguser = {
                Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
                Hora: this.dateNowISO,
                Metodo: 'creación',
                Datos: JSON.stringify(this.formaRegistroConf.value),
                Respuesta: JSON.stringify(respuesta),
                TipoRespuesta: status
              }

              this.configResultsService.createLogAsync(Loguser).then(respuesta => {
              });
          }, error: (error) => {
            this.toastr.error(error.error.error);
            const Loguser = {
              fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.dateNowISO,
              metodo: 'creación',
              datos: JSON.stringify(this.formaRegistroConf.value),
              respuesta: error.message,
              tipoRespuesta: error.status
            }
            this.configResultsService.createLogAsync(Loguser).then(respuesta => {
            });
          }
        })
      } else {
          this.configResultsService.update(nuevaData, this.formaRegistroConfEdit.value.idconfanalyteresult).subscribe({
            next: (respuesta) => {

            this.getData();
            this.toastr.success('Registro actualizado');

            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              Hora: this.dateNowISO,
              Metodo: 'actualización',
              Datos: JSON.stringify(this.formaRegistroConf.value),
              Respuesta: JSON.stringify(respuesta),
              TipoRespuesta: status
            }

            this.configResultsService.createLogAsync(Loguser).then(respuesta => {

            });
          }, error: (error) => {
            this.toastr.error(error.error.error);
            const Loguser = {
              fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.dateNowISO,
              metodo:'actualización',
              datos: JSON.stringify(this.formaRegistroConf.value),
              respuesta: error.message,
              tipoRespuesta: error.status
            }
            this.configResultsService.createLogAsync(Loguser).then(respuesta => {

            });
          }
        });
      }
    }
    //} else {
    // this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.INTERPRETATION'));
    //}
  }


  updateDos() {

    let nomIdresults = this.formaRegistroConf.get('idresultsdictionary').value;
    let nuevaData = this.formaRegistroConf.value;
    let arrresults = this.listaResultados.sort((a, b) => {
      a.desresults = a.desresults.charAt(0).toLowerCase() + a.desresults.slice(1);
      b.desresults = b.desresults.charAt(0).toLowerCase() + b.desresults.slice(1);

    })

    arrresults.sort((a, b) => {
      if (a.desresults < b.desresults) return -1;
      if (a.desresults > b.desresults) return 1;
      return 0;
    })

    arrresults.filter(result => {
      if (result.desresults.toLowerCase() === nomIdresults.toLowerCase()) {
        nuevaData.idresultsdictionary = result.idresultsdictionary;
        return
      }
      return
    })



    if (!this.formaRegistroConf.invalid) {
        this.desactivar = true;
        this.configResultsService.create(nuevaData).subscribe({
          next: (respuesta) => {

          this.getData();
          this.toastr.success('Registro creado');
          this.desactivar = false;

          this.formaRegistroConf.get('idprogram').setValue(this.idPrograma)
          this.formaRegistroConf.get('idanalytes').setValue('')
          this.formaRegistroConf.get('idanalyzer').setValue('')
          this.formaRegistroConf.get('idconfanalyteresult').setValue('')
          this.formaRegistroConf.get('idProgramconf').setValue(this.IdProgramconf)
          this.formaRegistroConf.get('idresultsdictionary').setValue('')
          this.formaRegistroConf.get('ordergraph').setValue('')
          this.formaRegistroConf.get('active').setValue(false)
          this.formaRegistroConf.get('interpretation').setValue('')

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            Hora: this.dateNowISO,
            Metodo: 'creación',
            Datos: JSON.stringify(nuevaData),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: status
          }

          this.configResultsService.createLogAsync(Loguser).then(respuesta => {
          });
        }, error: (error) => {
          this.toastr.error(error.error.error);
          const Loguser = {
            fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.dateNowISO,
            metodo: 'creación',
            datos: JSON.stringify(nuevaData),
            respuesta: error.message,
            tipoRespuesta: error.status
          }
          this.configResultsService.createLogAsync(Loguser).then(respuesta => {
          });
        }
        });
      
    }
    //} //else {
    //this.toastr.info(this.translate.instant('MODULES.NOTIFICACIONES.INTERPRETATION'));
    //}
  }

  crearFormularioConf(datos: any) {

    this.formaRegistroConf = this.fb.group({

      idconfanalyteresult: [datos.Idconfanalyteresult ? datos.Idconfanalyteresult : ''],
      idProgramconf: [datos.IdProgramconf ? datos.IdProgramconf : this.IdProgramconf],
      idresultsdictionary: [datos.Idresultsdictionary ? datos.Idresultsdictionary : '', [Validators.required]],
      ordergraph: [datos.Ordergraph ? datos.Ordergraph : '', [Validators.required]],
      active: [datos.Active ? datos.Active : false],
      interpretation: [datos.interpretation ? datos.interpretation : ''],
      idanalytes: [datos.idanalytes ? datos.idanalytes : ''],
      idanalyzer: [datos.idanalyzer ? datos.idanalyzer : ''],
      idprogram: [datos.idprogram ? datos.idprogram : this.idPrograma],
    });

  }

  async crearFormularioConfEdit(datos: any) {

    try {
      this.loaderService.show();
      let resultado: any = await this.resultsdictionaryQce.getByIdAsync(datos.Idresultsdictionary)
      this.loaderService.hide();
      this.desresultspr = resultado.desresults;
      this.loaderService.show();
      this.idresultspr = datos.Idresultsdictionary;
      this.formaRegistroConfEdit.reset();
      this.formaRegistroConfEdit.get('idconfanalyteresult').setValue(datos.Idconfanalyteresult ? datos.Idconfanalyteresult : '')
      this.formaRegistroConfEdit.get('idProgramconf').setValue(datos.IdProgramconf ? datos.IdProgramconf : this.IdProgramconf)
      this.formaRegistroConfEdit.get('idanalytes').setValue(datos.Idanalytes ? datos.Idanalytes : '')
      this.formaRegistroConfEdit.get('idanalyzer').setValue(datos.idAnalyzer ? datos.idAnalyzer : '')
      this.formaRegistroConfEdit.get('idprogram').setValue(datos.IdProgram ? datos.IdProgram : this.idPrograma)
      this.formaRegistroConfEdit.get('idresultsdictionary').setValue(this.desresultspr.toLowerCase() ? this.desresultspr.toLowerCase() : '')
      this.formaRegistroConfEdit.get('ordergraph').setValue(datos.Ordergraph ? datos.Ordergraph : '')
      this.formaRegistroConfEdit.get('active').setValue(datos.Active ? datos.Active : false)
      this.formaRegistroConfEdit.get('interpretation').setValue(datos.Interpretation ? datos.Interpretation : '')
      let data = await this.resultsdictionaryQce.getAllAsync();
      this.listaResultados = data.filter(e => e.active == true);
      this.listaResultadosCopy = data.filter(e => e.active == true);
      this.loaderService.hide();


    } catch (error) {
      this.loaderService.hide();

    }


  }

  get idresultsdictionaryNoValido() {
    return this.formaRegistroConf.get('idresultsdictionary');
  }

  get ordergraphNoValido() {
    return this.formaRegistroConf.get('ordergraph');
  }

  actualizarEstado(dataConfig) {
    const [data, estado] = dataConfig
    const datos = { idconfanalyteresult: data.Idconfanalyteresult, idProgramconf: data.IdProgramconf, idresultsdictionary: data.Idresultsdictionary, ordergraph: data.Ordergraph, active: estado, interpretation: data.Interpretation,
      IdAnalyzer: data.IdAnalyzer, Idanalytes: data.Idanalytes, IdProgram:data.IdProgram
     }

    this.configResultsService.update(datos, data.Idconfanalyteresult).subscribe({
      next: (respuesta) => {
        this.getData();
        this.accion = 'Editar';
        this.toastr.success('Estado actualizado', 'Actualización');
      }, error: (error) => {
        this.toastr.error('No fue posible actualizar el estado', 'Error')
      }
    });
  }


  eliminarConfResult(id: any) {
    this.configResultsService.delete('confResults', id).subscribe({
      next: (respuesta) => {
        this.accion = '';
        this.toastr.success('Registro eliminado');

        const Loguser = {
          fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.dateNowISO,
          metodo: 'eliminación',
          datos: JSON.stringify('sadsa'), // this.idround,
          respuesta: JSON.stringify(respuesta),
          tipoRespuesta: status
        }
        this.configResultsService.createLogAsync(Loguser).then(respuesta => {
        });

        this.getData();

      },
      error: (err) => {
        this.toastr.error(this.messageError);

        const Loguser = {
          fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.dateNowISO,
          metodo: 'eliminación',
          datos: JSON.stringify('dasd'),
          respuesta: err.message,
          tipoRespuesta: err.status
        }
        this.configResultsService.createLogAsync(Loguser).then(respuesta => {
        });
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






