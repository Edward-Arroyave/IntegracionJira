import { Injectable } from '@angular/core';
import { concatMap, EMPTY, Observable, Subject, switchMap, takeUntil, throwError } from 'rxjs';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpSentEvent, HttpHeaderResponse, HttpProgressEvent, HttpResponse, HttpUserEvent } from '@angular/common/http';
import { AppConfig } from './config.service';
import { UsuariosService } from './usuarios/usuarios.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';
import { ModalData } from '@app/Models/Modaldata';
import { MatDialog } from '@angular/material/dialog';
import { ModalGeneralComponent } from '@app/modules/shared/modals/modal-general/modal-general.component';


@Injectable({
  providedIn: "root",
})
export class AuthInterceptorService implements HttpInterceptor {

  helper = new JwtHelperService();

  constructor(private userService: UsuariosService, private dialog: MatDialog,) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpSentEvent | HttpHeaderResponse | HttpProgressEvent | HttpResponse<any> | HttpUserEvent<any>> {
    const token = this.userService.obtenerToken();

    if (!req.url.includes('/login')) {

      req = req.clone({
        setHeaders: { Authorization: 'Bearer ' + token }
      });
    }

    if (!req.url.includes('/assets/')) {
      req = req.clone({ setHeaders: { DBName: AppConfig.settings.dbname } });
      req = req.clone({ setHeaders: { Collection: AppConfig.settings.collection } });

      if (req.url.includes('qce')) {
        req = req.clone({ setHeaders: { Client: AppConfig.settings.bd_secundario } });
      } else {
        if (sessionStorage.getItem('consultaSedeExterna') != '1' || sessionStorage.getItem('consultaSedeExterna') === null) {
          req = req.clone({ setHeaders: { Client: AppConfig.settings.cliente } });
        }
        if (sessionStorage.getItem('clientLogo') != "" && sessionStorage.getItem('clientLogo') != undefined && req.url.includes('/generalconfiguration/')) {
          let cliente = sessionStorage.getItem('clientLogo')
          req = req.clone({ setHeaders: { Client: cliente } });
        }
      }
    }
    
    if (req.method === 'DELETE' && !req.headers.has('X-Silent-Delete') ) {

      const destroy$: Subject<boolean> = new Subject<boolean>();
      const data: ModalData = {
        message: `¿Esta seguro que desea continuar con la eliminación?`,
        btn: 'Aceptar',
        btn2: 'Cancelar',
        footer: true,
        title: 'Eliminar',
        image: ''
      };
      const dialogRef = this.dialog.open(ModalGeneralComponent, { height: '12em', width: '30em', data, disableClose: true });

      return dialogRef.componentInstance.primaryEvent?.pipe(
        takeUntil(destroy$),
        switchMap(result =>{
          dialogRef.close();
          return next.handle(req)
        })
      )
    } else {
      return next.handle(req);
    }
  }
}
