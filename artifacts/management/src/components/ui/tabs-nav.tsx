/**
 * TabsNav — reusable accessible tab bar (WAI-ARIA Tabs pattern).
 *
 * Features:
 *  - role="tablist" / role="tab" / aria-selected / aria-controls
 *  - Roving focus: Left/Right arrows move focus; Home/End jump to ends
 *  - Horizontal scroll on narrow viewports
 *  - Optional icon (before label) and badge (after label) per tab
 *  - Generic over tab ID type → no cast needed in consumers
 *
 * Usage:
 *   const [tab, setTab] = useState<'info' | 'media'>('info');
 *
 *   <TabsNav
 *     tabs={[{ id: 'info', label: 'Info' }, { id: 'media', label: 'Media' }]}
 *     active={tab}
 *     onChange={setTab}
 *   />
 *
 *   {tab === 'info' && <div id="tabpanel-info" role="tabpanel">…</div>}
 */
import { useRef, type KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';

export interface TabItem<T extends string = string> {
  id: T;
  label: string;
  /** Optional icon rendered before the label */
  icon?: React.ReactNode;
  /** Optional badge / counter shown after the label */
  badge?: React.ReactNode;
}

interface TabsNavProps<T extends string> {
  tabs: TabItem<T>[];
  active: T;
  onChange: (id: T) => void;
  /** Optional id prefix used to wire aria-controls to panel ids (default "tab") */
  panelPrefix?: string;
  /** Extra class on the outer wrapper (e.g. to adjust bottom margin) */
  className?: string;
}

export function TabsNav<T extends string>({
  tabs,
  active,
  onChange,
  panelPrefix = 'tab',
  className,
}: TabsNavProps<T>) {
  const listRef = useRef<HTMLDivElement>(null);

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const buttons = Array.from(
      listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? [],
    );
    const currentIndex = buttons.findIndex((b) => b.getAttribute('data-id') === active);

    let nextIndex = currentIndex;
    if (e.key === 'ArrowRight') nextIndex = (currentIndex + 1) % buttons.length;
    else if (e.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
    else if (e.key === 'Home') nextIndex = 0;
    else if (e.key === 'End') nextIndex = buttons.length - 1;
    else return;

    e.preventDefault();
    buttons[nextIndex].focus();
    onChange(buttons[nextIndex].getAttribute('data-id') as T);
  }

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label="Navigasi tab"
      onKeyDown={handleKeyDown}
      className={cn('flex gap-0 border-b border-slate-200 -mx-1 overflow-x-auto', className)}
    >
      {tabs.map((t) => {
        const isActive = t.id === active;
        return (
          <button
            key={t.id}
            role="tab"
            data-id={t.id}
            id={`${panelPrefix}-tab-${t.id}`}
            aria-selected={isActive}
            aria-controls={`${panelPrefix}-panel-${t.id}`}
            tabIndex={isActive ? 0 : -1}
            type="button"
            onClick={() => onChange(t.id)}
            className={cn(
              'inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
              isActive
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300',
            )}
          >
            {t.icon}
            {t.label}
            {t.badge}
          </button>
        );
      })}
    </div>
  );
}
