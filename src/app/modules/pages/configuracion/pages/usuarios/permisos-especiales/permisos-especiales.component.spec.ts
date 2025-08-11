import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PermisosEspecialesComponent } from './permisos-especiales.component';

describe('PermisosEspecialesComponent', () => {
  let component: PermisosEspecialesComponent;
  let fixture: ComponentFixture<PermisosEspecialesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
    imports: [PermisosEspecialesComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PermisosEspecialesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
