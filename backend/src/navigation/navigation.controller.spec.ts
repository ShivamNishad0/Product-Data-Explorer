import { Test, TestingModule } from '@nestjs/testing';
import { NavigationController } from './navigation.controller';
import { NavigationService } from './navigation.service';

describe('NavigationController', () => {
  let controller: NavigationController;
  let service: NavigationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NavigationController],
      providers: [
        {
          provide: NavigationService,
          useValue: {
            findAll: jest.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    controller = module.get<NavigationController>(NavigationController);
    service = module.get<NavigationService>(NavigationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return navigation headings', async () => {
    const result = await controller.findAll();
    expect(service.findAll).toHaveBeenCalled();
    expect(result).toEqual([]);
  });
});
