import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfiguracionResultadosComponent } from './configuracion-resultados.component';

describe('ConfiguracionResultadosComponent', () => {
  let component: ConfiguracionResultadosComponent;
  let fixture: ComponentFixture<ConfiguracionResultadosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
    imports: [ConfiguracionResultadosComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfiguracionResultadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
