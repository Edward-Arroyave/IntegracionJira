import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SharedService } from '@app/services/shared.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { DatePipe, NgFor, NgIf, TitleCasePipe } from '@angular/common';
import { ProgramaQceService } from '@app/services/calidad-externo/programaQce.service';
import { InfoResultQceService } from '@app/services/calidad-externo/inforesultQce.service';
import { ResponsexSampleService } from '@app/services/calidad-externo/responsexsample.service';
import { InfoDetailsResultQceService } from '@app/services/calidad-externo/infodetailsresultQce.service';
import { DiccionarioResultadosQceService } from '@app/services/calidad-externo/diccionarioResultadosQce.service';
import { VentanasModalesService } from '@app/services/general/ventanas-modales.service';
import { ProgramaPorClienteService } from '../../../../../services/calidad-externo/programaXCliente.service';
import { LaboratoriosService } from '../../../../../services/configuracion/laboratorios.service';
import { AnalytesQceService } from '../../../../../services/calidad-externo/AnalytesQce.service';
import { ResultQceUpdateService } from '../../../../../services/calidad-externo/resultQceUpdate.service';
import { ResultQceService } from '@app/services/calidad-externo/resultQce.service';
import { ConfigResultsService } from '@app/services/calidad-externo/configResults.service';
import { ToastrService } from 'ngx-toastr';
import dayjs from 'dayjs';
import { ImageCdnPipe } from '../../../../core/pipes/image-cdn.pipe';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { LoaderService } from '@app/services/loader/loader.service';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { ModalData } from '@app/Models/Modaldata';
import { ModalGeneralComponent } from '@app/modules/shared/modals/modal-general/modal-general.component';
//import { isSameDay } from 'date-fns';
import { Observable } from 'rxjs';  // Asegúrate de que esté importado
import { AnalyticalProblemsService } from '@app/services/calidad-externo/AnalyticalProblems.service';

@Component({
  selector: 'app-ingreso-datos-externo',
  templateUrl: './ingreso-datos-externo.component.html',
  styleUrls: ['./ingreso-datos-externo.component.css'],
  providers: [DatePipe],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, MatFormFieldModule,
    MatSelectModule, MatOptionModule, NgFor, MatTooltipModule,
    MatTableModule, MatSortModule, NgIf, MatPaginatorModule,
    MatInputModule, TitleCasePipe, DatePipe,
    TranslateModule, ImageCdnPipe, MatIconModule, NgxMatSelectSearchModule]
})

export class IngresoDatosExternoComponent implements OnInit {

  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();
  formulario: FormGroup = this.fb.group({
    idProgram: ['', [Validators.required]]
  })
  formFiltroMuestra: FormGroup = this.fb.group({
    idMuestra: ['', [Validators.required]],
  });

  formFiltroresult: FormGroup = this.fb.group({

    Idresultsdictionary: ['', Validators.required]

  })
  
  formProblemsAnalytics: FormGroup = this.fb.group({

    idAnalyricalProblems: ['', Validators.required]

  });

  accionEditar: any;
  accion: any;
  tituloAccion: any;
  mostrarTabla: boolean;
  ok: string;
  fechaActual = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
  //fechaActual0 = this.datePipe.transform(new Date(), 'dd-MM-yyyy');
  fechaActual0 = new Date();
  titulo: any;
  text: any;
  textError: any;
  cancelar: any;
  confirmar: any;
  messageError: any;
  idcountry: any;
  programS: string = '';
  numRondas: number;
  titulo2: string;
  objetoResultado: any;
  objectUpdate: any;
  isCuanti = null;
  messageSinDatos: string;
  bandera: boolean = false;
  bandera2: boolean = false;
  nit: any;
  idCliente: number;
  idMuestra: number;
  dataTable = [];
  programa2: string;
  idPrograma: number;
  numRonda: number;
  ventanaModal: BsModalRef;
  programas = [];
  programasActive = [];
  programasActiveCopy = [];

