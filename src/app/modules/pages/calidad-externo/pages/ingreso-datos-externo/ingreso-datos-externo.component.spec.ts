import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IngresoDatosExternoComponent } from './ingreso-datos-externo.component';

describe('IngresoDatosExternoComponent', () => {
  let component: IngresoDatosExternoComponent;
  let fixture: ComponentFixture<IngresoDatosExternoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
    imports: [IngresoDatosExternoComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IngresoDatosExternoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
