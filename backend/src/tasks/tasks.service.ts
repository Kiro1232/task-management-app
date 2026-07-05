import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task, TaskDocument, TaskStatus, TaskPriority } from './schemas/task.schema';
import { DeletedTask, DeletedTaskDocument } from './schemas/deleted-task.schema';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

export interface TaskQueryFilter {
  status?: TaskStatus;
  priority?: string;
}

export interface PaginatedTasksResult<T = TaskDocument> {
  items: T[];
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

function normalizeText(value?: string): string {
  return (value ?? '').trim();
}

type NormalizedTaskValues = {
  title: string;
  description: string;
  dueDate: Date | null;
  status: TaskStatus;
  priority: TaskPriority;
};

function normalizeTaskValues(
  dto: Pick<CreateTaskDto, 'title' | 'description' | 'dueDate' | 'status' | 'priority'>,
): NormalizedTaskValues {
  const title = normalizeText(dto.title);
  if (!title) {
    throw new BadRequestException('Title cannot be empty');
  }

  const description = normalizeText(dto.description);
  const dueDate = dto.dueDate ? new Date(dto.dueDate) : null;
  const status = dto.status ?? TaskStatus.PENDING;
  const priority = dto.priority ?? TaskPriority.MEDIUM;

  return { title, description, dueDate, status, priority };
}

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>,
    @InjectModel(DeletedTask.name) private readonly deletedTaskModel: Model<DeletedTaskDocument>,
  ) {}

  async create(userId: string, dto: CreateTaskDto): Promise<TaskDocument> {
    const { title, description, dueDate, status, priority } = normalizeTaskValues(dto);

    const duplicate = await this.taskModel.findOne({
      userId: new Types.ObjectId(userId),
      title,
      description,
      status,
      priority,
      dueDate,
    });

    if (duplicate) {
      throw new ConflictException('An identical task already exists');
    }

    const task = new this.taskModel({
      title,
      description,
      status,
      priority,
      dueDate,
      userId: new Types.ObjectId(userId),
    });
    return task.save();
  }

  async findAll(
    userId: string,
    filter: TaskQueryFilter = {},
    page = DEFAULT_PAGE,
    limit = DEFAULT_LIMIT,
  ): Promise<PaginatedTasksResult<TaskDocument>> {
    const query: Record<string, unknown> = {
      userId: new Types.ObjectId(userId),
    };
    if (filter.status) query.status = filter.status;
    if (filter.priority) query.priority = filter.priority;

    const safePage = Math.max(1, Math.floor(page));
    const safeLimit = Math.min(100, Math.max(1, Math.floor(limit)));
    const skip = (safePage - 1) * safeLimit;

    const [items, totalItems] = await Promise.all([
      this.taskModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(safeLimit).exec(),
      this.taskModel.countDocuments(query).exec(),
    ]);

    const [pending, inProgress, completed] = await Promise.all([
      this.taskModel.countDocuments({ ...query, status: TaskStatus.PENDING }).exec(),
      this.taskModel.countDocuments({ ...query, status: TaskStatus.IN_PROGRESS }).exec(),
      this.taskModel.countDocuments({ ...query, status: TaskStatus.COMPLETED }).exec(),
    ]);

    const totalPages = Math.max(1, Math.ceil(totalItems / safeLimit));

    return {
      items,
      meta: {
        page: safePage,
        limit: safeLimit,
        totalItems,
        totalPages,
        hasNextPage: safePage < totalPages,
        hasPreviousPage: safePage > 1,
        statusCounts: {
          pending,
          in_progress: inProgress,
          completed,
        },
      },
    };
  }

  async findOne(userId: string, taskId: string): Promise<TaskDocument> {
    const task = await this.taskModel.findOne({ taskId }).exec();
    this.assertOwnership(task, userId, taskId);
    return task!;
  }

  async update(userId: string, taskId: string, dto: UpdateTaskDto): Promise<TaskDocument> {
    const task = await this.taskModel.findOne({ taskId }).exec();
    this.assertOwnership(task, userId, taskId);

    const nextValues: Partial<NormalizedTaskValues> = {};

    if (dto.title !== undefined) {
      nextValues.title = normalizeText(dto.title);
      if (!nextValues.title) {
        throw new BadRequestException('Title cannot be empty');
      }
    }
    if (dto.description !== undefined) {
      nextValues.description = normalizeText(dto.description);
    }
    if (dto.dueDate !== undefined) {
      nextValues.dueDate = dto.dueDate ? new Date(dto.dueDate) : null;
    }
    if (dto.status !== undefined) {
      nextValues.status = dto.status;
    }
    if (dto.priority !== undefined) {
      nextValues.priority = dto.priority;
    }

    Object.assign(task!, nextValues);
    return task!.save();
  }

  async remove(userId: string, taskId: string): Promise<void> {
    const task = await this.taskModel.findOne({ taskId }).exec();
    this.assertOwnership(task, userId, taskId);
    const session = await this.taskModel.db.startSession();
    try {
      await session.withTransaction(async () => {
        const deletedAt = new Date();

        await this.deletedTaskModel.create(
          [
            {
              taskId: task!.taskId,
              title: task!.title,
              description: task!.description,
              status: task!.status,
              priority: task!.priority,
              dueDate: task!.dueDate,
              deletedAt,
              userId: task!.userId,
            },
          ],
          { session },
        );

        await this.taskModel.deleteOne({ taskId }, { session });
      });
    } finally {
      await session.endSession();
    }
  }

  async findDeleted(
    userId: string,
    filter: TaskQueryFilter = {},
    page = DEFAULT_PAGE,
    limit = DEFAULT_LIMIT,
  ): Promise<PaginatedTasksResult<DeletedTaskDocument>> {
    const query: Record<string, unknown> = {
      userId: new Types.ObjectId(userId),
    };
    if (filter.status) query.status = filter.status;
    if (filter.priority) query.priority = filter.priority;

    const safePage = Math.max(1, Math.floor(page));
    const safeLimit = Math.min(100, Math.max(1, Math.floor(limit)));
    const skip = (safePage - 1) * safeLimit;

    const [items, totalItems] = await Promise.all([
      this.deletedTaskModel.find(query).sort({ deletedAt: -1 }).skip(skip).limit(safeLimit).exec(),
      this.deletedTaskModel.countDocuments(query).exec(),
    ]);

    const [pending, inProgress, completed] = await Promise.all([
      this.deletedTaskModel.countDocuments({ ...query, status: TaskStatus.PENDING }).exec(),
      this.deletedTaskModel.countDocuments({ ...query, status: TaskStatus.IN_PROGRESS }).exec(),
      this.deletedTaskModel.countDocuments({ ...query, status: TaskStatus.COMPLETED }).exec(),
    ]);

    const totalPages = Math.max(1, Math.ceil(totalItems / safeLimit));

    return {
      items,
      meta: {
        page: safePage,
        limit: safeLimit,
        totalItems,
        totalPages,
        hasNextPage: safePage < totalPages,
        hasPreviousPage: safePage > 1,
        statusCounts: {
          pending,
          in_progress: inProgress,
          completed,
        },
      },
    };
  }

  async findDeletedOne(userId: string, taskId: string): Promise<DeletedTaskDocument> {
    const task = await this.deletedTaskModel.findOne({ taskId }).exec();
    this.assertOwnership(task as unknown as TaskDocument | null, userId, taskId);
    return task!;
  }

  async purgeDeleted(userId: string, taskId: string): Promise<void> {
    const task = await this.deletedTaskModel.findOne({ taskId }).exec();
    this.assertOwnership(task as unknown as TaskDocument | null, userId, taskId);
    await this.deletedTaskModel.deleteOne({ taskId });
  }

  /**
   * Validates task existence and ownership.
   *
   * Security note: Always return 404 (not 403) when the task doesn't exist to
   * avoid leaking information about other users' task IDs.
   */
  private assertOwnership(task: TaskDocument | null, userId: string, taskId: string): void {
    if (!task) {
      throw new NotFoundException(`Task with ID "${taskId}" not found`);
    }
    if (task.userId.toString() !== userId) {
      throw new ForbiddenException('You do not have permission to access this resource');
    }
  }
}
