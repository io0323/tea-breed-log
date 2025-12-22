export type TeaVariety = {
  id: string;
  name: string;                  // 品種名
  generation: string;            // F1 / F2 / F3
  location: string;              // 栽培地
  year: number;                  // 年
  germinationRate: number;       // 発芽率（%）
  growthScore: number;           // 生育スコア（1-5）
  diseaseResistance: number;     // 耐病性（1-5）
  aroma: string;                 // 香気特徴
  note: string;                  // メモ
  status: "active" | "discarded";
};
