/**
 * Load vendor/drum-notation/drum-notation-embed.js reliably on static hosts.
 * Some hosts serve .js as text/plain (+ nosniff), which blocks <script src>.
 * Fetching as text and injecting a JS blob avoids that; also reports real URLs.
 */
(function (global) {
  const RELATIVE_SRC = 'vendor/drum-notation/drum-notation-embed.js';
  let loadPromise = null;

  function resolveUrl(relative) {
    try {
      return new URL(relative, global.location.href).href;
    } catch (_) {
      return relative;
    }
  }

  function alreadyLoaded() {
    return !!(global.DrumNotationEmbed && typeof global.DrumNotationEmbed.mount === 'function');
  }

  function injectScriptFromText(code, label) {
    return new Promise((resolve, reject) => {
      const blob = new Blob([code], { type: 'application/javascript' });
      const blobUrl = URL.createObjectURL(blob);
      const script = document.createElement('script');
      script.async = false;
      script.src = blobUrl;
      script.dataset.notationSource = label;
      script.onload = () => {
        URL.revokeObjectURL(blobUrl);
        if (alreadyLoaded()) resolve(global.DrumNotationEmbed);
        else reject(new Error('Script ran but window.DrumNotationEmbed.mount is missing'));
      };
      script.onerror = () => {
        URL.revokeObjectURL(blobUrl);
        reject(new Error('Failed to execute notation engine blob'));
      };
      (document.head || document.documentElement).appendChild(script);
    });
  }

  function loadViaClassicSrc(url) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector('script[data-notation-engine="1"]');
      if (existing && alreadyLoaded()) {
        resolve(global.DrumNotationEmbed);
        return;
      }
      const script = document.createElement('script');
      script.async = false;
      script.dataset.notationEngine = '1';
      script.src = url;
      script.onload = () => {
        if (alreadyLoaded()) resolve(global.DrumNotationEmbed);
        else reject(new Error('Classic script loaded but DrumNotationEmbed missing'));
      };
      script.onerror = () => reject(new Error('Classic script tag failed: ' + url));
      (document.head || document.documentElement).appendChild(script);
    });
  }

  async function loadNotationEngine() {
    if (alreadyLoaded()) return global.DrumNotationEmbed;
    if (loadPromise) return loadPromise;

    const url = resolveUrl(RELATIVE_SRC);
    loadPromise = (async () => {
      // Prefer fetch→blob so wrong MIME / nosniff hosts still work.
      try {
        const res = await fetch(url, { cache: 'force-cache', credentials: 'same-origin' });
        if (!res.ok) {
          throw new Error('HTTP ' + res.status + ' loading ' + url);
        }
        const code = await res.text();
        if (!code || code.length < 100) {
          throw new Error('Notation engine file looks empty: ' + url);
        }
        if (code.trimStart().startsWith('<')) {
          throw new Error('Got HTML instead of JS (missing file?). URL: ' + url);
        }
        return await injectScriptFromText(code, url);
      } catch (fetchErr) {
        // Fallback: classic <script src> (works on correct MIME servers / file:// without CORS fetch)
        try {
          return await loadViaClassicSrc(url);
        } catch (srcErr) {
          const msg = [
            'Notation engine failed to load.',
            String(fetchErr && fetchErr.message ? fetchErr.message : fetchErr),
            String(srcErr && srcErr.message ? srcErr.message : srcErr),
            'Expected file next to this page: ' + RELATIVE_SRC
          ].join(' ');
          const err = new Error(msg);
          err.url = url;
          throw err;
        }
      }
    })();

    try {
      return await loadPromise;
    } catch (e) {
      loadPromise = null;
      throw e;
    }
  }

  global.loadNotationEngine = loadNotationEngine;
  global.resolveNotationEngineUrl = () => resolveUrl(RELATIVE_SRC);
})(window);
