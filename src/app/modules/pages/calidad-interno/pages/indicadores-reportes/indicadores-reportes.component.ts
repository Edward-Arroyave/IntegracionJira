import { Component, OnInit } from '@angular/core';
import { ImageCdnPipe } from '../../../../core/pipes/image-cdn.pipe';
import { ReporteAnalitoCualitativoComponent } from './reporte-analito-cualitativo/reporte-analito-cualitativo.component';
import { ReporteAnalitosAlertaComponent } from './reporte-analitos-alerta/reporte-analitos-alerta.component';
import { ReporteConsolidadoICTComponent } from './reporte-consolidado-ict/reporte-consolidado-ict.component';
import { IndicadoresCompetenciaTecnicaComponent } from './indicadores-competencia-tecnica/indicadores-competencia-tecnica.component';
import { NgClass, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'app-indicadores-reportes',
    templateUrl: './indicadores-reportes.component.html',
    styleUrls: ['./indicadores-reportes.component.css'],
    standalone: true,
    imports: [FormsModule,
       NgClass,
       NgIf,
       IndicadoresCompetenciaTecnicaComponent,
       ReporteConsolidadoICTComponent,
       ReporteAnalitosAlertaComponent,
       ReporteAnalitoCualitativoComponent,
      ]
})
export class IndicadoresReportesComponent implements OnInit {

  loader = false;
  hideElemts = false;
  radioSelect = 1

  constructor(
    private matIconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer,
  ) { 
    this.matIconRegistry.addSvgIcon("table_line",this.sanitizer.bypassSecurityTrustResourceUrl("../assets/rutas/iconos/concordancia.svg"));
    this.matIconRegistry.addSvgIcon("score",this.sanitizer.bypassSecurityTrustResourceUrl("../assets/rutas/iconos/zscore.svg"));

    this.matIconRegistry.addSvgIcon("page_bar",this.sanitizer.bypassSecurityTrustResourceUrl("../assets/rutas/iconos/page_bar.svg"));
    this.matIconRegistry.addSvgIcon("tubes",this.sanitizer.bypassSecurityTrustResourceUrl("../assets/rutas/iconos/tubes.svg"));
  }

  ngOnInit(): void {
  }

}
