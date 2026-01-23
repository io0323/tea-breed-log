import { useState, useEffect, useCallback, useMemo } from 'react';
import { HealthIssue, HealthStats, HealthStatus } from '../types/healthRecord';

const STORAGE_KEY = 'teaHealthRecords';

export const useHealthRecords = (teaId?: string) => {
  const [records, setRecords] = useState<HealthIssue[]>(() => {
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
    return teaId 
      ? records.filter(record => record.teaId === teaId && record.status !== 'resolved')
      : records.filter(record => record.status !== 'resolved');
  }, [records, teaId]);

  // 健康状態の評価
  const getHealthStatus = useCallback((): HealthStatus => {
    if (teaRecords.some(r => r.severity === 'high')) return 'critical';
    if (teaRecords.some(r => r.severity === 'medium')) return 'warning';
    if (teaRecords.length > 0) return 'needs_attention';
    return 'healthy';
  }, [teaRecords]);

  // 統計情報の計算（メモ化）
  const getHealthStats = useCallback((): HealthStats => {
    const allTeaRecords = teaId 
      ? records.filter(record => record.teaId === teaId)
      : records;

    const openIssues = allTeaRecords.filter(record => record.status !== 'resolved');
    const resolvedIssues = allTeaRecords.length - openIssues.length;

    const issueByType = allTeaRecords.reduce((acc, record) => {
      acc[record.type] = (acc[record.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const issueBySeverity = allTeaRecords.reduce((acc, record) => {
      acc[record.severity] = (acc[record.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recentIssues = [...allTeaRecords]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    return {
      totalIssues: allTeaRecords.length,
      openIssues: openIssues.length,
      resolvedIssues,
      issueByType: {
        disease: issueByType.disease || 0,
        pest: issueByType.pest || 0,
        nutrition: issueByType.nutrition || 0,
        environmental: issueByType.environmental || 0,
        other: issueByType.other || 0,
      },
      issueBySeverity: {
        low: issueBySeverity.low || 0,
        medium: issueBySeverity.medium || 0,
        high: issueBySeverity.high || 0,
      },
      recentIssues,
    };
  }, [records, teaId]);

    return {
      totalIssues: teaRecords.length,
      openIssues: openIssues.length,
      resolvedIssues,
      issueByType: {
        disease: issueByType.disease || 0,
        pest: issueByType.pest || 0,
        nutrition: issueByType.nutrition || 0,
        environmental: issueByType.environmental || 0,
        other: issueByType.other || 0,
      },
      issueBySeverity: {
        low: issueBySeverity.low || 0,
        medium: issueBySeverity.medium || 0,
        high: issueBySeverity.high || 0,
      },
      recentIssues,
    };
  }, [records, teaId]);

  // 記録の追加
  const addRecord = useCallback((record: Omit<HealthIssue, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newRecord: HealthIssue = {
      ...record,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setRecords(prev => [...prev, newRecord]);
    return newRecord;
  }, []);

  // 記録の更新
  const updateRecord = useCallback((id: string, updates: Partial<HealthIssue>) => {
    setRecords(prev => prev.map(record =>
      record.id === id 
        ? { ...record, ...updates, updatedAt: new Date().toISOString() }
        : record
    ));
  }, []);

  // 記録の削除
  const deleteRecord = useCallback((id: string) => {
    setRecords(prev => prev.filter(record => record.id !== id));
  }, []);

  // IDによる記録の取得
  const getRecord = useCallback((id: string) => {
    return records.find(record => record.id === id);
  }, [records]);

  // 品種IDによる記録のフィルタリング
  const getRecordsByTeaId = useCallback((id: string) => {
    return records
      .filter(record => record.teaId === id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [records]);

  const filteredRecords = useMemo(() => {
    return teaId ? getRecordsByTeaId(teaId) : records;
  }, [teaId, records, getRecordsByTeaId]);

  return {
    records: filteredRecords,
    healthStatus: getHealthStatus(),
    healthStats: getHealthStats(),
    addRecord,
    updateRecord,
    deleteRecord,
    getRecord,
    getRecordsByTeaId,
  };
};
