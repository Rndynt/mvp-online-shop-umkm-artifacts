/**
 * TabsNav — reusable underline-style tab bar.
 *
 * Usage:
 *   const [tab, setTab] = useState<'info' | 'media'>('info');
 *   <TabsNav tabs={[{ id: 'info', label: 'Info' }, { id: 'media', label: 'Media' }]} active={tab} onChange={setTab} />
 *   {tab === 'info' && <InfoContent />}
 *
 * The component is intentionally ID-agnostic: pass any string union as the ID type.
 */
import { cn } from '@/lib/utils';

export interface TabItem {
  id: string;
  label: string;
  /** Optional icon rendered before the label */
  icon?: React.ReactNode;
  /** Optional badge / counter shown after the label */
  badge?: React.ReactNode;
}

interface TabsNavProps {
  tabs: TabItem[];
  active: string;
  onChange: (id: string) => void;
  /** Extra class on the outer wrapper (e.g. to adjust bottom margin) */
  className?: string;
}

export function TabsNav({ tabs, active, onChange, className }: TabsNavProps) {
  return (
    <div className={cn('flex gap-0 border-b border-slate-200 -mx-1 overflow-x-auto', className)}>
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          className={cn(
            'inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap shrink-0',
            active === t.id
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300',
          )}
        >
          {t.icon}
          {t.label}
          {t.badge}
        </button>
      ))}
    </div>
  );
}
