import {
  Brain,
  ChartLine,
  Globe,
  HeartPulse,
  Palette,
  Radio,
  Scale,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

export type CommitteeLevel = "Kolay Seviye" | "Orta Seviye" | "Zor Seviye";

export type Committee = {
  id: string;
  /** Kart üzerindeki sıra numarası — "01" biçiminde gösterilir. */
  no: string;
  name: string;
  icon: LucideIcon;
  /** Komiteye özel vurgu tonu — koyu zeminde okunur, doygunluğu bilinçli olarak düşük. */
  accent: string;
  /** Komite afiş görseli (public/committees/) */
  image: string;
  /** Zorluk derecesi */
  level: CommitteeLevel;
  /** Komite ana gündem maddesi */
  agenda: string;
  /** Komite tanıtım ve çağrı açıklaması */
  description: string;
};

export const committees: Committee[] = [
  {
    id: "sanat",
    no: "01",
    name: "Sanat",
    icon: Palette,
    accent: "oklch(0.752 0.085 42)",
    image: "/committees/sanat.png",
    level: "Orta Seviye",
    agenda: "Sanat Dünyasındaki Sansürler ve İfade Özgürlüğünün Kısıtlanması",
    description:
      "Sanatın özgürce ifade edilebildiği bir dünya için bir araya geliyoruz. Bu komitemizde sansür mekanizmalarının sınırlarını, sanatçıların ifade özgürlüğünü ve sanatın toplumdaki dönüştürücü rolünü çok boyutlu olarak birlikte tartışmaya davetlisiniz.",
  },
  {
    id: "medya",
    no: "02",
    name: "Medya",
    icon: Radio,
    accent: "oklch(0.732 0.075 305)",
    image: "/committees/medya.png",
    level: "Orta Seviye",
    agenda: "Geleneksel ve Dijital Medyanın Birey ve Toplum Üzerindeki Etkileri",
    description:
      "Medyanın düşüncelerimizi, davranış kalıplarımızı ve toplumu nasıl şekillendirdiğini keşfediyoruz. Bu komitemizde geleneksel habercilik ile dijital medya araçlarının birey ve toplum üzerindeki etkilerini birlikte ele almaya davetlisiniz.",
  },
  {
    id: "hukuk",
    no: "03",
    name: "Hukuk",
    icon: Scale,
    accent: "oklch(0.742 0.075 205)",
    image: "/committees/hukuk.png",
    level: "Kolay Seviye",
    agenda: "Yargı Bağımsızlığı ve Tarafsızlığı",
    description:
      "Adaletin temel taşlarından biri olan bağımsız ve tarafsız yargı sistemini ele alıyoruz. Bu komitemizde hukukun üstünlüğünü, kuvvetler ayrılığını ve adil bir toplumun vazgeçilmez güvencelerini birlikte tartışmaya davetlisiniz.",
  },
  {
    id: "psikoloji",
    no: "04",
    name: "Psikoloji",
    icon: Brain,
    accent: "oklch(0.732 0.075 270)",
    image: "/committees/psikoloji.png",
    level: "Kolay Seviye",
    agenda: "Psikoterapinin Erişilebilirliği",
    description:
      "Bireylerin zihinlerini, davranışlarını ve ruh sağlığını bütüncül olarak inceleyen Psikoloji Komitemizde ana konumuz psikoterapinin erişilebilirliğidir. Ruh sağlığı hizmetlerine ulaşımda finansal problemleri, sosyokültürel yargıları ve dijitalleşmenin etkilerini inceleyecek; her bireyin psikoterapiye eşit şartlarda ulaşabilmesi için kapsamlı çözüm önerileri geliştireceğiz.",
  },
  {
    id: "ekonomi",
    no: "05",
    name: "Ekonomi",
    icon: ChartLine,
    accent: "oklch(0.782 0.080 90)",
    image: "/committees/ekonomi.png",
    level: "Orta Seviye",
    agenda: "Para Politikalarının İşlevsizleşmesi ve Kriptolaşma",
    description:
      "Üretim, tüketim ve finansal dengeleri inceleyen Ekonomi Komitemizde, teknolojiyle birlikte hızla gelişen kriptolaşma doğrultusunda para politikalarını ele alıyoruz. Geleneksel para politikalarının dönüşümünü, dijital varlıkların küresel piyasalara etkisini tartışmak ve yenilikçi çözümler üretmek için hepiniz komitemize davetlisiniz.",
  },
  {
    id: "uluslararasi-iliskiler",
    no: "06",
    name: "Uluslararası İlişkiler",
    icon: Globe,
    accent: "oklch(0.742 0.080 240)",
    image: "/committees/uluslararasi-iliskiler.png",
    level: "Zor Seviye",
    agenda: "Çok Kutupluluk ve İttifakların Çatlaması",
    description:
      "Devletler arası diplomatik, siyasi ve ekonomik ilişkileri küresel bir bakış açısıyla inceleyen Uluslararası İlişkiler Komitemizde, değişen küresel güç dengelerini ve ittifakların çatlama dinamiklerini ele alıyoruz. Güncel dünya düzenini ve oluşan yeni kutuplaşmaları derinlemesine analiz etmek için sizleri aramızda görmekten mutluluk duyarız.",
  },
  {
    id: "saglik",
    no: "07",
    name: "Sağlık",
    icon: HeartPulse,
    accent: "oklch(0.752 0.080 155)",
    image: "/committees/saglik.png",
    level: "Kolay Seviye",
    agenda: "Tıpta Eğitim, İstihdam ve Çalışan Hakları",
    description:
      "Sağlık sistemlerinin işleyişini inceleyen ve iyileştirilmesine katkı sağlamayı hedefleyen Sağlık Komitemizde, tıp alanındaki eğitim, istihdam ve çalışan hakları konusunu ele alıyoruz. Sağlık çalışanlarının karşılaştığı hak ihlallerini, branş eşitsizliklerini ve çalışma koşullarını inceleyerek somut çözüm yolları geliştirmek üzere sizleri komitemize davet ediyoruz.",
  },
  {
    id: "sosyoloji",
    no: "08",
    name: "Sosyoloji",
    icon: UsersRound,
    accent: "oklch(0.742 0.080 15)",
    image: "/committees/sosyoloji.png",
    level: "Zor Seviye",
    agenda: "Sistemik Baskılara Uyum Süreçleri ve Bireysel Faillik Eksenindeki Altkültür Direnişleri",
    description:
      "Bireylerin toplumsal baskılar karşısındaki tutumlarını, sistemik uyum süreçlerini ve altkültürlerin geliştirdiği direniş biçimlerini inceliyoruz. Bu komitemizde bireysel özgürlük, toplumsal normlar ve sosyal dönüşüm üzerine derinlikli bir müzakere ortamına davetlisiniz.",
  },
];
