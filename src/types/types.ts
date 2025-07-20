export type ModeTheme = 'clair' | 'sombre';

export type Langue = 'fr' | 'en';

export interface ConfigurationTheme {
  mode: ModeTheme;
  basculerTheme: () => void;
}

export interface ConfigurationLangue {
  langue: Langue;
  changerLangue: (langue: Langue) => void;
  traduction: Record<string, string>;
}