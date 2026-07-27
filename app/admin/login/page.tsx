"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { toast } from "sonner";
import { getFirebaseAuth } from "@/lib/firebase";
import { useAdminAuth } from "@/components/admin/admin-auth-provider";
import { Wordmark } from "@/components/site/wordmark";

/** Firebase hata kodlarını okunur Türkçe mesajlara çevirir. */
function readableError(code: string) {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "E-posta veya şifre hatalı.";
    case "auth/too-many-requests":
      return "Çok fazla deneme yapıldı. Bir süre sonra tekrar deneyin.";
    case "auth/invalid-email":
      return "Geçerli bir e-posta adresi girin.";
    default:
      return "Giriş yapılamadı. Lütfen tekrar deneyin.";
  }
}

export default function AdminLoginPage() {
  const router = useRouter();
  const { user, loading, configured } = useAdminAuth();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/admin");
  }, [loading, user, router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const auth = getFirebaseAuth();
    if (!auth) return;

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    setSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/admin");
    } catch (error) {
      const code =
        typeof error === "object" && error && "code" in error
          ? String((error as { code: unknown }).code)
          : "";
      toast.error(readableError(code));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Wordmark size={34} />
        </div>

        <div className="rounded-lg border border-border bg-card p-7">
          <h1 className="text-lg font-semibold text-card-foreground">
            Yönetim paneli
          </h1>
          <p className="mt-1.5 text-[13px] text-muted-foreground">
            Devam etmek için yönetici hesabınızla giriş yapın.
          </p>

          {!configured ? (
            <div className="mt-6 rounded-md border border-destructive/30 bg-destructive/8 p-4 text-[13px] leading-relaxed text-muted-foreground">
              Firebase yapılandırması bulunamadı. Proje kökünde{" "}
              <code className="text-foreground">.env.local</code> dosyasını
              oluşturup Firebase anahtarlarını ekleyin, ardından geliştirme
              sunucusunu yeniden başlatın.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="text-[13px] font-medium text-foreground"
                >
                  E-posta
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  required
                  className="mt-2 h-11 w-full rounded-md border border-input bg-white/5 px-3.5 text-[14px] text-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="text-[13px] font-medium text-foreground"
                >
                  Şifre
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="mt-2 h-11 w-full rounded-md border border-input bg-white/5 px-3.5 text-[14px] text-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
              >
                {submitting ? "Giriş yapılıyor…" : "Giriş yap"}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
