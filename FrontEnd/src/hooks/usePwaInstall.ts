import { useState, useEffect, useCallback } from 'react';
import { detectPlatform, checkIsStandalone, PlatformInfo } from '../utils/pwaDetection';

// Interface for beforeinstallprompt event (non-standard standard draft)
export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export interface UsePwaInstallReturn {
  platformInfo: PlatformInfo;
  isInstallable: boolean;
  isInstalled: boolean;
  hasPromptEvent: boolean;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  triggerInstall: () => Promise<'accepted' | 'dismissed' | 'manual-instructions' | 'error'>;
}

export function usePwaInstall(): UsePwaInstallReturn {
  const [platformInfo, setPlatformInfo] = useState<PlatformInfo>(() => detectPlatform());
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(() => checkIsStandalone());
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Monitor standalone display-mode changes & events
  useEffect(() => {
    // Re-check detection on mount
    const currentInfo = detectPlatform();
    setPlatformInfo(currentInfo);
    setIsInstalled(currentInfo.isStandalone);

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent automatic browser mini-infobar
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setIsModalOpen(false);
      console.log('[PWA] Aplicativo instalado com sucesso.');
    };

    const mediaQueryList = typeof window.matchMedia === 'function'
      ? window.matchMedia('(display-mode: standalone)')
      : null;
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setIsInstalled(true);
        setIsModalOpen(false);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    mediaQueryList?.addEventListener('change', handleDisplayModeChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      mediaQueryList?.removeEventListener('change', handleDisplayModeChange);
    };
  }, []);

  const openModal = useCallback(() => {
    if (!isInstalled) setIsModalOpen(true);
  }, [isInstalled]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const triggerInstall = useCallback(async (): Promise<'accepted' | 'dismissed' | 'manual-instructions' | 'error'> => {
    // 1. If on iOS, never call prompt() because the API is not available
    if (platformInfo.isIos) {
      return 'manual-instructions';
    }

    // 2. If beforeinstallprompt is available (Android, Chrome/Edge Desktop)
    if (deferredPrompt) {
      try {
        const promptEvent = deferredPrompt;
        await promptEvent.prompt();
        const choiceResult = await promptEvent.userChoice;
        setDeferredPrompt(null);
        if (choiceResult.outcome === 'accepted') {
          return 'accepted';
        }
        return 'dismissed';
      } catch (err) {
        console.warn('[PWA] Erro ao executar prompt de instalação:', err);
        setDeferredPrompt(null);
        return 'error';
      }
    }

    // 3. Fallback: browser does not provide direct prompt API
    return 'manual-instructions';
  }, [platformInfo.isIos, deferredPrompt]);

  const isInstallable = !isInstalled;
  const hasPromptEvent = deferredPrompt !== null;

  return {
    platformInfo,
    isInstallable,
    isInstalled,
    hasPromptEvent,
    isModalOpen,
    openModal,
    closeModal,
    triggerInstall
  };
}
