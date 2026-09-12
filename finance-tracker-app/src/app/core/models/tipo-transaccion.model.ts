export interface TipoOpcion {
  valor: string;
  nombre: string;
}

export const TIPOS_TRANSACCION: TipoOpcion[] = [
  { valor: 'COMPRA', nombre: 'Compra' },
  { valor: 'PAGO_SERVICIO', nombre: 'Pago de servicio' },
  { valor: 'INGRESO', nombre: 'Ingreso' },
];

export const TIPOS_SERVICIO: TipoOpcion[] = [
  { valor: 'LUZ', nombre: 'Luz' },
  { valor: 'GAS', nombre: 'Gas' },
  { valor: 'AGUA', nombre: 'Agua' },
  { valor: 'INTERNET', nombre: 'Internet' },
  { valor: 'ALQUILER', nombre: 'Alquiler' },
  { valor: 'TARJETA_CREDITO', nombre: 'Tarjeta de crédito' },
  { valor: 'OTRO', nombre: 'Otro' },
];

export const ESTADOS_COMPRA: TipoOpcion[] = [
  { valor: 'PENDIENTE', nombre: 'Pendiente' },
  { valor: 'PAGADA', nombre: 'Pagada' },
  { valor: 'CANCELADA', nombre: 'Cancelada' },
];