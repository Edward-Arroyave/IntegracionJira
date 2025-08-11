import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MantenimientoCorrectivosComponent } from './mantenimiento-correctivos.component';

describe('MantenimientoCorrectivosComponent', () => {
  let component: MantenimientoCorrectivosComponent;
  let fixture: ComponentFixture<MantenimientoCorrectivosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
    imports: [MantenimientoCorrectivosComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MantenimientoCorrectivosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
