import { Routes } from '@angular/router';
import { IndicadoresReportesComponent } from './pages/indicadores-reportes/indicadores-reportes.component';
export const calidadInternoRoutes: Routes = [
    { 
        path: 'configuracion',
        loadChildren: () => import('./pages/configuracion/configuracion-interno.routes').then(m => m.configuracionInternoRoutes) 
    },
    { 
        path: 'administracion',
        loadChildren: () => import('./pages/administracion/administracion-interno.routes').then(m => m.administracionInternoRoutes)
    },
    { 
        path: 'ingreso-datos', 
        loadChildren: () => import('./pages/ingreso/ingreso-interno.routes').then(m => m.ingresoInternoRoutes) 
    },
    { 
        path: 'reportes/indicadores-reportes', 
        component: IndicadoresReportesComponent, 
        data: {titulo: 'Indicadores y Reportes'}
    },

];