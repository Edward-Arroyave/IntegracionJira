import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteSemicuantitativoClienteComponent } from './reporte-semicuantitativo-cliente.component';

describe('ReporteSemicuantitativoComponent', () => {
  let component: ReporteSemicuantitativoClienteComponent;
  let fixture: ComponentFixture<ReporteSemicuantitativoClienteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
    imports: [ReporteSemicuantitativoClienteComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReporteSemicuantitativoClienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
