import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SatisfaccionDeMuestrasComponent } from './satisfaccion-de-muestras.component';

describe('SatisfaccionDeMuestrasComponent', () => {
  let component: SatisfaccionDeMuestrasComponent;
  let fixture: ComponentFixture<SatisfaccionDeMuestrasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
    imports: [SatisfaccionDeMuestrasComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SatisfaccionDeMuestrasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
