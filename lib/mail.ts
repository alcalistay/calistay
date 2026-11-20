import nodemailer from "nodemailer";
import { event } from "@/constants/event";
import { committees } from "@/constants/committees";

const GMAIL_USER = process.env.GMAIL_USER || "alcalistay26@gmail.com";
const GMAIL_PASS = process.env.GMAIL_APP_PASSWORD || process.env.GMAIL_PASS || "";
const GOOGLE_SCRIPT_URL =
  process.env.GOOGLE_SCRIPT_URL || process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || "";

/**
 * Nodemailer SMTP Transporter
 * Gmail Uygulama Şifresi ile SSL (465 portu) üzerinden güvenli gönderim yapar.
 */
export function getMailTransporter() {
  if (!GMAIL_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_PASS.replace(/\s+/g, ""), // boşlukları temizle
    },
  });
}

/**
 * Evrensel E-posta Gönderme Fonksiyonu:
 * 1. Eğer GOOGLE_SCRIPT_URL tanımlıysa doğrudan Google Apps Script webhook'u üzerinden şifresiz/2FA'sız atar.
 * 2. Eğer GMAIL_APP_PASSWORD tanımlıysa Nodemailer SMTP üzerinden atar.
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<{ success: boolean; error?: string }> {
  // 1. Google Apps Script Webhook Yöntemi (Öncelikli - 2FA ve şifre gerektirmez)
  if (GOOGLE_SCRIPT_URL) {
    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to,
          subject,
          html,
          text: text || "ALÇAL'27 Atatürk Lisesi Çalıştayı Bilgilendirmesi",
        }),
        redirect: "follow",
      });

      if (!response.ok) {
        throw new Error(`Google Script yanıtı: HTTP ${response.status}`);
      }

      console.log(`[Mail - Google Script] E-posta başarıyla iletildi: ${to}`);
      return { success: true };
    } catch (err: unknown) {
      const error = err as Error;
      console.error("[Mail - Google Script Hatası]:", error.message);
      return { success: false, error: error.message };
    }
  }

  // 2. Nodemailer SMTP Yöntemi
  const transporter = getMailTransporter();
  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"ALÇAL'27 Organizasyon Ekibi" <${GMAIL_USER}>`,
        to,
        replyTo: GMAIL_USER,
        subject,
        html,
      });
      console.log(`[Mail - Nodemailer] E-posta başarıyla iletildi: ${to}`);
      return { success: true };
    } catch (err: unknown) {
      const error = err as Error;
      console.error("[Mail - Nodemailer Hatası]:", error.message);
      return { success: false, error: error.message };
    }
  }

  return {
    success: false,
    error:
      "E-posta altyapısı henüz yapılandırılmamış. .env.local dosyasına GOOGLE_SCRIPT_URL tanımlayınız.",
  };
}

function getCommitteeName(id: string): string {
  if (!id || id === "Admin" || id === "—") return "—";
  const found = committees.find((c) => c.id === id);
  if (found) return found.name;
  return id;
}

/**
 * 1. Başvuru Alındı Teyit E-postası Şablonu
 */
