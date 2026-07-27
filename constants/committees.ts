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

export type Committee = {
  id: string;
  /** Kart üzerindeki sıra numarası — "01" biçiminde gösterilir. */
  no: string;
  name: string;
  /** Brifing dosyasındaki resmî gündem maddesi. */
  agenda: string;
  /**
   * Gündemin ayrıntılı açıklaması. Her madde ayrı bir paragraf olarak basılır;
   * delege adayının komitenin kapsamını anlayabilmesi için yazıldı.
   */
  details: string[];
  icon: LucideIcon;
  /** Komiteye özel vurgu tonu — koyu zeminde okunur, doygunluğu bilinçli olarak düşük. */
  accent: string;
};

export const committees: Committee[] = [
  {
    id: "sanat",
    no: "01",
    name: "Sanat",
    agenda: "Sanat dünyasındaki sansürler ve ifade özgürlüğünün kısıtlanması",
    details: [
      "Sansür yalnızca bir eserin yasaklanmasıyla sınırlı değildir. Bir serginin açılmadan iptal edilmesi, bir tiyatro salonunun tahsis edilmemesi, bir filmin yaş sınırıyla dolaşımdan düşürülmesi ya da bir fonun belirli konulara verilmemesi de eserin izleyiciye ulaşmasını engeller. Komite, bu doğrudan ve dolaylı biçimleri birlikte ele alacaktır.",
      "Tartışmanın merkezinde birkaç gerilim bulunuyor: Kamu kaynağıyla üretilen sanat, kaynağı sağlayanın çizdiği sınırlara tabi olmalı mıdır? Bir eser toplumun bir kesimini rahatsız ettiğinde hangi ölçüt esas alınmalıdır? Dijital platformların içerik moderasyonu bir düzenleme midir, yoksa yeni bir sansür biçimi mi? Sanatçının kendi kendine uyguladığı kısıtlama, dışarıdan gelen baskıdan daha mı etkilidir?",
      "Delegelerden, sanatsal ifadeyi koruyan ancak toplumsal hassasiyetleri de gözeten ölçütler önermeleri; fon ve tahsis kararlarında şeffaflık sağlayacak mekanizmalar tasarlamaları beklenmektedir.",
    ],
    icon: Palette,
    accent: "oklch(0.752 0.085 42)",
  },
  {
    id: "medya",
    no: "02",
    name: "Medya",
    agenda: "Çocukların dijital sömürüsü ve gizli çocuk işçiliği",
    details: [
      "Çocuklar dijital dünyada yalnızca izleyici değil, çoğu zaman içeriğin kendisidir. Aile kanallarında, ürün tanıtımlarında ve günlük yaşam videolarında yer alan çocuklar üzerinden ciddi bir gelir üretilir. Bu emek çoğu ülkede çalışma mevzuatının dışında kalır; çocuk ne sözleşmenin tarafıdır ne de gelirin sahibi.",
      "Komite sorunu üç boyutuyla ele alacaktır. Rıza: Kendi görüntüsünün paylaşılmasına karar verecek yaşta olmayan bir çocuğun rızası nasıl aranır? Gelir: Çocuğun görüntüsünden elde edilen kazanç kime aittir, koruma altına alınabilir mi? Sorumluluk: Platformlar, ebeveynler ve reklam verenler bu zincirin neresinde durur?",
      "Çocukların hedeflenmiş reklamcılığa maruz kalması, yaş doğrulama sistemlerinin yetersizliği ve erken yaşta oluşan dijital ayak izinin ileriki yaşama etkisi de gündemin parçasıdır. Delegelerden, çocuğun dijital emeğini görünür kılacak ve koruma altına alacak düzenleme önerileri geliştirmeleri beklenmektedir.",
    ],
    icon: Radio,
    accent: "oklch(0.732 0.075 305)",
  },
  {
    id: "hukuk",
    no: "03",
    name: "Hukuk",
    agenda: "Yargı bağımsızlığı ve tarafsızlığı",
    details: [
      "Bağımsızlık ve tarafsızlık birbirine yakın ancak aynı olmayan kavramlardır. Bağımsızlık, yargının diğer erklerden ve dış etkilerden yalıtılmasını sağlayan yapısal güvenceleri; tarafsızlık ise hâkimin önüne gelen davada taraflardan birine meyletmemesini ifade eder. Biri kurumsal, diğeri kişiseldir ve biri olmadan diğeri anlamını yitirir.",
      "Komite, bu güvencelerin hangi mekanizmalarla korunduğunu inceleyecektir: hâkim ve savcıların atanma ve terfi usulleri, disiplin süreçlerinin kimin elinde olduğu, coğrafi teminat, mesleki kıdem sistemi ve yargı bütçesinin belirlenme biçimi. Bunların her biri, kararların hangi kaygıyla verildiğini doğrudan etkiler.",
      "Gündemin ikinci ekseni kamuoyu ve medyadır. Henüz karara bağlanmamış davaların basında yürütülmesi, sosyal medyada oluşan linç dalgaları ve siyasi açıklamaların yargılama üzerindeki etkisi tartışılacaktır. Delegelerden, denetimsizlik ile bağımsızlığın zedelenmesi arasındaki dengeyi kuran öneriler üretmeleri beklenmektedir.",
    ],
    icon: Scale,
    accent: "oklch(0.742 0.075 205)",
  },
  {
    id: "psikoloji",
    no: "04",
    name: "Psikoloji",
    agenda: "Psikoterapi ve ruh sağlığı hizmetlerinin erişilebilirliği",
    details: [
      "Ruh sağlığı hizmetine erişim, yalnızca hizmetin var olup olmamasıyla ilgili değildir. Bir kişinin destek alabilmesi için hizmetin karşılanabilir bir maliyette olması, ulaşılabilir bir mesafede bulunması, bekleme süresinin makul olması ve başvurmanın toplumsal bir bedeli olmaması gerekir. Bu koşullardan biri eksik olduğunda hizmet kâğıt üzerinde var olsa bile fiilen erişilemez hâle gelir.",
      "Komite bu boyutları ayrı ayrı ele alacaktır: terapi ücretlerinin sigorta kapsamı, büyükşehirler dışındaki illerde uzman yoğunluğu, kamu kurumlarındaki randevu süreleri, ruh sağlığı sorunlarına yönelik damgalanma ve nitelikli uzman yetiştirme kapasitesi.",
      "Dijital terapi uygulamaları ayrı bir başlıktır: erişimi genişletme potansiyeli taşırken hizmet niteliği, gizlilik ve denetim açısından yeni sorular doğurur. Okullarda psikolojik danışmanlığın kurumsallaşması da gündeme dâhildir. Delegelerden, kaynakların sınırlı olduğu bir ortamda erişimi genişletecek somut öneriler geliştirmeleri beklenmektedir.",
    ],
    icon: Brain,
    accent: "oklch(0.732 0.075 270)",
  },
  {
    id: "ekonomi",
    no: "05",
    name: "Ekonomi",
    agenda:
      "Para politikalarının işlevsizleşmesi ve finansal sistemde kriptolaşma",
    details: [
      "Merkez bankalarının başlıca aracı olan faiz, ekonomideki talebi ve fiyat düzeyini yönlendirmek için kullanılır. Ancak enflasyonun kaynağı talep fazlası değil de arz kısıtları, döviz kuru hareketleri veya beklentilerdeki bozulma olduğunda bu aracın etkisi zayıflar. Komite, para politikasının hangi koşullarda işlevini yitirdiğini inceleyecektir.",
      "İkinci eksen, değerin geleneksel finansal sistemin dışına kaymasıdır. Yüksek enflasyon ve yerel para birimine güvenin azaldığı ortamlarda tasarruflar kripto varlıklara ya da yabancı paraya yönelir. Bu yönelim; kripto varlıkların bir para birimi mi yoksa spekülatif bir varlık sınıfı mı olduğu, stablecoin'lerin rolü, vergilendirme ve denetim sorunları etrafında tartışılacaktır.",
      "Merkez bankası dijital paraları da gündemin parçasıdır: nakde alternatif bir kamu aracı olarak mı görülmelidir, yoksa mali gizlilik açısından yeni bir risk mi doğurur? Delegelerden, finansal istikrar ile bireysel özgürlük arasındaki dengeyi gözeten düzenleme çerçeveleri önermeleri beklenmektedir.",
    ],
    icon: ChartLine,
    accent: "oklch(0.782 0.080 90)",
  },
  {
    id: "uluslararasi-iliskiler",
    no: "06",
    name: "Uluslararası İlişkiler",
    agenda: "Çok kutupluluk ve ittifakların çatlaması",
    details: [
      "Soğuk Savaş sonrasında kurulan tek merkezli düzen, yerini birden fazla güç merkezinin bulunduğu bir yapıya bırakıyor. Bu geçiş; ekonomik ağırlığın yer değiştirmesi, bölgesel güçlerin kendi etki alanlarını genişletmesi ve uluslararası kurumların karar alma kapasitesinin zayıflamasıyla birlikte ilerliyor.",
      "Komite, bu dönüşümün ittifaklar üzerindeki etkisini ele alacaktır. Güvenlik açısından aynı blokta yer alan devletlerin ekonomik olarak rakip bloklara bağımlı hâle gelmesi, ittifak içi kararların yavaşlaması ve üye devletlerin ulusal çıkarlarını ortak tutumun önüne koyması bu çatlamanın belirtileridir.",
      "Orta ölçekli devletlerin manevra alanı ayrı bir başlıktır: birden fazla merkezle aynı anda ilişki kurmak sürdürülebilir bir strateji midir, yoksa her iki tarafın da güvenini kaybetmeye mi yol açar? Delegelerden, çok kutuplu düzende istikrarı artıracak diplomatik mekanizmalar önermeleri beklenmektedir.",
    ],
    icon: Globe,
    accent: "oklch(0.742 0.080 240)",
  },
  {
    id: "saglik",
    no: "07",
    name: "Sağlık",
    agenda: "Tıpta eğitim kalitesi, istihdam sorunları ve çalışan hakları",
    details: [
      "Hekim yetiştirmek ile yetişen hekimi sistemde tutabilmek farklı sorunlardır ve çoğu zaman birlikte ele alınmaz. Kontenjan artışları hekim sayısını yükseltirken; öğretim üyesi başına düşen öğrenci sayısı, uygulamalı eğitim için gereken hasta ve donanım kapasitesi aynı hızda büyümediğinde eğitimin niteliği düşer.",
      "Komite, mezuniyet sonrası tarafı da inceleyecektir: uzmanlık eğitiminde nöbet düzeni ve çalışma saatleri, bu sürelerin hem hekim sağlığı hem hasta güvenliği üzerindeki etkisi, ücretlendirme, sağlık çalışanlarına yönelik şiddet ve yasal koruma mekanizmalarının yeterliliği.",
      "Bu koşulların bir sonucu olarak ortaya çıkan yurt dışına göç eğilimi de gündemin parçasıdır. Delegelerden, eğitim kalitesi ile istihdam koşullarını birlikte ele alan; hem hekimi hem hastayı gözeten öneriler geliştirmeleri beklenmektedir.",
    ],
    icon: HeartPulse,
    accent: "oklch(0.752 0.080 155)",
  },
  {
    id: "sosyoloji",
    no: "08",
    name: "Sosyoloji",
    agenda:
      "Toplumsal baskı mekanizmaları karşısında gençlik altkültürleri ve bireysel kimlik arayışları",
    details: [
      "Toplumsal baskı yalnızca açık yasaklarla işlemez. Beklenti, ayıplama, dışlanma korkusu ve “ne derler” kaygısı gibi görünmez mekanizmalar, bireyin davranışını çoğu zaman yazılı kurallardan daha etkili biçimde yönlendirir. Gençlik, bu mekanizmalarla en yoğun temas eden yaş grubudur.",
      "Altkültürler bu baskıya verilen kolektif yanıtlardan biridir. Müzik, giyim, dil ve mekân tercihleri üzerinden kurulan bu gruplar hem bir aidiyet alanı hem de bir itiraz biçimidir. Komite; altkültürlerin nasıl oluştuğunu, zamanla nasıl birer tüketim kategorisine dönüştürülebildiğini ve bu dönüşümün itiraz gücünü zayıflatıp zayıflatmadığını inceleyecektir.",
      "Sosyal medyanın rolü ayrı bir eksendir: akran baskısını coğrafi sınırların ötesine taşıması, algoritmaların benzer içerikleri öne çıkararak kimlik arayışını yönlendirmesi ve karşılaştırmanın sürekli hâle gelmesi tartışılacaktır. Delegelerden, bireysel kimlik arayışı ile aidiyet ihtiyacı arasındaki gerilimi ele alan öneriler üretmeleri beklenmektedir.",
    ],
    icon: UsersRound,
    accent: "oklch(0.742 0.080 15)",
  },
];
