import { Routes } from '@angular/router';
import { PosindicadoresComponent } from './pages/posindicadores/posindicadores.component';
import { ReportesPostComponent } from './pages/reportes/reportes-post.component';


export const postAnaliticoRoutes: Routes = [
    { path: 'configuracion', 
        loadChildren:() => import('./pages/configuraciones/configuracion-postanalitico.routes').then(r => r.configuracionPostAnaliticoRoutes)
    },
    {path:'config-indicadores', component: PosindicadoresComponent},
    {path:'reportes', component: ReportesPostComponent}, 
];