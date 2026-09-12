import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriasModule } from './categorias/categorias.module';
import { MovimientosModule } from './movimientos/movimientos.module';
import { CuentasModule } from './cuentas/cuentas.module';
import { MediosPagoModule } from './medios-pago/medios-pago.module';
import { ComprasModule } from './compras/compras.module';
import { GastosModule } from './gastos/gastos.module';
import { PagosModule } from './pagos/pagos.module';
import { IngresosModule } from './ingresos/ingresos.module';
import { TransaccionesModule } from './transacciones/transacciones.module';
import { TarjetasCreditoModule } from './tarjetas-credito/tarjetas-credito.module';
import { CierreAnualModule } from './cierre-anual/cierre-anual.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mssql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      synchronize: false,
      autoLoadEntities: true,
      options: {
        trustServerCertificate: true,
      },
    }),
    CategoriasModule,
    MovimientosModule,
    CuentasModule,
    MediosPagoModule,
    GastosModule,
    ComprasModule,
    PagosModule,
    IngresosModule,
    TransaccionesModule,
    TarjetasCreditoModule,
    CierreAnualModule,
    ScheduleModule.forRoot(),
  ],
})
export class AppModule {}