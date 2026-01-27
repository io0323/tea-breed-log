import type { Tea, GrowthRecord, HealthRecord } from '../types';

export interface ExportOptions {
  format: 'json' | 'csv' | 'excel' | 'pdf';
  includeImages: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  categories?: string[];
  fields?: string[];
}

export interface ExportResult {
  success: boolean;
  filename: string;
  size: number;
  url?: string;
  error?: string;
}

class DataExporter {
  // JSONエクスポート
  async exportToJSON(
    teas: Tea[],
    growthRecords: GrowthRecord[],
    healthRecords: HealthRecord[],
    options: ExportOptions
  ): Promise<ExportResult> {
    try {
      const exportData = this.prepareExportData(teas, growthRecords, healthRecords, options);
      
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      
      const filename = this.generateFilename('json', options);
      const url = URL.createObjectURL(blob);
      
      // 自動ダウンロード
      this.downloadFile(url, filename);
      
      return {
        success: true,
        filename,
        size: blob.size,
        url
      };
    } catch (error) {
      return {
        success: false,
        filename: '',
        size: 0,
        error: error instanceof Error ? error.message : 'JSONエクスポートに失敗しました'
      };
    }
  }

  // CSVエクスポート
  async exportToCSV(
    teas: Tea[],
    growthRecords: GrowthRecord[],
    healthRecords: HealthRecord[],
    options: ExportOptions
  ): Promise<ExportResult> {
    try {
      const csvData = this.convertToCSV(teas, growthRecords, healthRecords, options);
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      
      const filename = this.generateFilename('csv', options);
      const url = URL.createObjectURL(blob);
      
      this.downloadFile(url, filename);
      
      return {
        success: true,
        filename,
        size: blob.size,
        url
      };
    } catch (error) {
      return {
        success: false,
        filename: '',
        size: 0,
        error: error instanceof Error ? error.message : 'CSVエクスポートに失敗しました'
      };
    }
  }

  // Excelエクスポート
  async exportToExcel(
    teas: Tea[],
    growthRecords: GrowthRecord[],
    healthRecords: HealthRecord[],
    options: ExportOptions
  ): Promise<ExportResult> {
    try {
      // Excelライブラリを使用（例：SheetJS）
      const workbook = this.createExcelWorkbook(teas, growthRecords, healthRecords, options);
      
      // 実際の実装ではxlsxライブラリなどを使用
      const excelBuffer = await this.convertWorkbookToBuffer(workbook);
      const blob = new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      const filename = this.generateFilename('xlsx', options);
      const url = URL.createObjectURL(blob);
      
      this.downloadFile(url, filename);
      
      return {
        success: true,
        filename,
        size: blob.size,
        url
      };
    } catch (error) {
      return {
        success: false,
        filename: '',
        size: 0,
        error: error instanceof Error ? error.message : 'Excelエクスポートに失敗しました'
      };
    }
  }

  // PDFエクスポート
  async exportToPDF(
    teas: Tea[],
    growthRecords: GrowthRecord[],
    healthRecords: HealthRecord[],
    options: ExportOptions
  ): Promise<ExportResult> {
    try {
      const pdfContent = await this.generatePDFContent(teas, growthRecords, healthRecords, options);
      const blob = new Blob([pdfContent], { type: 'application/pdf' });
      
      const filename = this.generateFilename('pdf', options);
      const url = URL.createObjectURL(blob);
      
      this.downloadFile(url, filename);
      
      return {
        success: true,
        filename,
        size: blob.size,
        url
      };
    } catch (error) {
      return {
        success: false,
        filename: '',
        size: 0,
        error: error instanceof Error ? error.message : 'PDFエクスポートに失敗しました'
      };
    }
  }

  // データ準備
  private prepareExportData(
    teas: Tea[],
    growthRecords: GrowthRecord[],
    healthRecords: HealthRecord[],
    options: ExportOptions
  ) {
    let filteredTeas = teas;
    let filteredGrowthRecords = growthRecords;
    let filteredHealthRecords = healthRecords;

    // 日付範囲フィルター
    if (options.dateRange) {
      const startDate = new Date(options.dateRange.start);
      const endDate = new Date(options.dateRange.end);
      
      filteredGrowthRecords = growthRecords.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= startDate && recordDate <= endDate;
      });
      
