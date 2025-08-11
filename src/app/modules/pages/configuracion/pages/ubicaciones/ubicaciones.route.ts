import { Routes } from '@angular/router';
import { PaisesComponent } from './paises/paises.component';
import { DepartamentosComponent } from './departamentos/departamentos.component';
import { CiudadesComponent } from './ciudades/ciudades.component';
import { SedesComponent } from './sedes/sedes.component';

export const ubicacionesRoutes: Routes = [
    { path: 'paises', component: PaisesComponent, data: {titulo: 'Países'}},
    { path: 'departamentos', component: DepartamentosComponent, data: {titulo: 'Departamentos'}},
    { path: 'ciudades', component: CiudadesComponent, data: {titulo: 'Ciudades'}},
    { path: 'sedes', component: SedesComponent, data: {titulo: 'Sedes'}},
];