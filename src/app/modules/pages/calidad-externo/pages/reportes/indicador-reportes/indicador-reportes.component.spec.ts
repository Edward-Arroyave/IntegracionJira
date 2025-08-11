import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IndicadorReportesComponent } from './indicador-reportes.component';

describe('IndicadorReportesComponent', () => {
  let component: IndicadorReportesComponent;
  let fixture: ComponentFixture<IndicadorReportesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
    imports: [IndicadorReportesComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IndicadorReportesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
