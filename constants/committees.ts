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
  icon: LucideIcon;
  /** Komiteye özel vurgu tonu — koyu zeminde okunur, doygunluğu bilinçli olarak düşük. */
  accent: string;
};

export const committees: Committee[] = [
  {
    id: "sanat",
    no: "01",
    name: "Sanat",
    icon: Palette,
    accent: "oklch(0.752 0.085 42)",
  },
  {
    id: "medya",
    no: "02",
    name: "Medya",
    icon: Radio,
    accent: "oklch(0.732 0.075 305)",
  },
  {
    id: "hukuk",
    no: "03",
    name: "Hukuk",
    icon: Scale,
    accent: "oklch(0.742 0.075 205)",
  },
  {
    id: "psikoloji",
    no: "04",
    name: "Psikoloji",
    icon: Brain,
    accent: "oklch(0.732 0.075 270)",
  },
  {
    id: "ekonomi",
    no: "05",
    name: "Ekonomi",
    icon: ChartLine,
    accent: "oklch(0.782 0.080 90)",
  },
  {
    id: "uluslararasi-iliskiler",
    no: "06",
    name: "Uluslararası İlişkiler",
    icon: Globe,
    accent: "oklch(0.742 0.080 240)",
  },
  {
    id: "saglik",
    no: "07",
    name: "Sağlık",
    icon: HeartPulse,
    accent: "oklch(0.752 0.080 155)",
  },
  {
    id: "sosyoloji",
    no: "08",
    name: "Sosyoloji",
    icon: UsersRound,
    accent: "oklch(0.742 0.080 15)",
  },
];
