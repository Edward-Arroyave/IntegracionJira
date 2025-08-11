import { Routes } from '@angular/router';

import { IngresoDatosExternoComponent } from './pages/ingreso-datos-externo/ingreso-datos-externo.component';

export const calidadExternoRoutes: Routes = [

    {
        path: 'configuracion', 
        loadChildren: () => import('./pages/configuracion/configuracion-externo.routes').then(m => m.configuracionExternoRoutes) 
    },
    {
        path: 'administracion', 
        loadChildren: () => import('./pages/administracion/administracion-externo.routes').then(m => m.administracionExternoRoutes) 
    },
    { 
        path: 'reportes',
        loadChildren: () => import('./pages/reportes/reportes-externos.routes').then(m => m.reportesExternoRoutes)  
    },
    { 
        path: 'ingreso-datos', 
        component: IngresoDatosExternoComponent 
    }
];