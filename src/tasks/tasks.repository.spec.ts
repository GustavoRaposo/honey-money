import { Test, TestingModule } from '@nestjs/testing';
import { TasksRepository } from './tasks.repository.js';
import { PrismaService } from '../prisma/prisma.service.js';

const mockPrismaService = {
  task: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

const taskWithStatus = {
  id: 1,
  name: 'Implementar autenticação',
  description: 'Adicionar JWT ao projeto',
  priority: 2,
  statusCode: 0,
  createdById: 1,
  assignedToId: null,
  lastUpdatedById: null,
  startDate: null,
  endDate: null,
  isRecurrent: false,
  parentTaskId: null,
  recurrenceType: null,
  recurrenceDays: null,
  recurrenceTime: null,
  recurrenceDuration: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  status: { id: 1, code: 0, name: 'Backlog' },
};

describe('TasksRepository', () => {
  let repository: TasksRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksRepository,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    repository = module.get<TasksRepository>(TasksRepository);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('deve criar e retornar a task com status incluído', async () => {
      mockPrismaService.task.create.mockResolvedValue(taskWithStatus);

      const data = { name: 'Implementar autenticação', createdById: 1 };
      const result = await repository.create(data);

      expect(mockPrismaService.task.create).toHaveBeenCalledWith({
        data,
        include: { status: true },
      });
      expect(result).toEqual(taskWithStatus);
    });
  });

  describe('findAll', () => {
    it('deve retornar lista de tasks com status', async () => {
      mockPrismaService.task.findMany.mockResolvedValue([taskWithStatus]);

      const result = await repository.findAll();

      expect(mockPrismaService.task.findMany).toHaveBeenCalledWith({
        include: { status: true },
      });
      expect(result).toEqual([taskWithStatus]);
    });
  });

  describe('findById', () => {
    it('deve retornar a task quando encontrada', async () => {
      mockPrismaService.task.findUnique.mockResolvedValue(taskWithStatus);

      const result = await repository.findById(1);

      expect(mockPrismaService.task.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { status: true },
      });
      expect(result).toEqual(taskWithStatus);
    });

    it('deve retornar null quando a task não existir', async () => {
      mockPrismaService.task.findUnique.mockResolvedValue(null);

      const result = await repository.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('deve atualizar e retornar a task com status incluído', async () => {
      const updated = { ...taskWithStatus, name: 'Nome atualizado' };
      mockPrismaService.task.update.mockResolvedValue(updated);

      const result = await repository.update(1, { name: 'Nome atualizado' });

      expect(mockPrismaService.task.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: 'Nome atualizado' },
        include: { status: true },
      });
      expect(result).toEqual(updated);
    });
  });

  describe('delete', () => {
    it('deve deletar a task', async () => {
      mockPrismaService.task.delete.mockResolvedValue(taskWithStatus);

      await repository.delete(1);

      expect(mockPrismaService.task.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });
});
