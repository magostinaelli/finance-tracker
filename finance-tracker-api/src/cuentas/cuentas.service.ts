import { Injectable, InternalServerErrorException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, MoreThan } from 'typeorm';
import { CreateCuentaDto } from './dto/create-cuenta.dto';
import { Cuenta } from './entities/cuenta.entity';
import { TarjetaCredito } from '../tarjetas-credito/entities/tarjeta-credito.entity';
import { Movimiento } from '../movimientos/entities/movimiento.entity';
import { TipoCuenta } from './enums/tipo-cuenta.enum';
import {
  calcularFechaCierre,
  calcularFechaVencimiento,
  validarDistanciaCierreVencimiento,
} from '../tarjetas-credito/calculo-fechas-tarjeta';

@Injectable()
export class CuentasService {
  constructor(
    @InjectRepository(Cuenta)
    private readonly cuentaRepository: Repository<Cuenta>,
    @InjectRepository(TarjetaCredito)
    private readonly tarjetaCreditoRepository: Repository<TarjetaCredito>,
    @InjectRepository(Movimiento)
    private readonly movimientoRepository: Repository<Movimiento>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateCuentaDto) {
    const existente = await this.cuentaRepository.findOne({
      where: { nombre: dto.nombre, tipo: dto.tipo as TipoCuenta },
    });

    if (existente) {
      throw new BadRequestException(
        `Ya existe una cuenta con el nombre "${dto.nombre}" y tipo "${dto.tipo}". Si son cuentas distintas, usá un nombre diferente.`
      );
    }

    if (dto.tipo !== TipoCuenta.TARJETA_CREDITO) {
      const cuenta = this.cuentaRepository.create({
        nombre: dto.nombre,
        tipo: dto.tipo,
        activo: dto.activo,
      });
      return await this.cuentaRepository.save(cuenta);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const cuenta = queryRunner.manager.create(Cuenta, {
        nombre: dto.nombre,
        tipo: dto.tipo,
        activo: dto.activo,
      });
      const cuentaGuardada = await queryRunner.manager.save(cuenta);

      const tarjetaCredito = queryRunner.manager.create(TarjetaCredito, {
        id: cuentaGuardada.id,
        modoCierre: dto.modoCierre,
        diaSemanaCierre: dto.diaSemanaCierre,
        posicionCierre: dto.posicionCierre,
        diaFijoCierre: dto.diaFijoCierre,
        modoVencimiento: dto.modoVencimiento,
        diaSemanaVencimiento: dto.diaSemanaVencimiento,
        posicionVencimiento: dto.posicionVencimiento,
        diaFijoVencimiento: dto.diaFijoVencimiento,
        diasDespuesCierre: dto.diasDespuesCierre,
      });
      await queryRunner.manager.save(tarjetaCredito);
      await queryRunner.commitTransaction();

      const resultado = await this.findOne(cuentaGuardada.id);
      const aviso = this.calcularAvisoDistancia(tarjetaCredito);
      return aviso ? { ...resultado, aviso } : resultado;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('No se pudo crear la cuenta: ' + error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async desactivar(id: number) {
    const cuenta = await this.cuentaRepository.findOne({ where: { id } });
    if (!cuenta) throw new NotFoundException(`Cuenta ${id} no encontrada`);

    // Buscar movimientos futuros asociados a esta cuenta
    const hoy = new Date();
    const movimientosFuturos = await this.movimientoRepository
      .createQueryBuilder('movimiento')
      .innerJoin('movimiento.transaccion', 'transaccion')
      .innerJoin('transaccion.gasto', 'gasto')
      .where('gasto.cuentaId = :id', { id })
      .andWhere('movimiento.fecha > :hoy', { hoy })
      .getCount();

    // Buscar último movimiento histórico
    const ultimoMovimiento = await this.movimientoRepository
      .createQueryBuilder('movimiento')
      .innerJoin('movimiento.transaccion', 'transaccion')
      .innerJoin('transaccion.gasto', 'gasto')
      .where('gasto.cuentaId = :id', { id })
      .orderBy('movimiento.fecha', 'DESC')
      .getOne();

    // Desactivar la cuenta
    await this.cuentaRepository.update(id, { activo: false });

    return {
      mensaje: 'Cuenta desactivada correctamente',
      tieneCuotasFuturas: movimientosFuturos > 0,
      cantidadCuotasFuturas: movimientosFuturos,
      ultimoMovimiento: ultimoMovimiento?.fecha ?? null,
    };
  }

  async activar(id: number) {
    const cuenta = await this.cuentaRepository.findOne({ where: { id } });
    if (!cuenta) throw new NotFoundException(`Cuenta ${id} no encontrada`);
    await this.cuentaRepository.update(id, { activo: true });
    return { mensaje: 'Cuenta activada correctamente' };
  }

  async remove(id: number) {
    const cuenta = await this.cuentaRepository.findOne({ where: { id } });
    if (!cuenta) throw new NotFoundException(`Cuenta ${id} no encontrada`);

    // Verificar si tiene algún movimiento (pasado o futuro)
    const cantidadMovimientos = await this.movimientoRepository
      .createQueryBuilder('movimiento')
      .innerJoin('movimiento.transaccion', 'transaccion')
      .innerJoin('transaccion.gasto', 'gasto')
      .where('gasto.cuentaId = :id', { id })
      .getCount();

    if (cantidadMovimientos > 0) {
      // Tiene movimientos — solo se puede desactivar, no borrar
      throw new BadRequestException(
        `Esta cuenta tiene ${cantidadMovimientos} movimiento(s) registrado(s). No se puede eliminar, solo desactivar.`
      );
    }

    // Verificar si tiene movimientos de más de 2 años (solo para cuentas sin movimientos recientes)
    // En este caso no aplica porque ya bloqueamos si tiene cualquier movimiento

    // Sin movimientos: se puede borrar físicamente
    // Si es tarjeta de crédito, borrar primero la TarjetaCredito (por la FK)
    const tarjeta = await this.tarjetaCreditoRepository.findOne({ where: { id } });
    if (tarjeta) {
      await this.tarjetaCreditoRepository.delete(id);
    }

    await this.cuentaRepository.delete(id);
    return { mensaje: 'Cuenta eliminada correctamente' };
  }

  findAll() {
    return this.cuentaRepository.find();
  }

  findOne(id: number) {
    return this.cuentaRepository.findOne({ where: { id } });
  }

  private calcularAvisoDistancia(tarjeta: TarjetaCredito): string | null {
    try {
      const hoy = new Date();
      const fechaCierre = calcularFechaCierre(tarjeta, hoy.getFullYear(), hoy.getMonth() + 1);
      const fechaVencimiento = calcularFechaVencimiento(tarjeta, fechaCierre);
      const { valido, dias } = validarDistanciaCierreVencimiento(fechaCierre, fechaVencimiento);
      if (!valido) {
        return `El rango de días entre cierre y vencimiento es de ${dias} días, esto está fuera de la norma (7-12 días). Por favor, verificar.`;
      }
      return null;
    } catch {
      return null;
    }
  }
}