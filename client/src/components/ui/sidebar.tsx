import React, { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  useCallback 
} from 'react';
import { 
  PanelLeft, 
  ChevronDown, 
  ChevronRight,
  Sparkles
} from 'lucide-react';

/* ========================================================
   1. TYPES & CONTEXT
   ======================================================== */

export type SidebarState = 'expanded' | 'collapsed';

interface SidebarContextValue {
  state: SidebarState;
  setState: React.Dispatch<React.SetStateAction<SidebarState>>;
  isMobile: boolean;
  openMobile: boolean;
  setOpenMobile: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSidebar: () => void;
  collapsible: 'hidden' | 'dock' | 'none';
  setCollapsible: React.Dispatch<React.SetStateAction<'hidden' | 'dock' | 'none'>>;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function useSidebar(): SidebarContextValue {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a <SidebarProvider />');
  }
  return context;
}

/* ========================================================
   2. SIDEBAR PROVIDER
   ======================================================== */

export interface SidebarProviderProps {
  defaultOpen?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  shortcut?: string;
  className?: string;
  children: React.ReactNode;
}

export const SidebarProvider: React.FC<SidebarProviderProps> = ({
  defaultOpen = true,
  isOpen,
  onOpenChange,
  shortcut = 'b',
  className = '',
  children
}) => {
  const [internalState, setInternalState] = useState<SidebarState>(
    defaultOpen ? 'expanded' : 'collapsed'
  );
  const [collapsible, setCollapsible] = useState<'hidden' | 'dock' | 'none'>('dock');
  const [openMobile, setOpenMobile] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Sync controlled state if provided
  const state = isOpen !== undefined ? (isOpen ? 'expanded' : 'collapsed') : internalState;

  const setState: React.Dispatch<React.SetStateAction<SidebarState>> = useCallback(
    (action) => {
      const next = typeof action === 'function' ? action(state) : action;
      if (onOpenChange) {
        onOpenChange(next === 'expanded');
      } else {
        setInternalState(next);
      }
    },
    [state, onOpenChange]
  );

  const toggleSidebar = useCallback(() => {
    if (isMobile) {
      setOpenMobile(prev => !prev);
    } else {
      setState(prev => (prev === 'expanded' ? 'collapsed' : 'expanded'));
    }
  }, [isMobile, setState]);

  // Window resize listener
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Shortcut listener (Ctrl/Cmd + B)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === shortcut.toLowerCase()) {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcut, toggleSidebar]);

  return (
    <SidebarContext.Provider
      value={{
        state,
        setState,
        isMobile,
        openMobile,
        setOpenMobile,
        toggleSidebar,
        collapsible,
        setCollapsible
      }}
    >
      <div className={`relative flex min-h-screen w-full ${className}`}>
        {children}
      </div>
    </SidebarContext.Provider>
  );
};

/* ========================================================
   3. SIDEBAR SHELL
   ======================================================== */

export interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  collapsible?: 'hidden' | 'dock' | 'none';
  intent?: 'default' | 'float' | 'inset';
  side?: 'left' | 'right';
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsible = 'dock',
  intent = 'default',
  side = 'left',
  className = '',
  children,
  ...props
}) => {
  const { state, isMobile, openMobile, setOpenMobile, setCollapsible } = useSidebar();

  useEffect(() => {
    setCollapsible(collapsible);
  }, [collapsible, setCollapsible]);

  const isCollapsed = state === 'collapsed';

  // Mobile Drawer
  if (isMobile) {
    if (!openMobile) return null;
    return (
      <div className="fixed inset-0 z-50 flex">
        {/* Backdrop */}
        <div 
          onClick={() => setOpenMobile(false)} 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" 
        />
        {/* Drawer Content */}
        <div 
          className={`relative z-10 flex h-full w-72 max-w-[85vw] flex-col bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 p-4 shadow-2xl animate-in slide-in-from-left duration-200 ${className}`}
          {...props}
        >
          {children}
        </div>
      </div>
    );
  }

  // Desktop Sidebar (Collapsible Dock or Expanded)
  const widthClass = isCollapsed ? 'w-18' : 'w-64';

  return (
    <aside
      data-state={state}
      data-collapsible={collapsible}
      className={`relative z-30 shrink-0 select-none transition-all duration-300 ease-in-out border-r border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/95 backdrop-blur-xl flex flex-col justify-between ${widthClass} ${className}`}
      {...props}
    >
      {children}
    </aside>
  );
};

