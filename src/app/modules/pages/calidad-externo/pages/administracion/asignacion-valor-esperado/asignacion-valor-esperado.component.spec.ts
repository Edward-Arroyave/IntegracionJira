import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AsignacionValorEsperadoComponent } from './asignacion-valor-esperado.component';

describe('AsignacionValorEsperadoComponent', () => {
  let component: AsignacionValorEsperadoComponent;
  let fixture: ComponentFixture<AsignacionValorEsperadoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
    imports: [AsignacionValorEsperadoComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AsignacionValorEsperadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
