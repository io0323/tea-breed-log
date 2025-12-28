import { useState, useEffect } from 'react';
import { GrowthRecord } from '../types/growthRecord';

const STORAGE_KEY = 'teaGrowthRecords';

export const useGrowthRecords = (teaId?: string) => {
  const [records, setRecords] = useState<GrowthRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  // 特定の品種の記録のみをフィルタリング
  const teaRecords = teaId 
    ? records.filter(record => record.teaId === teaId)
    : records;

  // 日付でソート（新しい順）
  const sortedRecords = [...teaRecords].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // ローカルストレージに保存
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, [records]);

  // 成長記録を追加
  const addRecord = (record: Omit<GrowthRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newRecord: GrowthRecord = {
      ...record,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setRecords([...records, newRecord]);
    return newRecord;
  };

  // 成長記録を更新
  const updateRecord = (id: string, updates: Partial<GrowthRecord>) => {
    const updatedRecords = records.map(record => 
      record.id === id 
        ? { 
            ...record, 
            ...updates, 
            updatedAt: new Date().toISOString() 
          } 
        : record
    );
    setRecords(updatedRecords);
  };

  // 成長記録を削除
  const deleteRecord = (id: string) => {
    setRecords(records.filter(record => record.id !== id));
  };

  // 特定の記録を取得
  const getRecordById = (id: string) => {
    return records.find(record => record.id === id);
  };

  // 成長記録の統計を計算
  const getGrowthStats = () => {
    if (sortedRecords.length === 0) return null;

    const heights = sortedRecords.map(r => r.height);
    const leafCounts = sortedRecords.map(r => r.leafCount);
    
    return {
      initialHeight: heights[heights.length - 1], // 最も古い記録
      currentHeight: heights[0], // 最新の記録
      heightDifference: heights[0] - (heights[1] || heights[0]), // 前回からの変化
      totalGrowth: heights[0] - heights[heights.length - 1], // 合計の成長
      averageGrowthPerDay: (heights[0] - heights[heights.length - 1]) / 
        ((new Date(sortedRecords[0].date).getTime() - new Date(sortedRecords[sortedRecords.length - 1].date).getTime()) / (1000 * 60 * 60 * 24) || 1),
      leafCount: leafCounts[0],
      recordCount: sortedRecords.length,
      firstRecordDate: sortedRecords[sortedRecords.length - 1]?.date,
      lastRecordDate: sortedRecords[0]?.date,
    };
  };

  return {
    records: sortedRecords,
    addRecord,
    updateRecord,
    deleteRecord,
    getRecordById,
    getGrowthStats,
  };
};
