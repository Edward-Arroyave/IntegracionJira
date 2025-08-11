import { Routes } from '@angular/router';
import { IndicadoresConfgComponent } from './indicadores/indicadores-confg.component';
import { AreaConfgComponent } from './areas/area-confg.component';

export const configuracionPreAnaliticoRoutes: Routes = [
    { path: 'areas', component: AreaConfgComponent},
    { path: 'indicadores-config', component: IndicadoresConfgComponent},
];