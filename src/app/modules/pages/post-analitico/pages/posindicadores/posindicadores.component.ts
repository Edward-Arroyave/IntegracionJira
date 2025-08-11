import { Component, OnInit } from '@angular/core';
import { ImageCdnPipe } from '../../../../core/pipes/image-cdn.pipe';
import { PrecisionResultadosComponent } from './precision-resultados/precision-resultados.component';
import { RecomendacionLaboratorioComponent } from './recomendacion-laboratorio/recomendacion-laboratorio.component';
import { ResultadoPacienteComponent } from './resultado-paciente/resultado-paciente.component';
import { ServiciosLaboratorioClinicoComponent } from './servicios-laboratorio-clinico/servicios-laboratorio-clinico.component';
import { TiempoLiberacionResultadosComponent } from './tiempo-liberacion-resultados/tiempo-liberacion-resultados.component';
import { TiempoRespuestaTroponinaComponent } from './tiempo-respuesta-troponina/tiempo-respuesta-troponina.component';
import { TiempoComunicarValoresCriticosComponent } from './tiempo-comunicar-valores-criticos/tiempo-comunicar-valores-criticos.component';
import { CriticosMedicoTratanteComponent } from './criticos-medico-tratante/criticos-medico-tratante.component';
import { NgClass, NgIf } from '@angular/common';

@Component({
    selector: 'app-posindicadores',
    templateUrl: './posindicadores.component.html',
    styleUrls: ['./posindicadores.component.css'],
    standalone: true,
    imports: [NgClass, NgIf, CriticosMedicoTratanteComponent, TiempoComunicarValoresCriticosComponent, TiempoRespuestaTroponinaComponent, TiempoLiberacionResultadosComponent, ServiciosLaboratorioClinicoComponent, ResultadoPacienteComponent, RecomendacionLaboratorioComponent, PrecisionResultadosComponent, ImageCdnPipe]
})
export class PosindicadoresComponent implements OnInit {


  tipoReporte: number = 1;
  tituloInd: string = 'Informe de valores críticos al médico tratante(QT1)';
  
  constructor() { }

  ngOnInit(): void {
  }
  
  selectedIndicador(itemIndicador: Document, pElement: HTMLHRElement, tipo: number){
    this.tipoReporte = tipo;
    this.tituloInd = pElement.innerText;    
  }
  desplazarInterpretacionesDerecha(campo:any){

    // this.renderer2.setStyle(this.moverInterpretaciones.nativeElement,'transform','translate(100%)');

    let div = document.getElementById(campo);
   console.log("Div",campo);

    if(campo){

      campo.scrollLeft += 900;

    }

  }


  desplazarInterpretacionesIzquierda(campo:any){

    // this.renderer2.setStyle(this.moverInterpretaciones.nativeElement,'transform','translate(100%)');

    let div = document.getElementById(campo);
   console.log("Div",campo);

    if(campo){

      campo.scrollLeft -= 900;

    }

  }

}
