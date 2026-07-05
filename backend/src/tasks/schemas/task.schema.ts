import { randomUUID } from 'crypto';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TaskDocument = Task & Document;

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

@Schema({ timestamps: true })
export class Task {
  @Prop({ required: true, unique: true, index: true, default: () => randomUUID() })
  taskId!: string;

  @Prop({ required: true, trim: true, minlength: 1, maxlength: 200 })
  title!: string;

  @Prop({ trim: true, maxlength: 1000, default: '' })
  description!: string;

  @Prop({
    type: String,
    enum: Object.values(TaskStatus),
    default: TaskStatus.PENDING,
  })
  status!: TaskStatus;

  @Prop({
    type: String,
    enum: Object.values(TaskPriority),
    default: TaskPriority.MEDIUM,
  })
  priority!: TaskPriority;

  @Prop({ type: Date, default: null })
  dueDate!: Date | null;

  // userId references the owning User — enforces data isolation per user
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;
}

export const TaskSchema = SchemaFactory.createForClass(Task);

TaskSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    const record = ret as unknown as { id?: string; taskId?: string; _id?: unknown };
    record.id = record.taskId;
    delete record._id;
  },
});

// Compound indexes for efficient user-scoped filtered queries
TaskSchema.index({ userId: 1, status: 1 });
TaskSchema.index({ taskId: 1, userId: 1 }, { unique: true });
TaskSchema.index({ userId: 1, createdAt: -1 });
