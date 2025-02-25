import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
// import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { ExpansionOverlay } from '../expansion-overlay/expansion-overlay.component';
// import { TranslationService } from '../../services/translation.service';

class PasswordStrengthTypes {
  static readonly EMPTY = { requieredScore: 0, value: 'empty', icon: 'remove_moderator' };
  static readonly VERY_WEAK = { requieredScore: 1, value: 'very_weak', icon: 'gpp_bad' };
  static readonly WEAK = { requieredScore: 2, value: 'weak', icon: 'gpp_bad' };
  static readonly NORMAL = { requieredScore: 3, value: 'normal', icon: 'gpp_maybe' };
  static readonly STRONG = { requieredScore: 5, value: 'strong', icon: 'verified_user' };
  static readonly VERY_STRONG = { requieredScore: 10, value: 'very_strong', icon: 'verified_user' };
}

enum PasswordRequierements {
  PASSWORD_LENGTH,
  MINUS,
  MAYUS,
  SYMBOLS,
  NUMBERS
}

interface PasswordStrengthRequirement {
  testId: number,
  testSuccess: boolean,
  testName: string
}

@Component({
  selector: 'password-strength-requirements',
  templateUrl: './password-strength.component.html',
  styleUrls: ['./password-strength.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, /* TranslateModule, */ RouterModule, MatFormFieldModule, MatIconModule, MatCardModule, ExpansionOverlay]
})
export class PasswordStrengthComponent {

  @Input() set updatePasswordScore(password: string) {
    this.verifyPasswordStrength(password);
  };

  // Parametros de la contraseña (Fortaleza e icono)
  public passwordStrength = {
    icon: PasswordStrengthTypes.EMPTY.icon,
    value: PasswordStrengthTypes.EMPTY.value
  }

  /**
   * Caracteres recomendados en la contraseña
   */
  public requirements: Array<PasswordStrengthRequirement> = [
    { testId: PasswordRequierements.PASSWORD_LENGTH, testName: 'password_composition_min_length', testSuccess: false },
    { testId: PasswordRequierements.MINUS, testName: 'password_composition_lowercase', testSuccess: false },
    { testId: PasswordRequierements.MAYUS, testName: 'password_composition_uppercase', testSuccess: false },
    { testId: PasswordRequierements.SYMBOLS, testName: 'password_composition_symbols', testSuccess: false },
    { testId: PasswordRequierements.NUMBERS, testName: 'password_composition_numbers', testSuccess: false }
  ];

  public strengthOverlayVisible: boolean = false;

  constructor(/* public translationService: TranslationService */) {  }

  /**
   * Valora la fortaleza de la contraseña
   * @param password Contraseña a evaluar
   * @returns Usado para salir del método si no se cumplen las condiones necesarias
  */
  public verifyPasswordStrength(password: string) {
    let strengthScore: number = 0;

    // Reinicio de los valores
    this.passwordStrength = {
      icon: PasswordStrengthTypes.EMPTY.icon,
      value: PasswordStrengthTypes.EMPTY.value
    }

    for (const requirement of this.requirements) {
      requirement.testSuccess = false;
    }


    // Compruebo valores contraseña (Calcula la fortaleza de la contraseña)
    if (password.length == 0) { // No hay nada escrito
      return;
    }

    if (password.match(/[a-z]+/)) { // Incluye letras minusculas
      strengthScore += 1;
      this.requirements.find((requirement: PasswordStrengthRequirement) => requirement.testId == PasswordRequierements.MINUS)!.testSuccess = true;
    }

    if (password.match(/[A-Z]+/)) { // Incluye letras mayúsculas
      strengthScore += 1;
      this.requirements.find((requirement: PasswordStrengthRequirement) => requirement.testId == PasswordRequierements.MAYUS)!.testSuccess = true;
    }

    if (password.match(/[$@#&%!?*^=-_.,]+/)) { // Incluye símbolos
      strengthScore += 1;
      this.requirements.find((requirement: PasswordStrengthRequirement) => requirement.testId == PasswordRequierements.SYMBOLS)!.testSuccess = true;
    }

    if (password.match(/[0-9]+/)) { // Incluye números
      strengthScore += 1;
      this.requirements.find((requirement: PasswordStrengthRequirement) => requirement.testId == PasswordRequierements.NUMBERS)!.testSuccess = true;
    }

    if (password.length < 6) { // Incluye menos de 6 caracteres
      strengthScore -= 2;
    }
    else if (password.length >= 6 && password.length < 12) { // Incluye menos de 12 caracteres
      strengthScore -= 1;
    }
    else if (password.length >= 12 && password.length < 24) { // Incluye 12 caracteres o más
      strengthScore += 2;
      this.requirements.find((requirement: PasswordStrengthRequirement) => requirement.testId == PasswordRequierements.PASSWORD_LENGTH)!.testSuccess = true;
    }
    else if (password.length >= 24) { // Incluye 24 caracteres o más
      strengthScore = 10; // Puntuación máxima
      this.requirements.find((requirement: PasswordStrengthRequirement) => requirement.testId == PasswordRequierements.PASSWORD_LENGTH)!.testSuccess = true;
    }


    // Establezco los parámetros de la contraseña (Fortaleza e icono)
    if (strengthScore >= PasswordStrengthTypes.WEAK.requieredScore && strengthScore < PasswordStrengthTypes.NORMAL.requieredScore) { // Contraseña débil
      this.passwordStrength = {
        icon: PasswordStrengthTypes.WEAK.icon,
        value: PasswordStrengthTypes.WEAK.value
      }
      return;
    }

    if (strengthScore >= PasswordStrengthTypes.NORMAL.requieredScore && strengthScore < PasswordStrengthTypes.STRONG.requieredScore) { // Contraseña normal
      this.passwordStrength = {
        icon: PasswordStrengthTypes.NORMAL.icon,
        value: PasswordStrengthTypes.NORMAL.value
      }
      return;
    }

    if (strengthScore >= PasswordStrengthTypes.STRONG.requieredScore && strengthScore < PasswordStrengthTypes.VERY_STRONG.requieredScore) { // Contraseña fuerte
      this.passwordStrength = {
        icon: PasswordStrengthTypes.STRONG.icon,
        value: PasswordStrengthTypes.STRONG.value
      }
      return;
    }

    if (strengthScore >= PasswordStrengthTypes.VERY_STRONG.requieredScore) { // Contraseña muy fuerte
      this.passwordStrength = {
        icon: PasswordStrengthTypes.VERY_STRONG.icon,
        value: PasswordStrengthTypes.VERY_STRONG.value
      }
      return;
    }

    this.passwordStrength = { // Contraseña muy débil
      icon: PasswordStrengthTypes.VERY_WEAK.icon,
      value: PasswordStrengthTypes.VERY_WEAK.value
    }
  }

  /* getTranslation(key: string): string {
    return this.translationService.translate(`password_strength.${key}`);
  } */
}
