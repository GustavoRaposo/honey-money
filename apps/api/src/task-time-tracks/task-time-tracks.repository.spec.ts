import { Test, TestingModule } from '@nestjs/testing';
import { TaskTimeTracksRepository } from './task-time-tracks.repository.js';
import { PrismaService } from '../prisma/prisma.service.js';

const mockPrismaService = {
  taskTimeTrack: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
  },
};

const track = {
  id: 1,
  taskId: 10,
  userId: 2,
  startDate: new Date('2025-01-01T09:00:00.000Z'),
  endDate: null,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

describe('TaskTimeTracksRepository', () => {
  let repository: TaskTimeTracksRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskTimeTracksRepository,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    repository = module.get<TaskTimeTracksRepository>(TaskTimeTracksRepository);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('deve criar e retornar o registro', async () => {
      mockPrismaService.taskTimeTrack.create.mockResolvedValue(track);

      const data = {
        taskId: 10,
        userId: 2,
        startDate: new Date('2025-01-01T09:00:00.000Z'),
      };
      const result = await repository.create(data);

      expect(mockPrismaService.taskTimeTrack.create).toHaveBeenCalledWith({
        data,
      });
      expect(result).toEqual(track);
    });
  });

  describe('findAllByTaskId', () => {
    it('deve retornar lista de registros da task', async () => {
      mockPrismaService.taskTimeTrack.findMany.mockResolvedValue([track]);

      const result = await repository.findAllByTaskId(10);

      expect(mockPrismaService.taskTimeTrack.findMany).toHaveBeenCalledWith({
        where: { taskId: 10 },
      });
      expect(result).toEqual([track]);
    });
  });

  describe('findById', () => {
    it('deve retornar o registro quando encontrado', async () => {
      mockPrismaService.taskTimeTrack.findUnique.mockResolvedValue(track);

      const result = await repository.findById(1);

      expect(mockPrismaService.taskTimeTrack.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(track);
    });

    it('deve retornar null quando não encontrado', async () => {
      mockPrismaService.taskTimeTrack.findUnique.mockResolvedValue(null);

      const result = await repository.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('findActiveByUserAndTask', () => {
    it('deve retornar registro ativo (sem endDate) do usuário na task', async () => {
      mockPrismaService.taskTimeTrack.findFirst.mockResolvedValue(track);

      const result = await repository.findActiveByUserAndTask(2, 10);

      expect(mockPrismaService.taskTimeTrack.findFirst).toHaveBeenCalledWith({
        where: { userId: 2, taskId: 10, endDate: null },
      });
      expect(result).toEqual(track);
    });

    it('deve retornar null quando não há registro ativo', async () => {
      mockPrismaService.taskTimeTrack.findFirst.mockResolvedValue(null);

      const result = await repository.findActiveByUserAndTask(2, 10);

      expect(result).toBeNull();
    });
  });

  describe('stop', () => {
    it('deve atualizar endDate do registro', async () => {
      const endDate = new Date('2025-01-01T10:00:00.000Z');
      const stopped = { ...track, endDate };
      mockPrismaService.taskTimeTrack.update.mockResolvedValue(stopped);

      const result = await repository.stop(1, endDate);

      expect(mockPrismaService.taskTimeTrack.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { endDate },
      });
      expect(result).toEqual(stopped);
    });
  });
});
