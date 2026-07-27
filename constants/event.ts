/**
 * Etkinliğin tek doğruluk kaynağı.
 * Sitedeki her tarih/sayı/adres buradan okunur — tek yerden güncellenir.
 */

export const event = {
  shortName: "ALÇAL'26",
  name: "Atatürk Lisesi Çalıştayı 2026",
  organizer: "ALÇAL Organizasyon Ekibi",
  school: "Eskişehir Atatürk Lisesi",
  language: "Türkçe",

  /**
   * NOT: Brifing dosyasında yalnızca "Aralık 2026" belirtiliyor; gün bilgisi yok.
   * Kesin tarih netleştiğinde geri sayımın doğru çalışması için burayı güncelleyin.
   */
  startsAt: "2026-12-18T16:00:00+03:00",
  dateLabel: "Aralık 2026",
  dateLabelLong: "18 – 20 Aralık 2026",
  isDatePreliminary: true,

  venue: {
    name: "Atatürk Lisesi",
    district: "Odunpazarı",
    city: "Eskişehir",
    address: "Akcami Mh. Malhatun Sk. No: 1, Odunpazarı / Eskişehir",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Atat%C3%BCrk%20Lisesi%20Odunpazar%C4%B1%20Eski%C5%9Fehir",
  },

  contact: {
    email: "alcalistay26@gmail.com",
    instagram: "alcalistay",
    instagramUrl: "https://www.instagram.com/alcalistay/",
  },
} as const;

export type Stat = {
  value: number;
  label: string;
  detail: string;
  /** true ise sayının yanına yıldız konur; açıklaması footer'da yer alır. */
  estimated?: boolean;
};

/** Footer'daki dipnot — `estimated` işaretli sayılar için. */
export const estimateNote =
  "* Tahmin edilen toplam katılımcı sayısıdır.";

/** Brifingdeki katılımcı tablosundan türetildi. */
export const stats: Stat[] = [
  {
    value: 370,
    label: "Toplam katılımcı",
    detail: "Delege, danışman ve organizasyon ekibiyle birlikte",
    estimated: true,
  },
  {
    value: 300,
    label: "Delege",
    detail: "Türkiye'nin dört bir yanından lise öğrencisi",
  },
  {
    value: 8,
    label: "Komite",
    detail: "Sanattan ekonomiye, hukuktan sosyolojiye",
  },
  {
    // NOT: Okulun mühründe kuruluş yılı 1910 olarak geçiyor; 1930 ise lise
    // kısmının eklendiği yıl. Hangisini öne çıkaracağınıza göre güncelleyin.
    value: 1930,
    label: "Köklü tarih",
    detail: "Lise kısmının eklenişinden bugüne uzanan bir eğitim mirası",
  },
];

/** Hakkında bölümündeki tanıtım metni. */
export const aboutParagraphs: string[] = [
  "ALÇAL'26, lise düzeyindeki öğrencileri, eğitimcileri ve genç lider adaylarını bir araya getiren, ulusal katılıma açık bir çalıştay konferansıdır. Etkinlik Eskişehir Atatürk Lisesi'nde düzenlenir ve Türkiye'nin farklı illerinden gelen öğrencilere açıktır.",
  "Katılımcılar sekiz komiteye dağılır, kendilerine verilen gündem maddesini müzakere eder ve oturumların sonunda vardıkları çözümü bir komite raporuna dönüştürür. Program boyunca eleştirel düşünme, müzakere, sunum ve liderlik becerileri üzerine çalışılır.",
];

/** Okul tarihçesi — zaman çizelgesi olarak sergilenir. */
export const timeline = [
  {
    year: "1910",
    text: "Okulun temelleri Osmanlı dönemindeki Rüştiye Mektebi'yle atılır. Zaman içinde İdadi ve ardından Sultani Mektebi adlarını alarak eğitime devam eder.",
  },
  {
    year: "1922",
    text: "Kurtuluş Savaşı sırasında bir süre kapanan okul, savaşın ardından yeniden açılır.",
  },
  {
    year: "1930",
    text: "Lise kısmının eklenmesiyle okul Eskişehir Lisesi adını alır.",
  },
  {
    year: "1933",
    text: "Atatürk okulu ziyaret eder ve bugünkü tarihi binasına taşınmasına öncülük eder.",
  },
  {
    year: "1934–35",
    text: "Okul bugün de kullanılan tarihi binasına taşınır.",
  },
  {
    year: "1961",
    text: "Okul bugünkü adıyla Atatürk Lisesi olur. İlerleyen yıllarda pansiyon, akşam lisesi ve spor salonu gibi birimlerle büyür.",
  },
] as const;
