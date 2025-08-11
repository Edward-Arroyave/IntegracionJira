import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionCasasComercialesComponent } from './gestion-casas-comerciales.component';

describe('GestionCasasComercialesComponent', () => {
  let component: GestionCasasComercialesComponent;
  let fixture: ComponentFixture<GestionCasasComercialesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
    imports: [GestionCasasComercialesComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GestionCasasComercialesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
