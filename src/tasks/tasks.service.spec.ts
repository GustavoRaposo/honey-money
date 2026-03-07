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
    it('deve criar task simples com createdById do usuário autenticado', async () => {
      mockTasksRepository.create.mockResolvedValue(taskWithStatus);

      const dto: CreateTaskDto = {
        name: 'Implementar autenticação',
        description: 'Adicionar JWT ao projeto',
        priority: 2,
      };

      const result = await service.create(dto, 1);

      expect(mockTasksRepository.create).toHaveBeenCalledTimes(1);
      expect(mockTasksRepository.create).toHaveBeenCalledWith({ ...dto, createdById: 1 });
      expect(result).toEqual(taskResponse);
    });

    it('deve criar task recorrente e gerar ocorrências com status To Do', async () => {
      // Segunda-feira Jan 6 2025: 5 terças até Feb 6 (Jan 7, 14, 21, 28, Feb 4)
      const parentTask = {
        ...taskWithStatus,
        isRecurrent: true,
        startDate: new Date('2025-01-06T00:00:00.000Z'),
        recurrenceType: 'WEEKLY',
        recurrenceDays: '2',
        recurrenceTime: '09:00',
        recurrenceDuration: 'MONTH',
      };

      mockTasksRepository.create
        .mockResolvedValueOnce(parentTask)
        .mockResolvedValue({ ...taskWithStatus, statusCode: 1, parentTaskId: 1 });

      const dto: CreateTaskDto = {
        name: 'Reunião semanal',
        startDate: '2025-01-06T00:00:00.000Z',
        recurrence: { type: 'WEEKLY', daysOfWeek: [2], time: '09:00', duration: 'MONTH' },
      };

      await service.create(dto, 1);

      // 1 task pai + 5 ocorrências
      expect(mockTasksRepository.create).toHaveBeenCalledTimes(6);
    });

    it('deve criar ocorrências com statusCode 1 (To Do) e parentTaskId correto', async () => {
      const parentTask = {
        ...taskWithStatus,
        id: 42,
        isRecurrent: true,
        startDate: new Date('2025-01-06T00:00:00.000Z'),
        recurrenceType: 'WEEKLY',
        recurrenceDays: '2',
        recurrenceTime: '09:00',
        recurrenceDuration: 'MONTH',
      };

      mockTasksRepository.create
        .mockResolvedValueOnce(parentTask)
        .mockResolvedValue({ ...taskWithStatus, statusCode: 1, parentTaskId: 42 });

      const dto: CreateTaskDto = {
        name: 'Reunião semanal',
        startDate: '2025-01-06T00:00:00.000Z',
        recurrence: { type: 'WEEKLY', daysOfWeek: [2], time: '09:00', duration: 'MONTH' },
      };

      await service.create(dto, 1);

      // Verifica a primeira ocorrência (segunda chamada)
      const firstOccurrence = mockTasksRepository.create.mock.calls[1][0];
      expect(firstOccurrence.statusCode).toBe(1);
      expect(firstOccurrence.parentTaskId).toBe(42);
    });

    it('deve criar task DAILY sem daysOfWeek e gerar 31 ocorrências para janeiro', async () => {
      // Garante que daysOfWeek é opcional para tipos DAILY e MONTHLY
      const parentTask = {
        ...taskWithStatus,
        isRecurrent: true,
        startDate: new Date('2025-01-01T00:00:00.000Z'),
        recurrenceType: 'DAILY',
        recurrenceTime: '08:00',
        recurrenceDuration: 'MONTH',
      };

      mockTasksRepository.create
        .mockResolvedValueOnce(parentTask)
        .mockResolvedValue({ ...taskWithStatus, statusCode: 1, parentTaskId: 1 });

      const dto: CreateTaskDto = {
        name: 'Tarefa diária',
        startDate: '2025-01-01T00:00:00.000Z',
        recurrence: { type: 'DAILY', time: '08:00', duration: 'MONTH' },
      };

      await service.create(dto, 1);

      // 1 pai + 31 ocorrências (Jan 1-31)
      expect(mockTasksRepository.create).toHaveBeenCalledTimes(32);

      const parentCall = mockTasksRepository.create.mock.calls[0][0];
      expect(parentCall.isRecurrent).toBe(true);
      expect(parentCall.recurrenceType).toBe('DAILY');
      expect(parentCall.recurrenceTime).toBe('08:00');
      expect(parentCall.recurrenceDuration).toBe('MONTH');
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
