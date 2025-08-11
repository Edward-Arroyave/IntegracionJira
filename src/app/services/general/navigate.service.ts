import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AppConstants } from '@app/Constants/constants';

@Injectable({
  providedIn: 'root'
})
export class NavigateService {

  constructor(private router: Router) { }

  goToLogin(): void {
    this.router.navigate([AppConstants.PATH_LOGIN]);
  }

  goToTipoUsuario(): void {
    this.router.navigate([AppConstants.PATH_TIPO_USUARIO]);
  }

  goToPanelInicio(): void {
    this.router.navigate([AppConstants.PATH_PANEL_INICIO]);
  }
}
