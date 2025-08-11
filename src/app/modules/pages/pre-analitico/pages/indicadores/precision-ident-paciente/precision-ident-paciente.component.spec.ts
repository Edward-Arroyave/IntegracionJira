import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrecisionIdentPacienteComponent } from './precision-ident-paciente.component';

describe('PrecisionIdentPacienteComponent', () => {
  let component: PrecisionIdentPacienteComponent;
  let fixture: ComponentFixture<PrecisionIdentPacienteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
    imports: [PrecisionIdentPacienteComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrecisionIdentPacienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
