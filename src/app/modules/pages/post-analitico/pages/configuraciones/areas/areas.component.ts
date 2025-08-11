import { Component, OnInit, TemplateRef } from '@angular/core';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { MatTableDataSource } from '@angular/material/table';
import { DatePipe, NgIf, NgFor, NgClass, TitleCasePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AreasService } from '@app/services/post-analitico/areas.service';
import { ImageCdnPipe } from '../../../../../core/pipes/image-cdn.pipe';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';


// ---------Interfaces----------------
interface Area{

  idarea: number;
  desarea: string;
  active: boolean;

}

@Component({
    selector: 'app-areas',
    templateUrl: './areas.component.html',
    styleUrls: ['./areas.component.css'],
    standalone: true,
    imports: [MatFormFieldModule, MatInputModule, NgIf, NgFor, MatSlideToggleModule, FormsModule, ReactiveFormsModule, NgClass, TitleCasePipe, TranslateModule, ImageCdnPipe]
})
export class AreasComponent implements OnInit {

  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();

  area: Area;
  accionEditar: any;
  tituloAccion: any;
  accion: any;
  image: string;
  ventanaModal: BsModalRef;
  formaRegistroArea: FormGroup;
  desactivar = false;
  messageError: string;

  dataSource: MatTableDataSource<any>;

  //------------------

  constructor(
    private fb: FormBuilder,
    private modalService: BsModalService,
    private translate: TranslateService,
    private toastr: ToastrService,
    private datePipe: DatePipe,
    private postAreasService : AreasService
  ) { }

  ngOnInit(): void {

    this.cargarAreas();
  }

  cargarAreas() {
    this.postAreasService.getObtenerTodos().then(respuesta => {
      let respArr = [];
     if (respuesta) {
      respuesta.forEach(item => {
        if(item.idarea !== 1){
          respArr.push(item);
        }
      });
      console.log('Areas prueba: ', respArr);

      this.dataSource = new MatTableDataSource(respArr);
      console.log('Areas: ', this.dataSource);

      // this.dataSource.paginator = this.paginator;
      // this.dataSource.sort = this.sort;
     }
    });
  }


  openModalRegistroArea(templateRegistroArea: TemplateRef<any>, datos: any) {
    console.log(datos);
    this.crearFormularioRegistroArea(datos);
    this.ventanaModal = this.modalService.show(templateRegistroArea ,{backdrop: 'static', keyboard: false });
    this.ventanaModal.setClass('modal-md');
    this.accionEditar = !!datos;
    datos ? this.translate.get('MODULES.ANALITOSQCE.FORMULARIO.ACTUALIZAR').subscribe(respuesta => this.tituloAccion = respuesta) : this.translate.get('MODULES.ANALITOSQCE.FORMULARIO.REGISTRAR').subscribe(respuesta => this.tituloAccion = respuesta);

 }
  openModalEliminarArea(templateEliminarArea: TemplateRef<any>) {
    if (this.area.idarea > 0){
      this.ventanaModal = this.modalService.show(templateEliminarArea ,{backdrop: 'static', keyboard: false });
      this.ventanaModal.setClass('modal-md');
      this.translate.get('ELIMINAR').subscribe(respuesta => this.tituloAccion = respuesta);
    }

  }


  get desNoValido() {
    return this.formaRegistroArea.get('desarea');
  }

