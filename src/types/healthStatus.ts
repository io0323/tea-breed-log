export type HealthStatus = 'healthy' | 'warning' | 'critical' | 'needs_attention';

export interface HealthIssue {
  id: string;
  teaId: string;
  date: string;
  type: 'disease' | 'pest' | 'environmental' | 'other';
  severity: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'resolved' | 'recurred';
  description: string;
  symptoms: string[];
  cause?: string;
  treatment?: string;
  notes?: string;
  imageUrls?: string[];
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HealthIssueFormData extends Omit<HealthIssue, 'id' | 'teaId' | 'createdAt' | 'updatedAt' | 'resolvedAt'> {}

export interface HealthStats {
  totalIssues: number;
  openIssues: number;
  resolvedIssues: number;
  issueByType: {
    disease: number;
    pest: number;
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
