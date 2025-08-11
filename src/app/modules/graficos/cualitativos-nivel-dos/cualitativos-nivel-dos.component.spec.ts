import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CualitativosNivelDosComponent } from './cualitativos-nivel-dos.component';

describe('CualitativosNivelDosComponent', () => {
  let component: CualitativosNivelDosComponent;
  let fixture: ComponentFixture<CualitativosNivelDosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
    imports: [CualitativosNivelDosComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CualitativosNivelDosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
