import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { TaskTimeTracksService } from './task-time-tracks.service.js';
import { TaskTimeTracksRepository } from './task-time-tracks.repository.js';
import { TasksRepository } from '../tasks/tasks.repository.js';
import type { TaskTimeTrackResponseDto } from './dto/task-time-track-response.dto.js';

const mockTracksRepository = {
  create: jest.fn(),
  findAllByTaskId: jest.fn(),
  findById: jest.fn(),
  findActiveByUserAndTask: jest.fn(),
  stop: jest.fn(),
};

const mockTasksRepository = {
  findById: jest.fn(),
  setRunning: jest.fn(),
};

const trackData = {
  id: 1,
  taskId: 10,
  userId: 2,
  startDate: new Date('2025-01-01T09:00:00.000Z'),
  endDate: null,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

const trackResponse: TaskTimeTrackResponseDto = {
  id: 1,
  taskId: 10,
  userId: 2,
  startDate: new Date('2025-01-01T09:00:00.000Z'),
  endDate: null,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

const taskStub = {
  id: 10,
  name: 'Tarefa',
  isRunning: false,
  status: { id: 1, code: 0, name: 'Backlog' },
};

describe('TaskTimeTracksService', () => {
  let service: TaskTimeTracksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskTimeTracksService,
        { provide: TaskTimeTracksRepository, useValue: mockTracksRepository },
        { provide: TasksRepository, useValue: mockTasksRepository },
      ],
    }).compile();

    service = module.get<TaskTimeTracksService>(TaskTimeTracksService);
    jest.clearAllMocks();
  });

  describe('start', () => {
    it('deve iniciar rastreamento e marcar isRunning como true na task', async () => {
      mockTasksRepository.findById.mockResolvedValue(taskStub);
      mockTracksRepository.findActiveByUserAndTask.mockResolvedValue(null);
      mockTracksRepository.create.mockResolvedValue(trackData);
      mockTasksRepository.setRunning.mockResolvedValue(undefined);

      const result = await service.start(10, 2);

      expect(mockTasksRepository.findById).toHaveBeenCalledWith(10);
      expect(mockTracksRepository.findActiveByUserAndTask).toHaveBeenCalledWith(
        2,
        10,
      );
      expect(mockTracksRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ taskId: 10, userId: 2 }),
      );
      expect(mockTasksRepository.setRunning).toHaveBeenCalledWith(10, true);
      expect(result).toEqual(trackResponse);
    });

    it('deve lançar NotFoundException quando task não existe', async () => {
      mockTasksRepository.findById.mockResolvedValue(null);

      await expect(service.start(999, 2)).rejects.toThrow(NotFoundException);
      expect(mockTracksRepository.create).not.toHaveBeenCalled();
    });

    it('deve lançar BadRequestException quando task já está sendo rastreada (isRunning = true)', async () => {
      mockTasksRepository.findById.mockResolvedValue({
        ...taskStub,
        isRunning: true,
      });

      await expect(service.start(10, 2)).rejects.toThrow(BadRequestException);
      expect(mockTracksRepository.create).not.toHaveBeenCalled();
    });

    it('deve lançar BadRequestException quando já existe rastreamento ativo para a task', async () => {
      mockTasksRepository.findById.mockResolvedValue(taskStub);
      mockTracksRepository.findActiveByUserAndTask.mockResolvedValue(trackData);

      await expect(service.start(10, 2)).rejects.toThrow(BadRequestException);
      expect(mockTracksRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('stop', () => {
    it('deve finalizar rastreamento e marcar isRunning como false na task', async () => {
      const endDate = new Date();
      const stopped = { ...trackData, endDate };
      mockTracksRepository.findById.mockResolvedValue(trackData);
      mockTracksRepository.stop.mockResolvedValue(stopped);
      mockTasksRepository.setRunning.mockResolvedValue(undefined);

      const result = await service.stop(10, 1, 2);

      expect(mockTracksRepository.stop).toHaveBeenCalledWith(
        1,
        expect.any(Date),
      );
      expect(mockTasksRepository.setRunning).toHaveBeenCalledWith(10, false);
      expect(result.endDate).toEqual(endDate);
    });

    it('deve lançar NotFoundException quando track não existe', async () => {
      mockTracksRepository.findById.mockResolvedValue(null);

      await expect(service.stop(10, 999, 2)).rejects.toThrow(NotFoundException);
      expect(mockTracksRepository.stop).not.toHaveBeenCalled();
    });

    it('deve lançar NotFoundException quando track não pertence à task', async () => {
      mockTracksRepository.findById.mockResolvedValue({
        ...trackData,
        taskId: 99,
      });

      await expect(service.stop(10, 1, 2)).rejects.toThrow(NotFoundException);
      expect(mockTracksRepository.stop).not.toHaveBeenCalled();
    });

    it('deve lançar ForbiddenException quando track não pertence ao usuário', async () => {
      mockTracksRepository.findById.mockResolvedValue({
        ...trackData,
        userId: 99,
      });

      await expect(service.stop(10, 1, 2)).rejects.toThrow(ForbiddenException);
      expect(mockTracksRepository.stop).not.toHaveBeenCalled();
    });

    it('deve lançar BadRequestException quando rastreamento já foi finalizado', async () => {
      mockTracksRepository.findById.mockResolvedValue({
        ...trackData,
        endDate: new Date(),
      });

      await expect(service.stop(10, 1, 2)).rejects.toThrow(BadRequestException);
      expect(mockTracksRepository.stop).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('deve retornar lista de tracks da task', async () => {
      mockTasksRepository.findById.mockResolvedValue(taskStub);
      mockTracksRepository.findAllByTaskId.mockResolvedValue([trackData]);

      const result = await service.findAll(10);

      expect(mockTracksRepository.findAllByTaskId).toHaveBeenCalledWith(10);
      expect(result).toEqual([trackResponse]);
    });

    it('deve lançar NotFoundException quando task não existe', async () => {
      mockTasksRepository.findById.mockResolvedValue(null);

      await expect(service.findAll(999)).rejects.toThrow(NotFoundException);
      expect(mockTracksRepository.findAllByTaskId).not.toHaveBeenCalled();
    });
  });
});
