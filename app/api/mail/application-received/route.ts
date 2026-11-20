import { NextResponse } from "next/server";
import { renderApplicationReceivedHtml, sendEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, applicantType, choices } = body;

    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: "İsim ve e-posta adresi zorunludur." },
        { status: 400 }
      );
    }

    const html = renderApplicationReceivedHtml({
      name,
      applicantType: applicantType || "delege",
      choices: Array.isArray(choices) ? choices : [],
    });

    const result = await sendEmail({
      to: email,
      subject: `ALÇAL'27 — Başvurunuz Alındı: ${name}`,
      html,
    });

    if (!result.success) {
      console.warn("[Mail] Teyit maili uyarısı:", result.error);
      return NextResponse.json({
        success: false,
        warning: result.error,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("[Mail] Teyit maili gönderme hatası:", error?.message || error);
    return NextResponse.json(
      { success: false, error: error?.message || "E-posta gönderilemedi." },
      { status: 500 }
    );
  }
}
