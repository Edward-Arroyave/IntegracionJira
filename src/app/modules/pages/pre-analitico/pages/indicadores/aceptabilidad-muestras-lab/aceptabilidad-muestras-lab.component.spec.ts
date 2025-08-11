import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AceptabilidadMuestrasLabComponent } from './aceptabilidad-muestras-lab.component';

describe('AceptabilidadMuestrasLabComponent', () => {
  let component: AceptabilidadMuestrasLabComponent;
  let fixture: ComponentFixture<AceptabilidadMuestrasLabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
    imports: [AceptabilidadMuestrasLabComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AceptabilidadMuestrasLabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
