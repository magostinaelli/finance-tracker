import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateMediosPagoDto } from './dto/create-medios-pago.dto';
import { UpdateMediosPagoDto } from './dto/update-medios-pago.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, FindOptionsWhere  } from 'typeorm';
import { MediosPago } from './entities/medios-pago.entity';
import { TipoMedioPago } from './enums/tipo-medio-pago.enum';
import { TipoCuenta } from '../cuentas/enums/tipo-cuenta.enum';

const COMPATIBILIDAD: Record<TipoCuenta, TipoMedioPago[]> = {
  [TipoCuenta.EFECTIVO]: [TipoMedioPago.EFECTIVO],
  [TipoCuenta.BILLETERA_VIRTUAL]: [TipoMedioPago.BILLETERA_VIRTUAL],
  [TipoCuenta.TARJETA_DEBITO]: [TipoMedioPago.TARJETA_DEBITO, TipoMedioPago.BILLETERA_VIRTUAL],
  [TipoCuenta.TARJETA_CREDITO]: [TipoMedioPago.TARJETA_CREDITO, TipoMedioPago.BILLETERA_VIRTUAL],
  [TipoCuenta.OTRO]: Object.values(TipoMedioPago),
};

@Injectable()
export class MediosPagoService {
  constructor(
    @InjectRepository(MediosPago)
    private readonly mediosPagoRepository: Repository<MediosPago>,
  ) {}

  findAll(tipoCuenta?: TipoCuenta, incluirInactivos = false): Promise<MediosPago[]> {
    const where: FindOptionsWhere<MediosPago> = incluirInactivos ? {} : { activo: true };
    if (tipoCuenta && COMPATIBILIDAD[tipoCuenta]) {
      where.tipo = In(COMPATIBILIDAD[tipoCuenta]);
    }
    return this.mediosPagoRepository.find({ where });
  }

  create(dto: CreateMediosPagoDto): Promise<MediosPago> {
    const medioPago = this.mediosPagoRepository.create({
      ...dto,
      activo: dto.activo ?? true,
    });
    return this.mediosPagoRepository.save(medioPago);
  }

  async findOne(id: number): Promise<MediosPago> {
    const medioPago = await this.mediosPagoRepository.findOne({ where: { id } });
    if (!medioPago) throw new NotFoundException(`Medio de pago ${id} no encontrado`);
    return medioPago;
  }

  async update(id: number, dto: UpdateMediosPagoDto): Promise<MediosPago> {
    const medioPago = await this.findOne(id);
    if (dto.nombre !== undefined) medioPago.nombre = dto.nombre;
    if (dto.activo !== undefined) medioPago.activo = dto.activo;
    return this.mediosPagoRepository.save(medioPago);
  }

  async remove(id: number): Promise<void> {
    const medioPago = await this.mediosPagoRepository.findOne({
      where: { id },
      relations: { gastos: true },
    });
    if (!medioPago) throw new NotFoundException(`Medio de pago ${id} no encontrado`);

    if (medioPago.gastos.length > 0) {
      throw new ConflictException(
        `El medio de pago está en uso en ${medioPago.gastos.length} gasto(s). Eliminá esos gastos antes de borrarlo.`,
      );
    }

    await this.mediosPagoRepository.delete(id);
  }
}