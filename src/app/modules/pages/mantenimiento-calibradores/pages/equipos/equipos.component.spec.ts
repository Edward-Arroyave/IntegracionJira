import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EquiposComponent } from './equipos.component';

describe('EquiposComponent', () => {
  let component: EquiposComponent;
  let fixture: ComponentFixture<EquiposComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
    imports: [EquiposComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EquiposComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
