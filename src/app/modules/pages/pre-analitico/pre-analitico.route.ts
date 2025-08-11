import { Routes } from '@angular/router';
import { IndicadoresComponent } from './pages/indicadores/indicadores.component';
import { ReportesPreComponent } from './pages/reportes/reportes-pre.component';

export const preAnaliticoRoutes: Routes = [
    { path: 'configuracion', 
        loadChildren:() => import('./pages/configuraciones/configuracion-preanalitico.routes').then(r => r.configuracionPreAnaliticoRoutes)
    },
    { path: 'indicadores', component: IndicadoresComponent},
    { path: 'reportes', component: ReportesPreComponent},
];