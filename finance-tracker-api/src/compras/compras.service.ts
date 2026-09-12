import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Compra } from './entities/compra.entity';
import { Gasto } from '../gastos/entities/gasto.entity';
import { Movimiento } from '../movimientos/entities/movimiento.entity';
import { Transaccion } from '../transacciones/entities/transaccion.entity';
import { Cuenta } from '../cuentas/entities/cuenta.entity';
import { TarjetaCredito } from '../tarjetas-credito/entities/tarjeta-credito.entity';
import { TipoGasto } from '../gastos/enums/tipo-gasto.enum';
import { TipoCuenta } from '../cuentas/enums/tipo-cuenta.enum';
import { CreateCompraDto } from './dto/create-compra.dto';
import {
  calcularFechaCierre,
  calcularFechaVencimiento,
} from '../tarjetas-credito/calculo-fechas-tarjeta';
import { EstadoCompra } from './enums/estado-compra.enum';
import { UpdateCompraDto } from './dto/update-compra.dto';

@Injectable()
export class ComprasService {
  constructor(
    @InjectRepository(Compra)
    private readonly compraRepository: Repository<Compra>,
    @InjectRepository(Gasto)
    private readonly gastoRepository: Repository<Gasto>,
    @InjectRepository(Movimiento)
    private readonly movimientoRepository: Repository<Movimiento>,
    @InjectRepository(Transaccion)
    private readonly transaccionRepository: Repository<Transaccion>,
    @InjectRepository(Cuenta)
    private readonly cuentaRepository: Repository<Cuenta>,
    @InjectRepository(TarjetaCredito)
    private readonly tarjetaCreditoRepository: Repository<TarjetaCredito>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateCompraDto): Promise<Compra> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const [anio, mes, dia] = dto.fecha.toString().split('-').map(Number);
      const fechaCompra = new Date(anio, mes - 1, dia);

      // Calcular el mes de cierre inicial (en qué resumen cae la compra)
      // y la tarjeta si corresponde — para después calcular cada cuota
      const { tarjeta, mesCierreInicial, anioCierreInicial } =
        await this.obtenerContextoTarjeta(fechaCompra, dto.cuentaId);

      // 1) Insertar la Transaccion con la fecha real de la compra
      const transaccion = queryRunner.manager.create(Transaccion, {
        fecha: fechaCompra,
      });
      const transaccionGuardada = await queryRunner.manager.save(transaccion);

      // 2) Insertar el Gasto
      const gasto = queryRunner.manager.create(Gasto, {
        id: transaccionGuardada.id,
        tipoGasto: TipoGasto.COMPRA,
        categoriaId: dto.categoriaId,
        cuentaId: dto.cuentaId,
        medioPagoId: dto.medioPagoId,
      });
      const gastoGuardado = await queryRunner.manager.save(gasto);

      // 3) Insertar la Compra
      const compra = queryRunner.manager.create(Compra, {
        id: gastoGuardado.id,
        cantidadCuotas: dto.cantidadCuotas,
        estado: dto.estado,
        detalleOtro: dto.detalleOtro,
      });
      const compraGuardada = await queryRunner.manager.save(compra);

      // 4) Generar un Movimiento por cada cuota con la fecha correcta
      const montoPorCuota = dto.montoTotal / dto.cantidadCuotas;
      const movimientosACrear: Movimiento[] = [];

      // Empezamos desde el mes de cierre inicial y avanzamos un mes por cada cuota
      let mesCierre = mesCierreInicial;
      let anioCierre = anioCierreInicial;

