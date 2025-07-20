import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ModeTheme, ConfigurationTheme } from '../types/types';

const ContexteTheme = createContext<ConfigurationTheme | undefined>(undefined);

interface FournisseurThemeProps {
  children: ReactNode;
}

export const FournisseurTheme: React.FC<FournisseurThemeProps> = ({ children }) => {
  const [mode, setMode] = useState<ModeTheme>(() => {
    const themeSauvegarde = localStorage.getItem('modeTheme') as ModeTheme;
    return themeSauvegarde || 'clair';
  });

  useEffect(() => {
    localStorage.setItem('modeTheme', mode);
    document.documentElement.setAttribute('data-theme', mode);
  }, [mode]);

  const basculerTheme = () => {
    setMode(modeActuel => modeActuel === 'clair' ? 'sombre' : 'clair');
  };

  const valeur: ConfigurationTheme = {
    mode,
    basculerTheme
  };

  return (
    <ContexteTheme.Provider value={valeur}>
      {children}
    </ContexteTheme.Provider>
  );
};

export const utiliserTheme = (): ConfigurationTheme => {
  const contexte = useContext(ContexteTheme);
  if (contexte === undefined) {
    throw new Error('utiliserTheme doit être utilisé dans un FournisseurTheme');
  }
  return contexte;
};