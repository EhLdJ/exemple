import React from 'react';
import { FournisseurTheme } from './contextes/ContexteTheme';
import { FournisseurLangue } from './contextes/ContexteLangue';
import EnTete from './composants/EnTete';
import ContenuPrincipal from './composants/ContenuPrincipal';
import './styles/styles.css';

const Application: React.FC = () => {
  return (
    <FournisseurTheme>
      <FournisseurLangue>
        <div className="conteneur-principal">
          <EnTete />
          <ContenuPrincipal />
        </div>
      </FournisseurLangue>
    </FournisseurTheme>
  );
};

export default Application;