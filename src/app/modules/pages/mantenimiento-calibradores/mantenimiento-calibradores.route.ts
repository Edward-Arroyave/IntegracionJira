import { Routes } from '@angular/router';
import { EquiposComponent } from './pages/equipos/equipos.component';
import { MantenimientoCorrectivosComponent } from './pages/mantenimiento-correctivos/mantenimiento-correctivos.component';
import { MantenimientoPreventivoComponent } from './pages/mantenimiento-preventivo/mantenimiento-preventivo.component';
import { TrazabilidadComponent } from './pages/trazabilidad/trazabilidad.component';

export const mantenimientoRoutes: Routes = [
    {path:'equipos', component: EquiposComponent},
    {path:'mantenimiento-correctivo', component: MantenimientoCorrectivosComponent},
    {path:'mantenimiento-preventivo', component: MantenimientoPreventivoComponent},
    {path:'trazabilidad', component: TrazabilidadComponent},
];