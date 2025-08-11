import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionReactivosComponent } from './gestion-reactivos.component';

describe('GestionReactivosComponent', () => {
  let component: GestionReactivosComponent;
  let fixture: ComponentFixture<GestionReactivosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
    imports: [GestionReactivosComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GestionReactivosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
