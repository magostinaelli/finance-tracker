import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movimiento } from './entities/movimiento.entity';
import { ResumenMovimientosDto } from './dto/resumen-movimientos.dto';
import { FiltrosCuotasDto } from './dto/filtros-cuotas.dto';
import { ResumenAnualDto } from './dto/resumen-anual.dto';

@Injectable()
export class MovimientosService {
  constructor(
    @InjectRepository(Movimiento)
    private readonly movimientoRepository: Repository<Movimiento>,
  ) {}

  findAll(): Promise<Movimiento[]> {
    return this.movimientoRepository.find();
  }

  findOne(id: number): Promise<Movimiento | null> {
    return this.movimientoRepository.findOne({ where: { id } });
  }

  async remove(id: number) {
    await this.movimientoRepository.delete(id);
    return { mensaje: 'Movimiento eliminado' };
  }

  async getResumen(filtros: ResumenMovimientosDto) {
    const hoy = new Date();
    const mes = filtros.mes ?? hoy.getMonth() + 1;
    const anio = filtros.anio ?? hoy.getFullYear();

    const [categoriasIngresos, categoriasGastos] = await Promise.all([
      this.obtenerTotalesPorCategoriaIngreso(mes, anio),
      this.obtenerTotalesPorCategoriaGasto(mes, anio),
    ]);

    const ingresos = categoriasIngresos.reduce((acc, c) => acc + Number(c.total), 0);
    const gastos = categoriasGastos.reduce((acc, c) => acc + Number(c.total), 0);

    return {
      mes,
      anio,
      ingresos,
      gastos,
      balance: ingresos - gastos,
      categoriasIngresos,
      categoriasGastos,
    };
  }

  /**
   * Suma de Movimientos de Ingreso, agrupados por categoría, para un mes/año dado.
   * Camino: Movimiento -> Transaccion -> Ingreso -> Categoria
   */
  private async obtenerTotalesPorCategoriaIngreso(mes: number, anio: number) {
    return this.movimientoRepository
      .createQueryBuilder('movimiento')
      .innerJoin('movimiento.transaccion', 'transaccion')
      .innerJoin('transaccion.ingreso', 'ingreso') // ver nota más abajo sobre esta relación
      .innerJoin('ingreso.categoria', 'categoria')
      .select('categoria.id', 'categoriaId')
      .addSelect('categoria.nombre', 'nombre')
      .addSelect('SUM(movimiento.monto)', 'total')
      .where('MONTH(movimiento.fecha) = :mes', { mes })
      .andWhere('YEAR(movimiento.fecha) = :anio', { anio })
      .groupBy('categoria.id')
      .addGroupBy('categoria.nombre')
      .getRawMany();
  }

  /**
   * Suma de Movimientos de Gasto, agrupados por categoría, para un mes/año dado.
   * Camino: Movimiento -> Transaccion -> Gasto -> Categoria
   * Excluye cuotas futuras de Compras CANCELADAS (la historia ya pasada SÍ se cuenta).
   */
  private async obtenerTotalesPorCategoriaGasto(mes: number, anio: number) {
    const hoy = new Date();

    return this.movimientoRepository
        .createQueryBuilder('movimiento')
        .innerJoin('movimiento.transaccion', 'transaccion')
        .innerJoin('transaccion.gasto', 'gasto') // ver nota más abajo sobre esta relación
        .innerJoin('gasto.categoria', 'categoria')
        .leftJoin('gasto.compra', 'compra') // un Gasto puede o no tener Compra (también puede ser Pago)
        .select('categoria.id', 'categoriaId')
        .addSelect('categoria.nombre', 'nombre')
        .addSelect('SUM(movimiento.monto)', 'total')
        .where('MONTH(movimiento.fecha) = :mes', { mes })
        .andWhere('YEAR(movimiento.fecha) = :anio', { anio })
        // Excluir SOLO cuotas futuras de compras canceladas:
        .andWhere(
          '(compra.estado IS NULL OR compra.estado != :cancelada OR movimiento.fecha <= :hoy)',
          { cancelada: 'CANCELADA', hoy },
        )
        .groupBy('categoria.id')
        .addGroupBy('categoria.nombre')
        .getRawMany();
    }

    async getCuotasFuturas(filtros: FiltrosCuotasDto) {
    const hoy = new Date();

    const query = this.movimientoRepository
      .createQueryBuilder('movimiento')
      .innerJoinAndSelect('movimiento.transaccion', 'transaccion')
      .innerJoinAndSelect('transaccion.gasto', 'gasto')
      .innerJoinAndSelect('gasto.compra', 'compra')
      .innerJoinAndSelect('gasto.categoria', 'categoria')
      .innerJoinAndSelect('gasto.cuenta', 'cuenta')
      .innerJoinAndSelect('gasto.medioPago', 'medioPago')
      .where('movimiento.fecha > :hoy', { hoy })
      .andWhere('compra.estado != :cancelada', { cancelada: 'CANCELADA' });

    if (filtros.cuentaId) {
      query.andWhere('gasto.cuentaId = :cuentaId', { cuentaId: filtros.cuentaId });
    }

    if (filtros.mes && filtros.anio) {
      query.andWhere('MONTH(movimiento.fecha) = :mes', { mes: filtros.mes });
      query.andWhere('YEAR(movimiento.fecha) = :anio', { anio: filtros.anio });
    } else if (filtros.mes) {
      query.andWhere('MONTH(movimiento.fecha) = :mes', { mes: filtros.mes });
    } else if (filtros.anio) {
      query.andWhere('YEAR(movimiento.fecha) = :anio', { anio: filtros.anio });
    }

    query.orderBy('movimiento.fecha', 'ASC');

    return query.getMany();
  }

  async getResumenAnual(filtros: ResumenAnualDto) {
    const anio = filtros.anio ?? new Date().getFullYear();
    const hoy = new Date();

    const ingresosPorMes = await this.movimientoRepository
      .createQueryBuilder('movimiento')
      .innerJoin('movimiento.transaccion', 'transaccion')
      .innerJoin('transaccion.ingreso', 'ingreso')
      .select('MONTH(movimiento.fecha)', 'mes')
      .addSelect('SUM(movimiento.monto)', 'total')
      .where('YEAR(movimiento.fecha) = :anio', { anio })
      .groupBy('MONTH(movimiento.fecha)')
      .getRawMany();

    const gastosPorMes = await this.movimientoRepository
      .createQueryBuilder('movimiento')
      .innerJoin('movimiento.transaccion', 'transaccion')
      .innerJoin('transaccion.gasto', 'gasto')
      .leftJoin('gasto.compra', 'compra')
      .select('MONTH(movimiento.fecha)', 'mes')
      .addSelect('SUM(movimiento.monto)', 'total')
      .where('YEAR(movimiento.fecha) = :anio', { anio })
      .andWhere(
        '(compra.estado IS NULL OR compra.estado != :cancelada OR movimiento.fecha <= :hoy)',
        { cancelada: 'CANCELADA', hoy },
      )
      .groupBy('MONTH(movimiento.fecha)')
      .getRawMany();

    return Array.from({ length: 12 }, (_, i) => {
      const mes = i + 1;
      const ing = ingresosPorMes.find((r) => Number(r.mes) === mes);
      const gas = gastosPorMes.find((r) => Number(r.mes) === mes);
      return {
        mes,
        ingresos: Number(ing?.total ?? 0),
        gastos: Number(gas?.total ?? 0),
      };
    });
  }  
}