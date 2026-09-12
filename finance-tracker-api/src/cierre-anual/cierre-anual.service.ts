import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, LessThanOrEqual } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ResumenAnual } from './entities/resumen-anual.entity';
import { Movimiento } from '../movimientos/entities/movimiento.entity';
import { Transaccion } from '../transacciones/entities/transaccion.entity';

@Injectable()
export class CierreAnualService {
  private readonly logger = new Logger(CierreAnualService.name);

  constructor(
    @InjectRepository(ResumenAnual)
    private readonly resumenAnualRepository: Repository<ResumenAnual>,
    @InjectRepository(Movimiento)
    private readonly movimientoRepository: Repository<Movimiento>,
    @InjectRepository(Transaccion)
    private readonly transaccionRepository: Repository<Transaccion>,
    private readonly dataSource: DataSource,
  ) {}

  // Corre el 31 de diciembre a las 23:59
  @Cron('59 23 31 12 *')
  async ejecutarCierreAnual() {
    const anioACerrar = new Date().getFullYear();
    this.logger.log(`Iniciando cierre anual para el año ${anioACerrar}`);

    try {
      await this.cerrarAnio(anioACerrar);
      this.logger.log(`Cierre anual ${anioACerrar} completado correctamente`);
    } catch (error) {
      this.logger.error(`Error en cierre anual ${anioACerrar}: ${error.message}`);
    }
  }

  async cerrarAnio(anio: number) {
    // Verificar que no se haya cerrado ya
    const yaExiste = await this.resumenAnualRepository.findOne({ where: { anio } });
    if (yaExiste) {
      throw new Error(`El año ${anio} ya fue cerrado`);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const inicioAnio = new Date(anio, 0, 1);
      const finAnio = new Date(anio, 11, 31, 23, 59, 59);

      // 1) Calcular totales de ingresos del año
      const resultadoIngresos = await queryRunner.manager
        .createQueryBuilder(Movimiento, 'movimiento')
        .innerJoin('movimiento.transaccion', 'transaccion')
        .innerJoin('transaccion.ingreso', 'ingreso')
        .select('SUM(movimiento.monto)', 'total')
        .where('movimiento.fecha BETWEEN :inicio AND :fin', { inicio: inicioAnio, fin: finAnio })
        .getRawOne();

      // 2) Calcular totales de gastos del año (excluyendo compras canceladas con cuotas futuras)
      const resultadoGastos = await queryRunner.manager
        .createQueryBuilder(Movimiento, 'movimiento')
        .innerJoin('movimiento.transaccion', 'transaccion')
        .innerJoin('transaccion.gasto', 'gasto')
        .leftJoin('gasto.compra', 'compra')
        .select('SUM(movimiento.monto)', 'total')
        .where('movimiento.fecha BETWEEN :inicio AND :fin', { inicio: inicioAnio, fin: finAnio })
        .andWhere(
          '(compra.estado IS NULL OR compra.estado != :cancelada)',
          { cancelada: 'CANCELADA' },
        )
        .getRawOne();

      const ingresos = Number(resultadoIngresos?.total ?? 0);
      const gastos = Number(resultadoGastos?.total ?? 0);

      // 3) Guardar el resumen anual
      const resumen = queryRunner.manager.create(ResumenAnual, {
        anio,
        ingresos,
        gastos,
        balance: ingresos - gastos,
        fechaCierre: new Date(),
      });
      await queryRunner.manager.save(resumen);

      // 4) Borrar transacciones del año que se pueden archivar:
      //    - Ingresos y Pagos (siempre, son hechos únicos ya pasados)
      //    - Compras en estado PAGADA o CANCELADA con todas sus cuotas en el pasado
      const transaccionesABorrar = await queryRunner.manager
        .createQueryBuilder(Transaccion, 'transaccion')
        .innerJoin('transaccion.gasto', 'gasto')
        .leftJoin('gasto.compra', 'compra')
        .leftJoin('transaccion.movimientos', 'movimientos')
        .where('YEAR(transaccion.fecha) = :anio', { anio })
        .andWhere(
          // Pagos (no tienen compra) O Compras PAGADA/CANCELADA sin cuotas futuras
          '(compra.id IS NULL OR (compra.estado IN (:...estados) AND NOT EXISTS ' +
          '(SELECT 1 FROM Movimiento m WHERE m.transaccionId = transaccion.id AND m.fecha > :hoy)))',
          { estados: ['PAGADA', 'CANCELADA'], hoy: new Date() },
        )
        .getMany();

      // Borrar en cascada (SQL ON DELETE CASCADE se encarga de Gasto, Compra, Pago, Movimiento)
      for (const transaccion of transaccionesABorrar) {
        await queryRunner.manager.delete(Transaccion, transaccion.id);
      }

      // 5) Borrar Ingresos del año (también en cascada)
      const transaccionesIngreso = await queryRunner.manager
        .createQueryBuilder(Transaccion, 'transaccion')
        .innerJoin('transaccion.ingreso', 'ingreso')
        .where('YEAR(transaccion.fecha) = :anio', { anio })
        .getMany();

      for (const transaccion of transaccionesIngreso) {
        await queryRunner.manager.delete(Transaccion, transaccion.id);
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}