import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PostIndicadoresComponent } from './post-indicadores.component';

describe('PostIndicadoresComponent', () => {
  let component: PostIndicadoresComponent;
  let fixture: ComponentFixture<PostIndicadoresComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
    imports: [PostIndicadoresComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostIndicadoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
