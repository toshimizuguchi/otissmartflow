import React, { useState, useEffect } from 'react';
import { 
  X, 
  Share, 
  PlusSquare, 
  Smartphone, 
  Monitor, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink,
  Download,
  Compass,
  ArrowRight
} from 'lucide-react';
import { UsePwaInstallReturn } from '../../hooks/usePwaInstall';

interface PwaInstallModalProps {
  pwa: UsePwaInstallReturn;
}

export const PwaInstallModal: React.FC<PwaInstallModalProps> = ({ pwa }) => {
  const { platformInfo, isModalOpen, closeModal, triggerInstall, hasPromptEvent, isInstalled } = pwa;
  const [showIosSteps, setShowIosSteps] = useState(false);
  const [installStatus, setInstallStatus] = useState<'idle' | 'installing' | 'accepted' | 'dismissed'>('idle');

  // Reset internal state when modal opens/closes
  useEffect(() => {
    if (isModalOpen) {
      setShowIosSteps(false);
      setInstallStatus('idle');
    }
  }, [isModalOpen]);

  // Handle ESC key press for accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, closeModal]);

  if (!isModalOpen) return null;

  const handleInstallClick = async () => {
    if (platformInfo.isIos) {
      // iOS: Never call prompt(), guide through step-by-step
      setShowIosSteps(true);
      return;
    }

    if (hasPromptEvent) {
      setInstallStatus('installing');
      const outcome = await triggerInstall();
      if (outcome === 'accepted') {
        setInstallStatus('accepted');
        setTimeout(() => closeModal(), 1800);
      } else if (outcome === 'dismissed') {
        setInstallStatus('dismissed');
      } else {
        setInstallStatus('idle');
      }
    } else {
      // Fallback instructions
      setShowIosSteps(true);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pwa-install-title"
      aria-describedby="pwa-install-subtitle"
      onClick={closeModal}
    >
      <div 
        className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        style={{
          background: 'radial-gradient(ellipse at top, #162035 0%, #0f1117 70%)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gradient Accent Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-36 bg-cyan-500/20 blur-3xl rounded-full pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={closeModal}
          aria-label="Fechar janela"
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700/80 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-7 space-y-5">
          {/* 1. Header Badge: Platform identification */}
          <div className="flex items-center justify-between">
            {platformInfo.isIos ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-sky-500/15 text-sky-400 border border-sky-500/30">
                <Smartphone className="w-3.5 h-3.5" />
                VERSÃO PARA iOS
              </span>
            ) : platformInfo.isAndroid ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <Smartphone className="w-3.5 h-3.5" />
                VERSÃO PARA ANDROID
              </span>
            ) : platformInfo.isDesktop ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                <Monitor className="w-3.5 h-3.5" />
                VERSÃO PARA DESKTOP
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-slate-800 text-slate-300 border border-slate-700">
                <HelpCircle className="w-3.5 h-3.5" />
                APLICATIVO WEB
              </span>
            )}

            {/* Optional Device Identification line - shown ONLY if reliably identified, otherwise NO empty space */}
            {platformInfo.isIos && platformInfo.iosDevice && (
              <span className="text-xs font-medium text-slate-400">
                Dispositivo: <strong className="text-slate-200">{platformInfo.iosDevice}</strong>
              </span>
            )}
          </div>

          {/* 2. App Icon & Title */}
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <img 
                src="/icons/icon-192x192.png" 
                alt="Ícone do Aplicativo" 
                className="w-16 h-16 rounded-2xl border border-sky-500/30 shadow-lg object-cover bg-slate-950"
              />
              <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-slate-900 border border-sky-400/40 text-cyan-400">
                <Download className="w-3 h-3" />
              </div>
            </div>

            <div className="space-y-1">
              <h2 id="pwa-install-title" className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">
                {platformInfo.isIos
                  ? 'Instale este aplicativo no seu iPhone ou iPad'
                  : platformInfo.isAndroid
                  ? 'Instale este aplicativo no seu Android'
                  : platformInfo.isDesktop
                  ? 'Instale este aplicativo no seu computador'
                  : 'Instale este aplicativo no seu dispositivo'}
              </h2>
              <p id="pwa-install-subtitle" className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Adicione à tela inicial para acessar rapidamente, como um aplicativo.
              </p>
            </div>
          </div>

          {/* Already installed state */}
          {isInstalled && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>O aplicativo já está instalado neste dispositivo.</span>
            </div>
          )}

          {/* Success state after prompt */}
          {installStatus === 'accepted' && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Instalação confirmada! O ícone foi adicionado ao seu dispositivo.</span>
            </div>
          )}

          {/* Dismissed notification */}
          {installStatus === 'dismissed' && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Instalação cancelada. Você pode instalar a qualquer momento.</span>
            </div>
          )}

          {/* 3. Platform Specific Detailed Instruction Content */}
          {platformInfo.isIos ? (
            <div className="space-y-3.5">
              {/* iOS Non-Safari Warning */}
              {!platformInfo.isSafariOnIos && (
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5">
                  <Compass className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p>
                    Você está em outro navegador no iOS. No iPhone ou iPad, a instalação na tela inicial exige abrir este site no <strong>Safari</strong>.
                  </p>
                </div>
              )}

              {/* iOS 4-step instructions: Displayed when user clicks install or when already guided */}
              {showIosSteps ? (
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3 text-xs animate-in fade-in">
                  <p className="font-semibold text-sky-300 uppercase tracking-wider text-[11px]">
                    Siga o passo a passo no iOS:
                  </p>
                  <ol className="space-y-2.5 text-slate-300">
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold flex items-center justify-center shrink-0 text-[11px]">
                        1
                      </span>
                      <span>Abra o site no <strong>Safari</strong>.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold flex items-center justify-center shrink-0 text-[11px]">
                        2
                      </span>
                      <span className="flex items-center gap-1.5 flex-wrap">
                        Toque no botão <strong>Compartilhar</strong>
                        <Share className="w-3.5 h-3.5 text-sky-400 inline" />
                        (na barra inferior do Safari).
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold flex items-center justify-center shrink-0 text-[11px]">
                        3
                      </span>
                      <span className="flex items-center gap-1.5 flex-wrap">
                        Escolha <strong>“Adicionar à Tela de Início”</strong>
                        <PlusSquare className="w-3.5 h-3.5 text-sky-400 inline" />.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold flex items-center justify-center shrink-0 text-[11px]">
                        4
                      </span>
                      <span>Confirme tocando em <strong>“Adicionar”</strong> no canto superior direito.</span>
                    </li>
                  </ol>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800 text-xs text-slate-300 space-y-1.5">
                  <div className="flex items-center gap-2 text-cyan-400 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Benefícios no seu dispositivo</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11.5px]">
                    <li>Acesso direto e tela cheia sem barras do navegador</li>
                    <li>Navegação ágil com GPS para atendimentos em campo</li>
                    <li>Carregamento rápido com suporte a modo offline</li>
                  </ul>
                </div>
              )}
            </div>
          ) : platformInfo.isAndroid ? (
            <div className="space-y-3">
              {!hasPromptEvent && showIosSteps && (
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5 text-xs">
                  <p className="font-semibold text-emerald-300 uppercase tracking-wider text-[11px]">
                    Instalação manual no Android:
                  </p>
                  <ol className="space-y-2 text-slate-300">
                    <li>1. Toque no menu do navegador (ícone de <strong>três pontinhos ⋮</strong> no topo).</li>
                    <li>2. Selecione a opção <strong>“Instalar aplicativo”</strong> ou <strong>“Adicionar à tela inicial”</strong>.</li>
                    <li>3. Confirme na caixa de diálogo do sistema.</li>
                  </ol>
                </div>
              )}

              {!showIosSteps && (
                <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800 text-xs text-slate-300 space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Recursos habilitados no celular</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11.5px]">
                    <li>Operação em tela cheia idêntica a aplicativo nativo</li>
                    <li>Acesso direto ao GPS e rotas de deslocamento</li>
                    <li>Consumo reduzido de dados móveis</li>
                  </ul>
                </div>
              )}
            </div>
          ) : platformInfo.isDesktop ? (
            <div className="space-y-3">
              {!hasPromptEvent && showIosSteps && (
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5 text-xs">
                  <p className="font-semibold text-cyan-300 uppercase tracking-wider text-[11px]">
                    Instalação no navegador do computador:
                  </p>
                  <ol className="space-y-2 text-slate-300">
                    <li>1. Na barra de endereços, clique no ícone de <strong>instalar aplicativo</strong> (ícone de monitor com seta ou símbolo de mais).</li>
                    <li>2. Ou abra o menu do navegador (<strong>⋮</strong>) e clique em <strong>“Instalar este aplicativo”</strong>.</li>
                  </ol>
                </div>
              )}

              {!showIosSteps && (
                <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800 text-xs text-slate-300 space-y-1.5">
                  <div className="flex items-center gap-2 text-cyan-400 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Janela independente no Desktop</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11.5px]">
                    <li>Atalho direto na barra de tarefas e menu Iniciar</li>
                    <li>Maior área útil para monitorar chamados e mapas</li>
                  </ul>
                </div>
              )}
            </div>
          ) : (
            // Unknown platform: Generic instructions
            <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800 text-xs text-slate-300 space-y-1.5">
              <p className="text-slate-400">
                Você pode instalar este aplicativo utilizando o menu de opções do seu navegador atual (“Instalar aplicativo” ou “Adicionar à tela inicial”).
              </p>
            </div>
          )}

          {/* 4. Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            {/* Primary Action Button: "Instalar aplicativo" */}
            <button
              onClick={handleInstallClick}
              disabled={isInstalled || installStatus === 'installing'}
              className="w-full sm:flex-1 py-3 px-5 rounded-2xl font-bold text-xs sm:text-sm text-slate-950 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-cyan-500/25 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #38bdf8 0%, #06b6d4 100%)'
              }}
            >
              {platformInfo.isIos && showIosSteps ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Entendi as instruções</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Instalar aplicativo</span>
                </>
              )}
            </button>

            {/* Secondary Action Button: "Fechar" */}
            <button
              onClick={closeModal}
              className="w-full sm:w-auto py-3 px-5 rounded-2xl font-semibold text-xs sm:text-sm text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 transition-all hover:text-white"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
