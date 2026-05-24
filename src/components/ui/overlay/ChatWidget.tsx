"use client";

import { useState, useRef, useEffect } from "react";

const ACCENT = "#4FC3F7";
const BG     = "rgba(2, 3, 14, 0.97)";
const BORDER = "rgba(79, 195, 247, 0.18)";

const FAQS: { q: string; a: string }[] = [
  {
    q: "Was kostet eine Website?",
    a: "Jedes Projekt ist individuell — du siehst deinen kostenlosen Prototyp bevor wir über den finalen Preis sprechen. Keine versteckten Kosten, volle Transparenz.",
  },
  {
    q: "Wann muss ich zahlen?",
    a: "Erst nach Abnahme. Keine Anzahlung, keine Vorleistung. Du zahlst nur, wenn du mit dem Ergebnis wirklich zufrieden bist.",
  },
  {
    q: "Wie lange dauert ein Projekt?",
    a: "Typisch 2–4 Wochen. Du bekommst während der Entwicklung regelmäßige Updates und kannst jederzeit Feedback geben.",
  },
  {
    q: "Was ist der kostenlose Prototyp?",
    a: "Ich erstelle dir ein vollständiges Design-Mockup deiner Website — kostenlos. Du siehst genau wie es aussieht, bevor du einen Cent bezahlst.",
  },
  {
    q: "Kann ich die Seite selbst bearbeiten?",
    a: "Ja. Jede Website kommt mit einem eigenen Bearbeitungs-Tool. Texte, Bilder, Inhalte — alles ohne Agentur oder Stundensatz.",
  },
  {
    q: "Gibt es Support nach dem Launch?",
    a: "Ja — persönliche Wartung, kein Stundensatz. Du hast immer einen direkten Ansprechpartner, der deine Website kennt.",
  },
];

type Message = { from: "bot" | "user"; text: string };

const WELCOME: Message = {
  from: "bot",
  text: "Hey — ich beantworte kurz die häufigsten Fragen. Was möchtest du wissen?",
};

export function ChatWidget() {
  const [open,     setOpen]     = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [answered, setAnswered] = useState<Set<number>>(new Set());
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function ask(idx: number) {
    const faq = FAQS[idx];
    setMessages(prev => [
      ...prev,
      { from: "user", text: faq.q },
      { from: "bot",  text: faq.a },
    ]);
    setAnswered(prev => new Set(prev).add(idx));
  }

  const remaining = FAQS.filter((_, i) => !answered.has(i));

  return (
    <>
      {/* ── Toggle button ── */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position:     "fixed",
          bottom:       "2rem",
          right:        "2rem",
          zIndex:       200,
          width:        "48px",
          height:       "48px",
          borderRadius: "50%",
          background:   BG,
          border:       `1px solid ${BORDER}`,
          cursor:       "pointer",
          display:      "flex",
          alignItems:   "center",
          justifyContent: "center",
          boxShadow:    open ? `0 0 18px rgba(79,195,247,0.25)` : "none",
          transition:   "box-shadow 0.3s",
        }}
        aria-label="FAQ Chat öffnen"
      >
        {open ? (
          <span style={{ color: ACCENT, fontSize: "18px", lineHeight: 1 }}>×</span>
        ) : (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M2 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6l-4 3V4Z"
              stroke={ACCENT} strokeWidth="1.4" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* ── Panel ── */}
      {open && (
        <div style={{
          position:     "fixed",
          bottom:       "5.5rem",
          right:        "2rem",
          zIndex:       199,
          width:        "clamp(300px, 90vw, 360px)",
          maxHeight:    "70vh",
          display:      "flex",
          flexDirection:"column",
          background:   BG,
          border:       `1px solid ${BORDER}`,
          boxShadow:    "0 8px 40px rgba(0,0,0,0.7), 0 0 24px rgba(79,195,247,0.08)",
          fontFamily:   "monospace",
        }}>

          {/* Header */}
          <div style={{
            padding:      "0.9rem 1.1rem",
            borderBottom: `1px solid ${BORDER}`,
            fontSize:     "0.62rem",
            letterSpacing:"0.35em",
            color:        ACCENT,
          }}>
            FAQ — DF WEBDESIGN
          </div>

          {/* Messages */}
          <div style={{
            flex:       1,
            overflowY:  "auto",
            padding:    "1rem",
            display:    "flex",
            flexDirection: "column",
            gap:        "0.65rem",
          }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display:       "flex",
                justifyContent: msg.from === "user" ? "flex-end" : "flex-start",
              }}>
                <div style={{
                  maxWidth:     "86%",
                  padding:      "0.6rem 0.85rem",
                  fontSize:     "0.78rem",
                  lineHeight:   1.55,
                  color:        msg.from === "bot" ? "rgba(255,255,255,0.82)" : ACCENT,
                  background:   msg.from === "bot"
                    ? "rgba(255,255,255,0.04)"
                    : "rgba(79,195,247,0.08)",
                  border:       `1px solid ${msg.from === "bot"
                    ? "rgba(255,255,255,0.06)"
                    : "rgba(79,195,247,0.2)"}`,
                  letterSpacing:"0.02em",
                }}>
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Remaining FAQ buttons */}
            {remaining.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginTop: "0.25rem" }}>
                {remaining.map((faq, _) => {
                  const realIdx = FAQS.indexOf(faq);
                  return (
                    <button key={realIdx} onClick={() => ask(realIdx)} style={{
                      background:    "transparent",
                      border:        `1px solid rgba(79,195,247,0.22)`,
                      color:         "rgba(255,255,255,0.55)",
                      fontSize:      "0.72rem",
                      letterSpacing: "0.04em",
                      padding:       "0.5rem 0.75rem",
                      textAlign:     "left",
                      cursor:        "pointer",
                      fontFamily:    "monospace",
                      transition:    "color 0.2s, border-color 0.2s",
                    }}
                      onMouseEnter={e => {
                        e.currentTarget.style.color = "#fff";
                        e.currentTarget.style.borderColor = "rgba(79,195,247,0.5)";
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.color = "rgba(255,255,255,0.55)";
                        e.currentTarget.style.borderColor = "rgba(79,195,247,0.22)";
                      }}
                    >
                      {faq.q}
                    </button>
                  );
                })}
              </div>
            )}

            {remaining.length === 0 && (
              <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", textAlign: "center", marginTop: "0.5rem" }}>
                Noch Fragen? Schreib direkt über das Kontaktformular.
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>
      )}
    </>
  );
}
