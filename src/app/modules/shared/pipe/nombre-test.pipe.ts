import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';

@Pipe({
    name: 'nombreTest',
    standalone: true
})
export class NombreTestPipe implements PipeTransform {

    transform(value: string): unknown {
        return value.split(',')[1]
    }

}
