import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { TaskTimeTrackResponseDto } from './dto/task-time-track-response.dto.js';
import { TaskTimeTracksRepository } from './task-time-tracks.repository.js';
import type { TaskTimeTrack } from './task-time-tracks.repository.js';
import { TasksRepository } from '../tasks/tasks.repository.js';

@Injectable()
export class TaskTimeTracksService {
  constructor(
    private readonly tracksRepository: TaskTimeTracksRepository,
    private readonly tasksRepository: TasksRepository,
  ) {}

  async start(
    taskId: number,
    userId: number,
  ): Promise<TaskTimeTrackResponseDto> {
    const task = await this.tasksRepository.findById(taskId);
    if (!task) throw new NotFoundException('Tarefa não encontrada.');

    if (task.isRunning)
      throw new BadRequestException('A tarefa já está sendo rastreada.');

    const active = await this.tracksRepository.findActiveByUserAndTask(
      userId,
      taskId,
    );
    if (active)
      throw new BadRequestException(
        'Já existe um rastreamento ativo para esta tarefa.',
      );

    const track = await this.tracksRepository.create({
      taskId,
      userId,
      startDate: new Date(),
    });
    await this.tasksRepository.setRunning(taskId, true);
    return this.toResponseDto(track);
  }

  async stop(
    taskId: number,
    trackId: number,
    userId: number,
  ): Promise<TaskTimeTrackResponseDto> {
    const track = await this.tracksRepository.findById(trackId);
    if (!track || track.taskId !== taskId)
      throw new NotFoundException('Rastreamento não encontrado.');

    if (track.userId !== userId)
      throw new ForbiddenException(
        'Sem permissão para finalizar este rastreamento.',
      );

    if (track.endDate !== null)
      throw new BadRequestException('Este rastreamento já foi finalizado.');

    const stopped = await this.tracksRepository.stop(trackId, new Date());
    await this.tasksRepository.setRunning(taskId, false);
    return this.toResponseDto(stopped);
  }

  async findAll(taskId: number): Promise<TaskTimeTrackResponseDto[]> {
    const task = await this.tasksRepository.findById(taskId);
    if (!task) throw new NotFoundException('Tarefa não encontrada.');

    const tracks = await this.tracksRepository.findAllByTaskId(taskId);
    return tracks.map((t) => this.toResponseDto(t));
  }

  private toResponseDto(track: TaskTimeTrack): TaskTimeTrackResponseDto {
    return {
      id: track.id,
      taskId: track.taskId,
      userId: track.userId,
      startDate: track.startDate,
      endDate: track.endDate,
      createdAt: track.createdAt,
      updatedAt: track.updatedAt,
    };
  }
}
