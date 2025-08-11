import { DatePipe, NgFor, NgIf, NgClass, DecimalPipe, TitleCasePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { ProgramaQceService } from '@app/services/calidad-externo/programaQce.service';
import { GrubbsService } from '@app/services/calidad-externo/grubbs.service';
import { ImageCdnPipe } from '../../../../../core/pipes/image-cdn.pipe';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { LoaderService } from '@app/services/loader/loader.service';
import { MatDialog } from '@angular/material/dialog';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';


@Component({
  selector: 'app-filtro-grubbs',
  templateUrl: './filtro-grubbs.component.html',
  styleUrls: ['./filtro-grubbs.component.css'],
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
    MatTableModule,
    MatSortModule,
    NgClass,
    DecimalPipe,
    TitleCasePipe,
    TranslateModule,
    ImageCdnPipe,
    MatIconModule,
    NgxMatSelectSearchModule
  ],
})

export class FiltroGrubbsComponent implements OnInit {

  displayedColumns: string[] = ['num', 'res', 'z'];
  dataSource: MatTableDataSource<any>;
  ventanaModal: BsModalRef;
  error: any;
  accion: string;

  @ViewChild(MatSort, { static: true }) sort: MatSort;

  filtroGrubbs: FormGroup = this.fb.group({

    programa: ['', [Validators.required]],
    analito: ['', [Validators.required]],
    ronda: ['', [Validators.required]],
    equipo: [''],
    metodo: [''],
    unidades: [''],

  });

  ver = false;
  dataInicial: any = {};
  dataFinal: any = {};

  programas = [];
  analytes = [];
  rondas = [];
  analyzers = [];
  metodos = [];
  unidades = [];
  programasCopy = [];
  analytesCopy = [];
  rondasCopy = [];
  analyzersCopy = [];
  metodosCopy = [];
  unidadesCopy = [];

  //fultros para buscar en inputs

  filterPrograma = new FormControl('')
  filterRonda = new FormControl('')
  filterAnalito = new FormControl('')
  filterEquipo = new FormControl('')
  filterMetodo = new FormControl('')
  filterUnidad = new FormControl('')


  constructor(

    private fb: FormBuilder,
    private programQceService: ProgramaQceService,
    private grubbsService: GrubbsService,
    private translate: TranslateService,
    private toastr: ToastrService,
    private loaderService: LoaderService,
    private dialog: MatDialog,

  ) { }

  ngOnInit(): void {

    this.getPrograms();
    this.filtrar();
    this.filtrosSeleccion();

  }

  async getPrograms() {

    await this.programQceService.getAllAsync().then(data => {

      this.programas = data.filter(e => e.active)
      this.programasCopy = data.filter(e => e.active)

    });

  }

  filtrar() {

    this.filtroGrubbs.get('programa').valueChanges.subscribe(id => {

      this.rondas = [];
      this.analytes = [];
      this.analyzers = [];
      this.metodos = [];
      this.unidades = [];
      this.filtroGrubbs.patchValue({ ronda: '', analito: '', equipo: '', metodo: '', unidades: '' });

      if (id != '') {

        this.grubbsService.getRondas(id).subscribe((rondas: any) => {

          this.rondas = rondas;
          this.rondasCopy = rondas;

        }, error => {

          this.rondas = [];
          this.rondasCopy = [];
        });

        this.grubbsService.getAnalytes(id).subscribe((analytes: any) => {

          this.analytes = analytes;
          this.analytesCopy = analytes;

        }, error => {

          this.analytes = [];
          this.analytesCopy = [];
        });

      }

    });

    this.filtroGrubbs.get('analito').valueChanges.subscribe(id => {

      this.analyzers = [];
      this.metodos = [];
      this.unidades = [];
      this.filtroGrubbs.patchValue({ equipo: '', metodo: '', unidades: '' });

      if (id != '') {

        this.grubbsService.getAnalyzers(id).subscribe((equipos: any) => {

          this.analyzers = equipos;
          this.analyzersCopy = equipos;

        }, error => {

          this.analyzers = [];
          this.analyzersCopy = [];

        });

        this.grubbsService.getMetodos(id).subscribe((metodos: any) => {

          this.metodos = metodos;
          this.metodosCopy = metodos;

        }, error => {

          this.metodos = [];
          this.metodosCopy = [];

        });

        this.grubbsService.getUnidades(id).subscribe((unidades: any) => {

          this.unidades = unidades;
          this.unidadesCopy = unidades;

        }, error => {

          this.unidades = [];
          this.unidadesCopy = [];

        });

      }

    });


  }