      filteredHealthRecords = healthRecords.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= startDate && recordDate <= endDate;
      });
    }

    // カテゴリーフィルター
    if (options.categories && options.categories.length > 0) {
      filteredTeas = teas.filter(tea => 
        options.categories!.includes(tea.category)
      );
    }

    return {
      metadata: {
        exportDate: new Date().toISOString(),
        format: options.format,
        totalTeas: filteredTeas.length,
        totalGrowthRecords: filteredGrowthRecords.length,
        totalHealthRecords: filteredHealthRecords.length,
        dateRange: options.dateRange,
        categories: options.categories
      },
      teas: this.filterFields(filteredTeas, options.fields),
      growthRecords: this.filterFields(filteredGrowthRecords, options.fields),
      healthRecords: this.filterFields(filteredHealthRecords, options.fields)
    };
  }

  // フィールドフィルター
  private filterFields<T>(data: T[], fields?: string[]): T[] {
    if (!fields || fields.length === 0) return data;
    
    return data.map(item => {
      const filtered: any = {};
      fields.forEach(field => {
        if (field in item) {
          filtered[field] = (item as any)[field];
        }
      });
      return filtered;
    });
  }

  // CSV変換
  private convertToCSV(
    teas: Tea[],
    growthRecords: GrowthRecord[],
    healthRecords: HealthRecord[],
    options: ExportOptions
  ): string {
    const csvRows: string[] = [];
    
    // メタデータ
    csvRows.push('# TeaBreed Log Export');
    csvRows.push(`# Export Date: ${new Date().toISOString()}`);
    csvRows.push(`# Format: ${options.format}`);
    csvRows.push('');
    
    // お茶データ
    if (teas.length > 0) {
      csvRows.push('# Teas');
      const teaHeaders = Object.keys(teas[0]);
      csvRows.push(teaHeaders.join(','));
      
      teas.forEach(tea => {
        const values = teaHeaders.map(header => {
          const value = (tea as any)[header];
          return typeof value === 'string' ? `"${value}"` : value;
        });
        csvRows.push(values.join(','));
      });
      csvRows.push('');
    }
    
    // 成長記録
    if (growthRecords.length > 0) {
      csvRows.push('# Growth Records');
      const growthHeaders = Object.keys(growthRecords[0]);
      csvRows.push(growthHeaders.join(','));
      
      growthRecords.forEach(record => {
        const values = growthHeaders.map(header => {
          const value = (record as any)[header];
          return typeof value === 'string' ? `"${value}"` : value;
        });
        csvRows.push(values.join(','));
      });
      csvRows.push('');
    }
    
    // 健康記録
    if (healthRecords.length > 0) {
      csvRows.push('# Health Records');
      const healthHeaders = Object.keys(healthRecords[0]);
      csvRows.push(healthHeaders.join(','));
      
      healthRecords.forEach(record => {
        const values = healthHeaders.map(header => {
          const value = (record as any)[header];
          return typeof value === 'string' ? `"${value}"` : value;
        });
        csvRows.push(values.join(','));
      });
    }
    
    return csvRows.join('\n');
  }

  // Excelワークブック作成
  private createExcelWorkbook(
    teas: Tea[],
    growthRecords: GrowthRecord[],
    healthRecords: HealthRecords[],
    options: ExportOptions
  ) {
    // 実際の実装ではxlsxライブラリなどを使用
    const workbook = {
      SheetNames: ['Teas', 'GrowthRecords', 'HealthRecords', 'Metadata'],
      Sheets: {
        Teas: this.createWorksheet(teas),
        GrowthRecords: this.createWorksheet(growthRecords),
        HealthRecords: this.createWorksheet(healthRecords),
        Metadata: this.createMetadataWorksheet(options)
      }
    };
    
    return workbook;
  }

  private createWorksheet(data: any[]): any {
    if (data.length === 0) return {};
    
    const headers = Object.keys(data[0]);
    const worksheet: any = {};
    
    // ヘッダー行
    headers.forEach((header, index) => {
      worksheet[String.fromCharCode(65 + index) + '1'] = { v: header };
    });
    
    // データ行
    data.forEach((row, rowIndex) => {
      headers.forEach((header, colIndex) => {
        const cellAddress = String.fromCharCode(65 + colIndex) + (rowIndex + 2);
        worksheet[cellAddress] = { v: (row as any)[header] };
      });
    });
    
    return worksheet;
  }

  private createMetadataWorksheet(options: ExportOptions): any {
    return {
      A1: { v: 'Export Metadata' },
      A2: { v: 'Export Date' },
      B2: { v: new Date().toISOString() },
      A3: { v: 'Format' },
      B3: { v: options.format },
      A4: { v: 'Include Images' },
      B4: { v: options.includeImages }
    };
  }

  private async convertWorkbookToBuffer(workbook: any): Promise<ArrayBuffer> {
    // 実際の実装ではxlsxライブラリのwriteToBufferなどを使用
    return new ArrayBuffer(0);
  }

  // PDF生成
  private async generatePDFContent(
    teas: Tea[],
    growthRecords: GrowthRecord[],
    healthRecords: HealthRecords[],
    options: ExportOptions
  ): Promise<ArrayBuffer> {
    // 実際の実装ではjsPDFやPDFKitなどを使用
    const pdfContent = `
TeaBreed Log Export Report
==========================

Export Date: ${new Date().toISOString()}
Format: ${options.format}

Summary:
- Total Teas: ${teas.length}
- Total Growth Records: ${growthRecords.length}
- Total Health Records: ${healthRecords.length}

Teas:
${teas.map(tea => `- ${tea.name} (${tea.category})`).join('\n')}

Growth Records:
${growthRecords.map(record => `- ${record.teaId}: ${record.date}`).join('\n')}

Health Records:
${healthRecords.map(record => `- ${record.teaId}: ${record.date}`).join('\n')}
    `;
    
    const encoder = new TextEncoder();
    return encoder.encode(pdfContent).buffer;
  }

  // ファイル名生成
  private generateFilename(format: string, options: ExportOptions): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const dateRange = options.dateRange 
      ? `_${options.dateRange.start}_to_${options.dateRange.end}`
      : '';
    
    return `teabreed-log_export${dateRange}_${timestamp}.${format}`;
  }

  // ファイルダウンロード
  private downloadFile(url: string, filename: string): void {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // 統計レポート生成
  async generateStatisticsReport(
    teas: Tea[],
    growthRecords: GrowthRecord[],
    healthRecords: HealthRecord[]
  ): Promise<ExportResult> {
    try {
      const statistics = this.calculateStatistics(teas, growthRecords, healthRecords);
      
      const report = {
        metadata: {
          reportDate: new Date().toISOString(),
          reportType: 'statistics'
        },
        statistics
      };
      
      const jsonString = JSON.stringify(report, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      
      const filename = `teabreed-log_statistics_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      const url = URL.createObjectURL(blob);
      
      this.downloadFile(url, filename);
      
      return {
        success: true,
        filename,
        size: blob.size,
        url
      };
    } catch (error) {
      return {
        success: false,
        filename: '',
        size: 0,
        error: error instanceof Error ? error.message : '統計レポートの生成に失敗しました'
      };
    }
  }

  private calculateStatistics(
    teas: Tea[],
    growthRecords: GrowthRecord[],
    healthRecords: HealthRecord[]
  ) {
    // カテゴリー別統計
    const categoryStats = teas.reduce((acc, tea) => {
      acc[tea.category] = (acc[tea.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 成長記録統計
    const growthStats = growthRecords.reduce((acc, record) => {
      const month = new Date(record.date).getMonth();
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    // 健康記録統計
    const healthStats = healthRecords.reduce((acc, record) => {
      acc[record.severity] = (acc[record.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalTeas: teas.length,
      totalGrowthRecords: growthRecords.length,
      totalHealthRecords: healthRecords.length,
      categoryDistribution: categoryStats,
      growthByMonth: growthStats,
      healthIssuesBySeverity: healthStats,
      averageGrowthRecordsPerTea: teas.length > 0 ? growthRecords.length / teas.length : 0,
      averageHealthRecordsPerTea: teas.length > 0 ? healthRecords.length / teas.length : 0
    };
  }
}

export const dataExporter = new DataExporter();
