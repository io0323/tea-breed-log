import { useState, useEffect, useCallback } from "react";
import { HealthIssue, HealthStats, HealthStatus } from "../types/healthStatus";

const STORAGE_KEY = "teaHealthIssues";

export const useHealthIssues = (teaId?: string) => {
  const [issues, setIssues] = useState<HealthIssue[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(issues));
  }, [issues]);

  const addHealthIssue = useCallback((issue: Omit<HealthIssue, "id" | "createdAt" | "updatedAt">) => {
    const newIssue: HealthIssue = {
      ...issue,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setIssues(prev => [...prev, newIssue]);
    return newIssue;
  }, []);

  const updateHealthIssue = useCallback((id: string, updates: Partial<HealthIssue>) => {
    setIssues(prev =>
      prev.map(issue =>
        issue.id === id
          ? { ...issue, ...updates, updatedAt: new Date().toISOString() }
          : issue
      )
    );
  }, []);

  const deleteHealthIssue = useCallback((id: string) => {
    setIssues(prev => prev.filter(issue => issue.id !== id));
  }, []);

  const getHealthIssue = useCallback((id: string) => {
    return issues.find(issue => issue.id === id);
  }, [issues]);

  const getHealthStatus = useCallback((): HealthStatus => {
    const teaIssues = teaId ? issues.filter(issue => issue.teaId === teaId) : issues;
    const hasCritical = teaIssues.some(issue => 
      issue.status !== "resolved" && issue.severity === "high"
    );
    const hasWarning = teaIssues.some(issue => 
      issue.status !== "resolved" && issue.severity === "medium"
    );
    const hasIssues = teaIssues.length > 0;

    if (hasCritical) return "critical";
    if (hasWarning) return "warning";
    if (hasIssues) return "needs_attention";
    return "healthy";
  }, [issues, teaId]);

  const getHealthStats = useCallback((): HealthStats => {
    const teaIssues = teaId ? issues.filter(issue => issue.teaId === teaId) : issues;
    const openIssues = teaIssues.filter(issue => issue.status !== "resolved");
    
    const issueByType = teaIssues.reduce(
      (acc, issue) => {
        acc[issue.type] = (acc[issue.type] || 0) + 1;
        return acc;
      },
      { disease: 0, pest: 0, environmental: 0, other: 0 } as Record<string, number>
    );

    const issueBySeverity = teaIssues.reduce(
      (acc, issue) => {
        acc[issue.severity] = (acc[issue.severity] || 0) + 1;
        return acc;
      },
      { low: 0, medium: 0, high: 0 } as Record<string, number>
    );

    const recentIssues = [...teaIssues]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    return {
      totalIssues: teaIssues.length,
      openIssues: openIssues.length,
      resolvedIssues: teaIssues.length - openIssues.length,
      issueByType: {
        disease: issueByType.disease,
        pest: issueByType.pest,
        environmental: issueByType.environmental,
        other: issueByType.other,
      },
      issueBySeverity: {
        low: issueBySeverity.low,
        medium: issueBySeverity.medium,
        high: issueBySeverity.high,
      },
      recentIssues,
    };
  }, [issues, teaId]);

  const getIssuesByTeaId = useCallback(() => {
    if (!teaId) return [];
    return issues.filter(issue => issue.teaId === teaId);
  }, [issues, teaId]);

  return {
    issues: teaId ? getIssuesByTeaId() : issues,
    healthStatus: getHealthStatus(),
    healthStats: getHealthStats(),
    addHealthIssue,
    updateHealthIssue,
    deleteHealthIssue,
    getHealthIssue,
    getHealthStatus,
    getHealthStats,
  };
};
