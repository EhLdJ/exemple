import React from 'react';
import { utiliserTheme } from '../contextes/ContexteTheme';
import { utiliserLangue } from '../contextes/ContexteLangue';

const BoutonTheme: React.FC = () => {
  const { mode, basculerTheme } = utiliserTheme();
  const { traduction } = utiliserLangue();

  return (
    <button 
      className="bouton bouton-accent" 
      onClick={basculerTheme}
      title={traduction.basculerTheme}
    >
      {mode === 'clair' ? '🌙' : '☀️'}
      <span>{mode === 'clair' ? traduction.modeSombre : traduction.modeClair}</span>
    </button>
  );
};

export default BoutonTheme;