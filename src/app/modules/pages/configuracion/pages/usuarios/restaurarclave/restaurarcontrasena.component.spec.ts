import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestaurarcontrasenaComponent } from './restaurarcontrasena.component';

describe('RestaurarcontrasenaComponent', () => {
  let component: RestaurarcontrasenaComponent;
  let fixture: ComponentFixture<RestaurarcontrasenaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestaurarcontrasenaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RestaurarcontrasenaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
