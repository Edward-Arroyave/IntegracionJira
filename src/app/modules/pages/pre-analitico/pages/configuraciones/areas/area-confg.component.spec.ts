import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AreaConfgComponent } from './area-confg.component';

describe('AreaConfgComponent', () => {
  let component: AreaConfgComponent;
  let fixture: ComponentFixture<AreaConfgComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
    imports: [AreaConfgComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AreaConfgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
