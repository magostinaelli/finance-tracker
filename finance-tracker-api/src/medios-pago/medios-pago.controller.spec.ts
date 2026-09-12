import { Test, TestingModule } from '@nestjs/testing';
import { MediosPagoController } from './medios-pago.controller';
import { MediosPagoService } from './medios-pago.service';

describe('MediosPagoController', () => {
  let controller: MediosPagoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MediosPagoController],
      providers: [MediosPagoService],
    }).compile();

    controller = module.get<MediosPagoController>(MediosPagoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