  filtrosSeleccion() {
    this.filterPrograma.valueChanges.subscribe(word => {
      if (word) {
        this.programas = this.programasCopy.filter((item: any) => {
          return item.desprogram.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.programas = this.programasCopy
      }
    });
    this.filterRonda.valueChanges.subscribe(word => {
      if (word) {
        this.rondas = this.rondasCopy.filter((item: any) => {
          return String(item.Nroround).toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.rondas = this.rondasCopy
      }
    });
    this.filterAnalito.valueChanges.subscribe(word => {
      if (word) {
        this.analytes = this.analytesCopy.filter((item: any) => {
          return item.Desanalytes.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.analytes = this.analytesCopy
      }
    });
    this.filterEquipo.valueChanges.subscribe(word => {
      if (word) {
        this.analyzers = this.analyzersCopy.filter((item: any) => {
          return item.NameAnalyzer.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.analyzers = this.analyzersCopy
      }
    });
    this.filterMetodo.valueChanges.subscribe(word => {
      if (word) {
        this.metodos = this.metodosCopy.filter((item: any) => {
          return item.Desmethods.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.metodos = this.metodosCopy
      }
    });
    this.filterUnidad.valueChanges.subscribe(word => {
      if (word) {
        this.unidades = this.unidadesCopy.filter((item: any) => {
          return item.Codunits.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.unidades = this.unidadesCopy
      }
    });
  }


  selectAllAnalytes() {
    this.analyzers = [];
    this.metodos = [];
    this.unidades = [];
    this.filtroGrubbs.patchValue({ equipo: '', metodo: '', unidades: '' });
    if (this.filtroGrubbs.get('analito').value[0] == '') {

      this.filtroGrubbs.get('analito').value.shift()
    }



    let all = this.analytes.map(e => { return e.Idanalytes })
    all.unshift("-1")
    this.filtroGrubbs.get('analito').setValue(all);

    let value = this.filtroGrubbs.get('analito').value;
    for (const i of value) {
      if (i != "-1") {
        this.grubbsService.getAnalyzers(i).subscribe((equipos: any) => {

          this.analyzers = [...this.analyzers, ...equipos];
        }, error => {
        });

        this.grubbsService.getMetodos(i).subscribe((metodos: any) => {
          this.metodos = [...this.metodos, ...metodos];
        }, error => { });

        this.grubbsService.getUnidades(i).subscribe((unidades: any) => {
          this.unidades = [...this.unidades, ...unidades];
        }, error => { });

      }


    }



  }


  selectOneAnalyte() {


    if (this.filtroGrubbs.get('analito').value[0] == '' || this.filtroGrubbs.get('analito').value[0] == '-1') {

      this.filtroGrubbs.get('analito').value.shift();
      this.filtroGrubbs.get('analito').setValue(this.filtroGrubbs.get('analito').value);

    }

    let value = this.filtroGrubbs.get('analito').value;
    this.analyzers = [];
    this.metodos = [];
    this.unidades = [];
    this.filtroGrubbs.patchValue({ equipo: '', metodo: '', unidades: '' });

    if (value.length > 1) {
      for (const i of value) {
        this.grubbsService.getAnalyzers(i).subscribe((equipos: any) => {


          this.analyzers = [...this.analyzers, ...equipos];
          this.deleteAnalyzerRepeat()
        }, error => {
        });

        this.grubbsService.getMetodos(i).subscribe((metodos: any) => {
          this.metodos = [...this.metodos, ...metodos];
        }, error => {
        });

        this.grubbsService.getUnidades(i).subscribe((unidades: any) => {
          this.unidades = [...this.unidades, ...unidades];
          this.deleteUnitsRepeat()
        }, error => {

        });

      }
      if (this.filtroGrubbs.get('analito').value.length == this.analytes.length) {
        let all = this.analytes.map(e => { return e.Idanalytes })
        all.unshift("-1")
        this.filtroGrubbs.get('analito').setValue(all)
      }



    } else {
      this.grubbsService.getAnalyzers(value[0]).subscribe((equipos: any) => {

        this.analyzers = equipos;
      }, error => {
        this.analyzers = [];
      });

      this.grubbsService.getMetodos(value[0]).subscribe((metodos: any) => {
        this.metodos = metodos;
      }, error => {
        this.metodos = [];
      });

      this.grubbsService.getUnidades(value[0]).subscribe((unidades: any) => {
        this.unidades = unidades;
      }, error => {
        this.unidades = [];

      });


    }



  }

  deleteAnalyzerRepeat() {

    const uniqueAnalyzers = [];
    const analyzerIdsSet = new Set();
    for (const analyzer of this.analyzers) {
      if (!analyzerIdsSet.has(analyzer.IdAnalyzer)) {
        analyzerIdsSet.add(analyzer.IdAnalyzer);
        uniqueAnalyzers.push(analyzer);
      }
    }
    this.analyzers = uniqueAnalyzers;

  }


  deleteMethodsRepeat() {
    // Eliminar duplicados de metodos basados en su propiedad id
    const uniqueMetodos = [];
    const metodoIdsSet = new Set();
    for (const metodo of this.metodos) {
      if (!metodoIdsSet.has(metodo.Idmethods)) {
        metodoIdsSet.add(metodo.Idmethods);
        uniqueMetodos.push(metodo);
      }
    }
    this.metodos = uniqueMetodos;

  }



  deleteUnitsRepeat() {

    const uniqueUnidades = [];
    const unidadIdsSet = new Set();
    for (const unidad of this.unidades) {
      if (!unidadIdsSet.has(unidad.Idunits)) {
        unidadIdsSet.add(unidad.Idunits);
        uniqueUnidades.push(unidad);
      }
    }
    this.unidades = uniqueUnidades;
  }






  search() {

    if (this.filtroGrubbs.valid) {



      this.ver = false;
      this.loaderService.show();

      var jsonEquipos: string = '';
      var jsonMetodos: string = '';
      var jsonUnidades: string = '';




      if (this.filtroGrubbs.value.metodo != '') {

        if (this.filtroGrubbs.value.metodo[0] == '-1') {

          jsonMetodos = '-1';

        } else {

          jsonMetodos = this.filtroGrubbs.value.metodo.join();

        }

      } else {

        jsonMetodos = '0';

      }

      if (this.filtroGrubbs.value.unidades != '') {

        if (this.filtroGrubbs.value.unidades[0] == '-1') {

          jsonUnidades = '-1';

        } else {

          jsonUnidades = this.filtroGrubbs.value.unidades.join();

        }

      } else {

        jsonUnidades = '0';

      }

      if (this.filtroGrubbs.value.equipo != '') {

        if (this.filtroGrubbs.value.equipo[0] == '-1') {

          jsonEquipos = '-1';

        } else {

          jsonEquipos = this.filtroGrubbs.value.equipo.join();

        }

      } else {

        jsonEquipos = '0';

      }


      // if (this.filtroGrubbs.value.analito != '') {

      //   if (this.filtroGrubbs.value.analito[0] == '-1') {
      //     jsonAnalitos = '-1';
      //   } else if (this.filtroGrubbs.value.analito.length > 1) {
      //     jsonAnalitos = this.filtroGrubbs.value.analito.join();
      //   } else {
      //     jsonAnalitos = parseInt(this.filtroGrubbs.value.analito)
      //   }
      // } else {

      //   jsonAnalitos = '0';

      // }


      var json = {

        Idprograma: parseInt(this.filtroGrubbs.get('programa').value),
        Nroround: parseInt(this.filtroGrubbs.get('ronda').value),
        Idanalyte: parseInt(this.filtroGrubbs.get('analito').value),
        Idanalyzer: jsonEquipos,
        Idmethod: jsonMetodos,
        Idunit: jsonUnidades

      }

      let datos: any = [];

      this.grubbsService.adminFiltroGrubbs(json).subscribe((data: any) => {

        this.dataInicial = {

          averageInitial: data.averageInitial,
          sdInitial: data.sdInitial,
          ndataInitial: data.ndataInitial

        }

        this.grubbsService.validaDatosAverrantes(json).subscribe((data: any) => {

          this.dataFinal = {

            averagefinal: data.averagefinal,
            sdfinal: data.sdfinal,
            ndatafinal: data.ndatafinal
          }

          this.grubbsService.infoResultsQce(json).subscribe((data: any) => {

            datos = data;
            this.dataSource = datos;

          }, error => {
            this.loaderService.hide();
           });

        }, error => {
          this.loaderService.hide();
        });

        setTimeout(() => {

          this.loaderService.hide();
          this.ver = true;

        }, 3000);

      }, error => {

        this.loaderService.hide();
        this.filtroGrubbs.reset({ programa: '', ronda: '', analito: '', equipo: '', metodo: '', unidades: '' });
        this.toastr.error('No se encontraron datos');
        this.ver = false;

      });


    } else {
      this.loaderService.hide();
      this.toastr.info('Filtro incompleto');

    }

  }

  selectNone(control: string) {

    this.filtroGrubbs.get(control).setValue('');
    if (control == 'analito') {
      this.analyzers = [];
      this.metodos = [];
      this.unidades = [];
      this.filtroGrubbs.patchValue({ equipo: '', metodo: '', unidades: '' });
    }
  }

  selectAll(control: string) {

    let data = [];
    data.push('-1');

    if (control == 'metodo') {

      for (let i = 0; i < this.metodos.length; i++) {

        data.push(this.metodos[i].Idmethods);

      }

      this.filtroGrubbs.get('metodo').setValue(data);

    }

    if (control == 'unidades') {

      for (let i = 0; i < this.unidades.length; i++) {

        data.push(this.unidades[i].Idunits);

      }

      this.filtroGrubbs.get('unidades').setValue(data);

    }

    if (control == 'equipo') {

      for (let i = 0; i < this.analyzers.length; i++) {

        data.push(this.analyzers[i].IdAnalyzer);

      }

      this.filtroGrubbs.get('equipo').setValue(data);

    }

  }

  selectOne(control: string) {

    if (this.filtroGrubbs.get(control).value[0] == '' || this.filtroGrubbs.get(control).value[0] == '-1') {

      this.filtroGrubbs.get(control).value.shift();
      this.filtroGrubbs.get(control).setValue(this.filtroGrubbs.get(control).value);

    }

  }


}

