import { EventEmitter, Injectable, Output } from '@angular/core';
import { SpinnerText } from '@app/modules/shared/loader/loader.component';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {

  isLoading$ = new Subject<boolean>();
  alert$ = this.isLoading$.asObservable();

  @Output() text: EventEmitter<SpinnerText> = new EventEmitter()
  @Output() next: EventEmitter<any> = new EventEmitter();

  show(): void {
    this.isLoading$.next(true);
    this.next.emit(true);
  }

  hide(): void {
    console.log('cerro');
    
    this.text.emit({ text: "", text1: "", text2: "" })
    this.isLoading$.next(false);
    this.next.emit(true);
  }

  constructor() { }
}
