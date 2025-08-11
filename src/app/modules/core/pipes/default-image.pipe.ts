import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'defaultImage',
    standalone: true
})
export class DefaultImagePipe implements PipeTransform {

  transform(value: string, ...args: unknown[]): string {

    let ultimoCaracter: string = value.slice(-1);

    if( ultimoCaracter == ',' ){

      return `assets/imagenes/carga_logo.png`;

    } else {

      return value;

    }

  }

}