      for (let numeroCuota = 1; numeroCuota <= dto.cantidadCuotas; numeroCuota++) {
        let fechaCuota: Date;

        if (tarjeta) {
          // Cuenta de tarjeta de crédito con datos completos:
          // calculamos el vencimiento real del cierre de este mes
          const fechaCierre = calcularFechaCierre(tarjeta, anioCierre, mesCierre);
          fechaCuota = calcularFechaVencimiento(tarjeta, fechaCierre);
        } else {
          // Sin tarjeta o sin datos: usamos la fecha de compra como base
          // y sumamos meses manualmente como antes
          fechaCuota = new Date(
            mesCierre > 12
              ? anioCierre + Math.floor((mesCierre - 1) / 12)
              : anioCierre,
            (mesCierre - 1) % 12,
            fechaCompra.getDate(),
          );
        }

        movimientosACrear.push(
          queryRunner.manager.create(Movimiento, {
            fecha: fechaCuota,
            monto: montoPorCuota,
            descripcion:
              dto.cantidadCuotas > 1
                ? `${dto.descripcion} - Cuota ${numeroCuota}/${dto.cantidadCuotas}`
                : dto.descripcion,
            transaccionId: transaccionGuardada.id,
          }),
        );

        // Avanzar al mes siguiente para la próxima cuota
        if (mesCierre === 12) {
          mesCierre = 1;
          anioCierre++;
        } else {
          mesCierre++;
        }
      }

      await queryRunner.manager.save(movimientosACrear);
      await queryRunner.commitTransaction();

