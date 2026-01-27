import type { Tea, GrowthRecord, HealthRecord } from '../types';

export interface SearchFilters {
  // 基本フィルター
  query?: string;
  categories?: string[];
  tags?: string[];
  
  // 日付範囲
  dateRange?: {
    start: string;
    end: string;
  };
  
  // 数値範囲
  heightRange?: {
    min: number;
    max: number;
  };
  
  // 成長ステージ
  growthStages?: string[];
  
  // 健康状態
  healthStatus?: 'healthy' | 'warning' | 'critical';
  severity?: 'low' | 'medium' | 'high';
  
  // 位置情報
  location?: {
    latitude: number;
    longitude: number;
    radius: number; // km
  };
  
  // カスタムフィルター
  customFilters?: CustomFilter[];
}

export interface CustomFilter {
  field: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan' | 'between';
  value: any;
  label: string;
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  facets: SearchFacets;
  suggestions?: string[];
}

export interface SearchFacets {
  categories: FacetCount[];
  tags: FacetCount[];
  growthStages: FacetCount[];
  healthStatus: FacetCount[];
  dateRanges: FacetCount[];
}

export interface FacetCount {
  value: string;
  count: number;
  selected: boolean;
}

export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
  label: string;
}

class AdvancedSearchService {
  private readonly DEFAULT_PAGE_SIZE = 20;
  private readonly MAX_RESULTS = 1000;

  // お茶の検索
  async searchTeas(
    teas: Tea[],
    filters: SearchFilters,
    page: number = 1,
    pageSize: number = this.DEFAULT_PAGE_SIZE,
    sort?: SortOption
  ): Promise<SearchResult<Tea>> {
    let filteredTeas = [...teas];

    // テキスト検索
    if (filters.query) {
      filteredTeas = this.textSearch(filteredTeas, filters.query);
    }

    // カテゴリーフィルター
    if (filters.categories && filters.categories.length > 0) {
      filteredTeas = filteredTeas.filter(tea => 
        filters.categories!.includes(tea.category)
      );
    }

    // タグフィルター
    if (filters.tags && filters.tags.length > 0) {
      filteredTeas = filteredTeas.filter(tea => 
        tea.tags && tea.tags.some(tag => filters.tags!.includes(tag))
      );
    }

    // 高さ範囲フィルター
    if (filters.heightRange) {
      filteredTeas = filteredTeas.filter(tea => {
        const height = tea.height || 0;
        return height >= filters.heightRange!.min && height <= filters.heightRange!.max;
      });
    }

    // 成長ステージフィルター
    if (filters.growthStages && filters.growthStages.length > 0) {
      filteredTeas = filteredTeas.filter(tea => 
        tea.growthStage && filters.growthStages!.includes(tea.growthStage)
      );
    }

    // カスタムフィルター
    if (filters.customFilters) {
      filteredTeas = this.applyCustomFilters(filteredTeas, filters.customFilters);
    }

    // ソート
    if (sort) {
      filteredTeas = this.sortItems(filteredTeas, sort);
    }

    // ページネーション
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedItems = filteredTeas.slice(startIndex, endIndex);

    // ファセットの生成
    const facets = this.generateTeaFacets(teas, filters);

    // サジェスチョンの生成
    const suggestions = this.generateSuggestions(teas, filters.query);

    return {
      items: paginatedItems,
      total: filteredTeas.length,
      page,
      pageSize,
      facets,
      suggestions
    };
  }

  // 成長記録の検索
  async searchGrowthRecords(
    records: GrowthRecord[],
    filters: SearchFilters,
    page: number = 1,
    pageSize: number = this.DEFAULT_PAGE_SIZE,
    sort?: SortOption
  ): Promise<SearchResult<GrowthRecord>> {
    let filteredRecords = [...records];

    // テキスト検索
    if (filters.query) {
      filteredRecords = this.textSearch(filteredRecords, filters.query);
    }

    // 日付範囲フィルター
    if (filters.dateRange) {
      filteredRecords = filteredRecords.filter(record => {
        const recordDate = new Date(record.date);
        const startDate = new Date(filters.dateRange!.start);
        const endDate = new Date(filters.dateRange!.end);
        return recordDate >= startDate && recordDate <= endDate;
      });
    }

    // 成長ステージフィルター
    if (filters.growthStages && filters.growthStages.length > 0) {
      filteredRecords = filteredRecords.filter(record => 
        filters.growthStages!.includes(record.stage)
      );
    }

    // カスタムフィルター
    if (filters.customFilters) {
      filteredRecords = this.applyCustomFilters(filteredRecords, filters.customFilters);
    }

    // ソート
    if (sort) {
      filteredRecords = this.sortItems(filteredRecords, sort);
    }

    // ページネーション
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedItems = filteredRecords.slice(startIndex, endIndex);

    // ファセットの生成
    const facets = this.generateGrowthFacets(records, filters);

    return {
      items: paginatedItems,
      total: filteredRecords.length,
      page,
      pageSize,
      facets
    };
  }

