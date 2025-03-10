import { Injectable } from '@angular/core';
import { idThemes, Theme, typesThemes } from '../model/types-themes.model';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  private readonly style: HTMLLinkElement;

  public readonly defaultTheme: Theme = { id: idThemes.LIGHT, theme: typesThemes.LIGHT };
  private currentTheme: BehaviorSubject<Theme> = new BehaviorSubject(this.defaultTheme);
  public currentTheme$: Observable<Theme> = this.currentTheme.asObservable();

  constructor() {
    this.style = document.createElement('link');
    this.style.rel = 'stylesheet';
    document.head.appendChild(this.style);

    if (localStorage.getItem('theme')) {
      const saveTheme = JSON.parse(localStorage.getItem('theme') as string);
      this.setCurrent = saveTheme;
    }
  }

  public set setCurrent(theme: Theme) {
    localStorage.setItem('theme', JSON.stringify(theme));
    const baseRef = document.querySelector('base')?.href ?? '/';
    // this.style.href = `${baseRef}assets/themes/${theme.id}.css`;
    this.style.href = `${baseRef}${theme.id}.css`;
    this.currentTheme.next(theme);
  }
}
