import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Car, Mail, Send, Settings, User, X } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Din Bil Sverige – AI Assistant" },
      { name: "description", content: "AI assistant for car search and email writing at Din Bil Sverige." },
    ],
  }),
});

const RED = "#E8000D";

const INVENTORY = [
  { model: "VW Golf GTE", year: 2024, price: 459900, fuel: "PHEV" },
  { model: "VW ID.4 Pro", year: 2024, price: 549900, fuel: "Electric" },
  { model: "Audi A4 45 TFSI", year: 2023, price: 649000, fuel: "Petrol" },
  { model: "Skoda Octavia", year: 2023, price: 349900, fuel: "Diesel" },
  { model: "CUPRA Formentor VZ", year: 2024, price: 589000, fuel: "Petrol" },
  { model: "Porsche Cayenne E-Hybrid", year: 2024, price: 1290000, fuel: "PHEV" },
  { model: "VW Tiguan", year: 2023, price: 429000, fuel: "Petrol" },
  { model: "Skoda Enyaq iV", year: 2024, price: 469900, fuel: "Electric" },
  { model: "Audi Q4 e-tron", year: 2024, price: 699000, fuel: "Electric" },
  { model: "VW Passat GTE Estate", year: 2024, price: 519900, fuel: "PHEV" },
];

const inventoryText = INVENTORY.map(
  (c) => `- ${c.model} ${c.year} — ${c.price.toLocaleString("sv-SE")} kr (${c.fuel})`,
).join("\n");

const SYSTEM_SEARCH = `You are a helpful car salesperson at Din Bil Sverige. Help the customer find the right car from our inventory. Ask short follow-up questions about budget, fuel type, and needs when relevant. Recommend a MAXIMUM of 2-3 cars per reply. Be concise, friendly, and professional. Always respond in English.

Our current inventory:
${inventoryText}`;

const SYSTEM_EMAIL = `You are an assistant for staff at Din Bil Sverige. Help them write professional, friendly, and clear customer emails in English. Ask for details if needed (recipient, purpose, tone). Deliver complete emails with a subject line and greeting. Maintain a professional, helpful tone.`;

const SUGGESTIONS_SEARCH = [
  "I'm looking for a family car under 500,000 kr",
  "Which electric car do you recommend?",
  "Show me your plug-in hybrids",
  "I want a sporty car",
];
const SUGGESTIONS_EMAIL = [
  "Write an email about a test drive",
  "Confirm a service booking",
  "Reply to a price inquiry",
  "Thank the customer for their purchase",
];

type Msg = { role: "user" | "assistant"; content: string };
type Mode = "search" | "email";

