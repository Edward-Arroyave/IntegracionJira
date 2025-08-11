import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionLotMaterialControlComponent } from './gestion-lot-material-control.component';

describe('GestionLotMaterialControlComponent', () => {
  let component: GestionLotMaterialControlComponent;
  let fixture: ComponentFixture<GestionLotMaterialControlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
    imports: [GestionLotMaterialControlComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GestionLotMaterialControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
