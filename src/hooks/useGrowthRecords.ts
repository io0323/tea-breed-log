import { useState, useEffect, useCallback, useMemo } from 'react';
import { GrowthRecord } from '../types/growthRecord';

const STORAGE_KEY = 'teaGrowthRecords';

export const useGrowthRecords = (teaId?: string) => {
  const [records, setRecords] = useState<GrowthRecord[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  // localStorageへの保存を最適化（debounce）
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [records]);

  // 特定の品種の記録のみをフィルタリング（メモ化）
  const teaRecords = useMemo(() => {
    return teaId ? records.filter(record => record.teaId === teaId) : records;
  }, [records, teaId]);

  // 日付でソート（新しい順）（メモ化）
  const sortedRecords = useMemo(() => {
    return [...teaRecords].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [teaRecords]);

  // 成長記録を追加
  const addRecord = useCallback((record: Omit<GrowthRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newRecord: GrowthRecord = {
      ...record,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setRecords(prev => [...prev, newRecord]);
    return newRecord;
  }, []);

  // 成長記録を更新
  const updateRecord = useCallback((id: string, updates: Partial<GrowthRecord>) => {
    setRecords(prev => prev.map(record => 
      record.id === id 
        ? { 
            ...record, 
            ...updates, 
            updatedAt: new Date().toISOString() 
          } 
        : record
    ));
  }, []);

  // 成長記録を削除
  const deleteRecord = useCallback((id: string) => {
    setRecords(prev => prev.filter(record => record.id !== id));
  }, []);

  // 特定の記録を取得
  const getRecord = useCallback((id: string) => {
    return records.find(record => record.id === id);
  }, [records]);

  // 統計情報を計算（メモ化）
  const statistics = useMemo(() => {
    const total = teaRecords.length;
    const avgHeight = total > 0 
      ? teaRecords.reduce((sum, record) => sum + (record.height || 0), 0) / total 
      : 0;
    const avgLeafCount = total > 0 
      ? teaRecords.reduce((sum, record) => sum + (record.leafCount || 0), 0) / total 
      : 0;
    
    return {
      total,
      avgHeight: avgHeight.toFixed(1),
      avgLeafCount: avgLeafCount.toFixed(1),
    };
  }, [teaRecords]);

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
    statistics,
    addRecord,
    updateRecord,
    deleteRecord,
    getRecord,
    getGrowthStats,
  };
};
