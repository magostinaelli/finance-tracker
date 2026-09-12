import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CuentasService } from './cuentas.service';
import { CuentasController } from './cuentas.controller';
import { Cuenta } from './entities/cuenta.entity';
import { TarjetaCredito } from 'src/tarjetas-credito/entities/tarjeta-credito.entity';
import { Movimiento } from 'src/movimientos/entities/movimiento.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cuenta, TarjetaCredito, Movimiento])],
  controllers: [CuentasController],
  providers: [CuentasService],
})
export class CuentasModule {}