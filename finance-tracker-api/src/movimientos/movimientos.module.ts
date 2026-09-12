import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MovimientosService } from './movimientos.service';
import { MovimientosController } from './movimientos.controller';
import { Movimiento } from './entities/movimiento.entity';
import { Categoria } from 'src/categorias/entities/categoria.entity';
import { Cuenta } from 'src/cuentas/entities/cuenta.entity';
import { MediosPago } from 'src/medios-pago/entities/medios-pago.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Movimiento, Categoria, Cuenta, MediosPago])],
  controllers: [MovimientosController],
  providers: [MovimientosService],
})
export class MovimientosModule {}