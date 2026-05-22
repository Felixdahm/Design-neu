"use client";

import { useEffect, useRef, useState } from "react";
import { getScrollProgress } from "@/hooks/useLenis";

export function ContactForm() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const rafRef     = useRef<number>(0);
  const [status, setStatus]   = useState<"idle" | "sending" | "sent">("idle");
  const [form, setForm]       = useState({ name: "", email: "", message: "" });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function tick() {
      const p   = getScrollProgress();
      const dist = Math.abs(p - 0.88);
      const show  = dist < 0.22;
      const opacity = show ? Math.max(0, Math.min(1, 1 - (dist - 0.03) / 0.1)) : 0;

      setVisible(show);

      if (wrapperRef.current) {
        wrapperRef.current.style.opacity = String(opacity);
        wrapperRef.current.style.pointerEvents = opacity > 0.1 ? "auto" : "none";
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    await new Promise(r => setTimeout(r, 1200));
    setStatus("sent");
  }

  if (!visible && status === "idle") return null;

  return (
    <div
      ref={wrapperRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: 0,
        pointerEvents: "none",
      }}
    >
      {/* Panel — sized to visually match the 3D terminal body */}
      <div style={{
        width: "min(600px, 80vw)",
        background: "rgba(1, 3, 2, 0.75)",
        border: "1px solid rgba(0,255,136,0.18)",
        backdropFilter: "blur(20px)",
        padding: "44px 40px 36px",
        position: "relative",
        overflow: "hidden",
      }}>

        {/* Top scanline */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "1px",
          background: "linear-gradient(90deg, transparent 0%, #00FF88 50%, transparent 100%)",
          opacity: 0.7,
        }} />

        {/* Header bar — mirrors the 3D panel header */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "36px",
          background: "rgba(0,255,136,0.04)",
          borderBottom: "1px solid rgba(0,255,136,0.08)",
          display: "flex", alignItems: "center", paddingLeft: 16,
        }}>
          <span style={{
            fontFamily: "monospace", fontSize: 8, letterSpacing: "0.5em",
            color: "rgba(0,255,136,0.4)",
          }}>
            TERMINAL_v1.0
          </span>
          {/* Dot indicators */}
          <div style={{ marginLeft: "auto", marginRight: 16, display: "flex", gap: 6 }}>
            {[0.15, 0.25, 0.4].map((op, i) => (
              <div key={i} style={{
                width: 6, height: 6, borderRadius: "50%",
                background: `rgba(0,255,136,${op})`,
              }} />
            ))}
          </div>
        </div>

        {/* Content — offset for header */}
        <div style={{ marginTop: 20 }}>
          <div style={{ marginBottom: 28 }}>
            <div style={{
              fontFamily: "monospace", fontSize: 20, color: "#ffffff",
              letterSpacing: "0.04em", fontWeight: 300, marginBottom: 4,
            }}>
              Starte ein Projekt.
            </div>
            <div style={{
              fontFamily: "monospace", fontSize: 9, letterSpacing: "0.2em",
              color: "rgba(255,255,255,0.22)",
            }}>
              Antwort meist innerhalb von 24h
            </div>
          </div>

          {status === "sent" ? (
            <div style={{ textAlign: "center", padding: "40px 0", fontFamily: "monospace" }}>
              <div style={{ fontSize: 30, color: "#00FF88", marginBottom: 14 }}>✓</div>
              <div style={{ fontSize: 10, letterSpacing: "0.4em", color: "#00FF88", marginBottom: 10 }}>
                ÜBERTRAGUNG ERFOLGREICH
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>
                Ich melde mich in Kürze.
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <Field label="NAME" value={form.name}
                onChange={v => setForm(f => ({ ...f, name: v }))}
                placeholder="Dein Name" required />
              <Field label="E-MAIL" type="email" value={form.email}
                onChange={v => setForm(f => ({ ...f, email: v }))}
                placeholder="deine@email.de" required />
              <TextareaField label="NACHRICHT" value={form.message}
                onChange={v => setForm(f => ({ ...f, message: v }))}
                placeholder="Erzähl mir von deinem Projekt..." required />

              <button type="submit" disabled={status === "sending"} style={{
                marginTop: 28, width: "100%", padding: "13px 0",
                background: "transparent", border: "1px solid rgba(0,255,136,0.35)",
                color: "#00FF88", fontFamily: "monospace", fontSize: 10,
                letterSpacing: "0.5em", cursor: status === "sending" ? "not-allowed" : "pointer",
                opacity: status === "sending" ? 0.5 : 1, transition: "all 0.25s ease",
              }}
                onMouseEnter={e => {
                  (e.currentTarget).style.background = "rgba(0,255,136,0.07)";
                  (e.currentTarget).style.borderColor = "rgba(0,255,136,0.7)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget).style.background = "transparent";
                  (e.currentTarget).style.borderColor = "rgba(0,255,136,0.35)";
                }}
              >
                {status === "sending" ? "ÜBERTRAGUNG..." : "NACHRICHT SENDEN"}
              </button>

              <div style={{
                marginTop: 20, display: "flex", justifyContent: "center", gap: 28,
                fontFamily: "monospace", fontSize: 8, letterSpacing: "0.3em",
                color: "rgba(255,255,255,0.18)",
              }}>
                <a href="https://instagram.com/df.webdesign" target="_blank" rel="noopener noreferrer"
                  style={{ color: "inherit", textDecoration: "none" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "rgba(0,255,136,0.6)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.18)")}>
                  INSTAGRAM
                </a>
                <a href="https://www.linkedin.com/in/felix-dahm-web/" target="_blank" rel="noopener noreferrer"
                  style={{ color: "inherit", textDecoration: "none" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "rgba(0,255,136,0.6)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.18)")}>
                  LINKEDIN
                </a>
              </div>
            </form>
          )}
        </div>

        {/* Bottom scanline */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(0,255,136,0.25), transparent)",
        }} />
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text", required }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder: string; type?: string; required?: boolean;
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontFamily: "monospace", fontSize: 8, letterSpacing: "0.4em", color: "#00FF88", opacity: 0.45, marginBottom: 7 }}>
        {label}
      </div>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} required={required}
        style={{
          width: "100%", background: "transparent", border: "none",
          borderBottom: "1px solid rgba(255,255,255,0.1)", color: "#ffffff",
          fontFamily: "monospace", fontSize: 13, padding: "7px 0", outline: "none",
          caretColor: "#00FF88", boxSizing: "border-box",
        }}
        onFocus={e => (e.target.style.borderBottomColor = "rgba(0,255,136,0.5)")}
        onBlur={e =>  (e.target.style.borderBottomColor = "rgba(255,255,255,0.1)")}
      />
    </div>
  );
}

function TextareaField({ label, value, onChange, placeholder, required }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder: string; required?: boolean;
}) {
  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ fontFamily: "monospace", fontSize: 8, letterSpacing: "0.4em", color: "#00FF88", opacity: 0.45, marginBottom: 7 }}>
        {label}
      </div>
      <textarea value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} required={required} rows={3}
        style={{
          width: "100%", background: "transparent", border: "none",
          borderBottom: "1px solid rgba(255,255,255,0.1)", color: "#ffffff",
          fontFamily: "monospace", fontSize: 13, padding: "7px 0", outline: "none",
          resize: "none", caretColor: "#00FF88", boxSizing: "border-box",
        }}
        onFocus={e => (e.target.style.borderBottomColor = "rgba(0,255,136,0.5)")}
        onBlur={e =>  (e.target.style.borderBottomColor = "rgba(255,255,255,0.1)")}
      />
    </div>
  );
}
