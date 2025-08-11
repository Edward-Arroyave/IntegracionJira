import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SharedService } from '@app/services/shared.service';
import { AppConstants } from '@app/Constants/constants';
import { DatePipe, NgIf, NgFor, AsyncPipe, TitleCasePipe } from '@angular/common';
import Swal from 'sweetalert2';
import { HttpErrorResponse } from '@angular/common/http';
import { VentanasModalesService } from '@app/services/general/ventanas-modales.service';
import { LotMatControlService } from '@app/services/configuracion/lotmatcontrol.service';
import { LotesService } from '@app/services/configuracion/lotes.service';
import { ControlMaterialService } from '@app/services/configuracion/materialescontrol.service';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject } from 'rxjs';
import { map, startWith, takeUntil } from 'rxjs/operators';
import { ImageCdnPipe } from '../../../../../core/pipes/image-cdn.pipe';
import { MatOptionModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TablaComunComponent } from '@app/modules/shared/general-tablas/tabla-comun/tabla-comun.component';
import { MatDialog } from '@angular/material/dialog';
import { ModalData } from '@app/Models/Modaldata';
import { ModalGeneralComponent } from '@app/modules/shared/modals/modal-general/modal-general.component';
import { createLog } from '@app/globals/logUser';

@Component({
    selector: 'app-gestion-lot-material-control',
    templateUrl: './gestion-lot-material-control.component.html',
    styleUrls: ['./gestion-lot-material-control.component.css'],
    providers: [DatePipe],
    standalone: true,
    imports: [
        MatFormFieldModule,
        MatInputModule,
        MatTableModule,
        MatSortModule,
        MatSlideToggleModule,
        MatPaginatorModule,
        NgIf,
        FormsModule,
        ReactiveFormsModule,
        MatAutocompleteModule,
        NgFor,
        MatOptionModule,
        AsyncPipe,
        TitleCasePipe,
        TranslateModule,
        ImageCdnPipe,
        TablaComunComponent
    ],
})
export class GestionLotMaterialControlComponent implements OnInit {
  log = new createLog(this.datePipe, this.translate, this.lotMatControlService);
  dataAnt: any;
  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();
  aceptar: any;
  titulocontrolmat: any;
  desactivar = false;
  textcontrolmat: any;
  listaControlmatXidLot: any;
  formaGestionLotMatControl: FormGroup;
  listaLotes: any;
  lotsActive: any;
  listaControlMaterial: any;
  controlmaterialActive: any;
  listaDetalleLoTMatControl: any[];
  accionEditar: any;
  accion: any;
  tituloAccion: any;
  vantanaModal: BsModalRef;
  titulo: any;
  text: any;
  textError: any;
  cancelar: any;
  confirmar: any;
  messageError: any;
  fechaActual = this.datePipe.transform(new Date(), 'yyyy-MM-dd');

  //predictivos
  filteredOptionslotsEdit: Observable<string[]>;
  idlotpr: number;
  numlotpr: any;
  listaLotspr: any;


  //predictivos create
  filteredOptionsLotsCreate: Observable<string[]>;
  listlotscreate: any;
  filteredOptionsContmatCreate: Observable<string[]>;
  listcontmatcreate: any;


  filteredOptionsControlmaterialEdit: Observable<string[]>;
  idcontrolmaterialpr: number;
  descontmatpr: any;
  listaControlmaterialpr: any;

  formLotContmatEdit: FormGroup = this.fb.group({
    idLotControlMaterial: [],
    idLot: [, [Validators.required]],
    idControlMaterial: [, [Validators.required]],
    active: []
  });

  constructor(private datePipe: DatePipe,
    private translate: TranslateService,
    private lotMatControlService: LotMatControlService,
    private controlMaterialService: ControlMaterialService,
    private lotesService: LotesService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private sharedService: SharedService,
    private dialog: MatDialog) { }

  displayedColumns: string[] = ['N° Lote', 'M. de control', 'Estado', 'Editar', 'Eliminar'];
  dataSource: MatTableDataSource<any>;
  dataTableBody:any[]=[];
  

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  ngOnInit(): void {
    this.cargarGestionLotMatControl();
    this.cargarLotes();
    this.cargarControlMaterial();
    this.sharedService.customTextPaginator(this.paginator);
    this.titulosSwal();
    this.titulosSinControlxIdLotMatSwal();
  }

  private _filterlotsCreate(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.lotsActive
      .filter(lot =>
        lot.numlot.toLowerCase().includes(filterValue)).filter(e => e.active == true)

  }

  private _filtercntmatCreate(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.controlmaterialActive
      .filter(contmat =>
        contmat.descontmat.toLowerCase().includes(filterValue)).filter(e => e.active == true)

  }

