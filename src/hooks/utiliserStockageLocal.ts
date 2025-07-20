import { useState } from 'react';

export const utiliserStockageLocal = <T>(
  cle: string, 
  valeurParDefaut: T
): [T, (valeur: T) => void] => {
  const [valeur, setValeur] = useState<T>(() => {
    try {
      const elementStocke = localStorage.getItem(cle);
      return elementStocke ? JSON.parse(elementStocke) : valeurParDefaut;
    } catch (erreur) {
      console.warn(`Erreur lors de la lecture de ${cle} depuis localStorage:`, erreur);
      return valeurParDefaut;
    }
  });

  const setValeurStockee = (nouvelleValeur: T) => {
    try {
      setValeur(nouvelleValeur);
      localStorage.setItem(cle, JSON.stringify(nouvelleValeur));
    } catch (erreur) {
      console.warn(`Erreur lors de l'écriture de ${cle} dans localStorage:`, erreur);
    }
  };

  return [valeur, setValeurStockee];
};