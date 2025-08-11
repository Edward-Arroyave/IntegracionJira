import { Routes } from '@angular/router';
import { ProgramasComponent } from './programas/programas.component';
import { MuestrasComponent } from './muestras/muestras.component';
import { AsignacionProgramasComponent } from './asignacion-programas/asignacion-programas.component';
import { AsignacionValorEsperadoComponent } from './asignacion-valor-esperado/asignacion-valor-esperado.component';
import { AsignacionValorEsperadoCualitativoComponent } from './asignacion-valor-esperado-cualitativo/asignacion-valor-esperado-cualitativo.component';
import { AsignacionValorEsperado2Component } from './asignacion-valor-esperado-2/asignacion-valor-esperado-2.component';
import { RondasComponent } from './rondas/rondas.component';
import { ConsolidadoResultadosComponent } from './consolidado-resultados/consolidado-resultados.component';
import { ConfiguracionEstadisticasComponent } from './configuracion-estadistica/configuracion-estadisticas.component';
import { FiltroGrubbsComponent } from './filtro-grubbs/filtro-grubbs.component';
import { EstadisticaGeneralSemicuantitativaComponent } from './estadistica-general-semicuantitativa/estadistica-general-semicuantitativa.component';

export const administracionExternoRoutes: Routes = [
    { path: 'programa', component: ProgramasComponent, },
    { path: 'muestras', component: MuestrasComponent, },
    { path: 'asignacion-programas', component: AsignacionProgramasComponent },
    { path: 'asignacion-valores', component: AsignacionValorEsperadoComponent },
    { path: 'asignacion-valores-cualitativos', component: AsignacionValorEsperadoCualitativoComponent },
    { path: 'asignacion-valores-2', component: AsignacionValorEsperado2Component },
    { path: 'rondas', component: RondasComponent },
    { path: 'consolidado-resultados', component: ConsolidadoResultadosComponent },
    { path: 'configuracion-estadistica', component: ConfiguracionEstadisticasComponent },
    { path: 'filtros-grubbs', component: FiltroGrubbsComponent },
    { path: 'estadistica-general-semicuantitativa', component: EstadisticaGeneralSemicuantitativaComponent },
];
