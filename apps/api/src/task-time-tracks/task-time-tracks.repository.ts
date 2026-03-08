import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

export interface TaskTimeTrack {
  id: number;
  taskId: number;
  userId: number;
  startDate: Date;
  endDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateTrackData {
  taskId: number;
  userId: number;
  startDate: Date;
}

@Injectable()
export class TaskTimeTracksRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateTrackData): Promise<TaskTimeTrack> {
    return this.prisma.taskTimeTrack.create({
      data,
    }) as unknown as Promise<TaskTimeTrack>;
  }

  async findAllByTaskId(taskId: number): Promise<TaskTimeTrack[]> {
    return this.prisma.taskTimeTrack.findMany({
      where: { taskId },
    }) as unknown as Promise<TaskTimeTrack[]>;
  }

  async findById(id: number): Promise<TaskTimeTrack | null> {
    return this.prisma.taskTimeTrack.findUnique({
      where: { id },
    }) as unknown as Promise<TaskTimeTrack | null>;
  }

  async findActiveByUserAndTask(
    userId: number,
    taskId: number,
  ): Promise<TaskTimeTrack | null> {
    return this.prisma.taskTimeTrack.findFirst({
      where: { userId, taskId, endDate: null },
    }) as unknown as Promise<TaskTimeTrack | null>;
  }

  async stop(id: number, endDate: Date): Promise<TaskTimeTrack> {
    return this.prisma.taskTimeTrack.update({
      where: { id },
      data: { endDate },
    }) as unknown as Promise<TaskTimeTrack>;
  }
}
