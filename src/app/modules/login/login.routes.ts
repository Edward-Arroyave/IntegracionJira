import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { OlvidocontrasenaComponent } from './olvidocontrasena/olvidocontrasena.component';


export const loginRoutes: Routes = [

  { path: '', component: LoginComponent },
  { path: 'olvido-contrasena', component: OlvidocontrasenaComponent },
];