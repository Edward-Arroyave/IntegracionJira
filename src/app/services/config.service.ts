import { Inject, Injectable } from '@angular/core';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { environment } from '@environment/environment';
import { IAppConfig } from '@app/app-config';
import { DOCUMENT } from '@angular/common';
import { lastValueFrom } from 'rxjs';



@Injectable({
    providedIn: "root",
})
export class AppConfig {
    static settings: IAppConfig;
    constructor(private http: HttpClient, @Inject(DOCUMENT) private document: Document, private handler: HttpBackend) { }
   
    /*
    load() {
        const urlActual = this.document.location.href.split("#")[0];

        let dataClientes = import.meta.env.NG_APP_CLIENTS;
        let clientes = JSON.parse(dataClientes);

        const jsonFile = `${environment.configuracion}.json`;
        
        const cliente: any = clientes.filter(datos => urlActual.includes(datos.sitio));
        
        AppConfig.settings = cliente[0] as IAppConfig;
    }
        */
       
    load() {
        const jsonFile = `${environment.configuracion}.json`;
        const urlActual = this.document.location.href.split("#")[0];
        return new Promise<void>((resolve, reject) => {
            
            lastValueFrom(this.http.get(jsonFile)).then((response: any) => {
                
                const data: any[] = response;
                const cliente: any = data.filter(datos => urlActual.includes(datos.sitio));

                AppConfig.settings = cliente[0] as IAppConfig;
                resolve();
            }).catch((response: any) => {
                reject(`Could not load file '${jsonFile}': ${JSON.stringify(response)}`);
            });
        });
    }
}
