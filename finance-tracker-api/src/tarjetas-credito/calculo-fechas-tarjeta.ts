import {
  setDate,
  addDays,
  differenceInDays,
  getDay,
  lastDayOfMonth,
  startOfMonth,
} from 'date-fns';
import { TarjetaCredito } from './entities/tarjeta-credito.entity';
import { DiaSemana } from './enums/dia-semana.enum';
import { PosicionDiaSemana } from './enums/posicion-dia-semana.enum';
import { ModoCalculoFecha } from './enums/modo-calculo-fecha.enum';

/**
 * Devuelve TODAS las fechas de un mes que caen en el día de semana indicado.
 * Ej: todos los jueves de mayo 2026 -> [07/05, 14/05, 21/05, 28/05]
 */
function obtenerOcurrenciasDelDia(anio: number, mes: number, diaSemana: DiaSemana): Date[] {
  const entrada = Object.values(DiaSemana).find((d) => d.valor === diaSemana);
  const numeroBuscado = entrada!.numero;
  const primerDiaDelMes = startOfMonth(new Date(anio, mes - 1, 1));
  const ultimoDiaDelMes = lastDayOfMonth(primerDiaDelMes);

  const ocurrencias: Date[] = [];
  let cursor = primerDiaDelMes;

  while (cursor <= ultimoDiaDelMes) {
    if (getDay(cursor) === numeroBuscado) {
      ocurrencias.push(cursor);
    }
    cursor = addDays(cursor, 1);
  }

  return ocurrencias;
}

/**
 * Dada una posición (PRIMERO, SEGUNDO, ..., ULTIMO) y un día de semana,
 * devuelve la fecha concreta dentro de ese mes.
 */
function calcularFechaPorPosicion(
  anio: number,
  mes: number,
  diaSemana: DiaSemana,
  posicion: PosicionDiaSemana,
): Date {
  const ocurrencias = obtenerOcurrenciasDelDia(anio, mes, diaSemana);

  const indice: Record<PosicionDiaSemana, number> = {
    [PosicionDiaSemana.PRIMERO]: 0,
    [PosicionDiaSemana.SEGUNDO]: 1,
    [PosicionDiaSemana.TERCERO]: 2,
    [PosicionDiaSemana.CUARTO]: 3,
    [PosicionDiaSemana.ULTIMO]: ocurrencias.length - 1,
  };

  const fecha = ocurrencias[indice[posicion]];

  if (!fecha) {
    throw new Error(
      `El mes ${mes}/${anio} no tiene una ${posicion} ocurrencia de ${diaSemana}`,
    );
  }

  return fecha;
}

/**
 * Calcula la fecha de CIERRE de la tarjeta para un mes/año dado.
 */
export function calcularFechaCierre(tarjeta: TarjetaCredito, anio: number, mes: number): Date {
  if (tarjeta.modoCierre === ModoCalculoFecha.DIA_FIJO_MES) {
    return setDate(new Date(anio, mes - 1, 1), tarjeta.diaFijoCierre!);
  }

  if (tarjeta.modoCierre === ModoCalculoFecha.POSICION_DIA_SEMANA) {
    return calcularFechaPorPosicion(
      anio,
      mes,
      tarjeta.diaSemanaCierre!,
      tarjeta.posicionCierre!,
    );
  }

  throw new Error(`modoCierre no soportado: ${tarjeta.modoCierre}`);
}

/**
 * Calcula la fecha de VENCIMIENTO de la tarjeta, a partir de una fecha de cierre ya calculada.
 * Para los modos POSICION_DIA_SEMANA y DIA_FIJO_MES, el vencimiento se busca en el mes
 * siguiente al del cierre (que es el caso real más común: cierre a fin de mes, vencimiento
 * a principios del mes que sigue).
 */
export function calcularFechaVencimiento(tarjeta: TarjetaCredito, fechaCierre: Date): Date {
  if (tarjeta.modoVencimiento === ModoCalculoFecha.DIAS_DESPUES_CIERRE) {
    return addDays(fechaCierre, tarjeta.diasDespuesCierre!);
  }

  // Para POSICION_DIA_SEMANA y DIA_FIJO_MES, calculamos sobre el mes siguiente al cierre
  const anioVencimiento = fechaCierre.getMonth() === 11 ? fechaCierre.getFullYear() + 1 : fechaCierre.getFullYear();
  const mesVencimiento = fechaCierre.getMonth() === 11 ? 1 : fechaCierre.getMonth() + 2; // +2 porque getMonth() es 0-indexado

  if (tarjeta.modoVencimiento === ModoCalculoFecha.DIA_FIJO_MES) {
    return setDate(new Date(anioVencimiento, mesVencimiento - 1, 1), tarjeta.diaFijoVencimiento!);
  }

  if (tarjeta.modoVencimiento === ModoCalculoFecha.POSICION_DIA_SEMANA) {
    return calcularFechaPorPosicion(
      anioVencimiento,
      mesVencimiento,
      tarjeta.diaSemanaVencimiento!,
      tarjeta.posicionVencimiento!,
    );
  }

  throw new Error(`modoVencimiento no soportado: ${tarjeta.modoVencimiento}`);
}

/**
 * Valida que la distancia entre cierre y vencimiento esté en un rango razonable (7-12 días).
 * Devuelve { valido: true } si está dentro del rango, o { valido: false, dias } si no,
 * para que el caller decida si pedir confirmación al usuario.
 */
export function validarDistanciaCierreVencimiento(
  fechaCierre: Date,
  fechaVencimiento: Date,
): { valido: boolean; dias: number } {
  const dias = differenceInDays(fechaVencimiento, fechaCierre);
  const valido = dias >= 7 && dias <= 12;
  return { valido, dias };
}