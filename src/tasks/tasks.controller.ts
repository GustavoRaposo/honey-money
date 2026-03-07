import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import type { TaskResponseDto } from './dto/task-response.dto.js';
import { TasksService } from './tasks.service.js';

@ApiTags('tasks')
@Controller('tasks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova tarefa' })
  async create(
    @Body() dto: CreateTaskDto,
    @Request() req: { user: { id: number } },
  ): Promise<TaskResponseDto> {
    return this.tasksService.create(dto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as tarefas' })
  async findAll(): Promise<TaskResponseDto[]> {
    return this.tasksService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar tarefa por ID' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<TaskResponseDto> {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar tarefa' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTaskDto,
    @Request() req: { user: { id: number } },
  ): Promise<TaskResponseDto> {
    return this.tasksService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover tarefa' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.tasksService.remove(id);
  }
}
