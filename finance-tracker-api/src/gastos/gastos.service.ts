import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Gasto } from './entities/gasto.entity';

@Injectable()
export class GastosService {
  constructor(
    @InjectRepository(Gasto)
    private readonly gastoRepository: Repository<Gasto>,
  ) {}

  /**
   * Lista unificada de todos los gastos (Compras + Pagos),
   * ordenados por fecha de transaccion descendente (más recientes primero).
   * El campo tipoGasto indica si es COMPRA o PAGO_SERVICIO.
   */
  findAll(): Promise<Gasto[]> {
    return this.gastoRepository.find({
      relations: {
        categoria: true,
        cuenta: true,
        medioPago: true,
        compra: true,
        pago: true,
        transaccion: {
          movimientos: true,
        },
      },
      order: {
        transaccion: {
          fecha: 'DESC',
        },
      },
    });
  }

  async findOne(id: number): Promise<Gasto> {
    const gasto = await this.gastoRepository.findOne({
      where: { id },
      relations: {
        categoria: true,
        cuenta: true,
        medioPago: true,
        compra: true,
        pago: true,
        transaccion: {
          movimientos: true,
        },
      },
    });

    if (!gasto) {
      throw new NotFoundException(`Gasto con id ${id} no encontrado`);
    }

    return gasto;
  }
}