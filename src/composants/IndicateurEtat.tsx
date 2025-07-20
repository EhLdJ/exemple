import React from 'react';
import { utiliserTheme } from '../contextes/ContexteTheme';
import { utiliserLangue } from '../contextes/ContexteLangue';

const IndicateurEtat: React.FC = () => {
  const { mode } = utiliserTheme();
  const { langue, traduction } = utiliserLangue();

  return (
    <div className="carte" style={{ marginTop: '2rem' }}>
      <h3 className="titre-carte">{traduction.parametres}</h3>
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <div>
          <strong>Thème actuel :</strong> 
          <span style={{ marginLeft: '0.5rem', color: 'var(--couleur-accent)' }}>
            {mode === 'clair' ? traduction.modeClair : traduction.modeSombre}
          </span>
        </div>
        <div>
          <strong>Langue active :</strong> 
          <span style={{ marginLeft: '0.5rem', color: 'var(--couleur-accent)' }}>
            {langue === 'fr' ? traduction.français : traduction.anglais}
          </span>
        </div>
      </div>
    </div>
  );
};

export default IndicateurEtat;