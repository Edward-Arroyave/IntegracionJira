import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteSemicuantitativoComponent } from './reporte-semicuantitativo.component';

describe('ReporteSemicuantitativoComponent', () => {
  let component: ReporteSemicuantitativoComponent;
  let fixture: ComponentFixture<ReporteSemicuantitativoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
    imports: [ReporteSemicuantitativoComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReporteSemicuantitativoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
