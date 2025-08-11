import { Component, OnInit, TemplateRef } from '@angular/core';
import {MantenimientoCorrectivoService} from '@app/services/mantenimiento-calibradores/mantenimiento-correctivo.service';
import { FormGroup, FormBuilder, Validators, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ThemePalette, MatOptionModule } from '@angular/material/core';
import { ToastrService } from 'ngx-toastr';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { DatePipe, NgIf, NgFor, AsyncPipe } from '@angular/common';
import { Observable, ReplaySubject } from 'rxjs';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { map, startWith } from 'rxjs/operators';
import { ImageCdnPipe } from '../../../../core/pipes/image-cdn.pipe';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { LoaderService } from '@app/services/loader/loader.service';

@Component({
    selector: 'app-mantenimiento-correctivos',
    templateUrl: './mantenimiento-correctivos.component.html',
    styleUrls: ['./mantenimiento-correctivos.component.css'],
    standalone: true,
    imports: [NgIf, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatAutocompleteModule, NgFor, MatOptionModule, MatSelectModule, NgxMaterialTimepickerModule, MatSlideToggleModule, PdfViewerModule, AsyncPipe, DatePipe, TranslateModule, ImageCdnPipe]
})
export class MantenimientoCorrectivosComponent implements OnInit {

  tipoSelec: number = 1;
  indicadores= []
  dateNowISO
   verFile:boolean = false
   verImagenPdf:boolean = false
  estadoInicial:boolean = true
  equipoSerial:any
  serial:any = ''
  image:any
  pdfSrc:any
  formularioCear: FormGroup;
  formularioEditar: FormGroup;
  filteredOptions: Observable<string[]>;

  formularioSerial = this.fb.group({
    serial: ['', [Validators.required]],

  });
  file:any = ''
  anios = [];
  dia:any
  mes:any
  anio:any
  HistorialMantenimiento:any
  tituloAccion:any = ''
  SubtituloAccion:any = ''
  verImagenMantenimiento: boolean = false;
  verPdf: boolean = false;
  fileName:any
  DataModificar:any = []
  pdf:any = [];
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
  equipos: any = [];
  dias = [
    { iddias: 1},
    { iddias: 2},
    { iddias: 3},
    { iddias: 4},
    { iddias: 5},
    { iddias: 6},
    { iddias: 7},
    { iddias: 8},
    { iddias: 9},
    { iddias: 10},
    { iddias: 11},
    { iddias: 12},
    { iddias: 13},
    { iddias: 14},
    { iddias: 15},
    { iddias: 16},
    { iddias: 17},
    { iddias: 18},
    { iddias: 19},
    { iddias: 20},
    { iddias: 21},
    { iddias: 22},
    { iddias: 23},
    { iddias: 24},
    { iddias: 25},
    { iddias: 26},
    { iddias: 27},
    { iddias: 28},
    { iddias: 29},
    { iddias: 30},
    { iddias: 31},
  ];
    year: number = new Date().getFullYear();
  ventanaModal: BsModalRef;

  filtroFormulario: FormGroup = this.fb.group({
    Serial:  ['', Validators.required],
  });

