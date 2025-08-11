import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';

@Pipe({
    name: 'NombreSeccion',
    standalone: true
})
export class NombreSeccionPipe implements PipeTransform {

  transform(value: string): unknown {
    return value.split('|')[1]
  }

}