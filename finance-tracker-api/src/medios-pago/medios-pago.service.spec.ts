import { Test, TestingModule } from '@nestjs/testing';
import { MediosPagoService } from './medios-pago.service';

describe('MediosPagoService', () => {
  let service: MediosPagoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MediosPagoService],
    }).compile();

    service = module.get<MediosPagoService>(MediosPagoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
