import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Ingreso } from './entities/ingreso.entity';
import { Movimiento } from '../movimientos/entities/movimiento.entity';
import { Transaccion } from '../transacciones/entities/transaccion.entity';
import { CreateIngresoDto } from './dto/create-ingreso.dto';
import { UpdateIngresoDto } from './dto/update-ingreso.dto';

@Injectable()
export class IngresosService {
  constructor(
    @InjectRepository(Ingreso)
    private readonly ingresoRepository: Repository<Ingreso>,
    @InjectRepository(Movimiento)
    private readonly movimientoRepository: Repository<Movimiento>,
    @InjectRepository(Transaccion)
    private readonly transaccionRepository: Repository<Transaccion>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateIngresoDto): Promise<Ingreso> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const [anio, mes, dia] = dto.fecha.toString().split('-').map(Number);
      const fecha = new Date(anio, mes - 1, dia);

      const transaccion = queryRunner.manager.create(Transaccion, { fecha });
      const transaccionGuardada = await queryRunner.manager.save(transaccion);

      const ingreso = queryRunner.manager.create(Ingreso, {
        id: transaccionGuardada.id,
        categoriaId: dto.categoriaId,
        cuentaId: dto.cuentaId,
      });
      const ingresoGuardado = await queryRunner.manager.save(ingreso);

      const movimiento = queryRunner.manager.create(Movimiento, {
        fecha, // misma fecha que Transaccion
        monto: dto.monto,
        descripcion: dto.descripcion,
        transaccionId: transaccionGuardada.id,
      });
      await queryRunner.manager.save(movimiento);

      await queryRunner.commitTransaction();

      return this.findOne(ingresoGuardado.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('No se pudo crear el ingreso: ' + error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async findOne(id: number): Promise<Ingreso> {
    const ingreso = await this.ingresoRepository.findOne({
      where: { id },
      relations: {
        categoria: true,
        cuenta: true,
        transaccion: {
          movimientos: true,
        },
      },
    });

    if (!ingreso) {
      throw new NotFoundException(`Ingreso con id ${id} no encontrado`);
    }

    return ingreso;
  }

  findAll(): Promise<Ingreso[]> {
    return this.ingresoRepository.find({
      relations: {
        categoria: true,
        cuenta: true,
        transaccion: {
          movimientos: true,
        },
      },
    });
  }

  async remove(id: number): Promise<{ mensaje: string }> {
    const ingreso = await this.ingresoRepository.findOne({
      where: { id },
      relations: {
        transaccion: {
          movimientos: true,
        },
      },
    });

    if (!ingreso) throw new NotFoundException(`Ingreso ${id} no encontrado`);

    const hoy = new Date();
    const movimiento = ingreso.transaccion.movimientos[0];

    if (movimiento && new Date(movimiento.fecha) <= hoy) {
      throw new BadRequestException(
        'Este ingreso ya tiene historia registrada. No se puede eliminar.'
      );
    }

    await this.transaccionRepository.delete(ingreso.transaccion.id);
    return { mensaje: 'Ingreso eliminado correctamente' };
  }  

  async update(id: number, dto: UpdateIngresoDto): Promise<Ingreso> {
    const ingreso = await this.ingresoRepository.findOne({
      where: { id },
      relations: {
        transaccion: {
          movimientos: true,
        },
      },
    });

    if (!ingreso) throw new NotFoundException(`Ingreso ${id} no encontrado`);

    // Actualizar Ingreso si cambian categoría o cuenta
    await this.ingresoRepository.update(id, {
      ...(dto.categoriaId && { categoriaId: dto.categoriaId }),
      ...(dto.cuentaId && { cuentaId: dto.cuentaId }),
    });

    // Actualizar el Movimiento (fecha y monto)
    const movimiento = ingreso.transaccion.movimientos[0];
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
        ingreso.transaccion.id,
        { fecha: new Date(anio, mes - 1, dia) }
      );
    }

    return this.findOne(id);
  }
}