import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { TrazabilidadServices } from '@app/services/mantenimiento-calibradores/trazabililidad.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import dayjs from 'dayjs';
import { ExporterService } from '@app/services/mantenimiento-calibradores/exporter.service';
import { ImageCdnPipe } from '../../../../core/pipes/image-cdn.pipe';
import { MatOptionModule } from '@angular/material/core';
import { NgFor } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexLegend,
  ApexYAxis,
  ApexGrid,
  ApexXAxis,
  ApexStroke,
  ApexTitleSubtitle,
  ApexTheme
} from "ng-apexcharts";
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { LoaderService } from '@app/services/loader/loader.service';
import { MatIconModule } from '@angular/material/icon';
import { TablaComunComponent } from '@app/modules/shared/general-tablas/tabla-comun/tabla-comun.component';


// Interface - referencia para la echarts
export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  dataLabels: ApexDataLabels;
  grid: ApexGrid;
  stroke: ApexStroke;
  title: ApexTitleSubtitle;
  legend: ApexLegend;
  theme: ApexTheme;
  annotations: ApexAnnotations
  labels: any;
  colors: any;
  horas: any;
};

@Component({
  selector: 'app-trazabilidad',
  templateUrl: './trazabilidad.component.html',
  styleUrls: ['./trazabilidad.component.css'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, MatFormFieldModule,
    MatInputModule, MatDatepickerModule, MatSelectModule, NgFor,
    MatOptionModule, MatTableModule, MatSortModule,
    MatPaginatorModule, MatIconModule, TablaComunComponent,
    TranslateModule, ImageCdnPipe, NgxMatSelectSearchModule]
})
export class TrazabilidadComponent implements OnInit {
  today: number = Date.now();
  modules = [];
  modulesCopy = [];
  modulesname: any;
  submodname: any;
  submodules = [];
  submodulesCopy = [];
  itemslist = [];
  itemslistCopy = [];
  ventanaModal: BsModalRef;
  ver: boolean = undefined;
  verbtnexcel: boolean = undefined;
  dataSource: MatTableDataSource<any>;
  displayedColumns: string[] = ['Fecha', "Hora", "Módulo", "Submódulo", 'Item', 'Accion', 'Datos Nuevos', 'Datos Anteriores', 'Usuarios'];
  dataTableBody: any[] = [];
  //------

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;


  acciones = [
    { nameaction: 'creación' },
    { nameaction: 'actualización' },
    { nameaction: 'eliminación' }
  ];

  formaCalendarModal = this.fb.group({
    desde: ['', [Validators.required]],
    hasta: ['', [Validators.required]],
    modulo: ['', [Validators.required]],
    submodulo: [''],
    item: [''],
    accion: [''],

  });
  maxData = new Date()

  viejo: boolean = false;
  filterModules = new FormControl('')
  filterSubModule = new FormControl('')
  filterItem = new FormControl('')
  constructor(private fb: FormBuilder,
    private translate: TranslateService,
    private toastr: ToastrService,
    private TrazabilidadService: TrazabilidadServices,
    private ExporterService: ExporterService,
    private loaderService: LoaderService
  ) { }

  async ngOnInit(): Promise<void> {
    await this.getModules();
    this.filtros();
  }


