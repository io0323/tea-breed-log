import React from 'react';
import { defaultTheme, buttonStyles, textStyles } from '../styles/Theme';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  fullWidth = false,
  children,
  disabled,
  className = '',
  ...props
}) => {
  const baseStyle = buttonStyles[variant];
  const sizeStyles = {
    sm: { padding: '0.5rem 1rem', fontSize: '0.875rem' },
    md: { padding: '0.75rem 1.5rem', fontSize: '1rem' },
    lg: { padding: '1rem 2rem', fontSize: '1.125rem' },
  };

  const style = {
    ...baseStyle,
    ...sizeStyles[size],
    width: fullWidth ? '100%' : 'auto',
    opacity: disabled || loading ? 0.6 : 1,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  };

  return (
    <button
      style={style}
      disabled={disabled || loading}
      className={className}
      {...props}
    >
      {loading && (
        <div
          style={{
            width: '1rem',
            height: '1rem',
            border: '2px solid transparent',
            borderTop: `2px solid ${defaultTheme.colors.surface}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
      )}
      {icon && !loading && icon}
      {children}
    </button>
  );
};

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  elevated?: boolean;
  padding?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  footer,
  elevated = false,
  padding = 'md',
  className = '',
}) => {
  const paddingStyles = {
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
  };

  const style = {
    backgroundColor: defaultTheme.colors.surface,
    borderRadius: defaultTheme.borderRadius.lg,
    boxShadow: elevated ? defaultTheme.shadows.lg : defaultTheme.shadows.md,
    border: `1px solid ${defaultTheme.colors.border}`,
    padding: paddingStyles[padding],
  };

  return (
    <div style={style} className={className}>
      {(title || subtitle) && (
        <div style={{ marginBottom: '1rem' }}>
          {title && (
            <h3 style={{ ...textStyles.heading3, margin: 0 }}>
              {title}
            </h3>
          )}
          {subtitle && (
            <p style={{ ...textStyles.caption, marginTop: '0.25rem', margin: 0 }}>
              {subtitle}
            </p>
          )}
        </div>
      )}
      <div>{children}</div>
      {footer && (
        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: `1px solid ${defaultTheme.colors.border}` }}>
          {footer}
        </div>
      )}
    </div>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className = '',
  ...props
}) => {
  const inputStyle = {
    ...buttonStyles.secondary,
    borderColor: error ? defaultTheme.colors.error : defaultTheme.colors.border,
    boxShadow: error ? `0 0 0 3px ${defaultTheme.colors.error}20` : 'none',
    paddingLeft: leftIcon ? '2.5rem' : '0.75rem',
    paddingRight: rightIcon ? '2.5rem' : '0.75rem',
    width: '100%',
  };

  return (
    <div className={className}>
      {label && (
        <label style={{ ...textStyles.caption, display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {leftIcon && (
          <div
            style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: defaultTheme.colors.textSecondary,
            }}
          >
            {leftIcon}
          </div>
        )}
        <input
          style={inputStyle}
          {...props}
        />
        {rightIcon && (
          <div
            style={{
              position: 'absolute',
              right: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: defaultTheme.colors.textSecondary,
            }}
          >
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <div style={{ ...textStyles.caption, color: defaultTheme.colors.error, marginTop: '0.25rem' }}>
          {error}
        </div>
      )}
      {helperText && !error && (
        <div style={{ ...textStyles.caption, color: defaultTheme.colors.textSecondary, marginTop: '0.25rem' }}>
          {helperText}
        </div>
      )}
    </div>
  );
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}) => {
  const sizeStyles = {
    sm: { maxWidth: '400px' },
    md: { maxWidth: '500px' },
    lg: { maxWidth: '700px' },
    xl: { maxWidth: '900px' },
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: defaultTheme.colors.surface,
          borderRadius: defaultTheme.borderRadius.lg,
          boxShadow: defaultTheme.shadows.xl,
          padding: '1.5rem',
          width: '90%',
          maxHeight: '90vh',
          overflow: 'auto',
          ...sizeStyles[size],
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || onClose) && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            {title && (
              <h2 style={{ ...textStyles.heading2, margin: 0 }}>
                {title}
              </h2>
            )}
            {onClose && (
              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: defaultTheme.colors.textSecondary,
                  padding: '0.25rem',
                }}
              >
                ×
              </button>
            )}
          </div>
        )}
        <div>{children}</div>
        {footer && (
          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: `1px solid ${defaultTheme.colors.border}` }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const variantStyles = {
    success: { backgroundColor: defaultTheme.colors.success, color: 'white' },
    warning: { backgroundColor: defaultTheme.colors.warning, color: 'white' },
    error: { backgroundColor: defaultTheme.colors.error, color: 'white' },
    info: { backgroundColor: defaultTheme.colors.info, color: 'white' },
    default: { backgroundColor: defaultTheme.colors.secondary, color: 'white' },
  };

  const sizeStyles = {
    sm: { padding: '0.25rem 0.5rem', fontSize: '0.75rem' },
    md: { padding: '0.5rem 0.75rem', fontSize: '0.875rem' },
  };

  const style = {
    ...variantStyles[variant],
    ...sizeStyles[size],
    borderRadius: defaultTheme.borderRadius.full,
    fontWeight: defaultTheme.typography.fontWeight.medium,
    display: 'inline-block',
  };

  return (
    <span style={style} className={className}>
      {children}
    </span>
  );
};

interface AlertProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info';
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  children,
  variant = 'info',
  dismissible = false,
  onDismiss,
  className = '',
}) => {
  const variantStyles = {
    success: {
      backgroundColor: `${defaultTheme.colors.success}10`,
      borderColor: defaultTheme.colors.success,
      color: defaultTheme.colors.success,
    },
    warning: {
      backgroundColor: `${defaultTheme.colors.warning}10`,
      borderColor: defaultTheme.colors.warning,
      color: defaultTheme.colors.warning,
    },
    error: {
      backgroundColor: `${defaultTheme.colors.error}10`,
      borderColor: defaultTheme.colors.error,
      color: defaultTheme.colors.error,
    },
    info: {
      backgroundColor: `${defaultTheme.colors.info}10`,
      borderColor: defaultTheme.colors.info,
      color: defaultTheme.colors.info,
    },
  };

  const style = {
    ...variantStyles[variant],
    border: `1px solid`,
    borderRadius: defaultTheme.borderRadius.md,
    padding: '1rem',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
  };

  return (
    <div style={style} className={className}>
      <div style={{ flex: 1 }}>{children}</div>
      {dismissible && onDismiss && (
        <button
          onClick={onDismiss}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.25rem',
            cursor: 'pointer',
            color: 'inherit',
            padding: '0',
            lineHeight: 1,
          }}
        >
          ×
        </button>
      )}
    </div>
  );
};

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = defaultTheme.colors.primary,
  className = '',
}) => {
  const sizeStyles = {
    sm: { width: '1rem', height: '1rem' },
    md: { width: '2rem', height: '2rem' },
    lg: { width: '3rem', height: '3rem' },
  };

  const style = {
    ...sizeStyles[size],
    border: `3px solid ${color}20`,
    borderTop: `3px solid ${color}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  };

  return (
    <div style={style} className={className} />
  );
};

interface TableProps {
  columns: Array<{
    key: string;
    label: string;
    sortable?: boolean;
    width?: string;
  }>;
  data: Record<string, any>[];
  onSort?: (key: string) => void;
  sortKey?: string;
  sortOrder?: 'asc' | 'desc';
  className?: string;
}

export const Table: React.FC<TableProps> = ({
  columns,
  data,
  onSort,
  sortKey,
  sortOrder,
  className = '',
}) => {
  const headerStyle = {
    backgroundColor: defaultTheme.colors.background,
    fontWeight: defaultTheme.typography.fontWeight.semibold,
    textAlign: 'left' as const,
    padding: '1rem',
    borderBottom: `2px solid ${defaultTheme.colors.border}`,
  };

  const cellStyle = {
    padding: '1rem',
    borderBottom: `1px solid ${defaultTheme.colors.border}`,
  };

  const handleSort = (key: string) => {
    if (onSort && columns.find(col => col.key === key)?.sortable) {
      onSort(key);
    }
  };

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }} className={className}>
      <thead>
        <tr>
          {columns.map((column) => (
            <th
              key={column.key}
              style={{
                ...headerStyle,
                width: column.width,
                cursor: column.sortable ? 'pointer' : 'default',
              }}
              onClick={() => handleSort(column.key)}
            >
              {column.label}
              {column.sortable && sortKey === column.key && (
                <span style={{ marginLeft: '0.5rem' }}>
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <tr key={index} style={{ transition: 'background-color 0.2s' }}>
            {columns.map((column) => (
              <td key={column.key} style={cellStyle}>
                {row[column.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
