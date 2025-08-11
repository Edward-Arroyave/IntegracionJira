import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { InicioComponent } from './inicio/inicio.component';
import { LicenciamientoComponent } from './configuracion/pages/licenciamiento/licenciamiento.component';


export const pagesRoutes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children:
      [

        { path: 'inicio', component: InicioComponent, data: {titulo: 'Inicio'}},
        { path: 'licenciamiento', component: LicenciamientoComponent },     
        { 
          path: 'configuracion', 
          loadChildren: () => import('./configuracion/configuracion.route').then(m => m.configuracionRoutes)
        },
        { 
          path: 'calidad-interno', 
          loadChildren: () => import('./calidad-interno/calidad-interno.route').then(m => m.calidadInternoRoutes)
        },
        { 
          path: 'calidad-externo', 
          loadChildren: () => import('./calidad-externo/calidad-externo.route').then(m => m.calidadExternoRoutes) },
        { 
          path: 'preanalitico', 
          loadChildren: () => import('./pre-analitico/pre-analitico.route').then(m => m.preAnaliticoRoutes)
        },
        { 
          path: 'postanalitico', 
          loadChildren: () => import('./post-analitico/post-analitico.route').then(m => m.postAnaliticoRoutes)
        },
        {
          path:'mantenimiento-calibradores', 
          loadChildren: () => import('./mantenimiento-calibradores/mantenimiento-calibradores.route').then(m => m.mantenimientoRoutes)
        },

        { path: '**', redirectTo: 'inicio', pathMatch: 'full' },
      ]
  }
];