import type { ReactElement } from 'react';

const THEME_STORAGE_KEY = 'woo-headless-theme';

// Runs before paint (inline script in <head>) so the correct theme class is present
// on first render - avoids a flash of the wrong theme. Kept intentionally tiny.
const themeScript = `(function(){try{var s=localStorage.getItem('${THEME_STORAGE_KEY}');var d=s?s==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

/** Blocking inline script that applies the persisted (or system) theme before first paint. */
export function ThemeScript(): ReactElement {
  return <script dangerouslySetInnerHTML={{ __html: themeScript }} />;
}
