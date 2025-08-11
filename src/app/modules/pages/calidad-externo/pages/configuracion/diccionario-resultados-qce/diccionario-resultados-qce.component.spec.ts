import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiccionarioResultadosQceComponent } from './diccionario-resultados-qce.component';

describe('DiccionarioResultadosQceComponent', () => {
  let component: DiccionarioResultadosQceComponent;
  let fixture: ComponentFixture<DiccionarioResultadosQceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
    imports: [DiccionarioResultadosQceComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiccionarioResultadosQceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
