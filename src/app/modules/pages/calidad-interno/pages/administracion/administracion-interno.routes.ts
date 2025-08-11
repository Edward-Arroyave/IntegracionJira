import { Routes } from '@angular/router';
import { GestionTestComponent } from './gestion-test/gestion-test.component';
import { CriteriosAceptacionComponent } from './criterios-aceptacion/criterios-aceptacion.component';
import { ConfiguracionObjetivosAnalitoComponent } from './configuracion-objetivos-analito/configuracion-objetivos-analito.component';
import { ValoresDianaComponent } from './valores-diana/valores-diana.component';
import { ConfiguracionWestgardComponent } from './configuracion-westgard/configuracion-westgard.component';
import { ConfiguracionMediaDsComponent } from './configuracion-media-ds/configuracion-media-ds.component';
import { FiltroGrubbsInternoComponent } from './FiltrosGrubbsInt/filtros-grubbs-interno.component';
import { PorcentajeConfianzaComponent } from './porcentaje-confianza/porcentaje-confianza.component';

export const administracionInternoRoutes: Routes = [
    { path: 'gestion-test', component: GestionTestComponent },
    { path: 'criterios-aceptacion', component: CriteriosAceptacionComponent },
    { path: 'metas-calidad', component: ConfiguracionObjetivosAnalitoComponent },
    { path: 'objetivo-calidad', component: ValoresDianaComponent },
    { path: 'configuracion-westgard', component: ConfiguracionWestgardComponent },
    { path: 'configuracion-media-ds', component: ConfiguracionMediaDsComponent },
    { path: 'filtros-grubbs', component: FiltroGrubbsInternoComponent},
    { path: 'porcentaje-confianza', component: PorcentajeConfianzaComponent },
        
];