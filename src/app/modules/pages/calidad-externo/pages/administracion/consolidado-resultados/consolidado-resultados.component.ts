import { DatePipe, NgFor, Location, NgIf, TitleCasePipe } from '@angular/common';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { AppConstants } from '@app/Constants/constants';
import { SharedService } from '@app/services/shared.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';
import { VentanasModalesService } from '@app/services/general/ventanas-modales.service';
import { DiccionarioResultadosqceService } from '@app/services/configuracion/diccionario-resultadosqce.service';
import { ConsolidadoResultadosService } from '@app/services/calidad-externo/ConsolidadoResultadosqce.service';
import { ProgramaQceService } from '@app/services/calidad-externo/programaQce.service';
import moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { ImageCdnPipe } from '../../../../../core/pipes/image-cdn.pipe';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { LoaderService } from '@app/services/loader/loader.service';
import { MatDialog } from '@angular/material/dialog';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { TablaComunComponent } from '@app/modules/shared/general-tablas/tabla-comun/tabla-comun.component';
import { MatIconModule } from '@angular/material/icon';
import { PublicService } from '@app/services/public.service';
import { ProgramasQceService } from '@app/services/configuracion/programas-qce.service';
import { LaboratoriosService } from '@app/services/configuracion/laboratorios.service';
import { ClientesService } from '@app/services/configuracion/clientes.service';
import { lastValueFrom } from 'rxjs';


@Component({
  selector: 'app-consolidado-resultados',
  templateUrl: './consolidado-resultados.component.html',
  styleUrls: ['./consolidado-resultados.component.css'],
  providers: [DatePipe],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    NgFor,
    MatTooltipModule,
    NgIf,
    MatInputModule,
    MatDatepickerModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    TitleCasePipe,
    DatePipe,
    TranslateModule,
    ImageCdnPipe,
    NgxMatSelectSearchModule,
    TablaComunComponent,
    MatIconModule
  ],
})
export class ConsolidadoResultadosComponent implements OnInit {

  displayedColumns: string[] = ['Cliente', 'Sede', 'Programa', 'Ronda', 'N° Muestra', 'Muestra', 'Analito', 'Resultado', 'Fecha Reporte'];
  dataTableBody: any[] = [];
  dataSource: MatTableDataSource<any>;
  ventanaModal: BsModalRef;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  formaBuscarDatos: FormGroup;
  formFiltroTest: FormGroup;
  formaRegistroCA: FormGroup;
  bandera: boolean;
  accion: any;
  accionEditar: any;
  tituloAccion: any;
  idacceptancerequirements: any;
  messageError: any;
  messageSinDatos: string;
  titulo: string = '';
  text: string = '';
  text2: string = '';
  text3: string = '';
  aceptar: string = '';
  dateNow: Date = new Date();
  load: boolean;
  show: boolean = false;
  test: number;
  lab: number;
  sec: number;
  mat: number;
  lote: number;
  fechaini = moment().format('YYYY-MM-DD');participante: any;
  clienteSeleccionado: any;
  sedesCopy: any;
  cliente: any;
  codigoparticipante: any;
  fechafin = moment().format('YYYY-MM-DD');;
  program: number;
  client: number;
  campaignOne: FormGroup;
  campaignTwo: FormGroup;

  dateNowISO = this.dateNow.toTimeString();
  sedes = [];
  sedesActive = [];
  secciones = [];
  seccionesActive = [];
  controlMaterial = [];
  controlMaterialActive = [];
  lotes = [];
  lotesActive = [];
  tests = [];
  resultsDictionary = [];
  resultsDictionaryActive = [];
  programas = [];
  programasCopy = [];
  clientes = [];
  clientesCopy = [];
  clientesdff = [];
  resultados = [];

  //Predictivos
  filterClients = new FormControl('')
  filterSede = new FormControl('')
  filterPrograma = new FormControl('')

  ulr = this.location.path();

