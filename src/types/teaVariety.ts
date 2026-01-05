export interface TeaVariety {
  id: string;
  name: string;
  generation: string;
  location: string;
  year: number;
  germinationRate: number;
  growthScore: number;
  diseaseResistance: number;
  aroma: string;
  note: string;
  status: "active" | "discarded";
  images: string[]; // 画像URLの配列
}
