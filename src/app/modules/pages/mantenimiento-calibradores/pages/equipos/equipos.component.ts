import { Component, OnInit, TemplateRef } from '@angular/core';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { MatTableDataSource } from '@angular/material/table';
import { DatePipe, NgIf, NgFor, NgClass, TitleCasePipe } from '@angular/common';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AreasService } from '@app/services/post-analitico/areas.service';
import {EquiposService} from '@app/services/mantenimiento-calibradores/equipos.service';
import { Observable, ReplaySubject } from 'rxjs';
import { ImageCdnPipe } from '../../../../core/pipes/image-cdn.pipe';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { LoaderService } from '@app/services/loader/loader.service';
// ---------Interfaces----------------
interface Equipo{
  iddevices: number;
  namedevice: string;
  mark:string;
  model:string;
  serial:string;
  datasheet:string;
  fastguide:string;
  handbook:string;
  invima:string;
  protocol:string;
  riskclassification:string;
  active:boolean;

}
@Component({
    selector: 'app-equipos',
    templateUrl: './equipos.component.html',
    styleUrls: ['./equipos.component.css'],
    standalone: true,
    imports: [MatFormFieldModule, MatInputModule, NgIf, NgFor, MatSlideToggleModule, FormsModule, ReactiveFormsModule, NgClass, TitleCasePipe, TranslateModule, ImageCdnPipe]
})
export class EquiposComponent implements OnInit {

  cdateNow: Date = new Date();
  dateNowISO
  EquiposEditar:any = []
  equipo: Equipo;
  accionEditar: any;
  tituloAccion: any;
  accion: any;
  image: string;
  serial:any = ''
  equipoant:any;
  serialant:any;
  estadoant:any;

  ventanaModal: BsModalRef;
  formaRegistroEquipo: FormGroup;
  desactivar = false;
  messageError: string;
  seleccioneArchivo: string;
  dataSource: MatTableDataSource<any>;
  base64textString: any;
  pdf:any = [];
  mostrarTabla:boolean = true;
  //------------------

  constructor(
    private fb: FormBuilder,
    private modalService: BsModalService,
    private translate: TranslateService,
    private toastr: ToastrService,
    private datePipe: DatePipe,
    private postAreasService : AreasService,
    private EquiposService:EquiposService,
    private loader: LoaderService
  ) { }

  ngOnInit(): void {

  this.cargarEquipos()
  }


  cargarEquipos() {

    this.EquiposService.getObtenerTodos().then(respuesta => {
      
      let respArr = [];
      this.dataSource = new MatTableDataSource([]);
      //this.dataSource = new MatTableDataSource(respuesta);
      if (respuesta.length>0) {
        respuesta.forEach(item => {
            respArr.push(item);
        });
        this.dataSource = new MatTableDataSource(respArr);
        this.mostrarTabla = true;
       
      }else{
        
      }
    }).catch(_=>[this.mostrarTabla = false]);
  }


  openModalRegistroEquipo(templateRegistroEquipo: TemplateRef<any>, datos: any) {
  
    if(datos.Serial != null){
      this.equipoant = datos.Namedevice;
      this.serialant = datos.Serial;
      this.estadoant = datos.Active;
    }
    this.crearFormularioRegistroEquipo(datos);
    this.accionEditar = !!datos;
    this.ventanaModal = this.modalService.show(templateRegistroEquipo,{backdrop: 'static', keyboard: false });
    this.ventanaModal.setClass('modal-lg');
    if(this.accionEditar){
      this.serial =  this.formaRegistroEquipo.value.serial

      this.formaRegistroEquipo.get('serial').disable()

    }
    this.EquiposEditar = this.formaRegistroEquipo.value
    this.desactivar = true
    datos ? this.translate.get('MODULES.ANALITOSQCE.FORMULARIO.ACTUALIZAR').subscribe(respuesta => this.tituloAccion = respuesta) : this.translate.get('MODULES.ANALITOSQCE.FORMULARIO.REGISTRAR').subscribe(respuesta => this.tituloAccion = respuesta);
  }


