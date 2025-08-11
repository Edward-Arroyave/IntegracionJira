import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiccionarioResultadosComponent } from './diccionario-resultados.component';

describe('DiccionarioResultadosComponent', () => {
  let component: DiccionarioResultadosComponent;
  let fixture: ComponentFixture<DiccionarioResultadosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
    imports: [DiccionarioResultadosComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiccionarioResultadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
