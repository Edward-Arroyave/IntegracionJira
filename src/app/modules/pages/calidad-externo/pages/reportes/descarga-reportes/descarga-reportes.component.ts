import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ProgramasQceService } from '@app/services/configuracion/programas-qce.service';
import { ToastrService } from 'ngx-toastr';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRadioModule } from '@angular/material/radio';
import { LoaderService } from '@app/services/loader/loader.service';
import { ClientesService } from '@app/services/configuracion/clientes.service';
import { LaboratoriosService } from '@app/services/configuracion/laboratorios.service';
import { Location, NgClass, NgIf, NgFor, NgSwitch, NgSwitchCase, NgTemplateOutlet, NgSwitchDefault, LowerCasePipe, JsonPipe, NgStyle, TitleCasePipe, DatePipe } from '@angular/common';
import { PublicService } from '@app/services/public.service';
import { ProgramaPorClienteService } from '@app/services/calidad-externo/programaXCliente.service';
import { filter, from, map, merge, mergeMap } from 'rxjs';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatOptionModule } from '@angular/material/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { TranslateModule } from '@ngx-translate/core';
import { MatInputModule } from '@angular/material/input';
import { ImageCdnPipe } from '@app/modules/core/pipes/image-cdn.pipe';
import { MatIconModule } from '@angular/material/icon';
import { ReportesExternoService } from '@app/services/calidad-externo/reportesExterno.service';
import { InfoResultQceService } from '@app/services/calidad-externo/inforesultQce.service';
import { TablaComunComponent } from '@app/modules/shared/general-tablas/tabla-comun/tabla-comun.component';
import { Button } from 'protractor';

@Component({
  selector: 'app-descarga-reportes',
  standalone: true,
  providers: [DatePipe],
  imports: [
    FormsModule, ReactiveFormsModule, MatFormFieldModule,
        MatSelectModule, MatOptionModule, NgFor, MatTooltipModule,
        MatTableModule, MatSortModule, NgIf, MatPaginatorModule,
        MatInputModule, TitleCasePipe, DatePipe,
        TranslateModule, ImageCdnPipe, MatIconModule, NgxMatSelectSearchModule, MatRadioModule, TablaComunComponent,
  ],
  templateUrl: './descarga-reportes.component.html',
  styleUrl: './descarga-reportes.component.css'
})
export class DescargaReportesComponent implements OnInit{

  displayedColumns: string[] = ['Programa', 'Ronda', 'N° Muestra', 'Fecha Emisión','Versión','Observaciones','Descargar'];
  dataSource: MatTableDataSource<any>;
  dataTableBody: any[] = [];
  formDescargaReporte: FormGroup;

  filterPrograma = new FormControl('');
  filterRondas = new FormControl('');
  filterMuestras = new FormControl('');

  nit: any;
  idCliente: number;
  sedeId: any;
  dataAssignProgram: any;
  idProgram: number;
  nroRound: number;
  idSample: number;
  programas: any[] = [];
  programasCopy: any[] = [];

  rondas: any[] = [];
  rondasCopy: any[] = [];

  muestras: any[] = [];
  muestrasCopy: any[] = [];

  ulr = this.location.path();
  desactivado: boolean = true;
  pdf: [];

  constructor(private fb: FormBuilder,
    private programQceService: ProgramasQceService,
    private toastr: ToastrService,
    private loaderService: LoaderService,
    private clientesService: ClientesService,
    private laboratoriosService: LaboratoriosService,
    private location: Location,
    private publicService: PublicService,
    private programaPorClienteService: ProgramaPorClienteService,
    private reportesExternoService: ReportesExternoService,
    private infoResultQceService: InfoResultQceService,

  ) {  }

 ngOnInit(): void{
   this.validarCliente();
   this.filtrosAutocomplete();
   this.crearFormDescargaReporte();
  }

 validarCliente() {
    this.sedeId = JSON.parse(sessionStorage.getItem('sede'));
    
    this.laboratoriosService.getAllAsync().then(async lab => {
      
      this.nit = lab[0].nit;

      this.dataAssignProgram = await this.programaPorClienteService.getProgramasPorCliente(this.nit, this.sedeId).toPromise();

      if(this.dataAssignProgram.length > 0){
        this.programas = this.dataAssignProgram;
        this.programasCopy = this.dataAssignProgram;
        this.idCliente = this.dataAssignProgram[0].Idclient;
      }
    });
  }

