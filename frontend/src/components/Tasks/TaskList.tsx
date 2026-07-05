import { Task, FilterValue } from '../../types';
import { TaskCard } from './TaskCard';
import { Spinner } from '../UI/Spinner';

interface TaskListProps {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  activeFilter: FilterValue;
  onView: (task: Task) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => Promise<void>;
  onPermanentDelete?: (taskId: string) => Promise<void>;
  onToggleComplete?: (task: Task) => Promise<void>;
  readOnly?: boolean;
}

export function TaskList({
  tasks,
  isLoading,
  error,
  activeFilter,
  onView,
  onEdit,
  onDelete,
  onPermanentDelete,
  onToggleComplete,
  readOnly,
}: TaskListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50/80 p-6 text-center shadow-sm">
        <p className="font-semibold text-rose-700">Failed to load tasks</p>
        <p className="mt-1 text-sm leading-6 text-rose-500">{error}</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    const isFiltered = activeFilter !== 'all';
    return (
      <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-teal-200 bg-white/70 px-6 py-20 text-center shadow-sm">
        <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-3xl ring-1 ring-teal-200">
          📋
        </span>
        <p className="text-lg font-semibold text-slate-700">
          {isFiltered ? `No ${activeFilter.replace('_', ' ')} tasks` : 'No tasks yet'}
        </p>
        <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
          {isFiltered
            ? 'Try a different filter or create a new task.'
            : 'Click "+ New Task" to get started!'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskCard
          key={task.taskId}
          task={task}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          onPermanentDelete={onPermanentDelete}
          onToggleComplete={onToggleComplete}
          readOnly={readOnly}
        />
      ))}
    </div>
  );
}
