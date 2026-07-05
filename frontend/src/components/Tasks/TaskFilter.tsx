import { TaskStatus, FilterValue } from '../../types';

interface TaskFilterProps {
  activeFilter: FilterValue;
  onFilterChange: (filter: FilterValue) => void;
}

const FILTERS: { label: string; value: FilterValue }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: TaskStatus.PENDING },
  { label: 'In Progress', value: TaskStatus.IN_PROGRESS },
  { label: 'Completed', value: TaskStatus.COMPLETED },
];

export function TaskFilter({ activeFilter, onFilterChange }: TaskFilterProps) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter tasks by status">
      {FILTERS.map(({ label, value }) => {
        const isActive = activeFilter === value;
        return (
          <button
            key={value}
            onClick={() => onFilterChange(value)}
            aria-pressed={isActive}
            className={[
              'inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium',
              'transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1',
              isActive
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-teal-50',
            ].join(' ')}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
