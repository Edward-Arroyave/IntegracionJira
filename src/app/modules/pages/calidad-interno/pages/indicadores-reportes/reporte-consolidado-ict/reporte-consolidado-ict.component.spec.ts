import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteConsolidadoICTComponent } from './reporte-consolidado-ict.component';

describe('ReporteConsolidadoICTComponent', () => {
  let component: ReporteConsolidadoICTComponent;
  let fixture: ComponentFixture<ReporteConsolidadoICTComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
    imports: [ReporteConsolidadoICTComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReporteConsolidadoICTComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
