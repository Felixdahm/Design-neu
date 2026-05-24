"use client";

import { useState, useEffect, useRef } from "react";
import { getScrollProgress } from "@/hooks/useLenis";

const TEXTS = [
  "DF WEBDESIGN — KONTAKT",
  "Lass uns dein\nProjekt starten.",
  "Antwort garantiert in 24h",
  "NAME",
  "E-MAIL",
  "NACHRICHT",
  "SENDEN",
  "INSTAGRAM",
  "LINKEDIN",
];

const TOTAL          = TEXTS.reduce((s, t) => s + t.length, 0);
const SCROLL_START   = 0.77;
const SCROLL_END     = 1.00;  // typing completes at the very last scroll position
const INTERACTIVE_AT = 0.95;  // form becomes interactive slightly before the end
const CHARS_PER_SEC  = 110;   // fast typewriter — all chars done in ~1 second

const INK   = "#0a0a1f";
const INK40 = "rgba(10,10,31,0.4)";
const INK18 = "rgba(10,10,31,0.18)";
const INK55 = "rgba(10,10,31,0.55)";

export function ContactForm() {
  const [status,      setStatus]      = useState<"idle" | "sending" | "sent">("idle");
  const [form,        setForm]        = useState({ name: "", email: "", message: "" });
  const [interactive, setInteractive] = useState(false);

  const t         = useRef<Array<HTMLSpanElement | null>>(TEXTS.map(() => null));
  const rafRef    = useRef<number>(0);
  const prevN     = useRef(-1);
  const prevInt   = useRef(false);
  const startTime = useRef<number | null>(null);
  const typedN    = useRef(0);

  useEffect(() => {
    function tick() {
      const p      = getScrollProgress();
      const cursor = Math.floor(Date.now() / 480) % 2 === 0 ? "▌" : "";
      const isInt  = p >= INTERACTIVE_AT;

      if (p >= SCROLL_START) {
        if (startTime.current === null) startTime.current = Date.now();
        const elapsed  = (Date.now() - startTime.current) / 1000;
        const byTime   = Math.floor(elapsed * CHARS_PER_SEC);
        const byScroll = Math.floor(Math.max(0, Math.min(1, (p - SCROLL_START) / (SCROLL_END - SCROLL_START))) * TOTAL);
        typedN.current = Math.min(byTime, byScroll);
      } else {
        startTime.current = null;
        typedN.current    = 0;
      }
      const n = typedN.current;

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
        let consumed = 0;
        for (let i = 0; i < TEXTS.length; i++) {
          const text = TEXTS[i];
          const vis  = Math.max(0, Math.min(text.length, n - consumed));
          const el   = t.current[i];
          if (el && vis > 0 && vis < text.length) el.textContent = text.substring(0, vis) + cursor;
          consumed += text.length;
        }
      }

      if (isInt !== prevInt.current) { prevInt.current = isInt; setInteractive(isInt); }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sent");
  }

  const setRef = (i: number) => (el: HTMLSpanElement | null) => { t.current[i] = el; };

  return (
    <div style={{
      position:      "fixed",
      left:          "var(--term-left,   200%)",
      top:           "var(--term-top,    200%)",
      width:         "var(--term-width,  0%)",
      height:        "var(--term-height, 0%)",
      opacity:       "var(--term-opacity, 0)" as unknown as number,
      pointerEvents: interactive ? "auto" : "none",
      zIndex:        50,
      fontFamily:    "monospace",
      overflow:      "hidden",
      display:       "flex",
      background:    "rgba(250, 251, 255, 0.97)",
    }}>

      {status === "sent" ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: "3vw", color: INK, marginBottom: "2%", opacity: 0.8 }}>✓</div>
          <div style={{ fontSize: "0.75vw", letterSpacing: "0.45em", color: INK55, marginBottom: "1%" }}>
            NACHRICHT GESENDET
          </div>
          <div style={{ fontSize: "0.65vw", color: INK40, letterSpacing: "0.15em" }}>
            Ich melde mich in Kürze.
          </div>
        </div>
      ) : (
        <>
          {/* ── LEFT COLUMN ── */}
          <div style={{
            width:          "38%",
            padding:        "8% 6% 8% 8%",
            display:        "flex",
            flexDirection:  "column",
            justifyContent: "space-between",
            boxSizing:      "border-box",
            borderRight:    `1px solid ${INK18}`,
          }}>
            <div>
              <div style={{ fontSize: "0.5vw", letterSpacing: "0.55em", color: INK40, marginBottom: "7%" }}>
                <span ref={setRef(0)} />
              </div>
              <div style={{
                fontSize:      "2.6vw",
                color:         INK,
                fontWeight:    300,
                letterSpacing: "0.01em",
                lineHeight:    1.15,
                marginBottom:  "7%",
                whiteSpace:    "pre-line",
              }}>
                <span ref={setRef(1)} />
              </div>
              <div style={{ fontSize: "0.62vw", color: INK40, letterSpacing: "0.18em", lineHeight: 1.75 }}>
                <span ref={setRef(2)} />
              </div>
            </div>

            {/* Social */}
            <div style={{
              display:       "flex",
              gap:           "1.2vw",
              fontSize:      "0.52vw",
              letterSpacing: "0.35em",
              color:         interactive ? INK55 : INK18,
              transition:    "color 0.5s",
            }}>
              <a href="https://instagram.com/df.webdesign" target="_blank" rel="noopener noreferrer"
                style={{ color: "inherit", textDecoration: "none" }}
                onMouseEnter={e => interactive && (e.currentTarget.style.color = INK)}
                onMouseLeave={e => (e.currentTarget.style.color = interactive ? INK55 : INK18)}>
                <span ref={setRef(7)} />
              </a>
              <span style={{ opacity: 0.3 }}>·</span>
              <a href="https://www.linkedin.com/in/felix-dahm-web/" target="_blank" rel="noopener noreferrer"
                style={{ color: "inherit", textDecoration: "none" }}
                onMouseEnter={e => interactive && (e.currentTarget.style.color = INK)}
                onMouseLeave={e => (e.currentTarget.style.color = interactive ? INK55 : INK18)}>
                <span ref={setRef(8)} />
              </a>
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div style={{
            flex:           1,
            padding:        "8% 8% 8% 7%",
            display:        "flex",
            flexDirection:  "column",
            justifyContent: "center",
            boxSizing:      "border-box",
          }}>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "5.5%" }}>

              <div style={{ display: "flex", gap: "8%" }}>
                <div style={{ flex: 1 }}>
                  <div style={labelStyle}><span ref={setRef(3)} /></div>
                  <input type="text" value={form.name} disabled={!interactive}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder={interactive ? "Dein Name" : ""}
                    style={inputStyle(interactive)}
                    onFocus={e => interactive && (e.target.style.borderBottomColor = "rgba(10,10,31,0.55)")}
                    onBlur={e =>  (e.target.style.borderBottomColor = INK18)}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={labelStyle}><span ref={setRef(4)} /></div>
                  <input type="email" value={form.email} disabled={!interactive}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder={interactive ? "deine@email.de" : ""}
                    style={inputStyle(interactive)}
                    onFocus={e => interactive && (e.target.style.borderBottomColor = "rgba(10,10,31,0.55)")}
                    onBlur={e =>  (e.target.style.borderBottomColor = INK18)}
                  />
                </div>
              </div>

              <div>
                <div style={labelStyle}><span ref={setRef(5)} /></div>
                <textarea value={form.message} disabled={!interactive} rows={3}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  placeholder={interactive ? "Erzähl mir von deinem Projekt..." : ""}
                  style={{ ...inputStyle(interactive), resize: "none", display: "block" }}
                  onFocus={e => interactive && (e.target.style.borderBottomColor = "rgba(10,10,31,0.55)")}
                  onBlur={e =>  (e.target.style.borderBottomColor = INK18)}
                />
              </div>

              <div style={{ paddingTop: "1%" }}>
                <button type="submit" disabled={!interactive || status === "sending"}
                  style={{
                    padding:       "1.6% 6%",
                    background:    interactive ? INK : "transparent",
                    border:        `1px solid ${interactive ? INK : INK18}`,
                    color:         interactive ? "#ffffff" : INK40,
                    fontSize:      "0.62vw",
                    letterSpacing: "0.5em",
                    cursor:        interactive ? "pointer" : "default",
                    transition:    "background 0.3s, border-color 0.3s, opacity 0.4s",
                    fontFamily:    "monospace",
                    opacity:       interactive ? 1 : 0.4,
                  }}
                  onMouseEnter={e => { if (interactive) e.currentTarget.style.opacity = "0.75"; }}
                  onMouseLeave={e => { if (interactive) e.currentTarget.style.opacity = "1"; }}
                >
                  <span ref={setRef(6)} />
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize:      "0.5vw",
  letterSpacing: "0.45em",
  color:         INK40,
  marginBottom:  "2%",
};

function inputStyle(interactive: boolean): React.CSSProperties {
  return {
    width:          "100%",
    background:     "transparent",
    border:         "none",
    borderBottom:   `1px solid ${INK18}`,
    color:          INK,
    fontSize:       "0.88vw",
    padding:        "1.5% 0",
    outline:        "none",
    caretColor:     INK,
    boxSizing:      "border-box",
    fontFamily:     "monospace",
    cursor:         interactive ? "text" : "default",
    opacity:        interactive ? 1 : 0.5,
    transition:     "opacity 0.4s, border-bottom-color 0.25s",
  };
}
