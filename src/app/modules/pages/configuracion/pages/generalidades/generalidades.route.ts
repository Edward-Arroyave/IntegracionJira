import { Routes } from '@angular/router';
import { ParametrosGlobalesComponent } from './parametros-globales/parametros-globales.component';
import { GestionLaboratoriosComponent } from './gestion-laboratorios/gestion-laboratorios.component';

export const generalidadesRoutes: Routes = [
    { path: 'parametros-globales', component: ParametrosGlobalesComponent },
    { path: 'gestion-laboratorios', component: GestionLaboratoriosComponent },
];