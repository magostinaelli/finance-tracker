import { Module } from '@nestjs/common';
import { ComprasService } from './compras.service';
import { ComprasController } from './compras.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Compra } from './entities/compra.entity';
import { Gasto } from 'src/gastos/entities/gasto.entity';
import { Movimiento } from 'src/movimientos/entities/movimiento.entity';
import { Transaccion } from 'src/transacciones/entities/transaccion.entity';
import { Cuenta } from 'src/cuentas/entities/cuenta.entity';
import { TarjetaCredito } from 'src/tarjetas-credito/entities/tarjeta-credito.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Compra,Cuenta, Gasto, Movimiento, Transaccion, TarjetaCredito])],
  controllers: [ComprasController],
  providers: [ComprasService],
})
export class ComprasModule {}