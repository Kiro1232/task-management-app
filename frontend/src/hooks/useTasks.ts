import { useState, useCallback, useEffect } from 'react';
import { AxiosError } from 'axios';
import apiClient from '../api/axios';
import {
  Task,
  ApiResponse,
  PaginatedApiResponse,
  CreateTaskPayload,
  UpdateTaskPayload,
  TaskStatus,
  TaskCollection,
} from '../types';

interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  statusCounts: {
    pending: number;
    in_progress: number;
    completed: number;
  };
}

function extractErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const msg = error.response?.data?.message;
    return Array.isArray(msg) ? msg.join(', ') : (msg as string) || 'An unexpected error occurred';
  }
  return 'An unexpected error occurred';
}

/**
 * Hook that manages paginated task CRUD operations and local state.
 * Accepts an optional status filter and page controls to scope the fetch request.
 */
export function useTasks(
  statusFilter?: TaskStatus,
  page = 1,
  limit = 10,
  collection: TaskCollection = 'active'
) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page,
    limit,
    totalItems: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
    statusCounts: {
      pending: 0,
      in_progress: 0,
      completed: 0,
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {
        page: String(page),
        limit: String(limit),
      };
      if (statusFilter) params.status = statusFilter;
      const endpoint = collection === 'deleted' ? '/tasks/deleted' : '/tasks';
      const res = await apiClient.get<ApiResponse<PaginatedApiResponse<Task[]>>>(endpoint, {
        params,
      });
      setTasks(res.data.data.items);
      setPagination(res.data.data.meta);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, page, limit, collection]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = useCallback(
    async (payload: CreateTaskPayload): Promise<Task> => {
      if (collection !== 'active') {
        throw new Error('Task creation is unavailable in the deleted tasks view');
      }
      const res = await apiClient.post<ApiResponse<Task>>('/tasks', payload);
      const newTask = res.data.data;
      setTasks((prev) => [newTask, ...prev].slice(0, limit));
      return newTask;
    },
    [collection, limit]
  );

  const updateTask = useCallback(
    async (taskId: string, payload: UpdateTaskPayload): Promise<Task> => {
      if (collection !== 'active') {
        throw new Error('Task updates are unavailable in the deleted tasks view');
      }
      const res = await apiClient.put<ApiResponse<Task>>(`/tasks/${taskId}`, payload);
      const updated = res.data.data;
      setTasks((prev) => prev.map((t) => (t.taskId === taskId ? updated : t)));
      return updated;
    },
    [collection]
  );

  const deleteTask = useCallback(
    async (taskId: string): Promise<void> => {
      if (collection !== 'active') {
        throw new Error('Task deletion is unavailable in the deleted tasks view');
      }
      await apiClient.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((t) => t.taskId !== taskId));
    },
    [collection]
  );

  const purgeDeletedTask = useCallback(
    async (taskId: string): Promise<void> => {
      if (collection !== 'deleted') {
        throw new Error('Permanent delete is only available in the deleted tasks view');
      }
      await apiClient.delete(`/tasks/deleted/${taskId}`);
      setTasks((prev) => prev.filter((t) => t.taskId !== taskId));
    },
    [collection]
  );

  const toggleComplete = useCallback(
    async (task: Task): Promise<void> => {
      const nextStatus =
        task.status === TaskStatus.COMPLETED ? TaskStatus.PENDING : TaskStatus.COMPLETED;
      await updateTask(task.taskId, { status: nextStatus });
    },
    [updateTask]
  );

  return {
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
  };
}
