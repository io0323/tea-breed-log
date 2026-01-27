export interface UserPreferences {
  // テーマ設定
  theme: {
    mode: 'light' | 'dark' | 'auto';
    primaryColor: string;
    accentColor: string;
    fontSize: 'small' | 'medium' | 'large';
    fontFamily: string;
    borderRadius: 'sharp' | 'rounded' | 'circular';
  };
  
  // 表示設定
  display: {
    language: 'ja' | 'en';
    dateFormat: 'ja-JP' | 'en-US' | 'iso';
    timeFormat: '12h' | '24h';
    timezone: string;
    compactMode: boolean;
    showAnimations: boolean;
    reducedMotion: boolean;
  };
  
  // 通知設定
  notifications: {
    enabled: boolean;
    pushEnabled: boolean;
    emailEnabled: boolean;
    quietHours: {
      enabled: boolean;
      start: string;
      end: string;
    };
    categories: {
      teaGrowth: boolean;
      health: boolean;
      weather: boolean;
      system: boolean;
    };
  };
  
  // データ設定
  data: {
    autoSync: boolean;
    syncInterval: number; // 分
    cacheSize: number; // MB
    exportFormat: 'json' | 'csv' | 'excel';
    backupEnabled: boolean;
    backupInterval: number; // 日
  };
  
  // プライバシー設定
  privacy: {
    analyticsEnabled: boolean;
    crashReporting: boolean;
    locationTracking: boolean;
    dataCollection: boolean;
  };
  
  // アクセシビリティ設定
  accessibility: {
    highContrast: boolean;
    largeText: boolean;
    screenReader: boolean;
    keyboardNavigation: boolean;
    focusVisible: boolean;
  };
  
  // パフォーマンス設定
  performance: {
    imageQuality: 'low' | 'medium' | 'high';
    lazyLoading: boolean;
    prefetching: boolean;
    compressionEnabled: boolean;
  };
}

export interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    warning: string;
    success: string;
    info: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
    };
    fontWeight: {
      light: number;
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
    lineHeight: {
      tight: number;
      normal: number;
      relaxed: number;
    };
  };
  borderRadius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  animation: {
    duration: {
      fast: string;
      normal: string;
      slow: string;
    };
    easing: {
      ease: string;
      easeIn: string;
      easeOut: string;
      easeInOut: string;
    };
  };
}

class UserSettingsService {
  private preferences: UserPreferences;
  private currentTheme: Theme;
  private readonly STORAGE_KEY = 'tea_user_preferences';
  private readonly THEME_KEY = 'tea_current_theme';
  private subscribers: Set<(preferences: UserPreferences) => void> = new Set();

  constructor() {
    this.preferences = this.getDefaultPreferences();
    this.currentTheme = this.getDefaultTheme();
    this.loadPreferences();
    this.applyTheme();
  }

