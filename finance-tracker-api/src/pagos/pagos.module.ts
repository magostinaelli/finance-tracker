import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PagosService } from './pagos.service';
import { PagosController } from './pagos.controller';
import { Pago } from './entities/pago.entity';
import { Gasto } from '../gastos/entities/gasto.entity';
import { Movimiento } from '../movimientos/entities/movimiento.entity';
import { Transaccion } from '../transacciones/entities/transaccion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pago, Gasto, Movimiento, Transaccion])],
  controllers: [PagosController],
  providers: [PagosService],
})
export class PagosModule {}