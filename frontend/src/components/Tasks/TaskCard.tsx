import { useState } from 'react';
import { Task, TaskStatus, TaskPriority } from '../../types';
import { Button } from '../UI/Button';
import { CheckIcon, EyeIcon, PencilIcon, TrashIcon } from '../UI/Icons';
import { formatDateDDMMMYYYY } from '../../utils/date';

interface TaskCardProps {
  task: Task;
  onView: (task: Task) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => Promise<void>;
  onPermanentDelete?: (taskId: string) => Promise<void>;
  onToggleComplete?: (task: Task) => Promise<void>;
  readOnly?: boolean;
}

const priorityConfig: Record<TaskPriority, { label: string; classes: string }> = {
  [TaskPriority.LOW]: { label: 'Low', classes: 'bg-teal-50 text-teal-700 ring-1 ring-teal-200' },
  [TaskPriority.MEDIUM]: {
    label: 'Medium',
    classes: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  },
  [TaskPriority.HIGH]: { label: 'High', classes: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200' },
};

const statusConfig: Record<TaskStatus, { label: string; classes: string }> = {
  [TaskStatus.PENDING]: {
    label: 'Pending',
    classes: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
  },
  [TaskStatus.IN_PROGRESS]: {
    label: 'In Progress',
    classes: 'bg-teal-50 text-teal-700 ring-1 ring-teal-200',
  },
  [TaskStatus.COMPLETED]: {
    label: 'Completed',
    classes: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  },
};

export function TaskCard({
  task,
  onView,
  onEdit,
  onDelete,
  onPermanentDelete,
  onToggleComplete,
  readOnly,
}: TaskCardProps) {
  const [isToggling, setIsToggling] = useState(false);
  const canToggle = !readOnly && !!onToggleComplete;

  const handleToggle = async () => {
    if (!onToggleComplete) return;
    setIsToggling(true);
    try {
      await onToggleComplete(task);
    } finally {
      setIsToggling(false);
    }
  };

  const isCompleted = task.status === TaskStatus.COMPLETED;

  return (
    <article
      className={[
        'group rounded-2xl border bg-white p-4 sm:p-5 shadow-sm',
        'transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5',
        isCompleted ? 'opacity-70 border-slate-200' : 'border-slate-200 hover:border-teal-200',
      ].join(' ')}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Toggle completion checkbox */}
        {canToggle && (
          <button
            onClick={handleToggle}
            disabled={isToggling}
            aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
            className={[
              'mt-0.5 h-6 w-6 flex-shrink-0 rounded-full border-2',
              'transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2',
              isCompleted
                ? 'bg-teal-500 border-teal-500 flex items-center justify-center shadow-sm'
                : 'border-slate-300 hover:border-teal-400 bg-white',
            ].join(' ')}
          >
            {isCompleted && <CheckIcon className="h-3.5 w-3.5 text-white" />}
          </button>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3
            className={`font-semibold text-slate-900 truncate ${isCompleted ? 'line-through text-slate-400' : ''}`}
          >
            {task.title}
          </h3>

          {task.description && (
            <p className="mt-1 text-sm text-slate-500 line-clamp-2">{task.description}</p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig[task.status].classes}`}
            >
              {statusConfig[task.status].label}
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${priorityConfig[task.priority].classes}`}
            >
              {priorityConfig[task.priority].label}
            </span>
            {task.dueDate && (
              <span className="text-xs text-gray-400">Due {formatDateDDMMMYYYY(task.dueDate)}</span>
            )}
          </div>
        </div>

        {/* Action buttons — revealed on hover for a clean default appearance */}
        <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-150 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(task)}
            aria-label="View task"
            title="View"
          >
            <EyeIcon />
          </Button>
          {!readOnly && onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(task)}
              aria-label="Edit task"
              title="Edit"
            >
              <PencilIcon />
            </Button>
          )}
          {!readOnly && onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void onDelete(task.taskId)}
              aria-label="Delete task"
              title="Delete"
            >
              <TrashIcon />
            </Button>
          )}
          {readOnly && onPermanentDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void onPermanentDelete(task.taskId)}
              aria-label="Permanently delete task"
              title="Permanently delete"
            >
              <TrashIcon />
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
