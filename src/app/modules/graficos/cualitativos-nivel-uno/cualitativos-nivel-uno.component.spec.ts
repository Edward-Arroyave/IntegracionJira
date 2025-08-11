import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CualitativosNivelUnoComponent } from './cualitativos-nivel-uno.component';

describe('CualitativosNivelUnoComponent', () => {
  let component: CualitativosNivelUnoComponent;
  let fixture: ComponentFixture<CualitativosNivelUnoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
    imports: [CualitativosNivelUnoComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CualitativosNivelUnoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
