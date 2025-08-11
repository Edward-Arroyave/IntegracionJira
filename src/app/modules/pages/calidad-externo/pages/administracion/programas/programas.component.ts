import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SharedService } from '@app/services/shared.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { HttpErrorResponse } from '@angular/common/http';
import { VentanasModalesService } from '@app/services/general/ventanas-modales.service';
import { DatePipe, NgIf, NgFor, NgClass, AsyncPipe } from '@angular/common';
import { ProgramaConfQceService } from '@app/services/calidad-externo/ProgramconfQce.service';
import { AnalytesQceService } from '@app/services/calidad-externo/AnalytesQce.service';
import { AnalyzerQceService } from '@app/services/calidad-externo/AnalyzerQce.service';
import { MethodsQceService } from '@app/services/calidad-externo/MethodsQce.service';
import { UnitsQceService } from '@app/services/calidad-externo/unitsQce.service';
import { ProgramaQceService } from '@app/services/calidad-externo/programaQce.service';
import { ProgramConfQceDetailsService } from '@app/services/calidad-externo/ProgramconfQceDetails.service';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject } from 'rxjs';
import { map, startWith, takeUntil } from 'rxjs/operators';
import { ReactivosQceService } from '@app/services/calidad-externo/reactivos-qce.service';
import { createLog } from "../../../../../../globals/logUser";
import { ImageCdnPipe } from '../../../../../core/pipes/image-cdn.pipe';
import { MatTooltipModule } from '@angular/material/tooltip';
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
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-proveedores',
  templateUrl: './programas.component.html',
  styleUrls: ['./programas.component.css'],
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatSortModule,
    MatSlideToggleModule,
    MatPaginatorModule,
    NgIf, FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    NgFor,
    MatOptionModule,
    MatTooltipModule,
    NgClass,
    AsyncPipe,
    TranslateModule,
    ImageCdnPipe,
    TablaComunComponent,
    NgxMatSelectSearchModule,
    MatSelectModule]
})
export class ProgramasComponent implements OnInit {

  dateNow: Date = new Date();
  formulario: FormGroup;
  accionEditar: any;
  accion: any;
  tituloAccion: any;
  vantanaModal: BsModalRef;
  titulo: any;
  text: any;
  textError: any;
  desactivar = false;
  cancelar: any;
  confirmar: any;
  messageError: any;
  isCuanti = false;

  analytes = [];
  analytesActive = [];
  analytesActiveCopy = [];
  analyzers = [];
  analyzersActive = [];
  analyzersActiveCopy = [];
  methods = [];
  methodsActive = [];
  methodsActiveCopy = [];
  units = [];
  unitsActive = [];
  unitsActiveCopy = [];

  programs = [];
  programsActive = [];
  programsActiveCopy = [];

  dateNowISO = this.dateNow.toTimeString();


  //predictivo edit
  idprogrampr: number;
  desprogrampr: any;
  listaprogrampre: any;
  idanalytepr: number;
  desanalytepr: any;
  listaanalytepre: any;
  idanalyzerpr: number;
  desanalyzerpr: any;
  listaanalyzerpre: any;
  idmethodpr: number;
  idreagentpr: number;
  desmethodpr: any;
  desreagentpr: any;
  listamethodpre: any;
  idunitspr: number;
  desunitspr: any;
  listaunitspre: any;

  formularioEdit: FormGroup = this.fb.group({
    idProgramconf: [],
    idanalytes: [, [Validators.required]],
    idAnalyzer: [, [Validators.required]],
    idmethods: [, [Validators.required]],
    idunits: [, [Validators.required]],
    idProgram: [, [Validators.required]],
    idReagents: [, [Validators.required]],
    valueasign: [],
    active: []
  });
  reactivos: any;
  reactivosActive: any[];
  reactivosActiveCopy: any[];
  log = new createLog(this.datePipe, this.translate, this.programConfQceService);


  filterPrograma = new FormControl('')
  filterAnalito = new FormControl('')
  filterAnalizador = new FormControl('')
  filterReactivo = new FormControl('')
  filterMetodo = new FormControl('')
  filterUnidades = new FormControl('')