/* ========================================================
   4. HEADER, CONTENT, FOOTER
   ======================================================== */

export const SidebarHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <div 
      className={`flex h-16 shrink-0 items-center border-b border-slate-200 dark:border-slate-800/80 px-3.5 transition-all ${
        isCollapsed ? 'justify-center px-2' : ''
      } ${className}`} 
      {...props}
    >
      {children}
    </div>
  );
};

export const SidebarContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <div 
    className={`flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-4 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-800 ${className}`} 
    {...props}
  >
    {children}
  </div>
);

export const SidebarFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({
  className = '',
  children,
  ...props
}, ref) => (
  <div 
    ref={ref}
    className={`shrink-0 border-t border-slate-200 dark:border-slate-800/80 p-2.5 transition-all ${className}`} 
    {...props}
  >
    {children}
  </div>
));
SidebarFooter.displayName = 'SidebarFooter';

/* ========================================================
   5. SECTIONS & GROUPS
   ======================================================== */

export const SidebarSectionGroup: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <div className={`space-y-4 ${className}`} {...props}>
    {children}
  </div>
);

export interface SidebarSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
}

export const SidebarSection: React.FC<SidebarSectionProps> = ({
  label,
  className = '',
  children,
  ...props
}) => {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <div className={`space-y-1 ${className}`} {...props}>
      {label && !isCollapsed && (
        <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5 animate-in fade-in">
          {label}
        </span>
      )}
      {children}
    </div>
  );
};

/* ========================================================
   6. ITEMS, LABELS, BADGES & LINKS
   ======================================================== */

export interface SidebarItemProps {
  tooltip?: string;
  isCurrent?: boolean;
  href?: string;
  onClick?: () => void;
  badge?: string | number;
  className?: string;
  children: React.ReactNode | ((props: { isCollapsed: boolean; isFocused: boolean }) => React.ReactNode);
}

export const SidebarItem: React.FC<SidebarItemProps> = ({
  tooltip,
  isCurrent = false,
  href,
  onClick,
  badge,
  className = '',
  children
}) => {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const [hovered, setHovered] = useState<boolean>(false);

  const Comp = href ? 'a' : 'button';

  return (
    <div className="relative group">
      <Comp
        href={href}
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer select-none ${
          isCollapsed ? 'justify-center px-2' : 'justify-between'
        } ${
          isCurrent
            ? 'bg-cyan-50 dark:bg-cyan-500/15 text-cyan-900 dark:text-white border border-cyan-300/80 dark:border-cyan-500/40 shadow-sm dark:shadow-[0_0_15px_-3px_rgba(6,182,212,0.25)] font-bold'
            : 'text-slate-600 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent'
        } ${className}`}
      >
        <div className={`flex items-center gap-3 min-w-0 ${isCollapsed ? 'justify-center' : ''}`}>
          {typeof children === 'function' ? children({ isCollapsed, isFocused: false }) : children}
        </div>

        {badge !== undefined && !isCollapsed && (
          <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20 dark:border-cyan-500/40">
            {badge}
          </span>
        )}
      </Comp>

      {/* Tooltip on Dock mode hover */}
      {isCollapsed && tooltip && hovered && (
        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 whitespace-nowrap rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-1 text-xs font-semibold text-white shadow-2xl animate-in fade-in zoom-in-95 pointer-events-none">
          {tooltip}
        </div>
      )}
    </div>
  );
};

export const SidebarLabel: React.FC<React.HTMLAttributes<HTMLSpanElement>> = ({
  className = '',
  children,
  ...props
}) => {
  const { state } = useSidebar();
  if (state === 'collapsed') return null;

  return (
    <span className={`truncate text-xs font-semibold ${className}`} {...props}>
      {children}
    </span>
  );
};

export const SidebarBadge: React.FC<React.HTMLAttributes<HTMLSpanElement>> = ({
  className = '',
  children,
  ...props
}) => {
  const { state } = useSidebar();
  if (state === 'collapsed') return null;

  return (
    <span 
      className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 ${className}`} 
      {...props}
    >
      {children}
    </span>
  );
};

export const SidebarLink: React.FC<React.AnchorHTMLAttributes<HTMLAnchorElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <span className={`flex items-center gap-2.5 ${className}`} {...props}>
    {children}
  </span>
);

