import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionMetodosComponent } from './gestion-metodos.component';

describe('GestionMetodosComponent', () => {
  let component: GestionMetodosComponent;
  let fixture: ComponentFixture<GestionMetodosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
    imports: [GestionMetodosComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GestionMetodosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
