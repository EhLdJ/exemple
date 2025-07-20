import React from 'react';
import ReactDOM from 'react-dom/client';
import Application from './Application';

const racine = ReactDOM.createRoot(
  document.getElementById('racine') as HTMLElement
);

racine.render(
  <React.StrictMode>
    <Application />
  </React.StrictMode>
);