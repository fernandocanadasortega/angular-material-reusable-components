import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordStrengthShowcaseComponent } from './password-strength-showcase.component';

describe('PasswordStrengthShowcaseComponent', () => {
  let component: PasswordStrengthShowcaseComponent;
  let fixture: ComponentFixture<PasswordStrengthShowcaseComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PasswordStrengthShowcaseComponent]
    });
    fixture = TestBed.createComponent(PasswordStrengthShowcaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
