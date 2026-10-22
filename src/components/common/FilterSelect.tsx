import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';

export interface FilterOption {
  value: string | number;
  label: string;
  icon?: React.ElementType;
}

interface FilterSelectProps {
  value: string | number;
  onChange: (value: string) => void;
  options: FilterOption[];
  className?: string;
  ariaLabel?: string;
  /** Altura/padding do botão. 'sm' para barras compactas. */
  size?: 'md' | 'sm';
  /** Destaca o botão (borda ciano) quando a opção escolhida não é a primeira. Use false em formulários. */
  highlightActive?: boolean;
  /** Mantém a validação nativa de campo obrigatório dos formulários. */
  required?: boolean;
}

interface PanelPos {
  top: number;
  left: number;
  minWidth: number;
}

/**
 * Dropdown no padrão visual do sistema. Substitui o <select> nativo, cuja lista
 * aberta não aceita estilização. A lista é desenhada em um portal (fora do
 * container), então não é cortada por modais ou áreas com rolagem.
 */
export const FilterSelect: React.FC<FilterSelectProps> = ({
  value,
  onChange,
  options,
  className = '',
  ariaLabel,
  size = 'md',
  highlightActive = true,
  required = false
}) => {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const [pos, setPos] = useState<PanelPos | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLUListElement>(null);
  const adjusted = useRef(false);

  const selected = options.find(o => String(o.value) === String(value)) || options[0];
  const SelectedIcon = selected?.icon;
  const isFiltering = highlightActive && options.length > 0 && String(value) !== String(options[0].value);

  const closeMenu = () => {
    setOpen(false);
    setPos(null);
  };

  const openMenu = () => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    adjusted.current = false;
    setHighlighted(Math.max(0, options.findIndex(o => String(o.value) === String(value))));
    setPos({ top: rect.bottom + 6, left: rect.left, minWidth: rect.width });
    setOpen(true);
  };

  // Ajusta a posição depois de medir a lista: vira para cima / para a esquerda se faltar espaço.
  useLayoutEffect(() => {
    if (!open || !pos || adjusted.current || !panelRef.current || !buttonRef.current) return;
    adjusted.current = true;
    const panel = panelRef.current.getBoundingClientRect();
    const btn = buttonRef.current.getBoundingClientRect();
    let { top, left } = pos;
    if (panel.right > window.innerWidth - 8) left = Math.max(8, window.innerWidth - 8 - panel.width);
    if (panel.bottom > window.innerHeight - 8 && btn.top - 6 - panel.height > 8) top = btn.top - 6 - panel.height;
    if (top !== pos.top || left !== pos.left) setPos({ ...pos, top, left });
  }, [open, pos]);

  // Fecha ao clicar fora, rolar a página ou redimensionar a janela.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (buttonRef.current?.contains(t) || panelRef.current?.contains(t)) return;
      closeMenu();
    };
    const onScroll = (e: Event) => {
      if (panelRef.current?.contains(e.target as Node)) return;
      closeMenu();
    };
    document.addEventListener('mousedown', onDown);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', closeMenu);
    return () => {
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', closeMenu);
    };
  }, [open]);

  // Mantém o item destacado visível ao navegar pelo teclado.
  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLElement>(`[data-idx="${highlighted}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [highlighted, open]);

  const choose = (v: string | number) => {
    onChange(String(v));
    closeMenu();
    buttonRef.current?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (open) {
        e.stopPropagation();
        closeMenu();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) openMenu();
      else setHighlighted(h => (h + 1) % options.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) openMenu();
      else setHighlighted(h => (h - 1 + options.length) % options.length);
    } else if (e.key === 'Enter' && open) {
      e.preventDefault();
      choose(options[highlighted].value);
    }
  };

  const sizeClasses = size === 'sm' ? 'min-h-[32px] px-2.5 py-1.5 rounded-lg' : 'min-h-[40px] px-3 py-2 rounded-xl';

  return (
    <div className={`relative ${className}`} onKeyDown={onKeyDown}>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => (open ? closeMenu() : openMenu())}
        className={`w-full border bg-slate-950 text-xs flex items-center justify-between gap-2 transition-all cursor-pointer ${sizeClasses} ${
          open
            ? 'border-cyan-500 ring-1 ring-cyan-500/30 text-white'
            : isFiltering
            ? 'border-cyan-500/40 text-cyan-200 hover:border-cyan-500/60'
            : 'border-slate-800 text-slate-300 hover:border-slate-600'
        }`}
      >
        <span className="flex items-center gap-2 min-w-0">
          {SelectedIcon && <SelectedIcon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
          <span className="truncate text-left">{selected?.label}</span>
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 shrink-0 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180 text-cyan-400' : ''}`}
        />
      </button>

      {required && (
        <input
          tabIndex={-1}
          aria-hidden="true"
          required
          value={String(value)}
          onChange={() => {}}
          className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
        />
      )}

      {open && pos && createPortal(
        <ul
          ref={panelRef}
          role="listbox"
          style={{ top: pos.top, left: pos.left, minWidth: pos.minWidth }}
          className="fixed z-[1000] w-max max-w-[min(28rem,calc(100vw-16px))] max-h-72 overflow-y-auto p-1.5 rounded-xl bg-slate-900 border border-slate-700/80 shadow-2xl shadow-black/50 animate-in fade-in zoom-in-95 duration-100"
        >
          {options.map((opt, i) => {
            const Icon = opt.icon;
            const isSelected = String(opt.value) === String(value);
            return (
              <li key={String(opt.value) + i} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  data-idx={i}
                  onClick={() => choose(opt.value)}
                  onMouseEnter={() => setHighlighted(i)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-500/15 text-cyan-200 font-semibold'
                      : highlighted === i
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-300'
                  }`}
                >
                  {Icon && (
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                  )}
                  <span className="flex-1 leading-snug">{opt.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                </button>
              </li>
            );
          })}
        </ul>,
        document.body
      )}
    </div>
  );
};