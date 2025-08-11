import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportesPostComponent } from './reportes-post.component';

describe('ReportesPostComponent', () => {
  let component: ReportesPostComponent;
  let fixture: ComponentFixture<ReportesPostComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
    imports: [ReportesPostComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportesPostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
