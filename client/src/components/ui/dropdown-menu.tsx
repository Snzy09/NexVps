import * as React from 'react';

interface DropdownMenuContextType {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextType | null>(null);

export interface DropdownMenuProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  children,
  open: controlledOpen,
  onOpenChange,
}) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
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
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block text-left">{children}</div>
    </DropdownMenuContext.Provider>
  );
};

export interface DropdownMenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  render?: React.ReactElement;
}

export const DropdownMenuTrigger = React.forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(
  ({ children, className = '', render, onClick, ...props }, ref) => {
    const context = React.useContext(DropdownMenuContext);
    if (!context) {
      throw new Error('DropdownMenuTrigger must be used within DropdownMenu');
    }

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      if (render && React.isValidElement(render) && (render.props as any).onClick) {
        (render.props as any).onClick(e);
      }
      context.setOpen((prev) => !prev);
    };

    if (render && React.isValidElement(render)) {
      const renderProps = render.props as any;
      return React.cloneElement(
        render as React.ReactElement<any>,
        {
          ref,
          'aria-expanded': context.open,
          'aria-haspopup': 'menu',
          className: `${renderProps.className || ''} ${className}`.trim(),
          onClick: handleClick,
          ...props,
        },
        children
      );
    }

    return (
      <button
        ref={ref}
        type="button"
        aria-expanded={context.open}
        aria-haspopup="menu"
        className={className}
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    );
  }
);
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';

export interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
}

export const DropdownMenuContent = React.forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  ({ children, className = '', align = 'end', sideOffset = 8, ...props }, ref) => {
    const context = React.useContext(DropdownMenuContext);
    const contentRef = React.useRef<HTMLDivElement | null>(null);

    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          contentRef.current &&
          !contentRef.current.contains(event.target as Node) &&
          !contentRef.current.parentElement?.contains(event.target as Node)
        ) {
          context?.setOpen(false);
        }
      };

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          context?.setOpen(false);
        }
      };

      if (context?.open) {
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }, [context]);

    if (!context?.open) return null;

    const alignStyles =
      align === 'end'
        ? 'right-0'
        : align === 'center'
        ? 'left-1/2 -translate-x-1/2'
        : 'left-0';

    return (
      <div
        ref={(node) => {
          contentRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) (ref as any).current = node;
        }}
        role="menu"
        className={`absolute z-50 mt-2 min-w-[8rem] overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#182234] p-1.5 text-slate-950 dark:text-slate-50 shadow-2xl backdrop-blur-xl animate-in fade-in-0 zoom-in-95 ${alignStyles} ${className}`}
        style={{ top: `calc(100% + ${sideOffset - 8}px)` }}
        {...props}
      >
        {children}
      </div>
    );
  }
);
DropdownMenuContent.displayName = 'DropdownMenuContent';

export const DropdownMenuGroup: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <div className={`space-y-0.5 ${className}`} {...props}>
      {children}
    </div>
  );
};

export interface DropdownMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {
  disabled?: boolean;
}

export const DropdownMenuItem = React.forwardRef<HTMLDivElement, DropdownMenuItemProps>(
  ({ className = '', disabled, onClick, children, ...props }, ref) => {
    const context = React.useContext(DropdownMenuContext);

    return (
      <div
        ref={ref}
        role="menuitem"
        aria-disabled={disabled}
        onClick={(e) => {
          if (disabled) return;
          onClick?.(e);
        }}
        className={`relative flex select-none items-center rounded-xl px-2.5 py-2 text-xs font-medium outline-none transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer ${
          disabled ? 'pointer-events-none opacity-50' : ''
        } ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);
DropdownMenuItem.displayName = 'DropdownMenuItem';

export const DropdownMenuLabel: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <div
      className={`px-2.5 py-1.5 text-xs font-semibold text-slate-900 dark:text-slate-100 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const DropdownMenuSeparator: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  ...props
}) => {
  return (
    <div
      className={`-mx-1.5 my-1.5 h-px bg-slate-200 dark:bg-slate-800/80 ${className}`}
      {...props}
    />
  );
};