export const SidebarMenuTrigger: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <button
    type="button"
    className={`p-1 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors ${className}`}
    {...props}
  >
    {children}
  </button>
);

/* ========================================================
   7. DISCLOSURE & ACCORDION
   ======================================================== */

interface DisclosureContextType {
  expandedKeys: (string | number)[];
  toggleKey: (key: string | number) => void;
}

const DisclosureContext = createContext<DisclosureContextType>({
  expandedKeys: [],
  toggleKey: () => {}
});

export interface SidebarDisclosureGroupProps {
  defaultExpandedKeys?: (string | number)[];
  children: React.ReactNode;
}

export const SidebarDisclosureGroup: React.FC<SidebarDisclosureGroupProps> = ({
  defaultExpandedKeys = [],
  children
}) => {
  const [expandedKeys, setExpandedKeys] = useState<(string | number)[]>(defaultExpandedKeys);

  const toggleKey = (key: string | number) => {
    setExpandedKeys(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  return (
    <DisclosureContext.Provider value={{ expandedKeys, toggleKey }}>
      <div className="space-y-1.5">{children}</div>
    </DisclosureContext.Provider>
  );
};

interface SingleDisclosureContextType {
  id: string | number;
  isOpen: boolean;
}

const SingleDisclosureContext = createContext<SingleDisclosureContextType>({
  id: '',
  isOpen: false
});

export const SidebarDisclosure: React.FC<{ id: string | number; children: React.ReactNode }> = ({
  id,
  children
}) => {
  const { expandedKeys } = useContext(DisclosureContext);
  const isOpen = expandedKeys.includes(id);

  return (
    <SingleDisclosureContext.Provider value={{ id, isOpen }}>
      <div className="space-y-1">{children}</div>
    </SingleDisclosureContext.Provider>
  );
};

export const SidebarDisclosureTrigger: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  className = '',
  children,
  ...props
}) => {
  const { toggleKey } = useContext(DisclosureContext);
  const { id, isOpen } = useContext(SingleDisclosureContext);
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  if (isCollapsed) return null;

  return (
    <button
      type="button"
      onClick={() => toggleKey(id)}
      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer ${className}`}
      {...props}
    >
      <div className="flex items-center gap-2.5 truncate">{children}</div>
      <ChevronDown className={`w-3.5 h-3.5 text-slate-400 dark:text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-slate-900 dark:text-white' : ''}`} />
    </button>
  );
};

export const SidebarDisclosurePanel: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => {
  const { isOpen } = useContext(SingleDisclosureContext);
  const { state } = useSidebar();

  if (!isOpen || state === 'collapsed') return null;

  return (
    <div className={`pl-4 space-y-1 border-l border-slate-200 dark:border-slate-800/80 ml-4 animate-in fade-in duration-150 ${className}`} {...props}>
      {children}
    </div>
  );
};

/* ========================================================
   8. TRIGGERS, RAILS & INSET
   ======================================================== */

export const SidebarTrigger: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  className = '',
  ...props
}) => {
  const { toggleSidebar } = useSidebar();

  return (
    <button
      type="button"
      onClick={toggleSidebar}
      className={`flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer shadow-sm ${className}`}
      title="Toggle Sidebar (Ctrl+B)"
      {...props}
    >
      <PanelLeft className="h-4.5 w-4.5" />
    </button>
  );
};

export const SidebarRail: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  className = '',
  ...props
}) => {
  const { toggleSidebar } = useSidebar();

  return (
    <button
      type="button"
      onClick={toggleSidebar}
      className={`absolute -right-2.5 top-1/2 -translate-y-1/2 hidden lg:flex h-6 w-5 items-center justify-center rounded-r-md border border-slate-800 bg-slate-900 text-slate-500 hover:text-white transition-all cursor-pointer z-40 ${className}`}
      title="Collapse / Expand Dock"
      {...props}
    >
      <div className="w-1 h-3 rounded-full bg-slate-600 hover:bg-cyan-400" />
    </button>
  );
};

export const SidebarInset: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <main className={`relative flex flex-1 flex-col min-w-0 min-h-screen overflow-x-hidden ${className}`} {...props}>
    {children}
  </main>
);

export const SidebarNav: React.FC<React.HTMLAttributes<HTMLElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <nav className={`sticky top-0 z-30 flex h-16 w-full shrink-0 items-center justify-between border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 px-4 backdrop-blur-xl sm:px-6 ${className}`} {...props}>
    {children}
  </nav>
);
