import { debounce, filter, takeUntil } from 'rxjs/operators';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SharedService } from '@app/services/shared.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { ToastrService } from 'ngx-toastr';
import { ProgramConfQceDetailsService } from '@app/services/calidad-externo/ProgramconfQceDetails.service';
import { UnitsQceService } from '@app/services/calidad-externo/unitsQce.service';
import { LotesQceDetailsService } from '@app/services/calidad-externo/lotsQceDetails.service';
import { AssignValuesExpectedQceService } from '@app/services/calidad-externo/assign-values-expected-qce.service';
import { AnalitosService } from '@app/services/configuracion/analitos.service';
import { AsyncPipe, DatePipe, NgFor, NgIf } from '@angular/common';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { createLog } from "@app/globals/logUser";
import { ImageCdnPipe } from '../../../../../core/pipes/image-cdn.pipe';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { TablaComunComponent } from '@app/modules/shared/general-tablas/tabla-comun/tabla-comun.component';
import { map, Observable, startWith, Subject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { LoaderService } from '@app/services/loader/loader.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { ModalData } from '@app/Models/Modaldata';
import { ModalGeneralComponent } from '@app/modules/shared/modals/modal-general/modal-general.component';


@Component({
  selector: 'app-asignacion-valor-esperado-2',
  templateUrl: './asignacion-valor-esperado-2.component.html',
  styleUrls: ['./asignacion-valor-esperado-2.component.css'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, MatFormFieldModule,
    MatSelectModule, MatOptionModule, NgFor, MatTooltipModule,
    NgIf, MatInputModule, MatTableModule, MatSortModule, MatSlideToggleModule,
    MatPaginatorModule, TranslateModule, ImageCdnPipe, MatAutocompleteModule, TablaComunComponent, AsyncPipe,
    MatIconModule, NgxMatSelectSearchModule]
})
export class AsignacionValorEsperado2Component implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  displayedColumns: string[] = ['Analito', 'Unidades', 'Valor', 'Estado', 'Editar', 'Eliminar'];
  dataSource: MatTableDataSource<any>;
  dataTableBody: any[] = [];
  analizador = new FormControl('');
  metodo = new FormControl('');
  unidades = new FormControl('');

  ventanaModal!: BsModalRef;

  formaBuscarDatos = this.fb.group({
    lote: ['', [Validators.required]],
    programa: ['', [Validators.required]],
  });

  formCrearEditar = this.fb.group({
    idExpectedValueQuantitativeReport: [0, []],
    idAnalytes: ['', [Validators.required]],
    idUnits: ['', [Validators.required]],
    expectedvalue: ['', [Validators.required]],
    idLot: [, []],
    idprogram: [, []],
    active: [true, []],
  });

  filterLotes = new FormControl('');
  filterProgramas = new FormControl('');
  filterAnalito = new FormControl('');
  filterUnidades = new FormControl('');
  lotes: any;
  lotesCopy: any;
  listaProgramas: any;
  listaProgramasCopy: any;
  analyzers: any;
  analitos: any[] = [];
  analitosCopy: any[] = [];
  methods: any;
  methodsActive: any;
  listaUnits: any[] = [];
  listaUnitsCopy: any[] = [];
  reactivos: any;

  verTabla: boolean = false;
  flagEditar: boolean = false;

  Loguser: any;
  log = new createLog(this.datePipe, this.translate, this.assignValuesExpectedQceService);

  filteredLotes: Observable<string[]>;
  filteredProgramas: Observable<string[]>;
  filteredAnalitos: Observable<string[]>;
  filterUnidad: Observable<string[]>;

  constructor(
    private datePipe: DatePipe,
    private translate: TranslateService,
    private assignValuesExpectedQceService: AssignValuesExpectedQceService,
    private unitsQceService: UnitsQceService,
    private lotesQceDetailsService: LotesQceDetailsService,
    private programConfQceDetailsService: ProgramConfQceDetailsService,
    private analitosService: AnalitosService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private sharedService: SharedService,
    private modalService: BsModalService,
    private dialog: MatDialog,
    private loaderService: LoaderService
  ) { }

  ngOnInit(): void {
    this.sharedService.customTextPaginator(this.paginator);
    this.getLotes();
    this.filters()
  }

  limpiarDatos(){
    this.analyzers = [];
    this.analitos = [];
    this.analitosCopy = [];
    this.methods = {};
    this.methodsActive = {};
    this.listaUnits = [];
    this.listaUnitsCopy = [];
  }


  filters() {
    this.filterLotes.valueChanges.subscribe(word => {

      if (word) {
        this.lotes = this.lotesCopy.filter((lote: any) => {
          return lote.Numlot.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.lotes = this.lotesCopy;
      }
    });
    this.filterProgramas.valueChanges.subscribe(word => {

      if (word) {
        this.listaProgramas = this.listaProgramasCopy.filter((program: any) => {
          return program.Desprogram.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.listaProgramas = this.listaProgramasCopy;
      }
    });
    this.filterAnalito.valueChanges.subscribe(word => {
      if (word) {
        this.analitos = this.analitosCopy.filter((program: any) => {
          return program.desanalytes.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.analitos = this.analitosCopy;
      }
    });
    this.filterUnidades.valueChanges.subscribe(word => {

      if (word) {
        this.listaUnits = this.listaUnitsCopy.filter((program: any) => {
          return program.codunits.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.listaUnits = this.listaUnitsCopy;
      }
    });

  }



  aplicarFiltro(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  async getAnalitosxPrograma(programa: any) {

    this.verTabla = false;
    try {
      this.loaderService.show();
      this.loaderService.text.emit({ text: 'Buscando analitos...' });
      let x = await this.analitosService.getAnalitosPorPrograma(programa.value).toPromise();
      this.loaderService.hide();
      if (x) {
        this.analitos = x;
        this.analitosCopy = x;
        await this.consultarUnits();
      } else {
        throw new Error();
      }
    } catch (error) {
      this.limpiarDatos();
      this.loaderService.hide();
      this.toastr.error('No se encontraron analitos relacionados al programa');
    }

  }

  getLotes() {
    this.lotesQceDetailsService.getAllAsync().then(r => {
      this.lotes = r;
      this.lotesCopy = r;
      this.consultarProgramas();
    });
  }


  consultarProgramas() {
    this.programConfQceDetailsService.getProgramEsp("N").toPromise().then(r => {
      this.listaProgramas = r;
      this.listaProgramasCopy = r;
      this.consultarUnits();
    });
  }

  consultarUnits() {
    this.unitsQceService.getAllAsync().then(respuesta => {
      this.listaUnits = respuesta.filter(datos => datos.active == true);
      this.listaUnitsCopy = respuesta.filter(datos => datos.active == true);
    });
  }

  buscar() {
    this.dataSource = new MatTableDataSource();
    this.dataTableBody = [];
    if (this.formaBuscarDatos.valid) {

      try {
        this.loaderService.show();
        this.loaderService.text.emit({ text: 'Cargando datos...' });
        let lote = Number(this.formaBuscarDatos.value.lote)
        let programa = Number(this.formaBuscarDatos.value.programa)
        this.assignValuesExpectedQceService
          .getAssignValuesExpected2(lote, programa).toPromise()
          .then(r => {
            this.loaderService.hide();
            if (!r) {
              this.toastr.error('No hay datos registrados');
            }
            this.verTabla = true;
            this.generarData(r);
          })
      } catch (error) {
        this.loaderService.hide();
        this.toastr.error('No hay datos registrados');
      }

    } else {
      this.toastr.error('Debe diligenciar todos los campos.');
      this.formaBuscarDatos.markAllAsTouched();
      this.verTabla = false;
    }
  }

  organizarDataEditarOCrear(): any {
    const {
      idExpectedValueQuantitativeReport,
      idAnalytes,
      idUnits,
      expectedvalue,
      active } = this.formCrearEditar.value;
    const { lote, programa } = this.formaBuscarDatos.value;
    const newObj = {
      idExpectedValueQuantitativeReport,
      idLot: lote,
      idprogram: programa,
      idAnalytes: idAnalytes,
      idUnits,
      expectedvalue,
      active
    }
    return newObj;
  }

  detailObj() {
    const newObj = this.organizarDataEditarOCrear();
    let lote = this.lotes.find(x => x.IdLot == newObj.id_Lot);
    let programa = this.listaProgramas.find(x => x.IdProgram = newObj.idProgram);
    let analito = this.analitos.find(x => x.idanalytes == newObj.idAnalytes)
    let unidades = this.listaUnits.find(x => x.idunits == newObj.idUnits);
    let obj = {
      Lote: lote?.Numlot,
      Program: programa?.Desprogram,
      Analytes: analito?.desanalytes,
      Units: unidades?.codunits,
      //TODO : VALUE EXPECTED NO EXISTE SE REEMPLAZA POR idExpectedValueQuantitativeReport, PERO NO SE SI ES EL DATO CORRECTO
      valueExpected: this.formCrearEditar.value.idExpectedValueQuantitativeReport,
      active: this.formCrearEditar.value.active
    }
    return obj;
  }


  crearAsignacion() {
    const newObj = this.organizarDataEditarOCrear();
    if (this.formCrearEditar.invalid) {
      this.formCrearEditar.markAllAsTouched();
      return
    }
    this.assignValuesExpectedQceService.createAssignValuesExpected2(newObj).then(r => {
      this.toastr.success('Asignación valor esperado generado correctamente.');
      this.log.logObj('Control Calidad Externo', 'Administración', 'Asignación de valor esperado 2', 'c', this.detailObj(), JSON.stringify(r), 200);
      this.buscar();
      this.formCrearEditar.reset({ active: true });

    })
      .catch(error => {
        this.toastr.error(error.error);
        this.log.logObj('Control Calidad Externo', 'Administración', 'Asignación de valor esperado 2', 'c', this.detailObj(), error.message, error.status);
        this.formCrearEditar.reset({ active: true });

      });
  }

  async editarData(idExpectedValueQuantitativeReport: number, newObj: any, pasaInvalido: boolean = false) {
    if (!pasaInvalido) {
      if (this.formCrearEditar.invalid) {
        this.formCrearEditar.markAllAsTouched();
        return
      }
    }
    return this.assignValuesExpectedQceService.updateAssignValuesExpected2(idExpectedValueQuantitativeReport, newObj)
      .then(r => {
        this.toastr.success('Estado registro', 'Actualización')
        this.log.logObj('Control Calidad Externo', 'Administración', 'Asignación de valor esperado 2', 'a', this.detailObj(), JSON.stringify(r), 200);
        this.buscar();
        this.formCrearEditar.reset({ active: true });

      })
      .catch(error => {
        this.toastr.error('No fue posible actualizar el estado', 'Error')
        this.log.logObj('Control Calidad Externo', 'Administración', 'Asignación de valor esperado 2', 'a', this.detailObj(), error.message, error.status);
        this.formCrearEditar.reset({ active: true });
      });
  }

  async editar(idExpectedValueQuantitativeReport: number) {
    const newObj = this.organizarDataEditarOCrear();
    await this.editarData(idExpectedValueQuantitativeReport, newObj);
  }

  async editarToggle(datos: any) {
    const [data, estado] = datos;
    data.active = estado;


    this.loaderService.show()
    this.loaderService.text.emit({ text: 'Cambiando estado...' })
    return this.assignValuesExpectedQceService.updateAssignValuesExpected2(data.idExpectedValueQuantitativeReport, data)
      .then(r => {
        this.toastr.success('Estado actualizado', 'Actualización')
        this.log.logObj('Control Calidad Externo', 'Administración', 'Asignación de valor esperado 2', 'a', this.detailObj(), JSON.stringify(r), 200);
        this.buscar();
        this.formCrearEditar.reset({ active: true });

      })
      .catch(error => {
        this.toastr.error('No fue posible actualizar el estado', 'Error')
        this.log.logObj('Control Calidad Externo', 'Administración', 'Asignación de valor esperado 2', 'a', this.detailObj(), error.message, error.status);
        this.formCrearEditar.reset({ active: true });
      });
  }

  private generarData(r) {
    this.verTabla = true;
    const filtrarDataTable: any[] = r;
    this.dataTableBody = filtrarDataTable.map(x => {
      return { Analito: x.desanalytes, Unidades: x.codunits, Valor: x.expectedValue, Estado: x.active, item: x, item5: x, item6: x };
    });
    this.dataSource = new MatTableDataSource(r);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }


  async modalCrear(templateRegistroRondasQce: TemplateRef<any>) {
    this.formCrearEditar.reset({ active: true });
    const destroy$: Subject<boolean> = new Subject<boolean>();
    /* Variables recibidas por el modal */
    const data: ModalData = {
      content: templateRegistroRondasQce,
      btn: 'Guardar',
      btn2: 'Cerrar',
      footer: true,
      title: 'Crear',
      image: 'assets/rutas/iconos/editar.png',
    };
    const dialogRef = this.dialog.open(ModalGeneralComponent, { height: 'auto', width: '40em', data, disableClose: true });

    dialogRef.componentInstance.primaryEvent?.pipe(takeUntil(destroy$)).subscribe(x => {
      if (this.formCrearEditar.invalid) {
        this.formCrearEditar.markAllAsTouched();
        return
      }
      this.crearAsignacion();
      dialogRef.close();
    });
  }

  async modalEditar(templateRegistroConfEdit: TemplateRef<any>, datos: any) {
    this.flagEditar = true;
    const newObj = {
      idExpectedValueQuantitativeReport: datos.idExpectedValueQuantitativeReport,
      idLot: datos.idLot,
      idprogram: datos.idProgram,
      idAnalytes: datos.idAnalytes,
      idUnits: datos.idUnits,
      expectedvalue: datos.expectedValue,
      active: datos.active
    }
    this.formCrearEditar.setValue(newObj);
    const destroy$: Subject<boolean> = new Subject<boolean>();
    /* Variables recibidas por el modal */
    const data: ModalData = {
      content: templateRegistroConfEdit,
      btn: 'Actualizar',
      btn2: 'Cerrar',
      footer: true,
      title: 'Editar',
      image: 'assets/rutas/iconos/editar.png'
    };
    const dialogRef = this.dialog.open(ModalGeneralComponent, { height: 'auto', width: '40em', data, disableClose: true });

    dialogRef.componentInstance.primaryEvent?.pipe(takeUntil(destroy$)).subscribe(x => {
      if (this.formCrearEditar.invalid) {
        this.formCrearEditar.markAllAsTouched();
        return
      }
      this.editarData(datos.idExpectedValueQuantitativeReport, this.formCrearEditar.value);
      dialogRef.close();
    });
  }




  eliminarValoresEsperados2(row: any) {
    this.assignValuesExpectedQceService.DeleteAssignValuesExpected2(row.idExpectedValueQuantitativeReport).subscribe({
      next: (respuesta) => {
        this.buscar();
        this.toastr.success('Registro eliminado');
        this.log.logObj('Control Calidad Externo', 'Administración', 'Asignación de valores esperados', 'e', row, JSON.stringify(respuesta), 200);
      },
      error: (error) => {
        if (error.error.text == "La parametrización fue eliminada correctamente.") {
          this.buscar();
          this.toastr.success(error.error.text);
        } else {
          this.buscar();
          this.toastr.error('Ocurrio un error al eliminar');
          this.log.logObj('Control Calidad Externo', 'Administración', 'Rondas', 'e', row, 'Ocurrio un error al eliminar', error.status);
        }


      }
    });
  }


}

