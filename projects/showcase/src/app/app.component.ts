import { Component } from '@angular/core';
import { idThemes, Theme, typesThemes } from './model/types-themes.model';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  protected selectedTheme?: any;
  protected themesList = [
    { id: idThemes.LIGHT, label: typesThemes.LIGHT },
    { id: idThemes.DARK, label: typesThemes.DARK }
  ];

  constructor(private themeService: ThemeService) {
    this.setCurrentThemeDropdown();
  }

  setCurrentThemeDropdown() {
    if (localStorage.getItem('theme')) {
      const saveTheme = JSON.parse(localStorage.getItem('theme') as string);
      this.selectedTheme = saveTheme.id;
      return;
    }

    this.selectedTheme = this.themesList[0].id;
  }

  onThemeChange(theme: any) {
    const label = this.themesList.find((item) => item.id === theme.value)?.label as string;
    this.themeService.setCurrent = { id: theme.value, theme: label };
  }
}