  descargarPdf(componente, nombre){
     this.loader.show();
     this.EquiposService.getObtenerPdf( this.serial,componente ).subscribe((respuesta:any) => {
        if(respuesta.length > 0){
          let base65:any = ''
         if(componente == 1){
          base65 = respuesta[0].Datasheet
         }
         if(componente == 2){
          base65 = respuesta[0].Fastguide
         }
         if(componente == 3){
          base65 = respuesta[0].Handbook
         }
         if(componente == 4){
          base65 = respuesta[0].Invima
         }
         if(componente == 5){
          base65 = respuesta[0].Protocol
         }
          let nombrePdf:any = nombre
           if(this.accionEditar == true && base65!= ''){
             const byteArray = new Uint8Array(
               atob(base65)
                 .split("")
                 .map(char => char.charCodeAt(0))
             );
             const file = new Blob([byteArray], { type: "application/pdf" });
           const fileURL = URL.createObjectURL(file);
           let pdfName = nombrePdf + ".pdf";
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
         }

         setTimeout(() => {
          this.loader.hide();
        }, 300);

        }
     }, (err:any)=>{
      this.loader.hide();

      this.toastr.error(this.translate.instant('No existe adjunto'));
     })
  }


  openModalEliminarEquipos(templateEliminarEquipo: TemplateRef<any>,datos: any) {

    var iddevice = datos.Serial;
    this.loader.show();
    this.EquiposService.delete('equipos', iddevice).subscribe(respuesta => {
      
      this.accion = '';
      this.toastr.success('Registro eliminado');
      
      this.cargarEquipos();

      setTimeout(() => {
        this.loader.hide();
      }, 300);

      const Loguser = {
        fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
        hora: this.datePipe.transform(Date.now(), "shortTime"),
        Modulo:'Mantenimiento y calibradores',
        Submodulo: 'Equipos',
        Item:'',
        metodo: 'eliminación',
        Datos: ('Equipo: ' + datos.Namedevice + '| ' + 'Serial: ' +  datos.Serial ),
        respuesta: JSON.stringify(respuesta),
        tipoRespuesta: 200,
        Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
      }
      this.EquiposService.createLogAsync(Loguser).then(respuesta => {
        
      });

    },
    (err: HttpErrorResponse) => {

      setTimeout(() => {
        this.loader.hide();

      }, 300);
      this.toastr.error(this.translate.instant(err.error));

      const Loguser = {
        fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
        hora: this.datePipe.transform(Date.now(), "shortTime"),
        Modulo:'Mantenimiento y calibradores',
        Submodulo: 'Equipos',
        Item:'',
        metodo: 'eliminación',
        Datos: ('Equipo: ' + datos.namedevice + '| ' + 'Serial: ' +  datos.serial ),
        respuesta: err.message,
        tipoRespuesta: err.status,
        Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
      }
      this.EquiposService.createLogAsync(Loguser).then(respuesta => {
        
      });

    });
   
  }
  async handleFileSelect(evt , campo) {
    let  base = ''
   await this.convertFile(evt.target.files[0]).subscribe(base64 => {
    base = base64

    let filtro:any = []
    if(this.pdf.length > 0){
      filtro = this.pdf.filter(e => e.campoNombre == campo);
      if (filtro.length > 0){
        this.pdf  = this.pdf.filter(e => e.campoNombre != campo);
        this.pdf.push({
          campoNombre : campo,
          base64 : base
        })
      }else{
        this.pdf.push({
          campoNombre : campo,
          base64 : base
        })
      }
    }else{
      this.pdf.push({
        campoNombre : campo,
        base64 : base
      })
    }
    })


  }



  convertFile(file : File) : Observable<string> {
    const result = new ReplaySubject<string>(1);
    const reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = (event) => result.next(btoa(event.target.result.toString()));
    return result;
  }

  get namedeviceValido() {
    return this.formaRegistroEquipo.get('namedevice');
  }
  get markValido() {
    return this.formaRegistroEquipo.get('mark');
  }
  get modelValido() {
    return this.formaRegistroEquipo.get('model');
  }
  get serialValido() {
    return this.formaRegistroEquipo.get('serial');
  }
  get datasheetValido() {
    return this.formaRegistroEquipo.get('datasheet');
  }
  get fastguideValido() {
    return this.formaRegistroEquipo.get('fastguide');
  }
  get handbookValido() {
    return this.formaRegistroEquipo.get('handbook');
  }
  get invimaValido() {
    return this.formaRegistroEquipo.get('invima');
  }
  get protocolValido() {
    return this.formaRegistroEquipo.get('protocol');
  }
  get riskclassificationValido() {
    return this.formaRegistroEquipo.get('riskclassification');
  }
  get activeValido() {
    return this.formaRegistroEquipo.get('active');
  }

