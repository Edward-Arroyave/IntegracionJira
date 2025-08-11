export interface AccessPermission {
  idpermission:number,
  idmoduleaccess: number;
  userid: number;
  crear: boolean;
  editar: boolean;
  eliminar: boolean;
  rolid: number;
}
export interface CreateAccessPermission {
  idmoduleaccess: number;
  userid: number;
  crear: boolean;
  editar: boolean;
  eliminar: boolean;
  rolid: number;
}

export interface UserAndRoleAccessPermissions {
  permisos: 
  
  [];
}

export interface PermisosData {
  idpermission:number,
  idmoduleaccess: number,
  userid: number,
  Modulo: string;
  Name: string;
  Rol: string;
  Crear: boolean;
  Editar: boolean;
  Eliminar: boolean;
  rolid: number;
}


