/**
 * NovaAI Assistant — Floating chat widget for CCCM Trazabilidad
 * Dark theme (#273949 + #b5e951 lime green) matching Econova design
 */

import { useState, useRef, useEffect, useCallback, type FormEvent, type KeyboardEvent } from "react";
import { useNovaChat } from "../hooks/useNovaChat";
import {
  MessageSquare, X, ArrowUp, RefreshCw, Wrench, Loader2,
} from "lucide-react";

const C = {
  dark: "#273949",
  lime: "#b5e951",
  limeDark: "#9ed43e",
  darkLight: "#344a5c",
  darkLighter: "#3d566a",
} as const;

const TOOL_LABELS: Record<string, string> = {
  query_db: "Consultando base de datos...",
  get_schema: "Obteniendo esquema...",
  calc_kpis: "Calculando KPIs...",
  smart_query: "Consultando datos...",
  analyze_data: "Analizando datos...",
  generate_pdf_report: "Generando reporte...",
};

function getToolLabel(tool: string): string {
  return TOOL_LABELS[tool] || `Ejecutando ${tool}...`;
}

function processInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    const codeMatch = remaining.match(/`(.+?)`/);

    let earliest: { type: string; index: number; match: RegExpMatchArray } | null = null;
    if (boldMatch && boldMatch.index !== undefined) {
      earliest = { type: "bold", index: boldMatch.index, match: boldMatch };
    }
    if (codeMatch && codeMatch.index !== undefined && (!earliest || codeMatch.index < earliest.index)) {
      earliest = { type: "code", index: codeMatch.index, match: codeMatch };
    }
    if (!earliest) { parts.push(remaining); break; }
    if (earliest.index > 0) parts.push(remaining.slice(0, earliest.index));
    if (earliest.type === "bold") {
      parts.push(<strong key={key++} className="font-semibold" style={{ color: C.lime }}>{earliest.match[1]}</strong>);
    } else {
      parts.push(<code key={key++} className="px-1.5 py-0.5 rounded text-xs font-mono" style={{ backgroundColor: C.darkLight, color: C.lime }}>{earliest.match[1]}</code>);
    }
    remaining = remaining.slice(earliest.index + earliest.match[0].length);
  }
  return parts.length === 1 ? parts[0] : <>{parts}</>;
}

function renderContent(text: string) {
  return text.split("\n").map((line, i) => {
    if (line.startsWith("### ")) return <h3 key={i} className="text-sm font-semibold mt-3 mb-1" style={{ color: C.lime }}>{processInline(line.slice(4))}</h3>;
    if (line.startsWith("## ")) return <h2 key={i} className="text-base font-bold mt-3 mb-2" style={{ color: C.lime }}>{processInline(line.slice(3))}</h2>;
    if (line.match(/^[-*]\s/)) return <div key={i} className="flex items-start gap-2 my-0.5"><span style={{ color: C.lime }}>&#x2022;</span><span>{processInline(line.slice(2))}</span></div>;
    if (line.match(/^\d+\.\s/)) {
      const match = line.match(/^(\d+)\.\s(.*)$/);
      if (match) return <div key={i} className="flex items-start gap-2 my-0.5"><span className="font-semibold text-xs min-w-[1.2em] text-right" style={{ color: C.lime }}>{match[1]}.</span><span>{processInline(match[2])}</span></div>;
    }
    if (line.trim() === "") return <div key={i} className="h-2" />;
    return <p key={i} className="my-1 leading-relaxed">{processInline(line)}</p>;
  });
}

