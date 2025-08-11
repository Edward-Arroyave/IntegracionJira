import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';

@Pipe({
    name: 'NombreAnalyzer',
    standalone: true
})
export class NombreAnalyzerPipe implements PipeTransform {

  transform(value: string): unknown {
   
    return value.split('|')[1]
  }

}