export function renderApplicationReceivedHtml({
  name,
  applicantType,
  choices = [],
}: {
  name: string;
  applicantType: string;
  choices?: string[];
}) {
  const roleName =
    applicantType === "chair"
      ? "Chair (Komite Başkanı)"
      : applicantType === "admin"
        ? "Admin (İdari Ekip)"
        : "Delege";

  const choicesHtml =
    applicantType === "admin"
      ? `<tr>
          <td style="padding: 8px 0; color: #94a3b8; font-size: 13px;">Görev Alanı:</td>
          <td style="padding: 8px 0; color: #f1f5f9; font-size: 13px; font-weight: 600; text-align: right;">Çalıştay İdari & Salon Koordinasyonu</td>
        </tr>`
      : choices.length > 0
        ? `<tr>
            <td style="padding: 8px 0; color: #94a3b8; font-size: 13px; vertical-align: top;">Komite Tercihleriniz:</td>
            <td style="padding: 8px 0; color: #f1f5f9; font-size: 13px; font-weight: 600; text-align: right;">
              ${choices.map((c, i) => `${i + 1}. ${getCommitteeName(c)}`).join("<br/>")}
            </td>
          </tr>`
        : "";

  return `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ALÇAL'27 Başvurunuz Alındı</title>
</head>
<body style="margin: 0; padding: 0; background-color: #080d1a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9; line-height: 1.6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #080d1a; padding: 30px 15px;">
    <tr>
      <td align="center">
        <!-- Ana Kart -->
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
          
          <!-- Üst Vurgu Çizgisi -->
          <tr>
            <td height="4" style="background: linear-gradient(90deg, #d97706, #f59e0b, #fbbf24);"></td>
          </tr>

          <!-- Başlık Alanı -->
          <tr>
            <td style="padding: 36px 32px 24px; text-align: center; border-bottom: 1px solid #1e293b;">
              <span style="display: inline-block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #f59e0b; margin-bottom: 8px;">
                Atatürk Lisesi Çalıştayı 2027
              </span>
              <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                Başvurunuz Başarıyla Alındı
              </h1>
            </td>
          </tr>

          <!-- İçerik -->
          <tr>
            <td style="padding: 32px 32px 24px;">
              <p style="margin: 0 0 16px; font-size: 15px; color: #f1f5f9;">
                Sayın <strong>${name}</strong>,
              </p>
              <p style="margin: 0 0 24px; font-size: 14px; color: #cbd5e1; line-height: 1.7;">
                <strong>ALÇAL'27 (Atatürk Lisesi Çalıştayı 2027)</strong> bünyesinde yapmış olduğunuz <strong>${roleName}</strong> başvurunuz organizasyon komitemize başarıyla ulaşmıştır.
              </p>

              <!-- Bilgi Özeti Tablosu -->
              <div style="background-color: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 18px 20px; margin-bottom: 24px;">
                <table width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="padding: 6px 0; color: #94a3b8; font-size: 13px;">Başvuru Türü:</td>
                    <td style="padding: 6px 0; color: #fbbf24; font-size: 13px; font-weight: 700; text-align: right;">${roleName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #94a3b8; font-size: 13px;">Etkinlik Tarihi:</td>
                    <td style="padding: 6px 0; color: #f1f5f9; font-size: 13px; font-weight: 600; text-align: right;">${event.dateLabelLong}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #94a3b8; font-size: 13px;">Etkinlik Yeri:</td>
                    <td style="padding: 6px 0; color: #f1f5f9; font-size: 13px; font-weight: 600; text-align: right;">${event.venue.name} - ${event.venue.district} / ${event.venue.city}</td>
                  </tr>
                  ${choicesHtml}
                </table>
              </div>

              <!-- Süreç Bilgilendirmesi -->
              <p style="margin: 0 0 16px; font-size: 13.5px; color: #cbd5e1; line-height: 1.7;">
                Başvurunuz, organizasyon ve akademi kurulumuz tarafından titizlikle incelenecektir. Değerlendirme süreci sona erdiğinde kabul/sonuç bilgilendirmesi bu e-posta adresinize gönderilecektir.
              </p>

              <p style="margin: 0; font-size: 13.5px; color: #94a3b8; line-height: 1.6;">
                Çalıştayımıza göstermiş olduğunuz ilgi ve katılım motivasyonunuz için teşekkür ederiz.
              </p>
            </td>
          </tr>

          <!-- Alt Bilgi / Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #0b1120; border-top: 1px solid #1e293b; text-align: center;">
              <p style="margin: 0 0 6px; font-size: 13px; font-weight: 600; color: #ffffff;">
                ALÇAL'27 Organizasyon Ekibi
              </p>
              <p style="margin: 0 0 12px; font-size: 12px; color: #64748b;">
                Sorularınız için: <a href="mailto:${GMAIL_USER}" style="color: #f59e0b; text-decoration: none;">${GMAIL_USER}</a>
              </p>
              <div style="font-size: 11px; color: #475569;">
                Instagram: <a href="${event.contact.instagramUrl}" style="color: #94a3b8; text-decoration: underline;">@alcalistay</a>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * 2. Karar E-postası Şablonu (Kabul veya Red)
 */
export function renderDecisionHtml({
  name,
  applicantType,
  decision,
  assignedCommittee,
  customNote,
}: {
  name: string;
  applicantType: string;
  decision: "kabul" | "red";
  assignedCommittee?: string;
  customNote?: string;
}) {
  const isAccepted = decision === "kabul";

  const roleName =
    applicantType === "chair"
      ? "Chair (Komite Başkanı)"
      : applicantType === "admin"
        ? "Admin (İdari Ekip)"
        : "Delege";

  const accentColor = isAccepted ? "#10b981" : "#f43f5e";
  const badgeText = isAccepted ? "BAŞVURUNUZ KABUL EDİLDİ" : "BAŞVURU SONUCU";

  const headingText = isAccepted
    ? "Tebrikler, ALÇAL'27'ye Kabul Edildiniz!"
    : "ALÇAL'27 Başvuru Değerlendirme Sonucu";

  const committeeDisplay = assignedCommittee
    ? getCommitteeName(assignedCommittee)
    : "";

  const assignedHtml =
    isAccepted && committeeDisplay
      ? `<div style="background-color: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px; padding: 16px 20px; margin-bottom: 24px; text-align: center;">
          <span style="font-size: 11.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #10b981;">Atandığınız Komite</span>
          <div style="font-size: 18px; font-weight: 800; color: #ffffff; margin-top: 4px;">${committeeDisplay}</div>
        </div>`
      : "";

  const customNoteHtml = customNote
    ? `<div style="background-color: #1e293b; border-left: 3px solid ${accentColor}; border-radius: 0 8px 8px 0; padding: 14px 18px; margin-bottom: 24px;">
        <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #94a3b8; display: block; margin-bottom: 4px;">Organizasyon Notu:</span>
        <p style="margin: 0; font-size: 13.5px; color: #f1f5f9; line-height: 1.6;">${customNote.replace(/\n/g, "<br/>")}</p>
      </div>`
    : "";

  const bodyContent = isAccepted
    ? `
      <p style="margin: 0 0 16px; font-size: 15px; color: #f1f5f9;">
        Sayın <strong>${name}</strong>,
      </p>
      <p style="margin: 0 0 20px; font-size: 14px; color: #cbd5e1; line-height: 1.7;">
        <strong>ALÇAL'27 (Atatürk Lisesi Çalıştayı 2027)</strong> için yapmış olduğunuz <strong>${roleName}</strong> başvurunuz Akademi ve Organizasyon Kurulumuz tarafından titizlikle değerlendirilmiş ve <strong>memnuniyetle kabul edilmiştir.</strong>
      </p>

      ${assignedHtml}

      <p style="margin: 0 0 20px; font-size: 13.5px; color: #cbd5e1; line-height: 1.7;">
        Etkinlik süreci, oturum saatleri, çalışma kılavuzları (study guide) ve katılımcı bilgilendirme rehberimiz ilerleyen günlerde e-posta ve resmî duyuru kanallarımız üzerinden sizinle paylaşılacaktır.
      </p>

      ${customNoteHtml}

      <p style="margin: 0; font-size: 13.5px; color: #94a3b8; line-height: 1.6;">
        Sizi aramızda görmekten büyük mutluluk duyuyoruz. Verimli, ilham dolu ve dinamik bir çalıştay geçirmek dileğiyle!
      </p>
    `
    : `
      <p style="margin: 0 0 16px; font-size: 15px; color: #f1f5f9;">
        Sayın <strong>${name}</strong>,
      </p>
      <p style="margin: 0 0 20px; font-size: 14px; color: #cbd5e1; line-height: 1.7;">
        <strong>ALÇAL'27 (Atatürk Lisesi Çalıştayı 2027)</strong> için göstermiş olduğunuz yoğun ilgi ve kıymetli başvurunuz için teşekkür ederiz.
      </p>
      <p style="margin: 0 0 20px; font-size: 13.5px; color: #cbd5e1; line-height: 1.7;">
        Bu yılki kontenjanlarımızın ve komite kapasitelerimizin sınırlı olması sebebiyle, başvurunuzu bu dönem için ne yazık ki olumlu olarak sonuçlandıramadığımızı üzülerek bildirmek isteriz.
      </p>

      ${customNoteHtml}

      <p style="margin: 0; font-size: 13.5px; color: #94a3b8; line-height: 1.6;">
        Akademik ve kişisel yolculuğunuzda üstün başarılar diler, gelecekteki çalışmalarımızda ve etkinliklerimizde sizi tekrar aramızda görmekten mutluluk duyarız.
      </p>
    `;

  return `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${headingText}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #080d1a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9; line-height: 1.6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #080d1a; padding: 30px 15px;">
    <tr>
      <td align="center">
        <!-- Ana Kart -->
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
          
          <!-- Üst Vurgu Çizgisi -->
          <tr>
            <td height="4" style="background: ${accentColor};"></td>
          </tr>

          <!-- Başlık Alanı -->
          <tr>
            <td style="padding: 36px 32px 24px; text-align: center; border-bottom: 1px solid #1e293b;">
              <span style="display: inline-block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: ${accentColor}; margin-bottom: 8px;">
                ${badgeText}
              </span>
              <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                ${headingText}
              </h1>
            </td>
          </tr>

          <!-- İçerik -->
          <tr>
            <td style="padding: 32px 32px 28px;">
              ${bodyContent}
            </td>
          </tr>

          <!-- Alt Bilgi / Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #0b1120; border-top: 1px solid #1e293b; text-align: center;">
              <p style="margin: 0 0 6px; font-size: 13px; font-weight: 600; color: #ffffff;">
                ALÇAL'27 Organizasyon Ekibi
              </p>
              <p style="margin: 0 0 12px; font-size: 12px; color: #64748b;">
                Sorularınız için: <a href="mailto:${GMAIL_USER}" style="color: #f59e0b; text-decoration: none;">${GMAIL_USER}</a>
              </p>
              <div style="font-size: 11px; color: #475569;">
                Instagram: <a href="${event.contact.instagramUrl}" style="color: #94a3b8; text-decoration: underline;">@alcalistay</a>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
