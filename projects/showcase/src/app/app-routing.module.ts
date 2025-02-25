import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: 'password-strength-showcase', loadComponent: () => import('./components/password-strength-showcase/password-strength-showcase.component').then(m => m.PasswordStrengthShowcaseComponent) }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
