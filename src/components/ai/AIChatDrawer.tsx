import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { querySmartFlowAI, AIChatMessage } from '../../services/geminiService';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  ChevronRight,
  MapPin,
  Wrench,
  FileText,
  Package,
  Activity,
  RotateCcw,
  Cpu,
  TrendingUp,
  Layers,
  MessageSquare,
  Trash2
} from 'lucide-react';

interface AIChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const INITIAL_MESSAGE: AIChatMessage = {
  id: 'msg-0',
  sender: 'assistant',
  text: 'Olá! Sou o **SmartFlow AI Copilot**, o cérebro operacional e preditivo da OTIS. Estou monitorando os dados em tempo real de equipamentos, técnicos, contratos e telemetria. Como posso ajudar sua tomada de decisão?',
  timestamp: 'Agora'
};

interface SavedChat {
  id: string;
  title: string;
  messages: AIChatMessage[];
  updatedAt: number;
}

const STORAGE_KEY = 'smartflow-ai-chats';

const loadSavedChats = (): SavedChat[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const formatChatDate = (ts: number) => {
  const d = new Date(ts);
  const hoje = new Date();
  return d.toDateString() === hoje.toDateString()
    ? d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
};

const QUICK_QUESTIONS = [
  { text: 'Quais cidades possuem maior taxa de chamados?', hint: 'Mapa de demanda por região', icon: MapPin },
  { text: 'Quais equipamentos estão em risco preditivo?', hint: 'Falhas previstas e manutenção', icon: Activity },
  { text: 'Qual técnico está acima do tempo médio?', hint: 'Desempenho da equipe de campo', icon: Wrench },
  { text: 'Quais contratos estão perdendo margem?', hint: 'Custos, receita e desvios', icon: FileText },
  { text: 'Qual peça apresenta consumo anormal?', hint: 'Estoque e almoxarifado', icon: Package }
];

/** Converte **texto** em negrito, sem expor os asteriscos na tela. */
const renderText = (text: string) =>
  text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') && part.length > 4
      ? <strong key={i} className="font-bold text-white">{part.slice(2, -2)}</strong>
      : <React.Fragment key={i}>{part}</React.Fragment>
  );

