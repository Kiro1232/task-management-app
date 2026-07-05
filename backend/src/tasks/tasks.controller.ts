import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';
import { TaskStatus } from './schemas/task.schema';

@ApiTags('Tasks')
@ApiBearerAuth()
@Controller('tasks')
@UseGuards(JwtAuthGuard) // All endpoints require a valid JWT
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  /**
   * POST /tasks
   * Create a new task owned by the authenticated user.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new task' })
  @ApiBody({ type: CreateTaskDto })
  @ApiCreatedResponse({ description: 'Task created successfully' })
  create(@CurrentUser() user: CurrentUserData, @Body() dto: CreateTaskDto) {
    return this.tasksService.create(user.id, dto);
  }

  /**
   * GET /tasks
   * Fetch all tasks for the authenticated user.
   * Supports optional filtering: ?status=pending|in_progress|completed
   *                                  &priority=low|medium|high
   */
  @Get()
  @ApiOperation({ summary: 'List paginated tasks for the authenticated user' })
  @ApiOkResponse({ description: 'Paginated task list' })
  findAll(
    @CurrentUser() user: CurrentUserData,
    @Query('status') status?: TaskStatus,
    @Query('priority') priority?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.tasksService.findAll(user.id, { status, priority }, Number(page), Number(limit));
  }

  /**
   * GET /tasks/deleted
   * Fetch deleted tasks for the authenticated user.
   */
  @Get('deleted')
  @ApiOperation({ summary: 'List deleted tasks for the authenticated user' })
  @ApiOkResponse({ description: 'Paginated deleted task list' })
  findDeleted(
    @CurrentUser() user: CurrentUserData,
    @Query('status') status?: TaskStatus,
    @Query('priority') priority?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.tasksService.findDeleted(
      user.id,
      { status, priority },
      Number(page),
      Number(limit),
    );
  }

  /**
   * GET /tasks/deleted/:taskId
   * Fetch a deleted task by public taskId.
   */
  @Get('deleted/:taskId')
  @ApiOperation({ summary: 'Fetch a deleted task by public taskId' })
  @ApiOkResponse({ description: 'Deleted task retrieved successfully' })
  findDeletedOne(@CurrentUser() user: CurrentUserData, @Param('taskId') taskId: string) {
    return this.tasksService.findDeletedOne(user.id, taskId);
  }

  /**
   * DELETE /tasks/deleted/:taskId
   * Permanently remove an archived task from the deleted_tasks collection.
   */
  @Delete('deleted/:taskId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Permanently delete an archived task' })
  @ApiNoContentResponse({ description: 'Deleted task permanently removed successfully' })
  purgeDeleted(@CurrentUser() user: CurrentUserData, @Param('taskId') taskId: string) {
    return this.tasksService.purgeDeleted(user.id, taskId);
  }

  /**
   * GET /tasks/:taskId
   * Fetch a single task by public UUID (user must own the task).
   */
  @Get(':taskId')
  @ApiOperation({ summary: 'Fetch a task by public taskId' })
  @ApiOkResponse({ description: 'Task retrieved successfully' })
  findOne(@CurrentUser() user: CurrentUserData, @Param('taskId') taskId: string) {
    return this.tasksService.findOne(user.id, taskId);
  }

  /**
   * PUT /tasks/:taskId
   * Partially update a task — only provided fields are changed.
   */
  @Put(':taskId')
  @ApiOperation({ summary: 'Update a task by public taskId' })
  @ApiBody({ type: UpdateTaskDto })
  @ApiOkResponse({ description: 'Task updated successfully' })
  update(
    @CurrentUser() user: CurrentUserData,
    @Param('taskId') taskId: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.update(user.id, taskId, dto);
  }

  /**
   * DELETE /tasks/:taskId
   * Archive the deleted task in the deleted_tasks collection and remove it from active tasks.
   */
  @Delete(':taskId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a task by public taskId' })
  @ApiNoContentResponse({ description: 'Task deleted successfully' })
  remove(@CurrentUser() user: CurrentUserData, @Param('taskId') taskId: string) {
    return this.tasksService.remove(user.id, taskId);
  }
}
