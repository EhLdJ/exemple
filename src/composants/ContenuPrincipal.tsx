import React from 'react';
import { utiliserLangue } from '../contextes/ContexteLangue';
import IndicateurEtat from './IndicateurEtat';

const ContenuPrincipal: React.FC = () => {
  const { traduction } = utiliserLangue();

  return (
    <main className="contenu-principal">
      <div className="carte animation-apparition">
        <h2 className="titre-carte">{traduction.bienvenue}</h2>
        <p className="description">{traduction.description}</p>
      </div>

      <div className="carte animation-apparition">
        <h3 className="titre-carte">{traduction.fonctionnalites}</h3>
        <div className="grille-fonctionnalites">
          <div className="fonctionnalite">
            <div className="icone-fonctionnalite">🎨</div>
            <h4 className="titre-fonctionnalite">{traduction.gestionThemes}</h4>
            <p className="description-fonctionnalite">
              Basculez facilement entre les modes clair et sombre
            </p>
          </div>
          
          <div className="fonctionnalite">
            <div className="icone-fonctionnalite">🌐</div>
            <h4 className="titre-fonctionnalite">{traduction.gestionLangues}</h4>
            <p className="description-fonctionnalite">
              Support du français et de l'anglais
            </p>
          </div>
          
          <div className="fonctionnalite">
            <div className="icone-fonctionnalite">✨</div>
            <h4 className="titre-fonctionnalite">{traduction.interfaceModerne}</h4>
            <p className="description-fonctionnalite">
              Design moderne avec animations fluides
            </p>
          </div>
          
          <div className="fonctionnalite">
            <div className="icone-fonctionnalite">📱</div>
            <h4 className="titre-fonctionnalite">{traduction.responsive}</h4>
            <p className="description-fonctionnalite">
              Interface adaptée à tous les écrans
            </p>
          </div>
        </div>
      </div>
      
      <IndicateurEtat />
    </main>
  );
};

export default ContenuPrincipal;