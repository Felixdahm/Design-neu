import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Alle Felder sind erforderlich." }, { status: 400 });
    }

    const { error } = await resend.emails.send({
      from: "DF Webdesign <kontakt@df-webdesign.com>",
      to:   ["felix.dahm@itsd-consulting.de"],
      replyTo: email,
      subject: `Neue Anfrage von ${name}`,
      html: `
        <div style="font-family: monospace; background: #000; color: #fff; padding: 32px; max-width: 600px;">
          <div style="border-bottom: 1px solid rgba(0,255,136,0.3); padding-bottom: 16px; margin-bottom: 24px;">
            <span style="color: #00FF88; font-size: 11px; letter-spacing: 0.4em;">DF WEBDESIGN — NEUE ANFRAGE</span>
          </div>
          <p style="color: rgba(255,255,255,0.5); font-size: 11px; margin: 0 0 4px;">NAME</p>
          <p style="color: #fff; font-size: 14px; margin: 0 0 20px;">${name}</p>
          <p style="color: rgba(255,255,255,0.5); font-size: 11px; margin: 0 0 4px;">E-MAIL</p>
          <p style="color: #fff; font-size: 14px; margin: 0 0 20px;">${email}</p>
          <p style="color: rgba(255,255,255,0.5); font-size: 11px; margin: 0 0 4px;">NACHRICHT</p>
          <p style="color: #fff; font-size: 14px; margin: 0; white-space: pre-wrap;">${message}</p>
        </div>
      `,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Serverfehler." }, { status: 500 });
  }
}
