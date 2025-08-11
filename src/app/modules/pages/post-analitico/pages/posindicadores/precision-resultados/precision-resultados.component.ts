import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ThemePalette, MatOptionModule } from '@angular/material/core';
import { ProgressSpinnerMode, MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PrePatientidaccuracyService } from '@app/services/pre-analitico/pre-patientidaccuracy.service';
import { ToastrService } from 'ngx-toastr';
import { IndicadoresService  } from '@app/services/post-analitico/indicadores.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { PostIndicacoresService } from '@app/services/post-analitico/post-indicacores.service';
import { ImageCdnPipe } from '../../../../../core/pipes/image-cdn.pipe';
import { NgxSpinnerComponent } from 'ngx-spinner';
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
    selector: 'app-precision-resultados',
    templateUrl: './precision-resultados.component.html',
    styleUrls: ['./precision-resultados.component.css'],
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, MatFormFieldModule, MatSelectModule, MatOptionModule, NgFor, NgIf, MatInputModule, MatCardModule, MatProgressSpinnerModule, NgxSpinnerComponent, TranslateModule, ImageCdnPipe]
})
export class PrecisionResultadosComponent implements OnInit {
  indPatient: any = null;
  mostrarPantalla:boolean = true
  validarFiltro:boolean = false
  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();
  formulario: FormGroup;
  valItem1: number;
  valItem2: number;
  valItem3: number;
  valItem4: number;
  valItem5: number;
  valItem6: number;
  valItem7: number;


  totalOrdenes: number = 0;
  totalOrdPB: number = 0;
  totalOrd: number = 0;

  totalOrdPB_Tmp: number = 0;

  //progress bar
  color: ThemePalette = 'primary';
  mode: ProgressSpinnerMode = 'determinate';
  value = 0;

  alert: boolean = false;

  isDisabled: boolean = true;

