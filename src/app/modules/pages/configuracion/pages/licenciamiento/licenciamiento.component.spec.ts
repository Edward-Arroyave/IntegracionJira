import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LicenciamientoComponent } from './licenciamiento.component';

describe('LicenciamientoComponent', () => {
  let component: LicenciamientoComponent;
  let fixture: ComponentFixture<LicenciamientoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
    imports: [LicenciamientoComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LicenciamientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
