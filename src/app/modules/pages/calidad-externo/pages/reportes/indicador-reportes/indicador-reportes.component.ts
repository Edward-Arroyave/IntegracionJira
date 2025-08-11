import { Component } from '@angular/core';
import { ImageCdnPipe } from '../../../../../core/pipes/image-cdn.pipe';
import { TranslateModule } from '@ngx-translate/core';

import { NgClass, NgIf } from '@angular/common';
import { ReporteClienteCualitativoComponent } from '../reporte-cliente-cualitativo/reporte-cliente-cualitativo.component';
import { ReporteResultadoParticipantesComponent } from '../reporte-resultado-participantes/reporte-resultado-participantes.component';

@Component({
    selector: 'app-indicador-reportes',
    templateUrl: './indicador-reportes.component.html',
    styleUrls: ['./indicador-reportes.component.css'],
    standalone: true,
    imports: [NgClass, NgIf, ReporteResultadoParticipantesComponent, ReporteClienteCualitativoComponent, TranslateModule, ImageCdnPipe]
})

export class IndicadorReportesComponent {

  tipoReporte: number = 1;

  constructor() { }

  tipo(tipo: number){

    this.tipoReporte = tipo;

  }

}
