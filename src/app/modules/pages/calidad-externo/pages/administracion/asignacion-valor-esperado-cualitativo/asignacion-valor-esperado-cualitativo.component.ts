import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SharedService } from '@app/services/shared.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { ToastrService } from 'ngx-toastr';
import { ProgramConfQceDetailsService } from '@app/services/calidad-externo/ProgramconfQceDetails.service';
import { MethodsQceService } from '@app/services/calidad-externo/MethodsQce.service';
import { UnitsQceService } from '@app/services/calidad-externo/unitsQce.service';
import { AnalyzerQceService } from '@app/services/calidad-externo/AnalyzerQce.service';
import { ReactivosQceService } from '@app/services/calidad-externo/reactivos-qce.service';
import { LotesQceDetailsService } from '@app/services/calidad-externo/lotsQceDetails.service';
import { ConfigResultsService } from '@app/services/calidad-externo/configResults.service';
import { AssignValuesExpectedCualiQceService } from '@app/services/calidad-externo/assign-values-expected-cuali-qce.service';
import { AnalitosService } from '@app/services/configuracion/analitos.service';
import { ValorEsperadoService } from '../../../../../../services/calidad-interno/valor-espertado.service';
import { AsyncPipe, DatePipe, NgFor, NgIf, TitleCasePipe } from '@angular/common';
import { createLog } from "../../../../../../globals/logUser";
import { ImageCdnPipe } from '../../../../../core/pipes/image-cdn.pipe';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog } from '@angular/material/dialog';
import { ModalColors, ModalMessageComponent } from '@app/modules/shared/modals/modal-message/modal-message.component';
import { map, Observable, startWith, Subject, takeUntil } from 'rxjs';
import { ModalData } from '@app/Models/Modaldata';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { TablaComunComponent } from '@app/modules/shared/general-tablas/tabla-comun/tabla-comun.component';
import { MatInputModule } from '@angular/material/input';
import { ModalGeneralComponent } from '@app/modules/shared/modals/modal-general/modal-general.component';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { LoaderService } from '@app/services/loader/loader.service';
import { MatSelectChange } from '@angular/material/select';

@Component({
  selector: 'app-asignacion-valor-esperado-cualitativo',
  templateUrl: './asignacion-valor-esperado-cualitativo.component.html',
  styleUrls: ['./asignacion-valor-esperado-cualitativo.component.css'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, MatFormFieldModule,
    MatSelectModule, MatOptionModule, NgFor, MatTooltipModule
    , NgIf, MatTableModule, MatSortModule, MatSlideToggleModule,
    MatPaginatorModule, TranslateModule, ImageCdnPipe,
    MatAutocompleteModule, TablaComunComponent, AsyncPipe,
    MatIconModule, MatInputModule, NgxMatSelectSearchModule, TitleCasePipe,]
})
export class AsignacionValorEsperadoCualitativoComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  displayedColumns: string[] = ['Analito', 'Equipo', 'Reactivo', 'Método', 'Valor esperado', 'Unidades', 'Estado', 'Editar', 'Eliminar'];
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
    idAssignValuesExpectedCuali: ['', []],
    idAnalytes: ['', [Validators.required]],
    idAnalyzer: ['', [Validators.required]],
    idReagents: ['', [Validators.required]],
    idMethods: ['', [Validators.required]],
    idUnits: ['', [Validators.required]],
    idResultsDictionary: ['', [Validators.required]],
    active: [true, []],
  });

  lotes: any;
  lotesCopy: any;
  listaProgramas: any[] = [];
  listaProgramasCopy: any[] = [];
  analyzers: any;
  analyzersCopy: any;
  analitos: any[] = [];
  analitosCopy: any[] = [];
  resultadosEsperados: any[] = [];
  resultadosEsperadosCopy: any[] = [];
  resultExpected: any[] = [];
  methods: any;
  methodsActive: any;
  methodsActiveCopy: any;
  listaUnits: any;
  listaUnitsCopy: any;
  reactivos: any;
  reactivosCopy: any;

  verTabla: boolean = false;
  flagEditar: boolean = false;
  Loguser: any;
  log = new createLog(this.datePipe, this.translate, this.assignValuesExpectedCualiQceService);


  filterLotes = new FormControl('')
  filterPrograma = new FormControl('')
  filterAnalytes = new FormControl('')
  filterAnalizer = new FormControl('')
  filterMetodo = new FormControl('')
  filterUnits = new FormControl('')
  filterReactivo = new FormControl('')
  filterValoresEsperados = new FormControl('')

  //
  datosAnterioresEdicion: any[] = [];
  datosCualitativos: any[] = [];

  constructor(
    private datePipe: DatePipe,
    private assignValuesExpectedCualiQceService: AssignValuesExpectedCualiQceService,
    private configResultsService: ConfigResultsService,
    private unitsQceService: UnitsQceService,
    private reactivosQceService: ReactivosQceService,
    private methodsQceService: MethodsQceService,
    private lotesQceDetailsService: LotesQceDetailsService,
    private analyzerQceService: AnalyzerQceService,
    private programConfQceDetailsService: ProgramConfQceDetailsService,
    private valorEsperadoService: ValorEsperadoService,
    private translate: TranslateService,
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
  this.filters();

}


/**
 * evento que se dispara cuando se selecciona un programa en el select.
 * @param event 
 */
onProgramaSeleccionado(event: MatSelectChange): void {
  this.limpiarDatos();

  //Trae los valores esperados solo fijandose en el programa
  this.getValorEsperado("");
  const programa = this.listaProgramas.find(p => p.IdProgram === event.value);
  if (programa) {
    this.getAnalitosxPrograma(programa);
  }

  if (this.formaBuscarDatos.valid) {
    this.buscar();
  }
}


// buscar() {
//     this.dataSource = new MatTableDataSource();
//     this.dataTableBody = [];
//     if (this.formaBuscarDatos.valid) {
//       let lote = this.formaBuscarDatos.value.lote
//       let programa = this.formaBuscarDatos.value.programa
//       this.assignValuesExpectedCualiQceService.getAssignValuesExpected(Number(lote), Number(programa)).toPromise()
//         .then(r => {

//           this.generarData(r);

//         })
//         .catch(err => {
//           this.toastr.error('No hay datos registrados');
//           this.verTabla = true;
//         });

//     } else {
//       this.toastr.error('Debe diligenciar los campos completamente.');
//       this.formaBuscarDatos.markAllAsTouched();
//     }
//   } 


/**
 * método para buscar los datos de asignación de valores esperados cualitativos.
 */