  // デフォルト設定
  private getDefaultPreferences(): UserPreferences {
    return {
      theme: {
        mode: 'auto',
        primaryColor: '#3B82F6',
        accentColor: '#10B981',
        fontSize: 'medium',
        fontFamily: 'Inter, system-ui, sans-serif',
        borderRadius: 'rounded'
      },
      display: {
        language: 'ja',
        dateFormat: 'ja-JP',
        timeFormat: '24h',
        timezone: 'Asia/Tokyo',
        compactMode: false,
        showAnimations: true,
        reducedMotion: false
      },
      notifications: {
        enabled: true,
        pushEnabled: true,
        emailEnabled: false,
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '08:00'
        },
        categories: {
          teaGrowth: true,
          health: true,
          weather: true,
          system: true
        }
      },
      data: {
        autoSync: true,
        syncInterval: 30,
        cacheSize: 100,
        exportFormat: 'json',
        backupEnabled: true,
        backupInterval: 7
      },
      privacy: {
        analyticsEnabled: false,
        crashReporting: true,
        locationTracking: false,
        dataCollection: false
      },
      accessibility: {
        highContrast: false,
        largeText: false,
        screenReader: false,
        keyboardNavigation: true,
        focusVisible: true
      },
      performance: {
        imageQuality: 'medium',
        lazyLoading: true,
        prefetching: true,
        compressionEnabled: true
      }
    };
  }

  // デフォルトテーマ
  private getDefaultTheme(): Theme {
    const isDark = this.isDarkMode();
    
    return {
      name: isDark ? 'dark' : 'light',
      colors: {
        primary: '#3B82F6',
        secondary: '#6B7280',
        accent: '#10B981',
        background: isDark ? '#111827' : '#FFFFFF',
        surface: isDark ? '#1F2937' : '#F9FAFB',
        text: isDark ? '#F9FAFB' : '#111827',
        textSecondary: isDark ? '#9CA3AF' : '#6B7280',
        border: isDark ? '#374151' : '#E5E7EB',
        error: '#EF4444',
        warning: '#F59E0B',
        success: '#10B981',
        info: '#3B82F6'
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem'
      },
      typography: {
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          md: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem'
        },
        fontWeight: {
          light: 300,
          normal: 400,
          medium: 500,
          semibold: 600,
          bold: 700
        },
        lineHeight: {
          tight: 1.25,
          normal: 1.5,
          relaxed: 1.75
        }
      },
      borderRadius: {
        none: '0',
        sm: '0.125rem',
        md: '0.375rem',
        lg: '0.5rem',
        full: '9999px'
      },
      shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      },
      animation: {
        duration: {
          fast: '150ms',
          normal: '300ms',
          slow: '500ms'
        },
        easing: {
          ease: 'ease',
          easeIn: 'ease-in',
          easeOut: 'ease-out',
          easeInOut: 'ease-in-out'
        }
      }
    };
  }

  // ダークモード判定
  private isDarkMode(): boolean {
    const { theme } = this.preferences;
    
    if (theme.mode === 'dark') return true;
    if (theme.mode === 'light') return false;
    
    // autoモードの場合はシステム設定を確認
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  // 設定の読み込み
  private loadPreferences(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.preferences = { ...this.preferences, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Failed to load user preferences:', error);
    }
  }

  // 設定の保存
  private savePreferences(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.preferences));
      this.notifySubscribers();
    } catch (error) {
      console.error('Failed to save user preferences:', error);
    }
  }

  // テーマの適用
  private applyTheme(): void {
    const root = document.documentElement;
    const theme = this.currentTheme;

    // CSS変数の設定
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    Object.entries(theme.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
    });

    Object.entries(theme.typography.fontSize).forEach(([key, value]) => {
      root.style.setProperty(`--font-size-${key}`, value);
    });

    Object.entries(theme.typography.fontWeight).forEach(([key, value]) => {
      root.style.setProperty(`--font-weight-${key}`, value.toString());
    });

    Object.entries(theme.borderRadius).forEach(([key, value]) => {
      root.style.setProperty(`--border-radius-${key}`, value);
    });

    // データ属性の設定
    root.setAttribute('data-theme', theme.name);
    root.setAttribute('data-font-size', this.preferences.theme.fontSize);
    root.setAttribute('data-border-radius', this.preferences.theme.borderRadius);

    // アクセシビリティ設定の適用
    if (this.preferences.accessibility.highContrast) {
      root.setAttribute('data-high-contrast', 'true');
    } else {
      root.removeAttribute('data-high-contrast');
    }

    if (this.preferences.accessibility.largeText) {
      root.setAttribute('data-large-text', 'true');
    } else {
      root.removeAttribute('data-large-text');
    }

    if (this.preferences.display.reducedMotion) {
      root.setAttribute('data-reduced-motion', 'true');
    } else {
      root.removeAttribute('data-reduced-motion');
    }
  }

  // テーマの切り替え
  switchTheme(mode: UserPreferences['theme']['mode']): void {
    this.preferences.theme.mode = mode;
    this.currentTheme = this.getDefaultTheme();
    this.applyTheme();
    this.savePreferences();
  }

  // カスタムカラーの設定
  setCustomColors(colors: Partial<Theme['colors']>): void {
    this.currentTheme.colors = { ...this.currentTheme.colors, ...colors };
    this.applyTheme();
    
    // カスタムカラーを保存
    const customTheme = {
      ...this.currentTheme,
      colors: this.currentTheme.colors
    };
    localStorage.setItem(this.THEME_KEY, JSON.stringify(customTheme));
  }

  // 設定の更新
  updatePreferences(updates: Partial<UserPreferences>): void {
    this.preferences = this.mergeDeep(this.preferences, updates);
    
    // テーマ関連の変更があれば再適用
    if (updates.theme) {
      this.currentTheme = this.getDefaultTheme();
      this.applyTheme();
    }
    
    // 表示設定の変更があれば再適用
    if (updates.display) {
      this.applyTheme();
    }
    
    // アクセシビリティ設定の変更があれば再適用
    if (updates.accessibility) {
      this.applyTheme();
    }
    
    this.savePreferences();
  }

  // 深いマージ
  private mergeDeep<T>(target: T, source: Partial<T>): T {
    const result = { ...target };
    
    Object.keys(source).forEach(key => {
      const sourceValue = source[key as keyof T];
      const targetValue = result[key as keyof T];
      
      if (sourceValue && typeof sourceValue === 'object' && !Array.isArray(sourceValue)) {
        result[key as keyof T] = this.mergeDeep(targetValue, sourceValue as any);
      } else {
        result[key as keyof T] = sourceValue as any;
      }
    });
    
    return result;
  }

  // 設定の取得
  getPreferences(): UserPreferences {
    return { ...this.preferences };
  }

  // テーマの取得
  getCurrentTheme(): Theme {
    return { ...this.currentTheme };
  }

  // 設定のリセット
  resetPreferences(): void {
    this.preferences = this.getDefaultPreferences();
    this.currentTheme = this.getDefaultTheme();
    this.applyTheme();
    this.savePreferences();
    localStorage.removeItem(this.THEME_KEY);
  }

  // 設定のエクスポート
  exportPreferences(): string {
    return JSON.stringify({
      preferences: this.preferences,
      customTheme: this.currentTheme,
      exportDate: new Date().toISOString()
    }, null, 2);
  }

  // 設定のインポート
  importPreferences(data: string): boolean {
    try {
      const imported = JSON.parse(data);
      
      if (imported.preferences) {
        this.preferences = this.mergeDeep(this.getDefaultPreferences(), imported.preferences);
      }
      
      if (imported.customTheme) {
        this.currentTheme = { ...this.getDefaultTheme(), ...imported.customTheme };
      }
      
      this.applyTheme();
      this.savePreferences();
      
      return true;
    } catch (error) {
      console.error('Failed to import preferences:', error);
      return false;
    }
  }

  // 購読者管理
  subscribe(callback: (preferences: UserPreferences) => void): () => void {
    this.subscribers.add(callback);
    
    return () => {
      this.subscribers.delete(callback);
    };
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback(this.preferences));
  }

  // システムテーマ変更の監視
  setupSystemThemeListener(): void {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    mediaQuery.addEventListener('change', () => {
      if (this.preferences.theme.mode === 'auto') {
        this.currentTheme = this.getDefaultTheme();
        this.applyTheme();
      }
    });
  }

  // テーマプリセット
  getThemePresets(): Array<{ name: string; theme: Theme }> {
    return [
      {
        name: 'Light',
        theme: this.createLightTheme()
      },
      {
        name: 'Dark',
        theme: this.createDarkTheme()
      },
      {
        name: 'High Contrast',
        theme: this.createHighContrastTheme()
      },
      {
        name: 'Tea Garden',
        theme: this.createTeaGardenTheme()
      }
    ];
  }

  private createLightTheme(): Theme {
    const base = this.getDefaultTheme();
    return {
      ...base,
      name: 'light',
      colors: {
        ...base.colors,
        background: '#FFFFFF',
        surface: '#F9FAFB',
        text: '#111827',
        textSecondary: '#6B7280',
        border: '#E5E7EB'
      }
    };
  }

  private createDarkTheme(): Theme {
    const base = this.getDefaultTheme();
    return {
      ...base,
      name: 'dark',
      colors: {
        ...base.colors,
        background: '#111827',
        surface: '#1F2937',
        text: '#F9FAFB',
        textSecondary: '#9CA3AF',
        border: '#374151'
      }
    };
  }

  private createHighContrastTheme(): Theme {
    const base = this.getDefaultTheme();
    return {
      ...base,
      name: 'high-contrast',
      colors: {
        ...base.colors,
        background: '#000000',
        surface: '#1A1A1A',
        text: '#FFFFFF',
        textSecondary: '#CCCCCC',
        border: '#FFFFFF',
        primary: '#FFFF00',
        accent: '#00FF00'
      }
    };
  }

  private createTeaGardenTheme(): Theme {
    const base = this.getDefaultTheme();
    return {
      ...base,
      name: 'tea-garden',
      colors: {
        ...base.colors,
        primary: '#2D5016',
        secondary: '#8FBC8F',
        accent: '#228B22',
        background: '#F5FFF5',
        surface: '#E8F5E8',
        text: '#1B5E1B',
        textSecondary: '#4A7C4A',
        border: '#C8E6C9'
      }
    };
  }

  // プリセットテーマの適用
  applyThemePreset(presetName: string): void {
    const presets = this.getThemePresets();
    const preset = presets.find(p => p.name === presetName);
    
    if (preset) {
      this.currentTheme = preset.theme;
      this.applyTheme();
      
      // カスタムテーマを保存
      localStorage.setItem(this.THEME_KEY, JSON.stringify(this.currentTheme));
    }
  }

  // 設定の検証
  validatePreferences(preferences: Partial<UserPreferences>): boolean {
    try {
      // 基本的な構造検証
      if (typeof preferences !== 'object' || preferences === null) {
        return false;
      }

      // テーマ設定の検証
      if (preferences.theme) {
        const { theme } = preferences;
        if (theme.mode && !['light', 'dark', 'auto'].includes(theme.mode)) {
          return false;
        }
        if (theme.fontSize && !['small', 'medium', 'large'].includes(theme.fontSize)) {
          return false;
        }
      }

      // 表示設定の検証
      if (preferences.display) {
        const { display } = preferences;
        if (display.language && !['ja', 'en'].includes(display.language)) {
          return false;
        }
        if (display.timeFormat && !['12h', '24h'].includes(display.timeFormat)) {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Preference validation error:', error);
      return false;
    }
  }
}

export const userSettingsService = new UserSettingsService();
