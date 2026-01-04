export interface GrowthRecord {
  id: string;
  teaId: string; // 関連する品種のID
  date: string; // 記録日 (ISO 8601形式: YYYY-MM-DD)
  height: number; // 草丈 (cm)
  leafCount: number; // 葉の枚数
  notes: string; // 観察メモ
  weather: 'sunny' | 'cloudy' | 'rainy' | 'snowy'; // 天気
  temperature: number; // 気温 (°C)
  imageUrl?: string; // 成長記録の画像URL（オプション）
  createdAt: string; // 作成日時
  updatedAt: string; // 更新日時
}

export interface GrowthRecordFormData extends Omit<GrowthRecord, 'id' | 'teaId' | 'createdAt' | 'updatedAt'> {
  // フォーム用の型（IDと日付関連を除外）
}
