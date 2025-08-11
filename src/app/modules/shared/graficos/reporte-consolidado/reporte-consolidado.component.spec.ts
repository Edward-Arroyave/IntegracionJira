import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteConsolidadoComponent } from './reporte-consolidado.component';

describe('ReporteConsolidadoComponent', () => {
  let component: ReporteConsolidadoComponent;
  let fixture: ComponentFixture<ReporteConsolidadoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
    imports: [ReporteConsolidadoComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReporteConsolidadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
