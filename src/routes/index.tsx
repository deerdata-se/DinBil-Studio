import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { BookOpen, Mail, Paperclip, PenLine, Send, Settings, Trash2, User, X } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Din Bil Sverige – AI Assistant" },
      { name: "description", content: "AI copywriter and email assistant for Din Bil Sverige." },
    ],
  }),
});

const RED = "#E8000D";

const SYSTEM_COPY = `You are a copywriter for Din Bil Sweden, one of the country's largest authorized dealers for Volkswagen, Audi, Škoda, SEAT, Cupra, and Porsche. You write marketing copy that sounds like Din Bil: trustworthy, knowledgeable, and useful – never pushy, never hyped.

Default to Swedish, "du" form. Switch to other languages only if the user asks.

---

## About Din Bil

Authorized dealer with locations in Stockholm, Gothenburg, and Malmö. We sell new and used cars, run service centers with brand-certified technicians, offer financing through Volkswagen Finans, and handle company car and leasing. We are part of Volkswagen Group Sverige – not just another dealer.

---

## The signature headline pattern

Most Din Bil ads open with a two-part possessive headline:

> **Din bil. Din [X].**

Examples: *Din bil. Din kontroll.* / *Din bil. Ditt köp.* / *Din bil. Din teknik.* / *Din bil. Din laddning.* / *Din bil. Din höstutflykt.*

Variations are allowed when it fits the topic – *Din körning. Ditt lugn.* – or as a signoff: *Ditt liv. Din bil.*

Use this pattern as the default for ad copy. Only break from it when the brief is clearly not an ad (e.g. internal email, service reminder, product page).

---

## Content posture: useful before salesy

Din Bil ads usually **don't sell a car**. They share something genuinely useful – a tip, a myth busted, a guide – and let the brand benefit from being the helpful voice. The CTA is almost always "Länk i bio." or "Läs mer", not "Boka nu" or "Köp idag".

When writing an ad, ask first: *what can we teach, explain, or help with here?* Lead with that. The product sells itself through trust over time.

This doesn't apply to every brief – service reminders, campaign offers, and stock listings are more direct – but for content ads, educational-first is the default.

---

## Voice principles

**Confident expertise without condescension.** We know cars deeply, but we talk like a knowledgeable friend, not a brochure.

**Concrete beats grandiose.** "Räckvidd upp till 627 km" beats "revolutionerande räckvidd". Numbers, facts, clear benefits.

**Swedish lagom.** No screaming superlatives, no manufactured urgency, no exclamation marks unless something genuinely deserves one.

**Curious, not pushy.** We help people find the right car. We don't push the most expensive one.

**Warm but professional.** "Du" form. Friendly without being chummy.

**Evocative is allowed for lifestyle topics** (autumn drives, family trips, weekend escapes) – when it's grounded in concrete things (markets, food, country roads), not in selling the car itself.

**Name real people when relevant.** Din Bil ads sometimes name internal experts. If a brief mentions a real named expert, lean into it – it builds trust.

---

## Avoid

- Empty intensifiers: "revolutionerande", "oslagbar", "i världsklass", "game-changing"
- Fake urgency: "Endast 3 kvar!", "Erbjudandet gäller ikväll!" unless genuinely true
- Generic car-ad clichés: "Kör in i framtiden", "Där drömmar möter vägen"
- Anglicisms when natural Swedish exists
- Negative competitor comparisons
- Made-up specs, prices, or features
- Leading an ad with the model name (e.g. "Nya ID.7 är här!"). The car shows up later, if at all.

---

## Format conventions

- **Headlines**: short, often the "Din bil. Din X." pattern. Sentence case.
- **Body**: short paragraphs, scannable. One idea per paragraph. Em dashes are fine and used often – they fit Din Bil's rhythm.
- **CTAs**: "Länk i bio.", "Läs mer", "Boka provkörning", "Se lagerbilarna". Low friction.
- **EVs**: lead with practical (range, charging, total cost) before lifestyle.

---

## When the brief is incomplete

If a brief is missing key facts – model, price, campaign dates, target audience, channel, length – ask before writing. Don't invent specs, prices, or features. For technical claims about specific models, flag where verification is needed.

If the user gives you a topic but no channel, assume Instagram caption (the most common Din Bil format) and write one.

---

## Self-check before delivering

Before you return any copy, ask yourself:

1. Would a real Din Bil employee – one who's good at their job and respects the customer – say this out loud? If not, rewrite.
2. If it's an ad: does it open with "Din bil. Din X." or a justified variant?
3. If it's an Instagram content ad: am I teaching or helping, not pushing?
4. Any empty intensifiers, fake urgency, or car-ad clichés? Cut them.
5. Could a number, fact, or concrete detail replace any vague phrase? Replace it.`;

