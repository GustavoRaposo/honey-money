import { Test, TestingModule } from '@nestjs/testing';
import { TaskTimeTracksController } from './task-time-tracks.controller.js';
import { TaskTimeTracksService } from './task-time-tracks.service.js';
import type { TaskTimeTrackResponseDto } from './dto/task-time-track-response.dto.js';

const mockService = {
  start: jest.fn(),
  stop: jest.fn(),
  findAll: jest.fn(),
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

const mockRequest = { user: { id: 2 } };

describe('TaskTimeTracksController', () => {
  let controller: TaskTimeTracksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskTimeTracksController],
      providers: [{ provide: TaskTimeTracksService, useValue: mockService }],
    }).compile();

    controller = module.get<TaskTimeTracksController>(TaskTimeTracksController);
    jest.clearAllMocks();
  });

  describe('start', () => {
    it('deve chamar service.start com taskId e userId do request', async () => {
      mockService.start.mockResolvedValue(trackResponse);

      const result = await controller.start(10, mockRequest);

      expect(mockService.start).toHaveBeenCalledWith(10, 2);
      expect(result).toEqual(trackResponse);
    });
  });

  describe('stop', () => {
    it('deve chamar service.stop com taskId, trackId e userId do request', async () => {
      const stopped = { ...trackResponse, endDate: new Date() };
      mockService.stop.mockResolvedValue(stopped);

      const result = await controller.stop(10, 1, mockRequest);

      expect(mockService.stop).toHaveBeenCalledWith(10, 1, 2);
      expect(result).toEqual(stopped);
    });
  });

  describe('findAll', () => {
    it('deve chamar service.findAll com taskId', async () => {
      mockService.findAll.mockResolvedValue([trackResponse]);

      const result = await controller.findAll(10);

      expect(mockService.findAll).toHaveBeenCalledWith(10);
      expect(result).toEqual([trackResponse]);
    });
  });
});