  // 健康記録の検索
  async searchHealthRecords(
    records: HealthRecord[],
    filters: SearchFilters,
    page: number = 1,
    pageSize: number = this.DEFAULT_PAGE_SIZE,
    sort?: SortOption
  ): Promise<SearchResult<HealthRecord>> {
    let filteredRecords = [...records];

    // テキスト検索
    if (filters.query) {
      filteredRecords = this.textSearch(filteredRecords, filters.query);
    }

    // 日付範囲フィルター
    if (filters.dateRange) {
      filteredRecords = filteredRecords.filter(record => {
        const recordDate = new Date(record.date);
        const startDate = new Date(filters.dateRange!.start);
        const endDate = new Date(filters.dateRange!.end);
        return recordDate >= startDate && recordDate <= endDate;
      });
    }

    // 健康状態フィルター
    if (filters.healthStatus) {
      filteredRecords = filteredRecords.filter(record => 
        this.getHealthStatus(record.severity) === filters.healthStatus
      );
    }

    // 重大度フィルター
    if (filters.severity) {
      filteredRecords = filteredRecords.filter(record => 
        record.severity === filters.severity
      );
    }

    // カスタムフィルター
    if (filters.customFilters) {
      filteredRecords = this.applyCustomFilters(filteredRecords, filters.customFilters);
    }

    // ソート
    if (sort) {
      filteredRecords = this.sortItems(filteredRecords, sort);
    }

    // ページネーション
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedItems = filteredRecords.slice(startIndex, endIndex);

    // ファセットの生成
    const facets = this.generateHealthFacets(records, filters);

    return {
      items: paginatedItems,
      total: filteredRecords.length,
      page,
      pageSize,
      facets
    };
  }

  // テキスト検索
  private textSearch<T extends Record<string, any>>(items: T[], query: string): T[] {
    const searchTerms = query.toLowerCase().split(/\s+/);
    
    return items.filter(item => {
      return searchTerms.every(term => {
        return Object.values(item).some(value => {
          if (typeof value === 'string') {
            return value.toLowerCase().includes(term);
          }
          if (Array.isArray(value)) {
            return value.some(v => 
              typeof v === 'string' && v.toLowerCase().includes(term)
            );
          }
          return false;
        });
      });
    });
  }

  // カスタムフィルターの適用
  private applyCustomFilters<T extends Record<string, any>>(
    items: T[], 
    filters: CustomFilter[]
  ): T[] {
    return items.filter(item => {
      return filters.every(filter => {
        const value = item[filter.field];
        return this.applyFilterOperator(value, filter.operator, filter.value);
      });
    });
  }

  // フィルター演算子の適用
  private applyFilterOperator(
    fieldValue: any, 
    operator: CustomFilter['operator'], 
    filterValue: any
  ): boolean {
    switch (operator) {
      case 'equals':
        return fieldValue === filterValue;
      case 'contains':
        return typeof fieldValue === 'string' && 
               fieldValue.toLowerCase().includes(filterValue.toLowerCase());
      case 'startsWith':
        return typeof fieldValue === 'string' && 
               fieldValue.toLowerCase().startsWith(filterValue.toLowerCase());
      case 'endsWith':
        return typeof fieldValue === 'string' && 
               fieldValue.toLowerCase().endsWith(filterValue.toLowerCase());
      case 'greaterThan':
        return Number(fieldValue) > Number(filterValue);
      case 'lessThan':
        return Number(fieldValue) < Number(filterValue);
      case 'between':
        if (Array.isArray(filterValue) && filterValue.length === 2) {
          const num = Number(fieldValue);
          return num >= filterValue[0] && num <= filterValue[1];
        }
        return false;
      default:
        return false;
    }
  }

  // ソート
  private sortItems<T extends Record<string, any>>(
    items: T[], 
    sort: SortOption
  ): T[] {
    return [...items].sort((a, b) => {
      const aValue = a[sort.field];
      const bValue = b[sort.field];
      
      if (aValue === undefined || aValue === null) return 1;
      if (bValue === undefined || bValue === null) return -1;
      
      let comparison = 0;
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else if (aValue instanceof Date && bValue instanceof Date) {
        comparison = aValue.getTime() - bValue.getTime();
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }
      
      return sort.direction === 'desc' ? -comparison : comparison;
    });
  }

  // お茶ファセットの生成
  private generateTeaFacets(teas: Tea[], filters: SearchFilters): SearchFacets {
    const categories = this.generateFacetCounts(
      teas.map(tea => tea.category),
      filters.categories || []
    );

    const tags = this.generateFacetCounts(
      teas.flatMap(tea => tea.tags || []),
      filters.tags || []
    );

    const growthStages = this.generateFacetCounts(
      teas.map(tea => tea.growthStage).filter(Boolean) as string[],
      filters.growthStages || []
    );

    return {
      categories,
      tags,
      growthStages,
      healthStatus: [],
      dateRanges: []
    };
  }

