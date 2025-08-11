import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultadoPacienteComponent } from './resultado-paciente.component';

describe('ResultadoPacienteComponent', () => {
  let component: ResultadoPacienteComponent;
  let fixture: ComponentFixture<ResultadoPacienteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
    imports: [ResultadoPacienteComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResultadoPacienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
