import { Component, OnInit, TemplateRef } from '@angular/core';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { MatTableDataSource } from '@angular/material/table';
import { DatePipe, NgIf, NgFor, NgClass, TitleCasePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PreAreasService } from '../../../../../../services/pre-analitico/pre-areas.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ImageCdnPipe } from '../../../../../core/pipes/image-cdn.pipe';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';



// ---------Interfaces----------------
interface Area {

  idarea: number;
  desarea: string;
  active: boolean;

}

@Component({
  selector: 'app-area-confg',
  templateUrl: './area-confg.component.html',
  styleUrls: ['./area-confg.component.css'],
  providers: [DatePipe],
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    NgIf,
    NgFor,
    MatSlideToggleModule,
    FormsModule,
    ReactiveFormsModule,
    NgClass,
    TitleCasePipe,
    TranslateModule,
    ImageCdnPipe,
  ],
})
export class AreaConfgComponent implements OnInit {

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
    private preAreasService: PreAreasService,
    private modalService: BsModalService,
    private translate: TranslateService,
    private toastr: ToastrService,
    private datePipe: DatePipe,
  ) { }

  ngOnInit(): void {

    this.cargarAreas();
  }

  cargarAreas() {
    this.preAreasService.getAllAsync().then(respuesta => {

      let respArr = [];

      if (respuesta) {

        respuesta.forEach(item => {
          if (item.idarea !== 1) {
            respArr.push(item);
          }

        });



        this.dataSource = new MatTableDataSource(respArr);
        console.log('Areas: ', this.dataSource);

        // this.dataSource.paginator = this.paginator;
        // this.dataSource.sort = this.sort;
      }

    });
  }


  openModalRegistroArea(templateRegistroArea: TemplateRef<any>, datos: any) {
    this.crearFormularioRegistroArea(datos);
    this.ventanaModal = this.modalService.show(templateRegistroArea, { backdrop: 'static', keyboard: false });
    this.ventanaModal.setClass('modal-md');
    this.accionEditar = !!datos;
    datos ? this.translate.get('MODULES.ANALITOSQCE.FORMULARIO.ACTUALIZAR').subscribe(respuesta => this.tituloAccion = respuesta) : this.translate.get('MODULES.ANALITOSQCE.FORMULARIO.REGISTRAR').subscribe(respuesta => this.tituloAccion = respuesta);
  }
  openModalEliminarArea(templateEliminarArea: TemplateRef<any>, datos: any) {
    this.crearFormularioRegistroArea(datos);
    this.ventanaModal = this.modalService.show(templateEliminarArea, { backdrop: 'static', keyboard: false });
    this.ventanaModal.setClass('modal-md');
    this.translate.get('ELIMINAR').subscribe(respuesta => this.tituloAccion = respuesta);
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

  crearFormularioRegistroArea2(datos: any) {
    this.formaRegistroArea = this.fb.group({
      idarea: [datos.idarea ? datos.idarea : '', [Validators.required]]
    });
  }


  // -----Selección del Item Area-----------
  selectedArea(area: Area, itemArea) {

    this.area = area;

    console.log('Area: ', this.area);

    this.aplicarActiveBtn(itemArea);
    this.activeBtnEditDelete();


  }

  // -- click buscador --
  touchedSearch() {

    //this.noactiveBtnEditDelete();
    const selectores: any = document.getElementsByClassName('indicador');

    for (const ref of selectores) {
      ref.classList.remove('active');
    }

  }

  // metodo para cambiar de activar el Boton
  aplicarActiveBtn(link: any) {

    const selectores: any = document.getElementsByClassName('indicador');

    for (const ref of selectores) {
      ref.classList.remove('active');
    }

    link.classList.add('active');

  }

  // metodo para activar Botones Editar - Eliminar
  activeBtnEditDelete() {

    const elementosNoActivos = document.querySelectorAll('.noactive');
    elementosNoActivos.forEach((element: any) => {
      element.classList.remove('noactive');
    });
  }

  noactiveBtnEditDelete() {

    const btnEdit: any = document.getElementById('btnEdit');
    const btnDelete: any = document.getElementById('btnDelete');

    btnEdit.classList.add('noactive');
    btnEdit.classList.remove('pointer');

    btnDelete.classList.add('noactive');
    btnDelete.classList.remove('pointer');


  }

  // ------CRUD--------
  crearEditarArea() {

    //this.closeVentana();
    //this.noactiveBtnEditDelete();

    if (!this.formaRegistroArea.invalid) {
      if (this.tituloAccion === 'Crear') {

        this.desactivar = true;
        this.closeVentana();

        this.preAreasService.create(this.formaRegistroArea.value).subscribe(respuesta => {

          this.cargarAreas();
          this.accion = "Crear";
          this.toastr.success('Registro creado');
          this.desactivar = false;

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            Hora: this.dateNowISO,
            Metodo: 'creación',
            Datos: JSON.stringify(this.formaRegistroArea.value),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: status
          }


          this.preAreasService.createLogAsync(Loguser).then(respuesta => { });

        }, (error) => {


          const Loguser = {
            fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.dateNowISO,
            metodo: 'creación',
            datos: JSON.stringify(this.formaRegistroArea.value),
            respuesta: error.message,
            tipoRespuesta: error.status
          }
          this.preAreasService.createLogAsync(Loguser).then(respuesta => { });

        });

      } else {
        this.preAreasService.update(this.formaRegistroArea.value, this.formaRegistroArea.value.idarea).subscribe(respuesta => {

          this.cargarAreas();
          this.toastr.success('Registro actualizado');

          const Loguser = {
            Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            Hora: this.dateNowISO,
            Metodo: 'actualización',
            Datos: JSON.stringify(this.formaRegistroArea.value),
            Respuesta: JSON.stringify(respuesta),
            TipoRespuesta: status
          }




        }, (error) => {

          const Loguser = {
            fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
            hora: this.dateNowISO,
            metodo: 'actualización',
            datos: JSON.stringify(this.formaRegistroArea.value),
            respuesta: error.message,
            tipoRespuesta: error.status
          }

          this.preAreasService.createLogAsync(Loguser).then(respuesta => { });

        });

      }
    }
    else {
      this.toastr.error("El campo nombre de área es obligatorio.");
    }
  }


  async actualizarEstadoArea(datosArea) {

    try {
      const estado = datosArea.active ? false : true;

      const datos = { idarea: datosArea.idarea, desarea: datosArea.desarea, active: estado };
      let respuesta = await this.preAreasService.update(datos, datosArea.idarea).toPromise();
      this.toastr.success('Estado actualizado', 'Actualización')

      this.cargarAreas();

    } catch (error) {
      this.toastr.error('No fue posible actualizar el estado', 'Error')
    }

  }


  eliminarArea(id: any) {

    this.preAreasService.delete('pre', id).subscribe(respuesta => {
      this.area = null;
      this.cargarAreas();
      this.accion = '';
      this.toastr.success('Registro eliminado');

      this.closeVentana();
      //this.noactiveBtnEditDelete();

      const Loguser = {
        fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
        hora: this.dateNowISO,
        metodo: 'eliminación',
        datos: JSON.stringify(id),
        respuesta: JSON.stringify(respuesta),
        tipoRespuesta: status
      }
      this.preAreasService.createLogAsync(Loguser).then(respuesta => {
        console.log(respuesta);
      });

    },
      (err: HttpErrorResponse) => {
        this.toastr.error("No se permite la eliminación, ya que el área se encuentra relacionada a otra información");
        const Loguser = {
          fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.dateNowISO,
          metodo:'eliminación',
          datos: JSON.stringify(id),
          respuesta: err.message,
          tipoRespuesta: err.status
        }
        this.preAreasService.createLogAsync(Loguser).then(respuesta => {
          console.log(respuesta);
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


} // end class
