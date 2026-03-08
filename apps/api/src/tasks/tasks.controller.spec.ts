import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller.js';
import { TasksService } from './tasks.service.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { TaskResponseDto } from './dto/task-response.dto.js';

const mockTasksService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
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
  isRunning: false,
  isRecurrent: false,
  parentTaskId: null,
  recurrenceType: null,
  recurrenceDays: null,
  recurrenceTime: null,
  recurrenceDuration: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const mockRequest = { user: { id: 1 } };

describe('TasksController', () => {
  let controller: TasksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [{ provide: TasksService, useValue: mockTasksService }],
    }).compile();

    controller = module.get<TasksController>(TasksController);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('deve chamar o service com o dto e o userId do request', async () => {
      mockTasksService.create.mockResolvedValue(taskResponse);

      const dto: CreateTaskDto = { name: 'Implementar autenticação' };
      const result = await controller.create(dto, mockRequest);

      expect(mockTasksService.create).toHaveBeenCalledWith(dto, 1);
      expect(result).toEqual(taskResponse);
    });
  });

  describe('findAll', () => {
    it('deve retornar lista de tasks', async () => {
      mockTasksService.findAll.mockResolvedValue([taskResponse]);

      const result = await controller.findAll();

      expect(mockTasksService.findAll).toHaveBeenCalled();
      expect(result).toEqual([taskResponse]);
    });
  });

  describe('findOne', () => {
    it('deve retornar task pelo id', async () => {
      mockTasksService.findOne.mockResolvedValue(taskResponse);

      const result = await controller.findOne(1);

      expect(mockTasksService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(taskResponse);
    });
  });

  describe('update', () => {
    it('deve chamar o service com o id, dto e userId do request', async () => {
      const updated = { ...taskResponse, name: 'Nome atualizado' };
      mockTasksService.update.mockResolvedValue(updated);

      const dto: UpdateTaskDto = { name: 'Nome atualizado' };
      const result = await controller.update(1, dto, mockRequest);

      expect(mockTasksService.update).toHaveBeenCalledWith(1, dto, 1);
      expect(result).toEqual(updated);
    });
  });

  describe('remove', () => {
    it('deve chamar o service com o id', async () => {
      mockTasksService.remove.mockResolvedValue(undefined);

      await controller.remove(1);

      expect(mockTasksService.remove).toHaveBeenCalledWith(1);
    });
  });
});