  constructor(

    private fb: FormBuilder,
    private consolidadoresultadosService: ConsolidadoResultadosService,
    private DiccionarioResultadosqceService: DiccionarioResultadosqceService,
    private sharedService: SharedService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private ventanaService: VentanasModalesService,
    private datePipe: DatePipe,
    private loaderService: LoaderService,
    private dialog: MatDialog,
    private publicService: PublicService,
    private programQceService: ProgramasQceService,
    private laboratoriosService: LaboratoriosService,
    private location: Location,
    private clientesService: ClientesService
  ) { }



  ngOnInit(): void {
    this.cargarGestionLab();
    this.crearFormularioBuscarDatos();
    // this.cargarProgramas();
    // this.cargarClientes();
    this.cargarDicResul();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();
    this.filters()
  }

  cargarGestionLab() {
    this.laboratoriosService.getAllAsync().then(respuesta => {
      this.cliente = respuesta[0].header;
      this.participante = respuesta[0].name;
      this.codigoparticipante = respuesta[0].codecliente;
      if (this.ulr.includes('reporte-cuantitativo-cliente')) {
        this.formaBuscarDatos.get('cliente').setValidators(null);
        this.formaBuscarDatos.updateValueAndValidity();
        this.cargarSelects(this.cliente);
      } else {
        this.cargarSelects();
      }
    });
  }

  async cargarSelects(header?: string) {
    this.clientes = await this.clientesService.getAllAsync();
    this.clientes = this.clientes.filter(z => z.header);
    this.clientesCopy = this.clientes.filter(z => z.header);
    if (header) {
      const idcliente = this.clientes.filter(x => String(x.header).toLocaleLowerCase() === String(header).toLocaleLowerCase())[0].idclient
      this.formaBuscarDatos.get('cliente').setValue(idcliente)
      this.cargarSedes(this.clientes.filter(x => String(x.header).toLocaleLowerCase() === String(header).toLocaleLowerCase())[0].header);
      this.formaBuscarDatos.get('cliente').setValue(this.clientes.filter(x => x.header === header)[0].idclient)
    }
  }
  
  async cargarSedes(id) {
    this.sedes = [];
    this.sedesCopy = [];
    this.formaBuscarDatos.controls['sede'].setValue('');
    this.formaBuscarDatos.controls['programa'].setValue('');
    let cliente = this.clientes.find(x => x.header === id);
    if (cliente) {
      this.participante = cliente.name;
      this.clienteSeleccionado = cliente
    }
    sessionStorage.setItem('consultaSedeExterna', '1');
    await this.publicService.obtenerSedesAsigProg(id).then(r => {
      this.sedes = r.filter(e => e.active);
      this.sedesCopy = r.filter(e => e.active);
      sessionStorage.setItem('consultaSedeExterna', '0');
    }, e => this.sedes = []);
  }
  
  consultarProgramas() {
    this.programas = [];
    this.programasCopy = [];
    this.formaBuscarDatos.controls['programa'].setValue('');
    let idsede = this.formaBuscarDatos.get('sede')?.value;
    let nit = this.clienteSeleccionado.nit;
    // let nit = this.formCuantitativoReporte2.value.Nit;
    // if ( idsede ){
    //   // nit = this.clientes.filter(x => x.idclient === this.formaBuscarDatos.get('cliente')?.value)[0].nit;
    // }else{
    //   // idsede = this.formCuantitativoReporte2.get('Idheadquarters')?.value;
    // }

    this.programQceService.getProgramasPorCliente(nit, idsede).then(respuesta => {
      this.programas = [...respuesta];
      this.programasCopy = [...respuesta];
    }).catch(e => {
      this.toastr.error(e.error);
    });
  }