  filtros() {

    this.filterModules.valueChanges.subscribe(word => {
      if (word) {
        this.modules = this.modulesCopy.filter((item: any) => {
          return item.Displayname.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.modules = this.modulesCopy
      }
    });
    this.filterSubModule.valueChanges.subscribe(word => {
      if (word) {
        this.submodules = this.submodulesCopy.filter((item: any) => {
          return item.Displayname.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.submodules = this.submodulesCopy
      }
    });
    this.filterItem.valueChanges.subscribe(word => {
      if (word) {
        this.itemslist = this.itemslistCopy.filter((item: any) => {
          return item.Displayname.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.itemslist = this.itemslistCopy
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  async getModules() {
    try {
      this.loaderService.show()
      this.loaderService.text.emit({ text: 'cargando información de módulos' })
      let data = await this.TrazabilidadService.getModules();
      if (data) {
        this.modules = data
        this.modulesCopy = data
      }
      this.loaderService.hide()
    } catch (error) {
      this.loaderService.hide()
      this.toastr.error('No se encontro información de los modulos actuales')
    }


  }

  async getSubmodules(id: any) {

    try {
      this.loaderService.show()
      this.loaderService.text.emit({ text: 'cargando información de submódulos' })
      let data = await this.TrazabilidadService.getSubmodules(id);
      if (data) {
        this.submodules = data
        this.submodulesCopy = data
      }
      this.loaderService.hide()

      this.TrazabilidadService.getMenuxId(id).subscribe(respuesta => {
        this.modulesname = respuesta[0].Displayname;
      });
    } catch (error) {
      this.loaderService.hide()
      this.toastr.error('No se encontro información de los submodulos actuales')
    }
  }

  async getItems(id: any) {
    try {
      this.loaderService.show()
      this.loaderService.text.emit({ text: 'cargando información de items' })
      let data = await this.TrazabilidadService.getSubmodules(id);
      if (data) {
        this.itemslist = data
        this.itemslistCopy = data
      }
      this.loaderService.hide()

      this.TrazabilidadService.getMenuxId(id).subscribe(respuesta => {
        this.submodname = respuesta[0].Displayname;
      });
    } catch (error) {
      this.loaderService.hide()
      this.toastr.error('No se encontro información de items por subbmodulo')
    }
  }

  enviarFechaForm() {

    if (this.formaCalendarModal.invalid) {
      return Object.values(this.formaCalendarModal.controls).forEach(control => {
        control.markAsTouched();
      });
    }

    this.searchByDate();

  }

  selectAll(control: string, form: string) {

    let data : any = [];
    data.push('-1');

    if (control == 'accion') {

      for (let i = 0; i < this.acciones.length; i++) {

        data.push(this.acciones[i].nameaction);

      }

      this.formaCalendarModal.get('accion').setValue(data);

    }



  }

  selectOne(control: string, form: string) {

    if (form == 'formaCalendarModal' && (this.formaCalendarModal.get(control).value[0] == '-1' || this.formaCalendarModal.get(control).value[0] == '')) {

      this.formaCalendarModal.get(control).value.shift();
      this.formaCalendarModal.get(control).setValue(this.formaCalendarModal.get(control).value);

    } else if (form == 'formaCalendarModal' && (this.formaCalendarModal.get(control).value[0] == '-1' || this.formaCalendarModal.get(control).value[0] == '')) {

      this.formaCalendarModal.get(control).value.shift();
      this.formaCalendarModal.get(control).setValue(this.formaCalendarModal.get(control).value);
    }
  }

  async searchByDate() {

    var desde = dayjs(this.formaCalendarModal.get('desde').value).format('YYYY-MM-DD');
    var hasta = dayjs(this.formaCalendarModal.get('hasta').value).format('YYYY-MM-DD');

    let namemod = this.modulesname;
    let namesubmod;
    var item;
    var accion;

    if (this.submodname != null) {
      namesubmod = this.submodname;
    } else {
      namesubmod = null;
    }
    if (this.formaCalendarModal.get('item').value != "") {
      item = (this.formaCalendarModal.get('item').value);
    } else {
      item = null;
    }
    if (this.formaCalendarModal.get('accion').value == "") {
      accion = null;
    } else {
      accion = this.formaCalendarModal.get('accion').value;
    }

    var jsonTexto: any = '{"fechaini":"' + desde + '","fechafinal":"' + hasta + '","modulo":"' + namemod + '","submod":"' + namesubmod + '","item":"' + item + '","accion":"' + accion + '"}';

    await this.TrazabilidadService.getTrazabilidadLogs(jsonTexto).subscribe(res => {
      console.log(res)
      const filtrarDataTable: any[] = res;
      this.dataTableBody = filtrarDataTable.map(x => {
        return { Fecha: x.fecha, Hora: x.hora, Módulo: x.modulo, Submódulo: x.submodulo, Item: x.item, Accion: x.metodo, 'Datos Nuevos': x.datos, 'Datos Anteriores' : x.usuario, Usuarios: x.usuario};
      });
      this.dataSource = new MatTableDataSource(res);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.ver = true;
      this.verbtnexcel = true;

      if (res.length == 0) {
        this.toastr.error('No se encontraron datos');
        this.ver = false;
        this.verbtnexcel = false;
        this.formaCalendarModal.reset();
      }

    }, (err): any => {

    })
  }

  name = 'ExcelSheet.xlsx';
  exportToExcel(): void {
    console.log(this.dataSource.data)
    let Modulo;
    let Submodulo;
    let Metodo;

    const filteredData = this.dataSource.data.map(item => {
      const data = {
        Fecha: item.fecha,
        Hora: item.hora,
        Modulo: item.modulo,
        Submodulo: item.submodulo,
        Item: item.item,
        Metodo: item.metodo,
        Datos: item.datos,
        Usuario: item.usuario,
        DatosAnteriores: item.datosAnteriores || 'Sin datos anteriores'
      };
      Modulo = item.modulo;
      Submodulo = item.submodulo;
      Metodo = item.metodo;

      return data;
    });

    this.ExporterService.exportToExcel(filteredData, `${Modulo} | ${Submodulo} | ${Metodo} | `);

  }

  //------------------------
  // MODAL
  //------------------------
  closeVentana(): void {
    this.ventanaModal.hide();
    //this.itemInd = null;
  }

}
