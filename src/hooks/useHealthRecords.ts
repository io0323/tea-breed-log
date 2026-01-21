import { useState, useEffect, useCallback, useMemo } from 'react';
import { HealthIssue, HealthStats, HealthStatus } from '../types/healthRecord';

const STORAGE_KEY = 'teaHealthRecords';

export const useHealthRecords = (teaId?: string) => {
  const [records, setRecords] = useState<HealthIssue[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  // ローカルストレージに保存
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, [records]);

  // 健康状態の評価
  const getHealthStatus = useCallback((): HealthStatus => {
    const teaRecords = teaId 
      ? records.filter(record => record.teaId === teaId && record.status !== 'resolved')
      : records.filter(record => record.status !== 'resolved');

    if (teaRecords.some(r => r.severity === 'high')) return 'critical';
    if (teaRecords.some(r => r.severity === 'medium')) return 'warning';
    if (teaRecords.length > 0) return 'needs_attention';
    return 'healthy';
  }, [records, teaId]);

  // 統計情報の計算
  const getHealthStats = useCallback((): HealthStats => {
    const teaRecords = teaId 
      ? records.filter(record => record.teaId === teaId)
      : records;

    const openIssues = teaRecords.filter(record => record.status !== 'resolved');
    const resolvedIssues = teaRecords.length - openIssues.length;

    const issueByType = teaRecords.reduce((acc, record) => {
      acc[record.type] = (acc[record.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const issueBySeverity = teaRecords.reduce((acc, record) => {
      acc[record.severity] = (acc[record.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recentIssues = [...teaRecords]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

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
