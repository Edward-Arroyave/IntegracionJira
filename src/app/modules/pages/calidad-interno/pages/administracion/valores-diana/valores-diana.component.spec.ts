import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ValoresDianaComponent } from './valores-diana.component';

describe('ValoresDianaComponent', () => {
  let component: ValoresDianaComponent;
  let fixture: ComponentFixture<ValoresDianaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
    imports: [ValoresDianaComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ValoresDianaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
