import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CameraButtonComponent } from './camera-button.component';

describe('CameraButtonComponent', () => {
  let component: CameraButtonComponent;
  let fixture: ComponentFixture<CameraButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CameraButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CameraButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
