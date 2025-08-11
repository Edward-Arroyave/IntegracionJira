import { DatePipe, NgFor, NgIf, AsyncPipe, TitleCasePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { ProgramaQceService } from '@app/services/calidad-externo/programaQce.service';
import { GrubbsService } from '@app/services/calidad-externo/grubbs.service';
import { SedesService } from '../../../../../../services/configuracion/sedes.service';
import { PublicService } from '@app/services/public.service';
import { ControlMaterialService } from '@app/services/configuracion/materialescontrol.service';
import { SeccionesService } from '@app/services/configuracion/secciones.service';
import { LotesService } from '@app/services/configuracion/lotes.service';
import { FiltrosGrubbsInternoService } from '@app/services/configuracion/filtros-grubbs-interno.service';
import { Observable } from 'rxjs';
import { catchError, map, startWith, switchMap, tap, filter } from 'rxjs/operators';
import { ConfiguracionMediaDSService } from '@app/services/configuracion/configuracion-media-ds.service';
import { ImageCdnPipe } from '../../../../../core/pipes/image-cdn.pipe';
import { NombreSeccionPipe } from '../../../../../shared/pipe/nombre-seccion.pipe';
import { NombreControlmaterialPipe } from '../../../../../shared/pipe/nombre-contmat.pipe';
import { NombreLotePipe } from '../../../../../shared/pipe/nombre-lote.pipe';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { LoaderService } from '@app/services/loader/loader.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NombreTestPipe } from "../../../../../shared/pipe/nombre-test.pipe";
import { createLog } from '@app/globals/logUser';

@Component({
    selector: 'filtros-grubbs-interno',
    templateUrl: './filtros-grubbs-interno.component.html',
    styleUrls: ['./filtros-grubbs-interno.component.css'],
    providers: [DatePipe],
    standalone: true,
    imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    NgFor,
    MatInputModule,
    MatAutocompleteModule,
    MatTooltipModule,
    NgIf,
    AsyncPipe,
    TitleCasePipe,
    TranslateModule,
    NombreLotePipe,
    NombreControlmaterialPipe,
    NombreSeccionPipe,
    ImageCdnPipe,
    NgxMatSelectSearchModule,
    NombreTestPipe
],
})

export class FiltroGrubbsInternoComponent implements OnInit {
  log = new createLog(this.datePipe, this.translate, this.publicService);

  displayedColumns: string[] = ['num', 'res', 'z'];
  dataSource: MatTableDataSource<any>;
  ventanaModal: BsModalRef;
  error: any;
  accion: string;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  formaBuscarDatos: FormGroup;
  sedesActive = [];
  sedesActiveFilter = [];
  sedes = [];
  habilitarSede: boolean = false;
  sedeId: number = 0;
  //predictivos
  filteredOptionsSections: Observable<string[]>;
  filteredOptionsControlmaterial: Observable<string[]>;
  filteredOptionsLots: Observable<string[]>;
  filteredOptionsTest: Observable<string[]>;
  listsectionspr: any;
  idsectionspr: number;
  listcontrolmanterialpr: any;
  idcontrolmaterialpr: number;
  listlotspr: any;
  idlotspr: number;
  lotes = [];
  lotesActive = [];
  tests = [];
  secciones = [];
  seccionesActive = [];
  controlMaterial = [];
  controlMaterialActive = [];
  tablaNiveles1:any[] = [];
  tablaNiveles2:any[] = [];
  tablaNiveles3:any[] = [];
  tablaARNiveles1:any[] = [];
  tablaARNiveles2:any[] = [];
  tablaARNiveles3:any[] = [];
  tablaTotales:any[] = [];
  verBtn: boolean = false;
  test: number;
  leveltest:number;

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
  filterHeadquarters = new FormControl('');

  constructor(

    private fb: FormBuilder,
    private programQceService: ProgramaQceService,
    private grubbsService: GrubbsService,
    private translate: TranslateService,
    private datePipe: DatePipe,
    private toastr: ToastrService,
    private sedesService: SedesService,
    private publicService: PublicService,
    private controlMaterialService: ControlMaterialService,
    private seccionesService: SeccionesService,
    private lotesService: LotesService,
    private FiltrosGrubbsInternoService: FiltrosGrubbsInternoService,
    private ConfiguracionMediaDSService:ConfiguracionMediaDSService,
    private loader: LoaderService

  ) { }

