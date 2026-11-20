import { NextResponse } from "next/server";
import { renderDecisionHtml, sendEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      applicantType = "delege",
      decision,
      assignedCommittee,
      customNote,
    } = body;

    if (!name || !email || !decision) {
      return NextResponse.json(
        { success: false, error: "İsim, e-posta ve karar (kabul/red) bilgisi zorunludur." },
        { status: 400 }
      );
    }

    if (decision !== "kabul" && decision !== "red") {
      return NextResponse.json(
        { success: false, error: "Karar yalnızca 'kabul' veya 'red' olabilir." },
        { status: 400 }
      );
    }

    const html = renderDecisionHtml({
      name,
      applicantType,
      decision,
      assignedCommittee,
      customNote,
    });

    const isAccepted = decision === "kabul";
    const subject = isAccepted
      ? `Tebrikler! ALÇAL'27 Başvurunuz Kabul Edildi — ${name}`
      : `ALÇAL'27 Başvuru Değerlendirme Sonucu — ${name}`;

    const result = await sendEmail({
      to: email,
      subject,
      html,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "E-posta gönderilemedi." },
        { status: 500 }
      );
    }

    console.log(
      `[Mail] Karar maili (${decision.toUpperCase()}) başarıyla gönderildi: ${email}`
    );

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("[Mail] Karar maili gönderme hatası:", error?.message || error);
    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "E-posta gönderilirken bir hata oluştu. Lütfen bağlantınızı kontrol edin.",
      },
      { status: 500 }
    );
  }
}