  filters() {
    this.filterClients.valueChanges.subscribe(word => {

      if (word) {
        this.clientes = this.clientesCopy.filter((cliente: any) => {
          return cliente.Name.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.clientes = this.clientesCopy
      }
    });

    this.filterPrograma.valueChanges.subscribe(word => {

      if (word) {
        this.programas = this.programasCopy.filter((sede: any) => {
          return sede.desprogram.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.programas = this.programasCopy
      }
    });
  }

  openModal(descripcion) {
    const data = { descripcion: descripcion, accion: this.accion }
    this.ventanaService.openModal(data);
  }

  get fechadesdeNoValido() {
    return this.formaBuscarDatos.get('fechadesde');
  }

  get fechahastaNoValido() {
    return this.formaBuscarDatos.get('fechahasta');
  }

  get programaNoValido() {
    return this.formaBuscarDatos.get('programa');
  }

  get clienteNoValido() {
    return this.formaBuscarDatos.get('cliente');
  }

  crearFormularioBuscarDatos() {
    this.formaBuscarDatos = this.fb.group({
      fechadesde: ['', [Validators.required]],
      fechahasta: ['', [Validators.required]],
      programa: ['', [Validators.required]],
      cliente: ['', [Validators.required]],
      sede: ['', [Validators.required]],
    });
  }

  // async cargarProgramas() {
  //   try {
  //     this.loaderService.show()
  //     let respuesta = await this.programservice.getAllAsync();
  //     if (respuesta) {
  //       this.programas = respuesta
  //       this.programasCopy = respuesta
  //     }

  //     this.loaderService.hide()
  //   } catch (error) {
  //     this.loaderService.hide()
  //   }
  // }

  // async cargarClientes() {
  //   try {
  //     this.loaderService.show()
  //     let respuesta = await this.consolidadoresultadosService.getfilterClientresult();
  //     if (respuesta) {
  //       this.clientes = respuesta
  //       this.clientesCopy = respuesta
  //     }
  //     this.loaderService.hide()
  //   } catch (error) {
  //     this.loaderService.hide()
  //   }

  // }

  async cargarDicResul() {
    this.resultsDictionary = await this.DiccionarioResultadosqceService.getAllAsync();
    this.resultsDictionaryActive = this.resultsDictionary.filter(e => e.active == true);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }


  async loadData() {
    if (!this.formaBuscarDatos.invalid) {
      try {
        this.show = false;
        this.loaderService.show();
        var fechainicial = this.datePipe.transform(this.formaBuscarDatos.value.fechadesde, 'yyyy-MM-dd')
        var fechafin = this.datePipe.transform(this.formaBuscarDatos.value.fechahasta, 'yyyy-MM-dd')
        let respuesta : any =  await lastValueFrom( this.consolidadoresultadosService.getfilterConsolidadoResult(this.formaBuscarDatos.value.cliente, fechainicial, fechafin, this.formaBuscarDatos.value.programa, this.formaBuscarDatos.value.sede));
        if (respuesta) {
          
          const filtrarDataTable: any[] = respuesta;
          this.dataTableBody = filtrarDataTable.map(x => {
            let client = this.clientes.find((x) => x.idclient === this.formaBuscarDatos.value.cliente);
            let sede = this.sedes.find((x) => x.idheadquarters === this.formaBuscarDatos.value.sede);
            return { Cliente:client.name, Sede:sede.desheadquarters, Programa: x.desprogram, Ronda: x.nroround, 'N° Muestra': x.nrosample, Muestra: x.serialsample, Analito: x.desanalytes, Resultado: x.result, 'Fecha Reporte': this.formatDate(x.date) };
          });
          this.dataSource = new MatTableDataSource(respuesta);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.show = true;
          this.loaderService.hide();
        }
      } catch (error) {
        this.accion = 'noDatos';
        this.dataSource = new MatTableDataSource([]);
        this.toastr.error('No se encontraron datos');
       // this.formaBuscarDatos.reset({ cliente: '', fechadesde: '', fechahasta: '', programa: '' });
        this.show = false;
        this.loaderService.hide();
      }
    }
  }

  titulosSwal() {
    this.translate.get('MODULES.SWAL.MESAGEERROR').subscribe(respuesta => this.messageError = respuesta);
    this.translate.get('MODULES.SWAL.SINDATOS').subscribe(respuesta => this.messageSinDatos = respuesta);
    this.translate.get('MODULES.SWAL.TITULO_ERROR').subscribe(respuesta => this.titulo = `<b>${respuesta}</b>`);
    this.translate.get('MODULES.SWAL.ACEPTAR').subscribe(respuesta => this.aceptar = respuesta);
  }

  closeVentana(): void {
    this.ventanaModal.hide();
  }

  formatDate(date) {
    date = new Date(date)
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Meses de 0-11
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

}
