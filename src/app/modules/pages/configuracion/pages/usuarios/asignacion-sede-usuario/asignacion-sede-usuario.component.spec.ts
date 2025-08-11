import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AsignacionSedeUsuarioComponent } from './asignacion-sede-usuario.component';

describe('AsignacionSedeUsuarioComponent', () => {
  let component: AsignacionSedeUsuarioComponent;
  let fixture: ComponentFixture<AsignacionSedeUsuarioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
    imports: [AsignacionSedeUsuarioComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AsignacionSedeUsuarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
