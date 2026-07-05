import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { randomUUID } from 'crypto';
import { TaskPriority, TaskStatus } from './task.schema';

export type DeletedTaskDocument = DeletedTask & Document;

@Schema({ timestamps: true, collection: 'deleted_tasks' })
export class DeletedTask {
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

  @Prop({ type: Date, required: true, index: true })
  deletedAt!: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;
}

export const DeletedTaskSchema = SchemaFactory.createForClass(DeletedTask);

DeletedTaskSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    const record = ret as unknown as { id?: string; taskId?: string; _id?: unknown };
    record.id = record.taskId;
    delete record._id;
  },
});

DeletedTaskSchema.index({ userId: 1, deletedAt: -1 });
