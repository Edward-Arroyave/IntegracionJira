import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteDesempenioCualitativoClienteComponent } from './reporte-desempenio-cualitativo-cliente.component';

describe('ReporteDesempenioCualitativoClienteComponent', () => {
  let component: ReporteDesempenioCualitativoClienteComponent;
  let fixture: ComponentFixture<ReporteDesempenioCualitativoClienteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
    imports: [ReporteDesempenioCualitativoClienteComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReporteDesempenioCualitativoClienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
