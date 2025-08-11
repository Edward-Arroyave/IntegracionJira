import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FiltroGrubbsInternoComponent } from './filtros-grubbs-interno.component';

describe('DatosAberrantesComponent', () => {
  let component: FiltroGrubbsInternoComponent;
  let fixture: ComponentFixture<FiltroGrubbsInternoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
    imports: [FiltroGrubbsInternoComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FiltroGrubbsInternoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
