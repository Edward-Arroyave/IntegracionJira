import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FuentesQceComponent } from './fuentes-qce.component';

describe('FuentesComponent', () => {
  let component: FuentesQceComponent;
  let fixture: ComponentFixture<FuentesQceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
    imports: [FuentesQceComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FuentesQceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
