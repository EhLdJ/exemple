import React from 'react';
import { utiliserLangue } from '../contextes/ContexteLangue';
import BoutonTheme from './BoutonTheme';
import SelecteurLangue from './SelecteurLangue';

const EnTete: React.FC = () => {
  const { traduction } = utiliserLangue();

  return (
    <header className="en-tete">
      <div className="contenu-en-tete">
        <h1 className="titre-principal">{traduction.titre}</h1>
        <div className="controles">
          <SelecteurLangue />
          <BoutonTheme />
        </div>
      </div>
    </header>
  );
};

export default EnTete;