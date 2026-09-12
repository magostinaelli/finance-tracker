import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IngresosService } from './ingresos.service';
import { IngresosController } from './ingresos.controller';
import { Ingreso } from './entities/ingreso.entity';
import { Movimiento } from '../movimientos/entities/movimiento.entity';
import { Transaccion } from 'src/transacciones/entities/transaccion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ingreso, Movimiento, Transaccion])],
  controllers: [IngresosController],
  providers: [IngresosService],
})
export class IngresosModule {}