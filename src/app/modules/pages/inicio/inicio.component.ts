import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ReportesService } from '@app/services/general/reportes.service';
import { UsuariosService } from '@app/services/usuarios/usuarios.service';
import { ImageCdnPipe } from '../../core/pipes/image-cdn.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { AlertWelcomeComponent } from '../../shared/alert-welcome/alert-welcome.component';
import { NgIf } from '@angular/common';
import { LoaderService } from '@app/services/loader/loader.service';


@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css'],
  standalone: true,
  imports: [NgIf, AlertWelcomeComponent, TranslateModule, ImageCdnPipe]
})
export class InicioComponent implements OnInit {
  totales: any;
  welcome = false;
  urlSelected: string;
  constructor(public router: Router, private reportesService: ReportesService, private usuariosService: UsuariosService, private loaderSvc : LoaderService) { }

  ngOnInit(): void {

    this.usuariosService.sentEmail().subscribe();
    this.cargarReportes();


    this.welcome = true;
    this.loaderSvc.show()
    this.loaderSvc.text.emit({text: 'Cargando inicio...'})
    setTimeout(() => {
      this.welcome = false;
      this.calcularAltoCarta()
      this.calcularLineas()
      this.loaderSvc.hide()
    }, 1000)


  }

  @HostListener('window:resize', ['$event'])
  Resolucion(event: any): void {
    this.calcularAltoCarta()
    this.calcularLineas()
  }


  cargarReportes() {
    this.reportesService.getAll('').subscribe(respuesta => {
      this.totales = respuesta;
    });
  }
  public navigate(url: string): void {
      this.router.navigate(['/panel/' + url]);
      this.urlSelected = url;
  }

  calcularAltoCarta() {
    var content = $(".hoja");
    var containermenu = $(".container_menu");
    containermenu.css('height', `calc(${content.height() - 60}px)`)
  }

  calcularLineas() {

    let elements = [];

    for (let index = 1; index < 6; index++) {

     let element = (document.querySelector(`.float${index}`) as HTMLElement);
     let elemento2 = (document.querySelector(`.float${index+1}`) as HTMLElement);
     let line = (document.querySelector(`.line${index}`) as HTMLElement);
     let rect1 = element.getBoundingClientRect();
     let rect2 = elemento2.getBoundingClientRect();
     let deltaY = rect2.top - rect1.top;
     let deltaX = rect2.left - rect1.left;
     let anguloRad = Math.atan2(deltaY, deltaX);
     let anguloGrados = anguloRad * (180 / Math.PI);
     line.style.transform = 'rotate(' + anguloGrados + 'deg)';
     setTimeout(() => {
       line.style.opacity = '1';
     }, 500);
    }

    // Obtener las coordenadas de los elementos

    // Calcular la distancia vertical

  }
}
