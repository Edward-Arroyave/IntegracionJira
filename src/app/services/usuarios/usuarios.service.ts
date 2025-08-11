import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApiService } from '../api.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { catchError, finalize, map } from 'rxjs/operators';
import { SharedService } from '../shared.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from '@environment/environment';
import { Observable, timer } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { VentanasModalesService } from '../general/ventanas-modales.service';
import { LoaderService } from '../loader/loader.service';

@Injectable({
  providedIn: 'root'
})


export class UsuariosService extends ApiService {

  public apiUrl = environment.apiUrl;
  public myApiURL = environment.apiUrl;
  accion: string;

  helper = new JwtHelperService();

  constructor(
    private router: Router,
    private http: HttpClient,
    private loaderService : LoaderService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private ventanaService: VentanasModalesService,
  ) {
    super(http);
    this.apiURL += 'users/';

  }

  openModal(descripcion) {
    const data = { descripcion: descripcion, accion: this.accion }
    this.ventanaService.openModal(data);
  }

  alerta() {

    this.accion = 'tokenExpired';
    //this.openModal(this.translate.instant('MODULES.NOTIFICACIONES.TITULO_SESION_EXPIRADA'));
    this.openModal("Sesión expirada");

  }

  async getUser(id: any) {
    return await this.httpClient.get(this.apiURL + id).toPromise();
  }

  autenticacionUsuario(formulario) {
    const httpHeaders = new HttpHeaders().set('authorization', 'Basic ' + btoa(formulario.username + ':' + formulario.pass)).set('Content-Type', 'application/json');
    const user = {
      username: formulario.username.value,
      pass: formulario.pass.value,
      sede: formulario.sede.value
    };
    const json = JSON.stringify(user);
    return this.http.post(this.apiURL + 'login/' + formulario.sede.value, json, { headers: httpHeaders }).toPromise();
  }

  recuperacionContrasena(data: any, updatePass:boolean) {
    const httpHeaders = new HttpHeaders().set('Content-Type', 'application/json');
    // const user = { username: usuario };
    const json = JSON.stringify(data);
    console.log(json);
    this.loaderService.show()
    return this.http.post<any>(`${this.apiURL}recover?updatePass=${updatePass}`, json, { headers: httpHeaders })
      .pipe(
        map((response: any) => {
          console.log(response);
          return response;
        }),
        finalize(() => this.loaderService.hide()),
        catchError(err => {
          this.toastr.warning(err.error.message);
          throw err;
        })
      );
  }

  detalleAsistente(asistente): Promise<any> {
    return this.http.get<any>(this.apiURL + asistente).toPromise();
  }

  obtenerToken(): string {
    return sessionStorage.getItem('token');
  }

  obtenerConfigInterno(): string {
    return JSON.parse(sessionStorage.getItem('interno'));;
  }

  obtenerConfigExterno(): string {
    return JSON.parse(sessionStorage.getItem('externo'));;
  }

  setToken(token: String) {
    return sessionStorage.set("token", token);
  }

  obtenerUserId() {
    return JSON.parse(sessionStorage.getItem('id'));
  }

  obtenerUsuario(): string {
    return sessionStorage.getItem('usuario');
  }

  obtenerCorreo(): string {
    return sessionStorage.getItem('email');
  }

  obtenerRol(): string {
    return sessionStorage.getItem('rolid');
  }

  obtenerSedeUsuario() {
    return sessionStorage.getItem('sede');
  }

  logout() {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('mensaje', 'true');
    this.router.navigate(['/']);
  }


  estaLogueado(): boolean {
    const token = sessionStorage.getItem('token');
    if (token != null) {
      if (this.helper.isTokenExpired(token)) {
        this.alerta();
        return false;
      } else {
        return true;
      }
    } else {
      this.router.navigate(['/inicio']);
      return false;
    }

  }

  tokenExpired(token: string) {

    if (this.helper.isTokenExpired(token)) {

      return true;

    }

    return false;

  }

