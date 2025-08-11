import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { AppConstants } from '@app/Constants/constants';
import Swal from 'sweetalert2';

import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { SharedService } from '@app/services/shared.service';

import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { LicenciamientoService } from '../../../../../services/configuracion/licenciamiento.service';
import { VentanasModalesService } from '@app/services/general/ventanas-modales.service';
import { ImageCdnPipe } from '../../../../core/pipes/image-cdn.pipe';
import { NgIf } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
    selector: 'app-licenciamiento',
    templateUrl: './licenciamiento.component.html',
    styleUrls: ['./licenciamiento.component.css'],
    standalone: true,
    imports: [MatFormFieldModule, MatInputModule, MatTableModule, MatSortModule, NgIf, MatPaginatorModule, FormsModule, ReactiveFormsModule, TranslateModule, ImageCdnPipe]
})

export class LicenciamientoComponent implements OnInit {

  formaRegistroLicencia: FormGroup;
  accionEditar         : any;
  tituloAccion         : any;
  accion               : any;
  vantanaModal         : BsModalRef;
  titulo               : any;
  text                 : any;
  textError            : any;
  cancelar             : any;
  confirmar            : any;
  messageError         : any;

  constructor(private translate: TranslateService, private licenciamientoService: LicenciamientoService, private fb: FormBuilder, private modalService: BsModalService, private toastr: ToastrService,
    private sharedService: SharedService, private ventanaService: VentanasModalesService) { }

  displayedColumns: string[] = ['fechaInicial', 'fechaFinal', 'codActLic', 'cliente', 'modulos', 'active', 'editar', 'borrar'];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  ngOnInit(): void {
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();
  }
  openModal(descripcion) {
    const data = { descripcion: descripcion, accion: this.accion }
    this.ventanaService.openModal(data);
  }

  crearFormularioRegistroLicencia(datos: any) {

    this.formaRegistroLicencia = this.fb.group({

      fechaInicial: [datos.fechaInicial ? datos.fechaInicial : '', [Validators.required]],
      fechaFinal  : [datos.fechaFinal ? datos.fechaFinal : '', [Validators.required]],
      codActLic   : [datos.codActLic ? datos.codActLic : '', [Validators.required]],
      cliente     : [datos.cliente ? datos.cliente : '', [Validators.required]],
      modulos     : [datos.modulos ? datos.modulos : '', [Validators.required]],
      Active      : [datos.active ? datos.active : false],

    });
  }

  // métodos CRUD

  cargarLicencias() {
    this.licenciamientoService.getAll('licenciamiento').subscribe(respuesta => {
      this.dataSource = new MatTableDataSource(respuesta);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  crearEditarLicencia() {
    if (!this.formaRegistroLicencia.invalid) {
      this.closeVentana();
      if (this.accion === 'Crear') {
        this.licenciamientoService.create(this.formaRegistroLicencia.value).subscribe(respuesta => {
          this.cargarLicencias();
      this.closeVentana()

          this.openModal(this.translate.instant('MODULES.LICENCIAMIENTO.LICENCIA_CREADA'));
          //this.toastr.success(AppConstants.SEDE_CREADA);
        });
      } else {
        this.licenciamientoService.update(this.formaRegistroLicencia.value, this.formaRegistroLicencia.value.id).subscribe(respuesta => {
          this.cargarLicencias();
       this.closeVentana()

          this.openModal(this.translate.instant('MODULES.LICENCIAMIENTO.LICENCIA_ACTUALIZADA'));
          //this.toastr.success(AppConstants.SEDE_ACTUALIZADA);
        });
      }
    }
  }

  eliminarLicencia(idLicencia) {
    Swal.fire({
      title: `${this.titulo}`,
      text: `${this.text}`,
      icon: 'question',
      confirmButtonText: `${this.confirmar}`,
      cancelButtonText: `${this.cancelar}`,
      showConfirmButton: true,
      confirmButtonColor: `${AppConstants.CONFIMRBUTTONCOLOR}`,
      showCancelButton: true,
      cancelButtonColor: `${AppConstants.CANCELBUTTONCOLOR}`,
    }).then(respuesta => {
      if (respuesta.value) {
        this.licenciamientoService.delete('licenciamiento', idLicencia).subscribe(respuesta => {
          this.cargarLicencias();
       this.closeVentana()
          this.openModal(this.translate.instant('MODULES.LICENCIAMIENTO.LICENCIA_ELIMINADA'));
          //this.toastr.success(AppConstants.SEDE_ELIMINADA);
        },
          (err: HttpErrorResponse) => {

            this.sharedService.showLoader(false);
            Swal.fire({
              title: `${this.textError}`,
              text: `${this.messageError}`,
              icon: 'error',
              confirmButtonText: `${this.cancelar}`,
              confirmButtonColor: `${AppConstants.CONFIMRBUTTONCOLOR}`,
            });
          });
      }
    });
  }

  actualizarEstadoLicencia(event, datosLicencia) {

    const estado = datosLicencia.active ? false : true;
    const datos = { /* id: datosLicencia.id, idcity: datosLicencia.idcity, codheadquarters: datosLicencia.codheadquarters, desheadquarters: datosLicencia.desheadquarters, email: datosLicencia.email, address: datosLicencia.address, telephone: datosLicencia.telephone, numeration: datosLicencia.numeration, active: estado */ }

    this.licenciamientoService.update(datos, datosLicencia.id).subscribe(respuesta => {
      this.cargarLicencias();
      this.closeVentana()
      this.accion = 'Editar';
      this.openModal(this.translate.instant('MODULES.LICENCIAMIENTO.LICENCIA_ACTUALIZADA'));
      //this.toastr.success(AppConstants.ESTADO_ACTUALIZADO);
    });

  }

  // fin métodos CRUD

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openModalRegistroLicencia(templateRegistroLicencia: TemplateRef<any>, datos: any) {
    this.crearFormularioRegistroLicencia(datos);

    this.vantanaModal = this.modalService.show(templateRegistroLicencia,{backdrop: 'static', keyboard: false });
    datos ? this.accionEditar = true : this.accionEditar = false;
    datos ? this.accion = "Editar" : this.accion = "Crear";
    datos ? this.translate.get('MODULES.LICENCIAMIENTO.FORMULARIO.ACTUALIZAR').subscribe(respuesta => this.tituloAccion = respuesta) : this.translate.get('MODULES.LICENCIAMIENTO.FORMULARIO.REGISTRAR').subscribe(respuesta => this.tituloAccion = respuesta);
    // this.modalRef.setClass('modal-lg');
  }

  titulosSwal() {
    this.translate.get('MODULES.SWAL.TITULO').subscribe(respuesta => this.titulo = respuesta);
    this.translate.get('MODULES.SWAL.TEXT').subscribe(respuesta => this.text = respuesta);
    this.translate.get('MODULES.SWAL.CANCEL').subscribe(respuesta => this.cancelar = respuesta);
    this.translate.get('MODULES.SWAL.CONFIRM').subscribe(respuesta => this.confirmar = respuesta);
    this.translate.get('MODULES.SWAL.TEXTERROR').subscribe(respuesta => this.textError = respuesta);
    this.translate.get('MODULES.SWAL.MESAGEERROR').subscribe(respuesta => this.messageError = respuesta);
  }

  closeVentana(): void {
    this.vantanaModal.hide();
  }

}
