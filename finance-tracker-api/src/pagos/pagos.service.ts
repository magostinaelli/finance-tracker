import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Pago } from './entities/pago.entity';
import { Gasto } from '../gastos/entities/gasto.entity';
import { Movimiento } from '../movimientos/entities/movimiento.entity';
import { Transaccion } from '../transacciones/entities/transaccion.entity';
import { TipoGasto } from '../gastos/enums/tipo-gasto.enum';
import { CreatePagoDto } from './dto/create-pago.dto';
import { UpdatePagoDto } from './dto/update-pago.dto';

@Injectable()
export class PagosService {
  constructor(
    @InjectRepository(Pago)
    private readonly pagoRepository: Repository<Pago>,
    @InjectRepository(Gasto)
    private readonly gastoRepository: Repository<Gasto>,
    @InjectRepository(Movimiento)
    private readonly movimientoRepository: Repository<Movimiento>,
    @InjectRepository(Transaccion)
    private readonly transaccionRepository: Repository<Transaccion>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreatePagoDto): Promise<Pago> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const [anio, mes, dia] = dto.fecha.toString().split('-').map(Number);
      const fecha = new Date(anio, mes - 1, dia);

      // 1) Insertar la Transaccion con la fecha real del pago
      const transaccion = queryRunner.manager.create(Transaccion, { fecha });
      const transaccionGuardada = await queryRunner.manager.save(transaccion);

      // 2) Insertar el Gasto
      const gasto = queryRunner.manager.create(Gasto, {
        id: transaccionGuardada.id,
        tipoGasto: TipoGasto.PAGO_SERVICIO,
        categoriaId: dto.categoriaId,
        cuentaId: dto.cuentaId,
        medioPagoId: dto.medioPagoId,
      });
      const gastoGuardado = await queryRunner.manager.save(gasto);

      // 3) Insertar el Pago
      const pago = queryRunner.manager.create(Pago, {
        id: gastoGuardado.id,
        tipoServicio: dto.tipoServicio,
        numeroReferencia: dto.numeroReferencia,
        detalleOtro: dto.detalleOtro,
        cuentaTarjetaId: dto.cuentaTarjetaId
      });
      const pagoGuardado = await queryRunner.manager.save(pago);

      // 4) Insertar el Movimiento — fecha igual a la de la transaccion (no hay cuotas)
      const movimiento = queryRunner.manager.create(Movimiento, {
        fecha, // misma fecha que Transaccion
        monto: dto.monto,
        descripcion: dto.descripcion,
        transaccionId: transaccionGuardada.id,
      });
      await queryRunner.manager.save(movimiento);

      await queryRunner.commitTransaction();

      return this.findOne(pagoGuardado.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('No se pudo crear el pago: ' + error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async findOne(id: number): Promise<Pago> {
    const pago = await this.pagoRepository.findOne({
      where: { id },
      relations: {
        cuentaTarjeta: true,
        gasto: {
          categoria: true,
          cuenta: true,
          medioPago: true,
          transaccion: {
            movimientos: true,
          },
        },
      },
    });

    if (!pago) {
      throw new NotFoundException(`Pago con id ${id} no encontrado`);
    }

    return pago;
  }

  findAll(): Promise<Pago[]> {
    return this.pagoRepository.find({
      relations: {
        cuentaTarjeta: true,
        gasto: {
          categoria: true,
          cuenta: true,
          medioPago: true,
          transaccion: {
            movimientos: true,
          },
        },
      },
    });
  }

  async remove(id: number): Promise<{ mensaje: string }> {
    const pago = await this.pagoRepository.findOne({
      where: { id },
      relations: {
        gasto: {
          transaccion: {
            movimientos: true,
          },
        },
      },
    });

    if (!pago) throw new NotFoundException(`Pago ${id} no encontrado`);

    const hoy = new Date();
    const movimiento = pago.gasto.transaccion.movimientos[0];

    if (movimiento && new Date(movimiento.fecha) <= hoy) {
      throw new BadRequestException(
        'Este pago ya tiene historia registrada. No se puede eliminar.'
      );
    }

    await this.transaccionRepository.delete(pago.gasto.transaccion.id);
    return { mensaje: 'Pago eliminado correctamente' };
  }
  async update(id: number, dto: UpdatePagoDto): Promise<Pago> {
    const pago = await this.pagoRepository.findOne({
      where: { id },
      relations: {
        gasto: {
          transaccion: {
            movimientos: true,
          },
        },
      },
    });

    if (!pago) throw new NotFoundException(`Pago ${id} no encontrado`);

    // Actualizar Gasto si cambian categoría, cuenta o medio de pago
    if (dto.categoriaId || dto.cuentaId || dto.medioPagoId) {
      await this.gastoRepository.update(pago.gasto.id, {
        ...(dto.categoriaId && { categoriaId: dto.categoriaId }),
        ...(dto.cuentaId && { cuentaId: dto.cuentaId }),
        ...(dto.medioPagoId && { medioPagoId: dto.medioPagoId }),
      });
    }

    // Actualizar Pago
    await this.pagoRepository.update(id, {
      ...(dto.tipoServicio && { tipoServicio: dto.tipoServicio }),
      ...(dto.numeroReferencia !== undefined && { numeroReferencia: dto.numeroReferencia }),
      ...(dto.detalleOtro !== undefined && { detalleOtro: dto.detalleOtro }),
    });

    // Actualizar el Movimiento (fecha y monto)
    const movimiento = pago.gasto.transaccion.movimientos[0];
    if (movimiento) {
      const updates: any = {};
      if (dto.fecha) {
        const [anio, mes, dia] = dto.fecha.toString().split('-').map(Number);
        updates.fecha = new Date(anio, mes - 1, dia);
      }
      if (dto.monto) updates.monto = dto.monto;
      if (dto.descripcion !== undefined) updates.descripcion = dto.descripcion;
      if (Object.keys(updates).length > 0) {
        await this.movimientoRepository.update(movimiento.id, updates);
      }
    }

    // Actualizar fecha en Transaccion si cambió
    if (dto.fecha) {
      const [anio, mes, dia] = dto.fecha.toString().split('-').map(Number);
      await this.transaccionRepository.update(
        pago.gasto.transaccion.id,
        { fecha: new Date(anio, mes - 1, dia) }
      );
    }

    return this.findOne(id);
  }

}