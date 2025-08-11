import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MantenimientoPreventivoComponent } from './mantenimiento-preventivo.component';

describe('MantenimientoPreventivoComponent', () => {
  let component: MantenimientoPreventivoComponent;
  let fixture: ComponentFixture<MantenimientoPreventivoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
    imports: [MantenimientoPreventivoComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MantenimientoPreventivoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
