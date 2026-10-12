import React from 'react';

export interface TimelineProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'default' | 'sm' | 'lg';
}

export const Timeline: React.FC<TimelineProps> = ({
  size = 'default',
  className = '',
  children,
  ...props
}) => {
  return (
    <div
      className={`relative flex flex-col ${
        size === 'sm' ? 'gap-3' : size === 'lg' ? 'gap-8' : 'gap-5'
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export interface TimelineItemProps extends React.HTMLAttributes<HTMLDivElement> {
  status?: 'completed' | 'in-progress' | 'pending' | 'error';
}

export const TimelineItem: React.FC<TimelineItemProps> = ({
  status = 'completed',
  className = '',
  children,
  ...props
}) => {
  return (
    <div
      className={`group relative flex gap-4 text-sm ${className}`}
      data-status={status}
      {...props}
    >
      {children}
    </div>
  );
};

export const TimelineSeparator: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <div className={`relative flex flex-col items-center shrink-0 ${className}`} {...props}>
      {children}
    </div>
  );
};

export interface TimelineIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'subtle' | 'in-progress' | 'completed' | 'default';
}

export const TimelineIndicator: React.FC<TimelineIndicatorProps> = ({
  variant = 'subtle',
  className = '',
  children,
  ...props
}) => {
  let variantStyles = 'border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-400';

  if (variant === 'subtle') {
    variantStyles =
      'border-blue-500/30 bg-blue-500/10 text-blue-500 dark:text-blue-400 shadow-sm shadow-blue-500/10';
  } else if (variant === 'in-progress') {
    variantStyles =
      'border-cyan-500/50 bg-cyan-500/20 text-cyan-500 dark:text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.35)] ring-2 ring-cyan-500/20';
  } else if (variant === 'completed') {
    variantStyles =
      'border-emerald-500/40 bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 shadow-sm';
  }

  return (
    <div
      className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-300 ${variantStyles} ${className}`}
      {...props}
    >
      {variant === 'in-progress' && (
        <span className="absolute -inset-1 rounded-full bg-cyan-400/25 animate-ping opacity-75 pointer-events-none" />
      )}
      {children}
    </div>
  );
};

export const TimelineConnector: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  ...props
}) => {
  return (
    <div
      className={`w-[1.5px] flex-1 bg-slate-200 dark:bg-slate-800 my-1 group-last:hidden transition-colors ${className}`}
      {...props}
    />
  );
};

export const TimelineContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <div className={`flex-1 pb-4 min-w-0 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const TimelineTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <h4
      className={`text-sm font-semibold tracking-tight text-slate-900 dark:text-white ${className}`}
      {...props}
    >
      {children}
    </h4>
  );
};

export const TimelineDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <p
      className={`text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-1 ${className}`}
      {...props}
    >
      {children}
    </p>
  );
};

export const TimelineTime: React.FC<React.HTMLAttributes<HTMLSpanElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <span
      className={`text-[11px] font-mono text-slate-500 dark:text-slate-400 shrink-0 ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Timeline;