  public noWhitespaceValidator(control: FormControl) {

    const isWhitespace = (control.value || '').trim().length === 0;
    console.log("",(control.value || '').trim().length );

    const isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true };
  }

 crearFormularioRegistroEquipo(datos: any) {

    this.formaRegistroEquipo = this.fb.group({
      namedevice: [datos.Namedevice ? datos.Namedevice : '', [Validators.required]],
      mark: [datos.Mark ? datos.Mark : '', [Validators.required]],
      model: [datos.Model ? datos.Model : '', [Validators.required]],
      serial: [datos.Serial ? datos.Serial : '', [Validators.required]],
      datasheet: [''],
      fastguide: [  ''],
      handbook:[ ''],
      invima: [ ''],
      protocol: [ ''],
      riskclassification: [datos.Riskclassification ? datos.Riskclassification : '', [Validators.required]],
      active:[datos.Active ? datos.Active : false]
    });
  }


  // -----Selección del Item Area-----------
  selectedArea(equipo: Equipo, itemArea){
    if(itemArea.Serial != null){
      this.equipoant = itemArea.Namedevice;
      this.serialant = itemArea.Serial;
      this.estadoant = itemArea.Active;
    }
    this.equipo = equipo;
    this.aplicarActiveBtn(itemArea);
    this.activeBtnEditDelete();

  }

  openInputFile(): void {
    const element = document.getElementById('file-1');
    element.click();
  }
  // -- click buscador --
  touchedSearch(){

    this.noactiveBtnEditDelete();
    const selectores: any = document.getElementsByClassName('indicador');

    for (const ref of selectores){
      ref.classList.remove('active');
    }

  }

 // metodo para cambiar de activar el Boton
  aplicarActiveBtn(link: any){

    const selectores: any = document.getElementsByClassName('indicador');

    for (const ref of selectores){
      ref.classList.remove('active');
    }

    link.classList.add('active');

  }

 // metodo para activar Botones Editar - Eliminar
  activeBtnEditDelete(){

    const btnEdit: any = document.getElementById('btnEdit');
    const btnDelete: any = document.getElementById('btnDelete');

    btnEdit.classList.remove('noactive');
    btnEdit.classList.add('pointer');

    btnDelete.classList.remove('noactive');
    btnDelete.classList.add('pointer');


  }

  noactiveBtnEditDelete(){

    const btnEdit: any = document.getElementById('btnEdit');
    const btnDelete: any = document.getElementById('btnDelete');

    btnEdit.classList.add('noactive');
    btnEdit.classList.remove('pointer');

    btnDelete.classList.add('noactive');
    btnDelete.classList.remove('pointer');

  }

  // ------CRUD--------
  crearEditarEquipo() {
    
    this.noactiveBtnEditDelete();
    let datasheet:string = ''
    let fastguide:string = ''
    let handbook:string = ''
    let invima:string = ''
    let protocol:string = ''

    if (!this.formaRegistroEquipo.invalid) {
      let filtro:any = []
    if(this.pdf.length > 0){
      filtro = this.pdf.filter(e => e.campoNombre == 'datasheet');
      if (filtro.length > 0){
        datasheet  = filtro[0]['base64'].toString()
      }else{
        datasheet  =  this.formaRegistroEquipo.value.datasheet
      }

      filtro = this.pdf.filter(e => e.campoNombre == 'fastguide');
      if (filtro.length > 0){
        fastguide  = filtro[0]['base64'].toString()
      }else{
        fastguide   =  this.formaRegistroEquipo.value.fastguide
      }
      filtro = this.pdf.filter(e => e.campoNombre == 'handbook');
      if (filtro.length > 0){
        handbook  = filtro[0]['base64'].toString()
      }else{
        handbook   =  this.formaRegistroEquipo.value.handbook
      }
      filtro = this.pdf.filter(e => e.campoNombre == 'invima');
      if (filtro.length > 0){
        invima  = filtro[0]['base64'].toString()
      }else{
        invima = this.formaRegistroEquipo.value.invima
      }
      filtro = this.pdf.filter(e => e.campoNombre == 'protocol');
      if (filtro.length > 0){
        protocol  = filtro[0]['base64'].toString()
      }else{
        protocol = this.formaRegistroEquipo.value.protocol
      }
    }
    if (this.tituloAccion === 'Crear') {
      this.loader.show();
      const datos = {
        namedevice:this.formaRegistroEquipo.value.namedevice,
        mark: this.formaRegistroEquipo.value.mark,
        model:  this.formaRegistroEquipo.value.model,
        serial:  this.formaRegistroEquipo.value.serial.replace(/\s/g, "") ,
        datasheet: datasheet,
        fastguide: fastguide,
        handbook:handbook,
        invima: invima,
        protocol: protocol,
        riskclassification: this.formaRegistroEquipo.value.riskclassification,
        active: this.formaRegistroEquipo.value.active
      }
   
      this.EquiposService.create(datos).subscribe(respuesta => {
        this.closeVentana();
        this.accion = "Crear";
        this.toastr.success('Registro creado');

        setTimeout(() => {
          this.loader.hide();

        }, 300);
        const Loguser = {
          fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo:'Mantenimiento y calibradores',
          Submodulo: 'Equipos',
          Item:'',
          metodo:'creación',
          Datos: ('Equipo: ' + datos.namedevice + '| ' + 'Serial: ' +  datos.serial ),
          Respuesta: JSON.stringify(respuesta),
          TipoRespuesta: 200,
          Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }

        this.EquiposService.createLogAsync(Loguser).then(respuesta => {
        
        });

        this.cargarEquipos();

      }, (error:any) => {
        this.toastr.error(this.translate.instant('MODULES.NOTIFICACIONES.ERRORALCREAR'));

        setTimeout(() => {
          this.loader.hide();

        }, 300);
        const Loguser = {
          fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo:'Mantenimiento y calibradores',
          Submodulo: 'Equipos',
          Item:'',
          metodo: 'creación',
          Datos: ('Equipo: ' + datos.namedevice + '| ' + 'Serial: ' +  datos.serial ),
          respuesta: error.message,
          tipoRespuesta: error.status,
          Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
        this.EquiposService.createLogAsync(Loguser).then(respuesta => {
          console.log(respuesta);
        });
      });

    } else {
        if(this.accionEditar){
          this.formaRegistroEquipo.get('serial').enable()
        }
        this.loader.show();
        this.closeVentana();

        const datos = {
          namedevice:this.formaRegistroEquipo.value.namedevice,
          mark: this.formaRegistroEquipo.value.mark,
          model:  this.formaRegistroEquipo.value.model,
          serial:  this.formaRegistroEquipo.value.serial ,
          datasheet:  datasheet ? datasheet : this.formaRegistroEquipo.value.datasheet ,
          fastguide:  fastguide ? fastguide : this.formaRegistroEquipo.value.fastguide ,
          handbook:  handbook ? handbook : this.formaRegistroEquipo.value.handbook ,
          invima:  invima ? invima : this.formaRegistroEquipo.value.invima ,
          protocol: protocol ? protocol : this.formaRegistroEquipo.value.protocol,
          riskclassification: this.formaRegistroEquipo.value.riskclassification,
          active: this.formaRegistroEquipo.value.active,
        }


        this.EquiposService.update(datos, this.formaRegistroEquipo.value.serial).subscribe(respuesta => {
          this.closeVentana();
          const Loguser = {
            fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Mantenimiento y calibradores',
            Submodulo: 'Equipos',
            Item:'',
            Metodo: 'actualización',
            Datos: ('Equipo: ' + datos.namedevice + '| ' + 'Serial: ' +  datos.serial ),
            DatosAnteriores:('Equipo: ' + this.equipoant + '| ' + 'Serial: ' +  this.serialant ),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: 200,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }
          setTimeout(() => {
            this.loader.hide();

          }, 300);
          this.cargarEquipos();
         this.EquiposService.createLogAsync(Loguser).then(respuesta => {
            console.log(respuesta);
          });
          this.cargarEquipos();
          this.toastr.success('Registro actualizado');
        }, (error) => {
   
          const Loguser = {
            fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.datePipe.transform(Date.now(), "shortTime"),
            Modulo:'Mantenimiento y calibradores',
            Submodulo: 'Equipos',
            Item:'',
            Metodo: 'actualización',
            Datos: ('Equipo: ' + datos.namedevice + '| ' + 'Serial: ' +  datos.serial ),
            DatosAnteriores:('Equipo: ' + this.equipoant + '| ' + 'Serial: ' +  this.serialant ),
            respuesta: error.message,
            tipoRespuesta: error.status,
            Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
          }
          setTimeout(() => {
            this.loader.hide();

          }, 300);
          this.cargarEquipos();
          this.EquiposService.createLogAsync(Loguser).then(respuesta => {
            console.log(respuesta);
          });
          this.toastr.error(this.translate.instant('MODULES.NOTIFICACIONES.ERRORALACTUALIZAR'));
        });

      }
    }
  }


  actualizarEstadoEquipo(datosEquipo) {
    const estado = datosEquipo.Active ? false : true;
   
    const datos = {
      namedevice:datosEquipo.Namedevice,
      mark: datosEquipo.Mark,
      model:  datosEquipo.Model,
      //serial:  datosEquipo.serial.replace(/\s/g, "") ,
      serial:  datosEquipo.Serial,
      riskclassification: datosEquipo.Riskclassification,
      active: estado,
    }
    
    this.EquiposService.update(datos, datosEquipo.Serial).subscribe(respuesta => {
    
      const Loguser = {
        fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
        hora: this.datePipe.transform(Date.now(), "shortTime"),
        Modulo:'Mantenimiento y calibradores',
        Submodulo: 'Equipos',
        Item:'',
        Metodo: 'actualización',
        Datos: ('Equipo: ' + datos.namedevice + '| ' + 'Serial: ' +  datos.serial + ' Estado: ' + datos.active),
        DatosAnteriores:('Equipo: ' + datos.namedevice + '| ' + 'Serial: ' +  datos.serial + ' Estado: ' + datos.active ),
        Respuesta: JSON.stringify(respuesta),
        TipoRespuesta: 200,
        Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
      }
      this.EquiposService.createLogAsync(Loguser).then(respuesta => {
      
      });

      this.cargarEquipos();
      this.noactiveBtnEditDelete();

    }, err =>{

      const Loguser = {
        fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
        hora: this.datePipe.transform(Date.now(), "shortTime"),
        Modulo:'Mantenimiento y calibradores',
        Submodulo: 'Equipos',
        Item:'',
        Metodo: 'actualización',
        Datos: ('Equipo: ' + datos.namedevice + '| ' + 'Serial: ' +  datos.serial + ' Estado: ' + datos.active),
        DatosAnteriores:('Equipo: ' + datos.namedevice + '| ' + 'Serial: ' +  datos.serial + ' Estado: ' + datos.active ),
        respuesta: err.message,
        tipoRespuesta: err.status,
        Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
      }
      this.EquiposService.createLogAsync(Loguser).then(respuesta => {
        
      });
    });
  }


  eliminarArea(id: any) {

    this.EquiposService.deletedevice(id).subscribe(respuesta => {
     this.cargarEquipos();
      this.accion = '';
      this.toastr.success('Registro eliminado');
      this.equipo.iddevices = 0
      this.equipo.namedevice = ""
      this.equipo.mark = ""
      this.equipo.model = ""
      this.equipo.serial = ""
      this.equipo.riskclassification = ""
      this.equipo.datasheet = ""
      this.equipo.fastguide = ""
      this.equipo.handbook = ""
      this.equipo.invima = ""
      this.equipo.protocol = ""
      this.equipo.active = false
      this.closeVentana();
      this.noactiveBtnEditDelete();

      const Loguser = {
        fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
        hora: this.datePipe.transform(Date.now(), "shortTime"),
        Modulo:'Mantenimiento y calibradores',
        Submodulo: 'Equipos',
        Item:'',
        metodo: 'creación',
        Datos: ('Equipo: ' + id ),
        Respuesta: JSON.stringify(respuesta),
        TipoRespuesta: 200,
        Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
      }
      this.EquiposService.createLogAsync(Loguser).then(respuesta => {
        console.log(respuesta);
      });
    },
      (err: HttpErrorResponse) => {
        this.toastr.error(this.messageError);

        const Loguser = {
          fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo:'Mantenimiento y calibradores',
          Submodulo: 'Equipos',
          Item:'',
          metodo: 'creación',
          Datos: ('Equipo: ' + id ),
          respuesta: err.message,
          tipoRespuesta: err.status,
          Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
        this.EquiposService.createLogAsync(Loguser).then(respuesta => {
          
        });
      });

}

  //-----------------------
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
   this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  closeVentana(): void {
    this.ventanaModal.hide();
  }
  titulosSwal() {
    this.translate.get('MODULES.SWAL.MESAGEERROR').subscribe(respuesta => this.messageError = respuesta);
  }

}
