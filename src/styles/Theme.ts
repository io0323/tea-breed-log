// CSS Variables and Theme Configuration
export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      xxl: string;
    };
    fontWeight: {
      light: number;
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
  };
  borderRadius: {
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
  transitions: {
    fast: string;
    normal: string;
    slow: string;
  };
}

export const defaultTheme: Theme = {
  colors: {
    primary: '#10b981',
    secondary: '#6b7280',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    background: '#f9fafb',
    surface: '#ffffff',
    text: '#111827',
    textSecondary: '#6b7280',
    border: '#d1d5db',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
  },
  typography: {
    fontFamily: '"Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP", Meiryo, sans-serif',
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      xxl: '1.5rem',
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },
  transitions: {
    fast: '150ms ease-in-out',
    normal: '300ms ease-in-out',
    slow: '500ms ease-in-out',
  },
};

// CSS-in-JS utilities
export const createCSSVariables = (theme: Theme): Record<string, string> => {
  const variables: Record<string, string> = {};
  
  Object.entries(theme.colors).forEach(([key, value]) => {
    variables[`--color-${key}`] = value;
  });
  
  Object.entries(theme.spacing).forEach(([key, value]) => {
    variables[`--spacing-${key}`] = value;
  });
  
  Object.entries(theme.typography.fontSize).forEach(([key, value]) => {
    variables[`--font-size-${key}`] = value;
  });
  
  Object.entries(theme.typography.fontWeight).forEach(([key, value]) => {
    variables[`--font-weight-${key}`] = value.toString();
  });
  
  Object.entries(theme.borderRadius).forEach(([key, value]) => {
    variables[`--border-radius-${key}`] = value;
  });
  
  Object.entries(theme.shadows).forEach(([key, value]) => {
    variables[`--shadow-${key}`] = value;
  });
  
  Object.entries(theme.transitions).forEach(([key, value]) => {
    variables[`--transition-${key}`] = value;
  });
  
  return variables;
};

// CSS Styles as TypeScript objects
export interface CSSStyle {
  [property: string]: string | number;
}

export const createStyle = (styles: CSSStyle): CSSStyle => styles;

