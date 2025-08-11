import { Component, OnInit, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { dataModal, VentanasModalesService } from '../../../services/general/ventanas-modales.service';
import { Router } from '@angular/router';
import { ImageCdnPipe } from '../../core/pipes/image-cdn.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-ventanas-modales',
    templateUrl: './ventanas-modales.component.html',
    styleUrls: ['./ventanas-modales.component.css'],
    standalone: true,
    imports: [NgIf, TranslateModule, ImageCdnPipe]
})
export class VentanasModalesComponent implements OnInit {
  vantanaModal: BsModalRef;

  titulo: string;
  descripcion: string;
  accion: string;

  @ViewChild('templateModal', { static: true }) templateModal: any;

  constructor(private modalService: BsModalService, private ventanaService: VentanasModalesService, private router: Router) { }

  ngOnInit(): void {
    this.subscribes();
  }

  out(){

    this.closeVentana();
    localStorage.clear();
    sessionStorage.clear();
    this.router.navigate(['/']);

  }

  private subscribes() {
    this.ventanaService.instanceModal$.subscribe(async (data: dataModal) => {
      if (data.state) {

        const {descripcion, accion } = data.data;
        this.descripcion = descripcion;
        this.accion = accion;
        this.vantanaModal = this.modalService.show(this.templateModal,{ class: 'modal-sm',backdrop: 'static', keyboard: false });
         await this.Rediriguir()

      } else {
        this.vantanaModal?.hide();
      }
    });
  }
  Rediriguir(){
    localStorage.clear();
    sessionStorage.clear();
    this.router.navigate(['/']);
  }

  closeVentana(): void {
    this.vantanaModal.hide();
  }




}