buscar(): void {
  // Oculta la tabla antes de procesar
  this.verTabla = false;

  // Limpia los datos anteriores
  this.dataTableBody = [];
  this.dataSource = new MatTableDataSource();

  if (this.formaBuscarDatos.valid) {
    const lote = this.formaBuscarDatos.value.lote;
    const programa = this.formaBuscarDatos.value.programa;

    this.assignValuesExpectedCualiQceService.getAssignValuesExpected(Number(lote), Number(programa)).toPromise()
      .then(r => {
        this.datosCualitativos = r || [];

        this.generarData(this.datosCualitativos);

        // Mensaje si no hay datos
        if (!r || r.length === 0) {
          this.toastr.info('No se encontraron datos para este programa.');
        }

        // Mostrar la tabla (vacía o con datos)
        this.verTabla = true;
      })
      .catch(err => {
        // En caso de error, muestra tabla vacía y botón de crear
        this.toastr.error('No se encontraron datos para este programa.');
        this.dataTableBody = [];
        this.dataSource = new MatTableDataSource();
        this.verTabla = true;
      });
  } else {
    this.toastr.error('Debe diligenciar los campos completamente.');
    this.formaBuscarDatos.markAllAsTouched();
  }
}


private generarData(r: any[]): void {
  this.dataTableBody = [];
  this.dataSource = new MatTableDataSource();

  const filtrarDataTable: any[] = r || [];

    this.dataTableBody = filtrarDataTable.map(x => {
      return { Analito: x.desanalytes, Equipo: x.nameAnalyzer, Reactivo: x.desreagents, Método: x.desmethods, 'Valor esperado': x.desresults, Unidades: x.codunits, Estado: x.active, item: x, item8: x, item9: x };
    });

  this.dataSource = new MatTableDataSource(filtrarDataTable);
  this.dataSource.paginator = this.paginator;
  this.dataSource.sort = this.sort;

  // Guardar copia para edición
  this.datosAnterioresEdicion = JSON.parse(JSON.stringify(filtrarDataTable));
}


  limpiarDatos() {
    this.analyzers = [];
    this.analyzersCopy = [];
    this.analitos = [];
    this.analitosCopy = [];
    this.methods = [];
    this.methodsActiveCopy = [];
    this.methodsActive = [];
    this.listaUnits = [];
    this.listaUnitsCopy = [];
    this.reactivos = [];
    this.reactivosCopy = [];
  }

  filters() {
    this.filterLotes.valueChanges.subscribe(word => {

      if (word) {
        this.lotes = this.lotesCopy.filter((lote: any) => {
          return lote.Numlot.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.lotes = this.lotesCopy
      }
    });

    this.filterPrograma.valueChanges.subscribe(word => {

      if (word) {
        this.listaProgramas = this.listaProgramasCopy.filter((item: any) => {
          return item.Desprogram.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.listaProgramas = this.listaProgramasCopy
      }
    });
    this.filterAnalytes.valueChanges.subscribe(word => {

      if (word) {
        this.analitos = this.analitosCopy.filter((item: any) => {
          return item.desanalytes.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.analitos = this.analitosCopy
      }
    });
    this.filterAnalizer.valueChanges.subscribe(word => {

      if (word) {
        this.analyzers = this.analyzersCopy.filter((item: any) => {
          return item.nameAnalyzer.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.analyzers = this.analyzersCopy
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
    this.filterUnits.valueChanges.subscribe(word => {

      if (word) {
        this.listaUnits = this.listaUnitsCopy.filter((item: any) => {
          return item.codunits.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.listaUnits = this.listaUnitsCopy
      }
    });
    this.filterReactivo.valueChanges.subscribe(word => {

      if (word) {
        this.reactivos = this.reactivosCopy.filter((item: any) => {
          return item.desreagents.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.reactivos = this.reactivosCopy
      }
    });
    this.filterValoresEsperados.valueChanges.subscribe(word => {

      if (word) {
        this.resultadosEsperados = this.resultadosEsperadosCopy.filter((item: any) => {
          return item.Desresults.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.resultadosEsperados = this.resultadosEsperadosCopy
      }
    });
  }



  async getAnalitosxPrograma(programa: any) {

    try {
      this.loaderService.show();
      this.loaderService.text.emit({ text: 'Cargando analitos' });
      let analitos = await this.analitosService.getAnalitosPorProgramaCualitativo(programa.IdProgram).toPromise();
      this.analitos = analitos;
      this.analitosCopy = analitos;
      await this.getAnalizadores();
      await this.getMethods();
      await this.getReactivos();
      await this.consultarUnits();
      this.loaderService.hide();
    } catch (error) {
      this.limpiarDatos();
      this.verTabla = false;
      this.loaderService.hide();
      this.toastr.error('No se encontraron analitos relacionados al programa');
    }
  }

  async getValorEsperado(analyte: any) {


    try {
      this.loaderService.show();
      this.loaderService.text.emit({ text: 'Cargando valores esperados' });
      let programa = this.formaBuscarDatos.value.programa

      let resultadosEsperados: any = await this.valorEsperadoService.valorEsperadoCualitativo(Number(programa)).toPromise();
      this.resultadosEsperados = resultadosEsperados;
      this.resultadosEsperadosCopy = resultadosEsperados;
      this.loaderService.hide();
    } catch (error) {
      this.loaderService.hide();
      this.resultadosEsperados = [];
      this.formCrearEditar.get('idResultsDictionary').setValue('')
      this.toastr.error('No se encontraron "Valores Esperados" relacionados al analito');
    }




  }

  async getValorEsperadoAnalito(analytes: any){
    this.resultadosEsperados = this.resultadosEsperadosCopy.filter(x=>x.Idanalytes === analytes.idanalytes) || null;

    if(this.resultadosEsperados.length > 0){
      this.resultExpected = this.resultadosEsperados;
    } else {
      this.toastr.error("No se encontraron resultados esperados para el analito seleccionado");
    }
  }

  async getLotes() {
    try {
      this.loaderService.show();
      this.loaderService.text.emit({ text: 'Cargando lotes...' });
      let r = await this.lotesQceDetailsService.getAllAsync()
      this.loaderService.hide();
      if (r) {
        this.lotes = r;
        this.lotesCopy = r;
        await this.consultarProgramas();

      }
    } catch (error) {
      this.toastr.info('No se encontraron lotes asociados')
    }

  }


  async consultarProgramas() {

    try {
      this.loaderService.show();
      this.loaderService.text.emit({ text: 'Cargando programas...' });
      let r = await this.programConfQceDetailsService.getProgramEsp("C").toPromise()
      this.loaderService.hide();
      if (r) {
        this.listaProgramas = r;
        this.listaProgramasCopy = r;
        this.getAnalizadores();
      }
    } catch (error) {
      this.toastr.info('No se encontraron programas asociados')
    }



  }

  async getAnalizadores() {
    try {
      this.loaderService.show();
      this.loaderService.text.emit({ text: 'Cargando analizadores' });
      let analizadores = await this.analyzerQceService.getAllAsync()
      if (analizadores) {
        this.analyzers = analizadores;
        this.analyzersCopy = analizadores;
      }
      this.loaderService.hide();
      await this.getReactivos();
    } catch (error) {
      this.loaderService.hide();
    }
  }


  async getReactivos() {

    try {
      this.loaderService.show();
      this.loaderService.text.emit({ text: 'Cargando reactivos' });
      let reactivos = await this.reactivosQceService.getAllAsync()
      if (reactivos) {
        this.reactivos = reactivos;
        this.reactivosCopy = reactivos;
      }
      this.loaderService.hide();
      await this.getMethods();
    } catch (error) {
      this.loaderService.hide();
    }

  }


  async getMethods() {


    try {
      this.loaderService.show();
      this.loaderService.text.emit({ text: 'Cargando metodos' });
      this.methods = await this.methodsQceService.getAllAsync();
      if (this.methods) {
        this.methodsActive = this.methods.filter(e => e.active);
        this.methodsActiveCopy = this.methods.filter(e => e.active);
      }
      this.loaderService.hide();
      await this.consultarUnits();
    } catch (error) {
      this.loaderService.hide();
    }
  }

  async consultarUnits() {
    try {
      this.loaderService.show();
      this.loaderService.text.emit({ text: 'Cargando unidades' });
      let unidades = await this.unitsQceService.getAllAsync()
      if (unidades) {
        this.listaUnits = unidades.filter(datos => datos.active == true);
        this.listaUnitsCopy = unidades.filter(datos => datos.active == true);
      }
      this.loaderService.hide();

    } catch (error) {
      this.loaderService.hide();
    }
  }

  selectOne(idx, row, item?) {
    switch (idx) {
      case 1:
        row.idAnalyzer = Number(item.target.value);
        break;
      case 2:
        row.idReagents = Number(item.target.value);
        break;
      case 3:
        row.idMethods = Number(item.target.value);
        break;
      case 4:
        row.idUnits = Number(item.target.value);
        break;
      case 5:
        row.idResultsDictionary = Number(item.target.value);
        break;
    }
  }





  // buscar() {
   
  //   this.dataSource = new MatTableDataSource();
  //   this.dataTableBody = [];
  //   if (this.formaBuscarDatos.valid) {
  //     let lote = this.formaBuscarDatos.value.lote
  //     let programa = this.formaBuscarDatos.value.programa
  //     this.assignValuesExpectedCualiQceService.getAssignValuesExpected(Number(lote), Number(programa)).toPromise()
  //       .then(r => {
         
  //         this.datosCualitativos = r;
          
  //         this.generarData(r);
          
          

  //       })
  //       .catch(err => {
  //         this.toastr.error('No hay datos registrados');
  //         this.verTabla = true;
  //       });

  //   } else {
  //     this.toastr.error('Debe diligenciar los campos completamente.');
  //     this.formaBuscarDatos.markAllAsTouched();
  //   }
  // }

// buscar(): void {
//   // Oculta la tabla mientras se carga nueva información
//   this.verTabla = false;
//   this.dataSource = new MatTableDataSource();
//   this.dataTableBody = [];

//   if (this.formaBuscarDatos.valid) {
//     const lote = this.formaBuscarDatos.value.lote;
//     const programa = this.formaBuscarDatos.value.programa;

//     this.assignValuesExpectedCualiQceService.getAssignValuesExpected(Number(lote), Number(programa)).toPromise()
//       .then(r => {
//         if (Array.isArray(r) && r.length > 0) {
//           this.datosCualitativos = r;
//           this.generarData(r); // Esto mostrará la tabla actualizada
//         } else {
//           this.toastr.warning('No se encontraron resultados para este programa.');
//           this.verTabla = false;
//         }
//       })
//       .catch(err => {
//         this.toastr.error('No hay datos registrados');
//         this.verTabla = false;
//       });
//   } else {
//     this.toastr.error('Debe diligenciar los campos completamente.');
//     this.formaBuscarDatos.markAllAsTouched();
//   }
// }




  organizarDataEditarOCrear(): any {
    const {
      idAssignValuesExpectedCuali,
      idResultsDictionary,
      idAnalytes,
      idAnalyzer,
      idMethods,
      idUnits,
      idReagents,
      active } = this.formCrearEditar.value;
    const { lote, programa } = this.formaBuscarDatos.value;
    const newObj = {
      idAssignValuesExpectedCuali,
      idResultsDictionary,
      id_Lot: lote,
      idProgram: programa,
      idAnalytes,
      idAnalyzer,
      idMethods,
      idUnits,
      idReagents,
      active
    }
    return newObj;
  }

  detailObj() {
    const newObj = this.organizarDataEditarOCrear();
    let lote = this.lotes.find(x => x.IdLot == newObj.id_Lot);
    let programa = this.listaProgramas.find(x => x.IdProgram = newObj.idProgram);
    let analito = this.analitos.find(x => x.idanalytes == newObj.idAnalytes)
    let analizador = this.analyzers.find(x => x.idAnalyzer == newObj.idAnalyzer);
    let reactivo = this.reactivos.find(x => x.idreagents == newObj.idReagents);
    let metodo = this.methodsActive.find(x => x.idmethods == newObj.idMethods);
    let unidades = this.listaUnits.find(x => x.idunits == newObj.idUnits);
    let obj = {
      Lote: lote.Numlot,
      Program: programa.Desprogram,
      Analytes: analito?.desanalytes,
      Analyzer: analizador?.nameAnalyzer,
      Methods: metodo?.desmethods,
      Units: unidades?.codunits,
      Reagents: reactivo?.desreagents,
      //todo : VALUE EXPECTED NO EXISTE SE REEMPLAZA POR idAssignValuesExpectedCuali, PERO NO SE SI ES EL DATO CORRECTO
      valueExpected: this.formCrearEditar.value.idAssignValuesExpectedCuali,
      active: this.formCrearEditar.value.active
    }


    return obj;
  }



  // crearAsignacion() {
  //   const newObj = this.organizarDataEditarOCrear();

  //   if (this.formCrearEditar.invalid) {
  //     this.formCrearEditar.markAllAsTouched();
  //     return
  //   }
  //   this.assignValuesExpectedCualiQceService.createAssignValuesExpected(newObj).then(r => {
  //     this.toastr.success('Asignación de valores esperados generados correctamente.');
  //     this.log.logObj('Control Calidad Externo', 'Administración', 'Asignación de valor esperado cualitativo', 'c', this.detailObj(), JSON.stringify(r), 200);
  //     this.buscar()
  //     this.formCrearEditar.reset({ active: true });

  //   })
  //     .catch(error => {
  //       this.toastr.error(error.error);
  //       this.log.logObj('Control Calidad Externo', 'Administración', 'Asignación de valor esperado cualitativo', 'c', this.detailObj(), error.message, error.status);
  //       this.formCrearEditar.reset({ active: true });

  //     });
  // }



  
    /**
     * metodo para construir los datos del log de asignación cualitativa.
     * @param newObj 
     * @returns 
     */ 
    construirDatosLogCualitativo(newObj: any): any {
      const loteObj = this.lotes?.find(x => x.IdLot == newObj.id_Lot) || {};
      const programaObj = this.listaProgramas?.find(x => x.IdProgram == newObj.idProgram) || {};
      const analitoObj = this.analitos?.find(x => x.idanalytes == newObj.idAnalytes) || {};
      const analizadorObj = this.analyzers?.find(x => x.idAnalyzer == newObj.idAnalyzer) || {};
      const reactivoObj = this.reactivos?.find(x => x.idreagents == newObj.idReagents) || {};
      const metodoObj = this.methodsActive?.find(x => x.idmethods == newObj.idMethods) || {};
      const unidadObj = this.listaUnits?.find(x => x.idunits == newObj.idUnits) || {};
      const resultadoObj = this.resultadosEsperados?.find(x => x.idResultsDictionary == newObj.idResultsDictionary) || {};

      // Normalizar el valor de active a booleano
      let activeValue: boolean | null = null;
      if (typeof newObj.active === 'boolean') {
        activeValue = newObj.active;
      } else if (typeof newObj.active === 'string') {
        if (newObj.active.toLowerCase() === 'true') activeValue = true;
        else if (newObj.active.toLowerCase() === 'false') activeValue = false;
      } else if (typeof newObj.active === 'number') {
        activeValue = newObj.active === 1;
      }

      return {
        LoteYPrograma: {
          id_Lot: newObj.id_Lot,
          numlot: loteObj.Numlot ?? '',
          idProgram: newObj.idProgram,
          desprogram: programaObj.Desprogram ?? ''
        },
        analito: {
          idAnalytes: newObj.idAnalytes,
          desanalytes: analitoObj.desanalytes ?? ''
        },
        analizador: {
          idAnalyzer: newObj.idAnalyzer,
          nameAnalyzer: analizadorObj.nameAnalyzer ?? ''
        },
        reactivo: {
          idReagents: newObj.idReagents,
          desreagents: reactivoObj.desreagents ?? ''
        },
        metodo: {
          idMethods: newObj.idMethods,
          desmethods: metodoObj.desmethods ?? ''
        },
        unidad: {
          idUnits: newObj.idUnits,
          codunits: unidadObj.codunits ?? ''
        },
        valorEsperado: {
          idResultsDictionary: newObj.idResultsDictionary,
          desresults: resultadoObj.Desresults ?? ''
        },
        active: activeValue
      };
    }


    /**
     * metodo para crear una asignación de valores esperados cualitativos.
     * @returns 
     */
    crearAsignacion() {
      const newObj = this.organizarDataEditarOCrear();

      // Normalizar el valor de active antes de enviar al servicio
      if (typeof newObj.active === 'string') {
        if (newObj.active.toLowerCase() === 'true') newObj.active = true;
        else if (newObj.active.toLowerCase() === 'false') newObj.active = false;
        else newObj.active = null;
      } else if (typeof newObj.active === 'number') {
        newObj.active = newObj.active === 1;
      } else if (typeof newObj.active !== 'boolean') {
        newObj.active = !!newObj.active;
      }

      // --- LOGGING VARIABLES ---
      const usuario = sessionStorage.getItem('userid') || 'desconocido';
      const nombreUsuario = sessionStorage.getItem('nombres') || 'desconocido';
      const inicio = Date.now();
      const endpoint = `${window.location.origin}/api/qce/AssignValuesExpectedCuali`;
      const userAgent = navigator.userAgent;

      // Estructura de datos para el log con nombres
      const datosLog = this.construirDatosLogCualitativo(newObj);

      if (this.formCrearEditar.invalid) {
        this.formCrearEditar.markAllAsTouched();
        return;
      }

      this.assignValuesExpectedCualiQceService.createAssignValuesExpected(newObj).then(r => {
        this.toastr.success('Asignación de valores esperados generados correctamente.');
        
        const fin = Date.now();
        const tiempoEjecucion = fin - inicio;

        // Extraer solo los datos relevantes de la respuesta para el log
        const respuestaLog = r?.body && Array.isArray(r.body)
          ? r.body.map((item: any) => ({
              idAssignValuesExpectedCuali: item.idAssignValuesExpectedCuali,
              id_lot: item.id_lot,
              numlot: item.numlot,
              idAnalytes: item.idAnalytes,
              desanalytes: item.desanalytes,
              idAnalyzer: item.idAnalyzer,
              nameAnalyzer: item.nameAnalyzer,
              idMethods: item.idMethods,
              desmethods: item.desmethods,
              idUnits: item.idUnits,
              codunits: item.codunits,
              idProgram: item.idProgram,
              desprogram: item.desprogram,
              idReagents: item.idReagents,
              desreagents: item.desreagents,
              idResultsDictionary: item.idResultsDictionary,
              desresults: item.desresults,
              active: typeof item.active === 'boolean' ? item.active : (item.active === 'true' ? true : (item.active === 'false' ? false : null))
            }))
          : r;

        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          Hora: new Date().toISOString(),
          Metodo: 'creación',
          Datos: JSON.stringify(datosLog),
          DatosAnteriores: '',
          Respuesta: JSON.stringify(respuestaLog),
          TipoRespuesta: r?.status ?? 200,
          userid: usuario,
          usuario: nombreUsuario,
          executionTime: tiempoEjecucion,
          endpoint: endpoint,
          userAgent: userAgent,
          modulo: 'Control Calidad Externo',
          SubModulo: 'Administración',
          item: 'Asignación de valores cualitativos'
        };

        if (this.assignValuesExpectedCualiQceService.createLogAsync) {
          this.assignValuesExpectedCualiQceService.createLogAsync(Loguser);
        }
        this.buscar();
        this.formCrearEditar.reset({ active: true });
      })
      .catch(error => {
        this.toastr.error(error?.error || 'Error al crear la asignación.');
        const fin = Date.now();
        const tiempoEjecucion = fin - inicio;

        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          Hora: new Date().toISOString(),
          Metodo: 'creación',
          Datos: JSON.stringify(datosLog),
          DatosAnteriores: '',
          Respuesta: error?.message || error?.error || 'Error desconocido',
          TipoRespuesta: error?.status ?? 500,
          userid: usuario,
          usuario: nombreUsuario,
          executionTime: tiempoEjecucion,
          endpoint: endpoint,
          userAgent: userAgent,
          modulo: 'Control Calidad Externo',
          SubModulo: 'Administración',
          item: 'Asignación de valores cualitativos'
        };

        if (this.assignValuesExpectedCualiQceService.createLogAsync) {
          this.assignValuesExpectedCualiQceService.createLogAsync(Loguser);
        }
        this.formCrearEditar.reset({ active: true });
      });
    }



    // /**
    //  * metodo para editar una asignación de valores esperados cualitativos.
    //  * @param idAssignValuesExpectedCuali 
    //  * @param newObj 
    //  * @returns 
    //  */
    // async editarData(idAssignValuesExpectedCuali: number, newObj: any) {

    //   // --- LOGGING VARIABLES ---
    //   const usuario = sessionStorage.getItem('userid') || 'desconocido';
    //   const nombreUsuario = sessionStorage.getItem('nombres') || 'desconocido';
    //   const inicio = Date.now();
    //   const endpoint = `${window.location.origin}/api/qce/AssignValuesExpectedCuali/${idAssignValuesExpectedCuali}`;
    //   const userAgent = navigator.userAgent;

    //   // Obtener datos anteriores para el log
    //   const datosAnterioresRaw = this.datosAnterioresEdicion.find(
    //   x => x.idAssignValuesExpectedCuali === idAssignValuesExpectedCuali
    //   );

    //   // --- Datos anteriores estructurados ---
    //   const datosAnteriores = datosAnterioresRaw
    //   ? {
    //     LoteYPrograma: {
    //       id_Lot: datosAnterioresRaw?.id_Lot ?? datosAnterioresRaw?.id_lot ?? null,
    //       numlot: datosAnterioresRaw?.numlot ?? '',
    //       idProgram: datosAnterioresRaw?.idProgram ?? null,
    //       desprogram: datosAnterioresRaw?.desprogram ?? ''
    //     },
    //     analito: {
    //       idAnalytes: datosAnterioresRaw?.idAnalytes ?? null,
    //       desanalytes: datosAnterioresRaw?.desanalytes ?? ''
    //     },
    //     analizador: {
    //       idAnalyzer: datosAnterioresRaw?.idAnalyzer ?? null,
    //       nameAnalyzer: datosAnterioresRaw?.nameAnalyzer ?? ''
    //     },
    //     reactivo: {
    //       idReagents: datosAnterioresRaw?.idReagents ?? null,
    //       desreagents: datosAnterioresRaw?.desreagents ?? ''
    //     },
    //     metodo: {
    //       idMethods: datosAnterioresRaw?.idMethods ?? null,
    //       desmethods: datosAnterioresRaw?.desmethods ?? ''
    //     },
    //     unidad: {
    //       idUnits: datosAnterioresRaw?.idUnits ?? null,
    //       codunits: datosAnterioresRaw?.codunits ?? ''
    //     },
    //     valorEsperado: {
    //       idResultsDictionary: datosAnterioresRaw?.idResultsDictionary ?? null,
    //       desresults: datosAnterioresRaw?.desresults ?? ''
    //     },
    //     activo: datosAnterioresRaw?.active ?? null
    //     }
    //   : {};

    //   const objeto = this.organizarDataEditarOCrear();

    //   return this.assignValuesExpectedCualiQceService.updateAssignValuesExpected(idAssignValuesExpectedCuali, objeto)
    //   .then(r => {
    //     this.toastr.success('Registro actualizado', 'Actualización');
    //     this.generarData(r);
    //     this.formCrearEditar.reset({ active: true });

    //     // --- LOGGING DESPUÉS DE ACTUALIZAR ---
    //     const fin = Date.now();
    //     const tiempoEjecucion = fin - inicio;

    //     // Buscar el registro actualizado en la respuesta (puede ser array o objeto)
    //     let registroActualizado: any = null;
    //     if (Array.isArray(r)) {
    //     registroActualizado = r.find((item: any) => item.idAssignValuesExpectedCuali === idAssignValuesExpectedCuali);
    //     } else if (r && typeof r === 'object') {
    //     registroActualizado = r;
    //     }

    //     // Si no se encuentra, usar objeto como fallback
    //     const datosLog = registroActualizado
    //     ? {
    //       LoteYPrograma: {
    //         id_Lot: registroActualizado.id_lot ?? registroActualizado.id_Lot ?? null,
    //         numlot: registroActualizado.numlot ?? '',
    //         idProgram: registroActualizado.idProgram ?? null,
    //         desprogram: registroActualizado.desprogram ?? ''
    //       },
    //       analito: {
    //         idAnalytes: registroActualizado.idAnalytes ?? null,
    //         desanalytes: registroActualizado.desanalytes ?? ''
    //       },
    //       analizador: {
    //         idAnalyzer: registroActualizado.idAnalyzer ?? null,
    //         nameAnalyzer: registroActualizado.nameAnalyzer ?? ''
    //       },
    //       reactivo: {
    //         idReagents: registroActualizado.idReagents ?? null,
    //         desreagents: registroActualizado.desreagents ?? ''
    //       },
    //       metodo: {
    //         idMethods: registroActualizado.idMethods ?? null,
    //         desmethods: registroActualizado.desmethods ?? ''
    //       },
    //       unidad: {
    //         idUnits: registroActualizado.idUnits ?? null,
    //         codunits: registroActualizado.codunits ?? ''
    //       },
    //       valorEsperado: {
    //         idResultsDictionary: registroActualizado.idResultsDictionary ?? null,
    //         desresults: registroActualizado.desresults ?? ''
    //       },
    //       activo: registroActualizado.active ?? null
    //       }
    //     : {
    //       LoteYPrograma: {
    //         id_Lot: objeto.id_Lot ?? null,
    //         numlot: '',
    //         idProgram: objeto.idProgram ?? null,
    //         desprogram: ''
    //       },
    //       analito: {
    //         idAnalytes: objeto.idAnalytes,
    //         desanalytes: ''
    //       },
    //       analizador: {
    //         idAnalyzer: objeto.idAnalyzer,
    //         nameAnalyzer: ''
    //       },
    //       reactivo: {
    //         idReagents: objeto.idReagents,
    //         desreagents: ''
    //       },
    //       metodo: {
    //         idMethods: objeto.idMethods,
    //         desmethods: ''
    //       },
    //       unidad: {
    //         idUnits: objeto.idUnits,
    //         codunits: ''
    //       },
    //       valorEsperado: {
    //         idResultsDictionary: objeto.idResultsDictionary,
    //         desresults: ''
    //       },
    //       activo: objeto.active
    //       };

    //     const Loguser = {
    //     Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
    //     Hora: new Date().toISOString(),
    //     Metodo: 'actualización',
    //     Datos: JSON.stringify(datosLog),
    //     DatosAnteriores: JSON.stringify(datosAnteriores),
    //     Respuesta: JSON.stringify(r),
    //     TipoRespuesta: r?.status ?? 200,
    //     userid: usuario,
    //     usuario: nombreUsuario,
    //     executionTime: tiempoEjecucion,
    //     endpoint: endpoint,
    //     userAgent: userAgent,
    //     modulo: 'Control Calidad Externo',
    //     SubModulo: 'Administración',
    //     item: 'Asignación de valores cualitativos'
    //     };

    //     if (this.assignValuesExpectedCualiQceService.createLogAsync) {
    //     this.assignValuesExpectedCualiQceService.createLogAsync(Loguser);
    //     }
    //   })
    //   .catch(error => {
    //     this.toastr.error('No fue posible actualizar el registro', 'Error');
    //     this.formCrearEditar.reset({ active: true });

    //     // --- LOGGING EN ERROR ---
    //     const fin = Date.now();
    //     const tiempoEjecucion = fin - inicio;

    //     const Loguser = {
    //     Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
    //     Hora: new Date().toISOString(),
    //     Metodo: 'actualización',
    //     Datos: '', // No hay datos nuevos en error
    //     DatosAnteriores: JSON.stringify(datosAnteriores),
    //     Respuesta: error?.message,
    //     TipoRespuesta: error?.status ?? 500,
    //     userid: usuario,
    //     usuario: nombreUsuario,
    //     executionTime: tiempoEjecucion,
    //     endpoint: endpoint,
    //     userAgent: userAgent,
    //     modulo: 'Control Calidad Externo',
    //     SubModulo: 'Administración',
    //     item: 'Asignación de valores cualitativos'
    //     };

    //     if (this.assignValuesExpectedCualiQceService.createLogAsync) {
    //     this.assignValuesExpectedCualiQceService.createLogAsync(Loguser);
    //     }
    //   });
    // }



   async editarData(idAssignValuesExpectedCuali: number, newObj: any) {
  const usuario = sessionStorage.getItem('userid') || 'desconocido';
  const nombreUsuario = sessionStorage.getItem('nombres') || 'desconocido';
  const inicio = Date.now();
  const endpoint = `${window.location.origin}/api/qce/AssignValuesExpectedCuali/${idAssignValuesExpectedCuali}`;
  const userAgent = navigator.userAgent;

  const datosAnterioresRaw = this.datosAnterioresEdicion.find(
    x => x.idAssignValuesExpectedCuali === idAssignValuesExpectedCuali
  );
  const datosAnteriores = this.armarDatosEsperados(datosAnterioresRaw);

  const objeto = this.organizarDataEditarOCrear();

  return this.assignValuesExpectedCualiQceService.updateAssignValuesExpected(idAssignValuesExpectedCuali, objeto)
    .then(response => {
      this.toastr.success('Registro actualizado', 'Actualización');
      this.generarData(response);
      this.formCrearEditar.reset({ active: true });

      const tiempoEjecucion = Date.now() - inicio;
      const registroActualizado = Array.isArray(response)
        ? response.find((item: any) => item.idAssignValuesExpectedCuali === idAssignValuesExpectedCuali)
        : response;

      const datosLog = this.armarDatosEsperados(registroActualizado ?? objeto);

      this.crearLog({
        Metodo: 'actualización',
        Datos: JSON.stringify(datosLog),
        DatosAnteriores: JSON.stringify(datosAnteriores),
        Respuesta: JSON.stringify(response),
        TipoRespuesta: response?.status ?? 200,
        usuario,
        nombreUsuario,
        tiempoEjecucion,
        endpoint,
        userAgent
      });
    })
    .catch(error => {
      this.toastr.error('No fue posible actualizar el registro', 'Error');
      this.formCrearEditar.reset({ active: true });

      const tiempoEjecucion = Date.now() - inicio;

      this.crearLog({
        Metodo: 'actualización',
        Datos: '',
        DatosAnteriores: JSON.stringify(datosAnteriores),
        Respuesta: error?.message,
        TipoRespuesta: error?.status ?? 500,
        usuario,
        nombreUsuario,
        tiempoEjecucion,
        endpoint,
        userAgent
      });
    });
}


private armarDatosEsperados(origen: any): any {
  if (!origen) return {};

  return {
    LoteYPrograma: {
      id_Lot: origen.id_Lot ?? origen.id_lot ?? null,
      numlot: origen.numlot ?? '',
      idProgram: origen.idProgram ?? null,
      desprogram: origen.desprogram ?? ''
    },
    analito: {
      idAnalytes: origen.idAnalytes ?? null,
      desanalytes: origen.desanalytes ?? ''
    },
    analizador: {
      idAnalyzer: origen.idAnalyzer ?? null,
      nameAnalyzer: origen.nameAnalyzer ?? ''
    },
    reactivo: {
      idReagents: origen.idReagents ?? null,
      desreagents: origen.desreagents ?? ''
    },
    metodo: {
      idMethods: origen.idMethods ?? null,
      desmethods: origen.desmethods ?? ''
    },
    unidad: {
      idUnits: origen.idUnits ?? null,
      codunits: origen.codunits ?? ''
    },
    valorEsperado: {
      idResultsDictionary: origen.idResultsDictionary ?? null,
      desresults: origen.desresults ?? ''
    },
    activo: origen.active ?? null
  };
}


private crearLog(data: {
  Metodo: string;
  Datos: string;
  DatosAnteriores: string;
  Respuesta: string;
  TipoRespuesta: number;
  usuario: string;
  nombreUsuario: string;
  tiempoEjecucion: number;
  endpoint: string;
  userAgent: string;
}) {
  const log = {
    Fecha: this.datePipe.transform(new Date(), 'yyyy-MM-dd'),
    Hora: new Date().toISOString(),
    Metodo: data.Metodo,
    Datos: data.Datos,
    DatosAnteriores: data.DatosAnteriores,
    Respuesta: data.Respuesta,
    TipoRespuesta: data.TipoRespuesta,
    userid: data.usuario,
    usuario: data.nombreUsuario,
    executionTime: data.tiempoEjecucion,
    endpoint: data.endpoint,
    userAgent: data.userAgent,
    modulo: 'Control Calidad Externo',
    SubModulo: 'Administración',
    item: 'Asignación de valores cualitativos'
  };

  if (this.assignValuesExpectedCualiQceService.createLogAsync) {
    this.assignValuesExpectedCualiQceService.createLogAsync(log);
  }
}





 





  async editar(idAssignValuesExpectedCuali: number) {
    const newObj = this.organizarDataEditarOCrear();
    await this.editarData(idAssignValuesExpectedCuali, newObj);
  }



  // async editarToggle(event: any,) {


  //   const [data, estado] = event;

  //   data.active = estado;

  //   return this.assignValuesExpectedCualiQceService.updateAssignValuesExpected(data.idAssignValuesExpectedCuali, data)
  //     .then(r => {
  //       this.toastr.success('Estado actualizado', 'Actualización')
  //       this.log.logObj('Control Calidad Externo', 'Administración', 'Asignación de valores', 'a', this.detailObj(), JSON.stringify(r), 200);
  //       this.generarData(r);

  //     })
  //     .catch(error => {
  //       this.toastr.error('No fue posible actualizar el estado', 'Error')
  //       this.log.logObj('Control Calidad Externo', 'Administración', 'Asignación de valores', 'a', this.detailObj(), error.message, error.status);


  //     });
  // }



  /**
   * Cambia el estado activo/inactivo de una asignación de valores esperados cualitativos.
   */
  async editarToggle(event: any) {
    const [data, estado] = event;

    // Clonar los datos originales antes de modificar
    const datosAnteriores = JSON.parse(JSON.stringify(data));
    data.active = estado;

    const usuario = sessionStorage.getItem('userid') || 'desconocido';
    const nombreUsuario = sessionStorage.getItem('nombres') || 'desconocido';
    const inicio = Date.now();
    const endpoint = `${window.location.origin}/api/qce/AssignValuesExpectedCuali/${data.idAssignValuesExpectedCuali}`;
    const userAgent = navigator.userAgent;

    return this.assignValuesExpectedCualiQceService.updateAssignValuesExpected(data.idAssignValuesExpectedCuali, data)
      .then(r => {
        this.toastr.success('Estado actualizado', 'Actualización');
        this.generarData(r);

        const fin = Date.now();
        const tiempoEjecucion = fin - inicio;

        // Buscar el registro actualizado
        const registroActualizado = Array.isArray(r)
          ? r.find((item: any) => item.idAssignValuesExpectedCuali === data.idAssignValuesExpectedCuali)
          : r;

        const datosLog = registroActualizado
          ? {
              LoteYPrograma: {
                id_Lot: registroActualizado.id_lot ?? registroActualizado.id_Lot ?? null,
                numlot: registroActualizado.numlot ?? '',
                idProgram: registroActualizado.idProgram ?? null,
                desprogram: registroActualizado.desprogram ?? ''
              },
              analito: {
                idAnalytes: registroActualizado.idAnalytes ?? null,
                desanalytes: registroActualizado.desanalytes ?? ''
              },
              analizador: {
                idAnalyzer: registroActualizado.idAnalyzer ?? null,
                nameAnalyzer: registroActualizado.nameAnalyzer ?? ''
              },
              reactivo: {
                idReagents: registroActualizado.idReagents ?? null,
                desreagents: registroActualizado.desreagents ?? ''
              },
              metodo: {
                idMethods: registroActualizado.idMethods ?? null,
                desmethods: registroActualizado.desmethods ?? ''
              },
              unidad: {
                idUnits: registroActualizado.idUnits ?? null,
                codunits: registroActualizado.codunits ?? ''
              },
              valorEsperado: {
                idResultsDictionary: registroActualizado.idResultsDictionary ?? null,
                desresults: registroActualizado.desresults ?? ''
              },
              activo: registroActualizado.active ?? null
            }
          : { ...data };

        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          Hora: new Date().toISOString(),
          Metodo: 'actualización',
          Datos: JSON.stringify(datosLog),
          DatosAnteriores: JSON.stringify(datosAnteriores),
          Respuesta: JSON.stringify(r),
          TipoRespuesta: r?.status ?? 200,
          userid: usuario,
          usuario: nombreUsuario,
          executionTime: tiempoEjecucion,
          endpoint: endpoint,
          userAgent: userAgent,
          modulo: 'Control Calidad Externo',
          SubModulo: 'Administración',
          item: 'Asignación de valores cualitativos'
        };

        if (this.assignValuesExpectedCualiQceService.createLogAsync) {
          this.assignValuesExpectedCualiQceService.createLogAsync(Loguser);
        }
      })
      .catch(error => {
        this.toastr.error('No fue posible actualizar el estado', 'Error');

        const fin = Date.now();
        const tiempoEjecucion = fin - inicio;

        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          Hora: new Date().toISOString(),
          Metodo: 'actualización',
          Datos: '', // No hay datos nuevos en error
          DatosAnteriores: JSON.stringify(datosAnteriores),
          Respuesta: error?.message,
          TipoRespuesta: error?.status ?? 500,
          userid: usuario,
          usuario: nombreUsuario,
          executionTime: tiempoEjecucion,
          endpoint: endpoint,
          userAgent: userAgent,
          modulo: 'Control Calidad Externo',
          SubModulo: 'Administración',
          item: 'Asignación de valores cualitativos'
        };

        if (this.assignValuesExpectedCualiQceService.createLogAsync) {
          this.assignValuesExpectedCualiQceService.createLogAsync(Loguser);
        }
      });
  }


  // /**
  //  * Genera los datos para la tabla a partir de la respuesta del servicio.
  //  */
  // private generarData(r) {

  //   this.verTabla = true;
  //   const filtrarDataTable: any[] = r;
  //   this.dataTableBody = filtrarDataTable.map(x => {
  //     return { item1: x.desanalytes, item2: x.nameAnalyzer, item3: x.desreagents, item4: x.desmethods, item5: x.desresults, item6: x.codunits, item7: x, item8: x, item9: x };
  //   });
  //   this.dataSource = new MatTableDataSource(r);
  //   this.dataSource.paginator = this.paginator;
  //   this.dataSource.sort = this.sort;

  //   // Almacenar los datos originales para edición
  //   this.datosAnterioresEdicion = Array.isArray(r) ? JSON.parse(JSON.stringify(r)) : [];
  // }





  async modalCrear(templateRegistroRondasQce: TemplateRef<any>) {

    // this.ventanaModal = this.modalService.show(templateRegistroRondasQce, { 'class': 'modal-lg modal-dialog-centered', backdrop: 'static', keyboard: false });
    this.formCrearEditar.reset()
    const destroy$: Subject<boolean> = new Subject<boolean>();
    /* Variables recibidas por el modal */
    const data: ModalData = {
      content: templateRegistroRondasQce,
      btn: 'Guardar',
      btn2: 'Cerrar',
      footer: true,
      title: 'Crear',

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

  async modalEditar(templateRegistroRondasQce: TemplateRef<any>, datos: any) {



    this.flagEditar = true;
    const newObj = {
      idAssignValuesExpectedCuali: datos.idAssignValuesExpectedCuali,
      idResultsDictionary: datos.idResultsDictionary,
      idAnalytes: datos.idAnalytes || '',
      idReagents: datos.idReagents || '',
      idAnalyzer: datos.idAnalyzer || '',
      idMethods: datos.idMethods || '',
      idUnits: datos.idUnits,
      active: datos.active
    }
    this.formCrearEditar.setValue(newObj);
    let analito = this.analitos.find(a => a.idanalytes == datos.idAnalytes)
    if (analito) {
      await this.getValorEsperado(analito)
    }
    //this.getValorEsperado(datos.idProgram,newObj.idAnalytes);
    // this.ventanaModal = this.modalService.show(templateRegistroConfEdit, { 'class': 'modal-lg modal-dialog-centered', backdrop: 'static', keyboard: false });


    const destroy$: Subject<boolean> = new Subject<boolean>();
    /* Variables recibidas por el modal */
    const data: ModalData = {
      content: templateRegistroRondasQce,
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
      this.editarData(datos.idAssignValuesExpectedCuali, this.formCrearEditar.value);
      dialogRef.close();
    });

  }


  async modalEliminar(row: any) {
    // Copia de los datos antes de eliminar

    const usuario = sessionStorage.getItem('userid') || 'desconocido';
    const nombreUsuario = sessionStorage.getItem('nombres') || 'desconocido';
    const inicio = Date.now();
    const endpoint = `${window.location.origin}/api/qce/AssignValuesExpectedCuali/${row.idAssignValuesExpectedCuali}`;
    const userAgent = navigator.userAgent;

    // Obtener objetos descriptivos para el log
    const loteObj = this.lotes?.find(x => x.IdLot == row.id_Lot || x.IdLot == row.id_lot) || {};
    const programaObj = this.listaProgramas?.find(x => x.IdProgram == row.idProgram) || {};
    const analitoObj = this.analitos?.find(x => x.idanalytes == row.idAnalytes) || {};
    const analizadorObj = this.analyzers?.find(x => x.idAnalyzer == row.idAnalyzer) || {};
    const reactivoObj = this.reactivos?.find(x => x.idreagents == row.idReagents) || {};
    const metodoObj = this.methodsActive?.find(x => x.idmethods == row.idMethods) || {};
    const unidadObj = this.listaUnits?.find(x => x.idunits == row.idUnits) || {};
    const resultadoObj = this.resultadosEsperados?.find(x => x.idResultsDictionary == row.idResultsDictionary) || {};

    // Estructura de datos eliminados para el log con nombres
    const datosEliminadosLog = {
      LoteYPrograma: {
        id_Lot: row.id_Lot ?? row.id_lot ?? '',
        numlot: loteObj.Numlot ?? row.numlot ?? '',
        idProgram: row.idProgram ?? '',
        desprogram: programaObj.Desprogram ?? row.desprogram ?? ''
      },
      analito: {
        idAnalytes: row.idAnalytes ?? '',
        desanalytes: analitoObj.desanalytes ?? row.desanalytes ?? ''
      },
      analizador: {
        idAnalyzer: row.idAnalyzer ?? '',
        nameAnalyzer: analizadorObj.nameAnalyzer ?? row.nameAnalyzer ?? ''
      },
      reactivo: {
        idReagents: row.idReagents ?? '',
        desreagents: reactivoObj.desreagents ?? row.desreagents ?? ''
      },
      metodo: {
        idMethods: row.idMethods ?? '',
        desmethods: metodoObj.desmethods ?? row.desmethods ?? ''
      },
      unidad: {
        idUnits: row.idUnits ?? '',
        codunits: unidadObj.codunits ?? row.codunits ?? ''
      },
      valorEsperado: {
        idResultsDictionary: row.idResultsDictionary ?? '',
        desresults: resultadoObj.Desresults ?? row.desresults ?? ''
      }
    };

    // Estructura de datos anteriores para el log con nombres (igual a datosEliminadosLog)
    const datosAnterioresLog = { ...datosEliminadosLog };

    this.assignValuesExpectedCualiQceService.deleteAssignValuesExpected(row.idAssignValuesExpectedCuali).subscribe({
      next: (respuesta) => {
        this.toastr.success('registro eliminado correctamente.');
        this.buscar(); // Actualizar MatTableDataSource

        const fin = Date.now();
        const tiempoEjecucion = fin - inicio;

        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          Hora: new Date().toISOString(),
          Metodo: 'eliminación',
          Datos: JSON.stringify(datosEliminadosLog), // Solo lo que se eliminó
          DatosAnteriores: JSON.stringify(datosAnterioresLog),
          Respuesta: JSON.stringify(respuesta),
          TipoRespuesta: respuesta?.status ?? 200,
          userid: usuario,
          usuario: nombreUsuario,
          executionTime: tiempoEjecucion,
          endpoint: endpoint,
          userAgent: userAgent,
          modulo: 'Control Calidad Externo',
          SubModulo: 'Administración',
          item: 'Asignación de valores cualitativos'
        };

        if (this.assignValuesExpectedCualiQceService.createLogAsync) {
          this.assignValuesExpectedCualiQceService.createLogAsync(Loguser);
        }
      },
      error: (error) => {
        this.toastr.error('Ocurrio un error al eliminar');

        const fin = Date.now();
        const tiempoEjecucion = fin - inicio;

        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          Hora: new Date().toISOString(),
          Metodo: 'eliminación',
          Datos: JSON.stringify(datosEliminadosLog), // Solo lo que se intentó eliminar
          DatosAnteriores: JSON.stringify(datosAnterioresLog),
          Respuesta: error?.message,
          TipoRespuesta: error?.status ?? 500,
          userid: usuario,
          usuario: nombreUsuario,
          executionTime: tiempoEjecucion,
          endpoint: endpoint,
          userAgent: userAgent,
          modulo: 'Control Calidad Externo',
          SubModulo: 'Administración',
          item: 'Asignación de valores cualitativos'
        };

        if (this.assignValuesExpectedCualiQceService.createLogAsync) {
          this.assignValuesExpectedCualiQceService.createLogAsync(Loguser);
        }
      }
    });
  }

}