/**
 * Helper to register the Service Worker safely
 */
export function registerServiceWorker(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  // Register when window loads to avoid blocking critical initial rendering
  window.addEventListener('load', () => {
    // Only register on secure contexts (HTTPS or localhost)
    const isLocalhost = Boolean(
      window.location.hostname === 'localhost' ||
      window.location.hostname === '[::1]' ||
      window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
    );

    if (window.location.protocol !== 'https:' && !isLocalhost) {
      console.warn('[PWA] Service Worker registration skipped: Requires HTTPS in production.');
      return;
    }

    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        // Successfully registered
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (installingWorker == null) return;
          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                console.log('[PWA] Nova versão disponível. O cache será atualizado no próximo carregamento.');
              } else {
                console.log('[PWA] Estrutura do aplicativo em cache; recursos que dependem de rede permanecem online.');
              }
            }
          };
        };
      })
      .catch((error) => {
        console.warn('[PWA] Falha ao registrar Service Worker:', error);
      });
  });
}