  RenovationToken() {
    const token = sessionStorage.getItem('token');
    if (!this.helper.isTokenExpired(token) && token != null) {
      const claimsToken = this.helper.decodeToken(token);
      timer(parseInt(claimsToken.TRT) * 60 * 1000)
        .subscribe(async () => {
          const token = this.obtenerToken();
          const httpHeaders = new HttpHeaders().set('Authorization', 'Bearer ' + token).set('Content-Type', 'application/json');
          var respuesta = this.http.get(this.apiUrl + "Users/RenovationToken", { headers: httpHeaders }).toPromise();
          var newToken : any = await respuesta;
          sessionStorage.setItem('token', newToken.token);
          this.RenovationToken();
        })
    } else {
      this.alerta();
    }
  }

  validarRol() {
    const helper = new JwtHelperService();
    const token = helper.decodeToken(sessionStorage.getItem('token'));
    const rol = sessionStorage.getItem('rolid');

    if (rol == '1') {
      this.router.navigate(['panel/tipo-usuario']);
    } else {

      this.router.navigate(['panel/inicio']);
      Swal.fire({
        text: this.translate.instant('MODULES.NOTIFICACIONES.MSJ_USUARIO_NO_AUTORIZADO'),
        icon: 'info',
        confirmButtonText: this.translate.instant('MODULES.NOTIFICACIONES.CIERRE_SESION_BOTON'),
        confirmButtonColor: this.translate.instant('MODULES.NOTIFICACIONES.CIERRE_SESION_BOTON_COLOR')
      });
    }
  }

  validarUserMenu(userid): Promise<any> {
    //let userid = sessionStorage.getItem('id');
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<any>(this.apiUrl + 'Menus/usermenu/' + userid, { headers: reqHeaders }).toPromise();
  }

  listarusuarios() {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<any>(this.apiUrl + 'users', { headers: reqHeaders }).toPromise();
  }

  Listinfousuarios() {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<any>(this.apiUrl + 'users' + '/infousers', { headers: reqHeaders }).toPromise();
  }

  obtenerPermisosXuser(userid): Promise<any> {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<any>(this.myApiURL + 'Permissions/permissionXuser/' + userid, { headers: reqHeaders }).toPromise();
  }

  obtenerMenu(): Promise<any> {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<any>(this.myApiURL + 'menus/Menuall', { headers: reqHeaders }).toPromise();
  }


  // ObtenerModule(idmoduleaccess): Promise<any> {
  //     const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
  //     return this.http.get<any>(this.myApiURL + 'ModuleAccesses/' + idmoduleaccess, { headers: reqHeaders }).toPromise();
  // }

  obtenerSedesXUsuario(userid): Promise<any> {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<any>(this.myApiURL + 'Headquarters/SedesXUser/' + userid, { headers: reqHeaders }).toPromise();
  }

  DetalleUsuarioSede(): Promise<any> {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<any>(this.myApiURL + 'Userheadquarters/user', { headers: reqHeaders }).toPromise();
  }

  public createUserMenu(entity: any): Observable<any> {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const entityJson = JSON.stringify(entity);
    return this.httpClient.post<any>(`${this.apiURL}`, entityJson, { headers: reqHeaders });
  }

  public usermenusSave(entity: any): Observable<any> {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const entityJson = JSON.stringify(entity);
    return this.httpClient.post<any>(`${this.myApiURL}usermenus`, entityJson, { headers: reqHeaders });
  }

  public usermenusSavePemiso(entity: any): Observable<any> {
  const reqHeaders = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  const entityJson = JSON.stringify(entity);

  return this.httpClient.post<any>(`${this.myApiURL}usermenus`, entityJson, {
    headers: reqHeaders
  });
}


  public usermenusDelete(id: any): Observable<any> {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.httpClient.delete<any>(`${this.myApiURL}usermenus/${id}`, { headers: reqHeaders });
  }
  public restaurarcontrasena(datos: any): Observable<any> {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.httpClient.post<any>(`${this.myApiURL}users/restaurarcontrasena`, datos, { headers: reqHeaders });
  }
  public sentEmail(): Observable<any> {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.httpClient.get<any>(`${this.apiURL}sendemail`, { headers: reqHeaders });
  }

public usermenusDeleteEstado(id: any): Observable<any> {
  const reqHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
    'X-Silent-Delete': 'true' // 🔒 Siempre enviar esta cabecera
  });

  return this.httpClient.delete<any>(`${this.myApiURL}usermenus/${id}`, { headers: reqHeaders });
}

}