const SYSTEM_EMAIL = `Du är en assistent för medarbetare på Din Bil Sverige. Hjälp dem att skriva professionella, tydliga och varma kundmail på svenska. Fråga efter detaljer om det behövs – mottagare, syfte, ton. Leverera kompletta mail med ämnesrad och hälsningsfras. Håll en varm men professionell ton – "du"-form, aldrig formell distans.`;

const SUGGESTIONS_COPY = [
  "Instagram-post om vinterdäck",
  "Elbilsannons – slå hål på räckviddsmyten",
  "Höstutflykt med familjen",
  "Kampanj för Audi A4 begagnad",
];
const SUGGESTIONS_EMAIL = [
  "Bekräfta en provkörning",
  "Svar på prisförfrågan",
  "Tacka kunden för köpet",
  "Påminnelse om service",
];

type Msg = { role: "user" | "assistant"; content: string };
type Mode = "copy" | "email";
type Source = { id: string; name: string; content: string; active: boolean };

function buildSystem(mode: Mode, sources: Source[]): string {
  const base = mode === "copy" ? SYSTEM_COPY : SYSTEM_EMAIL;
  const active = sources.filter((s) => s.active);
  if (active.length === 0) return base;
  const blocks = active
    .map((s) => `<source name="${s.name}">\n${s.content}\n</source>`)
    .join("\n\n");
  return (
    base +
    "\n\n---\n\n## Reference material\n\n" +
    "The user has attached the following sources. Treat them as authoritative for this conversation. " +
    "If a source contradicts the base guidelines, prefer the base guidelines — sources add context, they don't override voice rules.\n\n" +
    blocks
  );
}

