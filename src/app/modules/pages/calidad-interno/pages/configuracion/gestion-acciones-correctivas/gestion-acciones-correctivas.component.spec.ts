import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionAccionesCorrectivasComponent } from './gestion-acciones-correctivas.component';

describe('GestionAccionesCorrectivasComponent', () => {
  let component: GestionAccionesCorrectivasComponent;
  let fixture: ComponentFixture<GestionAccionesCorrectivasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
    imports: [GestionAccionesCorrectivasComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GestionAccionesCorrectivasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
