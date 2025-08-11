import { Routes } from '@angular/router';
import { ProveedoresComponent } from './proveedores/proveedores.component';
import { MaterialControlComponent } from './material-control/material-control.component';
import { LotesComponent } from './lotes/lotes.component';
import { UnidadesComponent } from './unidades/unidades.component';
import { GestionReactivosqceComponent } from './gestion-reactivosqce/gestion-reactivosqce.component';
import { MetodosComponent } from './metodos/metodos.component';
import { AnalizadoresComponent } from './analizadores/analizadores.component';
import { ClientesComponent } from './clientes/clientes.component';
import { SeccionesComponentQce } from './secciones/secciones.component';
import { CrearProgramaComponent } from './crear-programa/crear-programa.component';
import { AnalitosComponent } from './analitos/analitos.component';
import { ConfiguracionResultadosComponent } from './configuracion-resultados/configuracion-resultados.component';
import { FuentesQceComponent } from './fuentes/fuentes-qce.component';
import { ObjetivosCalidadComponent } from './objetivos-calidad/objetivos-calidad.component';
import { CriteriosDatosAberrantesComponent } from './criterios-datos-aberrantes/criterios-datos-aberrantes.component';
import { DiccionarioResultadosQceService } from '@app/services/calidad-externo/diccionarioResultadosQce.service';
import { DiccionarioResultadosQceComponent } from './diccionario-resultados-qce/diccionario-resultados-qce.component';

export const configuracionExternoRoutes: Routes = [
    { path: 'proveedores', component: ProveedoresComponent, },
    { path: 'material-control', component: MaterialControlComponent, },
    { path: 'lotes', component: LotesComponent, },
    { path: 'unidades', component: UnidadesComponent, },
    { path: 'reactivos', component: GestionReactivosqceComponent },
    { path: 'metodos', component: MetodosComponent },
    { path: 'analizadores', component: AnalizadoresComponent },
    { path: 'cliente', component: ClientesComponent },
    { path: 'secciones', component: SeccionesComponentQce },
    { path: 'creacion-programa', component: CrearProgramaComponent, },
    { path: 'analitos', component: AnalitosComponent },
    { path: 'configuracion-resultados', component: ConfiguracionResultadosComponent },
    { path: 'fuentes', component: FuentesQceComponent },
    { path: 'objetivos-calidad', component: ObjetivosCalidadComponent },
    { path: 'diccionario-resultados', component: DiccionarioResultadosQceComponent },
    { path: 'datos-aberrantes', component: CriteriosDatosAberrantesComponent },

];