function Index() {
  const [mode, setMode] = useState<Mode>("copy");
  const [copyMsgs, setCopyMsgs] = useState<Msg[]>([]);
  const [emailMsgs, setEmailMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [keyInput, setKeyInput] = useState("");
  const [sources, setSources] = useState<Source[]>([]);
  const [showSources, setShowSources] = useState(false);
  const [addTab, setAddTab] = useState<"paste" | "upload">("paste");
  const [addName, setAddName] = useState("");
  const [addContent, setAddContent] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const k = localStorage.getItem("anthropic_api_key") || "";
    setApiKey(k);
    if (!k) setShowSettings(true);
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem("dinbil_sources");
    if (raw) {
      try {
        setSources(JSON.parse(raw));
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("dinbil_sources", JSON.stringify(sources));
  }, [sources]);

  const messages = mode === "copy" ? copyMsgs : emailMsgs;
  const setMessages = mode === "copy" ? setCopyMsgs : setEmailMsgs;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const saveKey = () => {
    localStorage.setItem("anthropic_api_key", keyInput.trim());
    setApiKey(keyInput.trim());
    setShowSettings(false);
    setKeyInput("");
  };

  const activeSources = sources.filter((s) => s.active);

  const addPasteSource = () => {
    if (!addName.trim() || !addContent.trim()) return;
    setSources((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: addName.trim(), content: addContent.trim(), active: true },
    ]);
    setAddName("");
    setAddContent("");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const content = await file.text();
    const name = file.name.replace(/\.(txt|md)$/, "");
    setSources((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name, content, active: true },
    ]);
    e.target.value = "";
  };

  const toggleSource = (id: string) => {
    setSources((prev) => prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s)));
  };

  const deleteSource = (id: string) => {
    setSources((prev) => prev.filter((s) => s.id !== id));
  };

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    if (!apiKey) { setShowSettings(true); return; }
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
          max_tokens: 2048,
          system: buildSystem(mode, sources),
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

  const suggestions = mode === "copy" ? SUGGESTIONS_COPY : SUGGESTIONS_EMAIL;

  return (
    <div className="flex flex-col h-screen bg-white text-neutral-900">
      {/* Header */}
      <header className="bg-black text-white">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-6 rounded-sm" style={{ backgroundColor: RED }} />
            <span className="font-semibold tracking-tight">Din Bil Sverige</span>
            <span className="text-xs text-neutral-400 hidden sm:inline">AI Assistant</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowSources(true)}
              className="p-2 rounded hover:bg-white/10"
              aria-label="Knowledge Sources"
            >
              <BookOpen className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setKeyInput(apiKey); setShowSettings(true); }}
              className="p-2 rounded hover:bg-white/10"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
        {/* Tabs */}
        <div className="max-w-3xl mx-auto px-4 flex gap-1">
          {([
            { id: "copy", label: "Copywriter", icon: PenLine },
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
                {mode === "copy" ? <PenLine className="w-6 h-6" /> : <Mail className="w-6 h-6" />}
              </div>
              <h1 className="text-lg font-semibold">
                {mode === "copy" ? "Din Bil Copywriter" : "Skriv ett kundmail"}
              </h1>
              <p className="text-sm text-neutral-500 mt-1">
                {mode === "copy"
                  ? "Berätta vad du behöver – en annons, en caption, ett inlägg."
                  : "Beskriv mailet du vill skicka."}
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
                <PenLine className="w-4 h-4" />
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
        <div className="max-w-3xl mx-auto px-4 pt-2">
          {activeSources.length > 0 && (
            <button
              onClick={() => setShowSources(true)}
              className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-700 mb-2 transition-colors"
            >
              <Paperclip className="w-3.5 h-3.5" />
              {activeSources.length} source{activeSources.length !== 1 ? "s" : ""} active
            </button>
          )}
        </div>
        <div className="max-w-3xl mx-auto px-4 pb-3 flex items-end gap-2">
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
            placeholder={mode === "copy" ? "Vad behöver du skrivet?" : "Beskriv mailet..."}
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
              Saved in your browser only. Never sent anywhere except directly to Anthropic.
            </p>
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveKey()}
              placeholder="sk-ant-..."
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-neutral-400"
              autoFocus
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

      {/* Sources modal */}
      {showSources && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full shadow-lg flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between p-5 border-b border-neutral-100 flex-shrink-0">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <h2 className="font-semibold">Knowledge Sources</h2>
              </div>
              <button
                onClick={() => setShowSources(false)}
                className="p-1 hover:bg-neutral-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-5 space-y-4">
              {/* Existing sources */}
              {sources.length > 0 ? (
                <div className="space-y-2">
                  {sources.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center gap-3 rounded-lg border border-neutral-200 px-3 py-2.5"
                    >
                      <input
                        type="checkbox"
                        checked={s.active}
                        onChange={() => toggleSource(s.id)}
                        className="w-4 h-4 flex-shrink-0 cursor-pointer accent-[#E8000D]"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{s.name}</p>
                        <p className="text-xs text-neutral-400">
                          {s.content.length.toLocaleString("sv-SE")} tecken
                        </p>
                      </div>
                      <button
                        onClick={() => deleteSource(s.id)}
                        className="p-1 text-neutral-400 hover:text-red-600 transition-colors flex-shrink-0"
                        aria-label="Delete source"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-neutral-400 text-center py-2">
                  No sources yet. Add one below.
                </p>
              )}

              {/* Add source */}
              <div className="border border-neutral-200 rounded-lg overflow-hidden">
                <div className="flex border-b border-neutral-100">
                  {(["paste", "upload"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setAddTab(tab)}
                      className="flex-1 px-4 py-2 text-sm transition-colors"
                      style={{
                        backgroundColor: addTab === tab ? "#f5f5f5" : "white",
                        color: addTab === tab ? "#171717" : "#737373",
                        fontWeight: addTab === tab ? 500 : 400,
                      }}
                    >
                      {tab === "paste" ? "Paste text" : "Upload file"}
                    </button>
                  ))}
                </div>

                <div className="p-4 space-y-3">
                  {addTab === "paste" ? (
                    <>
                      <input
                        type="text"
                        value={addName}
                        onChange={(e) => setAddName(e.target.value)}
                        placeholder="Source name"
                        className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-neutral-400"
                      />
                      <textarea
                        value={addContent}
                        onChange={(e) => setAddContent(e.target.value)}
                        placeholder="Paste reference material here…"
                        rows={5}
                        className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-neutral-400 resize-none"
                      />
                      <button
                        onClick={addPasteSource}
                        disabled={!addName.trim() || !addContent.trim()}
                        className="w-full py-2 rounded-lg text-white text-sm font-medium disabled:opacity-40 transition-opacity"
                        style={{ backgroundColor: RED }}
                      >
                        Add source
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-neutral-500">
                        Accepts .txt and .md files. The filename becomes the source name.
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".txt,.md"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-2 rounded-lg border border-neutral-200 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                      >
                        Choose file…
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
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
        <PenLine className="w-4 h-4" />
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
