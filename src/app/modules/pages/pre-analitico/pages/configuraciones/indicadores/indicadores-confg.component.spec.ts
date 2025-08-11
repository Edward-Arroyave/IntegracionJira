import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IndicadoresConfgComponent } from './indicadores-confg.component';

describe('IndicadoresConfgComponent', () => {
  let component: IndicadoresConfgComponent;
  let fixture: ComponentFixture<IndicadoresConfgComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
    imports: [IndicadoresConfgComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IndicadoresConfgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