  // 成長記録ファセットの生成
  private generateGrowthFacets(records: GrowthRecord[], filters: SearchFilters): SearchFacets {
    const growthStages = this.generateFacetCounts(
      records.map(record => record.stage),
      filters.growthStages || []
    );

    const dateRanges = this.generateDateRangeFacets(records, filters.dateRange);

    return {
      categories: [],
      tags: [],
      growthStages,
      healthStatus: [],
      dateRanges
    };
  }

  // 健康記録ファセットの生成
  private generateHealthFacets(records: HealthRecord[], filters: SearchFilters): SearchFacets {
    const healthStatus = this.generateFacetCounts(
      records.map(record => this.getHealthStatus(record.severity)),
      filters.healthStatus ? [filters.healthStatus] : []
    );

    const severity = this.generateFacetCounts(
      records.map(record => record.severity),
      filters.severity ? [filters.severity] : []
    );

    const dateRanges = this.generateDateRangeFacets(records, filters.dateRange);

    return {
      categories: [],
      tags: [],
      growthStages: [],
      healthStatus,
      dateRanges
    };
  }

  // ファセットカウントの生成
  private generateFacetCounts(values: string[], selected: string[]): FacetCount[] {
    const counts = values.reduce((acc, value) => {
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts)
      .map(([value, count]) => ({
        value,
        count,
        selected: selected.includes(value)
      }))
      .sort((a, b) => b.count - a.count);
  }

  // 日付範囲ファセットの生成
  private generateDateRangeFacets(
    records: { date: string }[], 
    selectedRange?: { start: string; end: string }
  ): FacetCount[] {
    const ranges = [
      { label: '過去7日間', start: -7, end: 0 },
      { label: '過去30日間', start: -30, end: 0 },
      { label: '過去3ヶ月', start: -90, end: 0 },
      { label: '過去1年', start: -365, end: 0 }
    ];

    const now = new Date();
    
    return ranges.map(range => {
      const startDate = new Date(now.getTime() + range.start * 24 * 60 * 60 * 1000);
      const endDate = new Date(now.getTime() + range.end * 24 * 60 * 60 * 1000);
      
      const count = records.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= startDate && recordDate <= endDate;
      }).length;

      const selected = selectedRange ? 
        new Date(selectedRange.start).getTime() === startDate.getTime() &&
        new Date(selectedRange.end).getTime() === endDate.getTime() : false;

      return {
        value: range.label,
        count,
        selected
      };
    });
  }

  // 健康状態の判定
  private getHealthStatus(severity: string): 'healthy' | 'warning' | 'critical' {
    switch (severity) {
      case 'low':
        return 'healthy';
      case 'medium':
        return 'warning';
      case 'high':
        return 'critical';
      default:
        return 'healthy';
    }
  }

  // サジェスチョンの生成
  private generateSuggestions(teas: Tea[], query?: string): string[] {
    if (!query || query.length < 2) return [];

    const suggestions = new Set<string>();
    
    teas.forEach(tea => {
      // 名前からのサジェスチョン
      if (tea.name.toLowerCase().includes(query.toLowerCase())) {
        suggestions.add(tea.name);
      }
      
      // カテゴリーからのサジェスチョン
      if (tea.category.toLowerCase().includes(query.toLowerCase())) {
        suggestions.add(tea.category);
      }
      
      // タグからのサジェスチョン
      tea.tags?.forEach(tag => {
        if (tag.toLowerCase().includes(query.toLowerCase())) {
          suggestions.add(tag);
        }
      });
    });

    return Array.from(suggestions).slice(0, 10);
  }

  // 保存された検索の管理
  async saveSearch(name: string, filters: SearchFilters): Promise<void> {
    try {
      const savedSearches = this.getSavedSearches();
      savedSearches.push({
        id: Date.now().toString(),
        name,
        filters,
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('saved_searches', JSON.stringify(savedSearches));
    } catch (error) {
      console.error('Failed to save search:', error);
    }
  }

  getSavedSearches(): Array<{ id: string; name: string; filters: SearchFilters; createdAt: string }> {
    try {
      const saved = localStorage.getItem('saved_searches');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to load saved searches:', error);
      return [];
    }
  }

  async deleteSearch(id: string): Promise<void> {
    try {
      const savedSearches = this.getSavedSearches();
      const filtered = savedSearches.filter(search => search.id !== id);
      localStorage.setItem('saved_searches', JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to delete search:', error);
    }
  }

  // 検索履歴の管理
  addToSearchHistory(query: string): void {
    try {
      const history = this.getSearchHistory();
      const filtered = history.filter(item => item !== query);
      filtered.unshift(query);
      const limited = filtered.slice(0, 20);
      localStorage.setItem('search_history', JSON.stringify(limited));
    } catch (error) {
      console.error('Failed to add to search history:', error);
    }
  }

  getSearchHistory(): string[] {
    try {
      const history = localStorage.getItem('search_history');
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Failed to load search history:', error);
      return [];
    }
  }

  clearSearchHistory(): void {
    try {
      localStorage.removeItem('search_history');
    } catch (error) {
      console.error('Failed to clear search history:', error);
    }
  }
}

export const advancedSearchService = new AdvancedSearchService();
