import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionLaboratoriosComponent } from './gestion-laboratorios.component';

describe('GestionLaboratoriosComponent', () => {
  let component: GestionLaboratoriosComponent;
  let fixture: ComponentFixture<GestionLaboratoriosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
    imports: [GestionLaboratoriosComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GestionLaboratoriosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
