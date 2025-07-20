import { utiliserLangue } from '../contextes/ContexteLangue';

export const utiliserTraduction = () => {
  const { traduction, langue, changerLangue } = utiliserLangue();
  
  const obtenirTraduction = (cle: string): string => {
    return traduction[cle] || cle;
  };

  return {
    t: obtenirTraduction,
    traduction,
    langue,
    changerLangue
  };
};