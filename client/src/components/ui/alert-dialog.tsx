import * as React from 'react';
import { createPortal } from 'react-dom';

interface AlertDialogContextType {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const AlertDialogContext = React.createContext<AlertDialogContextType | null>(null);

export interface AlertDialogProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
}

export const AlertDialog: React.FC<AlertDialogProps> = ({
  children,
  open: controlledOpen,
  onOpenChange,
  defaultOpen = false,
}) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const setOpen = React.useCallback(
    (value: React.SetStateAction<boolean>) => {
      const next = typeof value === 'function' ? value(open) : value;
      if (!isControlled) {
        setUncontrolledOpen(next);
      }
      onOpenChange?.(next);
    },
    [isControlled, open, onOpenChange]
  );

  return (
    <AlertDialogContext.Provider value={{ open, setOpen }}>
      {children}
    </AlertDialogContext.Provider>
  );
};

export interface AlertDialogTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  render?: React.ReactElement;
}

export const AlertDialogTrigger = React.forwardRef<HTMLButtonElement, AlertDialogTriggerProps>(
  ({ children, className = '', render, onClick, asChild, ...props }, ref) => {
    const context = React.useContext(AlertDialogContext);
    if (!context) {
      throw new Error('AlertDialogTrigger must be used within AlertDialog');
    }

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      if (render && React.isValidElement(render) && (render.props as any).onClick) {
        (render.props as any).onClick(e);
      }
      context.setOpen(true);
    };

    if (render && React.isValidElement(render)) {
      const renderProps = render.props as any;
      return React.cloneElement(
        render as React.ReactElement<any>,
        {
          ref,
          'aria-haspopup': 'dialog',
          'aria-expanded': context.open,
          className: `${renderProps.className || ''} ${className}`.trim(),
          onClick: handleClick,
          ...props,
        },
        children || renderProps.children
      );
    }

    if (asChild && React.isValidElement(children)) {
      const childProps = children.props as any;
      return React.cloneElement(
        children as React.ReactElement<any>,
        {
          ref,
          'aria-haspopup': 'dialog',
          'aria-expanded': context.open,
          className: `${childProps.className || ''} ${className}`.trim(),
          onClick: handleClick,
          ...props,
        }
      );
    }

    return (
      <button
        ref={ref}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={context.open}
        className={className}
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    );
  }
);
AlertDialogTrigger.displayName = 'AlertDialogTrigger';

export interface AlertDialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'default' | 'sm' | 'lg';
}

export const AlertDialogContent = React.forwardRef<HTMLDivElement, AlertDialogContentProps>(
  ({ children, className = '', size = 'default', ...props }, ref) => {
    const context = React.useContext(AlertDialogContext);
    if (!context) {
      throw new Error('AlertDialogContent must be used within AlertDialog');
    }

    // Close on ESC key
    React.useEffect(() => {
      if (!context.open) return;
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          context.setOpen(false);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [context]);

    if (!context.open) return null;

    const sizeClasses =
      size === 'sm'
        ? 'max-w-xs sm:max-w-sm'
        : size === 'lg'
        ? 'max-w-lg sm:max-w-xl'
        : 'max-w-sm sm:max-w-md';

    const modalContent = (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Overlay Backdrop */}
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in-0 duration-150"
          onClick={() => context.setOpen(false)}
          aria-hidden="true"
        />

        {/* Dialog Panel */}
        <div
          ref={ref}
          role="alertdialog"
          aria-modal="true"
          className={`group/alert-dialog-content relative z-50 grid w-full gap-5 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl duration-200 outline-none animate-in fade-in-0 zoom-in-95 text-white ${sizeClasses} ${className}`}
          {...props}
        >
          {children}
        </div>
      </div>
    );

    if (typeof document !== 'undefined') {
      return createPortal(modalContent, document.body);
    }
    return modalContent;
  }
);
AlertDialogContent.displayName = 'AlertDialogContent';

export interface AlertDialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export const AlertDialogHeader: React.FC<AlertDialogHeaderProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`grid place-items-center gap-1.5 text-center sm:place-items-start sm:text-left ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
AlertDialogHeader.displayName = 'AlertDialogHeader';

export interface AlertDialogMediaProps extends React.HTMLAttributes<HTMLDivElement> {}

export const AlertDialogMedia: React.FC<AlertDialogMediaProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`mb-2 inline-flex size-11 items-center justify-center rounded-2xl shrink-0 transition-colors ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
AlertDialogMedia.displayName = 'AlertDialogMedia';

export interface AlertDialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export const AlertDialogTitle = React.forwardRef<HTMLHeadingElement, AlertDialogTitleProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <h2
        ref={ref}
        className={`text-lg font-bold text-white tracking-tight ${className}`}
        {...props}
      >
        {children}
      </h2>
    );
  }
);
AlertDialogTitle.displayName = 'AlertDialogTitle';

export interface AlertDialogDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export const AlertDialogDescription = React.forwardRef<
  HTMLParagraphElement,
  AlertDialogDescriptionProps
>(({ children, className = '', ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={`text-xs sm:text-sm text-slate-400 leading-relaxed ${className}`}
      {...props}
    >
      {children}
    </p>
  );
});
AlertDialogDescription.displayName = 'AlertDialogDescription';

export interface AlertDialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export const AlertDialogFooter: React.FC<AlertDialogFooterProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`-mx-6 -mb-6 mt-2 flex flex-col-reverse gap-2 rounded-b-2xl border-t border-slate-800/80 bg-slate-950/80 p-4 sm:flex-row sm:justify-end sm:gap-3 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
AlertDialogFooter.displayName = 'AlertDialogFooter';

export interface AlertDialogCancelProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'outline' | 'ghost' | 'secondary';
}

export const AlertDialogCancel = React.forwardRef<HTMLButtonElement, AlertDialogCancelProps>(
  ({ children, className = '', variant = 'outline', onClick, ...props }, ref) => {
    const context = React.useContext(AlertDialogContext);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      context?.setOpen(false);
    };

    return (
      <button
        ref={ref}
        type="button"
        className={`inline-flex items-center justify-center rounded-xl border border-slate-800 bg-slate-900/90 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all cursor-pointer ${className}`}
        onClick={handleClick}
        {...props}
      >
        {children || 'Cancel'}
      </button>
    );
  }
);
AlertDialogCancel.displayName = 'AlertDialogCancel';

export interface AlertDialogActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'warning' | 'purple';
}

export const AlertDialogAction = React.forwardRef<HTMLButtonElement, AlertDialogActionProps>(
  ({ children, className = '', variant = 'default', onClick, ...props }, ref) => {
    const context = React.useContext(AlertDialogContext);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      context?.setOpen(false);
    };

    const variantStyles =
      variant === 'destructive'
        ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30'
        : variant === 'warning'
        ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/30'
        : variant === 'purple'
        ? 'bg-[#7000FF] hover:bg-[#6200e0] text-white shadow-lg shadow-purple-600/30'
        : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/30';

    return (
      <button
        ref={ref}
        type="button"
        className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${variantStyles} ${className}`}
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    );
  }
);
AlertDialogAction.displayName = 'AlertDialogAction';
