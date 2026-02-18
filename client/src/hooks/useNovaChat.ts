import { useState, useCallback, useRef, useEffect } from "react";

export interface NovaChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

interface UseNovaChatReturn {
  messages: NovaChatMessage[];
  sendMessage: (content: string) => Promise<void>;
  isLoading: boolean;
  isStreaming: boolean;
  activeTools: string[];
  error: Error | null;
  clearMessages: () => void;
}

const STORAGE_KEY = "cccm-nova-conversation-id";

export function useNovaChat(): UseNovaChatReturn {
  const [messages, setMessages] = useState<NovaChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeTools, setActiveTools] = useState<string[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(() => {
    try { return sessionStorage.getItem(STORAGE_KEY); } catch { return null; }
  });
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => { abortRef.current?.abort(); };
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      const userMessage: NovaChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content,
        createdAt: new Date(),
      };

      let currentMessages: NovaChatMessage[] = [];
      setMessages((prev) => {
        currentMessages = prev;
        return [...prev, userMessage];
      });

      setIsLoading(true);
      setIsStreaming(false);
      setActiveTools([]);
      setError(null);

      const conversationHistory = [...currentMessages, userMessage]
        .filter((m) => m.role === "user" || m.role === "assistant")
        .slice(-10)
        .map((m) => ({ role: m.role, content: m.content }));

      const assistantId = crypto.randomUUID();

      try {
        abortRef.current = new AbortController();

        const response = await fetch("/api/nova/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: content.trim(), conversationHistory, conversationId }),
          signal: abortRef.current.signal,
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(`Error ${response.status}: ${text}`);
        }

        if (!response.body) throw new Error("No response body");

        setIsStreaming(true);

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let fullText = "";

        setMessages((prev) => [
          ...prev,
          { id: assistantId, role: "assistant", content: "", createdAt: new Date() },
        ]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          let eventType = "";
          for (const line of lines) {
            const cleanLine = line.replace(/\r$/, "");
            if (cleanLine.startsWith("event: ")) {
              eventType = cleanLine.slice(7).trim();
            } else if (cleanLine.startsWith("data: ")) {
              const dataStr = cleanLine.slice(6).trim();
              try {
                const data = JSON.parse(dataStr);
                switch (eventType) {
                  case "token":
                    fullText += data.text;
                    setMessages((prev) =>
                      prev.map((m) => m.id === assistantId ? { ...m, content: fullText } : m)
                    );
                    break;
                  case "tool_start":
                    setActiveTools((prev) => [...prev, data.tool]);
                    break;
                  case "tool_result":
                    setActiveTools((prev) => prev.filter((t) => t !== data.tool));
                    break;
                  case "done": {
                    const newConvId = data.conversationId || data.conversation_id;
                    if (typeof newConvId === "string" && newConvId.trim()) {
                      setConversationId(newConvId);
                      try { sessionStorage.setItem(STORAGE_KEY, newConvId); } catch {}
                    }
                    if (data.answer) {
                      setMessages((prev) =>
                        prev.map((m) => m.id === assistantId ? { ...m, content: data.answer } : m)
                      );
                    }
                    break;
                  }
                  case "error":
                    setError(new Error(data.message || "Error desconocido"));
                    setMessages((prev) =>
                      prev.map((m) =>
                        m.id === assistantId ? { ...m, content: fullText || `Error: ${data.message}` } : m
                      )
                    );
                    break;
                }
                eventType = "";
              } catch {}
            }
          }
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        const errorObj = err instanceof Error ? err : new Error("Error desconocido");
        setError(errorObj);
        setMessages((prev) => {
          const hasAssistant = prev.some((m) => m.id === assistantId);
          if (hasAssistant) {
            return prev.map((m) =>
              m.id === assistantId && !m.content
                ? { ...m, content: `Lo siento, ocurrió un error: ${errorObj.message}` }
                : m
            );
          }
          return [...prev, {
            id: assistantId, role: "assistant" as const,
            content: `Lo siento, ocurrió un error: ${errorObj.message}`, createdAt: new Date(),
          }];
        });
      } finally {
        setIsLoading(false);
        setIsStreaming(false);
        setActiveTools([]);
        abortRef.current = null;
      }
    },
    [conversationId]
  );

  const clearMessages = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setError(null);
    setIsLoading(false);
    setIsStreaming(false);
    setActiveTools([]);
    setConversationId(null);
    try { sessionStorage.removeItem(STORAGE_KEY); } catch {}
  }, []);

  return { messages, sendMessage, isLoading, isStreaming, activeTools, error, clearMessages };
}
