import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
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

  findAll(tipoCuenta?: TipoCuenta): Promise<MediosPago[]> {
    if (!tipoCuenta || !COMPATIBILIDAD[tipoCuenta]) {
      return this.mediosPagoRepository.find({ where: { activo: true } });
    }
    const tiposCompatibles = COMPATIBILIDAD[tipoCuenta];
    return this.mediosPagoRepository.find({
      where: { activo: true, tipo: In(tiposCompatibles) },
    });
  }

  create(dto: { nombre: string; tipo: TipoMedioPago; activo: boolean }): Promise<MediosPago> {
    const medioPago = this.mediosPagoRepository.create(dto);
    return this.mediosPagoRepository.save(medioPago);
  }
}