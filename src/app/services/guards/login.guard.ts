import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { UsuariosService } from '../usuarios/usuarios.service';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard  {
  constructor(private userService: UsuariosService, private router: Router) {}
  canActivate(): boolean {
    return this.userService.estaLogueado();
  }
}
