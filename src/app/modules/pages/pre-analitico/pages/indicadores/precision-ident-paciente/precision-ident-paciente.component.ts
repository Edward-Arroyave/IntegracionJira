import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ThemePalette, MatOptionModule } from '@angular/material/core';
import { ProgressSpinnerMode, MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PrePatientidaccuracyService } from '@app/services/pre-analitico/pre-patientidaccuracy.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import moment from 'moment';
import { ImageCdnPipe } from '../../../../../core/pipes/image-cdn.pipe';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { NgFor, NgIf, NgClass } from '@angular/common';
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
    selector: 'app-precision-ident-paciente',
    templateUrl: './precision-ident-paciente.component.html',
    styleUrls: ['./precision-ident-paciente.component.css'],
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, MatFormFieldModule, MatSelectModule, MatOptionModule, NgFor, NgIf, MatCardModule, MatProgressSpinnerModule, MatInputModule, NgClass, TranslateModule, ImageCdnPipe]
})
export class PrecisionIdentPacienteComponent implements OnInit {

  indPatient: any = null;

  formulario: FormGroup;
  valItem1: number;
  valItem2: number;
  valItem3: number;
  valItem4: number;
  valItem5: number;
  disabledUp: boolean = true;
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
  txtInput2: boolean = false;
  txtInput3: boolean = false;
  txtInput4: boolean = false;
  txtInput5: boolean = false;

  ventanaConfirmacion: BsModalRef;

  year: number = new Date().getFullYear();