  muestrasActive = [];
  muestrasActiveCopy = [];
  dicRes = [];
  dicResActive = [];
  listaResultados = [];
  programasXCliente = [];
  //Variables que manejan los datos encontrados de problemas analiticos dependiendo del analito.
  listAnalyricalProblems = [];
  listAnalyricalProblemsCopy = [];
  sedeId: any;
  editarResultados: boolean = false;
  noeditarResultados: boolean = false;

  filterPrograma = new FormControl('')
  filterMuestra = new FormControl('')

  vistaActual: 'principal' | 'resultado' | 'detalle' = 'principal'

  constructor(
    private translate: TranslateService,
    private programQceService: ProgramaQceService,
    private infoResultQceService: InfoResultQceService,
    private diccionarioResultadosQceService: DiccionarioResultadosQceService,
    private analytesQceService: AnalytesQceService,
    private infoDetailsResultQceService: InfoDetailsResultQceService,
    private responsexSampleService: ResponsexSampleService,
    private resultQceUpdateService: ResultQceUpdateService,
    private toastr: ToastrService,
    private onfigResultsService: ConfigResultsService,
    private resultQceService: ResultQceService,
    private fb: FormBuilder,
    private modalService: BsModalService,
    private datePipe: DatePipe,
    private sharedService: SharedService,
    private programaPorClienteService: ProgramaPorClienteService,
    private laboratoriosService: LaboratoriosService,
    private ventanaService: VentanasModalesService,
    private loaderService: LoaderService,
    private dialog: MatDialog,
    private analyticalProblems: AnalyticalProblemsService,
  ) { }

