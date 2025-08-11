import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteItcCOPYComponent } from './reporte-itc-copy.component';

describe('ReporteItcCOPYComponent', () => {
  let component: ReporteItcCOPYComponent;
  let fixture: ComponentFixture<ReporteItcCOPYComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReporteItcCOPYComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReporteItcCOPYComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