 crearFormularioRegistroArea(datos: any) {
    this.formaRegistroArea = this.fb.group({

      idarea: [datos.idarea ? datos.idarea : ''],
      desarea: [datos.desarea ? datos.desarea : '', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      active: [datos.active ? datos.active : false],

    });
  }


  // -----Selección del Item Area-----------
  selectedArea(area: Area, itemArea){

    this.area = area;

    console.log('Area: ', this.area);

    this.aplicarActiveBtn(itemArea);
    this.activeBtnEditDelete();


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
  crearEditarArea() {

    this.closeVentana();
    this.noactiveBtnEditDelete();

    if (!this.formaRegistroArea.invalid) {
      if (this.tituloAccion === 'Crear') {

        this.desactivar = true;
        this.closeVentana();

        this.postAreasService.create(this.formaRegistroArea.value).subscribe(respuesta => {

         this.cargarAreas();
          this.accion = "Crear";
          this.toastr.success('Registro creado');
          this.desactivar = false;

          this.area.idarea = 0
          this.area.desarea = ""
          this.area.active = false


          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            Hora: this.dateNowISO,
            Metodo: 'actualización',
            Datos: JSON.stringify(this.formaRegistroArea.value),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: status
          }

          console.log(Loguser);

          this.postAreasService.createLogAsync(Loguser).then(respuesta => {
            console.log(respuesta);
          });
        }, (error:any) => {
          this.toastr.error(this.translate.instant('MODULES.NOTIFICACIONES.ERRORALCREAR'));

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            Hora: this.dateNowISO,
            Metodo: 'actualización',
            Datos: JSON.stringify(this.formaRegistroArea.value),
            Respuesta:   error.status,
            TipoRespuesta: status
          }
          console.log(Loguser);
          this.postAreasService.createLogAsync(Loguser).then(respuesta => {
            console.log(respuesta);
          });
        });

      } else {
        this.postAreasService.update(this.formaRegistroArea.value, this.formaRegistroArea.value.idarea).subscribe(respuesta => {
          this.closeVentana();


          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            Hora: this.dateNowISO,
            Metodo:'actualización',
            Datos: JSON.stringify(this.formaRegistroArea.value),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: status
          }

          console.log(Loguser);

          this.postAreasService.createLogAsync(Loguser).then(respuesta => {
            console.log(respuesta);
          });
        this.cargarAreas();
          this.toastr.success('Registro actualizado');
        }, (error) => {

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            Hora: this.dateNowISO,
            Metodo: 'actualización',
            Datos: JSON.stringify(this.formaRegistroArea.value),
            Respuesta:   error.status,
            TipoRespuesta: status
          }
          console.log(Loguser);
          this.postAreasService.createLogAsync(Loguser).then(respuesta => {
            console.log(respuesta);
          });
          this.toastr.error(this.translate.instant('MODULES.NOTIFICACIONES.ERRORALACTUALIZAR'));
        });

      }
    }
  }


  actualizarEstadoArea(datosArea) {
    const estado = datosArea.active ? false : true;

    const datos = { idarea: datosArea.idarea, desarea: datosArea.desarea, active: estado };
    this.postAreasService.update(datos, datosArea.idarea).subscribe(respuesta => {

      const Loguser = {
        Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
        Hora: this.dateNowISO,
        Metodo: 'actualización',
        Datos: JSON.stringify(this.formaRegistroArea.value),
        Respuesta: JSON.stringify(respuesta),
        TipoRespuesta: status
      }

      console.log(Loguser);

      this.postAreasService.createLogAsync(Loguser).then(respuesta => {
        console.log(respuesta);
      });

    this.cargarAreas();
    this.noactiveBtnEditDelete();

    }, err =>{

      const Loguser = {
        Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
        Hora: this.dateNowISO,
        Metodo: 'actualización',
        Datos: JSON.stringify(this.formaRegistroArea.value),
        Respuesta:   err.status,
        TipoRespuesta: status
      }
      console.log(Loguser);
      this.postAreasService.createLogAsync(Loguser).then(respuesta => {
        console.log(respuesta);
      });
    });
  }


  eliminarArea(id: any) {

    this.postAreasService.delete('pre', id).subscribe(respuesta => {
      this.cargarAreas();
      this.accion = '';
      this.toastr.success('Registro eliminado');
      this.area.idarea = 0
      this.area.desarea = ""
      this.area.active = false
      this.closeVentana();
      this.noactiveBtnEditDelete();
    },
      (err: HttpErrorResponse) => {
        this.toastr.error(this.messageError);
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
