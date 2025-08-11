import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CriteriosAceptacionComponent } from './criterios-aceptacion.component';

describe('CriteriosAceptacionComponent', () => {
  let component: CriteriosAceptacionComponent;
  let fixture: ComponentFixture<CriteriosAceptacionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
    imports: [CriteriosAceptacionComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CriteriosAceptacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
