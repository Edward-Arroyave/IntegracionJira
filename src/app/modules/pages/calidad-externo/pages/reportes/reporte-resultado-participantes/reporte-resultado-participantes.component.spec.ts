import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteResultadoParticipantesComponent } from './reporte-resultado-participantes.component';

describe('ReporteResultadoParticipantesComponent', () => {
  let component: ReporteResultadoParticipantesComponent;
  let fixture: ComponentFixture<ReporteResultadoParticipantesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
    imports: [ReporteResultadoParticipantesComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReporteResultadoParticipantesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
