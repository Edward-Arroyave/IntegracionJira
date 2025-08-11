import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ObjetivosCalidadComponent } from './objetivos-calidad.component';

describe('ObjetivosCalidadComponent', () => {
  let component: ObjetivosCalidadComponent;
  let fixture: ComponentFixture<ObjetivosCalidadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
    imports: [ObjetivosCalidadComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObjetivosCalidadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
