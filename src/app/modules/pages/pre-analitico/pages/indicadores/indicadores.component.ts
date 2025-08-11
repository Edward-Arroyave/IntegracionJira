import { Component, OnInit } from '@angular/core';
import { ImageCdnPipe } from '../../../../core/pipes/image-cdn.pipe';
import { SatisfaccionDeMuestrasComponent } from './satisfaccion-de-muestras/satisfaccion-de-muestras.component';
import { AceptabilidadMuestrasLabComponent } from './aceptabilidad-muestras-lab/aceptabilidad-muestras-lab.component';
import { PrecisionIdentPacienteComponent } from './precision-ident-paciente/precision-ident-paciente.component';
import { NgClass, NgIf } from '@angular/common';

@Component({
    selector: 'app-indicadores',
    templateUrl: './indicadores.component.html',
    styleUrls: ['./indicadores.component.css'],
    standalone: true,
    imports: [NgClass, NgIf, PrecisionIdentPacienteComponent, AceptabilidadMuestrasLabComponent, SatisfaccionDeMuestrasComponent, ImageCdnPipe]
})
export class IndicadoresComponent {

  tipoReporte: number = 1;
  tituloInd: string = '';

  constructor() { }

  
  selectedIndicador(itemIndicador: Document, pElement: HTMLHRElement, tipo: number){
    this.tipoReporte = tipo;
    this.tituloInd = pElement.innerText;    
  }
}
