import { Injectable } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MenuLevel3 } from '@app/Models/MenuLevel3';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  public loader: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public refreshMenu: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public menuAll: BehaviorSubject<MenuLevel3[]> = new BehaviorSubject<MenuLevel3[]>([]);

  constructor() { }

  showLoader(show: boolean) {
    this.loader.next(show);
  }

  refresh(item: boolean) {
    this.refreshMenu.next(item);
  }

  customTextPaginator(paginator: MatPaginator): void {
    if (paginator === null || paginator === undefined) { return; }
    paginator._intl.itemsPerPageLabel = 'Elementos por página';
    paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
      const start = page * pageSize + 1;
      const end = (page + 1) * pageSize;
      return `${start} - ${end} de ${length}`;
    };
  }

  set setMenu(menu: MenuLevel3[]) {
    this.menuAll.next(menu);
  }

  get getMenu(): Observable<MenuLevel3[]> {
    return this.menuAll;
  }

}
