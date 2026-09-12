import { Test, TestingModule } from '@nestjs/testing';
import { CierreAnualService } from './cierre-anual.service';

describe('CierreAnualService', () => {
  let service: CierreAnualService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CierreAnualService],
    }).compile();

    service = module.get<CierreAnualService>(CierreAnualService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
