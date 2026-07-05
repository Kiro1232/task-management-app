import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../hooks/useTasks';
import { Task, TaskStatus, CreateTaskPayload, FilterValue, TaskCollection } from '../types';
import { Navbar } from '../components/Layout/Navbar';
import { TaskList } from '../components/Tasks/TaskList';
import { TaskFilter } from '../components/Tasks/TaskFilter';
import { TaskForm } from '../components/Tasks/TaskForm';
import { TaskDetailsModal } from '../components/Tasks/TaskDetailsModal';
import { Modal } from '../components/UI/Modal';
import { Button } from '../components/UI/Button';
import { Toast } from '../components/UI/Toast';
import { ConfirmDialog } from '../components/UI/ConfirmDialog';
import { PlusIcon } from '../components/UI/Icons';
import { TaskPagination } from '../components/Tasks/TaskPagination';

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
}

export function DashboardPage() {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState<FilterValue>('all');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [collectionView, setCollectionView] = useState<TaskCollection>('active');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [taskToToggle, setTaskToToggle] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  // Only pass a status filter to useTasks when a specific status is selected
  const statusFilter = activeFilter !== 'all' ? activeFilter : undefined;
  const {
    tasks,
    pagination,
    isLoading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    purgeDeletedTask,
    toggleComplete,
  } = useTasks(statusFilter, page, pageSize, collectionView);

  const showToast = useCallback((message: string, type: ToastState['type'] = 'success') => {
    setToast({ message, type });
  }, []);

  // Compute badge counts — always from the full task list
  const openCreate = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const openView = (task: Task) => {
    setViewingTask(task);
  };

  const handleFilterChange = (filter: FilterValue) => {
    setActiveFilter(filter);
    setPage(1);
  };

  const handleCollectionChange = (nextCollection: TaskCollection) => {
    setCollectionView(nextCollection);
    setPage(1);
    setEditingTask(null);
    setTaskToDelete(null);
    setTaskToToggle(null);
    setViewingTask(null);
  };

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
  };

  const openEdit = (task: Task) => {
    if (collectionView !== 'active') return;
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleFormSubmit = async (payload: CreateTaskPayload) => {
    try {
      if (editingTask) {
        await updateTask(editingTask.taskId, payload);
        showToast(`Updated “${payload.title}”`, 'info');
      } else {
        await createTask(payload);
        showToast(`Created “${payload.title}”`, 'success');
      }
      await fetchTasks();
      closeModal();
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      if (message.includes('identical task')) {
        showToast('Duplicate task detected. Use a different combination of values.', 'error');
        return;
      }
      showToast('Failed to save task. Please try again.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (collectionView !== 'active') return;
    const task = tasks.find((item) => item.taskId === id) ?? null;
    setTaskToDelete(task);
  };

  const handlePermanentDelete = async (id: string) => {
    if (collectionView !== 'deleted') return;
    const task = tasks.find((item) => item.taskId === id) ?? null;
    setTaskToDelete(task);
  };

  const handleToggleRequest = async (task: Task) => {
    if (collectionView !== 'active') return;
    setTaskToToggle(task);
  };

  const confirmDelete = async () => {
    if (!taskToDelete) return;
    setIsDeleting(true);
    try {
      if (collectionView === 'deleted') {
        await purgeDeletedTask(taskToDelete.taskId);
        showToast(`Permanently deleted “${taskToDelete.title}”`, 'error');
      } else {
        await deleteTask(taskToDelete.taskId);
        showToast(`Deleted “${taskToDelete.title}”`, 'error');
      }
      await fetchTasks();
      setTaskToDelete(null);
    } catch {
      showToast('Failed to delete task.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmToggle = async () => {
    if (!taskToToggle) return;
    setIsToggling(true);
    try {
      await toggleComplete(taskToToggle);
      await fetchTasks();
      const next = taskToToggle.status === TaskStatus.COMPLETED ? 'incomplete' : 'complete';
      showToast(`Marked “${taskToToggle.title}” as ${next}`, 'info');
      setTaskToToggle(null);
    } catch {
      showToast('Failed to update task.', 'error');
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(20,184,166,0.12),transparent_28%),linear-gradient(180deg,#f8fffe_0%,#f4fdfa_100%)]">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-10">
        {/* Page header */}
        <div className="mb-8 overflow-hidden rounded-[2rem] border border-teal-100 bg-white/85 shadow-[0_20px_60px_rgba(15,118,110,0.08)] backdrop-blur">
          <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1.15fr_0.85fr] lg:p-8">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-600">
                Workspace overview
              </p>
              <h1 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
                <span className="text-teal-gradient">My Tasks</span>
              </h1>
              <p className="mt-3 max-w-xl text-sm sm:text-base leading-6 text-slate-500">
                Welcome back, <span className="font-semibold text-slate-700">{user?.name}</span>.
                You have{' '}
                <span className="font-semibold text-slate-900">{pagination.totalItems}</span>{' '}
                {collectionView === 'active' ? 'active task' : 'deleted task'}
                {pagination.totalItems !== 1 ? 's' : ''} ready to review.
              </p>

              <div className="mt-4 inline-flex rounded-full border border-slate-200 bg-slate-50 p-1 shadow-sm">
                <Button
                  variant={collectionView === 'active' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => handleCollectionChange('active')}
                  className={
                    collectionView === 'active' ? 'bg-teal-600 text-white hover:bg-teal-700' : ''
                  }
                >
                  Active Tasks
                </Button>
                <Button
                  variant={collectionView === 'deleted' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => handleCollectionChange('deleted')}
                  className={
                    collectionView === 'deleted' ? 'bg-slate-900 text-white hover:bg-slate-800' : ''
                  }
                >
                  Deleted Tasks
                </Button>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-teal-100 bg-teal-50/70 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-teal-600">Pending</p>
                  <p className="mt-1 text-2xl font-semibold text-teal-800">
                    {pagination.statusCounts?.pending ?? 0}
                  </p>
                </div>
                <div className="rounded-2xl border border-cyan-100 bg-cyan-50/70 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-cyan-600">In Progress</p>
                  <p className="mt-1 text-2xl font-semibold text-cyan-800">
                    {pagination.statusCounts?.in_progress ?? 0}
                  </p>
                </div>
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-emerald-600">Completed</p>
                  <p className="mt-1 text-2xl font-semibold text-emerald-800">
                    {pagination.statusCounts?.completed ?? 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-[1.75rem] border border-slate-200 bg-slate-950 p-5 text-white shadow-xl shadow-slate-900/10">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.25em] text-teal-200">
                  {collectionView === 'active' ? 'Quick action' : 'Archive view'}
                </p>
                <p className="mt-3 text-lg font-semibold text-white">
                  {collectionView === 'active'
                    ? 'Capture the next task before it gets lost.'
                    : 'Review archived tasks without affecting the active board.'}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {collectionView === 'active'
                    ? 'Use the fast create flow to keep momentum high and your board clean.'
                    : 'Deleted records stay in a separate collection and are hidden from the active list.'}
                </p>
              </div>

              {collectionView === 'active' ? (
                <Button
                  onClick={openCreate}
                  size="lg"
                  className="mt-6 w-full bg-teal-500 hover:bg-teal-400 text-slate-950 focus:ring-teal-300 shadow-lg shadow-teal-500/30"
                >
                  <PlusIcon />
                  New Task
                </Button>
              ) : (
                <Button
                  onClick={() => handleCollectionChange('active')}
                  size="lg"
                  className="mt-6 w-full bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-300 shadow-lg shadow-teal-500/30"
                >
                  Back to Active Tasks
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="mb-6">
          <TaskFilter activeFilter={activeFilter} onFilterChange={handleFilterChange} />
        </div>

        {/* Task list */}
        <TaskList
          tasks={tasks}
          isLoading={isLoading}
          error={error}
          activeFilter={activeFilter}
          onView={openView}
          onEdit={openEdit}
          onDelete={handleDelete}
          onPermanentDelete={handlePermanentDelete}
          onToggleComplete={handleToggleRequest}
          readOnly={collectionView === 'deleted'}
        />

        <TaskPagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          limit={pagination.limit}
          onPageChange={handlePageChange}
        />
      </main>

      {/* Create / Edit modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingTask ? 'Edit Task' : 'New Task'}
        size="xl"
      >
        <TaskForm task={editingTask} onSubmit={handleFormSubmit} onCancel={closeModal} />
      </Modal>

      <ConfirmDialog
        isOpen={!!taskToDelete}
        title={collectionView === 'deleted' ? 'Permanently delete task' : 'Delete task'}
        message={
          collectionView === 'deleted'
            ? `This will permanently remove ${taskToDelete?.title ?? 'this task'} from the database. This action cannot be undone.`
            : `This will permanently remove ${taskToDelete?.title ?? 'this task'}. This action cannot be undone.`
        }
        confirmLabel={collectionView === 'deleted' ? 'Permanently delete' : 'Delete task'}
        isProcessing={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setTaskToDelete(null)}
      />

      <ConfirmDialog
        isOpen={!!taskToToggle}
        title={
          taskToToggle?.status === TaskStatus.COMPLETED ? 'Mark as incomplete' : 'Mark as complete'
        }
        message={`Are you sure you want to ${taskToToggle?.status === TaskStatus.COMPLETED ? 'reopen' : 'complete'} “${taskToToggle?.title ?? 'this task'}”?`}
        confirmLabel={
          taskToToggle?.status === TaskStatus.COMPLETED ? 'Mark incomplete' : 'Mark complete'
        }
        isProcessing={isToggling}
        onConfirm={confirmToggle}
        onCancel={() => setTaskToToggle(null)}
      />

      <TaskDetailsModal
        isOpen={!!viewingTask}
        task={viewingTask}
        title={collectionView === 'deleted' ? 'Deleted task details' : 'Task details'}
        onClose={() => setViewingTask(null)}
      />

      {/* Toast notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
