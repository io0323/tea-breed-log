import { TeaVariety } from '../types/teaVariety';
import { GrowthRecord } from '../types/growthRecord';
import { HealthIssue } from '../types/healthStatus';

export type ExportFormat = 'json' | 'csv' | 'excel' | 'pdf' | 'xml';
export type ExportCategory = 'all' | 'teas' | 'growth' | 'health';

export interface ExportOptions {
  format: ExportFormat;
  category: ExportCategory;
  includeImages: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  filters?: {
    status?: string;
    location?: string;
    generation?: string;
    severity?: string;
  };
  customFields?: string[];
}

export interface ExportResult {
  success: boolean;
  filename: string;
  size: number;
  url?: string;
  error?: string;
}

export class DataExporter {
  // JSONエクスポート
  static async exportToJSON(
    teas: TeaVariety[],
    growthRecords: GrowthRecord[],
    healthIssues: HealthIssue[],
    options: ExportOptions
  ): Promise<ExportResult> {
    try {
      const data = this.prepareExportData(teas, growthRecords, healthIssues, options);
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const filename = `tea-data-${new Date().toISOString().split('T')[0]}.json`;
      
      return this.downloadFile(blob, filename);
    } catch (error) {
      return {
        success: false,
        filename: '',
        size: 0,
        error: error instanceof Error ? error.message : 'JSONエクスポートに失敗しました',
      };
    }
  }

