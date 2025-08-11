import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RondasComponent } from './rondas.component';

describe('RondasComponent', () => {
  let component: RondasComponent;
  let fixture: ComponentFixture<RondasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
    imports: [RondasComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RondasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
