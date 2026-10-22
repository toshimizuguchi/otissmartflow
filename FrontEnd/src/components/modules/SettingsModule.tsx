import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sliders, Save, RotateCcw, UploadCloud, ArrowRight, Minus, Plus } from 'lucide-react';

// Estilo dos controles deslizantes (barra preenchida + bolinha) — fica junto do componente
const RANGE_CSS = `
.sp-range{-webkit-appearance:none;appearance:none;width:100%;height:clamp(6px,0.42vw,8px);border-radius:999px;outline:none;cursor:pointer;
  background:linear-gradient(to right,var(--c) 0%,var(--c) var(--pct),#1e293b var(--pct),#1e293b 100%);
  box-shadow:inset 0 0 0 1px rgba(148,163,184,.18);transition:filter .15s}
.sp-range:hover{filter:brightness(1.15)}
.sp-range::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:clamp(16px,1.05vw,20px);height:clamp(16px,1.05vw,20px);border-radius:50%;
  background:#fff;border:3px solid var(--c);box-shadow:0 0 0 4px color-mix(in srgb,var(--c) 22%,transparent),0 2px 8px rgba(0,0,0,.55);transition:transform .12s,box-shadow .12s}
.sp-range::-webkit-slider-thumb:hover{transform:scale(1.12)}
.sp-range:active::-webkit-slider-thumb{transform:scale(1.2);box-shadow:0 0 0 7px color-mix(in srgb,var(--c) 28%,transparent),0 2px 8px rgba(0,0,0,.55)}
.sp-range::-moz-range-track{height:clamp(6px,0.42vw,8px);border-radius:999px;background:#1e293b}
.sp-range::-moz-range-progress{height:clamp(6px,0.42vw,8px);border-radius:999px;background:var(--c)}
.sp-range::-moz-range-thumb{width:clamp(16px,1.05vw,20px);height:clamp(16px,1.05vw,20px);border-radius:50%;background:#fff;border:3px solid var(--c);box-shadow:0 2px 8px rgba(0,0,0,.55)}
.sp-range:focus-visible{outline:2px solid var(--c);outline-offset:6px}
.sp-step{width:clamp(26px,1.7vw,32px);height:clamp(26px,1.7vw,32px);border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;
  background:#0f172a;border:1px solid #334155;color:#cbd5e1;cursor:pointer;transition:all .15s}
.sp-step:hover:not(:disabled){background:#1e293b;border-color:var(--c);color:#fff}
.sp-step:active:not(:disabled){transform:scale(.92)}
.sp-step:disabled{opacity:.35;cursor:not-allowed}
`;

const DEFAULTS = { door: 35, age: 25, history: 40 };

export const SettingsModule: React.FC = () => {
  const { addToast, setActiveView } = useApp();
  const [door, setDoor] = useState(DEFAULTS.door);
  const [age, setAge] = useState(DEFAULTS.age);
  const [history, setHistory] = useState(DEFAULTS.history);

  const total = door + age + history;
  const totalOk = total === 100;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    addToast({
      type: 'success',
      title: 'Parâmetros Salvos',
      message: 'Pesos do cálculo preditivo atualizados com sucesso.'
    });
  };

  const handleReset = () => {
    setDoor(DEFAULTS.door);
    setAge(DEFAULTS.age);
    setHistory(DEFAULTS.history);
    addToast({ type: 'info', title: 'Pesos Restaurados', message: 'Valores padrão do cálculo preditivo reaplicados.' });
  };

  const weights = [
    { key: 'door', label: 'Ciclos de Porta', hint: 'Desgaste por número de aberturas e fechamentos', value: door, set: setDoor, min: 10, max: 60, color: '#06b6d4', text: 'text-cyan-400' },
    { key: 'age', label: 'Idade do Equipamento', hint: 'Tempo de operação desde a instalação', value: age, set: setAge, min: 10, max: 50, color: '#818cf8', text: 'text-indigo-400' },
    { key: 'history', label: 'Histórico de Falhas', hint: 'Recorrência de chamados e paradas anteriores', value: history, set: setHistory, min: 10, max: 60, color: '#10b981', text: 'text-emerald-400' }
  ];

  return (
    <div className="fluid-page fluid-plus space-y-6 animate-in fade-in duration-200">
      <style>{RANGE_CSS}</style>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800/90 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Parâmetros do Sistema
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <form onSubmit={handleSave} className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              Pesos do Cálculo Preditivo (0 a 100)
            </h3>
            <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${
              totalOk
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
            }`}>
              Soma dos pesos: {total}% {totalOk ? '✓' : '(ideal: 100%)'}
            </span>
          </div>

          <div className="space-y-5">
            {weights.map(w => {
              const pct = ((w.value - w.min) / (w.max - w.min)) * 100;
              const style = { ['--c' as any]: w.color, ['--pct' as any]: `${pct}%` } as React.CSSProperties;
              return (
                <div key={w.key} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3" style={style}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-100">{w.label}</div>
                      <div className="text-[11px] text-slate-400">{w.hint}</div>
                    </div>
                    <span className={`font-mono font-bold text-base px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 ${w.text}`}>
                      {w.value}%
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className="sp-step"
                      style={style}
                      disabled={w.value <= w.min}
                      onClick={() => w.set(Math.max(w.min, w.value - 1))}
                      aria-label={`Diminuir ${w.label}`}
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <input
                      type="range"
                      min={w.min}
                      max={w.max}
                      value={w.value}
                      onChange={(e) => w.set(Number(e.target.value))}
                      className="sp-range"
                      style={style}
                      aria-label={w.label}
                    />

                    <button
                      type="button"
                      className="sp-step"
                      style={style}
                      disabled={w.value >= w.max}
                      onClick={() => w.set(Math.min(w.max, w.value + 1))}
                      aria-label={`Aumentar ${w.label}`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                    <span>mín. {w.min}%</span>
                    <span>máx. {w.max}%</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restaurar Padrão</span>
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-600/30 flex items-center gap-2 cursor-pointer transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Parâmetros</span>
            </button>
          </div>
        </form>

        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-slate-200 font-bold text-sm">
              <UploadCloud className="w-4 h-4 text-cyan-400" />
              <span>Importador de Dados</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Carregue planilhas XLSX/CSV com inventário de elevadores, clientes ou escalas de técnicos.
            </p>
            <button
              onClick={() => setActiveView('import')}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <span>Abrir Importação XLSX</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};