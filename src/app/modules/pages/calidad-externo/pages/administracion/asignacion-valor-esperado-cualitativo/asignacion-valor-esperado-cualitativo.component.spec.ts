import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AsignacionValorEsperadoCualitativoComponent } from './asignacion-valor-esperado-cualitativo.component';

describe('AsignacionValorEsperadoCualitativoComponent', () => {
  let component: AsignacionValorEsperadoCualitativoComponent;
  let fixture: ComponentFixture<AsignacionValorEsperadoCualitativoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
    imports: [AsignacionValorEsperadoCualitativoComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AsignacionValorEsperadoCualitativoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
