import { Routes } from '@angular/router';
import { UnidadesMedidaComponent } from './unidades-medida/unidades-medida.component';
import { SeccionesComponent } from './secciones/secciones.component';
import { GestionAnaliticosComponent } from './gestion-analiticos/gestion-analiticos.component';
import { GestionLotesComponent } from './gestion-lotes/gestion-lotes.component';
import { GestionMaterialesControlComponent } from './gestion-materiales-control/gestion-materiales-control.component';
import { GestionReactivosComponent } from './gestion-reactivos/gestion-reactivos.component';
import { GestionMetodosComponent } from './gestion-metodos/gestion-metodos.component';
import { GestionCasasComercialesComponent } from './gestion-casas-comerciales/gestion-casas-comerciales.component';
import { GestionInstrumentosLabComponent } from './gestion-instrumentos-lab/gestion-instrumentos-lab.component';
import { GestionAccionesCorrectivasComponent } from './gestion-acciones-correctivas/gestion-acciones-correctivas.component';
import { GestionFuentesComponent } from './gestion-fuentes/gestion-fuentes.component';
import { GestionLotMaterialControlComponent } from './gestion-lot-material-control/gestion-lot-material-control.component';
import { DiccionarioResultadosComponent } from './diccionario-resultados/diccionario-resultados.component';
import { DatosAberrantesComponent } from './datos-aberrantes/datos-aberrantes.component';

export const configuracionInternoRoutes: Routes = [
    { path: 'unidades-medida', component: UnidadesMedidaComponent },
    { path: 'secciones', component: SeccionesComponent },
    { path: 'gestion-analiticos', component: GestionAnaliticosComponent },
    { path: 'gestion-lotes', component: GestionLotesComponent },
    { path: 'gestion-materiales-control', component: GestionMaterialesControlComponent },
    { path: 'gestion-reactivos', component: GestionReactivosComponent },
    { path: 'gestion-metodos', component: GestionMetodosComponent },
    { path: 'gestion-casas-comerciales', component: GestionCasasComercialesComponent },
    { path: 'gestion-instrumentos-lab', component: GestionInstrumentosLabComponent },
    { path: 'gestion-acciones-correctivas', component: GestionAccionesCorrectivasComponent },
    { path: 'gestion-fuentes', component: GestionFuentesComponent },
    { path: 'lot-material-control', component: GestionLotMaterialControlComponent },
    { path: 'diccionario-resultados', component: DiccionarioResultadosComponent },
    { path: 'datos-aberrantes', component: DatosAberrantesComponent},
    
];