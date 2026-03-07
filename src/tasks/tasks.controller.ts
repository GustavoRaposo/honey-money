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
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
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
  @ApiBody({
    type: CreateTaskDto,
    examples: {
      simples: {
        summary: 'Tarefa simples',
        description: 'Tarefa sem recorrência',
        value: {
          name: 'Revisar pull request',
          description: 'Revisar o PR #42 antes do deploy',
          priority: 2,
          assignedToId: 1,
          startDate: '2025-01-10T00:00:00.000Z',
          endDate: '2025-01-10T18:00:00.000Z',
        },
      },
      recorrente_semanal: {
        summary: 'Recorrente — WEEKLY',
        description: 'Toda terça-feira às 9h por um mês. daysOfWeek: 0=Dom 1=Seg 2=Ter 3=Qua 4=Qui 5=Sex 6=Sáb',
        value: {
          name: 'Reunião semanal',
          description: 'Reunião de acompanhamento do time',
          priority: 2,
          startDate: '2025-01-06T00:00:00.000Z',
          recurrence: {
            type: 'WEEKLY',
            daysOfWeek: [2],
            time: '09:00',
            duration: 'MONTH',
          },
        },
      },
      recorrente_diaria: {
        summary: 'Recorrente — DAILY',
        description: 'Todo dia às 8h por um ano',
        value: {
          name: 'Registro de ponto',
          priority: 1,
          startDate: '2025-01-01T00:00:00.000Z',
          recurrence: {
            type: 'DAILY',
            time: '08:00',
            duration: 'YEAR',
          },
        },
      },
      recorrente_mensal: {
        summary: 'Recorrente — MONTHLY',
        description: 'Todo mês no mesmo dia às 9h por um ano',
        value: {
          name: 'Fechamento mensal',
          priority: 3,
          startDate: '2025-01-15T00:00:00.000Z',
          recurrence: {
            type: 'MONTHLY',
            time: '09:00',
            duration: 'YEAR',
          },
        },
      },
    },
  })
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
