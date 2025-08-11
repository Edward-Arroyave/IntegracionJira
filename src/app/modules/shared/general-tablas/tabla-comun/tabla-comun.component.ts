import { Component, OnChanges, OnInit, SimpleChanges, ViewChild, effect, input, output } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ImageCdnPipe } from '@app/modules/core/pipes/image-cdn.pipe';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-tabla-comun',
  standalone: true,
  imports: [
    MatSortModule,
    MatSlideToggleModule,
    MatPaginatorModule,
    TranslateModule,
    ImageCdnPipe,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatIcon
  ],
  templateUrl: './tabla-comun.component.html',
  styleUrl: './tabla-comun.component.css'
})
export class TablaComunComponent implements OnInit{

  titulo = input<string>();

  columnsHeader=input<string[]>([],{alias:'cabeceros'});
  columnsBody=input<any[]>([],{alias:'info-tabla'});
  viewButton=input<boolean>(true,{alias:'viewButton'});
  viewButton2=input<boolean>(false,{alias:'viewButton2'});

  displayedColumns: string[] = [];
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  onChangeStatus= output<any[]>(); // data-row y segunda valor booleano
  onEdit = output<number>(); // data-row
  onEditPass = output<any>(); // data-row
  onDelete = output<number>(); // data-row
  onCreate = output<boolean>(); // flag para abrir modal
  onPermissions = output<boolean>(); // flag para abrir modal
  onButton2 = output<boolean>(); // flag para abrir modal
  onDownload = output<boolean>(); // flag para abrir modal

  constructor(){
    effect(()=>{
      this.displayedColumns = this.columnsHeader();
      this.dataSource = new MatTableDataSource(this.columnsBody());
      // this.dataSource = new MatTableDataSource(this.columnsBody().map(x => Object.keys(x).map((z, i) => x[z])));
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    })
  }
  
  ngOnInit(): void {
    this.displayedColumns = this.columnsHeader();
    this.dataSource = new MatTableDataSource(this.columnsBody());
    // this.dataSource = new MatTableDataSource(this.columnsBody().map(x => Object.keys(x).map((z,i) => x[z])));
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  emitonButton2(){
    this.onButton2.emit(true);
  }

  emitEdit(data: any) {
    this.onEdit.emit(data);
  }

  emitEditPass(data: any) {
    this.onEditPass.emit(data);
  }

  emitPermissions(data:any){
    this.onPermissions.emit(data);
  }

  emitDelete(data:any){
    this.onDelete.emit(data);
  }

  emitStatus(data:any,valor:boolean){
    if (data.Active != undefined) data.active = valor;
    this.onChangeStatus.emit([data, valor]);
  }

  emitCreate(flag:boolean){
    this.onCreate.emit(flag);
  }

  emitDownload(flag:boolean){
    this.onDownload.emit(flag);
  }

}