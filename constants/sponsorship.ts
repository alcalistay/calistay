import {
  Award,
  Coffee,
  Package,
  Printer,
  Projector,
  type LucideIcon,
} from "lucide-react";

export type SupportArea = {
  title: string;
  description: string;
  icon: LucideIcon;
};

/** Brifing dosyasındaki "Destek Talep Edilen Başlıca Alanlar". */
export const supportAreas: SupportArea[] = [
  {
    title: "Etkinlik mekânı",
    description: "Teknik ekipman, ses–görüntü sistemleri ve oturum düzeni.",
    icon: Projector,
  },
  {
    title: "Basılı materyal",
    description:
      "Katılımcı kartları, yaka kartları, afişler, broşürler ve rehber kitapçıkları.",
    icon: Printer,
  },
  {
    title: "Katılımcı setleri",
    description: "Not defteri, kalem, bez çanta, dosya ve oturum materyalleri.",
    icon: Package,
  },
  {
    title: "Ödül ve sertifika",
    description:
      "“En İyi Delegasyon” ve “En İyi Konuşmacı” plaketleri ile katılım sertifikaları.",
    icon: Award,
  },
  {
    title: "İkram ve lojistik",
    description:
      "Mola ikramları, su ve kahve temini, görevli ekiplerin alan içi koordinasyonu.",
    icon: Coffee,
  },
];

/** Sponsorlara sunulan karşılık — brifingdeki görünürlük vaadinin somutlaştırılmış hâli. */
export const sponsorBenefits: string[] = [
  "Afiş, broşür ve rehber kitapçığında logo görünürlüğü",
  "Açılış ve kapanış seremonilerinde kurum anonsu",
  "Sosyal medya hesaplarımızda tanıtım paylaşımı",
  "Etkinlik alanında stant ve materyal dağıtım imkânı",
  "370 kişilik genç ve nitelikli bir katılımcı kitlesine doğrudan erişim",
];
