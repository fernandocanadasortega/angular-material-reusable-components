import { Injectable } from '@angular/core';
import en from '../i18n/en.json';
import es from '../i18n/es.json';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private translations = {
    en,
    es
  };
  private currentLang = 'en';

  setLanguage(lang: 'en' | 'es') {
    this.currentLang = lang;
  }

  translate(key: string): string {
    return this.translations[this.currentLang][key] || key;
  }
}
