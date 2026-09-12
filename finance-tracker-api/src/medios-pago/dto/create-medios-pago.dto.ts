import { TipoMedioPago } from "../enums/tipo-medio-pago.enum";

export class CreateMediosPagoDto {
  nombre: string;
  tipo: TipoMedioPago;
  activo: boolean;
}
