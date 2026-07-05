import { useState, useEffect } from 'react';
import { Task, TaskStatus, TaskPriority, CreateTaskPayload } from '../../types';
import { Input } from '../UI/Input';
import { Button } from '../UI/Button';

interface TaskFormProps {
  task?: Task | null;
  onSubmit: (payload: CreateTaskPayload) => Promise<void>;
  onCancel: () => void;
}

interface FormErrors {
  title?: string;
  description?: string;
}

export function TaskForm({ task, onSubmit, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? TaskStatus.PENDING);
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? TaskPriority.MEDIUM);
  const [dueDate, setDueDate] = useState(
    task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync form when the editing task changes
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? '');
      setStatus(task.status);
      setPriority(task.priority);
      setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
    }
  }, [task]);

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!title.trim()) next.title = 'Title is required';
    else if (title.trim().length > 200) next.title = 'Title must be 200 characters or less';
    if (description.length > 1000) next.description = 'Description must be 1000 characters or less';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        priority,
        dueDate: dueDate || undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5" noValidate>
      <Input
        label="Title *"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add task Details..."
        error={errors.title}
        maxLength={200}
        autoFocus
      />

      {/* Description textarea */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add description details (optional)..."
          rows={3}
          maxLength={1000}
          className={[
            'w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400',
            'focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent',
            'transition-colors duration-150 resize-none bg-white',
            errors.description
              ? 'border-rose-400 bg-rose-50'
              : 'border-slate-300 hover:border-teal-400',
          ].join(' ')}
        />
        {errors.description && <p className="text-xs text-rose-600">{errors.description}</p>}
        <p className="text-xs text-slate-400 text-right">{description.length} / 1000</p>
      </div>

      {/* Status & Priority row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value={TaskStatus.PENDING}>Pending</option>
            <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
            <option value={TaskStatus.COMPLETED}>Completed</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value={TaskPriority.LOW}>Low</option>
            <option value={TaskPriority.MEDIUM}>Medium</option>
            <option value={TaskPriority.HIGH}>High</option>
          </select>
        </div>
      </div>

      <Input
        label="Due Date"
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
      />

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-3 border-t border-slate-100">
        <Button variant="secondary" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          isLoading={isSubmitting}
          className="bg-teal-600 hover:bg-teal-700 focus:ring-teal-500"
        >
          {task ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
}
