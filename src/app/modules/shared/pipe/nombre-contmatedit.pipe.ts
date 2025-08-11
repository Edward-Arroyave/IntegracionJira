import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';

@Pipe({
    name: 'NombreControlmaterialEdit',
    standalone: true
})
export class NombreControlmaterialEditPipe implements PipeTransform {

  transform(value: string): unknown {
    return value.split('|')[1]
  }

}