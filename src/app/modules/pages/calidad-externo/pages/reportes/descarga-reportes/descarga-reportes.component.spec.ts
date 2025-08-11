import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DescargaReportesComponent } from './descarga-reportes.component';

describe('DescargaReportesComponent', () => {
  let component: DescargaReportesComponent;
  let fixture: ComponentFixture<DescargaReportesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DescargaReportesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DescargaReportesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