  filtrosAutocomplete() {

  this.filterPrograma.valueChanges.subscribe(word => {
    if (word) {
      this.programas = this.programasCopy.filter((item: any) => {
        return item.Desprogram.toLowerCase().includes(word.toLowerCase());
      });
    } else {
      this.programas = this.programasCopy;
    }
  });

    this.filterRondas.valueChanges.subscribe(word => {
      if (word) {
        this.rondas = this.rondasCopy.filter((item: any) => {
          return item.Nroround.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.rondas = this.rondasCopy;
      }
    });

    this.filterMuestras.valueChanges.subscribe(word => {
      if (word) {
        this.muestras = this.muestrasCopy.filter((item: any) => {
          return item.Serialsample.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.muestras = this.muestrasCopy;
      }
    });
  }

  crearFormDescargaReporte() {

    this.formDescargaReporte = this.fb.group({
      tipoReporte: ['', [Validators.required]],
      programa: ['', [Validators.required]],
      ronda: ['', [Validators.required]],
      muestra: ['', [Validators.required]]
    });

    this.filtrar();
  }

  selectOne(control: string) {

    if(control === 'ronda'){
      this.formDescargaReporte.get('muestra').setValue('');
      this.muestras = [];
      this.muestrasCopy = [];
    }

    if (this.formDescargaReporte && this.formDescargaReporte.value.length > 0) {
      if (this.formDescargaReporte.get(control).value[0] == '-1' || this.formDescargaReporte.get(control).value[0] == '') {
        this.formDescargaReporte.get(control).value.shift();
        this.formDescargaReporte.get(control).setValue(this.formDescargaReporte.get(control).value);
      }
    }
  }

  selectNone(control: string) {
    this.formDescargaReporte.get(control).setValue('');
  }

  filtrar() {
    this.formDescargaReporte.get('programa').valueChanges.subscribe(programa => {
      this.formDescargaReporte.get('muestra').setValue('');
      this.formDescargaReporte.get('ronda').setValue('');

      if (programa !== '' && this.formDescargaReporte.get('programa').value !== "") {
        this.idProgram = programa;
        this.reportesExternoService.getRondas(programa).subscribe((datos: any) => {
          this.rondas = datos;
          this.rondasCopy = datos;
        }, _ => {
          this.toastr.info("No hay rondas");
        });
      }
    });
  }

  filtrarSample() {
    if(this.formDescargaReporte.get('ronda').value !== ""){
      this.nroRound = this.formDescargaReporte.get('ronda').value;
      this.infoResultQceService.getSamplesByClienteAndRound(this.idCliente, this.sedeId, this.idProgram, this.nroRound).subscribe((dtMuestras: any) => {
        this.muestras = dtMuestras;
        this.muestrasCopy = dtMuestras;
      });
    }
  }

  async buscarReportes() {
    this.dataTableBody = [];
    this.dataSource = new MatTableDataSource();

    if(!this.formDescargaReporte.invalid){
      this.idSample = this.formDescargaReporte.get('muestra').value;
      
      this.loaderService.show();
      let program = this.programas.find(x=>x.IdProgram == this.idProgram);
      let dtMuestra = this.muestras.find(x=>x.IdSample == this.idSample);

        await this.infoResultQceService.GetDownloadReportes(this.idCliente, this.sedeId, this.idProgram, this.nroRound, this.idSample, this.formDescargaReporte.value.tipoReporte).then((response: any) => {

          if(response){
            this.dataTableBody = response.map(dt => {
              return {
                Programa: program.Desprogram,
                Ronda: this.nroRound,
                'N° Muestra': dtMuestra.Serialsample,
                'Fecha Emisión': dt.FechaEmision,
                'Versión': dt.version,
                'Observaciones': dt.observaciones,
                Descargar: dt.pdf
              };
            });
            
            this.dataSource = new MatTableDataSource(this.dataTableBody);
            this.loaderService.hide();
          }
          
        }).catch(error => {
          this.toastr.error(error.error.message);  
          this.loaderService.hide();
        });
    }
  }

  async descargarReporte(dt:any) {
    
    const byteArray = this.base64ToUint8Array(dt.Descargar);

    const blob = new Blob([byteArray], { type: 'application/pdf' });

    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    if(this.formDescargaReporte.value.tipoReporte === "1"){
          a.download = "reporteCuantitativo_version" + dt.Versión;

    } else if (this.formDescargaReporte.value.tipoReporte === "2") {
          a.download = "reporteDesempeñoCualitativo_version" + dt.Versión;
      
    } if (this.formDescargaReporte.value.tipoReporte === "3") {
          a.download = "reporteSemiCuantitativo_version" + dt.Versión;
    } 
    a.click();

    // Liberar la URL del Blob
    URL.revokeObjectURL(url);
  }

  base64ToUint8Array(base64: string): Uint8Array {
    const binaryString = window.atob(base64);  
    const len = binaryString.length;
    const bytes = new Uint8Array(len);

    const buffer = new ArrayBuffer(len);
    const view = new DataView(buffer);

    for (let i = 0; i < len; i++) {
        view.setUint8(i, binaryString.charCodeAt(i)); 
    }

    bytes.set(new Uint8Array(buffer));
    return bytes;
}
}
