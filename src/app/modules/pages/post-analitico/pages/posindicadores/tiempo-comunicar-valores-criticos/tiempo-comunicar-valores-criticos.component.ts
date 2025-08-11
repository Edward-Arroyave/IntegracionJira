import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ThemePalette, MatOptionModule } from '@angular/material/core';
import { ProgressSpinnerMode, MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PrePatientidaccuracyService } from '@app/services/pre-analitico/pre-patientidaccuracy.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { IndicadoresService  } from '@app/services/post-analitico/indicadores.service';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { PostIndicacoresService } from '@app/services/post-analitico/post-indicacores.service';
import { ImageCdnPipe } from '../../../../../core/pipes/image-cdn.pipe';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';


interface IndPatient {
  idpatientaccuracy: number;
  illegibleorder: number;
  months: number;
  ordererror: number;
  ordertotal: number;
  requestirrelevantevidence: number;
  requestmissinfo: number;
  transcriptionerrorsample: number;
  userid: number;
  years: number;
  }

@Component({
    selector: 'app-tiempo-comunicar-valores-criticos',
    templateUrl: './tiempo-comunicar-valores-criticos.component.html',
    styleUrls: ['./tiempo-comunicar-valores-criticos.component.css'],
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, MatFormFieldModule, MatSelectModule, MatOptionModule, NgFor, NgIf, MatInputModule, MatCardModule, MatProgressSpinnerModule, TranslateModule, ImageCdnPipe]
})
export class TiempoComunicarValoresCriticosComponent implements OnInit {

  indPatient: any = null;
  mostrarPantalla:boolean = true
  validarFiltro:boolean = false
  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();
  formulario: FormGroup;
  valItem1: number;

  totalOrdenes: number = 0;
  totalOrdPB: number = 0;
  totalOrdPB_Tmp: number = 0;

  //progress bar
  color: ThemePalette = 'primary';
  mode: ProgressSpinnerMode = 'determinate';
  value = 0;

  alert: boolean = false;

  isDisabled: boolean = true;

  txtInput1: boolean = false;


  year: number = new Date().getFullYear();

  anios = [];
  areas= [];
  Turnos= [];
  meses = [
    {mes:'Enero', idmes: 1},
    {mes:'Febrero', idmes: 2},
    {mes:'Marzo', idmes: 3},
    {mes:'Abril', idmes: 4},
    {mes:'Mayo', idmes: 5},
    {mes:'Junio', idmes: 6},
    {mes:'Julio', idmes: 7},
    {mes:'Agosto', idmes: 8},
    {mes:'Septiembre', idmes: 9},
    {mes:'Octubre', idmes: 10},
    {mes:'Noviembre', idmes: 11},
    {mes:'DIciembre', idmes: 12},
  ];

  @Input() tituloInd: string;
  arrayTurnos = [];
  arrayAreas = [];
  
  constructor(
    private fb: FormBuilder,
    private prePatientidaccuracyService: PrePatientidaccuracyService,
    private translate: TranslateService,
    private toastr: ToastrService,
    private IndicadoresService:IndicadoresService,
    private PostIndicacoresService:PostIndicacoresService,
    private datePipe: DatePipe,

  ) { }

  ngOnInit(): void {
    this.mostrarPantalla = true
    this.validarFiltro = false
    this.anios = [
      this.year,
      this.year - 1,
      this.year - 2,
      this.year - 3,
    ];

    this.getAreas()
    this.getTurno()
    this.crearFormulario();
    console.log(this.tituloInd);
  }

  async getAreas(){
    await this.IndicadoresService.getAllArea().then((res:any)=>{
    console.log(res);
     this.areas = res
    })
  }

  async getTurno(){
   await this.IndicadoresService.getAllTurnos().then((res:any)=>{
   console.log(res);
    this.Turnos = res;
   });
   this.infoIndicador();

 }


  getFiltro(){

    console.log(this.formulario.value);
    if(this.formulario.valid){

      this.IndicadoresService.getFiltroIndicadoresDos(this.formulario.value.mes,this.formulario.value.anio, this.formulario.value.turno, this.formulario.value.area).then((res:any)=>{
        console.log("Respuesta",res);
         this.valItem1 = res[0].timecriticalvalues
          this.indPatient = res[0];
          this.setTotalProgressBar(this.valItem1)
        }).catch((err:any)=>{
          console.log("Respuesta",err);

          this.valItem1 = 0
          this.indPatient = null;
         this.setTotalProgressBar(this.valItem1)

        })
        this.isDisabled = false
        this.mostrarPantalla = false
      this.mostrarPantalla = false
    }
  }

  filtroMesAno(){
    this.validarFiltro = true
  }

    //----------formulario------------

    get mesNoValido() {
      return this.formulario.get('mes');
    }

    get anioNoValido() {
      return this.formulario.get('anio');
    }


    get turnoNoValido() {
      return this.formulario.get('turno');
    }

    get areaNoValido() {
      return this.formulario.get('area');
    }


