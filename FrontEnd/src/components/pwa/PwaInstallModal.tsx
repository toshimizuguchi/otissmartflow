import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Check,
  Download,
  Info,
  Monitor,
  Plus,
  Share,
  Smartphone,
  X
} from 'lucide-react';
import type { UsePwaInstallReturn } from '../../hooks/usePwaInstall';

interface PwaInstallModalProps {
  pwa: UsePwaInstallReturn;
}

type InstallStatus = 'idle' | 'installing' | 'accepted' | 'dismissed' | 'error';

export const PwaInstallModal: React.FC<PwaInstallModalProps> = ({ pwa }) => {
  const {
    platformInfo,
    isModalOpen,
    closeModal,
    triggerInstall,
    hasPromptEvent,
    isInstalled
  } = pwa;
  const [showInstructions, setShowInstructions] = useState(false);
  const [installStatus, setInstallStatus] = useState<InstallStatus>('idle');
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const wasModalOpenRef = useRef(false);
  const [iconAvailable, setIconAvailable] = useState(true);

  useEffect(() => {
    if (!isModalOpen) return;

    previousFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    closeButtonRef.current?.focus();

    return () => previousFocusRef.current?.focus();
  }, [isModalOpen]);

  useEffect(() => {
    if (isModalOpen && !wasModalOpenRef.current) {
      setShowInstructions(!platformInfo.isIos && !hasPromptEvent);
      setInstallStatus('idle');
      setIconAvailable(true);
    }
    wasModalOpenRef.current = isModalOpen;
  }, [isModalOpen, platformInfo.isIos, hasPromptEvent]);

  if (!isModalOpen) return null;

  const handleInstallClick = async () => {
    if (platformInfo.isIos || !hasPromptEvent) {
      setShowInstructions(true);
      return;
    }

    setInstallStatus('installing');
    const outcome = await triggerInstall();

    if (outcome === 'accepted') {
      setInstallStatus('accepted');
    } else if (outcome === 'dismissed') {
      setInstallStatus('dismissed');
      setShowInstructions(true);
    } else if (outcome === 'error') {
      setInstallStatus('error');
      setShowInstructions(true);
    } else {
      setInstallStatus('idle');
      setShowInstructions(true);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      closeModal();
      return;
    }

    if (event.key !== 'Tab') return;
    const focusable = event.currentTarget.querySelectorAll<HTMLElement>(
      'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable.item(0);
    const last = focusable.item(focusable.length - 1);

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  };

  const renderIosInstructions = () => (
    <div className="pwa-instructions" aria-live="polite">
      <p className="pwa-instructions-heading">Para adicionar à tela inicial:</p>
      <ol>
        <li><span>1</span><span>Abra o site no Safari.</span></li>
        <li>
          <span>2</span>
          <span>Toque em <strong>Compartilhar</strong> <Share aria-hidden="true" />.</span>
        </li>
        <li>
          <span>3</span>
          <span>Escolha <strong>“Adicionar à Tela de Início”</strong> <Plus aria-hidden="true" />.</span>
        </li>
        <li><span>4</span><span>Confirme em <strong>“Adicionar”</strong>.</span></li>
      </ol>
    </div>
  );

  const renderManualInstructions = () => (
    <div className="pwa-instructions" aria-live="polite">
      <p className="pwa-instructions-heading">
        {platformInfo.isAndroid
          ? 'No menu do navegador, procure “Instalar app” ou “Adicionar à tela inicial”.'
          : platformInfo.isDesktop
            ? 'No menu ou na barra de endereço do navegador, procure a opção para instalar este site como aplicativo.'
            : 'No menu do navegador, procure “Instalar aplicativo” ou “Adicionar à tela inicial”, se disponível.'}
      </p>
      <p>As opções variam conforme o navegador. A instalação não está disponível diretamente neste navegador agora.</p>
    </div>
  );

  const renderStatus = () => {
    if (isInstalled) {
      return (
        <div className="pwa-status pwa-status-success" role="status">
          <Check aria-hidden="true" />
          <span>Este aplicativo já está instalado neste dispositivo.</span>
        </div>
      );
    }

    if (installStatus === 'installing') {
      return <div className="pwa-status" role="status">Aguardando a resposta do navegador…</div>;
    }
    if (installStatus === 'accepted') {
      return (
        <div className="pwa-status" role="status">
          Solicitação aceita pelo navegador. A instalação pode levar alguns instantes.
        </div>
      );
    }
    if (installStatus === 'dismissed') {
      return <div className="pwa-status" role="status">Instalação cancelada. Você pode tentar novamente quando quiser.</div>;
    }
    if (installStatus === 'error') {
      return (
        <div className="pwa-status pwa-status-error" role="alert">
          <AlertCircle aria-hidden="true" />
          <span>Não foi possível abrir a instalação direta. Use as instruções do navegador abaixo.</span>
        </div>
      );
    }
    return null;
  };

  const isIos = platformInfo.isIos;
  const platformLabel = platformInfo.isAndroid
    ? 'VERSÃO PARA ANDROID'
    : platformInfo.isDesktop
      ? 'VERSÃO PARA DESKTOP'
      : 'APLICATIVO WEB';
  const title = isIos
    ? 'Instale este aplicativo no seu iPhone ou iPad'
    : platformInfo.isAndroid
      ? 'Instale este aplicativo no seu dispositivo Android'
      : platformInfo.isDesktop
        ? 'Instale este aplicativo no seu computador'
        : 'Instale este aplicativo no seu dispositivo';

  return (
    <div
      className={`pwa-overlay${isIos ? ' pwa-overlay-ios' : ''}`}
      onClick={closeModal}
    >
      <section
        className={`pwa-dialog${isIos ? ' pwa-dialog-ios' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pwa-install-title"
        aria-describedby="pwa-install-subtitle"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <button
          ref={closeButtonRef}
          type="button"
          className="pwa-close"
          onClick={closeModal}
          aria-label="Fechar janela de instalação"
        >
          <X aria-hidden="true" />
        </button>

        <header className="pwa-header">
          <span className={`pwa-badge${isIos ? ' pwa-badge-ios' : ''}`}>
            {isIos ? <Smartphone aria-hidden="true" /> : platformInfo.isDesktop ? <Monitor aria-hidden="true" /> : <Info aria-hidden="true" />}
            {isIos ? 'VERSÃO PARA iOS' : platformLabel}
          </span>
          {isIos && platformInfo.iosDevice && (
            <span className="pwa-device">Dispositivo: <strong>{platformInfo.iosDevice}</strong></span>
          )}
        </header>

        <div className="pwa-intro">
          {iconAvailable && (
            <img
              className="pwa-icon"
              src="/icons/icon-192x192.png"
              alt=""
              aria-hidden="true"
              onError={() => setIconAvailable(false)}
            />
          )}
          {!iconAvailable && (
            <span className="pwa-icon pwa-icon-fallback" aria-hidden="true">
              <Smartphone />
            </span>
          )}
          <div>
            <h2 id="pwa-install-title">{title}</h2>
            <p id="pwa-install-subtitle">
              {isIos
                ? 'Adicione à tela inicial para acessar rapidamente, como um aplicativo'
                : 'Adicione à tela inicial ou instale para acessar rapidamente, como um aplicativo.'}
            </p>
          </div>
        </div>

        {renderStatus()}

        {isIos && !platformInfo.isSafariOnIos && (
          <p className="pwa-status pwa-browser-note" role="note">
            Se estiver usando outro navegador no iOS, abra este site no Safari para continuar.
          </p>
        )}

        {isIos
          ? showInstructions && renderIosInstructions()
          : showInstructions && renderManualInstructions()}

        <footer className="pwa-actions">
          <button
            type="button"
            className="pwa-install-button"
            onClick={handleInstallClick}
            disabled={isInstalled || installStatus === 'installing'}
          >
            <Download aria-hidden="true" />
            Instalar aplicativo
          </button>
          <button type="button" className="pwa-dismiss-button" onClick={closeModal}>
            Fechar
          </button>
        </footer>
      </section>
    </div>
  );
};
