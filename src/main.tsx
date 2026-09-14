import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import isPropValid from '@emotion/is-prop-valid'
import { StyleSheetManager } from 'styled-components'
import './index.css'
import App from './App.tsx'
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthProvider } from './context/auth/auth.provider.tsx';

/** Evita warnings de react-data-table-component + styled-components v6 (grow, center, button…). */
function shouldForwardProp(propName: string, target: unknown) {
  if (typeof target === 'string') {
    return isPropValid(propName)
  }
  return true
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StyleSheetManager shouldForwardProp={shouldForwardProp}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </StyleSheetManager>
  </StrictMode>,
)
