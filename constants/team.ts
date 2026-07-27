/**
 * İletişim kişileri.
 *
 * GİZLİLİK NOTU: `phone` alanı yalnızca `showPhone: true` olan kişiler için
 * sitede gösterilir. Brifing dosyasındaki diğer numaralar kayıt altında
 * tutulmuyor — bir kişinin numarasını yayımlamak istiyorsanız bilgisini
 * ekleyip `showPhone` değerini true yapmanız yeterli.
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
