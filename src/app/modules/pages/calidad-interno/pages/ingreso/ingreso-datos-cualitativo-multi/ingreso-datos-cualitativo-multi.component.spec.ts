import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IngresoDatosCualitativoMultiComponent } from './ingreso-datos-cualitativo-multi.component';

describe('IngresoDatosCualitativoMultiComponent', () => {
  let component: IngresoDatosCualitativoMultiComponent;
  let fixture: ComponentFixture<IngresoDatosCualitativoMultiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
    imports: [IngresoDatosCualitativoMultiComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IngresoDatosCualitativoMultiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