  ngOnInit(): void {

    this.crearFormularioBuscarDatos();
    this.cargarSedes();
    this.cargarSeccionesPre();
    this.sedeId = JSON.parse(sessionStorage.getItem('sede'));
    if (this.sedeId > 0) {
        this.formaBuscarDatos.controls['numLaboratorio'].setValue(this.sedeId);
        this.habilitarSede = true
      }
  this.filtrosAutocomplete();
  }

  filtrosAutocomplete() {
    this.filterHeadquarters.valueChanges.subscribe(word => {
      if (word) {
        this.sedesActive = this.sedesActiveFilter.filter((item: any) => {
          return item.desheadquarters.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.sedesActive = this.sedesActiveFilter;
      }
    });
  }

  crearFormularioBuscarDatos() {

    this.formaBuscarDatos = this.fb.group({
      numLaboratorio: ['', [Validators.required]],
      seccion: ['', [Validators.required]],
      numMaterialControl: ['', [Validators.required]],
      numLote: ['', [Validators.required]],
      idtest: [''],
      nivel:['']
    });
  }

  async cargarSedes() {
    this.sedes = await this.publicService.obtenerSedes();
    this.sedesActive = this.sedes.filter(e => e.active);
    this.sedesActiveFilter = this.sedes.filter(e => e.active == true);
  }

  private _filterSections(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.listsectionspr
      .filter(seccion =>
        seccion.namesection.toLowerCase().includes(filterValue)).filter(e => e.Active == true)

  }

  private _filterControlMaterial(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.listcontrolmanterialpr
      .filter(contmat =>
        contmat.descontmat.toLowerCase().includes(filterValue)).filter(e => e.Active == true)
  }

  private _filterLots(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.listlotspr
      .filter(lots =>
        lots.Numlot.toLowerCase().includes(filterValue)).filter(e => e.Active == true)
  }

  private _filterTest(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.tests.filter(test => test.value.toLowerCase().includes(filterValue));
  }


  async cargarSeccionesPre() {
    await this.seccionesService.getAllAsyncSecciones().then(data => {
      this.listsectionspr = data.filter(e => e.Active == true);

      this.listsectionspr.sort((a: any, b: any) => {
        a.namesection = a.namesection.charAt(0) + a.namesection.slice(1);
        b.namesection = b.namesection.charAt(0) + b.namesection.slice(1);
      })

      this.listsectionspr.sort((a: any, b: any) => {
        if (a.namesection < b.namesection) return -1;
        if (a.namesection > b.namesection) return 1;
        return 0;
      })


      this.filteredOptionsSections = this.formaBuscarDatos.get('seccion').valueChanges.pipe(
        startWith(''),
        map(value => {
          return this._filterSections(value)
        }),
      );
    });
  }

  async cambiarSeccion(NombreSeccion: string, idsection?: number) {

    var namesection0 = this.formaBuscarDatos.get('seccion').setValue(NombreSeccion.split('|')[1]);
    var idsection0 = NombreSeccion.split('|')[0];
    this.idsectionspr = Number(idsection0);

    this.formaBuscarDatos.controls['numMaterialControl'].setValue('');
    this.formaBuscarDatos.controls['numLote'].setValue('');
      this.formaBuscarDatos.get('idtest').setValue('');

    await this.controlMaterialService.getAllAsyncControlMaterialxsedesec(this.idsectionspr, this.sedeId).then(data => {
      this.listcontrolmanterialpr = data.filter(e => e.Active == true);


      this.listcontrolmanterialpr.sort((a: any, b: any) => {
        a.descontmat = a.descontmat.charAt(0) + a.descontmat.slice(1);
        b.descontmat = b.descontmat.charAt(0) + b.descontmat.slice(1);
      })

      this.listcontrolmanterialpr.sort((a: any, b: any) => {
        if (a.descontmat < b.descontmat) return -1;
        if (a.descontmat > b.descontmat) return 1;
        return 0;
      })

      this.filteredOptionsControlmaterial = this.formaBuscarDatos.get('numMaterialControl').valueChanges.pipe(
        startWith(''),
        map(value => {

          return this._filterControlMaterial(value)
        }),
      );
    });
  }

  async cambiarControlMaterial(NombreControlmaterial: string, idcontrolmaterial?: number) {

    var descontmat001 = this.formaBuscarDatos.get('numMaterialControl').setValue(NombreControlmaterial.split('|')[1]);
    var idcontmat = NombreControlmaterial.split('|')[0];
    this.idcontrolmaterialpr = Number(idcontmat);

    if (idcontmat != '') {

      this.formaBuscarDatos.get('numLote').reset('');
      this.formaBuscarDatos.get('idtest').setValue('');
      
      await this.lotesService.getAllAsynclotsxsedecontm(this.idcontrolmaterialpr, this.sedeId).then(data => {
        this.listlotspr = data.filter(e => e.Active == true);

        this.listlotspr.sort((a: any, b: any) => {
          a.Numlot = a.Numlot.charAt(0) + a.Numlot.slice(1);
          b.Numlot = b.Numlot.charAt(0) + b.Numlot.slice(1);
        })

        this.listlotspr.sort((a: any, b: any) => {
          if (a.Numlot < b.Numlot) return -1;
          if (a.Numlot > b.Numlot) return 1;
          return 0;
        })

        this.filteredOptionsLots = this.formaBuscarDatos.get('numLote').valueChanges.pipe(
          startWith(''),
          map(value => {
            return this._filterLots(value)
          }),
        );
      });
    } else {

      this.lotesActive = [];
      this.formaBuscarDatos.get('numLote').setValue('');
    }
  }

  async lotesPre(nombreLote: string) {

    var desnumlot = this.formaBuscarDatos.get('numLote').setValue(nombreLote.split('|')[1]);
    var idlot0 = nombreLote.split('|')[0];
    this.idlotspr = Number(idlot0);

    this.formaBuscarDatos.get('numLaboratorio').valueChanges.subscribe(data => {

      this.ver = false;
      this.tests = [];

      if (data != '') {

        this.seccionesActive = this.secciones.filter(e => e.active);

        this.formaBuscarDatos.get('seccion').reset('');
        this.formaBuscarDatos.get('numMaterialControl').reset('');
        this.formaBuscarDatos.get('numLote').reset('');
      this.formaBuscarDatos.get('idtest').setValue('');

      } else {

        this.seccionesActive = [];
        this.controlMaterialActive = [];
        this.lotesActive = [];
        this.formaBuscarDatos.get('seccion').reset('');
        this.formaBuscarDatos.get('numMaterialControl').reset('');
        this.formaBuscarDatos.get('numLote').reset('');
      this.formaBuscarDatos.get('idtest').setValue('');

      }

    });

    this.formaBuscarDatos.get('seccion').valueChanges.subscribe(data => {

      this.ver = false;
      this.tests = [];

      if (data != '') {

        this.controlMaterialActive = this.controlMaterial.filter(e => e.active);
        this.formaBuscarDatos.get('numMaterialControl').reset('');
        this.formaBuscarDatos.get('numLote').reset('');
      this.formaBuscarDatos.get('idtest').setValue('');

      } else {
        this.controlMaterialActive = [];
        this.lotesActive = [];
        this.formaBuscarDatos.get('numMaterialControl').reset('');
        this.formaBuscarDatos.get('numLote').reset('');
      this.formaBuscarDatos.get('idtest').setValue('');

      }

    });

    this.formaBuscarDatos.get('numMaterialControl').valueChanges.subscribe(data => {

      this.ver = false;
      this.tests = [];

      if (data != '') {

        this.lotesActive = this.lotes.filter(e => e.active);
        this.formaBuscarDatos.get('numLote').reset('');
      this.formaBuscarDatos.get('idtest').setValue('');

      } else {
        this.lotesActive = [];
        this.formaBuscarDatos.get('numLote').reset('');
      this.formaBuscarDatos.get('idtest').setValue('');

      }

    });

    this.FiltrosGrubbsInternoService.GetInfoFilterGrubbs(this.sedeId, this.idsectionspr, this.idcontrolmaterialpr, this.idlotspr).subscribe(response => {

      this.tests = [];
      this.verBtn = false;
      for (let item of response) { 
        item.value = `${item.IdTest},${item.Desanalytes} | ${item.Desunits} | ${item.Desmethods} | ${item.Desreagents} | ${item.NameAnalyzer}`
      }
      this.tests = response;
      this.formaBuscarDatos.get('idtest').setValue('');

      this.filteredOptionsTest = this.formaBuscarDatos.get('idtest').valueChanges.pipe(
        startWith(''),
        map(value => {
          return this._filterTest(value)
        }),
      );

    }, error => {

      let arr = [];
      this.dataSource = new MatTableDataSource(arr);
      this.accion = 'noDatos';
      this.toastr.error('No se encontraron datos');
      // this.formaBuscarDatos.reset({ numLaboratorio: '', seccion: '', numMaterialControl: '', numLote: '' });
      this.tests = [];
      this.ver = false;
    });
  }

  setTest(test: any) {
    let id = test.split(',')[0];
    this.formaBuscarDatos.controls['idtest'].setValue(test.split(',')[1]);
    if (id != '') {
      this.test = parseInt(id);
      this.verBtn = true;
    } else {
      this.verBtn = false;
    }
  }

  setnivel(event: any) {
    const nivel = event.value;
    if (nivel != '') {
      this.leveltest = parseInt(nivel);
      this.verBtn = true;
    } else {
      this.verBtn = false;
    }
  }

  f1(){
    return new Promise((res,err)=>{
      this.FiltrosGrubbsInternoService.adminFiltroGrubbs(this.test)
            .subscribe((dataIni: any) => {
              this.dataInicial = dataIni;
              res(true);
            },e=>{
              this.dataInicial ={};
              this.ver = false;
              this.loader.hide();
              this.toastr.error('No se encontraron datos');
              err(false);
            })
    })
  }
  f2(){
    return new Promise((res,err)=>{
      this.FiltrosGrubbsInternoService.GetInfoFilterGrubbsAverageFinalInt(this.test)
          .subscribe((dataFn: any) => {
            this.dataFinal = dataFn ;
            res(true);
          },e=>{
            this.dataFinal = {};
            this.ver = true;
            this.loader.hide();
            this.toastr.error(this.translate.instant('No hay datos aberrantes'));
            err(false);
          })
    })
  }
  f3(){
    return new Promise((res,err)=>{
      this.FiltrosGrubbsInternoService.GetInfoFiltergrubbsxtest(this.test).subscribe((respuesta2:any[]) => {
        this.tablaNiveles1 =[];
        this.tablaNiveles2 =[];
        this.tablaNiveles3 =[];
        this.tablaTotales =[];
                
        const filterValidData = (data:any, valueProp:string) => {
          return data.filter((x:any) => x[valueProp] !== null );
        };
  
        const lv1:any[] = [...filterValidData(respuesta2, "Valuelevel1")];
        const lv2:any[] = [...filterValidData(respuesta2, "Valuelevel2")];
        const lv3:any[] = [...filterValidData(respuesta2, "Valuelevel3")];
      
        this.tablaNiveles1 = [...lv1.map(z =>{ 
          return {Valuelevel1:z.valuelevel1,
                  Zlevel1: z.zlevel1 === null ?'-':z.zlevel1,
                  Aberrante:z.aberrantdataflatlvl1,
                  Arlevel1:z.arlevel1}
        })];
        this.tablaNiveles2 = [...lv2.map(z =>{ 
          return {Valuelevel2:z.valuelevel2 ,
                  Zlevel2: z.zlevel2 === null ?'-':z.zlevel2,
                  Aberrante:z.aberrantdataflatlvl2 ,
                  Arlevel2:z.arlevel2 }
        })];
        this.tablaNiveles3 = [...lv3.map(z =>{ 
          return {Valuelevel3:z.valuelevel3 ,
                  Zlevel3: z.zlevel3 === null ?'-':z.zlevel3,
                  Aberrante:z.aberrantdataflatlvl3,
                  Arlevel3:z.arlevel3}
        })];

        if(this.tablaNiveles1.length !== 0){
          this.tablaARNiveles1 =  this.tablaNiveles1.filter(x=>x.Arlevel1 === "A" && x.Valuelevel1 !== null && x.Valuelevel1 !== undefined)
          this.tablaTotales.push([...this.tablaARNiveles1]);
        }
        if(this.tablaNiveles2.length !== 0){
          this.tablaARNiveles2 =  this.tablaNiveles2.filter(x=>x.Arlevel2 === "A" && x.Valuelevel2 !== null && x.Valuelevel2 !== undefined)
          this.tablaTotales.push([...this.tablaARNiveles2]);
        }
       
        if(this.tablaNiveles3.length !==0 ){
          this.tablaARNiveles3 =  this.tablaNiveles3.filter(x=>x.Arlevel3 === "A" && x.Valuelevel3 !== null && x.Valuelevel3 !== undefined)
          this.tablaTotales.push([...this.tablaARNiveles3]);
        }
        this.loader.hide();
        this.ver = true;
        res(true);
      },e=>{
        err(false);
      })
    })
  }

  async loadData() {

    this.loader.show();
    this.ver = false;
    await this.f1().then((_)=>{});
    await this.f2().then((_)=>{
      this.f3().then((_)=>{});
    },e=>this.f3().then((_)=>{})) ;

  }

  updateConfigAvergadsxtest(){

    this.ConfiguracionMediaDSService.getBuscadorConfiMediaDS(this.test).then((dataconfigaverage:any)=>{
      dataconfigaverage.forEach(element => {
        if(element.Level == 1){
          if(this.dataFinal.sdfinallvl1 != null || this.dataFinal.sdfinallvl1 !=Number.NaN){
            var jsonCrearControles = '{"Idaverageds":' + element.Idaverageds + ',"IdTest":' + this.test + ',"Media":' + this.dataFinal.averagefinallvl1  + ',"Cv":' + this.dataFinal.cvfinallvl1 +  ',"Ds":' + this.dataFinal.sdfinallvl1 + ',"Datatype": "Filtros Grupps"}';         
            this.FiltrosGrubbsInternoService.PutConfigMediaDsxTest(jsonCrearControles)
            .subscribe(async (resdata: any) => {
              this.log.logObj('Control Calidad Interno', 'Administración', 'Filtros Grubbs', 'a', jsonCrearControles, JSON.stringify(resdata), 200);
              await this.f3().then((_)=>{});
            }, (errodata: any) => {
              this.toastr.error(this.translate.instant(errodata.error));
              this.log.logObj('Control Calidad Interno', 'Administración', 'Filtros Grubbs', 'a', jsonCrearControles, errodata.message, errodata.status);
            })
          }
        }
        
        if(element.Level == 2){
          if(this.dataFinal.sdfinallvl2 != null || this.dataFinal.sdfinallvl2 !=Number.NaN)
            {
              var jsonCrearControles = '{"Idaverageds":' + element.Idaverageds + ',"IdTest":' + this.test + ',"Media":' + this.dataFinal.averagefinallvl2  + ',"Cv":' + this.dataFinal.cvfinallvl2 +  ',"Ds":' + this.dataFinal.sdfinallvl2 + ',"Datatype": "Filtros Grupps"}';
              this.FiltrosGrubbsInternoService.PutConfigMediaDsxTest(jsonCrearControles)
              .subscribe( async (resdata: any) => {
              this.log.logObj('Control Calidad Interno', 'Administración', 'Filtros Grubbs', 'a', jsonCrearControles, JSON.stringify(resdata), 200);
              await this.f3().then((_)=>{});
            }, (errodata: any) => {
              this.toastr.error(this.translate.instant(errodata.error));
              })
          }
        }

        if(element.Level == 3){
          if(this.dataFinal.sdfinallvl3 != null || this.dataFinal.sdfinallvl3 !=Number.NaN){
            var jsonCrearControles = '{"Idaverageds":' + element.Idaverageds + ',"IdTest":' + this.test + ',"Media":' + this.dataFinal.averagefinallvl3  + ',"Cv":' + this.dataFinal.cvfinallvl3 +  ',"Ds":' + this.dataFinal.sdfinallvl3 + ',"Datatype": "Filtros Grupps"}';
            this.FiltrosGrubbsInternoService.PutConfigMediaDsxTest(jsonCrearControles)
            .subscribe( async (resdata: any) => {
              await this.f3().then((_)=>{});
              this.log.logObj('Control Calidad Interno', 'Administración', 'Filtros Grubbs', 'a', jsonCrearControles, JSON.stringify(resdata), 200);
            }, (errodata: any) => {
            this.toastr.error(this.translate.instant(errodata.error));
          })
          }
        }
      });


      //Si se actualizo la información de configuración de media y ds, se muestra un mensaje informativo. 
    
      this.f3();
    })
  }
}