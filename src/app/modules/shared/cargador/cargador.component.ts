import { Component } from '@angular/core';

import {
    Router,
    Event as RouterEvent,
    NavigationStart,
    NavigationEnd,
    NavigationCancel,
    NavigationError,
    Scroll
} from '@angular/router';
import { NgIf } from '@angular/common';


@Component({
    selector: 'app-cargador',
    templateUrl: './cargador.component.html',
    styleUrls: ['./cargador.component.scss'],
    standalone: true,
    imports: [NgIf]
})

export class CargadorComponent {

    public showOverlay = true;
 
    constructor(private router: Router) {

        router.events.subscribe((event: any) => {
            this.navigationInterceptor(event);
        });
    }

    navigationInterceptor(event: any): void {

        if (event  instanceof NavigationStart) {
            this.showOverlay = true;
        }
        if (event.routerEvent instanceof NavigationEnd) {
            this.showOverlay = false;
        }
        if (event  instanceof NavigationCancel) {
            this.showOverlay = false;
        }
        if (event  instanceof NavigationError) {
            this.showOverlay = false;
        }
    }

}
