import { enableProdMode, APP_INITIALIZER, importProvidersFrom } from '@angular/core';
import { environment } from './environments/environment';
import { AppComponent } from './app/app.component';
import {  bootstrapApplication, BrowserModule } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS, MAT_MOMENT_DATE_FORMATS } from '@angular/material-moment-adapter';
import { MAT_DATE_LOCALE, DateAdapter, MAT_DATE_FORMATS, MatNativeDateModule } from '@angular/material/core';
import { AuthInterceptorService } from './app/services/auth-interceptor.service';
import { HTTP_INTERCEPTORS, withInterceptorsFromDi, provideHttpClient, HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { AppConfig } from './app/services/config.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { TranslateLoader, TranslateModule, TranslateService} from '@ngx-translate/core';
import 'zone.js';
import { provideRouter } from '@angular/router';
import { mainRoutes } from '@app/app.routes';
import { ToastrModule } from 'ngx-toastr';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { HttpLoaderFactory } from '@app/app.module';

import { ModalModule } from 'ngx-bootstrap/modal';
import { registerLocaleData } from '@angular/common';
import localePy from '@angular/common/locales/es-PY';
registerLocaleData(localePy, 'es');
if (environment.production) {
    enableProdMode();
    window.console.log = () => { }
}

bootstrapApplication(AppComponent, {
    providers: [
        provideRouter(mainRoutes),
        importProvidersFrom(
        ToastrModule.forRoot(),
         MatDatepickerModule, MatNativeDateModule, TranslateModule.forRoot({
                loader: {
                    provide: TranslateLoader,
                    useFactory: HttpLoaderFactory,
                    deps: [HttpClient]
                }
            }
        )
        , 
        // BrowserModule, 
        // CommonModule, 
        // SharedModule,
        // NgbModule,
        // ReactiveFormsModule,
        // FormsModule,
        ModalModule.forRoot(),
        // DragDropModule, MatTooltipModule
        ),
        TranslateService,
        JwtHelperService,
        AppConfig,
        DatePipe,
        {
            provide: APP_INITIALIZER,
            useFactory: (appConfigService: AppConfig) => () => appConfigService.load(),
            deps: [AppConfig],
            multi: true
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptorService,
            multi: true
        },
        {
            provide: MAT_DATE_LOCALE,
            useValue: 'es'
        },
        {
            provide: DateAdapter,
            useClass: MomentDateAdapter,
            deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
        },
        {
            provide: MAT_DATE_FORMATS,
            useValue: MAT_MOMENT_DATE_FORMATS
        },
        provideAnimations(),
        provideHttpClient(withInterceptorsFromDi())
    ]
})
    .catch(err => console.error(err));