  constructor(
    private reactivosQceService: ReactivosQceService,
    // private programConfQceDetailsService: ProgramConfQceDetailsService,
    private translate: TranslateService,
    private programConfQceService: ProgramaConfQceService,
    private programConfQceDetailsService: ProgramConfQceDetailsService,
    private analytesQceService: AnalytesQceService,
    private analyzerQceService: AnalyzerQceService,
    private programQceService: ProgramaQceService,
    private methodsQceService: MethodsQceService,
    private toastr: ToastrService,
    private unitsQceService: UnitsQceService,
    private fb: FormBuilder,
    private modalService: BsModalService,
    private sharedService: SharedService,
    private ventanaService: VentanasModalesService,
    private datePipe: DatePipe,
    private dialog: MatDialog,
    private loaderService: LoaderService

  ) { }

  displayedColumns: string[] = ['Programa', 'Analito', 'Analizador', 'Reactivo', 'Método', 'Unidad', 'Estado', 'Editar', 'Eliminar'];
  dataSource: MatTableDataSource<any>;
  dataTableBody: any[] = [];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  async ngOnInit(): Promise<void> {

    this.getProgramas();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();
    await this.getAnalytes();
    await this.getAnalyzers();
    await this.getMethods();
    await this.getUnits();
    await this.getPrograms();
    await this.getReactivos();
    this.filtros();
  }

