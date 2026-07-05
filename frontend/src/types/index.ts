// ─── Domain Enums ──────────────────────────────────────────────────────────────

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

// ─── Domain Models ─────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Task {
  id: string;
  taskId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

// ─── API Shapes ────────────────────────────────────────────────────────────────

/** Standard success envelope returned by the backend TransformInterceptor */
export interface ApiResponse<T> {
  data: T;
  timestamp: string;
}

export interface PaginatedApiResponse<T> {
  items: T;
  meta: {
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
  };
}

/** Standard error shape returned by the backend HttpExceptionFilter */
export interface ApiError {
  statusCode: number;
  message: string | string[];
  timestamp: string;
  path: string;
  method: string;
}

// ─── Request Payloads ──────────────────────────────────────────────────────────

export interface CreateTaskPayload {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
}

export type UpdateTaskPayload = Partial<CreateTaskPayload>;

// ─── UI State ──────────────────────────────────────────────────────────────────

export type FilterValue = TaskStatus | 'all';
export type TaskCollection = 'active' | 'deleted';
