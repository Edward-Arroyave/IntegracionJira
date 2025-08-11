import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteICTEmisorComponent } from './reporte-ict-emisor.component';

describe('ReporteICTEmisorComponent', () => {
  let component: ReporteICTEmisorComponent;
  let fixture: ComponentFixture<ReporteICTEmisorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
    imports: [ReporteICTEmisorComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReporteICTEmisorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
