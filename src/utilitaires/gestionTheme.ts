import { ModeTheme } from '../types/types';
import { MODES_THEME, CLES_STOCKAGE } from '../constantes/constantes';

export const obtenirThemeInitial = (): ModeTheme => {
  try {
    const themeSauvegarde = localStorage.getItem(CLES_STOCKAGE.MODE_THEME) as ModeTheme;
    if (themeSauvegarde && Object.values(MODES_THEME).includes(themeSauvegarde)) {
      return themeSauvegarde;
    }
  } catch (erreur) {
    console.warn('Erreur lors de la récupération du thème sauvegardé:', erreur);
  }
  
  // Détecter la préférence système
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return MODES_THEME.SOMBRE;
  }
  
  return MODES_THEME.CLAIR;
};

export const sauvegarderTheme = (theme: ModeTheme): void => {
  try {
    localStorage.setItem(CLES_STOCKAGE.MODE_THEME, theme);
    document.documentElement.setAttribute('data-theme', theme);
  } catch (erreur) {
    console.warn('Erreur lors de la sauvegarde du thème:', erreur);
  }
};

export const basculerTheme = (themeActuel: ModeTheme): ModeTheme => {
  return themeActuel === MODES_THEME.CLAIR ? MODES_THEME.SOMBRE : MODES_THEME.CLAIR;
};