// Common styles
export const flexStyles = {
  center: createStyle({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),
  between: createStyle({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  }),
  column: createStyle({
    display: 'flex',
    flexDirection: 'column',
  }),
  row: createStyle({
    display: 'flex',
    flexDirection: 'row',
  }),
};

export const textStyles = {
  heading1: createStyle({
    fontSize: defaultTheme.typography.fontSize.xxl,
    fontWeight: defaultTheme.typography.fontWeight.bold,
    color: defaultTheme.colors.text,
  }),
  heading2: createStyle({
    fontSize: defaultTheme.typography.fontSize.xl,
    fontWeight: defaultTheme.typography.fontWeight.semibold,
    color: defaultTheme.colors.text,
  }),
  heading3: createStyle({
    fontSize: defaultTheme.typography.fontSize.lg,
    fontWeight: defaultTheme.typography.fontWeight.medium,
    color: defaultTheme.colors.text,
  }),
  body: createStyle({
    fontSize: defaultTheme.typography.fontSize.md,
    fontWeight: defaultTheme.typography.fontWeight.normal,
    color: defaultTheme.colors.text,
  }),
  caption: createStyle({
    fontSize: defaultTheme.typography.fontSize.sm,
    fontWeight: defaultTheme.typography.fontWeight.normal,
    color: defaultTheme.colors.textSecondary,
  }),
};

export const buttonStyles = {
  primary: createStyle({
    backgroundColor: defaultTheme.colors.primary,
    color: 'white',
    padding: `${defaultTheme.spacing.sm} ${defaultTheme.spacing.md}`,
    borderRadius: defaultTheme.borderRadius.md,
    border: 'none',
    cursor: 'pointer',
    transition: defaultTheme.transitions.fast,
    fontWeight: defaultTheme.typography.fontWeight.medium,
  }),
  secondary: createStyle({
    backgroundColor: defaultTheme.colors.surface,
    color: defaultTheme.colors.text,
    padding: `${defaultTheme.spacing.sm} ${defaultTheme.spacing.md}`,
    borderRadius: defaultTheme.borderRadius.md,
    border: `1px solid ${defaultTheme.colors.border}`,
    cursor: 'pointer',
    transition: defaultTheme.transitions.fast,
    fontWeight: defaultTheme.typography.fontWeight.medium,
  }),
  danger: createStyle({
    backgroundColor: defaultTheme.colors.error,
    color: 'white',
    padding: `${defaultTheme.spacing.sm} ${defaultTheme.spacing.md}`,
    borderRadius: defaultTheme.borderRadius.md,
    border: 'none',
    cursor: 'pointer',
    transition: defaultTheme.transitions.fast,
    fontWeight: defaultTheme.typography.fontWeight.medium,
  }),
};

export const inputStyles = {
  default: createStyle({
    padding: defaultTheme.spacing.sm,
    borderRadius: defaultTheme.borderRadius.md,
    border: `1px solid ${defaultTheme.colors.border}`,
    fontSize: defaultTheme.typography.fontSize.md,
    transition: defaultTheme.transitions.fast,
    outline: 'none',
  }),
  focused: createStyle({
    borderColor: defaultTheme.colors.primary,
    boxShadow: `0 0 0 3px ${defaultTheme.colors.primary}20`,
  }),
  error: createStyle({
    borderColor: defaultTheme.colors.error,
    boxShadow: `0 0 0 3px ${defaultTheme.colors.error}20`,
  }),
};

export const cardStyles = {
  default: createStyle({
    backgroundColor: defaultTheme.colors.surface,
    borderRadius: defaultTheme.borderRadius.lg,
    boxShadow: defaultTheme.shadows.md,
    padding: defaultTheme.spacing.lg,
    border: `1px solid ${defaultTheme.colors.border}`,
  }),
  elevated: createStyle({
    backgroundColor: defaultTheme.colors.surface,
    borderRadius: defaultTheme.borderRadius.lg,
    boxShadow: defaultTheme.shadows.lg,
    padding: defaultTheme.spacing.lg,
    border: `1px solid ${defaultTheme.colors.border}`,
  }),
};

export const modalStyles = {
  overlay: createStyle({
    position: 'fixed',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: '1000',
  }),
  content: createStyle({
    backgroundColor: defaultTheme.colors.surface,
    borderRadius: defaultTheme.borderRadius.lg,
    boxShadow: defaultTheme.shadows.xl,
    padding: defaultTheme.spacing.lg,
    maxWidth: '500px',
    width: '90%',
    maxHeight: '90vh',
    overflow: 'auto',
  }),
};

export const tableStyles = {
  container: createStyle({
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: defaultTheme.colors.surface,
    borderRadius: defaultTheme.borderRadius.lg,
    overflow: 'hidden',
    boxShadow: defaultTheme.shadows.sm,
  }),
  header: createStyle({
    backgroundColor: defaultTheme.colors.background,
    fontWeight: defaultTheme.typography.fontWeight.semibold,
    textAlign: 'left',
  }),
  cell: createStyle({
    padding: defaultTheme.spacing.md,
    borderBottom: `1px solid ${defaultTheme.colors.border}`,
  }),
  row: createStyle({
    transition: defaultTheme.transitions.fast,
  }),
  rowHover: createStyle({
    backgroundColor: defaultTheme.colors.background,
  }),
};

// Responsive breakpoints
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  xxl: '1536px',
};

// Media query utilities
export const mediaQueries = {
  sm: `@media (min-width: ${breakpoints.sm})`,
  md: `@media (min-width: ${breakpoints.md})`,
  lg: `@media (min-width: ${breakpoints.lg})`,
  xl: `@media (min-width: ${breakpoints.xl})`,
  xxl: `@media (min-width: ${breakpoints.xxl})`,
};

// Animation utilities
export const animations = {
  fadeIn: {
    keyframes: `
      from { opacity: 0; }
      to { opacity: 1; }
    `,
    duration: '300ms',
    easing: 'ease-in-out',
  },
  slideUp: {
    keyframes: `
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    `,
    duration: '300ms',
    easing: 'ease-out',
  },
  slideDown: {
    keyframes: `
      from { transform: translateY(-20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    `,
    duration: '300ms',
    easing: 'ease-out',
  },
  scale: {
    keyframes: `
      from { transform: scale(0.9); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    `,
    duration: '200ms',
    easing: 'ease-out',
  },
  spin: {
    keyframes: `
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    `,
    duration: '1s',
    easing: 'linear',
    iterationCount: 'infinite',
  },
};

// Utility functions for dynamic styling
export const getResponsiveValue = <T extends string | number>(
  values: Partial<Record<keyof typeof breakpoints, T>>,
  defaultValue: T
): string => {
  const entries = Object.entries(values) as [keyof typeof breakpoints, T][];
  
  return entries
    .sort(([a], [b]) => parseInt(breakpoints[b]) - parseInt(breakpoints[a]))
    .map(([breakpoint, value]) => `${mediaQueries[breakpoint]} { ${value} }`)
    .join(' ') || defaultValue.toString();
};

export const createConditionalStyle = (
  condition: boolean,
  style: CSSStyle
): CSSStyle => (condition ? style : {});

export const mergeStyles = (...styles: CSSStyle[]): CSSStyle => {
  return Object.assign({}, ...styles);
};