  displayedColumns: string[] = ['rondas', 'muestras', 'vencido', 'responder', 'ver'];
  displayedColumns2 = ['analito', 'analizador', 'metodo', 'resultado','problems_analytical', 'inicio', 'fin', 'editar','problems'];
  displayedColumns3: string[] = ['muestra', 'analito', 'analizador', 'metodo', 'resultado', 'problems_analytical' ,'inicio', 'fin'];
  dataSource: MatTableDataSource<any>;
  dataSource2: MatTableDataSource<any>;
  dataSource3: MatTableDataSource<any>;

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatPaginator, { static: false }) tableResult: MatPaginator;
  @ViewChild(MatPaginator, { static: false }) tableDetail: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  ngOnInit(): void {
    this.sedeId = JSON.parse(sessionStorage.getItem('sede'));
    this.validarCliente();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();
    // this.filtroMuestra();
    this.getDicResult();
    this.filtrosAutocomplete();

  }


  filtrosAutocomplete() {
    this.filterPrograma.valueChanges.subscribe(word => {

      if (word) {
        this.programasActive = this.programasActiveCopy.filter((item: any) => {
          return item.Desprogram.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.programasActive = this.programasActiveCopy
      }
    });
    this.filterMuestra.valueChanges.subscribe(word => {

      if (word) {
        this.muestrasActive = this.muestrasActiveCopy.filter((item: any) => {
          return item.Desprogram.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.muestrasActive = this.muestrasActiveCopy
      }
    });
  }


  validarCliente() {
    this.laboratoriosService.getAllAsync().then(lab => {


      this.nit = (lab[0].nit);
      this.loader
      this.programaPorClienteService.getProgramasPorCliente(this.nit, this.sedeId).subscribe((data: any) => {

        this.programasActive = data;
        this.programasActiveCopy = data;
        this.idCliente = data[0].Idclient;
      });
    });
  }

  async getDicResult() {

    this.dicRes = await this.diccionarioResultadosQceService.getAllAsync();
    this.dicResActive = this.dicRes.filter(e => e.active);

  }

  filtrar() {


    if (this.formulario.valid) {

      this.idPrograma = parseInt(this.formulario.value.idProgram);

      this.programQceService.getByIdAsync(this.idPrograma).then((data: any) => {

        this.programS = data.desprogram;

      });


      this.infoResultQceService.getData(this.idCliente, this.sedeId, this.idPrograma).subscribe({
        next: (data) => {

        var rondas = [];

        for (let i = 0; i < data.length; i++) {

          if (!rondas.includes(data[i].Nroround)) {

            rondas.push(data[i].Nroround);

          }

        }

        this.dataTable = [];
        for (let i = 0; i < rondas.length; i++) {

          let arreglo = data.filter(ronda => ronda.Nroround == rondas[i]);
          let ronda = arreglo.pop();
          this.dataTable.push(ronda);

        }

        this.dataTable.sort(((a, b) => a.Nroround - b.Nroround));
        this.bandera = true;

        setTimeout(() => {

          this.dataSource = new MatTableDataSource(this.dataTable);
          this.dataSource.paginator = this.paginator;
        }, 100);



      },
      error: (error) => {
        this.accion = 'noDatos';
        this.toastr.error('No se encontraron datos');
        this.bandera = false;
        this.formulario.reset({ idProgram: '' });
      },
      complete: () => {
      }
    });

    }

  }

  buscarPorMuestra() {
    if (this.formFiltroMuestra.valid) {

      this.idMuestra = parseInt(this.formFiltroMuestra.value.idMuestra);

      this.loaderService.show()
      this.responsexSampleService.getData(this.idCliente, this.sedeId, this.idPrograma, this.numRondas, this.idMuestra).subscribe({
        
        next: (data: any) => {
        this.loaderService.hide()

        this.dataSource2 = new MatTableDataSource(data);


        for (var i = 0; i < data.length; i++) {

          const fechainicial: Date = new Date();
          const otraFecha: Date = new Date(data[i].Enddate); // Reemplaza esto con la fecha que deseas comparar


          if (otraFecha > fechainicial) {
            this.editarResultados = true;
          } else if (otraFecha < fechainicial) {
            this.editarResultados = false;
          }

        }

        this.bandera2 = true;
        setTimeout(() => {
          this.dataSource2.paginator = this.tableResult;

        }, 100);

      },
      error: (error) => {
        this.loaderService.hide()
        this.accion = 'noDatos';
        this.toastr.error('No se encontraron datos');
        this.formFiltroMuestra.reset({ idMuestra: '' });
        this.bandera2 = false;

      },
      complete: () => {
      }
    });
    }


  }



  loader() {

    this.bandera2 = false;
    this.loaderService.show();

    setTimeout(() => {

      this.bandera2 = true;
      this.loaderService.hide();

    }, 3000)

  }

  crearObjetoUpdate(resultado: any) {

    if (resultado != '' && resultado != undefined && resultado != null) {

      this.objectUpdate = {
        idresult: this.objetoResultado.Idresult,
        idround: this.objetoResultado.Idround,
        IdProgramconf: this.objetoResultado.IdProgramconf,
        userclient: this.objetoResultado.Userclient,
        date: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
        hour: dayjs().format('HH:mm:ss'),
        result: resultado,
        comments: this.objetoResultado.Comments,
        active: this.objetoResultado.Active,
        idheadquarters: this.sedeId,
        idProgramConfClientHead: this.objetoResultado.IdProgramConfClientHead,
        idAnalyricalProblems: this.objetoResultado.IdAnalyricalProblems
      }
    }
  }
  
  
  async ventanaConfirmacion(message: string[], type: Boolean, dataItem: any, template: TemplateRef<any>){
    const destroy$: Subject<boolean> = new Subject<boolean>();
    const data: ModalData = {
      message: message[0],
      btn: 'Confirmar',
      btn2: 'Cancelar',
      footer: true,
      title: 'Alerta',
      image: 'assets/rutas/iconos/pregunta.png'
    };
    const dialogRef = this.dialog.open(ModalGeneralComponent, { height: 'auto', width: '40em', data, disableClose: true });
    dialogRef.componentInstance.primaryEvent?.pipe(takeUntil(destroy$)).subscribe({
      next: async (response) => {
        if(type){
          await this.editProblemsAnalytics(dataItem,template);
        } else {
          await this.editResult(dataItem,template);
        }
        dialogRef.close();
      }, error: (error) => {
        this.toastr.info(message[2]);
      }
    });
  }

  
  async crearObjProblemsAnalytics(problems: any) {

    if (problems !== '' && problems !== undefined && problems !== null) {

      this.objectUpdate = {
        idresult: this.objetoResultado.Idresult,
        idround: this.objetoResultado.Idround,
        IdProgramconf: this.objetoResultado.IdProgramconf,
        userclient: this.objetoResultado.Userclient,
        date: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
        hour: dayjs().format('HH:mm:ss'),
        result: this.objetoResultado.Result,
        comments: this.objetoResultado.Comments,
        active: this.objetoResultado.Active,
        idheadquarters: this.sedeId,
        idProgramConfClientHead: this.objetoResultado.IdProgramConfClientHead,
        idAnalyricalProblems: problems
      }
    }
  }

  async actualizarResultado() {
    if (this.objectUpdate !== undefined) {
      if (this.objectUpdate.result !== null && this.objectUpdate.result !== undefined && this.objectUpdate.result !== '') {
        if (this.isCuanti) {
          try {
            this.loaderService.show();
            let data = await this.resultQceUpdateService.update(this.objectUpdate, this.objectUpdate.idresult).toPromise();
            let data2 = await this.responsexSampleService.getData(this.idCliente, this.sedeId, this.idPrograma, this.numRondas, this.idMuestra).toPromise();
            this.dataSource2 = new MatTableDataSource(data2);
            this.dataSource2.paginator = this.paginator;
            this.loaderService.hide();
          } catch (error) {
            this.loaderService.hide();
            this.toastr.error('Ocurrio un error al actualizar el registro');
          }


        } else {

          try {
            this.loaderService.show();

            let data = await this.resultQceService.update(this.objectUpdate, this.objectUpdate.idresult).toPromise();
            let data2 = await this.responsexSampleService.getData(this.idCliente, this.sedeId, this.idPrograma, this.numRondas, this.idMuestra).toPromise();

            this.dataSource2 = new MatTableDataSource(data2);
            this.loaderService.hide();
          } catch (error) {
            this.loaderService.hide();
            this.toastr.error('Ocurrio un error al actualizar el registro');
          }
        }

        this.toastr.success('Registro actualizado');
        this.isCuanti = null;
        this.objetoResultado = null;
        this.objectUpdate = undefined;
      }
    }
  }


   async updateAnalyricalProblems() {
    if (this.objectUpdate !== undefined) {
      if (this.objectUpdate.idAnalyricalProblems !== null && this.objectUpdate.idAnalyricalProblems !== undefined){
        try {
            this.loaderService.show();
            //Si hay un problema analítico se deja el resultado en vacio, ya que debe a ver uno o otro
            this.objectUpdate.Result = '';
            let data = await this.resultQceUpdateService.update(this.objectUpdate, this.objectUpdate.idresult).toPromise();
            let data2 = await this.responsexSampleService.getData(this.idCliente, this.sedeId, this.idPrograma, this.numRondas, this.idMuestra).toPromise();
            this.dataSource2 = new MatTableDataSource(data2);
            this.dataSource2.paginator = this.paginator;
            this.loaderService.hide();
          } catch (error) {
            this.loaderService.hide();
            this.toastr.error('Ocurrio un error al actualizar el registro');
          }
          
          this.toastr.success('Problema analítico agregado correctamente.');
          this.isCuanti = null;
          this.objetoResultado = null;
          this.objectUpdate = undefined;
        }
      }
    }


  openModal(descripcion) {
    const data = { descripcion: descripcion, accion: this.accion }
    this.ventanaService.openModal(data);
  }




  get idProgramInvalido() {

    return this.formulario.get('idProgram');

  }


  cancelUpdate() {

    this.isCuanti = null

  }

  async editResult(dataItem: any,  templateResult: TemplateRef<any>) {
    try {

      this.objetoResultado = dataItem;
      this.objetoResultado.IdAnalyricalProblems = null;
      this.loaderService.show()
      let analito: any = await this.analytesQceService.getByIdAsync(dataItem.Idanalytes)
      this.loaderService.hide()
      if (analito.typeresult == 'N') {
        this.isCuanti = true
      } else {
        this.formFiltroresult = this.fb.group({
          Idresultsdictionary: [dataItem.Result ? dataItem.Result : ''],
        });
        
        this.listaResultados = [];
        let resp: any = await this.onfigResultsService.getDictionaryResult(this.idPrograma, analito.idanalytes, dataItem.idAnalyzer).toPromise();

        if (resp?.error) {
          this.toastr.error(resp?.error.text);
          return
        }
        this.listaResultados = resp.filter(x=>x.Active === true);
        this.isCuanti = false

      }

      const destroy$: Subject<boolean> = new Subject<boolean>();
      /* Variables recibidas por el modal */
      const data: ModalData = {
        content: templateResult,
        btn: 'Guardar',
        btn2: 'Cerrar',
        footer: true,
        title: 'Editar',
        image: ''
      };
      const dialogRef = this.dialog.open(ModalGeneralComponent, { height: 'auto', width: '40em', data, disableClose: true });

      dialogRef.componentInstance.primaryEvent?.pipe(takeUntil(destroy$)).subscribe(x => {
        if (this.objectUpdate != undefined) {
          this.actualizarResultado()
          dialogRef.close();
        } else {
          this.formFiltroresult.markAllAsTouched()
        }

      });
      dialogRef.componentInstance.secondaryEvent?.pipe(takeUntil(destroy$)).subscribe(x => {

        this.cancelUpdate()
        dialogRef.close();
      });
    } catch (error) {
      this.listaResultados.length = 0;
      this.toastr.error(error.error.text);

    }

  }

  async validaProblemsAnalytics(dataItem: any, templateProblemsAnalytics: TemplateRef<any>){
    
    if(dataItem.Result !== ''){
      let message = ['Se encontro un resultado registrado, confirme si desea eliminarlo y agregar el problema analítico','El problema analítico fue agregado correctamente.','Se canceló la agregación del problema analítico'];
      await this.ventanaConfirmacion(message, true, dataItem, templateProblemsAnalytics);
    } else {
      await this.editProblemsAnalytics(dataItem, templateProblemsAnalytics);
    }
  }


  async validaResults(dataItem: any, templateResult: TemplateRef<any>){
    
    if(dataItem.IdAnalyricalProblems !== undefined && dataItem.IdAnalyricalProblems !== null){
      let message = ['Se encontro un problema analítico registrado, confirme si desea eliminarlo y agregar el resultado','El resultado fue agregado correctamente.','Se canceló el registro del resultado'];
      await this.ventanaConfirmacion(message, false, dataItem, templateResult);
    } else {
      await this.editResult(dataItem, templateResult);
    }
  }

  
  async editProblemsAnalytics(dataItem: any, templateProblemsAnalytics: TemplateRef<any>) {
    try {

      this.formProblemsAnalytics = this.fb.group({
        idAnalyricalProblems: [dataItem.IdAnalyricalProblems ? dataItem.IdAnalyricalProblems : '']
      });

      this.listAnalyricalProblems = [];
      this.listAnalyricalProblemsCopy = [];
      this.objetoResultado = dataItem;
    
      this.analyticalProblems.getAnalyticalProblems(dataItem.Idanalytes).subscribe({
        next: (returnAnalyticalProblems: any) => {
          this.listAnalyricalProblems = returnAnalyticalProblems.filter(x => x.active);
          this.listAnalyricalProblemsCopy = this.listAnalyricalProblems;
        },
        error: (err) => {
          this.toastr.error(err.error.message);
          return;
        },
      });
      
      const destroy$: Subject<boolean> = new Subject<boolean>();
      /* Variables recibidas por el modal */
      
      const data: ModalData = {
        content: templateProblemsAnalytics,
        btn: 'Guardar',
        btn2: 'Cerrar',
        footer: true,
        title: 'Problemas analíticos',
        image: 'assets/rutas/iconoParametros.png'
      };
      
      const dialogRef = this.dialog.open(ModalGeneralComponent, { height: 'auto', width: '40em', data, disableClose: true });
      
      dialogRef.componentInstance.primaryEvent?.pipe(takeUntil(destroy$)).subscribe(x => {
        if (this.objectUpdate !== undefined) {
          this.updateAnalyricalProblems()
          dialogRef.close();
        } else {
          this.formFiltroresult.markAllAsTouched()
        }
      });
      
      dialogRef.componentInstance.secondaryEvent?.pipe(takeUntil(destroy$)).subscribe(x => {
        this.cancelUpdate()
        dialogRef.close();
      });
    } catch (error) {
      this.listAnalyricalProblems.length = 0;
      this.listAnalyricalProblemsCopy.length = 0;
      this.toastr.error(error.error.text);
    }
  }

  openModalResponder(datos: any) {

    if (datos.Enddate > this.fechaActual) {

      try {
        this.loaderService.show();
        this.isCuanti = null;
        this.infoResultQceService.getSamplesByClienteAndRound(this.idCliente, this.sedeId, datos.IdProgram, datos.Nroround).subscribe({

          next: (muestras) => {

            if (muestras) {
              this.vistaActual = 'resultado'
              this.muestrasActive = muestras;
              this.muestrasActiveCopy = muestras;
    
              this.formFiltroMuestra.reset({ idMuestra: '' });
              this.bandera2 = false;
              this.numRondas = datos.Nroround;
              this.loaderService.hide()
              setTimeout(() => {
                this.calcularAltoTabla();
              }, 100);
            }
          }
        });

      } catch (error) {
        this.loaderService.hide();
      }
    }else {
      this.toastr.info('El dato seleccionado esta vencido');
    }
  }
  

   openModalVisualizar(datos: any) {
    try {

      this.programa2 = datos.Desprogram;
      this.numRonda = datos.Nroround;
      var idprograma = datos.IdProgram;
      this.loaderService.show();
      this.infoDetailsResultQceService.getData(this.idCliente, this.sedeId, idprograma, this.numRonda).subscribe({
        next:(data) => {
          data.sort((a, b) => a.Nrosample - b.Nrosample);
          this.dataSource3 = new MatTableDataSource(data);
          this.dataSource3.paginator = this.paginator;
          this.vistaActual = 'detalle';
          setTimeout(() => {
            this.loaderService.hide();
            this.calcularAltoTabla();
            this.dataSource3.paginator = this.tableDetail
          }, 500);
        },
        error: (error) => {
          this.loaderService.hide();
          this.accion = 'null';
          this.toastr.error('No se encontraron datos');
        },
        complete: () => {
        }
      });
    } catch (error) {
      this.loaderService.hide();
    }
  }

  titulosSwal() {
    this.translate.get('MODULES.SWAL.TITULO').subscribe(respuesta => this.titulo = respuesta);
    this.translate.get('MODULES.SWAL.TEXT').subscribe(respuesta => this.text = respuesta);
    this.translate.get('MODULES.SWAL.CANCEL').subscribe(respuesta => this.cancelar = respuesta);
    this.translate.get('MODULES.SWAL.CONFIRM').subscribe(respuesta => this.confirmar = respuesta);
    this.translate.get('MODULES.SWAL.TEXTERROR').subscribe(respuesta => this.textError = respuesta);
    this.translate.get('MODULES.SWAL.MESAGEERROR').subscribe(respuesta => this.messageError = respuesta);
    this.translate.get('MODULES.SWAL.TITULO_ERROR').subscribe(respuesta => this.titulo2 = `<b>${respuesta}</b>`);
    this.translate.get('MODULES.SWAL.SINDATOS').subscribe(respuesta => this.messageSinDatos = respuesta);
    this.translate.get('MODULES.SWAL.OK').subscribe(respuesta => this.ok = `<b>${respuesta}</b>`);

  }


  calcularAltoTabla() {


    if (this.vistaActual === 'resultado') { // Asegúrate de usar === para comparación
      const hoja = $('.hoja').height();
      const form = $('.formulario').height()
      let he = hoja - form - 150;
      $('#table_responder').css('height', `${he}px`);

    } else if (this.vistaActual === 'detalle') {
      const hoja = $('.hoja').height();
      const nombre = $('.program-name').height()
      let he = hoja - nombre - 170;
      $('#table_detalle').css('height', `${he}px`);
    }
  }


  cerrarResponder() {
    this.bandera2 = false;
    this.formFiltroMuestra.reset()
    this.vistaActual = 'principal'
  }

}


