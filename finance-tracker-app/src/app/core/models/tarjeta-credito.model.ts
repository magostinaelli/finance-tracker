export interface OpcionCalculo {
  valor: string;
  nombre: string;
}

export const MODOS_CALCULO: OpcionCalculo[] = [
  { valor: 'POSICION_DIA_SEMANA', nombre: 'Posición día de semana' },
  { valor: 'DIA_FIJO_MES', nombre: 'Día fijo del mes' },
  { valor: 'DIAS_DESPUES_CIERRE', nombre: 'Días después del cierre' },
];

export const DIAS_SEMANA: OpcionCalculo[] = [
  { valor: 'LUNES', nombre: 'Lunes' },
  { valor: 'MARTES', nombre: 'Martes' },
  { valor: 'MIERCOLES', nombre: 'Miércoles' },
  { valor: 'JUEVES', nombre: 'Jueves' },
  { valor: 'VIERNES', nombre: 'Viernes' },
  { valor: 'SABADO', nombre: 'Sábado' },
  { valor: 'DOMINGO', nombre: 'Domingo' },
];

export const POSICIONES_DIA: OpcionCalculo[] = [
  { valor: 'PRIMERO', nombre: 'Primero' },
  { valor: 'SEGUNDO', nombre: 'Segundo' },
  { valor: 'TERCERO', nombre: 'Tercero' },
  { valor: 'CUARTO', nombre: 'Cuarto' },
  { valor: 'ULTIMO', nombre: 'Último' },
];

export const TIPOS_CUENTA: OpcionCalculo[] = [
  { valor: 'EFECTIVO', nombre: 'Efectivo' },
  { valor: 'TARJETA_DEBITO', nombre: 'Tarjeta de débito' },
  { valor: 'TARJETA_CREDITO', nombre: 'Tarjeta de crédito' },
  { valor: 'BILLETERA_VIRTUAL', nombre: 'Billetera virtual' },
  { valor: 'OTRO', nombre: 'Otro' },
];