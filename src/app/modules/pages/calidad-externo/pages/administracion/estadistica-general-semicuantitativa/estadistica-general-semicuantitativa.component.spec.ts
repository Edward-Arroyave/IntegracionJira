import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstadisticaGeneralSemicuantitativaComponent } from './estadistica-general-semicuantitativa.component';

describe('EstadisticaGeneralSemicuantitativaComponent', () => {
  let component: EstadisticaGeneralSemicuantitativaComponent;
  let fixture: ComponentFixture<EstadisticaGeneralSemicuantitativaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstadisticaGeneralSemicuantitativaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstadisticaGeneralSemicuantitativaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
