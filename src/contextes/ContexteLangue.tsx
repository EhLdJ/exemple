import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Langue, ConfigurationLangue } from '../types/types';
import { traductionsFrancais } from '../traductions/francais';
import { traductionsAnglais } from '../traductions/anglais';

const ContexteLangue = createContext<ConfigurationLangue | undefined>(undefined);

interface FournisseurLangueProps {
  children: ReactNode;
}

const obtenirTraductions = (langue: Langue) => {
  switch (langue) {
    case 'fr':
      return traductionsFrancais;
    case 'en':
      return traductionsAnglais;
    default:
      return traductionsFrancais;
  }
};

export const FournisseurLangue: React.FC<FournisseurLangueProps> = ({ children }) => {
  const [langue, setLangue] = useState<Langue>(() => {
    const langueSauvegarde = localStorage.getItem('langue') as Langue;
    return langueSauvegarde || 'fr';
  });

  useEffect(() => {
    localStorage.setItem('langue', langue);
    document.documentElement.lang = langue;
  }, [langue]);

  const changerLangue = (nouvelleLangue: Langue) => {
    setLangue(nouvelleLangue);
  };

  const traduction = obtenirTraductions(langue);

  const valeur: ConfigurationLangue = {
    langue,
    changerLangue,
    traduction
  };

  return (
    <ContexteLangue.Provider value={valeur}>
      {children}
    </ContexteLangue.Provider>
  );
};

export const utiliserLangue = (): ConfigurationLangue => {
  const contexte = useContext(ContexteLangue);
  if (contexte === undefined) {
    throw new Error('utiliserLangue doit être utilisé dans un FournisseurLangue');
  }
  return contexte;
};