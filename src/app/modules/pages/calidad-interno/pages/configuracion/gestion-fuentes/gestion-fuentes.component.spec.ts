import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionFuentesComponent } from './gestion-fuentes.component';

describe('GestionFuentesComponent', () => {
  let component: GestionFuentesComponent;
  let fixture: ComponentFixture<GestionFuentesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
    imports: [GestionFuentesComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GestionFuentesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
