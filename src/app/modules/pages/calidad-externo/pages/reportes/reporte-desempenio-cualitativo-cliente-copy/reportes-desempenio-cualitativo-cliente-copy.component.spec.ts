import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportesDesempenioCualitativoClienteCopyComponent } from './reportes-desempenio-cualitativo-cliente-copy.component';

describe('ReportesDesempenioCualitativoClienteCopyComponent', () => {
  let component: ReportesDesempenioCualitativoClienteCopyComponent;
  let fixture: ComponentFixture<ReportesDesempenioCualitativoClienteCopyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportesDesempenioCualitativoClienteCopyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportesDesempenioCualitativoClienteCopyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
