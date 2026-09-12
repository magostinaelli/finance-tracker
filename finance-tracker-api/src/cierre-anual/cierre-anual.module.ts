import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CierreAnualService } from './cierre-anual.service';
import { ResumenAnual } from './entities/resumen-anual.entity';
import { Movimiento } from '../movimientos/entities/movimiento.entity';
import { Transaccion } from '../transacciones/entities/transaccion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ResumenAnual, Movimiento, Transaccion])],
  providers: [CierreAnualService],
  exports: [CierreAnualService],
})
export class CierreAnualModule {}