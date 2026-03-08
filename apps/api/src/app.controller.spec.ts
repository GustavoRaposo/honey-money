import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

const mockAppService = {
  getInfo: jest.fn().mockReturnValue({ name: 'honey-money', version: '0.1.0' }),
};

describe('AppController', () => {
  let controller: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: AppService, useValue: mockAppService }],
    }).compile();

    controller = app.get<AppController>(AppController);
    jest.clearAllMocks();
  });

  describe('getInfo', () => {
    it('deve retornar name e version do projeto', () => {
      mockAppService.getInfo.mockReturnValue({
        name: 'honey-money',
        version: '0.1.0',
      });

      const result = controller.getInfo();

      expect(mockAppService.getInfo).toHaveBeenCalled();
      expect(result).toEqual({ name: 'honey-money', version: '0.1.0' });
    });
  });
});
