/**
 * İletişim kişileri ve Organizasyon Ekibi
 */

export type Contact = {
  name: string;
  role: string;
  group: "Organizasyon" | "Danışman";
  phone?: string;
  showPhone?: boolean;
};

export const contacts: Contact[] = [
  {
    name: "Ceylin İmdat",
    role: "Organizasyon Sorumlusu",
    group: "Organizasyon",
    phone: "+90 551 016 48 01",
    showPhone: true,
  },
  {
    name: "Görkem Kuşçu",
    role: "Organizasyon Sorumlusu",
    group: "Organizasyon",
    phone: "+90 530 943 26 24",
    showPhone: true,
  },
  {
    name: "Berna Karakocalı",
    role: "Danışman Öğretmen",
    group: "Danışman",
  },
  {
    name: "İbrahim Çapa",
    role: "Danışman Öğretmen",
    group: "Danışman",
  },
  {
    name: "Şenol Çiçek",
    role: "Danışman Öğretmen",
    group: "Danışman",
  },
];

export type TeamCategory =
  | "all"
  | "leadership"
  | "akademi"
  | "organizasyon"
  | "staff"
  | "departments";

export const teamCategories: { id: TeamCategory; label: string; count: number }[] = [
  { id: "all", label: "Tüm Ekip", count: 16 },
  { id: "leadership", label: "Genel Sekreterlik & Yönetim", count: 4 },
  { id: "akademi", label: "Akademi", count: 2 },
  { id: "organizasyon", label: "Organizasyon", count: 2 },
  { id: "staff", label: "Staff", count: 2 },
  { id: "departments", label: "Departmanlar", count: 6 },
];

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  department: string;
  image: string;
  category: TeamCategory;
  isCoHead?: boolean;
};

/**
 * ALÇAL'27 Yönetim ve Departman Başkanları Ekibi
 * Kural: Aynı departman başkanları (Akademi, Org, Staff) yan yana sıralanmıştır.
 */
export const teamMembers: TeamMember[] = [
  // 1 & 2. Genel Sekreterlik
  {
    id: "ceylin-imdat",
    name: "Ceylin İmdat",
    role: "Genel Sekreter",
    department: "Genel Sekreterlik",
    image: "/team/ceylin-imdat-sg.png",
    category: "leadership",
  },
  {
    id: "gorkem-kuscu",
    name: "Görkem Kuşçu",
    role: "Genel Sekreter",
    department: "Genel Sekreterlik",
    image: "/team/gorkemkuscu-sg.png",
    category: "leadership",
  },
  // 2. Genel Direktörler
  {
    id: "genel-direktorler",
    name: "Genel Direktörler",
    role: "Genel Direktörlük",
    department: "Genel Direktörlük",
    image: "/team/genel-direktorler.png",
    category: "leadership",
  },
  // 3. Danışman
  {
    id: "berna-karakocali",
    name: "Berna Karakoçalı",
    role: "Danışman Öğretmen",
    department: "Danışmanlık",
    image: "/team/berna-karakocali-advisor.png",
    category: "leadership",
  },
  // 4 & 5. Akademi (Aynı team head'leri yan yana)
  {
    id: "eda-demir",
    name: "Eda Demir",
    role: "Akademi Başkanı",
    department: "Akademi",
    image: "/team/eda-demir-akademi.png",
    category: "akademi",
    isCoHead: true,
  },
  {
    id: "meyra-koc",
    name: "Meyra Koç",
    role: "Akademi Başkanı",
    department: "Akademi",
    image: "/team/meyra-koc-akademi.png",
    category: "akademi",
    isCoHead: true,
  },
  // 6 & 7. Organizasyon (Aynı team head'leri yan yana)
  {
    id: "eren-toptas",
    name: "Eren Toptaş",
    role: "Organizasyon Başkanı",
    department: "Organizasyon",
    image: "/team/eren-toptas-org.png",
    category: "organizasyon",
    isCoHead: true,
  },
  {
    id: "nehir-kucukcakir",
    name: "Nehir Küçükçakır",
    role: "Organizasyon Başkanı",
    department: "Organizasyon",
    image: "/team/nehir-kucukcakir-org.png",
    category: "organizasyon",
    isCoHead: true,
  },
  // 8 & 9. Staff (Aynı team head'leri yan yana)
  {
    id: "alya-utkugil",
    name: "Alya Utkugil",
    role: "Staff Başkanı",
    department: "Staff",
    image: "/team/alya-utkugil-staff.png",
    category: "staff",
    isCoHead: true,
  },
  {
    id: "tugrul-unlusoy",
    name: "Tuğrul Ünlüsoy",
    role: "Staff Başkanı",
    department: "Staff",
    image: "/team/tugrul-unlusoy-staff.png",
    category: "staff",
    isCoHead: true,
  },
  // 10. IT
  {
    id: "adem-eymen-kurt",
    name: "Adem Eymen Kurt",
    role: "IT Başkanı",
    department: "Bilişim & IT",
    image: "/team/adem-eymen-kurt-it.png",
    category: "departments",
  },
  // 11. Admin / İdari
  {
    id: "defne-karaosmanoglu",
    name: "Defne Karaosmanoğlu",
    role: "İdari İşler Başkanı",
    department: "İdari İşler",
    image: "/team/defne-karaosmanoglu-admin.png",
    category: "departments",
  },
  // 12. Lojistik
  {
    id: "cagatay",
    name: "Çağatay",
    role: "Lojistik Başkanı",
    department: "Lojistik",
    image: "/team/cagatay-lojistik.png",
    category: "departments",
  },
  // 13. Güvenlik
  {
    id: "hasan-efe-kilic",
    name: "Hasan Efe Kılıç",
    role: "Güvenlik Başkanı",
    department: "Güvenlik",
    image: "/team/hasan-efe-kilic-guvenlik.png",
    category: "departments",
  },
  // 14. Tasarım
  {
    id: "nida-goc",
    name: "Nida Göç",
    role: "Tasarım Başkanı",
    department: "Tasarım & Medya",
    image: "/team/nida-goc-tasarim.png",
    category: "departments",
  },
  // 15. Halkla İlişkiler
  {
    id: "tanem-cizlakoglu",
    name: "Tanem Cızlakoğlu",
    role: "Halkla İlişkiler Başkanı",
    department: "Halkla İlişkiler",
    image: "/team/tanem-halk.png",
    category: "departments",
  },
];
