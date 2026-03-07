import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TasksService } from './tasks.service.js';
import { TasksRepository } from './tasks.repository.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { TaskResponseDto } from './dto/task-response.dto.js';

const mockTasksRepository = {
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
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
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  status: { id: 1, code: 0, name: 'Backlog' },
};

const taskResponse: TaskResponseDto = {
  id: 1,
  name: 'Implementar autenticação',
  description: 'Adicionar JWT ao projeto',
  priority: 2,
  statusCode: 0,
  statusName: 'Backlog',
  createdById: 1,
  assignedToId: null,
  lastUpdatedById: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

describe('TasksService', () => {
  let service: TasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: TasksRepository, useValue: mockTasksRepository },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('deve criar task com createdById do usuário autenticado', async () => {
      mockTasksRepository.create.mockResolvedValue(taskWithStatus);

      const dto: CreateTaskDto = {
        name: 'Implementar autenticação',
        description: 'Adicionar JWT ao projeto',
        priority: 2,
      };

      const result = await service.create(dto, 1);

      expect(mockTasksRepository.create).toHaveBeenCalledWith({ ...dto, createdById: 1 });
      expect(result).toEqual(taskResponse);
    });
  });

  describe('findAll', () => {
    it('deve retornar lista de TaskResponseDto', async () => {
      mockTasksRepository.findAll.mockResolvedValue([taskWithStatus]);

      const result = await service.findAll();

      expect(result).toEqual([taskResponse]);
    });
  });

  describe('findOne', () => {
    it('deve retornar TaskResponseDto quando a task existir', async () => {
      mockTasksRepository.findById.mockResolvedValue(taskWithStatus);

      const result = await service.findOne(1);

      expect(mockTasksRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(taskResponse);
    });

    it('deve lançar NotFoundException quando a task não existir', async () => {
      mockTasksRepository.findById.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('deve atualizar task com lastUpdatedById do usuário autenticado', async () => {
      const updatedTask = { ...taskWithStatus, name: 'Nome atualizado', lastUpdatedById: 2 };
      mockTasksRepository.findById.mockResolvedValue(taskWithStatus);
      mockTasksRepository.update.mockResolvedValue(updatedTask);

      const dto: UpdateTaskDto = { name: 'Nome atualizado' };
      const result = await service.update(1, dto, 2);

      expect(mockTasksRepository.update).toHaveBeenCalledWith(1, { ...dto, lastUpdatedById: 2 });
      expect(result.name).toBe('Nome atualizado');
      expect(result.lastUpdatedById).toBe(2);
    });

    it('deve lançar NotFoundException quando a task não existir', async () => {
      mockTasksRepository.findById.mockResolvedValue(null);

      await expect(service.update(999, {}, 1)).rejects.toThrow(NotFoundException);
      expect(mockTasksRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('deve remover a task quando existir', async () => {
      mockTasksRepository.findById.mockResolvedValue(taskWithStatus);
      mockTasksRepository.delete.mockResolvedValue(undefined);

      await expect(service.remove(1)).resolves.toBeUndefined();
      expect(mockTasksRepository.delete).toHaveBeenCalledWith(1);
    });

    it('deve lançar NotFoundException quando a task não existir', async () => {
      mockTasksRepository.findById.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      expect(mockTasksRepository.delete).not.toHaveBeenCalled();
    });
  });
});
