import React from 'react';
import { utiliserLangue } from '../contextes/ContexteLangue';
import { Langue } from '../types/types';

const SelecteurLangue: React.FC = () => {
  const { langue, changerLangue, traduction } = utiliserLangue();

  const gererChangementLangue = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nouvelleLangue = event.target.value as Langue;
    changerLangue(nouvelleLangue);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <span>🌐</span>
      <select 
        className="selecteur-langue"
        value={langue}
        onChange={gererChangementLangue}
        title={traduction.changerLangue}
      >
        <option value="fr">{traduction.français}</option>
        <option value="en">{traduction.anglais}</option>
      </select>
    </div>
  );
};

export default SelecteurLangue;