  txtInput1: boolean = false;
  txtInput2: boolean = false;
  txtInput3: boolean = false;
  txtInput4: boolean = false;
  txtInput5: boolean = false;
  txtInput6: boolean = false;
  txtInput7: boolean = false;


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
    this.Turnos = res
   });
   this.infoIndicador();

 }

  getFiltro(){

    console.log(this.formulario.value);
    if(this.formulario.valid){

      this.IndicadoresService.getFiltroIndicadoresOcho(this.formulario.value.mes,this.formulario.value.anio, this.formulario.value.turno, this.formulario.value.area).then((res:any)=>{
      console.log("Respuesta",res);
      this.totalOrdenes = res[0].totalorderreceived
      this.valItem2 = res[0].testresultscorrection
      this.valItem3 =  res[0].wrongpatientresult
      this.valItem4 =  res[0].incompleteresults
      this.valItem5 =  res[0].unreadableresults
      this.valItem6 =  res[0].wrongtestresults
      this.valItem7 =  res[0].numbincorrectresultstoproblems

        this.indPatient = res[0];
        this.setTotalProgressBarInicio()
      }).catch((err:any)=>{
        console.log("Respuesta",err);
        this.totalOrdenes = 0
        this.valItem2 = 0
        this.valItem3 = 0
        this.valItem4 = 0
        this.valItem5 = 0
        this.valItem6 = 0
        this.valItem7 = 0
        this.indPatient = null;
        this.setTotalProgressBar(this.valItem1)



      })
      this.isDisabled = false
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
            if(this.alert == false){
              if(this.indPatient ){
                this.indPatient.idturns = this.formulario.get('turno').value,
                this.indPatient.idarea =this.formulario.get('area').value,
                this.indPatient.months = this.formulario.get('mes').value,

                this.indPatient.years = this.formulario.get('anio').value,
                this.indPatient.totalorderreceived = this.totalOrdenes,
                this.indPatient.testresultscorrection = this.valItem2,
                this.indPatient.wrongpatientresult = this.valItem3,
                this.indPatient.incompleteresults = this.valItem4,
                this.indPatient.unreadableresults = this.valItem5,
                this.indPatient.wrongtestresults = this.valItem6,
                this.indPatient.numbincorrectresultstoproblems = this.valItem7
                console.log('Editar' , this.indPatient);
                 this.IndicadoresService.updateIndicadoresOcho(this.indPatient, this.indPatient.idaccuracyresults).subscribe(respuesta => {
                  //this.spinner.hide();
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
                    totalorderreceived: this.totalOrdenes,
                    TESTRESULTSCORRECTION: this.valItem2,
                    WRONGPATIENTRESULT : this.valItem3,
                    INCOMPLETERESULTS : this.valItem4,
                    UNREADABLERESULTS : this.valItem5,
                    WRONGTESTRESULTS : this.valItem6,
                    NUMBINCORRECTRESULTSTOPROBLEMS : this.valItem7,
                    ACTIVE : 1
                }

                console.log(indJson);


                this.IndicadoresService.createIndicadoresOcho(indJson).subscribe(resp =>{

                  const Loguser = {
                    Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
                    Hora: this.dateNowISO,
                    Metodo: 'actualización',
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
                    Metodo:'actualización',
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

    }



    setTotalProgressBarInicio(){

      //console.log(element);

      //this.totalOrdPB_Tmp = this.totalOrdPB_Tmp + element.value;
      this.totalOrdPB_Tmp =   this.valItem2 + this.valItem3 + this.valItem4 + this.valItem5 + this.valItem6 + this.valItem7;
      this.totalOrd =  this.totalOrdPB_Tmp

      if (this.totalOrdPB_Tmp > this.totalOrdenes) {

        console.log('Aqui', this.totalOrdPB_Tmp);


        this.alert = true;

        // element.control.setValue(0);
        //element.control.setErrors({'max': true});
        return;
      }else{
        this.alert = false;
      }



      this.totalOrdPB = this.totalOrdPB_Tmp;
      this.value = (this.totalOrdPB * 100) / this.totalOrdenes;

    }

    setTotalProgressBar(element){

      //console.log(element);

      this.totalOrdPB_Tmp =   this.valItem2 + this.valItem3 + this.valItem4 + this.valItem5 + this.valItem6 + this.valItem7;
      this.totalOrd =  this.totalOrdPB_Tmp
      if (this.totalOrdPB_Tmp > this.totalOrdenes) {

        console.log('Aqui', this.totalOrdPB_Tmp);


        this.alert = true;

        this.switchInputs(element.name);
        // element.control.setValue(0);
        //element.control.setErrors({'max': true});
        return;
      }else{
        this.alert = false;
      }


      if (element.value > this.totalOrdenes) {

        this.alert = true;

        element.control.setValue(this.totalOrdenes);
        element.control.setErrors({'max': true});
        return;

      }else{
        this.alert = false;
      }


      this.totalOrdPB = this.totalOrdPB_Tmp;
      this.value = (this.totalOrdPB * 100) / this.totalOrdenes;

    }




    setTotalOrdenes(){

      if (this.totalOrdenes > 0) {

        this.isDisabled = false;

        this.valItem1 = 0;
        this.valItem2 = 0;
        this.valItem3 = 0;
        this.valItem4 = 0;
        this.valItem5 = 0;

      }




    }


    reset(){

      this.value = 0;

      this.formulario.get('mes').setValue('--');
      this.formulario.get('anio').setValue('--');
      this.valItem1 = null;
      this.valItem2 = null;
      this.valItem3 = null;
      this.valItem4 = null;
      this.valItem5 = null;

      this.totalOrdenes = null;
      this.totalOrdPB_Tmp = 0;
      this.totalOrdPB = 0;
      this.isDisabled = true;
      this.alert = false;

      this.switchInputs('');

    }


    switchInputs(input){

      //console.log(input);


      switch (input) {
        case 'input1':
          this.txtInput1 = true;
          break;
          case 'input2':
            this.txtInput2 = true;
            break;
          case 'input3':
            this.txtInput3 = true;
            break;
          case 'input4':
            this.txtInput4 = true;
            break;
          case 'input5':
            this.txtInput5 = true;
            break;
            case 'input6':
              this.txtInput6 = true;
              break;
              case 'input7':
                this.txtInput7 = true;
                break;
        default:
          this.txtInput1 = false;
          this.txtInput2 = false;
          this.txtInput3 = false;
          this.txtInput4 = false;
          this.txtInput5 = false;
          this.txtInput6 = false;
          this.txtInput7 = false;

          break;
      }

    }
    infoIndicador(){
      console.log(this.tituloInd);
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