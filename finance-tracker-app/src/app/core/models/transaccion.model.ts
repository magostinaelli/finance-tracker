export interface Categoria {
  id: number;
  nombre: string;
  tipo: string;
  activo: boolean;
}

export interface Cuenta {
  id: number;
  nombre: string;
  tipo: string;
  activo: boolean;
}

export interface MedioPago {
  id: number;
  nombre: string;
  activo: boolean;
}

export interface Movimiento {
  id: number;
  fecha: string;
  monto: number;
  descripcion: string;
  transaccionId: number;
}

export interface Compra {
  id: number;
  cantidadCuotas: number;
  estado: string;
  detalleOtro: string | null;
}

export interface Pago {
  id: number;
  tipoServicio: string;
  numeroReferencia: string | null;
  detalleOtro: string | null;
  cuentaTarjetaId: number | null;
}

export interface Ingreso {
  id: number;
  categoriaId: number;
  cuentaId: number;
  categoria: Categoria;
  cuenta: Cuenta;
}

export interface Gasto {
  id: number;
  tipoGasto: string;
  categoriaId: number;
  cuentaId: number;
  medioPagoId: number;
  categoria: Categoria;
  cuenta: Cuenta;
  medioPago: MedioPago;
  compra: Compra | null;
  pago: Pago | null;
}

export interface Transaccion {
  id: number;
  fecha: string;
  movimientos: Movimiento[];
  gasto: Gasto | null;
  ingreso: Ingreso | null;
}

export interface TarjetaCredito {
  modoCierre?: string;
  diaSemanaCierre?: string;
  posicionCierre?: string;
  diaFijoCierre?: number;
  modoVencimiento?: string;
  diaSemanaVencimiento?: string;
  posicionVencimiento?: string;
  diaFijoVencimiento?: number;
  diasDespuesCierre?: number;
}

export interface CuentaDetalle extends Cuenta {
  tarjetaCredito?: TarjetaCredito;
}