export function NovaAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef(0);

  const { messages, sendMessage, isLoading, isStreaming, activeTools, clearMessages } = useNovaChat();

  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setIsOpen((prev) => !prev); }
      if (e.key === "Escape" && isOpen) setIsOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    const currentLength = messages.length;
    if (currentLength > prevMessagesLengthRef.current && currentLength > 0) {
      const lastMessage = messages[currentLength - 1];
      if (lastMessage.role === "assistant" && lastMessageRef.current) {
        requestAnimationFrame(() => setTimeout(() => lastMessageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50));
      } else if (lastMessage.role === "user" && scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }
    prevMessagesLengthRef.current = currentLength;
  }, [messages]);

  useEffect(() => {
    if (isStreaming && scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [isStreaming, messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  const handleSubmit = useCallback(async (e?: FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    const message = input.trim();
    setInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";
    await sendMessage(message);
  }, [input, isLoading, sendMessage]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-5 py-3 rounded-full text-sm font-medium transition-all hover:scale-[1.03] active:scale-[0.97] shadow-lg"
          style={{ backgroundColor: C.dark, color: "#ffffff" }}
        >
          <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: C.lime, color: C.dark }}>N</div>
          <span>NovaAI</span>
          <kbd className="ml-1 px-1.5 py-0.5 text-[10px] font-mono rounded hidden sm:inline" style={{ backgroundColor: C.darkLight, color: "rgba(255,255,255,0.7)" }}>{"\u2318"}K</kbd>
        </button>
      )}

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[8vh] px-4"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-[580px] flex flex-col overflow-hidden relative"
            style={{ backgroundColor: C.dark, borderRadius: "20px", boxShadow: "0 25px 60px -12px rgba(0,0,0,0.5)", maxHeight: "75vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${C.darkLight}` }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold" style={{ backgroundColor: C.lime, color: C.dark }}>N</div>
                <div>
                  <span className="font-semibold text-white text-sm">NovaAI</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: C.lime }} />
                    <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.5)" }}>Online</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button onClick={() => { clearMessages(); prevMessagesLengthRef.current = 0; }} className="p-2 rounded-lg transition-colors hover:bg-[#344a5c]" style={{ color: "rgba(255,255,255,0.5)" }} title="Nueva conversación">
                    <RefreshCw className="h-4 w-4" />
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="p-2 rounded-lg transition-colors hover:bg-[#344a5c]" style={{ color: "rgba(255,255,255,0.5)" }}>
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain" style={{ minHeight: "250px", maxHeight: "calc(75vh - 160px)" }}>
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-8 py-16">
                  <h2 className="text-2xl font-bold text-white mb-3">Hola, CCCM!</h2>
                  <p className="text-sm leading-relaxed max-w-xs" style={{ color: "rgba(255,255,255,0.6)" }}>
                    Soy <span className="font-semibold" style={{ color: C.lime }}>NovaAI</span>, tu asistente inteligente. Puedo ayudarte con análisis de residuos, reportes TRUE, métricas de desviación y más.
                  </p>
                  <p className="text-xs mt-3" style={{ color: "rgba(255,255,255,0.35)" }}>Pregúntame lo que necesites</p>
                </div>
              ) : (
                <div className="p-5 space-y-5">
                  {messages.map((message, index) => {
                    const isLastAssistant = message.role === "assistant" && index === messages.length - 1;
                    return (
                      <div key={message.id} ref={isLastAssistant ? lastMessageRef : undefined} className={message.role === "user" ? "flex justify-end" : ""}>
                        {message.role === "user" ? (
                          <div className="max-w-[85%]">
                            <div className="px-4 py-3 rounded-2xl rounded-br-md text-sm" style={{ backgroundColor: C.lime, color: C.dark }}>{message.content}</div>
                          </div>
                        ) : (
                          <div className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.9)" }}>
                            {renderContent(message.content)}
                            {isLastAssistant && isStreaming && <span className="inline-block w-2 h-4 ml-0.5 animate-pulse rounded-sm" style={{ backgroundColor: C.lime }} />}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {activeTools.length > 0 && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: C.darkLight }}>
                      <Wrench className="h-3.5 w-3.5 animate-spin" />
                      <span className="text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>{getToolLabel(activeTools[activeTools.length - 1])}</span>
                    </div>
                  )}
                  {isLoading && !isStreaming && activeTools.length === 0 && (
                    <div className="flex items-center gap-2" style={{ color: "rgba(255,255,255,0.5)" }}>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Pensando...</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4" style={{ borderTop: `1px solid ${C.darkLight}` }}>
              <form onSubmit={handleSubmit} className="relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 150) + "px"; }}
                  onKeyDown={handleKeyDown}
                  placeholder="Escribe tu pregunta..."
                  rows={1}
                  disabled={isLoading}
                  className="w-full resize-none rounded-xl px-4 py-3 pr-14 text-sm focus:outline-none transition-all"
                  style={{ backgroundColor: C.darkLight, border: `1px solid ${C.darkLighter}`, color: "#ffffff" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = C.lime)}
                  onBlur={(e) => (e.currentTarget.style.borderColor = C.darkLighter)}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 bottom-2 p-2.5 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ backgroundColor: C.lime, color: C.dark }}
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
              </form>
              <div className="hidden sm:flex items-center justify-center gap-4 mt-3 text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>
                <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono" style={{ backgroundColor: C.darkLight }}>{"\u21b5"}</kbd> enviar</span>
                <span style={{ color: "rgba(255,255,255,0.2)" }}>&middot;</span>
                <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono" style={{ backgroundColor: C.darkLight }}>esc</kbd> cerrar</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
