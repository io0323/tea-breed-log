import { useState, useEffect, useCallback, useMemo } from 'react';
import { TeaVariety } from '../types/teaVariety';
import { GrowthRecord } from '../types/growthRecord';
import { HealthIssue } from '../types/healthStatus';

interface SearchFilters {
  query: string;
  category: 'all' | 'teas' | 'growth' | 'health';
  status?: string;
  location?: string;
  generation?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  severity?: string;
  sortBy: 'relevance' | 'date' | 'name' | 'growthScore' | 'germinationRate';
  sortOrder: 'asc' | 'desc';
}

interface SearchResult {
  id: string;
  type: 'tea' | 'growth' | 'health';
  title: string;
  description: string;
  data: TeaVariety | GrowthRecord | HealthIssue;
  relevanceScore: number;
  highlights: {
    field: string;
    value: string;
    highlightedValue: string;
  }[];
}

export const useAdvancedSearch = (
  teas: TeaVariety[],
  growthRecords: GrowthRecord[],
  healthIssues: HealthIssue[]
) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: 'all',
    sortBy: 'relevance',
    sortOrder: 'desc',
  });

  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // 検索クエリを更新（メモ化）
  const updateQuery = useCallback((query: string) => {
    setFilters(prev => ({ ...prev, query }));
    
    // 検索履歴に追加
    if (query.trim() && !searchHistory.includes(query.trim())) {
      setSearchHistory(prev => [query.trim(), ...prev.slice(0, 9)]);
    }
  }, [searchHistory]);

  // フィルターを更新（メモ化）
  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // テキストのハイライト（メモ化）
  const highlightText = useCallback((text: string, query: string): string => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }, []);

  // 関連性スコアの計算（メモ化）
  const calculateRelevanceScore = useCallback((
    item: TeaVariety | GrowthRecord | HealthIssue,
    query: string
  ): number => {
    if (!query.trim()) return 0;

    const queryLower = query.toLowerCase();
    let score = 0;

    // 品種の場合
    if ('name' in item) {
      const tea = item as TeaVariety;
      
      // 名前の完全一致
      if (tea.name.toLowerCase() === queryLower) score += 100;
      // 名前の部分一致
      else if (tea.name.toLowerCase().includes(queryLower)) score += 50;
      
      // 場所の一致
      if (tea.location.toLowerCase().includes(queryLower)) score += 30;
      
      // 香りの一致
      if (tea.aroma.toLowerCase().includes(queryLower)) score += 20;
      
      // 備考の一致
      if (tea.note.toLowerCase().includes(queryLower)) score += 10;
      
      // 世代の一致
      if (tea.generation.toLowerCase().includes(queryLower)) score += 15;
    }
    
    // 成長記録の場合
    else if ('date' in item && 'height' in item) {
      const record = item as GrowthRecord;
      
      // メモの一致
      if (record.notes?.toLowerCase().includes(queryLower)) score += 40;
      
      // 天気の一致
      if (record.weather?.toLowerCase().includes(queryLower)) score += 20;
      
      // 日付の一致
      if (record.date.includes(query)) score += 15;
    }
    
    // 健康問題の場合
    else if ('type' in item && 'severity' in item) {
      const issue = item as HealthIssue;
      
      // 説明の一致
      if (issue.description.toLowerCase().includes(queryLower)) score += 40;
      
      // 症状の一致
      if (issue.symptoms?.some(symptom => symptom.toLowerCase().includes(queryLower))) {
        score += 30;
      }
      
      // 原因の一致
      if (issue.cause?.toLowerCase().includes(queryLower)) score += 25;
      
      // 治療法の一致
      if (issue.treatment?.toLowerCase().includes(queryLower)) score += 20;
    }

    return score;
  }, []);

  // 検索実行（メモ化）
  const searchResults = useMemo((): SearchResult[] => {
    setIsSearching(true);
    
    const results: SearchResult[] = [];
    const query = filters.query.trim().toLowerCase();

    // 品種の検索
    if (filters.category === 'all' || filters.category === 'teas') {
      const filteredTeas = teas.filter(tea => {
        // ステータスフィルター
        if (filters.status && tea.status !== filters.status) return false;
        
        // 場所フィルター
        if (filters.location && !tea.location.includes(filters.location)) return false;
        
        // 世代フィルター
        if (filters.generation && tea.generation !== filters.generation) return false;
        
        // テキスト検索
        if (query) {
          const searchText = `${tea.name} ${tea.location} ${tea.aroma} ${tea.note} ${tea.generation}`.toLowerCase();
          return searchText.includes(query);
        }
        
        return true;
      });

      filteredTeas.forEach(tea => {
        const relevanceScore = calculateRelevanceScore(tea, filters.query);
        const highlights: SearchResult['highlights'] = [];

        if (query) {
          if (tea.name.toLowerCase().includes(query)) {
            highlights.push({
              field: 'name',
              value: tea.name,
              highlightedValue: highlightText(tea.name, filters.query),
            });
          }
          
          if (tea.location.toLowerCase().includes(query)) {
            highlights.push({
              field: 'location',
              value: tea.location,
              highlightedValue: highlightText(tea.location, filters.query),
            });
          }
        }

        results.push({
          id: `tea-${tea.id}`,
          type: 'tea',
          title: tea.name,
          description: `${tea.location} - 第${tea.generation}世代`,
          data: tea,
          relevanceScore,
          highlights,
        });
      });
    }

    // 成長記録の検索
    if (filters.category === 'all' || filters.category === 'growth') {
      const filteredRecords = growthRecords.filter(record => {
        // 日付範囲フィルター
        if (filters.dateRange) {
          const recordDate = new Date(record.date);
          const startDate = new Date(filters.dateRange.start);
          const endDate = new Date(filters.dateRange.end);
          
          if (recordDate < startDate || recordDate > endDate) return false;
        }
        
        // テキスト検索
        if (query) {
          const searchText = `${record.notes || ''} ${record.weather || ''} ${record.date}`.toLowerCase();
          return searchText.includes(query);
        }
        
        return true;
      });

      filteredRecords.forEach(record => {
        const relevanceScore = calculateRelevanceScore(record, filters.query);
        const tea = teas.find(t => t.id === record.teaId);
        const highlights: SearchResult['highlights'] = [];

        if (query && record.notes?.toLowerCase().includes(query)) {
          highlights.push({
            field: 'notes',
            value: record.notes,
            highlightedValue: highlightText(record.notes, filters.query),
          });
        }

        results.push({
          id: `growth-${record.id}`,
          type: 'growth',
          title: `${tea?.name || '不明'} - ${record.date}`,
          description: record.notes || '成長記録',
          data: record,
          relevanceScore,
          highlights,
        });
      });
    }

    // 健康問題の検索
    if (filters.category === 'all' || filters.category === 'health') {
      const filteredIssues = healthIssues.filter(issue => {
        // 重大度フィルター
        if (filters.severity && issue.severity !== filters.severity) return false;
        
        // ステータスフィルター
        if (filters.status && issue.status !== filters.status) return false;
        
        // 日付範囲フィルター
        if (filters.dateRange) {
          const issueDate = new Date(issue.date);
          const startDate = new Date(filters.dateRange.start);
          const endDate = new Date(filters.dateRange.end);
          
          if (issueDate < startDate || issueDate > endDate) return false;
        }
        
        // テキスト検索
        if (query) {
          const searchText = `${issue.description} ${issue.symptoms.join(' ')} ${issue.cause || ''} ${issue.treatment || ''}`.toLowerCase();
          return searchText.includes(query);
        }
        
        return true;
      });

      filteredIssues.forEach(issue => {
        const relevanceScore = calculateRelevanceScore(issue, filters.query);
        const tea = teas.find(t => t.id === issue.teaId);
        const highlights: SearchResult['highlights'] = [];

        if (query) {
          if (issue.description.toLowerCase().includes(query)) {
            highlights.push({
              field: 'description',
              value: issue.description,
              highlightedValue: highlightText(issue.description, filters.query),
            });
          }
          
          issue.symptoms.forEach(symptom => {
            if (symptom.toLowerCase().includes(query)) {
              highlights.push({
                field: 'symptoms',
                value: symptom,
                highlightedValue: highlightText(symptom, filters.query),
              });
            }
          });
        }

        results.push({
          id: `health-${issue.id}`,
          type: 'health',
          title: `${tea?.name || '不明'} - ${issue.type}`,
          description: issue.description,
          data: issue,
          relevanceScore,
          highlights,
        });
      });
    }

    // ソート
    results.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'relevance':
          comparison = b.relevanceScore - a.relevanceScore;
          break;
        case 'date':
          const getDate = (result: SearchResult) => {
            if (result.type === 'tea') return (result.data as TeaVariety).year;
            if (result.type === 'growth') return new Date((result.data as GrowthRecord).date).getTime();
            if (result.type === 'health') return new Date((result.data as HealthIssue).date).getTime();
            return 0;
          };
          comparison = getDate(b) - getDate(a);
          break;
        case 'name':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'growthScore':
          const getGrowthScore = (result: SearchResult) => {
            if (result.type === 'tea') return (result.data as TeaVariety).growthScore;
            return 0;
          };
          comparison = getGrowthScore(b) - getGrowthScore(a);
          break;
        case 'germinationRate':
          const getGerminationRate = (result: SearchResult) => {
            if (result.type === 'tea') return (result.data as TeaVariety).germinationRate;
            return 0;
          };
          comparison = getGerminationRate(b) - getGerminationRate(a);
          break;
      }
      
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    setIsSearching(false);
    return results;
  }, [teas, growthRecords, healthIssues, filters, calculateRelevanceScore, highlightText]);

  // 検索統計（メモ化）
  const searchStats = useMemo(() => {
    const totalResults = searchResults.length;
    const resultsByType = searchResults.reduce((acc, result) => {
      acc[result.type] = (acc[result.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalResults,
      resultsByType,
      isSearching,
    };
  }, [searchResults, isSearching]);

  // 検索をクリア（メモ化）
  const clearSearch = useCallback(() => {
    setFilters({
      query: '',
      category: 'all',
      sortBy: 'relevance',
      sortOrder: 'desc',
    });
  }, []);

  // 検索履歴をクリア（メモ化）
  const clearSearchHistory = useCallback(() => {
    setSearchHistory([]);
  }, []);

  return {
    filters,
    searchResults,
    searchStats,
    searchHistory,
    isSearching,
    updateQuery,
    updateFilters,
    clearSearch,
    clearSearchHistory,
    highlightText,
  };
};
