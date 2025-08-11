import { Routes } from '@angular/router';
import { IngresoDatosComponent } from './ingreso-datos/ingreso-datos.component';
import { IngresoDatosCualitativoComponent } from './ingreso-datos-cualitativo/ingreso-datos-cualitativo.component';
import { IngresoDatosCuantitativoMultiComponent } from './ingreso-datos-cuantitativo-multi/ingreso-datos-cuantitativo-multi.component';
import { IngresoDatosCualitativoMultiComponent } from './ingreso-datos-cualitativo-multi/ingreso-datos-cualitativo-multi.component';
import { IngresoDatosGraficosComponent } from './ingreso-datos-graficos/ingreso-datos-graficos.component';

export const ingresoInternoRoutes: Routes = [        
    { path: 'cuantitativo', component: IngresoDatosComponent,data:{filtro:{}} },
    { path: 'cualitativos', component: IngresoDatosCualitativoComponent,data:{filtro:{}} },
    { path: 'cuanti-multi', component: IngresoDatosCuantitativoMultiComponent },
    { path: 'cuali-multi', component: IngresoDatosCualitativoMultiComponent },
    { path: 'ingreso-graficos', component: IngresoDatosGraficosComponent},

];