  anios = [];

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
    {mes:'Diciembre', idmes: 12},
  ];

  constructor(
    private fb: FormBuilder,
    private prePatientidaccuracyService: PrePatientidaccuracyService,
    private translate: TranslateService,
    private toastr: ToastrService,
    private modalService: BsModalService
  ) { }

  @ViewChild('modalConfirm') modalConfirm: TemplateRef<any>;

  ngOnInit(): void {

    this.anios = [
      this.year,
      this.year - 1,
      this.year - 2,
      this.year - 3,
    ];

    


    this.crearFormulario();
  }


  getFiltro(){

    this.totalOrdPB = 0;
    this.totalOrdPB_Tmp = 0;
    this.totalOrdenes = 0;
    this.value = 0;
    this.indPatient = null;
    this.disabledUp = false;

    const year=this.formulario.get('anio').value;
    const month=this.formulario.get('mes').value;
    const currentYear = moment().year();
    const currentMonth= moment().month()+1;
    if(year === currentYear){
      if(Number(month) > Number(currentMonth)){
        this.toastr.error('No puede superar el mes actual','Error');
        this.formulario.get('mes').setValue(null);
        this.indPatient = null;
        this.valItem1 = null;
        this.valItem2 = null;
        this.valItem3 = null;
        this.valItem4 = null;
        this.valItem5 = null;
        this.disabledUp = true;
        return;
      }
    }
      
    this.prePatientidaccuracyService.getByMonthYear(month, year).subscribe((resp: IndPatient[]) => {
      
      this.indPatient = resp[0];


      this.isDisabled = false;
      this.totalOrdPB = 0;      
      this.totalOrdPB_Tmp = 0;
      this.totalOrdenes = resp[0].ordertotal; // Total
      this.valItem1 = resp[0].illegibleorder;
      this.valItem2 = resp[0].ordererror;
      this.valItem3 = resp[0].requestmissinfo;
      this.valItem4 = resp[0].requestirrelevantevidence;
      this.valItem5 = resp[0].transcriptionerrorsample;
      this.totalOrdPB = this.valItem1 + this.valItem2 + this.valItem3 + this.valItem4 + this.valItem5;
    }, err =>{
      this.indPatient = null;
      this.valItem1 = null;
      this.valItem2 = null;
      this.valItem3 = null;
      this.valItem4 = null;
      this.valItem5 = null;
      this.toastr.error('No se encontro información','Error');
    });
  }



    //----------formulario------------

    get mesNoValido() {
      return this.formulario.get('mes');
    }

    get anioNoValido() {
      return this.formulario.get('anio');
    }



    crearFormulario() {

      this.formulario = this.fb.group({
        mes: ['', [Validators.required]],
        anio: ['', [Validators.required]],
      });


    }

    // --------crear editar--------
    crearEditar(){

      console.log(this.indPatient);

      let sign1 = Math.sign(this.valItem1);
      if(sign1 === 0){sign1 = 1}
      let sign2 = Math.sign(this.valItem2);
      if(sign2 === 0){sign2 = 1}
      let sign3 = Math.sign(this.valItem3);
      if(sign3 === 0){sign3 = 1}
      let sign4 = Math.sign(this.valItem4);
      if(sign4 === 0){sign4 = 1}
      let sign5 = Math.sign(this.valItem5);
      if(sign5 === 0){sign5 = 1}

      if(sign1 === 1
        && sign2 === 1
        && sign3 === 1
        && sign4 === 1
        && sign5 === 1){
          if(this.indPatient){
            this.indPatient.ordertotal = this.totalOrdenes;
            this.indPatient.illegibleorder = this.valItem1;
            this.indPatient.ordererror = this.valItem2;
            this.indPatient.requestirrelevantevidence = this.valItem4;
            this.indPatient.requestmissinfo = this.valItem3;
            this.indPatient.transcriptionerrorsample = this.valItem5;
            this.indPatient.months = this.formulario.get('mes').value;
            this.indPatient.years = this.formulario.get('anio').value;
            this.indPatient.userid = sessionStorage.getItem('userid');
    
    
    
            this.prePatientidaccuracyService.update(this.indPatient, this.indPatient.idpatientaccuracy).subscribe(respuesta => {
    
              this.toastr.success('Registro actualizado');
    
            }, (error) => {
    
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
                ordertotal: this.totalOrdenes,
                illegibleorder: this.valItem1,
                ordererror: this.valItem2,
                requestirrelevantevidence: this.valItem4,
                requestmissinfo: this.valItem3,
                transcriptionerrorsample: this.valItem5,
                months: this.formulario.get('mes').value,
                years: this.formulario.get('anio').value,
                userid: sessionStorage.getItem('userid'),
    
            }
    
            console.log(indJson);
    
    
            this.prePatientidaccuracyService.create(indJson).subscribe(resp =>{
    
              this.toastr.success('Registro creado');
    
              this.indPatient = resp;
    
            }, err =>{
    
              this.indPatient = null;
              this.toastr.error('Server Error');
    
    
            });
    
          }

      }else{
        this.toastr.error("Algunos valores de los items contienen valores negativos, por favor revisar la información digitada");
      }

    }




    setTotalProgressBar(element?){

      const valorIngresado = Math.sign(element.value);
      
      //No se cuenta en el total de las ordenes los numeros negativos
      if(valorIngresado === 1 || valorIngresado === 0){
        
      //this.totalOrdPB_Tmp = this.totalOrdPB_Tmp + element.value;

      this.totalOrdPB_Tmp =  this.valItem1 + this.valItem2 + this.valItem3 + this.valItem4 + this.valItem5;

      if (element.value > this.totalOrdenes) {

        this.alert = true;

        element.control.setValue(this.totalOrdenes);
        element.control.setErrors({'max': true});
        return;

      }


      if (this.totalOrdPB_Tmp > this.totalOrdenes) {

        console.log('Aqui', this.totalOrdPB_Tmp);


        this.alert = true;

        this.switchInputs(element.name);
        // element.control.setValue(0);
        //element.control.setErrors({'max': true});
        return;
      }


      if (element.value > this.totalOrdenes) {

        this.alert = true;

        element.control.setValue(this.totalOrdenes);
        element.control.setErrors({'max': true});
        return;

      }

      this.totalOrdPB = this.totalOrdPB_Tmp;
      this.value = (this.totalOrdPB * 100) / this.totalOrdenes;
      this.switchInputs('');
      this.alert = false;
    }
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

      this.totalOrdenes = 0;
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
        default:
          this.txtInput1 = false;
          this.txtInput2 = false;
          this.txtInput3 = false;
          this.txtInput4 = false;
          this.txtInput5 = false;
          break;
      }

    }

    openModalConfirm() {
      this.ventanaConfirmacion = this.modalService.show(this.modalConfirm, { backdrop: 'static', keyboard: false, class: 'modal-lg modal-dialog-centered' });
    }

}
