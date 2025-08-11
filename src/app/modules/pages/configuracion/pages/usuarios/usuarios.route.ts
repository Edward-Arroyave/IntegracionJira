import { Routes } from '@angular/router';
import { AsignacionSedeUsuarioComponent } from './asignacion-sede-usuario/asignacion-sede-usuario.component';
import { ListarUsuarioComponent } from './tipo-usuario/listar-usuario.component';
import { PermisosEspecialesComponent } from './permisos-especiales/permisos-especiales.component';
import { RestaurarcontrasenaComponent } from './restaurarclave/restaurarcontrasena.component';

export const usuariosRoutes: Routes = [
    { path: 'asignacion-sede-usuario', component: AsignacionSedeUsuarioComponent },
    { path: 'listar-usuario', component: ListarUsuarioComponent },
    { path: 'permisos-especiales', component: PermisosEspecialesComponent },
    { path: 'restaurar-clave', component: RestaurarcontrasenaComponent },
];