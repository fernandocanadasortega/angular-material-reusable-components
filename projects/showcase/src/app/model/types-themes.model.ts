export const typesThemes = {
  LIGHT: 'Tema claro',
  DARK: 'Tema oscuro',
}

export const idThemes = {
  LIGHT: '_light_theme',
  DARK: '_dark_theme',
}

export interface Theme {
  id: string; // idThemes
  theme: string; // typesThemes
}
