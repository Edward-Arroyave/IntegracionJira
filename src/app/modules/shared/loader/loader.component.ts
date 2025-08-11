import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { LoaderService } from '@app/services/loader/loader.service';

export class SpinnerText {
  text: string;
  text1?: string;
  text2?: string;
  class?: string;
}

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.css'

})
export class LoaderComponent {

  isLoading$ = this.loaderSvc.isLoading$;
  porcentajeMax: number = 0;
  stateLoad: boolean;
  dataText: SpinnerText = new SpinnerText();

  constructor(private loaderSvc: LoaderService, private readonly changeDetectorRef: ChangeDetectorRef) {
    this.loaderSvc.next.subscribe(() => {
      this.porcentajeMax = 0;
    });
  }

  ngAfterViewChecked(): void {
    this.changeDetectorRef.detectChanges();
  }

  ngOnInit(): void {
    this.changeDetectorRef.detectChanges();
    this.loaderSvc.alert$.subscribe(resp => {
      this.stateLoad = resp;
    });

    this.loaderSvc.text.subscribe(resp => {
      this.dataText = resp;
    })
    this.calcPorcentaje();
  }

  calcPorcentaje() {
    if (this.porcentajeMax < 100) {
      this.porcentajeMax++;
      setTimeout(() => this.calcPorcentaje(), 550);
    } else {
      // Reinicia el contador a 0 cuando alcanza 100
      this.porcentajeMax = 0;

      // Llama a la función nuevamente para iniciar el conteo desde 0
      setTimeout(() => this.calcPorcentaje(), 550);
    }
  }



}
