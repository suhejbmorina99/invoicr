import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClearSuccessSnackbarComponent } from './clear-success-snackbar.component';

describe('ClearSuccessSnackbarComponent', () => {
  let component: ClearSuccessSnackbarComponent;
  let fixture: ComponentFixture<ClearSuccessSnackbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClearSuccessSnackbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClearSuccessSnackbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
