import * as React from 'react';

interface CollapsibleContextType {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CollapsibleContext = React.createContext<CollapsibleContextType | null>(null);

export interface CollapsibleProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
}

export const Collapsible: React.FC<CollapsibleProps> = ({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  children,
  className = '',
  ...props
}) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
    },
    [isControlled, onOpenChange]
  );

  return (
    <CollapsibleContext.Provider value={{ open, onOpenChange: handleOpenChange }}>
      <div className={className} data-state={open ? 'open' : 'closed'} {...props}>
        {children}
      </div>
    </CollapsibleContext.Provider>
  );
};

export interface CollapsibleTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  render?: React.ReactElement;
}

export const CollapsibleTrigger = React.forwardRef<HTMLButtonElement, CollapsibleTriggerProps>(
  ({ children, className = '', onClick, render, ...props }, ref) => {
    const context = React.useContext(CollapsibleContext);
    if (!context) {
      throw new Error('CollapsibleTrigger must be used within Collapsible');
    }

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      if (render && React.isValidElement(render) && (render.props as any).onClick) {
        (render.props as any).onClick(e);
      }
      context.onOpenChange(!context.open);
    };

    if (render && React.isValidElement(render)) {
      const renderProps = render.props as any;
      return React.cloneElement(
        render as React.ReactElement<any>,
        {
          ref,
          'aria-expanded': context.open,
          'data-state': context.open ? 'open' : 'closed',
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
        data-state={context.open ? 'open' : 'closed'}
        className={className}
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    );
  }
);
CollapsibleTrigger.displayName = 'CollapsibleTrigger';

export interface CollapsibleContentProps extends React.HTMLAttributes<HTMLDivElement> {
  forceMount?: boolean;
  render?: React.ReactElement;
}

export const CollapsibleContent = React.forwardRef<HTMLDivElement, CollapsibleContentProps>(
  ({ children, className = '', forceMount, render, ...props }, ref) => {
    const context = React.useContext(CollapsibleContext);
    if (!context) {
      throw new Error('CollapsibleContent must be used within Collapsible');
    }

    if (!context.open && !forceMount) {
      return null;
    }

    if (render && React.isValidElement(render)) {
      const renderProps = render.props as any;
      return React.cloneElement(
        render as React.ReactElement<any>,
        {
          ref,
          'data-state': context.open ? 'open' : 'closed',
          className: `${renderProps.className || ''} ${className}`.trim(),
          ...props,
        },
        children
      );
    }

    return (
      <div
        ref={ref}
        data-state={context.open ? 'open' : 'closed'}
        className={className}
        {...props}
      >
        {children}
      </div>
    );
  }
);
CollapsibleContent.displayName = 'CollapsibleContent';
