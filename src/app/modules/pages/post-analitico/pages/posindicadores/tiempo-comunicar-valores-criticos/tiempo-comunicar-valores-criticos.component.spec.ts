import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TiempoComunicarValoresCriticosComponent } from './tiempo-comunicar-valores-criticos.component';

describe('TiempoComunicarValoresCriticosComponent', () => {
  let component: TiempoComunicarValoresCriticosComponent;
  let fixture: ComponentFixture<TiempoComunicarValoresCriticosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
    imports: [TiempoComunicarValoresCriticosComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TiempoComunicarValoresCriticosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
