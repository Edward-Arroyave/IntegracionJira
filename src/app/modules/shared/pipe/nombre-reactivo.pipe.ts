import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';

@Pipe({
    name: 'NombreReactivo',
    standalone: true
})
export class NombreReactivoPipe implements PipeTransform {

  transform(value: string): unknown {
   
    return value.split('|')[1]
  }

}