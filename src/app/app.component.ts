import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SharedService } from './services/shared.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { VentanasModalesComponent } from './modules/shared/ventanas-modales/ventanas-modales.component';
import { CargadorComponent } from './modules/shared/cargador/cargador.component';
import { NgIf } from '@angular/common';
import { LoaderComponent } from './modules/shared/loader/loader.component';
import { LoaderService } from './services/loader/loader.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    standalone: true,
    imports: [NgIf, CargadorComponent, VentanasModalesComponent, RouterOutlet, LoaderComponent]
})
export class AppComponent implements OnInit {

  position = 'top-center';
  showLoader = false;

  private config: {version: string};

  constructor(
    private router: Router,
    private translate: TranslateService,
    public sharedService: SharedService,
    private httpClient: HttpClient,
    public loadersvc : LoaderService,
  ) {
    this.translate.setDefaultLang('es');
  }

  /*
  ngOnInit() {
    let dataClientes = import.meta.env.NG_APP_CLIENTS;
    let clientes = JSON.parse(dataClientes);
    this.config = clientes;
    const headers = new HttpHeaders()
    .set('Cache-Control', 'no-cache')
    .set('Pragma', 'no-cache')
    
    if (clientes[0].version !== this.config[0].version) {
      location.reload();
    }

    this.sharedService.loader.subscribe(s => {
      setTimeout(() => {
        this.showLoader = s;
      }, 0);
    });

    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        setTimeout(() => {
       //   this.sharedService.showLoader(false);
          this.loadersvc.hide()
        }, 300);
        return;
      }
      window.scrollTo(0, 0);
      this.loadersvc.show()
    //  this.sharedService.showLoader(true);
    });

  }
    */

    ngOnInit() {

    this.config = require("./../assets/config.json");
    const headers = new HttpHeaders()
    .set('Cache-Control', 'no-cache')
    .set('Pragma', 'no-cache')
    this.httpClient
    .get<{ version: string }>("./../assets/config.json", {headers})
    .subscribe(config => {

      if (config[0].version !== this.config[0].version)
      {
        location.reload();
      }
    });
    this.sharedService.loader.subscribe(s => {
      setTimeout(() => {
        this.showLoader = s;
      }, 0);
    });

    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        setTimeout(() => {
       //   this.sharedService.showLoader(false);
          this.loadersvc.hide()
        }, 300);
        return;
      }
      window.scrollTo(0, 0);
      this.loadersvc.show()
    //  this.sharedService.showLoader(true);
    });

  }

}
