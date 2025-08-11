import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'imageCdn',
    standalone: true
})
export class ImageCdnPipe implements PipeTransform {

  transform(value: string): string {
    if (!!value) {
      return './assets/rutas/iconos/'.concat(value);
    }
  }

}