    crearFormulario() {

      this.formulario = this.fb.group({
        mes: ['', [Validators.required]],
        anio: ['', [Validators.required]],
        turno: ['', [Validators.required]],
        area :['', [Validators.required]],
      });


    }

    // --------crear editar--------
    crearEditar(){

      console.log(this.indPatient);


      if(this.indPatient){
        this.indPatient.idturns = this.formulario.get('turno').value,
        this.indPatient.idarea =this.formulario.get('area').value,
        this.indPatient.months = this.formulario.get('mes').value,

        this.indPatient.years = this.formulario.get('anio').value,
        this.indPatient.timecriticalvalues = this.valItem1,
        console.log('Editar' , this.indPatient);
         this.IndicadoresService.updateIndicadoresDos(this.indPatient, this.indPatient.idtimecomcriticalvalues).subscribe(respuesta => {
          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            Hora: this.dateNowISO,
            Metodo: 'actualización',
            Datos: JSON.stringify(this.indPatient),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: status
          }

          console.log(Loguser);
          this.IndicadoresService.createLogAsync(Loguser).then(respuesta => {
            console.log(respuesta);
          });
          this.toastr.success('Registro actualizado');
        }, (error) => {
          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            Hora: this.dateNowISO,
            Metodo: 'actualización',
            Datos: JSON.stringify(this.indPatient),
            Respuesta:  error.status,
            TipoRespuesta: status
          }
          console.log(Loguser);
          this.IndicadoresService.createLogAsync(Loguser).then(respuesta => {
            console.log(respuesta);
          });
          this.toastr.error('Server Error');


        });



      }else{
        console.log('Crear');


     if (!this.formulario.valid || this.formulario.get('mes').value == '--' || this.formulario.get('anio').value == '--') {

          this.toastr.error('Seleccione Mes/Año');
          return;

        }


        let indJson = {

            //idpatientaccuracy: '',
            idturns : this.formulario.get('turno').value,
            idarea:this.formulario.get('area').value,
            months:this.formulario.get('mes').value,
            years: this.formulario.get('anio').value,
            timecriticalvalues: this.valItem1,
            ACTIVE : 1
        }

        console.log(indJson);


        this.IndicadoresService.createIndicadoresDos(indJson).subscribe(resp =>{

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            Hora: this.dateNowISO,
            Metodo:'actualización',
            Datos: JSON.stringify(indJson),
            Respuesta: JSON.stringify(resp),
            TipoRespuesta: status
          }

          console.log(Loguser);

          this.IndicadoresService.createLogAsync(Loguser).then(respuesta => {
            console.log(respuesta);
          });
          this.toastr.success('Registro creado');
          this.indPatient = resp;

        }, (err:any) =>{


          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            Hora: this.dateNowISO,
            Metodo: 'actualización',
            Datos: JSON.stringify(this.indPatient),
            Respuesta:  err.status,
            TipoRespuesta: status
          }

          console.log(Loguser);

          this.IndicadoresService.createLogAsync(Loguser).then(respuesta => {
            console.log(respuesta);
          });
          this.indPatient = null;
          this.toastr.error('Server Error');


        });

      }


    }




    setTotalProgressBar(element){
      console.log("Circulo",element);
      this.totalOrdPB_Tmp =  this.valItem1 ;
      this.totalOrdPB = this.totalOrdPB_Tmp;
      this.value = (this.totalOrdPB * 100) / this.totalOrdenes;
    }

    setTotalOrdenes(){
      if (this.totalOrdenes > 0) {
        this.isDisabled = false;
        this.valItem1 = 0;
          }
    }


    reset(){

      this.value = 0;
      this.formulario.get('mes').setValue('--');
      this.formulario.get('anio').setValue('--');
      this.formulario.get('turno').setValue('--');
      this.formulario.get('area').setValue('--');
      this.isDisabled = true
      this.valItem1 = null;
      this.totalOrdenes = null;
      this.totalOrdPB_Tmp = 0;
      this.totalOrdPB = 0;
      this.isDisabled = true;
      this.alert = false;
      this.validarFiltro = false
      this.mostrarPantalla = true
      this.switchInputs('');

    }


    switchInputs(input){

      //console.log(input);


      switch (input) {
        case 'input1':
          this.txtInput1 = true;
          break;
        default:
          this.txtInput1 = false;
          break;
      }

    }
    infoIndicador(){
      this.PostIndicacoresService.getDatosIndicador(this.tituloInd).subscribe((respuesta: any) => {
        const arrayIds = respuesta.map((m: any) => m.Idarea);
        const arrayTurnos = respuesta.map((m: any) => m.Desturns);      
        
      this.arrayTurnos = [];
      this.arrayAreas = [];
    
      this.areas.forEach((m: any) => {
        if (arrayIds.includes(m.idarea)) {
          this.arrayAreas.push(m);
        }
      });
    
      this.Turnos.forEach((m: any) => {
        if (arrayTurnos.includes(m.desturns)) {
          this.arrayTurnos.push(m);
        } 
      });
      
      });
    }


}