  async cargarGestionLotMatControl() {

    this.listaDetalleLoTMatControl = await this.lotMatControlService.detalleLotControlMaterial();
    this.dataAnt = this.listaDetalleLoTMatControl;
    this.dataTableBody = this.listaDetalleLoTMatControl.map( x =>  {
      return { 'N° Lote':x.Numlot,'M. de control':x.Descontmat,Estado:x.Active, item:x, item4:x ,item5:x };
    });
    this.dataSource = new MatTableDataSource(this.listaDetalleLoTMatControl);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

  }

  get lotNoValido() {
    return this.formaGestionLotMatControl.get('idLot');
  }
  get controlMaterialNoValido() {
    return this.formaGestionLotMatControl.get('idControlMaterial');
  }
  get lotNoValidoedit() {
    return this.formLotContmatEdit.get('idLot');
  }
  get controlMaterialNoValidoedit() {
    return this.formLotContmatEdit.get('idControlMaterial');
  }

  async openModalGestionLotMatControl(templateGestionLotMatControl: TemplateRef<any>, datos: any) {
    this.crearFormularioGestionLotMatControl(datos);
    this.listaLotspr = await this.lotesService.getAllAsync();
    this.lotsActive = this.listaLotspr.filter(e => e.expdate > this.fechaActual && e.active);
    this.lotsActive.sort((a, b) => {
      a.numlot = a.numlot.charAt(0).toLowerCase() + a.numlot.slice(1);
      b.numlot = b.numlot.charAt(0).toLowerCase() + b.numlot.slice(1);
    })
    this.lotsActive.sort((a, b) => {
      if (a.numlot < b.numlot) return -1;
      if (a.numlot > b.numlot) return 1;
      return 0;
    })

    this.filteredOptionsLotsCreate = this.formaGestionLotMatControl.get('idLot').valueChanges.pipe(
      startWith(''),
      map(value => {
        return this._filterlotsCreate(value)
      }),
    );

    this.listaControlmaterialpr = await this.controlMaterialService.getAllAsync();
    this.controlmaterialActive = this.listaControlmaterialpr.filter(e => e.active);
    this.controlmaterialActive.sort((a, b) => {
      a.descontmat = a.descontmat.charAt(0).toLowerCase() + a.descontmat.slice(1);
      b.descontmat = b.descontmat.charAt(0).toLowerCase() + b.descontmat.slice(1);
    })
    this.controlmaterialActive.sort((a, b) => {
      if (a.descontmat < b.descontmat) return -1;
      if (a.descontmat > b.descontmat) return 1;
      return 0;
    })

    this.filteredOptionsContmatCreate = this.formaGestionLotMatControl.get('idControlMaterial').valueChanges.pipe(
      startWith(''),
      map(value => {
        return this._filtercntmatCreate(value)
      }),
    );

    if(datos){
      this.accionEditar = true;
      this.accion = "Editar" ;
    }else{
      this.accionEditar = false;
      this.accion = "Crear";
    }


    const destroy$: Subject<boolean> = new Subject<boolean>();
    /* Variables recibidas por el modal */
    const data: ModalData = {
      content: templateGestionLotMatControl,
      btn: this.accionEditar?'Actualizar':'Guardar',
      btn2: 'Cerrar',
      footer:true,
      title: this.accion,
      image:''
    };
    const dialogRef = this.dialog.open(ModalGeneralComponent, { height:'16em' ,width: '40em', data, disableClose: true });

    dialogRef.componentInstance.primaryEvent?.pipe(takeUntil(destroy$)).subscribe(x =>{
      if(this.formaGestionLotMatControl.invalid){
        this.formaGestionLotMatControl.markAllAsTouched();
        return
      }
      this.crearEditarGestionLotMatControl(datos);
      dialogRef.close();
    });
  }

  crearFormularioGestionLotMatControl(datos: any) {
    /*
    let dataEditLot:any;
    let dataEditCM:any;
    if(datos) {
      dataEditLot= this._filterlotsCreate(datos?.Numlot)[0];
      dataEditCM= this._filtercntmatCreate(datos?.Descontmat)[0];
    };
    */
    this.formaGestionLotMatControl = this.fb.group({
      idLotControlMaterial: [datos ? datos.IdLotControlMaterial : ''],
      idLot: [datos ? datos.Numlot: '', [Validators.required]],
      idControlMaterial: [datos ? datos.Descontmat: '', [Validators.required]],
      active: [datos ? datos.Active : false]
    });
  }


