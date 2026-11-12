import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Ensure window.fetch is safely writable for all browser contexts
if (typeof window !== 'undefined') {
  try {
    const originalFetch = window.fetch ? window.fetch.bind(window) : undefined;
    let currentFetch = originalFetch;
    if (originalFetch) {
      Object.defineProperty(window, 'fetch', {
        configurable: true,
        enumerable: true,
        get: () => currentFetch,
        set: (fn) => {
          currentFetch = fn;
        },
      });
    }
  } catch {
    // Already defined or restricted
  }
}

createRoot(document.getElementById('root')!).render(<App />);