export const AIChatDrawer: React.FC<AIChatDrawerProps> = ({ isOpen, onClose }) => {
  const { equipments, calls, technicians, contracts, parts, setActiveView } = useApp();
  const [inputPrompt, setInputPrompt] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<AIChatMessage[]>([INITIAL_MESSAGE]);
  const [chats, setChats] = useState<SavedChat[]>(loadSavedChats);
  const [currentChatId, setCurrentChatId] = useState(() => 'chat-' + Date.now());

  // Salva a conversa atual automaticamente assim que o usuário faz a primeira pergunta.
  useEffect(() => {
    const firstUser = messages.find(m => m.sender === 'user');
    if (!firstUser) return;
    setChats(prev => {
      const existing = prev.find(c => c.id === currentChatId);
      if (existing && existing.messages.length === messages.length) return prev;
      const title = firstUser.text.length > 48 ? firstUser.text.slice(0, 48) + '…' : firstUser.text;
      const updated: SavedChat = { id: currentChatId, title, messages, updatedAt: Date.now() };
      return [updated, ...prev.filter(c => c.id !== currentChatId)];
    });
  }, [messages, currentChatId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
    } catch {
      /* armazenamento indisponível: as conversas continuam só na sessão */
    }
  }, [chats]);

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputPrompt;
    if (!query.trim() || isThinking) return;

    const userMsg: AIChatMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputPrompt('');
    setIsThinking(true);

    setTimeout(() => {
      const response = querySmartFlowAI(query, {
        equipments,
        calls,
        technicians,
        contracts,
        parts
      });

      const aiMsg: AIChatMessage = {
        id: 'ai-' + Date.now(),
        sender: 'assistant',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        metrics: response.metrics,
        suggestedAction: response.suggestedAction
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsThinking(false);
    }, 600);
  };

  const handleNewChat = () => {
    setCurrentChatId('chat-' + Date.now());
    setMessages([INITIAL_MESSAGE]);
    setInputPrompt('');
    setIsThinking(false);
    inputRef.current?.focus();
  };

  const handleOpenChat = (chat: SavedChat) => {
    if (chat.id === currentChatId || isThinking) return;
    setCurrentChatId(chat.id);
    setMessages(chat.messages);
    setInputPrompt('');
  };

  const handleDeleteChat = (id: string) => {
    setChats(prev => prev.filter(c => c.id !== id));
    if (id === currentChatId) handleNewChat();
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Esc fecha a tela; ao abrir, foca no campo de pergunta.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    inputRef.current?.focus();
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isFreshChat = messages.length === 1;

  const monitored = [
    { label: 'Equipamentos', value: equipments.length },
    { label: 'Chamados', value: calls.length },
    { label: 'Técnicos', value: technicians.length },
    { label: 'Contratos', value: contracts.length },
    { label: 'Peças', value: parts.length }
  ];

  const layers = [
    { name: 'Operacional', desc: 'Chamados, SLA e equipe de campo', dot: 'bg-blue-400' },
    { name: 'Preditiva', desc: 'Risco de falha e manutenção', dot: 'bg-amber-400' },
    { name: 'Estratégica', desc: 'Margem, contratos e custos', dot: 'bg-emerald-400' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col animate-in fade-in duration-200">

      {/* Cabeçalho */}
      <header className="px-4 sm:px-6 py-3 border-b border-slate-800 bg-slate-900/80 backdrop-blur flex items-center justify-between gap-3 safe-top">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30 shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-100 truncate">SmartFlow AI Copilot</h2>
              <span className="hidden sm:inline px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30">
                3 Camadas
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">Inteligência Operacional • Preditiva • Estratégica</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleNewChat}
            disabled={isFreshChat && !isThinking}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Nova conversa</span>
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center touch-manipulation"
            aria-label="Fechar Copilot"
            title="Fechar (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 min-h-0 flex">

        {/* Coluna lateral (telas grandes) */}
        <aside className="hidden lg:flex w-[22rem] shrink-0 flex-col gap-6 p-5 border-r border-slate-800 bg-slate-900/40 overflow-y-auto">
          <section className="shrink-0">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Layers className="w-4 h-4" /> Camadas de análise
            </h3>
            <div className="space-y-2">
              {layers.map(l => (
                <div key={l.name} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${l.dot}`} />
                    <span className="text-sm font-bold text-slate-100">{l.name}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 ml-4">{l.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="shrink-0">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Cpu className="w-4 h-4" /> Dados monitorados
            </h3>
            <div className="rounded-xl bg-slate-950/70 border border-slate-800 divide-y divide-slate-800">
              {monitored.map(m => (
                <div key={m.label} className="px-3 py-2.5 flex items-center justify-between">
                  <span className="text-[13px] text-slate-300">{m.label}</span>
                  <span className="text-[13px] font-bold font-mono text-white">{m.value}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Conversas salvas */}
          <section className="flex-1 min-h-[10rem] flex flex-col">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5 shrink-0">
              <MessageSquare className="w-4 h-4" /> Minhas conversas
              {chats.length > 0 && <span className="ml-auto font-mono text-slate-500">{chats.length}</span>}
            </h3>
            {chats.length === 0 ? (
              <p className="text-xs text-slate-500 leading-relaxed">
                Suas conversas ficam salvas aqui. Faça uma pergunta e depois inicie uma nova conversa para guardar esta.
              </p>
            ) : (
              <div className="space-y-1.5 overflow-y-auto pr-1">
                {chats.map(c => {
                  const ativo = c.id === currentChatId;
                  return (
                    <div
                      key={c.id}
                      onClick={() => handleOpenChat(c)}
                      className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl border cursor-pointer transition-colors ${
                        ativo
                          ? 'bg-blue-500/10 border-blue-500/30'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className={`text-[13px] font-semibold truncate ${ativo ? 'text-white' : 'text-slate-200'}`}>{c.title}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {formatChatDate(c.updatedAt)} • {c.messages.filter(m => m.sender === 'user').length} pergunta(s)
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteChat(c.id); }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        aria-label="Excluir conversa"
                        title="Excluir conversa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </aside>

        {/* Conversa */}
        <main className="flex-1 min-w-0 flex flex-col">
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-6 space-y-5">

              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.sender === 'assistant' && (
                    <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-300 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`max-w-[88%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-md'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-md shadow-sm'
                  }`}>
                    <div className="whitespace-pre-line">{renderText(m.text)}</div>

                    {m.metrics && m.metrics.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {m.metrics.map((met, idx) => (
                          <div key={idx} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                            <div className="text-[10px] text-slate-400">{met.label}</div>
                            <div className="text-sm font-bold font-mono text-cyan-300 mt-0.5">{met.value}</div>
                            {met.trend && (
                              <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />{met.trend}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {m.suggestedAction && (
                      <div className="mt-3">
                        <button
                          onClick={() => {
                            if (m.suggestedAction?.actionType === 'NAVIGATE_MAPS') setActiveView('maps');
                            else if (m.suggestedAction?.actionType === 'NAVIGATE_PREDICTIVE') setActiveView('maintenance');
                            else if (m.suggestedAction?.actionType === 'NAVIGATE_SUPERVISOR') setActiveView('supervisors');
                            else if (m.suggestedAction?.actionType === 'NAVIGATE_FINANCIAL') setActiveView('financial');
                            else if (m.suggestedAction?.actionType === 'NAVIGATE_PARTS') setActiveView('parts');
                            onClose();
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white font-semibold text-xs border border-slate-700 hover:border-blue-600 transition-colors cursor-pointer"
                        >
                          <span>{m.suggestedAction.label}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    <div className={`text-[10px] mt-2 text-right ${m.sender === 'user' ? 'text-blue-200' : 'text-slate-500'}`}>
                      {m.timestamp}
                    </div>
                  </div>

                  {m.sender === 'user' && (
                    <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {/* Sugestões iniciais */}
              {isFreshChat && !isThinking && (
                <div className="pt-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Comece por uma pergunta
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {QUICK_QUESTIONS.map((q, i) => {
                      const Icon = q.icon;
                      return (
                        <button
                          key={i}
                          onClick={() => handleSendMessage(q.text)}
                          className="group text-left p-4 rounded-2xl bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-600 transition-all cursor-pointer flex items-start gap-3"
                        >
                          <span className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 flex items-center justify-center shrink-0">
                            <Icon className="w-4 h-4" />
                          </span>
                          <span className="min-w-0">
                            <span className="block text-[13px] font-semibold text-slate-100 leading-snug">{q.text}</span>
                            <span className="block text-[11px] text-slate-400 mt-1">{q.hint}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {isThinking && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-300 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 animate-pulse" />
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-bl-md px-4 py-3 text-xs text-slate-400 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce [animation-delay:0.4s]" />
                    <span>SmartFlow AI processando correlações...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Campo de pergunta */}
          <div className="border-t border-slate-800 bg-slate-950 safe-bottom">
            <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-3">
              {!isFreshChat && (
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2.5">
                  {QUICK_QUESTIONS.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(q.text)}
                      disabled={isThinking}
                      className="text-[11px] px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-600 transition-colors shrink-0 whitespace-nowrap cursor-pointer disabled:opacity-40"
                    >
                      {q.text}
                    </button>
                  ))}
                </div>
              )}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2 p-1.5 pl-4 rounded-2xl bg-slate-900 border border-slate-800 focus-within:border-blue-500/60 transition-colors"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputPrompt}
                  onChange={(e) => setInputPrompt(e.target.value)}
                  placeholder="Pergunte ao SmartFlow AI sobre frotas, riscos, custos..."
                  className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none py-2"
                />
                <button
                  type="submit"
                  disabled={!inputPrompt.trim() || isThinking}
                  className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Enviar"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <div className="mt-2 text-[10px] text-center text-slate-500">
                Powered by SmartFlow Reasoning Core & @google/genai
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};