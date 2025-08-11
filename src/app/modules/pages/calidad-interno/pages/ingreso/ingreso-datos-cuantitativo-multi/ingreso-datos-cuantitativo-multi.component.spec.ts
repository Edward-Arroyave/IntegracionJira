import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IngresoDatosCuantitativoMultiComponent } from './ingreso-datos-cuantitativo-multi.component';

describe('IngresoDatosCuantitativoMultiComponent', () => {
  let component: IngresoDatosCuantitativoMultiComponent;
  let fixture: ComponentFixture<IngresoDatosCuantitativoMultiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
    imports: [IngresoDatosCuantitativoMultiComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IngresoDatosCuantitativoMultiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
