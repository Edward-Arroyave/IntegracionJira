import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfiguracionObjetivosAnalitoComponent } from './configuracion-objetivos-analito.component';

describe('ConfiguracionObjetivosAnalitoComponent', () => {
  let component: ConfiguracionObjetivosAnalitoComponent;
  let fixture: ComponentFixture<ConfiguracionObjetivosAnalitoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
    imports: [ConfiguracionObjetivosAnalitoComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfiguracionObjetivosAnalitoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
