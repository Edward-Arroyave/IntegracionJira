import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteDesempenoCualitativoComponent } from './reporte-desempeno-cualitativo.component';

describe('ReporteDesempenoCualitativoComponent', () => {
  let component: ReporteDesempenoCualitativoComponent;
  let fixture: ComponentFixture<ReporteDesempenoCualitativoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
    imports: [ReporteDesempenoCualitativoComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReporteDesempenoCualitativoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
