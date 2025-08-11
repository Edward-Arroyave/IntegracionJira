import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfiguracionWestgardComponent } from './configuracion-westgard.component';

describe('ConfiguracionWestgardComponent', () => {
  let component: ConfiguracionWestgardComponent;
  let fixture: ComponentFixture<ConfiguracionWestgardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
    imports: [ConfiguracionWestgardComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfiguracionWestgardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
