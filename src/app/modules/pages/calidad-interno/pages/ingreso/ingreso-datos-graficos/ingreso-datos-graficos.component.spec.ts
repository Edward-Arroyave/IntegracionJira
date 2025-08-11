import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IngresoDatosGraficosComponent } from './ingreso-datos-graficos.component';

describe('IngresoDatosGraficosComponent', () => {
  let component: IngresoDatosGraficosComponent;
  let fixture: ComponentFixture<IngresoDatosGraficosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
    imports: [IngresoDatosGraficosComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IngresoDatosGraficosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
