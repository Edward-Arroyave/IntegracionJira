import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionAnaliticosComponent } from './gestion-analiticos.component';

describe('GestionAnaliticosComponent', () => {
  let component: GestionAnaliticosComponent;
  let fixture: ComponentFixture<GestionAnaliticosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
    imports: [GestionAnaliticosComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GestionAnaliticosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
