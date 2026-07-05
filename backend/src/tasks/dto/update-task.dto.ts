import { PartialType } from '@nestjs/swagger';
import { CreateTaskDto } from './create-task.dto';

/**
 * All fields from CreateTaskDto are made optional.
 * Validation decorators are preserved — only provided fields are validated.
 */
export class UpdateTaskDto extends PartialType(CreateTaskDto) {}
