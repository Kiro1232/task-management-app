import { Task } from '../../types';
import { Modal } from '../UI/Modal';
import { capitalizeFirstLetter, formatDateDDMMMYYYY } from '../../utils/date';

interface TaskDetailsModalProps {
  isOpen: boolean;
  task: Task | null;
  title: string;
  onClose: () => void;
}

function formatDate(value?: string | null): string {
  return formatDateDDMMMYYYY(value);
}

export function TaskDetailsModal({ isOpen, task, title, onClose }: TaskDetailsModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      {task ? (
        <div className="space-y-4">
          <div>
            <h3 className="mt-2 text-2xl font-semibold text-slate-900">
              {capitalizeFirstLetter(task.title)}
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600 whitespace-pre-wrap">
              {task.description?.trim() ? task.description : 'No description provided.'}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Detail label="Status" value={task.status} />
            <Detail label="Priority" value={task.priority} />
            <Detail label="Due date" value={formatDate(task.dueDate)} />
            <Detail label="Created" value={formatDate(task.createdAt)} />
            <Detail label="Updated" value={formatDate(task.updatedAt)} />
            <Detail label="Deleted" value={formatDate(task.deletedAt ?? null)} />
          </div>
        </div>
      ) : null}
    </Modal>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-900 break-words">{value}</p>
    </div>
  );
}
