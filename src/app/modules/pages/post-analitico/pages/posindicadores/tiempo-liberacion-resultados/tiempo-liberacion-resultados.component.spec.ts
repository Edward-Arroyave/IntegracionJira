import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TiempoLiberacionResultadosComponent } from './tiempo-liberacion-resultados.component';

describe('TiempoLiberacionResultadosComponent', () => {
  let component: TiempoLiberacionResultadosComponent;
  let fixture: ComponentFixture<TiempoLiberacionResultadosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
    imports: [TiempoLiberacionResultadosComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TiempoLiberacionResultadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