  // CSVエクスポート
  static async exportToCSV(
    teas: TeaVariety[],
    growthRecords: GrowthRecord[],
    healthIssues: HealthIssue[],
    options: ExportOptions
  ): Promise<ExportResult> {
    try {
      let csvContent = '';
      let filename = '';

      switch (options.category) {
        case 'teas':
          csvContent = this.convertTeasToCSV(teas, options);
          filename = `teas-${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case 'growth':
          csvContent = this.convertGrowthToCSV(growthRecords, options);
          filename = `growth-records-${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case 'health':
          csvContent = this.convertHealthToCSV(healthIssues, options);
          filename = `health-issues-${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case 'all':
          csvContent = this.convertAllToCSV(teas, growthRecords, healthIssues, options);
          filename = `tea-all-data-${new Date().toISOString().split('T')[0]}.csv`;
          break;
      }

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      return this.downloadFile(blob, filename);
    } catch (error) {
      return {
        success: false,
        filename: '',
        size: 0,
        error: error instanceof Error ? error.message : 'CSVエクスポートに失敗しました',
      };
    }
  }

  // Excelエクスポート（簡易版）
  static async exportToExcel(
    teas: TeaVariety[],
    growthRecords: GrowthRecord[],
    healthIssues: HealthIssue[],
    options: ExportOptions
  ): Promise<ExportResult> {
    try {
      // HTMLテーブル形式でExcel互換のファイルを作成
      let htmlContent = `
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              table { border-collapse: collapse; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
            </style>
          </head>
          <body>
      `;

      switch (options.category) {
        case 'teas':
          htmlContent += this.createTeasTable(teas, options);
          break;
        case 'growth':
          htmlContent += this.createGrowthTable(growthRecords, options);
          break;
        case 'health':
          htmlContent += this.createHealthTable(healthIssues, options);
          break;
        case 'all':
          htmlContent += '<h2>品種データ</h2>';
          htmlContent += this.createTeasTable(teas, options);
          htmlContent += '<h2>成長記録</h2>';
          htmlContent += this.createGrowthTable(growthRecords, options);
          htmlContent += '<h2>健康問題</h2>';
          htmlContent += this.createHealthTable(healthIssues, options);
          break;
      }

      htmlContent += '</body></html>';

      const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' });
      const filename = `tea-data-${new Date().toISOString().split('T')[0]}.xls`;
      
      return this.downloadFile(blob, filename);
    } catch (error) {
      return {
        success: false,
        filename: '',
        size: 0,
        error: error instanceof Error ? error.message : 'Excelエクスポートに失敗しました',
      };
    }
  }

  // XMLエクスポート
  static async exportToXML(
    teas: TeaVariety[],
    growthRecords: GrowthRecord[],
    healthIssues: HealthIssue[],
    options: ExportOptions
  ): Promise<ExportResult> {
    try {
      const data = this.prepareExportData(teas, growthRecords, healthIssues, options);
      const xmlString = this.convertToXML(data);
      const blob = new Blob([xmlString], { type: 'application/xml' });
      const filename = `tea-data-${new Date().toISOString().split('T')[0]}.xml`;
      
      return this.downloadFile(blob, filename);
    } catch (error) {
      return {
        success: false,
        filename: '',
        size: 0,
        error: error instanceof Error ? error.message : 'XMLエクスポートに失敗しました',
      };
    }
  }

  // PDFエクスポート（簡易版）
  static async exportToPDF(
    teas: TeaVariety[],
    growthRecords: GrowthRecord[],
    healthIssues: HealthIssue[],
    options: ExportOptions
  ): Promise<ExportResult> {
    try {
      // HTMLをPDFに変換（実際のプロジェクトではjsPDFなどのライブラリを使用）
      let htmlContent = `
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              h1, h2 { color: #333; }
            </style>
          </head>
          <body>
            <h1>お茶品種データレポート</h1>
            <p>生成日時: ${new Date().toLocaleString('ja-JP')}</p>
      `;

      switch (options.category) {
        case 'teas':
          htmlContent += '<h2>品種一覧</h2>';
          htmlContent += this.createTeasTable(teas, options);
          break;
        case 'growth':
          htmlContent += '<h2>成長記録</h2>';
          htmlContent += this.createGrowthTable(growthRecords, options);
          break;
        case 'health':
          htmlContent += '<h2>健康問題</h2>';
          htmlContent += this.createHealthTable(healthIssues, options);
          break;
        case 'all':
          htmlContent += '<h2>品種一覧</h2>';
          htmlContent += this.createTeasTable(teas, options);
          htmlContent += '<h2>成長記録</h2>';
          htmlContent += this.createGrowthTable(growthRecords, options);
          htmlContent += '<h2>健康問題</h2>';
          htmlContent += this.createHealthTable(healthIssues, options);
          break;
      }

      htmlContent += '</body></html>';

      const blob = new Blob([htmlContent], { type: 'text/html' });
      const filename = `tea-report-${new Date().toISOString().split('T')[0]}.html`;
      
      return this.downloadFile(blob, filename);
    } catch (error) {
      return {
        success: false,
        filename: '',
        size: 0,
        error: error instanceof Error ? error.message : 'PDFエクスポートに失敗しました',
      };
    }
  }

  // データ準備
  private static prepareExportData(
    teas: TeaVariety[],
    growthRecords: GrowthRecord[],
    healthIssues: HealthIssue[],
    options: ExportOptions
  ) {
    const result: any = {
      exportDate: new Date().toISOString(),
      category: options.category,
      version: '1.0',
    };

    // フィルタリング適用
    let filteredTeas = this.filterTeas(teas, options);
    let filteredGrowth = this.filterGrowth(growthRecords, options);
    let filteredHealth = this.filterHealth(healthIssues, options);

    // 画像URLを含めるかどうか
    if (!options.includeImages) {
      filteredTeas = filteredTeas.map(tea => ({
        ...tea,
        images: tea.images.length > 0 ? [`画像${tea.images.length}枚`] : [],
      }));
    }

    switch (options.category) {
      case 'teas':
        result.teas = filteredTeas;
        break;
      case 'growth':
        result.growthRecords = filteredGrowth;
        break;
      case 'health':
        result.healthIssues = filteredHealth;
        break;
      case 'all':
        result.teas = filteredTeas;
        result.growthRecords = filteredGrowth;
        result.healthIssues = filteredHealth;
        break;
    }

    return result;
  }

  // フィルタリング
  private static filterTeas(teas: TeaVariety[], options: ExportOptions): TeaVariety[] {
    return teas.filter(tea => {
      if (options.filters?.status && tea.status !== options.filters.status) return false;
      if (options.filters?.location && !tea.location.includes(options.filters.location)) return false;
      if (options.filters?.generation && tea.generation !== options.filters.generation) return false;
      return true;
    });
  }

  private static filterGrowth(records: GrowthRecord[], options: ExportOptions): GrowthRecord[] {
    return records.filter(record => {
      if (options.dateRange) {
        const recordDate = new Date(record.date);
        const startDate = new Date(options.dateRange.start);
        const endDate = new Date(options.dateRange.end);
        if (recordDate < startDate || recordDate > endDate) return false;
      }
      return true;
    });
  }

  private static filterHealth(issues: HealthIssue[], options: ExportOptions): HealthIssue[] {
    return issues.filter(issue => {
      if (options.filters?.severity && issue.severity !== options.filters.severity) return false;
      if (options.filters?.status && issue.status !== options.filters.status) return false;
      if (options.dateRange) {
        const issueDate = new Date(issue.date);
        const startDate = new Date(options.dateRange.start);
        const endDate = new Date(options.dateRange.end);
        if (issueDate < startDate || issueDate > endDate) return false;
      }
      return true;
    });
  }

  // CSV変換
  private static convertTeasToCSV(teas: TeaVariety[], _options: ExportOptions): string {
    const headers = ['ID', '名前', '世代', '場所', '年度', '発芽率', '成長スコア', '耐病性', '香り', '備考', '状態'];
    const rows = teas.map(tea => [
      tea.id,
      tea.name,
      tea.generation,
      tea.location,
      tea.year.toString(),
      tea.germinationRate.toString(),
      tea.growthScore.toString(),
      tea.diseaseResistance.toString(),
      tea.aroma,
      tea.note,
      tea.status,
    ]);

    return this.createCSVContent(headers, rows);
  }

  private static convertGrowthToCSV(records: GrowthRecord[], _options: ExportOptions): string {
    const headers = ['ID', '品種ID', '日付', '高さ', '葉数', '天気', '気温', 'メモ'];
    const rows = records.map(record => [
      record.id,
      record.teaId,
      record.date,
      record.height?.toString() || '',
      record.leafCount?.toString() || '',
      record.weather || '',
      record.temperature?.toString() || '',
      record.notes || '',
    ]);

    return this.createCSVContent(headers, rows);
  }

  private static convertHealthToCSV(issues: HealthIssue[], _options: ExportOptions): string {
    const headers = ['ID', '品種ID', '日付', 'タイプ', '重大度', '状態', '説明', '症状', '原因', '治療法'];
    const rows = issues.map(issue => [
      issue.id,
      issue.teaId,
      issue.date,
      issue.type,
      issue.severity,
      issue.status,
      issue.description,
      issue.symptoms.join('; '),
      issue.cause || '',
      issue.treatment || '',
    ]);

    return this.createCSVContent(headers, rows);
  }

  private static convertAllToCSV(
    teas: TeaVariety[],
    growthRecords: GrowthRecord[],
    healthIssues: HealthIssue[],
    options: ExportOptions
  ): string {
    const teaCSV = this.convertTeasToCSV(teas, options);
    const growthCSV = this.convertGrowthToCSV(growthRecords, options);
    const healthCSV = this.convertHealthToCSV(healthIssues, options);

    return `品種データ\n${teaCSV}\n\n成長記録\n${growthCSV}\n\n健康問題\n${healthCSV}`;
  }

  private static createCSVContent(headers: string[], rows: string[][]): string {
    const csvRows = [headers, ...rows];
    return csvRows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  }

  // HTMLテーブル作成
  private static createTeasTable(teas: TeaVariety[], _options: ExportOptions): string {
    const headers = ['ID', '名前', '世代', '場所', '年度', '発芽率', '成長スコア', '耐病性', '香り', '備考', '状態'];
    const rows = teas.map(tea => `
      <tr>
        <td>${tea.id}</td>
        <td>${tea.name}</td>
        <td>${tea.generation}</td>
        <td>${tea.location}</td>
        <td>${tea.year}</td>
        <td>${tea.germinationRate}%</td>
        <td>${tea.growthScore}</td>
        <td>${tea.diseaseResistance}</td>
        <td>${tea.aroma}</td>
        <td>${tea.note}</td>
        <td>${tea.status === 'active' ? '栽培中' : '休止中'}</td>
      </tr>
    `).join('');

    return `<table><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table>`;
  }

  private static createGrowthTable(records: GrowthRecord[], _options: ExportOptions): string {
    const headers = ['ID', '品種ID', '日付', '高さ', '葉数', '天気', '気温', 'メモ'];
    const rows = records.map(record => `
      <tr>
        <td>${record.id}</td>
        <td>${record.teaId}</td>
        <td>${record.date}</td>
        <td>${record.height || ''}</td>
        <td>${record.leafCount || ''}</td>
        <td>${record.weather || ''}</td>
        <td>${record.temperature || ''}</td>
        <td>${record.notes || ''}</td>
      </tr>
    `).join('');

    return `<table><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table>`;
  }

  private static createHealthTable(issues: HealthIssue[], _options: ExportOptions): string {
    const headers = ['ID', '品種ID', '日付', 'タイプ', '重大度', '状態', '説明', '症状', '原因', '治療法'];
    const rows = issues.map(issue => `
      <tr>
        <td>${issue.id}</td>
        <td>${issue.teaId}</td>
        <td>${issue.date}</td>
        <td>${issue.type}</td>
        <td>${issue.severity}</td>
        <td>${issue.status}</td>
        <td>${issue.description}</td>
        <td>${issue.symptoms.join(', ')}</td>
        <td>${issue.cause || ''}</td>
        <td>${issue.treatment || ''}</td>
      </tr>
    `).join('');

    return `<table><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table>`;
  }

  // XML変換
  private static convertToXML(data: any): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<teaData>\n';
    xml += `  <exportDate>${data.exportDate}</exportDate>\n`;
    xml += `  <category>${data.category}</category>\n`;
    xml += `  <version>${data.version}</version>\n`;

    if (data.teas) {
      xml += '  <teas>\n';
      data.teas.forEach((tea: any) => {
        xml += '    <tea>\n';
        Object.entries(tea).forEach(([key, value]) => {
          xml += `      <${key}>${value}</${key}>\n`;
        });
        xml += '    </tea>\n';
      });
      xml += '  </teas>\n';
    }

    if (data.growthRecords) {
      xml += '  <growthRecords>\n';
      data.growthRecords.forEach((record: any) => {
        xml += '    <record>\n';
        Object.entries(record).forEach(([key, value]) => {
          xml += `      <${key}>${value}</${key}>\n`;
        });
        xml += '    </record>\n';
      });
      xml += '  </growthRecords>\n';
    }

    if (data.healthIssues) {
      xml += '  <healthIssues>\n';
      data.healthIssues.forEach((issue: any) => {
        xml += '    <issue>\n';
        Object.entries(issue).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            xml += `      <${key}>\n`;
            value.forEach(item => {
              xml += `        <item>${item}</item>\n`;
            });
            xml += `      </${key}>\n`;
          } else {
            xml += `      <${key}>${value}</${key}>\n`;
          }
        });
        xml += '    </issue>\n';
      });
      xml += '  </healthIssues>\n';
    }

    xml += '</teaData>';
    return xml;
  }

  // ファイルダウンロード
  private static downloadFile(blob: Blob, filename: string): ExportResult {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return {
      success: true,
      filename,
      size: blob.size,
    };
  }
}
