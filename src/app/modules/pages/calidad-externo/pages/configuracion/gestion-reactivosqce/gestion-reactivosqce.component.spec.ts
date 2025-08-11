import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionReactivosqceComponent } from './gestion-reactivosqce.component';

describe('GestionReactivosqceComponent', () => {
  let component: GestionReactivosqceComponent;
  let fixture: ComponentFixture<GestionReactivosqceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
    imports: [GestionReactivosqceComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GestionReactivosqceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
