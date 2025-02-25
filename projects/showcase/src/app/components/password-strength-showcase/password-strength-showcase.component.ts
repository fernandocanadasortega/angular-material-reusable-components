import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { PasswordStrengthComponent, PruebaIntegracionComponent } from "reusable-components";

@Component({
  selector: 'app-password-strength-showcase',
  templateUrl: './password-strength-showcase.component.html',
  styleUrls: ['./password-strength-showcase.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, PruebaIntegracionComponent, PasswordStrengthComponent, MatFormFieldModule]
})
export class PasswordStrengthShowcaseComponent {

  value: string = '';

  constructor() { }
}
