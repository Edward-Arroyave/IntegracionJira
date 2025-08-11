import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionMaterialesControlComponent } from './gestion-materiales-control.component';

describe('GestionMaterialesControlComponent', () => {
  let component: GestionMaterialesControlComponent;
  let fixture: ComponentFixture<GestionMaterialesControlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
    imports: [GestionMaterialesControlComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GestionMaterialesControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
