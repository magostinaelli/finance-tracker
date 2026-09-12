import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediosPagoService } from './medios-pago.service';
import { MediosPagoController } from './medios-pago.controller';
import { MediosPago } from './entities/medios-pago.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MediosPago])],
  controllers: [MediosPagoController],
  providers: [MediosPagoService],
})
export class MediosPagoModule {}