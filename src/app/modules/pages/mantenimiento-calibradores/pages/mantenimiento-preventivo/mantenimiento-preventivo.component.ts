import { Component, OnInit, TemplateRef } from '@angular/core';
import { DatePipe, NgIf, NgFor, NgClass, AsyncPipe, TitleCasePipe } from '@angular/common';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Observable, ReplaySubject } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { MantenimientoPreventivoService } from '../../../../../services/mantenimiento-calibradores/mto-preventive.service';
import { EquiposService } from '../../../../../services/mantenimiento-calibradores/equipos.service';
import { FormControl, FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SendEmailmtoService } from '../../../../../services/mantenimiento-calibradores/send-mail.service';
import { ImageCdnPipe } from '../../../../core/pipes/image-cdn.pipe';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatOptionModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { LoaderService } from '@app/services/loader/loader.service';

interface mtoPreventive {
  idpreventive_mto:number;
  serial: string;
  description: string;
  datepro: string;
  hourpro: string;
  dateexe: string;
  hourexe: string;
  maintenanceissue: string;
  active: boolean;
  serialDetalle:any;
}


interface fileMtoPreventive {
  Idpreventive_mto:number;
  File: string;
  Filename:string;
  active: boolean;
  Idfile_suportprev_mto?: number;

}


@Component({
    selector: 'app-mantenimiento-preventivo',
    templateUrl: './mantenimiento-preventivo.component.html',
    styleUrls: ['./mantenimiento-preventivo.component.css'],
    standalone: true,
    imports: [NgIf, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatAutocompleteModule, NgFor, MatOptionModule, NgClass, MatDatepickerModule, MatSlideToggleModule, PdfViewerModule, AsyncPipe, TitleCasePipe, DatePipe, TranslateModule, ImageCdnPipe]
})
export class MantenimientoPreventivoComponent implements OnInit {

  tipoSelec: number = 1;
  indicadores= []
  estadoInicial:boolean = true;
  selected = new Date().toLocaleDateString('es');
  ventanaModal: BsModalRef;

  equipos: any = [];
  mantenimiento: mtoPreventive;
  newFilesMtoPrevent: fileMtoPreventive[];
  filesName: string[];
  serial: string;

  filteredOptions: Observable<string[]>;
  mantenimientosPorSerialTotal: mtoPreventive[];
  mantenimientosPorSerialProg: mtoPreventive[];
  separadorSerial: String;
  filtroFormulario: FormGroup = this.fb.group({
    serialInput:  ['', Validators.required],
  });

  mtoPreventivoFormulario: FormGroup = this.fb.group({
    serial:  ['', Validators.required],
    description:  ['', Validators.required],
    datepro:  [this.selected, Validators.required],
    hourpro:  ['', Validators.required],
    // dateexe:  ['', Validators.required],
    // hourexe:  ['', Validators.required],
    maintenanceissue:  ['', Validators.required],
    active:  [true],
  });
  formaProgramaRecordatorios: FormGroup = this.fb.group({
    Issueemail:  ['', Validators.required],
    Serial:  ['', Validators.required],
    Addresses:  ['', Validators.required],
    Descriptionemail:  ['', Validators.required],
    Dateinitial:  ['', Validators.required],
    Dateend:  ['', Validators.required],
    Hourinitial:  ['', Validators.required],
    Hourend:  ['', Validators.required],
    Daysinadvance:  ['', Validators.required],
    Shippingfrequency:  ['', Validators.required],
    Alerts:  [true, Validators.required],
    Active:  [true, Validators.required],
    Contador:  [0],

  });
  horaInicial: string;
  files:any = [];
  dateNowISO =new Date().toLocaleTimeString('it-IT');
  preViewFile: any;
  verImagen: boolean = false;
  verPdf: boolean = false;

  constructor(private fb: FormBuilder,
              private datePipe: DatePipe,
              private toastr: ToastrService,
              private modalService: BsModalService,
              private translate: TranslateService,
              private equiposService: EquiposService,
              private sendEmailmtoService: SendEmailmtoService,
              private mantenimientoPreventivoService: MantenimientoPreventivoService,
              private loader: LoaderService
            ) { }


  ngOnInit(): void {
    this.cargarEquipos();
    this.filteredOptions = this.filtroFormulario.get('serialInput').valueChanges.pipe(
      // tap(res=> console.log(res)),
      startWith(''),
      map(value => this._filter(value)),
    );

  }

