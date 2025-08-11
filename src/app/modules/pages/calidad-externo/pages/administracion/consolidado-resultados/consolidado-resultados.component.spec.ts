import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsolidadoResultadosComponent } from './consolidado-resultados.component';

describe('ConsolidadoResultadosComponent', () => {
  let component: ConsolidadoResultadosComponent;
  let fixture: ComponentFixture<ConsolidadoResultadosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
    imports: [ConsolidadoResultadosComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsolidadoResultadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
