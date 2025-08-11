import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PorcentajeConfianzaComponent } from './porcentaje-confianza.component';

describe('PorcentajeConfianzaComponent', () => {
  let component: PorcentajeConfianzaComponent;
  let fixture: ComponentFixture<PorcentajeConfianzaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
    imports: [PorcentajeConfianzaComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PorcentajeConfianzaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
