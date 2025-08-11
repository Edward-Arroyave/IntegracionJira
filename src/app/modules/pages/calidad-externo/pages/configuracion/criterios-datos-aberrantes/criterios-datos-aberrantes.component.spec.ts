import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CriteriosDatosAberrantesComponent } from './criterios-datos-aberrantes.component';

describe('CriteriosDatosAberrantesComponent', () => {
  let component: CriteriosDatosAberrantesComponent;
  let fixture: ComponentFixture<CriteriosDatosAberrantesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
    imports: [CriteriosDatosAberrantesComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CriteriosDatosAberrantesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
