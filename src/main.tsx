import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initStaticCmsInterceptor } from './lib/cms-github-client.ts';

// Initialize the static CMS direct GitHub adapter
initStaticCmsInterceptor();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
