import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

export interface TaskWithStatus {
  id: number;
  name: string;
  description: string | null;
  priority: number;
  statusCode: number;
  createdById: number;
  assignedToId: number | null;
  lastUpdatedById: number | null;
  startDate: Date | null;
  endDate: Date | null;
  isRunning: boolean;
  isRecurrent: boolean;
  parentTaskId: number | null;
  recurrenceType: string | null;
  recurrenceDays: string | null;
  recurrenceTime: string | null;
  recurrenceDuration: string | null;
  createdAt: Date;
  updatedAt: Date;
  status: { id: number; code: number; name: string };
}

interface CreateTaskData {
  name: string;
  description?: string;
  priority?: number;
  statusCode?: number;
  assignedToId?: number;
  startDate?: string;
  endDate?: string;
  isRecurrent?: boolean;
  parentTaskId?: number;
  recurrenceType?: string;
  recurrenceDays?: string;
  recurrenceTime?: string;
  recurrenceDuration?: string;
  createdById: number;
}

interface UpdateTaskData {
  name?: string;
  description?: string;
  priority?: number;
  statusCode?: number;
  assignedToId?: number;
  startDate?: string;
  endDate?: string;
  lastUpdatedById?: number;
}

const includeStatus = { status: true } as const;

@Injectable()
export class TasksRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateTaskData): Promise<TaskWithStatus> {
    return this.prisma.task.create({
      data,
      include: includeStatus,
    }) as unknown as Promise<TaskWithStatus>;
  }

  async findAll(): Promise<TaskWithStatus[]> {
    return this.prisma.task.findMany({
      include: includeStatus,
    }) as unknown as Promise<TaskWithStatus[]>;
  }

  async findById(id: number): Promise<TaskWithStatus | null> {
    return this.prisma.task.findUnique({
      where: { id },
      include: includeStatus,
    }) as unknown as Promise<TaskWithStatus | null>;
  }

  async update(id: number, data: UpdateTaskData): Promise<TaskWithStatus> {
    return this.prisma.task.update({
      where: { id },
      data,
      include: includeStatus,
    }) as unknown as Promise<TaskWithStatus>;
  }

  async delete(id: number): Promise<void> {
    await this.prisma.task.delete({ where: { id } });
  }

  async setRunning(id: number, isRunning: boolean): Promise<void> {
    await this.prisma.task.update({ where: { id }, data: { isRunning } });
  }
}
