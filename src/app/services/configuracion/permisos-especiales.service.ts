import { Injectable, Pipe } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ModuleAccesses as AccessesModule } from '../../interfaces/module-access';
import { BehaviorSubject, combineLatest, concat, forkJoin, from, Observable, of, Subject } from 'rxjs';
import { AccessPermission, PermisosData, UserAndRoleAccessPermissions, CreateAccessPermission } from '../../interfaces/permisos.interface';
import { User } from '@app/interfaces/user.interface';
import { Rol as Rol } from '@app/interfaces/get-rol.interface';
import { map, mergeMap, reduce, shareReplay, switchMap } from 'rxjs/operators';
import { tap } from 'rxjs/operators'
import { disableDebugTools } from '@angular/platform-browser';
import { ApiService } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class PermisosEspecialesService extends ApiService {

  private _resfresh$ = new Subject<void>() 
  private _permisosData$ = new BehaviorSubject<void>(undefined);
  
  constructor(private http: HttpClient) {
    super(http);
    this.apiURL += 'Permissions';
  }
  
  private reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  get resfreh$(){
    return this._resfresh$
  }

//****Metodos ModuloAcesses */
  getAllModulos():Observable<AccessesModule[]>{
  
    return  this.http.get<AccessesModule[]>(environment.apiUrl + 'ModuleAccesses' , { headers: this.reqHeaders });
  }
  
  getAllModulosById(id:number):Observable<AccessesModule>{
  
    return  this.http.get<AccessesModule>(environment.apiUrl + 'ModuleAccesses/' + id , { headers: this.reqHeaders });
  }


  ///***Metodos Permisos*/
  getPermisoById(id:number):Observable<AccessPermission>{
    
    return  this.http.get<AccessPermission>(environment.apiUrl + 'Permissions/' + id , { headers: this.reqHeaders });
  }

  getAllPermisos():Observable<AccessPermission[]>{
   
    return  this.http.get<AccessPermission[]>(environment.apiUrl + 'Permissions' , { headers: this.reqHeaders });
  }

  apiRequest$:Observable<PermisosData[]> = this.getAllPermisos().pipe(
    switchMap((permissions) =>
      combineLatest(
        permissions.map((permission) =>
          forkJoin({
            permission: of(permission),
            moduleAccess: this.getAllModulosById(permission.idmoduleaccess)
          }).pipe(
            switchMap(({ permission, moduleAccess}) =>
              this.getRolById(permission.rolid).pipe(
                map((rol) => ({
                  idpermission: permission.idpermission,
                  Modulo: moduleAccess.desmoduleaccess,
                  idmoduleaccess: moduleAccess.idmoduleaccess,
                  userid: null,
                  rolid: parseInt(rol.rolid), 
                  Name: null,
                  Rol: rol.namerol,
                  Crear: permission.crear,
                  Editar: permission.editar,
                  Eliminar: permission.eliminar,
                }))
              )
            )
          )
        )
      )
    )
  );

  public PermisosData = this._permisosData$.pipe(
    mergeMap(() => this.apiRequest$),
    shareReplay(1)
  );
  
  updatePermisosData() {
    this._permisosData$.next();
  }

  postNuevoPermiso(permisoACrear:CreateAccessPermission):Observable<CreateAccessPermission>{
    
    return  this.http.post<CreateAccessPermission>(environment.apiUrl + 'Permissions', permisoACrear, { headers: this.reqHeaders }).pipe(
      tap(()=>{
        this._resfresh$.next();
      })
    )
  }

  putActualizarPermisoEnServidor(id:number, permisoACrear:AccessPermission):Observable<AccessPermission>{
    
    return  this.http.put<AccessPermission>(environment.apiUrl + 'Permissions/' + id
    , permisoACrear, { headers: this.reqHeaders }).pipe(
      tap(()=>{
        this._resfresh$.next();
      })
    );
  }

  DeletePermisoById(id:number):Observable<AccessPermission>{ 
    return  this.http.delete<AccessPermission>(environment.apiUrl + 'Permissions/' + {id}, { headers: this.reqHeaders });
  }


  getvalidacionPermisoById(rolId:number):Observable<UserAndRoleAccessPermissions >{ 
    return  this.http.get<UserAndRoleAccessPermissions>(environment.apiUrl + 'Permissions /Validpermissions/' + {rolId} , { headers: this.reqHeaders });
  }

  /*Metodos usuario*/

  getUserById(id:number):Observable<User>{
    return  this.http.get<User>(environment.apiUrl + 'Users/' + id , { headers: this.reqHeaders });
  }

  getRolById(id:number):Observable<Rol>{
    return  this.http.get<Rol>(environment.apiUrl + 'Roles/' + id , { headers: this.reqHeaders });
  }

  public async getPermissionsById(id:number): Promise<any> {
    return await this.http.get<any>(`${environment.apiUrl} Permissions/`+ id).toPromise();
  }

  public async getAllAsyncpermissionsRol(rolid:number): Promise<any> 
  {
    return await this.http.get<any>(`${environment.apiUrl}Permissions/InfoPermissionsRol/`+ rolid).toPromise();
  }

}