  onCalendarChange(e){
    this.mtoPreventivoFormulario.get('datepro').setValue(this.datePipe.transform(new Date(e), "yyyy-MM-dd"));
  }
  onTimeChange(e){
    this.mtoPreventivoFormulario.get('hourpro').setValue(new Date(`June 11, 1981 ${e}`).toLocaleTimeString('it-IT'));
  }


  get maintenanceissueNoValido() {
    return this.mtoPreventivoFormulario.get('maintenanceissue');
  }
  get descriptionNoValido() {
    return this.mtoPreventivoFormulario.get('description');
  }
  get serialInputNoValido() {
    return this.filtroFormulario.get('serialInput');
  }
  get destinatariosNoValido() {
    return this.formaProgramaRecordatorios.get('Addresses');
  }
  get asuntoNoValido() {
    return this.formaProgramaRecordatorios.get('Issueemail');
  }
  get dateInitialNoValido() {
    return this.formaProgramaRecordatorios.get('Dateinitial');
  }
  get dateEndNoValido() {
    return this.formaProgramaRecordatorios.get('Dateend');
  }
  get diasAntelacionNoValido() {
    return this.formaProgramaRecordatorios.get('Daysinadvance');
  }
  get frecuenciaEnvioNoValido() {
    return this.formaProgramaRecordatorios.get('Shippingfrequency');
  }
  async cargarEquipos(){
    this.equipos = await this.equiposService.getObtenerTodos().then(res=>res).catch(_=>[]);
  }
  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.equipos.filter(equipo => equipo.Serial.toLowerCase().includes(filterValue)).filter(e=>e.Active == true);
  }

  consultarSerial(){

    if (this.filtroFormulario.invalid) {
      return  Object.values( this.filtroFormulario.controls ).forEach( control => {
        control.markAsTouched();
      });
    }
    this.serial = this.filtroFormulario.get('serialInput').value;
    this.estadoInicial = false;
    this.mantenimientosPorSerialTotal = [];
    this.mantenimientosPorSerialProg = [];
    this.mantenimientoPreventivoService.getInfoPreventivo(this.serial)
                                        .subscribe((mtosPreventivos: mtoPreventive[]) => {
                                          this.mantenimientosPorSerialTotal = mtosPreventivos.sort((a, b) => new Date(a.datepro).getTime() - new Date(b.datepro).getTime());
                                          this.mantenimientosPorSerialProg =  this.mantenimientosPorSerialTotal.filter(item => new Date(item.datepro).getTime() > new Date().getTime());
                                        });
   // this.separadorSerial = this.serial.match(/.{1,4}(.$)?/g).join(" ");

  }
  guardarMantenimientoPreventivo(){
    this.mtoPreventivoFormulario.get('serial').setValue(this.serial);
    //this.mtoPreventivoFormulario.get('serial').setValue(this.serial); event.toLocaleTimeString('it-IT')
    //console.log(this.mtoPreventivoFormulario.value);
    if (this.mtoPreventivoFormulario.invalid) {
      return  Object.values( this.mtoPreventivoFormulario.controls ).forEach( control => {
        control.markAsTouched();
      });
    }
    this.mantenimientoPreventivoService.create(this.mtoPreventivoFormulario.value)
                                        .subscribe(res => {
                                            this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.MANTENIMIENTO_PREV'));
                                            this.mantenimientosPorSerialProg.push(res);
                                            this.mtoPreventivoFormulario.reset();
                                          },(err:any)=>{
                                            this.toastr.error(this.translate.instant('MODULES.NOTIFICACIONES.ERRORALCREAR'));
                                            const Loguser = {
                                              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
                                              Hora: this.dateNowISO,
                                              Metodo: this.translate.instant('MODULES.NOTIFICACIONES.ERRORALCREAR'),
                                              Datos: JSON.stringify(this.mantenimiento),
                                              Respuesta:   err.status,
                                              TipoRespuesta: ''
                                            }
                                            this.mantenimientoPreventivoService.createLogAsync(Loguser).then(respuesta => {
                                       
                                            });
                                        })

  }
  editMantenimientoPreventivo(){

    this.mantenimientoPreventivoService.update(this.mantenimiento, this.mantenimiento.idpreventive_mto)
    .subscribe(res=>{

      this.toastr.success('Registro actualizado');
      
      if( this.files.length > 0){
        let dataPdf:any = this.files

      for (let i = 0; i < this.files.length ; i++) {
        let newFile:fileMtoPreventive;
        let nombre:any = 0
        if(this.filesName.length > 0){
          nombre = this.filesName.length
        }
        newFile  = {
          Idpreventive_mto  : this.mantenimiento.idpreventive_mto,
          File  : dataPdf[i].base64 ,
          Filename: this.files[i].name + ( nombre + i + 1) + "." +    this.files[i].extension,
          active    : true
       }
       this.uploadFile(newFile);

      }

      //this.consultarMantenimiento()


    }
  },(err:any)=>{
    this.toastr.error(this.translate.instant('MODULES.NOTIFICACIONES.ERRORALACTUALIZAR'));
    const Loguser = {
      Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
      Hora: this.dateNowISO,
      Metodo: this.translate.instant('MODULES.NOTIFICACIONES.ERRORALACTUALIZAR'),
      Datos: JSON.stringify(this.mantenimiento),
      Respuesta:   err.status,
      TipoRespuesta: ''
    }
    this.mantenimientoPreventivoService.createLogAsync(Loguser).then(respuesta => {
      
    });
  })
  }

  getFilesPorMantenimiento(){
    this.mantenimientoPreventivoService.getArchivosMtoPreventivo(this.mantenimiento.idpreventive_mto).subscribe(res=>{
      console.log('Lista Archivos', res);
      this.filesName = res;
    },(err):any=>{
      this.filesName = []
    })

  }

  //------------------------------------
  convertFile(file : File) : Observable<string> {
    const result = new ReplaySubject<string>(1);
    const reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = (event) => result.next(btoa(event.target.result.toString()));
    return result;
  }

  downloadFile(_file){
          this.loader.show();
      this.mantenimientoPreventivoService.getArchivoMtoPrev(_file.Idfile_suportprev_mto).subscribe((res:any)=>{
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
           let pdfName = _file.Filename;
           let newVariable: any = window.navigator;
           if (newVariable.navigator && newVariable.msSaveOrOpenBlob) {
              newVariable.msSaveOrOpenBlob(file, pdfName);
           } else {
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

  async editFile(event, _file){

          let  base = ''
          this.loader.show();

          await this.convertFile(event.target.files[0]).subscribe(base64 => {
           base = base64

           let nameLent:any =  event.target.files[0].name.split(".")
           let name:any
        
           let updateFile:fileMtoPreventive
           updateFile  = {
             Idpreventive_mto: _file.Idpreventive_mto ,
             File: base64 ,
             Filename:  event.target.files[0].name,
             active:  _file.Active ,
             Idfile_suportprev_mto: _file.Idfile_suportprev_mto
          }
           this.mantenimientoPreventivoService.editarArchivoMtoPreventivo(updateFile, _file.Idfile_suportprev_mto).subscribe((res:any)=>{
            this.toastr.success('Registro actualizado');
            this.getFilesPorMantenimiento();
            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              Hora: this.dateNowISO,
              Metodo: 'actualización',
              Datos: JSON.stringify(updateFile),
              Respuesta: JSON.stringify(res),
              TipoRespuesta: ''  }
               // console.log(Loguser);
            this.mantenimientoPreventivoService.createLogAsync(Loguser).then(respuesta => {
              //console.log(respuesta);
            });

            this.getFilesPorMantenimiento();
            setTimeout(() => {
              this.loader.hide();
            }, 30000);

           },(err:any)=>{

            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              Hora: this.dateNowISO,
              Metodo: 'actualización',
              Datos: JSON.stringify(updateFile),
              Respuesta:   err.status,
              TipoRespuesta: ''
            }
            this.mantenimientoPreventivoService.createLogAsync(Loguser).then(respuesta => {
              //console.log(respuesta);
            });
            this.toastr.error(this.translate.instant('MODULES.NOTIFICACIONES.ERRORALACTUALIZAR'));
           })
          })


  }

  async handleFileSelectEditar(evt) {
   
      let  base = '';
    if((this.files.length  + this.filesName.length ) < 5){
          this.loader.show();
         await this.convertFile(evt.target.files[0]).subscribe(base64 => {
                  base = base64;
                  let nameLent:any =  evt.target.files[0].name.split(".");
                  this.files.push({
                   // name :`${ nameLent[0]} ${(this.files.length + 1)}` ,
                    name :`${ nameLent[0]}` ,
                    base64 : base,
                    extension : nameLent[1]
                  });
                  setTimeout(() => {
                    this.loader.hide();
                  }, 300);
              });

        }else{
          this.toastr.error(this.translate.instant('MODULES.NOTIFICACIONES.ERRORCANTIDADARCHIVOS'));
        }

  }

  uploadFile(indFile:any){

    this.mantenimientoPreventivoService.createArchivoMtoPreventivo(indFile).subscribe((Data:any)=>{

     const Loguser = {
       Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
       Hora: this.dateNowISO,
       Metodo: 'actualización',
       Datos: JSON.stringify(indFile),
       Respuesta: JSON.stringify(Data),
       TipoRespuesta: ''  
      }
     this.mantenimientoPreventivoService.createLogAsync(Loguser).then(respuesta => {
   
     });



       },(err:any)=>{

      this.toastr.error(this.translate.instant('MODULES.NOTIFICACIONES.ERRORALCREARFILE'));
      const Loguser = {
       Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
       Hora: this.dateNowISO,
       Metodo: 'actualización',
       Datos: JSON.stringify(indFile),
       Respuesta:   err.status,
       TipoRespuesta: ''
     }
     
     this.mantenimientoPreventivoService.createLogAsync(Loguser).then(respuesta => {
   
     });

       })


   }
  //------------------------------------


  tipo(numero:number){
   this.tipoSelec = numero
  }
  openModalArregloPre(templateArregloPre: TemplateRef<any>, data) {
    this.files = [];
    this.filesName = [];
    //console.log(data);
    this.mantenimiento = data;
    this.getFilesPorMantenimiento();
    this.verImagen = false;
    this.verPdf = false;
    this.ventanaModal = this.modalService.show(templateArregloPre,{backdrop: 'static', keyboard: false });
    this.ventanaModal.setClass('modal-lg');
  }

  preViewerFile(_file: fileMtoPreventive){
      this.mantenimientoPreventivoService.getArchivoMtoPrev(_file.Idfile_suportprev_mto).subscribe(res =>{
          let divisiones = res.filename.split(".");
          if(divisiones[1]=='png'){
            this.preViewFile = `data:image/png;base64,${res.file}`;
            this.verImagen = true;
          } else {
            this.verPdf =true;
            this.preViewFile = `data:application/pdf;base64,${res.file}`;
          }
        },(err:any)=>{
          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            Hora: this.dateNowISO,
            Metodo: 'actualización',
            Datos: JSON.stringify(_file),
            Respuesta:   err.status,
            TipoRespuesta: ''
          }
          this.mantenimientoPreventivoService.createLogAsync(Loguser).then(respuesta => {
         
          });
          this.toastr.error(this.translate.instant('MODULES.NOTIFICACIONES.ERRORALACTUALIZAR'));
         })


  }

  setHoraInitial(e){
    this.formaProgramaRecordatorios.get('Hourinitial').setValue(new Date(`June 11, 1981 ${e}`).toLocaleTimeString('it-IT'));
  }
  setHoraEnd(e){
    this.formaProgramaRecordatorios.get('Hourend').setValue(new Date(`June 11, 1981 ${e}`).toLocaleTimeString('it-IT'));
  }

  guardarProgramaRecordatorio(){

    //console.log(this.formaProgramaRecordatorios.value);

    this.formaProgramaRecordatorios.get('Serial').setValue(this.serial);
    if (this.formaProgramaRecordatorios.invalid) {
      return  Object.values( this.formaProgramaRecordatorios.controls ).forEach( control => {
        control.markAsTouched();
      });
    }

    this.sendEmailmtoService.create(this.formaProgramaRecordatorios.value).subscribe(resp =>{
      
      this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.PROGRAMA_RECORDATORIO'));
      this.formaProgramaRecordatorios.reset();
    },(err:any)=>{
      const Loguser = {
        Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
        Hora: this.dateNowISO,
        Metodo: 'actualización',
        Datos: JSON.stringify(this.formaProgramaRecordatorios.value),
        Respuesta:   err.status,
        TipoRespuesta: ''
      }
      this.sendEmailmtoService.createLogAsync(Loguser).then(respuesta => {
        
      });
      this.toastr.error(this.translate.instant('MODULES.NOTIFICACIONES.ERRORALACTUALIZAR'));
     })


  }
  cerrarImagen(){
   this.preViewFile = null;
   this.verImagen = false;
   this.verPdf = false;
  }
  closeVentana(): void {
    this.ventanaModal.hide();;
  }
  volverAlFitro(){
   this.estadoInicial = true;
   this.tipoSelec = 1;
  }


}
