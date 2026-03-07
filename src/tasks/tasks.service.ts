import { Injectable, NotFoundException } from '@nestjs/common';
import type { CreateTaskDto } from './dto/create-task.dto.js';
import type { UpdateTaskDto } from './dto/update-task.dto.js';
import type { TaskResponseDto } from './dto/task-response.dto.js';
import { TasksRepository, TaskWithStatus } from './tasks.repository.js';

@Injectable()
export class TasksService {
  constructor(private readonly tasksRepository: TasksRepository) {}

  async create(dto: CreateTaskDto, userId: number): Promise<TaskResponseDto> {
    const task = await this.tasksRepository.create({ ...dto, createdById: userId });
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

  async update(id: number, dto: UpdateTaskDto, userId: number): Promise<TaskResponseDto> {
    const existing = await this.tasksRepository.findById(id);
    if (!existing) throw new NotFoundException('Tarefa não encontrada.');
    const task = await this.tasksRepository.update(id, { ...dto, lastUpdatedById: userId });
    return this.toResponseDto(task);
  }

  async remove(id: number): Promise<void> {
    const existing = await this.tasksRepository.findById(id);
    if (!existing) throw new NotFoundException('Tarefa não encontrada.');
    await this.tasksRepository.delete(id);
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
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }
}
