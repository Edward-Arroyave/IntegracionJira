import { Routes } from '@angular/router';

export const configuracionRoutes: Routes = [
    { 
        path: 'ubicaciones', 
        loadChildren: () => import('./pages/ubicaciones/ubicaciones.route').then(m => m.ubicacionesRoutes)
    },
    { 
        path: 'generalidades', 
        loadChildren: () => import('./pages/generalidades/generalidades.route').then(m => m.generalidadesRoutes) 
    },
    { 
        path: 'usuarios', 
        loadChildren: () => import('./pages/usuarios/usuarios.route').then(m => m.usuariosRoutes)
    },
];