  crearEditarGestionLotMatControl(datos?:any) {
    let nomIdlote = this.formaGestionLotMatControl.get('idLot').value
    let nuevaData = this.formaGestionLotMatControl.value;
    let arrlotes = this.lotsActive.sort((a, b) => {
      a.numlot = a.numlot.charAt(0).toLowerCase() + a.numlot.slice(1);
      b.numlot = b.numlot.charAt(0).toLowerCase() + b.numlot.slice(1);

    })
    arrlotes.sort((a, b) => {
      if (a.numlot < b.numlot) return -1;
      if (a.numlot > b.numlot) return 1;
      return 0;
    })

    arrlotes.filter(result => {
      if (result.numlot.toLowerCase() === nomIdlote.toLowerCase()) {
        nuevaData.idLot = result.idLot;
        return
      }
      return
    })

    let nomIdcontmat = this.formaGestionLotMatControl.get('idControlMaterial').value

    let arrcontmat = this.controlmaterialActive.sort((a, b) => {
      a.descontmat = a.descontmat.charAt(0).toLowerCase() + a.descontmat.slice(1);
      b.descontmat = b.descontmat.charAt(0).toLowerCase() + b.descontmat.slice(1);

    })
    arrcontmat.sort((a, b) => {
      if (a.descontmat < b.descontmat) return -1;
      if (a.descontmat > b.descontmat) return 1;
      return 0;
    })

    arrcontmat.filter(result => {
      if (result.descontmat.toLowerCase() === nomIdcontmat.toLowerCase()) {
        nuevaData.idControlMaterial = result.idControlMaterial;
        return
      }
      return
    })

    if (!this.formaGestionLotMatControl.invalid) {

      if (this.accion === 'Crear') {

        this.desactivar = true;

        this.lotMatControlService.create(nuevaData).subscribe({
          next:(respuesta)=> {
            this.cargarGestionLotMatControl();
            this.toastr.success('Registro creado');
            this.desactivar = false;
  
            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo:'Control Calidad Interno',
              Submodulo: 'Configuración',
              Item:'Lote Materiales de control',
              Metodo: 'creación',
              Datos: JSON.stringify(this.formaGestionLotMatControl.value),
              Respuesta: JSON.stringify(respuesta),
              TipoRespuesta: 200,
              Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }
  
            this.lotMatControlService.createLogAsync(Loguser).then(respuesta => {});
          },error:(err)=> {
            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo:'Control Calidad Interno',
              Submodulo: 'Configuración',
              Item:'Lote Materiales de control',
              metodo: 'creación',
              datos: JSON.stringify(this.formaGestionLotMatControl.value),
              respuesta: err.message,
              tipoRespuesta: err.status,
              Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }
            this.lotMatControlService.createLogAsync(Loguser).then(respuesta => {
  
            });
  
            this.toastr.error(err.error);
            this.desactivar = false;
          }
        });
      } else {
        let datosAnteriores = this.dataAnt.find(x => x.IdLotControlMaterial == datos.IdLotControlMaterial);
        this.lotMatControlService.update(this.formaGestionLotMatControl.value, this.formaGestionLotMatControl.value.idLotControlMaterial).subscribe({
          next:(respuesta)=> {
            this.cargarGestionLotMatControl();
            this.toastr.success('Registro actualizado');
  
            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo:'Control Calidad Interno',
              Submodulo: 'Configuración',
              Item:'Lote Materiales de control',
              Metodo: 'actualización',
              Datos: JSON.stringify(this.formaGestionLotMatControl.value),
              DatosAnteriores: `${datosAnteriores.IdLotControlMaterial} | Material: ${datosAnteriores.Descontmat} | N°: ${datosAnteriores.Numlot} | Estado: ${datosAnteriores.Active}`,
              Respuesta: JSON.stringify(respuesta),
              TipoRespuesta: 200,
              Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }
            
            this.lotMatControlService.createLogAsync(Loguser).then(respuesta => {
            })
          },error:(err) => {
            const Loguser = {
              Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
              hora: this.datePipe.transform(Date.now(), "shortTime"),
              Modulo:'Control Calidad Interno',
              Submodulo: 'Configuración',
              Item:'Lote Materiales de control',
              metodo: 'actualización',
              datos: JSON.stringify(this.formaGestionLotMatControl.value),
              DatosAnteriores: `${datosAnteriores.IdLotControlMaterial} | Material: ${datosAnteriores.Descontmat} | N°: ${datosAnteriores.Numlot} | Estado: ${datosAnteriores.Active}`,
              respuesta: err.message,
              tipoRespuesta: err.status,
              Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
            }
            this.lotMatControlService.createLogAsync(Loguser).then(respuesta => {
  
            });  
          },
        });
      }
    }
  }

  async cargarLotes() {

    this.listaLotes = await this.lotesService.getAllAsync();
    this.lotsActive = this.listaLotes.filter(e => e.expdate > this.fechaActual && e.active);

  }
  async cargarControlMaterial() {
    this.listaControlMaterial = await this.controlMaterialService.getAllAsync();
    this.controlmaterialActive = this.listaControlMaterial.filter(e => e.active);
  }

  actualizarGestionLotMatControl(datoslotcontrol:any[]) {
    const [data,estado ] = datoslotcontrol;
    data.Active = estado;
    const datosAnteriores = this.dataAnt.find(x => x.IdLotControlMaterial == data.IdLotControlMaterial);
    this.lotMatControlService.update(data, data.IdLotControlMaterial).subscribe({
      next:(respuesta) =>{
        this.cargarGestionLotMatControl();
        this.accion = 'Editar';
        this.toastr.success('Estado actualizado', 'Actualización');
        this.log.logObj('Control Calidad Interno', 'Configuración', 'Material de control', 'a', data, JSON.stringify(respuesta), 200, this.datosAnt(datosAnteriores));
      },error:(err) => {
        this.cargarGestionLotMatControl();
        this.log.logObj('Control Calidad Interno', 'Configuración', 'Material de control', 'a', data, err.message, err.status, this.datosAnt(datosAnteriores));
        this.toastr.error('no fue posible actualizar el estado', 'Error')
      },
    });
  }

  datosAnt(data: any) {
    return ` IdLotControlMaterial: ${data.IdLotControlMaterial} - IdControlMaterial: ${data.IdControlMaterial} - Descontmat: ${data.Descontmat} - IdLot: ${data.IdLot} - Numlot: ${data.Numlot} - Active: ${!data.Active}`;
  }


  eliminarGestionLotMatControl(id: any) {
    let datosAnteriores = this.dataAnt.find(x => x.IdLotControlMaterial == id.IdLotControlMaterial);
    
    this.lotMatControlService.delete('LotControlMaterials', id.IdLotControlMaterial).subscribe({
      next:(respuesta) =>{
          
        this.cargarGestionLotMatControl();
        this.accion = '';
        this.toastr.success('Registro eliminado');
  
        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo:'Control Calidad Interno',
          Submodulo: 'Configuración',
          Item:'Lote Materiales de control',
          metodo:'eliminación',
          datos: JSON.stringify(id),
          DatosAnteriores: `${datosAnteriores.IdLotControlMaterial} | Material: ${datosAnteriores.Descontmat} | N°: ${datosAnteriores.Numlot}`,
          respuesta: JSON.stringify(respuesta),
          tipoRespuesta: 200,
          Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
        this.lotMatControlService.createLogAsync(Loguser).then(respuesta => {});
      },error:(err) => {
        this.toastr.error(this.messageError);
    
        const Loguser = {
          Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
          hora: this.datePipe.transform(Date.now(), "shortTime"),
          Modulo:'Control Calidad Interno',
          Submodulo: 'Configuración',
          Item:'Lote Materiales de control',
          metodo: 'eliminación',
          datos: JSON.stringify(id),
          respuesta: err.message,
          tipoRespuesta: err.status,
          Usuario:  sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos')
        }
        this.lotMatControlService.createLogAsync(Loguser).then(respuesta => { });
      }
    });
  }

  titulosSinControlxIdLotMatSwal() {
    this.translate.get('MODULES.SWALSINCONTROLXIDLOT.TITULO').subscribe(respuesta => this.titulocontrolmat = respuesta);
    this.translate.get('MODULES.SWALSINCONTROLXIDLOT.TEXT').subscribe(respuesta => this.textcontrolmat = respuesta);
    this.translate.get('MODULES.SWALSINCONTROLXIDLOT.CONFIRM').subscribe(respuesta => this.aceptar = respuesta);
    this.translate.get('MODULES.SWALSINCONTROLXIDLOT.TEXTERROR').subscribe(respuesta => this.textError = respuesta);
    this.translate.get('MODULES.SWALSINCONTROLXIDLOT.MESAGEERROR').subscribe(respuesta => this.messageError = respuesta);
  }

  titulosSwal() {
    this.translate.get('MODULES.SWAL.TITULO').subscribe(respuesta => this.titulo = respuesta);
    this.translate.get('MODULES.SWAL.TEXT').subscribe(respuesta => this.text = respuesta);
    this.translate.get('MODULES.SWAL.CANCEL').subscribe(respuesta => this.cancelar = respuesta);
    this.translate.get('MODULES.SWAL.CONFIRM').subscribe(respuesta => this.confirmar = respuesta);
    this.translate.get('MODULES.SWAL.TEXTERROR').subscribe(respuesta => this.textError = respuesta);
    this.translate.get('MODULES.SWAL.MESAGEERROR').subscribe(respuesta => this.messageError = respuesta);
  }
}
