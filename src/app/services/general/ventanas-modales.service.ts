import { Injectable, TemplateRef } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BehaviorSubject } from 'rxjs';

export interface dataModal {
  state: boolean,
  data?: any,
}

@Injectable({
  providedIn: 'root'
})
export class VentanasModalesService {

  vantanaModal: BsModalRef;
  private modal$: BehaviorSubject<dataModal> = new BehaviorSubject({ state: false });

  constructor() { }

  get instanceModal$() {
    return this.modal$;
  }

  public openModal(data) {
    const _data: dataModal = {
      state: true,
      data,
    }
    this.modal$.next(_data);
  }

  public closeModal() {
    this.modal$.next({ state: false });
  }

}
