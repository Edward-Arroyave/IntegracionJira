import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';

@Pipe({
    name: 'NombreControlmaterial',
    standalone: true
})
export class NombreControlmaterialPipe implements PipeTransform {

  transform(value: string): unknown {
    return value.split('|')[1]
  }

}