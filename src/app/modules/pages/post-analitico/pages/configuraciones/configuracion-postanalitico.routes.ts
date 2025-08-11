import { Routes } from '@angular/router';
import { AreasComponent } from './areas/areas.component';
import { PostIndicadoresComponent } from './post-indicadores/post-indicadores.component';

export const configuracionPostAnaliticoRoutes: Routes = [
    {path:'areas', component: AreasComponent},
    {path:'indicadores', component: PostIndicadoresComponent},
];