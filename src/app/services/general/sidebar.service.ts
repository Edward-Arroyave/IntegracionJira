import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '@environment/environment';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {

  public apiURL = environment.apiUrl;
  Menulist: any;
  toggled = true;
  // tslint:disable-next-line:variable-name
  _hasBackgroundImage = true;

  menus = [

    {

      title: 'Configuración',
      icon: 'fas fa-cog',
      active: false,
      type: 'dropdown',

      submenus: [

        {
          title: 'Países',
          path: 'paises',
        },
        {
          title: 'Departamento',
          path: 'departamentos',
        },
        {
          title: 'Ciudades',
          path: 'ciudades',
        },
        {
          title: 'Diccionario de parámetros',
          path: 'diccionario-parametros',
        },
        {
          title: 'Parámetros Globales',
          path: 'parametros-globales',
        },
        {
          title: 'Sedes',
          path: 'sedes',
        },
        {
          title: 'Asignación de Sede a Usuario',
          path: 'asignacion-sede-usuario',
        },
        {
          title: 'Tipos de Usuario',
          path: 'tipo-usuario',
        },
        {
          title: 'Roles',
          path: 'roles',
        },
        {
          title: 'Sedes',
          path: 'panel/sedes',
        },
      ]
    },
    {
      title: 'Administración',
      icon: 'fas fa-user-check',
      active: false,
      type: 'dropdown',
      submenus: [
      ]
    },
    {
      title: 'Usuarios',
      icon: '',
      active: false,
      type: 'dropdown',
      submenus: [
      ]
    }
  ];
  constructor(private http: HttpClient) { }

  obtenerMenus(userid): Promise<any> {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<any>(this.apiURL + 'Menus/Menu/' + userid , { headers: reqHeaders }).toPromise();
  }

  obtenerMenu(): Promise<any> {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<any>(this.apiURL + 'Menus', { headers: reqHeaders }).toPromise();
  }

  obtenerSubMenuXuser(menuid, userid): Promise<any> {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<any>(this.apiURL + 'Addmenus/submenu/' + menuid + '/' + userid, { headers: reqHeaders }).toPromise();
  }

  obtenerSubMenu(menuid): Promise<any> {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<any>(this.apiURL + 'Addmenus/submenu/' + menuid, { headers: reqHeaders }).toPromise();
  }


  obtenerMenuXUser(userid): Promise<any> {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<any>(this.apiURL + 'Menus/userAuth/' + userid, { headers: reqHeaders }).toPromise();
  }

  obtenerPermisosXuser(userid): Promise<any> {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<any>(this.apiURL + 'Permissions/permissionXuser/' + userid, { headers: reqHeaders }).toPromise();
  }

  // ObtenerModule(idmoduleaccess): Promise<any> {
  //   const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
  //   return this.http.get<any>(this.apiURL + 'ModuleAccesses/' + idmoduleaccess, { headers: reqHeaders }).toPromise();
  // }

  obtenerNombreRolxuserid(userid): Promise<any>{
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<any>(this.apiURL + 'users/Roleuser/' + userid, { headers: reqHeaders }).toPromise();
  }


  toggle() {
    this.toggled = !this.toggled;
  }

  getSidebarState() {
    return this.toggled;
  }

  setSidebarState(state: boolean) {
    this.toggled = state;
  }

  getMenuList() {
    return this.menus;
  }

  get hasBackgroundImage() {
    return this._hasBackgroundImage;
  }

  set hasBackgroundImage(hasBackgroundImage) {
    this._hasBackgroundImage = hasBackgroundImage;
  }
}