  filtros() {

    this.filterPrograma.valueChanges.subscribe(word => {
      if (word) {
        this.programsActive = this.programsActiveCopy.filter((item: any) => {
          return item.desprogram.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.programsActive = this.programsActiveCopy
      }
    });
    this.filterAnalito.valueChanges.subscribe(word => {
      if (word) {
        this.analytesActive = this.analytesActiveCopy.filter((item: any) => {
          return item.desanalytes.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.analytesActive = this.analytesActiveCopy
      }
    });

    this.filterAnalizador.valueChanges.subscribe(word => {
      if (word) {
        this.analyzersActive = this.analyzersActiveCopy.filter((item: any) => {
          return item.nameAnalyzer.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.analyzersActive = this.analyzersActiveCopy
      }
    });
    this.filterReactivo.valueChanges.subscribe(word => {
      if (word) {
        this.reactivosActive = this.reactivosActiveCopy.filter((item: any) => {
          return item.desreagents.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.reactivosActive = this.reactivosActiveCopy
      }
    });
    this.filterMetodo.valueChanges.subscribe(word => {
      if (word) {
        this.methodsActive = this.methodsActiveCopy.filter((item: any) => {
          return item.desmethods.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.methodsActive = this.methodsActiveCopy
      }
    });
    this.filterUnidades.valueChanges.subscribe(word => {
      if (word) {
        this.unitsActive = this.unitsActiveCopy.filter((item: any) => {
          return item.codunits.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.unitsActive = this.unitsActiveCopy
      }
    });
  }



  async getAnalytes() {
    try {
      this.loaderService.show()
      this.loaderService.text.emit({ text: 'Cargando analitos...' })
      this.analytes = await this.analytesQceService.getAllAsync();
      this.analytesActive = this.analytes.filter(e => e.active);
      this.analytesActiveCopy = this.analytes.filter(e => e.active);

      this.loaderService.hide()

    } catch (error: any) {
      this.loaderService.hide()

    }

  }

  async getAnalyzers() {
    try {
      this.loaderService.show()
      this.loaderService.text.emit({ text: 'Cargando equipos...' })
      this.analyzers = await this.analyzerQceService.getAllAsync();
      this.analyzersActive = this.analyzers.filter(e => e.active);
      this.analyzersActiveCopy = this.analyzers.filter(e => e.active);
      this.loaderService.hide()

    } catch (error: any) {
      this.loaderService.hide()

    }

  }

  async getReactivos() {
    try {
      this.loaderService.show()
      this.loaderService.text.emit({ text: 'Cargando reactivos...' })
      this.reactivos = await this.reactivosQceService.getAllAsync();
      this.reactivosActive = this.reactivos.filter(e => e.active);
      this.reactivosActiveCopy = this.reactivos.filter(e => e.active);
      this.loaderService.hide()

    } catch (error: any) {
      this.loaderService.hide()

    }

  }

  async getMethods() {
    try {
      this.loaderService.show()
      this.loaderService.text.emit({ text: 'Cargando métodos...' })
      this.methods = await this.methodsQceService.getAllAsync();
      this.methodsActive = this.methods.filter(e => e.active);
      this.methodsActiveCopy = this.methods.filter(e => e.active);
      this.loaderService.hide()

    } catch (error: any) {
      this.loaderService.hide()

    }

  }

  async getUnits() {
    try {
      this.loaderService.show()
      this.loaderService.text.emit({ text: 'Cargando unidades...' })
      this.units = await this.unitsQceService.getAllAsync();
      this.unitsActive = this.units.filter(e => e.active);
      this.unitsActiveCopy = this.units.filter(e => e.active);
      this.loaderService.hide()

    } catch (error: any) {
      this.loaderService.hide()

    }

  }

  async getPrograms() {
    try {
      this.loaderService.show()
      this.loaderService.text.emit({ text: 'Cargando programas...' })
      this.programs = await this.programQceService.getAllAsync();
      this.programsActive = this.programs.filter(e => e.active);
      this.programsActiveCopy = this.programs.filter(e => e.active);
      this.loaderService.hide()

    } catch (error: any) {
      this.loaderService.hide()

    }

  }

  openModal(descripcion) {
    const data = { descripcion: descripcion, accion: this.accion }
    this.ventanaService.openModal(data);
  }

  getProgramas() {
    this.loaderService.show()
    this.loaderService.text.emit({ text: 'Cargando programas....' })
    this.programConfQceDetailsService.getListprogramconf().toPromise().then(respuesta => {
      this.loaderService.hide()
      const filtrarDataTable: any[] = respuesta;
      console.log(respuesta)
      this.dataTableBody = filtrarDataTable.map(x => {
        return { Programa: x.Desprogram, Analito: x.Desanalytes, Analizador: x.NameAnalyzer, Reactivo: x.Desreagents, Método: x.Desmethods, Unidad: x.Codunits, Estado: x.Active, item: x, item8: x, item9: x };
      });

      this.dataSource = new MatTableDataSource(respuesta);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }), (err) => {
      this.loaderService.hide()
    };
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  validarAnalito(analito: any) {

    if (analito != '') {

      this.analytesQceService.getByIdAsync(analito).then((data: any) => {
        if (data.typeresult == 'N') {
          this.isCuanti = true;
        } else {
          this.isCuanti = false;
        }
      });
    }
  }

  async openModalGestionProgramas(templateGestionProgramas: TemplateRef<any>, datos: any) {

    try {
      this.crearFormularioGestionProgramas(datos);

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
        content: templateGestionProgramas,
        btn: this.accionEditar ? 'Actualizar' : 'Guardar',
        btn2: 'Cerrar',
        footer: true,
        title: this.accion,
        image: this.accionEditar ? 'assets/rutas/iconos/editar.png' : 'assets/rutas/iconos/editar.png',
      };
      const dialogRef = this.dialog.open(ModalGeneralComponent, { height: 'auto', width: '40em', data, disableClose: true });

      dialogRef.componentInstance.primaryEvent?.pipe(takeUntil(destroy$)).subscribe(x => {
        if (this.formulario.invalid) {
          this.formulario.markAllAsTouched();
          return
        }
        this.crearEditarGestionProgramas();
        dialogRef.close();
      });

    } catch (error) {
      this.loaderService.hide()

    }




  }


  crearFormularioGestionProgramas(datos: any) {


    this.formulario = this.fb.group({

      idProgramconf: [datos.IdProgramconf ? datos.IdProgramconf : ''],
      idanalytes: [datos.Idanalytes ? datos.Idanalytes : '', [Validators.required]],
      idAnalyzer: [datos.IdAnalyzer ? datos.IdAnalyzer : '', [Validators.required]],
      idReagents: [datos.IdReagents ? datos.IdReagents : '', [Validators.required]],
      idmethods: [datos.Idmethods ? datos.Idmethods : '', [Validators.required]],
      idunits: [datos.Idunits ? datos.Idunits : '', [Validators.required]],
      idProgram: [datos.IdProgram ? datos.IdProgram : '', [Validators.required]],
      valueasign: [datos.Valueasign ? datos.Valueasign : '', this.isCuanti == true ? [Validators.required] : [Validators.nullValidator]],
      active: [datos.Active ? datos.Active : false]

    });
  }

  crearEditarGestionProgramas() {

    let nuevaData = this.formulario.value;


    if (this.formulario.valid) {

      const data = {

        idProgramconf: this.formulario.get('idProgramconf').value,
        idanalytes: this.formulario.get('idanalytes').value,
        idAnalyzer: this.formulario.get('idAnalyzer').value,
        idReagents: this.formulario.get('idReagents').value,
        idmethods: this.formulario.get('idmethods').value,
        idunits: this.formulario.get('idunits').value,
        idProgram: this.formulario.get('idProgram').value,
        valueasign: this.formulario.get('valueasign').value,
        active: this.formulario.get('active').value,

      }

      if (this.accion === 'Crear') {

        this.desactivar = true;
        this.programConfQceService.create(nuevaData).subscribe(respuesta => {

          this.getProgramas();
          this.toastr.success('Registro creado');
          this.desactivar = false;
          this.formulario.reset({ idProgramconf: '', idanalytes: '', idAnalyzer: '', idReagents: '', idmethods: '', idunits: '', idProgram: '', active: false });
          this.log.logObj('Control Calidad Externo', 'Administración', 'Programas', 'c', nuevaData, JSON.stringify(respuesta), 200);

        }, (error) => {
          this.toastr.error(this.translate.instant(error.error));
          this.desactivar = false;
          this.log.logObj('Control Calidad Externo', 'Administración', 'Asignación de valores', 'c', nuevaData, error.message, error.status);
        });

      } else {

        this.programConfQceService.update(data, data.idProgramconf).subscribe(respuesta => {

          this.getProgramas();
          this.toastr.success('Registro actualizado');
          this.log.logObj('Control Calidad Externo', 'Administración', 'Programas', 'a', nuevaData, JSON.stringify(respuesta), 200);
        }, (error) => {
          this.toastr.error(error.error);
          this.log.logObj('Control Calidad Externo', 'Administración', 'Asignación de valores', 'a', nuevaData, error.message, error.status);
        });

      }

    }

  }

  actualizarEstadoGestionProgramas(datosGestion: any) {

    const [data, estado] = datosGestion;

    let datos = null;

    if (data.Valueasign != null) {

      this.isCuanti = true;
      datos = { idProgramconf: data.IdProgramconf, idanalytes: data.Idanalytes, idAnalyzer: data.IdAnalyzer, idReagents: data.IdReagents, idmethods: data.Idmethods, idunits: data.Idunits, idProgram: data.IdProgram, valueasign: data.Valueasign, active: estado }

    } else {

      this.isCuanti = false;
      datos = { idProgramconf: data.IdProgramconf, idanalytes: data.Idanalytes, idAnalyzer: data.IdAnalyzer, idReagents: data.IdReagents, idmethods: data.Idmethods, idunits: data.Idunits, idProgram: data.IdProgram, active: estado }

    }

    this.programConfQceService.update(datos, data.IdProgramconf).subscribe(respuesta => {

      this.getProgramas();

      this.accion = 'Editar';
      this.toastr.success('Estado actualizado', 'Actualización');
    }, err => {
      this.toastr.error('No fue posible actualizar el estado', 'Error')
      this.log.logObj('Control Calidad Externo', 'Administración', 'Asignación de valores', 'a', datos, err.message, err.status);
    });


  }

  eliminarGestionProgramas(row: any) {
    this.programConfQceService.delete('Programas', row.IdProgramconf).subscribe({

      next: (respuesta) => {
        this.getProgramas();
        this.accion = '';
        this.toastr.success('Registro eliminado');
        this.log.logObj('Control Calidad Externo', 'Administración', 'Rondas', 'e', row, JSON.stringify(respuesta), 200);
      }, error: (error) => {
        this.toastr.error(this.messageError);
        this.log.logObj('Control Calidad Externo', 'Administración', 'Rondas', 'e', row, this.messageError, error.status);
      }
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