  constructor(
    private mantenimientoServices:MantenimientoCorrectivoService,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private toastr: ToastrService,
    private translate: TranslateService,
    private modalService: BsModalService,
    private loader: LoaderService
  ) { }
  ngOnInit(): void {
    this.crearFormularioRegistro()

    this.cargarEquipos();
    this.filteredOptions = this.formularioSerial.get('serial').valueChanges.pipe(
      // tap(res=> console.log(res)),
      startWith(''),
      map(value => this._filter(value)),
    );
  
    this.anios = [
      this.year,
      this.year - 1,
      this.year - 2,
      this.year - 3,
    ];
  }


  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.equipos.filter(equipo => equipo.Serial.toLowerCase().includes(filterValue)).filter(e=>e.Active == true);
  }
  async cargarEquipos(){
    this.equipos = await this.mantenimientoServices.getObtenerTodos().then(res=>res).catch(_=>[]);
  }
  consultarSerial(){
    console.log(this.formularioSerial.value);
    if(this.formularioSerial.valid){
     this.estadoInicial = false
     this.consultarMantenimiento()

     this.reset()
    }
  }
  reset(){
    this.formularioCear.get('descrption').setValue(' ');
    this.formularioCear.get('hour').setValue('00:00');
    this.formularioCear.get('dia').setValue('--');
    this.formularioCear.get('mes').setValue('--');
    this.formularioCear.get('anio').setValue('--');
    this.formularioCear.get('maintenanceissue').setValue(' ');

  }

  get SerialNoValido() {
    return this.formularioSerial.get('serial');
  }


  tipo(numero:number){
   this.tipoSelec = numero
  }
  cancelar(){
    this.estadoInicial = true
  }
  ConsultaEquipo(){
    this.mantenimientoServices.getObtenerEquipoSeriales().subscribe((res:any)=>{
   this.equipoSerial = res
   
   let data:any =[]
    })
  }



  crearFormularioRegistro() {

    this.formularioCear = this.fb.group({
      serial : [''],
      descrption : ['', [Validators.required]],
      hour:[ '', [Validators.required]],
      dia: ['', [Validators.required]],
      mes: ['', [Validators.required]],
      anio: ['', [Validators.required]],
      maintenanceissue:['', [Validators.required]],
      active:[true]
    });
  }

  get DescrptionNoValido() {
    return this.formularioCear.get('descrption');
  }

  get DateNoValido() {
    return this.formularioCear.get('date');
  }

  get AnioNoValido() {
    return this.formularioCear.get('anio');
  }

  get HourNoValido() {
    return this.formularioCear.get('hour');
  }
  get DiaNoValido() {
    return this.formularioCear.get('dia');
  }
  get MesNoValido() {
    return this.formularioCear.get('mes');
  }

  get MaintenanceissueNoValido() {
    return this.formularioCear.get('maintenanceissue');
  }

  insertarMantemiento(){

    let indJson:any = {}
    let respuesta:any
    if(this.formularioCear.valid){
      this.loader.show();

      let dateTime:any =   this.datePipe.transform((this.formularioCear.get('anio').value + "-"+(this.formularioCear.get('mes').value)+ "-"+this.formularioCear.get('dia').value), "yyyy-MM-dd");
      indJson= {

        serial : this.formularioSerial.get('serial').value,
        description:this.formularioCear.get('descrption').value,
        date:dateTime,
        hour:this.formularioCear.get('hour').value,
        maintenanceissue:this.formularioCear.get('maintenanceissue').value,
        active:this.formularioCear.get('active').value,
      }
      this.mantenimientoServices.create(indJson).subscribe((res:any)=>{
       
        this.toastr.success('Registro creado');
        respuesta = res
        const Loguser = {
          fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo:'Mantenimiento y calibradores',
          Submodulo: 'Correctivo',
          Item:'',
          Metodo: 'creación',
          Datos: ('Serial: ' + indJson.serial + '| ' + 'mto correctivo: ' +  indJson.maintenanceissue ),
          Respuesta: JSON.stringify(res),
          TipoRespuesta: 200,
          Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
        this.mantenimientoServices.createLogAsync(Loguser).then(respuesta => {
          
        });


        if( this.pdf.length > 0){

          let dataPdf:any = this.pdf;

          for (let i = 0; i < this.pdf.length ; i++) {
            let indFile:any;
            indFile  = {
              idcorrective_mto  : res.idcorrective_mto ,
              file   : dataPdf[i].base64 ,
              active    : true ,
              Filename:  dataPdf[i].name
            }
            this.subirPdf(indFile);

          }

        this.consultarMantenimiento();

      setTimeout(() => {
        this.loader.hide();
      }, 3000);
        }else{
          setTimeout(() => {
            this.loader.hide();
          }, 300);
        }
      this.reset();
      },(err:any)=>{
        this.toastr.error(this.translate.instant('MODULES.NOTIFICACIONES.ERRORALCREAR'));

        setTimeout(() => {
          this.loader.hide();
        }, 300);
        const Loguser = {
          fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo:'Mantenimiento y calibradores',
          Submodulo: 'Correctivo',
          Item:'',
          Metodo: 'creación',
          Datos: ('Serial: ' + indJson.serial + '| ' + 'mto correctivo: ' +  indJson.maintenanceissue ),
          Respuesta:   err.status,
          TipoRespuesta: 200,
          Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
      
        this.mantenimientoServices.createLogAsync(Loguser).then(respuesta => {
  
        });
      })
    }
  }

  subirPdf(indFile:any){

    this.mantenimientoServices.createFileMantenimiento(indFile).subscribe((Data:any)=>{
      
      const Loguser = {
        fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
        hora: this.datePipe.transform(Date.now(), "shortTime"),
        Modulo:'Mantenimiento y calibradores',
        Submodulo: 'Correctivo',
        Item:'',
        Metodo: 'creación',
        Datos: JSON.stringify(indFile),
        Respuesta: JSON.stringify(Data),
        TipoRespuesta: 200,
        Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
      }
         
      this.mantenimientoServices.createLogAsync(Loguser).then(respuesta => {
        
      });
      this.pdf = []


    },(err:any)=>{

      setTimeout(() => {
        this.loader.hide();
      }, 300);
      this.toastr.error(this.translate.instant('MODULES.NOTIFICACIONES.ERRORALCREARFILE'));
      const Loguser = {
        fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
        hora: this.datePipe.transform(Date.now(), "shortTime"),
        Modulo:'Mantenimiento y calibradores',
        Submodulo: 'Correctivo',
        Item:'',
        Metodo: 'creación',
        Datos: JSON.stringify(indFile),
        Respuesta:   err.status,
        TipoRespuesta: 200,
        Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
      }
    
      this.mantenimientoServices.createLogAsync(Loguser).then(respuesta => {
        
      });

    })


  }

  async handleFileSelect(evt) {
      let  base = ''
      if(this.pdf.length < 5){
      this.loader.show();

      setTimeout(() => {
        this.loader.hide();
      }, 3000);

    await this.convertFile(evt.target.files[0]).subscribe(base64 => {
      base = base64


      this.pdf.push({
        campoNombre : this.pdf.length +1,
        base64 : base,
        name : evt.target.files[0].name
      })
    let input:any =  document.getElementById("file")
    input.Value = ""
      setTimeout(() => {
        this.loader.hide();
      }, 300);

          })

      }else{
        this.toastr.error(this.translate.instant('MODULES.NOTIFICACIONES.ERRORCANTIDADARCHIVOS'));

      }
        
  }

  convertFile(file : File) : Observable<string> {
    const result = new ReplaySubject<string>(1);
    const reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = (event) => result.next(btoa(event.target.result.toString()));
    return result;
  }

  consultarFile(idcorrective_mto){
    this.mantenimientoServices.getObtenerFile(idcorrective_mto).subscribe((res:any)=>{
      
    this.fileName = res
    },(err):any=>{
      this.fileName = []
    })
  }
//conusltar mantenimiento
  openModalMantenimiento(templateEliminarEquipo: TemplateRef<any>,data:any) {
      this.ventanaModal = this.modalService.show(templateEliminarEquipo,{backdrop: 'static', keyboard: false });
      this.DataModificar = data
      this.translate.get('Arreglo del:').subscribe(respuesta => this.tituloAccion = respuesta);
      this.SubtituloAccion = this.datePipe.transform(data.date, "yyyy/MM/dd")
   
      this.consultarFile(data.idcorrective_mto)
      this.crearFormularioEditar(data)
      this.pdf = []
      this.fileName = []
      this.verFile = false
      this.verImagenPdf = false
      this.verImagenMantenimiento = false
      this.image = ''
      this.ventanaModal.setClass('modal-lg');
  }
  closeVentana(): void {
    this.ventanaModal.hide();
  }

  consultarMantenimiento(){
    this.HistorialMantenimiento = []
    this.mantenimientoServices.getObtenerHistorialMantenimeinto(this.formularioSerial.get('serial').value).subscribe((res:any)=>{
      this.HistorialMantenimiento = res
      
      })
  }
  crearFormularioEditar(datos: any) {

    this.formularioEditar = this.fb.group({
      serial : [datos.Serial ? datos.Serial : ''],
      hour:[datos.hour ? datos.hour : ''],
      date : [datos.date ? datos.date : ''],
      maintenanceissue:[datos.maintenanceissue ? datos.maintenanceissue :''],
      active:[datos.active],
      description : [datos.description ? datos.description : '', [Validators.required]],
      idcorrective_mto:[datos.idcorrective_mto ? datos.idcorrective_mto :'']
    });
  }


  async handleFileSelectEditar(evt) {
    let  base = ''
    
    if((this.pdf.length  + this.fileName.length )< 5){
      this.loader.show();
      await this.convertFile(evt.target.files[0]).subscribe(base64 => {
        base = base64
        let nameLent:any =  evt.target.files[0].name
        this.pdf.push({
          campoNombre : this.pdf.length +1,
          base64 : base,
          name : nameLent
        })
        
        setTimeout(() => {
          this.loader.hide();
        }, 300);

      })
    }
    else{
      this.toastr.error(this.translate.instant('MODULES.NOTIFICACIONES.ERRORCANTIDADARCHIVOS'));
    }
    
  }

  EditarMantemiento(){

    let indJson:any = {}
    if(this.formularioEditar.valid){
      this.loader.show();
      indJson= {
        //idpatientaccuracy: '',
        serial : this.formularioSerial.get('serial').value,
        description:this.formularioEditar.get('description').value,
        date:this.formularioEditar.get('date').value,
        hour:this.formularioEditar.get('hour').value,
        maintenanceissue:this.formularioEditar.get('maintenanceissue').value,
        active:this.formularioEditar.get('active').value,
        idcorrective_mto:this.formularioEditar.get('idcorrective_mto').value,
      }

      this.mantenimientoServices.editar(indJson,this.formularioEditar.get('idcorrective_mto').value).subscribe((res:any)=>{
        this.toastr.success('Registro actualizado');
        this.closeVentana()
        const Loguser = {
          fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo:'Mantenimiento y calibradores',
          Submodulo: 'Correctivo',
          Item:'',
          Metodo: 'Registro actualizado',
          Datos: (indJson.serial + '| ' + indJson.maintenanceissue),
          Respuesta: JSON.stringify(res),
          TipoRespuesta: 200,
          Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }

        this.mantenimientoServices.createLogAsync(Loguser).then(respuesta => {
         
        });

      // this.formularioCear.reset();
        this.closeVentana()
      if( this.pdf.length > 0){
        let dataPdf:any = this.pdf
        //this.mantenimientoServices.createFileMantenimiento
        for (let i = 0; i < this.pdf.length ; i++) {
          let indFile:any
          let nombre:any = 0
          if(this.fileName.length > 0){
            nombre = this.fileName.length
          }
          indFile  = {
            idcorrective_mto  : this.formularioEditar.get('idcorrective_mto').value ,
            file   : dataPdf[i].base64 ,
            active    : true ,
            Filename:   this.pdf[i].name
          }
          this.subirPdf(indFile)

        }
        setTimeout(() => 
        {
          this.loader.hide();
        }, 3000);
      }
      else
        {
            setTimeout(() => {this.loader.hide();}, 300);
        }
  
      },(err:any)=>{
        this.toastr.error(this.translate.instant('MODULES.NOTIFICACIONES.ERRORALACTUALIZAR'));

        setTimeout(() => {
          this.loader.hide();
        }, 300);
        const Loguser = {
          fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo:'Mantenimiento y calibradores',
          Submodulo: 'Correctivo',
          Item:'',
          Metodo: 'Registro actualizado',
          Datos: (indJson.serial + '| ' + indJson.maintenanceissue),
          Respuesta:   err.status,
          TipoRespuesta: 200,
          Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
    
        this.mantenimientoServices.createLogAsync(Loguser).then(respuesta => {

        });
      })
      this.consultarMantenimiento()

    }
  }

  descargar(data:any){
    this.loader.show();
    this.mantenimientoServices.ConsultarArchivp(data.Idfile_suport_mto).subscribe((res:any)=>{
    setTimeout(() => {
      this.loader.hide();
    }, 300);

    const byteArray = new Uint8Array(
      atob(res.file)
        .split("")
        .map(char => char.charCodeAt(0))
    );
    const file = new Blob([byteArray]);
    const fileURL = URL.createObjectURL(file);
    let pdfName = data.Filename;
    let newVariable: any = window.navigator;
    if (newVariable.navigator && newVariable.msSaveOrOpenBlob) {
      newVariable.msSaveOrOpenBlob(file, pdfName);
    } 
    else {
      let link = document.createElement("a");
      link.download = pdfName;
      link.target = "_blank";

      // Construct the URI
      link.href = fileURL;
      document.body.appendChild(link);
      link.click();
      // Cleanup the DOM
      document.body.removeChild(link);

    }

    setTimeout(() => {
      this.loader.hide();
    }, 300);

    },(err)=>{
      console.log(err);

      setTimeout(() => {
        this.loader.hide();
      }, 30000);
    })
  }

  async editarPdf(evt , data){

    let  base = ''
    this.loader.show();

    setTimeout(() => {
      this.loader.hide();
    }, 30000);

    await this.convertFile(evt.target.files[0]).subscribe(base64 => {
    base = base64

    let nameLent:any =  evt.target.files[0].name

    let indFile:any
    indFile  = {
      idcorrective_mto  : data.Idcorrective_mto ,
      file   : base64 ,
      active    :  data.Active ,
      filename: nameLent,
      idfile_suport_mto: data.Idfile_suport_mto
    }
    this.mantenimientoServices.editarArchivo(indFile, data.Idfile_suport_mto).subscribe((res:any)=>{
      this.toastr.success('Registro actualizado');
      const Loguser = {
        fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
        hora: this.datePipe.transform(Date.now(), "shortTime"),
        Modulo:'Mantenimiento y calibradores',
        Submodulo: 'Correctivo',
        Item:'',
        Metodo: 'actualización',
        Datos: JSON.stringify(indFile),
        Respuesta: JSON.stringify(res),
        TipoRespuesta: 200,
        Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
      }
      this.mantenimientoServices.createLogAsync(Loguser).then(respuesta => {
       
      });
      this.consultarFile(data.Idcorrective_mto)

      setTimeout(() => {
        this.loader.hide();

      }, 3000);
    },(err:any)=>{

      const Loguser = {
        fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
        hora: this.datePipe.transform(Date.now(), "shortTime"),
        Modulo:'Mantenimiento y calibradores',
        Submodulo: 'Correctivo',
        Item:'',
        Metodo: 'actualización',
        Datos: JSON.stringify(indFile),
        Respuesta:   err.status,
        TipoRespuesta: 200,
        Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
      }
      setTimeout(() => {
        this.loader.hide();

      }, 300);
      this.mantenimientoServices.createLogAsync(Loguser).then(respuesta => {
        
      });
      this.toastr.error(this.translate.instant('MODULES.NOTIFICACIONES.ERRORALACTUALIZAR'));
    })
    })
  }

  verImagen(data: any){

    this.loader.show();
    this.mantenimientoServices.ConsultarArchivp(data.Idfile_suport_mto).subscribe((res:any)=>{
     
    setTimeout(() => {
      this.loader.hide();
    }, 300);
    
    let nameLent:any =  res.filename.split(".")
    var banderapdf :any;
    console.log(nameLent[1]);
    // this.verImagenPdf = true
    // this.image =  this._base64ToArrayBuffer(res.file)
    
    nameLent.forEach(element => {

      if(element == 'pdf'){
        banderapdf = true;
        // this.verImagenPdf = true
        // console.log(res);
        // this.image =  this._base64ToArrayBuffer(res.file)
        
      }else{
        banderapdf = false;
      }
      
    });
    if(banderapdf == true){
      this.verImagenPdf = true
      this.image =  this._base64ToArrayBuffer(res.file)
    }else{
      this.verImagenMantenimiento = true
      this.image = "data:image/png;base64,"+ res.file
    }



    this.verFile = true;

    setTimeout(() => {
      this.loader.hide();
    }, 30000);

    },(err)=>{
      console.log(err);
      this.verFile = false;

      setTimeout(() => {
        this.loader.hide();
      }, 3000);
    })

  }

  ventanaAnterior(){
    this.verFile = false;
    this.verImagenPdf = false
    this.verImagenMantenimiento = false
  }

  _base64ToArrayBuffer(base64) {
  
    var binary_string = base64.replace(/\\n/g, '');
    binary_string =  window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array( len );
    for (var i = 0; i < len; i++)        {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
  }

}

