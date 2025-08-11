import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecomendacionLaboratorioComponent } from './recomendacion-laboratorio.component';

describe('RecomendacionLaboratorioComponent', () => {
  let component: RecomendacionLaboratorioComponent;
  let fixture: ComponentFixture<RecomendacionLaboratorioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
    imports: [RecomendacionLaboratorioComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecomendacionLaboratorioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
