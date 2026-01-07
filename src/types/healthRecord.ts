export type HealthStatus = 'healthy' | 'warning' | 'critical' | 'needs_attention';

export interface HealthIssue {
  id: string;
  teaId: string;
  date: string; // ISO 8601形式: YYYY-MM-DD
  type: 'disease' | 'pest' | 'nutrition' | 'environmental' | 'other';
  severity: 'low' | 'medium' | 'high';
  description: string;
  status: 'open' | 'in_progress' | 'resolved';
  solution?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HealthStats {
  totalIssues: number;
  openIssues: number;
  resolvedIssues: number;
  issueByType: {
    disease: number;
    pest: number;
    nutrition: number;
    environmental: number;
    other: number;
  };
  issueBySeverity: {
    low: number;
    medium: number;
    high: number;
  };
  recentIssues: HealthIssue[];
}

export interface HealthRecordFormData {
  date: string;
  type: string;
  severity: string;
  description: string;
  status: string;
  solution?: string;
  imageUrl?: string;
}