function Index() {
  const [mode, setMode] = useState<Mode>("search");
  const [searchMsgs, setSearchMsgs] = useState<Msg[]>([]);
  const [emailMsgs, setEmailMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [keyInput, setKeyInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const k = localStorage.getItem("anthropic_api_key") || "";
    setApiKey(k);
    if (!k) setShowSettings(true);
  }, []);

  const messages = mode === "search" ? searchMsgs : emailMsgs;
  const setMessages = mode === "search" ? setSearchMsgs : setEmailMsgs;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const saveKey = () => {
    localStorage.setItem("anthropic_api_key", keyInput.trim());
    setApiKey(keyInput.trim());
    setShowSettings(false);
    setKeyInput("");
  };

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    if (!apiKey) {
      setShowSettings(true);
      return;
    }
    const userMsg: Msg = { role: "user", content: text.trim() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5",
          max_tokens: 1024,
          system: mode === "search" ? SYSTEM_SEARCH : SYSTEM_EMAIL,
          messages: next.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const err = data?.error?.message || `Error: ${res.status}`;
        setMessages([...next, { role: "assistant", content: `⚠️ ${err}` }]);
      } else {
        const reply = data?.content?.[0]?.text || "(empty response)";
        setMessages([...next, { role: "assistant", content: reply }]);
      }
    } catch (e: any) {
      setMessages([...next, { role: "assistant", content: `⚠️ ${e?.message || "Network error"}` }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = mode === "search" ? SUGGESTIONS_SEARCH : SUGGESTIONS_EMAIL;

  return (
    <div className="flex flex-col h-screen bg-white text-neutral-900">
      {/* Header */}
      <header className="bg-black text-white">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="inline-block w-2 h-6 rounded-sm"
              style={{ backgroundColor: RED }}
            />
            <span className="font-semibold tracking-tight">Din Bil Sverige</span>
            <span className="text-xs text-neutral-400 hidden sm:inline">AI Assistant</span>
          </div>
          <button
            onClick={() => {
              setKeyInput(apiKey);
              setShowSettings(true);
            }}
            className="p-2 rounded hover:bg-white/10"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
        {/* Tabs */}
        <div className="max-w-3xl mx-auto px-4 flex gap-1">
          {([
            { id: "search", label: "Car Search", icon: Car },
            { id: "email", label: "Email Writer", icon: Mail },
          ] as const).map((t) => {
            const active = mode === t.id;
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setMode(t.id)}
                className="flex items-center gap-2 px-4 py-2 text-sm border-b-2 transition-colors"
                style={{
                  borderColor: active ? RED : "transparent",
                  color: active ? "white" : "rgb(163 163 163)",
                }}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-10">
              <div
                className="w-12 h-12 rounded-full mx-auto flex items-center justify-center text-white mb-3"
                style={{ backgroundColor: RED }}
              >
                {mode === "search" ? <Car className="w-6 h-6" /> : <Mail className="w-6 h-6" />}
              </div>
              <h1 className="text-lg font-semibold">
                {mode === "search" ? "Find your next car" : "Write a customer email"}
              </h1>
              <p className="text-sm text-neutral-500 mt-1">
                {mode === "search"
                  ? "Tell me what you're looking for and I'll help you."
                  : "Describe the email you want to send."}
              </p>
              <div className="flex flex-wrap gap-2 justify-center mt-6">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="px-3 py-1.5 text-sm rounded-full border border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <MessageBubble key={i} msg={m} />
          ))}

          {loading && (
            <div className="flex items-start gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0"
                style={{ backgroundColor: RED }}
              >
                <Car className="w-4 h-4" />
              </div>
              <div className="bg-neutral-100 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1">
                  <Dot delay="0ms" />
                  <Dot delay="150ms" />
                  <Dot delay="300ms" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Composer */}
      <div className="border-t border-neutral-200 bg-white">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            rows={1}
            placeholder={mode === "search" ? "What are you looking for?" : "Describe the email..."}
            className="flex-1 resize-none rounded-xl border border-neutral-200 px-4 py-2.5 text-sm focus:outline-none focus:border-neutral-400 max-h-32"
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || loading}
            className="h-10 w-10 rounded-xl flex items-center justify-center text-white disabled:opacity-40 transition-opacity"
            style={{ backgroundColor: RED }}
            aria-label="Send"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Settings modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Anthropic API Key</h2>
              {apiKey && (
                <button onClick={() => setShowSettings(false)} className="p-1 hover:bg-neutral-100 rounded">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <p className="text-sm text-neutral-500 mb-3">
              The key is saved in your browser (localStorage) and sent directly to Anthropic.
            </p>
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="sk-ant-..."
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-neutral-400"
            />
            <button
              onClick={saveKey}
              disabled={!keyInput.trim()}
              className="mt-4 w-full py-2 rounded-lg text-white font-medium disabled:opacity-40"
              style={{ backgroundColor: RED }}
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MessageBubble({ msg }: { msg: Msg }) {
  if (msg.role === "user") {
    return (
      <div className="flex items-start gap-2 justify-end">
        <div className="bg-neutral-900 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[80%] whitespace-pre-wrap text-sm">
          {msg.content}
        </div>
        <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-neutral-600" />
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-2">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0"
        style={{ backgroundColor: RED }}
      >
        <Car className="w-4 h-4" />
      </div>
      <div className="bg-neutral-100 rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[80%] whitespace-pre-wrap text-sm">
        {msg.content}
      </div>
    </div>
  );
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce"
      style={{ animationDelay: delay }}
    />
  );
}
