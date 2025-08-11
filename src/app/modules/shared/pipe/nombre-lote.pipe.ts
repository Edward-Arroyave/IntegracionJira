import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';

@Pipe({
    name: 'nombreLote',
    standalone: true
})
export class NombreLotePipe implements PipeTransform {

  transform(value: string): unknown {
    return value.split('|')[1]
  }

}