      return this.findOne(compraGuardada.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('No se pudo crear la compra: ' + error.message);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Busca si la cuenta es tarjeta de crédito con datos de cierre/vencimiento,
   * y calcula en qué mes de cierre cae la compra.
   * Devuelve:
   * - tarjeta: la configuración (o null si no aplica)
   * - mesCierreInicial: el mes del cierre del primer resumen
   * - anioCierreInicial: el año del cierre del primer resumen
   */
  private async obtenerContextoTarjeta(
    fechaCompra: Date,
    cuentaId: number,
  ): Promise<{ tarjeta: TarjetaCredito | null; mesCierreInicial: number; anioCierreInicial: number }> {
    const mesCompra = fechaCompra.getMonth() + 1;
    const anioCompra = fechaCompra.getFullYear();

    // Por defecto, el "mes de cierre inicial" es el mes de la compra misma
    // (se usa cuando no hay tarjeta, para el fallback de sumar meses)
    const fallback = { tarjeta: null, mesCierreInicial: mesCompra, anioCierreInicial: anioCompra };

    const cuenta = await this.cuentaRepository.findOne({ where: { id: cuentaId } });
    if (!cuenta || cuenta.tipo !== TipoCuenta.TARJETA_CREDITO) return fallback;

    const tarjeta = await this.tarjetaCreditoRepository.findOne({ where: { id: cuentaId } });
    if (!tarjeta || !tarjeta.modoCierre || !tarjeta.modoVencimiento) return fallback;

    try {
      // Calcular el cierre del mes de la compra
      const cierreMesCompra = calcularFechaCierre(tarjeta, anioCompra, mesCompra);

      // Si la compra cayó ANTES o EN el cierre → entra en el resumen de este mes
      if (fechaCompra <= cierreMesCompra) {
        return { tarjeta, mesCierreInicial: mesCompra, anioCierreInicial: anioCompra };
      }

      // Si cayó DESPUÉS del cierre → entra en el resumen del mes siguiente
      const mesSiguiente = mesCompra === 12 ? 1 : mesCompra + 1;
      const anioSiguiente = mesCompra === 12 ? anioCompra + 1 : anioCompra;
      return { tarjeta, mesCierreInicial: mesSiguiente, anioCierreInicial: anioSiguiente };
    } catch {
      return fallback;
    }
  }

  async findOne(id: number): Promise<Compra> {
    const compra = await this.compraRepository.findOne({
      where: { id },
      relations: {
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

    if (!compra) {
      throw new NotFoundException(`Compra con id ${id} no encontrada`);
    }

    return compra;
  }

  findAll(): Promise<Compra[]> {
    return this.compraRepository.find({
      relations: {
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

  async cancelar(id: number): Promise<Compra> {
  const compra = await this.compraRepository.findOne({
    where: { id },
    relations: {
      gasto: {
        transaccion: {
          movimientos: true,
        },
      },
    },
  });

  if (!compra) throw new NotFoundException(`Compra ${id} no encontrada`);

  // Cambiar estado a CANCELADA
await this.compraRepository.update(id, { estado: EstadoCompra.CANCELADA });

  return this.findOne(id);
}

  async remove(id: number): Promise<{ mensaje: string }> {
    const compra = await this.compraRepository.findOne({
      where: { id },
      relations: {
        gasto: {
          transaccion: {
            movimientos: true,
        },
      },
    },
  });

  if (!compra) throw new NotFoundException(`Compra ${id} no encontrada`);

    const hoy = new Date();
    const movimientosPasados = compra.gasto.transaccion.movimientos.filter(
    m => new Date(m.fecha) <= hoy,
  );

    if (movimientosPasados.length > 0) {
      throw new BadRequestException(
        `Esta compra tiene ${movimientosPasados.length} cuota(s) ya vencida(s). Solo se puede cancelar, no eliminar.`
    );
  }

  // Sin movimientos pasados: borrar en cascada (Movimientos → Transaccion → Gasto → Compra)
  // ON DELETE CASCADE en SQL Server se encarga del resto al borrar la Transaccion
  await this.transaccionRepository.delete(compra.gasto.transaccion.id);

  return { mensaje: 'Compra eliminada correctamente' };
}
  async update(id: number, dto: UpdateCompraDto): Promise<Compra> {
    const compra = await this.compraRepository.findOne({
      where: { id },
      relations: {
        gasto: {
          transaccion: {
            movimientos: true,
          },
        },
      },
    });

    if (!compra) throw new NotFoundException(`Compra ${id} no encontrada`);

    const hoy = new Date();
    const movimientosFuturos = compra.gasto.transaccion.movimientos
      .filter(m => new Date(m.fecha) > hoy)
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

    // Actualizar Gasto si cambian categoría, cuenta o medio de pago
    if (dto.categoriaId || dto.cuentaId || dto.medioPagoId) {
      await this.gastoRepository.update(compra.gasto.id, {
        ...(dto.categoriaId && { categoriaId: dto.categoriaId }),
        ...(dto.cuentaId && { cuentaId: dto.cuentaId }),
        ...(dto.medioPagoId && { medioPagoId: dto.medioPagoId }),
      });
    }

    // Actualizar Compra
    if (dto.estado || dto.detalleOtro !== undefined) {
      await this.compraRepository.update(id, {
        ...(dto.estado && { estado: dto.estado as EstadoCompra }),
        ...(dto.detalleOtro !== undefined && { detalleOtro: dto.detalleOtro }),
      });
    }

    // Actualizar fecha en Transaccion si cambió
    if (dto.fecha) {
      const [anio, mes, dia] = dto.fecha.toString().split('-').map(Number);
      await this.transaccionRepository.update(
        compra.gasto.transaccion.id,
        { fecha: new Date(anio, mes - 1, dia) }
      );
    }

    // Recalcular monto de cuotas futuras si cambió el monto total
    if (dto.montoTotal && movimientosFuturos.length > 0) {
      const nuevoCuotasMonto = dto.montoTotal / compra.cantidadCuotas;
      for (const movimiento of movimientosFuturos) {
        await this.movimientoRepository.update(movimiento.id, {
          monto: nuevoCuotasMonto,
        });
      }
    }

    // Actualizar descripción de cuotas futuras si cambió
    if (dto.descripcion && movimientosFuturos.length > 0) {
      for (let i = 0; i < movimientosFuturos.length; i++) {
        const numeroCuota = compra.cantidadCuotas - movimientosFuturos.length + i + 1;
        await this.movimientoRepository.update(movimientosFuturos[i].id, {
          descripcion: compra.cantidadCuotas > 1
            ? `${dto.descripcion} - Cuota ${numeroCuota}/${compra.cantidadCuotas}`
            : dto.descripcion,
        });
      }
    }

    return this.findOne(id);
  }
  
}