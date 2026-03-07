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
  createdAt: Date;
  updatedAt: Date;
  status: { id: number; code: number; name: string };
}

interface CreateTaskData {
  name: string;
  description?: string;
  priority?: number;
  assignedToId?: number;
  createdById: number;
}

interface UpdateTaskData {
  name?: string;
  description?: string;
  priority?: number;
  statusCode?: number;
  assignedToId?: number;
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
    }) as Promise<TaskWithStatus>;
  }

  async findAll(): Promise<TaskWithStatus[]> {
    return this.prisma.task.findMany({
      include: includeStatus,
    }) as Promise<TaskWithStatus[]>;
  }

  async findById(id: number): Promise<TaskWithStatus | null> {
    return this.prisma.task.findUnique({
      where: { id },
      include: includeStatus,
    }) as Promise<TaskWithStatus | null>;
  }

  async update(id: number, data: UpdateTaskData): Promise<TaskWithStatus> {
    return this.prisma.task.update({
      where: { id },
      data,
      include: includeStatus,
    }) as Promise<TaskWithStatus>;
  }

  async delete(id: number): Promise<void> {
    await this.prisma.task.delete({ where: { id } });
  }
}
