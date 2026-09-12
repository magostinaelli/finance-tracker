import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaccion } from './entities/transaccion.entity';
import { FiltrosTransaccionDto } from './dto/filtros-transaccion.dto';


@Injectable()
export class TransaccionesService {
  constructor(
    @InjectRepository(Transaccion)
    private readonly transaccionRepository: Repository<Transaccion>,
  ) {}

  findAll(filtros: FiltrosTransaccionDto): Promise<Transaccion[]> {
    const query = this.transaccionRepository
      .createQueryBuilder('transaccion')
      .leftJoinAndSelect('transaccion.movimientos', 'movimiento')
      .leftJoinAndSelect('transaccion.gasto', 'gasto')
      .leftJoinAndSelect('gasto.categoria', 'categoriaGasto')
      .leftJoinAndSelect('gasto.cuenta', 'cuentaGasto')
      .leftJoinAndSelect('gasto.compra', 'compra')
      .leftJoinAndSelect('gasto.pago', 'pago')
      .leftJoinAndSelect('transaccion.ingreso', 'ingreso')
      .leftJoinAndSelect('ingreso.categoria', 'categoriaIngreso')
      .leftJoinAndSelect('ingreso.cuenta', 'cuentaIngreso')
      .leftJoinAndSelect('gasto.medioPago', 'medioPagoGasto')
      .orderBy('transaccion.fecha', 'DESC');

    // --- Filtro de fecha: mes/anio tiene prioridad sobre el rango ---
    if (filtros.mes && filtros.anio) {
      query.andWhere('MONTH(transaccion.fecha) = :mes', { mes: filtros.mes });
      query.andWhere('YEAR(transaccion.fecha) = :anio', { anio: filtros.anio });
    } else if (filtros.mes) {
      query.andWhere('MONTH(transaccion.fecha) = :mes', { mes: filtros.mes });
    } else if (filtros.anio) {
      query.andWhere('YEAR(transaccion.fecha) = :anio', { anio: filtros.anio });
    } else if (filtros.fechaDesde && filtros.fechaHasta) {
      query.andWhere('transaccion.fecha BETWEEN :desde AND :hasta', {
        desde: filtros.fechaDesde,
        hasta: filtros.fechaHasta,
      });
    } else if (filtros.fechaDesde) {
      query.andWhere('transaccion.fecha >= :desde', { desde: filtros.fechaDesde });
    } else if (filtros.fechaHasta) {
      query.andWhere('transaccion.fecha <= :hasta', { hasta: filtros.fechaHasta });
    }

    // --- Filtro por cuenta (aplica tanto a Gasto como a Ingreso) ---
    if (filtros.cuentaId) {
      query.andWhere(
        '(gasto.cuentaId = :cuentaId OR ingreso.cuentaId = :cuentaId)',
        { cuentaId: filtros.cuentaId },
      );
    }
    if (filtros.medioPagoId) {
      query.andWhere('gasto.medioPagoId = :medioPagoId', { medioPagoId: filtros.medioPagoId });
}
    
    // --- Filtro por categoría ---
    if (filtros.categoriaId) {
      query.andWhere(
        '(gasto.categoriaId = :categoriaId OR ingreso.categoriaId = :categoriaId)',
        { categoriaId: filtros.categoriaId },
      );
    }


    // --- Filtro por tipo ---
    if (filtros.tipo === 'INGRESO') {
      // Solo transacciones que tienen Ingreso (no Gasto)
      query.andWhere('ingreso.id IS NOT NULL');
    } else if (filtros.tipo === 'COMPRA') {
      // Solo transacciones cuyo Gasto es una Compra
      query.andWhere('compra.id IS NOT NULL');
    } else if (filtros.tipo === 'PAGO_SERVICIO') {
      // Solo transacciones cuyo Gasto es un Pago de servicio
      query.andWhere('pago.id IS NOT NULL');
    }

    // Por defecto NO mostrar compras canceladas
    if (!filtros.mostrarCanceladas) {
      query.andWhere(
        '(compra.id IS NULL OR compra.estado != :cancelada)',
        { cancelada: 'CANCELADA' }
      );
    }

    return query.getMany();
  }

  async findOne(id: number): Promise<Transaccion> {
    const transaccion = await this.transaccionRepository.findOne({
      where: { id },
      relations: {
        gasto: {
          categoria: true,
          cuenta: true,
          medioPago: true,
          compra: true,
          pago: true,
        },
        ingreso: {
          categoria: true,
          cuenta: true,
        },
        movimientos: true,
      },
    });

    if (!transaccion) {
      throw new NotFoundException(`Transaccion con id ${id} no encontrada`);
    }

    return transaccion;
  }


}