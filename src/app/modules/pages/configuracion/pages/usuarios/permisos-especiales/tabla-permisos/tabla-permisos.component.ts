import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  ChangeDetectorRef,
} from "@angular/core";
import { DatePipe, NgStyle, NgFor, NgIf } from '@angular/common';
import { ConfiguracionObjetivosAnalitoService } from '@app/services/configuracion/configuracion-objetivos-analito.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { MatTable, MatTableDataSource, MatTableModule } from "@angular/material/table";
import {
  AccessPermission,
  PermisosData,
} from "@app/interfaces/permisos.interface";
import { RolService } from '@app/services/configuracion/rol.service';
import { Subject, Observable } from "rxjs";
import { DoCheck, ViewEncapsulation } from '@angular/core';
import { MatSort, MatSortModule } from "@angular/material/sort";
import dayjs from 'dayjs';
import { HttpErrorResponse } from "@angular/common/http";
import { ToastrService } from 'ngx-toastr';
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { ImageCdnPipe } from "@app/modules/core/pipes/image-cdn.pipe";
import { PermisosEspecialesService } from "@app/services/configuracion/permisos-especiales.service";

@Component({
  selector: "app-tabla-permisos",
  templateUrl: "./tabla-permisos.component.html",
  styleUrls: ["./tabla-permisos.component.css"],
  encapsulation: ViewEncapsulation.Emulated,
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatIconModule, MatTableModule, MatSortModule, NgFor, NgIf, MatSlideToggleModule, MatPaginatorModule, TranslateModule, ImageCdnPipe]
})
export class TablaPermisosComponent
  implements OnInit, AfterViewInit, OnDestroy, DoCheck {
  modifiedData: AccessPermission[];
  deleteRow(_t16: any) {
    throw new Error("Method not implemented.");
  }
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  cardVisibleAceptar = false;
  cardVisibleCancelar = false;
  originalData: PermisosData[];
  detectChanges: boolean;
  hasDataChanged: boolean = false;
  displayedColumns: string[] = [
    "Modulo",
    "Rol",
    "Crear",
    "Editar",
    "Eliminar",
    "Quitar",
  ];
  dataSource: MatTableDataSource<PermisosData>;

  @ViewChild(MatPaginator,{static:true}) paginator: MatPaginator;
  @ViewChild(MatSort,{static:true}) sort: MatSort;
  @ViewChild(MatTable) table: MatTable<PermisosData>;
  private readonly onDestroy$ = new Subject<void>();
  isLoading: boolean = false;
  username: any;
  rolid: any;
  namerol: any;
  crearant: any;
  editant: any;
  eliminarant: any;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  constructor(
    private datePipe: DatePipe,
    private readonly permisosEspecialesService: PermisosEspecialesService,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private configuracionObjetivosAnalitoService: ConfiguracionObjetivosAnalitoService,
    private translate: TranslateService,
    private RolService: RolService,
    private toastr: ToastrService
  ) { }

  ngDoCheck(): void {
    if (this.dataSource) {
      this.hasDataChanged =
        JSON.stringify(this.originalData) !==
        JSON.stringify(this.dataSource.data);
    }
  }

  ngOnInit(): void {
    // this.username = JSON.parse(sessionStorage.getItem('asistente'));
    this.getRolUser();
    this.permisosEspecialesService.PermisosData.subscribe(
      (data: PermisosData[]) => {
        this.originalData = JSON.parse(JSON.stringify(data));
        this.dataSource = new MatTableDataSource(data);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      }
    );
  }

  getRolUser() {
    this.rolid = JSON.parse(sessionStorage.getItem('rolid'));
    this.RolService.getByIdAsync(this.rolid).then((datarol: any) => {
      this.namerol = datarol.namerol;
    })

  }
  updatePermisosData(): void {
    this.permisosEspecialesService.updatePermisosData();
  }
  deletePermisoData(id: number) {
    this.permisosEspecialesService.DeletePermisoById(id);
  }

  ngOnDestroy(): void {
    (this.detectChanges = false),
      this.permisosEspecialesService.resfreh$.unsubscribe();
  }

  async toggleEstado(permisoData: any) {
    await this.permisosEspecialesService.getByIdAsync(permisoData.idpermission).then((data: any) => {
      this.crearant = data.crear;
      this.editant = data.editar;;
      this.eliminarant = data.eliminar;
    })

    this.permisosEspecialesService.update(permisoData, permisoData.idpermission).subscribe({
      next:(respuesta)=> {
        this.toastr.success('Registro actualizado');
        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo: 'Configuración',
          Submodulo: 'Usuarios',
          Item: 'Permisos especiales',
          Metodo: 'actualización',
          Datos: ('Usuario: ' + sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos') + '|Rol: ' + this.namerol + '|Crear: ' + permisoData.crear + '|Editar: ' + permisoData.editar + '|Eliminar: ' + permisoData.eliminar),
          DatosAnteriores: ('Usuario: ' + sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos') + '|Rol: ' + this.namerol + '|Crear: ' + this.crearant + '|Editar: ' + this.editant + '|Eliminar: ' + this.eliminarant),
          Respuesta: JSON.stringify(respuesta),
          TipoRespuesta: 200,
          Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
        this.permisosEspecialesService.createLogAsync(Loguser).then(respuesta => { });
      },
      error:(err) => {
        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo: 'Configuración',
          Submodulo: 'Usuarios',
          Item: 'Permisos especiales',
          Metodo: 'actualización',
          Datos: ('Usuario: ' + sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos') + '|Rol: ' + this.namerol + '|Crear: ' + permisoData.crear + '|Editar: ' + permisoData.editar + '|Eliminar: ' + permisoData.eliminar),
          DatosAnteriores: ('Usuario: ' + sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos') + '|Rol: ' + this.namerol + '|Crear: ' + this.crearant + '|Editar: ' + this.editant + '|Eliminar: ' + this.eliminarant),
          Respuesta: JSON.stringify(err),
          TipoRespuesta: err.message,
          Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
        this.permisosEspecialesService.createLogAsync(Loguser).then(() => {
        });
          
      },
    });
  }

  async resetData() {
    this.dataSource.data = JSON.parse(JSON.stringify(this.originalData));
    this.cardVisibleCancelar = !this.cardVisibleCancelar;
  }

  async deleteElement(id: any) {

    await this.permisosEspecialesService.getByIdAsync(id).then((data: any) => {

      this.crearant = data.crear;
      this.editant = data.editar;;
      this.eliminarant = data.eliminar;
    })
    this.permisosEspecialesService.delete('CA', id).subscribe({
      next:(respuesta) =>{
        this.permisosEspecialesService.updatePermisosData();
  
        this.toastr.success('Registro eliminado');
  
        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo: 'Configuración',
          Submodulo: 'Usuarios',
          Item: 'Permisos especiales',
          Metodo: 'eliminación',
          Datos: ('Usuario: ' + sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos') + '|Rol: ' + this.namerol + '|Crear: ' + this.crearant + '|Editar: ' + this.editant + '|Eliminar: ' + this.eliminarant),
          Respuesta: JSON.stringify(respuesta),
          TipoRespuesta: 200,
          Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
        this.permisosEspecialesService.createLogAsync(Loguser).then(() => {
        });
        
      },
      error:(err) => {
        this.toastr.error(err.error);
        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo: 'Configuración',
          Submodulo: 'Usuarios',
          Item: 'Permisos especiales',
          Metodo:'eliminación',
          Datos: ('Usuario: ' + sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos') + '|Rol: ' + this.namerol + '|Crear: ' + this.crearant + '|Editar: ' + this.editant + '|Eliminar: ' + this.eliminarant),
          Respuesta: JSON.stringify(err.message),
          TipoRespuesta: err.error,
          Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
        this.permisosEspecialesService.createLogAsync(Loguser).then(() => { });
          
      },
    });
  }
}
