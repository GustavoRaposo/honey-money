import { Injectable, NotFoundException } from '@nestjs/common';
import type { CreateTaskDto } from './dto/create-task.dto.js';
import type { RecurrenceDto } from './dto/recurrence.dto.js';
import type { UpdateTaskDto } from './dto/update-task.dto.js';
import type { TaskResponseDto } from './dto/task-response.dto.js';
import { calculateOccurrenceDates } from './recurrence.util.js';
import { TasksRepository, TaskWithStatus } from './tasks.repository.js';

@Injectable()
export class TasksService {
  constructor(private readonly tasksRepository: TasksRepository) {}

  async create(dto: CreateTaskDto, userId: number): Promise<TaskResponseDto> {
    const { recurrence, ...taskData } = dto;

    const task = await this.tasksRepository.create({
      ...taskData,
      createdById: userId,
      ...(recurrence && {
        isRecurrent: true,
        recurrenceType: recurrence.type,
        recurrenceDays: recurrence.daysOfWeek?.join(','),
        recurrenceTime: recurrence.time,
        recurrenceDuration: recurrence.duration,
      }),
    });

    if (recurrence) {
      await this.createOccurrences(task, recurrence, userId);
    }

    return this.toResponseDto(task);
  }

  async findAll(): Promise<TaskResponseDto[]> {
    const tasks = await this.tasksRepository.findAll();
    return tasks.map((task) => this.toResponseDto(task));
  }

  async findOne(id: number): Promise<TaskResponseDto> {
    const task = await this.tasksRepository.findById(id);
    if (!task) throw new NotFoundException('Tarefa não encontrada.');
    return this.toResponseDto(task);
  }

  async update(
    id: number,
    dto: UpdateTaskDto,
    userId: number,
  ): Promise<TaskResponseDto> {
    const existing = await this.tasksRepository.findById(id);
    if (!existing) throw new NotFoundException('Tarefa não encontrada.');
    const task = await this.tasksRepository.update(id, {
      ...dto,
      lastUpdatedById: userId,
    });
    return this.toResponseDto(task);
  }

  async remove(id: number): Promise<void> {
    const existing = await this.tasksRepository.findById(id);
    if (!existing) throw new NotFoundException('Tarefa não encontrada.');
    await this.tasksRepository.delete(id);
  }

  private async createOccurrences(
    parent: TaskWithStatus,
    recurrence: RecurrenceDto,
    userId: number,
  ): Promise<void> {
    const startFrom = parent.startDate ?? new Date();

    const dates = calculateOccurrenceDates(startFrom, {
      type: recurrence.type,
      daysOfWeek: recurrence.daysOfWeek,
      time: recurrence.time,
      duration: recurrence.duration,
    });

    for (const date of dates) {
      await this.tasksRepository.create({
        name: parent.name,
        description: parent.description ?? undefined,
        priority: parent.priority,
        assignedToId: parent.assignedToId ?? undefined,
        statusCode: 1,
        parentTaskId: parent.id,
        startDate: date.toISOString(),
        createdById: userId,
      });
    }
  }

  private toResponseDto(task: TaskWithStatus): TaskResponseDto {
    return {
      id: task.id,
      name: task.name,
      description: task.description,
      priority: task.priority,
      statusCode: task.statusCode,
      statusName: task.status.name,
      createdById: task.createdById,
      assignedToId: task.assignedToId,
      lastUpdatedById: task.lastUpdatedById,
      startDate: task.startDate,
      endDate: task.endDate,
      isRunning: task.isRunning,
      isRecurrent: task.isRecurrent,
      parentTaskId: task.parentTaskId,
      recurrenceType: task.recurrenceType,
      recurrenceDays: task.recurrenceDays,
      recurrenceTime: task.recurrenceTime,
      recurrenceDuration: task.recurrenceDuration,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }
}
