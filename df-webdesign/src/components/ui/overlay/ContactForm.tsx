"use client";

import { useState, useEffect, useRef } from "react";
import { getScrollProgress } from "@/hooks/useLenis";

// All text that gets typed out in order
const TEXTS = [
  "TERMINAL_v1.0 — CONTACT",
  "Starte ein Projekt.",
  "Antwort meist innerhalb von 24h",
  "NAME",
  "E-MAIL",
  "NACHRICHT",
  "SENDEN",
  "INSTAGRAM",
  "LINKEDIN",
];

const TOTAL        = TEXTS.reduce((s, t) => s + t.length, 0);
const SCROLL_START = 0.74;
const SCROLL_END   = 0.97;
const CHARS_PER_SEC = 28; // typewriter speed — never faster than this

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [form, setForm]     = useState({ name: "", email: "", message: "" });
  const [interactive, setInteractive] = useState(false);

  const t         = useRef<Array<HTMLSpanElement | null>>(TEXTS.map(() => null));
  const rafRef    = useRef<number>(0);
  const prevN     = useRef(-1);
  const prevInt   = useRef(false);
  const startTime = useRef<number | null>(null); // when typing began
  const typedN    = useRef(0);                   // rate-limited char count

  useEffect(() => {
    function tick() {
      const p      = getScrollProgress();
      const cursor = Math.floor(Date.now() / 480) % 2 === 0 ? "▌" : "";
      const isInt  = p >= SCROLL_END;

      // Scroll unlocks typing — time controls the actual speed
      if (p >= SCROLL_START) {
        if (startTime.current === null) startTime.current = Date.now();
        const elapsed   = (Date.now() - startTime.current) / 1000;
        const byTime    = Math.floor(elapsed * CHARS_PER_SEC);
        const byScroll  = Math.floor(Math.max(0, Math.min(1, (p - SCROLL_START) / (SCROLL_END - SCROLL_START))) * TOTAL);
        // Both conditions must be met: scroll far enough AND time passed
        typedN.current  = Math.min(byTime, byScroll);
      } else {
        startTime.current = null;
        typedN.current    = 0;
      }
      const n = typedN.current;

      // Only update DOM when char count changes
      if (n !== prevN.current) {
        prevN.current = n;
        let consumed = 0;
        for (let i = 0; i < TEXTS.length; i++) {
          const text = TEXTS[i];
          const vis  = Math.max(0, Math.min(text.length, n - consumed));
          const el   = t.current[i];
          if (el) {
            const isActive = vis > 0 && vis < text.length;
            el.textContent = text.substring(0, vis) + (isActive ? cursor : "");
          }
          consumed += text.length;
        }
      } else {
        // Still update cursor blink even when chars aren't changing
        let consumed = 0;
        for (let i = 0; i < TEXTS.length; i++) {
          const text = TEXTS[i];
          const vis  = Math.max(0, Math.min(text.length, n - consumed));
          const el   = t.current[i];
          if (el && vis > 0 && vis < text.length) {
            el.textContent = text.substring(0, vis) + cursor;
          }
          consumed += text.length;
        }
      }

      if (isInt !== prevInt.current) {
        prevInt.current = isInt;
        setInteractive(isInt);
      }

      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setStatus("sent");
    } catch {
      setStatus("idle");
    }
  }

  const setRef = (i: number) => (el: HTMLSpanElement | null) => { t.current[i] = el; };

  return (
    <div style={{
      position: "fixed",
      left:    "var(--term-left,   200%)",
      top:     "var(--term-top,    200%)",
      width:   "var(--term-width,  0%)",
      height:  "var(--term-height, 0%)",
      opacity: "var(--term-opacity, 0)" as unknown as number,
      pointerEvents: interactive ? "auto" : "none",
      zIndex: 50,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      padding: "4% 8%",
      boxSizing: "border-box",
      fontFamily: "monospace",
      overflow: "hidden",
    }}>

      {status === "sent" ? (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "3vw", color: "#00FF88", marginBottom: "1vw" }}>✓</div>
          <div style={{ fontSize: "0.9vw", letterSpacing: "0.4em", color: "#00FF88", marginBottom: "0.8vw" }}>
            ÜBERTRAGUNG ERFOLGREICH
          </div>
          <div style={{ fontSize: "0.8vw", color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em" }}>
            Ich melde mich in Kürze.
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div style={{ marginBottom: "4%" }}>
            <div style={{ fontSize: "0.65vw", letterSpacing: "0.5em", color: "rgba(0,255,136,0.5)", marginBottom: "1%" }}>
              <span ref={setRef(0)} />
            </div>
            <div style={{ fontSize: "2.2vw", color: "#ffffff", fontWeight: 300, letterSpacing: "0.03em", marginBottom: "0.5%" }}>
              <span ref={setRef(1)} />
            </div>
            <div style={{ fontSize: "0.75vw", color: "rgba(255,255,255,0.22)", letterSpacing: "0.2em" }}>
              <span ref={setRef(2)} />
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "3%" }}>

            <div style={{ display: "flex", gap: "4%" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "0.6vw", letterSpacing: "0.4em", color: "rgba(0,255,136,0.4)", marginBottom: "1%" }}>
                  <span ref={setRef(3)} />
                </div>
                <input type="text" value={form.name} disabled={!interactive}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder={interactive ? "Dein Name" : ""}
                  style={inputStyle(interactive)}
                  onFocus={e => interactive && (e.target.style.borderBottomColor = "rgba(0,255,136,0.5)")}
                  onBlur={e => (e.target.style.borderBottomColor = "rgba(255,255,255,0.12)")}
                />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "0.6vw", letterSpacing: "0.4em", color: "rgba(0,255,136,0.4)", marginBottom: "1%" }}>
                  <span ref={setRef(4)} />
                </div>
                <input type="email" value={form.email} disabled={!interactive}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder={interactive ? "deine@email.de" : ""}
                  style={inputStyle(interactive)}
                  onFocus={e => interactive && (e.target.style.borderBottomColor = "rgba(0,255,136,0.5)")}
                  onBlur={e => (e.target.style.borderBottomColor = "rgba(255,255,255,0.12)")}
                />
              </div>
            </div>

            <div>
              <div style={{ fontSize: "0.6vw", letterSpacing: "0.4em", color: "rgba(0,255,136,0.4)", marginBottom: "1%" }}>
                <span ref={setRef(5)} />
              </div>
              <textarea value={form.message} disabled={!interactive} rows={3}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                placeholder={interactive ? "Erzähl mir von deinem Projekt..." : ""}
                style={{ ...inputStyle(interactive), resize: "none", display: "block" }}
                onFocus={e => interactive && (e.target.style.borderBottomColor = "rgba(0,255,136,0.5)")}
                onBlur={e => (e.target.style.borderBottomColor = "rgba(255,255,255,0.12)")}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "1%" }}>
              <button type="submit" disabled={!interactive || status === "sending"}
                style={{
                  padding: "1% 4%", background: "transparent",
                  border: `1px solid rgba(0,255,136,${interactive ? "0.4" : "0.12"})`,
                  color: `rgba(0,255,136,${interactive ? "1" : "0.3"})`,
                  fontSize: "0.7vw", letterSpacing: "0.5em",
                  cursor: interactive ? "pointer" : "default",
                  transition: "background 0.25s, border-color 0.25s, color 0.5s",
                  fontFamily: "monospace",
                }}
                onMouseEnter={e => { if (interactive) {
                  e.currentTarget.style.background  = "rgba(0,255,136,0.08)";
                  e.currentTarget.style.borderColor = "rgba(0,255,136,0.8)";
                }}}
                onMouseLeave={e => {
                  e.currentTarget.style.background  = "transparent";
                  e.currentTarget.style.borderColor = `rgba(0,255,136,${interactive ? "0.4" : "0.12"})`;
                }}
              >
                <span ref={setRef(6)} />
              </button>

              <div style={{ display: "flex", gap: "1.5vw", fontSize: "0.6vw", letterSpacing: "0.3em",
                color: `rgba(255,255,255,${interactive ? "0.18" : "0.06"})`, transition: "color 0.5s" }}>
                <a href="https://instagram.com/df.webdesign" target="_blank" rel="noopener noreferrer"
                  style={{ color: "inherit", textDecoration: "none" }}
                  onMouseEnter={e => interactive && (e.currentTarget.style.color = "rgba(0,255,136,0.6)")}
                  onMouseLeave={e => (e.currentTarget.style.color = `rgba(255,255,255,${interactive ? "0.18" : "0.06"})`)}>
                  <span ref={setRef(7)} />
                </a>
                <a href="https://www.linkedin.com/in/felix-dahm-web/" target="_blank" rel="noopener noreferrer"
                  style={{ color: "inherit", textDecoration: "none" }}
                  onMouseEnter={e => interactive && (e.currentTarget.style.color = "rgba(0,255,136,0.6)")}
                  onMouseLeave={e => (e.currentTarget.style.color = `rgba(255,255,255,${interactive ? "0.18" : "0.06"})`)}>
                  <span ref={setRef(8)} />
                </a>
              </div>
            </div>
          </form>
        </>
      )}
    </div>
  );
}

function inputStyle(interactive: boolean): React.CSSProperties {
  return {
    width: "100%", background: "transparent", border: "none",
    borderBottom: "1px solid rgba(255,255,255,0.12)", color: "#ffffff",
    fontSize: "1vw", padding: "1% 0", outline: "none",
    caretColor: "#00FF88", boxSizing: "border-box", fontFamily: "monospace",
    cursor: interactive ? "text" : "default",
    opacity: interactive ? 1 : 0.4,
    transition: "opacity 0.4s ease",
  };
}
