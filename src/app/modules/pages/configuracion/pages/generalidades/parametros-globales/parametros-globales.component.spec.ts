import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ParametrosGlobalesComponent } from './parametros-globales.component';

describe('ParametrosGlobalesComponent', () => {
  let component: ParametrosGlobalesComponent;
  let fixture: ComponentFixture<ParametrosGlobalesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
    imports: [ParametrosGlobalesComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ParametrosGlobalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
