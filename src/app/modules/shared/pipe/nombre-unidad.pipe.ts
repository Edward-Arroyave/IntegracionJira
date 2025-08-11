import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';

@Pipe({
    name: 'NombreUnidad',
    standalone: true
})
export class NombreUnidadPipe implements PipeTransform {

  transform(value: string): unknown {
   
    return value.split('|')[1]
  }

}