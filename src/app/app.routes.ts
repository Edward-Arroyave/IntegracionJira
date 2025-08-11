import { Routes } from '@angular/router';
import { LoginGuard } from './services/guards/login.guard';

export const mainRoutes: Routes = [

  {
    path: 'login',
    loadChildren: () => import('./modules/login/login.routes').then(m => m.loginRoutes),
  },
  {
    path: 'panel',
    loadChildren: () => import('./modules/pages/pages.routes').then(m => m.pagesRoutes),
    canActivate: [ LoginGuard ]
  },
  { path: '**', redirectTo: '/login', pathMatch: 'full' },

];