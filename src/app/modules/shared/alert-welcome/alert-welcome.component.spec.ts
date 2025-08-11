import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertWelcomeComponent } from './alert-welcome.component';

describe('AlertWelcomeComponent', () => {
  let component: AlertWelcomeComponent;
  let fixture: ComponentFixture<AlertWelcomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
    imports: [AlertWelcomeComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlertWelcomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
