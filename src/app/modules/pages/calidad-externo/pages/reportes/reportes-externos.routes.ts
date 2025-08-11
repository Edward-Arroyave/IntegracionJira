import { Routes } from '@angular/router';
import { ReporteDesempenioCualitativoClienteComponent } from './reporte-desempenio-cualitativo-cliente/reporte-desempenio-cualitativo-cliente.component';
import { ReporteDesempenoCualitativoComponent } from './reporte-desempeno-cualitativo/reporte-desempeno-cualitativo.component';
import { ReporteSemicuantitativoComponent } from './reporte-semicuantitativo/reporte-semicuantitativo.component';
import { ReporteICTEmisorComponent } from './reporte-ict-emisor/reporte-ict-emisor.component';
import { ReporteCuantitativoComponent } from './reporte-cuantitativo/reporte-cuantitativo.component';
import { ReporteSemicuantitativoClienteComponent } from './reporte-semicuantitativo-cliente/reporte-semicuantitativo-cliente.component';
import { IndicadorReportesComponent} from './indicador-reportes/indicador-reportes.component';
import { ReporteItcCOPYComponent } from './reporte-itc-copy/reporte-itc-copy.component';
import { ReportesDesempenioCualitativoClienteCopyComponent } from './reporte-desempenio-cualitativo-cliente-copy/reportes-desempenio-cualitativo-cliente-copy.component';
import { DescargaReportesComponent } from './descarga-reportes/descarga-reportes.component';

export const reportesExternoRoutes: Routes = [

    { path: 'indicadores-reportes', component: IndicadorReportesComponent },
    { path: 'desempenio-cualitativo', component:ReporteDesempenoCualitativoComponent },
    { path: 'desempenio-cualitativo-copy', component:ReportesDesempenioCualitativoClienteCopyComponent },
    { path: 'desempenio-cualitativo-cliente', component:ReporteDesempenioCualitativoClienteComponent },
    { path: 'reporte-cualitativo', component: ReporteDesempenoCualitativoComponent },
    { path: 'reporte-semicuantitativo', component:ReporteSemicuantitativoComponent },
    { path: 'reporte-ict-emisor', component: ReporteItcCOPYComponent },
    { path: 'reporte-cuantitativo', component: ReporteCuantitativoComponent},
    // Clientes
    { path: 'reporte-semicuantitativo-cliente', component:ReporteSemicuantitativoClienteComponent },
    { path: 'reporte-cuantitativo-cliente', component: ReporteCuantitativoComponent},
    { path: 'reporte-cualitativo-cliente', component: ReporteDesempenioCualitativoClienteComponent },
    { path: 'descarga-reportes', component: DescargaReportesComponent}

];
